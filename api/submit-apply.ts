import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { submissions } from "../db/schema.js";
import { applySchema, buildApplyFields } from "../lib/apply-mapping.js";
import { submitToFormstack } from "../lib/formstack.js";

/**
 * POST /api/submit-apply
 * apply.html → store in Neon → push to Formstack (encrypted) → record status.
 * The user always sees success once the lead is stored; Formstack failures are
 * recorded on the row (status="failed") for retry, not shown to the applicant.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const parsed = applySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: "Invalid submission",
      issues: parsed.error.flatten(),
    });
  }
  const data = parsed.data;

  const formId = (process.env.FORMSTACK_FORM_ID ?? "").trim();
  const encryptionPassword = (
    process.env.FORMSTACK_USER_FORM_ENCRYPTION_PASSWORD ?? ""
  ).trim();

  if (!formId) {
    console.error("[submit-apply] FORMSTACK_FORM_ID is not configured");
    return res.status(500).json({ ok: false, error: "Server not configured" });
  }

  // 1. Persist first (so nothing is lost even if Formstack is down).
  let rowId: string;
  try {
    const inserted = await db
      .insert(submissions)
      .values({
        formstackFormId: formId,
        status: "received",
        email: data.email,
        referralCode: null,
        utmSource: data.utmSource || null,
        utmMedium: data.utmMedium || null,
        utmCampaign: data.utmCampaign || null,
        payload: data,
      })
      .returning({ id: submissions.id });
    const row = inserted[0];
    if (!row) throw new Error("insert returned no row");
    rowId = row.id;
  } catch (err) {
    console.error("[submit-apply] DB insert failed", err);
    return res.status(500).json({ ok: false, error: "Could not save submission" });
  }

  // 2. Push to Formstack.
  const { fields, skipped } = buildApplyFields(data);
  if (skipped.length) {
    console.warn(
      `[submit-apply] ${rowId} — ${skipped.length} field(s) have no Formstack id yet:`,
      skipped.join(", "),
    );
  }

  const result = await submitToFormstack(
    formId,
    fields,
    encryptionPassword || undefined,
  );

  // 3. Record the outcome.
  try {
    await db
      .update(submissions)
      .set({
        status: result.success ? "submitted" : "failed",
        formstackSubmissionId: result.submissionId ?? null,
        errorMessage: result.success ? null : result.error ?? "Unknown error",
        attempts: result.attempts,
        updatedAt: new Date(),
      })
      .where(eq(submissions.id, rowId));
  } catch (err) {
    console.error("[submit-apply] DB status update failed", err);
  }

  if (!result.success) {
    console.error(`[submit-apply] ${rowId} Formstack failed:`, result.error);
  }

  // The lead is saved; the applicant sees success regardless.
  return res.status(200).json({ ok: true, id: rowId });
}
