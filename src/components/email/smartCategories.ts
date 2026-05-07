import type { EmailThread } from "@/types/email";

export type SmartCategory =
  | "Important"
  | "Receipts"
  | "Newsletters"
  | "Personal"
  | "Work"
  | "Calendar"
  | "Security";

const RECEIPTS_REGEX =
  /\b(invoice|receipt|payment|paid|billing|subscription|order|transaction)\b/i;
const NEWSLETTER_REGEX =
  /\b(newsletter|unsubscribe|digest|weekly update|promotion|marketing)\b/i;
const CALENDAR_REGEX =
  /\b(meeting|calendar|invite|zoom|teams|scheduled|appointment)\b/i;
const SECURITY_REGEX =
  /\b(password|security|2fa|mfa|verify|verification|sign[- ]in|new device|alert|suspicious)\b/i;
const IMPORTANT_REGEX =
  /\b(urgent|asap|deadline|action required|immediately|high priority)\b/i;
const PERSONAL_DOMAINS = new Set([
  "gmail.com",
  "outlook.com",
  "hotmail.com",
  "yahoo.com",
  "icloud.com",
  "proton.me",
  "protonmail.com",
]);

function emailDomain(address: string) {
  const at = address.lastIndexOf("@");
  return at >= 0 ? address.slice(at + 1).toLowerCase() : "";
}

function allText(email: EmailThread) {
  return `${email.subject} ${email.preview} ${email.body || ""}`.replace(
    /<[^>]+>/g,
    " ",
  );
}

export function classifySmartCategory(email: EmailThread): SmartCategory {
  const text = allText(email);
  const subject = email.subject.toLowerCase();
  const senderDomain = emailDomain(email.sender.email);

  const scores: Record<SmartCategory, number> = {
    Important: 0,
    Receipts: 0,
    Newsletters: 0,
    Personal: 0,
    Work: 1,
    Calendar: 0,
    Security: 0,
  };

  if (SECURITY_REGEX.test(text)) scores.Security += 4;
  if (CALENDAR_REGEX.test(text)) scores.Calendar += 4;
  if (RECEIPTS_REGEX.test(text)) scores.Receipts += 3;
  if (NEWSLETTER_REGEX.test(text)) scores.Newsletters += 3;
  if (IMPORTANT_REGEX.test(text) || email.isStarred) scores.Important += 3;

  if (subject.startsWith("re:") || subject.startsWith("fwd:")) {
    scores.Work += 1;
  }

  if (PERSONAL_DOMAINS.has(senderDomain)) {
    scores.Personal += 2;
  } else {
    scores.Work += 2;
  }

  // Explicit precedence for sensitive/security signals.
  if (scores.Security > 0) return "Security";

  const ranked = (Object.keys(scores) as SmartCategory[])
    .sort((a, b) => scores[b] - scores[a]);
  return ranked[0] || "Work";
}
