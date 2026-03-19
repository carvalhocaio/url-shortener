import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Privacy Policy - Link Arch",
};

export default function PrivacyPage() {
	return (
		<div className="min-h-svh bg-background [background-image:none]">
			<div className="mx-auto max-w-3xl px-4 py-16">
				<div className="mb-4">
					<Link
						href="/sign-in"
						className="text-sm text-muted-foreground underline underline-offset-4 hover:text-primary"
					>
						&larr; Back
					</Link>
				</div>

				<article className="space-y-8">
					<header className="space-y-2">
						<h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
						<p className="text-sm text-muted-foreground">Last updated: March 18, 2026</p>
					</header>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">1. Information We Collect</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							When you use Link Arch (&quot;the Service&quot;), we may collect the following
							information:
						</p>
						<ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
							<li>
								<strong>Account information:</strong> Name, email address, and password when you
								create an account
							</li>
							<li>
								<strong>URL data:</strong> The original URLs you submit and the shortened URLs
								generated
							</li>
							<li>
								<strong>Usage data:</strong> Click counts, timestamps, and basic analytics related
								to your shortened URLs
							</li>
							<li>
								<strong>Technical data:</strong> IP address, browser type, and device information
								collected automatically through cookies and similar technologies
							</li>
						</ul>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							We use the information we collect to:
						</p>
						<ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
							<li>Provide, maintain, and improve the Service</li>
							<li>Create and manage your account</li>
							<li>Process and redirect shortened URLs</li>
							<li>Provide URL analytics and click tracking</li>
							<li>Detect and prevent abuse, spam, and malicious activity</li>
							<li>Communicate with you about the Service</li>
						</ul>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">3. Data Security</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							We implement appropriate technical and organizational measures to protect your
							personal information against unauthorized access, alteration, disclosure, or
							destruction. Your passwords are hashed and never stored in plain text. However, no
							method of transmission over the Internet is 100% secure, and we cannot guarantee
							absolute security.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">4. Cookies</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							We use essential cookies to maintain your session and authenticate your account. These
							cookies are strictly necessary for the Service to function and cannot be disabled. We
							do not use cookies for advertising or tracking purposes beyond what is necessary for
							the Service.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">5. Third-Party Services</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							The Service may contain links to third-party websites or services through shortened
							URLs. We are not responsible for the privacy practices or content of these third-party
							services. We encourage you to review the privacy policies of any third-party services
							you visit.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">6. Data Retention</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							We retain your personal information for as long as your account is active or as needed
							to provide you the Service. If you delete your account, we will delete your personal
							information within a reasonable timeframe, except where we are required to retain it
							by law.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">7. Your Rights</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							Depending on your location, you may have the following rights regarding your personal
							information:
						</p>
						<ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
							<li>Access and receive a copy of your personal data</li>
							<li>Correct inaccurate personal data</li>
							<li>Request deletion of your personal data</li>
							<li>Object to or restrict the processing of your personal data</li>
							<li>Data portability</li>
						</ul>
						<p className="text-sm leading-relaxed text-muted-foreground">
							To exercise any of these rights, please contact us through the information provided
							below.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">8. Changes to This Policy</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							We may update this Privacy Policy from time to time. We will notify you of any changes
							by posting the new Privacy Policy on this page and updating the &quot;Last
							updated&quot; date. Your continued use of the Service after any changes constitutes
							acceptance of the updated policy.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">9. Contact</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							If you have any questions about this Privacy Policy, please contact us through our{" "}
							<a
								href="https://github.com/carvalhocaio/link-arch"
								target="_blank"
								rel="noopener noreferrer"
								className="underline underline-offset-4 hover:text-primary"
							>
								GitHub repository
							</a>
							.
						</p>
					</section>
				</article>
			</div>
		</div>
	);
}
