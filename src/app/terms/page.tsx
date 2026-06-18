import { LegalPage } from "@/components/site/legal-page";

export const metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of GreenSteps.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="June 2026">
      <p>
        By using GreenSteps you agree to these terms. They&apos;re intentionally
        short and plain.
      </p>

      <h2>The service</h2>
      <p>
        GreenSteps provides estimates of personal carbon emissions, AI-generated
        guidance, and community features (pledges, challenges). Estimates are
        based on published emission factors from sources like the IPCC, IEA, EPA,
        and India&apos;s CEA. They are approximations for awareness and education —
        not certified carbon accounting.
      </p>

      <h2>Acceptable use</h2>
      <ul>
        <li>Don&apos;t submit hateful, harassing, or unlawful content to the pledge wall or chatbot.</li>
        <li>Don&apos;t attempt to overload, scrape, or disrupt the service.</li>
        <li>Don&apos;t misrepresent the AI&apos;s output as professional advice.</li>
      </ul>

      <h2>AI-generated content</h2>
      <p>
        The AI assistant can make mistakes. Always verify important decisions
        (e.g. major purchases, financial choices) with primary sources. We cite
        our knowledge base where relevant, but we don&apos;t guarantee accuracy.
      </p>

      <h2>Accounts</h2>
      <p>
        You&apos;re responsible for activity under your account. We may suspend
        accounts that violate these terms.
      </p>

      <h2>No warranty</h2>
      <p>
        The service is provided &ldquo;as is&rdquo; without warranties of any kind.
        We&apos;re not liable for decisions made based on the estimates or guidance
        provided.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms. Continued use after an update means you accept
        the revised terms.
      </p>

      <p className="text-sm text-muted-foreground">
        GreenSteps is an open-source project built for the Google Carbon Footprint
        Awareness Challenge. Self-hosted deployments may set their own terms.
      </p>
    </LegalPage>
  );
}
