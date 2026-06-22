/**
 * Formstack v2025 API client (server-side only — never import into browser code).
 *
 * Mirrors the proven HSuite `submitUserFormToFormStack` pattern:
 *  - payload shape { fields: [{ id, value | subvalues | address }] }
 *  - X-FS-Encryption-Password header for encrypted forms (else they 401)
 *  - 3 attempts with exponential backoff (1s, 2s)
 */

const FORMSTACK_API_BASE = "https://www.formstack.com/api/v2025";

/** One field entry in a v2025 submission. Shape depends on the field type. */
export type FormstackFieldEntry =
  | { id: string; value: string }
  | { id: string; subvalues: { subvalue: string }[] }
  | {
      id: string;
      address: string;
      address2?: string;
      city?: string;
      state?: string;
      zip?: string;
    };

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
