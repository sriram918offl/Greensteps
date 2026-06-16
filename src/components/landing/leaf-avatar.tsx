"use client";
import * as React from "react";

/**
 * Leaf-shaped SVG avatar with a friendly face. Used in place of stock portraits
 * to keep the brand on-leaf and avoid third-party image deps in the LCP path.
 *
 * Tints rotate through 5 emerald/teal/lime variants so a row of avatars looks
 * varied without feeling random.
 */

const PALETTES = [
  { body: "#10b981", deep: "#047857", cheek: "#fbbf24" },
  { body: "#14b8a6", deep: "#0f766e", cheek: "#fb923c" },
  { body: "#84cc16", deep: "#4d7c0f", cheek: "#f472b6" },
  { body: "#22c55e", deep: "#15803d", cheek: "#fde047" },
  { body: "#0ea5e9", deep: "#0369a1", cheek: "#fb7185" },
] as const;

export function LeafAvatar({
  seed = 0,
  size = 128,
  className,
}: {
  /** Index used to pick a palette deterministically. */
  seed?: number;
  size?: number;
  className?: string;
}) {
  const palette = PALETTES[Math.abs(seed) % PALETTES.length];
  const id = React.useId().replace(/:/g, "");

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Friendly leaf avatar"
    >
      <defs>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={palette.body} />
          <stop offset="100%" stopColor={palette.deep} />
        </linearGradient>
        <radialGradient id={`shine-${id}`} cx="35%" cy="30%" r="60%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      {/* Leaf body — classic teardrop with serrated tip */}
      <path
        d="M100 14
           C 158 22, 188 64, 184 116
           C 180 162, 142 188, 100 188
           C 58 188, 18 160, 22 110
           C 26 60, 56 22, 100 14 Z"
        fill={`url(#g-${id})`}
      />

      {/* Center vein */}
      <path
        d="M100 28 Q 96 100 90 178"
        stroke={palette.deep}
        strokeWidth="3"
        fill="none"
        opacity="0.55"
        strokeLinecap="round"
      />

      {/* Side veins */}
      <path d="M96 60 Q 70 64 50 86" stroke={palette.deep} strokeWidth="2" fill="none" opacity="0.4" />
      <path d="M96 90 Q 64 96 36 120" stroke={palette.deep} strokeWidth="2" fill="none" opacity="0.4" />
      <path d="M94 120 Q 66 128 44 148" stroke={palette.deep} strokeWidth="2" fill="none" opacity="0.4" />
      <path d="M100 60 Q 124 64 144 80" stroke={palette.deep} strokeWidth="2" fill="none" opacity="0.4" />
      <path d="M100 90 Q 130 96 156 116" stroke={palette.deep} strokeWidth="2" fill="none" opacity="0.4" />
      <path d="M102 120 Q 132 128 152 144" stroke={palette.deep} strokeWidth="2" fill="none" opacity="0.4" />

      {/* Shine highlight */}
      <ellipse cx="70" cy="60" rx="40" ry="26" fill={`url(#shine-${id})`} />

      {/* Eyes */}
      <ellipse cx="78" cy="110" rx="6" ry="9" fill="#0f172a" />
      <ellipse cx="122" cy="110" rx="6" ry="9" fill="#0f172a" />
      <circle cx="80" cy="106" r="2" fill="white" />
      <circle cx="124" cy="106" r="2" fill="white" />

      {/* Cheeks */}
      <ellipse cx="64" cy="128" rx="7" ry="5" fill={palette.cheek} opacity="0.55" />
      <ellipse cx="136" cy="128" rx="7" ry="5" fill={palette.cheek} opacity="0.55" />

      {/* Smile */}
      <path
        d="M82 134 Q 100 148 118 134"
        stroke="#0f172a"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
