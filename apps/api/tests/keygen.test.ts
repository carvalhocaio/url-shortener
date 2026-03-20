import { describe, expect, it } from "bun:test";
import { generateKey } from "../src/services/keygen";

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
});
