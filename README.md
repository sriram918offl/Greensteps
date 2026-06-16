# 🌿 GreenSteps — The Carbon Footprint *Awareness* Platform

> CO₂ is invisible. We make it obvious.

**Built for the Google Carbon Footprint Awareness Challenge.**

Most carbon-tracking apps are private SaaS dashboards aimed at people who already care. They optimize for the *committed*.
GreenSteps optimizes for the *uninformed* — turning a stranger into someone who knows, shares, and pledges in under 90 seconds.

---

## 🎯 The thesis

| The wrong question | The right question |
| --- | --- |
| *How do I track my footprint?* | *How do I make people who've never thought about CO₂ suddenly care?* |
| *Build a tool for committed users* | *Build a moment that converts the uncommitted* |
| *Private dashboards & goals* | *Public results, public commitments, viral spread* |
| *Generic global averages* | *Localized — your city, your grid, your reality* |

**Awareness scales when results are sharable, contagious, and personalized.** Every feature serves that thesis.

---

## ✨ What's different

### 🟢 Everything important is public
- `/` — awareness-first landing
- `/discover` — calculator (no signup)
- `/result/[slug]` — shareable result with OG-image preview
- `/city/[slug]` — civic atlas with real grid data
- `/pledge` — public commitment wall
- `/chat` — RAG assistant (no signup to ask)

### 🟢 The "aha moment" is the hero feature
Numbers don't move people. **Comparisons do.** Every result page converts your monthly CO₂ into:
- 🍔 Beef burgers
- ✈️ MUM→DEL flights
- 🌳 Trees needed to offset
- 👖 Pairs of new jeans
- 🛋 Hours of Netflix
- 📱 Smartphone charges
- 🚿 10-minute hot showers
- 🚗 Kilometers driven

→ This is what people screenshot. This is what spreads.

### 🟢 Localized to India (and others)
| Country | Grid factor (kg CO₂/kWh) | Per-capita (t/yr) |
| --- | --- | --- |
| 🇮🇳 India  | **0.82** | 1.9 |
| 🇺🇸 USA    | 0.387    | 14.4 |
| 🇪🇺 EU     | 0.231    | 6.2 |
| 🇬🇧 UK     | 0.207    | 4.7 |
| 🇨🇳 China  | 0.581    | 7.8 |

Real numbers from CEA (India), EPA eGRID, EEA, IEA. **Indian grid is 2× more carbon-intensive than EU — most generic calculators get this wrong.**

### 🟢 Civic Atlas — your city has a fingerprint
Each city page shows:
- Local grid factor + renewable share
- Per-capita comparison vs. national average
- Sector breakdown (transport / energy / industry / agriculture)
- **Highest-leverage local action** ("Use Delhi Metro + replace old diesel")
- Real-time pledges from residents
- Progress toward Paris-aligned 2.0 t/yr target

Seeded with Mumbai, Delhi, Bengaluru, Chennai, Hyderabad. Easily extensible.

### 🟢 Shareable result cards with OG images
Every `/result/[slug]` page generates a **server-rendered OG image** at `/result/[slug]/og` → previews beautifully in WhatsApp, X, LinkedIn, Slack.

Share buttons: WhatsApp, Twitter/X, native Web Share, copy link. Each click increments a share counter.

### 🟢 Public Pledge Wall — social proof drives action
Research: public commitments are **65% more likely to stick** than private goals (Cialdini, *Influence*, 1984).

The wall shows real pledges with names, cities, categories, and estimated kg saved. Total community impact is summed live.

### 🟢 RAG chatbot, free to use
Public Gemini-powered chat with pgvector similarity search over IPCC / IEA / EPA / FAO documents. Inline citations [1], [2]. Streaming responses. No signup.

---

## 🏗️ Architecture

### Stack

| Layer | Tech |
| --- | --- |
| Frontend | Next.js 15 (App Router, RSC), TypeScript, Tailwind, shadcn/ui, Framer Motion, Recharts |
| Backend | Next.js Server Actions, Edge-compatible API Routes |
| Database | PostgreSQL (Neon) + **pgvector** extension |
| ORM | Prisma 5 |
| AI | Gemini 1.5 Flash (chat, OG-image, scenarios), `text-embedding-004` (768-dim) |
| Auth | Clerk (optional — public layer needs no auth) |
| Deploy | Vercel + Neon |

### Two layers of the product

```
                 PUBLIC AWARENESS LAYER  (no auth)
   ┌─────────────────────────────────────────────────────────┐
   │  /                — Awareness-first landing             │
   │  /discover        — 5-step localized public calculator  │
   │  /result/[slug]   — Shareable result + OG image         │
   │  /city            — Civic atlas index                   │
   │  /city/[slug]     — City carbon profile                 │
   │  /pledge          — Public pledge wall                  │
   │  /chat            — RAG assistant                       │
   └─────────────────────────────────────────────────────────┘
                                ↓
                        (optional sign-up)
                                ↓
                  POWER-USER LAYER  (Clerk auth)
   ┌─────────────────────────────────────────────────────────┐
   │  /dashboard, /activities, /goals, /challenges,          │
   │  /coach, /simulator, /admin                             │
   └─────────────────────────────────────────────────────────┘
```

