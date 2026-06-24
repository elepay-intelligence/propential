import { z } from "zod";
import type { FormstackFieldEntry } from "./formstack.js";

/**
 * Request contract for apply.html — field names mirror apply.js exactly.
 * Numbers arrive as strings from the form; z.coerce handles that. Conditional
 * fields are optional here (the client enforces conditional requireds); the
 * always-present essentials + consents are the only hard requirements so the
 * route never 400s on an otherwise-complete lead.
 */
const optStr = z.string().trim().optional().default("");
const optNum = z
  .union([z.coerce.number(), z.literal("")])
  .optional()
  .transform((v) => (v === "" || v == null ? undefined : Number(v)));
const optBool = z.coerce.boolean().optional().default(false);

export const applySchema = z.object({
  // loan + identity
  purpose: z.string().trim().min(1),
  project: z.array(z.string()).default([]),
  amount: z.coerce.number().min(5000).max(175000),
  term: z.string().trim().min(1),
  title: optStr,
  firstName: z.string().trim().min(1),
  middleName: optStr,
  lastName: z.string().trim().min(1),
  dob: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().trim().min(1),
  joint: optStr,
  jointName: optStr,
  jointEmail: optStr,
  // employment
  employment: z.string().trim().min(1),
  employmentDetail: optStr,
  industry: optStr,
  jobTitle: optStr,
  jobTenure: optStr,
  employerName: optStr,
  prevJobTitle: optStr,
  prevEmployerName: optStr,
  selfEmployedTenure: optStr,
  businessName: optStr,
  businessAbn: optStr,
  // home
  resAddress: z.string().trim().min(1),
  resCity: optStr,
  resState: optStr,
  resPostcode: optStr,
  addressTenure: optStr,
  prevResAddress: optStr,
  ownership: optStr,
  ownershipOther: optStr,
  homeValue: optNum,
  mortBalance: optNum,
  relationship: optStr,
  // renovation property
  renoIsHome: optStr,
  propAddress: optStr,
  propCity: optStr,
  propState: optStr,
  propPostcode: optStr,
  onTitle: optStr,
  titleOwner: optStr,
  propValue: optNum,
  propRentalIncome: optNum,
  propHasLoan: optStr,
  propLoanOwing: optNum,
  propLoanRepayment: optNum,
  // income
  income: z.coerce.number().nonnegative(),
  payFrequency: optStr,
  centrelink: optStr,
  cl1Type: optStr, cl1Amount: optNum,
  addCl2: optBool, cl2Type: optStr, cl2Amount: optNum,
  addCl3: optBool, cl3Type: optStr, cl3Amount: optNum,
  otherIncome: optStr,
  src1Type: optStr, src1Amount: optNum,
  addSrc2: optBool, src2Type: optStr, src2Amount: optNum,
  addSrc3: optBool, src3Type: optStr, src3Amount: optNum,
  // expenses
  generalExpenses: optNum,
  expenses: z.coerce.number().nonnegative(),
  spouseExpensePct: optStr,
  rentFrequency: optStr,
  rentAmount: optNum,
  spouseRentPct: optStr,
  adverseChange: optStr,
  // investment property
  investmentProperty: optStr,
  ip1Rental: optNum, ip1HasMortgage: optStr, ip1Repayment: optNum, ip1Owing: optNum, ip1Value: optNum,
  addIp2: optBool, ip2Rental: optNum, ip2HasMortgage: optStr, ip2Repayment: optNum, ip2Owing: optNum, ip2Value: optNum,
  addIp3: optBool, ip3Rental: optNum, ip3HasMortgage: optStr, ip3Repayment: optNum, ip3Owing: optNum, ip3Value: optNum,
  // other assets
  otherAssets: optStr,
  asset1Type: optStr, asset1Value: optNum,
  addAsset2: optBool, asset2Type: optStr, asset2Value: optNum,
  addAsset3: optBool, asset3Type: optStr, asset3Value: optNum,
  addAsset4: optBool, asset4Type: optStr, asset4Value: optNum,
  // credit cards
  creditCards: optStr,
  card1Provider: optStr, card1Limit: optNum, card1Owing: optNum,
  addCard2: optBool, card2Provider: optStr, card2Limit: optNum, card2Owing: optNum,
  addCard3: optBool, card3Provider: optStr, card3Limit: optNum, card3Owing: optNum,
  addCard4: optBool, card4Provider: optStr, card4Limit: optNum, card4Owing: optNum,
  addCard5: optBool, card5Provider: optStr, card5Limit: optNum, card5Owing: optNum,
  // other debt
  otherDebt: optStr,
  debt1Type: optStr, debt1Owing: optNum, debt1Repayment: optNum,
  addDebt2: optBool, debt2Type: optStr, debt2Owing: optNum, debt2Repayment: optNum,
  addDebt3: optBool, debt3Type: optStr, debt3Owing: optNum, debt3Repayment: optNum,
  addDebt4: optBool, debt4Type: optStr, debt4Owing: optNum, debt4Repayment: optNum,
  addDebt5: optBool, debt5Type: optStr, debt5Owing: optNum, debt5Repayment: optNum,
  // identity & verification
  hasLicense: optStr,
  idIssuedState: optStr,
  idNumber: optStr,
  medicareNumber: optStr,
  medicareColour: optStr,
  medicareExpiry: optStr,
  dependants: optStr,
  dep1Age: optStr, dep2Age: optStr, dep3Age: optStr, dep4Age: optStr,
  // declarations
  consentPrivacy: z.literal(true),
  consentConfirm: z.literal(true),
  consentCitizen: z.literal(true),
  consentAccuracy: z.literal(true),
  consentCredit: z.literal(true),
  consentElectronic: z.literal(true),
  consentBiometric: z.literal(true),
  // tracking
  utmSource: optStr,
  utmMedium: optStr,
  utmContent: optStr,
  utmCampaign: optStr,
  gclid: optStr,
});

