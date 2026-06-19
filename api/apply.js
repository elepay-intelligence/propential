/**
 * Propential — Apply form → Formstack submission proxy
 * ------------------------------------------------------
 * A zero-config Vercel serverless function. It lives at  POST /api/apply
 * and forwards an application to a Formstack form using a server-side API
 * token, so the token is NEVER exposed to the browser.
 *
 * IT IS SAFE TO DEPLOY WITH NO SETUP. Until the env vars below are present
 * it returns { ok:true, configured:false } and the front-end simply shows
 * the normal confirmation screen (nothing is sent anywhere).
 *
 * ── To go live, a teammate sets these Project env vars on Vercel ──────────
 *   FORMSTACK_API_TOKEN   (required)  Formstack → Account → API → an OAuth/
 *                                     personal access token with submit rights.
 *   FORMSTACK_FORM_ID     (required)  The numeric id of the Formstack form
 *                                     (the number in the form's URL/admin).
 *   FORMSTACK_FIELD_MAP   (optional)  JSON object mapping OUR field names to
 *                                     Formstack numeric field ids, e.g.
 *                                     {"name":"123","email":"124",...}
 *                                     If omitted, the DEFAULT_FIELD_MAP below
 *                                     is used — edit it to match your form.
 *
 * Formstack Submissions API reference:
 *   POST https://www.formstack.com/api/v2/form/{form_id}/submission.json
 *   Body: field_{id}=value   (Authorization: Bearer <token>)
 */

// EDIT THESE to match the field ids in YOUR Formstack form, OR supply the same
// shape as JSON in the FORMSTACK_FIELD_MAP env var (env var wins).
const DEFAULT_FIELD_MAP = {
  name: "",
  dob: "",
  email: "",
  phone: "",
  resAddress: "",
  propAddress: "",
  propState: "",
  propValue: "",
  hasMortgage: "",
  lender: "",
  mortBalance: "",
  amount: "",
  term: "",
  project: "",
  purpose: "",
  employment: "",
  income: "",
  expenses: "",
  otherDebts: "",
  idType: "",
  idIssuedState: "",
  idNumber: "",
  referral: "",
  consentPrivacy: "",
  consentAccuracy: "",
};

function getFieldMap() {
  if (process.env.FORMSTACK_FIELD_MAP) {
    try {
      return { ...DEFAULT_FIELD_MAP, ...JSON.parse(process.env.FORMSTACK_FIELD_MAP) };
    } catch (e) {
      console.error("[apply] FORMSTACK_FIELD_MAP is not valid JSON:", e.message);
    }
  }
  return DEFAULT_FIELD_MAP;
}

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    return res.end(JSON.stringify({ ok: false, error: "Method not allowed" }));
  }

  // Vercel parses JSON bodies automatically; fall back to manual parse just in case.
  let data = req.body;
  if (!data || typeof data !== "object") {
    try {
      data = JSON.parse(await readRawBody(req) || "{}");
    } catch (e) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ ok: false, error: "Invalid JSON body" }));
    }
  }

  const token = process.env.FORMSTACK_API_TOKEN;
  const formId = process.env.FORMSTACK_FORM_ID;

  // Not configured yet → succeed quietly so the static UX still works.
  if (!token || !formId) {
    return res.end(JSON.stringify({ ok: true, configured: false }));
  }

  const map = getFieldMap();
  const params = new URLSearchParams();
  Object.keys(map).forEach((key) => {
    const fieldId = map[key];
    if (!fieldId) return; // unmapped → skip
    let value = data[key];
    if (Array.isArray(value)) value = value.join(", ");
    if (value === undefined || value === null || value === "") return;
    params.append("field_" + fieldId, String(value));
  });

  try {
    const fsRes = await fetch(
      "https://www.formstack.com/api/v2/form/" + encodeURIComponent(formId) + "/submission.json",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    );

    const text = await fsRes.text();
    let json;
    try { json = JSON.parse(text); } catch (e) { json = { raw: text }; }

    if (!fsRes.ok) {
      console.error("[apply] Formstack error", fsRes.status, text);
      res.statusCode = 502;
      return res.end(JSON.stringify({ ok: false, configured: true, error: "Formstack rejected the submission", status: fsRes.status }));
    }

    return res.end(JSON.stringify({ ok: true, configured: true, id: json.id || null }));
  } catch (e) {
    console.error("[apply] proxy failure:", e.message);
    res.statusCode = 502;
    return res.end(JSON.stringify({ ok: false, configured: true, error: "Could not reach Formstack" }));
  }
};

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}
