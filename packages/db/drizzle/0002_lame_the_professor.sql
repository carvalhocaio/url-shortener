ALTER TABLE "urls" ADD COLUMN IF NOT EXISTS "user_id" text;--> statement-breakpoint
DO $$ BEGIN
 IF EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_name = 'urls' AND column_name = 'user_id' AND is_nullable = 'YES'
 ) AND NOT EXISTS (SELECT 1 FROM "urls" WHERE "user_id" IS NULL) THEN
  ALTER TABLE "urls" ALTER COLUMN "user_id" SET NOT NULL;
 END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'urls_user_id_user_id_fk') THEN
  ALTER TABLE "urls" ADD CONSTRAINT "urls_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
 END IF;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "urls_user_id_idx" ON "urls" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "urls_user_id_created_at_idx" ON "urls" USING btree ("user_id","created_at");
