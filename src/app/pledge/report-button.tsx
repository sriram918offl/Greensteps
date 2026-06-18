"use client";
import * as React from "react";
import { Flag, Check } from "lucide-react";
import { toast } from "sonner";
import { reportPledge } from "./actions";

/**
 * Tiny "report" affordance on each public pledge card. One click flags the
 * pledge; enough flags auto-hide it for admin re-review (logic in actions.ts).
 * Optimistic — disables after a single report per session per card.
 */
export function ReportButton({ pledgeId }: { pledgeId: string }) {
  const [reported, setReported] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  async function onReport() {
    if (reported || busy) return;
    setBusy(true);
    try {
      const res = await reportPledge(pledgeId);
      if (res.ok) {
        setReported(true);
        toast.success("Reported. Thanks for keeping the wall clean.");
      } else {
        toast.error("Couldn't report right now.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onReport}
      disabled={reported || busy}
      aria-label={reported ? "Reported" : "Report this pledge"}
      title={reported ? "Reported" : "Report this pledge"}
      className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] text-muted-foreground/60 transition-colors hover:text-rose-500 disabled:cursor-default disabled:text-emerald-500"
    >
      {reported ? <Check className="h-3 w-3" /> : <Flag className="h-3 w-3" />}
    </button>
  );
}
