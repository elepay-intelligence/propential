/* ============================================================
   PROPENTIAL APPLY — form schema (SINGLE SOURCE OF TRUTH)
   ------------------------------------------------------------
   Every field's name/id (v), Formstack id (fs), control type (t),
   options (o), required flag and conditional visibility (show)
   live here. apply.js renders, validates and persists from this;
   the backend-handover .md is generated from this too — so the
   design, validation and handoff can never drift apart.

   Condition objects (a field is visible iff ALL conditions pass):
     {f:'var', eq:'X'}        parent equals X
     {f:'var', in:['A','B']}  parent is one of
     {f:'var', notIn:[...]}   parent is none of
     {f:'var', on:true}       parent checkbox is checked
   ============================================================ */
(function () {
  var EX = ['Unemployed', 'Retired', 'Stay-at-home partner']; // hide employment detail for these
  var EMP = ['Full time', 'Part time', 'Casual/Temp', 'Contractor']; // standard employee types (not self-employed)
  var UNDER2 = ['Between 1 and 2 years', 'Between 3 and 12 months', 'Less than 3 months'];
  var NOYES = ['No', 'Yes'];
  var PCT = ['From 0% - 19%', 'From 20% - 49%', '50% or more'];
  var FREQ = ['Weekly', 'Fortnightly', 'Monthly'];
  var TENURE4 = ['2 years or more', 'Between 1 and 2 years', 'Between 3 and 12 months', 'Less than 3 months'];

  // ---- one repeat "Add another …" toggle ----
  function toggle(v, fs, label) { return { t: 'toggle', v: v, fs: fs, l: label, value: label }; }

  // ---------------- STEPS ----------------
  var steps = [
    {
      key: 'loan', title: 'Purpose', eyebrow: 'Step 1',
      blurb: 'Tell us what you have in mind and how you’d like to pay it back.',
      fields: [
        { t: 'radio', v: 'purpose', fs: '119531975', l: 'What is the purpose of the funds you would like to borrow?', o: ['Home renovation', 'Investment property renovation'], req: true },
        { t: 'multi', v: 'project', fs: '119531976', l: "What's the project?", o: ['Kitchen', 'Bathroom', 'Pool', 'Interiors', 'Fencing', 'Landscaping', 'Roofing', 'Other'], hint: 'Select all that apply.' },
        { t: 'money', v: 'amount', fs: '119531977', l: "Amount you'd like to borrow $", req: true, min: 5000, max: 175000, def: 25000, ph: '25,000', half: true, hint: '$5,000 – $175,000.' },
        { t: 'select', v: 'term', fs: '122580887', l: 'Preferred term', o: '@TERMS', dynamicTerm: true, req: true, half: true, hint: '1–7 years up to $50k; up to 10 years above $50k.' }
      ]
    },
    {
      key: 'details', title: 'Your details', eyebrow: 'Step 2',
      blurb: 'The basics about you, the primary applicant.',
      fields: [
        { t: 'select', v: 'title', fs: '119531978', l: 'Title', o: ['Ms.', 'Mrs.', 'Mr.', 'Dr.', 'Prefer not to say'], req: true, w: 3 },
        { t: 'text', v: 'firstName', fs: '119531979', l: 'First name', req: true, w: 3, ac: 'given-name', ph: 'e.g. Jordan' },
        { t: 'text', v: 'middleName', fs: '119531980', l: 'Middle name', w: 3, ac: 'additional-name', ph: 'e.g. Alex' },
        { t: 'text', v: 'lastName', fs: '119531981', l: 'Last name', req: true, w: 3, ac: 'family-name', ph: 'e.g. Smith' },
        { t: 'date', v: 'dob', fs: '119532165', l: 'Date of birth', req: true, kind: 'dobAdult', w: 4, hint: 'You must be 18 or older.' },
        { t: 'email', v: 'email', fs: '119531982', l: 'Email', req: true, kind: 'email', w: 4, ac: 'email', ph: 'you@example.com', hint: 'We will use this for all official communication with you.' },
        { t: 'tel', v: 'phone', fs: '119531983', l: 'Mobile', req: true, kind: 'auMobile', w: 4, ac: 'tel', ph: '04xx xxx xxx', hint: 'We’ll send you important notifications via SMS.' },
        { t: 'radio', v: 'joint', fs: '119531988', l: 'Is this a joint application?', o: NOYES, req: true, hint: 'The co-borrower must derive substantial benefit from the use of the loan funds. In most cases, the co-borrower will be your spouse or de facto partner, living with you at the property and/or being co-owner of the property.' },
        { t: 'text', v: 'jointName', fs: '119531989', l: "What's their name?", req: true, show: [{ f: 'joint', eq: 'Yes' }], ph: 'Their full name', hint: 'Enter their full name here.' },
        { t: 'email', v: 'jointEmail', fs: '119531990', l: 'Enter their email', req: true, kind: 'email', ph: 'their@email.com', show: [{ f: 'joint', eq: 'Yes' }], hint: "You are required to insert their email to complete the application. We'll send them an email with a link to complete the application once you submit this form. If your co-applicant has already completed an application please insert their email address so we can attach your application to theirs as a joint application." },
        // Optional. fs stays '' until the "Referral Code" field exists on form
        // 4653616 — the backend owns the real id (FIELD_IDS.referral).
        { t: 'text', v: 'referral', fs: '', l: 'Referral Code', half: true, ac: 'off', ph: 'e.g. STYLIST-042' }
      ]
    },
    {
      key: 'employment', title: 'Employment', eyebrow: 'Step 3',
      blurb: 'How you earn your income.',
      fields: [
        { t: 'radio', v: 'employment', fs: '119531993', l: 'Employment status', o: ['Full time', 'Part time', 'Casual/Temp', 'Contractor', 'Self-employed', 'Stay-at-home partner', 'Retired', 'Unemployed'], req: true },
        { t: 'subhead', label: 'Provide more detail about your employment status', show: [{ f: 'employment', notIn: EX }] },
        { t: 'select', v: 'industry', fs: '119531995', l: 'Industry sector related to your main employment', o: '@INDUSTRIES', req: true, half: true, show: [{ f: 'employment', notIn: EX }] },
        { t: 'typeahead', v: 'jobTitle', fs: '119531997', l: 'Job title', match: 'JOB_TITLES', req: true, half: true, show: [{ f: 'employment', notIn: EX }], hint: 'Start typing and pick from the list.' },
        { t: 'radio', v: 'jobTenure', fs: '119531998', l: 'How long have you worked here?', o: TENURE4, req: true, show: [{ f: 'employment', in: EMP }] },
        { t: 'text', v: 'employerName', fs: '119531999', l: 'Employer business name', req: true, show: [{ f: 'employment', in: EMP }], ph: 'e.g. Acme Pty Ltd' },
        { t: 'typeahead', v: 'prevJobTitle', fs: '119532001', l: 'Previous employment job title', match: 'JOB_TITLES', req: true, half: true, show: [{ f: 'employment', in: EMP }, { f: 'jobTenure', in: UNDER2 }] },
        { t: 'text', v: 'prevEmployerName', fs: '119532002', l: 'Previous employer business name', req: true, half: true, show: [{ f: 'employment', in: EMP }, { f: 'jobTenure', in: UNDER2 }], ph: 'e.g. Previous Co Pty Ltd' },
        { t: 'radio', v: 'selfEmployedTenure', fs: '119532004', l: 'How long have you been self employed?', o: TENURE4, req: true, show: [{ f: 'employment', eq: 'Self-employed' }] },
        { t: 'text', v: 'businessName', fs: '119532005', l: 'Business name', req: true, half: true, show: [{ f: 'employment', eq: 'Self-employed' }], ph: 'e.g. Acme Pty Ltd' },
        { t: 'text', v: 'businessAbn', fs: '119532006', l: 'Business ABN', req: true, digits: 11, half: true, show: [{ f: 'employment', eq: 'Self-employed' }], ph: 'e.g. 12345678901', hint: '11 digits.' }
      ]
    },
    {
      key: 'home', title: 'Home address', eyebrow: 'Step 4',
      blurb: 'Where you live and your living situation.',
      fields: [
        { t: 'address', v: 'resAddress', fs: '119532010', l: 'Home address', req: true },
        { t: 'radio', v: 'addressTenure', fs: '119532012', l: 'How long have you lived at this address?', o: ['2 years or longer', 'Less than 2 years'], req: true },
        { t: 'address', v: 'prevAddress', fs: '119532014', l: 'Previous address', req: true, show: [{ f: 'addressTenure', eq: 'Less than 2 years' }] },
        { t: 'radio', v: 'ownership', fs: '119532015', l: 'What is your home ownership status?', o: ['Renting', 'I own it - paying off mortgage', 'I own it - mortgage already paid', 'Not paying rent- living with family', 'Other'], req: true },
        { t: 'text', v: 'ownershipOther', fs: '119532016', l: 'Explain your home ownership status', req: true, show: [{ f: 'ownership', eq: 'Other' }], ph: 'Tell us a bit more about your situation' },
        { t: 'money', v: 'homeValue', fs: '119532017', l: 'What is the estimated value of your home?', req: true, half: true },
        { t: 'money', v: 'mortBalance', fs: '119532060', l: 'What is the amount owing on your mortgage?', req: true, half: true },
        { t: 'radio', v: 'relationship', fs: '119532018', l: 'Relationship status', o: ['Single', 'De facto', 'Married', 'Divorced or separated', 'Widowed'], req: true }
      ]
    },
    {
      key: 'property', title: 'Your property', eyebrow: 'Step 5',
      blurb: 'The property these funds are for.',
      fields: [
        { t: 'radio', v: 'renoIsHome', fs: '119532011', l: 'Is your home address the property these funds are for?', o: NOYES, req: true },
        { t: 'address', v: 'propAddress', fs: '119533819', l: 'What is the address of the property?', req: true, show: [{ f: 'renoIsHome', eq: 'No' }], note: 'Only needed if it’s not your home address. Otherwise we’ll use the address you entered earlier.' },
        { t: 'radio', v: 'onTitle', fs: '119534299', l: 'Are you on title of the property these funds are for?', o: NOYES, req: true, hint: 'Borrowers are required to be on title of the property.' },
        { t: 'text', v: 'titleOwner', fs: '119534366', l: 'Please explain who owns the property (i.e. who is on title)', req: true, show: [{ f: 'onTitle', eq: 'No' }], ph: 'e.g. the property is owned by my parents' },
        { t: 'money', v: 'propRentalIncome', fs: '119534508', l: 'What is your monthly rental income from this property?', req: true, half: true, hint: 'Enter 0 if none.' },
        { t: 'radio', v: 'propHasLoan', fs: '119535325', l: 'Do you have a loan (mortgage) on the property?', o: NOYES, req: true },
        { t: 'money', v: 'propLoanOwing', fs: '119535527', l: 'Amount owing on the loan', req: true, half: true, show: [{ f: 'propHasLoan', eq: 'Yes' }] },
        { t: 'money', v: 'propLoanRepayment', fs: '119535791', l: 'Monthly loan repayments', req: true, half: true, show: [{ f: 'propHasLoan', eq: 'Yes' }] },
        { t: 'money', v: 'propValue', fs: '119633192', l: 'Estimated value of this property', req: true, half: true }
      ]
    },
    {
      key: 'income', title: 'Income', eyebrow: 'Step 6',
      blurb: 'Your salary and any other income.',
      fields: [
        { t: 'money', v: 'income', fs: '119532022', l: 'What is your gross annual salary (before tax or super)?', req: true, min: 25000, hint: 'Check your payslip or employment contract if you’re unsure. Don’t include commissions, super or bonuses, just your fixed base salary. Minimum gross annual salary is $25,000.' },
        { t: 'radio', v: 'payFrequency', fs: '119532023', l: 'How often do you get paid?', o: FREQ, req: true },
        { t: 'radio', v: 'centrelink', fs: '119532024', l: 'Do you receive a payment from Centrelink?', o: NOYES, req: true, hint: 'Including Age Pension, Disability Support Pension and Family Tax Benefit, or any other Centrelink payment.' },
        // Centrelink repeat block
        { t: 'group', label: 'Centrelink payment 1', show: [{ f: 'centrelink', eq: 'Yes' }], fields: [
          { t: 'select', v: 'cl1Type', fs: '119532026', l: 'Centrelink payment 1 type', o: '@CL_TYPES', req: true, half: true, show: [{ f: 'centrelink', eq: 'Yes' }] },
          { t: 'money', v: 'cl1Amount', fs: '119532027', l: 'Centrelink payment 1 fortnightly amount', req: true, half: true, show: [{ f: 'centrelink', eq: 'Yes' }] }
        ] },
        toggleC('addCl2', '119532028', 'Add another Centrelink payment', [{ f: 'centrelink', eq: 'Yes' }]),
        { t: 'group', label: 'Centrelink payment 2', show: [{ f: 'centrelink', eq: 'Yes' }, { f: 'addCl2', on: true }], fields: [
          { t: 'select', v: 'cl2Type', fs: '119532030', l: 'Centrelink payment 2 type', o: '@CL_TYPES', req: true, half: true, show: [{ f: 'centrelink', eq: 'Yes' }, { f: 'addCl2', on: true }] },
          { t: 'money', v: 'cl2Amount', fs: '119532031', l: 'Centrelink payment 2 fortnightly amount', req: true, half: true, show: [{ f: 'centrelink', eq: 'Yes' }, { f: 'addCl2', on: true }] }
        ] },
        toggleC('addCl3', '119532032', 'Add another Centrelink payment', [{ f: 'centrelink', eq: 'Yes' }, { f: 'addCl2', on: true }]),
        { t: 'group', label: 'Centrelink payment 3', show: [{ f: 'addCl3', on: true }], fields: [
          { t: 'select', v: 'cl3Type', fs: '119532034', l: 'Centrelink payment 3 type', o: '@CL_TYPES', req: true, half: true, show: [{ f: 'addCl3', on: true }] },
          { t: 'money', v: 'cl3Amount', fs: '119532035', l: 'Centrelink payment 3 fortnightly amount', req: true, half: true, show: [{ f: 'addCl3', on: true }] }
        ] },
        { t: 'radio', v: 'otherIncome', fs: '119532037', l: 'Do you have any other source of income?', o: NOYES, req: true, hint: 'Like bonuses, commission, interest, dividends or a second job. Don’t include rental income from investment property; that’s asked for separately.' },
        { t: 'group', label: 'Income source 1', show: [{ f: 'otherIncome', eq: 'Yes' }], fields: [
          { t: 'select', v: 'src1Type', fs: '119532039', l: 'Source 1 type', o: '@SRC_TYPES', req: true, half: true, show: [{ f: 'otherIncome', eq: 'Yes' }] },
          { t: 'money', v: 'src1Amount', fs: '119532040', l: 'Source 1 monthly amount', req: true, half: true, show: [{ f: 'otherIncome', eq: 'Yes' }] }
        ] },
        toggleC('addSrc2', '119532041', 'Add another source of income', [{ f: 'otherIncome', eq: 'Yes' }]),
        { t: 'group', label: 'Income source 2', show: [{ f: 'otherIncome', eq: 'Yes' }, { f: 'addSrc2', on: true }], fields: [
          { t: 'select', v: 'src2Type', fs: '119532043', l: 'Source 2 type', o: '@SRC_TYPES', req: true, half: true, show: [{ f: 'otherIncome', eq: 'Yes' }, { f: 'addSrc2', on: true }] },
          { t: 'money', v: 'src2Amount', fs: '119532044', l: 'Source 2 monthly amount', req: true, half: true, show: [{ f: 'otherIncome', eq: 'Yes' }, { f: 'addSrc2', on: true }] }
        ] },
        toggleC('addSrc3', '119532045', 'Add another source of income', [{ f: 'otherIncome', eq: 'Yes' }, { f: 'addSrc2', on: true }]),
        { t: 'group', label: 'Income source 3', show: [{ f: 'addSrc3', on: true }], fields: [
          { t: 'select', v: 'src3Type', fs: '119532047', l: 'Source 3 type', o: '@SRC_TYPES', req: true, half: true, show: [{ f: 'addSrc3', on: true }] },
          { t: 'money', v: 'src3Amount', fs: '119532048', l: 'Source 3 monthly amount', req: true, half: true, show: [{ f: 'addSrc3', on: true }] }
        ] }
      ]
    },
    {
      key: 'expenses', title: 'Expenses & commitments', eyebrow: 'Step 7',
      blurb: 'Your household spending and rent or mortgage. This is only about the home you live in, not investment properties.',
      fields: [
        { t: 'money', v: 'generalExpenses', fs: '119532050', l: 'General household monthly living expenses', req: true, half: true },
        { t: 'money', v: 'expenses', fs: '119532052', l: 'Total household monthly living expenses', req: true, half: true, gte: 'generalExpenses' },
        { t: 'radio', v: 'spouseExpensePct', fs: '119532053', l: '% of total expenses your spouse/partner pays each month', o: PCT, req: true },
        { t: 'radio', v: 'rentFrequency', fs: '119532056', l: 'How often do you pay rent or mortgage on your home?', o: FREQ, req: true },
        { t: 'money', v: 'rentAmount', fs: '119532057', l: 'How much rent or mortgage do you pay each time? Include your partner or spouse contribution (if any).', req: true },
        { t: 'radio', v: 'spouseRentPct', fs: '119532058', l: '% of rent/mortgage your spouse/partner pays each time', o: PCT },
        { t: 'radio', v: 'adverseChange', fs: '119532062', l: 'Do you expect any significant change to your financial situation over the next 6 to 12 months that would ADVERSELY impact your ability to meet loan repayments?', o: NOYES, req: true }
      ]
    },
    {
      key: 'assets', title: 'Assets & liabilities', eyebrow: 'Step 8',
      blurb: 'Other property, assets, credit cards and debts.',
      sections: ['Investment property', 'Non-property assets', 'Credit cards', 'Other debt'],
      fields: [
        { t: 'subhead', label: 'Investment property' },
        { t: 'radio', v: 'investmentProperty', fs: '119532064', l: 'Do you own any other investment property?', o: NOYES, req: true, hint: 'Other than the property these funds are for or the home you live in.' },
        { t: 'group', label: 'Investment property 1', show: [{ f: 'investmentProperty', eq: 'Yes' }], fields: [
          { t: 'money', v: 'ip1Rental', fs: '119532066', l: 'Property 1: monthly rental income', req: true, half: true, show: [{ f: 'investmentProperty', eq: 'Yes' }] },
          { t: 'radio', v: 'ip1HasMortgage', fs: '119532067', l: 'Property 1: making mortgage repayments?', o: NOYES, show: [{ f: 'investmentProperty', eq: 'Yes' }] },
          { t: 'money', v: 'ip1Repayment', fs: '119532068', l: 'Property 1: monthly mortgage repayment', req: true, half: true, show: [{ f: 'investmentProperty', eq: 'Yes' }, { f: 'ip1HasMortgage', eq: 'Yes' }] },
          { t: 'money', v: 'ip1Owing', fs: '119532069', l: 'Property 1: amount owing on mortgage', req: true, half: true, show: [{ f: 'investmentProperty', eq: 'Yes' }, { f: 'ip1HasMortgage', eq: 'Yes' }] },
          { t: 'money', v: 'ip1Value', fs: '119532070', l: 'Property 1: estimated value', req: true, half: true, show: [{ f: 'investmentProperty', eq: 'Yes' }] }
        ] },
        toggleC('addIp2', '119532074', 'Add another property', [{ f: 'investmentProperty', eq: 'Yes' }]),
        { t: 'group', label: 'Investment property 2', show: [{ f: 'addIp2', on: true }], fields: [
          { t: 'money', v: 'ip2Rental', fs: '119532076', l: 'Property 2: monthly rental income', req: true, half: true, show: [{ f: 'addIp2', on: true }] },
          { t: 'radio', v: 'ip2HasMortgage', fs: '119532077', l: 'Property 2: making mortgage repayments?', o: NOYES, show: [{ f: 'addIp2', on: true }] },
          { t: 'money', v: 'ip2Repayment', fs: '119532078', l: 'Property 2: monthly mortgage repayment', req: true, half: true, show: [{ f: 'addIp2', on: true }, { f: 'ip2HasMortgage', eq: 'Yes' }] },
          { t: 'money', v: 'ip2Owing', fs: '119532079', l: 'Property 2: amount owing', req: true, half: true, show: [{ f: 'addIp2', on: true }, { f: 'ip2HasMortgage', eq: 'Yes' }] },
          { t: 'money', v: 'ip2Value', fs: '119532080', l: 'Property 2: estimated value', req: true, half: true, show: [{ f: 'addIp2', on: true }] }
        ] },
        toggleC('addIp3', '119532084', 'Add another property', [{ f: 'addIp2', on: true }]),
        { t: 'group', label: 'Investment property 3', show: [{ f: 'addIp3', on: true }], fields: [
          { t: 'money', v: 'ip3Rental', fs: '119532086', l: 'Property 3: monthly rental income', req: true, half: true, show: [{ f: 'addIp3', on: true }] },
          { t: 'radio', v: 'ip3HasMortgage', fs: '119532087', l: 'Property 3: making mortgage repayments?', o: NOYES, show: [{ f: 'addIp3', on: true }] },
          { t: 'money', v: 'ip3Repayment', fs: '119532088', l: 'Property 3: monthly mortgage repayment', req: true, half: true, show: [{ f: 'addIp3', on: true }, { f: 'ip3HasMortgage', eq: 'Yes' }] },
          { t: 'money', v: 'ip3Owing', fs: '119532089', l: 'Property 3: amount owing', req: true, half: true, show: [{ f: 'addIp3', on: true }, { f: 'ip3HasMortgage', eq: 'Yes' }] },
          { t: 'money', v: 'ip3Value', fs: '119532090', l: 'Property 3: estimated value', req: true, half: true, show: [{ f: 'addIp3', on: true }] }
        ] },

        { t: 'subhead', label: 'Non-property assets' },
        { t: 'radio', v: 'otherAssets', fs: '119532095', l: 'Do you own any other non-property assets?', o: NOYES, req: true, hint: 'Like a car, shares or any other major items.' },
        { t: 'group', label: 'Asset 1', show: [{ f: 'otherAssets', eq: 'Yes' }], fields: [
          { t: 'select', v: 'asset1Type', fs: '119532097', l: 'Asset 1: type', o: '@ASSET_TYPES', req: true, half: true, show: [{ f: 'otherAssets', eq: 'Yes' }] },
          { t: 'money', v: 'asset1Value', fs: '119532098', l: 'Asset 1: estimated value', req: true, half: true, show: [{ f: 'otherAssets', eq: 'Yes' }] }
        ] },
        toggleC('addAsset2', '119532099', 'Add other asset', [{ f: 'otherAssets', eq: 'Yes' }]),
        { t: 'group', label: 'Asset 2', show: [{ f: 'addAsset2', on: true }], fields: [
          { t: 'select', v: 'asset2Type', fs: '119532101', l: 'Asset 2: type', o: '@ASSET_TYPES', req: true, half: true, show: [{ f: 'addAsset2', on: true }] },
          { t: 'money', v: 'asset2Value', fs: '119532102', l: 'Asset 2: estimated value', req: true, half: true, show: [{ f: 'addAsset2', on: true }] }
        ] },
        toggleC('addAsset3', '119532103', 'Add other asset', [{ f: 'addAsset2', on: true }]),
        { t: 'group', label: 'Asset 3', show: [{ f: 'addAsset3', on: true }], fields: [
          { t: 'select', v: 'asset3Type', fs: '119532105', l: 'Asset 3: type', o: '@ASSET_TYPES', req: true, half: true, show: [{ f: 'addAsset3', on: true }] },
          { t: 'money', v: 'asset3Value', fs: '119532106', l: 'Asset 3: estimated value', req: true, half: true, show: [{ f: 'addAsset3', on: true }] }
        ] },
        toggleC('addAsset4', '119532107', 'Add other asset', [{ f: 'addAsset3', on: true }]),
        { t: 'group', label: 'Asset 4', show: [{ f: 'addAsset4', on: true }], fields: [
          { t: 'select', v: 'asset4Type', fs: '119532109', l: 'Asset 4: type', o: '@ASSET_TYPES', req: true, half: true, show: [{ f: 'addAsset4', on: true }] },
          { t: 'money', v: 'asset4Value', fs: '119532110', l: 'Asset 4: estimated value', req: true, half: true, show: [{ f: 'addAsset4', on: true }] }
        ] },

        { t: 'subhead', label: 'Credit cards' },
        { t: 'radio', v: 'creditCards', fs: '119532112', l: 'Do you have credit cards?', o: NOYES, req: true, hint: 'Please include storecards e.g. MYER, DJs, Gem Visa, GO MasterCard.' },
        { t: 'group', label: 'Credit card 1', show: [{ f: 'creditCards', eq: 'Yes' }], fields: [
          { t: 'select', v: 'card1Provider', fs: '119532114', l: 'Card 1: provider', o: '@CARD_PROVIDERS', half: true, show: [{ f: 'creditCards', eq: 'Yes' }] },
          { t: 'money', v: 'card1Limit', fs: '119532115', l: 'Card 1: credit limit', req: true, half: true, show: [{ f: 'creditCards', eq: 'Yes' }] },
          { t: 'money', v: 'card1Owing', fs: '119532116', l: 'Card 1: amount owing', req: true, half: true, show: [{ f: 'creditCards', eq: 'Yes' }] }
        ] },
        toggleC('addCard2', '119532117', 'Add another credit card', [{ f: 'creditCards', eq: 'Yes' }]),
        { t: 'group', label: 'Credit card 2', show: [{ f: 'addCard2', on: true }], fields: [
          { t: 'select', v: 'card2Provider', fs: '119532119', l: 'Card 2: provider', o: '@CARD_PROVIDERS', half: true, show: [{ f: 'addCard2', on: true }] },
          { t: 'money', v: 'card2Limit', fs: '119532120', l: 'Card 2: credit limit', req: true, half: true, show: [{ f: 'addCard2', on: true }] },
          { t: 'money', v: 'card2Owing', fs: '119532121', l: 'Card 2: amount owing', req: true, half: true, show: [{ f: 'addCard2', on: true }] }
        ] },
        toggleC('addCard3', '119532122', 'Add another credit card', [{ f: 'addCard2', on: true }]),
        { t: 'group', label: 'Credit card 3', show: [{ f: 'addCard3', on: true }], fields: [
          { t: 'select', v: 'card3Provider', fs: '119532124', l: 'Card 3: provider', o: '@CARD_PROVIDERS', half: true, show: [{ f: 'addCard3', on: true }] },
          { t: 'money', v: 'card3Limit', fs: '119532125', l: 'Card 3: credit limit', req: true, half: true, show: [{ f: 'addCard3', on: true }] },
          { t: 'money', v: 'card3Owing', fs: '119532126', l: 'Card 3: amount owing', req: true, half: true, show: [{ f: 'addCard3', on: true }] }
        ] },
        toggleC('addCard4', '119532127', 'Add another credit card', [{ f: 'addCard3', on: true }]),
        { t: 'group', label: 'Credit card 4', show: [{ f: 'addCard4', on: true }], fields: [
          { t: 'select', v: 'card4Provider', fs: '119532129', l: 'Card 4: provider', o: '@CARD_PROVIDERS', half: true, show: [{ f: 'addCard4', on: true }] },
          { t: 'money', v: 'card4Limit', fs: '119532130', l: 'Card 4: credit limit', req: true, half: true, show: [{ f: 'addCard4', on: true }] },
          { t: 'money', v: 'card4Owing', fs: '119532131', l: 'Card 4: amount owing', req: true, half: true, show: [{ f: 'addCard4', on: true }] }
        ] },
        toggleC('addCard5', '119532132', 'Add another credit card', [{ f: 'addCard4', on: true }]),
        { t: 'group', label: 'Credit card 5', show: [{ f: 'addCard5', on: true }], fields: [
          { t: 'select', v: 'card5Provider', fs: '119532134', l: 'Card 5: provider', o: '@CARD_PROVIDERS', half: true, show: [{ f: 'addCard5', on: true }] },
          { t: 'money', v: 'card5Limit', fs: '119532135', l: 'Card 5: credit limit', req: true, half: true, show: [{ f: 'addCard5', on: true }] },
          { t: 'money', v: 'card5Owing', fs: '119532136', l: 'Card 5: amount owing', req: true, half: true, show: [{ f: 'addCard5', on: true }] }
        ] },

        { t: 'subhead', label: 'Other debt' },
        { t: 'radio', v: 'otherDebt', fs: '119532138', l: 'Do you have any other debt?', o: NOYES, req: true, hint: 'Like unpaid overdrafts, car loans, personal loans, etc.' },
        { t: 'group', label: 'Debt 1', show: [{ f: 'otherDebt', eq: 'Yes' }], fields: [
          { t: 'select', v: 'debt1Type', fs: '119532140', l: 'Debt 1: type', o: '@DEBT_TYPES', req: true, half: true, show: [{ f: 'otherDebt', eq: 'Yes' }] },
          { t: 'money', v: 'debt1Owing', fs: '119532141', l: 'Debt 1: amount still owing', req: true, half: true, show: [{ f: 'otherDebt', eq: 'Yes' }] },
          { t: 'money', v: 'debt1Repayment', fs: '119532142', l: 'Debt 1: monthly repayment', req: true, half: true, show: [{ f: 'otherDebt', eq: 'Yes' }] }
        ] },
        toggleC('addDebt2', '119532143', 'Add another debt', [{ f: 'otherDebt', eq: 'Yes' }]),
        { t: 'group', label: 'Debt 2', show: [{ f: 'addDebt2', on: true }], fields: [
          { t: 'select', v: 'debt2Type', fs: '119532145', l: 'Debt 2: type', o: '@DEBT_TYPES', req: true, half: true, show: [{ f: 'addDebt2', on: true }] },
          { t: 'money', v: 'debt2Owing', fs: '119532146', l: 'Debt 2: amount owing', req: true, half: true, show: [{ f: 'addDebt2', on: true }] },
          { t: 'money', v: 'debt2Repayment', fs: '119532147', l: 'Debt 2: monthly repayment', req: true, half: true, show: [{ f: 'addDebt2', on: true }] }
        ] },
        toggleC('addDebt3', '119532148', 'Add another debt', [{ f: 'addDebt2', on: true }]),
        { t: 'group', label: 'Debt 3', show: [{ f: 'addDebt3', on: true }], fields: [
          { t: 'select', v: 'debt3Type', fs: '119532150', l: 'Debt 3: type', o: '@DEBT_TYPES', req: true, half: true, show: [{ f: 'addDebt3', on: true }] },
          { t: 'money', v: 'debt3Owing', fs: '119532151', l: 'Debt 3: amount owing', req: true, half: true, show: [{ f: 'addDebt3', on: true }] },
          { t: 'money', v: 'debt3Repayment', fs: '119532152', l: 'Debt 3: monthly repayment', req: true, half: true, show: [{ f: 'addDebt3', on: true }] }
        ] },
        toggleC('addDebt4', '119532153', 'Add another debt', [{ f: 'addDebt3', on: true }]),
        { t: 'group', label: 'Debt 4', show: [{ f: 'addDebt4', on: true }], fields: [
          { t: 'select', v: 'debt4Type', fs: '119532155', l: 'Debt 4: type', o: '@DEBT_TYPES', req: true, half: true, show: [{ f: 'addDebt4', on: true }] },
          { t: 'money', v: 'debt4Owing', fs: '119532156', l: 'Debt 4: amount owing', req: true, half: true, show: [{ f: 'addDebt4', on: true }] },
          { t: 'money', v: 'debt4Repayment', fs: '119532157', l: 'Debt 4: monthly repayment', req: true, half: true, show: [{ f: 'addDebt4', on: true }] }
        ] },
        toggleC('addDebt5', '119532158', 'Add another debt', [{ f: 'addDebt4', on: true }]),
        { t: 'group', label: 'Debt 5', show: [{ f: 'addDebt5', on: true }], fields: [
          { t: 'select', v: 'debt5Type', fs: '119532160', l: 'Debt 5: type', o: '@DEBT_TYPES', req: true, half: true, show: [{ f: 'addDebt5', on: true }] },
          { t: 'money', v: 'debt5Owing', fs: '119532161', l: 'Debt 5: amount owing', req: true, half: true, show: [{ f: 'addDebt5', on: true }] },
          { t: 'money', v: 'debt5Repayment', fs: '119532162', l: 'Debt 5: monthly repayment', req: true, half: true, show: [{ f: 'addDebt5', on: true }] }
        ] }
      ]
    },
    {
      key: 'identity', title: 'Identity & verification', eyebrow: 'Step 9',
      blurb: 'Identity documents and dependants.',
      fields: [
        { t: 'radio', v: 'hasLicense', fs: '119532166', l: "Do you have an Australian driver's license?", o: NOYES, req: true },
        { t: 'radio', v: 'idIssuedState', fs: '119532167', l: "Driver's license state", o: '@STATES', req: true, show: [{ f: 'hasLicense', eq: 'Yes' }] },
        { t: 'text', v: 'idNumber', fs: '119532168', l: "Driver's license number", req: true, half: true, show: [{ f: 'hasLicense', eq: 'Yes' }], ph: 'e.g. 12 345 678' },
        { t: 'num', v: 'medicareNumber', fs: '119532169', l: 'Medicare card number', req: true, digitsRange: [10, 11], half: true, ph: 'e.g. 1234567890', hint: '10–11 digits.' },
        { t: 'radio', v: 'medicareColour', fs: '119532171', l: 'What colour is your Medicare card?', o: ['Green', 'Blue', 'Yellow'], req: true },
        { t: 'date', v: 'medicareExpiry', fs: '119532172', l: 'Medicare card expiry (valid to) date', req: true, kind: 'futureDate', half: true },
        { t: 'radio', v: 'dependants', fs: '119532173', l: 'How many dependants do you have?', o: ['0', '1', '2', '3', '4 or more'], req: true },
        { t: 'num', v: 'dep1Age', fs: '119532175', l: 'Dependant 1: age', req: true, half: true, show: [{ f: 'dependants', in: ['1', '2', '3', '4 or more'] }], ph: 'Age in years' },
        { t: 'num', v: 'dep2Age', fs: '119532176', l: 'Dependant 2: age', req: true, half: true, show: [{ f: 'dependants', in: ['2', '3', '4 or more'] }], ph: 'Age in years' },
        { t: 'num', v: 'dep3Age', fs: '119532177', l: 'Dependant 3: age', req: true, half: true, show: [{ f: 'dependants', in: ['3', '4 or more'] }], ph: 'Age in years' },
        { t: 'num', v: 'dep4Age', fs: '119532178', l: 'Dependant 4: age', req: true, half: true, show: [{ f: 'dependants', in: ['4 or more'] }], ph: 'Age in years' }
      ]
    },
    {
      key: 'consents', title: 'Declarations & consents', eyebrow: 'Step 10',
      blurb: 'Please read and confirm each declaration to submit your application.',
      fields: [
        { t: 'consent', v: 'consentPrivacy', fs: '119531985' },
        { t: 'consent', v: 'consentConfirm', fs: '142285711' },
        { t: 'consent', v: 'consentCitizen', fs: '119532181' },
        { t: 'consent', v: 'consentAccuracy', fs: '119532182' },
        { t: 'consent', v: 'consentCredit', fs: '119532183' },
        { t: 'consent', v: 'consentElectronic', fs: '119532184' },
        { t: 'consent', v: 'consentBiometric', fs: '125695752' }
      ]
    }
  ];

  // helper used above (defined here because it's referenced before declaration is fine via hoisting of function declarations)
  function toggleC(v, fs, label, show) { return { t: 'toggle', v: v, fs: fs, l: label, value: label, show: show }; }

  // ---------------- CONSENTS (verbatim — file 03) ----------------
  // value = EXACT string the backend matches (keeps "RenoNow").
  // The visible paragraph swaps RenoNow→Propential at render time per brand.
  var consents = {
    consentPrivacy: {
      heading: 'You must review and agree to our Privacy & Credit Reporting Policy and Credit Guide before proceeding.',
      display: 'By submitting this application you agree that MediPay Holdings Pty Limited (trading as Propential) may collect, use and disclose your personal and credit information to assess your application, verify your identity and manage your loan, as described in our Privacy & Credit Reporting Policy and Credit Guide. This may include obtaining a credit report. This application is not a quote or approval and is subject to credit assessment.',
      value: 'Privacy Consent: By checking this box, I confirm that I have accessed RenoNow’s Privacy Policy and Credit Reporting Policy by clicking on the link shown above and reviewed, understand and consent to RenoNow, its related bodies corporate, affiliates and agents, and other nominated entities collecting, using, holding and disclosing personal information and credit-related information about me as set out in the privacy policy. If you do not consent, we may not be able to proceed with your application.'
    },
    consentConfirm: {
      heading: 'I confirm that:',
      bullets: [
        'The property being renovated is located in Australia',
        'Improvements being done are for residential dwellings (not commercial purposes)',
        'The property is not vacant land',
        'The property is substantially free of material damage and from material contamination by toxic or hazardous substances.'
      ],
      value: 'I confirm that:'
    },
    consentCitizen: {
      heading: 'Are you an Australian citizen or permanent resident?',
      value: 'Yes'
    },
    consentAccuracy: {
      heading: 'Do you declare all the information that you have provided in this application to be true and correct?',
      value: 'Yes, I declare all information that I have provided in this application is true and correct.'
    },
    consentCredit: {
      heading: 'Do you give us consent to check your credit history and verify your identity?',
      value: 'Yes, I give RenoNow consent to give my personal and credit information to credit reporting agencies, including Equifax, for the purpose of obtaining a consumer and commercial credit eligibility report about me to assess my creditworthiness, and to otherwise deal with any information I provide in accordance with your Privacy Policy and Credit Reporting Policy. I understand that obtaining of the credit eligibility report may impact my credit score. I also consent to my personal details being checked with the document issuer or official record holder (e.g. Government agency) via a third party (e.g. an identity checking service) for RenoNow to verify my identity.'
    },
    consentElectronic: {
      heading: 'Do you give us consent to send you notices and documents electronically and signing documents electronically?',
      value: 'You consent to be given notices and other documents in connection with our dealings with you electronically (including by email to your address provided). By consenting, you warrant that you have an ability to save and print the documents, and you understand that: (a) paper documents may no longer be given; and (b) electronic communications must be regularly checked for documents; and (c) consent to the giving of documents by electronic communication may be withdrawn at any time.'
    },
    consentBiometric: {
      heading: 'Biometric information',
      value: 'I acknowledge and consent to the collection and use of my biometric information by you or your agent for authentication/ verification purposes and that my biometric information will be collected and stored in accordance with your Privacy and Credit Reporting Policy and your obligations under Privacy Act 1988 and Privacy Principles and any other applicable law. I understand that this information will not be used or disclosed for any other purpose.'
    }
  };

  // ---------------- HIDDEN TRACKING ----------------
  var tracking = [
    { v: 'utmSource', fs: '119532186', param: 'utm_source' },
    { v: 'utmMedium', fs: '119532187', param: 'utm_medium' },
    { v: 'utmContent', fs: '119532188', param: 'utm_content' },
    { v: 'utmCampaign', fs: '119532189', param: 'utm_campaign' },
    { v: 'gclid', fs: '119532190', param: 'gclid' },
    { v: 'productName', fs: '119531974', value: 'Reno Now' }
  ];

  window.APPLY_SCHEMA = { steps: steps, consents: consents, tracking: tracking };
})();
