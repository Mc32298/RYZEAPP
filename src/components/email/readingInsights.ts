import type { EmailThread } from "@/types/email";

export type AiTone =
  | "short"
  | "polite"
  | "firm"
  | "detailed"
  | "decline"
  | "follow-up";

export interface ReadingInsightModel {
  summaryFallback: string;
  nextAction: { label: string; detail: string };
  primaryPanel:
    | { kind: "questions"; items: string[] }
    | { kind: "facts"; items: string[] };
  toneOptions: AiTone[];
  reminderOptions: string[];
  inlineCue:
    | { kind: "invoice"; title: string; detail: string }
    | { kind: "questions"; title: string; detail: string }
    | null;
}

const QUESTION_REGEX = /[^.!?\n]+\?/g;
const INVOICE_REGEX = /\binvoice\s+#?(\d+)/gi;
const AMOUNT_REGEX = /(?:\$|USD\s?)\d[\d,]*(?:\.\d{2})?/g;
const DATE_REGEX =
  /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+\d{1,2}\b/gi;

function htmlToText(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values));
}

export function extractUnansweredQuestions(email: EmailThread) {
  return (htmlToText(email.body || email.preview || "").match(QUESTION_REGEX) || [])
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
}

export function extractKeyFacts(email: EmailThread) {
  const text = htmlToText(`${email.subject} ${email.preview} ${email.body || ""}`);

  return {
    invoiceRefs: uniqueValues(
      [...text.matchAll(INVOICE_REGEX)].map((match) => match[1]),
    ),
    amounts: uniqueValues(text.match(AMOUNT_REGEX) || []),
    dates: uniqueValues((text.match(DATE_REGEX) || []).map((item) => item.trim())),
  };
}

export function deriveReadingInsights(
  email: EmailThread,
  relatedEmails: EmailThread[],
): ReadingInsightModel {
  const questions = extractUnansweredQuestions(email);
  const facts = extractKeyFacts(email);
  const senderHistoryCount = relatedEmails.filter(
    (item) => item.id !== email.id && item.sender.email === email.sender.email,
  ).length;

  const summaryFallback =
    questions.length > 0
      ? `${email.sender.name} is waiting on a reply and asked ${questions.length} open question${questions.length === 1 ? "" : "s"}.`
      : `${email.sender.name} sent a thread that looks actionable and may block follow-up work.`;
  const factItems = [
    ...facts.invoiceRefs.map((value) => `Invoice ${value}`),
    ...facts.amounts,
    ...facts.dates,
  ].slice(0, 3);
  const fallbackFactItems =
    factItems.length > 0
      ? factItems
      : ["Summarize thread", "Extract actions", "Suggest reply tone"];

  return {
    summaryFallback,
    nextAction: facts.dates.length > 0
      ? {
          label: "Reply with payment date",
          detail: `Confirm the timing before ${facts.dates[0]}.`,
        }
      : {
          label: "Send follow-up",
          detail: "Acknowledge the thread and close the open loop.",
        },
    primaryPanel:
      questions.length > 0
        ? { kind: "questions", items: questions }
        : { kind: "facts", items: fallbackFactItems },
    toneOptions: [
      "short",
      "polite",
      "firm",
      "detailed",
      "decline",
      "follow-up",
    ],
    reminderOptions: [
      "Remind me in 3 days if no reply",
      "Check back next week",
    ],
    inlineCue:
      facts.invoiceRefs.length > 0
        ? {
            kind: "invoice",
            title: `Invoice ${facts.invoiceRefs[0]} needs attention`,
            detail: facts.dates[0]
              ? `Payment timing appears to matter before ${facts.dates[0]}.`
              : `This thread looks payment-related with ${senderHistoryCount} recent sender touchpoints.`,
          }
        : questions.length >= 2
          ? {
              kind: "questions",
              title: `${questions.length} unanswered questions`,
              detail: "This thread will likely benefit from a direct, structured reply.",
            }
          : null,
  };
}
