// =============================================================================
// main.ts — Electron Main Process Entry Point
//
// Responsibilities:
//   • Creates and manages the BrowserWindow
//   • Sets up SQLite database (folders + emails)
//   • Handles Microsoft OAuth 2.0 + PKCE login flow
//   • Manages encrypted token storage via Electron safeStorage
//   • Exposes IPC handlers to the renderer process
// =============================================================================

// =============================================================================
// IMPORTS
// =============================================================================
import { autoUpdater } from "electron-updater";
import * as electron from "electron";
import { config as loadDotenv } from "dotenv";
import { ImapFlow } from "imapflow";
import * as path from "path";
import * as fs from "fs";
import http from "http"; // Used for the local OAuth callback server
import { resolveMarkReadValue } from "./mailReadState";
import { buildGraphReplyPayload } from "./mailReplyPayload";
import { isValidAccountId } from "./accountId";
import { buildGmailMoveLabelMutation } from "./gmailMove";
import { deriveSyncHealth, deriveTokenHealth } from "./accountHealth";
import {
  buildImapAccountId,
  validateImapConnectionConfig,
  type ImapConnectionConfig,
} from "./imapConfig";
import {
  buildImapFolderRows,
  mapImapMessageToLocalMessage,
  normalizeImapMailboxPath,
  type LocalImapFolderRow,
  type LocalImapMessageRow,
} from "./imapSync";
import {
  buildGoogleAuthorizationCodeParams,
  buildGoogleTokenExchangeDebugContext,
  buildGoogleRefreshTokenParams,
  formatGoogleTokenExchangeError,
} from "./googleOAuth";
import crypto from "crypto"; // Used for PKCE code verifier / challenge generation
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import { parseStoredAttachments, shouldUseLocalMessageBody } from "./mailBodyCache";
import type {
  EmailLabel,
  GraphMailFolder,
  AiProvider,
  StoredAiProviderKey,
  StoredAiProviderKeys,
  GraphMailFolderListResponse,
  MicrosoftOAuthEnv,
  MicrosoftStoredToken,
  GoogleStoredToken,
  StoredImapAccount,
  AccountHealthSnapshot,
  BackupEnvelope,
  GmailMessageHeader,
  GmailMessagePart,
  GmailMessage,
  GmailMessageListResponse,
  GraphMessageAddress,
  GraphMessage,
  GraphMessageListResponse,
  FolderSyncResult,
  GraphFolderKey,
} from "./types";

// =============================================================================
// ELECTRON SETUP
// Handles both ESM default export and CommonJS-style electron import shapes.
// =============================================================================

const electronApi =
  (electron as unknown as { default?: typeof electron }).default ?? electron;
const { app, BrowserWindow, ipcMain, shell, safeStorage, dialog } = electronApi;

// Load .env only in development — packaged builds use real env vars.
// Prevents a rogue .env dropped next to the binary from hijacking OAuth config or API keys.
if (!app.isPackaged) {
  loadDotenv();
}

// Polyfill __filename / __dirname for ESM (not available natively in ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =============================================================================
// DATABASE SETUP
// SQLite database stored in Electron's userData directory (per-user, persisted).
// =============================================================================

const dbPath = path.join(app.getPath("userData"), "emails.db");
const db = new Database(dbPath);

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

