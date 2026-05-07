import { describe, expect, it } from "vitest";

import { deriveSyncHealth, deriveTokenHealth } from "./accountHealth";

describe("deriveTokenHealth", () => {
  it("returns n/a for missing expiry", () => {
    expect(deriveTokenHealth(null)).toBe("n/a");
  });

  it("returns expired for past expiry", () => {
    expect(deriveTokenHealth(Date.now() - 1)).toBe("expired");
  });

  it("returns expiring within 15 minutes", () => {
    expect(deriveTokenHealth(Date.now() + 5 * 60 * 1000)).toBe("expiring");
  });

  it("returns ok for later expiry", () => {
    expect(deriveTokenHealth(Date.now() + 60 * 60 * 1000)).toBe("ok");
  });
});

describe("deriveSyncHealth", () => {
  it("returns idle when account has no messages", () => {
    expect(deriveSyncHealth({ hasMessages: false, tokenHealth: "ok" })).toBe("idle");
  });

  it("returns warning for expiring or expired token", () => {
    expect(
      deriveSyncHealth({ hasMessages: true, tokenHealth: "expiring" }),
    ).toBe("warning");
  });

  it("returns ok for healthy synced account", () => {
    expect(deriveSyncHealth({ hasMessages: true, tokenHealth: "ok" })).toBe("ok");
  });
});
