import fs from "node:fs";

// Tiny .env parser — avoids the dotenv dep
const env = Object.fromEntries(
  fs.readFileSync(".env", "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    }),
);

const key = env.GOOGLE_AI_API_KEY ?? env.GEMINI_API_KEY;
if (!key) { console.error("No key in .env"); process.exit(1); }
console.log("Key length:", key.length, "starts:", key.slice(0, 6));

const { GoogleGenerativeAI } = await import("@google/generative-ai");
const c = new GoogleGenerativeAI(key);

const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-pro", "gemini-1.5-flash"];
for (const m of models) {
  try {
    const t0 = Date.now();
    const r = await c.getGenerativeModel({ model: m }).generateContent("Say 'ok' in one word.");
    console.log(`OK  ${m} -> "${r.response.text().trim()}" (${Date.now() - t0}ms)`);
  } catch (e) {
    console.log(`ERR ${m} -> ${e.status ?? "?"} ${e.statusText ?? e.message?.slice(0, 140)}`);
  }
}
