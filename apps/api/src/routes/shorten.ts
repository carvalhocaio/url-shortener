import { Elysia, t } from "elysia";
import { authMiddleware } from "../lib/auth-middleware";
import { env } from "../lib/env";
import { getCustomKeyValidationError, normalizeCustomKey } from "../services/keygen";
import { UrlKeyAlreadyExistsError, createShortUrl } from "../services/url.service";
import { isUrlReachable } from "../services/validator";

export const shortenRoutes = new Elysia({ prefix: "/api" }).use(authMiddleware).post(
	"/shorten",
	async ({ body, set, user }) => {
		const normalizedCustomKey = body.key ? normalizeCustomKey(body.key) : undefined;

		if (normalizedCustomKey) {
			const customKeyError = getCustomKeyValidationError(normalizedCustomKey);
			if (customKeyError) {
				set.status = 400;
				return { error: customKeyError };
			}
		}

		const reachable = await isUrlReachable(body.url);
		if (!reachable) {
			set.status = 400;
			return { error: "URL is not reachable" };
		}

		try {
			const record = await createShortUrl(body.url, user.id, normalizedCustomKey);

			return {
				shortUrl: `${env.BASE_URL}/${record.key}`,
				key: record.key,
				targetUrl: record.targetUrl,
				createdAt: record.createdAt,
			};
		} catch (error) {
			if (error instanceof UrlKeyAlreadyExistsError) {
				set.status = 409;
				return { error: error.message };
			}

			throw error;
		}
	},
	{
		auth: true,
		body: t.Object({
			url: t.String({ format: "uri" }),
			key: t.Optional(t.String()),
		}),
		detail: {
			tags: ["URLs"],
			summary: "Create a short URL",
		},
	},
);
