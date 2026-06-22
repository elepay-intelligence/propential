import { readFileSync, writeFileSync } from "node:fs";

const formId = process.argv[2] || "4653616";
const fields = JSON.parse(readFileSync(`formstack-fields-${formId}.json`, "utf8"));

const SKIP = new Set(["section", "embed", "richtext", "image", "file"]);
const lines = [];
for (const f of fields) {
  if (SKIP.has(f.type)) continue;
  const req = f.required === true || f.required === "1" || f.required === 1;
  // option fields (select/radio/checkbox) expose options to confirm subvalues
  let opts = "";
  if (f.options && Array.isArray(f.options) && f.options.length) {
    opts = " :: [" + f.options.map((o) => o.label ?? o.value ?? o).slice(0, 8).join(" | ") + "]";
  }
  lines.push(
    `${String(f.id).padEnd(11)} ${String(f.type).padEnd(12)} ${req ? "REQ" : "   "} ${String(f.label ?? "").replace(/\s+/g, " ")}${opts}`,
  );
}

const out = `formstack-fields-${formId}.txt`;
writeFileSync(out, lines.join("\n"));
console.log(`${lines.length} input fields -> ${out}`);
