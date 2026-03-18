import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans } from "next/font/google";

import "./globals.css";
import { QueryProvider } from "@/components/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const notoSans = Noto_Sans({ variable: "--font-sans" });

const fontMono = Geist_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
});

export const metadata: Metadata = {
	title: "URL Shortener",
	description: "A fast, lightweight URL shortener. Shorten your links in seconds.",
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
			className={cn("antialiased", fontMono.variable, "font-sans", notoSans.variable)}
		>
			<body>
				<ThemeProvider>
					<QueryProvider>
						{children}
						<Toaster position="bottom-right" />
					</QueryProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
