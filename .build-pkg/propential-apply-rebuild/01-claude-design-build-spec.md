# BUILD SPEC — Propential "Apply" form rebuild (front-end only)

## Read me first (context + handover protocol)
You are rebuilding the **Propential loan application form** front-end ONLY.
You do NOT have database/API/Formstack access — do not write any network/integration
code. Build pure front-end: HTML structure, styling, client-side validation, and
conditional show/hide logic. Output a single-page multi-step form.

This form mirrors a backend Formstack form. To make the later backend handover
trivial, EVERY input MUST carry a `data-fs-id="<id>"` attribute with the Formstack
field id given here, and use the exact `id`/`name` and option VALUES given.
Do not rename variables or change option text — the backend maps on these verbatim.

When you finish, I will ask you to produce a "backend handover prompt" (see file
05). Keep an internal record of any deviations so that prompt is accurate.

### Global conventions
- Input `id` === `name` === the **Variable** column (camelCase).
- `data-fs-id` === the **FS ID** column.
- Radio groups: `name=<variable>`, one input per option, `value` = exact option text.
- Single-select dropdown = `<select>`; FIRST option is empty placeholder
  `<option value="">Select…</option>`.
- Multi-select = group of checkboxes sharing `name=<variable>`, `value` = option text.
- Consent checkboxes: single checkbox, `value` = the FULL verbatim label text (file 03).
- Address = composite of 5 sub-inputs (see Address pattern below).
- "Add another" repeat blocks: a checkbox toggles the next block's visibility.
- Money fields: numeric, `min="0"`, step 1, show `$` prefix, no negatives, strip commas.
- Required fields show inline error on blur/submit; conditionally-required fields are
  validated ONLY when their parent reveals them.

### Address pattern (use for every `address` field)
For an address variable `X`, render 5 inputs:
| Sub-input | id/name | required |
|---|---|---|
| Street address | `X_address` | yes |
| Address line 2 | `X_address2` | no |
| Suburb/City | `X_city` | yes |
| State (dropdown) | `X_state` | yes — NSW, ACT, QLD, VIC, SA, NT, TAS, WA |
| Postcode | `X_zip` | yes — 4 digits |
Carry the FS ID on a wrapping `<fieldset data-fs-id="…">`.

---

## STEP 1 — Loan basics
| Label | Control | Variable | id/name | FS ID | Options | Validation |
|---|---|---|---|---|---|---|
| What is the purpose of the funds you would like to borrow? | radio | `purpose` | purpose | 119531975 | Home renovation \| Investment property renovation | required |
| What type of renovation do you intend to use the funds for | multi checkbox | `project` | project | 119531976 | Kitchen \| Bathroom \| Pool \| Other | optional (>=1 recommended) |
| How much money are you looking to borrow? | number ($) | `amount` | amount | 119531977 | — | required, min 5000 |
| Choose your repayment term | dropdown | `term` | term | 122580887 | 1 Year \| 2 Years \| 3 Years \| 4 Years \| 5 Years \| 6 Years \| 7 Years | required (max 7 — no 8/9/10) |

## STEP 2 — Your details
| Label | Control | Variable | id/name | FS ID | Options | Validation |
|---|---|---|---|---|---|---|
| Title | dropdown | `title` | title | 119531978 | Ms. \| Mrs. \| Mr. \| Dr. \| Prefer not to say | required |
| First name | text | `firstName` | firstName | 119531979 | — | required |
| Middle name | text | `middleName` | middleName | 119531980 | — | optional |
| Last name | text | `lastName` | lastName | 119531981 | — | required |
| Email | email | `email` | email | 119531982 | — | required, valid email |
| Mobile | tel | `phone` | phone | 119531983 | — | required, AU mobile |
| Date of birth | date | `dob` | dob | 119532165 | — | required, age >= 18 |
| Is this a joint application? | radio | `joint` | joint | 119531988 | No \| Yes | required |
| Their name | text | `jointName` | jointName | 119531989 | — | required IF joint=Yes |
| Their email | email | `jointEmail` | jointEmail | 119531990 | — | required IF joint=Yes |

