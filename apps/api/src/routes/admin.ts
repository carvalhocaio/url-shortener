import { Elysia, t } from "elysia";
import { authMiddleware } from "../lib/auth-middleware";
import { getCustomKeyValidationError, normalizeCustomKey } from "../services/keygen";
import {
	UrlKeyAlreadyExistsError,
	getUrlsByUserId,
	softDeleteUrlByIdAndUserId,
	updateUrlByIdAndUserId,
	updateUrlKeyByIdAndUserId,
	updateUrlStatusByIdAndUserId,
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
				expiresAt: u.expiresAt,
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

			const updated = await updateUrlByIdAndUserId(params.id, user.id, body.url, body.expiresAt);

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
				expiresAt: updated.expiresAt,
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
				expiresAt: t.Nullable(t.String({ format: "date" })),
			}),
			detail: {
				tags: ["Admin"],
				summary: "Update one of my URLs",
			},
		},
	)
	.patch(
		"/urls/:id/key",
		async ({ params, body, set, user }) => {
			const normalizedKey = normalizeCustomKey(body.key);
			const keyValidationError = getCustomKeyValidationError(normalizedKey);

			if (keyValidationError) {
				set.status = 400;
				return { error: keyValidationError };
			}

			try {
				const updated = await updateUrlKeyByIdAndUserId(params.id, user.id, normalizedKey);

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
					expiresAt: updated.expiresAt,
					createdAt: updated.createdAt,
				};
			} catch (error) {
				if (error instanceof UrlKeyAlreadyExistsError) {
					set.status = 409;
					return { error: error.message };
				}

				throw error;
			}
		},
		{
			auth: true,
			params: t.Object({
				id: t.Numeric(),
			}),
			body: t.Object({
				key: t.String(),
			}),
			detail: {
				tags: ["Admin"],
				summary: "Update one of my URL keys",
			},
		},
	)
	.patch(
		"/urls/:id/status",
		async ({ params, body, set, user }) => {
			const updated = await updateUrlStatusByIdAndUserId(params.id, user.id, body.isActive);

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
				expiresAt: updated.expiresAt,
				createdAt: updated.createdAt,
			};
		},
		{
			auth: true,
			params: t.Object({
				id: t.Numeric(),
			}),
			body: t.Object({
				isActive: t.Boolean(),
			}),
			detail: {
				tags: ["Admin"],
				summary: "Update one of my URL statuses",
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
