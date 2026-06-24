# Propential Apply Form Rebuild — Handover Pack

Source of truth: live Formstack form **4653616** ("LIVE APP FORM - Reno Now"),
166 fields (~95 required), fetched 2026-06-24 via `scripts/show-fields.mjs`.

## Why this exists
The Propential `apply.html` page only collects ~24 values and maps 19 to Formstack.
The Formstack API does NOT enforce required fields, so submissions return 200 OK even
though ~70+ required underwriting fields arrive blank — which is why leads "don't drop
into Capital". This pack rebuilds the front-end form to mirror RenoNow exactly.

## How to use this pack (two-way handover)
1. Paste `01-claude-design-build-spec.md` into **Claude Design** as the build brief.
2. Append `02-option-lists.md`, `03-consent-verbatim.md`, and
   `04-jobtitle-autocomplete.md` (they fill the placeholders in the spec).
3. Include `05-reverse-handover-prompt.md` so Claude knows to return a v0 wiring prompt.
4. When Claude returns the design + its handover prompt, bring it back here (v0).
   `06-v0-wiring-notes.md` describes exactly what v0 will do to wire it to Formstack.

## The golden rule for a clean handover
Every input in the design MUST carry `data-fs-id="<id>"` and use the exact
`name`/`id` (the Variable) and option VALUES given. The backend maps on these verbatim.

## Files
- 00-README.md ............... this file
- 01-claude-design-build-spec.md  full front-end build spec (all steps & fields)
- 02-option-lists.md .......... every complete dropdown option list
- 03-consent-verbatim.md ...... exact character-for-character consent strings
- 04-jobtitle-autocomplete.md . type-ahead occupation picker spec + 358 titles
- 05-reverse-handover-prompt.md  what Claude must output when done
- 06-v0-wiring-notes.md ....... what v0 does on the return trip
