# Architecture

GreenSteps is an AI carbon-footprint **awareness** platform: a public, no-signup
set of tools (calculator, comparison generator, civic dashboard, pledge wall, and
a RAG-grounded assistant) wrapped around an authenticated personal tracker.

This document explains how the codebase is laid out and the conventions to follow
when extending it. For setup and feature copy see [`README.md`](README.md).

---

## Stack

| Concern            | Choice                                                            |
| ------------------ | ----------------------------------------------------------------- |
| Framework          | Next.js 15 (App Router, React Server Components, Server Actions)   |
| Language           | TypeScript (`strict`, plus `noUnusedLocals`/`noUnusedParameters`) |
| Styling            | Tailwind CSS + shadcn/ui (Radix primitives)                       |
| Motion             | Framer Motion, GSAP ScrollTrigger, Lenis, next-view-transitions   |
| Data               | Prisma + PostgreSQL (Neon) with the `pgvector` extension          |
| AI                 | Google Gemini — `gemini-2.5-flash` (chat), `gemini-embedding-001` |
| Auth               | Clerk                                                              |
| Tests              | Vitest (unit) + Playwright (e2e), run in GitHub Actions CI        |

---

## Directory map

```
src/
  app/                      App Router tree
    page.tsx                Public landing (scroll narrative + showcases)
    discover/               Public, no-auth carbon calculator
    result/[slug]/          Shareable result page + /og dynamic image
    city/                   Civic dashboard
    pledge/                 Public pledge wall (+ server actions)
    chat/                   Public RAG assistant UI
    (app)/                  AUTH-GATED group — personal tracker
      dashboard, calculator, activities, goals, challenges,
      coach, simulator, chat, admin/
    api/                    Route handlers (see "Server boundaries" below)
    sign-in, sign-up/       Clerk pages
    privacy, terms, contact Legal pages
  components/
    landing/                Scroll narrative, story sections, showcases
    dashboard/              Sidebar + authed-app chrome
    fx/                     Motion/perf primitives (Lenis, low-power gating)
    admin/                  Secret admin keyboard entry
    site/                   Footer + shared legal page shell
    ui/                     shadcn-style primitives
  lib/                      Framework-free domain logic (see below)
prisma/                     schema.prisma + seed
```

The `(app)` route group is the **only** authenticated surface; its `layout.tsx`
calls `requireUser()`. Everything outside it is public by design — the awareness
tools must work with zero friction.

---

## The `lib/` layer

`src/lib/` holds framework-agnostic logic so it stays unit-testable in isolation
(every `*.test.ts` lives beside its module):

- `carbon.ts` / `public-carbon.ts` — footprint math for the authed tracker and the
  public calculator respectively.
- `factors.ts` — emission factors (grid intensity by region, per-capita baselines)
  and the comparison generator ("equal to N chicken burgers / trees / flights").
- `gemini.ts` — the single Gemini integration point: `streamText`, `generateText`,
  `embed` (768-dim, Matryoshka-truncated), and the `RAG_CHAT_SYSTEM` prompt.
- `rag.ts` — retrieval: `similaritySearch` (raw pgvector cosine SQL, 0.45 threshold
  + dedupe), `buildContext`, `buildCitations`, `indexDocument`.
- `moderation.ts` — `localModerate` + `moderatePledge` (allow / hold / block).
- `rate-limit.ts` — in-memory sliding-window limiter keyed per identifier.
- `auth.ts` — `requireUser`, `requireAdmin`, `isAdmin` (allowlist by Clerk ID **or**
  email via `ADMIN_USER_IDS` / `ADMIN_EMAILS`).
- `logger.ts` — structured JSON logger; the only place `console.*` is allowed
  server-side. Use it (`logger.error(msg, ctx, err)`) in routes and server actions.
- `prisma.ts` — the singleton client (dev-mode global to survive HMR).

---

## RAG pipeline

The assistant answers are grounded, not free-floating:

1. **Embed** the user message with `gemini-embedding-001`, truncated to 768 dims.
2. **Retrieve** the nearest document chunks via raw pgvector cosine SQL
   (`similaritySearch`), filtered at a 0.45 similarity threshold and de-duplicated
   by title + source.
3. **Build context** from the surviving chunks; when nothing clears the threshold
   the context is empty and the system prompt answers from general knowledge
   **without** hedging.
4. **Stream** the Gemini completion to the client over a `ReadableStream`, prefixed
   with a JSON line of citations. Empty completions fall back to a grounded answer.

Knowledge is curated through the admin panel (`(app)/admin/knowledge`), which calls
`indexDocument` to chunk + embed new sources.

---

## Server boundaries

Three kinds of server entry points, each with its own concerns:

- **Route handlers** (`app/api/*/route.ts`) — `runtime = "nodejs"`. Every expensive
  or AI-backed route (`chat/stream`, `ocr`, `simulate`) runs `rateLimit` first and
  `localModerate` on any user text before touching Gemini.
- **Server Actions** (`*/actions.ts`, `"use server"`) — mutations for pledges,
  knowledge docs, and admin review. Auth-sensitive ones call `requireAdmin`.
- **OG image** (`result/[slug]/og/route.tsx`) — `force-dynamic`; wrapped in
  try/catch so a CDN-font failure degrades to JSON rather than a 500.

---

## Conventions

- **Logging:** never `console.*` in server code — import `logger` from `@/lib/logger`
  and pass structured context. Client-component catch blocks may use `console.error`
  (they surface in the browser, not the server log stream).
- **Imports:** use the `@/` path alias, not deep relative chains.
- **Type safety:** `strict` is on with no-unused-locals/params; avoid `as unknown`
  except where Prisma's JSON columns genuinely require it.
- **Motion + perf:** gate heavy animation behind `useLowPower()` and respect
  `prefers-reduced-motion`; the scroll narrative collapses to a static hero when
  reduced motion is requested.
- **Tests:** domain logic in `lib/` ships with a co-located `*.test.ts`.

---

## Quality gates

```bash
npm run typecheck   # tsc --noEmit (strict + unused checks)
npm run lint        # next lint
npm test            # vitest run
npm run build       # prisma generate && next build
```

All four run in CI on every push.
