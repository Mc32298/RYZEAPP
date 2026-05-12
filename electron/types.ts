// =============================================================================
// types.ts — Shared TypeScript interfaces and type aliases for the Electron
//            main process.
// =============================================================================

import type { ImapConnectionConfig } from "./imapConfig";

export interface EmailLabel {
  id: string;
  accountId: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface GraphMailFolder {
  id: string;
  displayName: string;
  parentFolderId?: string;
  wellKnownName?: string;
  totalItemCount?: number;
  unreadItemCount?: number;
  depth?: number;
  path?: string;
}

export type AiProvider = "gemini";

export interface StoredAiProviderKey {
  apiKey: string;
  updatedAt: string;
}

export type StoredAiProviderKeys = Partial<Record<AiProvider, StoredAiProviderKey>>;

export interface GraphMailFolderListResponse {
  value: GraphMailFolder[];
}

export interface MicrosoftOAuthEnv {
  clientId: string;
  tenantId: string;
  redirectUri: string;
  scope: string;
}

export interface MicrosoftStoredToken {
  accountId: string;
  provider: "microsoft";
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  scope: string;
  tokenType: string;
  clientId?: string;
  tenantId?: string;
  redirectUri?: string;
  oauthScope?: string;
}

export interface GoogleStoredToken {
  accountId: string;
  provider: "google";
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  scope: string;
  tokenType: string;
  clientId?: string;
  oauthScope?: string;
}

export interface StoredImapAccount extends ImapConnectionConfig {
  accountId: string;
  provider: "imap";
  createdAt: string;
  updatedAt: string;
}

export interface AccountHealthSnapshot {
  accountId: string;
  provider: "microsoft" | "google" | "imap";
  syncStatus: "ok" | "warning" | "idle";
  tokenStatus: "ok" | "expiring" | "expired" | "n/a";
  tokenExpiresAt: string | null;
  lastSyncAt: string | null;
  folderErrors: number;
  storageBytes: number;
}

export interface BackendSettings {
  aiProvider?: string;
  geminiModel?: string;
  ollamaBaseUrl?: string;
  ollamaModel?: string;
}

export interface BackupEnvelope {
  version: 1;
  createdAt: string;
  data: {
    settings: BackendSettings;
    folders: any[];
    emails: any[];
    labels: any[];
    emailLabels: any[];
    folderSyncState: any[];
  };
}

export interface GmailMessageHeader {
  name: string;
  value: string;
}

export interface GmailMessagePart {
  mimeType?: string;
  body?: { data?: string; size?: number };
  parts?: GmailMessagePart[];
}

export interface GmailMessage {
  id: string;
  threadId?: string;
  labelIds?: string[];
  snippet?: string;
  payload?: {
    headers?: GmailMessageHeader[];
    body?: { data?: string };
    parts?: GmailMessagePart[];
  };
}

export interface GmailMessageListResponse {
  messages?: Array<{ id: string; threadId: string }>;
  nextPageToken?: string;
  resultSizeEstimate?: number;
}

export interface GraphMessageAddress {
  emailAddress?: {
    name?: string;
    address?: string;
  };
}

export interface GraphMessage {
  id: string;
  subject?: string;
  bodyPreview?: string;
  body?: {
    contentType?: "text" | "html";
    content?: string;
  };
  receivedDateTime?: string;
  isRead?: boolean;
  hasAttachments?: boolean;
  from?: GraphMessageAddress;
  sender?: GraphMessageAddress;
  toRecipients?: GraphMessageAddress[];
  ccRecipients?: GraphMessageAddress[];
  snoozedUntil?: string | null;
  "@removed"?: {
    reason?: string;
  };
}

export interface GraphMessageListResponse {
  value: GraphMessage[];
  "@odata.nextLink"?: string;
  "@odata.deltaLink"?: string;
}

export type FolderSyncResult = {
  success: boolean;
  syncedCount?: number;
  updatedCount?: number;
  deletedCount?: number;
  deltaLink?: string;
};

export type GraphFolderKey =
  | "inbox"
  | "sentitems"
  | "drafts"
  | "archive"
  | "deleteditems";

export interface MailProvider {
  sendEmail(accountId: string, payload: any): Promise<any>;
  markAsRead(accountId: string, messageId: string): Promise<void>;
  markAsUnread(accountId: string, messageId: string): Promise<void>;
  toggleStar(accountId: string, messageId: string, isStarred: boolean): Promise<void>;
  moveMessage(accountId: string, messageId: string, destination: string): Promise<void>;
  replyEmail(accountId: string, messageId: string, comment: string): Promise<void>;
  sync(accountId: string): Promise<{ success: boolean }>;
  deleteAccount(accountId: string): Promise<void>;
  createFolder(accountId: string, displayName: string): Promise<any>;
  renameFolder(accountId: string, folderId: string, displayName: string): Promise<any>;
  deleteFolder(accountId: string, folderId: string): Promise<void>;
  emptyFolder(accountId: string, folderId: string): Promise<void>;
  setFolderIcon(accountId: string, folderId: string, icon: string): Promise<any>;
  getBody(accountId: string, messageId: string): Promise<{ content: string; contentType: string; attachments?: any[]; source?: string; warning?: string }>;
  refreshToken(accountId: string): Promise<string>;
}
