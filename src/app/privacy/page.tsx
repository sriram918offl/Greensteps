import { LegalPage } from "@/components/site/legal-page";

export const metadata = {
  title: "Privacy Policy",
  description: "How GreenSteps collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="June 2026">
      <p>
        GreenSteps is a carbon-footprint awareness platform. We believe privacy
        and sustainability go together — we collect as little as possible and are
        transparent about what we do with it.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Public calculator inputs</strong> — when you use the
          60-second calculator, your lifestyle answers (transport, energy, diet,
          shopping) are stored to generate your shareable result. No name or
          email is required.
        </li>
        <li>
          <strong>Account data (optional)</strong> — if you sign up, we store
          your email and display name via our authentication provider (Clerk) so
          you can save activities, goals, and challenge progress.
        </li>
        <li>
          <strong>Pledges</strong> — text you submit to the public Pledge Wall,
          along with the name and city you choose to display.
        </li>
        <li>
          <strong>Chat messages</strong> — questions you ask the AI assistant.
          For signed-in users these are saved to your conversation history.
        </li>
      </ul>

      <h2>What we don&apos;t do</h2>
      <ul>
        <li>We don&apos;t sell your data.</li>
        <li>We don&apos;t run third-party advertising trackers.</li>
        <li>We don&apos;t share personal data except with the processors below.</li>
      </ul>

      <h2>Processors we rely on</h2>
      <ul>
        <li><strong>Clerk</strong> — authentication.</li>
        <li><strong>Neon (PostgreSQL)</strong> — database hosting.</li>
        <li><strong>Google Gemini</strong> — AI responses and embeddings.</li>
        <li><strong>Vercel</strong> — application hosting.</li>
      </ul>

      <h2>Your choices</h2>
      <p>
        You can use the public awareness tools (calculator, city atlas, pledge
        wall, chatbot) without an account. If you have an account and want your
        data deleted, contact us at the address on the <a href="/contact">Contact</a> page.
      </p>

      <h2>Cookies</h2>
      <p>
        We use only essential cookies required for authentication and to remember
        your theme preference. No marketing or analytics cookies are set without
        consent.
      </p>

      <p className="text-sm text-muted-foreground">
        This is an open-source awareness project. This policy describes the
        practices of the reference deployment and may be adapted by anyone who
        self-hosts the code.
      </p>
    </LegalPage>
  );
}
