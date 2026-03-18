"use client";

import { Loader2, Scissors } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useShortenUrl } from "@/hooks/use-shorten-url";
import type { ShortenResponse } from "@/lib/api";

interface UrlShortenerFormProps {
	onSuccess: (data: ShortenResponse) => void;
}

export function UrlShortenerForm({ onSuccess }: UrlShortenerFormProps) {
	const [url, setUrl] = useState("");
	const { mutate, isPending } = useShortenUrl();

	function handleSubmit(e: FormEvent) {
		e.preventDefault();

		if (!url.trim()) {
			toast.error("Please enter a URL");
			return;
		}

		mutate(url.trim(), {
			onSuccess: (data) => {
				onSuccess(data);
				setUrl("");
				toast.success("URL shortened successfully!");
			},
			onError: (error) => {
				toast.error(error.message);
			},
		});
	}

	return (
		<form onSubmit={handleSubmit} className="flex gap-2">
			<Input
				type="url"
				placeholder="https://example.com/very-long-url..."
				value={url}
				onChange={(e) => setUrl(e.target.value)}
				disabled={isPending}
				required
				className="h-8 flex-1"
			/>
			<Button type="submit" disabled={isPending} size="lg">
				{isPending ? <Loader2 className="animate-spin" /> : <Scissors data-icon="inline-start" />}
				{isPending ? "Shortening..." : "Shorten"}
			</Button>
		</form>
	);
}
