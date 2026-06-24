# FINAL DELIVERABLE — Claude must output a "v0 backend handover prompt"

Paste this instruction at the END of the Claude Design brief.

---
When the design is approved, output a SINGLE markdown prompt I can paste into v0.
It must contain ONE table listing EVERY field you built, with these columns:

  Step | Label | Control type | name (variable) | data-fs-id | Options (verbatim) |
  Required? | Conditional rule (parent variable + trigger value)

Control type must be one of: text, number, email, tel, date, radio,
single-select, multi-checkbox, consent-checkbox, address, type-ahead.

Also include:
- A "Deviations" section listing ANY field you renamed, any option text you changed,
  or anything you could not implement as specified (ideally: none).
- Confirmation that the form posts NOWHERE (front-end only) and that every input
  carries its `data-fs-id`.
- For address fields, list the 5 sub-input names (X_address, X_address2, X_city,
  X_state, X_zip) and their shared data-fs-id.
- For consent checkboxes, confirm the `value` equals the verbatim string from file 03.

This lets v0 map name -> FS-id into lib/apply-mapping.ts FIELD_IDS with zero guesswork.
Do NOT invent field IDs — use only the ids provided in the build spec.
