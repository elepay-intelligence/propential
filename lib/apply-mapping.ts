import { z } from "zod";
import type { FormstackFieldEntry } from "./formstack";

/**
 * Request contract for apply.html — field names mirror apply.js exactly.
 * Numbers arrive as strings from the form; z.coerce handles that.
 */
export const applySchema = z.object({
  name: z.string().trim().min(1),
  dob: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().trim().min(1),
  resAddress: z.string().trim().min(1),
  propAddress: z.string().trim().min(1),
  propState: z.string().trim().min(1),
  propValue: z.coerce.number().nonnegative(),
  hasMortgage: z.enum(["yes", "no"]),
  lender: z.string().trim().optional().default(""),
  mortBalance: z.coerce.number().nonnegative().optional(),
  amount: z.coerce.number().min(5000).max(175000),
  term: z.string().trim().min(1),
  project: z.array(z.string()).default([]),
  purpose: z.string().trim().optional().default(""),
  employment: z.string().trim().min(1),
  income: z.coerce.number().nonnegative(),
  expenses: z.coerce.number().nonnegative(),
  otherDebts: z.coerce.number().nonnegative(),
  idType: z.string().trim().min(1),
  idIssuedState: z.string().trim().min(1),
  idNumber: z.string().trim().min(1),
  referral: z.string().trim().optional().default(""),
  consentPrivacy: z.literal(true),
  consentAccuracy: z.literal(true),
  utmSource: z.string().trim().optional().default(""),
  utmMedium: z.string().trim().optional().default(""),
  utmCampaign: z.string().trim().optional().default(""),
});

export type ApplyInput = z.infer<typeof applySchema>;

/**
 * ════════════════════════════════════════════════════════════════════════
 *  TODO — FILL IN THE REAL FORMSTACK FIELD IDs
 *  Run:  npm run formstack:fields   (after `vercel env pull .env.local`)
 *  and paste each numeric field id below. Empty ("") entries are skipped at
 *  submit time and logged, so the route is safe to deploy before they're set.
 * ════════════════════════════════════════════════════════════════════════
 */
export const FIELD_IDS = {
  firstName: "", // text   — Reno Now "First name"
  lastName: "", // text    — "Last name"
  dob: "", // datetime/text — "Date of birth"
  email: "", // text       — "Email"
  phone: "", // text       — "Mobile"
  residentialAddress: "", // address — "Enter your home address"
  propertyAddress: "", // address    — property to be renovated
  propertyState: "", // select       — state/territory
  propertyValue: "", // text/number  — "estimated value of your home"
  hasMortgage: "", // radio/select   — home ownership / existing mortgage
  existingLender: "", // text
  mortgageBalance: "", // text/number — "amount owing on your mortgage"
  loanAmount: "", // text/number     — "How much money are you looking to borrow"
  term: "", // select                — "Choose your repayment term"
  projectType: "", // checkbox(multi)— "What type of renovation"
  projectDetail: "", // textarea
  employmentStatus: "", // select    — "Employment status"
  grossIncome: "", // text/number    — "gross annual salary"
  monthlyExpenses: "", // text/number— "total household monthly living expenses"
  otherDebtRepayments: "", // text/number
  idType: "", // select              — driver licence / passport
  idIssuedState: "", // select       — "Driver's license state"
  idNumber: "", // text              — "Driver's license number"
  partnerCode: "", // text           — referral/partner code
  privacyConsent: "", // checkbox    — "Privacy Consent"
  accuracyConsent: "", // checkbox   — declaration true & correct
  utmSource: "", // text             — "Campaign Source"
  utmMedium: "", // text             — "Campaign Medium"
  utmCampaign: "", // text           — "Campaign Name"
} as const;

/**
 * Exact option label that a ticked single-checkbox field expects as its
 * subvalue. TODO: confirm these against the Formstack field options.
 */
export const CHECKBOX_LABELS = {
  privacyConsent: "I agree",
  accuracyConsent: "I agree",
} as const;

/**
 * Build the v2025 `fields[]` payload from a validated apply submission.
 * Returns `skipped` = keys with no field id yet (logged by the route).
 */
