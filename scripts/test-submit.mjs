/**
 * ONE diagnostic submission to a TEST Formstack form, using only the ~20 fields
 * that apply.html actually collects. Purpose: learn whether the v2025 API rejects
 * a partial submission (missing other required fields) with a 400, or accepts it.
 *
 *   node scripts/test-submit.mjs 4857819
 *
 * SAFETY: refuses to run against the live form 4653616.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

const token = process.env.FORMSTACK_API_TOKEN;
const encPw = process.env.FORMSTACK_USER_FORM_ENCRYPTION_PASSWORD;
const formId = process.argv[2];

if (!token || !formId) { console.error("Need token + formId arg"); process.exit(1); }
if (formId === "4653616") { console.error("Refusing to submit to the LIVE form 4653616."); process.exit(1); }

const headers = { Authorization: `Bearer ${token}`, Accept: "application/json" };
const base = `https://www.formstack.com/api/v2025/forms/${formId}`;

const meta = await (await fetch(base, { headers })).json();
const fields = (await (await fetch(`${base}/fields`, { headers })).json()).fields ?? [];

const norm = (s) => String(s ?? "").toLowerCase().replace(/\s+/g, " ").trim();
const find = (pred) => fields.find(pred);
const byExact = (label) => find((f) => norm(f.label) === norm(label));
const byIncl = (sub, type) => find((f) => norm(f.label).includes(norm(sub)) && (!type || f.type === type));

function optValue(field, desired) {
  const opts = field?.options ?? [];
  const hit = opts.find((o) => norm(o.label ?? o.value ?? o).includes(norm(desired)));
  const o = hit ?? opts[0];
  return o ? (o.value ?? o.label ?? o) : desired;
}

const out = [];
const skipped = [];
const text = (f, value) => { if (f) out.push({ id: String(f.id), value: String(value) }); else skipped.push(value); };
const sub = (f, value) => { if (f) out.push({ id: String(f.id), subvalues: [{ subvalue: String(value) }] }); };
const addr = (f) => { if (f) out.push({ id: String(f.id), address: "1 Test Street", city: "Sydney", state: "NSW", zip: "2000" }); };

// ── the ~20 apply.html overlap fields, with test values ──
text(byExact("First name"), "Test");
text(byExact("Last name"), "Applicant");
text(byExact("Email"), "test.applicant@example.com");
text(byExact("Mobile"), "0400000000");
const flat = process.argv.includes("--flat"); // try flat { "field_<id>": value } body
const narrow = process.argv.includes("--narrow") || flat; // skip shape-risky address + date fields
if (!narrow) {
  text(byIncl("date of birth"), "1985-05-15");
  addr(byIncl("Address", "address"));            // home address
  addr(byIncl("Renovation address", "address")); // property address
}
text(byIncl("estimated value of your home"), "850000");
const ownF = byIncl("home ownership status");
if (ownF) out.push({ id: String(ownF.id), value: optValue(ownF, "paying off mortgage") });
text(byIncl("amount owing on your mortgage"), "400000");
text(byIncl("how much money are you looking to borrow"), "50000");
const termF = byIncl("choose your repayment term", "select");
if (termF) sub(termF, optValue(termF, "5 Years"));
const renoF = byIncl("what type of renovation", "checkbox");
if (renoF) sub(renoF, optValue(renoF, "Pool"));
const empF = byExact("Employment status");
if (empF) out.push({ id: String(empF.id), value: optValue(empF, "Full time") });
text(byIncl("gross annual salary"), "120000");
text(byIncl("total household monthly living expenses"), "3000");
const licF = byIncl("australian driver's license", "radio");
if (licF) out.push({ id: String(licF.id), value: optValue(licF, "Yes") });
const licStateF = byIncl("driver's license state");
if (licStateF) out.push({ id: String(licStateF.id), value: optValue(licStateF, "NSW") });
text(byIncl("driver's license number"), "12345678");
const privF = byIncl("review and agree to our privacy", "checkbox");
if (privF) sub(privF, optValue(privF, "Privacy Consent"));
const declF = byIncl("declare all the information", "checkbox");
if (declF) sub(declF, optValue(declF, "true and correct"));

// Build the request body in the chosen format.
let payload;
if (flat) {
  const body = {};
  for (const f of out) {
    const key = `field_${f.id}`;
    if ("value" in f) body[key] = f.value;
    else if ("subvalues" in f) body[key] = f.subvalues.map((s) => s.subvalue).join(",");
    else if ("address" in f) body[key] = f.address;
  }
  payload = body;
} else {
  payload = { fields: out };
}

console.log(`Form ${meta.id}: ${meta.name}  (isEncrypted: ${meta.isEncrypted})`);
console.log(`Format: ${flat ? "FLAT { field_<id>: value }" : "fields[]"}  |  Sending ${out.length} fields. Unmatched: ${skipped.length}\n`);
console.log(JSON.stringify(payload, null, 1).slice(0, 1200));

const res = await fetch(`${base}/submissions`, {
  method: "POST",
  headers: {
    ...headers,
    "Content-Type": "application/json",
    ...(meta.isEncrypted && encPw ? { "X-FS-Encryption-Password": encPw } : {}),
  },
  body: JSON.stringify(payload),
});
const body = await res.text();
console.log(`\n=== RESULT: HTTP ${res.status} ${res.ok ? "(ACCEPTED)" : "(REJECTED)"} ===`);
console.log(body.slice(0, 2000));
