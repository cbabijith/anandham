CREATE TABLE "library_dharmam_audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"admin_id" text,
	"chapter_id" text NOT NULL,
	"action" text NOT NULL,
	"snapshot" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "library_dharmam_chapters" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"transliteration" text NOT NULL,
	"passages" jsonb NOT NULL,
	"source_passages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"source_label" text DEFAULT 'Library editorial contribution' NOT NULL,
	"editorial_note" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"revision" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "library_dharmam_chapters_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "library_dharmam_audit_log" ADD CONSTRAINT "library_dharmam_audit_log_admin_id_library_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."library_admins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "library_dharmam_audit_log" ADD CONSTRAINT "library_dharmam_audit_log_chapter_id_library_dharmam_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."library_dharmam_chapters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "library_dharmam_status_order_idx" ON "library_dharmam_chapters" USING btree ("status","sort_order");