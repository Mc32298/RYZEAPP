import * as electron from "electron";

const electronApi =
  (electron as unknown as { default?: typeof electron }).default ?? electron;
const { contextBridge, ipcRenderer } = electronApi;

type SendMicrosoftEmailPayload = {
  accountId: string;
  to: string;
  cc?: string;
  subject?: string;
  body?: string;
};

type SnoozeEmailPayload = {
  accountId: string;
  messageId: string;
  snoozedUntil: string;
};

type ConnectImapAccountPayload = {
  email: string;
  displayName: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
};

type AiSummarizeEmailPayload = {
  subject: string;
  senderName: string;
  senderEmail: string;
  body: string;
  preview: string;
};

type AiGenerateReplyPayload = AiSummarizeEmailPayload & {
  tone?: string;
};

type AiSuggestedAction = {
  actionId: "reply" | "remind_3d" | "remind_7d";
  label: string;
  reason: string;
  confidence: number;
  requiresConfirmation: boolean;
};

type AiSummaryResult = {
  summary: string;
  keyPoints?: string[];
  suggestedActions?: AiSuggestedAction[];
  confidence?: number;
  uncertainty?: string;
};

type AiProvider = "gemini";

type CreateLabelPayload = {
  accountId: string;
  name: string;
  color?: string;
};

type RenameLabelPayload = {
  accountId: string;
  labelId: string;
  name: string;
};

type AssignLabelPayload = {
  accountId: string;
  messageId: string;
  labelId: string;
};

function assertString(
  value: unknown,
  fieldName: string,
  maxLength = 4096,
): string {
  if (typeof value !== "string") {
    throw new TypeError(`${fieldName} must be a string`);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw new TypeError(`${fieldName} is required`);
  }
  if (trimmed.length > maxLength) {
    throw new TypeError(`${fieldName} is too long`);
  }
  return trimmed;
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
    throw new TypeError(`${fieldName} must be a string`);
  }
  if (value.length > maxLength) {
    throw new TypeError(`${fieldName} is too long`);
  }
  return value;
}

function optionalHexColor(value: unknown, fieldName: string): string {
  if (value === undefined || value === null || value === "") {
    return "#C9A84C";
  }
  if (typeof value !== "string") {
    throw new TypeError(`${fieldName} must be a string`);
  }
  const trimmed = value.trim();
  if (!/^#[0-9A-Fa-f]{6}$/.test(trimmed)) {
    throw new TypeError(`${fieldName} must be a valid hex color`);
  }
  return trimmed;
}

function sanitizeDrafts(drafts: unknown): any[] {
  if (!Array.isArray(drafts)) {
    throw new TypeError("drafts must be an array");
  }
  return drafts.slice(0, 20).map((draft, index) => {
    const value =
      draft && typeof draft === "object" ? (draft as Record<string, unknown>) : {};
    return {
      id: optionalString(value.id, `drafts[${index}].id`, 128),
      to: optionalString(value.to, `drafts[${index}].to`, 4096),
      cc: optionalString(value.cc, `drafts[${index}].cc`, 4096),
      subject: optionalString(value.subject, `drafts[${index}].subject`, 512),
      body: optionalString(value.body, `drafts[${index}].body`, 500_000),
      isMinimized: Boolean(value.isMinimized),
      isFullscreen: Boolean(value.isFullscreen),
      scheduledSendAt: optionalString(
        value.scheduledSendAt,
        `drafts[${index}].scheduledSendAt`,
        64,
      ),
      aiTone: optionalString(value.aiTone, `drafts[${index}].aiTone`, 32),
      aiHint: optionalString(value.aiHint, `drafts[${index}].aiHint`, 2048),
    };
  });
}

function sanitizeBackendSettings(settings: unknown) {
  const value =
    settings && typeof settings === "object"
      ? (settings as Record<string, unknown>)
      : {};
  const aiProvider = optionalString(value.aiProvider, "aiProvider", 32).trim();
  return {
    aiProvider: aiProvider === "ollama" ? "ollama" : "gemini",
    geminiModel:
      optionalString(value.geminiModel, "geminiModel", 64).trim() ||
      "gemini-2.5-flash",
    ollamaBaseUrl:
      optionalString(value.ollamaBaseUrl, "ollamaBaseUrl", 512).trim() ||
      "http://127.0.0.1:11434",
    ollamaModel:
      optionalString(value.ollamaModel, "ollamaModel", 128).trim() ||
      "llama3.2",
  };
}

