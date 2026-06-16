"use client";
import * as React from "react";
import { Loader2, Receipt, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Extracted = {
  kwh?: number;
  billingPeriod?: string;
  amount?: number | null;
  currency?: string | null;
  estimatedCo2?: number;
};

export function BillScanner() {
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<Extracted | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const form = new FormData();
      form.append("bill", file);
      const res = await fetch("/api/ocr", { method: "POST", body: form });
      if (!res.ok) throw new Error("Failed");
      setResult(await res.json());
      toast.success("Bill scanned");
    } catch (e) {
      console.error(e);
      toast.error("Could not extract bill data");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <Card className="glass-strong">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Receipt className="h-4 w-4 text-emerald-500" /> Bill scanner</CardTitle>
        <CardDescription>Upload an electricity bill — we'll extract units & estimate CO₂.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button onClick={() => inputRef.current?.click()} disabled={loading} variant="outline" className="w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Upload className="h-4 w-4" /> Upload bill</>}
        </Button>
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={onChange} />

        {result && (
          <div className="space-y-2 rounded-lg border border-border p-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Units</span><span className="font-semibold">{result.kwh ?? "—"} kWh</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Period</span><span className="font-semibold">{result.billingPeriod ?? "—"}</span></div>
            {result.amount && (
              <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-semibold">{result.amount} {result.currency ?? ""}</span></div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Estimated CO₂</span>
              <Badge variant="success">{result.estimatedCo2?.toFixed(1)} kg</Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
