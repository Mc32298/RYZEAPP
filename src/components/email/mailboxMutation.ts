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

export function getNextSelectedEmailIdAfterAction(
  orderedLatestMessageIds: string[],
  currentId: string,
) {
  if (orderedLatestMessageIds.length === 0) return null;
  const currentIndex = orderedLatestMessageIds.indexOf(currentId);
  if (currentIndex === -1) return orderedLatestMessageIds[0] || null;

  const nextId = orderedLatestMessageIds[currentIndex + 1];
  if (nextId) return nextId;

  const previousId = orderedLatestMessageIds[currentIndex - 1];
  return previousId || null;
}
