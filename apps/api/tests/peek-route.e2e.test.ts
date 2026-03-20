import { beforeEach, describe, expect, it } from "bun:test";
import { randomUUID } from "node:crypto";
import { urls, user } from "@link-arch/db/schema";
import { and, eq, like } from "drizzle-orm";
import { Elysia } from "elysia";
import { db } from "../src/lib/db";
import { redirectRoutes } from "../src/routes/redirect";

const TEST_USER_PREFIX = "peek-e2e-user-";

describe("peek route e2e", () => {
	beforeEach(async () => {
		await db.delete(urls).where(like(urls.userId, `${TEST_USER_PREFIX}%`));
		await db.delete(user).where(like(user.id, `${TEST_USER_PREFIX}%`));
	});

	it("returns target URL details for an active key using the database", async () => {
		const userId = `${TEST_USER_PREFIX}${randomUUID()}`;
		const key = `peek${randomUUID().replaceAll("-", "").slice(0, 8)}`;
		const targetUrl = "https://example.com/e2e";

		await db.insert(user).values({
			id: userId,
			name: "Peek E2E",
			email: `${userId}@example.test`,
			emailVerified: true,
		});

		const [created] = await db
			.insert(urls)
			.values({
				userId,
				key,
				targetUrl,
				isActive: true,
				isDeleted: false,
			})
			.returning();

		const app = new Elysia().use(redirectRoutes);
		const response = await app.handle(new Request(`http://localhost/${key}/peek`));

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			key,
			targetUrl,
			clicks: 0,
			createdAt: created.createdAt.toISOString(),
		});

		const [urlInDb] = await db
			.select()
			.from(urls)
			.where(and(eq(urls.userId, userId), eq(urls.key, key)));
		expect(urlInDb?.clicks).toBe(0);
	});

	it("returns 404 when key does not exist in the database", async () => {
		const app = new Elysia().use(redirectRoutes);
		const response = await app.handle(new Request("http://localhost/nonexistent/peek"));

		expect(response.status).toBe(404);
		expect(await response.json()).toEqual({ error: "Short URL not found" });
	});
});
