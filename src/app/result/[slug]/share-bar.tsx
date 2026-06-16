"use client";
import * as React from "react";
import { Copy, Check, Share2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { incrementShareCount } from "@/app/discover/actions";

export function ShareBar({ slug, name, kg }: { slug: string; name: string; kg: number }) {
  const [copied, setCopied] = React.useState(false);

  const url = typeof window !== "undefined"
    ? `${window.location.origin}/result/${slug}`
    : `/result/${slug}`;
  const text = `${name}'s monthly carbon footprint: ${Math.round(kg)} kg CO₂. Discover yours in 60 seconds (no signup) 🌍`;

  async function track() {
    try { await incrementShareCount(slug); } catch {}
  }

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied");
    track();
    setTimeout(() => setCopied(false), 2000);
  }

  function whatsapp() {
    const u = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
    window.open(u, "_blank");
    track();
  }

  function twitter() {
    const u = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(u, "_blank");
    track();
  }

  async function native() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "GreenSteps", text, url });
        track();
      } catch {}
    } else {
      copy();
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      <Button onClick={whatsapp} variant="outline" size="sm" className="rounded-full">
        <MessageCircle className="h-3.5 w-3.5 text-emerald-600" /> WhatsApp
      </Button>
      <Button onClick={twitter} variant="outline" size="sm" className="rounded-full">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25h6.83l4.713 6.231zm-1.16 17.52h1.833L7.084 4.126H5.117z"/></svg>
        Twitter
      </Button>
      <Button onClick={copy} variant="outline" size="sm" className="rounded-full">
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />} Copy link
      </Button>
      <Button onClick={native} variant="gradient" size="sm" className="rounded-full">
        <Share2 className="h-3.5 w-3.5" /> Share
      </Button>
    </div>
  );
}
