import { Leaf } from "lucide-react";

export default function Loading() {
  return (
    <main className="grid min-h-screen place-items-center">
      <div className="flex items-center gap-2 text-emerald-600">
        <Leaf className="h-6 w-6 animate-pulse" />
        <span className="text-sm font-medium">Loading...</span>
      </div>
    </main>
  );
}
