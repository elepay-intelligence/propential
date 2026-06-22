/**
 * Quick connectivity + schema check against Neon. Reads DATABASE_URL from .env.local.
 *   node scripts/db-check.mjs
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const where = await sql`select current_database() as db, version() as v`;
const cols = await sql`
  select column_name, data_type
  from information_schema.columns
  where table_name = 'submissions'
  order by ordinal_position`;
const count = await sql`select count(*)::int as n from submissions`;

console.log("Connected to:", where[0].db);
console.log("submissions columns:", cols.length);
for (const c of cols) console.log("  -", c.column_name, "::", c.data_type);
console.log("row count:", count[0].n);
