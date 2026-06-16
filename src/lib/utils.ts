import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number, digits = 1) {
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(digits)}k`;
  return n.toFixed(digits);
}

export function formatKg(kg: number) {
  if (kg >= 1000) return `${(kg / 1000).toFixed(2)} t`;
  return `${kg.toFixed(1)} kg`;
}

export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

export function relativeMonths(n: number) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toLocaleString("en-US", { month: "short" });
}

export function grade(totalCo2: number): "A+" | "A" | "B" | "C" | "D" | "F" {
  if (totalCo2 < 200) return "A+";
  if (totalCo2 < 400) return "A";
  if (totalCo2 < 700) return "B";
  if (totalCo2 < 1000) return "C";
  if (totalCo2 < 1500) return "D";
  return "F";
}

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
