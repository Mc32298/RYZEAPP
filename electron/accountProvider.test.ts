import { describe, expect, it } from "vitest";

import { getAccountProviderKind } from "./accountProvider";

describe("getAccountProviderKind", () => {
  it("detects Microsoft account ids", () => {
    expect(getAccountProviderKind("ms-123")).toBe("microsoft");
  });

  it("detects Google account ids", () => {
    expect(getAccountProviderKind("google-123")).toBe("google");
  });

  it("detects IMAP account ids", () => {
    expect(getAccountProviderKind("imap-user_example.com")).toBe("imap");
  });

  it("rejects unsupported account ids", () => {
    expect(() => getAccountProviderKind("other-123")).toThrow(
      "Unsupported account provider for ID: other-123",
    );
  });
});
