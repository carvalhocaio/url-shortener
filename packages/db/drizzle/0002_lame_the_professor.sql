ALTER TABLE "urls" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "urls" ADD CONSTRAINT "urls_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "urls_user_id_idx" ON "urls" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "urls_user_id_created_at_idx" ON "urls" USING btree ("user_id","created_at");