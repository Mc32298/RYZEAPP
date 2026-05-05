import { describe, expect, it } from "vitest";
import type { EmailThread } from "@/types/email";
import {
  buildConversationThread,
  buildThreadListRows,
  getDefaultExpandedMessageIds,
  getReadingTimelineMessages,
  scrollReadingTimelineToBottom,
  stripQuotedHtml,
  threadRowMatchesFilters,
} from "./threadView";

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

describe("buildConversationThread", () => {
  it("prefers native conversation ids across folders", () => {
    const newest = makeEmail("msg-3", {
      folderLabel: "Inbox",
      timestamp: new Date("2026-05-03T10:00:00Z"),
    });
    const sent = makeEmail("msg-2", {
      folder: "sent",
      folderLabel: "Sent",
      timestamp: new Date("2026-05-02T12:00:00Z"),
    });
    const older = makeEmail("msg-1", {
      folder: "archive",
      folderLabel: "Archive",
      timestamp: new Date("2026-05-01T08:00:00Z"),
    });

    const thread = buildConversationThread(newest, [older, sent, newest]);

    expect(thread.messages.map((item) => item.id)).toEqual([
      "msg-3",
      "msg-2",
      "msg-1",
    ]);
  });

  it("falls back to normalized subject plus participants when conversation ids are absent", () => {
    const selected = makeEmail("msg-a", {
      conversationId: undefined,
      subject: "Re: Product sync",
      sender: {
        name: "Ava",
        email: "ava@test.dev",
        initials: "A",
        color: "#C9A84C",
      },
      to: ["mathias@test.dev"],
    });
    const sibling = makeEmail("msg-b", {
      conversationId: undefined,
      subject: "Product sync",
      sender: {
        name: "Mathias",
        email: "mathias@test.dev",
        initials: "M",
        color: "#A9793D",
      },
      to: ["ava@test.dev"],
      timestamp: new Date("2026-05-01T09:00:00Z"),
    });
    const unrelated = makeEmail("msg-c", {
      conversationId: undefined,
      subject: "Product sync",
      sender: {
        name: "Jordan",
        email: "jordan@other.dev",
        initials: "J",
        color: "#5F7A52",
      },
      to: ["sam@other.dev"],
    });

    const thread = buildConversationThread(selected, [
      selected,
      sibling,
      unrelated,
    ]);

    expect(thread.messages.map((item) => item.id)).toEqual(["msg-a", "msg-b"]);
  });
});

describe("getDefaultExpandedMessageIds", () => {
  it("opens only the newest message by default", () => {
    const messages = [
      makeEmail("msg-3", { timestamp: new Date("2026-05-03T10:00:00Z") }),
      makeEmail("msg-2", { timestamp: new Date("2026-05-02T10:00:00Z") }),
      makeEmail("msg-1", { timestamp: new Date("2026-05-01T10:00:00Z") }),
    ];

    expect(getDefaultExpandedMessageIds(messages)).toEqual(["msg-3"]);
  });
});

describe("getReadingTimelineMessages", () => {
  it("renders conversation messages oldest first so the newest is at the bottom", () => {
    const newest = makeEmail("msg-3", {
      timestamp: new Date("2026-05-03T10:00:00Z"),
    });
    const middle = makeEmail("msg-2", {
      timestamp: new Date("2026-05-02T10:00:00Z"),
    });
    const oldest = makeEmail("msg-1", {
      timestamp: new Date("2026-05-01T10:00:00Z"),
    });

    expect(
      getReadingTimelineMessages([newest, oldest, middle]).map(
        (item) => item.id,
      ),
    ).toEqual(["msg-1", "msg-2", "msg-3"]);
  });
});

describe("scrollReadingTimelineToBottom", () => {
  it("moves the scroll container to the newest message at the bottom", () => {
    const scrollContainer = {
      scrollTop: 0,
      scrollHeight: 1400,
    };

    scrollReadingTimelineToBottom(scrollContainer);

    expect(scrollContainer.scrollTop).toBe(1400);
  });
});

describe("stripQuotedHtml", () => {
  it("removes common quoted reply blocks from the visible message body", () => {
    const html = `
      <div>
        <p>Latest reply</p>
        <blockquote><p>Older quoted text</p></blockquote>
      </div>
    `;

    expect(stripQuotedHtml(html).visibleHtml).toContain("Latest reply");
    expect(stripQuotedHtml(html).visibleHtml).not.toContain(
      "Older quoted text",
    );
    expect(stripQuotedHtml(html).quotedHtml).toContain("Older quoted text");
  });

  it("removes Gmail quote containers from the visible message body", () => {
    const html = `
      <div>
        <p>Latest reply</p>
        <div class="gmail_quote"><p>Older Gmail quote</p></div>
      </div>
    `;

    expect(stripQuotedHtml(html).visibleHtml).toContain("Latest reply");
    expect(stripQuotedHtml(html).visibleHtml).not.toContain(
      "Older Gmail quote",
    );
    expect(stripQuotedHtml(html).quotedHtml).toContain("Older Gmail quote");
  });

  it("treats Outlook reply headers as the start of quoted content", () => {
    const html = `
      <div>
        <p>Latest reply</p>
        <div id="divRplyFwdMsg">From: Taylor</div>
        <p>Older Outlook quote</p>
      </div>
    `;

    expect(stripQuotedHtml(html).visibleHtml).toContain("Latest reply");
    expect(stripQuotedHtml(html).visibleHtml).not.toContain(
      "Older Outlook quote",
    );
    expect(stripQuotedHtml(html).quotedHtml).toContain("From: Taylor");
  });
});

