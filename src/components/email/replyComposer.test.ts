import { describe, expect, it } from "vitest";
import type { EmailThread } from "@/types/email";
import {
  buildInlineReplyHtml,
  buildReplySubject,
  getReplyRecipients,
} from "./replyComposer";

function makeEmail(overrides: Partial<EmailThread> = {}): EmailThread {
  return {
    id: "msg-1",
    accountId: "account-1",
    messageId: "msg-1",
    conversationId: "conv-1",
    internetMessageId: "<msg-1@mail.test>",
    inReplyTo: undefined,
    references: [],
    sender: {
      name: "Mara Klein",
      email: "mara@mail.test",
      initials: "MK",
      color: "#2563eb",
    },
    subject: "Status check",
    preview: "Can you confirm?",
    body: "<p>Can you confirm?</p>",
    timestamp: new Date("2026-05-04T10:30:00Z"),
    isRead: true,
    isStarred: false,
    folder: "inbox",
    folderId: "inbox",
    folderLabel: "Inbox",
    labels: [],
    threadCount: 1,
    hasAttachment: false,
    attachments: [],
    to: ["mathias@mail.test"],
    cc: [],
    ...overrides,
  };
}

describe("replyComposer", () => {
  it("builds direct reply recipients without including the current user", () => {
    const email = makeEmail({
      sender: {
        name: "Mathias",
        email: "mathias@mail.test",
        initials: "M",
        color: "#2563eb",
      },
      to: ["mara@mail.test", "mathias@mail.test"],
    });

    expect(getReplyRecipients(email, "mathias@mail.test")).toBe(
      "mara@mail.test",
    );
  });

  it("keeps reply subjects from gaining duplicate prefixes", () => {
    expect(buildReplySubject(makeEmail({ subject: "Status check" }))).toBe(
      "Re: Status check",
    );
    expect(buildReplySubject(makeEmail({ subject: "Re: Status check" }))).toBe(
      "Re: Status check",
    );
  });

  it("builds inline reply html from typed text, signature, and the quoted source", () => {
    const html = buildInlineReplyHtml({
      bodyText: "Looks good\nSending now.",
      sourceEmail: makeEmail(),
      signature: "Mathias",
    });

    expect(html).toContain("Looks good<br/>Sending now.");
    expect(html).toContain("Mathias");
    expect(html).toContain("reply-quote");
    expect(html).toContain("Mara Klein");
  });
});
