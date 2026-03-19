import { Elysia, t } from "elysia";
import { authMiddleware } from "../lib/auth-middleware";
import { env } from "../lib/env";
import { createShortUrl } from "../services/url.service";
import { isUrlReachable } from "../services/validator";

export const shortenRoutes = new Elysia({ prefix: "/api" }).use(authMiddleware).post(
	"/shorten",
	async ({ body, set, user }) => {
		const reachable = await isUrlReachable(body.url);
		if (!reachable) {
			set.status = 400;
			return { error: "URL is not reachable" };
		}

		const record = await createShortUrl(body.url, user.id);

		return {
			shortUrl: `${env.BASE_URL}/${record.key}`,
			key: record.key,
			secretKey: record.secretKey,
			targetUrl: record.targetUrl,
			createdAt: record.createdAt,
		};
	},
	{
		auth: true,
		body: t.Object({
			url: t.String({ format: "uri" }),
		}),
		detail: {
			tags: ["URLs"],
			summary: "Create a short URL",
		},
	},
);
