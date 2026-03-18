"use client";

import { Link2 } from "lucide-react";
import { useState } from "react";

import { Header } from "@/components/header";
import { ShortenResult } from "@/components/shorten-result";
import { UrlShortenerForm } from "@/components/url-shortener-form";
import type { ShortenResponse } from "@/lib/api";

export default function Page() {
	const [results, setResults] = useState<ShortenResponse[]>([]);

	function handleSuccess(data: ShortenResponse) {
		setResults((prev) => [data, ...prev]);
	}

	return (
		<div className="flex min-h-svh flex-col">
			<Header />

			<main className="flex flex-1 flex-col items-center px-4 pt-16 pb-12">
				<div className="w-full max-w-lg space-y-8">
					<div className="space-y-2 text-center">
						<div className="flex items-center justify-center gap-2">
							<Link2 className="size-6 text-primary" />
							<h1 className="text-xl font-semibold tracking-tight">URL Shortener</h1>
						</div>
						<p className="text-xs text-muted-foreground">
							Paste your long URL and get a short, shareable link instantly.
						</p>
					</div>

					<UrlShortenerForm onSuccess={handleSuccess} />

					{results.length > 0 && (
						<div className="space-y-4">
							{results.map((result) => (
								<ShortenResult key={result.key} data={result} />
							))}
						</div>
					)}
				</div>
			</main>

			<footer className="border-t border-border px-4 py-3 text-center text-[0.625rem] text-muted-foreground">
				Built with{" "}
				<a
					href="https://github.com/carvalhocaio/url-shortener"
					target="_blank"
					rel="noopener noreferrer"
					className="underline underline-offset-2 hover:text-foreground"
				>
					url-shortener
				</a>
			</footer>
		</div>
	);
}
