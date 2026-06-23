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
 *  Real Formstack field ids for form 4653616 ("LIVE APP FORM - Reno Now").
 *  Resolved from GET /forms/4653616/fields (2026-06-23). Empty ("") entries
 *  have NO clean target on the form and are skipped + logged at submit time:
 *   - propertyState / hasMortgage / existingLender / otherDebtRepayments /
 *     projectDetail / partnerCode — no matching field, OR
 *   - idType — the form asks a Yes/No "do you have a licence?", which does not
 *     correspond to the page's licence/passport select.
 *  This is the agreed partial-lead mapping; the form has ~50 required fields
 *  the page doesn't collect (the v2025 API does NOT enforce required, verified).
 * ════════════════════════════════════════════════════════════════════════
 */
export const FIELD_IDS = {
  firstName: "119531979", // text     — "First name"
  lastName: "119531981", // text      — "Last name"
  dob: "119532165", // datetime       — "Date of birth"
  email: "119531982", // email        — "Email"
  phone: "119531983", // phone        — "Mobile"
  residentialAddress: "119532010", // address — "Address" (home)
  propertyAddress: "119533819", // address    — "Renovation address"
  propertyState: "", // no standalone state field (addresses are structured)
  propertyValue: "119532017", // number       — "estimated value of your home"
  hasMortgage: "", // no Yes/No home-mortgage field (only "amount owing")
  existingLender: "", // no lender-name field
  mortgageBalance: "119532060", // number     — "amount owing on your mortgage"
  loanAmount: "119531977", // number          — "How much money are you looking to borrow"
  term: "122580887", // select (TERM_MAP)     — "Choose your repayment term"
  projectType: "119531976", // checkbox (PROJECT_MAP) — "What type of renovation"
  projectDetail: "", // no free-text reno-detail field
  employmentStatus: "119531993", // radio (EMPLOYMENT_MAP) — "Employment status"
  grossIncome: "119532022", // number         — "gross annual salary"
  monthlyExpenses: "119532052", // number     — "total household monthly living expenses"
  otherDebtRepayments: "", // no single other-debt field (form has structured debts)
  idType: "", // form field is a Yes/No "have AU licence", not a type select
  idIssuedState: "119532167", // radio        — "Driver's license state" (NSW…WA)
  idNumber: "119532168", // text              — "Driver's license number"
  partnerCode: "", // no referral/partner-code field on this form
  privacyConsent: "119531985", // checkbox    — "Privacy Consent"
  accuracyConsent: "119532182", // checkbox   — declaration true & correct
  utmSource: "119532186", // text             — "Campaign Source"
  utmMedium: "119532187", // text             — "Campaign Medium"
  utmCampaign: "119532189", // text           — "Campaign Name"
} as const;

/**
 * Exact option string a ticked consent checkbox expects as its subvalue
 * (checkbox value === label on this form). Copied verbatim from the form
 * options — if the form's consent wording is edited, these must be updated
 * (scripts/verify-e2e.mjs will catch a mismatch: the consent stores empty).
 */
export const CHECKBOX_LABELS = {
  privacyConsent:
    "Privacy Consent: By checking this box, I confirm that I have accessed RenoNow’s Privacy Policy and Credit Reporting Policy by clicking on the link shown above and reviewed, understand and consent to RenoNow, its related bodies corporate, affiliates and agents, and other nominated entities collecting, using, holding and disclosing personal information and credit-related information about me as set out in the privacy policy. If you do not consent, we may not be able to proceed with your application.",
  accuracyConsent:
    "Yes, I declare all information that I have provided in this application is true and correct.",
} as const;

/**
 * Value transforms — the designer's page options differ from the Formstack
 * form options, so map page value → exact form option label before submit.
 */
// page term is the number of years ("1".."10"); form wants labelled options.
export const TERM_MAP: Record<string, string> = {
  "1": "1 Year", "2": "2 Years", "3": "3 Years", "4": "4 Years", "5": "5 Years",
  "6": "6 Years", "7": "7 Years",
  "8": "8 years  (over $40k only)", // note: double space, exact form label
  "9": "9 years  (over $40k only)",
  "10": "10 years (over $40k only)",
};
export const EMPLOYMENT_MAP: Record<string, string> = {
  "Full-time": "Full time",
  "Part-time": "Part time",
  "Casual": "Casual/Temp",
  "Self-employed": "Self-employed",
  "Retired": "Retired",
  "Other": "None of the above",
};
// form "type of renovation" only has Kitchen|Bathroom|Pool|Other; the page's
// extra options collapse to "Other" so the closest available box is ticked.
const PROJECT_FORM_OPTIONS = new Set(["Kitchen", "Bathroom", "Pool", "Other"]);
export const mapProject = (values: string[]): string[] => {
  const out = new Set<string>();
  for (const v of values) out.add(PROJECT_FORM_OPTIONS.has(v) ? v : "Other");
  return [...out];
};

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
  select(FIELD_IDS.term, "term", TERM_MAP[data.term] ?? "");
  checkboxMulti(FIELD_IDS.projectType, "projectType", mapProject(data.project));
  text(FIELD_IDS.projectDetail, "projectDetail", data.purpose);
  radio(FIELD_IDS.employmentStatus, "employmentStatus", EMPLOYMENT_MAP[data.employment] ?? "");
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
