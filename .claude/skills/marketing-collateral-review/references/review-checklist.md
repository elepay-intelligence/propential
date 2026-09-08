# Review checklist: the ten lenses

Each lens has (a) the checks to run, (b) why each check matters and where the principle comes from, and (c) a 0 to 3 score descriptor so two reviewers land on the same number. Score every lens that applies. Findings carry a severity (Blocker / Major / Minor / Polish) as defined in SKILL.md; the lens score summarises the lens as a whole.

Scores: **0** fails the reader · **1** weak, works despite itself · **2** solid, does the job · **3** exemplary, worth copying into the template.

Sources are abbreviated in square brackets and expanded at the end of this file.

---

## Lens 1: First impression

Run this before reading any copy. Readers form an impression of a design in well under five seconds; that impression decides whether they read on. [NN/g 5-second]

**Checks**
1. **Five-second test.** Look at the piece for five seconds, then look away and write down: what you saw first, second, third; what you think it is for; who you think it is for. Compare with the intended order (usually headline, key visual, call to action).
2. **Squint test.** Blur your eyes or shrink the image to a thumbnail. What survives is the real hierarchy. If the CTA or the headline disappears and a decorative element survives, the hierarchy is wrong. [NN/g squint]
3. **Eye path.** Sparse pieces (posters, single-message flyers) are read in a Z: top-left, top-right, diagonal down, bottom-right. Text-heavy pieces are read in an F: across the top, then down the left edge in shorter sweeps. The bottom-right is the natural resting point (the "terminal area" of the Gutenberg diagram), which is where the action should sit unless the layout deliberately builds another path. [Gutenberg/Z/F]
4. **Competition at the top scale.** Count how many elements share the largest size or the strongest colour. More than one means nothing is first.
5. **Thumbnail survival.** On a media hub, the piece is first seen as a 200 to 300 px preview tile. The headline and the brand should still be identifiable at that size.

**Score**
- 0: the five-second read gets the purpose or the audience wrong, or nothing stands out.
- 1: the headline is found but the second and third items are wrong or missing.
- 2: headline, visual, action are seen in that order.
- 3: as 2, and the piece is recognisably Propential at thumbnail size.

---

## Lens 2: Message hierarchy and cognitive load

