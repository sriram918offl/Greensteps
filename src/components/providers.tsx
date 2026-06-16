"use client";
import * as React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LenisProvider } from "@/components/fx/lenis-provider";

// NOTE: page transitions are handled at the root layout via
// `next-view-transitions`. The old Framer-based <PageTransition>
// is unused — App Router replaces children before AnimatePresence can play
// its exit animation, so it never actually animated. The CSS defining the
// fade + slide lives in globals.css under `::view-transition-*`.
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#10b981",
          colorBackground: "#ffffff",
          borderRadius: "0.75rem",
        },
      }}
    >
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <TooltipProvider delayDuration={150}>
          <LenisProvider>{children}</LenisProvider>
          <Toaster position="top-right" theme="system" richColors closeButton />
        </TooltipProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}
