"use client";
import * as React from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createGoal } from "./actions";

export function GoalDialog() {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const closeRef = React.useRef<HTMLButtonElement>(null);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    try {
      await createGoal({
        title: String(formData.get("title")),
        description: String(formData.get("description") || ""),
        targetCo2: Number(formData.get("targetCo2")),
        endDate: new Date(String(formData.get("endDate"))),
      });
      toast.success("Goal created");
      closeRef.current?.click();
    } catch (e) {
      toast.error("Could not create goal");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const defaultEnd = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().slice(0, 10);
  })();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="gradient">
          <Plus className="h-4 w-4" /> New goal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a sustainability goal</DialogTitle>
          <DialogDescription>Define your target CO₂ reduction and a deadline.</DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required placeholder="Reduce footprint by 15%" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea id="description" name="description" rows={3} placeholder="How will you do this?" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="targetCo2">Target (kg CO₂)</Label>
              <Input id="targetCo2" name="targetCo2" type="number" min={1} required defaultValue={50} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End date</Label>
              <Input id="endDate" name="endDate" type="date" required defaultValue={defaultEnd} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" ref={closeRef}>Cancel</Button>
            </DialogClose>
            <Button type="submit" variant="gradient" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
