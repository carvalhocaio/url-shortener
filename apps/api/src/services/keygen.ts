const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const KEY_LENGTH = 7;
const CUSTOM_KEY_PATTERN = /^[a-z0-9-]+$/;
const CUSTOM_KEY_MIN_LENGTH = 3;
const CUSTOM_KEY_MAX_LENGTH = 32;
const RESERVED_CUSTOM_KEYS = new Set(["api", "health", "openapi"]);

function randomString(length: number): string {
	const bytes = crypto.getRandomValues(new Uint8Array(length));
	let result = "";
	for (const byte of bytes) {
		result += ALPHABET[byte % ALPHABET.length];
	}
	return result;
}

export function generateKey(): string {
	return randomString(KEY_LENGTH);
}

export function normalizeCustomKey(value: string): string {
	return value.trim().toLowerCase();
}

export function getCustomKeyValidationError(key: string): string | null {
	if (!key) {
		return "Custom URL key cannot be empty";
	}

	if (key.length < CUSTOM_KEY_MIN_LENGTH || key.length > CUSTOM_KEY_MAX_LENGTH) {
		return `Custom URL key must be between ${CUSTOM_KEY_MIN_LENGTH} and ${CUSTOM_KEY_MAX_LENGTH} characters`;
	}

	if (!CUSTOM_KEY_PATTERN.test(key)) {
		return "Custom URL key can only contain lowercase letters, numbers, and hyphens";
	}

	if (RESERVED_CUSTOM_KEYS.has(key)) {
		return "This custom URL key is reserved";
	}

	return null;
}
