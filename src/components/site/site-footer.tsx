import Link from "@/components/ui/link";
import { Github, Leaf } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="relative border-t border-white/10 bg-transparent backdrop-blur-md">
      <div className="container mx-auto py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                <Leaf className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-gradient">GreenSteps</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Track your carbon footprint and build a greener future with AI-powered guidance.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Product</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/calculator" className="hover:text-foreground">Calculator</Link></li>
              <li><Link href="/coach" className="hover:text-foreground">AI Coach</Link></li>
              <li><Link href="/challenges" className="hover:text-foreground">Challenges</Link></li>
              <li><Link href="/chat" className="hover:text-foreground">Chatbot</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Resources</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-foreground">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground">Terms</Link></li>
              <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
              <li>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-foreground">
                  <Github className="h-3.5 w-3.5" /> GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} GreenSteps. Built for a better planet.</p>
          <p>Made with Next.js 15, Prisma, pgvector & Gemini.</p>
        </div>
      </div>
    </footer>
  );
}
