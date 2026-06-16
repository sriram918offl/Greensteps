"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="glass-strong max-w-md rounded-2xl p-8 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-rose-500" />
        <h1 className="mt-3 text-xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">An unexpected error occurred. Our team has been notified.</p>
        <Button className="mt-5" variant="gradient" onClick={reset}>Try again</Button>
      </div>
    </main>
  );
}
