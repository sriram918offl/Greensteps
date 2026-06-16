"use client";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Bot, Loader2, Sparkles, User2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Citation = {
  index: number;
  title: string;
  source: string | null;
  snippet: string;
  score: number;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
};

const SUGGESTED = [
  "How can I reduce my flying footprint without quitting travel?",
  "Is an EV worth it if my grid is mostly coal?",
  "What's the most efficient home heating option?",
  "How do plant-based diets compare to local meat?",
];

export function ChatUI() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(prompt?: string) {
    const message = (prompt ?? input).trim();
    if (!message || loading) return;
    setInput("");
    setLoading(true);
    setMessages((m) => [...m, { role: "user", content: message }, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok || !res.body) throw new Error("Failed to send");

      // First line is JSON metadata with citations, then streamed text.
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let citations: Citation[] | undefined;
      let metadataParsed = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        if (!metadataParsed) {
          const nl = buffer.indexOf("\n");
          if (nl >= 0) {
            try {
              const meta = JSON.parse(buffer.slice(0, nl));
              citations = meta.citations;
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { ...copy[copy.length - 1], citations };
                return copy;
              });
            } catch {
              // metadata malformed — treat the whole buffer as content
            }
            buffer = buffer.slice(nl + 1);
            metadataParsed = true;
          } else {
            continue;
          }
        }
        setMessages((m) => {
          const copy = [...m];
          const last = copy[copy.length - 1];
          copy[copy.length - 1] = { ...last, content: last.content + buffer };
          return copy;
        });
        buffer = "";
      }
    } catch (e) {
      console.error(e);
      toast.error("Couldn't reach the chatbot.");
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = {
          role: "assistant",
          content: "Sorry — I couldn't connect right now. Please try again in a moment.",
        };
        return copy;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8">
        <div className="mx-auto max-w-3xl py-6">
          {messages.length === 0 ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30">
                  <Bot className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-2xl font-bold">Ask anything sustainability</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Backed by IPCC, IEA, EPA, FAO and more — with citations.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="group rounded-xl border border-border bg-card p-4 text-left text-sm transition-all hover:border-emerald-500/60 hover:bg-accent"
                  >
                    <Sparkles className="mb-2 h-4 w-4 text-emerald-500" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <AnimatePresence>
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                      m.role === "user" ? "bg-emerald-500/10 text-emerald-700" : "bg-gradient-to-br from-emerald-500 to-teal-500 text-white"
                    }`}>
                      {m.role === "user" ? <User2 className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-muted-foreground">
                        {m.role === "user" ? "You" : "GreenSteps Assistant"}
                      </p>
                      <div className="prose prose-sm prose-emerald mt-1 max-w-none dark:prose-invert">
                        {m.content || (loading && i === messages.length - 1 ? <Loader2 className="h-4 w-4 animate-spin" /> : null)}
                      </div>
                      {m.citations && m.citations.length > 0 && (
                        <div className="mt-3 space-y-1">
                          <p className="text-xs font-semibold text-muted-foreground">Sources</p>
                          <ul className="space-y-1">
                            {m.citations.map((c) => (
                              <li key={c.index} className="text-xs">
                                <Badge variant="secondary" className="mr-1">[{c.index}]</Badge>
                                <span className="font-medium">{c.title}</span>
                                {c.source && <span className="text-muted-foreground"> · {c.source}</span>}
                                <p className="ml-1 mt-0.5 text-muted-foreground">{c.snippet}</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-background/80 px-4 py-4 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <Card className="flex-1 p-0">
            <CardContent className="flex items-end gap-2 p-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Ask about anything sustainability..."
                rows={1}
                className="flex-1 resize-none bg-transparent px-3 py-2 text-sm focus:outline-none"
              />
              <Button variant="gradient" size="icon" onClick={() => send()} disabled={loading || !input.trim()}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
