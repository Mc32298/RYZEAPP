import { describe, expect, it } from "vitest";
import type { EmailThread } from "@/types/email";
import { classifySmartCategory } from "./smartCategories";

const baseEmail = {
  id: "email-1",
  accountId: "account-1",
  messageId: "message-1",
  sender: {
    name: "Sender",
    email: "sender@company.test",
    initials: "SE",
    color: "#C9A84C",
  },
  subject: "Subject",
  preview: "",
  body: "",
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

describe("classifySmartCategory", () => {
  it("detects security emails", () => {
    expect(
      classifySmartCategory({
        ...baseEmail,
        subject: "Security alert: verify new sign-in",
      }),
    ).toBe("Security");
  });

  it("detects calendar emails", () => {
    expect(
      classifySmartCategory({
        ...baseEmail,
        subject: "Calendar invite: Team meeting",
      }),
    ).toBe("Calendar");
  });

  it("detects receipts", () => {
    expect(
      classifySmartCategory({
        ...baseEmail,
        subject: "Invoice 4821",
        preview: "Payment receipt attached",
      }),
    ).toBe("Receipts");
  });

  it("detects newsletters", () => {
    expect(
      classifySmartCategory({
        ...baseEmail,
        subject: "Weekly digest",
        preview: "Unsubscribe at any time",
      }),
    ).toBe("Newsletters");
  });

  it("detects important messages", () => {
    expect(
      classifySmartCategory({
        ...baseEmail,
        subject: "Urgent: action required today",
      }),
    ).toBe("Important");
  });

  it("detects personal sender domains", () => {
    expect(
      classifySmartCategory({
        ...baseEmail,
        sender: {
          ...baseEmail.sender,
          email: "friend@gmail.com",
        },
      }),
    ).toBe("Personal");
  });
});

