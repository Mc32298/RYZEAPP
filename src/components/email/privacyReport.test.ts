import { describe, expect, it } from "vitest";

import type { EmailThread } from "@/types/email";
import { derivePrivacyReport } from "./privacyReport";

function makeEmail(partial: Partial<EmailThread>): EmailThread {
  const now = new Date("2026-01-01T10:00:00.000Z");
  return {
    id: partial.id || "e1",
    accountId: partial.accountId || "ms-1",
    messageId: partial.messageId || "m1",
    sender: partial.sender || {
      name: "Sender",
      email: "sender@example.com",
      initials: "S",
      color: "#A8C7A2",
    },
    subject: partial.subject || "Subject",
    preview: partial.preview || "",
    body: partial.body || "",
    timestamp: partial.timestamp || now,
    isRead: partial.isRead ?? false,
    isStarred: partial.isStarred ?? false,
    folder: partial.folder || "inbox",
    labels: partial.labels || [],
    threadCount: partial.threadCount || 1,
    hasAttachment: partial.hasAttachment ?? false,
    to: partial.to || [],
    cc: partial.cc || [],
  };
}

describe("derivePrivacyReport", () => {
  it("counts remote images and tracker-like pixels", () => {
    const emails = [
      makeEmail({
        body: '<img src="https://tracker.example/pixel.png" width="1" height="1" />',
      }),
      makeEmail({
        id: "e2",
        body: '<img src="https://cdn.example/image.png" />',
      }),
    ];

    const report = derivePrivacyReport({
      emails,
      blockRemoteImages: true,
      trustedSenderEmails: [],
    });

    expect(report.remoteImagesBlocked).toBe(2);
    expect(report.blockedTrackers).toBe(1);
  });

  it("counts suspicious links and unsafe content markers", () => {
    const emails = [
      makeEmail({
        body: '<a href="http://bad.example">bad</a><script>alert(1)</script>',
      }),
      makeEmail({
        id: "e2",
        body: '<a href="https://xn--phishing-8sb.example">idn</a>',
      }),
    ];

    const report = derivePrivacyReport({
      emails,
      blockRemoteImages: false,
      trustedSenderEmails: ["friend@example.com"],
    });

    expect(report.suspiciousLinks).toBe(2);
    expect(report.unsafeContentRemoved).toBe(1);
    expect(report.trustedSenders).toBe(1);
  });
});
