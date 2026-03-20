import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { QueryProvider } from "@/components/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const fontSans = Geist({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
});

export const metadata: Metadata = {
	title: "LinkArch",
	description: "Digital infrastructure URL management and short links.",
	icons: {
		icon: "/images/linkarch-icon.svg",
		shortcut: "/images/linkarch-icon.svg",
		apple: "/images/linkarch-icon.svg",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={cn("antialiased", fontMono.variable, "font-sans", fontSans.variable)}
		>
			<body>
				<ThemeProvider>
					<QueryProvider>
						<TooltipProvider>{children}</TooltipProvider>
						<Toaster position="bottom-right" />
					</QueryProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
