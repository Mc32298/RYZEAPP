import { describe, expect, it } from "vitest";
import type { EmailThread } from "@/types/email";
import {
  createInitialReadingPaneViewState,
  reconcileReadingPaneViewState,
  type ReadingPaneViewState,
} from "./readingPaneState";

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
    timestamp: new Date("2026-05-02T10:00:00Z"),
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

describe("reconcileReadingPaneViewState", () => {
  it("initializes baseline state when switching to a new thread", () => {
    const next = reconcileReadingPaneViewState(
      createInitialReadingPaneViewState(),
      {
        threadAnchorId: "msg-3",
        messages: [
          makeEmail("msg-3", { timestamp: new Date("2026-05-03T10:00:00Z") }),
          makeEmail("msg-2", { timestamp: new Date("2026-05-02T10:00:00Z") }),
        ],
      },
    );

    expect(next.activeMessageId).toBe("msg-3");
    expect(next.expandedMessageIds).toEqual(["msg-3"]);
    expect(next.quotedOpenById).toEqual({});
  });

  it("keeps active message when the same thread refreshes", () => {
    const previous: ReadingPaneViewState = {
      threadAnchorId: "msg-3",
      activeMessageId: "msg-2",
      expandedMessageIds: ["msg-2"],
      quotedOpenById: { "msg-2": true },
    };

    const next = reconcileReadingPaneViewState(previous, {
      threadAnchorId: "msg-3",
      messages: [
        makeEmail("msg-3", { timestamp: new Date("2026-05-03T10:00:00Z") }),
        makeEmail("msg-2", { timestamp: new Date("2026-05-02T10:00:00Z") }),
        makeEmail("msg-4", { timestamp: new Date("2026-05-04T10:00:00Z") }),
      ],
    });

    expect(next.activeMessageId).toBe("msg-2");
    expect(next.expandedMessageIds).toEqual(["msg-2"]);
    expect(next.quotedOpenById).toEqual({ "msg-2": true });
  });

  it("falls back to newest message if active message disappears", () => {
    const previous: ReadingPaneViewState = {
      threadAnchorId: "msg-3",
      activeMessageId: "msg-2",
      expandedMessageIds: ["msg-2"],
      quotedOpenById: { "msg-2": true },
    };

    const next = reconcileReadingPaneViewState(previous, {
      threadAnchorId: "msg-3",
      messages: [makeEmail("msg-3", { timestamp: new Date("2026-05-03T10:00:00Z") })],
    });

    expect(next.activeMessageId).toBe("msg-3");
    expect(next.expandedMessageIds).toEqual(["msg-3"]);
    expect(next.quotedOpenById).toEqual({});
  });
});
