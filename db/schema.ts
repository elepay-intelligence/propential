import {
  pgTable,
  pgEnum,
  uuid,
  text,
  jsonb,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

/**
 * Lifecycle of an application submission (direct-submit flow):
 *  - "received"  -> stored in Neon, not yet pushed to Formstack
 *  - "submitted" -> Formstack accepted it (formstackSubmissionId is set)
 *  - "failed"    -> all Formstack attempts failed (errorMessage is set; retryable)
 */
export const submissionStatus = pgEnum("submission_status", [
  "received",
  "submitted",
  "failed",
]);

/**
 * Every apply.html submission. Posts to the single Formstack "Reno Now"
 * application form (encrypted) identified by FORMSTACK_FORM_ID.
 */
export const submissions = pgTable(
  "submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // The Formstack form id used at submission time (audit; = FORMSTACK_FORM_ID).
    formstackFormId: text("formstack_form_id").notNull(),
    status: submissionStatus("status").notNull().default("received"),

    // Denormalised for quick lookup / dedupe; full data lives in `payload`.
    email: text("email"),
    referralCode: text("referral_code"),
    utmSource: text("utm_source"),
    utmMedium: text("utm_medium"),
    utmCampaign: text("utm_campaign"),

    // The exact JSON the page submitted (source of truth for re-pushing).
    payload: jsonb("payload").notNull(),

    // Formstack result.
    formstackSubmissionId: text("formstack_submission_id"),
    attempts: integer("attempts").notNull().default(0),
    errorMessage: text("error_message"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("submissions_status_idx").on(t.status),
    index("submissions_email_idx").on(t.email),
    index("submissions_created_idx").on(t.createdAt),
  ],
);

// Drizzle-zod schemas (schema -> Zod) for type-safe inserts/selects.
export const insertSubmissionSchema = createInsertSchema(submissions);
export const selectSubmissionSchema = createSelectSchema(submissions);

export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
