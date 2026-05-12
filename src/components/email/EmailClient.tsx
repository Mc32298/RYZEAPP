import { CalendarSidebar } from "./CalendarSidebar";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import { useSessionLock } from "../../hooks/useSessionLock";
import { useDraftPersistence } from "../../hooks/useDraftPersistence";
import DOMPurify from "dompurify";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { MessageList } from "./MessageList";
import { ReadingPane } from "./ReadingPane";
import { ComposeDrawer, type ComposeDraft as Draft } from "./ComposeDrawer";
import { SettingsModal } from "./SettingsModal";
import type { AiTone } from "./readingInsights";
import {
  buildConversationThread,
  buildThreadListRows,
  threadRowMatchesFilters,
} from "./threadView";
import {
  buildInlineReplyComment,
  buildInlineReplyHtml,
  buildReplySubject,
  getInlineReplyTargetMessage,
  getReplyRecipients,
} from "./replyComposer";
import {
  applyMovedEmailState,
  getKnownFolderIdForAccount,
  getMailboxRefreshFolderIds,
} from "./mailboxMutation";
import { resolveMailMoveOperation } from "./mailMoveRouting";
import {
  refreshMailboxAfterReply,
  resolveManualSyncProvider,
} from "./mailSyncRouting";
import {
  createComposeDraft,
  resolveCurrentUserEmail,
  resolveComposerAccount,
} from "./mailDraftRouting";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Forward,
  MessageSquare,
  Reply,
  Search,
  Settings2,
  CalendarDays,
  Folder,
  Plus,
  Tags,
  UserRound,
} from "lucide-react";
import { cn, escapeHtml, htmlToPlainText, plainTextToHtml } from "@/lib/utils";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  EmailThread,
  FolderType,
  Account,
  MailFolder,
  EmailLabel,
} from "@/types/email";

import {
  findDefaultInboxFolderId,
  getInboxFolderIds,
  getSentFolderIds,
  getSystemFolderIds,
} from "./folderHelpers";

import {
  DEFAULT_EMAIL_SETTINGS,
  DEFAULT_PRIMARY_ACCOUNT,
  type EmailSettings,
  getInitials,
} from "./emailPreferences";
import { toast } from "sonner";
import { UpdaterTopBarButton } from "@/components/AutoUpdater";
import { formatGoogleConnectError } from "./googleAuthErrors";
import { getSenderPolicy, loadSenderTrustPolicies } from "./senderTrust";

const SETTINGS_STORAGE_KEY = "email-client-settings";
const ACCOUNTS_STORAGE_KEY = "email-client-accounts";
const PROFILE_COLORS = ["#A8C7A2", "#C7AE79", "#8B6F5A", "#7E9181", "#B57865"];
const SNOOZED_FOLDER_ID = "snoozed";
const SNOOZED_DUE_TODAY_FOLDER_ID = "snoozed-due-today";
const SNOOZED_WAITING_FOLDER_ID = "snoozed-waiting";

function getEndOfTodayTimestamp() {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  return now.getTime();
}

function getDefaultSnoozeUntilIso() {
  const now = new Date();
  now.setDate(now.getDate() + 1);
  now.setHours(8, 0, 0, 0);
  return now.toISOString();
}

function loadStoredSettings(): EmailSettings {
  if (typeof window === "undefined") {
    return DEFAULT_EMAIL_SETTINGS;
  }

  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_EMAIL_SETTINGS;

    const mergedSettings = {
      ...DEFAULT_EMAIL_SETTINGS,
      ...JSON.parse(raw),
    };

    if (mergedSettings.themeMode === "obsidian") {
      mergedSettings.themeMode = "darkBlue";
    } else if (mergedSettings.themeMode === "linen") {
      mergedSettings.themeMode = "lightGold";
    } else if (mergedSettings.themeMode === "system") {
      mergedSettings.themeMode = "darkBlue";
    }

    return mergedSettings;
  } catch {
    return DEFAULT_EMAIL_SETTINGS;
  }
}

function loadStoredAccounts(): Account[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (account) =>
        account?.provider === "microsoft" ||
        account?.provider === "google" ||
        account?.provider === "imap",
    );
  } catch {
    return [];
  }
}

function getThemeAttribute(settings: EmailSettings) {
  return settings.themeMode;
}

function getAccountProviderLabel(account: Account) {
  if (account.provider === "google") return "Gmail";
  if (account.provider === "imap") return "IMAP";
  if (account.provider === "microsoft") return "Outlook";
  return account.email;
}

