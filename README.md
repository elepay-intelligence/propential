# Handoff: Propential — property-secured loan website

## Overview
Propential is a static, mobile-first marketing + lead-capture website for a property-secured
consumer loan ($5,000–$175,000, one clear rate 17.95% p.a., secured by caveat or second
mortgage). Entity: **MediPay Holdings Pty Limited**, ACN 604 221 276, Australian Credit Licence
474336. The site comprises marketing pages, an instant eligibility check, a full application
form, and the required legal/compliance pages.

## About the design files
The files in this bundle are a **complete, working static site** (HTML/CSS/JS, no build step) —
they are simultaneously the design reference *and* a deployable implementation. There are two
valid paths:
1. **Ship as-is** — it deploys to any static host (Vercel/Netlify/GitHub Pages) with no build.
2. **Recreate in your stack** — if you're folding this into an existing app (React/Vue/etc.),
   treat these files as a high-fidelity reference and rebuild using your established components,
   routing and design-token system. Lift the exact values from the Design Tokens section below.

The forms currently render a branded success state client-side and post nowhere — see
**Integrations / TODO**.

## Fidelity
**High-fidelity and production-styled.** Final colours, typography, spacing, motion and copy.
Recreate pixel-for-pixel; all values are documented below and defined as CSS custom properties
in `propential.css` / `propential-v3.css`.

## Tech & architecture
- **No framework, no build.** Plain HTML + vanilla JS (ES5-style, IIFE per file) + CSS.
- **Shared chrome** is injected at runtime: `partials.js` builds the nav + footer into
  `#site-nav` / `#site-footer` on every page. Active nav link via `<body data-page="…">`;
  subfolder pages (legal/) set `<body data-base="../">`.
- **Shared behaviour** in `site.js`: mobile nav toggle, scroll-reveal (`.reveal` → `.in`),
  scroll progress bar, persisted global "tweaks" (gold intensity / heading font / rhythm via
  `data-*` on `<html>`), and the legal-page linkifier (`linkifyLegal()`).
- **Two stylesheets**, loaded in order: `propential.css` (base design system: tokens, type,
  buttons, forms, nav, footer) then `propential-v3.css` (the richer "v3" visual layer: animated
  background, hero, carousel, calculator cards, page-header treatments, tracker, etc.).
- **Per-page logic**: `home-v2.js` (home hero/carousel/reveals) + an inline `<script>` in
  `index.html` (the two home calculators); `calculator.js`; `eligibility.js`; `apply.js`;
  `address-autocomplete.js` (progressive enhancement, all `[data-address-autocomplete]` inputs).
- **Fonts** (Google Fonts, runtime): Fraunces (display), Hanken Grotesk (body), JetBrains Mono
  (mono labels/eyebrows).

## Screens / Views

### Global — Nav & Footer (`partials.js`)
- **Nav**: fixed top, brand mark (inline SVG keyhole/house) + wordmark "Prop**ential**"
  (the "ential" in champagne). Primary links: How it works · The product · Calculator · FAQs.
  CTAs: "Calculate" (ghost) + "Check eligibility" (primary). Mobile: hamburger toggles
  `body.menu-open`.
- **Footer**: brand blurb; Product column (How it works, The product, Calculator, Check
  eligibility, Apply, FAQs); Legal column (Privacy & credit reporting policy, Terms &
  conditions, Credit guide, Target Market Determination, Complaints, Hardship); Acknowledgement
  of Country; legal line with ACN/ACL/address + indicative-only disclaimer.

### Home (`index.html`)
Hero with animated aurora/grid backdrop; headline "Days to start, **years to finish.**"; white
sub-paragraph with a `^` footnote (conditional-approval caveat). Right side: a live **loan
summary card** (amount/term sliders → indicative **monthly** repayment, rate, est. fee, P/Mth
fee) + comparison-rate disclosure. Below: project carousel, "how it works" 3-step, a live
calculator section (same maths, larger), fee/rate tiles, a "door reveal" feature, closing CTA.
Repayment figure is **monthly only** (frequency toggle was removed).

### How it works (`how-it-works.html`)
Two-column page header (eyebrow + heading | lead). Intro: "A clear path to adding value to your
property, with an Australian based support person at the other end of every application."
Three-step explanation; "what you'll need" cards (incl. Identification).

