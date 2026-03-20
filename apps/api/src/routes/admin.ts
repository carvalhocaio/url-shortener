import { Elysia, t } from "elysia";
import { authMiddleware } from "../lib/auth-middleware";
import {
	deactivateUrlByIdAndUserId,
	getUrlsByUserId,
	softDeleteUrlByIdAndUserId,
	updateUrlTargetByIdAndUserId,
} from "../services/url.service";
import { isUrlReachable } from "../services/validator";

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
	.patch(
		"/urls/:id",
		async ({ body, params, set, user }) => {
			const reachable = await isUrlReachable(body.url);

			if (!reachable) {
				set.status = 400;
				return { error: "URL is not reachable" };
			}

			const updated = await updateUrlTargetByIdAndUserId(params.id, user.id, body.url);

			if (!updated) {
				set.status = 404;
				return { error: "URL not found" };
			}

			return {
				id: updated.id,
				key: updated.key,
				targetUrl: updated.targetUrl,
				clicks: updated.clicks,
				isActive: updated.isActive,
				createdAt: updated.createdAt,
			};
		},
		{
			auth: true,
			params: t.Object({
				id: t.Numeric(),
			}),
			body: t.Object({
				url: t.String({ format: "uri" }),
			}),
			detail: {
				tags: ["Admin"],
				summary: "Update one of my URLs",
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
		"/urls/:id",
		async ({ params, set, user }) => {
			const deleted = await softDeleteUrlByIdAndUserId(params.id, user.id);

			if (!deleted) {
				set.status = 404;
				return { error: "URL not found" };
			}

			return { deleted: { id: deleted.id, key: deleted.key } };
		},
		{
			auth: true,
			params: t.Object({
				id: t.Numeric(),
			}),
			detail: {
				tags: ["Admin"],
				summary: "Soft delete one of my URLs by id",
			},
		},
	);
