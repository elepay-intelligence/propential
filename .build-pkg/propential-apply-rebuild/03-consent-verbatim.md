# STEP 10 declarations — EXACT verbatim text

Each declaration is a SINGLE checkbox. The visible question text is the heading shown
ABOVE the checkbox; the checkbox's `value` attribute MUST equal the "Checkbox value"
string below **character-for-character** (including curly apostrophes ’, commas, casing).
Do NOT paraphrase, straighten quotes, or trim — the backend matches Formstack on this
exact string. Render the long ones as readable consent paragraphs next to the checkbox.

Order them exactly as listed. All are REQUIRED (form cannot submit unless checked).

Implementation note: store these strings in a single constant `CONSENT_TEXT` keyed by
variable, and set BOTH the visible paragraph and the input's `value` from that same
constant, so they can never drift apart.

---
## 1. consentPrivacy — data-fs-id 119531985
Heading: "You must review and agree to our Privacy Policy and Credit Reporting Policy before proceeding."
Checkbox value:
"Privacy Consent: By checking this box, I confirm that I have accessed RenoNow’s Privacy Policy and Credit Reporting Policy by clicking on the link shown above and reviewed, understand and consent to RenoNow, its related bodies corporate, affiliates and agents, and other nominated entities collecting, using, holding and disclosing personal information and credit-related information about me as set out in the privacy policy. If you do not consent, we may not be able to proceed with your application."

---
## 2. consentConfirm — data-fs-id 142285711
Heading: "I confirm that:"
Checkbox value:
"I confirm that:"

---
## 3. consentCitizen — data-fs-id 119532181
Heading: "Are you an Australian citizen or permanent resident?"
Checkbox value:
"Yes"

---
## 4. consentAccuracy — data-fs-id 119532182
Heading: "Do you declare all the information that you have provided in this application to be true and correct?"
Checkbox value:
"Yes, I declare all information that I have provided in this application is true and correct."

---
## 5. consentCredit — data-fs-id 119532183
Heading: "Do you give us consent to check your credit history and verify your identity?"
Checkbox value:
"Yes, I give RenoNow consent to give my personal and credit information to credit reporting agencies, including Equifax, for the purpose of obtaining a consumer and commercial credit eligibility report about me to assess my creditworthiness, and to otherwise deal with any information I provide in accordance with your Privacy Policy and Credit Reporting Policy. I understand that obtaining of the credit eligibility report may impact my credit score. I also consent to my personal details being checked with the document issuer or official record holder (e.g. Government agency) via a third party (e.g. an identity checking service) for RenoNow to verify my identity."

---
## 6. consentElectronic — data-fs-id 119532184
Heading: "Do you give us consent to send you notices and documents electronically and signing documents electronically?"
Checkbox value:
"You consent to be given notices and other documents in connection with our dealings with you electronically (including by email to your address provided). By consenting, you warrant that you have an ability to save and print the documents, and you understand that: (a) paper documents may no longer be given; and (b) electronic communications must be regularly checked for documents; and (c) consent to the giving of documents by electronic communication may be withdrawn at any time."

---
## 7. consentBiometric — data-fs-id 125695752
Heading (also the value):
Checkbox value:
"I acknowledge and consent to the collection and use of my biometric information by you or your agent for authentication/ verification purposes and that my biometric information will be collected and stored in accordance with your Privacy and Credit Reporting Policy and your obligations under Privacy Act 1988 and Privacy Principles and any other applicable law. I understand that this information will not be used or disclosed for any other purpose."
