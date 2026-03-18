import { Elysia, t } from "elysia";
import { auth } from "../lib/auth";

export const authRoutes = new Elysia({ prefix: "/api/auth" })
	.post(
		"/sign-up",
		async ({ body, set }) => {
			if (body.password !== body.passwordConfirmation) {
				set.status = 400;
				return { error: "Passwords do not match" };
			}

			try {
				const result = await auth.api.signUpEmail({
					body: {
						name: body.name,
						email: body.email,
						password: body.password,
					},
				});

				return {
					user: result.user,
					session: result.session,
				};
			} catch (error) {
				const message = error instanceof Error ? error.message : "Sign up failed";

				set.status = 400;
				return { error: message };
			}
		},
		{
			body: t.Object({
				name: t.String({ minLength: 1 }),
				email: t.String({ format: "email" }),
				password: t.String({ minLength: 8 }),
				passwordConfirmation: t.String({ minLength: 8 }),
			}),
			detail: {
				tags: ["Auth"],
				summary: "Create a new account",
			},
		},
	)
	.post(
		"/sign-in",
		async ({ body, set }) => {
			try {
				const result = await auth.api.signInEmail({
					body: {
						email: body.email,
						password: body.password,
					},
				});

				return {
					user: result.user,
					session: result.session,
				};
			} catch (error) {
				const message = error instanceof Error ? error.message : "Invalid credentials";

				set.status = 401;
				return { error: message };
			}
		},
		{
			body: t.Object({
				email: t.String({ format: "email" }),
				password: t.String({ minLength: 8 }),
			}),
			detail: {
				tags: ["Auth"],
				summary: "Sign in with email and password",
			},
		},
	);
