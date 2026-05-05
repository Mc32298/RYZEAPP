import { describe, expect, it } from "vitest";

import { resolveManualSyncProvider } from "./mailSyncRouting";

describe("resolveManualSyncProvider", () => {
  it("uses gmail sync for google accounts", () => {
    expect(resolveManualSyncProvider("google")).toBe("google");
  });

  it("uses microsoft sync for microsoft accounts", () => {
    expect(resolveManualSyncProvider("microsoft")).toBe("microsoft");
  });

  it("falls back to microsoft for unknown providers", () => {
    expect(resolveManualSyncProvider("local")).toBe("microsoft");
  });
});