export type ApplyInput = z.infer<typeof applySchema>;

/**
 * ════════════════════════════════════════════════════════════════════════
 *  Formstack field ids for form 4653616 ("LIVE APP FORM - Reno Now").
 *  Resolved from GET /forms/4653616/fields (2026-06-24). This now maps every
 *  field the page collects — there are no intentionally-skipped fields.
 * ════════════════════════════════════════════════════════════════════════
 */
export const FIELD_IDS = {
  productName: "119531974",
  // loan + identity
  purpose: "119531975",        // radio  Home renovation | Investment property renovation
  projectType: "119531976",    // checkbox  Kitchen|Bathroom|Pool|Other
  loanAmount: "119531977",     // number
  term: "122580887",           // select (TERM_MAP)
  title: "119531978",          // select
  firstName: "119531979",
  middleName: "119531980",
  lastName: "119531981",
  email: "119531982",
  phone: "119531983",
  dob: "119532165",            // datetime
  joint: "119531988",          // radio No|Yes
  jointName: "119531989",
  jointEmail: "119531990",
  // employment
  employmentStatus: "119531993",   // radio
  employmentDetail: "119531994",
  industry: "119531995",           // text-with-options
  jobTitle: "119531997",           // text-with-options
  jobTenure: "119531998",          // radio
  employerName: "119531999",
  prevJobTitle: "119532001",
  prevEmployerName: "119532002",
  selfEmployedTenure: "119532004", // radio
  businessName: "119532005",
  businessAbn: "119532006",
  // home address
  residentialAddress: "119532010",     // address
  addressTenure: "119532012",          // radio
  previousAddress: "119532014",         // address
  ownership: "119532015",               // radio
  ownershipOther: "119532016",
  homeValue: "119532017",               // number
  relationship: "119532018",            // radio
  homeMortgageOwing: "119532060",       // number  amount owing on your mortgage
  // renovation property
  renoIsHome: "119532011",              // radio No|Yes
  propertyAddress: "119533819",         // address
  onTitle: "119534299",                 // radio
  titleOwner: "119534366",
  propRentalIncome: "119534508",        // number
  propHasLoan: "119535325",             // radio
  propLoanOwing: "119535527",           // number
  propLoanRepayment: "119535791",       // number
  propValue: "119633192",               // number
  // income
  grossIncome: "119532022",             // number
  payFrequency: "119532023",            // radio
  centrelink: "119532024",              // radio
  cl1Type: "119532026", cl1Amount: "119532027",
  addCl2: "119532028", cl2Type: "119532030", cl2Amount: "119532031",
  addCl3: "119532032", cl3Type: "119532034", cl3Amount: "119532035",
  otherIncome: "119532037",             // radio
  src1Type: "119532039", src1Amount: "119532040",
  addSrc2: "119532041", src2Type: "119532043", src2Amount: "119532044",
  addSrc3: "119532045", src3Type: "119532047", src3Amount: "119532048",
  // expenses
  generalExpenses: "119532050",         // number
  totalExpenses: "119532052",           // number
  spouseExpensePct: "119532053",        // radio
  rentFrequency: "119532056",           // radio
  rentAmount: "119532057",              // number
  spouseRentPct: "119532058",           // radio
  adverseChange: "119532062",           // radio
  // investment property
  investmentProperty: "119532064",      // radio
  ip1Rental: "119532066", ip1HasMortgage: "119532067", ip1Repayment: "119532068", ip1Owing: "119532069", ip1Value: "119532070",
  addIp2: "119532074", ip2Rental: "119532076", ip2HasMortgage: "119532077", ip2Repayment: "119532078", ip2Owing: "119532079", ip2Value: "119532080",
  addIp3: "119532084", ip3Rental: "119532086", ip3HasMortgage: "119532087", ip3Repayment: "119532088", ip3Owing: "119532089", ip3Value: "119532090",
  // other assets
  otherAssets: "119532095",             // radio
  asset1Type: "119532097", asset1Value: "119532098",
  addAsset2: "119532099", asset2Type: "119532101", asset2Value: "119532102",
  addAsset3: "119532103", asset3Type: "119532105", asset3Value: "119532106",
  addAsset4: "119532107", asset4Type: "119532109", asset4Value: "119532110",
  // credit cards
  creditCards: "119532112",             // radio
  card1Provider: "119532114", card1Limit: "119532115", card1Owing: "119532116",
  addCard2: "119532117", card2Provider: "119532119", card2Limit: "119532120", card2Owing: "119532121",
  addCard3: "119532122", card3Provider: "119532124", card3Limit: "119532125", card3Owing: "119532126",
  addCard4: "119532127", card4Provider: "119532129", card4Limit: "119532130", card4Owing: "119532131",
  addCard5: "119532132", card5Provider: "119532134", card5Limit: "119532135", card5Owing: "119532136",
  // other debt
  otherDebt: "119532138",               // radio
  debt1Type: "119532140", debt1Owing: "119532141", debt1Repayment: "119532142",
  addDebt2: "119532143", debt2Type: "119532145", debt2Owing: "119532146", debt2Repayment: "119532147",
  addDebt3: "119532148", debt3Type: "119532150", debt3Owing: "119532151", debt3Repayment: "119532152",
  addDebt4: "119532153", debt4Type: "119532155", debt4Owing: "119532156", debt4Repayment: "119532157",
  addDebt5: "119532158", debt5Type: "119532160", debt5Owing: "119532161", debt5Repayment: "119532162",
  // identity & verification
  hasLicense: "119532166",              // radio No|Yes
  idIssuedState: "119532167",           // radio
  idNumber: "119532168",
  medicareNumber: "119532169",          // number
  medicareColour: "119532171",          // radio
  medicareExpiry: "119532172",          // datetime
  dependants: "119532173",              // radio
  dep1Age: "119532175", dep2Age: "119532176", dep3Age: "119532177", dep4Age: "119532178",
  // declarations
  consentPrivacy: "119531985",
  consentConfirm: "142285711",
  consentCitizen: "119532181",
  consentAccuracy: "119532182",
  consentCredit: "119532183",
  consentElectronic: "119532184",
  consentBiometric: "125695752",
  // tracking (hidden)
  utmSource: "119532186",
  utmMedium: "119532187",
  utmContent: "119532188",
  utmCampaign: "119532189",
  gclid: "119532190",
} as const;

