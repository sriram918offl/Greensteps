import Link from "@/components/ui/link";
import { ArrowRight, Sparkles, Heart, Globe, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { IntroSplash } from "@/components/landing/intro-splash";
import {
  QuoteScrollSection,
  HeroScene,
  ScrollOverlay,
} from "@/components/landing/scroll-frame-sequence";
import { AmbientBackdrop } from "@/components/landing/ambient-backdrop";
import { ScrollIndicator } from "@/components/landing/scroll-indicator";
import { StorySection } from "@/components/landing/story-section";
import {
  VisualResponsibility,
  VisualSmallActions,
  VisualImpactBars,
  VisualAwareness,
  VisualFuture,
} from "@/components/landing/story-visuals";
import { TransformationSection } from "@/components/landing/transformation-section";
import { TestimonialsCarousel } from "@/components/landing/testimonials-carousel";
import { Reveal } from "@/components/fx/reveal";

export default function LandingPage() {
  return (
    // Force dark CSS variables for the entire landing — cinema-mode page.
    // Inner app pages still respect the user's theme preference; only this
    // marketing surface commits to the dark eco-tech aesthetic.
    /* `isolate` creates a stacking context on main so the AmbientBackdrop's
       negative z-index sits ABOVE main's own bg — without it the bg-slate-950
       paints over the backdrop and the leaves never appear. */
    <main className="dark relative isolate bg-slate-950 text-slate-100">
      {/* Persistent atmosphere — fixed behind everything. */}
      <AmbientBackdrop />
      <IntroSplash />
      <SiteHeader />

      {/* ─── HERO + SCROLL NARRATIVE ────────────────────────────────────
          One continuous pinned section. Hero is Scene 0; four quotes are
          Scenes 1–4. Same viewport throughout — no duplicate fullscreen. */}
      <QuoteScrollSection
        scrollLength={5}
        ariaLabel="GreenSteps storytelling journey"
      >
        {/* SCENE 0 — Hero (0% → 18%) */}
        <HeroScene until={0.18}>
          <Badge
            variant="success"
            className="rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-100 backdrop-blur"
          >
            <Leaf className="mr-1.5 h-3 w-3" /> Carbon Footprint Awareness Platform
          </Badge>

          <h1 className="mt-5 max-w-5xl text-balance text-[28px] font-bold leading-[1.08] tracking-tight text-white sm:text-4xl md:text-6xl lg:text-[68px] [text-shadow:0_2px_24px_rgba(0,0,0,0.45)]">
            Every Step Leaves a Mark.{" "}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-sky-300 bg-clip-text text-transparent">
              Make Yours Green.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-balance text-sm text-white/85 sm:text-base md:text-lg [text-shadow:0_1px_12px_rgba(0,0,0,0.4)]">
            Track, understand, and reduce your carbon footprint through
            awareness-driven insights and sustainable actions.
          </p>

          <div className="mt-7 flex w-full max-w-md flex-col items-stretch gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:justify-center">
            <Button
              asChild
              size="lg"
              variant="gradient"
              className="rounded-full shadow-2xl shadow-emerald-500/50 sm:size-xl"
            >
              <Link href="/discover">
                Calculate My Footprint <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="glass"
              className="rounded-full text-white"
            >
              <Link href="/chat">Ask the AI assistant</Link>
            </Button>
          </div>

          {/* Scroll cue is decorative — hide on the smallest viewports
              where it steals vertical room from the CTAs. */}
          <div className="hidden sm:block">
            <ScrollIndicator label="Scroll to continue the story" />
          </div>
        </HeroScene>

        {/* SCENE 1 — Quote (20% → 38%) */}
        <ScrollOverlay
          range={[0.2, 0.38]}
          side="center"
          title="Awareness is the first step toward climate action."
          subtitle="People who can see their footprint reduce it 17–28% within twelve weeks."
        />

        {/* SCENE 2 — Quote (40% → 58%) */}
        <ScrollOverlay
          range={[0.4, 0.58]}
          side="left"
          title="Small actions, multiplied by millions of people, can transform the world."
          subtitle="One habit shift × one person × one year ≈ 200 kg CO₂. The math compounds fast."
          attribution="Howard Zinn"
        />

        {/* SCENE 3 — Quote (60% → 78%) */}
        <ScrollOverlay
          range={[0.6, 0.78]}
          side="right"
          title="We do not inherit the Earth from our ancestors; we borrow it from our children."
          subtitle="The decade you measure today shapes the climate they live in tomorrow."
          attribution="Native American proverb"
        />

        {/* SCENE 4 — Quote (80% → 100%) */}
        <ScrollOverlay
          range={[0.8, 1]}
          side="center"
          title="Measure Today. Improve Tomorrow."
          subtitle="A 60-second baseline. From there, every choice moves the number."
        />
      </QuoteScrollSection>

      {/* HeroTransition removed — the AmbientBackdrop is the same colour
          as the hero's interior, so unpinning is naturally seamless.
          No gradient bridge needed. */}

      {/* ─── PRODUCT — 5 feature sections.
          Section bg is transparent. The ambient backdrop fills behind it. */}
      <section className="relative pt-24" data-leaf-density="reduced">
        <div className="container mx-auto max-w-5xl px-4 text-center">
          <Reveal>
            <Badge
              variant="success"
              className="rounded-full border-white/10 bg-emerald-500/15 px-3 py-1 text-emerald-100 backdrop-blur"
            >
              <Sparkles className="mr-1.5 h-3 w-3" /> What you get
            </Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-5xl">
              The platform, end to end
            </h2>
            <p className="mt-3 text-balance text-white/65 md:text-lg">
              Five tools that turn awareness into measurable progress.
            </p>
          </Reveal>
        </div>
      </section>

      <StorySection
        index={1}
        side="left"
        accent="emerald"
        eyebrow="The Calculator"
        quote="See your footprint in 60 seconds."
        body={
          <>
            <p>
              Answer five quick questions about how you move, eat, power your
              home, and shop. Our engine uses real grid factors —{" "}
              <strong>0.82 kg CO₂/kWh for India, 0.23 for the EU</strong> —
              not vibes.
            </p>
            <p>
              You get a number, a grade, and a category breakdown that tells
              you exactly where to push first.
            </p>
            <Button asChild variant="outline" className="mt-4 rounded-full">
              <Link href="/discover">Try the calculator <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </>
        }
        visual={<VisualImpactBars />}
      />

      <StorySection
        index={2}
        side="right"
        accent="sky"
        eyebrow="AI Sustainability Coach"
        quote="Personalized guidance, grounded in evidence."
        body={
          <>
            <p>
              Our RAG-powered assistant answers any climate question using a
              curated knowledge base — IPCC, IEA, EPA, CEA India, NITI Aayog,
              WHO — with inline citations.
            </p>
            <p>
              Ask <em>&quot;What&apos;s the payback on rooftop solar in Mumbai?&quot;</em>{" "}
              and get a real number from MNRE data, not a hallucination.
            </p>
            <Button asChild variant="outline" className="mt-4 rounded-full">
              <Link href="/chat">Ask the assistant <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </>
        }
        visual={<VisualAwareness />}
      />

      <StorySection
        index={3}
        side="left"
        accent="lime"
        eyebrow="Civic Carbon Atlas"
        quote="Your city has a carbon fingerprint."
        body={
          <>
            <p>
              Mumbai runs <strong>2.6 t / person / year</strong>. Delhi
              <strong> 3.1 t</strong>. Bengaluru <strong>2.2 t</strong> — and
              each has a different highest-leverage fix.
            </p>
            <p>
              The Atlas shows you the local grid mix, sector breakdown, and
              the single change that matters most where you live.
            </p>
            <Button asChild variant="outline" className="mt-4 rounded-full">
              <Link href="/city">Open the atlas <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </>
        }
        visual={<VisualResponsibility />}
      />

      <StorySection
        index={4}
        side="right"
        accent="teal"
        eyebrow="The Pledge Wall"
        quote="Public commitments stick 65% better."
        body={
          <>
            <p>
              Cialdini&apos;s research on social proof is brutal: private goals
              fade, public ones persist. Drop a 30-second pledge on our wall
              — &quot;two plant-based dinners a week&quot; — and your name + city + kg
              saved go live.
            </p>
            <p>
              Other people see it. Some join. The wall compounds.
            </p>
            <Button asChild variant="outline" className="mt-4 rounded-full">
              <Link href="/pledge">Add a pledge <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </>
        }
        visual={<VisualSmallActions />}
      />

      <StorySection
        index={5}
        side="left"
        accent="emerald"
        eyebrow="The Path Ahead"
        quote="Awareness scales into systems change."
        body={
          <>
            <p>
              Every action logged, every pledge made, every result shared
              becomes part of a larger pattern. Individual data joins the
              collective signal that policymakers, employers, and city
              planners pay attention to.
            </p>
            <p>
              <strong>You measuring matters more than you think.</strong>
            </p>
          </>
        }
        visual={<VisualFuture />}
      />

      {/* ─── PARTICLE TRANSFORMATION (untouched) ─────────────────────── */}
      <TransformationSection />

      {/* ─── TESTIMONIALS — content-heavy (reading carousel). */}
      <section id="testimonials" className="py-24" data-leaf-density="reduced">
        <div className="container mx-auto">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="success" className="rounded-full px-3 py-1">
                <Heart className="mr-1.5 h-3 w-3" /> What awareness looks like
              </Badge>
              <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                The shift, in users&apos; own words
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-14">
              <TestimonialsCarousel />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── FINAL CTA — softer surface so the ambient backdrop
          continues underneath instead of being replaced by a solid block. */}
      <section className="relative overflow-hidden py-28 md:py-32">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-700/35 via-emerald-800/30 to-teal-700/35 backdrop-blur-md" />
        <div className="absolute -top-24 left-1/4 -z-10 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="absolute -bottom-24 right-1/4 -z-10 h-72 w-72 rounded-full bg-teal-300/20 blur-3xl" />
        {/* Top + bottom hairlines act as the section's "edges" without a
            hard boundary — same trick as the transformation card. */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent" />

        <div className="container relative mx-auto px-4 text-center text-white">
          <Reveal>
            <Globe className="mx-auto h-12 w-12" />
            <h2 className="mt-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Your Footprint Matters.
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mx-auto mt-6 max-w-xl text-lg text-white/85 md:text-xl">
              Measure today. Improve tomorrow.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="xl"
                className="rounded-full bg-white text-emerald-700 shadow-xl shadow-emerald-900/40 hover:bg-white/90"
              >
                <Link href="/discover">
                  Start Your Sustainability Journey
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="rounded-full text-white hover:bg-white/10"
              >
                <Link href="/pledge">Browse pledges</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
