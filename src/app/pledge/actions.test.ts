import { describe, expect, it, vi, beforeEach } from "vitest";

// ---- Mocks ------------------------------------------------------------------
// Server-action collaborators are mocked so we test the decision logic
// (verdict → approved flag, report → auto-hide) in isolation. The in-memory
// rate limiter is the real module, reset between tests.
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers({ "x-real-ip": "5.5.5.5" })),
}));
vi.mock("@/lib/moderation", () => ({ moderatePledge: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    pledge: { create: vi.fn(), update: vi.fn() },
    auditLog: { create: vi.fn() },
  },
}));

import { createPledge, reportPledge } from "./actions";
import { moderatePledge } from "@/lib/moderation";
import { prisma } from "@/lib/prisma";

const mockModerate = vi.mocked(moderatePledge);
const mockPrisma = vi.mocked(prisma, true);

const validInput = {
  name: "Sam Green",
  city: "Pune",
  message: "I will bike to work every day this month",
  category: "transport" as const,
};

beforeEach(() => {
  vi.clearAllMocks();
  // The limiter captures its store by reference at import — clear it in place
  // rather than reassigning a new Map (which the module would never see).
  (globalThis.__greensteps_rl_store as Map<string, unknown> | undefined)?.clear();
  mockPrisma.auditLog.create.mockResolvedValue({} as never);
});

describe("createPledge", () => {
  it("rejects invalid input before touching moderation or the DB", async () => {
    const r = await createPledge({ ...validInput, name: "a" });
    expect(r).toEqual({ ok: false, error: "Invalid input" });
    expect(mockModerate).not.toHaveBeenCalled();
    expect(mockPrisma.pledge.create).not.toHaveBeenCalled();
  });

  it("blocks a hard-rejected pledge and never stores it", async () => {
    mockModerate.mockResolvedValue({ verdict: "block", reason: "ai_blocked" });
    const r = await createPledge(validInput);
    expect(r.ok).toBe(false);
    expect(mockPrisma.pledge.create).not.toHaveBeenCalled();
    expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ action: "pledge.blocked" }) }),
    );
  });

  it("publishes an allowed pledge immediately (approved=true)", async () => {
    mockModerate.mockResolvedValue({ verdict: "allow" });
    mockPrisma.pledge.create.mockResolvedValue({ id: "p1" } as never);
    const r = await createPledge(validInput);
    expect(r).toEqual({ ok: true, status: "published" });
    expect(mockPrisma.pledge.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ approved: true }) }),
    );
  });

  it("holds a borderline pledge hidden for review (approved=false)", async () => {
    mockModerate.mockResolvedValue({ verdict: "hold", reason: "ai_review" });
    mockPrisma.pledge.create.mockResolvedValue({ id: "p2" } as never);
    const r = await createPledge(validInput);
    expect(r).toEqual({ ok: true, status: "pending" });
    expect(mockPrisma.pledge.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ approved: false }) }),
    );
  });

  it("returns a server error when the DB write fails", async () => {
    mockModerate.mockResolvedValue({ verdict: "allow" });
    mockPrisma.pledge.create.mockRejectedValue(new Error("db down"));
    const r = await createPledge(validInput);
    expect(r).toEqual({ ok: false, error: "Server error" });
  });

  it("rate-limits after the configured number of pledges per minute", async () => {
    mockModerate.mockResolvedValue({ verdict: "allow" });
    mockPrisma.pledge.create.mockResolvedValue({ id: "p" } as never);
    // RATE_LIMITS.pledge = 3/min from one IP.
    for (let i = 0; i < 3; i++) {
      expect((await createPledge(validInput)).ok).toBe(true);
    }
    const blocked = await createPledge(validInput);
    expect(blocked.ok).toBe(false);
    expect(blocked).toMatchObject({ ok: false });
  });
});

describe("reportPledge", () => {
  it("increments without hiding below the threshold", async () => {
    mockPrisma.pledge.update.mockResolvedValueOnce({
      id: "p1",
      reportCount: 1,
      approved: true,
    } as never);
    const r = await reportPledge("p1");
    expect(r).toEqual({ ok: true });
    // Only the increment update — no second (hide) update.
    expect(mockPrisma.pledge.update).toHaveBeenCalledTimes(1);
  });

  it("auto-hides once the report threshold is crossed", async () => {
    mockPrisma.pledge.update
      .mockResolvedValueOnce({ id: "p1", reportCount: 2, approved: true } as never)
      .mockResolvedValueOnce({ id: "p1" } as never);
    const r = await reportPledge("p1");
    expect(r).toEqual({ ok: true });
    expect(mockPrisma.pledge.update).toHaveBeenCalledTimes(2);
    expect(mockPrisma.pledge.update).toHaveBeenLastCalledWith(
      expect.objectContaining({ data: { approved: false } }),
    );
  });

  it("returns ok:false when the update throws", async () => {
    mockPrisma.pledge.update.mockRejectedValue(new Error("db down"));
    expect(await reportPledge("p1")).toEqual({ ok: false });
  });
});
