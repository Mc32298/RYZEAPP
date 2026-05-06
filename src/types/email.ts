export interface EmailAttachment {
  id: string;
  filename: string;
  size: number; // in bytes
  contentType: string;
  isInline?: boolean;
  contentId?: string;
}

export interface EmailThread {
  id: string;
  accountId: string;
  messageId: string;
  conversationId?: string;
  internetMessageId?: string;
  inReplyTo?: string;
  references?: string[];
  sender: {
    name: string;
    email: string;
    avatar?: string;
    initials: string;
    color: string;
  };
  subject: string;
  preview: string;
  body: string;
  timestamp: Date;
  isRead: boolean;
  isStarred: boolean;
  folder: FolderType;
  folderId?: string;
  folderLabel?: string;
  labels: EmailLabel[];
  threadCount: number;
  hasAttachment: boolean;
  attachments?: EmailAttachment[];
  to: string[];
  cc?: string[];
  snoozedUntil?: Date | null;
}

export interface EmailThreadRow {
  threadKey: string;
  latestMessage: EmailThread;
  messageIds: string[];
  messages: EmailThread[];
  threadCount: number;
  participantCount: number;
  hasUnread: boolean;
  hasAttachment: boolean;
  labels: EmailLabel[];
}

export type FolderType = string;

export interface EmailLabel {
  id: string;
  accountId: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface MailFolder {
  id: string;
  accountId: string;
  displayName: string;
  parentFolderId?: string;
  wellKnownName?: string;
  totalItemCount: number;
  unreadItemCount: number;
  depth?: number;
  path?: string;
  icon?: string;
}

export interface Folder {
  id: FolderType;
  label: string;
  icon: string;
  unreadCount: number;
}

export interface Draft {
  id: string;
  to: string;
  cc: string;
  subject: string;
  body: string;
  isMinimized: boolean;
  isFullscreen: boolean;
}

export interface Account {
  id: string;
  name: string;
  email: string;
  initials: string;
  color: string;
  provider?: "local" | "microsoft" | "google";
  externalId?: string;
}
