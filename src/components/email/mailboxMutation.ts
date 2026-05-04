import type { EmailThread, MailFolder } from "@/types/email";

export function getKnownFolderIdForAccount(
  folders: MailFolder[],
  accountId: string,
  wellKnownName: string,
) {
  return (
    folders.find(
      (folder) =>
        folder.accountId === accountId &&
        folder.wellKnownName === wellKnownName,
    )?.id || wellKnownName
  );
}

export function applyMovedEmailState(
  email: EmailThread,
  {
    destinationFolderId,
    messageId,
  }: {
    destinationFolderId: string;
    messageId?: string;
  },
): EmailThread {
  const nextMessageId = messageId || email.messageId;

  return {
    ...email,
    id: `${email.accountId}:${destinationFolderId}:${nextMessageId}`,
    messageId: nextMessageId,
    folder: destinationFolderId,
    folderId: destinationFolderId,
  };
}

export function getMailboxRefreshFolderIds(
  sourceFolderId: string,
  destinationFolderId: string,
) {
  return Array.from(
    new Set([sourceFolderId, destinationFolderId].filter(Boolean)),
  );
}
