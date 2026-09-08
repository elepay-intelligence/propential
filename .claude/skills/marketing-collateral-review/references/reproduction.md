# Reproduction: screen, office print, commercial print, QR, distance

Partners download collateral from the media hub and use it three ways: on a screen, on the office printer, and occasionally through a commercial printer. A piece is ready when all three work without rework. This file holds the numbers.

## 1. Which channel is this file for?

| Channel | Format to supply | Colour | Size / resolution | Margins |
|---|---|---|---|---|
| Screen (web, email, social, on-screen PDF) | PNG or JPG for tiles; PDF with live text for documents | sRGB | Export at 2x the display size (a 1080 px tile as 2160 px) so it stays sharp on high-density phones | Keep platform overlays clear; check the platform's current safe-zone spec |
| Office print (partner desk printer) | PDF, A4 or A5, single pages | RGB or CMYK both fine | 300 dpi images at final size | 10 mm on all sides; office printers cannot print to the edge, so no bleed and no full-bleed backgrounds |
| Commercial print (press or digital press) | PDF/X-1a or PDF/X-4, fonts embedded or outlined | CMYK, or CMYK plus a named spot for metallic gold | 300 to 350 dpi photos; 800 to 1,200 dpi line art; logos as vector | 3 mm bleed on anything that runs off; 5 mm safe zone for text and logos (8 mm on posters) |

Sources: myprint247 design guide (bleed 3 mm, safe zone 4 to 8 mm, 300 dpi, line art 800 to 1,200 dpi); Vistaprint flyer guide (300 dpi); office-printer margins are the common 10 mm unprintable border on desktop printers, confirm with the partner's model if it matters.

## 2. The dark-brand problem

Propential is dark-first: ink (#0E0F0D) grounds with ivory and champagne. On screen that is the brand. On an office printer a full-page ink ground means:

- heavy toner or ink coverage, slow printing, curl on light paper;
- visible banding in the aurora gradient backdrop;
- a white unprinted border around the page, because desktop printers cannot bleed, which makes the piece look like a photocopy;
- gold that prints as flat mustard, because metallic gold cannot be reproduced in CMYK (CMYK Colour Online, AU).

Rule: **every dark piece that partners may print gets an ivory-ground twin** using the same layout, with ink text and champagne-deep rules or icons (never gold text on ivory; it measures 1.76:1). The dark version is the screen and commercial-print version; the light version is the office-print version. Name them so partners pick the right one (see Section 6).

For commercial print of the dark version: specify rich black to the printer's recipe (a common one is 100% K plus 10% C for large areas), keep total ink coverage inside the printer's limit (some cap at 220%), and either accept flat CMYK gold or specify a metallic spot ink (Pantone 871-type) or foil for the logo and headline. Ask for a printed proof; a screen proof will always look richer than the sheet.

## 3. Type size by channel

Capital-letter height is about 70% of the point size for most text faces, so 10 mm of capital height needs roughly 14 mm of point size, which is about 40 pt (1 pt = 0.3528 mm).

### Hand-held print (read at 30 to 50 cm)

| Text role | Minimum | Preferred for older readers |
|---|---|---|
| Body | 9 to 10 pt | 12 to 18 pt (CNIB Clear Print) |
| Small print / footnotes | 8 pt on A5 to A4; 10 pt on A3 (printer floor) | 9 to 10 pt |
| Reversed type (light on dark) | 10 pt, medium weight or heavier, sans preferred | 12 pt |
| Coloured type on coloured ground | 10 to 12 pt | 12 pt plus |

### Posters, pull-up banners, signage (read from a distance)

International Sign Association rule of thumb: 25 mm of capital-letter height for every 3 m of viewing distance, for comfortable reading. (Signs.com, "Signage 101: Letter Height Visibility".)

| Viewing distance | Minimum capital height | Approximate point size |
|---|---|---|
| 1 m | 8 mm | 32 pt |
| 2 m | 17 mm | 68 pt |
| 3 m | 25 mm | 100 pt |
| 5 m | 42 mm | 170 pt |

Use the headline row for the distance a passer-by will first notice the piece, and the body row for the distance they will stand at once they have stopped (usually about 1 m).

### Screen tiles

A 1080 px wide tile displays about 375 px wide on a phone, a scale of about 0.35. To read at 12 px on the phone a line needs about 35 px in the file.

| Text role in a 1080 px tile | Minimum in the file |
|---|---|
| Body | 36 px |
| Sub-headline | 48 px |
| Headline | 72 px |
| Legal or caption | 30 px (and expect it not to be read) |

## 4. QR codes

| Rule | Value | Why |
|---|---|---|
| Minimum printed size | 20 x 20 mm at arm's length | Smaller codes fail on ordinary phone cameras (Scanova) |
| Size for distance | Width = scanning distance / 10 (a code scanned from 2 m needs to be 200 mm wide) | The 10:1 rule (QRtrac, QR-Insights) |
| Quiet zone | At least 4 modules of blank space on every side (a module is the smallest square in the code) | The most common cause of failed scans (Scanova) |
| Contrast | Dark code on a light ground | Inverted codes (light on dark) are not read by many scanners; a champagne code on ink is inverted |
| Resolution | Vector, or 300 dpi at final size | Blurred modules do not decode |
| Label | Say what happens: "Scan to check eligibility, about two minutes" | Labelled codes are scanned far more often than bare ones (vendor data; treat the multiplier as directional) |
| Destination | Short, tracked, partner-specific link that opens a mobile page matching the promise | The website credits `?ref=` / `?partner=` automatically |
| Test | Print at final size; scan with an iPhone and an Android from the intended distance | The only test that counts |

## 5. Press traps

- Hairline borders or frames near the trim: guillotine drift of about 1 mm makes them visibly uneven. Keep frames 5 mm in or drop them.
- Gradients (the aurora backdrop) band in print, especially in dark tones. Add fine noise or simplify to flat tones for the print version.
- Very small reversed type built from more than one ink blurs with registration; keep small reversed type to a single ink (usually the ivory paper showing through) or make it bigger.
- Thin rules below 0.25 pt can drop out.
- Outline or embed fonts; a PDF that substitutes Fraunces with Times is not the brand.

## 6. Naming and versioning for the media hub

`Propential_[Piece]_[Reader]_[Size]_[Print|Screen]_v[n]_[YYYY-MM].pdf`

Examples: `Propential_ProjectFlyer_Customer_A5_Print_v2_2026-09.pdf`, `Propential_HowToRefer_PartnerOffice_A4_Print_v1_2026-09.pdf`, `Propential_Tile_Customer_1080_Screen_v1_2026-09.png`.

Also print the version and month in small type on the piece itself (footer, 7 to 8 pt, muted), so a stale copy on a partner's desk can be identified without opening a file list.

## 7. Fonts

Fraunces, Hanken Grotesk and JetBrains Mono are all Google Fonts under the SIL Open Font License. They can be embedded in PDFs and shared inside editable templates without a licence problem, which makes a controlled editable (a Canva template with locked brand elements, or a PDF with form fields for partner details) practical.
