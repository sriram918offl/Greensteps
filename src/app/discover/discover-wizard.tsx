"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Car, Flame, Salad, ShoppingBag, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { savePublicCalculation } from "./actions";

type City = { slug: string; name: string; countryCode: string };

const STEPS = [
  { key: "place", title: "Where you live", icon: MapPin },
  { key: "transport", title: "How you move", icon: Car },
  { key: "energy", title: "Your home", icon: Flame },
  { key: "diet", title: "What you eat", icon: Salad },
  { key: "shop", title: "How you shop", icon: ShoppingBag },
] as const;

type State = {
  name: string;
  citySlug: string;
  countryCode: string;
  carKmPerMonth: number;
  fuelType: "PETROL" | "DIESEL" | "HYBRID" | "ELECTRIC" | "CNG";
  publicTransportPerWeek: number;
  flightsPerYear: number;
  electricityKwhPerMonth: number;
  acHoursPerDay: number;
  renewablePct: number;
  diet: "VEGAN" | "VEGETARIAN" | "MIXED" | "HEAVY_MEAT";
  shoppingScore: number;
};

const DEFAULTS: State = {
  name: "",
  citySlug: "",
  countryCode: "IN",
  carKmPerMonth: 400,
  fuelType: "PETROL",
  publicTransportPerWeek: 4,
  flightsPerYear: 2,
  electricityKwhPerMonth: 250,
  acHoursPerDay: 5,
  renewablePct: 14,
  diet: "MIXED",
  shoppingScore: 2,
};

