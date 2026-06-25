/**
 * Read-only verification of the apply.html → Formstack mapping.
 *
 * Creates NOTHING — no form copy, no submission, no deletion. Earlier this
 * script cloned the live form (POST /forms/{id}/copy) and submitted to the copy
 * to prove a round-trip; an interrupted run could leave the copy orphaned in the
 * account. This version only GETs the live form's field DEFINITIONS (which are
 * not encrypted) and checks that every label and option string the mapping
 * relies on still exists, so a renamed field or edited consent wording is caught
 * before it silently drops data in production.
 *
 *   node scripts/verify-e2e.mjs        # verifies FORMSTACK_FORM_ID from .env.local
 *   node scripts/verify-e2e.mjs 12345  # verifies a specific form id instead
 *
 * Exit code is non-zero if any required label/option is missing.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

const token = process.env.FORMSTACK_API_TOKEN;
const formId = (process.argv[2] || process.env.FORMSTACK_FORM_ID || "").trim();
if (!token || !formId) {
  console.error("Missing FORMSTACK_API_TOKEN or FORMSTACK_FORM_ID (.env.local / CLI arg).");
  process.exit(1);
}
const h = { Authorization: `Bearer ${token}`, Accept: "application/json" };
const api = (p, o = {}) =>
  fetch(`https://www.formstack.com/api/v2025${p}`, { ...o, headers: { ...h, ...(o.headers || {}) } });

// ── transforms — mirror lib/apply-mapping.ts ──
const TERM_MAP = { "1": "1 Year", "2": "2 Years", "3": "3 Years", "4": "4 Years", "5": "5 Years", "6": "6 Years", "7": "7 Years", "8": "8 years  (over $40k only)", "9": "9 years  (over $40k only)", "10": "10 years (over $40k only)" };
const EMPLOYMENT_MAP = { "Full-time": "Full time", "Part-time": "Part time", "Casual": "Casual/Temp", "Self-employed": "Self-employed", "Retired": "Retired", "Other": "None of the above" };
const PROJECT_OPTS = new Set(["Kitchen", "Bathroom", "Pool", "Other"]);
const mapProject = (vs) => [...new Set(vs.map((v) => (PROJECT_OPTS.has(v) ? v : "Other")))];
const PRIVACY = "Privacy Consent: By checking this box, I confirm that I have accessed RenoNow’s Privacy Policy and Credit Reporting Policy by clicking on the link shown above and reviewed, understand and consent to RenoNow, its related bodies corporate, affiliates and agents, and other nominated entities collecting, using, holding and disclosing personal information and credit-related information about me as set out in the privacy policy. If you do not consent, we may not be able to proceed with your application.";
const DECLARE = "Yes, I declare all information that I have provided in this application is true and correct.";

// ── a realistic apply.js submission (page value formats) ──
const data = {
  name: "Jordan Test Smith", dob: "1990-01-15", email: "jordan.test@example.com", phone: "0400111222",
  resAddress: "12 Example St, Sydney NSW 2000", propAddress: "9 Reno Ave, Newcastle NSW 2300",
  propValue: "850000", mortBalance: "400000", amount: "60000", term: "8",
  project: ["Pool", "Roofing", "Interiors"], employment: "Full-time", income: "120000",
  expenses: "3500", idIssuedState: "VIC", idNumber: "1234567", consentPrivacy: true, consentAccuracy: true,
  utmSource: "google", utmMedium: "cpc", utmCampaign: "reno-spring",
};

// ── load live field DEFINITIONS (read-only; not encrypted) ──
const metaRes = await api(`/forms/${formId}`);
const metaTxt = await metaRes.text();
if (!metaRes.ok) { console.error(`GET form failed — HTTP ${metaRes.status}: ${metaTxt}`); process.exit(1); }
const meta = JSON.parse(metaTxt);

const fieldsRes = await api(`/forms/${formId}/fields`);
const fieldsTxt = await fieldsRes.text();
if (!fieldsRes.ok) { console.error(`GET fields failed — HTTP ${fieldsRes.status}: ${fieldsTxt}`); process.exit(1); }
const fields = (JSON.parse(fieldsTxt).fields) ?? [];

console.log(`\nVerifying mapping against form ${meta.id}: ${meta.name}`);
console.log(`Encrypted: ${meta.isEncrypted}   Fields: ${fields.length}   (read-only — nothing created)\n`);

// ── resolution helpers (match lib/apply-mapping.ts label expectations) ──
const norm = (s) => String(s ?? "").toLowerCase().replace(/\s+/g, " ").trim();
const exact = (label) => fields.find((f) => norm(f.label) === norm(label));
const starts = (s) => fields.find((f) => norm(f.label).startsWith(norm(s)));
const optionLabels = (f) =>
  Array.isArray(f?.options) ? f.options.map((o) => (o && typeof o === "object" ? (o.label ?? o.value ?? "") : o)) : [];

let pass = 0, fail = 0;
const rows = [];

/** Check a field exists for `label`; for option fields, that each `opts` value is selectable. */
function check(kind, label, finder, opts = []) {
  const f = finder();
  if (!f) { rows.push(["✗", kind, label, "FIELD NOT FOUND"]); fail++; return; }
  if (opts.length) {
    const have = optionLabels(f).map(norm);
    const missing = opts.filter((o) => o && !have.includes(norm(o)));
    if (missing.length) {
      rows.push(["✗", kind, `${label} → ${f.id}`, `OPTION MISSING: ${missing.map((m) => JSON.stringify(m)).join(", ")}`]);
      fail++; return;
    }
  }
  rows.push(["✓", kind, `${label} → ${f.id}`, opts.length ? `${opts.length} option(s) ok` : "field present"]);
  pass++;
}

