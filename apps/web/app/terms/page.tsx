import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Terms of Service - Link Arch",
};

export default function TermsPage() {
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
						<h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
						<p className="text-sm text-muted-foreground">Last updated: March 18, 2026</p>
					</header>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">1. Agreement to Terms</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							By accessing or using Link Arch (&quot;the Service&quot;), you agree to be bound by
							these Terms of Service. If you do not agree to these terms, please do not use the
							Service.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">2. Description of Service</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							Link Arch provides a URL shortening service that allows users to create shortened
							versions of long URLs. The Service may also provide analytics and management features
							for shortened URLs.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">3. User Accounts</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							To access certain features of the Service, you must create an account. You are
							responsible for maintaining the confidentiality of your account credentials and for
							all activities that occur under your account. You must provide accurate and complete
							information when creating your account and keep it up to date.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">4. Acceptable Use</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							You agree not to use the Service to:
						</p>
						<ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
							<li>Shorten URLs that link to malware, phishing, or other malicious content</li>
							<li>Distribute spam or unsolicited messages</li>
							<li>Violate any applicable laws or regulations</li>
							<li>Infringe on the intellectual property rights of others</li>
							<li>Engage in any activity that disrupts or interferes with the Service</li>
							<li>Attempt to gain unauthorized access to any part of the Service</li>
						</ul>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">5. Intellectual Property</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							The Service and its original content, features, and functionality are owned by Link
							Arch and are protected by copyright, trademark, and other intellectual property laws.
							You retain ownership of the URLs you shorten through the Service.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">6. Termination</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							We may terminate or suspend your account and access to the Service immediately,
							without prior notice, for any reason, including if you breach these Terms. Upon
							termination, your right to use the Service will cease immediately and your shortened
							URLs may be deactivated.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">7. Disclaimer of Warranties</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis
							without warranties of any kind, either express or implied, including but not limited
							to implied warranties of merchantability, fitness for a particular purpose, and
							non-infringement. We do not guarantee that the Service will be uninterrupted, secure,
							or error-free.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">8. Limitation of Liability</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							In no event shall Link Arch, its directors, employees, or agents be liable for any
							indirect, incidental, special, consequential, or punitive damages, including loss of
							profits, data, or other intangible losses, resulting from your use of or inability to
							use the Service.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">9. Changes to Terms</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							We reserve the right to modify these Terms at any time. We will notify users of
							significant changes by posting the updated Terms on the Service. Your continued use of
							the Service after any changes constitutes acceptance of the new Terms.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">10. Contact</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							If you have any questions about these Terms of Service, please contact us through our{" "}
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
