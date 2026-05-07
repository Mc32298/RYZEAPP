import { describe, expect, it } from "vitest";

import {
  buildImapFolderRows,
  mapImapMessageToLocalMessage,
  normalizeImapMailboxPath,
} from "./imapSync";

describe("normalizeImapMailboxPath", () => {
  it("preserves INBOX while normalizing provider-specific separators", () => {
    expect(normalizeImapMailboxPath("INBOX/Clients/Acme")).toBe(
      "INBOX/Clients/Acme",
    );
    expect(normalizeImapMailboxPath("Archive.2026")).toBe("Archive/2026");
  });
});

describe("buildImapFolderRows", () => {
  it("maps IMAP list output into local folder rows", () => {
    expect(
      buildImapFolderRows("imap-user_example.com", [
        {
          path: "INBOX",
          name: "INBOX",
          delimiter: "/",
          flags: new Set(["\\HasNoChildren"]),
          listed: true,
          subscribed: true,
        },
        {
          path: "Sent",
          name: "Sent",
          delimiter: "/",
          specialUse: "\\Sent",
          flags: new Set(["\\Sent"]),
          listed: true,
          subscribed: true,
        },
      ]),
    ).toEqual([
      {
        id: "INBOX",
        accountId: "imap-user_example.com",
        displayName: "Inbox",
        parentFolderId: null,
        wellKnownName: "inbox",
        totalItemCount: 0,
        unreadItemCount: 0,
        depth: 0,
        path: "INBOX",
      },
      {
        id: "Sent",
        accountId: "imap-user_example.com",
        displayName: "Sent",
        parentFolderId: null,
        wellKnownName: "sentitems",
        totalItemCount: 0,
        unreadItemCount: 0,
        depth: 0,
        path: "Sent",
      },
    ]);
  });
});

describe("mapImapMessageToLocalMessage", () => {
  it("maps an IMAP envelope into the existing local email shape", () => {
    const mapped = mapImapMessageToLocalMessage({
      accountId: "imap-user_example.com",
      folderId: "INBOX",
      uid: 42,
      flags: new Set(["\\Seen"]),
      envelope: {
        subject: "Project update",
        date: new Date("2026-05-07T10:00:00.000Z"),
        messageId: "<message-42@example.com>",
        from: [{ name: "Alex Doe", address: "alex@example.com" }],
        to: [{ name: "User", address: "user@example.com" }],
        cc: [{ address: "ops@example.com" }],
      },
      source: "Plain body text for preview.",
    });

    expect(mapped).toMatchObject({
      id: "imap-user_example.com:INBOX:42",
      accountId: "imap-user_example.com",
      folder: "INBOX",
      subject: "Project update",
      bodyPreview: "Plain body text for preview.",
      bodyContentType: "text",
      bodyContent: "Plain body text for preview.",
      receivedDateTime: "2026-05-07T10:00:00.000Z",
      isRead: 1,
      hasAttachments: 0,
      isStarred: 0,
      fromName: "Alex Doe",
      fromAddress: "alex@example.com",
      internetMessageId: "<message-42@example.com>",
    });
    expect(JSON.parse(mapped.toRecipients)).toEqual([
      { emailAddress: { name: "User", address: "user@example.com" } },
    ]);
  });
});
