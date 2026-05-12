// electron/dbHelpers.ts
import { db } from "./database";
import type { EmailLabel, GraphMailFolder, GraphMessage } from "./types";

// =============================================================================
// FOLDER SYNC STATE
// =============================================================================

export function getFolderDeltaLink(accountId: string, folderId: string) {
  const row = db
    .prepare(
      `
      SELECT deltaLink
      FROM folder_sync_state
      WHERE accountId = ? AND folderId = ?
      LIMIT 1
    `,
    )
    .get(accountId, folderId) as { deltaLink?: string } | undefined;

  return row?.deltaLink || "";
}

export function saveFolderSyncState(
  accountId: string,
  folderId: string,
  deltaLink: string,
  syncType: "full" | "delta",
) {
  const now = new Date().toISOString();

  db.prepare(
    `
    INSERT INTO folder_sync_state (
      accountId,
      folderId,
      deltaLink,
      lastFullSyncAt,
      lastDeltaSyncAt
    )
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(accountId, folderId) DO UPDATE SET
      deltaLink = excluded.deltaLink,
      lastFullSyncAt = CASE
        WHEN ? = 'full' THEN excluded.lastFullSyncAt
        ELSE folder_sync_state.lastFullSyncAt
      END,
      lastDeltaSyncAt = CASE
        WHEN ? = 'delta' THEN excluded.lastDeltaSyncAt
        ELSE folder_sync_state.lastDeltaSyncAt
      END
  `,
  ).run(
    accountId,
    folderId,
    deltaLink,
    syncType === "full" ? now : null,
    syncType === "delta" ? now : null,
    syncType,
    syncType,
  );
}

export function clearFolderSyncState(accountId: string, folderId: string) {
  db.prepare(
    `
    DELETE FROM folder_sync_state
    WHERE accountId = ? AND folderId = ?
  `,
  ).run(accountId, folderId);
}

// =============================================================================
// MESSAGE WRITE OPERATIONS
// =============================================================================

export function upsertLocalGraphMessage(
  accountId: string,
  folderId: string,
  message: any,
) {
  const fromName =
    message.from?.emailAddress?.name ||
    message.sender?.emailAddress?.name ||
    "";

  const fromAddress =
    message.from?.emailAddress?.address ||
    message.sender?.emailAddress?.address ||
    "";

  const isStarred = message.flag
    ? message.flag.flagStatus === "flagged"
      ? 1
      : 0
    : null;

  const isRead = message.isRead !== undefined ? (message.isRead ? 1 : 0) : null;

  const hasAttachments =
    message.hasAttachments !== undefined
      ? message.hasAttachments
        ? 1
        : 0
      : null;

  const bodyContent = message.body?.content || message.bodyContent || "";
  const bodyContentType =
    message.body?.contentType || message.bodyContentType || "";

  db.prepare(
    `
    INSERT INTO emails (
      id,
      accountId,
      folder,
      subject,
      bodyPreview,
      bodyContentType,
      bodyContent,
      receivedDateTime,
      isRead,
      hasAttachments,
      isStarred,
      fromName,
      fromAddress,
      toRecipients,
      ccRecipients
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      accountId = excluded.accountId,
      folder = excluded.folder,

      subject = CASE
        WHEN excluded.subject <> '' THEN excluded.subject
        ELSE emails.subject
      END,

      bodyPreview = CASE
        WHEN excluded.bodyPreview <> '' THEN excluded.bodyPreview
        ELSE emails.bodyPreview
      END,

      bodyContentType = CASE
        WHEN excluded.bodyContentType <> '' THEN excluded.bodyContentType
        ELSE emails.bodyContentType
      END,

      bodyContent = CASE
        WHEN excluded.bodyContent <> '' THEN excluded.bodyContent
        ELSE emails.bodyContent
      END,

      receivedDateTime = CASE
        WHEN excluded.receivedDateTime <> '' THEN excluded.receivedDateTime
        ELSE emails.receivedDateTime
      END,

      isRead = CASE
        WHEN excluded.isRead IS NOT NULL THEN excluded.isRead
        ELSE emails.isRead
      END,

      hasAttachments = CASE
        WHEN excluded.hasAttachments IS NOT NULL THEN excluded.hasAttachments
        ELSE emails.hasAttachments
      END,

      isStarred = CASE
        WHEN excluded.isStarred IS NOT NULL THEN excluded.isStarred
        ELSE emails.isStarred
      END,

      fromName = CASE
        WHEN excluded.fromName <> '' THEN excluded.fromName
        ELSE emails.fromName
      END,

      fromAddress = CASE
        WHEN excluded.fromAddress <> '' THEN excluded.fromAddress
        ELSE emails.fromAddress
      END,

      toRecipients = CASE
        WHEN excluded.toRecipients <> '[]' THEN excluded.toRecipients
        ELSE emails.toRecipients
      END,

      ccRecipients = CASE
        WHEN excluded.ccRecipients <> '[]' THEN excluded.ccRecipients
        ELSE emails.ccRecipients
      END
  `,
  ).run(
    message.id,
    accountId,
    folderId,
    message.subject || "",
    message.bodyPreview || "",
    bodyContentType,
    bodyContent,
    message.receivedDateTime || "",
    isRead,
    hasAttachments,
    isStarred,
    fromName,
    fromAddress,
    JSON.stringify(message.toRecipients || []),
    JSON.stringify(message.ccRecipients || []),
  );
}

