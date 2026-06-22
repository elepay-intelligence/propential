import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Neon serverless (HTTP) + Drizzle. The HTTP driver is ideal for Vercel
 * Functions: one round-trip per query, no connection pool to manage.
 *
 * DATABASE_URL is injected by the Neon Vercel integration (Production +
 * Preview) and pulled locally via `vercel env pull .env.local`.
 */
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Provision Neon (Vercel Marketplace) or run `vercel env pull .env.local`.",
  );
}

const sql = neon(databaseUrl);

export const db = drizzle(sql, { schema });
export { schema };
