"use client";
import * as React from "react";
import { Bike, Bus, Car, Drumstick, Plug, ShoppingBag, Train, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { logActivity } from "./actions";

const presets = [
  { category: "TRANSPORTATION" as const, type: "car", unit: "km", icon: Car, label: "Car" },
  { category: "TRANSPORTATION" as const, type: "bus", unit: "km", icon: Bus, label: "Bus" },
  { category: "TRANSPORTATION" as const, type: "train", unit: "km", icon: Train, label: "Train" },
  { category: "TRANSPORTATION" as const, type: "bicycle", unit: "km", icon: Bike, label: "Bicycle" },
  { category: "ENERGY" as const, type: "electricity", unit: "kWh", icon: Plug, label: "Electricity" },
  { category: "FOOD" as const, type: "vegetarian", unit: "meals", icon: Drumstick, label: "Meal" },
  { category: "SHOPPING" as const, type: "clothing", unit: "items", icon: ShoppingBag, label: "Purchase" },
];

export function ActivityForm() {
  const [category, setCategory] = React.useState<typeof presets[number]["category"]>("TRANSPORTATION");
  const [type, setType] = React.useState("car");
  const [unit, setUnit] = React.useState("km");
  const [quantity, setQuantity] = React.useState<number>(10);
  const [description, setDescription] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  function selectPreset(p: typeof presets[number]) {
    setCategory(p.category);
    setType(p.type);
    setUnit(p.unit);
  }

  async function submit() {
    setLoading(true);
    try {
      const res = await logActivity({ category, type, unit, quantity, description });
      toast.success(`Logged — ${res.co2.toFixed(1)} kg CO₂`);
      setQuantity(0);
      setDescription("");
    } catch (e) {
      toast.error("Could not log activity.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log activity</CardTitle>
        <CardDescription>+5 green points per entry</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => selectPreset(p)}
              className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-xs transition-all ${
                type === p.type ? "border-emerald-500 bg-emerald-500/10" : "border-border hover:bg-accent"
              }`}
            >
              <p.icon className="h-5 w-5" />
              {p.label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="TRANSPORTATION">Transportation</SelectItem>
              <SelectItem value="ENERGY">Energy</SelectItem>
              <SelectItem value="FOOD">Food</SelectItem>
              <SelectItem value="SHOPPING">Shopping</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Unit</Label>
            <Input value={unit} onChange={(e) => setUnit(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Notes (optional)</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. commute" />
        </div>

        <Button variant="gradient" className="w-full" onClick={submit} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> Log</>}
        </Button>
      </CardContent>
    </Card>
  );
}