/**
 * Exact option string a ticked checkbox/consent expects as its subvalue
 * (checkbox value === label on this form). Copied verbatim from the live form
 * options (consent-labels.json, 2026-06-24).
 */
export const CHECKBOX_LABELS = {
  consentPrivacy:
    "Privacy Consent: By checking this box, I confirm that I have accessed RenoNow’s Privacy Policy and Credit Reporting Policy by clicking on the link shown above and reviewed, understand and consent to RenoNow, its related bodies corporate, affiliates and agents, and other nominated entities collecting, using, holding and disclosing personal information and credit-related information about me as set out in the privacy policy. If you do not consent, we may not be able to proceed with your application.",
  consentConfirm: "I confirm that:",
  consentCitizen: "Yes",
  consentAccuracy:
    "Yes, I declare all information that I have provided in this application is true and correct.",
  consentCredit:
    "Yes, I give RenoNow consent to give my personal and credit information to credit reporting agencies, including Equifax, for the purpose of obtaining a consumer and commercial credit eligibility report about me to assess my creditworthiness, and to otherwise deal with any information I provide in accordance with your Privacy Policy and Credit Reporting Policy. I understand that obtaining of the credit eligibility report may impact my credit score. I also consent to my personal details being checked with the document issuer or official record holder (e.g. Government agency) via a third party (e.g. an identity checking service) for RenoNow to verify my identity.",
  consentElectronic:
    "You consent to be given notices and other documents in connection with our dealings with you electronically (including by email to your address provided). By consenting, you warrant that you have an ability to save and print the documents, and you understand that: (a) paper documents may no longer be given; and (b) electronic communications must be regularly checked for documents; and (c) consent to the giving of documents by electronic communication may be withdrawn at any time.",
  consentBiometric:
    "I acknowledge and consent to the collection and use of my biometric information by you or your agent for authentication/ verification purposes and that my biometric information will be collected and stored in accordance with your Privacy and Credit Reporting Policy and your obligations under Privacy Act 1988 and Privacy Principles and any other applicable law. I understand that this information will not be used or disclosed for any other purpose.",
} as const;

