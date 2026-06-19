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
    logger.error("chat.similarity_search_failed", { messageLen: message.length }, e);
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

  // Prompt construction:
  //   • With context: instruct the model to use it where relevant, cite by [n].
  //   • Without context: just send the question — the system prompt handles
  //     the "answer from general knowledge, silently" path. This is the key
  //     fix that stops the model from prefacing every off-topic-for-RAG
  //     answer with "I don't have a direct source...".
  const prompt = context
    ? `Use the CONTEXT below where it's directly relevant. Cite a passage with [n] only when you actually use it.

CONTEXT
${context}

QUESTION
${message}`
    : `QUESTION
${message}`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(
        encoder.encode(JSON.stringify({ citations, conversationId: convo?.id ?? null }) + "\n"),
      );
      let full = "";
      try {
        for await (const text of streamText(prompt, RAG_CHAT_SYSTEM)) {
          full += text;
          controller.enqueue(encoder.encode(text));
        }
        // Gemini streams CAN complete without yielding any tokens (empty
        // completion, safety-filter trip, occasional API hiccup). Drop a
        // grounded fallback so there's always an answer underneath.
        if (full.trim().length === 0) {
          logger.warn("chat.empty_completion", { messageLen: message.length, citationCount: citations.length });
          const fallback =
            "The biggest lever for most people is whichever category drives the largest share of their monthly footprint — usually transport for frequent flyers and drivers, energy for AC-heavy households, and food for high-meat diets. Pick the biggest one and target a 20% cut this month. Ask me a more specific question (e.g. \"how much does an EV actually save in Mumbai\") and I'll give you concrete numbers.";
          full = fallback;
          controller.enqueue(encoder.encode(fallback));
        }
      } catch (e) {
        logger.error("chat.gemini_stream_error", { messageLen: message.length }, e);
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
          logger.error("chat.persist_message_failed", { conversationId: convo.id }, e);
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
