import { Elysia, t } from "elysia";
import { auth } from "../lib/auth";
import { deleteUrl, findBySecretKey, getAllUrls } from "../services/url.service";

const authMiddleware = new Elysia({ name: "auth-middleware" }).macro({
	auth: {
		async resolve({ status, request: { headers } }) {
			const session = await auth.api.getSession({ headers });

			if (!session) return status(401);

			return {
				user: session.user,
				session: session.session,
			};
		},
	},
});

export const adminRoutes = new Elysia({ prefix: "/api/admin" })
	.use(authMiddleware)
	.get(
		"/urls",
		async () => {
			const all = await getAllUrls();
			return all.map((u) => ({
				id: u.id,
				key: u.key,
				targetUrl: u.targetUrl,
				clicks: u.clicks,
				isActive: u.isActive,
				createdAt: u.createdAt,
			}));
		},
		{
			auth: true,
			detail: {
				tags: ["Admin"],
				summary: "List all URLs",
			},
		},
	)
	.delete(
		"/urls/:secretKey",
		async ({ params, set }) => {
			const record = await findBySecretKey(params.secretKey);

			if (!record) {
				set.status = 404;
				return { error: "URL not found" };
			}

			const deleted = await deleteUrl(record.id);
			return { deleted: { id: deleted.id, key: deleted.key } };
		},
		{
			auth: true,
			params: t.Object({
				secretKey: t.String(),
			}),
			detail: {
				tags: ["Admin"],
				summary: "Delete a URL by secret key",
			},
		},
	);