const ALLOWED_MIGRATION_TABLES = new Set(["emails", "folders", "labels", "email_labels"]);
const SAFE_IDENTIFIER_RE = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
const SAFE_COLUMN_DEF_RE = /^[A-Z]+(\s+DEFAULT\s+('[^']*'|\d+))?$/i;

/**
 * Adds a column to an existing table only if it doesn't already exist.
 * Used for safe schema migrations without dropping/recreating the table.
 *
 * tableName, columnName, and definition are validated against strict allowlists
 * before being interpolated into SQL (PRAGMA/ALTER TABLE cannot use ? placeholders).
 */
function ensureColumn(
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

// =============================================================================
// FILE PATHS
// =============================================================================

/** Stores window size/position across sessions */
const stateFilePath = path.join(app.getPath("userData"), "window-state.json");

/** Stores non-secret app settings mirrored from the renderer */
const settingsFilePath = path.join(app.getPath("userData"), "ryze-settings.json");

/** Stores encrypted Microsoft OAuth tokens */
const microsoftTokenFilePath = path.join(
  app.getPath("userData"),
  "microsoft-oauth-tokens.json",
);

/** Stores encrypted Google OAuth tokens */
const googleTokenFilePath = path.join(
  app.getPath("userData"),
  "google-oauth-tokens.json",
);

/** Stores encrypted user-provided AI provider keys */
const aiProviderKeysFilePath = path.join(
  app.getPath("userData"),
  "ai-provider-keys.json",
);

/** Stores encrypted IMAP connection settings and app passwords */
const imapAccountsFilePath = path.join(
  app.getPath("userData"),
  "imap-accounts.json",
);

// =============================================================================
// TYPES & INTERFACES — moved to ./types.ts
// =============================================================================

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getGraphRetryDelayMs(response: Response, attempt: number) {
  const retryAfterHeader = response.headers.get("retry-after");
  const retryAfterSeconds = retryAfterHeader
    ? Number.parseInt(retryAfterHeader, 10)
    : NaN;

  if (Number.isFinite(retryAfterSeconds)) {
    return Math.max(retryAfterSeconds, 1) * 1000;
  }

  return Math.min(30_000, attempt * 5000);
}

// =============================================================================
// CONSTANTS
// =============================================================================

const activeFullSyncs = new Map<string, Promise<{ success: boolean }>>();

/** How long the local OAuth server waits for the browser callback (2 minutes) */
const oauthTimeoutMs = 2 * 60 * 1000;

/** Refresh the access token this many ms before it actually expires (1 minute early) */
const tokenRefreshLeadMs = 60 * 1000;

/** Max retry attempts for throttled/unavailable Graph API responses */
const maxGraphFetchAttempts = 4;

/** Well-known Microsoft Graph folder keys that are valid move destinations */
const allowedMoveDestinations = new Set<GraphFolderKey>([
  "inbox",
  "sentitems",
  "drafts",
  "archive",
  "deleteditems",
]);

// =============================================================================
// INPUT VALIDATION HELPERS
// These sanitize and validate data coming in over IPC before it touches the DB
// or any external API call.
// =============================================================================

// =============================================================================
// AUTO UPDATER
// =============================================================================

// Disable auto-download so we can prompt the user first
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.logger = console;

ipcMain.handle("app:get-version", () => app.getVersion());

ipcMain.handle("updater:check", () => {
  if (app.isPackaged) {
    autoUpdater.checkForUpdates();
  }
  return true;
});

ipcMain.handle("updater:start-download", () => {
  autoUpdater.downloadUpdate();
  return true;
});

ipcMain.handle("updater:install", () => {
  // isSilent=true → no NSIS installer window, isForceRunAfter=true → relaunch after install
  autoUpdater.quitAndInstall(true, true);
  return true;
});

// Broadcast events to the React frontend
autoUpdater.on("update-available", (info) => {
  const windows = BrowserWindow.getAllWindows();
  if (windows.length > 0) {
    windows[0].webContents.send("updater:available", info.version);
  }
});

autoUpdater.on("update-downloaded", () => {
  const windows = BrowserWindow.getAllWindows();
  if (windows.length > 0) {
    windows[0].webContents.send("updater:downloaded");
  }
});

autoUpdater.on("update-not-available", () => {
  console.log("[updater] No update available — already on latest version.");
});

autoUpdater.on("error", (err) => {
  console.error("[updater] Error:", err.message);
  const windows = BrowserWindow.getAllWindows();
  if (windows.length > 0) {
    windows[0].webContents.send("updater:error", err.message);
  }
});

function shouldSkipMessageSyncForFolder(folder: GraphMailFolder) {
  const displayName = (folder.displayName || "").toLowerCase().trim();
  const wellKnownName = (folder.wellKnownName || "").toLowerCase().trim();

  const skippedWellKnownNames = new Set([
    "outbox",
    "syncissues",
    "conflicts",
    "localfailures",
    "serverfailures",
  ]);

  const skippedDisplayNames = new Set([
    "sync issues",
    "conflicts",
    "local failures",
    "server failures",
    "outbox",
  ]);

  return (
    skippedWellKnownNames.has(wellKnownName) ||
    skippedDisplayNames.has(displayName)
  );
}

function getFolderSyncPriority(folder: GraphMailFolder) {
  const displayName = (folder.displayName || "").toLowerCase().trim();
  const wellKnownName = (folder.wellKnownName || "").toLowerCase().trim();

  if (wellKnownName === "inbox" || displayName === "inbox") return 0;
  if (wellKnownName === "sentitems" || displayName === "sent items") return 1;
  if (wellKnownName === "drafts" || displayName === "drafts") return 2;
  if (wellKnownName === "archive" || displayName === "archive") return 3;
  if (
    wellKnownName === "deleteditems" ||
    displayName === "deleted items" ||
    displayName === "trash"
  ) {
    return 4;
  }

  // Custom/user folders before Outlook diagnostic folders.
  if (!shouldSkipMessageSyncForFolder(folder)) return 10;

  return 999;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getMessageSyncFolders(folders: GraphMailFolder[]) {
  return [...folders]
    .filter((folder) => !shouldSkipMessageSyncForFolder(folder))
    .sort((a, b) => {
      const priorityDiff = getFolderSyncPriority(a) - getFolderSyncPriority(b);
      if (priorityDiff !== 0) return priorityDiff;

      return (a.path || a.displayName || "").localeCompare(
        b.path || b.displayName || "",
      );
    });
}

function getFolderDeltaLink(accountId: string, folderId: string) {
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

function saveFolderSyncState(
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

function upsertLocalGraphMessage(
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

function deleteLocalMessage(accountId: string, messageId: string) {
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

function clearFolderSyncState(accountId: string, folderId: string) {
  db.prepare(
    `
    DELETE FROM folder_sync_state
    WHERE accountId = ? AND folderId = ?
  `,
  ).run(accountId, folderId);
}

function getLabelsByMessageId(accountId: string) {
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

function getLocalInboxFolderId(accountId: string) {
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
 * Asserts that a value is a non-empty string within the given max length.
 * Throws a descriptive error if the check fails.
 */
function assertString(
  value: unknown,
  fieldName: string,
  maxLength = 4096,
): string {
  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be a string`);
  }

  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error(`${fieldName} is required`);
  }

  if (trimmed.length > maxLength) {
    throw new Error(`${fieldName} is too long`);
  }

  return trimmed;
}

/**
 * Like assertString, but allows null/undefined (returns '' in those cases).
 * Used for optional fields like CC or body.
 */
function getGeminiApiKey() {
  const storedKey = loadAiProviderKeys().gemini?.apiKey?.trim();
  const apiKey = storedKey || process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "Gemini API key is missing. Add it in Settings > AI & keys.",
    );
  }

  return apiKey;
}

function getGeminiModel() {
  const rawModel =
    loadBackendSettings().geminiModel ||
    process.env.GEMINI_MODEL?.trim() ||
    "gemini-2.5-flash";

  // Allow both:
  // GEMINI_MODEL=gemini-2.5-flash
  // GEMINI_MODEL=models/gemini-2.5-flash
  return rawModel.replace(/^models\//, "");
}

function getAiProvider() {
  const provider = loadBackendSettings().aiProvider;
  return provider === "ollama" ? "ollama" : "gemini";
}

function getOllamaConfig() {
  const settings = loadBackendSettings();
  const baseUrl = (settings.ollamaBaseUrl || "http://127.0.0.1:11434").trim();
  const model = (settings.ollamaModel || "llama3.2").trim();

  if (!model) {
    throw new Error("Ollama model is missing. Add it in Settings > AI & keys.");
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(baseUrl);
  } catch {
    throw new Error("Ollama server URL is invalid.");
  }

  const isLocalHost =
    parsedUrl.hostname === "localhost" ||
    parsedUrl.hostname === "127.0.0.1" ||
    parsedUrl.hostname === "::1";

  if (parsedUrl.protocol !== "http:" || !isLocalHost) {
    throw new Error("Ollama server URL must be a local http URL.");
  }

  return {
    baseUrl: parsedUrl.origin,
    model,
  };
}

function loadBackendSettings() {
  try {
    if (!fs.existsSync(settingsFilePath)) {
      return {} as {
        aiProvider?: string;
        geminiModel?: string;
        ollamaBaseUrl?: string;
        ollamaModel?: string;
      };
    }

    const parsed = JSON.parse(fs.readFileSync(settingsFilePath, "utf8"));
    return typeof parsed === "object" && parsed
      ? (parsed as {
          aiProvider?: string;
          geminiModel?: string;
          ollamaBaseUrl?: string;
          ollamaModel?: string;
        })
      : {};
  } catch (error) {
    console.error("Failed to load backend settings:", error);
    return {} as {
      aiProvider?: string;
      geminiModel?: string;
      ollamaBaseUrl?: string;
      ollamaModel?: string;
    };
  }
}
function getGeminiApiVersion() {
  return process.env.GEMINI_API_VERSION?.trim() || "v1";
}

/**
 * Server-side defense-in-depth strip for outgoing email HTML.
 * The renderer's ComposeDrawer already runs DOMPurify, so this catches anything
 * that slips through a compromised renderer before it reaches Microsoft Graph.
 * We only need to kill executable content — legitimate formatting must survive.
 */
function sanitizeOutgoingHtml(html: string): string {
  return html
    // Remove executable tags entirely (including their content)
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object[\s\S]*?<\/object>/gi, "")
    .replace(/<embed[\s\S]*?>/gi, "")
    // Strip inline event handlers (on* attributes)
    .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "")
    // Strip javascript: / vbscript: from href/src/action
    .replace(/(href|src|action)\s*=\s*["']?\s*(?:javascript|vbscript)\s*:[^"'>]*/gi, "");
}

function stripHtmlForAi(input: string) {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function limitAiInput(value: string, maxLength = 12_000) {
  if (value.length <= maxLength) return value;

  return `${value.slice(0, maxLength)}\n\n[Email content truncated for privacy and performance.]`;
}

function extractJsonObject(value: string) {
  const trimmed = value.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fencedMatch?.[1] || trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  return candidate.slice(start, end + 1);
}

function normalizeAiSummaryResult(rawText: string) {
  const jsonText = extractJsonObject(rawText);

  if (jsonText) {
    try {
      const parsed = JSON.parse(jsonText) as {
        summary?: unknown;
        keyPoints?: unknown;
        suggestedActions?: unknown;
      };

      const summary =
        typeof parsed.summary === "string" ? parsed.summary.trim() : "";
      const keyPoints = Array.isArray(parsed.keyPoints)
        ? parsed.keyPoints
            .filter((item): item is string => typeof item === "string")
            .map((item) => item.trim())
            .filter(Boolean)
            .slice(0, 5)
        : [];
      const suggestedActions = Array.isArray(parsed.suggestedActions)
        ? parsed.suggestedActions
            .filter((item): item is string => typeof item === "string")
            .map((item) => item.trim())
            .filter(Boolean)
            .slice(0, 3)
        : [];

      if (summary || keyPoints.length > 0 || suggestedActions.length > 0) {
        return {
          summary,
          keyPoints,
          suggestedActions,
        };
      }
    } catch {
      // Fall back to using the raw model text as a summary.
    }
  }

  return {
    summary: rawText.trim(),
    keyPoints: [] as string[],
    suggestedActions: [] as string[],
  };
}

function validateAiEmailPayload(payload: any) {
  return {
    subject: optionalString(payload?.subject, "subject", 512),
    senderName: optionalString(payload?.senderName, "senderName", 256),
    senderEmail: optionalString(payload?.senderEmail, "senderEmail", 512),
    body: optionalString(payload?.body, "body", 500_000),
    preview: optionalString(payload?.preview, "preview", 5000),
  };
}

function validateAiReplyPayload(payload: any) {
  return {
    ...validateAiEmailPayload(payload),
    tone: optionalString(payload?.tone, "tone", 32).toLowerCase(),
  };
}

function normalizeAiReplyResult(rawText: string) {
  const jsonText = extractJsonObject(rawText);

  if (jsonText) {
    try {
      const parsed = JSON.parse(jsonText) as { reply?: unknown };
      const reply = typeof parsed.reply === "string" ? parsed.reply.trim() : "";
      if (reply) return reply;
    } catch {
      // Fall back to plain text extraction.
    }
  }

  return rawText.trim();
}

function sanitizeBackendSettings(settings: unknown) {
  const value = settings && typeof settings === "object" ? settings as Record<string, unknown> : {};
  const aiProvider = optionalString(value.aiProvider, "aiProvider", 32).trim();
  const geminiModel = optionalString(value.geminiModel, "geminiModel", 64).trim();
  const ollamaBaseUrl = optionalString(value.ollamaBaseUrl, "ollamaBaseUrl", 512).trim();
  const ollamaModel = optionalString(value.ollamaModel, "ollamaModel", 128).trim();

  return {
    aiProvider: aiProvider === "ollama" ? "ollama" : "gemini",
    geminiModel: geminiModel || "gemini-2.5-flash",
    ollamaBaseUrl: ollamaBaseUrl || "http://127.0.0.1:11434",
    ollamaModel: ollamaModel || "llama3.2",
  };
}

function sanitizeDraftsPayload(drafts: unknown) {
  if (!Array.isArray(drafts)) {
    throw new Error("drafts must be an array");
  }

  return drafts.slice(0, 20).map((draft, index) => {
    const value = draft && typeof draft === "object" ? draft as Record<string, unknown> : {};
    const id = optionalString(value.id, `drafts[${index}].id`, 128).trim();

    return {
      id: id || `draft-${crypto.randomUUID()}`,
      to: optionalString(value.to, `drafts[${index}].to`, 4096),
      cc: optionalString(value.cc, `drafts[${index}].cc`, 4096),
      subject: optionalString(value.subject, `drafts[${index}].subject`, 512),
      body: sanitizeOutgoingHtml(
        optionalString(value.body, `drafts[${index}].body`, 500_000),
      ),
      isMinimized: Boolean(value.isMinimized),
      isFullscreen: Boolean(value.isFullscreen),
      scheduledSendAt:
        optionalString(value.scheduledSendAt, `drafts[${index}].scheduledSendAt`, 64) ||
        undefined,
      aiTone: optionalString(value.aiTone, `drafts[${index}].aiTone`, 32) || undefined,
      aiHint: optionalString(value.aiHint, `drafts[${index}].aiHint`, 2048) || undefined,
    };
  });
}

function optionalString(
  value: unknown,
  fieldName: string,
  maxLength = 4096,
): string {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be a string`);
  }

  if (value.length > maxLength) {
    throw new Error(`${fieldName} is too long`);
  }

  return value;
}

/**
 * Validates an accountId string.
 * Must follow the pattern: (ms|google)-<alphanumeric/dot/dash/underscore>
 */
function validateAccountId(accountId: unknown): string {
  const value = assertString(accountId, "accountId", 256);

  if (!isValidAccountId(value)) {
    throw new Error("Invalid accountId");
  }

  return value;
}

/**
 * Validates a Microsoft Graph message ID (opaque string, just length-checks it).
 */
function validateMessageId(messageId: unknown): string {
  return assertString(messageId, "messageId", 2048);
}

function validateLabelId(labelId: unknown): string {
  const value = assertString(labelId, "labelId", 128);

  if (!/^label-[A-Za-z0-9._-]+$/.test(value)) {
    throw new Error("Invalid labelId");
  }

  return value;
}

function validateLabelName(name: unknown): string {
  const value = assertString(name, "name", 64).replace(/\s+/g, " ").trim();

  if (value.length < 2) {
    throw new Error("Label name must be at least 2 characters");
  }

  return value;
}

function validateFolderName(name: unknown): string {
  const value = assertString(name, "folderName", 64)
    .replace(/\s+/g, " ")
    .trim();

  if (value.length < 2) {
    throw new Error("Folder name must be at least 2 characters");
  }

  const reservedNames = new Set([
    "inbox",
    "sent",
    "sent items",
    "drafts",
    "archive",
    "deleted items",
    "trash",
    "junk",
    "junk email",
    "outbox",
  ]);

  if (reservedNames.has(value.toLowerCase())) {
    throw new Error("That folder name is reserved by the mail provider.");
  }

  if (/[\\/:*?"<>|]/.test(value)) {
    throw new Error("Folder name contains invalid characters.");
  }

  return value;
}

function validateLabelColor(color: unknown): string {
  const value = optionalString(color, "color", 16).trim() || "#C9A84C";

  if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
    throw new Error("Invalid label color");
  }

  return value;
}

function validateFolderId(folderId: unknown): string {
  return assertString(folderId, "folderId", 2048);
}
const allowedFolderIcons = new Set([
  "folder",
  "briefcase",
  "users",
  "star",
  "heart",
  "home",
  "receipt",
  "shopping",
  "travel",
  "code",
  "bank",
  "alert",
  "archive",
  "tag",
]);

function validateFolderIcon(icon: unknown): string {
  const value = optionalString(icon, "icon", 64).trim();

  if (!value) {
    return "folder";
  }

  if (!allowedFolderIcons.has(value)) {
    throw new Error("Invalid folder icon");
  }

  return value;
}

/**
 * Validates and normalizes a folder destination for move operations.
 * Only allows the well-known folder keys defined in allowedMoveDestinations.
 */
function validateDestinationFolder(destinationFolder: unknown): GraphFolderKey {
  const folder = assertString(
    destinationFolder,
    "destinationFolder",
    64,
  ).toLowerCase() as GraphFolderKey;

  if (!allowedMoveDestinations.has(folder)) {
    throw new Error("Invalid destination folder");
  }

  return folder;
}

// =============================================================================
// HTML / EMAIL FORMATTING HELPERS
// =============================================================================

// =============================================================================
// EMAIL RECIPIENT HELPERS
// =============================================================================

function getFolderAndDescendantIds(accountId: string, folderId: string) {
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

/**
 * Parses a comma-separated list of email addresses into the Graph API recipient format.
 * Throws if any address fails basic validation.
 */
function parseRecipients(emailsString: string) {
  if (!emailsString) return [];

  return emailsString
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean)
    .map((email) => {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error(`Invalid email address: ${email}`);
      }

      return {
        emailAddress: {
          address: email,
        },
      };
    });
}

// =============================================================================
// CRYPTO HELPERS
// =============================================================================

/**
 * Converts a Buffer or string to a URL-safe Base64 string (no padding).
 * Used for generating PKCE code verifier and challenge values.
 */
function toBase64Url(value: Buffer | string) {
  const base = Buffer.isBuffer(value)
    ? value.toString("base64")
    : Buffer.from(value).toString("base64");

  return base.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

// =============================================================================
// MICROSOFT OAUTH CONFIGURATION
// =============================================================================

/**
 * Reads and validates Microsoft OAuth config from environment variables.
 * Supports both VITE_-prefixed and plain env var names for flexibility.
 *
 * Required env vars:
 *   MICROSOFT_OAUTH_CLIENT_ID (or VITE_MICROSOFT_OAUTH_CLIENT_ID)
 *   MICROSOFT_OAUTH_REDIRECT_URI (or VITE_MICROSOFT_OAUTH_REDIRECT_URI)
 *
 * Optional:
 *   MICROSOFT_OAUTH_TENANT_ID   (defaults to 'common')
 *   MICROSOFT_OAUTH_SCOPE       (defaults to openid + mail scopes)
 */
function getMicrosoftOAuthEnv(): MicrosoftOAuthEnv {
  const clientId =
    process.env.MICROSOFT_OAUTH_CLIENT_ID?.trim() ||
    process.env.VITE_MICROSOFT_OAUTH_CLIENT_ID?.trim();

  const tenantId = process.env.MICROSOFT_OAUTH_TENANT_ID?.trim() || "common";

  const redirectUri =
    process.env.MICROSOFT_OAUTH_REDIRECT_URI?.trim() ||
    process.env.VITE_MICROSOFT_OAUTH_REDIRECT_URI?.trim() ||
    "http://127.0.0.1:42813/auth/microsoft/callback";

  const scope =
    process.env.MICROSOFT_OAUTH_SCOPE?.trim() ||
    "openid profile offline_access User.Read Mail.Read Mail.ReadWrite Mail.Send Calendars.Read";

  if (!clientId) {
    throw new Error("Missing MICROSOFT_OAUTH_CLIENT_ID");
  }

  if (!/^[0-9a-fA-F-]{36}$/.test(clientId)) {
    throw new Error(
      "MICROSOFT_OAUTH_CLIENT_ID must be the Azure Application client ID GUID, not a client secret value",
    );
  }

  if (!redirectUri) {
    throw new Error("Missing MICROSOFT_OAUTH_REDIRECT_URI");
  }

  const parsedRedirect = new URL(redirectUri);

  if (
    !["127.0.0.1", "localhost"].includes(parsedRedirect.hostname) ||
    parsedRedirect.protocol !== "http:"
  ) {
    throw new Error(
      "MICROSOFT_OAUTH_REDIRECT_URI must be a localhost loopback URL",
    );
  }

  if (!parsedRedirect.port) {
    throw new Error(
      "MICROSOFT_OAUTH_REDIRECT_URI must include an explicit port, for example: http://127.0.0.1:42813/auth/microsoft/callback",
    );
  }

  return {
    clientId,
    tenantId,
    redirectUri,
    scope,
  };
}

function getMicrosoftOAuthRefreshConfig(
  token: MicrosoftStoredToken,
): Pick<MicrosoftOAuthEnv, "clientId" | "tenantId" | "scope"> {
  const clientId = token.clientId?.trim();
  const tenantId = token.tenantId?.trim();
  const scope = token.oauthScope?.trim();

  if (clientId && tenantId && scope) {
    if (!/^[0-9a-fA-F-]{36}$/.test(clientId)) {
      throw new Error(
        "Stored Microsoft OAuth client ID is invalid. Please reconnect the account.",
      );
    }

    return {
      clientId,
      tenantId,
      scope,
    };
  }

  try {
    const env = getMicrosoftOAuthEnv();
    return {
      clientId: env.clientId,
      tenantId: env.tenantId,
      scope: env.scope,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Missing MICROSOFT_OAUTH_CLIENT_ID"
    ) {
      throw new Error(
        "Microsoft OAuth config is missing and this account token needs refresh. Please reconnect the account.",
      );
    }

    throw error;
  }
}

// =============================================================================
// MICROSOFT TOKEN STORAGE
// Tokens are encrypted at rest using Electron's safeStorage (OS keychain-backed).
// =============================================================================

/**
 * Loads all stored Microsoft OAuth tokens from disk, decrypting them with safeStorage.
 * Returns an empty object if no tokens exist or decryption fails.
 */
function loadMicrosoftTokens() {
  try {
    if (!fs.existsSync(microsoftTokenFilePath)) {
      return {} as Record<string, MicrosoftStoredToken>;
    }

    const fileContents = fs.readFileSync(microsoftTokenFilePath, "utf8");
    if (!fileContents) {
      return {} as Record<string, MicrosoftStoredToken>;
    }

    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error("Secure token storage is not available on this system");
    }

    const decoded = safeStorage.decryptString(
      Buffer.from(fileContents, "base64"),
    );
    return JSON.parse(decoded) as Record<string, MicrosoftStoredToken>;
  } catch (error) {
    console.error("Failed to load stored Microsoft tokens:", error);
    return {} as Record<string, MicrosoftStoredToken>;
  }
}

/**
 * Encrypts and writes all Microsoft OAuth tokens to disk.
 * File is written with mode 0o600 (owner read/write only).
 */
function saveMicrosoftTokens(tokens: Record<string, MicrosoftStoredToken>) {
  try {
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error("Secure token storage is not available on this system");
    }

    const payload = JSON.stringify(tokens);
    const content = safeStorage.encryptString(payload).toString("base64");

    fs.writeFileSync(microsoftTokenFilePath, content, {
      encoding: "utf8",
      mode: 0o600,
    });
  } catch (error) {
    console.error("Failed to save Microsoft tokens:", error);
    throw error;
  }
}

// =============================================================================
// GOOGLE OAUTH CONFIG
// Credentials are baked into the bundle at build time from .env via vite.config.ts.
// =============================================================================

const GOOGLE_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID || "";

const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET || "";

const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_OAUTH_REDIRECT_URI || "http://127.0.0.1:53682";

const GOOGLE_SCOPE =
  "openid email profile " +
  "https://www.googleapis.com/auth/gmail.readonly " +
  "https://www.googleapis.com/auth/gmail.modify " +
  "https://www.googleapis.com/auth/gmail.send";

// Gmail system labels mapped to folder-like display names
const GMAIL_SYSTEM_FOLDERS = [
  { id: "INBOX",   displayName: "Inbox",   wellKnownName: "inbox",       depth: 0, path: "Inbox" },
  { id: "SENT",    displayName: "Sent",    wellKnownName: "sentitems",   depth: 0, path: "Sent" },
  { id: "DRAFT",   displayName: "Drafts",  wellKnownName: "drafts",      depth: 0, path: "Drafts" },
  { id: "ARCHIVE", displayName: "Archive", wellKnownName: "archive",     depth: 0, path: "Archive" },
  { id: "TRASH",   displayName: "Trash",   wellKnownName: "deleteditems",depth: 0, path: "Trash" },
  { id: "STARRED", displayName: "Starred", wellKnownName: "",            depth: 0, path: "Starred" },
  { id: "SPAM",    displayName: "Spam",    wellKnownName: "junkmail",    depth: 0, path: "Spam" },
];

// =============================================================================
// GOOGLE TOKEN STORAGE
// =============================================================================

function loadGoogleTokens(): Record<string, GoogleStoredToken> {
  try {
    if (!fs.existsSync(googleTokenFilePath)) return {};
    const fileContents = fs.readFileSync(googleTokenFilePath, "utf8");
    if (!fileContents) return {};
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error("Secure token storage is not available on this system");
    }
    const decoded = safeStorage.decryptString(Buffer.from(fileContents, "base64"));
    return JSON.parse(decoded) as Record<string, GoogleStoredToken>;
  } catch (error) {
    console.error("Failed to load stored Google tokens:", error);
    return {};
  }
}

function saveGoogleTokens(tokens: Record<string, GoogleStoredToken>) {
  try {
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error("Secure token storage is not available on this system");
    }
    const content = safeStorage.encryptString(JSON.stringify(tokens)).toString("base64");
    fs.writeFileSync(googleTokenFilePath, content, { encoding: "utf8", mode: 0o600 });
  } catch (error) {
    console.error("Failed to save Google tokens:", error);
    throw error;
  }
}

// =============================================================================
// IMAP ACCOUNT STORAGE
// =============================================================================

function loadImapAccounts(): Record<string, StoredImapAccount> {
  try {
    if (!fs.existsSync(imapAccountsFilePath)) return {};
    const fileContents = fs.readFileSync(imapAccountsFilePath, "utf8");
    if (!fileContents) return {};

    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error("Secure IMAP account storage is not available on this system");
    }

    const decoded = safeStorage.decryptString(Buffer.from(fileContents, "base64"));
    return JSON.parse(decoded) as Record<string, StoredImapAccount>;
  } catch (error) {
    console.error("Failed to load stored IMAP accounts:", error);
    return {};
  }
}

function saveImapAccounts(accounts: Record<string, StoredImapAccount>) {
  try {
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error("Secure IMAP account storage is not available on this system");
    }

    const content = safeStorage.encryptString(JSON.stringify(accounts)).toString("base64");
    fs.writeFileSync(imapAccountsFilePath, content, { encoding: "utf8", mode: 0o600 });
  } catch (error) {
    console.error("Failed to save IMAP accounts:", error);
    throw error;
  }
}

function upsertImapSystemFolders(accountId: string) {
  const folders = [
    { id: "INBOX", displayName: "Inbox", wellKnownName: "inbox", path: "Inbox" },
    { id: "Sent", displayName: "Sent", wellKnownName: "sentitems", path: "Sent" },
    { id: "Drafts", displayName: "Drafts", wellKnownName: "drafts", path: "Drafts" },
    { id: "Archive", displayName: "Archive", wellKnownName: "archive", path: "Archive" },
    { id: "Trash", displayName: "Trash", wellKnownName: "deleteditems", path: "Trash" },
    { id: "Junk", displayName: "Junk", wellKnownName: "junkmail", path: "Junk" },
  ];

  const statement = db.prepare(`
    INSERT INTO folders (id, accountId, displayName, parentFolderId, wellKnownName, totalItemCount, unreadItemCount, depth, path)
    VALUES (@id, @accountId, @displayName, NULL, @wellKnownName, 0, 0, 0, @path)
    ON CONFLICT(accountId, id) DO UPDATE SET
      displayName = excluded.displayName,
      wellKnownName = excluded.wellKnownName,
      path = excluded.path
  `);

  db.transaction(() => {
    for (const folder of folders) {
      statement.run({ ...folder, accountId });
    }
  })();
}

function upsertImapFolders(rows: LocalImapFolderRow[]) {
  const statement = db.prepare(`
    INSERT INTO folders (id, accountId, displayName, parentFolderId, wellKnownName, totalItemCount, unreadItemCount, depth, path)
    VALUES (@id, @accountId, @displayName, @parentFolderId, @wellKnownName, @totalItemCount, @unreadItemCount, @depth, @path)
    ON CONFLICT(accountId, id) DO UPDATE SET
      displayName = excluded.displayName,
      parentFolderId = excluded.parentFolderId,
      wellKnownName = excluded.wellKnownName,
      totalItemCount = excluded.totalItemCount,
      unreadItemCount = excluded.unreadItemCount,
      depth = excluded.depth,
      path = excluded.path
  `);

  db.transaction(() => {
    for (const row of rows) {
      statement.run(row);
    }
  })();
}

function upsertImapMessage(row: LocalImapMessageRow) {
  db.prepare(`
    INSERT INTO emails (
      id, accountId, folder, subject, bodyPreview, bodyContentType, bodyContent,
      receivedDateTime, isRead, hasAttachments, isStarred, fromName, fromAddress,
      toRecipients, ccRecipients
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      accountId = excluded.accountId,
      folder = excluded.folder,
      subject = excluded.subject,
      bodyPreview = excluded.bodyPreview,
      bodyContentType = excluded.bodyContentType,
      bodyContent = excluded.bodyContent,
      receivedDateTime = excluded.receivedDateTime,
      isRead = excluded.isRead,
      hasAttachments = excluded.hasAttachments,
      isStarred = excluded.isStarred,
      fromName = excluded.fromName,
      fromAddress = excluded.fromAddress,
      toRecipients = excluded.toRecipients,
      ccRecipients = excluded.ccRecipients
  `).run(
    row.id,
    row.accountId,
    row.folder,
    row.subject,
    row.bodyPreview,
    row.bodyContentType,
    row.bodyContent,
    row.receivedDateTime,
    row.isRead,
    row.hasAttachments,
    row.isStarred,
    row.fromName,
    row.fromAddress,
    row.toRecipients,
    row.ccRecipients,
  );
}

async function syncImapAccount(accountId: string) {
  const accounts = loadImapAccounts();
  const config = accounts[accountId];

  if (!config) {
    throw new Error("No IMAP account stored for this account.");
  }

  const client = new ImapFlow({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.username,
      pass: config.password,
    },
    logger: false,
  });

  try {
    await client.connect();

    const mailboxes = await client.list();
    const folderRows = buildImapFolderRows(accountId, mailboxes as any[]);
    upsertImapFolders(folderRows);

    const inboxFolder =
      folderRows.find((folder) => folder.wellKnownName === "inbox") ||
      folderRows.find((folder) => normalizeImapMailboxPath(folder.id).toUpperCase() === "INBOX");

    if (!inboxFolder) {
      return {
        folders: getLocalFolders(accountId),
        messagesByFolder: getLocalMessagesByFolder(accountId),
        syncedCount: 0,
      };
    }

    const mailbox = await client.mailboxOpen(inboxFolder.id, { readOnly: true });
    const exists = Number(mailbox.exists || 0);
    const start = Math.max(1, exists - 49);
    let syncedCount = 0;

    if (exists > 0) {
      for await (const message of client.fetch(
        `${start}:*`,
        {
          uid: true,
          envelope: true,
          flags: true,
          source: true,
        },
        { uid: false },
      )) {
        const mapped = mapImapMessageToLocalMessage({
          accountId,
          folderId: inboxFolder.id,
          uid: message.uid,
          flags: message.flags as Set<string>,
          envelope: message.envelope as any,
          source: message.source as Buffer,
        });
        upsertImapMessage(mapped);
        syncedCount += 1;
      }
    }

    saveFolderSyncState(accountId, inboxFolder.id, "", "full");

    return {
      folders: getLocalFolders(accountId),
      messagesByFolder: getLocalMessagesByFolder(accountId),
      syncedCount,
    };
  } finally {
    await client.logout().catch(() => undefined);
  }
}

