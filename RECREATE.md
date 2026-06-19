# Propential — Recreation & Transfer Guide

Everything needed to recreate this website **exactly**, deploy it as a new Vercel
project, and connect **Formstack** to the Apply form. The site is a **pure static
site** (plain HTML + vanilla JS + CSS, no framework, no build step) with **one
optional serverless function** (`/api/apply`) for Formstack delivery.

---

## 1. Quick transfer (no rebuild)

The fastest path — the code already exists and is production-ready:

1. **Get the files** — either:
   - In v0: top-right of the Block → **⋯ → Download ZIP**, or
   - Clone the connected repo `NerindaDeck/propential` (branch `main`).
2. **New Vercel project** → *Add New → Project → Import* the repo (or drag the ZIP
   with `vercel deploy`).
3. **Framework Preset:** `Other`. **Build Command:** *(empty)*. **Output Directory:** `./`.
4. **Deploy.** It works immediately with zero env vars.
5. To turn on Formstack later, add the env vars in **Section 6**. No redeploy of code
   needed beyond Vercel picking up the new env vars.

---

## 2. Tech stack & principles

- **No framework, no bundler, no build.** Every page is a standalone `.html` file.
- **Shared chrome** (nav + footer) is injected at runtime by `partials.js`.
- **Shared behaviour** in `site.js` (mobile nav, scroll reveal, progress bar, legal
  linkifier, persisted display "tweaks").
- **Two stylesheets**, always loaded in this order: `propential.css` then
  `propential-v3.css`.
- **One serverless function**: `api/apply.js` (Formstack proxy). Optional — the site
  is fully functional without it.
- **Vanilla JS style:** IIFE per file, `var`, no ES modules, no dependencies.

---

## 3. Full file inventory

```
index.html              Home: animated hero, live loan-summary card, project
                        carousel, 3-step how-it-works, live calculator, fee/rate
                        tiles, closing CTA
how-it-works.html       Process explainer
product.html            Product spec grid + fee table (fee bands)
calculator.html         Standalone repayment calculator
faqs.html               Accordion FAQs
eligibility.html        Multi-step pre-qualification form
apply.html              Full application form (7 sections) + success tracker
legal/privacy.html      Privacy & Credit Reporting Policy
legal/terms.html        Terms
legal/tmd.html          Target Market Determination
legal/credit-guide.html Credit Guide
legal/complaints.html   Complaints
legal/hardship.html     Financial hardship

propential.css          Design system: tokens, type, buttons, forms, nav, footer
propential-v3.css       Animated bg, hero, carousel, calculator cards, headers, tracker

partials.js             Injects #site-nav and #site-footer on every page
site.js                 Shared behaviour + legal-page linkifier
home-v2.js              Home-only enhancements
calculator.js           Calculator maths (also powers the home live calc logic)
eligibility.js          Eligibility form logic
apply.js                Apply form: prefill, validation, dynamic terms/ID rules,
                        submission, success tracker
address-autocomplete.js Google Places hook (inert until a Maps key is supplied)
formstack-config.js     Front-end submission config (proxy | direct | off)

api/apply.js            Serverless Formstack proxy (token stays server-side)

.env.example            Environment variable template
assets/propential_mark.svg   Brand mark (favicon + footer)
assets/v2/*.jpg              Photography (v2 set)
assets/v3/*-wide.jpg         Photography (v3 wide set)
```

---

## 4. Design system (tokens)

Defined in `:root` of `propential.css`. Dark "ink, ivory & champagne" palette.

| Token | Value | Use |
|---|---|---|
| `--ink` | `#0E0F0D` | Page background |
| `--olive` | `#1D1E15` | Raised surfaces/cards |
| `--olive-2` | `#16170F` | Deeper surface |
| `--champagne` | `#D6B15E` | Primary accent (gold) |
| `--champagne-bright` | `#ECD58C` | Accent highlight |
| `--champagne-deep` | `#B6873A` | Accent shadow |
| `--ivory` | `#F3EEE2` | Headings/bright text |
| `--text` | `#EAE5D9` | Body text |
| `--text-muted` | `#A7A399` | Secondary text |
| `--text-faint` | `#6F6C63` | Fine print |
| `--line` / `--accent-line` | `rgba(214,177,94,0.18)` | Hairlines |
| `--gold-grad` | `linear-gradient(180deg,#ECD58C,#D6B15E,#B6873A)` | Gold fills |
| `--maxw` | `1140px` | Container width |
| `--radius` / `--radius-lg` | `18px` / `26px` | Corner rounding |

