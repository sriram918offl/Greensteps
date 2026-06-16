import { NextResponse } from "next/server";

// Edge runtime — sub-50ms cold starts on Vercel.
export const runtime = "edge";

export async function GET() {
  return NextResponse.json(
    { ok: true, time: new Date().toISOString(), name: "GreenSteps" },
    { headers: { "Cache-Control": "public, max-age=10, s-maxage=10" } },
  );
}
