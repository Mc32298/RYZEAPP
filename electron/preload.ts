import * as electron from "electron";

const electronApi =
  (electron as unknown as { default?: typeof electron }).default ?? electron;
const { contextBridge, ipcRenderer } = electronApi;

type MoveEmailToFolderPayload = {
  accountId: string;
  messageId: string;
  destinationFolderId: string;
};

type RenameFolderPayload = {
  accountId: string;
  folderId: string;
  displayName: string;
};

type FolderIdPayload = {
  accountId: string;
  folderId: string;
};

type SetFolderIconPayload = {
  accountId: string;
  folderId: string;
  icon: string;
};

type AssignLabelPayload = {
  accountId: string;
  messageId: string;
  labelId: string;
};

type SendMicrosoftEmailPayload = {
  accountId: string;
  to: string;
  cc?: string;
  subject?: string;
  body?: string;
};

type ReplyMicrosoftEmailPayload = {
  accountId: string;
  messageId: string;
  comment: string;
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

type AiProvider = "gemini";

type CreateFolderPayload = {
  accountId: string;
  displayName: string;
};

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

type EmailLabelPayload = {
  accountId: string;
  messageId: string;
  labelId: string;
};

type SnoozeEmailPayload = {
  accountId: string;
  messageId: string;
  snoozedUntil: string;
};

const VALID_DESTINATION_FOLDERS = new Set([
  "archive",
  "deleteditems",
  "inbox",
  "drafts",
  "sentitems",
]);

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
  getAllLocalEmails: () => ipcRenderer.invoke("microsoft-mail:getAllLocal"),

  moveMicrosoftEmailToFolder: (payload: MoveEmailToFolderPayload) => {
    if (!payload || typeof payload !== "object") {
      throw new TypeError("payload is required");
    }

    return ipcRenderer.invoke("microsoft-mail:move-to-folder", {
      accountId: assertString(payload.accountId, "accountId", 256),
      messageId: assertString(payload.messageId, "messageId", 2048),
      destinationFolderId: assertString(
        payload.destinationFolderId,
        "destinationFolderId",
        2048,
      ),
    });
  },

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

  // ✅ CORRECT: THESE ARE NOW THEIR OWN SEPARATE METHODS ✅
  getDrafts: () => ipcRenderer.invoke("system:get-drafts"),
  saveDrafts: (drafts: any[]) =>
    ipcRenderer.send("system:save-drafts", sanitizeDrafts(drafts)),
  onDraftsSaveFailed: (callback: (message: string) => void) => {
    ipcRenderer.on("drafts:save-failed", (_event, message) => callback(message));
  },
  removeDraftsListeners: () => {
    ipcRenderer.removeAllListeners("drafts:save-failed");
  },

  // Add these inside contextBridge:
  getStorageUsage: () => ipcRenderer.invoke("system:get-storage-usage"),
  exportEncryptedBackup: () => ipcRenderer.invoke("system:export-backup"),
  importEncryptedBackup: () => ipcRenderer.invoke("system:import-backup"),
  getAccountHealth: () => ipcRenderer.invoke("accounts:get-health"),
  updateBackendSettings: (settings: any) =>
    ipcRenderer.send("system:update-settings", sanitizeBackendSettings(settings)),

  syncMicrosoftFolders: (accountId: string, folderIds: string[]) =>
    ipcRenderer.invoke("microsoft-mail:syncFolders", {
      accountId: assertString(accountId, "accountId", 256),
      folderIds: Array.isArray(folderIds)
        ? folderIds.map((folderId) => assertString(folderId, "folderId", 2048))
        : [],
    }),

  getMicrosoftCalendarEvents: (accountId: string) =>
    ipcRenderer.invoke("microsoft-calendar:get-events", {
      accountId: assertString(accountId, "accountId", 256),
    }),

  summarizeEmailWithAi: (payload: AiSummarizeEmailPayload) => {
    if (!payload || typeof payload !== "object") {
      throw new TypeError("payload is required");
    }

    return ipcRenderer.invoke("ai:summarize-email", {
      subject: optionalString(payload.subject, "subject", 512),
      senderName: optionalString(payload.senderName, "senderName", 256),
      senderEmail: optionalString(payload.senderEmail, "senderEmail", 512),
      body: optionalString(payload.body, "body", 500_000),
      preview: optionalString(payload.preview, "preview", 5000),
    });
  },
  generateReplyWithAi: (payload: AiGenerateReplyPayload) => {
    if (!payload || typeof payload !== "object") {
      throw new TypeError("payload is required");
    }

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

  toggleMicrosoftEmailStar: (
    accountId: string,
    messageId: string,
    isStarred: boolean,
  ) =>
    ipcRenderer.invoke("microsoft-mail:toggle-star", {
      accountId: assertString(accountId, "accountId", 256),
      messageId: assertString(messageId, "messageId", 2048),
      isStarred,
    }),

  resetMicrosoftSyncState: (accountId: string) =>
    ipcRenderer.invoke("microsoft-mail:reset-sync-state", {
      accountId: assertString(accountId, "accountId", 256),
    }),

  getLabels: (accountId: string) =>
    ipcRenderer.invoke("labels:list", {
      accountId: assertString(accountId, "accountId", 256),
    }),
  renameMicrosoftFolder: (payload: RenameFolderPayload) => {
    if (!payload || typeof payload !== "object") {
      throw new TypeError("payload is required");
    }

    return ipcRenderer.invoke("microsoft-folder:rename", {
      accountId: assertString(payload.accountId, "accountId", 256),
      folderId: assertString(payload.folderId, "folderId", 2048),
      displayName: assertString(payload.displayName, "displayName", 64),
    });
  },

  deleteMicrosoftFolder: (payload: FolderIdPayload) => {
    if (!payload || typeof payload !== "object") {
      throw new TypeError("payload is required");
    }

    return ipcRenderer.invoke("microsoft-folder:delete", {
      accountId: assertString(payload.accountId, "accountId", 256),
      folderId: assertString(payload.folderId, "folderId", 2048),
    });
  },

  emptyMicrosoftFolder: (payload: FolderIdPayload) => {
    if (!payload || typeof payload !== "object") {
      throw new TypeError("payload is required");
    }

    return ipcRenderer.invoke("microsoft-folder:empty", {
      accountId: assertString(payload.accountId, "accountId", 256),
      folderId: assertString(payload.folderId, "folderId", 2048),
    });
  },

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

  setMicrosoftFolderIcon: (payload: SetFolderIconPayload) => {
    if (!payload || typeof payload !== "object") {
      throw new TypeError("payload is required");
    }

    return ipcRenderer.invoke("microsoft-folder:set-icon", {
      accountId: assertString(payload.accountId, "accountId", 256),
      folderId: assertString(payload.folderId, "folderId", 2048),
      icon: assertString(payload.icon, "icon", 64),
    });
  },

  createMicrosoftFolder: (payload: CreateFolderPayload) => {
    if (!payload || typeof payload !== "object") {
      throw new TypeError("payload is required");
    }

    return ipcRenderer.invoke("microsoft-folder:create", {
      accountId: assertString(payload.accountId, "accountId", 256),
      displayName: assertString(payload.displayName, "displayName", 64),
    });
  },

  createLabel: (payload: CreateLabelPayload) => {
    if (!payload || typeof payload !== "object") {
      throw new TypeError("payload is required");
    }

    return ipcRenderer.invoke("labels:create", {
      accountId: assertString(payload.accountId, "accountId", 256),
      name: assertString(payload.name, "name", 64),
      color: optionalHexColor(payload.color, "color"),
    });
  },

  renameLabel: (payload: RenameLabelPayload) => {
    if (!payload || typeof payload !== "object") {
      throw new TypeError("payload is required");
    }

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
    if (!payload || typeof payload !== "object") {
      throw new TypeError("payload is required");
    }

    return ipcRenderer.invoke("labels:assign-email", {
      accountId: assertString(payload.accountId, "accountId", 256),
      messageId: assertString(payload.messageId, "messageId", 2048),
      labelId: assertString(payload.labelId, "labelId", 128),
    });
  },

  removeLabelFromEmail: (payload: AssignLabelPayload) => {
    if (!payload || typeof payload !== "object") {
      throw new TypeError("payload is required");
    }

    return ipcRenderer.invoke("labels:remove-email", {
      accountId: assertString(payload.accountId, "accountId", 256),
      messageId: assertString(payload.messageId, "messageId", 2048),
      labelId: assertString(payload.labelId, "labelId", 128),
    });
  },

  connectMicrosoftAccount: () => ipcRenderer.invoke("microsoft-oauth:connect"),

  deleteMicrosoftAccount: (accountId: string) =>
    ipcRenderer.invoke("microsoft-account:delete", {
      accountId: assertString(accountId, "accountId", 256),
    }),

  connectGoogleAccount: () => ipcRenderer.invoke("google-oauth:connect"),

  deleteGoogleAccount: (accountId: string) =>
    ipcRenderer.invoke("google-account:delete", {
      accountId: assertString(accountId, "accountId", 256),
    }),

  connectImapAccount: (payload: ConnectImapAccountPayload) => {
    if (!payload || typeof payload !== "object") {
      throw new TypeError("payload is required");
    }

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

  deleteImapAccount: (accountId: string) =>
    ipcRenderer.invoke("imap-account:delete", {
      accountId: assertString(accountId, "accountId", 256),
    }),

  syncImapEmails: (accountId: string) =>
    ipcRenderer.invoke("imap:sync", {
      accountId: assertString(accountId, "accountId", 256),
    }),

  syncGmailEmails: (accountId: string) =>
    ipcRenderer.invoke("gmail:sync", {
      accountId: assertString(accountId, "accountId", 256),
    }),

  getGmailEmailBody: (accountId: string, messageId: string) =>
    ipcRenderer.invoke("gmail:get-body", {
      accountId: assertString(accountId, "accountId", 256),
      messageId: assertString(messageId, "messageId", 2048),
    }),

  sendGmailEmail: (payload: SendMicrosoftEmailPayload) => {
    if (!payload || typeof payload !== "object") {
      throw new TypeError("payload is required");
    }
    return ipcRenderer.invoke("gmail:send", {
      accountId: assertString(payload.accountId, "accountId", 256),
      to: assertString(payload.to, "to", 4096),
      cc: optionalString(payload.cc, "cc", 4096),
      subject: optionalString(payload.subject, "subject", 512),
      body: optionalString(payload.body, "body", 500_000),
    });
  },

  markGmailEmailAsRead: (accountId: string, messageId: string) =>
    ipcRenderer.invoke("gmail:mark-read", {
      accountId: assertString(accountId, "accountId", 256),
      messageId: assertString(messageId, "messageId", 2048),
    }),

  markGmailEmailAsUnread: (accountId: string, messageId: string) =>
    ipcRenderer.invoke("gmail:mark-unread", {
      accountId: assertString(accountId, "accountId", 256),
      messageId: assertString(messageId, "messageId", 2048),
    }),

  toggleGmailEmailStar: (accountId: string, messageId: string, isStarred: boolean) =>
    ipcRenderer.invoke("gmail:toggle-star", {
      accountId: assertString(accountId, "accountId", 256),
      messageId: assertString(messageId, "messageId", 2048),
      isStarred,
    }),

  moveGmailEmail: (accountId: string, messageId: string, destination: string) =>
    ipcRenderer.invoke("gmail:move", {
      accountId: assertString(accountId, "accountId", 256),
      messageId: assertString(messageId, "messageId", 2048),
      destination: assertString(destination, "destination", 64),
    }),

  markMicrosoftEmailAsUnread: (accountId: string, messageId: string) =>
    ipcRenderer.invoke("microsoft-mail:mark-unread", {
      accountId: assertString(accountId, "accountId", 256),
      messageId: assertString(messageId, "messageId", 2048),
    }),

  markMicrosoftEmailAsRead: (accountId: string, messageId: string) =>
    ipcRenderer.invoke("microsoft-mail:mark-read", {
      accountId: assertString(accountId, "accountId", 256),
      messageId: assertString(messageId, "messageId", 2048),
      isRead: true,
    }),

  snoozeEmail: (payload: SnoozeEmailPayload) => {
    if (!payload || typeof payload !== "object") {
      throw new TypeError("payload is required");
    }

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

  getMicrosoftEmailsLocal: (accountId: string) =>
    ipcRenderer.invoke("microsoft-mail:getLocal", {
      accountId: assertString(accountId, "accountId", 256),
    }),

  getLocalEmails: async (accountId: string) => {
    const result = await ipcRenderer.invoke("microsoft-mail:getLocal", {
      accountId: assertString(accountId, "accountId", 256),
    });
    return JSON.parse(JSON.stringify(result));
  },

  syncMicrosoftInbox: (accountId: string) =>
    ipcRenderer.invoke("microsoft-mail:syncInbox", {
      accountId: assertString(accountId, "accountId", 256),
    }),

  syncMicrosoftEmails: (accountId: string) =>
    ipcRenderer.invoke("microsoft-mail:sync", {
      accountId: assertString(accountId, "accountId", 256),
    }),

  getMicrosoftEmails: async (accountId: string) => {
    const result = await ipcRenderer.invoke("microsoft-mail:list", {
      accountId: assertString(accountId, "accountId", 256),
    });
    // Strip prototype to prevent prototype pollution across the context bridge
    return JSON.parse(JSON.stringify(result));
  },

  moveMicrosoftEmail: (
    accountId: string,
    messageId: string,
    destinationFolder: string,
  ) => {
    const normalizedDestinationFolder = assertString(
      destinationFolder,
      "destinationFolder",
      64,
    ).toLowerCase();

    if (!VALID_DESTINATION_FOLDERS.has(normalizedDestinationFolder)) {
      throw new TypeError("Invalid destination folder");
    }

    return ipcRenderer.invoke("microsoft-mail:move", {
      accountId: assertString(accountId, "accountId", 256),
      messageId: assertString(messageId, "messageId", 2048),
      destinationFolder: normalizedDestinationFolder,
    });
  },

  getMicrosoftEmailBody: (accountId: string, messageId: string) =>
    ipcRenderer.invoke("microsoft-mail:get-body", {
      accountId: assertString(accountId, "accountId", 256),
      messageId: assertString(messageId, "messageId", 2048),
    }),

  sendMicrosoftEmail: (payload: SendMicrosoftEmailPayload) => {
    if (!payload || typeof payload !== "object") {
      throw new TypeError("payload is required");
    }

    return ipcRenderer.invoke("microsoft-mail:send", {
      accountId: assertString(payload.accountId, "accountId", 256),
      to: assertString(payload.to, "to", 4096),
      cc: optionalString(payload.cc, "cc", 4096),
      subject: optionalString(payload.subject, "subject", 512),
      body: optionalString(payload.body, "body", 500_000),
    });
  },

  replyMicrosoftEmail: (payload: ReplyMicrosoftEmailPayload) => {
    if (!payload || typeof payload !== "object") {
      throw new TypeError("payload is required");
    }

    return ipcRenderer.invoke("microsoft-mail:reply", {
      accountId: assertString(payload.accountId, "accountId", 256),
      messageId: assertString(payload.messageId, "messageId", 2048),
      comment: optionalString(payload.comment, "comment", 500_000),
    });
  },
});
