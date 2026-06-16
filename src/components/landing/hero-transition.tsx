/**
 * Smooth visual bridge between the dark pinned hero (QuoteScrollSection)
 * and the next section.
 *
 * Design rules (per user brief):
 *   1. Keep the dark green/teal palette — no bright peaks or color shifts.
 *   2. Feather the boundary over 120–200 px (this is 192 px, h-48).
 *   3. The top color must match the hero's bottom so there's no seam.
 *   4. Responsive at any viewport — color stops are %-based.
 *
 * The hero's bottom is dominated by `slate-950` (right) and `teal-950` (centre)
 * with the radial vignette darkening edges. The strip's first ~25 % uses that
 * same dark teal/slate so the join is invisible; the rest fades monotonically
 * to the page background via `hsl(var(--background))` so the same gradient
 * adapts to light and dark mode.
 *
 * Pure CSS — zero JS cost, zero flicker.
 */
export function HeroTransition() {
  return (
    <div
      aria-hidden
      className="relative -mt-px h-48 overflow-hidden transition-colors duration-500"
      style={{
        background:
          // Layer 1 (top): page-bg vertical fade so it dissolves into the
          // background colour at the bottom. Transparent at the top so the
          // diagonal layer below shows through and matches the hero's bottom.
          "linear-gradient(to bottom," +
          " transparent 0%," +
          " transparent 25%," +
          " hsl(var(--background) / 0.55) 65%," +
          " hsl(var(--background)) 100%)," +
          // Layer 2 (under): same diagonal palette as the pinned hero
          // (from-emerald-950 via-teal-950 to-slate-950). This means the top
          // of the strip *is* the hero's bottom — no colour seam.
          "linear-gradient(to bottom right," +
          " rgb(2, 44, 34) 0%," +
          " rgb(4, 47, 46) 50%," +
          " rgb(2, 6, 23) 100%)",
      }}
    />
  );
}