describe("buildThreadListRows", () => {
  it("collapses messages with the same native conversation id into one row", () => {
    const newest = makeEmail("msg-3", {
      conversationId: "conv-1",
      sender: {
        name: "Jobunderretninger",
        email: "jobs@test.dev",
        initials: "J",
        color: "#C9A84C",
      },
      preview: "Newest update",
      timestamp: new Date("2026-05-03T10:00:00Z"),
      isRead: true,
    });
    const unreadSibling = makeEmail("msg-2", {
      conversationId: "conv-1",
      timestamp: new Date("2026-05-03T09:00:00Z"),
      isRead: false,
      hasAttachment: true,
    });
    const separate = makeEmail("msg-1", {
      conversationId: "conv-2",
      timestamp: new Date("2026-05-02T08:00:00Z"),
    });

    const rows = buildThreadListRows([newest, unreadSibling, separate]);

    expect(rows).toHaveLength(2);
    expect(rows[0].latestMessage.id).toBe("msg-3");
    expect(rows[0].threadCount).toBe(2);
    expect(rows[0].hasUnread).toBe(true);
    expect(rows[0].hasAttachment).toBe(true);
  });

  it("falls back conservatively to normalized subject plus shared participants", () => {
    const selected = makeEmail("msg-a", {
      conversationId: undefined,
      subject: "Re: Product sync",
      sender: {
        name: "Ava",
        email: "ava@test.dev",
        initials: "A",
        color: "#C9A84C",
      },
      to: ["mathias@test.dev"],
      timestamp: new Date("2026-05-03T12:00:00Z"),
    });
    const sibling = makeEmail("msg-b", {
      conversationId: undefined,
      subject: "Product sync",
      sender: {
        name: "Mathias",
        email: "mathias@test.dev",
        initials: "M",
        color: "#A9793D",
      },
      to: ["ava@test.dev"],
      timestamp: new Date("2026-05-03T11:00:00Z"),
    });
    const unrelated = makeEmail("msg-c", {
      conversationId: undefined,
      subject: "Product sync",
      sender: {
        name: "Jordan",
        email: "jordan@other.dev",
        initials: "J",
        color: "#5F7A52",
      },
      to: ["sam@other.dev"],
      timestamp: new Date("2026-05-03T10:00:00Z"),
    });

    const rows = buildThreadListRows([selected, sibling, unrelated]);

    expect(rows).toHaveLength(2);
    expect(rows[0].threadCount).toBe(2);
    expect(rows[1].threadCount).toBe(1);
  });
});

describe("threadRowMatchesFilters", () => {
  it("matches a thread when any message satisfies the text query", () => {
    const row = buildThreadListRows([
      makeEmail("msg-2", {
        conversationId: "conv-1",
        subject: "Hiring update",
        preview: "Nothing special here",
        timestamp: new Date("2026-05-03T10:00:00Z"),
      }),
      makeEmail("msg-1", {
        conversationId: "conv-1",
        subject: "Hiring update",
        preview: "Contains the invoice number INV-42",
        timestamp: new Date("2026-05-03T09:00:00Z"),
      }),
    ])[0];

    expect(
      threadRowMatchesFilters(row, {
        query: "inv-42",
        activeFilters: [],
      }),
    ).toBe(true);
  });

  it("respects unread and attachment filters at the thread level", () => {
    const row = buildThreadListRows([
      makeEmail("msg-2", {
        conversationId: "conv-1",
        timestamp: new Date("2026-05-03T10:00:00Z"),
        isRead: true,
        hasAttachment: false,
      }),
      makeEmail("msg-1", {
        conversationId: "conv-1",
        timestamp: new Date("2026-05-03T09:00:00Z"),
        isRead: false,
        hasAttachment: true,
      }),
    ])[0];

    expect(
      threadRowMatchesFilters(row, {
        query: "",
        activeFilters: ["Unread"],
      }),
    ).toBe(true);
    expect(
      threadRowMatchesFilters(row, {
        query: "",
        activeFilters: ["Has Attachment"],
      }),
    ).toBe(true);
  });
});

describe("buildThreadListRows sort order", () => {
  it("keeps the newest visible message as the row anchor", () => {
    const rows = buildThreadListRows([
      makeEmail("msg-older", {
        conversationId: "conv-1",
        timestamp: new Date("2026-05-03T09:00:00Z"),
      }),
      makeEmail("msg-newest", {
        conversationId: "conv-1",
        timestamp: new Date("2026-05-03T10:00:00Z"),
      }),
    ]);

    expect(rows[0].latestMessage.id).toBe("msg-newest");
    expect(rows[0].messageIds).toEqual(["msg-newest", "msg-older"]);
  });
});
