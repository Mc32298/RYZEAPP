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
  hasAttachments?: boolean;
  from?: GraphMessageAddress;
  toRecipients?: GraphMessageAddress[];
  ccRecipients?: GraphMessageAddress[];
}

declare global {
  interface Window {
    electronAPI?: {
      minimizeWindow: () => void;
      maximizeWindow: () => void;
      closeWindow: () => void;
      getDrafts: () => Promise<any[]>;
      saveDrafts: (drafts: any[]) => void;
      getMicrosoftCalendarEvents: (accountId: string) => Promise<any[]>;
      getAllLocalEmails: () => Promise<{
        folders: any[];
        messagesByFolder: Record<string, any[]>;
        labels: any[];
        labelsByMessageId: Record<string, any[]>;
      }>;

      connectMicrosoftAccount: () => Promise<{
        account: Pick<
          Account,
          "id" | "name" | "email" | "provider" | "externalId"
        >;
      }>;
      getLabels: (accountId: string) => Promise<EmailLabel[]>;

      createLabel: (payload: {
        accountId: string;
        name: string;
        color?: string;
      }) => Promise<EmailLabel>;

      downloadMicrosoftEmailAttachment: (
        accountId: string,
        messageId: string,
        attachmentId: string,
        filename: string,
      ) => Promise<{ success: boolean; canceled?: boolean; filePath?: string }>;

      toggleMicrosoftEmailStar: (
        accountId: string,
        messageId: string,
        isStarred: boolean,
      ) => Promise<{ success: boolean }>;

      summarizeEmailWithAi: (payload: {
        subject: string;
        senderName: string;
        senderEmail: string;
        body: string;
        preview: string;
      }) => Promise<{
        summary: string;
        keyPoints?: string[];
        suggestedActions?: string[];
      }>;

      getAiProviderKeyStatus: (provider: "gemini") => Promise<{
        provider: "gemini";
        configured: boolean;
        source: "local" | "environment" | null;
        updatedAt: string | null;
        encryptionAvailable: boolean;
      }>;

      setAiProviderKey: (
        provider: "gemini",
        apiKey: string,
      ) => Promise<{
        provider: "gemini";
        configured: boolean;
        source: "local" | "environment" | null;
        updatedAt: string | null;
        encryptionAvailable: boolean;
      }>;

      deleteAiProviderKey: (provider: "gemini") => Promise<{
        provider: "gemini";
        configured: boolean;
        source: "local" | "environment" | null;
        updatedAt: string | null;
        encryptionAvailable: boolean;
      }>;

      createMicrosoftFolder: (payload: {
        accountId: string;
        displayName: string;
      }) => Promise<MailFolder>;

      renameMicrosoftFolder: (payload: {
        accountId: string;
        folderId: string;
        displayName: string;
      }) => Promise<MailFolder>;

      getStorageUsage: () => Promise<{ dbSizeGB: number }>;
      updateBackendSettings: (settings: any) => void;

      deleteMicrosoftFolder: (payload: {
        accountId: string;
        folderId: string;
      }) => Promise<{
        success: boolean;
        deletedFolderIds: string[];
      }>;

      syncMicrosoftFolders: (
        accountId: string,
        folderIds: string[],
      ) => Promise<{ success: boolean }>;

      emptyMicrosoftFolder: (payload: {
        accountId: string;
        folderId: string;
      }) => Promise<{
        success: boolean;
        affectedCount: number;
      }>;

      setMicrosoftFolderIcon: (payload: {
        accountId: string;
        folderId: string;
        icon: string;
      }) => Promise<MailFolder>;

      moveMicrosoftEmailToFolder: (payload: {
        accountId: string;
        messageId: string;
        destinationFolderId: string;
      }) => Promise<{
        success: boolean;
        messageId: string;
        destinationFolderId: string;
      }>;

      renameLabel: (payload: {
        accountId: string;
        labelId: string;
        name: string;
      }) => Promise<EmailLabel>;

      deleteLabel: (
        accountId: string,
        labelId: string,
      ) => Promise<{ success: boolean }>;

      assignLabelToEmail: (payload: {
        accountId: string;
        messageId: string;
        labelId: string;
      }) => Promise<{ success: boolean }>;

      removeLabelFromEmail: (payload: {
        accountId: string;
        messageId: string;
        labelId: string;
      }) => Promise<{ success: boolean }>;

      deleteMicrosoftAccount: (
        accountId: string,
      ) => Promise<{ success: boolean }>;

      markMicrosoftEmailAsUnread: (
        accountId: string,
        messageId: string,
      ) => Promise<{ success: boolean }>;

      markMicrosoftEmailAsRead: (
        accountId: string,
        messageId: string,
      ) => Promise<{ success: boolean }>;

      getMicrosoftEmailsLocal: (accountId: string) => Promise<any>;

      syncMicrosoftEmails: (accountId: string) => Promise<any>;
      syncMicrosoftInbox: (accountId: string) => Promise<{ success: boolean }>;

      getMicrosoftEmails: (accountId: string) => Promise<{
        folders?: MailFolder[];
        messagesByFolder: Record<string, GraphMessage[]>;
      }>;

      getLocalEmails: (accountId: string) => Promise<{
        folders: MailFolder[];
        messagesByFolder: Record<string, GraphMessage[]>;
        labels: EmailLabel[];
        labelsByMessageId: Record<string, EmailLabel[]>;
      }>;

      getMicrosoftEmailBody: (
        accountId: string,
        messageId: string,
      ) => Promise<{ contentType: string; content: string }>;

      moveMicrosoftEmail: (
        accountId: string,
        messageId: string,
        destinationFolder: string,
      ) => Promise<{ success: boolean }>;

      sendMicrosoftEmail: (payload: {
        accountId: string;
        to: string;
        cc: string;
        subject: string;
        body: string;
      }) => Promise<{ success: boolean }>;
    };
  }
}

export {};
