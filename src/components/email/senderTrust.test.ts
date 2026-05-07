import { describe, expect, it } from "vitest";

import {
  defaultSenderTrustPolicy,
  getSenderPolicy,
  updateSenderPolicy,
} from "./senderTrust";

describe("senderTrust helpers", () => {
  it("returns default policy for unknown sender", () => {
    expect(getSenderPolicy({}, "user@example.com")).toEqual(
      defaultSenderTrustPolicy(),
    );
  });

  it("updates and normalizes policy by sender email", () => {
    const next = updateSenderPolicy({}, " User@Example.com ", {
      muted: true,
      alwaysConfirmLinks: true,
    });

    expect(next["user@example.com"]).toMatchObject({
      muted: true,
      alwaysConfirmLinks: true,
      blocked: false,
    });
  });
});
