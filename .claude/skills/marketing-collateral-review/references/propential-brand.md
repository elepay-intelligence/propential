# Propential: the brand as it actually is

Everything here is taken from the live site and its source (propential.com.au, `propential.css`, `propential-v3.css`, `partials.js`, `assets/`), not from a brand guide, because no brand guide exists yet. Where a rule is inferred from consistent use rather than written down, it is marked *house rule*. Use this file as the yardstick when judging whether a piece of collateral "is Propential".

## 1. The idea

Propential is a property-secured loan for owners who want to improve the place they already own. The brand's single metaphor is **the key**: the value is already in the house, Propential turns the key. It shows up as the keyhole-house mark, the "door reveal" and keyhole cut-out on the home page, the eyebrow "// Open the door", and the line "The value is already there. Propential turns the key."

The stated design intent in the stylesheet header: *"Ink, ivory & champagne. Restrained, premium, plain-spoken."* That is the brief for every piece of collateral too.

**Energy:** calm, unhurried, confident. Nothing shouts. Gold is used as a highlight, not a flood. The tone is closer to a good architect's practice than to a lender.

## 2. Palette (measured)

| Token | Hex | Role |
|---|---|---|
| ink | #0E0F0D | Primary ground on screen |
| olive / olive-2 | #1D1E15 / #16170F | Card and panel grounds on ink |
| bg-0 / bg-1 / bg-2 | #0A0B09 / #111310 / #16180F | Backdrop layers behind the aurora |
| champagne | #D6B15E | The accent: eyebrows, key words, rules, active states |
| champagne-bright | #ECD58C | Top of the gold gradient, highlights |
| champagne-deep | #B6873A | Bottom of the gold gradient; the only gold dark enough to use as a rule on ivory |
| ivory | #F3EEE2 | Headline colour on ink; the light ground when a light surface is needed |
| text | #EAE5D9 | Body on ink |
| text-muted | #A7A399 | Secondary copy on ink |
| text-faint | #6F6C63 | Footnotes on ink (see contrast note) |
| gold gradient | 180deg #ECD58C → #D6B15E (52%) → #B6873A | Primary button, logo mark, gradient headline words |
| lines | champagne at 18% / ivory at 8 to 10% | Hairline strokes on cards and dividers |

### Contrast ratios (WCAG formula, measured with `scripts/contrast.py`)

| Pair | Ratio | Body text (4.5:1) | Large text (3:1) |
|---|---|---|---|
| ivory on ink | 16.60:1 | pass | pass |
| text on olive | 13.38:1 | pass | pass |
| champagne-bright on ink | 13.23:1 | pass | pass |
| champagne on ink | 9.43:1 | pass | pass |
| ink on champagne (button label) | 9.43:1 | pass | pass |
| muted on ink | 7.63:1 | pass | pass |
| faint on ink | 3.66:1 | **fail** | pass |
| ink on ivory | 16.60:1 | pass | pass |
| faint on ivory | 4.53:1 | pass | pass |
| champagne-deep on ivory | 2.78:1 | **fail** | **fail** |
| muted on ivory | 2.17:1 | **fail** | **fail** |
| champagne on ivory | 1.76:1 | **fail** | **fail** |

