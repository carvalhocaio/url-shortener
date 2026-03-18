import {
	boolean,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const urls = pgTable("urls", {
	id: serial("id").primaryKey(),
	key: text("key").notNull().unique(),
	secretKey: text("secret_key").notNull().unique(),
	targetUrl: text("target_url").notNull(),
	isActive: boolean("is_active").notNull().default(true),
	clicks: integer("clicks").notNull().default(0),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
