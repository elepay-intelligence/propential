CREATE TYPE "public"."submission_status" AS ENUM('received', 'submitted', 'failed');--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"formstack_form_id" text NOT NULL,
	"status" "submission_status" DEFAULT 'received' NOT NULL,
	"email" text,
	"referral_code" text,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"payload" jsonb NOT NULL,
	"formstack_submission_id" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "submissions_status_idx" ON "submissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "submissions_email_idx" ON "submissions" USING btree ("email");--> statement-breakpoint
CREATE INDEX "submissions_created_idx" ON "submissions" USING btree ("created_at");