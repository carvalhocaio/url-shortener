import { urls } from "@link-arch/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../lib/db";
import { generateKey, generateSecretKey } from "./keygen";

export async function createShortUrl(targetUrl: string, userId: string) {
	const key = generateKey();
	const secretKey = generateSecretKey();

	const [inserted] = await db
		.insert(urls)
		.values({ key, secretKey, targetUrl, userId })
		.returning();

	return inserted;
}

export async function findByKey(key: string) {
	return db.query.urls.findFirst({
		where: eq(urls.key, key),
	});
}

export async function findBySecretKey(secretKey: string) {
	return db.query.urls.findFirst({
		where: eq(urls.secretKey, secretKey),
	});
}

export async function findBySecretKeyAndUserId(secretKey: string, userId: string) {
	return db.query.urls.findFirst({
		where: and(eq(urls.secretKey, secretKey), eq(urls.userId, userId)),
	});
}

export async function incrementClicks(id: number) {
	await db
		.update(urls)
		.set({
			clicks: sql`${urls.clicks} + 1`,
			updatedAt: new Date(),
		})
		.where(eq(urls.id, id));
}

export async function getUrlsByUserId(userId: string) {
	return db.select().from(urls).where(eq(urls.userId, userId)).orderBy(desc(urls.createdAt));
}

export async function deleteUrl(id: number) {
	const [deleted] = await db.delete(urls).where(eq(urls.id, id)).returning();
	return deleted;
}

export async function deactivateUrl(id: number) {
	const [updated] = await db
		.update(urls)
		.set({ isActive: false, updatedAt: new Date() })
		.where(eq(urls.id, id))
		.returning();
	return updated;
}

export async function deactivateUrlByIdAndUserId(id: number, userId: string) {
	const [updated] = await db
		.update(urls)
		.set({ isActive: false, updatedAt: new Date() })
		.where(and(eq(urls.id, id), eq(urls.userId, userId)))
		.returning();
	return updated;
}