// =============================================================================
// GOOGLE TOKEN REFRESH
// =============================================================================

const activeGoogleTokenRefreshPromises = new Map<string, Promise<string>>();

async function getValidGoogleAccessToken(accountId: string): Promise<string> {
  const tokens = loadGoogleTokens();
  const token = tokens[accountId];

  if (!token) throw new Error("No Google token stored for this account");
  if (token.expiresAt > Date.now() + tokenRefreshLeadMs) return token.accessToken;
  if (!token.refreshToken) {
    throw new Error("Google refresh token missing. Please reconnect the account.");
  }

  const existing = activeGoogleTokenRefreshPromises.get(accountId);
  if (existing) return existing;

  const refreshPromise = (async () => {
    try {
      const clientId = token.clientId || GOOGLE_CLIENT_ID;
      const params = buildGoogleRefreshTokenParams({
        clientId,
        clientSecret: GOOGLE_CLIENT_SECRET,
        refreshToken: token.refreshToken!,
      });

      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(formatGoogleTokenExchangeError(response.status, errorText));
      }

      const refreshed = (await response.json()) as {
        access_token: string;
        expires_in: number;
        scope?: string;
        token_type: string;
      };

      const latestTokens = loadGoogleTokens();
      latestTokens[accountId] = {
        ...token,
        accessToken: refreshed.access_token,
        expiresAt: Date.now() + refreshed.expires_in * 1000,
        scope: refreshed.scope || token.scope,
        tokenType: refreshed.token_type || token.tokenType,
        clientId,
      };
      saveGoogleTokens(latestTokens);
      return latestTokens[accountId].accessToken;
    } finally {
      activeGoogleTokenRefreshPromises.delete(accountId);
    }
  })();

  activeGoogleTokenRefreshPromises.set(accountId, refreshPromise);
  return refreshPromise;
}

// =============================================================================
// GMAIL API — HELPERS
// =============================================================================

function gmailParseHeader(headers: GmailMessageHeader[], name: string): string {
  return headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";
}

function gmailParseAddress(raw: string): { name: string; address: string } {
  const match = /^(.*?)\s*<([^>]+)>$/.exec(raw.trim());
  if (match) return { name: match[1].replace(/^"|"$/g, "").trim(), address: match[2].trim() };
  return { name: "", address: raw.trim() };
}

function gmailExtractBody(part: GmailMessagePart | undefined): { content: string; contentType: "text" | "html" } {
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

function gmailUpsertFolders(accountId: string) {
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

function gmailUpsertMessage(accountId: string, folderId: string, msg: GmailMessage) {
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

async function gmailFetchMessagesForLabel(
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

function loadAiProviderKeys(): StoredAiProviderKeys {
  try {
    if (!fs.existsSync(aiProviderKeysFilePath)) {
      return {};
    }

    const fileContents = fs.readFileSync(aiProviderKeysFilePath, "utf8");
    if (!fileContents) {
      return {};
    }

    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error("Secure AI key storage is not available on this system");
    }

    const decoded = safeStorage.decryptString(
      Buffer.from(fileContents, "base64"),
    );
    return JSON.parse(decoded) as StoredAiProviderKeys;
  } catch (error) {
    console.error("Failed to load stored AI provider keys:", error);
    return {};
  }
}

function saveAiProviderKeys(keys: StoredAiProviderKeys) {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error("Secure AI key storage is not available on this system");
  }

  const payload = JSON.stringify(keys);
  const content = safeStorage.encryptString(payload).toString("base64");

  fs.writeFileSync(aiProviderKeysFilePath, content, {
    encoding: "utf8",
    mode: 0o600,
  });
}

function getAiProviderKeyStatus(provider: AiProvider) {
  const stored = loadAiProviderKeys()[provider];
  const environmentKey =
    provider === "gemini" ? process.env.GEMINI_API_KEY?.trim() : "";

  return {
    provider,
    configured: Boolean(stored?.apiKey || environmentKey),
    source: stored?.apiKey ? "local" : environmentKey ? "environment" : null,
    updatedAt: stored?.updatedAt || null,
    encryptionAvailable: safeStorage.isEncryptionAvailable(),
  };
}

// =============================================================================
// MICROSOFT TOKEN REFRESH
// =============================================================================

/**
 * Exchanges a refresh token for a new access token via the Microsoft token endpoint.
 * Handles optional client secret (public vs confidential client apps).
 */
async function exchangeRefreshToken(
  refreshToken: string,
  clientId: string,
  tenantId: string,
  scope: string,
) {
  const authority = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0`;
  const refreshParams = new URLSearchParams({
    client_id: clientId,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    scope,
  });

  const refreshResponse = await fetch(`${authority}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: refreshParams.toString(),
  });

  if (!refreshResponse.ok) {
    const errorText = await refreshResponse.text();
    throw new Error(
      `Microsoft refresh token exchange failed (${refreshResponse.status}): ${errorText}`,
    );
  }

  return (await refreshResponse.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope: string;
    token_type: string;
  };
}

// Use a Map keyed by accountId instead of a single global promise
const activeTokenRefreshPromises = new Map<string, Promise<string>>();

async function getValidMicrosoftAccessToken(accountId: string) {
  const tokens = loadMicrosoftTokens();
  const token = tokens[accountId];

  if (!token) throw new Error("No Microsoft token stored for this account");
  if (token.expiresAt > Date.now() + tokenRefreshLeadMs) {
    return token.accessToken;
  }
  if (!token.refreshToken) {
    throw new Error(
      "Microsoft refresh token missing. Please reconnect the account.",
    );
  }

  // Return existing in-flight refresh for THIS account only
  const existing = activeTokenRefreshPromises.get(accountId);
  if (existing) return existing;

  const refreshPromise = (async () => {
    try {
      const { clientId, tenantId, scope } =
        getMicrosoftOAuthRefreshConfig(token);
      const refreshed = await exchangeRefreshToken(
        token.refreshToken!,
        clientId,
        tenantId,
        scope,
      );
      const latestTokens = loadMicrosoftTokens();
      latestTokens[accountId] = {
        ...token,
        accessToken: refreshed.access_token,
        refreshToken: refreshed.refresh_token || token.refreshToken,
        expiresAt: Date.now() + refreshed.expires_in * 1000,
        scope: refreshed.scope || token.scope,
        tokenType: refreshed.token_type || token.tokenType,
        clientId,
        tenantId,
        oauthScope: scope,
      };
      saveMicrosoftTokens(latestTokens);
      return latestTokens[accountId].accessToken;
    } finally {
      activeTokenRefreshPromises.delete(accountId);
    }
  })();

  activeTokenRefreshPromises.set(accountId, refreshPromise);
  return refreshPromise;
}

// =============================================================================
// MICROSOFT GRAPH API — FETCH HELPERS
// =============================================================================

/**
 * Fetches messages from a specific mail folder (top 50, sorted by newest first).
 * Retries on rate-limit (429) and server errors (503/504) up to maxGraphFetchAttempts.
 */
async function fetchGraphFolderMessages(accessToken: string, folderId: string) {
  const query = new URLSearchParams({
    $top: "100",
    $orderby: "receivedDateTime desc",
    $select:
      "id,subject,bodyPreview,receivedDateTime,isRead,hasAttachments,from,toRecipients,ccRecipients,flag", // <--- Added ,flag
  });

  const encodedFolderId = encodeURIComponent(folderId);

  let nextUrl: string | undefined =
    `https://graph.microsoft.com/v1.0/me/mailFolders/${encodedFolderId}/messages?${query.toString()}`;

  const allMessages: GraphMessage[] = [];

  while (nextUrl) {
    let page: GraphMessageListResponse | null = null;

    for (let attempt = 1; attempt <= maxGraphFetchAttempts; attempt += 1) {
      const response = await fetch(nextUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        page = (await response.json()) as GraphMessageListResponse;
        break;
      }

      const errorText = await response.text();

      const shouldRetry =
        response.status === 429 ||
        response.status === 500 ||
        response.status === 502 ||
        response.status === 503 ||
        response.status === 504;

      if (!shouldRetry || attempt === maxGraphFetchAttempts) {
        throw new Error(
          `Microsoft Graph messages request failed (${response.status}) for folder ${folderId}: ${errorText}`,
        );
      }

      await sleep(getGraphRetryDelayMs(response, attempt));
    }

    if (!page) {
      break;
    }

    allMessages.push(...page.value);
    nextUrl = page["@odata.nextLink"];

    // Small pause so large mailboxes do not hammer Microsoft Graph.
    await sleep(80);
  }

  return {
    value: allMessages,
  } satisfies GraphMessageListResponse;
}

async function fetchGraphFolderMessagesDeltaPage(
  accessToken: string,
  url: string,
) {
  for (let attempt = 1; attempt <= maxGraphFetchAttempts; attempt += 1) {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Prefer: "odata.maxpagesize=100",
      },
    });

    if (response.ok) {
      return (await response.json()) as GraphMessageListResponse;
    }

    const errorText = await response.text();

    const shouldRetry =
      response.status === 429 ||
      response.status === 500 ||
      response.status === 502 ||
      response.status === 503 ||
      response.status === 504;

    if (!shouldRetry || attempt === maxGraphFetchAttempts) {
      throw new Error(
        `Microsoft Graph message delta request failed (${response.status}): ${errorText}`,
      );
    }

    await sleep(getGraphRetryDelayMs(response, attempt));
  }

  throw new Error("Microsoft Graph message delta request failed after retries");
}

async function syncFolderInitialFullDelta(
  accessToken: string,
  accountId: string,
  folderId: string,
): Promise<FolderSyncResult> {
  const query = new URLSearchParams({
    $select:
      "id,subject,bodyPreview,receivedDateTime,isRead,hasAttachments,from,toRecipients,ccRecipients,flag", // <--- Added ,flag
  });

  let nextUrl: string | undefined =
    `https://graph.microsoft.com/v1.0/me/mailFolders/${encodeURIComponent(
      folderId,
    )}/messages/delta?${query.toString()}`;

  let deltaLink = "";
  let syncedCount = 0;

  while (nextUrl) {
    const page = await fetchGraphFolderMessagesDeltaPage(accessToken, nextUrl);

    const writePage = db.transaction(() => {
      for (const message of page.value) {
        if (message["@removed"]) {
          deleteLocalMessage(accountId, message.id);
          continue;
        }

        upsertLocalGraphMessage(accountId, folderId, message);
        syncedCount += 1;
      }
    });

    writePage();

    if (page["@odata.deltaLink"]) {
      deltaLink = page["@odata.deltaLink"];
      break;
    }

    nextUrl = page["@odata.nextLink"];

    await sleep(80);
  }

  if (!deltaLink) {
    throw new Error(
      `Microsoft Graph did not return a deltaLink for folder ${folderId}`,
    );
  }

  saveFolderSyncState(accountId, folderId, deltaLink, "full");

  return {
    success: true,
    syncedCount,
    deltaLink,
  };
}

async function syncFolderDelta(
  accessToken: string,
  accountId: string,
  folderId: string,
): Promise<FolderSyncResult> {
  const deltaLink = getFolderDeltaLink(accountId, folderId);

  if (!deltaLink) {
    return syncFolderInitialFullDelta(accessToken, accountId, folderId);
  }

  let nextUrl: string | undefined = deltaLink;
  let updatedCount = 0;
  let deletedCount = 0;
  let nextDeltaLink = "";

  try {
    while (nextUrl) {
      const page = await fetchGraphFolderMessagesDeltaPage(
        accessToken,
        nextUrl,
      );

      const writePage = db.transaction(() => {
        for (const message of page.value) {
          if (message["@removed"]) {
            deleteLocalMessage(accountId, message.id);
            deletedCount += 1;
            continue;
          }

          upsertLocalGraphMessage(accountId, folderId, message);
          updatedCount += 1;
        }
      });

      writePage();

      if (page["@odata.deltaLink"]) {
        nextDeltaLink = page["@odata.deltaLink"];
        break;
      }

      nextUrl = page["@odata.nextLink"];

      await sleep(50);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    // Delta links can expire. When that happens, reset this folder and full-sync it again.
    if (
      message.includes("410") ||
      message.toLowerCase().includes("sync state") ||
      message.toLowerCase().includes("deltalink")
    ) {
      clearFolderSyncState(accountId, folderId);
      return syncFolderInitialFullDelta(accessToken, accountId, folderId);
    }

    throw error;
  }

  if (nextDeltaLink) {
    saveFolderSyncState(accountId, folderId, nextDeltaLink, "delta");
  }

  return {
    success: true,
    updatedCount,
    deletedCount,
  };
}

async function syncMailboxInitialFull(accountId: string) {
  const accessToken = await getValidMicrosoftAccessToken(accountId);
  const foldersResponse = await fetchGraphMailFolders(accessToken);
  const folders = Array.isArray(foldersResponse)
    ? foldersResponse
    : foldersResponse.value || [];
  const foldersToSync = getMessageSyncFolders(folders);

  console.log(
    `[sync] Initial full sync for ${accountId}: ${folders.length} folders`,
  );
  console.log(`[sync] Message sync folders: ${foldersToSync.length}`);

  saveFoldersToLocalDb(accountId, folders);

  for (const folder of foldersToSync) {
    try {
      console.log(
        `[sync] Full delta sync folder: ${folder.displayName} (${folder.id})`,
      );
      const result = await syncFolderInitialFullDelta(
        accessToken,
        accountId,
        folder.id,
      );
      console.log(
        `[sync] Finished folder: ${folder.displayName} (${result.syncedCount ?? 0} messages)`,
      );
    } catch (error) {
      console.error(
        `[sync] Failed folder: ${folder.displayName} (${folder.id})`,
        error,
      );

      // Keep syncing other folders. One bad folder must not block the mailbox.
      clearFolderSyncState(accountId, folder.id);
    }
  }

  return { success: true };
}
/**
 * Fetches a single page of mail folders from the given URL.
 * Used by fetchGraphMailFolders to support pagination via @odata.nextLink.
 */

async function syncMailboxTargetedDelta(
  accountId: string,
  folderIds: string[],
) {
  const accessToken = await getValidMicrosoftAccessToken(accountId);
  const folders = getLocalFolders(accountId) as GraphMailFolder[];

  const folderIdSet = new Set(folderIds.filter(Boolean));
  const foldersToSync = getMessageSyncFolders(folders).filter((folder) =>
    folderIdSet.has(folder.id),
  );

  console.log(
    `[sync] Targeted delta sync for ${accountId}: ${foldersToSync.length} folders`,
  );

  for (const folder of foldersToSync) {
    try {
      const result = (await syncFolderDelta(
        accessToken,
        accountId,
        folder.id,
      )) as {
        success: boolean;
        updatedCount?: number;
        syncedCount?: number;
        deletedCount?: number;
      };

      console.log(
        `[sync] Targeted delta finished folder: ${folder.displayName} (${result.updatedCount ?? result.syncedCount ?? 0} changed, ${result.deletedCount ?? 0} deleted)`,
      );
    } catch (error) {
      console.error(
        `[sync] Targeted delta failed folder: ${folder.displayName} (${folder.id})`,
        error,
      );

      clearFolderSyncState(accountId, folder.id);
    }
  }

  return { success: true };
}

async function syncMailboxDelta(accountId: string) {
  const accessToken = await getValidMicrosoftAccessToken(accountId);
  const foldersResponse = await fetchGraphMailFolders(accessToken);
  const folders = Array.isArray(foldersResponse)
    ? foldersResponse
    : foldersResponse.value || [];
  const foldersToSync = getMessageSyncFolders(folders);

  console.log(`[sync] Delta sync for ${accountId}: ${folders.length} folders`);
  console.log(`[sync] Message delta folders: ${foldersToSync.length}`);

  saveFoldersToLocalDb(accountId, folders);

  for (const folder of foldersToSync) {
    try {
      const result = (await syncFolderDelta(
        accessToken,
        accountId,
        folder.id,
      )) as {
        success: boolean;
        updatedCount?: number;
        syncedCount?: number;
        deletedCount?: number;
      };

      const changedCount = result.updatedCount ?? result.syncedCount ?? 0;
      const deletedCount = result.deletedCount ?? 0;

      console.log(
        `[sync] Delta finished folder: ${folder.displayName} (${changedCount} changed, ${deletedCount} deleted)`,
      );
    } catch (error) {
      console.error(
        `[sync] Delta failed folder: ${folder.displayName} (${folder.id})`,
        error,
      );

      clearFolderSyncState(accountId, folder.id);
    }
  }

  return { success: true };
}

async function fetchGraphMailFoldersPage(accessToken: string, url: string) {
  for (let attempt = 1; attempt <= maxGraphFetchAttempts; attempt += 1) {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      return (await response.json()) as GraphMailFolderListResponse & {
        "@odata.nextLink"?: string;
      };
    }

    const errorText = await response.text();

    if (
      response.status === 404 ||
      response.status === 403 ||
      errorText.includes("ErrorItemNotFound") ||
      errorText.includes("ErrorAccessDenied")
    ) {
      return { value: [] };
    }

    const shouldRetry =
      response.status === 429 ||
      response.status === 503 ||
      response.status === 504;

    if (!shouldRetry || attempt === maxGraphFetchAttempts) {
      throw new Error(
        `Microsoft Graph folders request failed (${response.status}): ${errorText}`,
      );
    }

    await sleep(getGraphRetryDelayMs(response, attempt));
  }

  throw new Error("Microsoft Graph folders request failed after retries");
}

