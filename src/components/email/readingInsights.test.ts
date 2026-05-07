import { describe, expect, it } from "vitest";
import type { EmailThread } from "@/types/email";
import {
  deriveContactContext,
  deriveReadingInsights,
  extractActionItems,
  extractKeyFacts,
  extractUnansweredQuestions,
} from "./readingInsights";

const baseEmail = {
  id: "email-1",
  accountId: "account-1",
  messageId: "message-1",
  sender: {
    name: "Olivia Hart",
    email: "olivia@vendor.test",
    initials: "OH",
    color: "#C9A84C",
  },
  subject: "Invoice 4821 follow-up",
  preview:
    "Can you confirm payment by May 6 and should we hold the shipment until then?",
  body: `
    <p>Hello Mathias,</p>
    <p>Invoice 4821 for $4,200 is still open.</p>
    <p>Can you confirm payment by May 6?</p>
    <p>Should we hold the shipment until then?</p>
  `,
  timestamp: new Date("2026-05-02T09:00:00Z"),
  isRead: false,
  isStarred: false,
  folder: "inbox",
  folderId: "inbox",
  labels: [],
  threadCount: 1,
  hasAttachment: false,
  attachments: [],
  to: ["mathias@ryze.test"],
  cc: [],
} satisfies EmailThread;

describe("extractUnansweredQuestions", () => {
  it("returns explicit question sentences in message order", () => {
    expect(extractUnansweredQuestions(baseEmail)).toEqual([
      "Can you confirm payment by May 6?",
      "Should we hold the shipment until then?",
    ]);
  });
});

describe("extractKeyFacts", () => {
  it("detects invoice references, amounts, and due dates", () => {
    expect(extractKeyFacts(baseEmail)).toEqual(
      expect.objectContaining({
        invoiceRefs: ["4821"],
        amounts: ["$4,200"],
        dates: ["May 6"],
      }),
    );
  });
});

describe("deriveReadingInsights", () => {
  it("prioritizes unanswered questions for question-heavy threads", () => {
    const insight = deriveReadingInsights(baseEmail, []);

    expect(insight.primaryPanel.kind).toBe("questions");
    expect(insight.nextAction.label).toBe("Reply with payment date");
    expect(insight.inlineCue?.kind).toBe("invoice");
  });
});

describe("extractActionItems", () => {
  it("detects actionable follow-ups for dates, invoices, and questions", () => {
    expect(extractActionItems(baseEmail)).toEqual(
      expect.arrayContaining([
        "Confirm timeline before May 6.",
        "Review and respond on invoice 4821.",
        "Validate amount $4,200 before replying.",
        "Reply to 2 open questions.",
      ]),
    );
  });

  it("detects meeting and approval workflows", () => {
    const meetingEmail: EmailThread = {
      ...baseEmail,
      id: "email-2",
      messageId: "message-2",
      subject: "Please approve and schedule a meeting",
      preview: "Need your sign off before we send the calendar invite.",
      body: "<p>Please approve the draft and schedule a Teams meeting.</p>",
    };

    expect(extractActionItems(meetingEmail)).toEqual(
      expect.arrayContaining([
        "Decide whether to accept or propose a meeting time.",
        "Provide approval status or ask for required context.",
      ]),
    );
  });
});

describe("deriveContactContext", () => {
  it("builds trust, history, labels, recent threads, and last-reply summary", () => {
    const myEmail = "mathias@ryze.test";
    const related: EmailThread[] = [
      baseEmail,
      {
        ...baseEmail,
        id: "email-3",
        messageId: "message-3",
        subject: "Second thread subject",
        timestamp: new Date("2026-05-03T10:00:00Z"),
        labels: [{ id: "l1", accountId: "account-1", name: "Finance", color: "#A8C7A2", createdAt: "", updatedAt: "" }],
      },
      {
        ...baseEmail,
        id: "email-4",
        messageId: "message-4",
        sender: {
          ...baseEmail.sender,
          email: myEmail,
        },
        to: [baseEmail.sender.email],
        subject: "Re: Invoice 4821 follow-up",
        timestamp: new Date("2026-05-04T10:00:00Z"),
      },
    ];

    const context = deriveContactContext(baseEmail, related, myEmail, true);

    expect(context.trustStatus).toBe("trusted");
    expect(context.relationshipStrength).toBe("new");
    expect(context.accountHistorySummary).toContain("2 messages");
    expect(context.lastReplySummary).toContain("Last replied");
    expect(context.knownLabels).toContain("Finance");
    expect(context.recentThreadSubjects).toContain("Second thread subject");
  });
});
