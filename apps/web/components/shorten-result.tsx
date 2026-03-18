"use client";

import { Check, ClipboardCopy, ExternalLink, Eye, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PeekDialog } from "@/components/peek-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ShortenResponse } from "@/lib/api";

interface ShortenResultProps {
	data: ShortenResponse;
}

function CopyButton({ value, label }: { value: string; label: string }) {
	const [copied, setCopied] = useState(false);

	async function handleCopy() {
		await navigator.clipboard.writeText(value);
		setCopied(true);
		toast.success(`${label} copied to clipboard`);
		setTimeout(() => setCopied(false), 2000);
	}

	return (
		<Button variant="outline" size="icon-sm" onClick={handleCopy} title={`Copy ${label}`}>
			{copied ? <Check /> : <ClipboardCopy />}
		</Button>
	);
}

export function ShortenResult({ data }: ShortenResultProps) {
	const [peekKey, setPeekKey] = useState<string | null>(null);

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle>URL Shortened</CardTitle>
					<CardDescription>
						Your short URL is ready. Save the secret key to manage it later.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="space-y-1">
						<span className="text-[0.6875rem] font-medium text-muted-foreground">Short URL</span>
						<div className="flex items-center gap-2">
							<code className="flex-1 truncate rounded-md bg-muted px-2 py-1 font-mono text-xs">
								{data.shortUrl}
							</code>
							<CopyButton value={data.shortUrl} label="Short URL" />
							<Button variant="outline" size="icon-sm" asChild>
								<a
									href={data.shortUrl}
									target="_blank"
									rel="noopener noreferrer"
									title="Open short URL"
								>
									<ExternalLink />
								</a>
							</Button>
						</div>
					</div>

					<div className="space-y-1">
						<span className="text-[0.6875rem] font-medium text-muted-foreground">Secret Key</span>
						<div className="flex items-center gap-2">
							<code className="flex-1 truncate rounded-md bg-muted px-2 py-1 font-mono text-xs">
								{data.secretKey}
							</code>
							<CopyButton value={data.secretKey} label="Secret Key" />
						</div>
						<p className="flex items-center gap-1 text-[0.625rem] text-destructive">
							<TriangleAlert className="size-3 shrink-0" />
							Save this key! It won&apos;t be shown again.
						</p>
					</div>

					<div className="space-y-1">
						<span className="text-[0.6875rem] font-medium text-muted-foreground">Target URL</span>
						<p className="truncate rounded-md bg-muted px-2 py-1 font-mono text-xs">
							{data.targetUrl}
						</p>
					</div>

					<div className="flex items-center justify-between pt-1">
						<span className="text-[0.625rem] text-muted-foreground">
							Created{" "}
							{new Date(data.createdAt).toLocaleDateString("en-US", {
								year: "numeric",
								month: "short",
								day: "numeric",
								hour: "2-digit",
								minute: "2-digit",
							})}
						</span>
						<Button variant="outline" size="sm" onClick={() => setPeekKey(data.key)}>
							<Eye data-icon="inline-start" />
							Peek
						</Button>
					</div>
				</CardContent>
			</Card>

			<PeekDialog urlKey={peekKey} onClose={() => setPeekKey(null)} />
		</>
	);
}
