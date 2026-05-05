import { describe, expect, it } from "vitest";
import type { EmailAttachment, EmailThread } from "@/types/email";
import {
  getConversationFolderLabel,
  getConversationMessageState,
  getConversationSenderName,
  isConversationMessageFromCurrentUser,
  renderThreadMessageHtml,
} from "./threadMessageRendering";

function makeAttachment(
  overrides: Partial<EmailAttachment> = {},
): EmailAttachment {
  return {
    id: "attachment-1",
    filename: "image0.jpeg",
    size: 1024,
    contentType: "image/jpeg",
    isInline: false,
    contentId: undefined,
    ...overrides,
  };
}

function makeEmail(overrides: Partial<EmailThread> = {}): EmailThread {
  return {
    id: "email-1",
    accountId: "account-1",
    messageId: "message-1",
    sender: {
      name: "Mathias Nielsen - SPINOP",
      email: "mathias@spinop.com",
      initials: "MN",
      color: "#5F7A52",
    },
    subject: "Billed",
    preview: "Sent from my iPhone",
    body: "<p>Sent from my iPhone</p>",
    timestamp: new Date("2026-05-02T20:22:00Z"),
    isRead: true,
    isStarred: false,
    folder: "sent",
    folderId: "sent",
    folderLabel: "Sent",
    labels: [],
    threadCount: 1,
    hasAttachment: false,
    attachments: [],
    to: ["mathias@spinop.com"],
    cc: [],
    ...overrides,
  };
}

describe("getConversationSenderName", () => {
  it("shows You for self-sent messages with opaque sender names", () => {
    const email = makeEmail({
      sender: {
        name: "AQMKA0G2ZW12NTDILTUWYWUTNGFMZC04NTCXLWQ1YTFL0DBMNVWYYGAUAAADZTPA3JY49UC8QIAJ_DSBUWEABBPPBLAEC6WY7A8JFCQCUWAAAGE",
        email: "mathias@spinop.com",
        initials: "MN",
        color: "#5F7A52",
      },
    });

    expect(getConversationSenderName(email, "mathias@spinop.com")).toBe("You");
  });

  it("shows You for sent-folder messages with opaque sender names even when the account email differs", () => {
    const email = makeEmail({
      folder: "sentitems",
      folderLabel: "Sent",
      sender: {
        name: "AQMKA0G2ZW12NTDILTUWYWUTNGFMZC04NTCXLWQ1YTFL0DBMNVWYYGAUAAADZTPA3JY49UC8QIAJ_DSBUWEABBPPBLAEC6WY7A8JFCQCUWAAAGE",
        email: "alias@spinop.com",
        initials: "MN",
        color: "#5F7A52",
      },
    });

    expect(getConversationSenderName(email, "mathias@spinop.com")).toBe("You");
  });

  it("keeps a normal sender display name", () => {
    const email = makeEmail();

    expect(getConversationSenderName(email, "mathias@spinop.com")).toBe(
      "Mathias Nielsen - SPINOP",
    );
  });
});

describe("isConversationMessageFromCurrentUser", () => {
  it("uses the current account email to classify sent messages", () => {
    expect(
      isConversationMessageFromCurrentUser(
        makeEmail({
          sender: {
            name: "Mathias",
            email: "mathias@spinop.com",
            initials: "M",
            color: "#5F7A52",
          },
        }),
        "mathias@spinop.com",
      ),
    ).toBe(true);
  });

  it("treats sent-folder messages with opaque sender names as sent by the user", () => {
    expect(
      isConversationMessageFromCurrentUser(
        makeEmail({
          folder: "sentitems",
          folderLabel: "Sent",
          sender: {
            name: "AQMKA0G2ZW12NTDILTUWYWUTNGFMZC04NTCXLWQ1YTFL0DBMNVWYYGAUAAADZTPA3JY49UC8QIAJ_DSBUWEABBPPBLAEC6WY7A8JFCQCUWAAAGE",
            email: "alias@spinop.com",
            initials: "MN",
            color: "#5F7A52",
          },
        }),
        "mathias@spinop.com",
      ),
    ).toBe(true);
  });
});

describe("getConversationMessageState", () => {
  it("labels sent messages with a quiet sent state", () => {
    expect(
      getConversationMessageState(
        makeEmail({
          folder: "sent",
          folderLabel: "Sent",
          sender: {
            name: "Mathias",
            email: "mathias@spinop.com",
            initials: "M",
            color: "#5F7A52",
          },
        }),
        "mathias@spinop.com",
      ),
    ).toBe("Sent");
  });

  it("labels received messages as replies", () => {
    expect(getConversationMessageState(makeEmail(), "other@spinop.com")).toBe(
      "Reply",
    );
  });
});

describe("renderThreadMessageHtml", () => {
  it("replaces unresolved cid images with inline attachment placeholders", () => {
    const html = `
      <div>
        <p>Sent from my iPhone</p>
        <img src="cid:image0@cid" alt="image0.jpeg" />
        <img src="cid:image1@cid" alt="image1.jpeg" />
      </div>
    `;

    const rendered = renderThreadMessageHtml(
      html,
      false,
      [
        makeAttachment({
          id: "inline-1",
          filename: "image0.jpeg",
          isInline: true,
          contentId: "image0@cid",
        }),
        makeAttachment({
          id: "inline-2",
          filename: "image1.jpeg",
          isInline: true,
          contentId: "image1@cid",
        }),
      ],
    );

    expect(rendered).toContain("Inline image attachment");
    expect(rendered).toContain("image0.jpeg");
    expect(rendered).toContain("image1.jpeg");
    expect(rendered).not.toContain('src="cid:image0@cid"');
    expect(rendered).not.toContain('src="cid:image1@cid"');
  });
});

describe("getConversationFolderLabel", () => {
  it("normalizes well-known sent folder ids", () => {
    const email = makeEmail({
      folder: "sentitems",
      folderLabel: "sentitems",
    });

    expect(getConversationFolderLabel(email)).toBe("Sent");
  });

  it("hides opaque folder tokens", () => {
    const email = makeEmail({
      folder: "AQMKADG2ZW12NTDILTUWYWUTNGFMZC04NTCXLWQ1YTFL0DBMNVWYYGAUAAADZTPA3JY49UC8QIAJ_DSBUWEABBPPBLXEE6UWY7A8JFCQCUWAAAGE",
      folderLabel:
        "AQMKADG2ZW12NTDILTUWYWUTNGFMZC04NTCXLWQ1YTFL0DBMNVWYYGAUAAADZTPA3JY49UC8QIAJ_DSBUWEABBPPBLXEE6UWY7A8JFCQCUWAAAGE",
    });

    expect(getConversationFolderLabel(email)).toBe("");
  });
});
