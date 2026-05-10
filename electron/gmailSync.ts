// electron/gmailSync.ts
import type {
  GmailMessageHeader,
  GmailMessagePart,
  GmailMessage,
  GmailMessageListResponse,
} from "./types";
import { db } from "./database";
import { sleep } from "./utils";

// =============================================================================
// GMAIL SYSTEM FOLDERS
// =============================================================================

export const GMAIL_SYSTEM_FOLDERS = [
  { id: "INBOX",   displayName: "Inbox",   wellKnownName: "inbox",       depth: 0, path: "Inbox" },
  { id: "SENT",    displayName: "Sent",    wellKnownName: "sentitems",   depth: 0, path: "Sent" },
  { id: "DRAFT",   displayName: "Drafts",  wellKnownName: "drafts",      depth: 0, path: "Drafts" },
  { id: "ARCHIVE", displayName: "Archive", wellKnownName: "archive",     depth: 0, path: "Archive" },
  { id: "TRASH",   displayName: "Trash",   wellKnownName: "deleteditems",depth: 0, path: "Trash" },
  { id: "STARRED", displayName: "Starred", wellKnownName: "",            depth: 0, path: "Starred" },
  { id: "SPAM",    displayName: "Spam",    wellKnownName: "junkmail",    depth: 0, path: "Spam" },
];

// =============================================================================
// GMAIL API — HELPERS
// =============================================================================

export function gmailParseHeader(headers: GmailMessageHeader[], name: string): string {
  return headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";
}

export function gmailParseAddress(raw: string): { name: string; address: string } {
  const match = /^(.*?)\s*<([^>]+)>$/.exec(raw.trim());
  if (match) return { name: match[1].replace(/^"|"$/g, "").trim(), address: match[2].trim() };
  return { name: "", address: raw.trim() };
}

export function gmailExtractBody(part: GmailMessagePart | undefined): { content: string; contentType: "text" | "html" } {
  if (!part) return { content: "", contentType: "text" };

  // Multipart: prefer html, fall back to plain
  if (part.parts && part.parts.length > 0) {
    const htmlPart = part.parts.find((p) => p.mimeType === "text/html");
    const textPart = part.parts.find((p) => p.mimeType === "text/plain");

    for (const candidate of [htmlPart, textPart]) {
      if (!candidate) continue;
      if (candidate.body?.data) {
        const decoded = Buffer.from(candidate.body.data, "base64").toString("utf8");
        return { content: decoded, contentType: candidate.mimeType === "text/html" ? "html" : "text" };
      }
      // Nested multipart
      if (candidate.parts) {
        const nested = gmailExtractBody(candidate);
        if (nested.content) return nested;
      }
    }
  }

  // Single-part
  if (part.body?.data) {
    const decoded = Buffer.from(part.body.data, "base64").toString("utf8");
    return { content: decoded, contentType: part.mimeType === "text/html" ? "html" : "text" };
  }

  return { content: "", contentType: "text" };
}

export function gmailUpsertFolders(accountId: string) {
  const upsertFolder = db.prepare(`
    INSERT INTO folders (id, accountId, displayName, parentFolderId, wellKnownName, totalItemCount, unreadItemCount, depth, path)
    VALUES (?, ?, ?, NULL, ?, 0, 0, ?, ?)
    ON CONFLICT(accountId, id) DO UPDATE SET
      displayName = excluded.displayName,
      wellKnownName = excluded.wellKnownName,
      depth = excluded.depth,
      path = excluded.path
  `);

  for (const folder of GMAIL_SYSTEM_FOLDERS) {
    upsertFolder.run(folder.id, accountId, folder.displayName, folder.wellKnownName, folder.depth, folder.path);
  }
}

export function gmailUpsertMessage(accountId: string, folderId: string, msg: GmailMessage) {
  const headers = msg.payload?.headers ?? [];
  const fromRaw = gmailParseHeader(headers, "From");
  const { name: fromName, address: fromAddress } = gmailParseAddress(fromRaw);

  const toRaw = gmailParseHeader(headers, "To");
  const toRecipients = toRaw
    ? JSON.stringify([{ emailAddress: gmailParseAddress(toRaw) }])
    : "[]";

  const ccRaw = gmailParseHeader(headers, "Cc");
  const ccRecipients = ccRaw
    ? JSON.stringify([{ emailAddress: gmailParseAddress(ccRaw) }])
    : "[]";

  const subject = gmailParseHeader(headers, "Subject");
  const dateRaw = gmailParseHeader(headers, "Date");
  const receivedDateTime = dateRaw ? new Date(dateRaw).toISOString() : new Date().toISOString();
  const snippet = msg.snippet ?? "";
  const isRead = !(msg.labelIds ?? []).includes("UNREAD") ? 1 : 0;
  const isStarred = (msg.labelIds ?? []).includes("STARRED") ? 1 : 0;

  const body = gmailExtractBody(msg.payload as GmailMessagePart | undefined);

  db.prepare(`
    INSERT INTO emails (
      id, accountId, folder, subject, bodyPreview, bodyContentType, bodyContent,
      receivedDateTime, isRead, hasAttachments, isStarred, fromName, fromAddress,
      toRecipients, ccRecipients
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      folder             = excluded.folder,
      subject            = CASE WHEN excluded.subject <> '' THEN excluded.subject ELSE emails.subject END,
      bodyPreview        = CASE WHEN excluded.bodyPreview <> '' THEN excluded.bodyPreview ELSE emails.bodyPreview END,
      bodyContentType    = CASE WHEN excluded.bodyContentType <> '' THEN excluded.bodyContentType ELSE emails.bodyContentType END,
      bodyContent        = CASE WHEN excluded.bodyContent <> '' THEN excluded.bodyContent ELSE emails.bodyContent END,
      receivedDateTime   = excluded.receivedDateTime,
      isRead             = excluded.isRead,
      isStarred          = excluded.isStarred,
      fromName           = excluded.fromName,
      fromAddress        = excluded.fromAddress,
      toRecipients       = excluded.toRecipients,
      ccRecipients       = excluded.ccRecipients
  `).run(
    msg.id, accountId, folderId, subject, snippet,
    body.content ? body.contentType : "",
    body.content,
    receivedDateTime, isRead, isStarred, fromName, fromAddress, toRecipients, ccRecipients,
  );
}

export async function gmailFetchMessagesForLabel(
  accessToken: string,
  accountId: string,
  labelId: string,
  maxMessages: number,
) {
  const listUrl = new URL("https://gmail.googleapis.com/gmail/v1/users/me/messages");
  listUrl.searchParams.set("labelIds", labelId);
  listUrl.searchParams.set("maxResults", String(maxMessages));

  const listResponse = await fetch(listUrl.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!listResponse.ok) {
    const err = await listResponse.text();
    throw new Error(`Gmail messages list failed (${listResponse.status}): ${err}`);
  }

  const listData = (await listResponse.json()) as GmailMessageListResponse;
  const messageIds = (listData.messages ?? []).map((m) => m.id);

  for (const messageId of messageIds) {
    const msgUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(messageId)}?format=full`;
    const msgResponse = await fetch(msgUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!msgResponse.ok) {
      console.warn(`Gmail fetch message ${messageId} failed (${msgResponse.status})`);
      continue;
    }

    const msg = (await msgResponse.json()) as GmailMessage;
    gmailUpsertMessage(accountId, labelId, msg);
    await sleep(30);
  }
}
