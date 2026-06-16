"use client";
import * as React from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createPledge } from "./actions";

export function PledgeForm() {
  const [loading, setLoading] = React.useState(false);
  const [category, setCategory] = React.useState<"transport" | "energy" | "food" | "shopping" | "general">("transport");
  const formRef = React.useRef<HTMLFormElement>(null);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    try {
      const res = await createPledge({
        name: String(formData.get("name")),
        city: String(formData.get("city") || "") || undefined,
        message: String(formData.get("message")),
        category,
      });
      if (res.ok) {
        toast.success("Pledge added — thank you 🌱");
        formRef.current?.reset();
      } else {
        toast.error(res.error);
      }
    } catch (e) {
      console.error(e);
      toast.error("Couldn't add your pledge. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="glass-strong">
      <CardHeader>
        <CardTitle>Make a pledge</CardTitle>
        <CardDescription>Public, free, takes 30 seconds.</CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input name="name" required minLength={2} maxLength={40} placeholder="Priya" />
            </div>
            <div className="space-y-1">
              <Label>City</Label>
              <Input name="city" maxLength={40} placeholder="Mumbai" />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="transport">🚲 Transport</SelectItem>
                <SelectItem value="energy">⚡ Energy</SelectItem>
                <SelectItem value="food">🥗 Food</SelectItem>
                <SelectItem value="shopping">🛍 Shopping</SelectItem>
                <SelectItem value="general">🌍 General</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Your commitment</Label>
            <Textarea
              name="message"
              required
              minLength={8}
              maxLength={280}
              rows={3}
              placeholder='e.g. "I&apos;ll cycle to work twice a week for the next 3 months"'
            />
            <p className="text-[10px] text-muted-foreground">Be specific — vague pledges don&apos;t stick.</p>
          </div>
          <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" /> Add to wall</>}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
