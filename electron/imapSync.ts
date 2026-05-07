export interface ImapMailboxLike {
  path: string;
  name?: string;
  delimiter?: string;
  specialUse?: string;
  flags?: Set<string> | string[];
  listed?: boolean;
  subscribed?: boolean;
}

export interface LocalImapFolderRow {
  id: string;
  accountId: string;
  displayName: string;
  parentFolderId: string | null;
  wellKnownName: string;
  totalItemCount: number;
  unreadItemCount: number;
  depth: number;
  path: string;
}

export interface ImapAddressLike {
  name?: string;
  address?: string;
}

export interface ImapMessageLike {
  accountId: string;
  folderId: string;
  uid: number | string;
  flags?: Set<string> | string[];
  envelope?: {
    subject?: string;
    date?: Date | string;
    messageId?: string;
    from?: ImapAddressLike[];
    sender?: ImapAddressLike[];
    to?: ImapAddressLike[];
    cc?: ImapAddressLike[];
  };
  source?: string | Buffer | Uint8Array;
  bodyText?: string;
}

export interface LocalImapMessageRow {
  id: string;
  accountId: string;
  folder: string;
  subject: string;
  bodyPreview: string;
  bodyContentType: "text";
  bodyContent: string;
  receivedDateTime: string;
  isRead: 0 | 1;
  hasAttachments: 0 | 1;
  isStarred: 0 | 1;
  fromName: string;
  fromAddress: string;
  toRecipients: string;
  ccRecipients: string;
  internetMessageId: string;
}

const WELL_KNOWN_SPECIAL_USE: Record<string, string> = {
  "\\all": "archive",
  "\\archive": "archive",
  "\\drafts": "drafts",
  "\\flagged": "",
  "\\important": "",
  "\\inbox": "inbox",
  "\\junk": "junkmail",
  "\\sent": "sentitems",
  "\\trash": "deleteditems",
};

export function normalizeImapMailboxPath(path: string, delimiter?: string) {
  const trimmed = path.trim();
  const separator = delimiter || (trimmed.includes("/") ? "/" : ".");

  if (separator === "/") return trimmed;
  return trimmed.split(separator).filter(Boolean).join("/");
}

export function buildImapFolderRows(
  accountId: string,
  mailboxes: ImapMailboxLike[],
): LocalImapFolderRow[] {
  return mailboxes
    .filter((mailbox) => mailbox.path)
    .map((mailbox) => {
      const normalizedPath = normalizeImapMailboxPath(
        mailbox.path,
        mailbox.delimiter,
      );
      const parts = normalizedPath.split("/").filter(Boolean);
      const displayName =
        normalizedPath.toUpperCase() === "INBOX"
          ? "Inbox"
          : mailbox.name || parts[parts.length - 1] || mailbox.path;

      return {
        id: mailbox.path,
        accountId,
        displayName,
        parentFolderId:
          parts.length > 1 ? parts.slice(0, -1).join(mailbox.delimiter || "/") : null,
        wellKnownName: resolveWellKnownName(mailbox),
        totalItemCount: 0,
        unreadItemCount: 0,
        depth: Math.max(0, parts.length - 1),
        path: normalizedPath,
      };
    })
    .sort((a, b) => a.path.localeCompare(b.path));
}

export function mapImapMessageToLocalMessage(
  message: ImapMessageLike,
): LocalImapMessageRow {
  const flags = normalizeFlags(message.flags);
  const from = firstAddress(
    message.envelope?.from?.[0] || message.envelope?.sender?.[0],
  );
  const bodyText = normalizeBodyText(message.bodyText ?? message.source ?? "");
  const receivedDateTime = normalizeDate(message.envelope?.date);

  return {
    id: `${message.accountId}:${message.folderId}:${message.uid}`,
    accountId: message.accountId,
    folder: message.folderId,
    subject: message.envelope?.subject || "(No subject)",
    bodyPreview: bodyText.slice(0, 240),
    bodyContentType: "text",
    bodyContent: bodyText,
    receivedDateTime,
    isRead: flags.has("\\seen") ? 1 : 0,
    hasAttachments: 0,
    isStarred: flags.has("\\flagged") ? 1 : 0,
    fromName: from.name,
    fromAddress: from.address,
    toRecipients: JSON.stringify(toRecipientList(message.envelope?.to)),
    ccRecipients: JSON.stringify(toRecipientList(message.envelope?.cc)),
    internetMessageId: message.envelope?.messageId || "",
  };
}

function resolveWellKnownName(mailbox: ImapMailboxLike) {
  const normalizedPath = normalizeImapMailboxPath(mailbox.path, mailbox.delimiter);
  if (normalizedPath.toUpperCase() === "INBOX") return "inbox";

  const flags = normalizeFlags(mailbox.flags);
  const specialUse = mailbox.specialUse?.toLowerCase();
  if (specialUse && specialUse in WELL_KNOWN_SPECIAL_USE) {
    return WELL_KNOWN_SPECIAL_USE[specialUse];
  }

  for (const flag of flags) {
    if (flag in WELL_KNOWN_SPECIAL_USE) return WELL_KNOWN_SPECIAL_USE[flag];
  }

  return "";
}

function normalizeFlags(flags: ImapMailboxLike["flags"] | ImapMessageLike["flags"]) {
  const values = flags instanceof Set ? Array.from(flags) : flags || [];
  return new Set(values.map((flag) => flag.toLowerCase()));
}

function firstAddress(address?: ImapAddressLike) {
  return {
    name: address?.name || address?.address || "",
    address: address?.address || "",
  };
}

function toRecipientList(addresses: ImapAddressLike[] = []) {
  return addresses
    .filter((address) => address.address)
    .map((address) => ({
      emailAddress: {
        name: address.name || address.address || "",
        address: address.address || "",
      },
    }));
}

function normalizeBodyText(value: string | Buffer | Uint8Array) {
  const text =
    typeof value === "string" ? value : Buffer.from(value).toString("utf8");

  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeDate(value?: Date | string) {
  if (!value) return new Date().toISOString();

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toISOString();

  return date.toISOString();
}