/** "Add another …" checkbox option labels (exact form strings). */
const ADD_LABELS = {
  addCl2: "Add another Centrelink payment", addCl3: "Add another Centrelink payment",
  addSrc2: "Add another source of income", addSrc3: "Add another source of income",
  addIp2: "Add another property", addIp3: "Add another property",
  addAsset2: "Add other asset", addAsset3: "Add other asset", addAsset4: "Add other asset",
  addCard2: "Add another credit card", addCard3: "Add another credit card",
  addCard4: "Add another credit card", addCard5: "Add another credit card",
  addDebt2: "Add another debt", addDebt3: "Add another debt",
  addDebt4: "Add another debt", addDebt5: "Add another debt",
} as const;

/** page term (years "1".."10") → exact form option label. */
export const TERM_MAP: Record<string, string> = {
  "1": "1 Year", "2": "2 Years", "3": "3 Years", "4": "4 Years", "5": "5 Years",
  "6": "6 Years", "7": "7 Years",
  "8": "8 years  (over $40k only)",
  "9": "9 years  (over $40k only)",
  "10": "10 years (over $40k only)",
};

// form "type of renovation" options (kept in sync with Formstack field 119531976).
// The design's 8 options now all exist on the form, so this is identity for valid
// values; any unknown value still falls back to "Other" as a safety net.
const PROJECT_FORM_OPTIONS = new Set([
  "Kitchen", "Bathroom", "Pool", "Interiors", "Fencing", "Landscaping", "Roofing", "Other",
]);
export const mapProject = (values: string[]): string[] => {
  const out = new Set<string>();
  for (const v of values) out.add(PROJECT_FORM_OPTIONS.has(v) ? v : "Other");
  return [...out];
};

/** Best-effort split of a single address line into street / city / state / zip. */
function addressObject(line: string, city?: string, state?: string, zip?: string) {
  return {
    address: line,
    ...(city ? { city } : {}),
    ...(state ? { state } : {}),
    ...(zip ? { zip } : {}),
  };
}

/**
 * Build the v2025 `fields[]` payload from a validated apply submission.
 * Returns `skipped` = keys whose value was present but had no field id (should
 * be empty now; logged by the route if not).
 */
