import Link from "@/components/ui/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="glass-strong max-w-md rounded-2xl p-10 text-center">
        <p className="font-mono text-sm text-emerald-600">404</p>
        <h1 className="mt-2 text-2xl font-bold">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist or has moved.</p>
        <Button asChild className="mt-5" variant="gradient"><Link href="/">Go home</Link></Button>
      </div>
    </main>
  );
}
