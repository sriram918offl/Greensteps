"use client";
import * as React from "react";

/**
 * Subscribe to a CSS media query and re-render when it flips.
 * SSR-safe — returns `false` until hydration, then matches reality.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

/**
 * True on phones / tablets (touch device OR narrow viewport).
 * We use this to drop the heaviest GPU effects — continuous blur drifts,
 * conic-gradient rotations, dense particle fields — on devices where they
 * pin the framerate to 15-25 fps.
 */
export function useLowPower(): boolean {
  return useMediaQuery(
    "(hover: none) and (pointer: coarse), (max-width: 768px), (prefers-reduced-data: reduce)",
  );
}