What this means for collateral:
- On the dark ground everything passes except `text-faint`, which is fine for large footnotes only. Do not set body copy in faint.
- **On a light ground, gold is not a text colour.** Champagne on ivory is 1.76:1; even champagne-deep is 2.78:1. On the ivory (office-print) variants, gold is for rules, icons, the mark and fills behind ink text. Headline words that are gold on the dark version become ink, or italic, on the light version.
- `text-muted` also fails on ivory. Light-variant secondary copy uses `text-faint` (#6F6C63, 4.53:1) or ink at reduced weight.

## 3. Type

Three families, each with one job. All three are Google Fonts under open licences.

| Role | Face | How it is used |
|---|---|---|
| Display | **Fraunces** (variable serif, optical sizes) | Headlines, big figures ($525, 17.95%, 01 02 03), card titles. Always weight 400. Italic is used for the payoff half of a headline ("in *plain terms*", "start to *finish*"). |
| Body | **Hanken Grotesk** | Paragraphs, buttons (600), nav, footers. Base 14 px on screen with 0.005 em tracking. |
| Label | **JetBrains Mono** | Eyebrows, micro-labels, tickers, table headers, counters ("02 / 05"). Uppercase, 0.58 to 0.8 rem, tracking 0.08 to 0.18 em. Interior-page eyebrows carry a `// ` prefix. |

Scale in practice (screen): headline `clamp` roughly 2.6 to 4.6 rem; section titles 1.6 to 2.5 rem; body 0.875 to 1 rem; labels 0.56 to 0.8 rem. Headings are set tight (line-height 1.0 to 1.05) with `text-wrap: balance`. Body line-height sits around 1.45 to 1.6.

*House rules for print:* Fraunces headline plus Hanken body plus Mono labels is already three families; a fourth is a defect. Mono labels below 8 pt in print lose their letterspacing and become noise; keep them at 8 pt or larger. Fraunces at small sizes reversed out of ink is at risk of filling in; body copy on dark print stays in Hanken.

## 4. Layout motifs (what makes a page look like Propential)

1. **Floating pill navigation** on a dark translucent bar with hairline stroke; mono uppercase links; two CTAs (ghost "Calculate", gold "Check eligibility").
2. **Eyebrow → headline → lead** stack at the top of every page. Eyebrow in mono gold (with `// ` on interior pages, or as a stroked pill with a gold dot on the home hero). Headline in Fraunces with the second clause in gold or italic gold. Lead paragraph in muted Hanken.
3. **Two-column page header**, 1.1 : 0.9, headline left, lead right, collapsing to one column under 760 px.
4. **Glass cards**: olive ground, 18 px radius (26 px for large), 1 px stroke at 8 to 18% opacity, generous inner padding (26 to 34 px). Mono label at top, Fraunces value, muted note.
5. **Big figures**: Fraunces numerals large (2.2 to 4.6 rem) with a small Hanken unit ("/ mo") beside them.
6. **Numbered steps** "01 02 03" in Fraunces gold, left, with title and copy right, divided by hairlines. Numbers are used only where the content is a real sequence.
7. **Ticker band**: mono uppercase project types separated by gold four-point stars (✦), on olive.
8. **Ivory as highlight**: the active carousel card flips to an ivory ground with ink text; the "Plain terms" tiles and a "door reveal" panel use ivory surfaces on the dark page. Ivory is a spotlight, not a default.
9. **Aurora backdrop**: slow-drifting warm gradient mesh plus a very faint grid, fixed behind the page. On collateral this becomes a soft warm glow behind the headline, never a hard gradient band.
10. **Hairline curves**: thin champagne paths (18% opacity) that route between sections as connectors.
11. **Disclosure boxes**: stroked panel with a gold bullet and bold lead line, body in text colour. The pattern is reused for any "important information" block.
12. **Buttons**: primary = gold gradient pill, ink label (#221A08), 12 px radius, soft gold glow shadow, arrow glyph after the label; ghost = transparent with ivory 28% stroke, hover to champagne. Labels are verb phrases.
13. **Radii**: 12 px buttons, 18 px cards, 26 px large panels, 999 px pills. Nothing square-cornered.
14. **Space**: sections breathe; padding uses `clamp()` so it scales. Content max width 1140 px.

## 5. Logo

- **Mark:** the keyhole-house. A roof line and a rounded house body in a 9-unit stroke, with a keyhole (circle plus trapezoid) at the centre, all in the gold gradient. Source: `assets/propential_mark.svg`.
- **Wordmark:** "Prop" in ivory Fraunces regular, "ential" in champagne Fraunces italic, no space. In the nav the mark sits left of the wordmark.
- *House rules:* never stretch, never recolour outside gold gradient / flat champagne / ivory / ink; on ivory grounds use the mark in champagne-deep or ink; clear space at least the mark's roof height on all sides; minimum mark height 8 mm in print, 24 px on screen.

## 6. Photography

The library (`assets/v2`, `assets/v3`) is consistent:
- **Light:** late afternoon, low sun, long shadows, warm haze. Never midday, never flash, never blue-cast.
- **Subject:** architecture and finished spaces: terraces, kitchens, limestone walls, a pool edge, glass doors opening to a garden. The renovation as outcome, not as building site.
- **People:** one person at most, small in frame, turned away or in profile, still. Never smiling at camera, never a couple high-fiving, never a tradesperson posing.
- **Palette in the image:** sand, stone, olive green, bronze, ivory linen. Matches the brand palette, which is why the photos can sit under gold type without a fight.
- **Treatment:** on dark pages the photo is dimmed toward ink at the edges (a scrim) so ivory type stays legible; the image band section shows a photo at about 40% brightness.

Stock that is bright, saturated, centred-smiling or obviously staged is off-brand, and so is anything that reads as a construction site.

## 7. Voice

- **Plain and exact.** "One clear rate." "Two fees, both shown up front." "Nothing hidden." Short declaratives.
- **Two-beat headlines** with a payoff: "Days to start, years to finish." "A property loan, in plain terms." "Questions, answered plainly." "Three steps, start to finish." "The value is already there. Propential turns the key."
- **Calm warmth.** "with an Australian based support person at the other end of every application."
- **No exclamation marks, no "amazing", no urgency, no "unlock" except the brand's own key idea** (the footer uses "Unlock your property's true value" once).
- **CTA verbs** used on the site: Check eligibility · Calculate repayments · Start your project · Start an application · How the product works · Read the FAQs. Collateral should reuse these rather than invent new ones.
- **Numbers spoken plainly:** "$5,000 – $175,000", "17.95% p.a.", "1–7 years up to $50,000".

## 8. What the brand is not

- Not a bank: no navy, no royal blue, no stock handshake.
- Not a fintech: no lime, no purple gradients, no rounded-everything app UI, no emoji.
- Not luxury-for-its-own-sake: gold is restrained (the stylesheet even has a "restrained" gold setting); the imagery is domestic, not yachts.
- Not loud: the loudest thing on any page is one gold headline word.

## 9. Translating the brand to collateral

| Screen habit | Print / collateral translation |
|---|---|
| Ink full-bleed ground | Screen and commercial print only. Office-print variant on ivory with ink text; gold for rules and the mark. |
| Gold gradient headline word | Flat champagne on dark print (gradients band); ink italic on the ivory variant. |
| Aurora glow backdrop | Soft warm vignette at most; drop for office print. |
| Hairline strokes at 8 to 18% | Increase to 20 to 30% for print or they disappear; minimum 0.25 pt. |
| Mono micro-labels at 0.56 rem | 8 pt minimum in print. |
| Gold glow shadow on buttons | Drop in print; a flat gold pill reads fine. |
| Photo dimmed under ivory type | Same rule, and the scrim must still give 4.5:1. |

## 10. Facts to keep consistent across pieces (as published on the site, September 2026)

Loan range $5,000 to $175,000 · one rate, 17.95% p.a. · terms 1 to 7 years up to $50,000, up to 10 years above · principal and interest, fortnightly or monthly · no early-repayment penalty · secured by a caveat in most states, second mortgage in QLD and NT · two fees, an establishment fee and a monthly account-keeping fee, both scaling by loan band · conditional approval within minutes during NSW business hours (footnoted). If a piece states a fact that differs from the site, that is a finding regardless of which one is right.
