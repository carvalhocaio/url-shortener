"use client";

import { ExternalLink, Loader2, MousePointerClick } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { usePeekUrl } from "@/hooks/use-peek-url";

interface PeekDialogProps {
	urlKey: string | null;
	onClose: () => void;
}

export function PeekDialog({ urlKey, onClose }: PeekDialogProps) {
	const { data, isLoading, isError, error } = usePeekUrl(urlKey);

	return (
		<Dialog open={!!urlKey} onOpenChange={(open) => !open && onClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>URL Details</DialogTitle>
					<DialogDescription>Preview information for this short URL.</DialogDescription>
				</DialogHeader>

				{isLoading && (
					<div className="flex items-center justify-center py-6">
						<Loader2 className="size-5 animate-spin text-muted-foreground" />
					</div>
				)}

				{isError && (
					<p className="py-4 text-center text-xs text-destructive">
						{error?.message ?? "Failed to load URL details"}
					</p>
				)}

				{data && (
					<div className="min-w-0 space-y-3">
						<div className="space-y-1">
							<span className="text-[0.6875rem] font-medium text-muted-foreground">Target URL</span>
							<div className="flex min-w-0 items-center gap-2">
								<p className="min-w-0 flex-1 truncate rounded-md bg-muted px-2 py-1 font-mono text-xs">
									{data.targetUrl}
								</p>
								<Button variant="outline" size="icon-sm" asChild>
									<a
										href={data.targetUrl}
										target="_blank"
										rel="noopener noreferrer"
										title="Open target URL"
									>
										<ExternalLink />
									</a>
								</Button>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1">
								<span className="text-[0.6875rem] font-medium text-muted-foreground">Clicks</span>
								<p className="flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 font-mono text-xs">
									<MousePointerClick className="size-3 text-primary" />
									{data.clicks.toLocaleString()}
								</p>
							</div>
							<div className="space-y-1">
								<span className="text-[0.6875rem] font-medium text-muted-foreground">Created</span>
								<p className="rounded-md bg-muted px-2 py-1 text-xs">
									{new Date(data.createdAt).toLocaleDateString("en-US", {
										year: "numeric",
										month: "short",
										day: "numeric",
									})}
								</p>
							</div>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