A piece of collateral gets one job. Every extra choice the reader has to make lowers the chance they make any choice at all: decision time grows with the number of options (Hick's law), and landing pages with one call to action convert better than pages with several (13.5% with one, falling to about 10.5% with five or more in one published dataset; web data, directional for print). [Hick] [Whitehat CTA]

**Checks**
1. **Name the one job** from the piece alone. If you have to guess, that is a Major finding.
2. **Count the calls to action.** One primary. A secondary is acceptable only if it is visibly subordinate (ghost style, smaller, later in the path). Three or more is a defect.
3. **Count the size levels.** Two or three type sizes are enough to show what matters; a pleasing design rarely uses more than three distinct scales. [NN/g principles]
4. **Word budget.** Read the copy aloud in the time a real reader gives it: about five seconds for a poster, fifteen to thirty seconds for a hand-held flyer. If you cannot, the piece is overwritten. House rule for Propential collateral: poster = headline + one line + action; flyer front = headline + one short paragraph (about 40 words) + up to three proof points + action; detail goes on the back or on the website.
5. **Redundancy.** The same fact stated twice (the rate in the hero and again in the body) is noise unless the second instance does a different job (for example, sitting next to the repayment figure).
6. **Orphans.** Every element should belong to a visible group. Count elements that float alone; each is a decision the reader has to make.

**Score**
- 0: no single job, or three or more equal CTAs.
- 1: one job is guessable but the copy fights it (too many words, competing sizes).
- 2: one job, one primary CTA, three or fewer size levels.
- 3: as 2, and the copy reads in the time budget with nothing to remove.

---

## Lens 3: Typography and legibility

Type does most of the work in collateral. The thresholds below are the point where real readers stop reading; they change with channel and viewing distance, so pin those in intake first.

**Checks**
1. **Families.** Two or three typefaces at most, each with a fixed role. Propential already uses three (Fraunces display, Hanken Grotesk body, JetBrains Mono labels), so a fourth is a defect. [Vistaprint] [NN/g posters]
2. **Body size by channel.**
   - Hand-held print (A4, A5, DL): 9 to 10 pt minimum for general readers; 12 to 18 pt for readers with low vision, which includes a meaningful share of homeowners aged 55 plus. Small print never below the printer's floor (8 pt for A5 to A4, 10 pt for A3). [CNIB] [myprint247]
   - Posters and banners: 25 mm of capital-letter height for every 3 m of viewing distance is the signage rule of thumb. Capital height is roughly 70% of the point size, so a headline read comfortably from 3 m needs about 100 pt; a line read from 1 m needs about 32 pt. [ISA/Signs.com] Table in `reproduction.md`.
   - Screen tiles: a 1080 px wide tile is shown about 375 px wide on a phone (scale 0.35). Text that must read at 12 px on the phone therefore needs about 35 px in the file. Rule: body 36 px minimum, headline 72 px minimum, in a 1080 px tile. (Derived; the arithmetic is the evidence.)
3. **Reversed type** (light text on the dark Propential ground): 10 pt minimum in print, medium weight or heavier, sans-serif preferred. Thin strokes and fine serifs fill in with ink and break up; small reversed type built from more than one ink blurs with registration drift. Fraunces at small sizes reversed out of ink is a known risk. [Prepressure] [Paper Mill]
4. **Line length.** 45 to 75 characters per line for running text. Longer lines lose the reader at the return; shorter lines break too often. [Bringhurst]
5. **Leading.** Line spacing at least 25 to 30% above the point size (1.25 to 1.3 line height); heavier faces need slightly more. [CNIB]
6. **Case and style.** All caps only for short labels (Propential eyebrows are all caps with wide tracking, that is fine). No italics or light weights for body copy. [CNIB]
7. **Craft.** Widows, orphans, rivers, rag, hyphenation, consistent quote marks, tabular figures where numbers stack (fee tables, repayment figures).

**Score**
- 0: body text below the channel threshold, or reversed type below 10 pt at print size.
- 1: thresholds met but line length, leading or case rules broken.
- 2: thresholds and rules met, three families with fixed roles.
- 3: as 2, with figures tabular, rag controlled, no widows.

---

## Lens 4: Colour and contrast

Contrast is a legibility threshold, not a style choice. Print has no legal contrast standard; the web ratios are the accepted proxy and are what Canva's and Acrobat's checkers test. [Allyant] [Canva a11y]

**Checks**
1. **Ratios.** 4.5:1 for body text, 3:1 for large text (18 pt regular or 14 pt bold and above) and for meaningful graphics. Measure with `scripts/contrast.py`. Propential pairs are pre-measured in `propential-brand.md`; the ones that fail are champagne on ivory (1.76:1) and champagne-deep on ivory (2.78:1), so gold text on a light ground is a Blocker at any size, and gold works on light grounds only as a rule, fill or icon.
2. **Never dim text to de-emphasise it.** Use size, weight and space instead. Faded secondary text is the most common accessibility failure in premium-look design. [NN/g principles]
3. **Colour count.** Three colours or fewer per piece (ground, text, accent). The brand allows ink, ivory and champagne; use the tints for depth, not as extra hues. [NN/g posters]
4. **Meaning not by colour alone.** Anything encoded in gold (a highlighted figure, a selected option) also needs a size, weight or shape difference, for colour-blind readers and for mono office printing.
5. **Gamut.** Metallic gold does not exist in CMYK; #D6B15E prints as a flat mustard. Either accept flat gold, or specify a metallic spot ink or foil for press runs. Screen previews will always look richer than the print. [CMYK Online]
6. **Dark grounds in print.** Full-bleed ink backgrounds on office printers give heavy coverage, banding and unprinted white edges. Any dark piece intended for partner printing needs a light variant. See `reproduction.md`.

**Score**
- 0: any text below 3:1, or gold text on a light ground.
- 1: ratios pass but hierarchy relies on dimmed text or on colour alone.
- 2: all text passes 4.5:1 (large text 3:1), three colours or fewer.
- 3: as 2, with a print-safe light variant or a spot-colour spec where the piece will be printed.

---

## Lens 5: Layout, grid and grouping

Readers perceive groups before they perceive items. Proximity, alignment and repetition tell them what belongs together without a word of copy. [NN/g principles] [Gestalt]

**Checks**
1. **Grid.** Consistent outer margins; every element aligns to at least one other element's edge. Count the number of distinct left edges; more than three or four usually means no grid.
2. **Proximity.** Labels sit closer to their value than to anything else; captions sit closer to their image than to the next block. Test: cover the copy and ask what the image "belongs to".
3. **Balance.** Visual weight is distributed deliberately, symmetric for calm, asymmetric for energy. The brand leans asymmetric (1.1 : 0.9 two-column headers) and calm. [NN/g principles]
4. **White space as a material.** Space around the headline and the CTA is what makes them read as important. A piece that fills every corner has no hierarchy left to give.
5. **Safe zones.** Print: nothing important within 5 mm of the trim (8 mm on posters); commercial print also needs 3 mm bleed on images that run off the page. Screen: keep platform overlays clear (profile chips, captions, buttons) and check the current spec for the platform in question. [myprint247]
6. **Set consistency.** Partners download several pieces. Same margins, same header treatment, same CTA position across the set so the set reads as one system. Judge the piece against its siblings if they exist.

**Score**
- 0: no discernible grid, or important elements inside the trim safe zone.
- 1: a grid exists but proximity or alignment breaks grouping somewhere.
- 2: grid, proximity and safe zones hold.
- 3: as 2, and the piece is interchangeable with its siblings without adjustment.

---

## Lens 6: Imagery and brand

An image creates a stronger impression than the copy beside it, so it has to carry the same message and the same brand as the words. [RG 234.145, cited for the perception point only]

**Checks**
1. **Resolution at output size.** 300 dpi at final print size (an A4 full-bleed photo needs about 2,500 by 3,600 px); screen assets at 2x their display size. Line art and logos as vector. [Vistaprint] [myprint247]
2. **Image does a job.** It shows the outcome the reader wants (the finished terrace, the pool, the kitchen) rather than a stock gesture. Propential's library is warm, late-light, architectural, with people small and unposed. Bright, saturated, smiling-at-camera stock is off-brand.
3. **Text over image.** Any copy on a photo needs a scrim or a quiet area of the image behind it, and still has to pass the contrast ratio.
4. **Logo.** Correct wordmark ("Prop" in ivory, "ential" in champagne), the keyhole-house mark in the gold gradient, never stretched, never recoloured, never on a busy photo without a clear ground. Clear space at least the height of the mark's roof on all sides (house rule until a brand guide fixes it).
5. **Co-branding slot.** Partner collateral needs a defined place for the partner's logo and contact, with a rule for the size relationship (Propential leads; partner mark no larger than the Propential mark). A piece without this slot will be improvised by every partner, differently.
6. **Voice.** Plain, confident, a little wry, no exclamation marks, no "unlock" clichés except the brand's own keyhole idea. Headlines pair a short clause with a payoff ("Days to start, years to finish", "Questions, answered plainly"). Numbers are spoken plainly ("One clear rate").

**Score**
- 0: wrong logo treatment, off-brand imagery, or an image below output resolution.
- 1: on-brand but the image is decorative rather than doing a job, or text sits on a busy area.
- 2: imagery, logo and voice match the website.
- 3: as 2, with a defined co-branding slot and image sourced from or matching the brand library.

---

## Lens 7: Action path

The piece exists to move the reader to one action. Judge the whole path: notice, understand, act, arrive.

**Checks**
1. **CTA copy.** A verb phrase that names the outcome and matches the website's buttons: "Check eligibility", "Calculate repayments", "Start your project". Not "Learn more", not "Click here".
2. **CTA position and form.** At the terminal area or at the end of the reading path; visually distinct (the gold gradient pill is the brand's primary button); one per piece.
3. **QR code.** Minimum 20 by 20 mm for arm's-length scanning; scanning distance is about ten times the code's width, so a code on a poster read from 2 m needs to be 200 mm wide. Quiet zone (blank margin) of at least four modules on every side. Dark code on a light ground; a gold code on ink is inverted and many phone cameras will not read it. Label it with what happens next ("Scan to check eligibility, two minutes"). Test it printed at size on an iPhone and an Android. [Scanova] [QR size guides]
4. **URL and phone.** Short, spoken form, no protocol prefix ("propential.com.au", not "https://www."). Phone number grouped as it is said aloud.
5. **Attribution.** The website already accepts a partner code in the address (`?ref=` or `?partner=`) and pre-fills it on the application form. Partner collateral should point its QR code and printed link at a partner-specific address so the referral is credited automatically, instead of relying on the customer to type a code.
6. **Landing match.** The page the QR or link opens must continue the promise on the piece: same headline idea, same action, mobile-friendly. A flyer that promises "check eligibility in minutes" should land on the eligibility page, not the home page.
7. **Expectation setting.** Tell the reader what they will need and how long it takes. This lowers the perceived cost of acting.

**Score**
- 0: no CTA, or a QR code that fails the size or quiet-zone rule at the stated distance.
- 1: CTA present but generic wording, or the landing page does not match.
- 2: verb CTA, correct QR size and contrast, matching landing page.
- 3: as 2, with partner attribution built into the link and a labelled QR.

---

## Lens 8: Audience fit

The media hub serves three readers, and a piece can serve only one at a time.

| Reader | What they need from the piece | Tone and density |
|---|---|---|
| **Customer** (homeowner considering a project) | The outcome, the one number that matters to them, what to do next, what it will cost them to find out. | Plain English, short sentences, one action, generous space. Explain or avoid "caveat", "second mortgage", "comparison rate". |
| **Partner** (builder, agent, broker deciding whether and how to refer) | Why refer, how the referral works, what the customer experience will be, how they get credited, who to call. | Confident and specific; jargon allowed; process diagrams welcome; still one primary action ("Register as a partner", "Get your partner link"). |
| **Partner office** (staff who hand out or process) | A checklist, a script, the steps, the contact. | Task-first, dense is fine, must print legibly in mono on an office printer, needs a version date. |

**Checks**
1. **Declare the reader.** The piece's file name and its own footer should say which reader it is for. A piece that tries to serve two readers serves neither.
2. **Language level.** Customer pieces in plain English; read them aloud and cut anything you would not say to a neighbour. Partner and office pieces may use the trade's terms.
3. **Jargon audit.** List every term a customer would not know. Each one is either explained in place or removed.
4. **Right facts for the reader.** A customer does not need the fee table; a partner does not need the lifestyle hero.
5. **Cultural and age fit.** Photography that includes the real customer base (homeowners across ages and backgrounds); no idioms that do not travel.

**Score**
- 0: reader cannot be determined, or the piece mixes two readers.
- 1: reader is clear but language or facts are pitched at a different reader.
- 2: one reader, right facts, right language.
- 3: as 2, with the reader named on the piece and in the file name.

---

## Lens 9: Reproduction and package readiness

The media hub is a distribution system, not a folder. A piece is "ready" when every likely use of it works without the partner having to fix anything. Detail in `reproduction.md`.

**Checks**
1. **Uses supported.** For each piece: screen (PNG or JPG, sRGB, 2x), office print (PDF, A4 or A5, 10 mm margins, no bleed, light ground or low ink coverage), commercial print (PDF/X, CMYK, 3 mm bleed, 300 dpi, fonts embedded). State which are supplied and which are missing.
2. **Print-safe variant of dark pieces.** The brand is dark-first. A dark A4 on an office printer is slow, expensive, banded and edged in white. Every dark piece that partners may print needs an ivory-ground twin.
3. **File naming.** `Propential_[Piece]_[Reader]_[Size]_[Print|Screen]_v[n]_[YYYY-MM].pdf`. The version and month also appear in small type on the piece, so a stale copy on a partner's desk can be identified.
4. **Editable vs locked.** Partners will want to add a logo and a phone number. Supply a locked PDF plus a controlled editable (a Canva template with brand elements locked, or a PDF with form fields), not the InDesign source. Fraunces and Hanken Grotesk are Google Fonts under open licences, so they can be embedded and shared.
5. **Preview.** The hub's thumbnail is the first impression (Lens 1, check 5). Supply a purpose-made preview image if the auto-thumbnail is illegible.
6. **Press traps.** No hairline borders near the trim (guillotine drift makes them uneven); gradients band in print; rich black and total ink coverage per the printer's spec. [myprint247]

**Score**
- 0: the piece cannot be used in one of its stated channels without rework.
- 1: usable but only one format supplied, or no print-safe variant of a dark piece.
- 2: all stated uses supplied, named and versioned.
- 3: as 2, with a controlled editable and a purpose-made preview.

---

## Lens 10: Accessibility and inclusion

A share of every audience has low vision, colour-vision deficiency, or reads English as a second language. Designing for them improves the piece for everyone.

**Checks**
1. **Clear Print.** 12 to 18 pt body for accessible print, leading 25 to 30% above the point size, medium weights, no text over patterned backgrounds or watermarks, matte stock to cut glare. [CNIB]
2. **Contrast** as in Lens 4, and no meaning by colour alone.
3. **Digital PDFs.** Tagged, correct reading order, alt text on images, real text rather than outlined type where the PDF is for screen. Canva's accessibility checker covers contrast, type size and alt text; Acrobat's checker covers tags and reading order. [Canva a11y] [Adobe]
4. **Plain language.** Short sentences, everyday words, one idea per sentence. Test by reading aloud.
5. **Representation.** Photography that reflects the real range of homeowners, in age and background, without tokenism.

**Score**
- 0: fails contrast, or a screen PDF with no live text.
- 1: passes contrast but ignores Clear Print sizing or tagging.
- 2: Clear Print sizing where the piece is customer-facing print, tagged where digital.
- 3: as 2, plus plain-language and representation checks passed.

---

## Verdict rule

- Any **Blocker** finding → **Not ready**.
- No Blockers, any lens at **0** → **Not ready**.
- No Blockers, any lens at **1** → **Ready with fixes**; list the fixes first.
- Everything at 2 or 3 → **Ready**.

---

## Sources

- [NN/g 5-second] Nielsen Norman Group, "Testing Visual Design: A Comprehensive Guide" and "Validate Your Visual Design: 6 Methods".
- [NN/g squint] Nielsen Norman Group, "Squint Test" (video).
- [NN/g principles] Nielsen Norman Group, "5 Principles of Visual Design in UX" (scale, hierarchy, balance, contrast, Gestalt; "no more than 3 different sizes"; never reduce text contrast for emphasis).
- [NN/g posters] Nielsen Norman Group, "Applying UX Principles to the Visual Design of Graphical Artifacts: The Case of the Heuristics Posters" (three colours per poster, squint test, proximity findings).
- [Gutenberg/Z/F] Vanseo Design, "3 Design Layouts: Gutenberg Diagram, Z-Pattern, and F-Pattern"; Smashing Magazine, "Design Principles: Compositional Flow and Rhythm". F-pattern originates in Nielsen's eye-tracking studies of text-heavy pages.
- [Hick] Hick's law, as summarised in Chariot Creative, "Hick's Law in Web Design".
- [Whitehat CTA] Whitehat SEO, "Understanding CTAs: Benchmarks & Strategy" (single-CTA landing pages 13.5% vs 10.5% at five or more; web data).
- [CNIB] CNIB Foundation, "Clear Print Accessibility Guidelines" (12 to 18 pt, leading 25 to 30%, medium weights, no italics or all caps for body, matte finish, no watermarks).
- [myprint247] myprint247 design guide (3 mm bleed; 4 mm safe zone, 8 mm on posters; 300 dpi; minimum 8 pt A5 to A4, 10 pt A3; avoid reversed or coloured text below 10 pt; avoid borders near trim; gradients band).
- [Prepressure] Prepressure.com, "Reversed type" (10 pt minimum, heavier weights, sans preferred).
- [Paper Mill] The Paper Mill Store, "Unlocking the Potential of Reversed Type".
- [ISA/Signs.com] Signs.com, "Signage 101: Letter Height Visibility" (International Sign Association rule: 25 mm letter height per 3 m).
- [Bringhurst] Robert Bringhurst, The Elements of Typographic Style (45 to 75 characters per line).
- [Allyant] Allyant, "Does WCAG Apply to Print?" (4.5:1 and 3:1 as the print proxy).
- [Canva a11y] Canva Help Center, "Use Design Accessibility".
- [Adobe] Adobe, "Create and verify PDF accessibility, Acrobat Pro".
- [CMYK Online] CMYK Colour Online (AU), artwork requirements (metallic gold cannot be reproduced in CMYK).
- [Scanova] Scanova, "QR Code Guidelines" (20 by 20 mm minimum, quiet zone four modules, dark on light, CTA label).
- [QR size guides] QRtrac and QR-Insights size guides (10:1 distance-to-width rule).
- [Vistaprint] Vistaprint, "How to Design a Flyer That Works" (two or three typefaces; 300 dpi).
- [RG 234.145] ASIC Regulatory Guide 234 (June 2026), paragraph 145: images create a stronger impression than words. Cited here only for the perception point; legal review is out of scope for this skill.
