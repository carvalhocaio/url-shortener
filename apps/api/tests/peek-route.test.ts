import { beforeEach, describe, expect, it, mock } from "bun:test";
import { Elysia } from "elysia";

const findByKeyMock = mock(async () => null);
const incrementClicksMock = mock(async () => undefined);

mock.module("../src/services/url.service", () => ({
	findByKey: findByKeyMock,
	incrementClicks: incrementClicksMock,
}));

import { redirectRoutes } from "../src/routes/redirect";

describe("peek route", () => {
	beforeEach(() => {
		findByKeyMock.mockReset();
		incrementClicksMock.mockReset();
	});

	it("returns the target URL details for an active short URL", async () => {
		const createdAt = new Date("2026-01-01T00:00:00.000Z");

		findByKeyMock.mockResolvedValue({
			id: 1,
			key: "abc1234",
			targetUrl: "https://example.com",
			clicks: 12,
			createdAt,
			isActive: true,
		});

		const app = new Elysia().use(redirectRoutes);
		const response = await app.handle(new Request("http://localhost/abc1234/peek"));

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			key: "abc1234",
			targetUrl: "https://example.com",
			clicks: 12,
			createdAt: createdAt.toISOString(),
		});
		expect(findByKeyMock).toHaveBeenCalledWith("abc1234");
		expect(incrementClicksMock).not.toHaveBeenCalled();
	});

	it("returns 404 when short URL does not exist", async () => {
		findByKeyMock.mockResolvedValue(null);

		const app = new Elysia().use(redirectRoutes);
		const response = await app.handle(new Request("http://localhost/missing/peek"));

		expect(response.status).toBe(404);
		expect(await response.json()).toEqual({ error: "Short URL not found" });
		expect(findByKeyMock).toHaveBeenCalledWith("missing");
		expect(incrementClicksMock).not.toHaveBeenCalled();
	});

	it("returns 404 when short URL is inactive", async () => {
		findByKeyMock.mockResolvedValue({
			id: 1,
			key: "inactive",
			targetUrl: "https://example.com",
			clicks: 0,
			createdAt: new Date("2026-01-01T00:00:00.000Z"),
			isActive: false,
		});

		const app = new Elysia().use(redirectRoutes);
		const response = await app.handle(new Request("http://localhost/inactive/peek"));

		expect(response.status).toBe(404);
		expect(await response.json()).toEqual({ error: "Short URL not found" });
		expect(findByKeyMock).toHaveBeenCalledWith("inactive");
		expect(incrementClicksMock).not.toHaveBeenCalled();
	});
});