## STEP 3 — Employment
| Label | Control | Variable | id/name | FS ID | Options | Validation |
|---|---|---|---|---|---|---|
| Employment status | radio | `employment` | employment | 119531993 | Full time \| Part time \| Casual/Temp \| Contractor \| Self-employed \| Stay-at-home partner \| Retired \| Unemployed | required |
| Provide more detail about your employment status | text | `employmentDetail` | employmentDetail | 119531994 | — | required |
| Industry sector related to your main employment | dropdown | `industry` | industry | 119531995 | see file 02 (33 options) | required (hide if Unemployed/Retired/Stay-at-home) |
| Job title | type-ahead (file 04) | `jobTitle` | jobTitle | 119531997 | see file 04 (358) | required (hide if Unemployed/Retired/Stay-at-home) |
| How long have you worked here? | radio | `jobTenure` | jobTenure | 119531998 | 2 years or more \| Between 1 and 2 years \| Between 3 and 12 months \| Less than 3 months | required (hide if Unemployed/Retired/Stay-at-home) |
| Employer business name | text | `employerName` | employerName | 119531999 | — | required (hide if Unemployed/Retired/Stay-at-home) |
| Previous employment job title | type-ahead (file 04) | `prevJobTitle` | prevJobTitle | 119532001 | see file 04 | required IF jobTenure < 2 years |
| Previous employer business name | text | `prevEmployerName` | prevEmployerName | 119532002 | — | required IF jobTenure < 2 years |
| How long have you been self employed? | radio | `selfEmployedTenure` | selfEmployedTenure | 119532004 | 2 years or more \| Between 1 and 2 years \| Between 3 and 12 months \| Less than 3 months | required IF employment=Self-employed |
| Business name | text | `businessName` | businessName | 119532005 | — | required IF employment=Self-employed |
| Business ABN | text | `businessAbn` | businessAbn | 119532006 | — | required IF employment=Self-employed, 11 digits |

## STEP 4 — Home address & living situation
| Label | Control | Variable | id/name | FS ID | Options | Validation |
|---|---|---|---|---|---|---|
| Address (home) | address | `resAddress` | resAddress_* | 119532010 | — | required |
| How long have you lived at this address? | radio | `addressTenure` | addressTenure | 119532012 | 2 years or longer \| Less than 2 years | required |
| Previous address | address | `prevAddress` | prevAddress_* | 119532014 | — | required IF addressTenure = Less than 2 years |
| What is your home ownership status? | radio | `ownership` | ownership | 119532015 | Renting \| I own it - paying off mortgage \| I own it - mortgage already paid \| Not paying rent- living with family \| Other | required |
| Explain your home ownership status ('Other') | text | `ownershipOther` | ownershipOther | 119532016 | — | required IF ownership=Other |
| What is the estimated value of your home? | number ($) | `homeValue` | homeValue | 119532017 | — | required, min 0 |
| What is the amount owing on your mortgage? | number ($) | `mortBalance` | mortBalance | 119532060 | — | required, min 0 |
| Relationship status | radio | `relationship` | relationship | 119532018 | Single \| De facto \| Married \| Divorced or separated \| Widowed | required |

## STEP 5 — Renovation property
| Label | Control | Variable | id/name | FS ID | Options | Validation |
|---|---|---|---|---|---|---|
| Is your home address the property to be renovated? | radio | `renoIsHome` | renoIsHome | 119532011 | No \| Yes | required |
| Renovation address | address | `propAddress` | propAddress_* | 119533819 | — | required IF renoIsHome=No (else copy home) |
| Are you on title of the property to be renovated? | radio | `onTitle` | onTitle | 119534299 | No \| Yes | required |
| Explain who owns the property (on title) | text | `titleOwner` | titleOwner | 119534366 | — | required IF onTitle=No |
| Monthly rental income from this property | number ($) | `propRentalIncome` | propRentalIncome | 119534508 | — | required (0 if none) |
| Do you have a loan (mortgage) on the property? | radio | `propHasLoan` | propHasLoan | 119535325 | No \| Yes | required |
| Amount owing on the loan | number ($) | `propLoanOwing` | propLoanOwing | 119535527 | — | required IF propHasLoan=Yes |
| Monthly loan repayments | number ($) | `propLoanRepayment` | propLoanRepayment | 119535791 | — | required IF propHasLoan=Yes |
| Estimated value of this property | number ($) | `propValue` | propValue | 119633192 | — | required, min 0 |