async function createGraphMailFolder(accessToken: string, displayName: string) {
  const response = await fetch(
    "https://graph.microsoft.com/v1.0/me/mailFolders",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        displayName,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Microsoft Graph folder creation failed (${response.status}): ${errorText}`,
    );
  }

  return (await response.json()) as GraphMailFolder;
}

async function moveGraphMessageToFolder(
  accessToken: string,
  messageId: string,
  destinationFolderId: string,
) {
  const encodedMessageId = encodeURIComponent(messageId);
  const requestUrl = `https://graph.microsoft.com/v1.0/me/messages/${encodedMessageId}/move`;

  for (let attempt = 1; attempt <= maxGraphFetchAttempts; attempt += 1) {
    const response = await fetch(requestUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        destinationId: destinationFolderId,
      }),
    });

    if (response.ok) {
      return (await response.json()) as GraphMessage;
    }

    const errorText = await response.text();
    const shouldRetry =
      response.status === 429 ||
      response.status === 500 ||
      response.status === 502 ||
      response.status === 503 ||
      response.status === 504;

    if (!shouldRetry || attempt === maxGraphFetchAttempts) {
      throw new Error(
        `Microsoft Graph move failed (${response.status}): ${errorText}`,
      );
    }

    await sleep(getGraphRetryDelayMs(response, attempt));
  }

  throw new Error("Microsoft Graph move failed after retries");
}

async function renameGraphMailFolder(
  accessToken: string,
  folderId: string,
  displayName: string,
) {
  const encodedFolderId = encodeURIComponent(folderId);

  const response = await fetch(
    `https://graph.microsoft.com/v1.0/me/mailFolders/${encodedFolderId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        displayName,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Microsoft Graph folder rename failed (${response.status}): ${errorText}`,
    );
  }

  return (await response.json()) as GraphMailFolder;
}

