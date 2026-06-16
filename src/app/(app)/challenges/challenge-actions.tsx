"use client";
import * as React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { joinChallenge, leaveChallenge } from "./actions";

export function ChallengeActions({ challengeId, joined }: { challengeId: string; joined: boolean }) {
  const [loading, setLoading] = React.useState(false);

  async function toggle() {
    setLoading(true);
    try {
      if (joined) {
        await leaveChallenge(challengeId);
        toast.success("Left challenge");
      } else {
        await joinChallenge(challengeId);
        toast.success("Joined challenge — good luck!");
      }
    } catch (e) {
      toast.error("Something went wrong");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant={joined ? "outline" : "gradient"} size="sm" onClick={toggle} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : joined ? "Leave" : "Join"}
    </Button>
  );
}
