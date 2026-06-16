"use client";
import * as React from "react";
import Link from "@/components/ui/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calculator,
  Activity,
  Target,
  Trophy,
  Sparkles,
  FlaskConical,
  Bot,
  Shield,
  Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calculator", label: "Calculator", icon: Calculator },
  { href: "/activities", label: "Activities", icon: Activity },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/challenges", label: "Challenges", icon: Trophy },
  { href: "/coach", label: "AI Coach", icon: Sparkles },
  { href: "/simulator", label: "Simulator", icon: FlaskConical },
  { href: "/chat", label: "Chatbot", icon: Bot },
];

export function AppSidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border bg-card/50 lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30">
          <Leaf className="h-5 w-5" />
        </div>
        <Link href="/" className="text-lg font-bold text-gradient">
          GreenSteps
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="px-3 pt-6 pb-2 text-xs uppercase tracking-wider text-muted-foreground">
              Admin
            </div>
            <Link
              href="/admin"
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith("/admin")
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Shield className="h-4 w-4" />
              Admin Panel
            </Link>
          </>
        )}
      </nav>

      <div className="border-t border-border p-4 text-xs text-muted-foreground">
        <p className="font-medium">🌱 Every step counts</p>
        <p>Small consistent changes add up to massive impact.</p>
      </div>
    </aside>
  );
}
