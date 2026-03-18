import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { env } from "./lib/env";
import { adminRoutes } from "./routes/admin";
import { healthRoutes } from "./routes/health";
import { redirectRoutes } from "./routes/redirect";
import { shortenRoutes } from "./routes/shorten";

const app = new Elysia()
	.use(cors())
	.use(
		openapi({
			documentation: {
				info: {
					title: "URL Shortener API",
					version: "1.0.0",
					description: "A simple and fast URL shortener",
				},
				tags: [
					{ name: "Health", description: "API health check" },
					{ name: "URLs", description: "URL shortening operations" },
					{ name: "Redirect", description: "URL redirection" },
					{ name: "Admin", description: "Administration endpoints" },
				],
			},
		}),
	)
	.use(healthRoutes)
	.use(shortenRoutes)
	.use(redirectRoutes)
	.use(adminRoutes)
	.listen(env.PORT);

console.log(`🚀 Server running at ${env.BASE_URL}`);
console.log(`📖 OpenAPI docs at ${env.BASE_URL}/openapi`);

export type App = typeof app;
