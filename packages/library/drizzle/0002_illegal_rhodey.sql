ALTER TABLE "library_admins" ADD COLUMN "role" text DEFAULT 'editor' NOT NULL;--> statement-breakpoint
UPDATE "library_admins" SET "role" = 'owner';--> statement-breakpoint
ALTER TABLE "library_admins" ADD COLUMN "disabled_at" timestamp with time zone;
