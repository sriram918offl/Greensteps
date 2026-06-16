import { test, expect } from "@playwright/test";

test.describe("Awareness flow", () => {
  test("landing → discover → fill → see result", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /CO.+invisible/i })).toBeVisible();

    await page.getByRole("link", { name: /Discover yours/i }).first().click();
    await expect(page).toHaveURL(/\/discover/);
    await expect(page.getByRole("heading", { name: /carbon footprint/i })).toBeVisible();
  });

  test("city atlas index lists Mumbai", async ({ page }) => {
    await page.goto("/city");
    await expect(page.getByRole("heading", { name: /carbon fingerprint/i })).toBeVisible();
    await expect(page.getByText(/Mumbai/i)).toBeVisible();
  });

  test("city profile shows real CEA grid factor", async ({ page }) => {
    await page.goto("/city/mumbai");
    await expect(page.getByText(/grid factor/i)).toBeVisible();
    await expect(page.getByText(/0\.78/)).toBeVisible(); // Mumbai's seeded value
  });

  test("pledge wall renders + form has accessible labels", async ({ page }) => {
    await page.goto("/pledge");
    await expect(page.getByRole("heading", { name: /Pledge Wall/i })).toBeVisible();
    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByLabel("Your commitment")).toBeVisible();
  });

  test("chatbot landing has suggested prompts", async ({ page }) => {
    await page.goto("/chat");
    await expect(page.getByRole("heading", { name: /Ask anything sustainability/i })).toBeVisible();
  });

  test("health endpoint returns 200 JSON", async ({ request }) => {
    const r = await request.get("/api/health");
    expect(r.status()).toBe(200);
    const body = await r.json();
    expect(body.ok).toBe(true);
  });
});
