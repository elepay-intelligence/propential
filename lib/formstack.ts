/**
 * Formstack v2025 API client (server-side only — never import into browser code).
 *
 * Payload shape (verified empirically against v2025, 2026-06-23):
 *  - { fields: [{ id, value: <object> }] } — the `value` is ALWAYS an object,
 *    never a bare string. Sending a bare string (`value: "x"`) crashes the API
 *    with HTTP 500 "An unexpected error has occurred."
 *      • text/number/email/phone/radio/datetime → value: { value: "x" }
 *      • select/checkbox (single + multi)        → value: { subvalues: [{ subvalue }] }
 *      • address                                 → value: { address, city, state, zip }
 *  - id MUST be a string (number → 400 "Id has to be a string").
 *  - X-FS-Encryption-Password header for encrypted forms (else they 401).
 *  - 3 attempts with exponential backoff (1s, 2s).
 */

const FORMSTACK_API_BASE = "https://www.formstack.com/api/v2025";

/** The value object for a single field — shape depends on the field type. */
export type FormstackFieldValue =
  | { value: string }
  | { subvalues: { subvalue: string }[] }
  | {
      address: string;
      address2?: string;
      city?: string;
      state?: string;
      zip?: string;
    };

/** One field entry in a v2025 submission: a string id + a nested value object. */
export type FormstackFieldEntry = { id: string; value: FormstackFieldValue };

export interface SubmitResult {
  success: boolean;
  submissionId?: string;
  error?: string;
  attempts: number;
}

function token(): string {
  const t = (process.env.FORMSTACK_API_TOKEN ?? "").trim();
  if (!t) throw new Error("FORMSTACK_API_TOKEN is not configured");
  return t;
}

async function formstackApiRequest(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  return fetch(`${FORMSTACK_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token()}`,
      Accept: "application/json",
      ...(options.headers ?? {}),
    },
  });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function parseSubmissionId(responseText: string): string | undefined {
  try {
    const parsed = JSON.parse(responseText) as Record<string, unknown>;
    const id = parsed.id ?? parsed.UniqueID ?? parsed.submissionId;
    return id == null ? undefined : String(id);
  } catch {
    return responseText.match(/["']?id["']?\s*[=:]\s*["']?(\d+)/)?.[1];
  }
}

/**
 * POST a submission to a Formstack form.
 * @param formId        target form id (FORMSTACK_FORM_ID)
 * @param fields        v2025 field entries
 * @param encryptionPassword  required for encrypted forms (Reno Now app is encrypted)
 */
export async function submitToFormstack(
  formId: string,
  fields: FormstackFieldEntry[],
  encryptionPassword?: string,
): Promise<SubmitResult> {
  const body = JSON.stringify({ fields });
  let lastError: string | undefined;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await formstackApiRequest(`/forms/${formId}/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(encryptionPassword
            ? { "X-FS-Encryption-Password": encryptionPassword }
            : {}),
        },
        body,
      });

      const responseText = await res.text();

      if (!res.ok) {
        lastError = `HTTP ${res.status}: ${responseText}`;
        if (attempt < 2) {
          await sleep(1000 * 2 ** attempt);
          continue;
        }
        return { success: false, error: lastError, attempts: attempt + 1 };
      }

      return {
        success: true,
        submissionId: parseSubmissionId(responseText),
        attempts: attempt + 1,
      };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      if (attempt < 2) {
        await sleep(1000 * 2 ** attempt);
        continue;
      }
    }
  }

  return { success: false, error: lastError ?? "Unknown Formstack error", attempts: 3 };
}

/** Fetch a form definition (used by scripts/fetch-formstack-fields to dump field ids). */
export async function getForm(formId: string): Promise<unknown> {
  const res = await formstackApiRequest(`/forms/${formId}`);
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
  return JSON.parse(text);
}
