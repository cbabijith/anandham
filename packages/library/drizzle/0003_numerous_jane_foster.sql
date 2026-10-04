CREATE TABLE "library_guru_arul_audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"admin_id" text,
	"topic_id" text NOT NULL,
	"action" text NOT NULL,
	"snapshot" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "library_guru_arul_topics" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"english" text DEFAULT '' NOT NULL,
	"quotes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"revision" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "library_guru_arul_audit_log" ADD CONSTRAINT "library_guru_arul_audit_log_admin_id_library_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."library_admins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "library_guru_arul_status_order_idx" ON "library_guru_arul_topics" USING btree ("status","sort_order");