export function deleteLocalMessage(accountId: string, messageId: string) {
  db.transaction(() => {
    db.prepare(
      `
      DELETE FROM email_labels
      WHERE accountId = ? AND messageId = ?
    `,
    ).run(accountId, messageId);

    db.prepare(
      `
      DELETE FROM emails
      WHERE accountId = ? AND id = ?
    `,
    ).run(accountId, messageId);
  })();
}

// =============================================================================
// LABEL OPERATIONS
// =============================================================================

export function getLabelsByMessageId(accountId: string) {
  const rows = db
    .prepare(
      `
      SELECT
        email_labels.messageId,
        labels.id,
        labels.accountId,
        labels.name,
        labels.color,
        labels.createdAt,
        labels.updatedAt
      FROM email_labels
      INNER JOIN labels
        ON labels.id = email_labels.labelId
       AND labels.accountId = email_labels.accountId
      WHERE email_labels.accountId = ?
      ORDER BY labels.name COLLATE NOCASE ASC
    `,
    )
    .all(accountId) as Array<EmailLabel & { messageId: string }>;

  return rows.reduce(
    (acc, row) => {
      if (!acc[row.messageId]) acc[row.messageId] = [];

      acc[row.messageId].push({
        id: row.id,
        accountId: row.accountId,
        name: row.name,
        color: row.color,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      });

      return acc;
    },
    {} as Record<string, EmailLabel[]>,
  );
}

// =============================================================================
// FOLDER HELPERS
// =============================================================================

export function getLocalInboxFolderId(accountId: string) {
  const row = db
    .prepare(
      `
      SELECT id
      FROM folders
      WHERE accountId = ?
        AND (
          wellKnownName = 'inbox'
          OR LOWER(displayName) = 'inbox'
          OR LOWER(id) = 'inbox'
        )
      LIMIT 1
    `,
    )
    .get(accountId) as { id?: string } | undefined;

  return row?.id || "inbox";
}

/**
 * Falls back to empty string for custom/user-created folders.
 * Handles localised display names (e.g. 'papirkurv' for Deleted Items in Danish).
 */
export function getKnownFolderName(folder: GraphMailFolder) {
  if (folder.wellKnownName) {
    return folder.wellKnownName.toLowerCase();
  }

  const id = folder.id.toLowerCase();
  const displayName = folder.displayName.toLowerCase().replace(/\s+/g, "");

  if (
    id === "inbox" ||
    displayName === "inbox" ||
    displayName === "indbakke" ||
    displayName === "bandejadeentrada" ||
    displayName === "boîtederéception"
  )
    return "inbox";
  if (
    id === "sentitems" ||
    displayName === "sentitems" ||
    displayName === "sent" ||
    displayName === "sendtpost" ||
    displayName === "elementosenviados" ||
    displayName === "élémentsenvoyés"
  )
    return "sentitems";
  if (
    id === "drafts" ||
    displayName === "drafts" ||
    displayName === "kladder" ||
    displayName === "borradores" ||
    displayName === "brouillons"
  )
    return "drafts";
  if (
    id === "archive" ||
    displayName === "archive" ||
    displayName === "arkiv" ||
    displayName === "archivo"
  )
    return "archive";
  if (
    id === "deleteditems" ||
    displayName === "deleteditems" ||
    displayName === "deleted" ||
    displayName === "trash" ||
    displayName === "papirkurv" ||
    displayName === "elementoseliminados" ||
    displayName === "élémentsupprimés"
  ) {
    return "deleteditems";
  }

  return "";
}

export function saveFoldersToLocalDb(accountId: string, folders: GraphMailFolder[]) {
  const folderUpsert = db.prepare(`
    INSERT INTO folders (
      id,
      accountId,
      displayName,
      parentFolderId,
      wellKnownName,
      totalItemCount,
      unreadItemCount,
      depth,
      path
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(accountId, id) DO UPDATE SET
      displayName = excluded.displayName,
      parentFolderId = excluded.parentFolderId,
      wellKnownName = excluded.wellKnownName,
      totalItemCount = excluded.totalItemCount,
      unreadItemCount = excluded.unreadItemCount,
      depth = excluded.depth,
      path = excluded.path
  `);

  const insertFolders = db.transaction((foldersList: GraphMailFolder[]) => {
    for (const folder of foldersList) {
      folderUpsert.run(
        folder.id,
        accountId,
        folder.displayName || "Folder",
        folder.parentFolderId || "",
        getKnownFolderName(folder),
        folder.totalItemCount || 0,
        folder.unreadItemCount || 0,
        folder.depth || 0,
        folder.path || folder.displayName || "Folder",
      );
    }
  });

  insertFolders(folders);
}

