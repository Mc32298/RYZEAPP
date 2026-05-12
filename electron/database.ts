// =============================================================================
// database.ts — SQLite database initialization and schema
//
// Responsibilities:
//   • Opens the SQLite database in Electron's userData directory
//   • Creates all tables and indexes if they don't already exist
//   • Provides safe schema migration helpers (ensureColumn)
// =============================================================================

import * as electron from "electron";
import Database from "better-sqlite3";
import * as path from "path";

// ESM/CJS compatibility shim — same pattern as main.ts
const electronApi =
  (electron as unknown as { default?: typeof electron }).default ?? electron;
const { app } = electronApi;

export const dbPath = path.join(app.getPath("userData"), "emails.db");
export const db = new Database(dbPath);

// Create tables if they don't already exist
db.exec(`
  CREATE TABLE IF NOT EXISTS folders (
    id               TEXT,
    accountId        TEXT,
    displayName      TEXT,
    parentFolderId   TEXT,
    wellKnownName    TEXT,
    totalItemCount   INTEGER,
    unreadItemCount  INTEGER,
    depth            INTEGER DEFAULT 0,
    path             TEXT DEFAULT '',
    PRIMARY KEY (accountId, id)
  );

  CREATE INDEX IF NOT EXISTS idx_folders_account ON folders(accountId);

  CREATE TABLE IF NOT EXISTS emails (
    id               TEXT PRIMARY KEY,
    accountId        TEXT,
    folder           TEXT,
    subject          TEXT,
    bodyPreview      TEXT,
    bodyContentType  TEXT,
    bodyContent      TEXT,
    receivedDateTime TEXT,
    isRead           INTEGER,
    hasAttachments   INTEGER,
    fromName         TEXT,
    fromAddress      TEXT,
    toRecipients     TEXT,
    ccRecipients     TEXT,
    snoozedUntil     TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_emails_account_folder ON emails(accountId, folder);
  CREATE INDEX IF NOT EXISTS idx_emails_received ON emails(accountId, folder, receivedDateTime DESC);

  CREATE TABLE IF NOT EXISTS labels (
  id          TEXT PRIMARY KEY,
  accountId   TEXT NOT NULL,
  name        TEXT NOT NULL,
  color       TEXT NOT NULL DEFAULT '#C9A84C',
  createdAt   TEXT NOT NULL,
  updatedAt   TEXT NOT NULL,
  UNIQUE(accountId, name)
);

CREATE INDEX IF NOT EXISTS idx_labels_account ON labels(accountId);

CREATE TABLE IF NOT EXISTS email_labels (
  accountId  TEXT NOT NULL,
  messageId  TEXT NOT NULL,
  labelId    TEXT NOT NULL,
  createdAt  TEXT NOT NULL,
  PRIMARY KEY (accountId, messageId, labelId),
  FOREIGN KEY(labelId) REFERENCES labels(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_email_labels_account_message
ON email_labels(accountId, messageId);

CREATE INDEX IF NOT EXISTS idx_email_labels_account_label
ON email_labels(accountId, labelId);

CREATE TABLE IF NOT EXISTS folder_sync_state (
  accountId       TEXT NOT NULL,
  folderId        TEXT NOT NULL,
  deltaLink       TEXT,
  lastFullSyncAt  TEXT,
  lastDeltaSyncAt TEXT,
  PRIMARY KEY (accountId, folderId)
);

CREATE INDEX IF NOT EXISTS idx_folder_sync_state_account
ON folder_sync_state(accountId);
`);

const ALLOWED_MIGRATION_TABLES = new Set([
  "folders",
  "emails",
  "labels",
  "email_labels",
  "folder_sync_state",
]);
const SAFE_IDENTIFIER_RE = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
const SAFE_COLUMN_DEF_RE = /^[A-Z]+(\s+DEFAULT\s+('[^']*'|\d+))?$/i;

/**
 * Adds a column to an existing table only if it doesn't already exist.
 * Used for safe schema migrations without dropping/recreating the table.
 *
 * tableName, columnName, and definition are validated against strict allowlists
 * before being interpolated into SQL (PRAGMA/ALTER TABLE cannot use ? placeholders).
 */
export function ensureColumn(
  tableName: string,
  columnName: string,
  definition: string,
) {
  if (!ALLOWED_MIGRATION_TABLES.has(tableName)) {
    throw new Error(`ensureColumn: table "${tableName}" is not in the allowed list`);
  }
  if (!SAFE_IDENTIFIER_RE.test(columnName)) {
    throw new Error(`ensureColumn: column name "${columnName}" contains invalid characters`);
  }
  if (!SAFE_COLUMN_DEF_RE.test(definition)) {
    throw new Error(`ensureColumn: column definition "${definition}" contains invalid characters`);
  }

  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{
    name: string;
  }>;
  const hasColumn = columns.some((column) => column.name === columnName);

  if (!hasColumn) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

// Migration: ensure newer columns exist for older databases
ensureColumn("folders", "depth", "INTEGER DEFAULT 0");
ensureColumn("folders", "path", "TEXT DEFAULT ''");
ensureColumn("folders", "icon", "TEXT DEFAULT ''");
ensureColumn("emails", "isStarred", "INTEGER DEFAULT 0");
ensureColumn("emails", "attachments", "TEXT DEFAULT '[]'");
ensureColumn("emails", "snoozedUntil", "TEXT");

// Ensure composite index exists for existing users
db.exec(`CREATE INDEX IF NOT EXISTS idx_emails_received ON emails(accountId, folder, receivedDateTime DESC);`);
