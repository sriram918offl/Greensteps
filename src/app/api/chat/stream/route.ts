import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { streamText, RAG_CHAT_SYSTEM } from "@/lib/gemini";
import { similaritySearch, buildContext, buildCitations } from "@/lib/rag";
import { RATE_LIMITS, identifierFromRequest, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { localModerate } from "@/lib/moderation";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

const MAX_MESSAGE_LEN = 2000;

export async function POST(req: NextRequest) {
  // Public chat — no auth required. If signed in, we'll persist the conversation.
  const { userId } = await auth();

  // Rate limit
  const rl = await rateLimit(identifierFromRequest(req, userId), RATE_LIMITS.chat);
  if (!rl.success) {
    logger.warn("chat.rate_limited", { userId, remaining: rl.remaining });
    return rateLimitResponse(rl);
  }

  const { message, conversationId } = await req.json();
  if (!message || typeof message !== "string") {
    return new Response("Bad request", { status: 400 });
  }
  if (message.length > MAX_MESSAGE_LEN) {
    return new Response(JSON.stringify({ error: "Message too long" }), {
      status: 413,
      headers: { "Content-Type": "application/json" },
    });
  }
  const mod = localModerate(message);
  if (!mod.allow) {
    return new Response(JSON.stringify({ error: "Message blocked", reason: mod.reason }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Retrieve relevant chunks
  let citations: ReturnType<typeof buildCitations> = [];
  let context = "";
  try {
    const chunks = await similaritySearch(message, 5);
    citations = buildCitations(chunks);
    context = buildContext(chunks);
  } catch (e) {
    console.error("similarity search failed", e);
  }

  // Persist user message + create conversation if signed in
  let convo: { id: string } | null = null;
  if (userId) {
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (user) {
      convo = conversationId
        ? await prisma.aIConversation.findFirst({ where: { id: conversationId, userId: user.id } })
        : await prisma.aIConversation.create({
            data: { userId: user.id, title: message.slice(0, 60) },
          });
      if (convo) {
        await prisma.aIMessage.create({
          data: { conversationId: convo.id, role: "USER", content: message },
        });
      }
    }
  }

  const prompt = `CONTEXT (numbered passages — cite by [number] only if you actually use the fact):
${context}

USER QUESTION: ${message}

REMINDER: If the context doesn't directly cover the question, open with "I don't have a direct source on this in my knowledge base, but…" and answer from general principles. Never fabricate [n] citations.`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(JSON.stringify({ citations, conversationId: convo?.id ?? null }) + "\n"));
      let full = "";
      try {
        for await (const text of streamText(prompt, RAG_CHAT_SYSTEM)) {
          full += text;
          controller.enqueue(encoder.encode(text));
        }
      } catch (e) {
        console.error("Gemini stream error", e);
        const fallback =
          "I'm having trouble reaching my model right now. In the meantime — most personal carbon reductions come down to three things: how you move, how you power your home, and how you eat. Pick the one that's largest for you and shrink it 20%.";
        full = fallback;
        controller.enqueue(encoder.encode(fallback));
      }

      if (convo) {
        try {
          await prisma.aIMessage.create({
            data: {
              conversationId: convo.id,
              role: "ASSISTANT",
              content: full,
              citations: citations as unknown as Prisma.InputJsonValue,
            },
          });
        } catch (e) {
          console.error("persist assistant message failed", e);
        }
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      ...(convo ? { "X-Conversation-Id": convo.id } : {}),
    },
  });
}
