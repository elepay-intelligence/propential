/**
 * Find — and optionally delete — orphaned auto-copies of the LIVE Formstack form
 * that an interrupted test run could leave behind. An auto-copy is named
 * "<live form name> - COPY" / "Copy of <live form name>" and has 0 submissions.
 *
 * SAFE BY DESIGN:
 *   - dry-run unless you pass --delete
 *   - never targets the live form itself (FORMSTACK_FORM_ID)
 *   - never targets any form that has >0 submissions
 *   - only matches names derived from the live form's name (won't touch other
 *     unrelated "… - COPY" forms in the account)
 *
 *   node scripts/cleanup-formstack-copies.mjs           # list candidates (no changes)
 *   node scripts/cleanup-formstack-copies.mjs --delete  # delete the listed candidates
 */
import { config } from "dotenv";
config({ path: ".env.local" });

const token = process.env.FORMSTACK_API_TOKEN;
const liveId = (process.env.FORMSTACK_FORM_ID || "").trim();
const DELETE = process.argv.includes("--delete");

if (!token || !liveId) {
  console.error("Missing FORMSTACK_API_TOKEN or FORMSTACK_FORM_ID in .env.local");
  process.exit(1);
}
const h = { Authorization: `Bearer ${token}`, Accept: "application/json" };
const api = (p, o = {}) =>
  fetch(`https://www.formstack.com/api/v2025${p}`, { ...o, headers: { ...h, ...(o.headers || {}) } });

const norm = (s) => String(s ?? "").toLowerCase().replace(/\s+/g, " ").trim();
const subs = (f) => Number(f.submissions ?? f.num_submissions ?? 0) || 0;

// ── load all forms + the live form's name ──
const res = await api("/forms?per_page=100");
const text = await res.text();
if (!res.ok) { console.error(`HTTP ${res.status}: ${text}`); process.exit(1); }
const parsed = JSON.parse(text);
const forms = Array.isArray(parsed) ? parsed : (parsed.forms ?? []);

const live = forms.find((f) => String(f.id) === liveId);
if (!live) {
  console.error(`Live form ${liveId} not found in account — aborting (won't guess).`);
  process.exit(1);
}
const liveName = norm(live.name);
console.log(`\nLive form: ${live.id} "${live.name}" (${subs(live)} submissions) — protected.\n`);

// an auto-copy: name is the live name + " - copy" / "copy of " + live name, AND 0 submissions.
const isCopyName = (n) =>
  n === `${liveName} - copy` ||
  n === `copy of ${liveName}` ||
  (n.startsWith(liveName) && n.endsWith("copy"));

const candidates = forms.filter(
  (f) => String(f.id) !== liveId && subs(f) === 0 && isCopyName(norm(f.name)),
);

if (!candidates.length) {
  console.log("No orphaned copies of the live form found. Nothing to clean up.\n");
  process.exit(0);
}

console.log(`${candidates.length} orphaned copy(ies) of the live form:\n`);
for (const f of candidates) console.log(`  ${String(f.id).padEnd(10)} 0 subs   ${f.name}`);

if (!DELETE) {
  console.log(`\nDry run — nothing deleted. Re-run with --delete to remove these.\n`);
  process.exit(0);
}

console.log(`\nDeleting ${candidates.length}…\n`);
let removed = 0;
for (const f of candidates) {
  // final guard — never delete the live form or anything with submissions.
  if (String(f.id) === liveId || subs(f) > 0) { console.log(`  ↷ skipped ${f.id} (guard)`); continue; }
  const del = await api(`/forms/${f.id}`, { method: "DELETE" });
  console.log(`  ${del.ok ? "✓ deleted" : `✗ HTTP ${del.status}`}  ${f.id}  ${f.name}`);
  if (del.ok) removed++;
}
console.log(`\n${removed}/${candidates.length} deleted.\n`);
