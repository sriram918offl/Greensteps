"use client";
import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingDown, DollarSign, Clock } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PRESET_SCENARIOS, type Scenario } from "@/lib/carbon";
import { formatCurrency, formatKg } from "@/lib/utils";

export function SimulatorUI() {
  const [scenario, setScenario] = React.useState<Scenario>(PRESET_SCENARIOS[0]);
  const [query, setQuery] = React.useState("");
  const [customScenario, setCustomScenario] = React.useState<Scenario | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function runCustom() {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query }),
      });
      const data = await res.json();
      setCustomScenario({
        id: "custom",
        title: data.title ?? "Your scenario",
        description: data.description ?? query,
        monthlySaving: data.monthlySaving ?? 25,
        annualCostSaving: data.annualCostSaving ?? 200,
        timeToImpactMonths: data.timeToImpactMonths ?? 2,
      });
      setScenario({
        id: "custom",
        title: data.title ?? "Your scenario",
        description: data.description ?? query,
        monthlySaving: data.monthlySaving ?? 25,
        annualCostSaving: data.annualCostSaving ?? 200,
        timeToImpactMonths: data.timeToImpactMonths ?? 2,
      });
    } catch {
      // fallback: rough heuristic
      const s: Scenario = {
        id: "custom",
        title: query.slice(0, 50),
        description: query,
        monthlySaving: 30,
        annualCostSaving: 240,
        timeToImpactMonths: 2,
      };
      setCustomScenario(s);
      setScenario(s);
    } finally {
      setLoading(false);
    }
  }

  const data = [
    { name: "Before", co2: 600 },
    { name: "After", co2: Math.max(50, 600 - scenario.monthlySaving) },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-1">
        <Card className="glass-strong">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-emerald-500" /> Try your own</CardTitle>
            <CardDescription>Type a "what if" question</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="What if I work from home 3 days a week?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runCustom()}
            />
            <Button variant="gradient" className="w-full" onClick={runCustom} disabled={loading}>
              {loading ? "Simulating..." : "Simulate"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Presets</p>
          {PRESET_SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => { setScenario(s); setCustomScenario(null); }}
              className={`block w-full rounded-lg border p-3 text-left transition-all ${
                scenario.id === s.id ? "border-emerald-500 bg-emerald-500/10" : "border-border hover:bg-accent"
              }`}
            >
              <p className="text-sm font-medium">{s.title}</p>
              <p className="text-xs text-muted-foreground">−{s.monthlySaving} kg/mo</p>
            </button>
          ))}
          {customScenario && (
            <button
              onClick={() => setScenario(customScenario)}
              className={`block w-full rounded-lg border p-3 text-left transition-all ${
                scenario.id === "custom" ? "border-emerald-500 bg-emerald-500/10" : "border-border hover:bg-accent"
              }`}
            >
              <Badge variant="success" className="mb-1">AI</Badge>
              <p className="text-sm font-medium line-clamp-1">{customScenario.title}</p>
              <p className="text-xs text-muted-foreground">−{customScenario.monthlySaving} kg/mo</p>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>{scenario.title}</CardTitle>
            <CardDescription>{scenario.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <ImpactStat icon={TrendingDown} label="CO₂ saved" value={formatKg(scenario.monthlySaving)} sub="per month" />
              <ImpactStat icon={DollarSign} label="$ saved" value={formatCurrency(scenario.annualCostSaving)} sub="per year" />
              <ImpactStat icon={Clock} label="Time to impact" value={`${scenario.timeToImpactMonths} mo`} sub="payoff" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Before vs. After</CardTitle>
            <CardDescription>Monthly footprint comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={scenario.id}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 12,
                    }}
                  />
                  <Bar dataKey="co2" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ImpactStat({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof TrendingDown;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