**Fonts (Google Fonts, imported at top of `propential.css`):**
- Display: **Fraunces** (`--font-display`)
- Body: **Hanken Grotesk** (`--font-body`)
- (Mono labels use JetBrains Mono where referenced.)

**Runtime "tweak" attributes** on `<html>` (persisted by `site.js`):
- `data-gold="restrained|balanced|present"` — accent glow intensity.
- `data-font="neutral"` — swaps display font to the body font.

---

## 5. The calculator (must match exactly)

Amortising **monthly** repayment (monthly only — no frequency toggle on the
standalone calculator copy; the home cards mirror this logic):

```
r = 0.1795 / 12          // 17.95% p.a. nominal, monthly
n = years * 12
payment = amount * r / (1 - (1 + r)^(-n))
```

**Loan range:** `$5,000 – $175,000`.

**Fee bands** (establishment fee / monthly fee):

| Amount | Est. fee | Monthly fee |
|---|---|---|
| ≤ $25,000 | $975 | $19.50 |
| ≤ $50,000 | $1,130 | $24.50 |
| ≤ $75,000 | $1,285 | $29.50 |
| ≤ $100,000 | $1,440 | $34.50 |
| ≤ $125,000 | $1,595 | $39.50 |
| ≤ $150,000 | $1,750 | $44.50 |
| > $150,000 | $1,905 | $49.50 |

**Term cap:** up to **7 years** for loans ≤ $50,000; up to **10 years** above $50,000.

**Comparison rate:** fixed representative example — *"Comparison rate 21.3% p.a.,
based on a $30,000 loan over 5 years,"* shown with the verbatim WARNING block at
every rate/repayment surface.

**Entity / licensing (appears in footer + legal):** MediPay Holdings Pty Limited
(trading as Propential), ACN 604 221 276, Australian Credit Licence 474336.

---

## 6. Formstack integration (Apply form)

The Apply form already calls a small, secure proxy. **It is safe to deploy with no
setup** — until env vars are present it just shows the confirmation screen and sends
nothing. A teammate turns it on with **two env vars + a field map**. No code changes
required for the common case.

### How it flows
```
apply.html  →  apply.js (validate → collectPayload → sendApplication)
            →  formstack-config.js (mode: proxy | direct | off)
            →  POST /api/apply  (api/apply.js, token hidden server-side)
            →  Formstack Submissions API
```
The applicant **always** sees the success screen, even if delivery fails (failures are
logged to the function logs for retry — submissions are never lost behind a blank error).

### Option A — Serverless proxy (recommended, default)
Best for teams: the API token never touches the browser. Steps for a teammate:

1. In Formstack, create/open the destination form. Note its **numeric form id**
   (in the form URL/admin).
2. Get the **field ids** for that form (Formstack → form → API/embed, or
   `GET https://www.formstack.com/api/v2/form/{id}.json` with your token). Each field
   has a numeric id like `12345678`.
3. In **Vercel → Project → Settings → Environment Variables**, add:
   - `FORMSTACK_API_TOKEN` = your Formstack access token (submit rights)
   - `FORMSTACK_FORM_ID` = the numeric form id
   - `FORMSTACK_FIELD_MAP` = JSON mapping our field names → their field ids, e.g.
     ```json
     {"name":"101","dob":"102","email":"103","phone":"104","resAddress":"105",
      "propAddress":"106","propState":"107","propValue":"108","hasMortgage":"109",
      "lender":"110","mortBalance":"111","amount":"112","term":"113","project":"114",
      "purpose":"115","employment":"116","income":"117","expenses":"118",
      "otherDebts":"119","idType":"120","idIssuedState":"121","idNumber":"122",
      "referral":"123","consentPrivacy":"124","consentAccuracy":"125"}
     ```
   (Alternatively edit `DEFAULT_FIELD_MAP` directly in `api/apply.js`. The env var
   wins if both are set.)
