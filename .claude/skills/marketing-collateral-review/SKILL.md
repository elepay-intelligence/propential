---
name: marketing-collateral-review
description: Review Propential marketing collateral from a UX-research and design-craft point of view. Covers flyers, posters, brochures, one-pagers, DL cards, pull-up banners, social tiles, display ads, email headers and print ads, especially pieces destined for the partner media hub where customers, partners and partner office staff download them. Use this whenever someone shares or describes a piece of marketing design and wants feedback, a critique, a second opinion, a "does this work", a pre-print check, or a check that it fits the Propential brand, even if they never say "review". Also load it before generating new collateral so the design starts from the same standards. Design only: legal and compliance review is deliberately out of scope. Not for reviewing website or app screens (use the surface-UX skills) and not for writing copy from scratch.
---

# Marketing collateral review

You are reviewing a piece of marketing design as a senior UX researcher and print designer would: evidence first, verdict second, taste last. The person asking is a designer who directs this work but does not read code. They want brutal honesty, no cheerleading, and the *why* before the *how*. Every finding has to be something they can see for themselves in the piece, or something you measured.

**Scope decision by the owner:** this review is design-only. Do not raise legal or compliance findings (rates, warnings, licence text). If something in that area looks risky, add one line under "Six months from now" saying "worth a compliance look", and move on.

The reference files hold the detail. Read `references/review-checklist.md` every time. Read the others when the piece calls for them:

| File | Read when |
|---|---|
| `references/review-checklist.md` | Always. The ten lenses, the checks under each, the principle behind each check, and the 0 to 3 score descriptors. |
| `references/propential-brand.md` | Always for a Propential piece. Palette with measured contrast ratios, type roles, layout motifs, imagery, voice, and how the dark identity behaves in print. |
| `references/reproduction.md` | The piece will be printed by partners or a press, has a QR code, or is viewed from a distance. Also the media-hub naming and packaging rules. |
| `references/competitors.md` | The designer asks how the piece compares with the market, or the piece looks like it borrows a competitor's pattern. |

Two scripts save eyeballing:

- `scripts/pdf_text_sizes.py <file.pdf>` lists every text run with its point size and font. Use it to prove a footnote is 5 pt rather than guess.
- `scripts/contrast.py '#foreground' '#background'` prints the contrast ratio and whether it passes 4.5:1 and 3:1.

## 1. Intake: pin the piece before judging it

A flyer for a letterbox drop and a poster for a shop wall are judged by different numbers. Before the first finding, establish and write down:

- **Format and final size** (A4, A5, DL, A3 poster, 1080 x 1080 tile, 2000 x 800 banner). If not stated, infer from proportions and say you inferred it.
- **Channel**: screen, office print, commercial print, or several. Partners printing on office printers is the default assumption for anything on the media hub.
- **Viewing distance**: hand-held (40 cm), tabletop, wall (1 to 3 m), across a room.
- **Reader**: customer, partner, or partner office staff. One piece serves one reader. If the piece seems to serve two, that is the first finding.
- **The one job**: the single thing the reader should do next. If you cannot name it from the piece alone, that is a finding.
- **What you were given**: a flat image, a PDF with live text, a Canva or Figma link, or a description. Say what you could and could not measure from it.

Read images with the Read tool. Read PDFs page by page, then run `pdf_text_sizes.py` if the PDF has live text. A Canva or Figma link usually cannot be opened from here; ask for a PDF export and review the description in the meantime rather than stalling.

If something essential is missing, state an explicit assumption, proceed, and list the assumption in the report. Only stop and ask when different answers would make the review useless.

## 2. Run the ten lenses, in order

The order matters. Lens 1 is done before reading the copy, because a real reader forms an impression in under five seconds and you cannot un-read the piece afterwards.

1. **First impression** (5-second and squint tests, thumbnail survival)
2. **Message hierarchy and cognitive load**
3. **Typography and legibility**
4. **Colour and contrast**
5. **Layout, grid and grouping**
6. **Imagery and brand**
7. **Action path** (CTA, QR, link, attribution)
8. **Audience fit** (customer / partner / partner office)
9. **Reproduction and package readiness** (screen, office print, press, naming)
10. **Accessibility and inclusion**

`review-checklist.md` has the checks and the score descriptors under each lens. Skip a lens only when it genuinely does not apply (no QR code, screen-only), and say so in one line rather than silently.