async function deleteGraphMailFolder(accessToken: string, folderId: string) {
  const encodedFolderId = encodeURIComponent(folderId);

  const response = await fetch(
    `https://graph.microsoft.com/v1.0/me/mailFolders/${encodedFolderId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok && response.status !== 404) {
    const errorText = await response.text();
    throw new Error(
      `Microsoft Graph folder delete failed (${response.status}): ${errorText}`,
    );
  }

  return { success: true };
}

async function deleteGraphMessage(accessToken: string, messageId: string) {
  const encodedMessageId = encodeURIComponent(messageId);
  const requestUrl = `https://graph.microsoft.com/v1.0/me/messages/${encodedMessageId}`;

  for (let attempt = 1; attempt <= maxGraphFetchAttempts; attempt += 1) {
    const response = await fetch(requestUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok || response.status === 404) {
      return;
    }

    const errorText = await response.text();
    const shouldRetry =
      response.status === 429 ||
      response.status === 500 ||
      response.status === 502 ||
      response.status === 503 ||
      response.status === 504;

    if (!shouldRetry || attempt === maxGraphFetchAttempts) {
      throw new Error(
        `Microsoft Graph message delete failed (${response.status}): ${errorText}`,
      );
    }

    await sleep(getGraphRetryDelayMs(response, attempt));
  }
}

async function emptyGraphMailFolder(
  accessToken: string,
  folderId: string,
  isDeletedItemsFolder: boolean,
) {
  const deletedItemsFolderId = "deleteditems";
  let affectedCount = 0;

  let nextUrl: string | undefined =
    `https://graph.microsoft.com/v1.0/me/mailFolders/${encodeURIComponent(
      folderId,
    )}/messages?$top=100&$select=id`;

  const messageIds: string[] = [];

  while (nextUrl) {
    const listResponse = await fetch(nextUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!listResponse.ok) {
      const errorText = await listResponse.text();
      throw new Error(
        `Microsoft Graph list folder messages failed (${listResponse.status}): ${errorText}`,
      );
    }

    const page = (await listResponse.json()) as {
      value: Array<{ id: string }>;
      "@odata.nextLink"?: string;
    };

    messageIds.push(...page.value.map((message) => message.id));
    nextUrl = page["@odata.nextLink"];

    await sleep(80);
  }

  for (const messageId of messageIds) {
    if (isDeletedItemsFolder) {
      await deleteGraphMessage(accessToken, messageId);
    } else {
      await moveGraphMessageToFolder(
        accessToken,
        messageId,
        deletedItemsFolderId,
      );
    }

    affectedCount += 1;

    await sleep(120);
  }

  return {
    success: true,
    affectedCount,
  };
}
/**
 * Recursively fetches all mail folders (and sub-folders) for the authenticated user.
 * Annotates each folder with its depth and full path (e.g. "Inbox/Projects/Client A").
 */
async function fetchGraphMailFolders(accessToken: string) {
  const query = new URLSearchParams({
    $top: "100",
  });

  const rootUrl = `https://graph.microsoft.com/v1.0/me/mailFolders?${query.toString()}`;
  const allFolders: GraphMailFolder[] = [];

  const fetchFolderTree = async (
    url: string,
    depth: number,
    parentPath: string,
  ) => {
    let nextUrl: string | undefined = url;

    while (nextUrl) {
      let page: GraphMailFolderListResponse & { "@odata.nextLink"?: string };

      try {
        page = await fetchGraphMailFoldersPage(accessToken, nextUrl);
      } catch (error) {
        console.error(
          `[sync] Failed to fetch folder page for path "${parentPath || "root"}":`,
          error,
        );
        throw error;
      }

      for (const folder of page.value) {
        const folderPath = parentPath
          ? `${parentPath}/${folder.displayName}`
          : folder.displayName;

        const normalizedFolder: GraphMailFolder = {
          ...folder,
          depth,
          path: folderPath,
        };

        allFolders.push(normalizedFolder);

        // Recurse into sub-folders
        const childQuery = new URLSearchParams({
          $top: "100",
        });

        const encodedFolderId = encodeURIComponent(folder.id);
        const childUrl = `https://graph.microsoft.com/v1.0/me/mailFolders/${encodedFolderId}/childFolders?${childQuery.toString()}`;

        try {
          await fetchFolderTree(childUrl, depth + 1, folderPath);
        } catch (error) {
          console.error(
            `[sync] Failed to fetch sub-folders for ${folder.displayName} (${folder.id}):`,
            error,
          );
        }
      }

      nextUrl = page["@odata.nextLink"];
    }
  };

  await fetchFolderTree(rootUrl, 0, "");

  return { value: allFolders };
}

// =============================================================================
// FOLDER WELL-KNOWN NAME RESOLUTION
// =============================================================================

/**
 * Maps a Graph folder to its well-known name string (e.g. 'inbox', 'sentitems').
 * Falls back to empty string for custom/user-created folders.
 * Handles localised display names (e.g. 'papirkurv' for Deleted Items in Danish).
 */
function getKnownFolderName(folder: GraphMailFolder) {
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

function saveFoldersToLocalDb(accountId: string, folders: GraphMailFolder[]) {
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

// =============================================================================
// LOCAL DATABASE — READ HELPERS
// =============================================================================
function accountHasAnyLocalMessages(accountId: string) {
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

function shouldRunInitialFullSync(accountId: string) {
  return (
    !accountHasAnyDeltaState(accountId) ||
    !accountHasAnyLocalMessages(accountId)
  );
}

function accountHasAnyDeltaState(accountId: string) {
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
/**
 * Converts SQLite rows (flat key-value) back into typed GraphMessage objects.
 * Parses JSON-encoded recipient arrays and maps integer booleans back to booleans.
 *
 * TODO: Replace `any[]` with a proper typed interface for the raw DB row shape.
 */
function rowsToMessages(rows: any[]): GraphMessage[] {
  return rows.map((row) => ({
    id: row.id,
    subject: row.subject,
    bodyPreview: row.bodyPreview,
    body: row.bodyContentType
      ? {
          contentType: row.bodyContentType as "text" | "html",
          content: row.bodyContent,
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
function getLocalFolders(accountId: string) {
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
function getLocalMessagesByFolder(accountId: string) {
  const folders = getLocalFolders(accountId);
  const messagesByFolder = {} as Record<string, GraphMessage[]>;

  for (const folder of folders as Array<{ id: string }>) {
    // Specify exact columns to EXCLUDE bodyContent and bodyContentType
    const rows = db
      .prepare(
        `
    SELECT
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
      attachments,
      fromName,
      fromAddress,
      toRecipients,
      ccRecipients
    FROM emails
    WHERE accountId = ? AND folder = ?
    ORDER BY receivedDateTime DESC
  `,
      )
      .all(accountId, folder.id) as any[];

    messagesByFolder[folder.id] = rowsToMessages(rows);
  }

  return messagesByFolder;
}

function getLocalLabels(accountId: string) {
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

function getAccountHealthSnapshots(): AccountHealthSnapshot[] {
  const microsoftTokens = loadMicrosoftTokens();
  const googleTokens = loadGoogleTokens();
  const imapAccounts = loadImapAccounts();
  const accountIds = new Set<string>([
    ...Object.keys(microsoftTokens),
    ...Object.keys(googleTokens),
    ...Object.keys(imapAccounts),
  ]);

  const snapshots: AccountHealthSnapshot[] = [];

  for (const accountId of accountIds) {
    const msToken = microsoftTokens[accountId];
    const googleToken = googleTokens[accountId];
    const imap = imapAccounts[accountId];
    const provider: AccountHealthSnapshot["provider"] = msToken
      ? "microsoft"
      : googleToken
        ? "google"
        : "imap";

    const expiresAt = msToken?.expiresAt || googleToken?.expiresAt || null;
    const tokenStatus = deriveTokenHealth(expiresAt);

    const messageStats = db
      .prepare(
        `
      SELECT
        MAX(receivedDateTime) AS lastSyncAt,
        COUNT(*) AS messageCount,
        SUM(LENGTH(COALESCE(bodyContent, '')) + LENGTH(COALESCE(bodyPreview, ''))) AS storageBytes
      FROM emails
      WHERE accountId = ?
    `,
      )
      .get(accountId) as
      | {
          lastSyncAt?: string | null;
          messageCount?: number | null;
          storageBytes?: number | null;
        }
      | undefined;

    const folderErrorsRow = db
      .prepare(
        `
      SELECT COUNT(*) AS folderErrors
      FROM folder_sync_state
      WHERE accountId = ? AND COALESCE(lastDeltaSyncAt, lastFullSyncAt) IS NULL
    `,
      )
      .get(accountId) as { folderErrors?: number | null } | undefined;

    const hasMessages = Number(messageStats?.messageCount || 0) > 0;

    snapshots.push({
      accountId,
      provider,
      syncStatus: deriveSyncHealth({ hasMessages, tokenHealth: tokenStatus }),
      tokenStatus,
      tokenExpiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      lastSyncAt: messageStats?.lastSyncAt || imap?.updatedAt || null,
      folderErrors: Number(folderErrorsRow?.folderErrors || 0),
      storageBytes: Number(messageStats?.storageBytes || 0),
    });
  }

  return snapshots;
}

// =============================================================================
// MAILBOX SYNC — FULL SYNC TO LOCAL DB
// =============================================================================

/**
 * Full mailbox sync: fetches all folders and their messages from the Graph API
 * and upserts them into the local SQLite DB. Folders and messages are synced
 * concurrently across folders (Promise.all).
 *
 * This is the preferred sync path. See also: ⚠️ syncInbox (deprecated below).
 */

// =============================================================================
// WINDOW MANAGEMENT
// =============================================================================

/**
 * Loads the saved window bounds (x, y, width, height) from disk.
 * Falls back to a sensible default if the file doesn't exist or is unreadable.
 */
function loadWindowState() {
  try {
    if (fs.existsSync(stateFilePath)) {
      return JSON.parse(fs.readFileSync(stateFilePath, "utf8"));
    }
  } catch (error) {
    console.error("Failed to load window state:", error);
  }

  return { width: 1200, height: 800 };
}

/**
 * Persists the current window bounds to disk (skipped when maximized or minimized).
 */
function saveWindowState(win: electron.BrowserWindow) {
  try {
    if (!win.isMaximized() && !win.isMinimized()) {
      const bounds = win.getBounds();
      fs.writeFileSync(stateFilePath, JSON.stringify(bounds), {
        encoding: "utf8",
        mode: 0o600,
      });
    }
  } catch (error) {
    console.error("Failed to save window state:", error);
  }
}

/**
 * Creates the main application window with security-hardened webPreferences.
 * Loads the Vite dev server in development, or the built index.html in production.
 */
function createWindow() {
  const windowState = loadWindowState();
  const preloadPath = path.resolve(__dirname, "preload.mjs");

  // 👇 The bulletproof path resolution
  const iconPath = app.isPackaged
    ? path.join(__dirname, "../dist/logo.ico")
    : path.join(__dirname, "../../public/logo.ico");

  const win = new BrowserWindow({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    icon: iconPath,
    webPreferences: {
      nodeIntegration: false, // Never expose Node.js to renderer
      contextIsolation: true, // Isolate renderer from preload globals
      sandbox: true, // Full Chromium sandboxing
      webSecurity: true, // Enforce same-origin policy
      allowRunningInsecureContent: false,
      preload: preloadPath,
    },
  });

  // Only allow opening https:// or mailto: links externally; block everything else
  win.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const parsed = new URL(url);

      if (!["https:", "mailto:"].includes(parsed.protocol)) {
        return { action: "deny" };
      }

      shell.openExternal(url);
    } catch {
      return { action: "deny" };
    }

    return { action: "deny" };
  });

  // Block in-page navigation to external URLs (only allow dev server and file:// URLs)
  win.webContents.on("will-navigate", (event, url) => {
    if (
      process.env.VITE_DEV_SERVER_URL &&
      url.startsWith(process.env.VITE_DEV_SERVER_URL)
    ) {
      return;
    }

    if (url.startsWith("file://")) {
      return;
    }

    event.preventDefault();
  });

  win.on("close", () => {
    saveWindowState(win);
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.resolve(__dirname, "../dist/index.html"));
  }
}

// =============================================================================
// IPC HANDLERS — WINDOW CONTROLS
// Custom window frame controls (minimize / maximize / close)

// Add this near your other ipcMain.handle functions

// =============================================================================
// IPC HANDLERS — MICROSOFT CALENDAR
// =============================================================================

ipcMain.handle("ai:get-provider-key-status", (_event, payload) => {
  const provider = assertString(payload?.provider, "provider", 32);

  if (provider !== "gemini") {
    throw new Error("Unsupported AI provider");
  }

  return getAiProviderKeyStatus(provider);
});

ipcMain.handle("ai:set-provider-key", (_event, payload) => {
  const provider = assertString(payload?.provider, "provider", 32);
  const apiKey = assertString(payload?.apiKey, "apiKey", 8192);

  if (provider !== "gemini") {
    throw new Error("Unsupported AI provider");
  }

  const keys = loadAiProviderKeys();
  keys[provider] = {
    apiKey,
    updatedAt: new Date().toISOString(),
  };
  saveAiProviderKeys(keys);

  return getAiProviderKeyStatus(provider);
});

ipcMain.handle("ai:delete-provider-key", (_event, payload) => {
  const provider = assertString(payload?.provider, "provider", 32);

  if (provider !== "gemini") {
    throw new Error("Unsupported AI provider");
  }

  const keys = loadAiProviderKeys();
  delete keys[provider];
  saveAiProviderKeys(keys);

  return getAiProviderKeyStatus(provider);
});

// Simple sliding-window rate limiter for AI calls.
// Prevents a bug or runaway UI loop from burning through the user's API key.
class RateLimiter {
  private timestamps: number[] = [];
  constructor(
    private readonly maxCalls: number,
    private readonly windowMs: number,
  ) {}

  allow(): boolean {
    const now = Date.now();
    this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);
    if (this.timestamps.length >= this.maxCalls) return false;
    this.timestamps.push(now);
    return true;
  }
}

const aiRateLimiter = new RateLimiter(10, 60_000); // 10 calls per minute

ipcMain.handle("ai:summarize-email", async (_event, payload) => {
  if (!aiRateLimiter.allow()) {
    throw new Error("Too many AI requests. Please wait a moment before summarising another email.");
  }
  const email = validateAiEmailPayload(payload);

  const plainBody = limitAiInput(
    stripHtmlForAi(email.body || email.preview || ""),
  );

  if (!plainBody.trim() && !email.subject.trim()) {
    throw new Error("No email content available to summarize.");
  }

  const prompt = [
    "You are RYZE AI, a private email assistant inside a desktop email app.",
    "",
    "Analyze this email for the user.",
    "",
    "Return only valid JSON with this exact shape:",
    '{"summary":"one concise paragraph","keyPoints":["point 1","point 2"],"suggestedActions":["action 1","action 2"]}',
    "",
    "Rules:",
    "- Keep summary concise.",
    "- keyPoints should capture the most important facts, questions, deadlines, amounts, or decisions.",
    "- suggestedActions should be practical next steps for the user.",
    "- Do not invent details.",
    "- Use empty arrays when there are no key points or actions.",
    "",
    `From: ${email.senderName} <${email.senderEmail}>`,
    `Subject: ${email.subject}`,
    "",
    "Email content:",
    plainBody,
  ].join("\n");

  if (getAiProvider() === "ollama") {
    const { baseUrl, model } = getOllamaConfig();
    const ollamaBody = limitAiInput(plainBody, 4_000);
    const ollamaPrompt = [
      "Return only valid JSON.",
      'Shape: {"summary":"short summary","keyPoints":["point"],"suggestedActions":["action"]}',
      "Use max 3 keyPoints and max 2 suggestedActions.",
      "Do not invent details.",
      "",
      `From: ${email.senderName} <${email.senderEmail}>`,
      `Subject: ${email.subject}`,
      "",
      ollamaBody,
    ].join("\n");

    const requestOllamaSummary = async (numPredict: number) => {
      const response = await fetch(`${baseUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          prompt: ollamaPrompt,
          stream: false,
          options: {
          temperature: 0.2,
          num_predict: numPredict,
        },
      }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Ollama summarize failed (${response.status}): ${errorText}`,
        );
      }

      return (await response.json()) as {
        response?: string;
        message?: { content?: string };
        output?: string;
        error?: string;
        done_reason?: string;
      };
    };

    let data = await requestOllamaSummary(500);
    let summary = (
      data.response ||
      data.message?.content ||
      data.output ||
      ""
    ).trim();

    if (!summary && data.done_reason === "length") {
      data = await requestOllamaSummary(1000);
      summary = (
        data.response ||
        data.message?.content ||
        data.output ||
        ""
      ).trim();
    }

    if (!summary) {
      const reason = data.error || data.done_reason || "no response text";
      throw new Error(`Ollama returned an empty summary (${reason}).`);
    }

    return {
      ...normalizeAiSummaryResult(summary),
    };
  }

  const apiKey = getGeminiApiKey();
  const model = getGeminiModel();
  const apiVersion = getGeminiApiVersion();

  const response = await fetch(
    `https://generativelanguage.googleapis.com/${encodeURIComponent(
      apiVersion,
    )}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(
      apiKey,
    )}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 900,
        },
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    if (response.status === 400 && errorText.includes("API_KEY")) {
      throw new Error("Gemini API key is invalid or missing.");
    }

    throw new Error(
      `Gemini summarize failed (${response.status}): ${errorText}`,
    );
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          text?: string;
        }>;
      };
    }>;
  };

  const summary = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  if (!summary) {
    throw new Error("Gemini returned an empty summary.");
  }

  return {
    ...normalizeAiSummaryResult(summary),
  };
});

ipcMain.handle("ai:generate-reply", async (_event, payload) => {
  if (!aiRateLimiter.allow()) {
    throw new Error("Too many AI requests. Please wait a moment before generating another reply.");
  }

  const input = validateAiReplyPayload(payload);
  const plainBody = limitAiInput(
    stripHtmlForAi(input.body || input.preview || ""),
  );

  if (!plainBody.trim() && !input.subject.trim()) {
    throw new Error("No email content available to generate a reply.");
  }

  const toneInstruction = {
    short: "Keep it concise: 2-4 short sentences.",
    polite: "Use warm, respectful language and appreciation.",
    firm: "Be clear, direct, and set expectations confidently.",
    detailed: "Provide full context and complete answers.",
    decline: "Politely decline while keeping relationship positive.",
    "follow-up": "Nudge for response and restate pending question.",
  }[input.tone] || "Use a professional and clear tone.";

  const prompt = [
    "You are RYZE AI, a private desktop email assistant.",
    "Write a reply draft the user can send.",
    "",
    "Return only valid JSON with this exact shape:",
    '{"reply":"reply body text only"}',
    "",
    "Rules:",
    `- ${toneInstruction}`,
    "- Do not invent facts, dates, or commitments not present in the email.",
    "- Keep the draft practical and action-oriented.",
    "- Do not include a subject line.",
    "- Do not include signatures.",
    "",
    `From: ${input.senderName} <${input.senderEmail}>`,
    `Subject: ${input.subject}`,
    "",
    "Email content:",
    plainBody,
  ].join("\n");

  if (getAiProvider() === "ollama") {
    const { baseUrl, model } = getOllamaConfig();
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          temperature: 0.25,
          num_predict: 600,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama reply generation failed (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as {
      response?: string;
      message?: { content?: string };
      output?: string;
    };

    const rawReply = (
      data.response ||
      data.message?.content ||
      data.output ||
      ""
    ).trim();

    if (!rawReply) {
      throw new Error("Ollama returned an empty reply draft.");
    }

    return { reply: normalizeAiReplyResult(rawReply) };
  }

  const apiKey = getGeminiApiKey();
  const model = getGeminiModel();
  const apiVersion = getGeminiApiVersion();

  const response = await fetch(
    `https://generativelanguage.googleapis.com/${encodeURIComponent(
      apiVersion,
    )}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(
      apiKey,
    )}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.25,
          maxOutputTokens: 700,
        },
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 400 && errorText.includes("API_KEY")) {
      throw new Error("Gemini API key is invalid or missing.");
    }
    throw new Error(`Gemini reply generation failed (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  const rawReply = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  if (!rawReply) {
    throw new Error("Gemini returned an empty reply draft.");
  }

  return { reply: normalizeAiReplyResult(rawReply) };
});

ipcMain.handle("microsoft-calendar:get-events", async (_event, payload) => {
  const accountId = validateAccountId(payload?.accountId);
  const accessToken = await getValidMicrosoftAccessToken(accountId);

  // Get events from today to 14 days from now
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setDate(end.getDate() + 14);

  const query = new URLSearchParams({
    $select: "id,subject,bodyPreview,start,end,location,isAllDay",
    $orderby: "start/dateTime ASC",
    $top: "50",
  });

  const response = await fetch(
    `https://graph.microsoft.com/v1.0/me/calendarview?startDateTime=${start.toISOString()}&endDateTime=${end.toISOString()}&${query.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Prefer: 'outlook.timezone="UTC"',
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to fetch calendar:", errorText);
    throw new Error(`Failed to fetch calendar events: ${errorText}`);
  }

  const data = await response.json();
  return data.value || [];
});

ipcMain.handle("microsoft-mail:download-attachment", async (event, payload) => {
  const accountId = validateAccountId(payload?.accountId);
  const messageId = validateMessageId(payload?.messageId);
  const attachmentId = assertString(
    payload?.attachmentId,
    "attachmentId",
    2048,
  );
  const filename = assertString(payload?.filename, "filename", 1024);

  // 1. Prompt the user for where to securely save the file
  const window = BrowserWindow.fromWebContents(event.sender);
  if (!window) throw new Error("No window found");

  const { canceled, filePath } = await dialog.showSaveDialog(window, {
    defaultPath: filename,
    title: "Save Attachment",
  });

  if (canceled || !filePath) {
    return { success: false, canceled: true };
  }

  // 2. ONLY NOW do we fetch the actual file bytes from Microsoft
  const accessToken = await getValidMicrosoftAccessToken(accountId);
  const encodedMsgId = encodeURIComponent(messageId);
  const encodedAttId = encodeURIComponent(attachmentId);
  const baseAttachmentUrl =
    `https://graph.microsoft.com/v1.0/me/messages/${encodedMsgId}/attachments/${encodedAttId}`;
  const valueUrl = `${baseAttachmentUrl}/$value`;

  // Prefer raw bytes from Graph; this works for large files and avoids contentBytes parsing issues.
  const tryDownload = async (preferImmutableId: boolean) => {
    const response = await fetch(valueUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(preferImmutableId ? { Prefer: 'IdType="ImmutableId"' } : {}),
      },
    });

    if (response.ok) {
      const bytes = await response.arrayBuffer();
      return { ok: true as const, bytes: Buffer.from(bytes) };
    }

    const errorText = await response.text();
    return { ok: false as const, status: response.status, errorText };
  };

  // Retry with the alternate ID preference because message IDs can be restId/immutableId depending on caller.
  const firstAttempt = await tryDownload(true);
  const secondAttempt =
    firstAttempt.ok || firstAttempt.status !== 404
      ? null
      : await tryDownload(false);

  const successAttempt =
    firstAttempt.ok ? firstAttempt : secondAttempt?.ok ? secondAttempt : null;

  if (!successAttempt) {
    const failure = secondAttempt || firstAttempt;
    throw new Error(`Failed to download attachment: ${failure.errorText}`);
  }

  // 3. Write the bytes to the user's chosen location
  fs.writeFileSync(filePath, successAttempt.bytes);

  return { success: true, filePath };
});

/** Toggles the starred/flagged status locally and on Microsoft Graph. */

/** Toggles the starred/flagged status locally and on Microsoft Graph. */
ipcMain.handle("microsoft-mail:toggle-star", async (_event, payload) => {
  const accountId = validateAccountId(payload?.accountId);
  const messageId = validateMessageId(payload?.messageId);
  const isStarred = Boolean(payload?.isStarred);
  const accessToken = await getValidMicrosoftAccessToken(accountId);
  const encodedMessageId = encodeURIComponent(messageId);

  const response = await fetch(
    `https://graph.microsoft.com/v1.0/me/messages/${encodedMessageId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        flag: {
          flagStatus: isStarred ? "flagged" : "notFlagged",
        },
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    // SELF-HEALING: If missing on server, delete local stale copy
    if (response.status === 404 || errorText.includes("ErrorItemNotFound")) {
      db.prepare("DELETE FROM emails WHERE accountId = ? AND id = ?").run(
        accountId,
        messageId,
      );
      return { success: false, missing: true };
    }
    throw new Error(`Failed to toggle star: ${errorText}`);
  }

  db.prepare(
    "UPDATE emails SET isStarred = ? WHERE accountId = ? AND id = ?",
  ).run(isStarred ? 1 : 0, accountId, messageId);

  return { success: true };
});

ipcMain.handle("system:get-storage-usage", () => {
  try {
    const stats = fs.statSync(dbPath);
    return {
      // Return size in GB
      dbSizeGB: stats.size / (1024 * 1024 * 1024),
    };
  } catch (error) {
    return { dbSizeGB: 0 };
  }
});

ipcMain.handle("system:export-backup", async (event) => {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error("Secure backup export is unavailable on this system.");
  }

  const window = BrowserWindow.fromWebContents(event.sender);
  if (!window) throw new Error("No window found");

  const defaultName = `ryze-backup-${new Date().toISOString().slice(0, 10)}.ryzebak`;
  const { canceled, filePath } = await dialog.showSaveDialog(window, {
    title: "Export Encrypted Backup",
    defaultPath: defaultName,
    filters: [{ name: "RYZE Backup", extensions: ["ryzebak"] }],
  });

  if (canceled || !filePath) {
    return { success: false, canceled: true };
  }

  const envelope: BackupEnvelope = {
    version: 1,
    createdAt: new Date().toISOString(),
    data: {
      settings: loadBackendSettings(),
      folders: db.prepare("SELECT * FROM folders").all(),
      emails: db.prepare("SELECT * FROM emails").all(),
      labels: db.prepare("SELECT * FROM labels").all(),
      emailLabels: db.prepare("SELECT * FROM email_labels").all(),
      folderSyncState: db.prepare("SELECT * FROM folder_sync_state").all(),
    },
  };

  const encrypted = safeStorage
    .encryptString(JSON.stringify(envelope))
    .toString("base64");
  fs.writeFileSync(filePath, encrypted, { encoding: "utf8", mode: 0o600 });

  return {
    success: true,
    filePath,
    createdAt: envelope.createdAt,
  };
});

ipcMain.handle("system:import-backup", async (event) => {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error("Secure backup import is unavailable on this system.");
  }

  const window = BrowserWindow.fromWebContents(event.sender);
  if (!window) throw new Error("No window found");

  const { canceled, filePaths } = await dialog.showOpenDialog(window, {
    title: "Import Encrypted Backup",
    properties: ["openFile"],
    filters: [{ name: "RYZE Backup", extensions: ["ryzebak"] }],
  });

  if (canceled || !filePaths?.[0]) {
    return { success: false, canceled: true };
  }

  const encrypted = fs.readFileSync(filePaths[0], "utf8");
  const decoded = safeStorage.decryptString(Buffer.from(encrypted, "base64"));
  const parsed = JSON.parse(decoded) as BackupEnvelope;

  if (!parsed || parsed.version !== 1 || !parsed.data) {
    throw new Error("Backup file is invalid or unsupported.");
  }

  const data = parsed.data;

  db.transaction(() => {
    db.exec(`
      DELETE FROM email_labels;
      DELETE FROM labels;
      DELETE FROM emails;
      DELETE FROM folders;
      DELETE FROM folder_sync_state;
    `);

    const insertFolder = db.prepare(`
      INSERT INTO folders (id, accountId, displayName, parentFolderId, wellKnownName, totalItemCount, unreadItemCount, depth, path, icon)
      VALUES (@id, @accountId, @displayName, @parentFolderId, @wellKnownName, @totalItemCount, @unreadItemCount, @depth, @path, COALESCE(@icon, ''))
    `);
    for (const row of data.folders || []) insertFolder.run(row);

    const insertEmail = db.prepare(`
      INSERT INTO emails (id, accountId, folder, subject, bodyPreview, bodyContentType, bodyContent, receivedDateTime, isRead, hasAttachments, fromName, fromAddress, toRecipients, ccRecipients, snoozedUntil, isStarred, attachments)
      VALUES (@id, @accountId, @folder, @subject, @bodyPreview, @bodyContentType, @bodyContent, @receivedDateTime, @isRead, @hasAttachments, @fromName, @fromAddress, @toRecipients, @ccRecipients, @snoozedUntil, COALESCE(@isStarred, 0), COALESCE(@attachments, '[]'))
    `);
    for (const row of data.emails || []) insertEmail.run(row);

    const insertLabel = db.prepare(`
      INSERT INTO labels (id, accountId, name, color, createdAt, updatedAt)
      VALUES (@id, @accountId, @name, @color, @createdAt, @updatedAt)
    `);
    for (const row of data.labels || []) insertLabel.run(row);

    const insertEmailLabel = db.prepare(`
      INSERT INTO email_labels (accountId, messageId, labelId, createdAt)
      VALUES (@accountId, @messageId, @labelId, @createdAt)
    `);
    for (const row of data.emailLabels || []) insertEmailLabel.run(row);

    const insertSync = db.prepare(`
      INSERT INTO folder_sync_state (accountId, folderId, deltaLink, lastFullSyncAt, lastDeltaSyncAt)
      VALUES (@accountId, @folderId, @deltaLink, @lastFullSyncAt, @lastDeltaSyncAt)
    `);
    for (const row of data.folderSyncState || []) insertSync.run(row);
  })();

  const backendSettings = sanitizeBackendSettings(data.settings || {});
  fs.writeFileSync(settingsFilePath, JSON.stringify(backendSettings, null, 2), {
    encoding: "utf8",
    mode: 0o600,
  });

  return {
    success: true,
    filePath: filePaths[0],
    createdAt: parsed.createdAt,
  };
});

ipcMain.on("system:update-settings", (_event, settings) => {
  const backendSettings = sanitizeBackendSettings(settings);
  fs.writeFileSync(settingsFilePath, JSON.stringify(backendSettings, null, 2), {
    encoding: "utf8",
    mode: 0o600,
  });
});

ipcMain.handle("microsoft-mail:syncFolders", async (_event, payload) => {
  const accountId = validateAccountId(payload?.accountId);

  if (activeFullSyncs.has(accountId)) {
    return activeFullSyncs.get(accountId);
  }

  const rawFolderIds = Array.isArray(payload?.folderIds)
    ? payload.folderIds
    : [];

  const folderIds = rawFolderIds.map((folderId: unknown) =>
    validateFolderId(folderId),
  );

  if (folderIds.length === 0) {
    return { success: true };
  }

  if (shouldRunInitialFullSync(accountId)) {
    return await syncMailboxInitialFull(accountId);
  }

  return await syncMailboxTargetedDelta(accountId, folderIds);
});

// --- SECURE DRAFTS STORAGE ---
const draftsFilePath = path.join(app.getPath("userData"), "ryze-drafts.enc");

ipcMain.handle("system:get-drafts", () => {
  try {
    if (!safeStorage.isEncryptionAvailable()) {
      console.warn("Secure storage unavailable — drafts cannot be loaded.");
      return [];
    }

    if (!fs.existsSync(draftsFilePath)) return [];

    const encryptedData = fs.readFileSync(draftsFilePath);
    const decryptedData = safeStorage.decryptString(encryptedData);
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error("Failed to load encrypted drafts:", error);
    return [];
  }
});

ipcMain.on("system:save-drafts", (_event, drafts) => {
  if (!safeStorage.isEncryptionAvailable()) {
    console.error("Secure storage unavailable — drafts will not be saved to disk.");
    const windows = BrowserWindow.getAllWindows();
    if (windows.length > 0) {
      windows[0].webContents.send("drafts:save-failed", "Secure storage is unavailable on this system. Drafts cannot be saved.");
    }
    return;
  }

  try {
    const payload = JSON.stringify(sanitizeDraftsPayload(drafts));
    const encryptedData = safeStorage.encryptString(payload);
    fs.writeFileSync(draftsFilePath, encryptedData, { mode: 0o600 });
  } catch (error) {
    console.error("Failed to securely save drafts:", error);
    const windows = BrowserWindow.getAllWindows();
    if (windows.length > 0) {
      windows[0].webContents.send(
        "drafts:save-failed",
        "Drafts could not be saved due to an encryption error.",
      );
    }
  }
});

ipcMain.handle("labels:create", (_event, payload) => {
  const accountId = validateAccountId(payload?.accountId);
  const name = validateLabelName(payload?.name);
  const color = validateLabelColor(payload?.color);
  const now = new Date().toISOString();
  const id = `label-${crypto.randomUUID()}`;

  db.prepare(
    `
    INSERT INTO labels (id, accountId, name, color, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `,
  ).run(id, accountId, name, color, now, now);

  return {
    id,
    accountId,
    name,
    color,
    createdAt: now,
    updatedAt: now,
  };
});

ipcMain.handle("microsoft-folder:create", async (_event, payload) => {
  const accountId = validateAccountId(payload?.accountId);
  const displayName = validateFolderName(payload?.displayName);

  const accessToken = await getValidMicrosoftAccessToken(accountId);
  const createdFolder = await createGraphMailFolder(accessToken, displayName);

  const normalizedFolder: GraphMailFolder = {
    ...createdFolder,
    depth: 0,
    path: createdFolder.displayName || displayName,
  };

  db.prepare(
    `
    INSERT OR REPLACE INTO folders (
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
  `,
  ).run(
    normalizedFolder.id,
    accountId,
    normalizedFolder.displayName || displayName,
    normalizedFolder.parentFolderId || "",
    getKnownFolderName(normalizedFolder),
    normalizedFolder.totalItemCount || 0,
    normalizedFolder.unreadItemCount || 0,
    normalizedFolder.depth || 0,
    normalizedFolder.path || normalizedFolder.displayName || displayName,
  );

  return {
    id: normalizedFolder.id,
    accountId,
    displayName: normalizedFolder.displayName || displayName,
    parentFolderId: normalizedFolder.parentFolderId || "",
    wellKnownName: getKnownFolderName(normalizedFolder),
    totalItemCount: normalizedFolder.totalItemCount || 0,
    unreadItemCount: normalizedFolder.unreadItemCount || 0,
    depth: normalizedFolder.depth || 0,
    path: normalizedFolder.path || normalizedFolder.displayName || displayName,
  };
});

ipcMain.handle("microsoft-folder:rename", async (_event, payload) => {
  const accountId = validateAccountId(payload?.accountId);
  const folderId = validateFolderId(payload?.folderId);
  const displayName = validateFolderName(payload?.displayName);

  const folder = db
    .prepare(
      `
      SELECT id, wellKnownName
      FROM folders
      WHERE accountId = ? AND id = ?
      LIMIT 1
    `,
    )
    .get(accountId, folderId) as
    | { id: string; wellKnownName?: string }
    | undefined;

  if (!folder) {
    throw new Error("Folder not found");
  }

  if (folder.wellKnownName) {
    throw new Error("System folders cannot be renamed.");
  }

  const accessToken = await getValidMicrosoftAccessToken(accountId);
  const renamedFolder = await renameGraphMailFolder(
    accessToken,
    folderId,
    displayName,
  );

  db.prepare(
    `
    UPDATE folders
    SET displayName = ?
    WHERE accountId = ? AND id = ?
  `,
  ).run(renamedFolder.displayName || displayName, accountId, folderId);

  return db
    .prepare(
      `
      SELECT *
      FROM folders
      WHERE accountId = ? AND id = ?
    `,
    )
    .get(accountId, folderId);
});

ipcMain.handle("microsoft-folder:delete", async (_event, payload) => {
  const accountId = validateAccountId(payload?.accountId);
  const folderId = validateFolderId(payload?.folderId);

  const folder = db
    .prepare(
      `
      SELECT id, wellKnownName
      FROM folders
      WHERE accountId = ? AND id = ?
      LIMIT 1
    `,
    )
    .get(accountId, folderId) as
    | { id: string; wellKnownName?: string }
    | undefined;

  if (!folder) {
    throw new Error("Folder not found");
  }

  if (folder.wellKnownName) {
    throw new Error("System folders cannot be deleted.");
  }

  const accessToken = await getValidMicrosoftAccessToken(accountId);

  await deleteGraphMailFolder(accessToken, folderId);

  const folderIdsToDelete = getFolderAndDescendantIds(accountId, folderId);

  const deleteLocalFolderTree = db.transaction(() => {
    for (const id of folderIdsToDelete) {
      db.prepare(
        `
        DELETE FROM email_labels
        WHERE accountId = ?
          AND messageId IN (
            SELECT id FROM emails WHERE accountId = ? AND folder = ?
          )
      `,
      ).run(accountId, accountId, id);

      db.prepare(
        `
        DELETE FROM emails
        WHERE accountId = ? AND folder = ?
      `,
      ).run(accountId, id);

      db.prepare(
        `
        DELETE FROM folders
        WHERE accountId = ? AND id = ?
      `,
      ).run(accountId, id);
    }
  });

  deleteLocalFolderTree();

  return {
    success: true,
    deletedFolderIds: folderIdsToDelete,
  };
});

ipcMain.handle("microsoft-folder:empty", async (_event, payload) => {
  const accountId = validateAccountId(payload?.accountId);
  const folderId = validateFolderId(payload?.folderId);

  const folder = db
    .prepare(
      `
    SELECT id, displayName, wellKnownName
    FROM folders
    WHERE accountId = ? AND id = ?
    LIMIT 1
  `,
    )
    .get(accountId, folderId) as
    | { id: string; displayName?: string; wellKnownName?: string }
    | undefined;

  if (!folder) {
    throw new Error("Folder not found");
  }

  const accessToken = await getValidMicrosoftAccessToken(accountId);

  const isDeletedItemsFolder =
    folder.wellKnownName === "deleteditems" ||
    folder.displayName?.toLowerCase() === "deleted items" ||
    folder.displayName?.toLowerCase() === "trash";

  const result = await emptyGraphMailFolder(
    accessToken,
    folderId,
    isDeletedItemsFolder,
  );

  db.transaction(() => {
    db.prepare(
      `
      DELETE FROM email_labels
      WHERE accountId = ?
        AND messageId IN (
          SELECT id FROM emails WHERE accountId = ? AND folder = ?
        )
    `,
    ).run(accountId, accountId, folderId);

    db.prepare(
      `
      DELETE FROM emails
      WHERE accountId = ? AND folder = ?
    `,
    ).run(accountId, folderId);
  })();

  return {
    success: true,
    affectedCount: result.affectedCount,
  };
});

ipcMain.handle("microsoft-folder:set-icon", (_event, payload) => {
  const accountId = validateAccountId(payload?.accountId);
  const folderId = validateFolderId(payload?.folderId);
  const icon = validateFolderIcon(payload?.icon);

  const result = db
    .prepare(
      `
    UPDATE folders
    SET icon = ?
    WHERE accountId = ? AND id = ?
  `,
    )
    .run(icon, accountId, folderId);

  if (result.changes === 0) {
    throw new Error("Folder not found");
  }

  return db
    .prepare(
      `
      SELECT *
      FROM folders
      WHERE accountId = ? AND id = ?
    `,
    )
    .get(accountId, folderId);
});

ipcMain.handle("labels:rename", (_event, payload) => {
  const accountId = validateAccountId(payload?.accountId);
  const labelId = validateLabelId(payload?.labelId);
  const name = validateLabelName(payload?.name);
  const now = new Date().toISOString();

  const result = db
    .prepare(
      `
    UPDATE labels
    SET name = ?, updatedAt = ?
    WHERE accountId = ? AND id = ?
  `,
    )
    .run(name, now, accountId, labelId);

  if (result.changes === 0) {
    throw new Error("Label not found");
  }

  return db
    .prepare(
      `
      SELECT id, accountId, name, color, createdAt, updatedAt
      FROM labels
      WHERE accountId = ? AND id = ?
    `,
    )
    .get(accountId, labelId);
});

ipcMain.handle("labels:assign-email", (_event, payload) => {
  const accountId = validateAccountId(payload?.accountId);
  const messageId = validateMessageId(payload?.messageId);
  const labelId = validateLabelId(payload?.labelId);
  const now = new Date().toISOString();

  const emailExists = db
    .prepare(
      `
    SELECT id FROM emails
    WHERE accountId = ? AND id = ?
    LIMIT 1
  `,
    )
    .get(accountId, messageId);

  if (!emailExists) {
    throw new Error("Email not found");
  }

  const labelExists = db
    .prepare(
      `
    SELECT id FROM labels
    WHERE accountId = ? AND id = ?
    LIMIT 1
  `,
    )
    .get(accountId, labelId);

  if (!labelExists) {
    throw new Error("Label not found");
  }

  db.prepare(
    `
    INSERT OR IGNORE INTO email_labels (accountId, messageId, labelId, createdAt)
    VALUES (?, ?, ?, ?)
  `,
  ).run(accountId, messageId, labelId, now);

  return { success: true };
});

ipcMain.on("window-minimize", (event) => {
  BrowserWindow.fromWebContents(event.sender)?.minimize();
});

ipcMain.on("window-maximize", (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (!window) return;

  if (window.isMaximized()) {
    window.unmaximize();
  } else {
    window.maximize();
  }
});

ipcMain.on("window-close", (event) => {
  BrowserWindow.fromWebContents(event.sender)?.close();
});

// =============================================================================
// IPC HANDLERS — MICROSOFT OAUTH
// =============================================================================

/**
 * Starts the Microsoft OAuth 2.0 + PKCE login flow:
 *   1. Generates a PKCE code verifier + challenge
 *   2. Opens the Microsoft login page in the user's default browser
 *   3. Spins up a local HTTP server to catch the redirect callback
 *   4. Exchanges the authorization code for tokens
 *   5. Fetches the user's profile and stores everything encrypted
 */
ipcMain.handle("microsoft-oauth:connect", async () => {
  const { clientId, tenantId, redirectUri, scope } =
    getMicrosoftOAuthEnv();

  // PKCE: generate a random verifier and its SHA-256 challenge
  const verifier = toBase64Url(crypto.randomBytes(64));
  const challenge = toBase64Url(
    crypto.createHash("sha256").update(verifier).digest(),
  );
  const state = toBase64Url(crypto.randomBytes(32));
  const redirect = new URL(redirectUri);
  const authority = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0`;
  const authUrl = new URL(`${authority}/authorize`);

  authUrl.search = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    response_mode: "query",
    scope,
    prompt: "select_account",
    code_challenge_method: "S256",
    code_challenge: challenge,
    state,
  }).toString();

  // Wait for the authorization code to arrive on the local callback server
  const authCode = await new Promise<string>((resolve, reject) => {
    const server = http.createServer((req, res) => {
      if (!req.url) return;

      // Reject requests whose Host header doesn't exactly match our loopback address.
      // Prevents DNS-rebinding attacks where a malicious page tries to hit this server.
      const expectedHost = `${redirect.hostname}:${redirect.port}`;
      if (req.headers.host !== expectedHost) {
        res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Bad request.");
        return;
      }

      const requestUrl = new URL(req.url, redirectUri);

      if (requestUrl.pathname !== redirect.pathname) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Not found.");
        return;
      }

      const receivedState = requestUrl.searchParams.get("state");
      const code = requestUrl.searchParams.get("code");
      const error = requestUrl.searchParams.get("error");
      const errorDescription = requestUrl.searchParams.get("error_description");

      if (error) {
        res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Microsoft sign-in failed. You can close this window.");
        server.close(() => reject(new Error(errorDescription || error)));
        return;
      }

      if (receivedState !== state || !code) {
        res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Invalid sign-in response. You can close this window.");
        server.close(() =>
          reject(new Error("Invalid OAuth state or authorization code")),
        );
        return;
      }

      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(
        "Your Microsoft account is now connected. You can close this window.",
      );
      server.close(() => resolve(code));
    });

    server.once("error", (error) => reject(error));

    // Auto-reject if the user doesn't complete sign-in within the timeout window
    const timeoutId = setTimeout(() => {
      server.close(() =>
        reject(new Error("Timed out waiting for Microsoft sign-in callback")),
      );
    }, oauthTimeoutMs);

    server.on("close", () => clearTimeout(timeoutId));

    server.listen(Number(redirect.port), redirect.hostname, () => {
      shell.openExternal(authUrl.toString()).catch((error) => {
        server.close(() => reject(error));
      });
    });
  });

  // Exchange the authorization code for access + refresh tokens
  const tokenParams = new URLSearchParams({
    client_id: clientId,
    grant_type: "authorization_code",
    code: authCode,
    redirect_uri: redirectUri,
    code_verifier: verifier,
    scope,
  });

  const tokenResponse = await fetch(`${authority}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: tokenParams.toString(),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    throw new Error(
      `Microsoft token exchange failed (${tokenResponse.status}): ${errorText}`,
    );
  }

  const tokenPayload = (await tokenResponse.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope: string;
    token_type: string;
  };

  // Fetch the user's profile to get their ID and email address
  const profileResponse = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: {
      Authorization: `Bearer ${tokenPayload.access_token}`,
    },
  });

  if (!profileResponse.ok) {
    const errorText = await profileResponse.text();
    throw new Error(
      `Microsoft profile request failed (${profileResponse.status}): ${errorText}`,
    );
  }

  const profile = (await profileResponse.json()) as {
    id: string;
    displayName?: string;
    userPrincipalName?: string;
    mail?: string;
  };

  const accountId = `ms-${profile.id}`;
  const email = profile.mail || profile.userPrincipalName;

  if (!email) {
    throw new Error("Microsoft profile did not include an email address");
  }

  // Persist the tokens encrypted on disk
  const tokens = loadMicrosoftTokens();

  tokens[accountId] = {
    accountId,
    provider: "microsoft",
    accessToken: tokenPayload.access_token,
    refreshToken: tokenPayload.refresh_token,
    expiresAt: Date.now() + tokenPayload.expires_in * 1000,
    scope: tokenPayload.scope,
    tokenType: tokenPayload.token_type,
    clientId,
    tenantId,
    redirectUri,
    oauthScope: scope,
  };

  saveMicrosoftTokens(tokens);

  return {
    account: {
      id: accountId,
      name: profile.displayName || email,
      email,
      provider: "microsoft",
      externalId: profile.id,
    },
  };
});

// =============================================================================
// IPC HANDLERS — MICROSOFT ACCOUNT MANAGEMENT
// =============================================================================

/** Removes all local data and stored tokens for a Microsoft account. */
ipcMain.handle("microsoft-account:delete", async (_event, payload) => {
  const accountId = validateAccountId(payload?.accountId);

  db.transaction(() => {
    db.prepare("DELETE FROM email_labels WHERE accountId = ?").run(accountId);
    db.prepare("DELETE FROM emails WHERE accountId = ?").run(accountId);
    db.prepare("DELETE FROM folders WHERE accountId = ?").run(accountId);
  })();

  const tokens = loadMicrosoftTokens();
  if (tokens[accountId]) {
    delete tokens[accountId];
    saveMicrosoftTokens(tokens);
  }

  return { success: true };
});

// =============================================================================
// IPC HANDLERS — GOOGLE OAUTH
// =============================================================================

ipcMain.handle("google-oauth:connect", async () => {
  const redirect = new URL(GOOGLE_REDIRECT_URI);

  const verifier = toBase64Url(crypto.randomBytes(64));
  const challenge = toBase64Url(crypto.createHash("sha256").update(verifier).digest());
  const state = toBase64Url(crypto.randomBytes(32));

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.search = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    response_type: "code",
    redirect_uri: GOOGLE_REDIRECT_URI,
    scope: GOOGLE_SCOPE,
    access_type: "offline",
    prompt: "consent select_account",
    code_challenge_method: "S256",
    code_challenge: challenge,
    state,
  }).toString();

  const authCode = await new Promise<string>((resolve, reject) => {
    const server = http.createServer((req, res) => {
      if (!req.url) return;

      const expectedHost = `${redirect.hostname}:${redirect.port}`;
      if (req.headers.host !== expectedHost) {
        res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Bad request.");
        return;
      }

      const requestUrl = new URL(req.url, GOOGLE_REDIRECT_URI);

      if (requestUrl.pathname !== redirect.pathname) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Not found.");
        return;
      }

      const receivedState = requestUrl.searchParams.get("state");
      const code = requestUrl.searchParams.get("code");
      const error = requestUrl.searchParams.get("error");
      const errorDescription = requestUrl.searchParams.get("error_description");

      if (error) {
        res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Google sign-in failed. You can close this window.");
        server.close(() => reject(new Error(errorDescription || error)));
        return;
      }

      if (receivedState !== state || !code) {
        res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Invalid sign-in response. You can close this window.");
        server.close(() => reject(new Error("Invalid OAuth state or authorization code")));
        return;
      }

      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Your Google account is now connected. You can close this window.");
      server.close(() => resolve(code));
    });

    server.once("error", (error) => reject(error));

    const timeoutId = setTimeout(() => {
      server.close(() => reject(new Error("Timed out waiting for Google sign-in callback")));
    }, oauthTimeoutMs);

    server.on("close", () => clearTimeout(timeoutId));

    server.listen(Number(redirect.port), redirect.hostname, () => {
      shell.openExternal(authUrl.toString()).catch((error) => {
        server.close(() => reject(error));
      });
    });
  });

  // Exchange auth code for tokens
  const tokenParams = buildGoogleAuthorizationCodeParams({
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    code: authCode,
    redirectUri: GOOGLE_REDIRECT_URI,
    codeVerifier: verifier,
  });

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: tokenParams.toString(),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    const debugContext = buildGoogleTokenExchangeDebugContext({
      clientId: GOOGLE_CLIENT_ID,
      redirectUri: GOOGLE_REDIRECT_URI,
    });
    console.error("[google-oauth] token exchange failed", {
      status: tokenResponse.status,
      errorText,
      ...debugContext,
    });
    throw new Error(
      formatGoogleTokenExchangeError(
        tokenResponse.status,
        errorText,
        debugContext,
      ),
    );
  }

  const tokenPayload = (await tokenResponse.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope: string;
    token_type: string;
  };

  // Fetch user profile
  const profileResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenPayload.access_token}` },
  });

  if (!profileResponse.ok) {
    const errorText = await profileResponse.text();
    throw new Error(`Google profile request failed (${profileResponse.status}): ${errorText}`);
  }

  const profile = (await profileResponse.json()) as {
    id: string;
    name?: string;
    email?: string;
  };

  if (!profile.email) throw new Error("Google profile did not include an email address");

  const accountId = `google-${profile.id}`;

  const tokens = loadGoogleTokens();
  tokens[accountId] = {
    accountId,
    provider: "google",
    accessToken: tokenPayload.access_token,
    refreshToken: tokenPayload.refresh_token,
    expiresAt: Date.now() + tokenPayload.expires_in * 1000,
    scope: tokenPayload.scope,
    tokenType: tokenPayload.token_type,
    clientId: GOOGLE_CLIENT_ID,
    oauthScope: GOOGLE_SCOPE,
  };
  saveGoogleTokens(tokens);

  // Pre-create Gmail system folders in the DB
  gmailUpsertFolders(accountId);

  return {
    account: {
      id: accountId,
      name: profile.name || profile.email,
      email: profile.email,
      provider: "google",
      externalId: profile.id,
    },
  };
});