4. Redeploy (or just trigger a deploy so the new env vars apply). Done.

`formstack-config.js` stays at its default `mode: "proxy"`, `proxyUrl: "/api/apply"`.

### Option B — Direct client POST (fully static, no /api)
If you prefer no serverless function:
1. In `formstack-config.js`, set `mode: "direct"` and `directUrl` to your hosted
   Formstack form's submit endpoint.
2. The browser posts the JSON payload straight to Formstack. Note: no token secrecy
   and you map fields on the Formstack side.

### Option C — Off
`formstack-config.js` → `mode: "off"`. Shows confirmation, sends nothing. Useful for
staging/preview.

### Our field names (the payload keys)
`name, dob, email, phone, resAddress, propAddress, propState, propValue, hasMortgage,
lender, mortBalance, amount, term, project (array → comma-joined), purpose, employment,
income, expenses, otherDebts, idType, idIssuedState, idNumber, referral,
consentPrivacy ("Yes"/"No"), consentAccuracy ("Yes"/"No"), submittedAt, sourcePage`.

---

## 7. Other integration points (already stubbed)

- **Address autocomplete** (`address-autocomplete.js`): Google Places, AU-restricted.
  Inactive until a key is provided via `<meta name="google-maps-key" content="...">`
  or `window.PROPENTIAL_MAPS_KEY`. Inputs opt in with `data-address-autocomplete`.
- **Referral capture:** `apply.js` reads `?ref=` or `?partner=` from the URL and
  prefills the referral field; the value is included in the submission payload.
- **Eligibility → Apply prefill:** the eligibility step stores answers in
  `localStorage` (`propential_elig`); `apply.js` prefills from it, then clears it.
- **CRM (e.g. ActiveCampaign):** not wired. Easiest path is a Formstack webhook/
  integration on the destination form, or extend `api/apply.js` to also POST to the CRM.

---

## 8. Deploy settings reference

| Setting | Value |
|---|---|
| Framework Preset | Other |
| Build Command | *(empty)* |
| Install Command | *(empty)* |
| Output Directory | `./` |
| Node (for `/api`) | Vercel default (Node 18+, has global `fetch`) |
| Required env vars to deploy | **none** |
| Env vars to enable Formstack | `FORMSTACK_API_TOKEN`, `FORMSTACK_FORM_ID`, `FORMSTACK_FIELD_MAP` |

A `vercel.json` is **not** required (internal links use `.html`). Add one only if you
want pretty URLs or custom headers.

---

## 9. Recreation prompt (paste into a fresh v0 / AI build)