## STEP 6 — Income
| Label | Control | Variable | id/name | FS ID | Options | Validation |
|---|---|---|---|---|---|---|
| Gross annual salary (before tax/super) | number ($) | `income` | income | 119532022 | — | required, min 0 |
| How often do you get paid? | radio | `payFrequency` | payFrequency | 119532023 | Weekly \| Fortnightly \| Monthly | required |
| Do you receive a payment from Centrelink? | radio | `centrelink` | centrelink | 119532024 | No \| Yes | required |

Centrelink repeat block (show IF centrelink=Yes). Up to 3. Type options in file 02.
| Label | Control | Variable | id/name | FS ID | Validation |
|---|---|---|---|---|---|
| Centrelink payment 1 type | dropdown | `cl1Type` | cl1Type | 119532026 | required IF centrelink=Yes |
| Centrelink payment 1 fortnightly amount | number ($) | `cl1Amount` | cl1Amount | 119532027 | required IF centrelink=Yes |
| Add Centrelink payment 2 (value: `Add another Centrelink payment`) | checkbox toggle | `addCl2` | addCl2 | 119532028 | — |
| Centrelink payment 2 type | dropdown | `cl2Type` | cl2Type | 119532030 | required IF addCl2 |
| Centrelink payment 2 fortnightly amount | number ($) | `cl2Amount` | cl2Amount | 119532031 | required IF addCl2 |
| Add Centrelink payment 3 (value: `Add another Centrelink payment`) | checkbox toggle | `addCl3` | addCl3 | 119532032 | — |
| Centrelink payment 3 type | dropdown | `cl3Type` | cl3Type | 119532034 | required IF addCl3 |
| Centrelink payment 3 fortnightly amount | number ($) | `cl3Amount` | cl3Amount | 119532035 | required IF addCl3 |

| Do you have any other source of income? | radio | `otherIncome` | otherIncome | 119532037 | No \| Yes | required |

Other-income repeat block (show IF otherIncome=Yes). Up to 3. Type options in file 02.
| Source 1 type | dropdown | `src1Type` | src1Type | 119532039 | required IF otherIncome=Yes |
| Source 1 monthly amount | number ($) | `src1Amount` | src1Amount | 119532040 | required IF otherIncome=Yes |
| Add source 2 (value: `Add another source of income`) | checkbox toggle | `addSrc2` | addSrc2 | 119532041 | — |
| Source 2 type | dropdown | `src2Type` | src2Type | 119532043 | required IF addSrc2 |
| Source 2 monthly amount | number ($) | `src2Amount` | src2Amount | 119532044 | required IF addSrc2 |
| Add source 3 (value: `Add another source of income`) | checkbox toggle | `addSrc3` | addSrc3 | 119532045 | — |
| Source 3 type | dropdown | `src3Type` | src3Type | 119532047 | required IF addSrc3 |
| Source 3 monthly amount | number ($) | `src3Amount` | src3Amount | 119532048 | required IF addSrc3 |

## STEP 7 — Expenses & commitments
| Label | Control | Variable | id/name | FS ID | Options | Validation |
|---|---|---|---|---|---|---|
| General household monthly living expenses | number ($) | `generalExpenses` | generalExpenses | 119532050 | — | required, min 0 |
| Total household monthly living expenses | number ($) | `expenses` | expenses | 119532052 | — | required, >= generalExpenses |
| % of total expenses your spouse/partner pays each month | radio | `spouseExpensePct` | spouseExpensePct | 119532053 | From 0% - 19% \| From 20% - 49% \| 50% or more | required |
| How often do you pay rent or mortgage on your home? | radio | `rentFrequency` | rentFrequency | 119532056 | Weekly \| Fortnightly \| Monthly | required |
| How much rent or mortgage do you pay each time? | number ($) | `rentAmount` | rentAmount | 119532057 | — | required, min 0 |
| % of rent/mortgage your spouse/partner pays each time | radio | `spouseRentPct` | spouseRentPct | 119532058 | From 0% - 19% \| From 20% - 49% \| 50% or more | optional |
| Do you expect a significant ADVERSE change to your finances in 6-12 months? | radio | `adverseChange` | adverseChange | 119532062 | No \| Yes | required |

