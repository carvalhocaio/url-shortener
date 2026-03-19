import { Elysia, t } from "elysia";
import { authMiddleware } from "../lib/auth-middleware";
import {
	deactivateUrlByIdAndUserId,
	deleteUrl,
	findBySecretKeyAndUserId,
	getUrlsByUserId,
} from "../services/url.service";

export const adminRoutes = new Elysia({ prefix: "/api/admin" })
	.use(authMiddleware)
	.get(
		"/urls",
		async ({ user }) => {
			const all = await getUrlsByUserId(user.id);
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
				summary: "List my URLs",
			},
		},
	)
	.post(
		"/urls/:id/deactivate",
		async ({ params, set, user }) => {
			const updated = await deactivateUrlByIdAndUserId(params.id, user.id);

			if (!updated) {
				set.status = 404;
				return { error: "URL not found" };
			}

			return { deactivated: { id: updated.id, key: updated.key, isActive: updated.isActive } };
		},
		{
			auth: true,
			params: t.Object({
				id: t.Numeric(),
			}),
			detail: {
				tags: ["Admin"],
				summary: "Deactivate one of my URLs",
			},
		},
	)
	.delete(
		"/urls/:secretKey",
		async ({ params, set, user }) => {
			const record = await findBySecretKeyAndUserId(params.secretKey, user.id);

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
				summary: "Delete one of my URLs by secret key",
			},
		},
	);
