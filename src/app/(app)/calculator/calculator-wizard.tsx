"use client";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Car, Flame, Salad, ShoppingBag, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BreakdownChart } from "@/components/charts/breakdown-chart";
import { saveCalculation } from "./actions";
import { formatKg } from "@/lib/utils";

const STEPS = [
  { key: "transport", title: "Transportation", icon: Car },
  { key: "energy", title: "Home Energy", icon: Flame },
  { key: "food", title: "Food Habits", icon: Salad },
  { key: "shopping", title: "Shopping", icon: ShoppingBag },
] as const;

type FormState = {
  carMilesPerMonth: number;
  fuelType: "PETROL" | "DIESEL" | "HYBRID" | "ELECTRIC" | "CNG";
  publicTransportPerWeek: number;
  flightsPerMonth: number;
  electricityKwhPerMonth: number;
  acHoursPerDay: number;
  renewablePct: number;
  diet: "VEGAN" | "VEGETARIAN" | "MIXED" | "HEAVY_MEAT";
  clothingPerMonth: number;
  electronicsPerMonth: number;
  onlineOrdersPerMonth: number;
};

const DEFAULTS: FormState = {
  carMilesPerMonth: 300,
  fuelType: "PETROL",
  publicTransportPerWeek: 5,
  flightsPerMonth: 0,
  electricityKwhPerMonth: 350,
  acHoursPerDay: 4,
  renewablePct: 20,
  diet: "MIXED",
  clothingPerMonth: 2,
  electronicsPerMonth: 0,
  onlineOrdersPerMonth: 4,
};

type Result = {
  id: string;
  transportationCo2: number;
  energyCo2: number;
  foodCo2: number;
  shoppingCo2: number;
  totalCo2: number;
  grade: string;
  breakdown: Array<{ name: string; value: number; color: string }>;
};

