import { ModeToggle } from "@/components/mode-toggle";
import { Link2 } from "lucide-react";

export function Header() {
	return (
		<header className="flex items-center justify-between border-b border-border px-4 py-3">
			<div className="flex items-center gap-2">
				<Link2 className="size-5 text-primary" />
				<span className="text-sm font-semibold">URL Shortener</span>
			</div>
			<ModeToggle />
		</header>
	);
}
