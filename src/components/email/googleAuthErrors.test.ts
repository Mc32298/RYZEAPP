import { describe, expect, it } from "vitest";

import { formatGoogleConnectError } from "./googleAuthErrors";

describe("formatGoogleConnectError", () => {
  it("explains likely Advanced Protection blocks when the oauth callback times out", () => {
    expect(
      formatGoogleConnectError(
        new Error("Timed out waiting for Google sign-in callback"),
      ),
    ).toContain("Advanced Protection");
  });

  it("explains policy_enforced errors directly", () => {
    expect(
      formatGoogleConnectError(new Error("Error 400: policy_enforced")),
    ).toContain("policy_enforced");
  });

  it("preserves unrelated Google sign-in failures", () => {
    expect(formatGoogleConnectError(new Error("socket hang up"))).toBe(
      "socket hang up",
    );
  });
});
