import { describe, expect, it } from "vitest";
import type { EmailThread } from "@/types/email";
import { collectThreadAttachments } from "./readingAttachments";

function makeEmail(
  id: string,
  overrides: Partial<EmailThread> = {},
): EmailThread {
  return {
    id,
    accountId: "account-1",
    messageId: id,
    conversationId: "conv-1",
    internetMessageId: `<${id}@mail.test>`,
    inReplyTo: undefined,
    references: [],
    sender: {
      name: "Taylor",
      email: "taylor@mail.test",
      initials: "T",
      color: "#C9A84C",
    },
    subject: "Re: Hiring update",
    preview: "Latest update",
    body: "<p>Latest update</p>",
    timestamp: new Date("2026-05-03T10:00:00Z"),
    isRead: true,
    isStarred: false,
    folder: "inbox",
    folderId: "inbox",
    folderLabel: "Inbox",
    labels: [],
    threadCount: 1,
    hasAttachment: false,
    attachments: [],
    to: ["mathias@test.dev"],
    cc: [],
    ...overrides,
  };
}

describe("collectThreadAttachments", () => {
  it("collects non-inline attachments across the visible thread in newest-first order", () => {
    const newest = makeEmail("msg-2", {
      timestamp: new Date("2026-05-03T11:00:00Z"),
      attachments: [
        {
          id: "att-2",
          filename: "quote.pdf",
          size: 1200,
          contentType: "application/pdf",
          isInline: false,
        },
      ],
    });
    const older = makeEmail("msg-1", {
      timestamp: new Date("2026-05-03T09:00:00Z"),
      attachments: [
        {
          id: "att-1",
          filename: "brief.docx",
          size: 800,
          contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          isInline: false,
        },
        {
          id: "inline-1",
          filename: "logo.png",
          size: 500,
          contentType: "image/png",
          isInline: true,
        },
      ],
    });

    const attachments = collectThreadAttachments([older, newest]);

    expect(attachments.map((item) => item.filename)).toEqual([
      "quote.pdf",
      "brief.docx",
    ]);
    expect(attachments.map((item) => item.messageId)).toEqual([
      "msg-2",
      "msg-1",
    ]);
  });
});
