import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { env } from "./lib/env";
import { shortenRoutes } from "./routes/shorten";
import { redirectRoutes } from "./routes/redirect";
import { adminRoutes } from "./routes/admin";

const app = new Elysia()
	.use(
		openapi({
			documentation: {
				info: {
					title: "URL Shortener API",
					version: "1.0.0",
					description: "A simple and fast URL shortener",
				},
				tags: [
					{ name: "URLs", description: "URL shortening operations" },
					{ name: "Redirect", description: "URL redirection" },
					{ name: "Admin", description: "Administration endpoints" },
				],
			},
		}),
	)
	.use(shortenRoutes)
	.use(redirectRoutes)
	.use(adminRoutes)
	.listen(env.PORT);

console.log(`🚀 Server running at ${env.BASE_URL}`);
console.log(`📖 OpenAPI docs at ${env.BASE_URL}/openapi`);

export type App = typeof app;
