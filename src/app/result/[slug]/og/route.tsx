import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { PERCAPITA_TONS_YR } from "@/lib/factors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const calc = await prisma.publicCalculation.findUnique({ where: { slug } });

  if (!calc) {
    return new ImageResponse(<div style={{ display: "flex" }}>Not found</div>, { width: 1200, height: 630 });
  }

  // Wrap in try/catch — next/og fetches Inter from a CDN by default,
  // so behind a firewall (or in offline dev) we return a JSON fallback.
  try {
    return await renderOg(calc);
  } catch (e) {
    console.error("OG image generation failed:", (e as Error).message);
    return new Response(
      JSON.stringify({ error: "OG image unavailable", monthly: Math.round(calc.totalCo2), grade: calc.grade }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }
}

async function renderOg(calc: NonNullable<Awaited<ReturnType<typeof prisma.publicCalculation.findUnique>>>) {

  const monthlyKg = Math.round(calc.totalCo2);
  const yearTons = ((calc.totalCo2 * 12) / 1000).toFixed(2);
  const nationalTons = PERCAPITA_TONS_YR[calc.countryCode] ?? PERCAPITA_TONS_YR.GLOBAL;
  const ratio = ((calc.totalCo2 * 12) / 1000) / nationalTons;
  const ratioLabel =
    ratio > 1.05 ? `${Math.round((ratio - 1) * 100)}% above avg`
    : ratio < 0.95 ? `${Math.round((1 - ratio) * 100)}% below avg`
    : "near national avg";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #065f46 0%, #10b981 60%, #14b8a6 100%)",
          padding: 60,
          color: "white",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 28, fontWeight: 700 }}>
          <div
            style={{
              width: 52, height: 52,
              borderRadius: 14,
              background: "white",
              color: "#059669",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32,
            }}
          >
            🌿
          </div>
          GreenSteps
        </div>

        <div style={{ display: "flex", marginTop: 36, fontSize: 36, opacity: 0.85 }}>
          {calc.name ?? "Someone"}&apos;s monthly carbon footprint
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 12 }}>
          <div style={{ fontSize: 180, fontWeight: 900, lineHeight: 1, letterSpacing: -4 }}>
            {monthlyKg}
          </div>
          <div style={{ fontSize: 40, opacity: 0.9 }}>kg CO₂</div>
          <div
            style={{
              marginLeft: 16,
              padding: "12px 28px",
              borderRadius: 999,
              background: "white",
              color: "#059669",
              fontSize: 38,
              fontWeight: 800,
            }}
          >
            Grade {calc.grade}
          </div>
        </div>

        <div style={{ display: "flex", marginTop: 6, fontSize: 26, opacity: 0.85 }}>
          {yearTons} tons / year · {ratioLabel}
        </div>

        <div style={{ display: "flex", marginTop: "auto", justifyContent: "space-between", alignItems: "center", fontSize: 24 }}>
          <div style={{ display: "flex", gap: 18, opacity: 0.9 }}>
            <span>🚗 {calc.transportationCo2.toFixed(0)}</span>
            <span>⚡ {calc.energyCo2.toFixed(0)}</span>
            <span>🍛 {calc.foodCo2.toFixed(0)}</span>
            <span>🛍 {calc.shoppingCo2.toFixed(0)}</span>
          </div>
          <div
            style={{
              padding: "12px 24px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.18)",
              fontWeight: 700,
            }}
          >
            Discover yours → greensteps.app
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

