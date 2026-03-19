"use client";

import {
	Check,
	CheckCircle2,
	Copy,
	Edit3,
	ExternalLink,
	Info,
	KeyRound,
	Link2,
	Loader2,
	Moon,
	MousePointer2,
	Star,
	Sun,
	TrendingUp,
	UploadCloud,
	Zap,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
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
import { useShortenUrl } from "@/hooks/use-shorten-url";
import type { ShortenResponse } from "@/lib/api";

const quickStats = [
	{
		title: "Total Clicks",
		value: "42,892",
		detail: "+12.5% from last month",
		tone: "positive",
	},
	{
		title: "Active Links",
		value: "156",
		detail: "4 scheduled for expiry",
		tone: "neutral",
	},
	{
		title: "Top Performing",
		value: "/summer-campaign",
		detail: "12.4k clicks • Source: Twitter",
		tone: "featured",
	},
] as const;

const recentActivity = [
	{
		slug: "l.architect/docs-24",
		destination: "google.com/drive/folders/shared-resources",
		clicks: "1,204",
		favicon:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuBMFweqerNzL8Q11gLKzRxHLuHYohgvbVUvkchwaCZmHt3a_MJ0enUlzNDXW7MTgya--U9mO5vjX9-BiO7Xh1szFr6Rid9-otenpLwSFECxOhYXgYym3MFZaJx9DZWtHAN_uEQ3WGteTsA_cRmQJvKHmtsft-6PImICQFFaJ9isPGf05gGzW9mJ9mHGkp2DxjErLW3xY1GDpDEw1R6bvN7BDLWfzGMvNzRJhO4iGGMzrocDwmrhLrt4xeQ8l1gV4l61fGOwPZ08c5ZP",
	},
	{
		slug: "l.architect/team-slack",
		destination: "join.slack.com/t/architecture-community",
		clicks: "842",
		favicon:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuCk29hOPMF66nAYAOtbGoc4yrjQUBq_5PtQHGFs7EYsYRTakQnyfXdPl5VjnWsOkZRT72cNJALsdySmySO1S1qPOG-3-vY61KSMek51ig0kAHVz-HacOJtouIHKF5znasNmbpSiaiJbQg8kCrcw7Omk5kBn4K6BWZntDIZW7HeKYDLYGrqtqBhsqvV42BL7qfXoOMB_ADhla89n6tje2dutG_0fm5CLBraayb6n0oAybX4M4m9z_0lBEkkMo77q4tDrhYQTZYg8R5G8",
	},
	{
		slug: "l.architect/v3-design",
		destination: "figma.com/file/arch-prototypes-v3",
		clicks: "4,521",
		favicon:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuDQaQy9fSfPPXXPZaWi1WuFq8XDsCEGo1HgldFljB5YmwgkZYpDJM8ivrjhZMaAcgpDNKsYyBr6e_YdieDpM4RdXJcWhrDXxcrIVft8Mt5S0HCF3o7XQKbDS8AQ2kuCqu-4DTWZ-akzBOEGbQO9s80QVgQReWfRlHp7A3mIzNimYFMSd0Z_-kzIaWNO3ApJBw5M32ZdPmpwqVBA3oQVCqqF_K0aQlLdN9Iaap5Znvn7oeYdEwhBFHCdsNn6CWl5wKk7qYxvjYQV_67Q",
	},
] as const;

const trafficOrigins = [
	{ label: "Direct Traffic", percentage: 65 },
	{ label: "Referral", percentage: 20 },
	{ label: "Social", percentage: 15 },
] as const;

export default function Page() {
	const { resolvedTheme, setTheme } = useTheme();
	const [url, setUrl] = useState("");
	const [createdLink, setCreatedLink] = useState<ShortenResponse | null>(null);
	const [copied, setCopied] = useState(false);
	const { mutate: shortenLink, isPending: isShortening } = useShortenUrl();

	const normalizedUrl = url.trim();
	const isUrlValid = isValidUrl(normalizedUrl);

	function toggleTheme() {
		setTheme(resolvedTheme === "dark" ? "light" : "dark");
	}

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

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset className="surface-stage">
				<header className="frosted sticky top-0 z-20 border-b border-border/35">
					<div className="flex h-16 items-center justify-between gap-3 px-4 md:px-8">
						<div className="flex min-w-0 flex-1 items-center gap-3">
							<SidebarTrigger className="-ml-1" />
							<p className="text-sm font-medium">Dashboard</p>
						</div>
						<Button variant="ghost" size="icon-sm" onClick={toggleTheme} aria-label="Toggle theme">
							{resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
						</Button>
					</div>
				</header>

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

					<section className="grid gap-8 lg:grid-cols-12">
						<div className="space-y-5 lg:col-span-8">
							<div className="flex items-center justify-between">
								<h2 className="text-lg font-semibold tracking-tight">Recent Activity</h2>
								<Button variant="link" className="h-auto p-0 text-xs font-semibold">
									View all links
								</Button>
							</div>
							<div className="space-y-3">
								{recentActivity.map((activity) => (
									<article
										key={activity.slug}
										className="group flex flex-col gap-4 rounded-xl border border-transparent p-4 transition-all hover:border-border/60 hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
									>
										<div className="flex min-w-0 items-center gap-4">
											<div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-card shadow-sm">
												<img
													src={activity.favicon}
													alt="Favicon"
													className="size-full object-cover"
												/>
											</div>
											<div className="min-w-0">
												<p className="truncate text-sm font-semibold">{activity.slug}</p>
												<p className="truncate text-xs text-muted-foreground">
													{activity.destination}
												</p>
											</div>
										</div>
										<div className="flex items-center justify-between gap-5 sm:justify-end sm:gap-8">
											<div className="text-right">
												<p className="text-sm font-medium">{activity.clicks}</p>
												<p className="text-[10px] tracking-[0.1em] text-muted-foreground uppercase">
													Clicks
												</p>
											</div>
											<div className="flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
												<Button variant="ghost" size="icon-sm" aria-label={`Copy ${activity.slug}`}>
													<Copy className="size-4" />
												</Button>
												<Button variant="ghost" size="icon-sm" aria-label={`Edit ${activity.slug}`}>
													<Edit3 className="size-4" />
												</Button>
											</div>
										</div>
									</article>
								))}
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
