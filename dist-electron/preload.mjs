"use strict";
const electron = require("electron");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const electron__namespace = /* @__PURE__ */ _interopNamespaceDefault(electron);
const electronApi = electron__namespace.default ?? electron__namespace;
const { contextBridge, ipcRenderer } = electronApi;
const VALID_DESTINATION_FOLDERS = /* @__PURE__ */ new Set([
  "archive",
  "deleteditems",
  "inbox",
  "drafts",
  "sentitems"
]);
function assertString(value, fieldName, maxLength = 4096) {
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
function optionalString(value, fieldName, maxLength = 4096) {
  if (value === void 0 || value === null) {
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
function optionalHexColor(value, fieldName) {
  if (value === void 0 || value === null || value === "") {
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
contextBridge.exposeInMainWorld("electronAPI", {
  minimizeWindow: () => ipcRenderer.send("window-minimize"),
  maximizeWindow: () => ipcRenderer.send("window-maximize"),
  closeWindow: () => ipcRenderer.send("window-close"),
  getAllLocalEmails: () => ipcRenderer.invoke("microsoft-mail:getAllLocal"),
  moveMicrosoftEmailToFolder: (payload) => {
    if (!payload || typeof payload !== "object") {
      throw new TypeError("payload is required");
    }
    return ipcRenderer.invoke("microsoft-mail:move-to-folder", {
      accountId: assertString(payload.accountId, "accountId", 256),
      messageId: assertString(payload.messageId, "messageId", 2048),
      destinationFolderId: assertString(
        payload.destinationFolderId,
        "destinationFolderId",
        2048
      )
    });
  },
  // --- AUTO UPDATER ---
  checkUpdates: () => ipcRenderer.invoke("updater:check"),
  startUpdateDownload: () => ipcRenderer.invoke("updater:start-download"),
  installUpdate: () => ipcRenderer.invoke("updater:install"),
  onUpdateAvailable: (callback) => {
    ipcRenderer.on("updater:available", (_event, version) => callback(version));
  },
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on("updater:downloaded", () => callback());
  },
  removeUpdaterListeners: () => {
    ipcRenderer.removeAllListeners("updater:available");
    ipcRenderer.removeAllListeners("updater:downloaded");
  },
  // ✅ CORRECT: THESE ARE NOW THEIR OWN SEPARATE METHODS ✅
  getDrafts: () => ipcRenderer.invoke("system:get-drafts"),
  saveDrafts: (drafts) => ipcRenderer.send("system:save-drafts", drafts),
  // Add these inside contextBridge:
  getStorageUsage: () => ipcRenderer.invoke("system:get-storage-usage"),
  updateBackendSettings: (settings) => ipcRenderer.send("system:update-settings", settings),
  syncMicrosoftFolders: (accountId, folderIds) => ipcRenderer.invoke("microsoft-mail:syncFolders", {
    accountId: assertString(accountId, "accountId", 256),
    folderIds: Array.isArray(folderIds) ? folderIds.map((folderId) => assertString(folderId, "folderId", 2048)) : []
  }),
  getMicrosoftCalendarEvents: (accountId) => ipcRenderer.invoke("microsoft-calendar:get-events", {
    accountId: assertString(accountId, "accountId", 256)
  }),
  summarizeEmailWithAi: (payload) => {
    if (!payload || typeof payload !== "object") {
      throw new TypeError("payload is required");
    }
    return ipcRenderer.invoke("ai:summarize-email", {
      subject: optionalString(payload.subject, "subject", 512),
      senderName: optionalString(payload.senderName, "senderName", 256),
      senderEmail: optionalString(payload.senderEmail, "senderEmail", 512),
      body: optionalString(payload.body, "body", 5e5),
      preview: optionalString(payload.preview, "preview", 5e3)
    });
  },
  getAiProviderKeyStatus: (provider) => ipcRenderer.invoke("ai:get-provider-key-status", {
    provider: assertString(provider, "provider", 32)
  }),
  setAiProviderKey: (provider, apiKey) => ipcRenderer.invoke("ai:set-provider-key", {
    provider: assertString(provider, "provider", 32),
    apiKey: assertString(apiKey, "apiKey", 8192)
  }),
  deleteAiProviderKey: (provider) => ipcRenderer.invoke("ai:delete-provider-key", {
    provider: assertString(provider, "provider", 32)
  }),
  toggleMicrosoftEmailStar: (accountId, messageId, isStarred) => ipcRenderer.invoke("microsoft-mail:toggle-star", {
    accountId: assertString(accountId, "accountId", 256),
    messageId: assertString(messageId, "messageId", 2048),
    isStarred
  }),
  resetMicrosoftSyncState: (accountId) => ipcRenderer.invoke("microsoft-mail:reset-sync-state", {
    accountId: assertString(accountId, "accountId", 256)
  }),
  getLabels: (accountId) => ipcRenderer.invoke("labels:list", {
    accountId: assertString(accountId, "accountId", 256)
  }),
  renameMicrosoftFolder: (payload) => {
    if (!payload || typeof payload !== "object") {
      throw new TypeError("payload is required");
    }
    return ipcRenderer.invoke("microsoft-folder:rename", {
      accountId: assertString(payload.accountId, "accountId", 256),
      folderId: assertString(payload.folderId, "folderId", 2048),
      displayName: assertString(payload.displayName, "displayName", 64)
    });
  },
  deleteMicrosoftFolder: (payload) => {
    if (!payload || typeof payload !== "object") {
      throw new TypeError("payload is required");
    }
    return ipcRenderer.invoke("microsoft-folder:delete", {
      accountId: assertString(payload.accountId, "accountId", 256),
      folderId: assertString(payload.folderId, "folderId", 2048)
    });
  },
  emptyMicrosoftFolder: (payload) => {
    if (!payload || typeof payload !== "object") {
      throw new TypeError("payload is required");
    }
    return ipcRenderer.invoke("microsoft-folder:empty", {
      accountId: assertString(payload.accountId, "accountId", 256),
      folderId: assertString(payload.folderId, "folderId", 2048)
    });
  },
  downloadMicrosoftEmailAttachment: (accountId, messageId, attachmentId, filename) => ipcRenderer.invoke("microsoft-mail:download-attachment", {
    accountId: assertString(accountId, "accountId", 256),
    messageId: assertString(messageId, "messageId", 2048),
    attachmentId: assertString(attachmentId, "attachmentId", 2048),
    filename: assertString(filename, "filename", 1024)
  }),
  setMicrosoftFolderIcon: (payload) => {
    if (!payload || typeof payload !== "object") {
      throw new TypeError("payload is required");
    }
    return ipcRenderer.invoke("microsoft-folder:set-icon", {
      accountId: assertString(payload.accountId, "accountId", 256),
      folderId: assertString(payload.folderId, "folderId", 2048),
      icon: assertString(payload.icon, "icon", 64)
    });
  },
  createMicrosoftFolder: (payload) => {
    if (!payload || typeof payload !== "object") {
      throw new TypeError("payload is required");
    }
    return ipcRenderer.invoke("microsoft-folder:create", {
      accountId: assertString(payload.accountId, "accountId", 256),
      displayName: assertString(payload.displayName, "displayName", 64)
    });
  },
  createLabel: (payload) => {
    if (!payload || typeof payload !== "object") {
      throw new TypeError("payload is required");
    }
    return ipcRenderer.invoke("labels:create", {
      accountId: assertString(payload.accountId, "accountId", 256),
      name: assertString(payload.name, "name", 64),
      color: optionalHexColor(payload.color, "color")
    });
  },
  renameLabel: (payload) => {
    if (!payload || typeof payload !== "object") {
      throw new TypeError("payload is required");
    }
    return ipcRenderer.invoke("labels:rename", {
      accountId: assertString(payload.accountId, "accountId", 256),
      labelId: assertString(payload.labelId, "labelId", 128),
      name: assertString(payload.name, "name", 64)
    });
  },
  deleteLabel: (accountId, labelId) => ipcRenderer.invoke("labels:delete", {
    accountId: assertString(accountId, "accountId", 256),
    labelId: assertString(labelId, "labelId", 128)
  }),
  assignLabelToEmail: (payload) => {
    if (!payload || typeof payload !== "object") {
      throw new TypeError("payload is required");
    }
    return ipcRenderer.invoke("labels:assign-email", {
      accountId: assertString(payload.accountId, "accountId", 256),
      messageId: assertString(payload.messageId, "messageId", 2048),
      labelId: assertString(payload.labelId, "labelId", 128)
    });
  },
  removeLabelFromEmail: (payload) => {
    if (!payload || typeof payload !== "object") {
      throw new TypeError("payload is required");
    }
    return ipcRenderer.invoke("labels:remove-email", {
      accountId: assertString(payload.accountId, "accountId", 256),
      messageId: assertString(payload.messageId, "messageId", 2048),
      labelId: assertString(payload.labelId, "labelId", 128)
    });
  },
  connectMicrosoftAccount: () => ipcRenderer.invoke("microsoft-oauth:connect"),
  deleteMicrosoftAccount: (accountId) => ipcRenderer.invoke("microsoft-account:delete", {
    accountId: assertString(accountId, "accountId", 256)
  }),
  markMicrosoftEmailAsUnread: (accountId, messageId) => ipcRenderer.invoke("microsoft-mail:mark-unread", {
    accountId: assertString(accountId, "accountId", 256),
    messageId: assertString(messageId, "messageId", 2048)
  }),
  markMicrosoftEmailAsRead: (accountId, messageId) => ipcRenderer.invoke("microsoft-mail:mark-read", {
    accountId: assertString(accountId, "accountId", 256),
    messageId: assertString(messageId, "messageId", 2048)
  }),
  getMicrosoftEmailsLocal: (accountId) => ipcRenderer.invoke("microsoft-mail:getLocal", {
    accountId: assertString(accountId, "accountId", 256)
  }),
  getLocalEmails: async (accountId) => {
    const result = await ipcRenderer.invoke("microsoft-mail:getLocal", {
      accountId: assertString(accountId, "accountId", 256)
    });
    return JSON.parse(JSON.stringify(result));
  },
  syncMicrosoftInbox: (accountId) => ipcRenderer.invoke("microsoft-mail:syncInbox", {
    accountId: assertString(accountId, "accountId", 256)
  }),
  syncMicrosoftEmails: (accountId) => ipcRenderer.invoke("microsoft-mail:sync", {
    accountId: assertString(accountId, "accountId", 256)
  }),
  getMicrosoftEmails: async (accountId) => {
    const result = await ipcRenderer.invoke("microsoft-mail:list", {
      accountId: assertString(accountId, "accountId", 256)
    });
    return JSON.parse(JSON.stringify(result));
  },
  moveMicrosoftEmail: (accountId, messageId, destinationFolder) => {
    const normalizedDestinationFolder = assertString(
      destinationFolder,
      "destinationFolder",
      64
    ).toLowerCase();
    if (!VALID_DESTINATION_FOLDERS.has(normalizedDestinationFolder)) {
      throw new TypeError("Invalid destination folder");
    }
    return ipcRenderer.invoke("microsoft-mail:move", {
      accountId: assertString(accountId, "accountId", 256),
      messageId: assertString(messageId, "messageId", 2048),
      destinationFolder: normalizedDestinationFolder
    });
  },
  getMicrosoftEmailBody: (accountId, messageId) => ipcRenderer.invoke("microsoft-mail:get-body", {
    accountId: assertString(accountId, "accountId", 256),
    messageId: assertString(messageId, "messageId", 2048)
  }),
  sendMicrosoftEmail: (payload) => {
    if (!payload || typeof payload !== "object") {
      throw new TypeError("payload is required");
    }
    return ipcRenderer.invoke("microsoft-mail:send", {
      accountId: assertString(payload.accountId, "accountId", 256),
      to: assertString(payload.to, "to", 4096),
      cc: optionalString(payload.cc, "cc", 4096),
      subject: optionalString(payload.subject, "subject", 512),
      body: optionalString(payload.body, "body", 5e5)
    });
  }
});