// =============================================================================
// IPC HANDLERS — GOOGLE ACCOUNT MANAGEMENT
// =============================================================================

ipcMain.handle("google-account:delete", async (_event, payload) => {
  const accountId = validateAccountId(payload?.accountId);

  db.transaction(() => {
    db.prepare("DELETE FROM email_labels WHERE accountId = ?").run(accountId);
    db.prepare("DELETE FROM emails WHERE accountId = ?").run(accountId);
    db.prepare("DELETE FROM folders WHERE accountId = ?").run(accountId);
  })();

  const tokens = loadGoogleTokens();
  if (tokens[accountId]) {
    delete tokens[accountId];
    saveGoogleTokens(tokens);
  }

  return { success: true };
});

ipcMain.handle("accounts:get-health", () => {
  return getAccountHealthSnapshots();
});

// =============================================================================
// IPC HANDLERS — IMAP ACCOUNT MANAGEMENT
// =============================================================================

ipcMain.handle("imap-account:connect", async (_event, payload) => {
  const config = validateImapConnectionConfig(payload);
  const accountId = buildImapAccountId(config.email);
  const now = new Date().toISOString();
  const accounts = loadImapAccounts();

  accounts[accountId] = {
    ...config,
    accountId,
    provider: "imap",
    createdAt: accounts[accountId]?.createdAt ?? now,
    updatedAt: now,
  };

  saveImapAccounts(accounts);
  upsertImapSystemFolders(accountId);

  return {
    account: {
      id: accountId,
      name: config.displayName,
      email: config.email,
      provider: "imap",
      externalId: config.host,
    },
  };
});

