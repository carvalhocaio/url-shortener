import { eq, sql } from "drizzle-orm";
import { urls } from "@url-shortener/db/schema";
import { db } from "../lib/db";
import { generateKey, generateSecretKey } from "./keygen";

export async function createShortUrl(targetUrl: string) {
	const key = generateKey();
	const secretKey = generateSecretKey();

	const [inserted] = await db
		.insert(urls)
		.values({ key, secretKey, targetUrl })
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

export async function incrementClicks(id: number) {
	await db
		.update(urls)
		.set({
			clicks: sql`${urls.clicks} + 1`,
			updatedAt: new Date(),
		})
		.where(eq(urls.id, id));
}

export async function getAllUrls() {
	return db.select().from(urls).orderBy(urls.createdAt);
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
