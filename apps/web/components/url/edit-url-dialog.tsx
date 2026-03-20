"use client";

import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { Calendar as CalendarIcon } from "lucide-react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface EditUrlDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	url: string;
	onUrlChange: (value: string) => void;
	urlKey: string;
	onUrlKeyChange: (value: string) => void;
	urlKeyError: string | null;
	isActive: boolean;
	onIsActiveChange: (value: boolean) => void;
	expiresOn: string;
	onExpiresOnChange: (value: string) => void;
	onSave: () => void;
	isPending: boolean;
}

export function EditUrlDialog({
	open,
	onOpenChange,
	url,
	onUrlChange,
	urlKey,
	onUrlKeyChange,
	urlKeyError,
	isActive,
	onIsActiveChange,
	expiresOn,
	onExpiresOnChange,
	onSave,
	isPending,
}: EditUrlDialogProps) {
	const selectedExpiryDate = parseDateInput(expiresOn);
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const disabledDays = isPending ? true : [{ before: today }];
	const presets = [
		{ label: "Today", offsetDays: 0 },
		{ label: "Tomorrow", offsetDays: 1 },
		{ label: "In a week", offsetDays: 7 },
		{ label: "In 2 weeks", offsetDays: 14 },
	] as const;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit short link</DialogTitle>
					<DialogDescription>Update destination, key, status, and expiry.</DialogDescription>
				</DialogHeader>
				<div className="space-y-3">
					<Input
						type="url"
						value={url}
						onChange={(event) => onUrlChange(event.target.value)}
						placeholder="https://example.com/path"
						disabled={isPending}
						className="ghost-border h-10 bg-card text-xs"
					/>
					<div className="space-y-1">
						<div className="ghost-border flex h-10 items-center rounded-md bg-card px-3 focus-within:border-primary">
							<span className="pr-2 text-xs font-semibold tracking-wide text-muted-foreground">
								l.arch/
							</span>
							<input
								type="text"
								value={urlKey}
								onChange={(event) => onUrlKeyChange(event.target.value)}
								placeholder="custom-key"
								disabled={isPending}
								className="w-full border-none bg-transparent text-xs font-medium outline-none placeholder:text-muted-foreground"
							/>
						</div>
						{urlKeyError ? (
							<p className="text-xs text-destructive">{urlKeyError}</p>
						) : (
							<p className="text-xs text-muted-foreground">
								Allowed: 3-32 chars, lowercase letters, numbers, and hyphens.
							</p>
						)}
					</div>
					<div className="flex items-center justify-between rounded-md border border-border/50 px-3 py-2">
						<div>
							<p className="text-sm font-medium">Link active</p>
							<p className="text-xs text-muted-foreground">
								Disable to stop redirects for this link.
							</p>
						</div>
						<Switch checked={isActive} onCheckedChange={onIsActiveChange} disabled={isPending} />
					</div>
					<div className="space-y-2 rounded-md border border-border/50 px-3 py-2">
						<div>
							<p className="text-sm font-medium">Scheduled expiry</p>
							<p className="text-xs text-muted-foreground">
								Optional. Link will be disabled at 23:59:59 UTC on this date.
							</p>
						</div>
						<Popover>
							<div className="relative">
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										disabled={isPending}
										className={cn(
											"ghost-border h-10 w-full justify-start bg-card pr-9 text-left text-xs font-normal",
											!selectedExpiryDate && "text-muted-foreground",
										)}
									>
										<CalendarIcon className="size-4" />
										{selectedExpiryDate ? (
											format(selectedExpiryDate, "PPP")
										) : (
											<span>Select expiry date</span>
										)}
									</Button>
								</PopoverTrigger>
								{selectedExpiryDate ? (
									<button
										type="button"
										className="absolute inset-y-0 right-2 z-10 inline-flex items-center text-muted-foreground transition-colors hover:text-foreground"
										onClick={(event) => {
											event.preventDefault();
											event.stopPropagation();
											onExpiresOnChange("");
										}}
										disabled={isPending}
										aria-label="Clear expiry date"
									>
										<X className="size-4" />
									</button>
								) : null}
							</div>
							<PopoverContent
								className="w-auto gap-0 border border-border bg-background p-0"
								align="start"
							>
								<Calendar
									mode="single"
									selected={selectedExpiryDate}
									onSelect={(date) => onExpiresOnChange(toDateInputValue(date))}
									disabled={disabledDays}
									className="rounded-md border"
								/>
								<div className="w-full border-t border-border/50 p-2">
									<div className="grid grid-cols-2 gap-2">
										{presets.map((preset) => (
											<Button
												key={preset.label}
												variant="outline"
												size="sm"
												className="h-8 w-full"
												onClick={() =>
													onExpiresOnChange(toDateInputValue(getPresetDate(preset.offsetDays)))
												}
												disabled={isPending}
											>
												{preset.label}
											</Button>
										))}
									</div>
								</div>
							</PopoverContent>
						</Popover>
					</div>
					<Button onClick={onSave} disabled={isPending} className="w-full cursor-pointer">
						{isPending ? "Saving..." : "Save changes"}
						{isPending ? <Loader2 className="size-4 animate-spin" /> : null}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function parseDateInput(value: string) {
	if (!value) {
		return undefined;
	}

	const [year, month, day] = value.split("-").map(Number);
	if (!year || !month || !day) {
		return undefined;
	}

	return new Date(year, month - 1, day);
}

function toDateInputValue(value: Date | undefined) {
	if (!value) {
		return "";
	}

	const year = value.getFullYear();
	const month = String(value.getMonth() + 1).padStart(2, "0");
	const day = String(value.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

function getPresetDate(offsetDays: number) {
	const date = new Date();
	date.setHours(0, 0, 0, 0);
	date.setDate(date.getDate() + offsetDays);

	return date;
}
