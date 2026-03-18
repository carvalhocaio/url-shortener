const DEFAULT_TIMEOUT_MS = 5000;

export async function isUrlReachable(
	url: string,
	timeoutMs = Number.parseInt(
		process.env.FORWARD_TIMEOUT_MS ?? String(DEFAULT_TIMEOUT_MS),
		10,
	),
): Promise<boolean> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const response = await fetch(url, {
			method: "HEAD",
			signal: controller.signal,
			redirect: "follow",
		});
		return response.ok;
	} catch {
		return false;
	} finally {
		clearTimeout(timeout);
	}
}
