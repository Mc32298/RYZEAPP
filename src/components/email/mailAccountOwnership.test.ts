import { describe, expect, it } from "vitest";

import type { EmailThread, MailFolder } from "@/types/email";
import {
  isRoutableAccountId,
  resolveEmailOwningAccountId,
  resolveMessageAccountId,
} from "./mailAccountOwnership";

function makeFolder(
  id: string,
  accountId: string,
  overrides: Partial<MailFolder> = {},
): MailFolder {
  return {
    id,
    accountId,
    displayName: "Inbox",
    totalItemCount: 0,
    unreadItemCount: 0,
    ...overrides,
  };
}

function makeEmail(overrides: Partial<EmailThread> = {}): EmailThread {
  return {
    id: "msg-1",
    accountId: "",
    messageId: "msg-1",
    sender: {
      name: "Taylor",
      email: "taylor@test.dev",
      initials: "T",
      color: "#C9A84C",
    },
    subject: "Status update",
    preview: "Preview",
    body: "<p>Preview</p>",
    timestamp: new Date("2026-05-13T10:00:00Z"),
    isRead: true,
    isStarred: false,
    folder: "folder-1",
    folderId: "folder-1",
    labels: [],
    threadCount: 1,
    hasAttachment: false,
    attachments: [],
    to: ["mathias@test.dev"],
    ...overrides,
  };
}

describe("isRoutableAccountId", () => {
  it("accepts provider-backed account ids and rejects disconnected placeholders", () => {
    expect(isRoutableAccountId("google-user_123")).toBe(true);
    expect(isRoutableAccountId("ms-user_123")).toBe(true);
    expect(isRoutableAccountId("imap-user_example.com")).toBe(true);
    expect(isRoutableAccountId("disconnected")).toBe(false);
    expect(isRoutableAccountId("")).toBe(false);
  });
});

describe("resolveMessageAccountId", () => {
  it("prefers the folder owner account id when available", () => {
    expect(
      resolveMessageAccountId({
        folderAccountId: "google-folder-owner",
        messageAccountId: "google-original",
      }),
    ).toBe("google-folder-owner");
  });

  it("falls back to the existing message account id when folder ownership is missing", () => {
    expect(
      resolveMessageAccountId({
        folderAccountId: "",
        messageAccountId: "google-original",
      }),
    ).toBe("google-original");
  });
});

describe("resolveEmailOwningAccountId", () => {
  it("uses folder ownership when the email lost its account id", () => {
    const email = makeEmail({
      accountId: "",
      folderId: "google-folder",
      folder: "google-folder",
    });

    expect(
      resolveEmailOwningAccountId({
        email,
        mailFolders: [makeFolder("google-folder", "google-restored")],
        currentAccountId: "disconnected",
      }),
    ).toBe("google-restored");
  });

  it("falls back to the current account only when it is routable", () => {
    const email = makeEmail({
      accountId: "",
      folderId: "missing-folder",
      folder: "missing-folder",
    });

    expect(
      resolveEmailOwningAccountId({
        email,
        mailFolders: [],
        currentAccountId: "ms-current",
      }),
    ).toBe("ms-current");

    expect(
      resolveEmailOwningAccountId({
        email,
        mailFolders: [],
        currentAccountId: "disconnected",
      }),
    ).toBe("");
  });
});
