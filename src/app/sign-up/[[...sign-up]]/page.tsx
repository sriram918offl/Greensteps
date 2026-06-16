import { SignUp } from "@clerk/nextjs";
import { Leaf } from "lucide-react";
import Link from "@/components/ui/link";

export default function SignUpPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background hero-gradient">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 py-12">
        <Link href="/" className="mb-8 inline-flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-gradient">GreenSteps</span>
        </Link>
        <SignUp appearance={{ elements: { rootBox: "mx-auto", card: "shadow-2xl border border-border" } }} />
      </div>
    </main>
  );
}
