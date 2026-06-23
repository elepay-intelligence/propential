/**
 * End-to-end proof of the fixed v2025 payload shape. Clones the real form into
 * a throwaway encrypted copy, submits a realistic mixed-type payload using the
 * SAME nested shapes lib/apply-mapping.ts now produces, reads it back decrypted,
 * reports per-type storage, then deletes the copy. Touches no live data.
 *   node scripts/verify-e2e.mjs
 */
import { config } from "dotenv";
config({ path: ".env.local" });
const token = process.env.FORMSTACK_API_TOKEN;
const ep = process.env.FORMSTACK_USER_FORM_ENCRYPTION_PASSWORD;
const h = { Authorization: `Bearer ${token}`, Accept: "application/json" };
const enc = { "X-FS-Encryption-Password": ep };
const api = (p, o = {}) => fetch(`https://www.formstack.com/api/v2025${p}`, { ...o, headers: { ...h, ...(o.headers || {}) } });

// 1. clone the real form
const copy = await (await api("/forms/4653616/copy", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })).json();
const CID = String(copy.id);
console.log(`Cloned real form → copy ${CID} (encrypted=${copy.isEncrypted ?? "?"})`);

try {
  const fields = (await (await api(`/forms/${CID}/fields`)).json()).fields ?? [];
  const norm = (s) => String(s ?? "").toLowerCase().replace(/\s+/g, " ").trim();
  const byIncl = (sub, type) => fields.find((f) => norm(f.label).includes(norm(sub)) && (!type || f.type === type));
  const firstOpt = (f) => { const o = (f?.options ?? []).find((x) => (x.value ?? x.label) !== ""); return o ? (o.value ?? o.label) : ""; };

  // Build entries with the SAME nested shapes as the fixed mapping.
  const out = [];
  const add = (f, value) => f && out.push({ id: String(f.id), value });
  const TXT = (f, v) => add(f, { value: v });
  const SEL = (f) => { const o = firstOpt(f); if (o) add(f, { subvalues: [{ subvalue: o }] }); };
  const CHK = (f, n = 1) => { const os = (f?.options ?? []).filter((x) => (x.value ?? x.label) !== "").slice(0, n); if (os.length) add(f, { subvalues: os.map((o) => ({ subvalue: o.value ?? o.label })) }); };
  const RAD = (f) => { const o = firstOpt(f); if (o) add(f, { value: o }); };
  const ADR = (f) => f && out.push({ id: String(f.id), value: { address: "1 Test St", city: "Sydney", state: "NSW", zip: "2000" } });

  TXT(byIncl("First name", "text"), "Test");          // text
  TXT(byIncl("Last name", "text"), "Applicant");      // text
  TXT(byIncl("Email", "email"), "test@example.com");  // email
  TXT(byIncl("how much money are you looking to borrow", "number"), "50000"); // number
  TXT(byIncl("date of birth", "datetime"), "1990-01-15");      // datetime
  RAD(byIncl("home ownership status", "radio"));      // radio
  SEL(byIncl("choose your repayment term", "select")); // select
  CHK(byIncl("what type of renovation", "checkbox"), 2); // checkbox multi
  ADR(byIncl("renovation address", "address"));       // address

  const typeOf = (id) => fields.find((f) => String(f.id) === id)?.type;
  console.log(`\nSubmitting ${out.length} fields: ${out.map((e) => typeOf(e.id)).join(", ")}`);

  const res = await api(`/forms/${CID}/submissions`, { method: "POST", headers: { "Content-Type": "application/json", ...enc }, body: JSON.stringify({ fields: out }) });
  const txt = await res.text();
  console.log(`POST → HTTP ${res.status} ${res.ok ? "ACCEPTED" : "REJECTED"}`);
  const j = JSON.parse(txt);
  if (j.id) {
    const sb = await (await api(`/submissions/${j.id}`, { headers: enc })).json();
    const stored = (sb.data ?? []).filter((d) => d.displayValue !== "" && d.displayValue != null);
    console.log(`\nStored ${stored.length}/${out.length} fields:`);
    for (const d of stored) console.log(`  ✓ ${d.type.padEnd(9)} "${String(d.label).slice(0, 34)}" = ${JSON.stringify(d.displayValue).replace(/\n/g, " | ")}`);
  } else {
    console.log("Body:", txt.slice(0, 300));
  }
} finally {
  // 3. always delete the throwaway copy
  const del = await api(`/forms/${CID}`, { method: "DELETE" });
  console.log(`\nDeleted copy ${CID} → HTTP ${del.status}`);
}