ipcMain.handle("imap-account:delete", async (_event, payload) => {
  const accountId = validateAccountId(payload?.accountId);

  db.transaction(() => {
    db.prepare("DELETE FROM email_labels WHERE accountId = ?").run(accountId);
    db.prepare("DELETE FROM emails WHERE accountId = ?").run(accountId);
    db.prepare("DELETE FROM folders WHERE accountId = ?").run(accountId);
  })();

  const accounts = loadImapAccounts();
  if (accounts[accountId]) {
    delete accounts[accountId];
    saveImapAccounts(accounts);
  }

  return { success: true };
});

ipcMain.handle("imap:sync", async (_event, payload) => {
  const accountId = validateAccountId(payload?.accountId);
  return syncImapAccount(accountId);
});

// =============================================================================
// IPC HANDLERS — GMAIL MAIL
// =============================================================================

ipcMain.handle("gmail:sync", async (_event, payload) => {
  const accountId = validateAccountId(payload?.accountId);
  const accessToken = await getValidGoogleAccessToken(accountId);

  gmailUpsertFolders(accountId);

  const labelLimits: Array<{ labelId: string; max: number }> = [
    { labelId: "INBOX",   max: 50 },
    { labelId: "SENT",    max: 25 },
    { labelId: "DRAFT",   max: 10 },
    { labelId: "STARRED", max: 10 },
    { labelId: "TRASH",   max: 10 },
  ];

  for (const { labelId, max } of labelLimits) {
    await gmailFetchMessagesForLabel(accessToken, accountId, labelId, max);
  }

  return { messagesByFolder: getLocalMessagesByFolder(accountId) };
});

ipcMain.handle("gmail:get-body", async (_event, payload) => {
  const accountId = validateAccountId(payload?.accountId);
  const messageId = assertString(payload?.messageId, "messageId", 2048);

  const accessToken = await getValidGoogleAccessToken(accountId);

  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(messageId)}?format=full`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gmail get message failed (${response.status}): ${err}`);
  }

  const msg = (await response.json()) as GmailMessage;
  const folderId = (msg.labelIds ?? []).find((l) =>
    GMAIL_SYSTEM_FOLDERS.some((f) => f.id === l),
  ) ?? "INBOX";

  gmailUpsertMessage(accountId, folderId, msg);

  const body = gmailExtractBody(msg.payload as GmailMessagePart | undefined);
  return { content: body.content, contentType: body.contentType };
});

ipcMain.handle("gmail:send", async (_event, payload) => {
  const accountId = validateAccountId(payload?.accountId);
  const to      = assertString(payload?.to, "to", 4096);
  const cc      = optionalString(payload?.cc, "cc", 4096);
  const subject = optionalString(payload?.subject, "subject", 512);
  const body    = optionalString(payload?.body, "body", 500_000);

  const accessToken = await getValidGoogleAccessToken(accountId);

  const tokens = loadGoogleTokens();
  const token  = tokens[accountId];
  if (!token) throw new Error("No Google token stored for this account");

  const lines: string[] = [
    `To: ${to}`,
    ...(cc ? [`Cc: ${cc}`] : []),
    `Subject: ${subject || "(No subject)"}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=utf-8",
    "",
    sanitizeOutgoingHtml(body || " "),
  ];

  const raw = Buffer.from(lines.join("\r\n")).toString("base64url");

  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gmail send failed (${response.status}): ${err}`);
  }

  return { success: true };
});

ipcMain.handle("gmail:mark-read", async (_event, payload) => {
  const accountId = validateAccountId(payload?.accountId);
  const messageId = assertString(payload?.messageId, "messageId", 2048);
  const accessToken = await getValidGoogleAccessToken(accountId);

  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(messageId)}/modify`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ removeLabelIds: ["UNREAD"] }),
    },
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gmail mark-read failed (${response.status}): ${err}`);
  }

  db.prepare("UPDATE emails SET isRead = 1 WHERE id = ? AND accountId = ?").run(messageId, accountId);
  return { success: true };
});

ipcMain.handle("gmail:mark-unread", async (_event, payload) => {
  const accountId = validateAccountId(payload?.accountId);
  const messageId = assertString(payload?.messageId, "messageId", 2048);
  const accessToken = await getValidGoogleAccessToken(accountId);

  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(messageId)}/modify`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ addLabelIds: ["UNREAD"] }),
    },
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gmail mark-unread failed (${response.status}): ${err}`);
  }

  db.prepare("UPDATE emails SET isRead = 0 WHERE id = ? AND accountId = ?").run(messageId, accountId);
  return { success: true };
});

ipcMain.handle("gmail:toggle-star", async (_event, payload) => {
  const accountId = validateAccountId(payload?.accountId);
  const messageId = assertString(payload?.messageId, "messageId", 2048);
  const isStarred = Boolean(payload?.isStarred);
  const accessToken = await getValidGoogleAccessToken(accountId);

  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(messageId)}/modify`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(
        isStarred
          ? { addLabelIds: ["STARRED"] }
          : { removeLabelIds: ["STARRED"] },
      ),
    },
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gmail toggle-star failed (${response.status}): ${err}`);
  }

  db.prepare("UPDATE emails SET isStarred = ? WHERE id = ? AND accountId = ?").run(
    isStarred ? 1 : 0, messageId, accountId,
  );
  return { success: true };
});

ipcMain.handle("gmail:move", async (_event, payload) => {
  const accountId    = validateAccountId(payload?.accountId);
  const messageId    = assertString(payload?.messageId, "messageId", 2048);
  const destination  = assertString(payload?.destination, "destination", 64).toUpperCase();

  const validDestinations = new Set(["INBOX", "TRASH", "SPAM", "DRAFT", "ARCHIVE"]);
  if (!validDestinations.has(destination)) throw new Error("Invalid Gmail destination label");

  const accessToken = await getValidGoogleAccessToken(accountId);
  const { addLabelIds, removeLabelIds } =
    buildGmailMoveLabelMutation(destination);

  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(messageId)}/modify`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ addLabelIds, removeLabelIds }),
    },
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gmail move failed (${response.status}): ${err}`);
  }

  db.prepare("UPDATE emails SET folder = ? WHERE id = ? AND accountId = ?").run(
    destination, messageId, accountId,
  );
  return { success: true };
});

// =============================================================================
// IPC HANDLERS — MICROSOFT MAIL
// =============================================================================

/** Sends an email via the Graph API sendMail endpoint. */
ipcMain.handle("microsoft-mail:send", async (_event, payload) => {
  const accountId = validateAccountId(payload?.accountId);
  const to = assertString(payload?.to, "to", 4096);
  const cc = optionalString(payload?.cc, "cc", 4096);
  const subject = optionalString(payload?.subject, "subject", 512);
  const body = optionalString(payload?.body, "body", 500_000);

  const accessToken = await getValidMicrosoftAccessToken(accountId);

  const messagePayload = {
    message: {
      subject: subject || "(No subject)",
      body: {
        contentType: "html",
        content: sanitizeOutgoingHtml(body || " "),
      },
      toRecipients: parseRecipients(to),
      ccRecipients: parseRecipients(cc),
    },
    saveToSentItems: true,
  };

  const response = await fetch("https://graph.microsoft.com/v1.0/me/sendMail", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messagePayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send email: ${errorText}`);
  }

  return { success: true };
});

/** Sends a reply through Graph's message reply action. */
ipcMain.handle("microsoft-mail:reply", async (_event, payload) => {
  const accountId = validateAccountId(payload?.accountId);
  const messageId = validateMessageId(payload?.messageId);
  const comment = optionalString(payload?.comment, "comment", 500_000);
  const accessToken = await getValidMicrosoftAccessToken(accountId);
  const encodedMessageId = encodeURIComponent(messageId);

  const response = await fetch(
    `https://graph.microsoft.com/v1.0/me/messages/${encodedMessageId}/reply`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildGraphReplyPayload(comment || "")),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to reply to email: ${errorText}`);
  }

  return { success: true };
});

/**
 * ⚠️  DEPRECATED / LEGACY — microsoft-mail:syncInbox
 *
 * This handler only syncs the inbox folder and does NOT sync the folder list.
 * It predates the full syncMailboxToLocalDb implementation.
 *
 * Use 'microsoft-mail:sync' instead, which syncs ALL folders and their messages.
 *
 * Safe to remove once all callers have been migrated to 'microsoft-mail:sync'.
 */
ipcMain.handle("microsoft-mail:syncInbox", async (_event, payload) => {
  const accountId = validateAccountId(payload?.accountId);

  if (activeFullSyncs.has(accountId)) {
    return activeFullSyncs.get(accountId);
  }

  const syncPromise = (async () => {
    try {
      if (shouldRunInitialFullSync(accountId)) {
        return await syncMailboxInitialFull(accountId);
      }

      const inboxId = getLocalInboxFolderId(accountId);
      return await syncMailboxTargetedDelta(accountId, [inboxId]);
    } finally {
      activeFullSyncs.delete(accountId);
    }
  })();

  activeFullSyncs.set(accountId, syncPromise);

  return syncPromise;
});

ipcMain.handle("labels:list", (_event, payload) => {
  const accountId = validateAccountId(payload?.accountId);

  return getLocalLabels(accountId);
});

ipcMain.handle("labels:delete", (_event, payload) => {
  const accountId = validateAccountId(payload?.accountId);
  const labelId = validateLabelId(payload?.labelId);

  const deleteLabel = db.transaction(() => {
    db.prepare(
      `
      DELETE FROM email_labels
      WHERE accountId = ? AND labelId = ?
    `,
    ).run(accountId, labelId);

    return db
      .prepare(
        `
      DELETE FROM labels
      WHERE accountId = ? AND id = ?
    `,
      )
      .run(accountId, labelId);
  });

  const result = deleteLabel();

  if (result.changes === 0) {
    throw new Error("Label not found");
  }

  return { success: true };
});

ipcMain.handle("labels:remove-email", (_event, payload) => {
  const accountId = validateAccountId(payload?.accountId);
  const messageId = validateMessageId(payload?.messageId);
  const labelId = validateLabelId(payload?.labelId);

  db.prepare(
    `
    DELETE FROM email_labels
    WHERE accountId = ? AND messageId = ? AND labelId = ?
  `,
  ).run(accountId, messageId, labelId);

  return { success: true };
});
/** Marks a single message as read both locally (DB) and remotely (Graph API). */
ipcMain.handle("microsoft-mail:mark-read", async (_event, payload) => {
  const accountId = validateAccountId(payload?.accountId);
  const messageId = validateMessageId(payload?.messageId);
  const isRead = resolveMarkReadValue(payload?.isRead);

  // Optimistic local update so the UI stays responsive
  db.prepare(
    `UPDATE emails SET isRead = ? WHERE id = ? AND accountId = ?`,
  ).run(isRead ? 1 : 0, messageId, accountId);

  // Sync to Graph API immediately using a fresh (auto-refreshed) token
  const accessToken = await getValidMicrosoftAccessToken(accountId);
  const encodedMessageId = encodeURIComponent(messageId);

  const response = await fetch(
    `https://graph.microsoft.com/v1.0/me/messages/${encodedMessageId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isRead }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    // Self-heal: if the message is gone server-side, remove the stale local copy
    if (response.status === 404 || errorText.includes("ErrorItemNotFound")) {
      db.prepare("DELETE FROM emails WHERE accountId = ? AND id = ?").run(
        accountId,
        messageId,
      );
      return { success: false, missing: true };
    }
    throw new Error(`Failed to mark message as read: ${errorText}`);
  }

  return { success: true };
});

/** Marks a single message as unread both remotely (Graph API) and locally (DB). */
ipcMain.handle("microsoft-mail:mark-unread", async (_event, payload) => {
  const accountId = validateAccountId(payload?.accountId);
  const messageId = validateMessageId(payload?.messageId);
  const accessToken = await getValidMicrosoftAccessToken(accountId);
  const encodedMessageId = encodeURIComponent(messageId);

  const response = await fetch(
    `https://graph.microsoft.com/v1.0/me/messages/${encodedMessageId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isRead: false }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    // SELF-HEALING: If missing on server, delete local stale copy
    if (response.status === 404 || errorText.includes("ErrorItemNotFound")) {
      db.prepare("DELETE FROM emails WHERE accountId = ? AND id = ?").run(
        accountId,
        messageId,
      );
      return { success: false, missing: true };
    }
    throw new Error(`Failed to mark message as unread: ${errorText}`);
  }

  db.prepare("UPDATE emails SET isRead = 0 WHERE accountId = ? AND id = ?").run(
    accountId,
    messageId,
  );

  return { success: true };
});

