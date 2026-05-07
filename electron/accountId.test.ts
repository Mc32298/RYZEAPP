import { describe, expect, it } from "vitest";

import { isValidAccountId } from "./accountId";

describe("isValidAccountId", () => {
  it("accepts microsoft account ids", () => {
    expect(isValidAccountId("ms-user_123")).toBe(true);
  });

  it("accepts google account ids", () => {
    expect(isValidAccountId("google-109876543210987654321")).toBe(true);
  });

  it("accepts imap account ids", () => {
    expect(isValidAccountId("imap-user_example.com")).toBe(true);
  });

  it("rejects unsupported prefixes", () => {
    expect(isValidAccountId("gmail-123")).toBe(false);
  });
});
