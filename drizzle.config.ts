import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Local migrate/push/studio read the connection from .env.local
// (created via `vercel env pull .env.local`). `db:generate` works offline.
config({ path: ".env.local" });

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    // Neon: prefer the direct/unpooled connection for migrations & DDL
    // (the pooler can choke on transactional schema changes). Runtime queries
    // in db/client.ts stay on the pooled DATABASE_URL.
    url:
      process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "",
  },
  verbose: true,
  strict: true,
});