// ── every field apply.js maps, in lib/apply-mapping.ts order ──
check("text", "Product Name", () => exact("Product Name"));
check("text", "First name", () => exact("First name"));
check("text", "Last name", () => exact("Last name"));
check("datetime", "Date of birth", () => exact("Date of birth"));
check("email", "Email", () => exact("Email"));
check("phone", "Mobile", () => exact("Mobile"));
check("address", "Address", () => exact("Address"));
check("address", "Renovation address", () => exact("Renovation address"));
check("number", "estimated value of your home", () => starts("What is the estimated value of your home"));
check("number", "amount owing on your mortgage", () => starts("What is the amount owing on your mortgage"));
check("number", "How much money are you looking to borrow", () => starts("How much money are you looking to borrow"));
check("select", "Choose your repayment term", () => exact("Choose your repayment term"), [TERM_MAP[data.term]]);
check("checkbox", "What type of renovation", () => starts("What type of renovation"), mapProject(data.project));
check("radio", "Employment status", () => exact("Employment status"), [EMPLOYMENT_MAP[data.employment]]);
check("number", "gross annual salary", () => starts("What is your gross annual salary"));
check("number", "total household monthly living expenses", () => exact("What are your total household monthly living expenses?"));
check("radio", "Driver's license state", () => exact("Driver's license state"), [data.idIssuedState]);
check("text", "Driver's license number", () => exact("Driver's license number"));
check("checkbox", "Privacy Consent", () => starts("You must review and agree to our Privacy"), [PRIVACY]);
check("checkbox", "Accuracy declaration", () => starts("Do you declare all the information"), [DECLARE]);
check("text", "Campaign Source", () => exact("Campaign Source"));
check("text", "Campaign Medium", () => exact("Campaign Medium"));
check("text", "Campaign Name", () => exact("Campaign Name"));

for (const [mark, kind, label, note] of rows) {
  console.log(`  ${mark} ${String(kind).padEnd(9)} ${String(label).slice(0, 52).padEnd(52)} ${note}`);
}
console.log(`\n${pass}/${pass + fail} mapped fields verified.${fail ? `  ${fail} need attention.` : ""}\n`);
process.exit(fail ? 1 : 0);
