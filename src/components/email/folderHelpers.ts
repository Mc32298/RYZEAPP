import { MailFolder } from "@/types/email";

function normalizeFolderValue(value: unknown) {
  return typeof value === "string" ? value.toLowerCase().trim() : "";
}

export function isInboxFolder(folder: MailFolder) {
  const knownName = normalizeFolderValue(folder.wellKnownName);
  const displayName = normalizeFolderValue(folder.displayName);
  const folderId = normalizeFolderValue(folder.id);

  return (
    knownName === "inbox" || displayName === "inbox" || folderId === "inbox"
  );
}

export function isSentFolder(folder: MailFolder) {
  const knownName = normalizeFolderValue(folder.wellKnownName);
  const displayName = normalizeFolderValue(folder.displayName);
  const folderId = normalizeFolderValue(folder.id);

  return (
    knownName === "sentitems" ||
    knownName === "sent" ||
    displayName === "sent" ||
    displayName === "sent items" ||
    folderId === "sentitems" ||
    folderId === "sent"
  );
}

export function isDraftsFolder(folder: MailFolder) {
  const knownName = normalizeFolderValue(folder.wellKnownName);
  const displayName = normalizeFolderValue(folder.displayName);
  const folderId = normalizeFolderValue(folder.id);

  return (
    knownName === "drafts" || displayName === "drafts" || folderId === "drafts"
  );
}

export function isArchiveFolder(folder: MailFolder) {
  const knownName = normalizeFolderValue(folder.wellKnownName);
  const displayName = normalizeFolderValue(folder.displayName);
  const folderId = normalizeFolderValue(folder.id);

  return (
    knownName === "archive" ||
    displayName === "archive" ||
    folderId === "archive"
  );
}

export function isDeletedFolder(folder: MailFolder) {
  const knownName = normalizeFolderValue(folder.wellKnownName);
  const displayName = normalizeFolderValue(folder.displayName);
  const folderId = normalizeFolderValue(folder.id);

  return (
    knownName === "deleteditems" ||
    knownName === "trash" ||
    displayName === "deleted items" ||
    displayName === "trash" ||
    folderId === "deleteditems" ||
    folderId === "trash"
  );
}

export function isSystemMailFolder(folder: MailFolder) {
  return (
    isInboxFolder(folder) ||
    isSentFolder(folder) ||
    isDraftsFolder(folder) ||
    isArchiveFolder(folder) ||
    isDeletedFolder(folder)
  );
}

export function findDefaultInboxFolderId(folders: MailFolder[]) {
  const inbox = folders.find(isInboxFolder);
  return inbox?.id || "inbox";
}

export function getInboxFolderIds(folders: MailFolder[]) {
  return new Set(folders.filter(isInboxFolder).map((folder) => folder.id));
}

export function getSentFolderIds(folders: MailFolder[]) {
  return new Set(folders.filter(isSentFolder).map((folder) => folder.id));
}

export function getSystemFolderIds(folders: MailFolder[]) {
  return new Set(folders.filter(isSystemMailFolder).map((folder) => folder.id));
}
