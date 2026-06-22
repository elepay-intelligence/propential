/**
 * Dump a Formstack form's fields (id / type / required / label) so you can fill
 * lib/apply-mapping.ts FIELD_IDS. Saves the raw field list to a JSON file too.
 *
 *   node scripts/fetch-formstack-fields.mjs [formId]
 * (formId defaults to FORMSTACK_FORM_ID from .env.local)
 */
import { writeFileSync } from "node:fs";
import { config } from "dotenv";
config({ path: ".env.local" });

const token = process.env.FORMSTACK_API_TOKEN;
const formId = process.argv[2] || process.env.FORMSTACK_FORM_ID;

if (!token || !formId) {
  console.error("Missing FORMSTACK_API_TOKEN or form id (.env.local / CLI arg).");
  process.exit(1);
}

const headers = { Authorization: `Bearer ${token}`, Accept: "application/json" };
const base = `https://www.formstack.com/api/v2025/forms/${formId}`;

async function getJson(url) {
  const res = await fetch(url, { headers });
  const text = await res.text();
  if (!res.ok) {
    console.error(`HTTP ${res.status}: ${text}`);
    process.exit(1);
  }
  return JSON.parse(text);
}

const meta = await getJson(base);
const fieldsResp = await getJson(`${base}/fields`);
const fields = fieldsResp.fields ?? [];

// Write first — Node's undici can abort the process at exit on Windows.
const out = `formstack-fields-${formId}.json`;
writeFileSync(out, JSON.stringify(fields, null, 2));

console.log(`\nForm ${meta.id}: ${meta.name}`);
console.log(`Encrypted: ${meta.isEncrypted}   Fields: ${fields.length}\n`);
console.log("id".padEnd(12) + "type".padEnd(14) + "req  " + "label");
console.log("-".repeat(78));
for (const f of fields) {
  const req = f.required === true || f.required === "1" || f.required === 1;
  console.log(
    String(f.id).padEnd(12) +
      String(f.type ?? "").padEnd(14) +
      (req ? "REQ  " : "     ") +
      String(f.label ?? "").replace(/\s+/g, " ").slice(0, 58),
  );
}

console.log(`\nSaved raw field list -> ${out}\n`);
