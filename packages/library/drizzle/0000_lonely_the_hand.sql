CREATE TABLE "library_admins" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "library_admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "library_audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"admin_id" text,
	"krithi_id" text,
	"action" text NOT NULL,
	"snapshot" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "library_imports" (
	"id" text PRIMARY KEY NOT NULL,
	"source_url" text NOT NULL,
	"source_count" integer NOT NULL,
	"inserted_count" integer NOT NULL,
	"manifest" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "library_krithis" (
	"id" text PRIMARY KEY NOT NULL,
	"source_id" integer,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"transliteration" text NOT NULL,
	"category" text NOT NULL,
	"category_name" text NOT NULL,
	"category_malayalam" text NOT NULL,
	"body" text NOT NULL,
	"source_url" text DEFAULT '' NOT NULL,
	"source_hash" text DEFAULT '' NOT NULL,
	"source_body" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"revision" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "library_krithis_source_id_unique" UNIQUE("source_id"),
	CONSTRAINT "library_krithis_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "library_login_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"attempts" integer NOT NULL,
	"resets_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "library_sessions" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"admin_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "library_audit_log" ADD CONSTRAINT "library_audit_log_admin_id_library_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."library_admins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "library_audit_log" ADD CONSTRAINT "library_audit_log_krithi_id_library_krithis_id_fk" FOREIGN KEY ("krithi_id") REFERENCES "public"."library_krithis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "library_sessions" ADD CONSTRAINT "library_sessions_admin_id_library_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."library_admins"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "library_status_category_idx" ON "library_krithis" USING btree ("status","category");