export function DiscoverWizard({ cities }: { cities: City[] }) {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [data, setData] = React.useState<State>(DEFAULTS);
  const [loading, setLoading] = React.useState(false);
  const progress = ((step + 1) / STEPS.length) * 100;

  function set<K extends keyof State>(k: K, v: State[K]) {
    setData((d) => ({ ...d, [k]: v }));
  }

  async function submit() {
    setLoading(true);
    try {
      const res = await savePublicCalculation(data);
      router.push(`/result/${res.slug}`);
    } catch (e) {
      console.error(e);
      toast.error("Couldn't compute your footprint. Try again.");
      setLoading(false);
    }
  }

  return (
    <Card className="glass-strong">
      <CardContent className="p-6 md:p-8">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex gap-1.5">
            {STEPS.map((s, i) => (
              <span
                key={s.key}
                className={`h-1.5 w-8 rounded-full transition-all ${
                  i <= step ? "bg-emerald-500" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <Badge variant="success">{STEPS[step].title}</Badge>
        </div>
        <Progress value={progress} />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.2 }}
            className="mt-8"
          >
            {step === 0 && <PlaceStep data={data} set={set} cities={cities} />}
            {step === 1 && <TransportStep data={data} set={set} />}
            {step === 2 && <EnergyStep data={data} set={set} />}
            {step === 3 && <DietStep data={data} set={set} />}
            {step === 4 && <ShopStep data={data} set={set} />}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex justify-between">
          <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || loading}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button variant="gradient" onClick={() => setStep((s) => s + 1)}>
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="gradient" onClick={submit} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>See my impact <ArrowRight className="h-4 w-4" /></>}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PlaceStep({ data, set, cities }: { data: State; set: <K extends keyof State>(k: K, v: State[K]) => void; cities: City[] }) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Your name (shown on the share card)</Label>
        <Input value={data.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Priya" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Country</Label>
          <Select value={data.countryCode} onValueChange={(v) => set("countryCode", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="IN">🇮🇳 India</SelectItem>
              <SelectItem value="US">🇺🇸 United States</SelectItem>
              <SelectItem value="EU">🇪🇺 European Union</SelectItem>
              <SelectItem value="GB">🇬🇧 United Kingdom</SelectItem>
              <SelectItem value="CN">🇨🇳 China</SelectItem>
              <SelectItem value="GLOBAL">🌍 Global average</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>City (optional)</Label>
          <Select value={data.citySlug || "none"} onValueChange={(v) => set("citySlug", v === "none" ? "" : v)}>
            <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— Skip</SelectItem>
              {cities.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
        💡 We use your country&apos;s real grid emission factor — Indian grids are ~2× more carbon-intensive than European ones.
      </p>
    </div>
  );
}

function TransportStep({ data, set }: { data: State; set: <K extends keyof State>(k: K, v: State[K]) => void }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <NumberField label="Car kilometers per month" unit="km" value={data.carKmPerMonth} onChange={(n) => set("carKmPerMonth", n)} />
      <div className="space-y-2">
        <Label>Fuel type</Label>
        <Select value={data.fuelType} onValueChange={(v) => set("fuelType", v as State["fuelType"])}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="PETROL">⛽ Petrol</SelectItem>
            <SelectItem value="DIESEL">🛢 Diesel</SelectItem>
            <SelectItem value="HYBRID">🔄 Hybrid</SelectItem>
            <SelectItem value="ELECTRIC">⚡ Electric</SelectItem>
            <SelectItem value="CNG">💨 CNG</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <NumberField label="Bus / metro / train trips / week" unit="trips" value={data.publicTransportPerWeek} onChange={(n) => set("publicTransportPerWeek", n)} />
      <NumberField label="Flights per year" unit="flights" value={data.flightsPerYear} onChange={(n) => set("flightsPerYear", n)} />
    </div>
  );
}

function EnergyStep({ data, set }: { data: State; set: <K extends keyof State>(k: K, v: State[K]) => void }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <NumberField label="Monthly electricity" unit="kWh" value={data.electricityKwhPerMonth} onChange={(n) => set("electricityKwhPerMonth", n)} hint="Check your last bill" />
      <NumberField label="Air conditioning per day" unit="hours" max={24} value={data.acHoursPerDay} onChange={(n) => set("acHoursPerDay", n)} />
      <div className="space-y-2 md:col-span-2">
        <Label>Solar / green tariff share ({data.renewablePct}%)</Label>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={data.renewablePct}
          onChange={(e) => set("renewablePct", Number(e.target.value))}
          className="w-full accent-emerald-500"
        />
      </div>
    </div>
  );
}

function DietStep({ data, set }: { data: State; set: <K extends keyof State>(k: K, v: State[K]) => void }) {
  const opts: { v: State["diet"]; label: string; emoji: string; sub: string }[] = [
    { v: "VEGAN", label: "Vegan", emoji: "🌱", sub: "No animal products" },
    { v: "VEGETARIAN", label: "Vegetarian", emoji: "🥬", sub: "Dairy okay, no meat" },
    { v: "MIXED", label: "Mixed", emoji: "🍛", sub: "Some meat, some plants" },
    { v: "HEAVY_MEAT", label: "Heavy meat", emoji: "🍖", sub: "Meat at most meals" },
  ];
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {opts.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => set("diet", o.v)}
          className={`flex items-start gap-3 rounded-xl border p-5 text-left transition-all ${
            data.diet === o.v ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30" : "border-border hover:bg-accent"
          }`}
        >
          <span className="text-2xl">{o.emoji}</span>
          <div>
            <p className="font-semibold">{o.label}</p>
            <p className="text-xs text-muted-foreground">{o.sub}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

function ShopStep({ data, set }: { data: State; set: <K extends keyof State>(k: K, v: State[K]) => void }) {
  const labels = ["Minimal", "Light", "Moderate", "Frequent", "Heavy", "Very heavy"];
  return (
    <div className="space-y-5">
      <div>
        <Label className="text-base">How much new stuff do you buy per month?</Label>
        <p className="mt-1 text-xs text-muted-foreground">
          Includes clothing, electronics, gadgets, online orders.
        </p>
      </div>
      <div className="space-y-3">
        <input
          type="range"
          min={0}
          max={5}
          value={data.shoppingScore}
          onChange={(e) => set("shoppingScore", Number(e.target.value))}
          className="w-full accent-emerald-500"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          {labels.map((l, i) => (
            <span key={l} className={data.shoppingScore === i ? "font-bold text-emerald-600 dark:text-emerald-300" : ""}>
              {l}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function NumberField({
  label, hint, value, onChange, unit, max,
}: {
  label: string; hint?: string; value: number; onChange: (n: number) => void; unit?: string; max?: number;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <Input type="number" value={value} max={max} onChange={(e) => onChange(Number(e.target.value))} className="pr-16" />
        {unit && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{unit}</span>}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
