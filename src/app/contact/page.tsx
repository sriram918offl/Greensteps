import { Github, Mail, MessageCircle, MapPin } from "lucide-react";
import Link from "@/components/ui/link";
import { LegalPage } from "@/components/site/legal-page";

export const metadata = {
  title: "Contact",
  description: "Get in touch with the GreenSteps team.",
};

const REPO_URL = "https://github.com/sriram918offl/Greensteps";

export default function ContactPage() {
  return (
    <LegalPage title="Contact">
      <p className="lead">
        Questions, feedback, a bug, or a partnership idea? We&apos;d love to hear
        from you — GreenSteps is built in the open.
      </p>

      <div className="not-prose mt-8 grid gap-4 sm:grid-cols-2">
        <a
          href="mailto:sriram0071809@gmail.com"
          className="group flex items-start gap-3 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-emerald-500/50"
        >
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">Email</p>
            <p className="text-sm text-muted-foreground">sriram0071809@gmail.com</p>
          </div>
        </a>

        <a
          href={`${REPO_URL}/issues`}
          target="_blank"
          rel="noreferrer"
          className="group flex items-start gap-3 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-emerald-500/50"
        >
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
            <Github className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">Report an issue</p>
            <p className="text-sm text-muted-foreground">Open a GitHub issue</p>
          </div>
        </a>

        <Link
          href="/chat"
          className="group flex items-start gap-3 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-emerald-500/50"
        >
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">Ask the AI</p>
            <p className="text-sm text-muted-foreground">Climate &amp; carbon questions, instantly</p>
          </div>
        </Link>

        <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">Built in</p>
            <p className="text-sm text-muted-foreground">India 🇮🇳 — for the planet 🌍</p>
          </div>
        </div>
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        GreenSteps is open source. Stars, forks, and pull requests are very
        welcome at{" "}
        <a href={REPO_URL} target="_blank" rel="noreferrer">
          github.com/sriram918offl/Greensteps
        </a>
        .
      </p>
    </LegalPage>
  );
}
