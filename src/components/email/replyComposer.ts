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

export function buildReplySubject(email: EmailThread) {
  return email.subject.toLowerCase().startsWith("re:")
    ? email.subject
    : `Re: ${email.subject}`;
}

export function getReplyRecipients(
  email: EmailThread,
  currentUserEmail: string,
) {
  const currentUser = currentUserEmail.toLowerCase();
  const recipients =
    email.sender.email.toLowerCase() === currentUser
      ? email.to
      : [email.sender.email];

  return Array.from(
    new Set(
      recipients.filter((recipient) => recipient.toLowerCase() !== currentUser),
    ),
  ).join(", ");
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