## STEP 8 — Assets & liabilities

### Investment property
| Do you own any other investment property? | radio | `investmentProperty` | investmentProperty | 119532064 | No \| Yes | required |

Property repeat block (show IF investmentProperty=Yes). Up to 3.
| Property 1: monthly rental income | number ($) | `ip1Rental` | ip1Rental | 119532066 | required IF investmentProperty=Yes |
| Property 1: making mortgage repayments? | radio | `ip1HasMortgage` | ip1HasMortgage | 119532067 (No\|Yes) | optional |
| Property 1: monthly mortgage repayment | number ($) | `ip1Repayment` | ip1Repayment | 119532068 | required IF ip1HasMortgage=Yes |
| Property 1: amount owing on mortgage | number ($) | `ip1Owing` | ip1Owing | 119532069 | required IF ip1HasMortgage=Yes |
| Property 1: estimated value | number ($) | `ip1Value` | ip1Value | 119532070 | required IF investmentProperty=Yes |
| Add property 2 (value: `Add another property`) | checkbox toggle | `addIp2` | addIp2 | 119532074 | — |
| Property 2: monthly rental income | number ($) | `ip2Rental` | ip2Rental | 119532076 | required IF addIp2 |
| Property 2: making mortgage repayments? | radio | `ip2HasMortgage` | ip2HasMortgage | 119532077 (No\|Yes) | optional |
| Property 2: monthly mortgage repayment | number ($) | `ip2Repayment` | ip2Repayment | 119532078 | required IF ip2HasMortgage=Yes |
| Property 2: amount owing | number ($) | `ip2Owing` | ip2Owing | 119532079 | required IF ip2HasMortgage=Yes |
| Property 2: estimated value | number ($) | `ip2Value` | ip2Value | 119532080 | required IF addIp2 |
| Add property 3 (value: `Add another property`) | checkbox toggle | `addIp3` | addIp3 | 119532084 | — |
| Property 3: monthly rental income | number ($) | `ip3Rental` | ip3Rental | 119532086 | required IF addIp3 |
| Property 3: making mortgage repayments? | radio | `ip3HasMortgage` | ip3HasMortgage | 119532087 (No\|Yes) | optional |
| Property 3: monthly mortgage repayment | number ($) | `ip3Repayment` | ip3Repayment | 119532088 | required IF ip3HasMortgage=Yes |
| Property 3: amount owing | number ($) | `ip3Owing` | ip3Owing | 119532089 | required IF ip3HasMortgage=Yes |
| Property 3: estimated value | number ($) | `ip3Value` | ip3Value | 119532090 | required IF addIp3 |

### Non-property assets
| Do you own any other non-property assets? | radio | `otherAssets` | otherAssets | 119532095 | No \| Yes | required |

Asset repeat block (show IF otherAssets=Yes). Up to 4. Type options in file 02.
| Asset 1: Type | dropdown | `asset1Type` | asset1Type | 119532097 | required IF otherAssets=Yes |
| Asset 1: Estimated value | number ($) | `asset1Value` | asset1Value | 119532098 | required IF otherAssets=Yes |
| Add other asset 1 (value: `Add other asset`) | checkbox toggle | `addAsset2` | addAsset2 | 119532099 | — |
| Asset 2: Type | dropdown | `asset2Type` | asset2Type | 119532101 | required IF addAsset2 |
| Asset 2: Estimated value | number ($) | `asset2Value` | asset2Value | 119532102 | required IF addAsset2 |
| Add other asset 2 (value: `Add other asset`) | checkbox toggle | `addAsset3` | addAsset3 | 119532103 | — |
| Asset 3: Type | dropdown | `asset3Type` | asset3Type | 119532105 | required IF addAsset3 |
| Asset 3: Estimated value | number ($) | `asset3Value` | asset3Value | 119532106 | required IF addAsset3 |
| Add other asset 3 (value: `Add other asset`) | checkbox toggle | `addAsset4` | addAsset4 | 119532107 | — |
| Asset 4: Type | dropdown | `asset4Type` | asset4Type | 119532109 | required IF addAsset4 |
| Asset 4: Estimated value | number ($) | `asset4Value` | asset4Value | 119532110 | required IF addAsset4 |

