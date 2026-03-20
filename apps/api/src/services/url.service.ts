import { urls } from "@link-arch/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../lib/db";
import { generateKey } from "./keygen";

export async function createShortUrl(targetUrl: string, userId: string) {
	const key = generateKey();

	const [inserted] = await db.insert(urls).values({ key, targetUrl, userId }).returning();

	return inserted;
}

export async function findByKey(key: string) {
	return db.query.urls.findFirst({
		where: and(eq(urls.key, key), eq(urls.isDeleted, false)),
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
	return db
		.select()
		.from(urls)
		.where(and(eq(urls.userId, userId), eq(urls.isDeleted, false)))
		.orderBy(desc(urls.createdAt));
}

export async function softDeleteUrlByIdAndUserId(id: number, userId: string) {
	const [updated] = await db
		.update(urls)
		.set({ isDeleted: true, updatedAt: new Date() })
		.where(and(eq(urls.id, id), eq(urls.userId, userId), eq(urls.isDeleted, false)))
		.returning();

	return updated;
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
		.where(and(eq(urls.id, id), eq(urls.userId, userId), eq(urls.isDeleted, false)))
		.returning();
	return updated;
}

export async function updateUrlTargetByIdAndUserId(id: number, userId: string, targetUrl: string) {
	const [updated] = await db
		.update(urls)
		.set({ targetUrl, updatedAt: new Date() })
		.where(and(eq(urls.id, id), eq(urls.userId, userId), eq(urls.isDeleted, false)))
		.returning();

	return updated;
}
