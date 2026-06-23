/**
 * End-to-end proof of the apply.html → Formstack mapping. Clones the real form
 * (4653616) into a throwaway encrypted copy, takes a realistic apply.js payload,
 * runs it through the SAME mapping + value transforms as lib/apply-mapping.ts
 * (resolving field ids by label on the clone), submits, reads back decrypted,
 * reports per-field storage, then deletes the copy. Touches no live data.
 *   node scripts/verify-e2e.mjs
 */
import { config } from "dotenv";
config({ path: ".env.local" });
const token = process.env.FORMSTACK_API_TOKEN;
const ep = process.env.FORMSTACK_USER_FORM_ENCRYPTION_PASSWORD;
const h = { Authorization: `Bearer ${token}`, Accept: "application/json" };
const enc = { "X-FS-Encryption-Password": ep };
const api = (p, o = {}) => fetch(`https://www.formstack.com/api/v2025${p}`, { ...o, headers: { ...h, ...(o.headers || {}) } });

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

const copy = await (await api("/forms/4653616/copy", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })).json();
const CID = String(copy.id);
console.log(`Cloned real form → copy ${CID} (encrypted=${copy.isEncrypted})`);

try {
  const fields = (await (await api(`/forms/${CID}/fields`)).json()).fields ?? [];
  const norm = (s) => String(s ?? "").toLowerCase().replace(/\s+/g, " ").trim();
  const exact = (label) => fields.find((f) => norm(f.label) === norm(label));
  const starts = (s) => fields.find((f) => norm(f.label).startsWith(norm(s)));
  const id = (f) => (f ? String(f.id) : "");

  const out = [];
  const V = (f, value) => f && out.push({ id: id(f), value: { value } });          // text/number/email/phone/radio/datetime
  const SUB = (f, subs) => f && subs.length && out.push({ id: id(f), value: { subvalues: subs.map((s) => ({ subvalue: s })) } }); // select/checkbox
  const ADR = (f, line) => f && out.push({ id: id(f), value: { address: line } }); // address

  const [first, ...rest] = data.name.trim().split(/\s+/);
  V(exact("First name"), first);
  V(exact("Last name"), rest.join(" ") || first);
  V(exact("Date of birth"), data.dob);
  V(exact("Email"), data.email);
  V(exact("Mobile"), data.phone);
  ADR(exact("Address"), data.resAddress);
  ADR(exact("Renovation address"), data.propAddress);
  V(starts("What is the estimated value of your home"), data.propValue);
  V(starts("What is the amount owing on your mortgage"), data.mortBalance);
  V(starts("How much money are you looking to borrow"), data.amount);
  SUB(exact("Choose your repayment term"), [TERM_MAP[data.term]]);
  SUB(starts("What type of renovation"), mapProject(data.project));
  V(exact("Employment status"), EMPLOYMENT_MAP[data.employment]);
  V(starts("What is your gross annual salary"), data.income);
  V(exact("What are your total household monthly living expenses?"), data.expenses);
  V(exact("Driver's license state"), data.idIssuedState);
  V(exact("Driver's license number"), data.idNumber);
  SUB(starts("You must review and agree to our Privacy"), data.consentPrivacy ? [PRIVACY] : []);
  SUB(starts("Do you declare all the information"), data.consentAccuracy ? [DECLARE] : []);
  V(exact("Campaign Source"), data.utmSource);
  V(exact("Campaign Medium"), data.utmMedium);
  V(exact("Campaign Name"), data.utmCampaign);

  console.log(`Submitting ${out.length} mapped fields…\n`);
  const res = await api(`/forms/${CID}/submissions`, { method: "POST", headers: { "Content-Type": "application/json", ...enc }, body: JSON.stringify({ fields: out }) });
  const txt = await res.text();
  console.log(`POST → HTTP ${res.status} ${res.ok ? "ACCEPTED" : "REJECTED"}`);
  const j = JSON.parse(txt);
  if (j.id) {
    const sb = await (await api(`/submissions/${j.id}`, { headers: enc })).json();
    const stored = new Map((sb.data ?? []).map((d) => [String(d.field), d]));
    let ok = 0;
    console.log(`\nPer-field result (${out.length} sent):`);
    for (const e of out) {
      const d = stored.get(e.id);
      const has = d && d.displayValue !== "" && d.displayValue != null;
      if (has) ok++;
      const label = fields.find((f) => String(f.id) === e.id)?.label ?? e.id;
      console.log(`  ${has ? "✓" : "✗"} ${String(label).slice(0, 38).padEnd(38)} ${has ? JSON.stringify(String(d.displayValue).slice(0, 40).replace(/\n/g, " | ")) : "(NOT STORED)"}`);
    }
    console.log(`\n${ok}/${out.length} fields stored.`);
  } else {
    console.log("Body:", txt.slice(0, 300));
  }
} finally {
  const del = await api(`/forms/${CID}`, { method: "DELETE" });
  console.log(`\nDeleted copy ${CID} → HTTP ${del.status}`);
}
