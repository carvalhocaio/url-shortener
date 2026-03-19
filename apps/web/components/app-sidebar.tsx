"use client";

import { LayoutDashboard, Link2, LinkIcon, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NavUser } from "@/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/use-session";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
	const { data: session, isLoading } = useSession();
	const pathname = usePathname();

	const items: Array<{
		label: string;
		href: string;
		icon: React.ComponentType<{ className?: string }>;
	}> = [
		{
			label: "Dashboard",
			href: "/",
			icon: LayoutDashboard,
		},
		{
			label: "My Links",
			href: "/my-links",
			icon: LinkIcon,
		},
	] as const;

	return (
		<Sidebar variant="inset" collapsible="icon" className="surface-section" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link href="/">
								<div className="flex aspect-square size-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-[0_8px_22px_rgb(39_108_0_/_18%)]">
									<Link2 className="size-4" />
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">LinkArch</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map((item) => (
								<SidebarMenuItem key={item.label}>
									<SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
										<Link href={item.href}>
											<item.icon />
											<span>{item.label}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup className="mt-auto">
					<SidebarGroupContent>
						<div className="surface-floating ghost-border rounded-md p-3 group-data-[collapsible=icon]:hidden">
							<div className="mb-1 flex items-center gap-2 text-xs font-medium">
								<Sparkles className="size-3.5 text-primary" />
								Bulk Management
							</div>
							<p className="text-[11px] leading-relaxed text-muted-foreground">
								Update destination URLs and tags in one action.
							</p>
						</div>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				{isLoading ? (
					<div className="flex items-center gap-2 p-2">
						<Skeleton className="h-8 w-8 rounded-lg" />
						<div className="flex-1 group-data-[collapsible=icon]:hidden">
							<Skeleton className="mb-1 h-3.5 w-24" />
							<Skeleton className="h-3 w-32" />
						</div>
					</div>
				) : session ? (
					<NavUser
						user={{
							name: session.user.name,
							email: session.user.email,
						}}
					/>
				) : null}
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
}
