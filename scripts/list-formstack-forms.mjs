/**
 * List all Formstack forms (id + name) so we can find the real form id.
 * Run: node scripts/list-formstack-forms.mjs
 */
import { config } from "dotenv";
config({ path: ".env.local" });

const token = process.env.FORMSTACK_API_TOKEN;
if (!token) {
  console.error("Missing FORMSTACK_API_TOKEN in .env.local");
  process.exit(1);
}

const res = await fetch("https://www.formstack.com/api/v2025/forms?per_page=100", {
  headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
});
const text = await res.text();
if (!res.ok) {
  console.error(`HTTP ${res.status}: ${text}`);
  process.exit(1);
}

const data = JSON.parse(text);
const forms = Array.isArray(data) ? data : (data.forms ?? []);
console.log(`\n${forms.length} forms:\n`);
console.log("id".padEnd(12) + "submissions".padEnd(13) + "name");
console.log("-".repeat(70));
for (const f of forms) {
  console.log(
    String(f.id).padEnd(12) +
      String(f.submissions ?? f.num_submissions ?? "").padEnd(13) +
      String(f.name ?? "").slice(0, 50),
  );
}
console.log("");
