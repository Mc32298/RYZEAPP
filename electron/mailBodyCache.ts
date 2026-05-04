export function parseStoredAttachments(value: string | undefined) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function shouldUseLocalMessageBody({
  bodyContent,
  hasAttachments,
  attachmentsJson,
}: {
  bodyContent?: string;
  hasAttachments: boolean;
  attachmentsJson?: string;
}) {
  if (!bodyContent?.trim()) {
    return false;
  }

  if (!hasAttachments) {
    return true;
  }

  return parseStoredAttachments(attachmentsJson).length > 0;
}
