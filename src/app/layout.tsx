import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "GreenSteps — AI Carbon Footprint Tracker",
    template: "%s · GreenSteps",
  },
  description:
    "Understand your environmental impact and receive AI-powered recommendations to reduce it. Track activities, set goals, join challenges, and chat with a RAG-powered sustainability coach.",
  keywords: ["carbon footprint", "sustainability", "AI coach", "climate", "green tech"],
  authors: [{ name: "GreenSteps" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "GreenSteps — AI Carbon Footprint Tracker",
    description: "Track and reduce your carbon footprint with AI-powered insights.",
    type: "website",
    siteName: "GreenSteps",
  },
  twitter: {
    card: "summary_large_image",
    title: "GreenSteps — AI Carbon Footprint Tracker",
    description: "Track and reduce your carbon footprint with AI-powered insights.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#022c22" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} font-sans antialiased`}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-emerald-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            Skip to main content
          </a>
          <Providers>
            <div id="main">{children}</div>
          </Providers>
        </body>
      </html>
    </ViewTransitions>
  );
}