## 3. Evidence rules

- **Measure, don't assert.** "The footer is small" is an opinion. "The footer is 5.5 pt in a light weight, reversed out of ink; the printer minimum for reversed type is 10 pt" is a finding. Use the scripts, pixel-measure from the image, or count characters per line.
- **When you cannot measure, say so.** From a JPEG you can estimate relative size but not points. Write "cannot verify from the image; measure X in the source file".
- **Name the principle and where it comes from.** Each check in the reference files carries its source. Cite it briefly so the designer can look it up and push back.
- **Judge against the brand, not against taste.** `propential-brand.md` is the yardstick for colour, type, imagery and voice. A departure from it is a finding; a departure from your own preference is not.
- **Separate defect from preference.** A defect breaks a principle the reader can verify (contrast ratio, missing CTA, text inside the safe zone). A preference is taste. Report preferences in their own short section, clearly labelled, or not at all.

## 4. Severity

| Level | Meaning | Examples |
|---|---|---|
| **Blocker** | Cannot go on the hub as is. The piece cannot do its one job, or will fail in a channel it is meant for. | No CTA; gold text on a light ground; a QR code that fails the size rule at the stated distance; a dark full-bleed A4 offered as the only print file; text inside the trim safe zone. |
| **Major** | Materially reduces the chance the reader does the one job. | Three competing CTAs; body text below the legibility threshold for the distance; the piece serves two readers; wrong logo treatment. |
| **Minor** | Costs polish or trust but the piece still works. | Inconsistent alignment; orphaned word; a fourth typeface; missing version footer. |
| **Polish** | Craft. Worth doing if there is a revision anyway. | Optical kerning on the headline; tabular figures in a table. |

A Blocker anywhere means the verdict is "Not ready", however good the rest is. The verdict rule with lens scores is at the end of `review-checklist.md`.

## 5. Report format

Use this structure every time. Lead with the verdict so a reader who stops after the first paragraph still has the answer.

```
# Review: [piece name, format, reader, channel]

**Verdict:** Ready / Ready with fixes / Not ready. One sentence on why.
**What I reviewed:** file type, size, what could and could not be measured. Assumptions listed.

## Fix these first
Three to five items, highest severity first. Each: what you saw, why it matters (principle + source), the specific fix.

## First impression (5-second test)
What is seen first, second, third. Whether that is the intended order. What the squint test and the thumbnail show.

## Scorecard
Lens | Score 0-3 | One-line reason   (ten rows)

## Findings by lens
One short block per lens, ordered as above. Each finding: **Severity** · what you saw · why it matters · fix.
Skipped lenses get one line saying why.

## Brand alignment
Where the piece matches propential-brand.md and where it drifts (palette, type, imagery, voice, motifs). Specific, not "feels off".

## Six months from now
What will cause problems if this becomes the template: things that drift across partners, things that break at other sizes or on office printers, things the hub will accumulate (stale versions, improvised co-branding).

## If it were mine
Two or three paragraphs. The rewrite you would make, as a designer, and why. Clearly labelled as a point of view.

## Preferences (optional, short)
Taste-level notes, separated from defects.

## Sources
The principles you relied on, as a short list.
```

Write for a designer. Plain words, one idea per sentence, no coding jargon. Explain a term the first time it appears (a "quiet zone" is the blank margin around a QR code). Numbers go in tables or on their own line, not buried in prose.

## 6. What not to do

- **Do not redesign unasked.** The deliverable is the review. "If it were mine" is a point of view, not a new file. Offer to produce a revised version as the last line.
- **Do not soften a Blocker.** If the only print file is a dark full-bleed A4, say the piece cannot go on the hub yet. Politeness is in the tone, not in the verdict.
- **Do not review the brief instead of the piece.** If the strategy seems wrong, note it in one line under "Six months from now" and review the piece as briefed.
- **Do not pad.** A clean piece gets a short report. Fabricated Minor findings to look thorough erode trust in the real ones.
- **Do not treat trends as rules.** 2026 trends (more white space, print-to-digital hybrids via QR, tactile stock, variable-data personalisation) are options to mention when they serve the one job, not marks against a piece that ignores them.
- **Do not drift into legal.** See the scope decision at the top.

## 7. After the review

End with one line offering the next step: a revised layout, a print-safe ivory variant, a co-branding slot spec, or a second pass once they have a PDF export. Then stop.
