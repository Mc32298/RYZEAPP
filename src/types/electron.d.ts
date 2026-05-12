import { Account, MailFolder, EmailLabel } from "./email";

type GraphFolderKey = string;

interface GraphMessageAddress {
  emailAddress?: {
    name?: string;
    address?: string;
  };
}

interface GraphMessage {
  id: string;
  subject?: string;
  bodyPreview?: string;
  body?: {
    contentType?: "text" | "html";
    content?: string;
  };
  receivedDateTime?: string;
  isRead?: boolean;
  isStarred?: boolean;
  hasAttachments?: boolean;
  attachments?: any[];
  fromName?: string;
  fromAddress?: string;
  toRecipients?: string;
  ccRecipients?: string;
  snoozedUntil?: string;
}

declare global {
  interface Window {
    electronAPI: {
      minimizeWindow: () => void;
      maximizeWindow: () => void;
      closeWindow: () => void;

      // --- APP INFO ---
      getAppVersion: () => Promise<string>;

      // --- AUTO UPDATER ---
      checkUpdates: () => Promise<void>;
      startUpdateDownload: () => Promise<void>;
      installUpdate: () => Promise<void>;
      onUpdateAvailable: (callback: (version: string) => void) => void;
      onUpdateDownloaded: (callback: () => void) => void;
      onUpdateError: (callback: (message: string) => void) => void;
      removeUpdaterListeners: () => void;

      // --- SYSTEM & STORAGE ---
      getDrafts: () => Promise<any[]>;
      saveDrafts: (drafts: any[]) => void;
      onDraftsSaveFailed: (callback: (message: string) => void) => void;
      removeDraftsListeners: () => void;
      getStorageUsage: () => Promise<{ dbSizeGB: number }>;
      exportEncryptedBackup: () => Promise<{ success: boolean; filePath?: string; canceled?: boolean }>;
      importEncryptedBackup: () => Promise<{ success: boolean; accountCount?: number; canceled?: boolean; filePath?: string }>;
      getAccountHealth: () => Promise<any>;
      updateBackendSettings: (settings: any) => void;

      // --- AI FEATURES ---
      summarizeEmailWithAi: (payload: {
        subject: string;
        senderName: string;
        senderEmail: string;
        body: string;
        preview: string;
      }) => Promise<{ summary: string; keyPoints?: string[]; suggestedActions?: string[] }>;
      generateReplyWithAi: (payload: {
        subject: string;
        senderName: string;
        senderEmail: string;
        body: string;
        preview: string;
        tone?: string;
      }) => Promise<{ reply: string }>;
      getAiProviderKeyStatus: (provider: string) => Promise<{
        provider: "gemini";
        configured: boolean;
        source: "local" | "environment" | null;
        updatedAt: string | null;
        encryptionAvailable: boolean;
      }>;
      setAiProviderKey: (provider: string, apiKey: string) => Promise<{
        provider: "gemini";
        configured: boolean;
        source: "local" | "environment" | null;
        updatedAt: string | null;
        encryptionAvailable: boolean;
      }>;
      deleteAiProviderKey: (provider: string) => Promise<{
        provider: "gemini";
        configured: boolean;
        source: "local" | "environment" | null;
        updatedAt: string | null;
        encryptionAvailable: boolean;
      }>;

      // --- GENERIC MAIL OPERATIONS ---
      syncMail: (accountId: string) => Promise<{ success: boolean }>;
      getEmailBody: (accountId: string, messageId: string) => Promise<any>;
      sendEmail: (payload: {
        accountId: string;
        to: string;
        cc?: string;
        subject?: string;
        body?: string;
      }) => Promise<any>;
      replyEmail: (accountId: string, messageId: string, comment: string) => Promise<void>;
      markEmailAsRead: (accountId: string, messageId: string) => Promise<{ success: boolean }>;
      markEmailAsUnread: (accountId: string, messageId: string) => Promise<{ success: boolean }>;
      toggleEmailStar: (accountId: string, messageId: string, isStarred: boolean) => Promise<{ success: boolean }>;
      moveEmail: (accountId: string, messageId: string, destination: string) => Promise<{ success: boolean; messageId: string }>;
      snoozeEmail: (payload: {
        accountId: string;
        messageId: string;
        snoozedUntil: string;
      }) => Promise<{ success: boolean }>;
      clearEmailSnooze: (accountId: string, messageId: string) => Promise<{ success: boolean }>;

      // --- ACCOUNT MANAGEMENT ---
      connectMicrosoftAccount: () => Promise<{ account: any }>;
      connectGoogleAccount: () => Promise<{ account: any }>;
      connectImapAccount: (payload: any) => Promise<{ account: any }>;
      deleteAccount: (accountId: string) => Promise<{ success: boolean }>;

      // --- FOLDER MANAGEMENT ---
      createFolder: (accountId: string, displayName: string) => Promise<any>;
      renameFolder: (accountId: string, folderId: string, displayName: string) => Promise<any>;
      deleteFolder: (accountId: string, folderId: string) => Promise<{ success: boolean; deletedFolderIds?: string[] }>;
      emptyFolder: (accountId: string, folderId: string) => Promise<{ success: boolean }>;
      setFolderIcon: (accountId: string, folderId: string, icon: string) => Promise<any>;

      // --- LABEL MANAGEMENT ---
      getLabels: (accountId: string) => Promise<EmailLabel[]>;
      createLabel: (payload: { accountId: string; name: string; color?: string }) => Promise<EmailLabel>;
      renameLabel: (payload: { accountId: string; labelId: string; name: string }) => Promise<EmailLabel>;
      deleteLabel: (accountId: string, labelId: string) => Promise<{ success: boolean }>;
      assignLabelToEmail: (payload: { accountId: string; messageId: string; labelId: string }) => Promise<{ success: boolean }>;
      removeLabelFromEmail: (payload: { accountId: string; messageId: string; labelId: string }) => Promise<{ success: boolean }>;

      // --- SPECIFIC (To be pruned) ---
      getAllLocalEmails: () => Promise<{
        folders: MailFolder[];
        labels: EmailLabel[];
        messagesByFolder: Record<string, GraphMessage[]>;
        labelsByMessageId: Record<string, EmailLabel[]>;
      }>;
      syncMicrosoftFolders: (accountId: string, folderIds: string[]) => Promise<void>;
      downloadMicrosoftEmailAttachment: (
        accountId: string,
        messageId: string,
        attachmentId: string,
        filename: string,
      ) => Promise<{ success: boolean; filePath?: string }>;
      getMicrosoftCalendarEvents: (accountId: string) => Promise<any[]>;

      // --- OLD / REMOVING ---
      syncMicrosoftEmails: (accountId: string) => Promise<{ success: boolean }>;
      syncGmailEmails: (accountId: string) => Promise<{ success: boolean }>;
      syncImapEmails: (accountId: string) => Promise<{ success: boolean }>;
      moveGmailEmail: (accountId: string, messageId: string, destination: string) => Promise<{ success: boolean }>;
      moveMicrosoftEmailToFolder: (payload: any) => Promise<any>;
      sendGmailEmail: (payload: any) => Promise<any>;
      replyMicrosoftEmail: (payload: any) => Promise<any>;
      syncMicrosoftInbox: (accountId: string) => Promise<{ success: boolean }>;
    };
  }
}

export {};