export function CalculatorWizard() {
  const [step, setStep] = React.useState(0);
  const [data, setData] = React.useState<FormState>(DEFAULTS);
  const [result, setResult] = React.useState<Result | null>(null);
  const [loading, setLoading] = React.useState(false);

  const progress = ((step + 1) / STEPS.length) * 100;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  async function submit() {
    setLoading(true);
    try {
      const res = await saveCalculation(data);
      setResult(res as Result);
      toast.success("Your carbon footprint has been calculated.");
    } catch (e) {
      toast.error("Couldn't save calculation. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return <ResultView result={result} onRestart={() => { setResult(null); setStep(0); }} />;
  }

  return (
    <Card className="glass-strong">
      <CardContent className="p-6 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div
                key={s.key}
                className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold transition-all ${
                  i === step
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : i < step
                      ? "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                      : "border-border bg-background text-muted-foreground"
                }`}
              >
                {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
            ))}
          </div>
          <Badge variant="success">{STEPS[step].title}</Badge>
        </div>
        <Progress value={progress} />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="mt-8 space-y-5"
          >
            {step === 0 && <TransportStep data={data} update={update} />}
            {step === 1 && <EnergyStep data={data} update={update} />}
            {step === 2 && <FoodStep data={data} update={update} />}
            {step === 3 && <ShoppingStep data={data} update={update} />}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex justify-between">
          <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || loading}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button variant="gradient" onClick={() => setStep((s) => s + 1)}>
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="gradient" onClick={submit} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Calculate <ArrowRight className="h-4 w-4" /></>}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function NumberField({
  label,
  hint,
  value,
  onChange,
  unit,
  min = 0,
  max,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (n: number) => void;
  unit?: string;
  min?: number;
  max?: number;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <Input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(Number(e.target.value))}
          className="pr-16"
        />
        {unit && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function TransportStep({ data, update }: { data: FormState; update: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <NumberField
        label="Car mileage per month"
        unit="miles"
        value={data.carMilesPerMonth}
        onChange={(n) => update("carMilesPerMonth", n)}
      />
      <div className="space-y-2">
        <Label>Fuel type</Label>
        <Select value={data.fuelType} onValueChange={(v) => update("fuelType", v as FormState["fuelType"])}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="PETROL">Petrol</SelectItem>
            <SelectItem value="DIESEL">Diesel</SelectItem>
            <SelectItem value="HYBRID">Hybrid</SelectItem>
            <SelectItem value="ELECTRIC">Electric</SelectItem>
            <SelectItem value="CNG">CNG</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <NumberField
        label="Public transport trips per week"
        unit="trips"
        value={data.publicTransportPerWeek}
        onChange={(n) => update("publicTransportPerWeek", n)}
      />
      <NumberField
        label="Flights per month"
        unit="flights"
        value={data.flightsPerMonth}
        onChange={(n) => update("flightsPerMonth", n)}
      />
    </div>
  );
}

function EnergyStep({ data, update }: { data: FormState; update: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <NumberField
        label="Monthly electricity"
        unit="kWh"
        value={data.electricityKwhPerMonth}
        onChange={(n) => update("electricityKwhPerMonth", n)}
        hint="Check your last electricity bill"
      />
      <NumberField
        label="AC usage per day"
        unit="hours"
        max={24}
        value={data.acHoursPerDay}
        onChange={(n) => update("acHoursPerDay", n)}
      />
      <div className="space-y-2 md:col-span-2">
        <Label>Renewable energy share ({data.renewablePct}%)</Label>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={data.renewablePct}
          onChange={(e) => update("renewablePct", Number(e.target.value))}
          className="w-full accent-emerald-500"
        />
        <p className="text-xs text-muted-foreground">
          % of your electricity from solar, wind, or a green tariff.
        </p>
      </div>
    </div>
  );
}

function FoodStep({ data, update }: { data: FormState; update: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
  const options: { value: FormState["diet"]; label: string; sub: string }[] = [
    { value: "VEGAN", label: "Vegan", sub: "No animal products" },
    { value: "VEGETARIAN", label: "Vegetarian", sub: "Dairy & eggs okay" },
    { value: "MIXED", label: "Mixed diet", sub: "Balanced meat + plants" },
    { value: "HEAVY_MEAT", label: "Heavy meat", sub: "Meat at most meals" },
  ];
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => update("diet", o.value)}
          className={`group flex flex-col rounded-xl border p-5 text-left transition-all ${
            data.diet === o.value
              ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30"
              : "border-border hover:border-emerald-500/50 hover:bg-accent"
          }`}
        >
          <span className="text-base font-semibold">{o.label}</span>
          <span className="mt-1 text-xs text-muted-foreground">{o.sub}</span>
        </button>
      ))}
    </div>
  );
}

function ShoppingStep({ data, update }: { data: FormState; update: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <NumberField
        label="Clothing items per month"
        unit="items"
        value={data.clothingPerMonth}
        onChange={(n) => update("clothingPerMonth", n)}
      />
      <NumberField
        label="Electronics per month"
        unit="items"
        value={data.electronicsPerMonth}
        onChange={(n) => update("electronicsPerMonth", n)}
      />
      <NumberField
        label="Online orders per month"
        unit="orders"
        value={data.onlineOrdersPerMonth}
        onChange={(n) => update("onlineOrdersPerMonth", n)}
      />
    </div>
  );
}

function ResultView({ result, onRestart }: { result: Result; onRestart: () => void }) {
  const total = result.totalCo2;

  return (
    <div className="space-y-6">
      <Card className="glass-strong overflow-hidden">
        <CardContent className="grid gap-6 p-8 md:grid-cols-3 md:items-center">
          <div className="md:col-span-2">
            <Badge variant="success">Your monthly footprint</Badge>
            <p className="mt-3 text-5xl font-bold text-gradient">{formatKg(total)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Grade <strong>{result.grade}</strong> — {gradeMessage(result.grade)}
            </p>
            <div className="mt-5 flex gap-2">
              <Button variant="gradient" onClick={onRestart}>Recalculate</Button>
              <Button variant="outline" asChild>
                <a href="/coach">Get AI coaching</a>
              </Button>
            </div>
          </div>
          <div>
            <BreakdownChart data={result.breakdown} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <CategoryStat label="Transportation" value={result.transportationCo2} color="#10b981" />
        <CategoryStat label="Energy" value={result.energyCo2} color="#3b82f6" />
        <CategoryStat label="Food" value={result.foodCo2} color="#f59e0b" />
        <CategoryStat label="Shopping" value={result.shoppingCo2} color="#ef4444" />
      </div>
    </div>
  );
}

function CategoryStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: color }} />
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        </div>
        <p className="mt-2 text-2xl font-bold">{value.toFixed(1)} <span className="text-xs font-medium text-muted-foreground">kg CO₂</span></p>
      </CardContent>
    </Card>
  );
}

function gradeMessage(g: string) {
  const map: Record<string, string> = {
    "A+": "Outstanding — you're in the top 5%",
    A: "Great work — well below average",
    B: "Solid — small tweaks can push you to A",
    C: "Average — meaningful gains possible",
    D: "Above average — significant opportunity",
    F: "Heavy footprint — let's bring this down together",
  };
  return map[g] ?? "Keep going";
}