### The product (`product.html`)
Two-column header → "A property loan, in plain terms." At-a-glance spec grid (loan amount, rate,
term, repayments, early repayment, security); comparison-rate disclosure; **"What you can use it
for"** (sits above Fees); fee schedule table (4 bands); "Secured against your property" split.

### Calculator (`calculator.html`)
Two-column header → "See what it costs, before you apply." Two sliders (amount $5k–$175k, term)
→ indicative **monthly** repayment card with rate/fees + comparison-rate disclosure. Body copy
runs full width. "Important information" 2-col stack.

### FAQs (`faqs.html`)
Two-column header → "Questions, answered plainly." Accordion (`<details>`). Rate answer embeds
the comparison-rate disclosure; fee bands listed as "band: $est establishment, $mth / month".

### Check eligibility (`eligibility.html` + `eligibility.js`)
Two-column header → "See if Propential is a fit." Multi-step form: ownership (radio), state
(select, with caveat/second-mortgage hint), amount (validated $5k–$175k), **project type
(multi-select checkboxes — "select all that apply")**, security comfort (radio), name/email/
phone, consent. On submit → client-side validation → branded result ("Good news, …" or a
not-a-fit message). Answers persisted to `localStorage('propential_elig')` and carried to Apply.

### Apply (`apply.html` + `apply.js`)
Two-column header → "Your application, start to finish." 7 fieldsets:
1. **About you** — name, DOB (`type=date`, dark calendar + champagne accent), email, phone,
   residential address (`data-address-autocomplete`).
2. **Your property** — property address (`data-address-autocomplete`), state (caveat/2nd-mortgage
   hint), estimated value `$`, existing-mortgage radio → reveals lender + balance fields
   (toggle class **`is-shown`**).
3. **Your loan** — amount `$`, term (rebuilds options by amount band), **project type
   (multi-select checkboxes)**, optional notes.
4. **Income & expenses** — employment, gross income `$`, monthly expenses `$`, other debts `$`.
5. **Identity** — ID type, **mandatory Issued state** (8 states), **ID number with dynamic
   per-type/state validation + live format hint** (see Interactions).
6. **Referral** — partner/referral code (prefilled from `?ref=`/`?partner=`).
7. **Consent** — two required checkboxes + collection statement.
On submit → validation → confirmation panel: "Application received, [first name]." + a
**4-step progress tracker** (Application Received ✓ → Application Under Review (current) ⋯
Conditional Approval^ ⋯ Full Approval) with footnote, "Back to home" CTA, referral confirmation.

### Legal (`legal/`)
`privacy.html`, `terms.html`, `tmd.html`, `credit-guide.html`, `complaints.html`,
`hardship.html`. Single-column long-form (`.legal-wrap`, max 820px). All URLs / emails / AU
phone numbers are auto-linkified by `site.js`.

## Interactions & behaviour
- **Calculators** (home hero, home live, calculator page): amortising monthly repayment at
  17.95% p.a.; `payment = amount · r/(1−(1+r)^−n)`, `r = 0.1795/12`, `n = years·12`. Fee bands
  (establishment / monthly): ≤$25k → $975 / $19.50; ≤$50k → $1,130 / $24.50; ≤$75k → $1,285 /
  $29.50; ≤$100k → $1,440 / $34.50; ≤$125k → $1,595 / $39.50; ≤$150k → $1,750 / $44.50; ≤$175k →
  $1,905 / $49.50. Term cap: 7 yrs ≤$50k, 10 yrs above. Amount/term persisted to
  `localStorage('propential_tweaks')`. **Monthly only** — no frequency toggle.
- **Comparison rate** is a fixed representative example (NOT slider-driven): "Comparison rate
  21.3% p.a., based on a $30,000 loan over 5 years." shown with the verbatim `WARNING:` block at
  every rate/repayment instance.
- **Dynamic ID validation** (`apply.js` → `idRule()`): driver licence per-state regex (NSW
  `^\d{6,8}$`, VIC `^\d{7,9}$`, QLD `^[A-Za-z0-9]{6,9}$`, WA `^\d{6,7}[A-Za-z]?$`, SA/TAS
  `^\d{6,8}$`, ACT/NT `^\d{6,7}$`); passport `^[A-Za-z]\d{7}$`; Other `^[A-Za-z0-9]{3,}$`. Hint
  text updates live on ID-type / Issued-state change.
- **Address autocomplete** (`address-autocomplete.js`): Google Places, AU-restricted, attaches
  to `[data-address-autocomplete]`. **Inactive without an API key** — fields stay plain text.
