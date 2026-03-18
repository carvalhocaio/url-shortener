const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export interface ShortenResponse {
	shortUrl: string;
	key: string;
	secretKey: string;
	targetUrl: string;
	createdAt: string;
}

export interface ShortenErrorResponse {
	error: string;
}

export interface PeekResponse {
	key: string;
	targetUrl: string;
	clicks: number;
	createdAt: string;
}

export async function shortenUrl(url: string): Promise<ShortenResponse> {
	const response = await fetch(`${API_URL}/api/shorten`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ url }),
	});

	if (!response.ok) {
		const error: ShortenErrorResponse = await response.json();
		throw new Error(error.error ?? "Failed to shorten URL");
	}

	return response.json();
}

export async function peekUrl(key: string): Promise<PeekResponse> {
	const response = await fetch(`${API_URL}/${key}/peek`);

	if (!response.ok) {
		const error: ShortenErrorResponse = await response.json();
		throw new Error(error.error ?? "Failed to peek URL");
	}

	return response.json();
}
