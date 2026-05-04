import { describe, expect, it } from "vitest";
import type { EmailThread } from "@/types/email";
import {
  buildInlineReplyComment,
  buildInlineReplyHtml,
  buildReplySubject,
  getInlineReplyTargetMessage,
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

  it("falls back to the latest non-self sender in the thread when the active message has no usable recipients", () => {
    const externalMessage = makeEmail({
      id: "msg-1",
      sender: {
        name: "Mara Klein",
        email: "mara@mail.test",
        initials: "MK",
        color: "#2563eb",
      },
      to: ["mathias@mail.test"],
      timestamp: new Date("2026-05-04T10:30:00Z"),
    });
    const selfMessage = makeEmail({
      id: "msg-2",
      sender: {
        name: "Mathias",
        email: "mathias@mail.test",
        initials: "M",
        color: "#2563eb",
      },
      to: ["mathias@mail.test"],
      timestamp: new Date("2026-05-04T10:35:00Z"),
    });

    expect(
      getReplyRecipients(selfMessage, "mathias@mail.test", [
        externalMessage,
        selfMessage,
      ]),
    ).toBe("mara@mail.test");
  });

  it("falls back to non-self thread participants when every sender is the current user", () => {
    const olderSelfMessage = makeEmail({
      id: "msg-1",
      sender: {
        name: "Mathias",
        email: "mathias@mail.test",
        initials: "M",
        color: "#2563eb",
      },
      to: ["mara@mail.test"],
      timestamp: new Date("2026-05-04T10:30:00Z"),
    });
    const latestSelfMessage = makeEmail({
      id: "msg-2",
      sender: {
        name: "Mathias",
        email: "mathias@mail.test",
        initials: "M",
        color: "#2563eb",
      },
      to: ["mathias@mail.test"],
      timestamp: new Date("2026-05-04T10:35:00Z"),
    });

    expect(
      getReplyRecipients(latestSelfMessage, "mathias@mail.test", [
        olderSelfMessage,
        latestSelfMessage,
      ]),
    ).toBe("mara@mail.test");
  });

  it("targets the newest non-self message for inline reply when the latest message is from the current user", () => {
    const externalMessage = makeEmail({
      id: "msg-1",
      sender: {
        name: "Mara Klein",
        email: "mara@mail.test",
        initials: "MK",
        color: "#2563eb",
      },
      timestamp: new Date("2026-05-04T10:30:00Z"),
    });
    const latestSelfMessage = makeEmail({
      id: "msg-2",
      sender: {
        name: "Mathias",
        email: "mathias@mail.test",
        initials: "M",
        color: "#2563eb",
      },
      timestamp: new Date("2026-05-04T10:35:00Z"),
    });

    expect(
      getInlineReplyTargetMessage(
        latestSelfMessage,
        [externalMessage, latestSelfMessage],
        "mathias@mail.test",
      ).id,
    ).toBe("msg-1");
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

  it("builds a plain reply comment for the Graph reply action", () => {
    expect(
      buildInlineReplyComment({
        bodyText: "Looks good",
        signature: "Mathias",
      }),
    ).toBe("Looks good\n\nMathias");
  });
});
