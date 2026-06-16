/** @type {import('next').NextConfig} */

// HTTPS-only directives must be gated on actually serving over HTTPS, NOT on
// NODE_ENV. `next start` sets NODE_ENV=production even on http://localhost —
// sending `upgrade-insecure-requests` there breaks every CSS/JS asset, and
// sending HSTS pins the dev domain to https in the browser's cache forever.
//
// We use the platform's deploy-marker env vars (Vercel sets VERCEL=1) as the
// truth signal. You can also force-enable via FORCE_HTTPS=true for other hosts.
const isHttpsDeploy =
  process.env.VERCEL === "1" || process.env.FORCE_HTTPS === "true";

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://*.clerk.com https://challenges.cloudflare.com",
  "worker-src 'self' blob:",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https: http: https://img.clerk.com https://images.unsplash.com",
  "media-src 'self' blob: data:",
  "font-src 'self' data: https: https://fonts.gstatic.com https://cdn.jsdelivr.net",
  "connect-src 'self' https://*.clerk.accounts.dev https://*.clerk.com wss://*.clerk.accounts.dev https://generativelanguage.googleapis.com https://api.openai.com" +
    (isHttpsDeploy ? "" : " ws://localhost:* http://localhost:* http://127.0.0.1:*"),
  "frame-src https://*.clerk.accounts.dev https://*.clerk.com https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  // Only force HTTPS rewrites on real HTTPS deploys
  ...(isHttpsDeploy ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
  },
  { key: "Content-Security-Policy", value: csp },
  // HSTS only when actually on HTTPS (see comment above).
  ...(isHttpsDeploy
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    serverActions: { bodySizeLimit: "5mb" },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "img.clerk.com" },
    ],
  },
  serverExternalPackages: ["@prisma/client", "pg"],
  productionBrowserSourceMaps: false,
  // Edge Runtime forbids eval/new Function(). Some Next 15.5 + Windows combos
  // leave webpack's eval-wrapped module loader in the Edge middleware bundle,
  // which crashes Clerk's middleware. Force devtool off for all server builds.
  webpack(config, { isServer }) {
    if (isServer) {
      config.devtool = false;
    }
    return config;
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        source: "/api/health",
        headers: [{ key: "Cache-Control", value: "public, max-age=10, s-maxage=10" }],
      },
      {
        source: "/result/:slug/og",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, s-maxage=86400" }],
      },
    ];
  },
};

export default nextConfig;
