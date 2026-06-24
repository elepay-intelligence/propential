# What v0 does on the return trip (backend wiring)

When the Claude design + its handover prompt come back, paste them into THIS v0 chat.
v0 will then, in the propential repo:

1. lib/apply-mapping.ts
   - Set FIELD_IDS[variable] = "<data-fs-id>" for all ~130 variables (no empty strings).
   - Rebuild applySchema (Zod) with every new field + conditional .refine() rules
     mirroring the "Conditional rule" column.
   - Fix value transforms:
       * TERM_MAP capped at "1 Year".."7 Years" (remove 8/9/10).
       * EMPLOYMENT_MAP to the 8 live labels (remove "None of the above").
       * New maps: title, ownership, relationship, pay/rent frequency, % bands,
         centrelink/income/asset/card/debt types.
   - Upgrade the address() helper to populate address/address2/city/state/zip subkeys
     (fixes the dropped propState problem).
   - Add the 7 consent strings (file 03) to CHECKBOX_LABELS verbatim.

2. api/submit-apply.ts
   - When skipped.length > 0 or Formstack push status is non-success, log/alert so
     incomplete leads are caught (stop silent success).

3. db/schema.ts
   - No change needed; full payload stored as jsonb. Historical leads remain re-pushable.

4. Verify
   - Run: node scripts/verify-e2e.mjs
   - Confirm NO required field returns "NOT-STORED".

## Known issues this rebuild fixes
- Term 8/9/10 stored empty (options no longer exist on the live form) -> capped at 7.
- Employment "Other"->"None of the above" stored empty -> 8 exact labels.
- Address state/city/zip never sent -> address subkeys populated.
- Driver's-license Yes/No (119532166) never sent -> always "Yes" when license provided.
- Passport/Other-ID had no Formstack field -> restricted to driver's license only.
- otherDebt single number -> structured debt block (type/owing/repayment).
- ~70+ required underwriting fields never collected -> now all present.

## Formstack transport rules (do not change in lib/formstack.ts)
- POST https://www.formstack.com/api/v2025/forms/4653616/submissions
- Header X-FS-Encryption-Password required (form is encrypted) else 401.
- Field id must be a STRING. value is ALWAYS a nested object:
    text/number/email/phone/radio/datetime -> { value }
    select/checkbox -> { subvalues: [{ subvalue }] }
    address -> { address, address2?, city?, state?, zip? }
- checkbox/consent subvalue must equal the exact option label verbatim.
- API does NOT enforce required — we must send every required field ourselves.
