ALTER TABLE "urls" ADD COLUMN IF NOT EXISTS "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "urls" DROP COLUMN IF EXISTS "secret_key";
