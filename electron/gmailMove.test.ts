import { describe, expect, it } from "vitest";

import { buildGmailMoveLabelMutation } from "./gmailMove";

describe("buildGmailMoveLabelMutation", () => {
  it("moves to trash without removing trash in the same request", () => {
    expect(buildGmailMoveLabelMutation("TRASH")).toEqual({
      addLabelIds: ["TRASH"],
      removeLabelIds: ["INBOX", "SPAM"],
    });
  });

  it("archives by removing inbox only", () => {
    expect(buildGmailMoveLabelMutation("ARCHIVE")).toEqual({
      addLabelIds: [],
      removeLabelIds: ["INBOX"],
    });
  });

  it("moves to inbox without removing inbox in the same request", () => {
    expect(buildGmailMoveLabelMutation("INBOX")).toEqual({
      addLabelIds: ["INBOX"],
      removeLabelIds: ["TRASH", "SPAM"],
    });
  });
});
