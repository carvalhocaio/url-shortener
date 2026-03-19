import { Elysia, t } from "elysia";

export const healthRoutes = new Elysia().get(
	"/health",
	() => ({
		title: "Link Arch",
		version: "1.0.0",
		description: "A fast, lightweight link management API built with Bun and Elysia.",
		docs: "/openapi",
		author: "https://github.com/carvalhocaio",
		repository: "https://github.com/carvalhocaio/link-arch",
	}),
	{
		response: t.Object({
			title: t.String(),
			version: t.String(),
			description: t.String(),
			docs: t.String(),
			author: t.String(),
			repository: t.String(),
		}),
		detail: {
			tags: ["Health"],
			summary: "Health check",
			description: "Returns API metadata and health status.",
		},
	},
);
