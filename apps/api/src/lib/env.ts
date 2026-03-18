function loadEnv() {
	const raw = {
		DATABASE_URL: process.env.DATABASE_URL,
		PORT: process.env.PORT ?? "3000",
		BASE_URL: process.env.BASE_URL ?? "http://localhost:3000",
		FORWARD_TIMEOUT_MS: process.env.FORWARD_TIMEOUT_MS ?? "5000",
		BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
	};

	if (!raw.DATABASE_URL) {
		console.error("DATABASE_URL environment variable is required");
		process.exit(1);
	}

	if (!raw.BETTER_AUTH_SECRET) {
		console.error("BETTER_AUTH_SECRET environment variable is required");
		process.exit(1);
	}

	return {
		DATABASE_URL: raw.DATABASE_URL,
		PORT: Number.parseInt(raw.PORT, 10),
		BASE_URL: raw.BASE_URL,
		FORWARD_TIMEOUT_MS: Number.parseInt(raw.FORWARD_TIMEOUT_MS, 10),
		BETTER_AUTH_SECRET: raw.BETTER_AUTH_SECRET,
	};
}

export const env = loadEnv();
