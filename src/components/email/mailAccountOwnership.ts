import type { EmailThread, MailFolder } from "@/types/email";

const ACCOUNT_ID_PATTERN = /^(ms|google|imap)-[A-Za-z0-9._-]+$/;

export function isRoutableAccountId(value: string | null | undefined): value is string {
  return typeof value === "string" && ACCOUNT_ID_PATTERN.test(value);
}

export function resolveMessageAccountId({
  folderAccountId,
  messageAccountId,
}: {
  folderAccountId?: string | null;
  messageAccountId?: string | null;
}) {
  if (isRoutableAccountId(folderAccountId)) {
    return folderAccountId;
  }

  if (isRoutableAccountId(messageAccountId)) {
    return messageAccountId;
  }

  return "";
}

export function resolveEmailOwningAccountId({
  email,
  mailFolders,
  currentAccountId,
}: {
  email: Pick<EmailThread, "accountId" | "folderId" | "folder">;
  mailFolders: MailFolder[];
  currentAccountId?: string | null;
}) {
  if (isRoutableAccountId(email.accountId)) {
    return email.accountId;
  }

  const folderId = email.folderId || email.folder;
  const folderAccountId = mailFolders.find((folder) => folder.id === folderId)?.accountId;

  if (isRoutableAccountId(folderAccountId)) {
    return folderAccountId;
  }

  if (isRoutableAccountId(currentAccountId)) {
    return currentAccountId;
  }

  return "";
}