- **Reveal on scroll**: `.reveal`/`.r` → `.in` via IntersectionObserver. Respects
  `prefers-reduced-motion`. Scroll progress bar `#vprog`.
- **Form validation**: required-field highlighting (`.field--error`), email regex, amount range,
  at-least-one for multi-select chips, both consent boxes. Smooth-scrolls to first error.

## State management
- `localStorage('propential_tweaks')` — `{ calcAmount, calcTerm, gold, fontFeel, rhythm }`
  (shared calculator inputs + global visual tweaks). Note: `calcFreq` is no longer written/read.
- `localStorage('propential_elig')` — eligibility answers carried into Apply (cleared on
  successful application submit).
- Per-page transient state (form values, current carousel index) held in DOM / closures.

## Design tokens

### Colour (`propential.css` / `propential-v3.css` `:root`)
- Ink/bg: `--ink #0E0F0D`, `--olive #1D1E15`, `--olive-2 #16170F`, `--bg-0 #0A0B09`,
  `--bg-1 #111310`, `--bg-2 #16180F`
- Champagne (brand gold): `--champagne #D6B15E`, `--champagne-bright #ECD58C`,
  `--champagne-deep #B6873A`
- Ivory/text: `--ivory #F3EEE2`, `--text #EAE5D9`, `--text-muted #A7A399`, `--text-faint #6F6C63`
- Lines: `--line rgba(214,177,94,.18)`, `--line-soft rgba(243,238,226,.08)`,
  `--stroke rgba(243,238,226,.10)`, `--stroke-gold rgba(214,177,94,.30)`
- Gradients: `--gold-grad linear-gradient(180deg,#ECD58C,#D6B15E 52%,#B6873A)`; glow
  `--glow rgba(214,177,94,.55)`
- Form controls: `input[type=date] { color-scheme: dark; accent-color: var(--champagne); }`

### Type
- Display: **Fraunces** (serif) — headings, figures. Body: **Hanken Grotesk**. Mono: **JetBrains
  Mono** — eyebrows (`// ` prefix on interior pages), labels, ticker.
- Base body 14px, `letter-spacing .005em`. Headings use `clamp()` fluid scaling. Eyebrows
  ~0.66–0.72rem uppercase, letter-spacing ~0.14em.

### Spacing / shape
- Container `--maxw 1140px`. Radii: `--radius 18px`, `--radius-lg 26px`, pills `999px`.
- Section padding & header gaps use `clamp()` (e.g. header split gap `clamp(28px,5vw,64px)`).
- Two-column page header: `.page-head .head-split` (and `.apply-head-grid` / `.prod-head-grid`)
  — `grid-template-columns: 1.1fr 0.9fr`, collapses to 1col < 760px.

### Motion
- Reveals fade/translate in on scroll; aurora backdrop drifts (22s); carousels auto-advance.
  All gated on `prefers-reduced-motion`.

## Assets
- `assets/propential_mark.svg` (brand mark) + photography under `assets/`, `assets/v2/`,
  `assets/v3/` (project/lifestyle imagery referenced by the home carousel & feature blocks).
  The nav/footer/result marks are inline SVG in `partials.js` / form JS.

## Integrations / TODO (not wired)
- **Form submission**: `eligibility.js` and `apply.js` contain
  `TODO: wire to Formstack (medipay.formstack.com) + ActiveCampaign CRM` — connect with the
  referral code attached and an email fallback. Currently render a success state only.
- **Address autocomplete**: supply a Google Maps Platform key (Places API, billing enabled) via
  `<meta name="google-maps-key" content="…">` or `window.PROPENTIAL_MAPS_KEY`.
- **Referral-code crediting**: capture exists; align crediting with the referrer arrangement.

## Files in this bundle
- Pages: `index.html`, `how-it-works.html`, `product.html`, `calculator.html`, `faqs.html`,
  `eligibility.html`, `apply.html`, `legal/*.html`
- Styles: `propential.css`, `propential-v3.css`
- Scripts: `partials.js`, `site.js`, `home-v2.js`, `calculator.js`, `eligibility.js`,
  `apply.js`, `address-autocomplete.js`
- `assets/` — logo + imagery

## Deploy
No build step. Repo root = this folder. Vercel: New Project → Import → preset **Other**, no
build command, output `./`. (Netlify / GitHub Pages: drop the folder in.)
