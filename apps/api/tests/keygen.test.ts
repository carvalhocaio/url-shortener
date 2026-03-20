import { describe, expect, it } from "bun:test";
import {
	generateKey,
	getCustomKeyValidationError,
	normalizeCustomKey,
} from "../src/services/keygen";

describe("keygen", () => {
	it("generates a key with 7 characters", () => {
		const key = generateKey();
		expect(key).toHaveLength(7);
	});

	it("generates unique keys", () => {
		const keys = new Set(Array.from({ length: 100 }, () => generateKey()));
		expect(keys.size).toBe(100);
	});

	it("uses only alphanumeric characters", () => {
		const key = generateKey();
		expect(key).toMatch(/^[0-9a-zA-Z]+$/);
	});

	it("normalizes custom key to lowercase and trims spaces", () => {
		expect(normalizeCustomKey("  Summer-Sale  ")).toBe("summer-sale");
	});

	it("validates accepted custom key", () => {
		expect(getCustomKeyValidationError("summer-sale-2026")).toBeNull();
	});

	it("rejects reserved custom key", () => {
		expect(getCustomKeyValidationError("api")).toBe("This custom URL key is reserved");
	});

	it("rejects invalid characters in custom key", () => {
		expect(getCustomKeyValidationError("Summer_Sale")).toBe(
			"Custom URL key can only contain lowercase letters, numbers, and hyphens",
		);
	});
});
