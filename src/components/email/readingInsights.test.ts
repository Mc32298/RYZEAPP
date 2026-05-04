import { describe, expect, it } from "vitest";
import type { EmailThread } from "@/types/email";
import {
  deriveReadingInsights,
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