ipcMain.handle("mail:snooze", (_event, payload) => {
  const accountId = validateAccountId(payload?.accountId);
  const messageId = validateMessageId(payload?.messageId);
  const snoozedUntil =
    typeof payload?.snoozedUntil === "string" ? payload.snoozedUntil : "";

  if (!snoozedUntil || Number.isNaN(Date.parse(snoozedUntil))) {
    throw new Error("Invalid snooze date");
  }

  db.prepare(
    `
    UPDATE emails
    SET snoozedUntil = ?
    WHERE accountId = ? AND id = ?
  `,
  ).run(snoozedUntil, accountId, messageId);

  return { success: true };
});

ipcMain.handle("mail:clear-snooze", (_event, payload) => {
  const accountId = validateAccountId(payload?.accountId);
  const messageId = validateMessageId(payload?.messageId);

  db.prepare(
    `
    UPDATE emails
    SET snoozedUntil = NULL
    WHERE accountId = ? AND id = ?
  `,
  ).run(accountId, messageId);

  return { success: true };
});

/** Returns the locally cached folders and messages for an account (no network call). */
/** Returns the locally cached folders and messages for ALL accounts. */
/** Returns the locally cached folders and messages for ALL accounts. */
ipcMain.handle("microsoft-mail:getAllLocal", () => {
  // 1. Get all folders from all accounts
  const folders = db
    .prepare(
      `SELECT * FROM folders ORDER BY accountId, path COLLATE NOCASE ASC`,
    )
    .all() as any[];

  // 2. Get all emails from all accounts
  const emailRows = db
    .prepare(
      `
    SELECT
      id, accountId, folder, subject, bodyPreview, bodyContentType, bodyContent,
      receivedDateTime, isRead, hasAttachments, isStarred, attachments,
      fromName, fromAddress, toRecipients, ccRecipients, snoozedUntil
    FROM emails
    ORDER BY receivedDateTime DESC
  `,
    )
    .all() as any[];

  // Group emails by folder ID
  const messagesByFolder = {} as Record<string, GraphMessage[]>;
  for (const folder of folders) {
    messagesByFolder[folder.id] = rowsToMessages(
      emailRows.filter((r: any) => r.folder === folder.id),
    );
  }

  // 3. Get labels
  const labels = db
    .prepare(`SELECT * FROM labels ORDER BY accountId, name COLLATE NOCASE ASC`)
    .all();

  // 4. Get label mapping
  const labelRows = db
    .prepare(
      `
    SELECT el.messageId, l.id, l.accountId, l.name, l.color, l.createdAt, l.updatedAt
    FROM email_labels el
    INNER JOIN labels l ON l.id = el.labelId AND l.accountId = el.accountId
    ORDER BY l.name COLLATE NOCASE ASC
  `,
    )
    .all() as Array<EmailLabel & { messageId: string }>;

  const labelsByMessageId = labelRows.reduce(
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

  return { folders, messagesByFolder, labels, labelsByMessageId };
});

/** Runs a full mailbox sync (all folders + messages) and returns success. */
ipcMain.handle("microsoft-mail:sync", async (_event, payload) => {
  const accountId = validateAccountId(payload?.accountId);

  if (activeFullSyncs.has(accountId)) {
    return activeFullSyncs.get(accountId);
  }

  const syncPromise = (async () => {
    try {
      if (shouldRunInitialFullSync(accountId)) {
        return await syncMailboxInitialFull(accountId);
      }

      return await syncMailboxDelta(accountId);
    } finally {
      activeFullSyncs.delete(accountId);
    }
  })();

  activeFullSyncs.set(accountId, syncPromise);

  return syncPromise;
});

/**
 * Syncs the full mailbox then returns all messages grouped by folder.
 * Convenience handler combining 'sync' + 'getLocal' in one round-trip.
 */
ipcMain.handle("microsoft-mail:list", async (_event, payload) => {
  const accountId = validateAccountId(payload?.accountId);

  if (!accountHasAnyDeltaState(accountId)) {
    await syncMailboxInitialFull(accountId);
  } else {
    await syncMailboxDelta(accountId);
  }

  return { messagesByFolder: getLocalMessagesByFolder(accountId) };
});

/**
 * Fetches the full HTML body of a message from the Graph API on demand.
 * Caches the result in the local DB (bodyContent + bodyContentType columns).
 * Requests the body as HTML via the Prefer header.
 */

/**
 * Moves a message to a different well-known folder via the Graph API,
 * then updates the local DB to reflect the new folder and (potentially new) message ID.
 * Handles the case where the message was already moved or deleted on the server (404).
 */

ipcMain.removeHandler("microsoft-mail:get-body");

ipcMain.removeHandler("microsoft-mail:get-body");

ipcMain.handle("microsoft-mail:get-body", async (_event, payload) => {
  const accountId = validateAccountId(payload?.accountId);
  const messageId = validateMessageId(payload?.messageId);

  const localEmail = db
    .prepare(
      `
      SELECT
        id,
        accountId,
        bodyContent,
        bodyContentType,
        bodyPreview,
        hasAttachments,
        attachments
      FROM emails
      WHERE accountId = ?
        AND id = ?
      LIMIT 1
    `,
    )
    .get(accountId, messageId) as
    | {
        id: string;
        accountId: string;
        bodyContent?: string;
        bodyContentType?: string;
        bodyPreview?: string;
        hasAttachments?: number;
        attachments?: string;
      }
    | undefined;

  if (!localEmail) {
    throw new Error("Message not found locally.");
  }

  const localAttachments = parseStoredAttachments(localEmail.attachments);

  if (
    shouldUseLocalMessageBody({
      bodyContent: localEmail.bodyContent,
      hasAttachments: Boolean(localEmail.hasAttachments),
      attachmentsJson: localEmail.attachments,
    })
  ) {
    return {
      success: true,
      body: {
        content: localEmail.bodyContent,
        contentType: localEmail.bodyContentType || "html",
      },
      attachments: localAttachments,
      source: "local",
    };
  }

  const accessToken = await getValidMicrosoftAccessToken(accountId);

  const graphUrl =
    `https://graph.microsoft.com/v1.0/me/messages/${encodeURIComponent(
      messageId,
    )}` +
    `?$select=${encodeURIComponent("id,body,bodyPreview")}` +
    `&$expand=${encodeURIComponent(
      "attachments($select=id,name,size,contentType,isInline)",
    )}`;

  const response = await fetch(graphUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Prefer: 'outlook.body-content-type="html", IdType="ImmutableId"',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Failed to fetch message body from Microsoft Graph:", {
      status: response.status,
      accountId,
      messageId,
      errorText,
    });

    // Do not hard-fail the UI. Show the preview instead.
    if (localEmail.bodyPreview?.trim()) {
      return {
        success: true,
        body: {
          content: `<p>${escapeHtml(localEmail.bodyPreview).replace(
            /\n/g,
            "<br/>",
          )}</p>`,
          contentType: "html",
        },
        source: "preview-fallback",
        warning:
          "Could not fetch the full email body from Microsoft Graph. Showing preview instead.",
      };
    }

    throw new Error(
      `Cannot access full message body. Microsoft Graph returned ${response.status}.`,
    );
  }

  const message = (await response.json()) as {
    id: string;
    body?: {
      contentType?: string;
      content?: string;
    };
    bodyPreview?: string;
    attachments?: Array<{
      id?: string;
      name?: string;
      size?: number;
      contentType?: string;
      isInline?: boolean;
      contentId?: string;
      ["@odata.type"]?: string;
    }>;
  };

  const bodyContent = message.body?.content || "";
  const bodyContentType = message.body?.contentType || "html";
  const attachments = Array.isArray(message.attachments)
    ? message.attachments
        .filter((attachment) =>
          String(attachment?.["@odata.type"] || "").includes("fileAttachment"),
        )
        .map((attachment) => ({
          id: attachment.id || "",
          name: attachment.name || "Unknown File",
          size: attachment.size || 0,
          contentType: attachment.contentType || "application/octet-stream",
          isInline: Boolean(attachment.isInline),
          contentId: attachment.contentId || undefined,
        }))
        .filter((attachment) => attachment.id)
    : [];

  db.prepare(
    `
    UPDATE emails
    SET
      bodyContent = ?,
      bodyContentType = ?,
      attachments = ?,
      bodyPreview = CASE
        WHEN ? <> '' THEN ?
        ELSE bodyPreview
      END
    WHERE accountId = ?
      AND id = ?
  `,
  ).run(
    bodyContent,
    bodyContentType,
    JSON.stringify(attachments),
    message.bodyPreview || "",
    message.bodyPreview || "",
    accountId,
    messageId,
  );

  return {
    success: true,
    body: {
      content: bodyContent,
      contentType: bodyContentType,
    },
    attachments,
    source: "graph",
  };
});

ipcMain.handle("microsoft-mail:move-to-folder", async (_event, payload) => {
  const accountId = validateAccountId(payload?.accountId);
  const messageId = validateMessageId(payload?.messageId);
  const destinationFolderId = validateFolderId(payload?.destinationFolderId);

  const destinationFolder = db
    .prepare(
      `
      SELECT id
      FROM folders
      WHERE accountId = ? AND id = ?
      LIMIT 1
    `,
    )
    .get(accountId, destinationFolderId);

  if (!destinationFolder) {
    throw new Error("Destination folder not found");
  }

  const sourceEmail = db
    .prepare(
      `
      SELECT id
      FROM emails
      WHERE accountId = ? AND id = ?
      LIMIT 1
    `,
    )
    .get(accountId, messageId);

  if (!sourceEmail) {
    throw new Error("Email not found");
  }

  const accessToken = await getValidMicrosoftAccessToken(accountId);
  const movedMessage = await moveGraphMessageToFolder(
    accessToken,
    messageId,
    destinationFolderId,
  );

  db.transaction(() => {
    db.prepare(
      `
      DELETE FROM emails
      WHERE accountId = ? AND id = ?
    `,
    ).run(accountId, messageId);

    db.prepare(
      `
      INSERT OR REPLACE INTO emails (
        id,
        accountId,
        folder,
        subject,
        bodyPreview,
        receivedDateTime,
        isRead,
        hasAttachments,
        fromName,
        fromAddress,
        toRecipients,
        ccRecipients
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    ).run(
      movedMessage.id,
      accountId,
      destinationFolderId,
      movedMessage.subject || "",
      movedMessage.bodyPreview || "",
      movedMessage.receivedDateTime || "",
      movedMessage.isRead ? 1 : 0,
      movedMessage.hasAttachments ? 1 : 0,
      movedMessage.from?.emailAddress?.name || "",
      movedMessage.from?.emailAddress?.address || "",
      JSON.stringify(movedMessage.toRecipients || []),
      JSON.stringify(movedMessage.ccRecipients || []),
    );
  })();

  return {
    success: true,
    messageId: movedMessage.id,
    destinationFolderId,
  };
});

ipcMain.handle("microsoft-mail:move", async (_event, payload) => {
  const accountId = validateAccountId(payload?.accountId);
  const messageId = validateMessageId(payload?.messageId);
  const destinationFolderKey = validateDestinationFolder(
    payload?.destinationFolder,
  );
  const accessToken = await getValidMicrosoftAccessToken(accountId);
  const encodedMessageId = encodeURIComponent(messageId);

  // Look up the actual Graph Folder ID from the local database
  const targetFolderRow = db
    .prepare(
      `
    SELECT id FROM folders 
    WHERE accountId = ? AND wellKnownName = ? 
    LIMIT 1
  `,
    )
    .get(accountId, destinationFolderKey) as { id?: string } | undefined;

  // Fallback to the key itself if the folder hasn't synced locally yet
  const actualDestinationDbId = targetFolderRow?.id || destinationFolderKey;

  // Tell Graph API to move it (Graph accepts the well-known string here)
  const response = await fetch(
    `https://graph.microsoft.com/v1.0/me/messages/${encodedMessageId}/move`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        destinationId: destinationFolderKey,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    if (response.status === 404 || errorText.includes("ErrorItemNotFound")) {
      db.prepare("DELETE FROM emails WHERE accountId = ? AND id = ?").run(
        accountId,
        messageId,
      );
      return {
        success: false,
        alreadyMovedOrMissing: true,
        message:
          "Message was not found on the server. Local stale copy was removed.",
      };
    }
    throw new Error(`Failed to move message on server: ${errorText}`);
  }

  const data = await response.json();

  // Update the local DB using the actual Graph Folder ID, not the string key
  if (data.id) {
    db.prepare(
      "UPDATE emails SET folder = ?, id = ? WHERE accountId = ? AND id = ?",
    ).run(actualDestinationDbId, data.id, accountId, messageId);
  } else {
    db.prepare(
      "UPDATE emails SET folder = ? WHERE accountId = ? AND id = ?",
    ).run(actualDestinationDbId, accountId, messageId);
  }

  return { success: true };
});

// =============================================================================
// APP LIFECYCLE
// =============================================================================

// Content Security Policy strings.
// All network I/O happens in the main process via IPC — the renderer never
// calls external APIs directly, so connect-src can be 'self' only.
// Email images load inside the sandboxed iframe (same-origin), so img-src
// must allow https: to let remote images through when the user enables them.
const CSP_PROD = [
  "default-src 'self'",
  "script-src 'self'",
  // unsafe-inline is required for React inline style props
  "style-src 'self' 'unsafe-inline'",
  // https: covers remote email images inside the sandboxed iframe
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join("; ");

// Dev CSP is looser: Vite HMR needs ws:, unsafe-eval (source maps), unsafe-inline
// (React SWC plugin injects an inline preamble script for fast refresh), and localhost
const CSP_DEV = [
  "default-src 'self' http://localhost:* ws://localhost:*",
  "script-src 'self' http://localhost:* 'unsafe-eval' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' http://localhost:*",
  "img-src 'self' data: blob: https: http://localhost:*",
  "font-src 'self' data: http://localhost:*",
  "connect-src 'self' ws://localhost:* http://localhost:*",
  "frame-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join("; ");

app.whenReady().then(() => {
  // Inject Content-Security-Policy on every response the renderer receives.
  // This covers both file:// (production) and http://localhost (dev).
  electron.session.defaultSession.webRequest.onHeadersReceived(
    (details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": [
            app.isPackaged ? CSP_PROD : CSP_DEV,
          ],
        },
      });
    },
  );

  // Deny all permission requests (notifications, geolocation, media, etc.)
  // The app has no legitimate need for any of these.
  electron.session.defaultSession.setPermissionRequestHandler(
    (_webContents, _permission, callback) => callback(false),
  );

  createWindow();

  // Check for updates a few seconds after startup so the window is ready
  if (app.isPackaged) {
    setTimeout(() => {
      autoUpdater.checkForUpdates().catch((err) => {
        console.error("[updater] Startup check failed:", err?.message ?? err);
      });
    }, 5000);
  }
});

// On non-macOS platforms, quit when all windows are closed
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// On macOS, re-create the window if the dock icon is clicked and no windows are open
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
function getTokensByAccountId(
  accountId: string,
  _authEnv: MicrosoftOAuthEnv,
): MicrosoftStoredToken | undefined {
  const tokens = loadMicrosoftTokens();
  const token = tokens[accountId];

  if (
    !token ||
    token.provider !== "microsoft" ||
    token.accountId !== accountId
  ) {
    return undefined;
  }

  return token;
}
async function updateMessage(
  accessToken: string,
  messageId: any,
  arg2: { isRead: any },
) {
  const encodedMessageId = encodeURIComponent(
    assertString(messageId, "messageId", 2048),
  );
  const isRead = Boolean(arg2.isRead);

  const url = `https://graph.microsoft.com/v1.0/me/messages/${encodedMessageId}`;
  const body = JSON.stringify({ isRead });

  for (let attempt = 1; attempt <= maxGraphFetchAttempts; attempt += 1) {
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body,
    });

    if (response.ok) {
      return;
    }

    const errorText = await response.text();
    const shouldRetry =
      response.status === 429 ||
      response.status === 500 ||
      response.status === 502 ||
      response.status === 503 ||
      response.status === 504;

    if (!shouldRetry || attempt === maxGraphFetchAttempts) {
      throw new Error(
        `Microsoft Graph message update failed (${response.status}): ${errorText}`,
      );
    }

    await sleep(getGraphRetryDelayMs(response, attempt));
  }

  throw new Error("Microsoft Graph message update failed after retries");
}

