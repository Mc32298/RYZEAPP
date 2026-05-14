import { describe, expect, it } from "vitest";
import type { EmailThread, MailFolder } from "@/types/email";
import {
  applyMovedEmailState,
  getNextSelectedEmailIdAfterAction,
  getKnownFolderIdForAccount,
  getMailboxRefreshFolderIds,
} from "./mailboxMutation";

function makeEmail(overrides: Partial<EmailThread> = {}): EmailThread {
  return {
    id: "account-1:inbox:msg-1",
    accountId: "account-1",
    messageId: "msg-1",
    conversationId: "conv-1",
    internetMessageId: "<msg-1@mail.test>",
    inReplyTo: undefined,
    references: [],
    sender: {
      name: "Mara",
      email: "mara@mail.test",
      initials: "M",
      color: "#2563eb",
    },
    subject: "Status",
    preview: "Hello",
    body: "",
    timestamp: new Date("2026-05-04T10:00:00Z"),
    isRead: true,
    isStarred: false,
    folder: "inbox-id",
    folderId: "inbox-id",
    folderLabel: "Inbox",
    labels: [],
    threadCount: 1,
    hasAttachment: false,
    attachments: [],
    to: [],
    cc: [],
    ...overrides,
  };
}

const folders: MailFolder[] = [
  {
    id: "inbox-id",
    accountId: "account-1",
    displayName: "Inbox",
    wellKnownName: "inbox",
    unreadItemCount: 0,
    totalItemCount: 1,
  },
  {
    id: "trash-id",
    accountId: "account-1",
    displayName: "Deleted Items",
    wellKnownName: "deleteditems",
    unreadItemCount: 0,
    totalItemCount: 0,
  },
];

describe("mailboxMutation", () => {
  it("resolves well-known folders to the owning account folder id", () => {
    expect(getKnownFolderIdForAccount(folders, "account-1", "deleteditems")).toBe(
      "trash-id",
    );
  });

  it("updates folder and message id after a server-side move returns a new id", () => {
    expect(
      applyMovedEmailState(makeEmail(), {
        destinationFolderId: "trash-id",
        messageId: "msg-2",
      }),
    ).toMatchObject({
      id: "account-1:trash-id:msg-2",
      messageId: "msg-2",
      folder: "trash-id",
      folderId: "trash-id",
    });
  });

  it("refreshes both source and destination folders after a move", () => {
    expect(getMailboxRefreshFolderIds("inbox-id", "trash-id")).toEqual([
      "inbox-id",
      "trash-id",
    ]);
  });

  it("selects the next visible thread after acting on the current one", () => {
    expect(
      getNextSelectedEmailIdAfterAction(["msg-3", "msg-2", "msg-1"], "msg-2"),
    ).toBe("msg-1");
  });

  it("falls back to previous thread when current is last", () => {
    expect(
      getNextSelectedEmailIdAfterAction(["msg-3", "msg-2", "msg-1"], "msg-1"),
    ).toBe("msg-2");
  });
});
