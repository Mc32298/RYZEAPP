import type { EmailAttachment, EmailThread } from "@/types/email";

function normalizeValue(value: string | undefined) {
  return (value || "").trim().toLowerCase();
}

function looksOpaqueSenderName(value: string) {
  const compact = value.replace(/\s+/g, "");

  return compact.length >= 24 && /^[A-Z0-9_=-]+$/i.test(compact);
}

function looksLikeEmailAddress(value: string) {
  return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value.trim());
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function findInlineAttachment(
  attachments: EmailAttachment[] = [],
  cidValue: string,
  altValue: string,
) {
  const normalizedCid = normalizeValue(cidValue).replace(/^cid:/, "");
  const normalizedAlt = normalizeValue(altValue);

  return attachments.find((attachment) => {
    if (!attachment.isInline) return false;

    const attachmentCid = normalizeValue(attachment.contentId).replace(
      /^cid:/,
      "",
    );
    const filename = normalizeValue(attachment.filename);

    return (
      (attachmentCid && attachmentCid === normalizedCid) ||
      (normalizedAlt && filename === normalizedAlt)
    );
  });
}

function makeInlineAttachmentPlaceholder(filename: string) {
  return `<div style="display:flex;align-items:center;justify-content:center;min-height:120px;border:1px solid var(--border-0);background:var(--bg-1);color:var(--fg-2);font-size:12px;border-radius:5px;padding:14px;text-align:center;">Inline image attachment: ${escapeHtml(filename)}</div>`;
}

export function getConversationSenderName(
  email: EmailThread,
  currentUserEmail: string,
) {
  const senderName = email.sender.name?.trim();
  const senderEmail = email.sender.email?.trim();
  const normalizedSenderEmail = normalizeValue(senderEmail);
  const normalizedCurrentUserEmail = normalizeValue(currentUserEmail);
  const normalizedFolder = normalizeValue(email.folder);
  const normalizedFolderLabel = normalizeValue(email.folderLabel);
  const isSentMessage =
    normalizedFolder === "sent" ||
    normalizedFolder === "sentitems" ||
    normalizedFolderLabel === "sent";

  if (
    normalizedSenderEmail &&
    normalizedCurrentUserEmail &&
    normalizedSenderEmail === normalizedCurrentUserEmail
  ) {
    if (!senderName || looksOpaqueSenderName(senderName)) {
      return "You";
    }

    return senderName;
  }

  if (isSentMessage && looksOpaqueSenderName(senderName || "")) {
    return "You";
  }

  if (!senderName) {
    return senderEmail || "Unknown sender";
  }

  if (looksOpaqueSenderName(senderName)) {
    return senderEmail || "Unknown sender";
  }

  return senderName;
}

export function getConversationSenderEmail(email: EmailThread) {
  const senderEmail = email.sender.email?.trim();

  if (!senderEmail || looksOpaqueSenderName(senderEmail)) {
    return "";
  }

  return looksLikeEmailAddress(senderEmail) ? senderEmail : "";
}

export function getConversationFolderLabel(email: EmailThread) {
  const rawLabel = (email.folderLabel || email.folder || "").trim();
  const normalized = normalizeValue(rawLabel);

  if (!rawLabel || looksOpaqueSenderName(rawLabel)) {
    return "";
  }

  if (normalized === "sent" || normalized === "sentitems") {
    return "Sent";
  }

  if (normalized === "inbox") {
    return "Inbox";
  }

  if (normalized === "archive") {
    return "Archive";
  }

  if (normalized === "deleteditems" || normalized === "trash") {
    return "Trash";
  }

  if (normalized === "drafts") {
    return "Drafts";
  }

  return rawLabel;
}

export function renderThreadMessageHtml(
  html: string,
  _blockRemoteImages: boolean,
  attachments: EmailAttachment[] = [],
) {
  return html.replace(
    /<img\b[^>]*src=(["'])(cid:[^"']+)\1[^>]*>/gi,
    (match, _quote, srcValue) => {
      const altMatch = match.match(/\balt=(["'])([^"']*)\1/i);
      const altValue = altMatch?.[2] || "Inline image";
      const attachment = findInlineAttachment(attachments, srcValue, altValue);
      return makeInlineAttachmentPlaceholder(
        attachment?.filename || altValue || "Inline image",
      );
    },
  );
}
