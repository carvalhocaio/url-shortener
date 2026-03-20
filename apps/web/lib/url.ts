const CUSTOM_KEY_PATTERN = /^[a-z0-9-]+$/;
const CUSTOM_KEY_MIN_LENGTH = 3;
const CUSTOM_KEY_MAX_LENGTH = 32;
const RESERVED_CUSTOM_KEYS = new Set(["api", "health", "openapi"]);
const SUGGESTED_KEY_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";
const SUGGESTED_KEY_LENGTH = 7;

export function isValidUrl(value: string) {
	if (!value) {
		return false;
	}

	try {
		const parsedUrl = new URL(value);
		return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
	} catch {
		return false;
	}
}

export function normalizeCustomKey(value: string) {
	return value.trim().toLowerCase();
}

export function getCustomKeyValidationError(value: string) {
	if (!value) {
		return null;
	}

	if (value.length < CUSTOM_KEY_MIN_LENGTH || value.length > CUSTOM_KEY_MAX_LENGTH) {
		return `Custom key must be between ${CUSTOM_KEY_MIN_LENGTH} and ${CUSTOM_KEY_MAX_LENGTH} characters`;
	}

	if (!CUSTOM_KEY_PATTERN.test(value)) {
		return "Custom key can only contain lowercase letters, numbers, and hyphens";
	}

	if (RESERVED_CUSTOM_KEYS.has(value)) {
		return "This custom key is reserved";
	}

	return null;
}

export function generateSuggestedCustomKey(length = SUGGESTED_KEY_LENGTH) {
	if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
		const bytes = crypto.getRandomValues(new Uint8Array(length));
		let result = "";

		for (const byte of bytes) {
			result += SUGGESTED_KEY_ALPHABET[byte % SUGGESTED_KEY_ALPHABET.length];
		}

		return result;
	}

	let fallback = "";
	for (let index = 0; index < length; index += 1) {
		const randomIndex = Math.floor(Math.random() * SUGGESTED_KEY_ALPHABET.length);
		fallback += SUGGESTED_KEY_ALPHABET[randomIndex];
	}

	return fallback;
}