export function buildApplyFields(data: ApplyInput): {
  fields: FormstackFieldEntry[];
  skipped: string[];
} {
  const fields: FormstackFieldEntry[] = [];
  const skipped: string[] = [];

  const text = (id: string, key: string, value: string) => {
    if (!value) return;
    if (!id) return void skipped.push(key);
    fields.push({ id, value: { value } });
  };
  const num = (id: string, key: string, value: number | undefined) => {
    if (value == null) return;
    text(id, key, String(value));
  };
  const radio = text; // radio uses the same { value } shape as text
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
  const address = (
    id: string,
    key: string,
    line: string,
    city?: string,
    state?: string,
    zip?: string,
  ) => {
    if (!line) return;
    if (!id) return void skipped.push(key);
    fields.push({ id, value: addressObject(line, city, state, zip) });
  };

  const F = FIELD_IDS;

  // constant
  text(F.productName, "productName", "Reno Now");

  // loan + identity
  radio(F.purpose, "purpose", data.purpose);
  checkboxMulti(F.projectType, "projectType", mapProject(data.project));
  num(F.loanAmount, "loanAmount", data.amount);
  select(F.term, "term", TERM_MAP[data.term] ?? "");
  select(F.title, "title", data.title);
  text(F.firstName, "firstName", data.firstName);
  text(F.middleName, "middleName", data.middleName);
  text(F.lastName, "lastName", data.lastName);
  text(F.email, "email", data.email);
  text(F.phone, "phone", data.phone);
  text(F.dob, "dob", data.dob);
  radio(F.joint, "joint", data.joint);
  text(F.jointName, "jointName", data.jointName);
  text(F.jointEmail, "jointEmail", data.jointEmail);

  // employment
  radio(F.employmentStatus, "employmentStatus", data.employment);
  text(F.employmentDetail, "employmentDetail", data.employmentDetail);
  text(F.industry, "industry", data.industry);
  text(F.jobTitle, "jobTitle", data.jobTitle);
  radio(F.jobTenure, "jobTenure", data.jobTenure);
  text(F.employerName, "employerName", data.employerName);
  text(F.prevJobTitle, "prevJobTitle", data.prevJobTitle);
  text(F.prevEmployerName, "prevEmployerName", data.prevEmployerName);
  radio(F.selfEmployedTenure, "selfEmployedTenure", data.selfEmployedTenure);
  text(F.businessName, "businessName", data.businessName);
  text(F.businessAbn, "businessAbn", data.businessAbn);

  // home address
  address(F.residentialAddress, "residentialAddress", data.resAddress, data.resCity, data.resState, data.resPostcode);
  radio(F.addressTenure, "addressTenure", data.addressTenure);
  address(F.previousAddress, "previousAddress", data.prevResAddress);
  radio(F.ownership, "ownership", data.ownership);
  text(F.ownershipOther, "ownershipOther", data.ownershipOther);
  num(F.homeValue, "homeValue", data.homeValue);
  radio(F.relationship, "relationship", data.relationship);
  num(F.homeMortgageOwing, "homeMortgageOwing", data.mortBalance);

  // renovation property
  radio(F.renoIsHome, "renoIsHome", data.renoIsHome);
  address(F.propertyAddress, "propertyAddress", data.propAddress, data.propCity, data.propState, data.propPostcode);
  radio(F.onTitle, "onTitle", data.onTitle);
  text(F.titleOwner, "titleOwner", data.titleOwner);
  num(F.propRentalIncome, "propRentalIncome", data.propRentalIncome);
  radio(F.propHasLoan, "propHasLoan", data.propHasLoan);
  num(F.propLoanOwing, "propLoanOwing", data.propLoanOwing);
  num(F.propLoanRepayment, "propLoanRepayment", data.propLoanRepayment);
  num(F.propValue, "propValue", data.propValue);

  // income
  num(F.grossIncome, "grossIncome", data.income);
  radio(F.payFrequency, "payFrequency", data.payFrequency);
  radio(F.centrelink, "centrelink", data.centrelink);
  select(F.cl1Type, "cl1Type", data.cl1Type); num(F.cl1Amount, "cl1Amount", data.cl1Amount);
  checkboxSingle(F.addCl2, "addCl2", ADD_LABELS.addCl2, data.addCl2);
  select(F.cl2Type, "cl2Type", data.cl2Type); num(F.cl2Amount, "cl2Amount", data.cl2Amount);
  checkboxSingle(F.addCl3, "addCl3", ADD_LABELS.addCl3, data.addCl3);
  select(F.cl3Type, "cl3Type", data.cl3Type); num(F.cl3Amount, "cl3Amount", data.cl3Amount);
  radio(F.otherIncome, "otherIncome", data.otherIncome);
  select(F.src1Type, "src1Type", data.src1Type); num(F.src1Amount, "src1Amount", data.src1Amount);
  checkboxSingle(F.addSrc2, "addSrc2", ADD_LABELS.addSrc2, data.addSrc2);
  select(F.src2Type, "src2Type", data.src2Type); num(F.src2Amount, "src2Amount", data.src2Amount);
  checkboxSingle(F.addSrc3, "addSrc3", ADD_LABELS.addSrc3, data.addSrc3);
  select(F.src3Type, "src3Type", data.src3Type); num(F.src3Amount, "src3Amount", data.src3Amount);

  // expenses
  num(F.generalExpenses, "generalExpenses", data.generalExpenses);
  num(F.totalExpenses, "totalExpenses", data.expenses);
  radio(F.spouseExpensePct, "spouseExpensePct", data.spouseExpensePct);
  radio(F.rentFrequency, "rentFrequency", data.rentFrequency);
  num(F.rentAmount, "rentAmount", data.rentAmount);
  radio(F.spouseRentPct, "spouseRentPct", data.spouseRentPct);
  radio(F.adverseChange, "adverseChange", data.adverseChange);

  // investment property
  radio(F.investmentProperty, "investmentProperty", data.investmentProperty);
  num(F.ip1Rental, "ip1Rental", data.ip1Rental); radio(F.ip1HasMortgage, "ip1HasMortgage", data.ip1HasMortgage); num(F.ip1Repayment, "ip1Repayment", data.ip1Repayment); num(F.ip1Owing, "ip1Owing", data.ip1Owing); num(F.ip1Value, "ip1Value", data.ip1Value);
  checkboxSingle(F.addIp2, "addIp2", ADD_LABELS.addIp2, data.addIp2);
  num(F.ip2Rental, "ip2Rental", data.ip2Rental); radio(F.ip2HasMortgage, "ip2HasMortgage", data.ip2HasMortgage); num(F.ip2Repayment, "ip2Repayment", data.ip2Repayment); num(F.ip2Owing, "ip2Owing", data.ip2Owing); num(F.ip2Value, "ip2Value", data.ip2Value);
  checkboxSingle(F.addIp3, "addIp3", ADD_LABELS.addIp3, data.addIp3);
  num(F.ip3Rental, "ip3Rental", data.ip3Rental); radio(F.ip3HasMortgage, "ip3HasMortgage", data.ip3HasMortgage); num(F.ip3Repayment, "ip3Repayment", data.ip3Repayment); num(F.ip3Owing, "ip3Owing", data.ip3Owing); num(F.ip3Value, "ip3Value", data.ip3Value);

  // other assets
  radio(F.otherAssets, "otherAssets", data.otherAssets);
  select(F.asset1Type, "asset1Type", data.asset1Type); num(F.asset1Value, "asset1Value", data.asset1Value);
  checkboxSingle(F.addAsset2, "addAsset2", ADD_LABELS.addAsset2, data.addAsset2);
  select(F.asset2Type, "asset2Type", data.asset2Type); num(F.asset2Value, "asset2Value", data.asset2Value);
  checkboxSingle(F.addAsset3, "addAsset3", ADD_LABELS.addAsset3, data.addAsset3);
  select(F.asset3Type, "asset3Type", data.asset3Type); num(F.asset3Value, "asset3Value", data.asset3Value);
  checkboxSingle(F.addAsset4, "addAsset4", ADD_LABELS.addAsset4, data.addAsset4);
  select(F.asset4Type, "asset4Type", data.asset4Type); num(F.asset4Value, "asset4Value", data.asset4Value);

  // credit cards
  radio(F.creditCards, "creditCards", data.creditCards);
  text(F.card1Provider, "card1Provider", data.card1Provider); num(F.card1Limit, "card1Limit", data.card1Limit); num(F.card1Owing, "card1Owing", data.card1Owing);
  checkboxSingle(F.addCard2, "addCard2", ADD_LABELS.addCard2, data.addCard2);
  text(F.card2Provider, "card2Provider", data.card2Provider); num(F.card2Limit, "card2Limit", data.card2Limit); num(F.card2Owing, "card2Owing", data.card2Owing);
  checkboxSingle(F.addCard3, "addCard3", ADD_LABELS.addCard3, data.addCard3);
  text(F.card3Provider, "card3Provider", data.card3Provider); num(F.card3Limit, "card3Limit", data.card3Limit); num(F.card3Owing, "card3Owing", data.card3Owing);
  checkboxSingle(F.addCard4, "addCard4", ADD_LABELS.addCard4, data.addCard4);
  text(F.card4Provider, "card4Provider", data.card4Provider); num(F.card4Limit, "card4Limit", data.card4Limit); num(F.card4Owing, "card4Owing", data.card4Owing);
  checkboxSingle(F.addCard5, "addCard5", ADD_LABELS.addCard5, data.addCard5);
  text(F.card5Provider, "card5Provider", data.card5Provider); num(F.card5Limit, "card5Limit", data.card5Limit); num(F.card5Owing, "card5Owing", data.card5Owing);

  // other debt
  radio(F.otherDebt, "otherDebt", data.otherDebt);
  select(F.debt1Type, "debt1Type", data.debt1Type); num(F.debt1Owing, "debt1Owing", data.debt1Owing); num(F.debt1Repayment, "debt1Repayment", data.debt1Repayment);
  checkboxSingle(F.addDebt2, "addDebt2", ADD_LABELS.addDebt2, data.addDebt2);
  select(F.debt2Type, "debt2Type", data.debt2Type); num(F.debt2Owing, "debt2Owing", data.debt2Owing); num(F.debt2Repayment, "debt2Repayment", data.debt2Repayment);
  checkboxSingle(F.addDebt3, "addDebt3", ADD_LABELS.addDebt3, data.addDebt3);
  select(F.debt3Type, "debt3Type", data.debt3Type); num(F.debt3Owing, "debt3Owing", data.debt3Owing); num(F.debt3Repayment, "debt3Repayment", data.debt3Repayment);
  checkboxSingle(F.addDebt4, "addDebt4", ADD_LABELS.addDebt4, data.addDebt4);
  select(F.debt4Type, "debt4Type", data.debt4Type); num(F.debt4Owing, "debt4Owing", data.debt4Owing); num(F.debt4Repayment, "debt4Repayment", data.debt4Repayment);
  checkboxSingle(F.addDebt5, "addDebt5", ADD_LABELS.addDebt5, data.addDebt5);
  select(F.debt5Type, "debt5Type", data.debt5Type); num(F.debt5Owing, "debt5Owing", data.debt5Owing); num(F.debt5Repayment, "debt5Repayment", data.debt5Repayment);

  // identity & verification
  radio(F.hasLicense, "hasLicense", data.hasLicense);
  radio(F.idIssuedState, "idIssuedState", data.idIssuedState);
  text(F.idNumber, "idNumber", data.idNumber);
  text(F.medicareNumber, "medicareNumber", data.medicareNumber);
  radio(F.medicareColour, "medicareColour", data.medicareColour);
  text(F.medicareExpiry, "medicareExpiry", data.medicareExpiry);
  radio(F.dependants, "dependants", data.dependants);
  text(F.dep1Age, "dep1Age", data.dep1Age);
  text(F.dep2Age, "dep2Age", data.dep2Age);
  text(F.dep3Age, "dep3Age", data.dep3Age);
  text(F.dep4Age, "dep4Age", data.dep4Age);

  // declarations
  checkboxSingle(F.consentPrivacy, "consentPrivacy", CHECKBOX_LABELS.consentPrivacy, data.consentPrivacy);
  checkboxSingle(F.consentConfirm, "consentConfirm", CHECKBOX_LABELS.consentConfirm, data.consentConfirm);
  checkboxSingle(F.consentCitizen, "consentCitizen", CHECKBOX_LABELS.consentCitizen, data.consentCitizen);
  checkboxSingle(F.consentAccuracy, "consentAccuracy", CHECKBOX_LABELS.consentAccuracy, data.consentAccuracy);
  checkboxSingle(F.consentCredit, "consentCredit", CHECKBOX_LABELS.consentCredit, data.consentCredit);
  checkboxSingle(F.consentElectronic, "consentElectronic", CHECKBOX_LABELS.consentElectronic, data.consentElectronic);
  checkboxSingle(F.consentBiometric, "consentBiometric", CHECKBOX_LABELS.consentBiometric, data.consentBiometric);

  // tracking
  text(F.utmSource, "utmSource", data.utmSource);
  text(F.utmMedium, "utmMedium", data.utmMedium);
  text(F.utmContent, "utmContent", data.utmContent);
  text(F.utmCampaign, "utmCampaign", data.utmCampaign);
  text(F.gclid, "gclid", data.gclid);

  return { fields, skipped };
}
