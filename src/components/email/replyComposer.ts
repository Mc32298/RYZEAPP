import type { EmailThread } from "@/types/email";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function plainTextToHtml(value: string) {
  return escapeHtml(value).replace(/\r?\n/g, "<br/>");
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function buildReplySubject(email: EmailThread) {
  return email.subject.toLowerCase().startsWith("re:")
    ? email.subject
    : `Re: ${email.subject}`;
}

export function getInlineReplyTargetMessage(
  activeMessage: EmailThread,
  conversationMessages: EmailThread[],
  currentUserEmail: string,
) {
  const currentUser = normalizeEmail(currentUserEmail);
  const newestNonSelfMessage = [...conversationMessages]
    .sort((left, right) => right.timestamp.getTime() - left.timestamp.getTime())
    .find((message) => normalizeEmail(message.sender.email) !== currentUser);

  return newestNonSelfMessage || activeMessage;
}

export function getReplyRecipients(
  email: EmailThread,
  currentUserEmail: string,
  conversationMessages: EmailThread[] = [],
) {
  const currentUser = currentUserEmail.toLowerCase();
  const directRecipients =
    email.sender.email.toLowerCase() === currentUser
      ? email.to
      : [email.sender.email];
  const normalizedRecipients = Array.from(
    new Set(
      directRecipients.filter(
        (recipient) => recipient.toLowerCase() !== currentUser,
      ),
    ),
  );

  if (normalizedRecipients.length > 0) {
    return normalizedRecipients.join(", ");
  }

  const fallbackParticipants = Array.from(
    new Set(
      [...conversationMessages]
        .sort((left, right) => right.timestamp.getTime() - left.timestamp.getTime())
        .flatMap((message) => [
          message.sender.email,
          ...message.to,
          ...(message.cc || []),
        ])
        .map((participant) => participant.trim())
        .filter(
          (participant) =>
            participant.length > 0 &&
            participant.toLowerCase() !== currentUser,
        ),
    ),
  );

  return fallbackParticipants.join(", ");
}

export function buildInlineReplyHtml({
  bodyText,
  sourceEmail,
  signature,
}: {
  bodyText: string;
  sourceEmail: EmailThread;
  signature: string;
}) {
  const sentAt = sourceEmail.timestamp.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const signatureHtml = signature.trim()
    ? `<br/><br/><div>${plainTextToHtml(signature.trim())}</div>`
    : "";
  const originalBody = sourceEmail.body?.trim()
    ? sourceEmail.body
    : `<p>${plainTextToHtml(sourceEmail.preview || "No readable message content.")}</p>`;

  return `
    <div>${plainTextToHtml(bodyText.trim())}</div>
    ${signatureHtml}
    <div class="reply-quote" style="margin-top:16px;padding-left:12px;border-left:2px solid #777;color:#777;">
      <div style="margin-bottom:8px;">
        On ${plainTextToHtml(sentAt)}, ${plainTextToHtml(sourceEmail.sender.name)} &lt;${plainTextToHtml(sourceEmail.sender.email)}&gt; wrote:
      </div>
      ${originalBody}
    </div>
  `.trim();
}

export function buildInlineReplyComment({
  bodyText,
  signature,
}: {
  bodyText: string;
  signature: string;
}) {
  return [bodyText.trim(), signature.trim()].filter(Boolean).join("\n\n");
}
