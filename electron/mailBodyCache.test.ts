import { describe, expect, it } from "vitest";
import { parseStoredAttachments, shouldUseLocalMessageBody } from "./mailBodyCache";

describe("shouldUseLocalMessageBody", () => {
  it("uses the local body when the message has no attachments", () => {
    expect(
      shouldUseLocalMessageBody({
        bodyContent: "<p>Hello</p>",
        hasAttachments: false,
        attachmentsJson: "[]",
      }),
    ).toBe(true);
  });

  it("does not use the local body when attachments are expected but not cached", () => {
    expect(
      shouldUseLocalMessageBody({
        bodyContent: "<p>Hello</p>",
        hasAttachments: true,
        attachmentsJson: "[]",
      }),
    ).toBe(false);
  });

  it("uses the local body when attachment metadata is already cached", () => {
    expect(
      shouldUseLocalMessageBody({
        bodyContent: "<p>Hello</p>",
        hasAttachments: true,
        attachmentsJson: '[{"id":"att-1"}]',
      }),
    ).toBe(true);
  });
});

describe("parseStoredAttachments", () => {
  it("returns an empty array for malformed json", () => {
    expect(parseStoredAttachments("{")).toEqual([]);
  });
});
