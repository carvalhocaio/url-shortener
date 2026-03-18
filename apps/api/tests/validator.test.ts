import { describe, expect, it } from "bun:test";
import { isUrlReachable } from "../src/services/validator";

describe("isUrlReachable", () => {
	it("returns true for a reachable URL", async () => {
		const result = await isUrlReachable("https://example.com");
		expect(result).toBe(true);
	});

	it("returns false for an unreachable URL", async () => {
		const result = await isUrlReachable("https://this-domain-does-not-exist-xyz.invalid");
		expect(result).toBe(false);
	});
});
