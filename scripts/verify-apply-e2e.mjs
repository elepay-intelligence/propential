/**
 * Full end-to-end proof of the rebuilt apply.html → Formstack mapping.
 *
 * Imports the REAL buildApplyFields()/FIELD_IDS from lib/apply-mapping.ts, runs
 * a complete representative payload through it, clones the live form (4653616)
 * into a throwaway encrypted copy, remaps live field ids → clone field ids by
 * label, submits, reads the decrypted submission back, and reports per-field
 * storage. Then deletes the copy. Touches no live data / no live submissions.
 *
 *   node --import tsx scripts/verify-apply-e2e.mjs
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import { buildApplyFields, applySchema } from "../lib/apply-mapping.ts";

const token = process.env.FORMSTACK_API_TOKEN;
const ep = process.env.FORMSTACK_USER_FORM_ENCRYPTION_PASSWORD;
const LIVE = process.env.FORMSTACK_FORM_ID || "4653616";
const h = { Authorization: `Bearer ${token}`, Accept: "application/json" };
const enc = { "X-FS-Encryption-Password": ep };
const api = (p, o = {}) =>
  fetch(`https://www.formstack.com/api/v2025${p}`, { ...o, headers: { ...h, ...(o.headers || {}) } });

// A complete, branch-exercising submission in apply.js value formats.
const raw = {
  purpose: "Home renovation",
  project: ["Kitchen", "Pool"],
  amount: "60000", term: "5",
  title: "Mr.", firstName: "Jordan", middleName: "Lee", lastName: "Smith",
  dob: "1990-01-15", email: "jordan.test@example.com", phone: "0400111222",
  joint: "Yes", jointName: "Alex Smith", jointEmail: "alex.test@example.com",
  employment: "Full time", employmentDetail: "Permanent ongoing",
  industry: "Construction", jobTitle: "Carpenters and Joiners",
  jobTenure: "2 years or more", employerName: "BuildCo",
  prevJobTitle: "", prevEmployerName: "",
  selfEmployedTenure: "", businessName: "", businessAbn: "",
  resAddress: "12 Example St", resCity: "Sydney", resState: "NSW", resPostcode: "2000",
  addressTenure: "2 years or longer", prevResAddress: "",
  ownership: "I own it - paying off mortgage", ownershipOther: "",
  homeValue: "850000", mortBalance: "400000", relationship: "Married",
  renoIsHome: "No",
  propAddress: "9 Reno Ave", propCity: "Newcastle", propState: "NSW", propPostcode: "2300",
  onTitle: "Yes", titleOwner: "",
  propValue: "700000", propRentalIncome: "0",
  propHasLoan: "Yes", propLoanOwing: "250000", propLoanRepayment: "1500",
  income: "120000", payFrequency: "Monthly",
  centrelink: "Yes", cl1Type: "Family Tax Benefit Part A or B", cl1Amount: "400",
  addCl2: true, cl2Type: "Carers Payment", cl2Amount: "200", addCl3: false,
  otherIncome: "Yes", src1Type: "Second job", src1Amount: "800", addSrc2: false, addSrc3: false,
  generalExpenses: "2500", expenses: "3500", spouseExpensePct: "From 20% - 49%",
  rentFrequency: "Monthly", rentAmount: "1800", spouseRentPct: "From 0% - 19%",
  adverseChange: "No",
  investmentProperty: "Yes",
  ip1Rental: "2000", ip1HasMortgage: "Yes", ip1Repayment: "1200", ip1Owing: "300000", ip1Value: "600000",
  addIp2: false, addIp3: false,
  otherAssets: "Yes", asset1Type: "Car", asset1Value: "25000", addAsset2: false, addAsset3: false, addAsset4: false,
  creditCards: "Yes", card1Provider: "CBA", card1Limit: "10000", card1Owing: "2500",
  addCard2: false, addCard3: false, addCard4: false, addCard5: false,
  otherDebt: "Yes", debt1Type: "Car Loans", debt1Owing: "15000", debt1Repayment: "450",
  addDebt2: false, addDebt3: false, addDebt4: false, addDebt5: false,
  hasLicense: "Yes", idIssuedState: "NSW", idNumber: "1234567",
  medicareNumber: "1234567890", medicareColour: "Green", medicareExpiry: "2030-01",
  dependants: "1", dep1Age: "5",
  consentPrivacy: true, consentConfirm: true, consentCitizen: true, consentAccuracy: true,
  consentCredit: true, consentElectronic: true, consentBiometric: true,
  utmSource: "google", utmMedium: "cpc", utmContent: "ad1", utmCampaign: "reno-spring", gclid: "abc123",
};

const parsed = applySchema.safeParse(raw);
if (!parsed.success) {
  console.error("Payload failed applySchema:", JSON.stringify(parsed.error.flatten(), null, 2));
  process.exit(1);
}
const { fields, skipped } = buildApplyFields(parsed.data);
console.log(`Built ${fields.length} field entries; skipped=${skipped.length ? skipped.join(", ") : "none"}`);

// Build liveId -> label from the live form so we can remap to the clone.
const liveFields = (await (await api(`/forms/${LIVE}/fields?per_page=250`)).json()).fields ?? [];
const liveLabelById = new Map(liveFields.map((f) => [String(f.id), f.label]));

const copy = await (await api(`/forms/${LIVE}/copy`, {
  method: "POST", headers: { "Content-Type": "application/json" }, body: "{}",
})).json();
const CID = String(copy.id);
console.log(`Cloned live form → copy ${CID} (encrypted=${copy.isEncrypted})`);

// A copied form keeps encryption ON but with an unknown password. Reset the
// clone's encryption password to our known one so we can submit + read back.
const pwRes = await api(`/forms/${CID}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ encryption_password: ep }),
});
console.log(`Set clone encryption password → HTTP ${pwRes.status}`);
const useEnc = enc;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  const cloneFields = (await (await api(`/forms/${CID}/fields?per_page=250`)).json()).fields ?? [];

  // The encryption-password reset on a fresh copy is eventually consistent.
  // Poll with a 1-field probe until the new password is accepted (HTTP 200).
  const probeField = cloneFields.find((f) => /first name/i.test(f.label));
  let ready = false;
  for (let i = 0; i < 12 && !ready; i++) {
    await sleep(2500);
    const pr = await api(`/forms/${CID}/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...useEnc },
      body: JSON.stringify({ fields: [{ id: String(probeField.id), value: { value: "probe" } }] }),
    });
    ready = pr.status === 200;
    process.stdout.write(`  password-ready probe ${i + 1}: HTTP ${pr.status}${ready ? " ✓" : ""}\n`);
  }
  if (!ready) { console.log("Clone never accepted the password; aborting (clone deleted)."); throw new Error("clone-not-ready"); }
  // label -> queue of clone ids (handle duplicate labels by order).
  const cloneByLabel = new Map();
  for (const f of cloneFields) {
    const k = String(f.label);
    if (!cloneByLabel.has(k)) cloneByLabel.set(k, []);
    cloneByLabel.get(k).push(String(f.id));
  }
  const used = new Map();
  const remapped = [];
  const unmapped = [];
  for (const e of fields) {
    const label = liveLabelById.get(e.id);
    const q = cloneByLabel.get(String(label));
    const idx = used.get(label) ?? 0;
    if (q && q[idx]) {
      used.set(label, idx + 1);
      remapped.push({ id: q[idx], value: e.value });
    } else {
      unmapped.push({ id: e.id, label });
    }
  }
  if (unmapped.length) console.log(`(remap miss for ${unmapped.length}: ${unmapped.map((u) => u.label).join(" | ")})`);

  console.log(`Submitting ${remapped.length} fields to clone…\n`);
  let res, txt;
  for (let i = 0; i < 4; i++) {
    res = await api(`/forms/${CID}/submissions`, {
      method: "POST", headers: { "Content-Type": "application/json", ...useEnc },
      body: JSON.stringify({ fields: remapped }),
    });
    txt = await res.text();
    if (res.ok) break;
    await sleep(2500);
  }
  console.log(`POST → HTTP ${res.status} ${res.ok ? "ACCEPTED" : "REJECTED"}`);
  const j = JSON.parse(txt);
  if (!j.id) { console.log("Body:", txt.slice(0, 400)); process.exit(1); }

  const sb = await (await api(`/submissions/${j.id}`, { headers: useEnc })).json();
  const stored = new Map((sb.data ?? []).map((d) => [String(d.field), d]));
  const cloneLabelById = new Map(cloneFields.map((f) => [String(f.id), f.label]));
  let ok = 0;
  console.log(`Per-field result (${remapped.length} sent):`);
  for (const e of remapped) {
    const d = stored.get(e.id);
    const has = d && d.displayValue !== "" && d.displayValue != null;
    if (has) ok++;
    const label = String(cloneLabelById.get(e.id) ?? e.id).slice(0, 40).padEnd(40);
    console.log(`  ${has ? "✓" : "✗"} ${label} ${has ? JSON.stringify(String(d.displayValue).slice(0, 44).replace(/\n/g, " | ")) : "(NOT STORED)"}`);
  }
  console.log(`\n${ok}/${remapped.length} fields stored.`);
} finally {
  const del = await api(`/forms/${CID}`, { method: "DELETE" });
  console.log(`\nDeleted copy ${CID} → HTTP ${del.status}`);
}
