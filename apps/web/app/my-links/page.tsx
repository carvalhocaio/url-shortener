"use client";

import {
	Bell,
	CheckCircle2,
	Copy,
	Edit3,
	Info,
	KeyRound,
	Link2,
	Loader2,
	MousePointer2,
	Search,
	Settings,
	Star,
	TrendingUp,
	UploadCloud,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useMyUrls } from "@/hooks/use-my-urls";
import { useUpdateMyUrl } from "@/hooks/use-update-my-url";
import { type ActivityItem, toActivityItems, toShortUrl } from "@/lib/activity";
import { buildQuickStats } from "@/lib/dashboard-metrics";

const trafficOrigins = [
	{ label: "Direct Traffic", percentage: 65 },
	{ label: "Referral", percentage: 20 },
	{ label: "Social", percentage: 15 },
] as const;

export default function MyLinksPage() {
	const { data: myUrls, isLoading: isLoadingMyUrls } = useMyUrls();
	const { mutate: updateMyUrl, isPending: isUpdatingUrl } = useUpdateMyUrl();
	const quickStats = useMemo(() => buildQuickStats(myUrls ?? []), [myUrls]);
	const recentActivity = useMemo(() => toActivityItems(myUrls ?? []), [myUrls]);
	const [editingActivity, setEditingActivity] = useState<ActivityItem | null>(null);
	const [editingUrl, setEditingUrl] = useState("");

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
				<header className="frosted sticky top-0 z-20 border-b border-border/35">
					<div className="flex h-16 items-center justify-between gap-3 px-4 md:px-8">
						<div className="flex min-w-0 flex-1 items-center gap-3">
							<SidebarTrigger className="-ml-1" />
							<div className="relative hidden w-full max-w-md items-center md:flex">
								<Search className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground" />
								<input
									type="text"
									placeholder="Search architecture..."
									className="h-9 w-full rounded-md border border-transparent bg-muted/80 pr-3 pl-10 text-sm transition-all outline-none focus:border-ring"
								/>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<Button variant="ghost" size="icon-sm" aria-label="Notifications">
								<Bell className="size-4" />
							</Button>
							<Button variant="ghost" size="icon-sm" aria-label="Settings">
								<Settings className="size-4" />
							</Button>
							<img
								src="https://lh3.googleusercontent.com/aida-public/AB6AXuCW-l4wYzpO87WmVA7G4qJ4xkY-5BItdSdTpss4Rj3JBk5CN25EoPkPGsXH8eqXmnWKwaUJGcTwkRkrKZMCLYIjrJgCrOWDYVtzdPBBduMgyRTqb_aF8aVCqRO8-s0JQGL0erIS_MTbYM7NivbxNMbwPAGlvYQOTnDoOh6wwgJ1VmRNsj15-Ll_kb-JFOOXG8KntcPGW-erm9JeDmjQp0NvLJNL04AAiVnOLb7F_iklUnFWMcwWSb-6xXzJRINFgRjDV0KgXtPpR7Wb"
								alt="User avatar"
								className="size-8 rounded-full object-cover ring-1 ring-border"
							/>
						</div>
					</div>
				</header>

				<main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 md:px-8">
					<section className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-6 shadow-[0_20px_40px_rgb(26_28_28_/_5%)] md:p-8">
						<div className="pointer-events-none absolute -top-20 -right-12 size-52 rounded-full bg-primary/10 blur-3xl" />
						<div className="pointer-events-none absolute -bottom-24 -left-16 size-52 rounded-full bg-secondary/70 blur-3xl" />
						<div className="relative flex flex-col gap-4 md:flex-row md:items-end">
							<div className="flex-1 space-y-2">
								<p className="text-[11px] font-bold tracking-[0.18em] text-muted-foreground uppercase">
									Shortener New Link
								</p>
								<div className="flex h-12 items-center rounded-md border border-border/60 bg-muted/70 px-4 transition-colors focus-within:border-primary">
									<Link2 className="mr-3 size-4 text-muted-foreground" />
									<input
										type="url"
										placeholder="https://very-long-architectural-resource-url.com/structure/sub-page"
										className="w-full border-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
									/>
								</div>
							</div>
							<Button className="h-12 px-7 text-sm font-semibold">
								Shorten Link
								<Zap className="size-4" />
							</Button>
						</div>
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

					<section className="grid gap-8 lg:grid-cols-12">
						<div className="space-y-5 lg:col-span-8">
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
						</div>

						<div className="space-y-6 lg:col-span-4">
							<article className="surface-section ghost-border rounded-xl p-6">
								<h3 className="mb-4 text-sm font-bold tracking-[0.14em] text-muted-foreground uppercase">
									Traffic Origins
								</h3>
								<div className="space-y-4">
									{trafficOrigins.map((source) => (
										<div key={source.label} className="flex items-center justify-between gap-3">
											<span className="text-xs">{source.label}</span>
											<div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
												<div
													className="h-full rounded-full bg-primary"
													style={{ width: `${source.percentage}%` }}
												/>
											</div>
											<span className="w-10 text-right font-mono text-xs">
												{source.percentage}%
											</span>
										</div>
									))}
								</div>
							</article>

							<article className="relative h-64 overflow-hidden rounded-xl bg-foreground shadow-xl">
								<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/35 via-transparent to-transparent" />
								<img
									src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqyC_06KZXdDxljAOVofrYHb_LaHNbs71Bh4EZxC07Lm1-amodYSlis0i2x4W46L8l3rSU4R3TuazEYisIPobx3Om24VlACkJgyWsyeUuomYe6gjb_mI_y26ZopbEUDhPIaN_gNPzUpvVlWedVkACZjsz8nxu4T4Shu-E-sk1cG6mmvLeb4K1alkiOuqozpRZUXl17JE3rGMeTHYzpkbUtmQZoaUgAZ2lJNXFVD6COkPBLxNpQcvg6Ani6VOmmy5F1Xp5Q3c1XwYoj"
									alt="Global map"
									className="size-full object-cover grayscale invert opacity-20"
								/>
								<div className="absolute right-4 bottom-4 left-4 rounded-lg border border-white/15 bg-white/10 p-3 backdrop-blur-md">
									<p className="mb-1 text-[10px] font-bold tracking-[0.13em] text-white/70 uppercase">
										Live Global Activity
									</p>
									<div className="flex items-center gap-2 text-white">
										<span className="size-2 rounded-full bg-primary animate-pulse" />
										<p className="text-xs font-medium">New click from London, UK</p>
									</div>
								</div>
							</article>

							<div className="space-y-3">
								<Button
									variant="outline"
									className="h-11 w-full justify-between rounded-md bg-card px-4 text-xs font-semibold"
								>
									Bulk Upload Links
									<UploadCloud className="size-4 text-muted-foreground" />
								</Button>
								<Button
									variant="outline"
									className="h-11 w-full justify-between rounded-md bg-card px-4 text-xs font-semibold"
								>
									Generate API Key
									<KeyRound className="size-4 text-muted-foreground" />
								</Button>
							</div>
						</div>
					</section>
					<div className="md:hidden">
						<div className="relative w-full">
							<Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
							<input
								type="text"
								placeholder="Search architecture..."
								className="h-10 w-full rounded-md border border-transparent bg-muted/80 pr-3 pl-10 text-sm outline-none focus:border-ring"
							/>
						</div>
					</div>
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
