CREATE TABLE "urls" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"secret_key" text NOT NULL,
	"target_url" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "urls_key_unique" UNIQUE("key"),
	CONSTRAINT "urls_secret_key_unique" UNIQUE("secret_key")
);
