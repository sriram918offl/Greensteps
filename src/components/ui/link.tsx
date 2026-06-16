"use client";

/**
 * Drop-in replacement for `next/link` that uses the browser's native
 * View Transitions API for soft fade + subtle slide between routes.
 *
 * Powered by `next-view-transitions`. Falls back to a normal Next.js
 * client navigation in browsers without View Transitions support
 * (Firefox < 129, older Safari) — no errors, just a hard cut.
 *
 * Usage is identical to next/link:
 *
 *   import Link from "@/components/ui/link";
 *   <Link href="/discover">…</Link>
 */
import { Link } from "next-view-transitions";

export default Link;
