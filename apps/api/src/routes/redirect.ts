import { Elysia, t } from "elysia";
import { findByKey, incrementClicks } from "../services/url.service";

export const redirectRoutes = new Elysia()
	.get(
		"/:key",
		async ({ params, set }) => {
			const record = await findByKey(params.key);

			if (!record || !record.isActive) {
				set.status = 404;
				return { error: "Short URL not found" };
			}

			incrementClicks(record.id);
			set.status = 302;
			set.headers.location = record.targetUrl;
		},
		{
			params: t.Object({
				key: t.String(),
			}),
			detail: {
				tags: ["Redirect"],
				summary: "Redirect to target URL",
			},
		},
	)
	.get(
		"/:key/peek",
		async ({ params, set }) => {
			const record = await findByKey(params.key);

			if (!record || !record.isActive) {
				set.status = 404;
				return { error: "Short URL not found" };
			}

			return {
				key: record.key,
				targetUrl: record.targetUrl,
				clicks: record.clicks,
				createdAt: record.createdAt,
			};
		},
		{
			params: t.Object({
				key: t.String(),
			}),
			detail: {
				tags: ["URLs"],
				summary: "Preview target URL without redirecting",
			},
		},
	);
