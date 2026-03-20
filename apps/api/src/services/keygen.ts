const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const KEY_LENGTH = 7;

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