### Credit cards
| Do you have credit cards? | radio | `creditCards` | creditCards | 119532112 | No \| Yes | required |

Card repeat block (show IF creditCards=Yes). Up to 5. Provider options in file 02.
| Card 1: Provider | dropdown | `card1Provider` | card1Provider | 119532114 | optional |
| Card 1: Credit limit | number ($) | `card1Limit` | card1Limit | 119532115 | required IF creditCards=Yes |
| Card 1: Amount owing | number ($) | `card1Owing` | card1Owing | 119532116 | required IF creditCards=Yes |
| Add credit card 2 (value: `Add another credit card`) | checkbox toggle | `addCard2` | addCard2 | 119532117 | — |
| Card 2: Provider | dropdown | `card2Provider` | card2Provider | 119532119 | optional |
| Card 2: Credit limit | number ($) | `card2Limit` | card2Limit | 119532120 | required IF addCard2 |
| Card 2: Amount owing | number ($) | `card2Owing` | card2Owing | 119532121 | required IF addCard2 |
| Add credit card 3 (value: `Add another credit card`) | checkbox toggle | `addCard3` | addCard3 | 119532122 | — |
| Card 3: Provider | dropdown | `card3Provider` | card3Provider | 119532124 | optional |
| Card 3: Credit limit | number ($) | `card3Limit` | card3Limit | 119532125 | required IF addCard3 |
| Card 3: Amount owing | number ($) | `card3Owing` | card3Owing | 119532126 | required IF addCard3 |
| Add credit card 4 (value: `Add another credit card`) | checkbox toggle | `addCard4` | addCard4 | 119532127 | — |
| Card 4: Provider | dropdown | `card4Provider` | card4Provider | 119532129 | optional |
| Card 4: Credit limit | number ($) | `card4Limit` | card4Limit | 119532130 | required IF addCard4 |
| Card 4: Amount owing | number ($) | `card4Owing` | card4Owing | 119532131 | required IF addCard4 |
| Add credit card 5 (value: `Add another credit card`) | checkbox toggle | `addCard5` | addCard5 | 119532132 | — |
| Card 5: Provider | dropdown | `card5Provider` | card5Provider | 119532134 | optional |
| Card 5: Credit limit | number ($) | `card5Limit` | card5Limit | 119532135 | required IF addCard5 |
| Card 5: Amount owing | number ($) | `card5Owing` | card5Owing | 119532136 | required IF addCard5 |

### Other debt
| Do you have any other debt? | radio | `otherDebt` | otherDebt | 119532138 | No \| Yes | required |

Debt repeat block (show IF otherDebt=Yes). Up to 5. Type options in file 02.
| Debt 1: type | dropdown | `debt1Type` | debt1Type | 119532140 | required IF otherDebt=Yes |
| Debt 1: amount still owing | number ($) | `debt1Owing` | debt1Owing | 119532141 | required IF otherDebt=Yes |
| Debt 1: monthly repayment | number ($) | `debt1Repayment` | debt1Repayment | 119532142 | required IF otherDebt=Yes |
| Add debt 2 (value: `Add another debt`) | checkbox toggle | `addDebt2` | addDebt2 | 119532143 | — |
| Debt 2: type | dropdown | `debt2Type` | debt2Type | 119532145 | required IF addDebt2 |
| Debt 2: amount owing | number ($) | `debt2Owing` | debt2Owing | 119532146 | required IF addDebt2 |
| Debt 2: monthly repayment | number ($) | `debt2Repayment` | debt2Repayment | 119532147 | required IF addDebt2 |
| Add debt 3 (value: `Add another debt`) | checkbox toggle | `addDebt3` | addDebt3 | 119532148 | — |
| Debt 3: type | dropdown | `debt3Type` | debt3Type | 119532150 | required IF addDebt3 |
| Debt 3: amount owing | number ($) | `debt3Owing` | debt3Owing | 119532151 | required IF addDebt3 |
| Debt 3: monthly repayment | number ($) | `debt3Repayment` | debt3Repayment | 119532152 | required IF addDebt3 |
| Add debt 4 (value: `Add another debt`) | checkbox toggle | `addDebt4` | addDebt4 | 119532153 | — |
| Debt 4: type | dropdown | `debt4Type` | debt4Type | 119532155 | required IF addDebt4 |
| Debt 4: amount owing | number ($) | `debt4Owing` | debt4Owing | 119532156 | required IF addDebt4 |
| Debt 4: monthly repayment | number ($) | `debt4Repayment` | debt4Repayment | 119532157 | required IF addDebt4 |
| Add debt 5 (value: `Add another debt`) | checkbox toggle | `addDebt5` | addDebt5 | 119532158 | — |
| Debt 5: type | dropdown | `debt5Type` | debt5Type | 119532160 | required IF addDebt5 |
| Debt 5: amount owing | number ($) | `debt5Owing` | debt5Owing | 119532161 | required IF addDebt5 |
| Debt 5: monthly repayment | number ($) | `debt5Repayment` | debt5Repayment | 119532162 | required IF addDebt5 |