function formatSyncStatus(lastSyncedAt: Date | null) {
  if (!lastSyncedAt) return "Not synced";

  return `Synced ${lastSyncedAt.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function formatRelativeSync(lastSyncedAt: Date | null) {
  if (!lastSyncedAt) return "sync pending";

  const diffSeconds = Math.max(
    0,
    Math.round((Date.now() - lastSyncedAt.getTime()) / 1000),
  );

  if (diffSeconds < 5) return "synced just now";
  if (diffSeconds < 60) return `synced ${diffSeconds}s ago`;

  const diffMinutes = Math.round(diffSeconds / 60);
  if (diffMinutes < 60) return `synced ${diffMinutes}m ago`;

  const diffHours = Math.round(diffMinutes / 60);
  return `synced ${diffHours}h ago`;
}

function getSyncCutoff(syncWindow: EmailSettings["syncWindow"]) {
  const days = {
    "30 days": 30,
    "90 days": 90,
    "1 year": 365,
  }[syncWindow];

  return Date.now() - days * 24 * 60 * 60 * 1000;
}

function getAutoDeleteCutoff(
  autoDeleteTrash: EmailSettings["autoDeleteTrash"],
) {
  if (autoDeleteTrash === "never") return null;

  const days = autoDeleteTrash === "30 days" ? 30 : 90;
  return Date.now() - days * 24 * 60 * 60 * 1000;
}

function replaceEmailAddress(
  addresses: string[] = [],
  current: string,
  next: string,
) {
  return addresses.map((address) => (address === current ? next : address));
}

function withSignature(body: string | undefined, signature: string) {
  const trimmedSignature = signature.trim();
  if (!trimmedSignature) {
    return body ?? "";
  }

  if (!body || !body.trim()) {
    return trimmedSignature;
  }

  return `${body.replace(/\s+$/, "")}\n\n${trimmedSignature}`;
}

function selectProfileColor(seed: string) {
  const hash = seed
    .toLowerCase()
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return PROFILE_COLORS[hash % PROFILE_COLORS.length];
}

function formatQuotedReply(email: EmailThread) {
  const originalText = htmlToPlainText(email.body || email.preview || "");

  const sentAt = email.timestamp.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const quotedText = originalText
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");

  return [
    "",
    "",
    `On ${sentAt}, ${email.sender.name} <${email.sender.email}> wrote:`,
    quotedText || "> No readable message content.",
  ].join("\n");
}

function buildReplyHtml(email: EmailThread, signature: string) {
  const sentAt = email.timestamp.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const signatureHtml = signature.trim()
    ? `<div>${plainTextToHtml(signature.trim())}</div><br/>`
    : "";

  const originalBody = email.body?.trim()
    ? email.body
    : `<p>${plainTextToHtml(email.preview || "No readable message content.")}</p>`;

  return `
    <div><br/></div>
    ${signatureHtml}
    <div class="reply-quote" style="margin-top:16px;padding-left:12px;border-left:2px solid #777;color:#777;">
      <div style="margin-bottom:8px;">
        On ${plainTextToHtml(sentAt)}, ${plainTextToHtml(email.sender.name)} &lt;${plainTextToHtml(email.sender.email)}&gt; wrote:
      </div>
      ${originalBody}
    </div>
  `.trim();
}

function toneHintFor(tone: AiTone) {
  return {
    short: "Keep this reply tight and direct.",
    polite: "Use warm, respectful language.",
    firm: "Be clear about deadlines and decisions.",
    detailed: "Answer with full context.",
    decline: "Say no without sounding abrupt.",
    "follow-up": "Nudge for a response and restate the open loop.",
  }[tone];
}

function parseStoredRecipients(value: unknown): string[] {
  if (!value) return [];

  const recipients =
    typeof value === "string"
      ? (() => {
          try {
            return JSON.parse(value);
          } catch {
            return [];
          }
        })()
      : value;

  if (!Array.isArray(recipients)) return [];

  return recipients
    .map((recipient: any) => recipient?.emailAddress?.address)
    .filter(Boolean);
}

function toEmailThread(folderId: string, graphMessage: any): EmailThread {
  const senderEmail =
    graphMessage.from?.emailAddress?.address ||
    graphMessage.sender?.emailAddress?.address ||
    graphMessage.fromAddress ||
    "unknown@outlook.com";

  const senderName =
    graphMessage.from?.emailAddress?.name ||
    graphMessage.sender?.emailAddress?.name ||
    graphMessage.fromName ||
    senderEmail;

  const bodyObj = graphMessage.body;

  const bodyContent =
    typeof bodyObj === "string"
      ? bodyObj
      : bodyObj?.content || graphMessage.bodyContent || "";

  const contentType =
    typeof bodyObj === "string"
      ? "html"
      : bodyObj?.contentType?.toLowerCase() ||
        graphMessage.bodyContentType?.toLowerCase() ||
        "";

  const isHtml =
    contentType === "html" ||
    /<html|<body|<div|<p|<br|<table|<span/i.test(bodyContent);

  const htmlBody = bodyContent
    ? isHtml
      ? bodyContent
      : `<p>${escapeHtml(bodyContent).replace(/\n/g, "<br/>")}</p>`
    : "";

  return {
    id: `${graphMessage.accountId || "unknown"}:${folderId}:${graphMessage.id}`,
    accountId: graphMessage.accountId || "",
    messageId: graphMessage.id,
    conversationId:
      graphMessage.conversationId || graphMessage.threadId || undefined,
    internetMessageId:
      graphMessage.internetMessageId ||
      graphMessage.internet_message_id ||
      undefined,
    inReplyTo: graphMessage.inReplyTo || graphMessage.inReplyToId || undefined,
    references: Array.isArray(graphMessage.references)
      ? graphMessage.references
      : typeof graphMessage.references === "string"
        ? graphMessage.references.split(/\s+/).filter(Boolean)
        : [],
    sender: {
      name: senderName,
      email: senderEmail,
      initials: getInitials(senderName || senderEmail),
      color: selectProfileColor(senderEmail),
    },
    subject: graphMessage.subject || "(No subject)",
    preview: graphMessage.bodyPreview || "",
    body: htmlBody,
    timestamp: graphMessage.receivedDateTime
      ? new Date(graphMessage.receivedDateTime)
      : new Date(),
    isRead: Boolean(graphMessage.isRead),
    isStarred: Boolean(graphMessage.isStarred),
    folder: folderId,
    folderId,
    folderLabel:
      graphMessage.folderDisplayName || graphMessage.folderName || folderId,
    labels: [],
    threadCount: 1,
    hasAttachment: Boolean(graphMessage.hasAttachments),
    attachments: (Array.isArray(graphMessage.attachments)
      ? graphMessage.attachments
      : []
    )
      .map((a: any) => ({
        id: a.id,
        filename: a.name || "Unknown File",
        size: a.size || 0,
        contentType: a.contentType || "application/octet-stream",
        isInline: Boolean(a.isInline),
        contentId: a.contentId || a.contentID || undefined,
      })),
    to: parseStoredRecipients(graphMessage.toRecipients),
    cc: parseStoredRecipients(graphMessage.ccRecipients),
    snoozedUntil:
      typeof graphMessage.snoozedUntil === "string" &&
      !Number.isNaN(Date.parse(graphMessage.snoozedUntil))
        ? new Date(graphMessage.snoozedUntil)
        : null,
  };
}

export function EmailClient() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeFolder, setActiveFolder] = useState<FolderType>("inbox");
  const [emails, setEmails] = useState<EmailThread[]>([]);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [selectedEmailIds, setSelectedEmailIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [aiSummaryRequestToken, setAiSummaryRequestToken] = useState(0);
  const [isAiDrafting, setIsAiDrafting] = useState(false);
  const [globalSearchDraft, setGlobalSearchDraft] = useState("");
  const [globalSearchSelectedIndex, setGlobalSearchSelectedIndex] =
    useState(0);
  const [isGlobalSearchActionMenuOpen, setIsGlobalSearchActionMenuOpen] =
    useState(false);
  const [globalSearchActionIndex, setGlobalSearchActionIndex] = useState(0);
  const [senderTrustRevision, setSenderTrustRevision] = useState(0);
  const globalSearchRef = React.useRef<HTMLInputElement>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [accounts, setAccounts] = useState<Account[]>(loadStoredAccounts);
  const [currentAccountId, setCurrentAccountId] = useState(
    () => loadStoredAccounts()[0]?.id ?? DEFAULT_PRIMARY_ACCOUNT.id,
  );
  const [settings, setSettings] = useState<EmailSettings>(loadStoredSettings);
  const [dbStorageGB, setDbStorageGB] = useState<number>(0);
  const [isAppLoaded, setIsAppLoaded] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConnectingMicrosoft, setIsConnectingMicrosoft] = useState(false);
  const [connectMicrosoftError, setConnectMicrosoftError] = useState<
    string | null
  >(null);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [connectGoogleError, setConnectGoogleError] = useState<string | null>(null);
  const [isConnectingImap, setIsConnectingImap] = useState(false);
  const [connectImapError, setConnectImapError] = useState<string | null>(null);
  const [mailSyncError, setMailSyncError] = useState<string | null>(null);
  const scheduledDraftsInFlightRef = React.useRef<Set<string>>(new Set());
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [mailFolders, setMailFolders] = useState<MailFolder[]>([]);
  const [initialSyncedAccountIds, setInitialSyncedAccountIds] = useState<
    string[]
  >([]);
  const [emailLabels, setEmailLabels] = useState<EmailLabel[]>([]);
  const [activeLabelId, setActiveLabelId] = useState<string | null>(null);
  const activeFolderRef = React.useRef(activeFolder);
  const selectedEmailIdRef = React.useRef<string | null>(selectedEmailId);
  const mailFoldersRef = React.useRef<MailFolder[]>([]);
  const fetchGenerationRef = React.useRef(0);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [hasLoadedCalendar, setHasLoadedCalendar] = useState(false);
  const [appVersion, setAppVersion] = useState("");

  // --- TUTORIAL STATE ---
  const [tutorialStep, setTutorialStep] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const done = window.localStorage.getItem("ryze_tutorial_done");
    const hasAccounts = loadStoredAccounts().length > 0;
    if (done && hasAccounts) return 0;
    if (!hasAccounts) window.localStorage.removeItem("ryze_tutorial_done");
    return 1;
  });

  // Watch for account connection to auto-advance tutorial
  useEffect(() => {
    if (tutorialStep === 2 && !isSettingsOpen) {
      if (
        accounts.some(
          (a) =>
            a.provider === "microsoft" ||
            a.provider === "google" ||
            a.provider === "imap",
        )
      ) {
        const timer = setTimeout(() => setTutorialStep(3), 400);
        return () => clearTimeout(timer);
      }
    }
  }, [tutorialStep, isSettingsOpen, accounts]);

  useEffect(() => {
    (window as any).electronAPI?.getAppVersion?.().then((v: string) => {
      if (v) setAppVersion(v);
    });
  }, []);

  useEffect(() => {
    selectedEmailIdRef.current = selectedEmailId;
  }, [selectedEmailId]);

  useEffect(() => {
    activeFolderRef.current = activeFolder;
  }, [activeFolder]);

  useEffect(() => {
    mailFoldersRef.current = mailFolders;
  }, [mailFolders]);

  useEffect(() => {
    if (mailFolders.length === 0) return;

    const isUnifiedFolder =
      activeFolder === "all-inboxes" ||
      activeFolder === "all-sent" ||
      activeFolder === SNOOZED_FOLDER_ID ||
      activeFolder === SNOOZED_DUE_TODAY_FOLDER_ID ||
      activeFolder === SNOOZED_WAITING_FOLDER_ID;

    if (isUnifiedFolder) {
      activeFolderRef.current = activeFolder;
      return;
    }

    const activeFolderStillExists = mailFolders.some(
      (folder) => folder.id === activeFolder,
    );

    if (activeFolderStillExists) return;

    const nextActiveFolder = findDefaultInboxFolderId(mailFolders);

    activeFolderRef.current = nextActiveFolder;
    setActiveFolder(nextActiveFolder as FolderType);
    setSelectedEmailId(null);
  }, [mailFolders, activeFolder]);

  useDraftPersistence({ drafts, setDrafts });

  const currentAccount =
    accounts.find((account) => account.id === currentAccountId) ??
    accounts[0] ??
    DEFAULT_PRIMARY_ACCOUNT;

  const themeAttribute = getThemeAttribute(settings);
  const isAppDarkMode = themeAttribute !== "lightGold" && themeAttribute !== "appleLight";
  const syncCutoff = getSyncCutoff(settings.syncWindow);
  const autoDeleteCutoff = getAutoDeleteCutoff(settings.autoDeleteTrash);

  useEffect(() => {
    const timer = setTimeout(() => setIsAppLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.theme = themeAttribute;
  }, [themeAttribute]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));

    if (window.electronAPI?.updateBackendSettings) {
      window.electronAPI.updateBackendSettings(settings);
    }
  }, [settings]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    if (
      settings.desktopAlerts &&
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission().catch(() => undefined);
    }
  }, [settings.desktopAlerts]);

  const { isSessionLocked, unlock: unlockSession } = useSessionLock({
    sessionLock: settings.sessionLock,
  });

  useEffect(() => {
    if (
      !accounts.some((account) => account.id === currentAccountId) &&
      accounts[0]
    ) {
      setCurrentAccountId(accounts[0].id);
    }
  }, [accounts, currentAccountId]);

  const fetchLocalAndSetUI = useCallback(async () => {
    if (!window.electronAPI?.getAllLocalEmails) return;

    const generation = fetchGenerationRef.current;
    try {
      const result = await window.electronAPI.getAllLocalEmails();

      if (fetchGenerationRef.current !== generation) return;

      const nextFolders = result.folders || [];
      setMailFolders(nextFolders);
      setEmailLabels(result.labels || []);

      const currentActiveFolder = activeFolderRef.current;
      const activeFolderExists = nextFolders.some(
        (folder) => folder.id === currentActiveFolder,
      );

      if (
        !activeFolderExists &&
        nextFolders.length > 0 &&
        currentActiveFolder !== "all-inboxes" &&
        currentActiveFolder !== "all-sent" &&
        currentActiveFolder !== SNOOZED_FOLDER_ID &&
        currentActiveFolder !== SNOOZED_DUE_TODAY_FOLDER_ID &&
        currentActiveFolder !== SNOOZED_WAITING_FOLDER_ID
      ) {
        activeFolderRef.current = "all-inboxes";
        setActiveFolder("all-inboxes" as FolderType);
      }

      const labelsByMessageId = result.labelsByMessageId || {};

      const folderAccountMap = new Map(
        nextFolders.map((f) => [f.id, f.accountId]),
      );

      const mapped = Object.entries(result.messagesByFolder || {})
        .flatMap(([folderId, messages]) => {
          const ownerAccountId = folderAccountMap.get(folderId) || "";
          return (messages as any[]).map((message) => {
            message.accountId = ownerAccountId;
            return {
              ...toEmailThread(folderId, message),
              labels: labelsByMessageId[message.id] || [],
            };
          });
        })
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      setEmails((previousEmails) => {
        const previousByMessageId = new Map(
          previousEmails.map((email) => [email.messageId, email]),
        );

        const mergedMapped = mapped.map((nextEmail) => {
          const previousEmail = previousByMessageId.get(nextEmail.messageId);

          if (
            previousEmail?.body &&
            previousEmail.id === selectedEmailIdRef.current
          ) {
            return { ...nextEmail, body: previousEmail.body };
          }

          return { ...nextEmail, body: nextEmail.body || "" };
        });

        const now = Date.now();
        const optimisticReplies = previousEmails.filter((email) => {
          if (!email.messageId.startsWith("local-reply-")) return false;
          if (now - email.timestamp.getTime() > 10 * 60 * 1000) return false;

          const isAlreadySynced = mergedMapped.some((synced) => {
            const sameAccount = synced.accountId === email.accountId;
            const sameConversation =
              Boolean(synced.conversationId) &&
              synced.conversationId === email.conversationId;
            const sameSubject =
              synced.subject.trim().toLowerCase() ===
              email.subject.trim().toLowerCase();
            const sameSender =
              synced.sender.email.trim().toLowerCase() ===
              email.sender.email.trim().toLowerCase();
            const nearInTime =
              Math.abs(
                synced.timestamp.getTime() - email.timestamp.getTime(),
              ) <=
              15 * 60 * 1000;

            return (
              sameAccount &&
              sameConversation &&
              sameSubject &&
              sameSender &&
              nearInTime
            );
          });

          return !isAlreadySynced;
        });

        return [...mergedMapped, ...optimisticReplies].sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
        );
      });
      setLastSyncedAt(new Date());
    } catch (error) {
      console.error("Failed to load local emails:", error);
    }
  }, []);

  const silentlyRefreshMailboxUI = useCallback(async () => {
    await fetchLocalAndSetUI();

    if (window.electronAPI?.getStorageUsage) {
      const usage = await window.electronAPI.getStorageUsage();
      setDbStorageGB(usage.dbSizeGB);
    }

    setSelectedEmailIds((prev) => [...prev]);
  }, [fetchLocalAndSetUI]);

  useEffect(() => {
    let isCancelled = false;

    const syncAllAccounts = async () => {
      setMailSyncError(null);

      try {
        await fetchLocalAndSetUI();
        if (isCancelled) return;

        const msAccounts = accounts.filter((a) => a.provider === "microsoft");
        const googleAccounts = accounts.filter((a) => a.provider === "google");
        const imapAccounts = accounts.filter((a) => a.provider === "imap");
        const accountsToSync = accounts.filter(
          (a) => !initialSyncedAccountIds.includes(a.id),
        );

        if (window.electronAPI?.syncMail && accountsToSync.length > 0) {
          for (const account of accountsToSync) {
            try {
              await window.electronAPI.syncMail(account.id);
              if (isCancelled) return;
            } catch (error) {
              console.error(`Initial sync failed for ${account.email}`, error);
            }
          }
        }

        if (!isCancelled && accountsToSync.length > 0) {
          setInitialSyncedAccountIds((prev) => {
            const newIds = accountsToSync
              .map((a) => a.id)
              .filter((id) => !prev.includes(id));
            return [...prev, ...newIds];
          });
          await silentlyRefreshMailboxUI();
        }
      } catch (error) {
        if (isCancelled) return;
        setMailSyncError("Failed to initialize mailbox sync.");
      }
    };

    syncAllAccounts();

    let isSyncing = false;

    const targetedInterval = setInterval(async () => {
      if (isSyncing) return;
      if (!window.electronAPI?.syncMicrosoftFolders) return;

      try {
        isSyncing = true;
        const msAccounts = accounts.filter((a) => a.provider === "microsoft");

        for (const account of msAccounts) {
          if (isCancelled) break;
          const currentFolders = mailFoldersRef.current.filter(
            (f) => f.accountId === account.id,
          );
          const currentActiveFolder = activeFolderRef.current;

          const inboxFolderId = findDefaultInboxFolderId(currentFolders);

          const normalizedActiveFolder = currentFolders.some(
            (folder) => folder.id === currentActiveFolder,
          )
            ? currentActiveFolder
            : inboxFolderId;

          const folderIdsToSync = Array.from(
            new Set([inboxFolderId, normalizedActiveFolder].filter(Boolean)),
          );

          await window.electronAPI.syncMicrosoftFolders(
            account.id,
            folderIdsToSync,
          );
        }

        if (!isCancelled) {
          await silentlyRefreshMailboxUI();
        }
      } catch (e) {
        console.error("Targeted folder sync failed", e);
      } finally {
        isSyncing = false;
      }
    }, 60000);

    const fullInterval = setInterval(async () => {
      if (isSyncing) return;
      try {
        isSyncing = true;
        
        if (window.electronAPI?.syncMail) {
          for (const account of accounts) {
            if (isCancelled) break;
            await window.electronAPI.syncMail(account.id);
          }
        }

        if (!isCancelled) {
          await silentlyRefreshMailboxUI();
        }
      } catch (e) {
        console.error("Full mailbox delta sync failed", e);
      } finally {
        isSyncing = false;
      }
    }, 900000);

    return () => {
      isCancelled = true;
      clearInterval(targetedInterval);
      clearInterval(fullInterval);
    };
  }, [
    accounts,
    fetchLocalAndSetUI,
    silentlyRefreshMailboxUI,
    initialSyncedAccountIds,
  ]);

  const activeMailFolder = mailFolders.find(
    (folder) => folder.id === activeFolder,
  );
  const activeKnownFolder = activeMailFolder?.wellKnownName || "";
  const nowTimestamp = Date.now();
  const endOfTodayTimestamp = getEndOfTodayTimestamp();

  const folderEmails = emails.filter((email) => {
    const senderPolicy = getSenderPolicy(
      loadSenderTrustPolicies(),
      email.sender.email || "",
    );
    if (senderPolicy.blocked || senderPolicy.muted) {
      return false;
    }

    const snoozedUntilTimestamp = email.snoozedUntil?.getTime() ?? null;
    const isSnoozedInFuture =
      snoozedUntilTimestamp !== null && snoozedUntilTimestamp > nowTimestamp;

    if (activeLabelId) {
      return email.labels.some((label) => label.id === activeLabelId);
    }

    if (activeFolder === SNOOZED_FOLDER_ID) {
      return snoozedUntilTimestamp !== null;
    }

    if (activeFolder === SNOOZED_DUE_TODAY_FOLDER_ID) {
      return (
        snoozedUntilTimestamp !== null &&
        snoozedUntilTimestamp <= endOfTodayTimestamp
      );
    }

    if (activeFolder === SNOOZED_WAITING_FOLDER_ID) {
      return (
        snoozedUntilTimestamp !== null &&
        snoozedUntilTimestamp > endOfTodayTimestamp
      );
    }

    if (isSnoozedInFuture) {
      return false;
    }

    if (activeFolder === "all-inboxes") {
      const inboxIds = getInboxFolderIds(mailFolders);
      return inboxIds.has(email.folder);
    }

    if (activeFolder === "all-sent") {
      const sentIds = getSentFolderIds(mailFolders);
      return sentIds.has(email.folder);
    }

    if (email.folder !== activeFolder) return false;

    const activeMailFolder = mailFolders.find(
      (folder) => folder.id === activeFolder,
    );
    const activeKnownFolder = activeMailFolder?.wellKnownName || "";

    if (
      activeKnownFolder === "deleteditems" &&
      autoDeleteCutoff &&
      email.timestamp.getTime() < autoDeleteCutoff
    ) {
      return false;
    }

    return true;
  });

  const selectedEmail =
    folderEmails.find((email) => email.id === selectedEmailId) ??
    emails.find(
      (email) => email.id === selectedEmailId && email.folder === activeFolder,
    ) ??
    null;
  const selectedConversation = selectedEmail
    ? buildConversationThread(selectedEmail, emails)
    : null;
  const threadRows = React.useMemo(
    () => buildThreadListRows(folderEmails),
    [folderEmails, senderTrustRevision],
  );
  const liveSearchRows = React.useMemo(
    () =>
      threadRows
        .filter((row) =>
          threadRowMatchesFilters(row, {
            query: globalSearchDraft,
            activeFilters: [],
          }),
        )
        .slice(0, 8),
    [threadRows, globalSearchDraft],
  );
  const selectedLiveSearchRow =
    liveSearchRows[globalSearchSelectedIndex] ?? null;
  const threadRowMessageIds = React.useMemo(
    () =>
      new Map(threadRows.map((row) => [row.latestMessage.id, row.messageIds])),
    [threadRows],
  );

  useEffect(() => {
    setGlobalSearchSelectedIndex(0);
    setIsGlobalSearchActionMenuOpen(false);
    setGlobalSearchActionIndex(0);
  }, [globalSearchDraft]);

  useEffect(() => {
    if (globalSearchSelectedIndex >= liveSearchRows.length) {
      setGlobalSearchSelectedIndex(Math.max(liveSearchRows.length - 1, 0));
    }
  }, [globalSearchSelectedIndex, liveSearchRows.length]);

  useEffect(() => {
    if (threadRows.length === 0) {
      if (selectedEmailId) setSelectedEmailId(null);
      return;
    }

    const selectedStillVisible = selectedEmailId
      ? folderEmails.some((email) => email.id === selectedEmailId)
      : false;

    if (!selectedStillVisible) {
      setSelectedEmailId(threadRows[0].latestMessage.id);
    }
  }, [folderEmails, selectedEmailId, threadRows]);

  useEffect(() => {
    const syncPolicies = () => setSenderTrustRevision((value) => value + 1);
    window.addEventListener("storage", syncPolicies);
    window.addEventListener("ryze-sender-trust-updated", syncPolicies);
    return () => {
      window.removeEventListener("storage", syncPolicies);
      window.removeEventListener("ryze-sender-trust-updated", syncPolicies);
    };
  }, []);

  const systemFolderIds = getSystemFolderIds(mailFolders);

  const unreadCounts = emails.reduce(
    (acc, email) => {
      if (!email.isRead) {
        acc[email.folder] = (acc[email.folder] || 0) + 1;

        const snoozedUntilTimestamp = email.snoozedUntil?.getTime() ?? null;
        if (snoozedUntilTimestamp !== null) {
          acc[SNOOZED_FOLDER_ID] = (acc[SNOOZED_FOLDER_ID] || 0) + 1;
          if (snoozedUntilTimestamp <= endOfTodayTimestamp) {
            acc[SNOOZED_DUE_TODAY_FOLDER_ID] =
              (acc[SNOOZED_DUE_TODAY_FOLDER_ID] || 0) + 1;
          } else {
            acc[SNOOZED_WAITING_FOLDER_ID] =
              (acc[SNOOZED_WAITING_FOLDER_ID] || 0) + 1;
          }
        }
      }

      return acc;
    },
    {} as Record<FolderType, number>,
  );

  const labelCounts = emails.reduce(
    (acc, email) => {
      for (const label of email.labels) {
        acc[label.id] = (acc[label.id] || 0) + 1;
      }

      return acc;
    },
    {} as Record<string, number>,
  );

  const activeLabel = activeLabelId
    ? emailLabels.find((label) => label.id === activeLabelId) ?? null
    : null;

  const activeFolderLabel = activeLabel
    ? activeLabel.name
    : activeFolder === "all-inboxes"
      ? "All Inboxes"
      : activeFolder === "all-sent"
        ? "Sent"
        : activeFolder === SNOOZED_FOLDER_ID
          ? "Snoozed"
          : activeFolder === SNOOZED_DUE_TODAY_FOLDER_ID
            ? "Due Today"
            : activeFolder === SNOOZED_WAITING_FOLDER_ID
              ? "Waiting"
        : activeMailFolder?.displayName || "Inbox";

  const folderUnreadCount = activeLabel
    ? folderEmails.filter((email) =>
        email.labels.some((label) => label.id === activeLabel.id) && !email.isRead,
      ).length
    : folderEmails.filter((email) => !email.isRead).length;

  const statusSummary = `${accounts.length} account${accounts.length === 1 ? "" : "s"} synced`;

  const handleSettingsChange = useCallback(
    (updates: Partial<EmailSettings>) => {
      setSettings((prev) => ({
        ...prev,
        ...updates,
      }));
    },
    [],
  );

  const handleDeleteAccount = useCallback(
    async (accountId: string) => {
      const accountToDelete = accounts.find(
        (account) => account.id === accountId,
      );
      if (!accountToDelete) return;

      try {
        if (!window.electronAPI?.deleteAccount) {
          throw new Error(
            "Delete account is only available in the Electron desktop app.",
          );
        }
        await window.electronAPI.deleteAccount(accountId);

        const nextAccounts = accounts.filter(
          (account) => account.id !== accountId,
        );

        fetchGenerationRef.current += 1;
        setAccounts(nextAccounts);
        setEmails([]);
        setSelectedEmailId(null);
        setMailSyncError(null);
        setCurrentAccountId(nextAccounts[0]?.id ?? DEFAULT_PRIMARY_ACCOUNT.id);

        if (nextAccounts.length === 0) {
          window.localStorage.removeItem("ryze_tutorial_done");
          setTutorialStep(1);
        }
      } catch (error) {
        console.error("Failed to delete account:", error);
        setMailSyncError(
          error instanceof Error ? error.message : "Failed to delete account.",
        );
      }
    },
    [accounts],
  );

  const handleAccountChange = useCallback(
    (updates: Partial<Account>) => {
      const previousAccount = currentAccount;
      const nextAccount = {
        ...previousAccount,
        ...updates,
      };

      nextAccount.initials = getInitials(nextAccount.name);

      setAccounts((prev) =>
        prev.map((account) =>
          account.id === previousAccount.id ? nextAccount : account,
        ),
      );

      setEmails((prev) =>
        prev.map((email) => {
          const senderMatches = email.sender.email === previousAccount.email;
          const recipientMatches =
            email.to.includes(previousAccount.email) ||
            email.cc?.includes(previousAccount.email);

          if (!senderMatches && !recipientMatches) {
            return email;
          }

          return {
            ...email,
            sender: senderMatches
              ? {
                  ...email.sender,
                  name: nextAccount.name,
                  email: nextAccount.email,
                  initials: nextAccount.initials,
                  color: nextAccount.color,
                }
              : email.sender,
            to: replaceEmailAddress(
              email.to,
              previousAccount.email,
              nextAccount.email,
            ),
            cc: email.cc
              ? replaceEmailAddress(
                  email.cc,
                  previousAccount.email,
                  nextAccount.email,
                )
              : email.cc,
          };
        }),
      );
    },
    [currentAccount],
  );

  const handleConnectMicrosoft = useCallback(async () => {
    setConnectMicrosoftError(null);

    if (!window.electronAPI?.connectMicrosoftAccount) {
      setConnectMicrosoftError(
        "Microsoft OAuth is available only in the Electron desktop app.",
      );
      return;
    }

    setIsConnectingMicrosoft(true);
    try {
      const result = await window.electronAPI.connectMicrosoftAccount();
      const connected = result.account;
      const existing = accounts.find(
        (account) =>
          account.id === connected.id ||
          account.email.toLowerCase() === connected.email.toLowerCase(),
      );
      const accountId = existing?.id ?? connected.id;

      const nextAccount: Account = {
        id: accountId,
        name: connected.name,
        email: connected.email,
        initials: getInitials(connected.name),
        color: existing?.color ?? selectProfileColor(connected.email),
        provider: "microsoft",
        externalId: connected.externalId,
      };

      setAccounts((prev) => {
        const prevExisting = prev.find((account) => account.id === accountId);
        if (prevExisting) {
          return prev.map((account) =>
            account.id === accountId ? nextAccount : account,
          );
        }
        return [...prev, nextAccount];
      });
      setCurrentAccountId(accountId);
    } catch (error) {
      const fallback =
        "Microsoft sign-in failed. Check OAuth env vars and redirect URI.";
      setConnectMicrosoftError(
        error instanceof Error ? error.message : fallback,
      );
    } finally {
      setIsConnectingMicrosoft(false);
    }
  }, [accounts]);

  const handleConnectGoogle = useCallback(async () => {
    setConnectGoogleError(null);

    if (!window.electronAPI?.connectGoogleAccount) {
      setConnectGoogleError("Gmail OAuth is available only in the Electron desktop app.");
      return;
    }

    setIsConnectingGoogle(true);
    try {
      const result = await window.electronAPI.connectGoogleAccount();
      const connected = result.account;
      const existing = accounts.find(
        (account) =>
          account.id === connected.id ||
          account.email.toLowerCase() === connected.email.toLowerCase(),
      );
      const accountId = existing?.id ?? connected.id;

      const nextAccount: Account = {
        id: accountId,
        name: connected.name,
        email: connected.email,
        initials: getInitials(connected.name),
        color: existing?.color ?? selectProfileColor(connected.email),
        provider: "google",
        externalId: connected.externalId,
      };

      setAccounts((prev) => {
        const prevExisting = prev.find((account) => account.id === accountId);
        if (prevExisting) {
          return prev.map((account) => (account.id === accountId ? nextAccount : account));
        }
        return [...prev, nextAccount];
      });
      setCurrentAccountId(accountId);
    } catch (error) {
      setConnectGoogleError(formatGoogleConnectError(error));
    } finally {
      setIsConnectingGoogle(false);
    }
  }, [accounts]);

  const handleConnectImap = useCallback(
    async (payload: {
      email: string;
      displayName: string;
      host: string;
      port: number;
      secure: boolean;
      username: string;
      password: string;
    }) => {
      setConnectImapError(null);

      if (!window.electronAPI?.connectImapAccount) {
        setConnectImapError(
          "IMAP setup is available only in the Electron desktop app.",
        );
        return;
      }

      setIsConnectingImap(true);
      try {
        const result = await window.electronAPI.connectImapAccount(payload);
        const connected = result.account;
        const existing = accounts.find(
          (account) =>
            account.id === connected.id ||
            account.email.toLowerCase() === connected.email.toLowerCase(),
        );
        const accountId = existing?.id ?? connected.id;

        const nextAccount: Account = {
          id: accountId,
          name: connected.name,
          email: connected.email,
          initials: getInitials(connected.name),
          color: existing?.color ?? selectProfileColor(connected.email),
          provider: "imap",
          externalId: connected.externalId,
        };

        setAccounts((prev) => {
          const prevExisting = prev.find((account) => account.id === accountId);
          if (prevExisting) {
            return prev.map((account) =>
              account.id === accountId ? nextAccount : account,
            );
          }
          return [...prev, nextAccount];
        });
        setCurrentAccountId(accountId);
      } catch (error) {
        setConnectImapError(
          error instanceof Error ? error.message : "IMAP setup failed.",
        );
      } finally {
        setIsConnectingImap(false);
      }
    },
    [accounts],
  );

  const handleSelectEmail = useCallback(
    async (email: EmailThread) => {
      setSelectedEmailId(email.id);

      const realMessageId = email.messageId;
      const owningAccountId = email.accountId || currentAccountId;

      console.log("[select email]", {
        emailId: email.id,
        messageId: realMessageId,
        emailAccountId: email.accountId,
        currentAccountId,
        owningAccountId,
      });

      setEmails((prev) =>
        prev.map((item) =>
          item.id === email.id ? { ...item, isRead: true } : item,
        ),
      );

      const owningAccount = accounts.find((a) => a.id === owningAccountId);
      const owningProvider = owningAccount?.provider ?? "microsoft";

      if (!email.isRead) {
        window.electronAPI
          ?.markEmailAsRead?.(owningAccountId, realMessageId)
          .catch((error) =>
            console.error("Failed to mark email as read:", error),
          );
      }

      const shouldFetchBodyOrAttachments =
        !email.body ||
        (email.hasAttachment &&
          (!email.attachments || email.attachments.length === 0));

      if (shouldFetchBodyOrAttachments) {
        try {
          const bodyData = (await window.electronAPI.getEmailBody(
            owningAccountId,
            realMessageId,
          )) as any;

          // Generic response structure: { content, contentType, attachments, source, warning }
          const rawContent = bodyData?.content || "";
          const rawContentType = bodyData?.contentType || "html";
          const isHtml = rawContentType.toLowerCase() === "html";

          const sanitizedContent = DOMPurify.sanitize(
            isHtml
              ? rawContent
              : `<p>${escapeHtml(rawContent).replace(/\n/g, "<br/>")}</p>`,
            {
              USE_PROFILES: { html: true },
              FORBID_TAGS: [
                "script",
                "iframe",
                "object",
                "embed",
                "form",
                "base",
                "meta",
                "link",
              ],
              FORBID_ATTR: [
                "onerror",
                "onload",
                "onclick",
                "onmouseover",
                "srcdoc",
              ],
            },
          );

          setEmails((prev) =>
            prev.map((item) =>
              item.id === email.id
                ? {
                    ...item,
                    body: sanitizedContent,
                    attachments: Array.isArray(bodyData?.attachments)
                      ? bodyData.attachments.map((attachment: any) => ({
                          id: String(attachment.id || ""),
                          filename: String(attachment.filename || attachment.name || "Unknown File"),
                          size: Number(attachment.size || 0),
                          contentType: String(
                            attachment.contentType ||
                              "application/octet-stream",
                          ),
                          isInline: Boolean(attachment.isInline),
                          contentId:
                            typeof attachment.contentId === "string"
                              ? attachment.contentId
                              : undefined,
                        }))
                      : item.attachments,
                  }
                : item,
            ),
          );
        } catch (error) {
          console.error("Failed to fetch email body:", error);
        }
      }
    },
    [currentAccountId, accounts],
  );

  const handleToggleStar = useCallback(
    (id: string) => {
      const emailToUpdate = emails.find((e) => e.id === id);
      if (!emailToUpdate) return;

      const newStarredState = !emailToUpdate.isStarred;

      setEmails((prev) =>
        prev.map((email) =>
          email.id === id ? { ...email, isStarred: newStarredState } : email,
        ),
      );

      const starAccountId = emailToUpdate.accountId || currentAccountId;
      const starAccount = accounts.find((a) => a.id === starAccountId);

      window.electronAPI
        ?.toggleEmailStar?.(
          starAccountId,
          emailToUpdate.messageId,
          newStarredState,
        )
        .catch((error) =>
          console.error("Failed to toggle star on server:", error),
        );
    },
    [emails, currentAccountId, accounts],
  );

  const handleDownloadAttachment = useCallback(
    async (messageId: string, attachmentId: string, filename: string) => {
      if (!window.electronAPI?.downloadMicrosoftEmailAttachment) {
        alert("Download API is not available. Fully restart Electron.");
        return;
      }

      const email = emails.find((e) => e.messageId === messageId);
      const owningAccountId = email?.accountId || currentAccountId;

      try {
        const result =
          await window.electronAPI.downloadMicrosoftEmailAttachment(
            owningAccountId,
            messageId,
            attachmentId,
            filename,
          );

        if (result.success) {
          console.log("File securely saved to:", result.filePath);
        }
      } catch (error) {
        console.error("Failed to download attachment:", error);
        alert(
          error instanceof Error ? error.message : "Failed to download file.",
        );
      }
    },
    [currentAccountId, emails],
  );

  const handleMarkUnread = useCallback(
    (id: string) => {
      const emailToUpdate = emails.find((e) => e.id === id);
      if (!emailToUpdate) return;

      setEmails((prev) =>
        prev.map((email) =>
          email.id === id ? { ...email, isRead: false } : email,
        ),
      );

      if (selectedEmailId === id) setSelectedEmailId(null);

      const unreadAccountId = emailToUpdate.accountId || currentAccountId;
      
      window.electronAPI
        ?.markEmailAsUnread?.(unreadAccountId, emailToUpdate.messageId)
        .catch((error) =>
          console.error("Failed to mark email as unread:", error),
        );
    },
    [selectedEmailId, emails, currentAccountId],
  );

  const handleMarkRead = useCallback(
    (id: string) => {
      const emailToUpdate = emails.find((e) => e.id === id);
      if (!emailToUpdate) return;

      setEmails((prev) =>
        prev.map((email) =>
          email.id === id ? { ...email, isRead: true } : email,
        ),
      );

      const readAccountId = emailToUpdate.accountId || currentAccountId;

      window.electronAPI
        ?.markEmailAsRead?.(readAccountId, emailToUpdate.messageId)
        .catch((error) =>
          console.error("Failed to mark email as read:", error),
        );
    },
    [emails, currentAccountId],
  );

  const handleSnooze = useCallback(
    async (id: string, snoozedUntilOverride?: string) => {
      const email = emails.find((item) => item.id === id);
      if (!email || !window.electronAPI?.snoozeEmail) return;

      const snoozedUntil = snoozedUntilOverride || getDefaultSnoozeUntilIso();

      try {
        await window.electronAPI.snoozeEmail({
          accountId: email.accountId || currentAccountId,
          messageId: email.messageId,
          snoozedUntil,
        });
        await fetchLocalAndSetUI();
      } catch (error) {
        console.error("Failed to snooze email:", error);
      }

      if (selectedEmailId === id) setSelectedEmailId(null);
    },
    [currentAccountId, emails, fetchLocalAndSetUI, selectedEmailId],
  );

  const moveEmailToFolderAndRefresh = useCallback(
    async (email: EmailThread, destinationFolderId: string) => {
      const accountId = email.accountId || currentAccount.id;
      const sourceFolderId = email.folderId || email.folder;
      const provider =
        accounts.find((account) => account.id === accountId)?.provider ??
        currentAccount.provider;
      
      const result = await window.electronAPI
        .moveEmail(accountId, email.messageId, destinationFolderId);

      setEmails((prev) =>
        prev.map((item) =>
          item.id === email.id || item.messageId === email.messageId
            ? applyMovedEmailState(item, {
                destinationFolderId,
                messageId: result.messageId,
              })
            : item,
        ),
      );

      try {
        if (provider === "microsoft") {
          await window.electronAPI.syncMicrosoftFolders?.(
            accountId,
            getMailboxRefreshFolderIds(sourceFolderId, destinationFolderId),
          );
        }
      } catch (error) {
        console.error("Post-move folder sync failed:", error);
      }

      await silentlyRefreshMailboxUI();
      return result;
    },
    [accounts, currentAccount.id, currentAccount.provider, silentlyRefreshMailboxUI],
  );

  const handleArchive = useCallback(
    async (id: string) => {
      const emailToArchive = emails.find((email) => email.id === id);
      if (!emailToArchive) return;
      const previousEmails = emails;
      const accountId = emailToArchive.accountId || currentAccount.id;
      const destinationFolderId = getKnownFolderIdForAccount(
        mailFolders,
        accountId,
        "archive",
      );

      setEmails((prev) =>
        prev.map((email) =>
          email.id === id
            ? applyMovedEmailState(email, { destinationFolderId })
            : email,
        ),
      );

      if (selectedEmailId === id) setSelectedEmailId(null);

      try {
        await moveEmailToFolderAndRefresh(emailToArchive, destinationFolderId);
      } catch (error) {
        console.error("Failed to archive email on server", error);
        setEmails(previousEmails);
        window.alert(
          error instanceof Error ? error.message : "Failed to archive email.",
        );
      }
    },
    [
      emails,
      selectedEmailId,
      currentAccount.id,
      mailFolders,
      moveEmailToFolderAndRefresh,
    ],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const emailToDelete = emails.find((email) => email.id === id);
      if (!emailToDelete) return;
      const previousEmails = emails;

      const owningAccountId = emailToDelete.accountId || currentAccount.id;
      const destinationFolderId = getKnownFolderIdForAccount(
        mailFolders,
        owningAccountId,
        "deleteditems",
      );

      setEmails((prev) =>
        prev.map((email) =>
          email.id === id
            ? applyMovedEmailState(email, { destinationFolderId })
            : email,
        ),
      );

      if (selectedEmailId === id) setSelectedEmailId(null);

      try {
        await moveEmailToFolderAndRefresh(emailToDelete, destinationFolderId);
      } catch (error) {
        console.error("Failed to delete email on server", error);
        setEmails(previousEmails);
        window.alert(
          error instanceof Error ? error.message : "Failed to delete email.",
        );
      }
    },
    [
      emails,
      selectedEmailId,
      currentAccount.id,
      mailFolders,
      moveEmailToFolderAndRefresh,
    ],
  );

  const handleCompose = useCallback(
    (prefill?: Partial<Draft>) => {
      const signatureHtml = settings.signature.trim()
        ? `<div>${plainTextToHtml(settings.signature.trim())}</div>`
        : "";

      const newDraft = createComposeDraft({
        currentAccount,
        signatureHtml,
        prefill,
      });

      setDrafts((prev) => [...prev, newDraft]);
    },
    [currentAccount, settings.signature],
  );

  const handleEmailDropToFolder = useCallback(
    async ({
      emailId,
      messageId,
      sourceFolderId,
      destinationFolderId,
    }: {
      emailId: string;
      messageId: string;
      sourceFolderId: string;
      destinationFolderId: string;
    }) => {
      if (sourceFolderId === destinationFolderId) {
        return false;
      }

      const emailToMove = emails.find((email) => email.id === emailId);
      if (!emailToMove) {
        return false;
      }
      const accountId = emailToMove.accountId || currentAccount.id;
      const provider =
        accounts.find((account) => account.id === accountId)?.provider ??
        currentAccount.provider;
      const moveOperation = resolveMailMoveOperation({
        provider,
        destinationFolderId,
      });

      const previousEmails = emails;

      setEmails((prev) =>
        prev.map((email) =>
          email.id === emailId
            ? {
                ...email,
                folder: destinationFolderId,
                folderId: destinationFolderId,
              }
            : email,
        ),
      );

      if (selectedEmailId === emailId && activeFolder === sourceFolderId) {
        setSelectedEmailId(null);
      }

      try {
        const result = await window.electronAPI.moveEmail(
          accountId,
          messageId,
          destinationFolderId,
        );

        setEmails((prev) =>
          prev.map((email) =>
            email.id === emailId
              ? applyMovedEmailState(email, {
                  destinationFolderId,
                  messageId: result.messageId,
                })
              : email,
          ),
        );

        try {
          if (provider === "microsoft") {
            await window.electronAPI.syncMicrosoftFolders?.(
              accountId,
              getMailboxRefreshFolderIds(sourceFolderId, destinationFolderId),
            );
          }
        } catch (syncError) {
          console.error("Post-move folder sync failed:", syncError);
        }

        await silentlyRefreshMailboxUI();

        return true;
      } catch (error) {
        console.error("Failed to move email to folder:", error);
        setEmails(previousEmails);
        window.alert(
          error instanceof Error ? error.message : "Failed to move email.",
        );
        return false;
      }
    },
    [
      activeFolder,
      accounts,
      currentAccount.id,
      currentAccount.provider,
      emails,
      selectedEmailId,
      silentlyRefreshMailboxUI,
    ],
  );

  const expandSelectedIds = useCallback(
    (emailIds: string[]) =>
      Array.from(
        new Set(
          emailIds.flatMap(
            (emailId) => threadRowMessageIds.get(emailId) || [emailId],
          ),
        ),
      ),
    [threadRowMessageIds],
  );

  const handleBulkMoveToFolder = useCallback(
    async (emailIds: string[], destinationFolderId: string) => {
      const expandedIds = expandSelectedIds(emailIds);
      const emailsToMove = emails.filter((email) =>
        expandedIds.includes(email.id),
      );

      for (const email of emailsToMove) {
        await handleEmailDropToFolder({
          emailId: email.id,
          messageId: email.messageId,
          sourceFolderId: email.folder,
          destinationFolderId,
        });
      }

      setSelectedEmailIds([]);
    },
    [emails, expandSelectedIds, handleEmailDropToFolder],
  );

  const openReplyDraft = useCallback(
    (
      mode: "reply" | "replyAll",
      tone?: AiTone,
      sourceEmail?: EmailThread | null,
      generatedReplyText?: string,
    ) => {
      const targetEmail = sourceEmail || selectedEmail;
      if (!targetEmail) return;
      const composerAccount = resolveComposerAccount(
        accounts,
        currentAccount,
        targetEmail.accountId,
      );

      const subject = targetEmail.subject.toLowerCase().startsWith("re:")
        ? targetEmail.subject
        : `Re: ${targetEmail.subject}`;

      const to =
        mode === "reply"
          ? targetEmail.sender.email
          : Array.from(
              new Set(
                [targetEmail.sender.email, ...targetEmail.to].filter(
                  (email) =>
                    email.toLowerCase() !== composerAccount.email.toLowerCase(),
                ),
              ),
            ).join(", ");

      const cc =
        mode === "replyAll"
          ? targetEmail.cc
              ?.filter(
                (email) =>
                  email.toLowerCase() !== composerAccount.email.toLowerCase(),
              )
              .join(", ") || ""
          : "";

      const replyPrefix = generatedReplyText?.trim()
        ? `<p>${plainTextToHtml(generatedReplyText.trim()).replace(/\n/g, "<br/>")}</p><div><br/></div>`
        : "";

      handleCompose({
        accountId: composerAccount.id,
        provider: composerAccount.provider,
        to,
        cc,
        subject,
        body: `${replyPrefix}${buildReplyHtml(targetEmail, settings.signature)}`,
        aiTone: tone,
        aiHint: tone ? toneHintFor(tone) : undefined,
      });
    },
    [accounts, currentAccount, handleCompose, selectedEmail, settings.signature],
  );

  const handleReply = useCallback((message?: EmailThread) => {
    openReplyDraft("reply", undefined, message);
  }, [openReplyDraft]);

  const handleReplyAll = useCallback((message?: EmailThread) => {
    openReplyDraft("replyAll", undefined, message);
  }, [openReplyDraft]);

  const handleReplyWithTone = useCallback(
    async (tone: AiTone) => {
      if (!selectedEmail) return;

      if (!window.electronAPI?.generateReplyWithAi) {
        openReplyDraft("reply", tone);
        return;
      }

      setIsAiDrafting(true);

      try {
        const result = await window.electronAPI.generateReplyWithAi({
          subject: selectedEmail.subject,
          senderName: selectedEmail.sender.name,
          senderEmail: selectedEmail.sender.email,
          body: selectedEmail.body || "",
          preview: selectedEmail.preview || "",
          tone,
        });

        const replyText =
          typeof result?.reply === "string" ? result.reply.trim() : "";

        openReplyDraft("reply", tone, selectedEmail, replyText);
      } catch (error) {
        console.error("AI reply generation failed:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Could not generate AI reply. Opened a standard reply draft.",
        );
        openReplyDraft("reply", tone, selectedEmail);
      } finally {
        setIsAiDrafting(false);
      }
    },
    [openReplyDraft, selectedEmail],
  );

  const handleForward = useCallback((message?: EmailThread) => {
    const targetEmail = message || selectedEmail;
    if (!targetEmail) return;
    const composerAccount = resolveComposerAccount(
      accounts,
      currentAccount,
      targetEmail.accountId,
    );
    handleCompose({
      accountId: composerAccount.id,
      provider: composerAccount.provider,
      subject: `Fwd: ${targetEmail.subject}`,
    });
  }, [accounts, currentAccount, selectedEmail, handleCompose]);

  const closeGlobalSearch = useCallback(() => {
    setIsGlobalSearchOpen(false);
    setIsGlobalSearchActionMenuOpen(false);
  }, []);

  const openGlobalSearchResult = useCallback(
    (message: EmailThread) => {
      setSearchQuery(globalSearchDraft);
      handleSelectEmail(message);
      closeGlobalSearch();
    },
    [closeGlobalSearch, globalSearchDraft, handleSelectEmail],
  );

  const runGlobalSearchAction = useCallback(
    (message: EmailThread, actionIndex: number) => {
      setSearchQuery(globalSearchDraft);
      handleSelectEmail(message);
      closeGlobalSearch();

      if (actionIndex === 0) {
        handleReply(message);
        return;
      }

      handleForward(message);
    },
    [
      closeGlobalSearch,
      globalSearchDraft,
      handleForward,
      handleReply,
      handleSelectEmail,
    ],
  );

  const handleToggleEmailSelection = useCallback((emailId: string) => {
    setSelectedEmailIds((prev) =>
      prev.includes(emailId)
        ? prev.filter((id) => id !== emailId)
        : [...prev, emailId],
    );
  }, []);

  const handleClearEmailSelection = useCallback(() => {
    setSelectedEmailIds([]);
  }, []);

  const handleDraftUpdate = useCallback(
    (id: string, updates: Partial<Draft>) => {
      setDrafts((prev) =>
        prev.map((draft) =>
          draft.id === id ? { ...draft, ...updates } : draft,
        ),
      );
    },
    [],
  );

  const handleDraftClose = useCallback((id: string) => {
    setDrafts((prev) => prev.filter((draft) => draft.id !== id));
  }, []);

  const handleDraftSchedule = useCallback(
    (id: string, scheduledSendAt: string | null) => {
      setDrafts((prev) =>
        prev.map((draft) =>
          draft.id === id
            ? {
                ...draft,
                scheduledSendAt: scheduledSendAt || undefined,
              }
            : draft,
        ),
      );
    },
    [],
  );

  const handleDraftSend = useCallback(
    async (id: string) => {
      const draft = drafts.find((d) => d.id === id);
      if (!draft) return;
      const composerAccount = resolveComposerAccount(
        accounts,
        currentAccount,
        draft.accountId,
      );
      const accountId = draft.accountId || composerAccount.id;
      const provider = draft.provider || composerAccount.provider;

      const sendPayload = {
        accountId,
        to: draft.to,
        cc: draft.cc,
        subject: draft.subject,
        body: draft.body,
      };

      if (window.electronAPI?.sendEmail) {
        try {
          setDrafts((prev) => prev.filter((d) => d.id !== id));

          try {
            await window.electronAPI.sendEmail(sendPayload);
          } catch (error) {
            console.error("Failed to send email:", error);
            setDrafts((prev) => [...prev, draft]);
            alert("Failed to send email. The draft was restored.");
          }

          if (provider === "microsoft") {
            window.electronAPI?.syncMail?.(accountId).catch(console.error);
          } else if (provider === "google") {
            window.electronAPI?.syncMail?.(accountId).catch(console.error);
          }
        } catch (error) {
          console.error("Failed to send email:", error);
          alert("Failed to send email. Check console for details.");
        }
      }
    },
    [accounts, currentAccount, drafts],
  );

  useEffect(() => {
    if (drafts.length === 0) return;

    const timer = window.setInterval(() => {
      const now = Date.now();

      drafts.forEach((draft) => {
        if (!draft.scheduledSendAt || !draft.to.trim()) return;

        const scheduledAt = Date.parse(draft.scheduledSendAt);
        if (Number.isNaN(scheduledAt) || scheduledAt > now) return;
        if (scheduledDraftsInFlightRef.current.has(draft.id)) return;

        scheduledDraftsInFlightRef.current.add(draft.id);
        setDrafts((prev) =>
          prev.map((item) =>
            item.id === draft.id ? { ...item, scheduledSendAt: undefined } : item,
          ),
        );
        handleDraftSend(draft.id).finally(() => {
          scheduledDraftsInFlightRef.current.delete(draft.id);
        });
      });
    }, 15_000);

    return () => window.clearInterval(timer);
  }, [drafts, handleDraftSend]);

  const handleInlineReplySend = useCallback(
    async (
      message: EmailThread,
      bodyText: string,
      conversationMessages: EmailThread[],
    ) => {
      const accountId = message.accountId || currentAccountId;
      const composerAccount = resolveComposerAccount(
        accounts,
        currentAccount,
        accountId,
      );
      const provider = composerAccount.provider;
      const sourceMessage = getInlineReplyTargetMessage(
        message,
        conversationMessages,
        composerAccount.email,
      );
      const recipients = getReplyRecipients(
        sourceMessage,
        composerAccount.email,
        conversationMessages,
      );
      const recipientList = recipients
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      const sentFolderId =
        mailFolders.find(
          (folder) =>
            folder.accountId === accountId &&
            folder.wellKnownName?.toLowerCase() === "sentitems",
        )?.id || message.folder;
      const optimisticReply: EmailThread = {
        id: `${accountId}:${sentFolderId}:local-reply-${Date.now()}`,
        accountId,
        messageId: `local-reply-${Date.now()}`,
        conversationId: sourceMessage.conversationId || message.conversationId,
        inReplyTo:
          sourceMessage.internetMessageId ||
          sourceMessage.messageId ||
          message.messageId,
        sender: {
          name: composerAccount.name || composerAccount.email,
          email: composerAccount.email,
          initials: getInitials(composerAccount.name || composerAccount.email),
          color: selectProfileColor(composerAccount.email),
        },
        subject: buildReplySubject(sourceMessage),
        preview: bodyText.trim().slice(0, 180),
        body: buildInlineReplyHtml({
          bodyText,
          sourceEmail: sourceMessage,
          signature: settings.signature,
        }),
        timestamp: new Date(),
        isRead: true,
        isStarred: false,
        folder: sentFolderId,
        folderId: sentFolderId,
        folderLabel: "Sent",
        labels: [],
        threadCount: 1,
        hasAttachment: false,
        attachments: [],
        to: recipientList,
        cc: [],
      };

      if (provider === "google") {
        if (!window.electronAPI?.sendEmail) {
          throw new Error(
            "Send email API is not available. Fully restart Electron.",
          );
        }

        await window.electronAPI.sendEmail({
          accountId,
          to: recipients,
          cc: "",
          subject: buildReplySubject(sourceMessage),
          body: optimisticReply.body,
        });
      } else {
        if (!window.electronAPI?.replyEmail) {
          throw new Error(
            "Send email API is not available. Fully restart Electron.",
          );
        }

        await window.electronAPI.replyEmail(
          accountId,
          message.messageId,
          buildInlineReplyComment({
            bodyText,
            signature: settings.signature,
          }),
        );
      }

      setEmails((prev) => [optimisticReply, ...prev]);
      toast.success("Reply sent");
      await refreshMailboxAfterReply({
        provider: resolveManualSyncProvider(provider),
        accountId,
        syncMail: window.electronAPI?.syncMail,
        refreshLocalUi: fetchLocalAndSetUI,
      });
    },
    [
      accounts,
      currentAccount,
      currentAccountId,
      fetchLocalAndSetUI,
      mailFolders,
      settings.signature,
    ],
  );

  const handleDraftMinimize = useCallback((id: string) => {
    setDrafts((prev) =>
      prev.map((draft) =>
        draft.id === id ? { ...draft, isMinimized: true } : draft,
      ),
    );
  }, []);

  const handleDraftRestore = useCallback((id: string) => {
    setDrafts((prev) =>
      prev.map((draft) =>
        draft.id === id ? { ...draft, isMinimized: false } : draft,
      ),
    );
  }, []);

  const handleDraftFullscreen = useCallback((id: string) => {
    setDrafts((prev) =>
      prev.map((draft) =>
        draft.id === id
          ? { ...draft, isFullscreen: !draft.isFullscreen }
          : draft,
      ),
    );
  }, []);

  const handleCreateLabel = useCallback(
    async (name: string) => {
      const trimmedName = name.trim();

      if (!trimmedName) {
        return false;
      }

      if (!window.electronAPI?.createLabel) {
        window.alert(
          "Create label API is not available. Fully restart Electron.",
        );
        return false;
      }

      if (
        currentAccount.provider !== "microsoft" ||
        !currentAccount.id.startsWith("ms-")
      ) {
        window.alert("Connect a Microsoft account before creating labels.");
        return false;
      }

      try {
        const created = await window.electronAPI.createLabel({
          accountId: currentAccount.id,
          name: trimmedName,
          color: "#A8C7A2",
        });

        setEmailLabels((prev) => {
          if (prev.some((label) => label.id === created.id)) {
            return prev;
          }

          return [...prev, created].sort((a, b) =>
            a.name.localeCompare(b.name),
          );
        });

        setActiveLabelId(created.id);
        setSelectedEmailId(null);

        return true;
      } catch (error) {
        console.error("Failed to create label:", error);
        window.alert(
          error instanceof Error ? error.message : "Failed to create label.",
        );
        return false;
      }
    },
    [currentAccount],
  );

  const handleCreateFolder = useCallback(
    async (name: string) => {
      const trimmedName = name.trim();

      if (!trimmedName) {
        return false;
      }

      if (!window.electronAPI?.createFolder) {
        window.alert(
          "Create folder API is not available. Fully restart Electron.",
        );
        return false;
      }

      try {
        const createdFolder = await window.electronAPI.createFolder(
          currentAccount.id,
          trimmedName,
        );

        setMailFolders((prev) => {
          const withoutDuplicate = prev.filter(
            (folder) => folder.id !== createdFolder.id,
          );

          return [...withoutDuplicate, createdFolder].sort((a, b) =>
            (a.path || a.displayName).localeCompare(b.path || b.displayName),
          );
        });

        setActiveFolder(createdFolder.id);
        setActiveLabelId(null);
        setSelectedEmailId(null);

        return true;
      } catch (error) {
        console.error("Failed to create folder:", error);
        window.alert(
          error instanceof Error ? error.message : "Failed to create folder.",
        );
        return false;
      }
    },
    [currentAccount.id],
  );

  const handleRenameFolder = useCallback(
    async (folder: MailFolder, displayName: string) => {
      const trimmedName = displayName.trim();
      if (!trimmedName) return false;

      if (!window.electronAPI?.renameFolder) {
        window.alert(
          "Rename folder API is not available. Fully restart Electron.",
        );
        return false;
      }

      try {
        const updatedFolder = await window.electronAPI.renameFolder(
          folder.accountId,
          folder.id,
          trimmedName,
        );

        setMailFolders((prev) =>
          prev.map((item) =>
            item.id === folder.id ? { ...item, ...updatedFolder } : item,
          ),
        );

        return true;
      } catch (error) {
        console.error("Failed to rename folder:", error);
        window.alert(
          error instanceof Error ? error.message : "Failed to rename folder.",
        );
        return false;
      }
    },
    [],
  );

  const handleDeleteFolder = useCallback(
    async (folder: MailFolder) => {
      if (!window.electronAPI?.deleteFolder) {
        window.alert(
          "Delete folder API is not available. Fully restart Electron.",
        );
        return false;
      }

      try {
        await window.electronAPI.deleteFolder(
          folder.accountId,
          folder.id,
        );

        // Assume the backend handles descendant deletion or we just refresh.
        // For now, simpler local UI update:
        setMailFolders((prev) =>
          prev.filter((item) => item.id !== folder.id),
        );
        setEmails((prev) =>
          prev.filter((email) => email.folder !== folder.id),
        );

        if (activeFolder === folder.id) {
          setActiveFolder(findDefaultInboxFolderId(mailFolders));
          setSelectedEmailId(null);
        }

        return true;
      } catch (error) {
        console.error("Failed to delete folder:", error);
        window.alert(
          error instanceof Error ? error.message : "Failed to delete folder.",
        );
        return false;
      }
    },
    [activeFolder, mailFolders],
  );

  const handleEmptyFolder = useCallback(
    async (folder: MailFolder) => {
      if (!window.electronAPI?.emptyFolder) {
        window.alert(
          "Empty folder API is not available. Fully restart Electron.",
        );
        return false;
      }

      try {
        await window.electronAPI.emptyFolder(
          folder.accountId,
          folder.id,
        );

        setEmails((prev) => prev.filter((email) => email.folder !== folder.id));
        setSelectedEmailIds([]);
        if (activeFolder === folder.id) {
          setSelectedEmailId(null);
        }

        return true;
      } catch (error) {
        console.error("Failed to empty folder:", error);
        window.alert(
          error instanceof Error ? error.message : "Failed to empty folder.",
        );
        return false;
      }
    },
    [activeFolder],
  );

  const handleSetFolderIcon = useCallback(
    async (folder: MailFolder, icon: string) => {
      if (!window.electronAPI?.setFolderIcon) {
        window.alert(
          "Folder icon API is not available. Fully restart Electron.",
        );
        return false;
      }

      try {
        const updatedFolder = await window.electronAPI.setFolderIcon(
          folder.accountId,
          folder.id,
          icon,
        );

        setMailFolders((prev) =>
          prev.map((item) =>
            item.id === folder.id ? { ...item, ...updatedFolder } : item,
          ),
        );

        return true;
      } catch (error) {
        console.error("Failed to set folder icon:", error);
        window.alert(
          error instanceof Error ? error.message : "Failed to set folder icon.",
        );
        return false;
      }
    },
    [],
  );

  const handleRenameLabel = useCallback(async (label: EmailLabel) => {
    if (!window.electronAPI?.renameLabel) return;
    try {
      const updated = await window.electronAPI.renameLabel({
        accountId: label.accountId,
        labelId: label.id,
        name: label.name,
      });

      if (!updated) return;

      setEmailLabels((prev) =>
        prev.map((item) => (item.id === label.id ? updated : item)),
      );
      setEmails((prev) =>
        prev.map((email) => ({
          ...email,
          labels: email.labels.map((item) =>
            item.id === label.id ? updated : item,
          ),
        })),
      );
    } catch (error) {
      console.error("Failed to rename label:", error);
    }
  }, []);

  const handleBulkDelete = useCallback(
    async (emailIds: string[]) => {
      const uniqueIds = expandSelectedIds(emailIds);
      if (uniqueIds.length === 0) return;

      for (const emailId of uniqueIds) {
        await handleDelete(emailId);
      }

      setSelectedEmailIds([]);
    },
    [expandSelectedIds, handleDelete],
  );

  const handleDeleteLabel = useCallback(
    async (label: EmailLabel) => {
      try {
        await window.electronAPI?.deleteLabel?.(label.accountId, label.id);

        setEmailLabels((prev) => prev.filter((item) => item.id !== label.id));
        setEmails((prev) =>
          prev.map((email) => ({
            ...email,
            labels: email.labels.filter((item) => item.id !== label.id),
          })),
        );

        if (activeLabelId === label.id) setActiveLabelId(null);
      } catch (error) {
        console.error("Failed to delete label:", error);
        window.alert(
          error instanceof Error ? error.message : "Failed to delete label.",
        );
      }
    },
    [activeLabelId],
  );

  const handleToggleEmailLabel = useCallback(
    async (email: EmailThread, label: EmailLabel) => {
      const hasLabel = email.labels.some((item) => item.id === label.id);

      setEmails((prev) =>
        prev.map((item) =>
          item.id === email.id
            ? {
                ...item,
                labels: hasLabel
                  ? item.labels.filter(
                      (existingLabel) => existingLabel.id !== label.id,
                    )
                  : [...item.labels, label],
              }
            : item,
        ),
      );

      try {
        if (hasLabel) {
          await window.electronAPI?.removeLabelFromEmail?.({
            accountId: currentAccountId,
            messageId: email.messageId,
            labelId: label.id,
          });
        } else {
          await window.electronAPI?.assignLabelToEmail?.({
            accountId: currentAccountId,
            messageId: email.messageId,
            labelId: label.id,
          });
        }
      } catch (error) {
        console.error("Failed to update email label:", error);
        await fetchLocalAndSetUI();
        window.alert(
          error instanceof Error
            ? error.message
            : "Failed to update email label.",
        );
      }
    },
    [currentAccountId, fetchLocalAndSetUI],
  );

  const handleBulkApplyLabel = useCallback(
    async (emailIds: string[], labelId: string) => {
      const label = emailLabels.find((item) => item.id === labelId);
      if (!label) return;

      const emailsToLabel = emails.filter((email) =>
        expandSelectedIds(emailIds).includes(email.id),
      );

      for (const email of emailsToLabel) {
        const alreadyHasLabel = email.labels.some(
          (item) => item.id === label.id,
        );

        if (alreadyHasLabel) {
          continue;
        }

        await handleToggleEmailLabel(email, label);
      }

      setSelectedEmailIds([]);
    },
    [emailLabels, emails, expandSelectedIds, handleToggleEmailLabel],
  );

  const handleArchiveThread = useCallback(
    async (messageIds: string[]) => {
      for (const messageId of messageIds) {
        await handleArchive(messageId);
      }
    },
    [handleArchive],
  );

  const handleDeleteThread = useCallback(
    async (messageIds: string[]) => {
      for (const messageId of messageIds) {
        await handleDelete(messageId);
      }
    },
    [handleDelete],
  );

  const handleSnoozeThread = useCallback(
    async (messageIds: string[], snoozedUntilOverride?: string) => {
      for (const messageId of messageIds) {
        await handleSnooze(messageId, snoozedUntilOverride);
      }
    },
    [handleSnooze],
  );

  useEffect(() => {
    if (!isCalendarOpen) return;

    if (window.electronAPI?.getMicrosoftCalendarEvents) {
      setHasLoadedCalendar(false);
      window.electronAPI
        .getMicrosoftCalendarEvents(currentAccountId)
        .then((events) => setCalendarEvents(events))
        .catch(console.error)
        .finally(() => setHasLoadedCalendar(true));
      return;
    }

    setHasLoadedCalendar(true);
  }, [isCalendarOpen, currentAccountId]);

  const handleManualRefresh = useCallback(async () => {
    try {
      if (window.electronAPI?.syncMail) {
        await window.electronAPI.syncMail(currentAccount.id);
      }
      await fetchLocalAndSetUI();
    } catch (e) {
      console.error("Manual refresh failed", e);
    }
  }, [currentAccount.id, fetchLocalAndSetUI]);

  const handleFolderSelect = useCallback((folderId: string) => {
    setActiveFolder(folderId as FolderType);
    setActiveLabelId(null);
    setSelectedEmailId(null);
    setSelectedEmailIds([]);
  }, []);

  const handleAccountSwitch = useCallback(
    (account: Account) => {
      const nextAccountInbox =
        mailFolders.find(
          (folder) =>
            folder.accountId === account.id && folder.wellKnownName === "inbox",
        )?.id || "inbox";
      const shouldFollowInbox =
        activeFolder !== "all-inboxes" &&
        (activeFolder === "inbox" || activeKnownFolder === "inbox");

      setCurrentAccountId(account.id);
      setActiveLabelId(null);
      if (shouldFollowInbox) {
        setActiveFolder(nextAccountInbox as FolderType);
      }
      setSelectedEmailId(null);
      setSelectedEmailIds([]);
    },
    [mailFolders, activeFolder, activeKnownFolder],
  );

  const handleQuickApplyLabel = useCallback(() => {
    if (!selectedEmail) return;
    if (emailLabels.length === 0) {
      toast.error("Create a label first.");
      return;
    }

    const options = emailLabels
      .map((label, index) => `${index + 1}. ${label.name}`)
      .join("\n");
    const input = window.prompt(`Apply label:\n${options}`);
    if (!input) return;

    const selectedIndex = Number.parseInt(input, 10);
    const label =
      Number.isInteger(selectedIndex) &&
      selectedIndex >= 1 &&
      selectedIndex <= emailLabels.length
        ? emailLabels[selectedIndex - 1]
        : emailLabels.find(
            (item) => item.name.toLowerCase() === input.trim().toLowerCase(),
          );

    if (!label) {
      toast.error("Label not found.");
      return;
    }

    void handleToggleEmailLabel(selectedEmail, label);
  }, [selectedEmail, emailLabels, handleToggleEmailLabel]);

  const handleQuickMove = useCallback(() => {
    if (!selectedEmail) return;
    if (mailFolders.length === 0) return;

    const options = mailFolders
      .map((folder, index) => `${index + 1}. ${folder.displayName}`)
      .join("\n");
    const input = window.prompt(`Move to folder:\n${options}`);
    if (!input) return;

    const selectedIndex = Number.parseInt(input, 10);
    const folder =
      Number.isInteger(selectedIndex) &&
      selectedIndex >= 1 &&
      selectedIndex <= mailFolders.length
        ? mailFolders[selectedIndex - 1]
        : mailFolders.find(
            (item) =>
              item.displayName.toLowerCase() === input.trim().toLowerCase(),
          );

    if (!folder) {
      toast.error("Folder not found.");
      return;
    }

    void handleEmailDropToFolder({
      emailId: selectedEmail.id,
      messageId: selectedEmail.messageId,
      sourceFolderId: selectedEmail.folderId || selectedEmail.folder,
      destinationFolderId: folder.id,
    });
  }, [selectedEmail, mailFolders, handleEmailDropToFolder]);

  useEffect(() => {
    if (!isGlobalSearchOpen) return;
    const timer = window.setTimeout(() => globalSearchRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [isGlobalSearchOpen]);

  useKeyboardShortcuts({
    isSessionLocked,
    isCommandPaletteOpen,
    isGlobalSearchOpen,
    searchQuery,
    selectedEmailId,
    folderEmails,
    emails,
    handleArchive,
    handleDelete,
    handleMarkRead,
    handleMarkUnread,
    handleQuickApplyLabel,
    handleQuickMove,
    handleCompose,
    handleReply,
    handleSelectEmail,
    handleSnooze,
    handleToggleStar,
    setIsCommandPaletteOpen,
    setIsGlobalSearchOpen,
    setGlobalSearchDraft,
    setGlobalSearchSelectedIndex,
    setIsGlobalSearchActionMenuOpen,
    setGlobalSearchActionIndex,
    setIsCalendarOpen,
  });

  const appStyle = {
    backgroundColor: "var(--bg-0)",
    color: "var(--fg-0)",
    fontFamily: "var(--font-sans)",
  } as React.CSSProperties;
  const windowDragStyle = {
    WebkitAppRegion: "drag",
  } as React.CSSProperties;
  const windowNoDragStyle = {
    WebkitAppRegion: "no-drag",
  } as React.CSSProperties;
  const handleCloseWindow = () => window.electronAPI?.closeWindow();
  const handleMinimizeWindow = () => window.electronAPI?.minimizeWindow();
  const handleMaximizeWindow = () => window.electronAPI?.maximizeWindow();

  return (
    <div
      data-theme={themeAttribute}
      className="relative grid h-full min-h-0 w-full select-none overflow-hidden bg-[var(--bg-0)] text-[var(--fg-0)]"
      style={{
        ...appStyle,
        gridTemplateRows: "var(--topbar-h) minmax(0,1fr) var(--statusbar-h)",
      }}
    >
      <AnimatePresence>
        {tutorialStep > 0 && (
          <TutorialOverlay
            step={tutorialStep}
            setStep={setTutorialStep}
            onOpenSettings={() => setIsSettingsOpen(true)}
            isSettingsOpen={isSettingsOpen}
          />
        )}
      </AnimatePresence>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentAccount={currentAccount}
        accounts={accounts}
        settings={settings}
        realStorageGB={dbStorageGB}
        onAccountChange={handleAccountChange}
        onSettingsChange={handleSettingsChange}
        onConnectMicrosoft={handleConnectMicrosoft}
        onConnectGoogle={handleConnectGoogle}
        onConnectImap={handleConnectImap}
        onDeleteAccount={handleDeleteAccount}
        isConnectingMicrosoft={isConnectingMicrosoft}
        connectMicrosoftError={connectMicrosoftError ?? mailSyncError}
        isConnectingGoogle={isConnectingGoogle}
        connectGoogleError={connectGoogleError}
        isConnectingImap={isConnectingImap}
        connectImapError={connectImapError}
        emails={emails}
      />

      <div
        className="flex min-w-0 items-center gap-4 border-b border-[var(--border-subtle)] bg-[var(--bg-1)] px-4"
        style={windowDragStyle}
      >
        <div
          className="flex shrink-0 items-center gap-2"
          style={windowNoDragStyle}
        >
          <button
            onClick={handleCloseWindow}
            className="h-3 w-3 rounded-full bg-[#ff5f57] transition-colors hover:bg-[#ff7b75]"
            title="Close"
          />
          <button
            onClick={handleMinimizeWindow}
            className="h-3 w-3 rounded-full bg-[#febc2e] transition-colors hover:bg-[#ffd062]"
            title="Minimize"
          />
          <button
            onClick={handleMaximizeWindow}
            className="h-3 w-3 rounded-full bg-[#28c840] transition-colors hover:bg-[#4ade5c]"
            title="Maximize"
          />
        </div>

        <div className="flex shrink-0 items-baseline gap-1.5">
          <span className="text-[14px] font-semibold tracking-normal text-[var(--fg-0)]">
            RYZE
          </span>
          <span className="font-mono-jetbrains text-[11px] text-[var(--fg-3)]">
            {appVersion ? `v${appVersion}` : ""}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2 font-mono-jetbrains text-[12px] text-[var(--fg-2)]">
            <span className="min-w-0 truncate">{currentAccount.email}</span>
            <span className="text-[var(--fg-3)]">/</span>
            <span className="shrink-0 font-semibold text-[var(--fg-0)]">
              {activeFolderLabel}
            </span>
          </div>
        </div>

        <div
          className="flex min-w-0 shrink-0 items-center gap-2"
          style={windowNoDragStyle}
        >
          <label className="flex h-8 w-[min(402px,34vw)] min-w-[220px] items-center gap-2 rounded-[7px] border border-[var(--border-0)] bg-[var(--bg-2)] px-3 text-[var(--fg-2)] shadow-[0_1px_0_oklch(0_0_0_/_0.24)] transition-colors focus-within:border-[var(--border-1)] focus-within:text-[var(--fg-1)]">
            <Search size={14} />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onFocus={() => {
                setGlobalSearchDraft(searchQuery);
                setGlobalSearchSelectedIndex(0);
                setIsGlobalSearchActionMenuOpen(false);
                setGlobalSearchActionIndex(0);
                setIsGlobalSearchOpen(true);
              }}
              placeholder="Search messages, addresses, attachments..."
              className="min-w-0 flex-1 bg-transparent font-mono-jetbrains text-[12px] text-[var(--fg-1)] outline-none placeholder:text-[var(--fg-3)]"
            />
            <span className="flex items-center gap-1 font-mono-jetbrains text-[10px] text-[var(--fg-3)]">
              <span className="rounded-[4px] border border-[var(--border-0)] px-1.5 py-0.5">
                Shift
              </span>
              <span>+</span>
              <span className="rounded-[4px] border border-[var(--border-0)] px-1.5 py-0.5">
                Space
              </span>
            </span>
          </label>

          <button className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[var(--fg-2)] transition-colors hover:bg-[var(--bg-2)] hover:text-[var(--fg-0)]">
            <MessageSquare size={14} />
          </button>
          <UpdaterTopBarButton />
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[var(--fg-2)] transition-colors hover:bg-[var(--bg-2)] hover:text-[var(--fg-0)]"
            title="Settings"
          >
            <Settings2 size={15} />
          </button>
        </div>
      </div>

      <div
        className="grid min-h-0 overflow-hidden"
        style={{
          gridTemplateColumns: "var(--sidebar-w) var(--list-w) minmax(0,1fr)",
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isAppLoaded ? 1 : 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="h-full min-h-0"
        >
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            activeFolder={activeFolder}
            onFolderSelect={handleFolderSelect}
            unreadCounts={unreadCounts}
            onRenameFolder={handleRenameFolder}
            onDeleteFolder={handleDeleteFolder}
            onEmptyFolder={handleEmptyFolder}
            onSetFolderIcon={handleSetFolderIcon}
            onCompose={() => handleCompose()}
            currentAccount={currentAccount}
            accounts={accounts}
            onAccountSwitch={handleAccountSwitch}
            onRefresh={handleManualRefresh}
            onOpenSettings={() => setIsSettingsOpen(true)}
            folders={mailFolders}
            labels={emailLabels}
            activeLabelId={activeLabelId}
            onLabelSelect={(labelId) => {
              setActiveLabelId(labelId);
              setSelectedEmailId(null);
              setSelectedEmailIds([]);
            }}
            onCreateLabel={handleCreateLabel}
            onCreateFolder={handleCreateFolder}
            onRenameLabel={handleRenameLabel}
            onDeleteLabel={handleDeleteLabel}
            onEmailDropToFolder={handleEmailDropToFolder}
            labelCounts={labelCounts}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isAppLoaded ? 1 : 0 }}
          transition={{ duration: 0.25, delay: 0.1, ease: "easeOut" }}
          className="h-full min-h-0"
        >
          <MessageList
            emails={folderEmails}
            threadRows={threadRows}
            folderLabel={activeFolderLabel}
            folderUnreadCount={folderUnreadCount}
            folderTotalCount={folderEmails.length}
            syncLabel={formatRelativeSync(lastSyncedAt)}
            selectedId={selectedEmailId}
            onSelect={handleSelectEmail}
            onArchive={(id) =>
              handleArchiveThread(threadRowMessageIds.get(id) || [id])
            }
            onDelete={(id) =>
              handleDeleteThread(threadRowMessageIds.get(id) || [id])
            }
            searchQuery={searchQuery}
            onClearSearch={() => setSearchQuery("")}
            density={settings.density}
            showPreviewText={settings.showPreviewText}
            showAvatars={settings.showAvatars}
            selectedEmailIds={selectedEmailIds}
            onToggleEmailSelection={handleToggleEmailSelection}
            onClearEmailSelection={handleClearEmailSelection}
            onBulkDelete={handleBulkDelete}
            onBulkMoveToFolder={handleBulkMoveToFolder}
            onBulkApplyLabel={handleBulkApplyLabel}
            folders={mailFolders}
            onSnooze={(id, snoozedUntil) =>
              handleSnoozeThread(
                threadRowMessageIds.get(id) || [id],
                snoozedUntil,
              )
            }
            labels={emailLabels}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isAppLoaded ? 1 : 0 }}
          transition={{ duration: 0.25, delay: 0.2, ease: "easeOut" }}
          className="flex h-full min-h-0 overflow-hidden"
        >
          <ReadingPane
            email={selectedEmail}
            threadMessages={selectedConversation?.messages || []}
            relatedEmails={emails}
            onReply={handleReply}
            onInlineReplySend={handleInlineReplySend}
            onReplyWithTone={handleReplyWithTone}
            onForward={handleForward}
            onArchive={handleArchive}
            onDelete={handleDelete}
            onReplyAll={handleReplyAll}
            showAvatars={settings.showAvatars}
            currentUserEmail={resolveCurrentUserEmail(
              accounts,
              currentAccount,
              selectedEmail?.accountId,
            )}
            currentUserLabel={getAccountProviderLabel(
              resolveComposerAccount(accounts, currentAccount, selectedEmail?.accountId),
            )}
            blockRemoteImages={settings.blockRemoteImages}
            confirmExternalLinks={settings.confirmExternalLinks}
            labels={emailLabels}
            onToggleStar={handleToggleStar}
            onMarkUnread={handleMarkUnread}
            onSnooze={handleSnooze}
            onDownloadAttachment={handleDownloadAttachment}
            onToggleLabel={handleToggleEmailLabel}
            isDarkMode={isAppDarkMode}
            aiSummaryRequestToken={aiSummaryRequestToken}
            isAiDrafting={isAiDrafting}
          />
        </motion.div>
      </div>
      <CalendarSidebar
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        events={calendarEvents}
        isLoading={isCalendarOpen && !hasLoadedCalendar}
        lastSyncedAt={lastSyncedAt}
        mailboxCount={emails.length}
        draftCount={drafts.length}
        privacyModeEnabled={settings.blockRemoteImages}
      />
      <ComposeDrawer
        drafts={drafts}
        onDraftUpdate={handleDraftUpdate}
        onDraftClose={handleDraftClose}
        onDraftSend={handleDraftSend}
        onDraftSchedule={handleDraftSchedule}
        onDraftMinimize={handleDraftMinimize}
        onDraftRestore={handleDraftRestore}
        onDraftFullscreen={handleDraftFullscreen}
      />
      <CommandDialog
        open={isCommandPaletteOpen}
        onOpenChange={setIsCommandPaletteOpen}
      >
        <CommandInput placeholder="Run action, jump folder, or switch account..." />
        <CommandList>
          <CommandEmpty>No matching command.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem
              onSelect={() => {
                handleCompose();
                setIsCommandPaletteOpen(false);
              }}
            >
              <Plus />
              Compose
              <CommandShortcut>C</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setIsCalendarOpen((prev) => !prev);
                setIsCommandPaletteOpen(false);
              }}
            >
              <CalendarDays />
              Toggle calendar
              <CommandShortcut>T</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setGlobalSearchDraft(searchQuery);
                setGlobalSearchSelectedIndex(0);
                setIsGlobalSearchActionMenuOpen(false);
                setGlobalSearchActionIndex(0);
                setIsGlobalSearchOpen(true);
                setIsCommandPaletteOpen(false);
              }}
            >
              <Search />
              Open global search
              <CommandShortcut>Shift+Space</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setIsSettingsOpen(true);
                setIsCommandPaletteOpen(false);
              }}
            >
              <Settings2 />
              Open settings
            </CommandItem>
            <CommandItem
              onSelect={() => {
                void handleManualRefresh();
                setIsCommandPaletteOpen(false);
              }}
            >
              <ArrowRight />
              Refresh mailbox
            </CommandItem>
            <CommandItem
              onSelect={() => {
                if (selectedEmail) {
                  setAiSummaryRequestToken((prev) => prev + 1);
                } else {
                  toast.error("Select an email first to run AI summary.");
                }
                setIsCommandPaletteOpen(false);
              }}
            >
              <Sparkles />
              Run AI summary
              <CommandShortcut>Alt+I</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                const name = window.prompt("New label name");
                if (name?.trim()) {
                  void handleCreateLabel(name.trim());
                }
                setIsCommandPaletteOpen(false);
              }}
            >
              <Tags />
              Create label
            </CommandItem>
            <CommandItem
              onSelect={() => {
                const name = window.prompt("New folder name");
                if (name?.trim()) {
                  void handleCreateFolder(name.trim());
                }
                setIsCommandPaletteOpen(false);
              }}
            >
              <Folder />
              Create folder
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Jump Account">
            {accounts.map((account) => (
              <CommandItem
                key={`account-${account.id}`}
                onSelect={() => {
                  handleAccountSwitch(account);
                  setIsCommandPaletteOpen(false);
                }}
              >
                <UserRound />
                {account.email}
                <CommandShortcut>
                  {getAccountProviderLabel(account)}
                </CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Jump Folder">
            <CommandItem
              onSelect={() => {
                handleFolderSelect("all-inboxes");
                setIsCommandPaletteOpen(false);
              }}
            >
              <Folder />
              All inboxes
            </CommandItem>
            <CommandItem
              onSelect={() => {
                handleFolderSelect("all-sent");
                setIsCommandPaletteOpen(false);
              }}
            >
              <Folder />
              All sent
            </CommandItem>
            {mailFolders.map((folder) => (
              <CommandItem
                key={`folder-${folder.id}`}
                onSelect={() => {
                  handleFolderSelect(folder.id);
                  setIsCommandPaletteOpen(false);
                }}
              >
                <Folder />
                {folder.displayName}
                <CommandShortcut>{folder.accountId}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <AnimatePresence>
        {isGlobalSearchOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeGlobalSearch}
              className="absolute inset-0 z-[70] bg-black/45 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              transition={{ duration: 0.16 }}
              className="absolute inset-0 z-[71] flex items-center justify-center p-6"
            >
              <div className="w-[min(760px,calc(100vw-48px))] rounded-[var(--radius-ryze-lg)] border border-[var(--border-1)] bg-[var(--bg-1)] p-3 shadow-[0_16px_48px_-12px_oklch(0_0_0_/_0.6)]">
                <div className="flex items-center gap-2">
                <input
                  ref={globalSearchRef}
                  type="text"
                  value={globalSearchDraft}
                  onChange={(event) => setGlobalSearchDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowDown") {
                      event.preventDefault();
                      setGlobalSearchSelectedIndex((prev) =>
                        liveSearchRows.length === 0
                          ? prev
                          : Math.min(prev + 1, liveSearchRows.length - 1),
                      );
                    } else if (event.key === "ArrowUp") {
                      event.preventDefault();
                      setGlobalSearchSelectedIndex((prev) =>
                        Math.max(prev - 1, 0),
                      );
                    } else if (event.key === "ArrowRight") {
                      if (!selectedLiveSearchRow) return;
                      event.preventDefault();
                      if (!isGlobalSearchActionMenuOpen) {
                        setIsGlobalSearchActionMenuOpen(true);
                        setGlobalSearchActionIndex(0);
                        return;
                      }

                      setGlobalSearchActionIndex((prev) =>
                        Math.min(prev + 1, 1),
                      );
                    } else if (event.key === "ArrowLeft") {
                      if (!isGlobalSearchActionMenuOpen) return;
                      event.preventDefault();
                      if (globalSearchActionIndex === 1) {
                        setGlobalSearchActionIndex(0);
                        return;
                      }

                      setIsGlobalSearchActionMenuOpen(false);
                    } else if (event.key === "Enter") {
                      event.preventDefault();
                      if (selectedLiveSearchRow) {
                        if (isGlobalSearchActionMenuOpen) {
                          runGlobalSearchAction(
                            selectedLiveSearchRow.latestMessage,
                            globalSearchActionIndex,
                          );
                          return;
                        }

                        openGlobalSearchResult(
                          selectedLiveSearchRow.latestMessage,
                        );
                        return;
                      }

                      setSearchQuery(globalSearchDraft);
                      closeGlobalSearch();
                    } else if (event.key === "Escape") {
                      closeGlobalSearch();
                    }
                  }}
                  placeholder="Search messages, addresses, attachments..."
                  className="h-10 min-w-0 flex-1 rounded-[var(--radius-ryze-md)] border border-[var(--border-0)] bg-[var(--bg-2)] px-3 font-mono-jetbrains text-[13px] text-[var(--fg-0)] outline-none placeholder:text-[var(--fg-3)] focus:border-[var(--ryze-accent)]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery(globalSearchDraft);
                    closeGlobalSearch();
                  }}
                  className="h-10 rounded-[var(--radius-ryze-md)] bg-[var(--ryze-accent)] px-4 text-[12px] font-medium text-[var(--ryze-accent-fg)] transition-colors hover:bg-[var(--ryze-accent-hover)]"
                >
                  Search
                </button>
                </div>

                <div className="mt-2 max-h-[320px] overflow-y-auto rounded-[var(--radius-ryze-md)] border border-[var(--border-subtle)] bg-[var(--bg-0)]">
                  {globalSearchDraft.trim().length === 0 ? (
                    <p className="px-3 py-3 text-[12px] text-[var(--fg-3)]">
                      Start typing to see matching emails.
                    </p>
                  ) : liveSearchRows.length === 0 ? (
                    <p className="px-3 py-3 text-[12px] text-[var(--fg-3)]">
                      No matching emails.
                    </p>
                  ) : (
                    liveSearchRows.map((row, index) => {
                      const isSelected = index === globalSearchSelectedIndex;
                      const showActions =
                        isSelected && isGlobalSearchActionMenuOpen;

                      return (
                        <div
                          key={row.threadKey}
                          className="relative border-b border-[var(--border-subtle)] last:border-b-0"
                        >
                          <button
                            type="button"
                            onMouseEnter={() =>
                              setGlobalSearchSelectedIndex(index)
                            }
                            onClick={() =>
                              openGlobalSearchResult(row.latestMessage)
                            }
                            className={cn(
                              "flex w-full items-start justify-between gap-3 px-3 py-2 text-left transition-colors",
                              isSelected
                                ? "bg-[var(--bg-2)]"
                                : "hover:bg-[var(--bg-1)]",
                            )}
                          >
                            <div className="min-w-0">
                              <p className="truncate text-[13px] text-[var(--fg-0)]">
                                {row.latestMessage.subject}
                              </p>
                              <p className="truncate text-[11px] text-[var(--fg-2)]">
                                {row.latestMessage.sender.name} · {row.latestMessage.preview}
                              </p>
                            </div>
                            <span className="shrink-0 rounded-[4px] border border-[var(--border-0)] px-1.5 py-0.5 font-mono-jetbrains text-[10px] text-[var(--fg-3)]">
                              {row.threadCount}
                            </span>
                          </button>

                          <AnimatePresence>
                            {showActions && (
                              <motion.div
                                initial={{ opacity: 0, x: 8, scale: 0.98 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 8, scale: 0.98 }}
                                transition={{ duration: 0.14 }}
                                className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 gap-1 rounded-[var(--radius-ryze-md)] border border-[var(--border-1)] bg-[var(--bg-3)] p-1 shadow-[0_16px_48px_-12px_oklch(0_0_0_/_0.6)]"
                              >
                                <button
                                  type="button"
                                  onMouseEnter={() =>
                                    setGlobalSearchActionIndex(0)
                                  }
                                  onClick={() =>
                                    runGlobalSearchAction(row.latestMessage, 0)
                                  }
                                  className={cn(
                                    "flex items-center gap-1.5 rounded-[var(--radius-ryze-sm)] px-2 py-1.5 text-[11px] transition-colors",
                                    globalSearchActionIndex === 0
                                      ? "bg-[var(--ryze-accent)] text-[var(--ryze-accent-fg)]"
                                      : "text-[var(--fg-1)] hover:bg-[var(--bg-4)]",
                                  )}
                                >
                                  <Reply size={12} />
                                  Reply
                                </button>
                                <button
                                  type="button"
                                  onMouseEnter={() =>
                                    setGlobalSearchActionIndex(1)
                                  }
                                  onClick={() =>
                                    runGlobalSearchAction(row.latestMessage, 1)
                                  }
                                  className={cn(
                                    "flex items-center gap-1.5 rounded-[var(--radius-ryze-sm)] px-2 py-1.5 text-[11px] transition-colors",
                                    globalSearchActionIndex === 1
                                      ? "bg-[var(--ryze-accent)] text-[var(--ryze-accent-fg)]"
                                      : "text-[var(--fg-1)] hover:bg-[var(--bg-4)]",
                                  )}
                                >
                                  <Forward size={12} />
                                  Forward
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })
                  )}
                </div>

                <p className="mt-2 px-1 font-mono-jetbrains text-[10.5px] text-[var(--fg-3)]">
                  Shortcut: Shift + Space. Press Enter to apply, Esc to close.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between border-t border-[var(--border-subtle)] bg-[var(--bg-1)] px-3 font-mono-jetbrains text-[11px] text-[var(--fg-2)]">
        <div className="flex min-w-0 items-center gap-3 truncate">
          <span className="text-[var(--success-token)]">{statusSummary}</span>
          <span>encrypted at rest</span>
        </div>
        <div className="flex items-center gap-3">
          <span>~/ryze/db.sqlite · {emails.length}MB</span>
          {appVersion && <span>v{appVersion}</span>}
        </div>
      </div>

      {isSessionLocked && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/45 backdrop-blur-sm">
          <div className="w-[320px] rounded-[var(--radius-ryze-lg)] border border-[var(--border-1)] bg-[var(--bg-2)] p-6 text-center shadow-[0_16px_48px_-12px_oklch(0_0_0_/_0.6)]">
            <p className="text-[20px] font-medium text-[var(--fg-0)]">
              Session locked
            </p>
            <p className="mt-2 text-[13px] text-[var(--fg-2)]">
              The inbox paused after inactivity. Resume when you are ready.
            </p>
            <button
              onClick={unlockSession}
              className="mt-5 rounded-[var(--radius-ryze-md)] bg-[var(--ryze-accent)] px-4 py-2 text-[13px] font-medium text-[var(--ryze-accent-fg)] transition-colors hover:bg-[var(--ryze-accent-hover)]"
            >
              Resume session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TutorialOverlay({
  step,
  setStep,
  onOpenSettings,
  isSettingsOpen,
}: {
  step: number;
  setStep: (step: number) => void;
  onOpenSettings: () => void;
  isSettingsOpen: boolean;
}) {
  if (isSettingsOpen && step === 2) return null;

  const complete = () => {
    window.localStorage.setItem("ryze_tutorial_done", "true");
    setStep(0);
  };

  let content = null;
  let positionClass = "items-center justify-center";
  let alignClass = "text-center items-center";

  switch (step) {
    case 1:
      content = (
        <>
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-[var(--radius-ryze-lg)] bg-[var(--ryze-accent-soft)] text-[var(--ryze-accent)]">
            <Sparkles size={28} strokeWidth={1.5} />
          </div>
          <h2 className="mb-3 text-[20px] font-medium text-[var(--fg-0)]">
            Welcome to RYZE
          </h2>
          <p className="mb-8 text-[13px] leading-relaxed text-[var(--fg-2)]">
            Your inbox is yours. Connect an account to start reading mail locally.
          </p>
          <button
            onClick={() => setStep(2)}
            className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-ryze-md)] bg-[var(--ryze-accent)] px-4 py-2.5 text-[13px] font-medium text-[var(--ryze-accent-fg)] transition-colors hover:bg-[var(--ryze-accent-hover)]"
          >
            Continue <ArrowRight size={16} />
          </button>
        </>
      );
      break;
    case 2:
      positionClass = "items-end justify-start pb-20 pl-4";
      alignClass = "text-left items-start";
      content = (
        <>
          <h2 className="mb-3 text-[18px] font-medium text-[var(--fg-0)]">
            Add your account
          </h2>
          <p className="mb-6 text-[13px] leading-relaxed text-[var(--fg-2)]">
            Open settings and connect your Microsoft or Google account.
          </p>
          <button
            onClick={onOpenSettings}
            className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-ryze-md)] bg-[var(--ryze-accent)] px-4 py-2.5 text-[13px] font-medium text-[var(--ryze-accent-fg)] transition-colors hover:bg-[var(--ryze-accent-hover)]"
          >
            Open settings
          </button>
        </>
      );
      break;
    case 3:
      positionClass = "items-center justify-start pl-[280px]";
      alignClass = "text-left items-start";
      content = (
        <>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-ryze-lg)] bg-[var(--ryze-accent-soft)] text-[var(--ryze-accent)]">
            <CheckCircle2 size={24} strokeWidth={1.5} />
          </div>
          <h2 className="mb-3 text-[18px] font-medium text-[var(--fg-0)]">
            Account connected
          </h2>
          <p className="mb-6 text-[13px] leading-relaxed text-[var(--fg-2)]">
            You can right-click folders and labels to rename, empty, or delete
            them.
          </p>
          <button
            onClick={() => setStep(4)}
            className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-ryze-md)] bg-[var(--ryze-accent)] px-4 py-2.5 text-[13px] font-medium text-[var(--ryze-accent-fg)] transition-colors hover:bg-[var(--ryze-accent-hover)]"
          >
            Good to know
          </button>
        </>
      );
      break;
    case 4:
      content = (
        <>
          <h2 className="mb-3 text-[18px] font-medium text-[var(--fg-0)]">
            Learn the basics
          </h2>
          <p className="mb-8 text-[13px] leading-relaxed text-[var(--fg-2)]">
            Review compose and folder controls, or enter your inbox now.
          </p>
          <div className="flex w-full gap-3">
            <button
              onClick={() => setStep(5)}
              className="flex-1 rounded-[var(--radius-ryze-md)] border border-[var(--border-0)] px-4 py-2.5 text-[13px] font-medium text-[var(--fg-1)] transition-colors hover:bg-[var(--bg-3)] hover:text-[var(--fg-0)]"
            >
              Show me
            </button>
            <button
              onClick={complete}
              className="flex-1 rounded-[var(--radius-ryze-md)] bg-[var(--ryze-accent)] px-4 py-2.5 text-[13px] font-medium text-[var(--ryze-accent-fg)] transition-colors hover:bg-[var(--ryze-accent-hover)]"
            >
              Enter inbox
            </button>
          </div>
        </>
      );
      break;
    case 5:
      positionClass = "items-start justify-start pl-[280px] pt-32";
      alignClass = "text-left items-start";
      content = (
        <>
          <h2 className="mb-3 text-[18px] font-medium text-[var(--fg-0)]">
            Compose and folders
          </h2>
          <p className="mb-6 text-[13px] leading-relaxed text-[var(--fg-2)]">
            Press <strong>C</strong> to compose. <br />
            <br />
            Use the folder and label section controls to organize mail.
          </p>
          <button
            onClick={() => setStep(6)}
            className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-ryze-md)] bg-[var(--ryze-accent)] px-4 py-2.5 text-[13px] font-medium text-[var(--ryze-accent-fg)] transition-colors hover:bg-[var(--ryze-accent-hover)]"
          >
            Next
          </button>
        </>
      );
      break;
    case 6:
      content = (
        <>
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-[var(--radius-ryze-lg)] bg-[var(--ryze-accent-soft)] text-[var(--ryze-accent)]">
            <Sparkles size={28} strokeWidth={1.5} />
          </div>
          <h2 className="mb-3 text-[20px] font-medium text-[var(--fg-0)]">
            RYZE Mail is ready
          </h2>
          <p className="mb-8 text-[13px] leading-relaxed text-[var(--fg-2)]">
            Your inbox is ready.
          </p>
          <button
            onClick={complete}
            className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-ryze-md)] bg-[var(--ryze-accent)] px-4 py-2.5 text-[13px] font-medium text-[var(--ryze-accent-fg)] transition-colors hover:bg-[var(--ryze-accent-hover)]"
          >
            Enter inbox
          </button>
        </>
      );
      break;
  }

  return (
    <div
      className={cn(
        "pointer-events-auto fixed inset-0 z-[9999] flex bg-black/40 backdrop-blur-sm transition-all duration-300",
        positionClass,
      )}
    >
      <motion.div
        key={step}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        className={cn(
          "relative flex w-full max-w-[360px] flex-col overflow-hidden rounded-[var(--radius-ryze-lg)] border border-[var(--border-1)] bg-[var(--bg-2)] p-8 shadow-[0_16px_48px_-12px_oklch(0_0_0_/_0.6)]",
          alignClass,
        )}
      >
        {content}
      </motion.div>
    </div>
  );
}