> Build "Propential" — a static, mobile-first marketing + lead-capture website for an
> Australian property-secured consumer loan ($5,000–$175,000, one clear rate
> 17.95% p.a., secured by caveat or second mortgage in QLD/NT). Entity: MediPay
> Holdings Pty Limited (trading as Propential), ACN 604 221 276, Australian Credit
> Licence 474336.
>
> STACK: Plain HTML + vanilla JS (IIFE per file, `var`, no modules/deps) + CSS. NO
> framework, NO build step. One optional Vercel serverless function at `/api/apply`.
> Deploys with Framework Preset "Other", empty build command, output "./".
>
> ARCHITECTURE: Shared nav/footer injected at runtime by `partials.js` into
> `#site-nav` / `#site-footer`. Active link from `<body data-page="...">`; subfolder
> (legal/) pages set `<body data-base="../">`. Shared behaviour in `site.js`: mobile
> nav toggle, scroll-reveal (`.reveal/.r → .in` via IntersectionObserver, respect
> prefers-reduced-motion), scroll progress bar, persisted display tweaks on `<html>`
> (`data-gold`, `data-font`), and a legal-page linkifier (URLs/emails/AU phone
> numbers). Two stylesheets loaded in order: `propential.css` (tokens, type, buttons,
> forms, nav, footer) then `propential-v3.css` (animated background, hero, carousel,
> calculator cards, page headers, success tracker).
>
> DESIGN TOKENS (dark + champagne gold): --ink #0E0F0D, --olive #1D1E15, --olive-2
> #16170F, --champagne #D6B15E, --champagne-bright #ECD58C, --champagne-deep #B6873A,
> --ivory #F3EEE2, --text #EAE5D9, --text-muted #A7A399, --text-faint #6F6C63, --line
> rgba(214,177,94,0.18); --gold-grad linear-gradient(180deg,#ECD58C,#D6B15E,#B6873A);
> --maxw 1140px; --radius 18px; --radius-lg 26px. Fonts: Fraunces (display), Hanken
> Grotesk (body), JetBrains Mono (mono labels), via Google Fonts.
>
> PAGES: Home (animated hero + live loan-summary card with amount/term sliders →
> indicative MONTHLY repayment; project carousel; 3-step how-it-works; larger live
> calculator; fee/rate tiles; closing CTA), How it works, The product (spec grid +
> fee table), Calculator, FAQs (accordion), Check eligibility (multi-step,
> project-type multi-select), Apply (7 fieldsets incl. dynamic per-state ID-number
> validation, address autocomplete hooks, conditional mortgage fields, 4-step success
> tracker), and legal: privacy, terms, tmd, credit-guide, complaints, hardship.
>
> CALCULATOR: amortising MONTHLY repayment at 17.95% p.a.: payment = amount * r /
> (1 - (1+r)^-n), r = 0.1795/12, n = years*12. Range $5,000–$175,000. Fee bands
> (est/monthly): ≤25k 975/19.50; ≤50k 1130/24.50; ≤75k 1285/29.50; ≤100k 1440/34.50;
> ≤125k 1595/39.50; ≤150k 1750/44.50; else 1905/49.50. Term cap: 7yrs ≤$50k, 10yrs
> above. Comparison rate is a FIXED example: "Comparison rate 21.3% p.a., based on a
> $30,000 loan over 5 years," shown with the verbatim WARNING block at every rate.
>
> APPLY → FORMSTACK: Validate, then collect all fields into a JSON payload and POST to
> a configurable destination read from `formstack-config.js` (`mode: proxy | direct |
> off`; default proxy → `/api/apply`). The serverless `/api/apply` holds
> `FORMSTACK_API_TOKEN` + `FORMSTACK_FORM_ID` server-side and maps our field names to
> Formstack `field_{id}` keys via `FORMSTACK_FIELD_MAP` (JSON) or an in-file default;
> if env vars are absent it returns `{ok:true,configured:false}` so the static UX still
> works. The applicant ALWAYS sees the success confirmation + 4-step tracker even if
> delivery fails. Prefill referral from `?ref=`/`?partner=`; prefill from the
> eligibility step via localStorage `propential_elig`.
>
> INTEGRATIONS (leave inert until configured): Address autocomplete (Google Places,
> AU-restricted) activates only when `<meta name="google-maps-key">` or
> `window.PROPENTIAL_MAPS_KEY` is set. CRM (ActiveCampaign) optional via Formstack
> webhook or by extending `/api/apply`.

---

## 10. Checklist for the receiving team

- [ ] Import repo / ZIP into new Vercel project (preset Other, output `./`).
- [ ] Confirm site loads (no env vars needed).
- [ ] Create the Formstack form; record form id + field ids.
- [ ] Add `FORMSTACK_API_TOKEN`, `FORMSTACK_FORM_ID`, `FORMSTACK_FIELD_MAP` env vars.
- [ ] Submit a test application; confirm it appears in Formstack.
- [ ] (Optional) Add Google Maps key for address autocomplete.
- [ ] (Optional) Add CRM webhook on the Formstack form.
- [ ] Point your domain at the new project.