The awareness layer reaches anyone. The power-user layer retains the converted.

### RAG pipeline

```
User question (any visitor)
      │
      ▼
[Gemini text-embedding-004] ──► 768-dim vector
      │
      ▼
pgvector cosine similarity   ("Embedding"."embedding" <=> query)
      │
      ▼
Top 5 chunks (joined with Document for title/source)
      │
      ▼
Gemini 1.5 Flash (streamed) with citations
      │
      ▼
Response streams back; first line is JSON {citations} for inline source UI
```

### Database

15 Prisma models. Notable awareness-layer additions on top of the SaaS schema:

- **`PublicCalculation`** — anonymous result with shareable slug, view + share counters
- **`Pledge`** — public commitment with name + city + category + estimated kg
- **`City`** — grid factors, sector shares, local action, civic context
- **`Embedding`** — `vector(768)` column for pgvector RAG

---

## 🚀 Quick start

### 1. Install
```bash
npm install
cp .env.example .env
```

### 2. Configure `.env`
Fill in your Neon `DATABASE_URL` + `DIRECT_URL`, Clerk keys, Gemini API key.

### 3. Enable pgvector on Neon
In Neon's SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 4. Push schema + seed
```bash
npm run db:push
npm run db:seed   # seeds 4 badges + 3 challenges + 3 RAG docs + 5 cities + 5 pledges
```

### 5. Run
```bash
npm run dev
```

→ http://localhost:3000

---

## 🧭 Routes map

### Public (awareness layer)
| Route | Purpose |
| --- | --- |
| `/` | Landing — awareness thesis |
| `/discover` | 5-step localized calculator |
| `/result/[slug]` | Shareable result + comparisons + OG image |
| `/result/[slug]/og` | Server-generated 1200×630 OG image |
| `/city` | Civic atlas index |
| `/city/[slug]` | City carbon profile |
| `/pledge` | Public pledge wall |
| `/chat` | RAG sustainability assistant |
| `/sign-in`, `/sign-up` | Optional Clerk auth |

### Protected (power-user layer)
| Route | Purpose |
| --- | --- |
| `/dashboard` | KPI + charts + AI insight |
| `/calculator` | Detailed gated calculator |
| `/activities` | Daily logging + bill OCR + CSV |
| `/goals` | Personal goal CRUD |
| `/challenges` | Community challenges |
| `/coach` | Heuristic + Gemini insights |
| `/simulator` | Scenario sandbox |
| `/admin/*` | Users / challenges / knowledge base |

---

## 🎬 60-second judge demo flow

1. Open `/` — read the headline ("CO₂ is invisible. We make it obvious.")
2. Click **Discover** — fill the 5-step wizard with sample lifestyle (India, petrol car 400km, mixed diet, etc.)
3. Land on `/result/[slug]` — see big number, grade, "X% above India average", breakdown chart, share buttons
4. **Scroll to the "Aha moments" grid** — burgers, jeans, Netflix, trees — this is the screenshot moment
5. Click **WhatsApp share** — see the OG image preview
6. Open the WhatsApp link → preview renders with grade + monthly kg
7. Click **"Make a pledge"** → land on `/pledge`, add a commitment
8. Click any city on landing → `/city/mumbai` → real grid factor + sector breakdown + local action
9. Visit `/chat`, ask "Why is Delhi's air worse in November?" → streaming RAG answer with citations

---

## 🔧 Scripts

```bash
npm run dev          # next dev
npm run build        # prisma generate + next build
npm run start        # next start
npm run typecheck    # tsc --noEmit
npm run db:push      # push Prisma schema
npm run db:seed      # tsx prisma/seed.ts
npm run db:studio    # open Prisma Studio
```

---

## 📊 What awareness looks like in metrics

| Standard tracker submission | GreenSteps |
| --- | --- |
| Calculator behind sign-up | Public, no signup |
| Generic global factors | Real IN/US/EU grid factors |
| Personal dashboard | Personal **+ civic** dashboard |
| Generic chatbot | RAG with citations |
| Badges and points | Public pledges with social proof |
| Private goal tracking | Shareable result cards + WhatsApp share |
| Built for the demo | Built so a non-techie friend would forward the link |

---

## 📜 Data sources

- **Grid factors** — CEA CO₂ Baseline Database (India), EPA eGRID (US), EEA (EU), IEA (global)
- **Per-capita emissions** — Global Carbon Project / Our World in Data 2023
- **Vehicle factors** — DEFRA 2023 + ICCT India
- **Diet** — Poore & Nemecek (2018), *Science*
- **Comparisons** — IPCC AR6, Levi's LCA (jeans), various peer-reviewed sources

---

## 📄 License

MIT — built to spread.

> "Numbers don't move people. Comparisons do." — GreenSteps thesis