export function buildApplyFields(data: ApplyInput): {
  fields: FormstackFieldEntry[];
  skipped: string[];
} {
  const fields: FormstackFieldEntry[] = [];
  const skipped: string[] = [];

  // v2025: `value` is ALWAYS a nested object. text/number/radio/datetime use
  // { value }; select/checkbox use { subvalues }; address uses the address object.
  const text = (id: string, key: string, value: string) => {
    if (!value) return;
    if (!id) return void skipped.push(key);
    fields.push({ id, value: { value } });
  };
  // radio uses the same { value } shape as text (NOT subvalues — that's select/checkbox).
  const radio = (id: string, key: string, value: string) => {
    if (!value) return;
    if (!id) return void skipped.push(key);
    fields.push({ id, value: { value } });
  };
  const select = (id: string, key: string, value: string) => {
    if (!value) return;
    if (!id) return void skipped.push(key);
    fields.push({ id, value: { subvalues: [{ subvalue: value }] } });
  };
  const checkboxMulti = (id: string, key: string, values: string[]) => {
    if (!values.length) return;
    if (!id) return void skipped.push(key);
    fields.push({ id, value: { subvalues: values.map((v) => ({ subvalue: v })) } });
  };
  const checkboxSingle = (id: string, key: string, label: string, on: boolean) => {
    if (!on) return;
    if (!id) return void skipped.push(key);
    fields.push({ id, value: { subvalues: [{ subvalue: label }] } });
  };
  const address = (id: string, key: string, line: string) => {
    if (!line) return;
    if (!id) return void skipped.push(key);
    fields.push({ id, value: { address: line } });
  };

  // apply.html collects one "Full name"; Reno Now wants first + last.
  const parts = data.name.trim().split(/\s+/);
  const first = parts.shift() ?? data.name;
  const last = parts.join(" ");
  text(FIELD_IDS.firstName, "firstName", first);
  text(FIELD_IDS.lastName, "lastName", last || first);

  text(FIELD_IDS.dob, "dob", data.dob);
  text(FIELD_IDS.email, "email", data.email);
  text(FIELD_IDS.phone, "phone", data.phone);
  address(FIELD_IDS.residentialAddress, "residentialAddress", data.resAddress);
  address(FIELD_IDS.propertyAddress, "propertyAddress", data.propAddress);
  select(FIELD_IDS.propertyState, "propertyState", data.propState);
  text(FIELD_IDS.propertyValue, "propertyValue", String(data.propValue));
  radio(FIELD_IDS.hasMortgage, "hasMortgage", data.hasMortgage === "yes" ? "Yes" : "No");
  text(FIELD_IDS.existingLender, "existingLender", data.lender);
  if (data.mortBalance != null) {
    text(FIELD_IDS.mortgageBalance, "mortgageBalance", String(data.mortBalance));
  }
  text(FIELD_IDS.loanAmount, "loanAmount", String(data.amount));
  select(FIELD_IDS.term, "term", data.term);
  checkboxMulti(FIELD_IDS.projectType, "projectType", data.project);
  text(FIELD_IDS.projectDetail, "projectDetail", data.purpose);
  radio(FIELD_IDS.employmentStatus, "employmentStatus", data.employment);
  text(FIELD_IDS.grossIncome, "grossIncome", String(data.income));
  text(FIELD_IDS.monthlyExpenses, "monthlyExpenses", String(data.expenses));
  text(FIELD_IDS.otherDebtRepayments, "otherDebtRepayments", String(data.otherDebts));
  select(FIELD_IDS.idType, "idType", data.idType);
  radio(FIELD_IDS.idIssuedState, "idIssuedState", data.idIssuedState);
  text(FIELD_IDS.idNumber, "idNumber", data.idNumber);
  text(FIELD_IDS.partnerCode, "partnerCode", data.referral);
  checkboxSingle(FIELD_IDS.privacyConsent, "privacyConsent", CHECKBOX_LABELS.privacyConsent, data.consentPrivacy);
  checkboxSingle(FIELD_IDS.accuracyConsent, "accuracyConsent", CHECKBOX_LABELS.accuracyConsent, data.consentAccuracy);
  text(FIELD_IDS.utmSource, "utmSource", data.utmSource);
  text(FIELD_IDS.utmMedium, "utmMedium", data.utmMedium);
  text(FIELD_IDS.utmCampaign, "utmCampaign", data.utmCampaign);

  return { fields, skipped };
}
