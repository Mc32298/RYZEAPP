import type { EmailAttachment, EmailThread } from "@/types/email";

export interface ThreadAttachment extends EmailAttachment {
  messageId: string;
  emailId: string;
  senderName: string;
  timestamp: Date;
}

export function collectThreadAttachments(
  messages: EmailThread[],
): ThreadAttachment[] {
  return [...messages]
    .sort((left, right) => right.timestamp.getTime() - left.timestamp.getTime())
    .flatMap((message) =>
      (message.attachments || [])
        .filter((attachment) => !attachment.isInline)
        .map((attachment) => ({
          ...attachment,
          messageId: message.messageId,
          emailId: message.id,
          senderName: message.sender.name,
          timestamp: message.timestamp,
        })),
    );
}