## STEP 9 — Identity & verification
| Label | Control | Variable | id/name | FS ID | Options | Validation |
|---|---|---|---|---|---|---|
| Do you have an Australian driver's license? | radio | `hasLicense` | hasLicense | 119532166 | No \| Yes | required |
| Driver's license state | radio | `idIssuedState` | idIssuedState | 119532167 | NSW \| ACT \| QLD \| VIC \| SA \| NT \| TAS \| WA | required IF hasLicense=Yes |
| Driver's license number | text | `idNumber` | idNumber | 119532168 | — | required IF hasLicense=Yes |
| Medicare card number | number | `medicareNumber` | medicareNumber | 119532169 | — | required, 10-11 digits |
| What colour is your Medicare card? | radio | `medicareColour` | medicareColour | 119532171 | Green \| Blue \| Yellow | required |
| Medicare card expiry (valid to) date | date | `medicareExpiry` | medicareExpiry | 119532172 | — | required, future date |
| How many dependants do you have | radio | `dependants` | dependants | 119532173 | 0 \| 1 \| 2 \| 3 \| 4 or more | required |
| Dependant 1: Age | number | `dep1Age` | dep1Age | 119532175 | — | required IF dependants >= 1 |
| Dependant 2: Age | number | `dep2Age` | dep2Age | 119532176 | — | required IF dependants >= 2 |
| Dependant 3: Age | number | `dep3Age` | dep3Age | 119532177 | — | required IF dependants >= 3 |
| Dependant 4: Age | number | `dep4Age` | dep4Age | 119532178 | — | required IF dependants = "4 or more" |

## STEP 10 — Declarations & consents
All required checkboxes. Exact verbatim text and placement in **file 03**.
Variables/FS IDs: consentPrivacy/119531985, consentConfirm/142285711,
consentCitizen/119532181, consentAccuracy/119532182, consentCredit/119532183,
consentElectronic/119532184, consentBiometric/125695752.

## Hidden tracking fields (hidden inputs, populated from URL params)
| Variable | id/name | FS ID |
|---|---|---|
| `utmSource` | utmSource | 119532186 |
| `utmMedium` | utmMedium | 119532187 |
| `utmContent` | utmContent | 119532188 |
| `utmCampaign` | utmCampaign | 119532189 |
| `gclid` | gclid | 119532190 |
| `productName` (hidden, value "Reno Now") | productName | 119531974 |

---

## Behaviour summary
- 10 visible steps + hidden tracking. Progress indicator and Back/Next per step.
- Validate the current step before Next; final Submit re-validates everything.
- Conditional fields removed from validation when hidden.
- Repeat blocks reveal via their "Add ..." checkbox; hiding a block clears its inputs.
- On submit (front-end only): collect ALL fields into one JS object keyed by Variable,
  console.log it, show a success screen. Do NOT post anywhere.
- Keep Propential's existing brand styling (gold/neutral palette, current fonts).

## When done
Produce the "v0 backend handover prompt" described in file 05.
