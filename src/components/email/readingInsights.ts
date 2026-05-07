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
  actionItems: string[];
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

export interface ContactContextModel {
  trustStatus: "trusted" | "untrusted";
  accountHistorySummary: string;
  lastReplySummary: string;
  knownLabels: string[];
  recentThreadSubjects: string[];
  relationshipStrength: "new" | "active" | "established";
}

const QUESTION_REGEX = /[^.!?\n]+\?/g;
const INVOICE_REGEX = /\binvoice\s+#?(\d+)/gi;
const AMOUNT_REGEX = /(?:\$|USD\s?)\d[\d,]*(?:\.\d{2})?/g;
const DATE_REGEX =
  /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+\d{1,2}\b/gi;
const MEETING_REGEX =
  /\b(meeting|call|zoom|teams|hangout|calendar invite|schedule)\b/i;
const APPROVAL_REGEX =
  /\b(approve|approval|sign off|sign-off|confirm approval)\b/i;
const TASK_REGEX =
  /\b(todo|action item|task|follow up|follow-up|please send|please share)\b/i;

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

export function extractActionItems(email: EmailThread) {
  const text = htmlToText(`${email.subject} ${email.preview} ${email.body || ""}`);
  const facts = extractKeyFacts(email);
  const questions = extractUnansweredQuestions(email);
  const actionItems: string[] = [];

  if (facts.dates[0]) {
    actionItems.push(`Confirm timeline before ${facts.dates[0]}.`);
  }

  if (facts.invoiceRefs[0]) {
    actionItems.push(`Review and respond on invoice ${facts.invoiceRefs[0]}.`);
  }

  if (facts.amounts[0]) {
    actionItems.push(`Validate amount ${facts.amounts[0]} before replying.`);
  }

  if (MEETING_REGEX.test(text)) {
    actionItems.push("Decide whether to accept or propose a meeting time.");
  }

  if (APPROVAL_REGEX.test(text)) {
    actionItems.push("Provide approval status or ask for required context.");
  }

  if (TASK_REGEX.test(text)) {
    actionItems.push("Convert the request into a tracked task.");
  }

  if (questions.length > 0) {
    actionItems.push(`Reply to ${questions.length} open question${questions.length === 1 ? "" : "s"}.`);
  }

  return uniqueValues(actionItems).slice(0, 5);
}

export function deriveReadingInsights(
  email: EmailThread,
  relatedEmails: EmailThread[],
): ReadingInsightModel {
  const questions = extractUnansweredQuestions(email);
  const facts = extractKeyFacts(email);
  const actionItems = extractActionItems(email);
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
      : actionItems.length > 0
        ? {
            label: actionItems[0],
            detail: "Detected from thread content.",
          }
      : {
          label: "Send follow-up",
          detail: "Acknowledge the thread and close the open loop.",
        },
    actionItems,
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

export function deriveContactContext(
  email: EmailThread,
  relatedEmails: EmailThread[],
  currentUserEmail: string,
  isTrustedSender: boolean,
): ContactContextModel {
  const senderAddress = email.sender.email.toLowerCase();
  const senderThreads = relatedEmails
    .filter((item) => item.sender.email.toLowerCase() === senderAddress)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const recentThreadSubjects = Array.from(
    new Set(senderThreads.map((item) => item.subject.trim()).filter(Boolean)),
  ).slice(0, 3);

  const labelFrequency = new Map<string, number>();
  senderThreads
    .flatMap((item) => item.labels.map((label) => label.name))
    .filter(Boolean)
    .forEach((labelName) => {
      labelFrequency.set(labelName, (labelFrequency.get(labelName) || 0) + 1);
    });
  const knownLabels = Array.from(labelFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([labelName]) => labelName)
    .slice(0, 5);

  const lastReply = relatedEmails
    .filter((item) => item.sender.email.toLowerCase() === currentUserEmail.toLowerCase())
    .filter((item) => item.to.some((recipient) => recipient.toLowerCase() === senderAddress))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

  const accountHistorySummary =
    senderThreads.length > 0
      ? `${senderThreads.length} message${senderThreads.length === 1 ? "" : "s"} from this sender in local history. Last incoming ${senderThreads[0].timestamp.toLocaleDateString()}.`
      : "No prior local history with this sender.";

  const lastReplySummary = lastReply
    ? `Last replied ${lastReply.timestamp.toLocaleDateString()}.`
    : "No outgoing reply found in local history.";

  return {
    trustStatus: isTrustedSender ? "trusted" : "untrusted",
    accountHistorySummary,
    lastReplySummary,
    knownLabels,
    recentThreadSubjects,
    relationshipStrength:
      senderThreads.length >= 12
        ? "established"
        : senderThreads.length >= 4
          ? "active"
          : "new",
  };
}
