"use client";

import {
	Check,
	CheckCircle2,
	Copy,
	Edit3,
	ExternalLink,
	Info,
	Link2,
	Loader2,
	MousePointer2,
	Star,
	TrendingUp,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useMyUrls } from "@/hooks/use-my-urls";
import { useShortenUrl } from "@/hooks/use-shorten-url";
import { useUpdateMyUrl } from "@/hooks/use-update-my-url";
import { type ActivityItem, toActivityItems, toShortUrl } from "@/lib/activity";
import type { ShortenResponse } from "@/lib/api";
import { buildQuickStats } from "@/lib/dashboard-metrics";

export default function Page() {
	const { data: myUrls, isLoading: isLoadingMyUrls } = useMyUrls();
	const [url, setUrl] = useState("");
	const [createdLink, setCreatedLink] = useState<ShortenResponse | null>(null);
	const [copied, setCopied] = useState(false);
	const [editingActivity, setEditingActivity] = useState<ActivityItem | null>(null);
	const [editingUrl, setEditingUrl] = useState("");
	const { mutate: shortenLink, isPending: isShortening } = useShortenUrl();
	const { mutate: updateMyUrl, isPending: isUpdatingUrl } = useUpdateMyUrl();
	const quickStats = useMemo(() => buildQuickStats(myUrls ?? []), [myUrls]);
	const recentActivity = useMemo(() => toActivityItems(myUrls ?? []).slice(0, 5), [myUrls]);

	const normalizedUrl = url.trim();
	const isUrlValid = isValidUrl(normalizedUrl);

	function handleShortenLink() {
		if (!isUrlValid || isShortening) {
			return;
		}

		shortenLink(normalizedUrl, {
			onSuccess: (data) => {
				setCreatedLink(data);
				setCopied(false);
				setUrl("");
			},
			onError: (error) => {
				toast.error(error.message);
			},
		});
	}

	async function handleCopyShortUrl() {
		if (!createdLink) {
			return;
		}

		try {
			await navigator.clipboard.writeText(createdLink.shortUrl);
			setCopied(true);
			toast.success("Short URL copied to clipboard");
		} catch {
			toast.error("Failed to copy short URL");
		}
	}

	function handleModalChange(open: boolean) {
		if (!open) {
			setCreatedLink(null);
			setCopied(false);
		}
	}

	async function handleCopyActivityLink(activity: ActivityItem) {
		try {
			await navigator.clipboard.writeText(toShortUrl(activity.key));
			toast.success("Short URL copied to clipboard");
		} catch {
			toast.error("Failed to copy short URL");
		}
	}

	function handleOpenEditActivity(activity: ActivityItem) {
		setEditingActivity(activity);
		setEditingUrl(activity.targetUrl);
	}

	function handleEditModalChange(open: boolean) {
		if (!open) {
			setEditingActivity(null);
			setEditingUrl("");
		}
	}

	function handleSaveEditedUrl() {
		if (!editingActivity) {
			return;
		}

		const normalizedEditUrl = editingUrl.trim();

		if (!isValidUrl(normalizedEditUrl)) {
			toast.error("Please enter a valid URL");
			return;
		}

		updateMyUrl(
			{ id: editingActivity.id, url: normalizedEditUrl },
			{
				onSuccess: () => {
					toast.success("Link destination updated");
					setEditingActivity(null);
					setEditingUrl("");
				},
				onError: (error) => {
					toast.error(error.message);
				},
			},
		);
	}

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset className="surface-stage">
				<AppTopbar title="Dashboard" />

				<main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 md:px-8">
					<section className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-6 shadow-[0_20px_40px_rgb(26_28_28_/_5%)] md:p-8">
						<div className="pointer-events-none absolute -top-20 -right-12 size-52 rounded-full bg-primary/10 blur-3xl" />
						<div className="pointer-events-none absolute -bottom-24 -left-16 size-52 rounded-full bg-secondary/70 blur-3xl" />
						<form
							onSubmit={(event) => {
								event.preventDefault();
								handleShortenLink();
							}}
							className="relative flex flex-col gap-4 md:flex-row md:items-end"
						>
							<div className="flex-1 space-y-2">
								<p className="text-[11px] font-bold tracking-[0.18em] text-muted-foreground uppercase">
									Shortener New Link
								</p>
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
							</div>
							<Button
								type="submit"
								disabled={!isUrlValid || isShortening}
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
								Auto-generated Alias
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
								<div className="space-y-3">
									<Input
										readOnly
										value={createdLink.shortUrl}
										className="ghost-border h-10 bg-card font-mono text-xs"
									/>
									<div className="grid grid-cols-2 gap-2">
										<Button
											variant="outline"
											onClick={handleCopyShortUrl}
											className="cursor-pointer"
										>
											{copied ? <Check className="size-4" /> : <Copy className="size-4" />}
											{copied ? "Copied" : "Copy"}
										</Button>
										<Button variant="outline" asChild className="cursor-pointer">
											<a href={createdLink.shortUrl} target="_blank" rel="noopener noreferrer">
												Open
												<ExternalLink className="size-4" />
											</a>
										</Button>
									</div>
								</div>
							) : null}
						</DialogContent>
					</Dialog>

					<Dialog open={!!editingActivity} onOpenChange={handleEditModalChange}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Edit destination URL</DialogTitle>
								<DialogDescription>Update where this short link redirects.</DialogDescription>
							</DialogHeader>
							<div className="space-y-3">
								<Input
									type="url"
									value={editingUrl}
									onChange={(event) => setEditingUrl(event.target.value)}
									placeholder="https://example.com/path"
									disabled={isUpdatingUrl}
									className="ghost-border h-10 bg-card text-xs"
								/>
								<Button
									onClick={handleSaveEditedUrl}
									disabled={isUpdatingUrl}
									className="w-full cursor-pointer"
								>
									{isUpdatingUrl ? "Saving..." : "Save changes"}
									{isUpdatingUrl ? <Loader2 className="size-4 animate-spin" /> : null}
								</Button>
							</div>
						</DialogContent>
					</Dialog>

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
											</div>
										</div>
									</article>
								))
							)}
						</div>
					</section>
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}

function isValidUrl(value: string) {
	if (!value) {
		return false;
	}

	try {
		const parsedUrl = new URL(value);
		return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
	} catch {
		return false;
	}
}
