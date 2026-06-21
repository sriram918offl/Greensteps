import { describe, expect, it, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

// auth() is controlled via a hoisted holder so individual tests can flip the
// signed-in user. Rate limiting runs for real and is reset between tests.
const authState = vi.hoisted(() => ({ userId: "user_test" as string | null }));
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(async () => ({ userId: authState.userId })),
}));

import { POST } from "./route";

beforeEach(() => {
  authState.userId = "user_test";
  // Clear the limiter's captured store in place (see pledge actions test).
  (globalThis.__greensteps_rl_store as Map<string, unknown> | undefined)?.clear();
});

// The handler only reads req.headers (for the rate-limit identifier) and
// req.formData(). A typed stub keeps file size/type exact (no multipart
// serialization round-trip).
function stubReq(form: FormData, ip = "7.7.7.7"): NextRequest {
  return {
    headers: new Headers({ "x-real-ip": ip }),
    formData: async () => form,
  } as unknown as NextRequest;
}

function formWith(blob: Blob): FormData {
  const form = new FormData();
  form.append("bill", blob, "bill.png");
  return form;
}

describe("POST /api/ocr", () => {
  it("401s when the user is not signed in", async () => {
    authState.userId = null;
    const res = await POST(stubReq(new FormData()));
    expect(res.status).toBe(401);
  });

  it("400s when no file is attached", async () => {
    const res = await POST(stubReq(new FormData()));
    expect(res.status).toBe(400);
  });

  it("413s when the file exceeds the size cap", async () => {
    const tooBig = new Blob([new Uint8Array(4 * 1024 * 1024 + 16)], { type: "image/png" });
    const res = await POST(stubReq(formWith(tooBig)));
    expect(res.status).toBe(413);
  });

  it("415s for an unsupported image type", async () => {
    const gif = new Blob([new Uint8Array(32)], { type: "image/gif" });
    const res = await POST(stubReq(formWith(gif)));
    expect(res.status).toBe(415);
  });
});
