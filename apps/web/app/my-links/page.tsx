"use client";

import {
	ArrowDown,
	ArrowUp,
	ArrowUpDown,
	Copy,
	Download,
	Edit3,
	Filter,
	Link2,
	Loader2,
	RefreshCw,
	Search,
	Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
import { formatExpiryInBrowserTimezone, toDateInputValueFromUtc } from "@/lib/expiry";
import {
	generateSuggestedCustomKey,
	getCustomKeyValidationError,
	isValidUrl,
	normalizeCustomKey,
} from "@/lib/url";

const PAGE_SIZE = 10;

type StatusFilter = "all" | "active" | "inactive";
type SortField = "clicks" | "createdAt";
type SortDirection = "asc" | "desc";
const CUSTOM_KEY_CONFLICT_ERROR = "Custom URL key is already in use";

export default function MyLinksPage() {
	const { data: myUrls, isLoading: isLoadingMyUrls } = useMyUrls();
	const { mutate: shortenLink, isPending: isShortening } = useShortenUrl();
	const { mutate: updateMyUrl, isPending: isUpdatingUrl } = useUpdateMyUrl();
	const { mutate: updateMyUrlKey, isPending: isUpdatingUrlKey } = useUpdateMyUrlKey();
	const { mutate: updateMyUrlStatus, isPending: isUpdatingUrlStatus } = useUpdateMyUrlStatus();
	const { mutate: deleteMyUrl, isPending: isDeletingUrl } = useDeleteMyUrl();
	const activities = useMemo(() => toActivityItems(myUrls ?? []), [myUrls]);
	const myUrlsById = useMemo(() => {
		return new Map((myUrls ?? []).map((url) => [url.id, url]));
	}, [myUrls]);

	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [sortField, setSortField] = useState<SortField>("createdAt");
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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
					toast.success("Short URL created");
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

	const filteredActivities = useMemo(() => {
		const normalizedSearch = searchQuery.trim().toLowerCase();

		return activities.filter((activity) => {
			const urlMeta = myUrlsById.get(activity.id);
			const isActive = urlMeta?.isActive ?? true;

			if (statusFilter === "active" && !isActive) {
				return false;
			}

			if (statusFilter === "inactive" && isActive) {
				return false;
			}

			if (!normalizedSearch) {
				return true;
			}

			const identity = `l.arch${activity.slug}`.toLowerCase();
			const destination = activity.destination.toLowerCase();

			return identity.includes(normalizedSearch) || destination.includes(normalizedSearch);
		});
	}, [activities, myUrlsById, searchQuery, statusFilter]);

	const sortedActivities = useMemo(() => {
		const factor = sortDirection === "asc" ? 1 : -1;

		return [...filteredActivities].sort((left, right) => {
			if (sortField === "clicks") {
				return (left.clicks - right.clicks) * factor;
			}

			const leftCreatedAt = myUrlsById.get(left.id)?.createdAt ?? "";
			const rightCreatedAt = myUrlsById.get(right.id)?.createdAt ?? "";
			const leftTimestamp = new Date(leftCreatedAt).getTime();
			const rightTimestamp = new Date(rightCreatedAt).getTime();

			const safeLeft = Number.isNaN(leftTimestamp) ? 0 : leftTimestamp;
			const safeRight = Number.isNaN(rightTimestamp) ? 0 : rightTimestamp;

			return (safeLeft - safeRight) * factor;
		});
	}, [filteredActivities, myUrlsById, sortDirection, sortField]);

	const totalPages = Math.max(1, Math.ceil(sortedActivities.length / PAGE_SIZE));

	useEffect(() => {
		if (currentPage > totalPages) {
			setCurrentPage(totalPages);
		}
	}, [currentPage, totalPages]);

	const paginatedActivities = useMemo(() => {
		const start = (currentPage - 1) * PAGE_SIZE;
		const end = start + PAGE_SIZE;
		return sortedActivities.slice(start, end);
	}, [currentPage, sortedActivities]);

	const rangeStart = filteredActivities.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
	const rangeEnd =
		filteredActivities.length === 0
			? 0
			: Math.min(currentPage * PAGE_SIZE, filteredActivities.length);

	function toggleSort(field: SortField) {
		if (sortField === field) {
			setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
		} else {
			setSortField(field);
			setSortDirection("desc");
		}

		setCurrentPage(1);
	}

	function renderSortIcon(field: SortField) {
		if (sortField !== field) {
			return <ArrowUpDown className="size-3.5" />;
		}

		return sortDirection === "asc" ? (
			<ArrowUp className="size-3.5" />
		) : (
			<ArrowDown className="size-3.5" />
		);
	}

	function handleOpenCreateModal() {
		setIsCreateModalOpen(true);
	}

	function handleCreateModalChange(open: boolean) {
		setIsCreateModalOpen(open);

		if (!open) {
			setCreatedLink(null);
			setCopied(false);
			setUrl("");
			resetCustomKeySuggestion();
		}
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

	function handleExportCsv() {
		if (filteredActivities.length === 0) {
			toast.error("No links to export");
			return;
		}

		try {
			const rows = sortedActivities.map((activity) => {
				const urlMeta = myUrlsById.get(activity.id);
				const isActive = urlMeta?.isActive ?? true;
				const expiry = formatExpiryInBrowserTimezone(urlMeta?.expiresAt);

				return {
					identity: `l.arch${activity.slug}`,
					destination: activity.destination,
					status: isActive ? "Active" : "Inactive",
					expiresAt: expiry ?? "-",
					clicks: activity.clicks,
					createdAt: formatCreatedAt(urlMeta?.createdAt),
					shortUrl: toShortUrl(activity.key),
				};
			});

			const headers = [
				"Identity",
				"Destination",
				"Status",
				"Available Until (Browser TZ)",
				"Clicks",
				"Created At",
				"Short URL",
			];
			const csvLines = [
				headers.join(","),
				...rows.map((row) =>
					[
						row.identity,
						row.destination,
						row.status,
						row.expiresAt,
						String(row.clicks),
						row.createdAt,
						row.shortUrl,
					]
						.map(toCsvCell)
						.join(","),
				),
			];

			const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
			const downloadUrl = URL.createObjectURL(blob);
			const anchor = document.createElement("a");
			anchor.href = downloadUrl;
			anchor.download = `my-links-${new Date().toISOString().slice(0, 10)}.csv`;
			document.body.appendChild(anchor);
			anchor.click();
			document.body.removeChild(anchor);
			URL.revokeObjectURL(downloadUrl);
			toast.success("CSV exported successfully");
		} catch {
			toast.error("Failed to export CSV");
		}
	}

	return (
		<DashboardShell title="My Links">
			<main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 md:px-8">
				<section className="flex flex-wrap items-end justify-between gap-4">
					<div>
						<h1 className="text-3xl font-semibold tracking-tight text-foreground">My Links</h1>
						<p className="mt-1 text-sm text-muted-foreground">
							Manage and monitor your digital infrastructure links.
						</p>
					</div>
					<div className="flex items-center gap-2">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" className="h-9 px-3 text-sm">
									<Filter className="size-4" />
									{statusFilter === "all"
										? "Filter"
										: statusFilter === "active"
											? "Active"
											: "Inactive"}
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuRadioGroup
									value={statusFilter}
									onValueChange={(value) => {
										setStatusFilter(value as StatusFilter);
										setCurrentPage(1);
									}}
								>
									<DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
									<DropdownMenuRadioItem value="active">Active</DropdownMenuRadioItem>
									<DropdownMenuRadioItem value="inactive">Inactive</DropdownMenuRadioItem>
								</DropdownMenuRadioGroup>
							</DropdownMenuContent>
						</DropdownMenu>

						<Button
							variant="outline"
							className="h-9 px-3 text-sm"
							onClick={handleExportCsv}
							disabled={sortedActivities.length === 0}
						>
							<Download className="size-4" />
							Export
						</Button>

						<Button className="h-9 px-3 text-sm" onClick={handleOpenCreateModal}>
							<Zap className="size-4" />
							New Shorten
						</Button>
					</div>
				</section>

				<section className="relative w-full">
					<Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						type="text"
						value={searchQuery}
						onChange={(event) => {
							setSearchQuery(event.target.value);
							setCurrentPage(1);
						}}
						placeholder="Search by identity or destination..."
						className="h-10 w-full bg-muted/80 pl-10 text-sm"
					/>
				</section>

				<section className="overflow-hidden rounded-xl border border-border/40 bg-card shadow-[0_20px_40px_rgb(26_28_28_/_4%)]">
					<div className="overflow-x-auto">
						<table className="w-full min-w-[860px] text-left">
							<thead className="border-b border-border/50 bg-muted/35">
								<tr className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
									<th className="px-6 py-4">Link Identity</th>
									<th className="px-6 py-4">Destination</th>
									<th className="px-6 py-4 text-center">Status</th>
									<th className="px-6 py-4 text-right">
										<div className="flex justify-end">
											<Button
												variant="ghost"
												size="xs"
												className="h-auto gap-1 p-0 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase"
												onClick={() => toggleSort("clicks")}
											>
												Analytics
												{renderSortIcon("clicks")}
											</Button>
										</div>
									</th>
									<th className="px-6 py-4 text-right">
										<div className="flex justify-end">
											<Button
												variant="ghost"
												size="xs"
												className="h-auto gap-1 p-0 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase"
												onClick={() => toggleSort("createdAt")}
											>
												Created
												{renderSortIcon("createdAt")}
											</Button>
										</div>
									</th>
									<th className="px-6 py-4 text-right">Actions</th>
								</tr>
							</thead>
							<tbody>
								{isLoadingMyUrls ? (
									<tr>
										<td
											colSpan={6}
											className="px-6 py-10 text-center text-sm text-muted-foreground"
										>
											Loading links...
										</td>
									</tr>
								) : paginatedActivities.length === 0 ? (
									<tr>
										<td
											colSpan={6}
											className="px-6 py-10 text-center text-sm text-muted-foreground"
										>
											No links found
										</td>
									</tr>
								) : (
									paginatedActivities.map((activity) => {
										const urlMeta = myUrlsById.get(activity.id);
										const isActive = urlMeta?.isActive ?? true;

										return (
											<tr
												key={activity.id}
												className="border-b border-border/35 transition-colors hover:bg-muted/30"
											>
												<td className="px-6 py-5">
													<div className="flex items-center gap-2">
														{activity.favicon ? (
															<img
																src={activity.favicon}
																alt="Favicon"
																className="size-4 rounded-sm object-contain"
															/>
														) : (
															<Link2 className="size-4 text-muted-foreground" />
														)}
														<a
															href={toShortUrl(activity.key)}
															target="_blank"
															rel="noopener noreferrer"
															className="text-sm font-semibold underline-offset-4 transition-colors hover:text-primary hover:underline"
														>
															{`l.arch${activity.slug}`}
														</a>
													</div>
												</td>
												<td className="max-w-[240px] px-6 py-5 text-xs text-muted-foreground">
													<Tooltip>
														<TooltipTrigger asChild>
															<div>
																<p className="truncate">{activity.destination}</p>
																{urlMeta?.expiresAt ? (
																	<p className="mt-1 text-[10px] text-muted-foreground/80">
																		Available until{" "}
																		{formatExpiryInBrowserTimezone(urlMeta.expiresAt)}
																	</p>
																) : null}
															</div>
														</TooltipTrigger>
														<TooltipContent
															side="top"
															sideOffset={6}
															className="max-w-none whitespace-normal break-all"
														>
															{activity.destination}
														</TooltipContent>
													</Tooltip>
												</td>
												<td className="px-6 py-5 text-center">
													<span
														className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
															isActive
																? "bg-primary/10 text-primary"
																: "bg-muted text-muted-foreground"
														}`}
													>
														{isActive ? "Active" : "Inactive"}
													</span>
												</td>
												<td className="px-6 py-5 text-right">
													<div className="flex flex-col items-end">
														<span className="text-sm font-semibold">
															{activity.clicks.toLocaleString()}
														</span>
														<span className="text-[10px] text-muted-foreground">Clicks</span>
													</div>
												</td>
												<td className="px-6 py-5 text-right text-xs text-muted-foreground">
													{formatCreatedAt(urlMeta?.createdAt)}
												</td>
												<td className="px-6 py-5">
													<div className="flex items-center justify-end gap-1">
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
												</td>
											</tr>
										);
									})
								)}
							</tbody>
						</table>
					</div>
					<div className="flex items-center justify-between border-t border-border/50 bg-muted/35 px-6 py-4 text-xs text-muted-foreground">
						<p>
							Showing <span className="font-medium text-foreground">{rangeStart}</span>-
							<span className="font-medium text-foreground">{rangeEnd}</span> of{" "}
							<span className="font-medium text-foreground">{filteredActivities.length}</span> links
						</p>
						<div className="flex items-center gap-3">
							<span className="hidden sm:inline">
								Page <span className="font-medium text-foreground">{currentPage}</span> of{" "}
								<span className="font-medium text-foreground">{totalPages}</span>
							</span>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
									disabled={currentPage <= 1 || filteredActivities.length === 0}
								>
									Previous
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))}
									disabled={currentPage >= totalPages || filteredActivities.length === 0}
								>
									Next
								</Button>
							</div>
						</div>
					</div>
				</section>

				<Dialog open={isCreateModalOpen} onOpenChange={handleCreateModalChange}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>New Shorten</DialogTitle>
							<DialogDescription>
								Create a new short URL without leaving My Links.
							</DialogDescription>
						</DialogHeader>

						{createdLink ? (
							<ShortUrlResult
								shortUrl={createdLink.shortUrl}
								copied={copied}
								onCopy={handleCopyShortUrl}
								actionsClassName="flex flex-wrap items-center gap-2"
								inputClassName="ghost-border h-10 bg-card text-xs"
							/>
						) : (
							<form
								onSubmit={(event) => {
									event.preventDefault();
									handleShortenLink();
								}}
								className="space-y-3"
							>
								<Input
									type="url"
									value={url}
									onChange={(event) => setUrl(event.target.value)}
									placeholder="https://very-long-architectural-resource-url.com/structure/sub-page"
									disabled={isShortening}
									className="ghost-border h-10 bg-card text-xs"
								/>
								<div className="ghost-border flex h-10 items-center gap-2 rounded-md bg-card px-3 focus-within:border-primary">
									<span className="text-[11px] font-semibold tracking-wide text-muted-foreground">
										l.arch/
									</span>
									<input
										type="text"
										value={customKey}
										onChange={(event) => {
											setCustomKey(event.target.value.toLowerCase());
											setIsCustomKeyEdited(true);
										}}
										placeholder="custom-key"
										disabled={isShortening}
										className="w-full border-none bg-transparent text-xs font-medium outline-none placeholder:text-muted-foreground"
									/>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={regenerateCustomKey}
										disabled={isShortening}
										className="h-7 px-2 text-[11px]"
									>
										<RefreshCw className="size-3" />
										New
									</Button>
								</div>
								{customKeyError ? (
									<p className="text-xs text-destructive">{customKeyError}</p>
								) : (
									<p className="text-xs text-muted-foreground">
										Edit if you want. Allowed: 3-32 chars, lowercase letters, numbers, and hyphens.
									</p>
								)}
								<Button
									type="submit"
									disabled={!isUrlValid || !!customKeyError || isShortening}
									className="w-full cursor-pointer"
								>
									{isShortening ? "Shortening..." : "Shorten Link"}
									{isShortening ? (
										<Loader2 className="size-4 animate-spin" />
									) : (
										<Zap className="size-4" />
									)}
								</Button>
							</form>
						)}
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
			</main>
		</DashboardShell>
	);
}

function toCsvCell(value: string) {
	const escaped = value.replaceAll('"', '""');
	return `"${escaped}"`;
}

function formatCreatedAt(value: string | undefined) {
	if (!value) {
		return "-";
	}

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return "-";
	}

	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "2-digit",
		year: "numeric",
	}).format(date);
}
