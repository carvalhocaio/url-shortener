import { boolean, index, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth-schema";

export { user, session, account, verification } from "./auth-schema";

export const urls = pgTable(
	"urls",
	{
		id: serial("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		key: text("key").notNull().unique(),
		secretKey: text("secret_key").notNull().unique(),
		targetUrl: text("target_url").notNull(),
		isActive: boolean("is_active").notNull().default(true),
		clicks: integer("clicks").notNull().default(0),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => ({
		userIdIdx: index("urls_user_id_idx").on(table.userId),
		userCreatedAtIdx: index("urls_user_id_created_at_idx").on(table.userId, table.createdAt),
	}),
);
