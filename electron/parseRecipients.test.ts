import { describe, expect, it } from "vitest";

import { parseRecipients } from "./validation";

describe("parseRecipients", () => {
  it("parses comma-separated plain addresses", () => {
    expect(parseRecipients("a@b.com, c@d.org")).toEqual([
      { emailAddress: { address: "a@b.com" } },
      { emailAddress: { address: "c@d.org" } },
    ]);
  });

  it("parses semicolon-separated addresses (Outlook-style)", () => {
    expect(parseRecipients("a@b.com; c@d.org")).toEqual([
      { emailAddress: { address: "a@b.com" } },
      { emailAddress: { address: "c@d.org" } },
    ]);
  });

  it('extracts the address from Name <email> form', () => {
    expect(
      parseRecipients('"Jane Doe" <jane@example.com>'),
    ).toEqual([{ emailAddress: { address: "jane@example.com" } }]);
  });

  it("throws on invalid tokens", () => {
    expect(() => parseRecipients("not-an-email")).toThrow(/Invalid email/);
  });
});