contextBridge.exposeInMainWorld("electronAPI", {
  minimizeWindow: () => ipcRenderer.send("window-minimize"),
  maximizeWindow: () => ipcRenderer.send("window-maximize"),
  closeWindow: () => ipcRenderer.send("window-close"),
  
  // --- APP INFO ---
  getAppVersion: () => ipcRenderer.invoke("app:get-version"),

  // --- AUTO UPDATER ---
  checkUpdates: () => ipcRenderer.invoke("updater:check"),
  startUpdateDownload: () => ipcRenderer.invoke("updater:start-download"),
  installUpdate: () => ipcRenderer.invoke("updater:install"),
  onUpdateAvailable: (callback: (version: string) => void) => {
    ipcRenderer.on("updater:available", (_event, version) => callback(version));
  },
  onUpdateDownloaded: (callback: () => void) => {
    ipcRenderer.on("updater:downloaded", () => callback());
  },
  onUpdateError: (callback: (message: string) => void) => {
    ipcRenderer.on("updater:error", (_event, message) => callback(message));
  },
  removeUpdaterListeners: () => {
    ipcRenderer.removeAllListeners("updater:available");
    ipcRenderer.removeAllListeners("updater:downloaded");
    ipcRenderer.removeAllListeners("updater:error");
  },

  // --- SYSTEM & STORAGE ---
  getDrafts: () => ipcRenderer.invoke("system:get-drafts"),
  saveDrafts: (drafts: any[]) =>
    ipcRenderer.send("system:save-drafts", sanitizeDrafts(drafts)),
  onDraftsSaveFailed: (callback: (message: string) => void) => {
    ipcRenderer.on("drafts:save-failed", (_event, message) => callback(message));
  },
  removeDraftsListeners: () => {
    ipcRenderer.removeAllListeners("drafts:save-failed");
  },
  getStorageUsage: () => ipcRenderer.invoke("system:get-storage-usage"),
  exportEncryptedBackup: () => ipcRenderer.invoke("system:export-backup"),
  importEncryptedBackup: () => ipcRenderer.invoke("system:import-backup"),
  getAccountHealth: () => ipcRenderer.invoke("accounts:get-health"),
  updateBackendSettings: (settings: any) =>
    ipcRenderer.send("system:update-settings", sanitizeBackendSettings(settings)),

  // --- AI FEATURES ---
  summarizeEmailWithAi: (payload: AiSummarizeEmailPayload) => {
    return ipcRenderer.invoke("ai:summarize-email", {
      subject: optionalString(payload.subject, "subject", 512),
      senderName: optionalString(payload.senderName, "senderName", 256),
      senderEmail: optionalString(payload.senderEmail, "senderEmail", 512),
      body: optionalString(payload.body, "body", 500_000),
      preview: optionalString(payload.preview, "preview", 5000),
    }) as Promise<AiSummaryResult>;
  },
  generateReplyWithAi: (payload: AiGenerateReplyPayload) => {
    return ipcRenderer.invoke("ai:generate-reply", {
      subject: optionalString(payload.subject, "subject", 512),
      senderName: optionalString(payload.senderName, "senderName", 256),
      senderEmail: optionalString(payload.senderEmail, "senderEmail", 512),
      body: optionalString(payload.body, "body", 500_000),
      preview: optionalString(payload.preview, "preview", 5000),
      tone: optionalString(payload.tone, "tone", 32),
    });
  },
  getAiProviderKeyStatus: (provider: AiProvider) =>
    ipcRenderer.invoke("ai:get-provider-key-status", {
      provider: assertString(provider, "provider", 32),
    }),
  setAiProviderKey: (provider: AiProvider, apiKey: string) =>
    ipcRenderer.invoke("ai:set-provider-key", {
      provider: assertString(provider, "provider", 32),
      apiKey: assertString(apiKey, "apiKey", 8192),
    }),
  deleteAiProviderKey: (provider: AiProvider) =>
    ipcRenderer.invoke("ai:delete-provider-key", {
      provider: assertString(provider, "provider", 32),
    }),

  getAiExtractions: (messageId: string, bodyText: string) =>
    ipcRenderer.invoke(
      "get-ai-extractions",
      assertString(messageId, "messageId", 2048),
      assertString(bodyText, "bodyText", 1_000_000),
    ),

  // --- GENERIC MAIL OPERATIONS ---
  syncMail: (accountId: string) =>
    ipcRenderer.invoke("mail:sync", { accountId: assertString(accountId, "accountId", 256) }),

  getEmailBody: (accountId: string, messageId: string) =>
    ipcRenderer.invoke("mail:get-body", {
      accountId: assertString(accountId, "accountId", 256),
      messageId: assertString(messageId, "messageId", 2048),
    }),

  sendEmail: (payload: SendMicrosoftEmailPayload) => {
    return ipcRenderer.invoke("mail:send", {
      accountId: assertString(payload.accountId, "accountId", 256),
      to: assertString(payload.to, "to", 4096),
      cc: optionalString(payload.cc, "cc", 4096),
      subject: optionalString(payload.subject, "subject", 512),
      body: optionalString(payload.body, "body", 500_000),
    });
  },

  replyEmail: (accountId: string, messageId: string, comment: string) =>
    ipcRenderer.invoke("mail:reply", {
      accountId: assertString(accountId, "accountId", 256),
      messageId: assertString(messageId, "messageId", 2048),
      comment: optionalString(comment, "comment", 500_000),
    }),

  markEmailAsRead: (accountId: string, messageId: string) =>
    ipcRenderer.invoke("mail:mark-read", {
      accountId: assertString(accountId, "accountId", 256),
      messageId: assertString(messageId, "messageId", 2048),
    }),

  markEmailAsUnread: (accountId: string, messageId: string) =>
    ipcRenderer.invoke("mail:mark-unread", {
      accountId: assertString(accountId, "accountId", 256),
      messageId: assertString(messageId, "messageId", 2048),
    }),

  toggleEmailStar: (accountId: string, messageId: string, isStarred: boolean) =>
    ipcRenderer.invoke("mail:toggle-star", {
      accountId: assertString(accountId, "accountId", 256),
      messageId: assertString(messageId, "messageId", 2048),
      isStarred,
    }),

  moveEmail: (accountId: string, messageId: string, destination: string) =>
    ipcRenderer.invoke("mail:move", {
      accountId: assertString(accountId, "accountId", 256),
      messageId: assertString(messageId, "messageId", 2048),
      destination: assertString(destination, "destination", 2048),
    }),

  snoozeEmail: (payload: SnoozeEmailPayload) => {
    return ipcRenderer.invoke("mail:snooze", {
      accountId: assertString(payload.accountId, "accountId", 256),
      messageId: assertString(payload.messageId, "messageId", 2048),
      snoozedUntil: assertString(payload.snoozedUntil, "snoozedUntil", 64),
    });
  },

  clearEmailSnooze: (accountId: string, messageId: string) =>
    ipcRenderer.invoke("mail:clear-snooze", {
      accountId: assertString(accountId, "accountId", 256),
      messageId: assertString(messageId, "messageId", 2048),
    }),

  // --- ACCOUNT MANAGEMENT ---
  connectMicrosoftAccount: () => ipcRenderer.invoke("microsoft-oauth:connect"),
  connectGoogleAccount: () => ipcRenderer.invoke("google-oauth:connect"),
  connectImapAccount: (payload: ConnectImapAccountPayload) => {
    return ipcRenderer.invoke("imap-account:connect", {
      email: assertString(payload.email, "email", 320),
      displayName: assertString(payload.displayName, "displayName", 128),
      host: assertString(payload.host, "host", 253),
      port: payload.port,
      secure: payload.secure,
      username: assertString(payload.username, "username", 320),
      password: assertString(payload.password, "password", 8192),
    });
  },
  deleteAccount: (accountId: string) =>
    ipcRenderer.invoke("account:delete", {
      accountId: assertString(accountId, "accountId", 256),
    }),

  // --- FOLDER MANAGEMENT ---
  createFolder: (accountId: string, displayName: string) =>
    ipcRenderer.invoke("folder:create", {
      accountId: assertString(accountId, "accountId", 256),
      displayName: assertString(displayName, "displayName", 64),
    }),
  renameFolder: (accountId: string, folderId: string, displayName: string) =>
    ipcRenderer.invoke("folder:rename", {
      accountId: assertString(accountId, "accountId", 256),
      folderId: assertString(folderId, "folderId", 2048),
      displayName: assertString(displayName, "displayName", 64),
    }),
  deleteFolder: (accountId: string, folderId: string) =>
    ipcRenderer.invoke("folder:delete", {
      accountId: assertString(accountId, "accountId", 256),
      folderId: assertString(folderId, "folderId", 2048),
    }),
  emptyFolder: (accountId: string, folderId: string) =>
    ipcRenderer.invoke("folder:empty", {
      accountId: assertString(accountId, "accountId", 256),
      folderId: assertString(folderId, "folderId", 2048),
    }),
  setFolderIcon: (accountId: string, folderId: string, icon: string) =>
    ipcRenderer.invoke("folder:set-icon", {
      accountId: assertString(accountId, "accountId", 256),
      folderId: assertString(folderId, "folderId", 2048),
      icon: assertString(icon, "icon", 64),
    }),

  // --- LABEL MANAGEMENT ---
  getLabels: (accountId: string) =>
    ipcRenderer.invoke("labels:list", {
      accountId: assertString(accountId, "accountId", 256),
    }),
  createLabel: (payload: CreateLabelPayload) => {
    return ipcRenderer.invoke("labels:create", {
      accountId: assertString(payload.accountId, "accountId", 256),
      name: assertString(payload.name, "name", 64),
      color: optionalHexColor(payload.color, "color"),
    });
  },
  renameLabel: (payload: RenameLabelPayload) => {
    return ipcRenderer.invoke("labels:rename", {
      accountId: assertString(payload.accountId, "accountId", 256),
      labelId: assertString(payload.labelId, "labelId", 128),
      name: assertString(payload.name, "name", 64),
    });
  },
  deleteLabel: (accountId: string, labelId: string) =>
    ipcRenderer.invoke("labels:delete", {
      accountId: assertString(accountId, "accountId", 256),
      labelId: assertString(labelId, "labelId", 128),
    }),
  assignLabelToEmail: (payload: AssignLabelPayload) => {
    return ipcRenderer.invoke("labels:assign-email", {
      accountId: assertString(payload.accountId, "accountId", 256),
      messageId: assertString(payload.messageId, "messageId", 2048),
      labelId: assertString(payload.labelId, "labelId", 128),
    });
  },
  removeLabelFromEmail: (payload: AssignLabelPayload) => {
    return ipcRenderer.invoke("labels:remove-email", {
      accountId: assertString(payload.accountId, "accountId", 256),
      messageId: assertString(payload.messageId, "messageId", 2048),
      labelId: assertString(payload.labelId, "labelId", 128),
    });
  },

  // --- LEGACY / SPECIFIC (To be pruned after UI update) ---
  getAllLocalEmails: () => ipcRenderer.invoke("mail:getAllLocal"),
  syncMicrosoftFolders: (accountId: string, folderIds: string[]) =>
    ipcRenderer.invoke("microsoft-mail:syncFolders", {
      accountId: assertString(accountId, "accountId", 256),
      folderIds,
    }),
  downloadMicrosoftEmailAttachment: (
    accountId: string,
    messageId: string,
    attachmentId: string,
    filename: string,
  ) =>
    ipcRenderer.invoke("microsoft-mail:download-attachment", {
      accountId: assertString(accountId, "accountId", 256),
      messageId: assertString(messageId, "messageId", 2048),
      attachmentId: assertString(attachmentId, "attachmentId", 2048),
      filename: assertString(filename, "filename", 1024),
    }),
  getMicrosoftCalendarEvents: (accountId: string) =>
    ipcRenderer.invoke("microsoft-calendar:get-events", {
      accountId: assertString(accountId, "accountId", 256),
    }),
});
