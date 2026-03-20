"use client";

import {
	CheckCircle2,
	Copy,
	Edit3,
	Info,
	Link2,
	Loader2,
	MousePointer2,
	RefreshCw,
	Star,
	TrendingUp,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { DeleteUrlAction } from "@/components/url/delete-url-action";
import { EditUrlDialog } from "@/components/url/edit-url-dialog";
import { ShortUrlResult } from "@/components/url/short-url-result";
import { useDeleteMyUrl } from "@/hooks/use-delete-my-url";
import { useMyUrls } from "@/hooks/use-my-urls";
import { useShortenUrl } from "@/hooks/use-shorten-url";
import { useUpdateMyUrl } from "@/hooks/use-update-my-url";
import { useUpdateMyUrlKey } from "@/hooks/use-update-my-url-key";
import { useUpdateMyUrlStatus } from "@/hooks/use-update-my-url-status";
import { type ActivityItem, toActivityItems, toShortUrl } from "@/lib/activity";
import type { ShortenResponse } from "@/lib/api";
import { copyToClipboard } from "@/lib/clipboard";
import { buildQuickStats } from "@/lib/dashboard-metrics";
import { formatExpiryInBrowserTimezone, toDateInputValueFromUtc } from "@/lib/expiry";
import {
	generateSuggestedCustomKey,
	getCustomKeyValidationError,
	isValidUrl,
	normalizeCustomKey,
} from "@/lib/url";

const CUSTOM_KEY_CONFLICT_ERROR = "Custom URL key is already in use";

export default function Page() {
	const { data: myUrls, isLoading: isLoadingMyUrls } = useMyUrls();
	const [url, setUrl] = useState("");
	const [customKey, setCustomKey] = useState(() => generateSuggestedCustomKey());
	const [isCustomKeyEdited, setIsCustomKeyEdited] = useState(false);
	const [createdLink, setCreatedLink] = useState<ShortenResponse | null>(null);
	const [copied, setCopied] = useState(false);
	const [editingActivity, setEditingActivity] = useState<ActivityItem | null>(null);
	const [editingUrl, setEditingUrl] = useState("");
	const [editingKey, setEditingKey] = useState("");
	const [editingIsActive, setEditingIsActive] = useState(true);
	const [editingExpiresOn, setEditingExpiresOn] = useState("");
	const { mutate: shortenLink, isPending: isShortening } = useShortenUrl();
	const { mutate: updateMyUrl, isPending: isUpdatingUrl } = useUpdateMyUrl();
	const { mutate: updateMyUrlKey, isPending: isUpdatingUrlKey } = useUpdateMyUrlKey();
	const { mutate: updateMyUrlStatus, isPending: isUpdatingUrlStatus } = useUpdateMyUrlStatus();
	const { mutate: deleteMyUrl, isPending: isDeletingUrl } = useDeleteMyUrl();
	const quickStats = useMemo(() => buildQuickStats(myUrls ?? []), [myUrls]);
	const recentActivity = useMemo(() => toActivityItems(myUrls ?? []).slice(0, 3), [myUrls]);
	const myUrlsById = useMemo(() => {
		return new Map((myUrls ?? []).map((url) => [url.id, url]));
	}, [myUrls]);

	const normalizedUrl = url.trim();
	const normalizedCustomKey = normalizeCustomKey(customKey);
	const normalizedEditingKey = normalizeCustomKey(editingKey);
	const isUrlValid = isValidUrl(normalizedUrl);
	const customKeyError = getCustomKeyValidationError(normalizedCustomKey);
	const editingKeyError = getCustomKeyValidationError(normalizedEditingKey);

	function resetCustomKeySuggestion() {
		setCustomKey(generateSuggestedCustomKey());
		setIsCustomKeyEdited(false);
	}

	function regenerateCustomKey() {
		resetCustomKeySuggestion();
	}

	function submitShortenRequest(key: string, allowRetry: boolean) {
		shortenLink(
			{ url: normalizedUrl, key },
			{
				onSuccess: (data) => {
					setCreatedLink(data);
					setCopied(false);
					setUrl("");
					resetCustomKeySuggestion();
				},
				onError: (error) => {
					if (allowRetry && error.message === CUSTOM_KEY_CONFLICT_ERROR) {
						const retryKey = generateSuggestedCustomKey();
						setCustomKey(retryKey);
						setIsCustomKeyEdited(false);
						submitShortenRequest(retryKey, false);
						return;
					}

					toast.error(error.message);
				},
			},
		);
	}

	function handleShortenLink() {
		if (!isUrlValid || !!customKeyError || isShortening) {
			return;
		}

		const effectiveKey = normalizedCustomKey || generateSuggestedCustomKey();
		if (!normalizedCustomKey) {
			setCustomKey(effectiveKey);
			setIsCustomKeyEdited(false);
		}

		submitShortenRequest(effectiveKey, !isCustomKeyEdited);
	}

	async function handleCopyShortUrl() {
		if (!createdLink) {
			return;
		}

		const wasCopied = await copyToClipboard(createdLink.shortUrl, {
			success: "Short URL copied to clipboard",
			error: "Failed to copy short URL",
		});

		if (wasCopied) {
			setCopied(true);
		}
	}

	function handleModalChange(open: boolean) {
		if (!open) {
			setCreatedLink(null);
			setCopied(false);
			resetCustomKeySuggestion();
		}
	}

	async function handleCopyActivityLink(activity: ActivityItem) {
		await copyToClipboard(toShortUrl(activity.key), {
			success: "Short URL copied to clipboard",
			error: "Failed to copy short URL",
		});
	}

	function handleOpenEditActivity(activity: ActivityItem) {
		setEditingActivity(activity);
		setEditingUrl(activity.targetUrl);
		const currentUrl = myUrlsById.get(activity.id);
		setEditingKey(currentUrl?.key ?? activity.key);
		setEditingIsActive(currentUrl?.isActive ?? true);
		setEditingExpiresOn(toDateInputValueFromUtc(currentUrl?.expiresAt));
	}

	function handleEditModalChange(open: boolean) {
		if (!open) {
			setEditingActivity(null);
			setEditingUrl("");
			setEditingKey("");
			setEditingIsActive(true);
			setEditingExpiresOn("");
		}
	}

	function handleSaveEditedUrl() {
		if (!editingActivity) {
			return;
		}

		const normalizedEditUrl = editingUrl.trim();
		const currentUrl = myUrlsById.get(editingActivity.id);
		const currentIsActive = currentUrl?.isActive ?? true;
		const currentExpiresOn = toDateInputValueFromUtc(currentUrl?.expiresAt);
		const statusChanged = currentIsActive !== editingIsActive;
		const hasKeyChange = normalizedEditingKey !== editingActivity.key;
		const hasUrlChange = normalizedEditUrl !== editingActivity.targetUrl;
		const hasExpiryChange = currentExpiresOn !== editingExpiresOn;

		if (!statusChanged && !hasKeyChange && !hasUrlChange && !hasExpiryChange) {
			toast.message("No changes to save");
			return;
		}

		if (!isValidUrl(normalizedEditUrl)) {
			toast.error("Please enter a valid URL");
			return;
		}

		if (editingKeyError) {
			toast.error(editingKeyError);
			return;
		}

		const finishUpdate = () => {
			toast.success("Link updated");
			setEditingActivity(null);
			setEditingUrl("");
			setEditingKey("");
			setEditingIsActive(true);
			setEditingExpiresOn("");
		};

		const handleMutationError = (error: Error) => {
			toast.error(error.message);
		};

		const applyStatusUpdate = (onDone: () => void) => {
			if (!statusChanged) {
				onDone();
				return;
			}

			updateMyUrlStatus(
				{ id: editingActivity.id, isActive: editingIsActive },
				{
					onSuccess: onDone,
					onError: handleMutationError,
				},
			);
		};

		const applyKeyUpdate = (onDone: () => void) => {
			if (!hasKeyChange) {
				onDone();
				return;
			}

			updateMyUrlKey(
				{ id: editingActivity.id, key: normalizedEditingKey },
				{
					onSuccess: onDone,
					onError: handleMutationError,
				},
			);
		};

		const applyUrlUpdate = (onDone: () => void) => {
			if (!hasUrlChange && !hasExpiryChange) {
				onDone();
				return;
			}

			updateMyUrl(
				{ id: editingActivity.id, url: normalizedEditUrl, expiresAt: editingExpiresOn || null },
				{
					onSuccess: onDone,
					onError: handleMutationError,
				},
			);
		};

		applyUrlUpdate(() => applyKeyUpdate(() => applyStatusUpdate(finishUpdate)));
	}

	function handleDeleteActivity(activity: ActivityItem) {
		deleteMyUrl(
			{ id: activity.id },
			{
				onSuccess: () => {
					toast.success("Link deleted");
				},
				onError: (error) => {
					toast.error(error.message);
				},
			},
		);
	}

	return (
		<DashboardShell title="Dashboard">
			<main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 md:px-8">
				<section className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-6 shadow-[0_20px_40px_rgb(26_28_28_/_5%)] md:p-8">
					<div className="pointer-events-none absolute -top-20 -right-12 size-52 rounded-full bg-primary/10 blur-3xl" />
					<div className="pointer-events-none absolute -bottom-24 -left-16 size-52 rounded-full bg-secondary/70 blur-3xl" />
					<p className="mb-2 text-[11px] font-bold tracking-[0.18em] text-muted-foreground uppercase">
						Shortener New Link
					</p>
					<form
						onSubmit={(event) => {
							event.preventDefault();
							handleShortenLink();
						}}
						className="relative flex flex-col gap-4 md:flex-row md:items-stretch"
					>
						<div className="flex-1 space-y-2">
							<div className="flex h-12 items-center rounded-md border border-border/60 bg-muted/70 px-4 transition-colors focus-within:border-primary">
								<Link2 className="mr-3 size-4 text-muted-foreground" />
								<input
									type="url"
									placeholder="https://very-long-architectural-resource-url.com/structure/sub-page"
									value={url}
									onChange={(event) => setUrl(event.target.value)}
									disabled={isShortening}
									className="w-full border-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
								/>
							</div>
							<div className="flex h-10 items-center gap-2 rounded-md border border-border/60 bg-muted/50 px-3 transition-colors focus-within:border-primary">
								<span className="text-xs font-semibold tracking-wide text-muted-foreground">
									l.arch/
								</span>
								<input
									type="text"
									placeholder="custom-key"
									value={customKey}
									onChange={(event) => {
										setCustomKey(event.target.value.toLowerCase());
										setIsCustomKeyEdited(true);
									}}
									disabled={isShortening}
									className="w-full border-none bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground"
								/>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={regenerateCustomKey}
									disabled={isShortening}
									className="h-7 px-2 text-xs"
								>
									<RefreshCw className="size-3" />
									Regenerate
								</Button>
							</div>
							{customKeyError ? (
								<p className="text-xs text-destructive">{customKeyError}</p>
							) : (
								<p className="text-xs text-muted-foreground">
									You can edit this key. Allowed: 3-32 chars, lowercase letters, numbers, and
									hyphens.
								</p>
							)}
						</div>
						<Button
							type="submit"
							disabled={!isUrlValid || !!customKeyError || isShortening}
							className="h-12 cursor-pointer px-7 text-sm font-semibold disabled:cursor-not-allowed"
						>
							{isShortening ? "Shortening..." : "Shorten Link"}
							{isShortening ? (
								<Loader2 className="size-4 animate-spin" />
							) : (
								<Zap className="size-4" />
							)}
						</Button>
					</form>
					<div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
						<span className="flex items-center gap-1.5">
							<CheckCircle2 className="size-3.5 text-primary" />
							Custom or Auto Alias
						</span>
						<span className="flex items-center gap-1.5">
							<CheckCircle2 className="size-3.5 text-primary" />
							Detailed Analytics
						</span>
						<span className="flex items-center gap-1.5">
							<CheckCircle2 className="size-3.5 text-primary" />
							Custom Metadata
						</span>
					</div>
				</section>

				<Dialog open={!!createdLink} onOpenChange={handleModalChange}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Short URL Ready</DialogTitle>
							<DialogDescription>
								Your shortened link has been created successfully.
							</DialogDescription>
						</DialogHeader>
						{createdLink ? (
							<ShortUrlResult
								shortUrl={createdLink.shortUrl}
								copied={copied}
								onCopy={handleCopyShortUrl}
							/>
						) : null}
					</DialogContent>
				</Dialog>

				<EditUrlDialog
					open={!!editingActivity}
					onOpenChange={handleEditModalChange}
					url={editingUrl}
					onUrlChange={setEditingUrl}
					urlKey={editingKey}
					onUrlKeyChange={(value) => setEditingKey(value.toLowerCase())}
					urlKeyError={editingKeyError}
					isActive={editingIsActive}
					onIsActiveChange={setEditingIsActive}
					expiresOn={editingExpiresOn}
					onExpiresOnChange={setEditingExpiresOn}
					onSave={handleSaveEditedUrl}
					isPending={isUpdatingUrl || isUpdatingUrlKey || isUpdatingUrlStatus}
				/>

				<section className="grid gap-6 md:grid-cols-3">
					{quickStats.map((stat) => (
						<article
							key={stat.title}
							className="surface-floating ghost-border flex h-40 flex-col justify-between rounded-xl p-6"
						>
							<div className="flex items-start justify-between">
								<p className="text-xs font-semibold tracking-[0.13em] text-muted-foreground uppercase">
									{stat.title}
								</p>
								<div
									className={`flex size-8 items-center justify-center rounded-full ${
										stat.tone === "positive"
											? "bg-primary/10 text-primary"
											: stat.tone === "featured"
												? "bg-secondary text-secondary-foreground"
												: "bg-muted text-muted-foreground"
									}`}
								>
									{stat.tone === "positive" ? (
										<MousePointer2 className="size-4" />
									) : stat.tone === "featured" ? (
										<Star className="size-4" />
									) : (
										<Info className="size-4" />
									)}
								</div>
							</div>
							<div>
								<p
									className={`font-semibold tracking-tight ${
										stat.tone === "featured" ? "text-2xl" : "text-4xl"
									}`}
								>
									{stat.value}
								</p>
								<p
									className={`mt-1 flex items-center gap-1 text-xs font-medium ${
										stat.tone === "positive" ? "text-primary" : "text-muted-foreground"
									}`}
								>
									{stat.tone === "positive" ? <TrendingUp className="size-3.5" /> : null}
									{stat.detail}
								</p>
							</div>
						</article>
					))}
				</section>

				<section className="space-y-5">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold tracking-tight">Recent Activity</h2>
						<Button variant="link" className="h-auto p-0 text-xs font-semibold" asChild>
							<Link href="/my-links">View all links</Link>
						</Button>
					</div>
					<div className="space-y-3">
						{isLoadingMyUrls ? (
							<p className="rounded-xl border border-border/50 p-4 text-sm text-muted-foreground">
								Loading links...
							</p>
						) : recentActivity.length === 0 ? (
							<p className="rounded-xl border border-border/50 p-4 text-sm text-muted-foreground">
								No links yet
							</p>
						) : (
							recentActivity.map((activity) => (
								<article
									key={activity.id}
									className="group flex flex-col gap-4 rounded-xl border border-transparent p-4 transition-all hover:border-border/60 hover:bg-muted/50 sm:flex-row sm:items-center"
								>
									<div className="flex min-w-0 flex-1 items-center gap-4">
										<div className="flex size-5 shrink-0 items-center justify-center overflow-hidden">
											{activity.favicon ? (
												<img
													src={activity.favicon}
													alt="Favicon"
													className="size-full object-contain"
												/>
											) : (
												<Link2 className="size-4 text-muted-foreground/80" />
											)}
										</div>
										<div className="min-w-0">
											<div className="flex items-center gap-2">
												<p className="truncate text-sm font-semibold">{activity.slug}</p>
												<span className="shrink-0 text-xs font-semibold text-primary">
													{activity.clicks.toLocaleString()} clicks
												</span>
											</div>
											<p className="truncate text-xs text-muted-foreground">
												{activity.destination}
											</p>
											{myUrlsById.get(activity.id)?.expiresAt ? (
												<p className="mt-0.5 text-[11px] text-muted-foreground/80">
													Available until{" "}
													{formatExpiryInBrowserTimezone(myUrlsById.get(activity.id)?.expiresAt)}
												</p>
											) : null}
										</div>
									</div>
									<div className="flex items-center gap-1 sm:gap-2">
										<div className="flex gap-1">
											<Button
												variant="ghost"
												size="icon-sm"
												aria-label={`Copy ${activity.slug}`}
												className="cursor-pointer"
												onClick={() => handleCopyActivityLink(activity)}
											>
												<Copy className="size-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon-sm"
												aria-label={`Edit ${activity.slug}`}
												className="cursor-pointer"
												onClick={() => handleOpenEditActivity(activity)}
											>
												<Edit3 className="size-4" />
											</Button>
											<DeleteUrlAction
												onConfirm={() => handleDeleteActivity(activity)}
												isPending={isDeletingUrl}
												ariaLabel="Delete"
											/>
										</div>
									</div>
								</article>
							))
						)}
					</div>
				</section>
			</main>
		</DashboardShell>
	);
}