export function getFolderAndDescendantIds(accountId: string, folderId: string) {
  const folders = db
    .prepare(
      `
      SELECT id, parentFolderId
      FROM folders
      WHERE accountId = ?
    `,
    )
    .all(accountId) as Array<{ id: string; parentFolderId?: string }>;

  const childrenByParentId = new Map<string, string[]>();

  for (const folder of folders) {
    const parentFolderId = folder.parentFolderId || "";
    if (!parentFolderId) continue;

    const children = childrenByParentId.get(parentFolderId) || [];
    children.push(folder.id);
    childrenByParentId.set(parentFolderId, children);
  }

  const result = new Set<string>();
  const visit = (id: string) => {
    if (result.has(id)) return;

    result.add(id);

    for (const childId of childrenByParentId.get(id) || []) {
      visit(childId);
    }
  };

  visit(folderId);

  return Array.from(result);
}

// =============================================================================
// LOCAL DATABASE — READ HELPERS
// =============================================================================

export function accountHasAnyLocalMessages(accountId: string) {
  const row = db
    .prepare(
      `
      SELECT id
      FROM emails
      WHERE accountId = ?
      LIMIT 1
    `,
    )
    .get(accountId);

  return Boolean(row);
}

export function accountHasAnyDeltaState(accountId: string) {
  const row = db
    .prepare(
      `
      SELECT folderId
      FROM folder_sync_state
      WHERE accountId = ?
      LIMIT 1
    `,
    )
    .get(accountId);

  return Boolean(row);
}

export function shouldRunInitialFullSync(accountId: string) {
  return (
    !accountHasAnyDeltaState(accountId) ||
    !accountHasAnyLocalMessages(accountId)
  );
}

/**
 * Converts SQLite rows (flat key-value) back into typed GraphMessage objects.
 * Parses JSON-encoded recipient arrays and maps integer booleans back to booleans.
 *
 * TODO: Replace `any[]` with a proper typed interface for the raw DB row shape.
 */
export function rowsToMessages(rows: any[]): GraphMessage[] {
  return rows.map((row) => ({
    id: row.id,
    subject: row.subject,
    bodyPreview: row.bodyPreview,
    body: row.bodyContentType
      ? {
          contentType: row.bodyContentType as "text" | "html",
          content: row.bodyContent || "",
        }
      : undefined,
    receivedDateTime: row.receivedDateTime,
    isRead: Boolean(row.isRead),
    hasAttachments: Boolean(row.hasAttachments),
    attachments: JSON.parse(row.attachments || "[]"),
    isStarred: Boolean(row.isStarred),
    from: {
      emailAddress: {
        name: row.fromName,
        address: row.fromAddress,
      },
    },
    toRecipients: JSON.parse(row.toRecipients || "[]"),
    ccRecipients: JSON.parse(row.ccRecipients || "[]"),
    snoozedUntil: row.snoozedUntil || null,
  }));
}

/**
 * Returns all locally cached folders for an account, ordered alphabetically by path.
 */
export function getLocalFolders(accountId: string) {
  return db
    .prepare(
      `
      SELECT *
      FROM folders
      WHERE accountId = ?
      ORDER BY path COLLATE NOCASE ASC
    `,
    )
    .all(accountId);
}

/**
 * Returns all locally cached emails grouped by folder ID.
 * Emails within each folder are sorted newest-first.
 */
export function getLocalMessagesByFolder(accountId: string) {
  const emailRows = db
    .prepare(
      `
    SELECT
      id, accountId, folder, subject, bodyPreview,
      receivedDateTime, isRead, hasAttachments, isStarred,
      fromName, fromAddress, toRecipients, ccRecipients, snoozedUntil
    FROM emails
    WHERE accountId = ?
    ORDER BY receivedDateTime DESC
  `,
    )
    .all(accountId) as any[];

  const messagesByFolder = {} as Record<string, GraphMessage[]>;
  for (const row of emailRows) {
    if (!messagesByFolder[row.folder]) {
      messagesByFolder[row.folder] = [];
    }
    // Note: rowsToMessages takes an array and returns an array.
    messagesByFolder[row.folder].push(rowsToMessages([row])[0]);
  }

  return messagesByFolder;
}

export function getLocalLabels(accountId: string) {
  return db
    .prepare(
      `
      SELECT id, accountId, name, color, createdAt, updatedAt
      FROM labels
      WHERE accountId = ?
      ORDER BY name COLLATE NOCASE ASC
    `,
    )
    .all(accountId);
}
