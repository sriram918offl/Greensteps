import { SiteHeader } from "@/components/site/site-header";
import { ChatUI } from "./chat-ui";

export const metadata = {
  title: "Ask anything about climate — GreenSteps AI",
  description: "Free RAG-powered sustainability assistant. Ask any climate or carbon question — get cited answers from IPCC, IEA, EPA.",
};

export default function ChatPage() {
  return (
    <main className="flex h-screen flex-col">
      <SiteHeader />
      <div className="flex-1 pt-16">
        <ChatUI />
      </div>
    </main>
  );
}
