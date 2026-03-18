import { Elysia, t } from "elysia";
import { env } from "../lib/env";
import { createShortUrl } from "../services/url.service";
import { isUrlReachable } from "../services/validator";

export const shortenRoutes = new Elysia({ prefix: "/api" }).post(
	"/shorten",
	async ({ body, set }) => {
		const reachable = await isUrlReachable(body.url);
		if (!reachable) {
			set.status = 400;
			return { error: "URL is not reachable" };
		}

		const record = await createShortUrl(body.url);

		return {
			shortUrl: `${env.BASE_URL}/${record.key}`,
			key: record.key,
			secretKey: record.secretKey,
			targetUrl: record.targetUrl,
			createdAt: record.createdAt,
		};
	},
	{
		body: t.Object({
			url: t.String({ format: "uri" }),
		}),
		detail: {
			tags: ["URLs"],
			summary: "Create a short URL",
		},
	},
);
