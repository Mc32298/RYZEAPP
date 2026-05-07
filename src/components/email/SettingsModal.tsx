import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Bell,
  Palette,
  Shield,
  HardDrive,
  LayoutGrid,
  KeyRound,
  Info,
  Moon,
  SunMedium,
  Mail,
  Plus,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { Account } from "@/types/email";
import {
  type EmailSettings,
  type ThemeMode,
  type DensityMode,
  type NotificationCadence,
  type SyncWindow,
  type AutoDeleteWindow,
  type GeminiModel,
  type AiProvider,
} from "./emailPreferences";
import { cn } from "@/lib/utils";
import type { EmailThread } from "@/types/email";
import { derivePrivacyReport } from "./privacyReport";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAccount: Account;
  accounts: Account[];
  settings: EmailSettings;
  onAccountChange: (updates: Partial<Account>) => void;
  onSettingsChange: (updates: Partial<EmailSettings>) => void;
  onConnectMicrosoft: () => void;
  onConnectGoogle: () => void;
  onConnectImap: (payload: ConnectImapAccountPayload) => void;
  onDeleteAccount: (accountId: string) => void;
  realStorageGB: number;
  isConnectingMicrosoft: boolean;
  connectMicrosoftError: string | null;
  isConnectingGoogle: boolean;
  connectGoogleError: string | null;
  isConnectingImap: boolean;
  connectImapError: string | null;
  emails: EmailThread[];
}

interface ConnectImapAccountPayload {
  email: string;
  displayName: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
}

type TabType =
  | "appearance"
  | "layout"
  | "notifications"
  | "accounts"
  | "passwords"
  | "privacy"
  | "storage"
  | "ai"
  | "about";

interface TabConfig {
  id: TabType;
  label: string;
  section: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

interface SectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onToggle: (value: boolean) => void;
}

interface SelectFieldProps<T extends string> {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}

type AiProviderKeyStatus = {
  provider: "gemini";
  configured: boolean;
  source: "local" | "environment" | null;
  updatedAt: string | null;
  encryptionAvailable: boolean;
};

type AccountHealthSnapshot = {
  accountId: string;
  provider: "microsoft" | "google" | "imap";
  syncStatus: "ok" | "warning" | "idle";
  tokenStatus: "ok" | "expiring" | "expired" | "n/a";
  tokenExpiresAt: string | null;
  lastSyncAt: string | null;
  folderErrors: number;
  storageBytes: number;
};

const tabs: TabConfig[] = [
  {
    id: "appearance",
    label: "Appearance",
    section: "General",
    title: "Appearance",
    description: "Theme mode and color treatment for the app shell.",
    icon: Palette,
  },
  {
    id: "layout",
    label: "Layout",
    section: "General",
    title: "Layout",
    description: "Message density, previews, avatars, and default signature.",
    icon: LayoutGrid,
  },
  {
    id: "notifications",
    label: "Notifications",
    section: "General",
    title: "Notifications",
    description: "Desktop alerts, sounds, and digest timing.",
    icon: Bell,
  },
  {
    id: "accounts",
    label: "Connected accounts",
    section: "Accounts",
    title: "Connected accounts",
    description: "Connected providers, mailbox identity, and sync health.",
    icon: User,
  },
  {
    id: "passwords",
    label: "App passwords",
    section: "Accounts",
    title: "App passwords",
    description:
      "Provider auth notes and fallback guidance for app-password flows.",
    icon: KeyRound,
  },
  {
    id: "privacy",
    label: "Privacy",
    section: "Privacy & Data",
    title: "Privacy",
    description: "Remote content, link checks, and session protection.",
    icon: Shield,
  },
  {
    id: "storage",
    label: "Local data",
    section: "Privacy & Data",
    title: "Local data",
    description: "Local cache size, offline downloads, and retention windows.",
    icon: HardDrive,
  },
  {
    id: "ai",
    label: "AI & keys",
    section: "Privacy & Data",
    title: "AI & keys",
    description: "How summaries work and where thread contents are processed.",
    icon: Mail,
  },
  {
    id: "about",
    label: "About RYZE",
    section: "About",
    title: "About RYZE",
    description: "Version, local database, and client posture.",
    icon: Info,
  },
];

const themeOptions: Array<{
  id: ThemeMode;
  label: string;
  icon: LucideIcon;
  swatch: string;
}> = [
  {
    id: "darkGold",
    label: "Dark Gold",
    icon: Moon,
    swatch:
      "linear-gradient(135deg, oklch(0.2 0.03 50), oklch(0.34 0.07 80) 60%, oklch(0.5 0.1 88))",
  },
  {
    id: "darkBlue",
    label: "Soft Onyx",
    icon: Moon,
    swatch:
      "linear-gradient(135deg, oklch(0.18 0.018 126), oklch(0.3 0.018 126) 62%, oklch(0.78 0.07 138))",
  },
  {
    id: "lightGold",
    label: "Light Gold",
    icon: SunMedium,
    swatch:
      "linear-gradient(135deg, oklch(0.97 0.02 95), oklch(0.92 0.03 88) 58%, oklch(0.84 0.07 85))",
  },
  {
    id: "appleDark",
    label: "Apple Dark",
    icon: Moon,
    swatch:
      "linear-gradient(135deg, oklch(0.18 0.004 260), oklch(0.295 0.006 260) 62%, oklch(0.68 0.17 250))",
  },
  {
    id: "appleLight",
    label: "Apple Light",
    icon: SunMedium,
    swatch:
      "linear-gradient(135deg, oklch(0.99 0.002 260), oklch(0.92 0.005 260) 62%, oklch(0.58 0.19 250))",
  },
];

const profileColorOptions = [
  "#A8C7A2",
  "#C7AE79",
  "#8B6F5A",
  "#7E9181",
  "#B57865",
];
const densityOptions: DensityMode[] = ["comfortable", "compact"];
const cadenceOptions: NotificationCadence[] = ["instant", "hourly", "daily"];
const syncWindowOptions: SyncWindow[] = ["30 days", "90 days", "1 year"];
const autoDeleteOptions: AutoDeleteWindow[] = ["30 days", "90 days", "never"];
const aiProviderOptions: AiProvider[] = ["gemini", "ollama"];
const geminiModelOptions: GeminiModel[] = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.0-flash",
];

function SettingsSection({ title, description, children }: SectionProps) {
  return (
    <section className="border-t border-[var(--border-subtle)] py-5 first:border-t-0 first:pt-0 last:pb-0">
      <div className="mb-4">
        <h4 className="text-[20px] font-semibold text-[var(--fg-0)]">
          {title}
        </h4>
        <p className="mt-1 text-[12px] leading-relaxed text-[var(--fg-2)]">
          {description}
        </p>
      </div>
      <div>{children}</div>
    </section>
  );
}

function ToggleRow({ label, description, checked, onToggle }: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[6px] border border-[var(--border-0)] bg-[var(--bg-2)] px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm  text-[var(--fg-1)]">{label}</p>
        <p className="mt-1 text-xs  text-[var(--fg-2)]">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onToggle(!checked)}
        className={cn(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-colors",
          checked
            ? "border-[var(--ryze-accent)] bg-[var(--ryze-accent)]"
            : "border-[var(--border-0)] bg-[var(--bg-3)]",
        )}
      >
        <span
          className={cn(
            "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-[var(--bg-0)] transition-colors",
            checked ? "translate-x-5" : "translate-x-0",
          )}
        />
      </button>
    </div>
  );
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: SelectFieldProps<T>) {
  return (
    <label className="block space-y-2">
      <span className="text-xs  uppercase tracking-wider text-[var(--fg-2)]">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="w-full rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] bg-[var(--bg-2)] px-3 py-2 text-sm text-[var(--fg-1)] outline-none transition-colors focus:border-[var(--ryze-accent)] "
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SettingsModal({
  isOpen,
  onClose,
  currentAccount,
  accounts,
  settings,
  realStorageGB,
  onAccountChange,
  onSettingsChange,
  onConnectMicrosoft,
  onConnectGoogle,
  onConnectImap,
  onDeleteAccount,
  isConnectingMicrosoft,
  connectMicrosoftError,
  isConnectingGoogle,
  connectGoogleError,
  isConnectingImap,
  connectImapError,
  emails,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = React.useState<TabType>("accounts");
  const [isAddEmailOpen, setIsAddEmailOpen] = React.useState(false);
  const [hasStartedMicrosoftConnect, setHasStartedMicrosoftConnect] =
    React.useState(false);
  const [hasStartedGoogleConnect, setHasStartedGoogleConnect] =
    React.useState(false);
  const [hasStartedImapConnect, setHasStartedImapConnect] =
    React.useState(false);
  const [isImapFormOpen, setIsImapFormOpen] = React.useState(false);
  const [imapDraft, setImapDraft] = React.useState<ConnectImapAccountPayload>({
    email: "",
    displayName: "",
    host: "",
    port: 993,
    secure: true,
    username: "",
    password: "",
  });
  const [geminiApiKeyDraft, setGeminiApiKeyDraft] = React.useState("");
  const [geminiKeyStatus, setGeminiKeyStatus] =
    React.useState<AiProviderKeyStatus | null>(null);
  const [isSavingGeminiKey, setIsSavingGeminiKey] = React.useState(false);
  const [geminiKeyMessage, setGeminiKeyMessage] = React.useState<string | null>(
    null,
  );
  const [accountHealth, setAccountHealth] = React.useState<
    Record<string, AccountHealthSnapshot>
  >({});
  const [backupMessage, setBackupMessage] = React.useState<string | null>(null);
  const [isBackupBusy, setIsBackupBusy] = React.useState(false);
  const trustedSenderEmails = React.useMemo(() => {
    if (typeof window === "undefined") return [] as string[];
    try {
      const raw = window.localStorage.getItem("email-client-trusted-image-senders");
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === "string")
        : [];
    } catch {
      return [];
    }
  }, [isOpen, activeTab]);

  const privacyReport = React.useMemo(
    () =>
      derivePrivacyReport({
        emails,
        blockRemoteImages: settings.blockRemoteImages,
        trustedSenderEmails,
      }),
    [emails, settings.blockRemoteImages, trustedSenderEmails],
  );
  const activeTabConfig = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const tabGroups = React.useMemo(() => {
    const groups = new Map<string, TabConfig[]>();
    for (const tab of tabs) {
      groups.set(tab.section, [...(groups.get(tab.section) || []), tab]);
    }
    return Array.from(groups.entries());
  }, []);

  React.useEffect(() => {
    if (!isOpen) {
      setIsAddEmailOpen(false);
      setHasStartedMicrosoftConnect(false);
      setHasStartedGoogleConnect(false);
      setHasStartedImapConnect(false);
      setIsImapFormOpen(false);
      setGeminiApiKeyDraft("");
      setGeminiKeyMessage(null);
    }
  }, [isOpen]);

  const refreshGeminiKeyStatus = React.useCallback(async () => {
    if (!window.electronAPI?.getAiProviderKeyStatus) return;

    try {
      const status = await window.electronAPI.getAiProviderKeyStatus("gemini");
      setGeminiKeyStatus(status);
    } catch (error) {
      setGeminiKeyMessage(
        error instanceof Error
          ? error.message
          : "Could not load Gemini key status.",
      );
    }
  }, []);

  React.useEffect(() => {
    if (!isOpen || activeTab !== "ai") return;
    void refreshGeminiKeyStatus();
  }, [activeTab, isOpen, refreshGeminiKeyStatus]);

  React.useEffect(() => {
    if (!isOpen || activeTab !== "accounts") return;
    if (!window.electronAPI?.getAccountHealth) return;

    window.electronAPI
      .getAccountHealth()
      .then((items) => {
        const next = Object.fromEntries(
          items.map((item) => [item.accountId, item]),
        );
        setAccountHealth(next);
      })
      .catch(() => {
        setAccountHealth({});
      });
  }, [activeTab, isOpen]);

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes < 1024) return `${bytes || 0} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTimestamp = (value: string | null) => {
    if (!value) return "never";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "unknown";
    return date.toLocaleString();
  };

  const handleSaveGeminiKey = async () => {
    const trimmedKey = geminiApiKeyDraft.trim();
    if (!trimmedKey) {
      setGeminiKeyMessage("Paste a Gemini API key before saving.");
      return;
    }

    if (!window.electronAPI?.setAiProviderKey) {
      setGeminiKeyMessage("Secure AI key storage is not available.");
      return;
    }

    setIsSavingGeminiKey(true);
    setGeminiKeyMessage(null);

    try {
      const status = await window.electronAPI.setAiProviderKey(
        "gemini",
        trimmedKey,
      );
      setGeminiKeyStatus(status);
      setGeminiApiKeyDraft("");
      setGeminiKeyMessage("Gemini key saved locally.");
    } catch (error) {
      setGeminiKeyMessage(
        error instanceof Error ? error.message : "Could not save Gemini key.",
      );
    } finally {
      setIsSavingGeminiKey(false);
    }
  };

  const handleDeleteGeminiKey = async () => {
    if (!window.electronAPI?.deleteAiProviderKey) return;

    setIsSavingGeminiKey(true);
    setGeminiKeyMessage(null);

    try {
      const status = await window.electronAPI.deleteAiProviderKey("gemini");
      setGeminiKeyStatus(status);
      setGeminiApiKeyDraft("");
      setGeminiKeyMessage("Local Gemini key removed.");
    } catch (error) {
      setGeminiKeyMessage(
        error instanceof Error ? error.message : "Could not remove Gemini key.",
      );
    } finally {
      setIsSavingGeminiKey(false);
    }
  };

  React.useEffect(() => {
    if (!isAddEmailOpen) {
      setHasStartedMicrosoftConnect(false);
      setHasStartedGoogleConnect(false);
      setHasStartedImapConnect(false);
      setIsImapFormOpen(false);
      return;
    }

    if (hasStartedMicrosoftConnect && !isConnectingMicrosoft && !connectMicrosoftError) {
      setIsAddEmailOpen(false);
      setHasStartedMicrosoftConnect(false);
    }

    if (hasStartedGoogleConnect && !isConnectingGoogle && !connectGoogleError) {
      setIsAddEmailOpen(false);
      setHasStartedGoogleConnect(false);
    }

    if (hasStartedImapConnect && !isConnectingImap && !connectImapError) {
      setIsAddEmailOpen(false);
      setIsImapFormOpen(false);
      setHasStartedImapConnect(false);
    }
  }, [
    isAddEmailOpen,
    hasStartedMicrosoftConnect,
    isConnectingMicrosoft,
    connectMicrosoftError,
    hasStartedGoogleConnect,
    isConnectingGoogle,
    connectGoogleError,
    isImapFormOpen,
    hasStartedImapConnect,
    isConnectingImap,
    connectImapError,
  ]);

  const renderContent = () => {
    switch (activeTab) {
      case "accounts":
        return (
          <div className="space-y-6">
            <SettingsSection
              title="Connected Accounts"
              description="Each account is connected directly. RYZE keeps local mail in the app database and does not proxy your inbox."
            >
              <div className="space-y-3">
                {accounts.length === 0 ? (
                  <div className="rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] bg-[var(--bg-1)] px-3 py-3 text-sm  text-[var(--fg-2)]">
                    No email account connected yet.
                  </div>
                ) : (
                  accounts.map((account) => (
                    <div
                      key={account.id}
                      className="rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] bg-[var(--bg-1)] px-3 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] text-xs font-semibold"
                          style={{
                            backgroundColor: `${account.color}33`,
                            color: account.color,
                          }}
                        >
                          {account.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[var(--fg-0)]">
                            {account.email}
                          </p>
                          <p className="truncate text-xs font-mono-jetbrains text-[var(--fg-3)]">
                            {account.provider === "microsoft"
                              ? "outlook.office365.com  ·  OAuth2"
                              : account.provider === "google"
                              ? "gmail.googleapis.com  ·  OAuth2"
                              : `${account.externalId || "imap mailbox"}  ·  TLS`}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "rounded-[4px] border px-2 py-1 font-mono-jetbrains text-[10px]",
                            account.provider === "microsoft" ||
                              account.provider === "google"
                              ? "border-[var(--success-token)] text-[var(--success-token)]"
                              : "border-[var(--warning-token)] text-[var(--warning-token)]",
                          )}
                        >
                          {account.provider === "microsoft" ||
                          account.provider === "google"
                            ? "ok"
                            : "setup"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const confirmed = window.confirm(
                              `Remove ${account.email} from this app?\n\nThis will delete the local cached emails and disconnect the account. It will not delete anything from Microsoft Outlook.`,
                            );

                            if (!confirmed) return;

                            onDeleteAccount(account.id);
                          }}
                          className="rounded-[var(--radius-ryze-sm)] border border-[var(--border-subtle)] p-1.5 text-[var(--fg-3)] transition-colors hover:border-[var(--danger-token)] hover:text-[var(--danger-token)]"
                          title="Remove account"
                        >
                          <Trash2 size={13} strokeWidth={1.6} />
                        </button>
                      </div>
                      {accountHealth[account.id] && (
                        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[var(--border-subtle)] pt-3">
                          <p className="text-[11px] text-[var(--fg-2)]">
                            Sync: {accountHealth[account.id].syncStatus}
                          </p>
                          <p className="text-[11px] text-[var(--fg-2)]">
                            Token: {accountHealth[account.id].tokenStatus}
                          </p>
                          <p className="text-[11px] text-[var(--fg-2)]">
                            Last sync: {formatTimestamp(accountHealth[account.id].lastSyncAt)}
                          </p>
                          <p className="text-[11px] text-[var(--fg-2)]">
                            Expires: {formatTimestamp(accountHealth[account.id].tokenExpiresAt)}
                          </p>
                          <p className="text-[11px] text-[var(--fg-2)]">
                            Folder errors: {accountHealth[account.id].folderErrors}
                          </p>
                          <p className="text-[11px] text-[var(--fg-2)]">
                            Storage: {formatBytes(accountHealth[account.id].storageBytes)}
                          </p>
                        </div>
                      )}
                      {!accountHealth[account.id] && (
                        <p className="mt-3 border-t border-[var(--border-subtle)] pt-3 text-[11px] text-[var(--fg-3)]">
                          Health snapshot unavailable.
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsAddEmailOpen(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] bg-[var(--bg-1)] px-3 py-2 text-sm text-[var(--fg-1)] transition-colors hover:bg-[var(--bg-2)] hover:text-[var(--fg-0)]"
              >
                <Plus size={14} />
                Add account
              </button>
            </SettingsSection>

            <SettingsSection
              title="Profile"
              description="These details show up in account menus, sent mail, and replies."
            >
              <div className="grid grid-cols-2 gap-4">
                <label className="block space-y-2">
                  <span className="text-xs  uppercase tracking-wider text-[var(--fg-2)]">
                    Display Name
                  </span>
                  <input
                    type="text"
                    value={currentAccount.name}
                    onChange={(event) =>
                      onAccountChange({ name: event.target.value })
                    }
                    className="w-full rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] bg-[var(--bg-2)] px-3 py-2 text-sm text-[var(--fg-1)] outline-none transition-colors focus:border-[var(--ryze-accent)] "
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-xs  uppercase tracking-wider text-[var(--fg-2)]">
                    Email Address
                  </span>
                  <input
                    type="email"
                    value={currentAccount.email}
                    onChange={(event) =>
                      onAccountChange({ email: event.target.value })
                    }
                    className="w-full rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] bg-[var(--bg-2)] px-3 py-2 text-sm text-[var(--fg-1)] outline-none transition-colors focus:border-[var(--ryze-accent)] "
                  />
                </label>
              </div>

              <div className="mt-4 space-y-2">
                <span className="text-xs  uppercase tracking-wider text-[var(--fg-2)]">
                  Profile Color
                </span>
                <div className="flex gap-2">
                  {profileColorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => onAccountChange({ color })}
                      className={cn(
                        "h-8 w-8 rounded-[var(--radius-ryze-sm)] border-2 transition-colors",
                        currentAccount.color === color
                          ? "border-[var(--fg-0)]"
                          : "border-transparent",
                      )}
                      style={{ backgroundColor: color }}
                      aria-label={`Use profile color ${color}`}
                    />
                  ))}
                </div>
              </div>
            </SettingsSection>
          </div>
        );

      case "passwords":
        return (
          <div className="space-y-6">
            <SettingsSection
              title="App-password status"
              description="Use this when a provider requires an app-specific password instead of standard OAuth."
            >
              <div className="space-y-3">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] bg-[var(--bg-1)] px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-[var(--fg-0)]">
                          {account.email}
                        </p>
                        <p className="mt-1 font-mono-jetbrains text-[11px] text-[var(--fg-3)]">
                          {account.provider === "microsoft" || account.provider === "google"
                            ? "OAuth2 active"
                            : "App-password or IMAP credential flow"}
                        </p>
                      </div>
                      <span className="rounded-[4px] border border-[var(--border-0)] px-2 py-1 font-mono-jetbrains text-[10px] text-[var(--fg-2)]">
                        local only
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </SettingsSection>
            <SettingsSection
              title="Guidance"
              description="RYZE does not store provider credentials on its own servers."
            >
              <div className="space-y-2 text-[13px] leading-relaxed text-[var(--fg-2)]">
                <p>Use Microsoft sign-in when available.</p>
                <p>
                  For providers that require app passwords, generate them in the
                  provider security settings and reconnect the account.
                </p>
                <p>
                  Credential material remains in your OS keychain or native auth
                  store.
                </p>
              </div>
            </SettingsSection>
          </div>
        );

      case "appearance":
        return (
          <div className="space-y-6">
            <SettingsSection
              title="Theme"
              description="Choose between warm premium dark gold, warm dark blue, and warm premium light gold."
            >
              <div className="grid grid-cols-3 gap-3">
                {themeOptions.map((option) => {
                  const Icon = option.icon;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => onSettingsChange({ themeMode: option.id })}
                      className={cn(
                        "rounded-[var(--radius-ryze-sm)] border p-3 text-left transition-colors",
                        settings.themeMode === option.id
                          ? "border-[var(--ryze-accent)] bg-[var(--bg-3)]"
                          : "border-[var(--border-0)] bg-[var(--bg-1)] hover:border-[var(--fg-3)]",
                      )}
                    >
                      <div
                        className="mb-3 h-12 rounded-[var(--radius-ryze-sm)] border border-white/10"
                        style={{ background: option.swatch }}
                      />
                      <div className="flex items-center gap-2">
                        <Icon size={14} className="text-[var(--ryze-accent)]" />
                        <span className="text-sm  text-[var(--fg-1)]">
                          {option.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </SettingsSection>
          </div>
        );

      case "layout":
        return (
          <div className="space-y-6">
            <SettingsSection
              title="Reading Layout"
              description="Choose how much information each thread exposes at a glance."
            >
              <div className="space-y-4">
                <div>
                  <span className="text-xs  uppercase tracking-wider text-[var(--fg-2)]">
                    Density
                  </span>
                  <div className="mt-2 inline-flex rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] bg-[var(--bg-1)] p-1">
                    {densityOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => onSettingsChange({ density: option })}
                        className={cn(
                          "rounded-[var(--radius-ryze-sm)] px-3 py-1.5 text-sm  capitalize transition-colors",
                          settings.density === option
                            ? "bg-[var(--bg-3)] text-[var(--ryze-accent)]"
                            : "text-[var(--fg-2)] hover:text-[var(--fg-1)]",
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <ToggleRow
                    label="Show preview text"
                    description="Reveal the snippet under each email subject in the list."
                    checked={settings.showPreviewText}
                    onToggle={(value) =>
                      onSettingsChange({ showPreviewText: value })
                    }
                  />
                  <ToggleRow
                    label="Show sender avatars"
                    description="Keep sender circles visible in the list and reading pane."
                    checked={settings.showAvatars}
                    onToggle={(value) =>
                      onSettingsChange({ showAvatars: value })
                    }
                  />
                </div>
              </div>
            </SettingsSection>

            <SettingsSection
              title="Signature"
              description="Applied automatically to new drafts and replies."
            >
              <label className="block space-y-2">
                <span className="text-xs uppercase tracking-wider text-[var(--fg-2)]">
                  Default signature
                </span>
                <textarea
                  rows={4}
                  value={settings.signature}
                  onChange={(event) =>
                    onSettingsChange({ signature: event.target.value })
                  }
                  className="w-full resize-none rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] bg-[var(--bg-2)] px-3 py-2 text-sm text-[var(--fg-1)] outline-none transition-colors focus:border-[var(--ryze-accent)]"
                />
              </label>
            </SettingsSection>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <SettingsSection
              title="Alerts"
              description="These are saved and used when new mail arrives."
            >
              <div className="space-y-3">
                <ToggleRow
                  label="Desktop alerts"
                  description="Allow browser-level notifications for incoming priority mail."
                  checked={settings.desktopAlerts}
                  onToggle={(value) =>
                    onSettingsChange({ desktopAlerts: value })
                  }
                />
                <ToggleRow
                  label="Sound alerts"
                  description="Play a short tone alongside desktop notifications."
                  checked={settings.soundAlerts}
                  onToggle={(value) => onSettingsChange({ soundAlerts: value })}
                />
                <ToggleRow
                  label="Mentions only"
                  description="Limit interruptions to direct mentions and high-priority threads."
                  checked={settings.notifyOnMentions}
                  onToggle={(value) =>
                    onSettingsChange({ notifyOnMentions: value })
                  }
                />
              </div>
            </SettingsSection>

            <SettingsSection
              title="Digest"
              description="Controls how frequently low-priority summaries are bundled."
            >
              <SelectField
                label="Delivery cadence"
                value={settings.digestCadence}
                options={cadenceOptions}
                onChange={(value) => onSettingsChange({ digestCadence: value })}
              />
            </SettingsSection>
          </div>
        );

      case "privacy":
        return (
          <div className="space-y-6">
            <SettingsSection
              title="Privacy Report"
              description="Local summary of tracker blocking, suspicious links, trusted senders, and sanitized content signals."
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] bg-[var(--bg-1)] px-3 py-2 text-[12px] text-[var(--fg-2)]">
                  Blocked trackers: {privacyReport.blockedTrackers}
                </div>
                <div className="rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] bg-[var(--bg-1)] px-3 py-2 text-[12px] text-[var(--fg-2)]">
                  Remote images blocked: {privacyReport.remoteImagesBlocked}
                </div>
                <div className="rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] bg-[var(--bg-1)] px-3 py-2 text-[12px] text-[var(--fg-2)]">
                  Suspicious links: {privacyReport.suspiciousLinks}
                </div>
                <div className="rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] bg-[var(--bg-1)] px-3 py-2 text-[12px] text-[var(--fg-2)]">
                  Trusted senders: {privacyReport.trustedSenders}
                </div>
                <div className="rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] bg-[var(--bg-1)] px-3 py-2 text-[12px] text-[var(--fg-2)]">
                  Unsafe content removed: {privacyReport.unsafeContentRemoved}
                </div>
              </div>
            </SettingsSection>

            <SettingsSection
              title="Protection"
              description="These controls apply directly while reading mail."
            >
              <div className="space-y-3">
                <ToggleRow
                  label="Block remote images"
                  description="Prevent third-party images from loading inside message bodies."
                  checked={settings.blockRemoteImages}
                  onToggle={(value) =>
                    onSettingsChange({ blockRemoteImages: value })
                  }
                />
                <ToggleRow
                  label="Confirm external links"
                  description="Ask before opening links that leave the inbox."
                  checked={settings.confirmExternalLinks}
                  onToggle={(value) =>
                    onSettingsChange({ confirmExternalLinks: value })
                  }
                />
                <ToggleRow
                  label="Lock after inactivity"
                  description="Locks the inbox after idle time or when the window loses focus."
                  checked={settings.sessionLock}
                  onToggle={(value) => onSettingsChange({ sessionLock: value })}
                />
              </div>
            </SettingsSection>

            <SettingsSection
              title="Retention"
              description="Used to determine how aggressively trash can be cleaned up."
            >
              <SelectField
                label="Auto-delete trash"
                value={settings.autoDeleteTrash}
                options={autoDeleteOptions}
                onChange={(value) =>
                  onSettingsChange({ autoDeleteTrash: value })
                }
              />
            </SettingsSection>
          </div>
        );

      case "storage": {
        // Calculate percentage based on a 15GB arbitrary max, or change as needed
        const storagePercentage = Math.min(
          Math.round((realStorageGB / 15) * 100),
          100,
        );

        return (
          <div className="space-y-6">
            <SettingsSection
              title="Mailbox Usage"
              description="Real size of your local SQLite Database."
            >
              <div className="space-y-4">
                <div className="rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] bg-[var(--bg-1)] p-4">
                  <div className="flex items-center justify-between text-sm  text-[var(--fg-1)]">
                    <span>Local Database Cache</span>
                    <span className="text-[var(--ryze-accent)]">
                      {realStorageGB.toFixed(3)} GB / 15 GB
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--bg-3)]">
                    <div
                      className="h-full rounded-full bg-[var(--ryze-accent)]"
                      style={{ width: `${storagePercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </SettingsSection>

            <SettingsSection
              title="Offline Rules"
              description="These controls drive how much mail the client keeps locally."
            >
              <div className="space-y-4">
                <SelectField
                  label="Sync window"
                  value={settings.syncWindow}
                  options={syncWindowOptions}
                  onChange={(value) => onSettingsChange({ syncWindow: value })}
                />
                <div className="space-y-3">
                  <ToggleRow
                    label="Keep attachments offline"
                    description="Increase local usage to keep recent files available without a connection."
                    checked={settings.keepAttachmentsOffline}
                    onToggle={(value) =>
                      onSettingsChange({ keepAttachmentsOffline: value })
                    }
                  />
                  <ToggleRow
                    label="Smart cleanup"
                    description="Reduce cached usage by trimming duplicate local data."
                    checked={settings.smartCleanup}
                    onToggle={(value) =>
                      onSettingsChange({ smartCleanup: value })
                    }
                  />
                </div>
              </div>
            </SettingsSection>

            <SettingsSection
              title="Encrypted Backup"
              description="Export or import encrypted local backups for metadata, settings, labels, and local mail cache."
            >
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={isBackupBusy}
                    onClick={async () => {
                      if (!window.electronAPI?.exportEncryptedBackup) return;
                      setIsBackupBusy(true);
                      setBackupMessage(null);
                      try {
                        const result = await window.electronAPI.exportEncryptedBackup();
                        if (result.canceled) return;
                        setBackupMessage(
                          result.success
                            ? `Backup exported${result.filePath ? `: ${result.filePath}` : "."}`
                            : "Backup export failed.",
                        );
                      } catch (error) {
                        setBackupMessage(
                          error instanceof Error ? error.message : "Backup export failed.",
                        );
                      } finally {
                        setIsBackupBusy(false);
                      }
                    }}
                    className="rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] bg-[var(--bg-1)] px-3 py-2 text-sm text-[var(--fg-1)] transition-colors hover:bg-[var(--bg-2)] hover:text-[var(--fg-0)] disabled:opacity-60"
                  >
                    Export backup
                  </button>
                  <button
                    type="button"
                    disabled={isBackupBusy}
                    onClick={async () => {
                      if (!window.electronAPI?.importEncryptedBackup) return;
                      setIsBackupBusy(true);
                      setBackupMessage(null);
                      try {
                        const result = await window.electronAPI.importEncryptedBackup();
                        if (result.canceled) return;
                        setBackupMessage(
                          result.success
                            ? `Backup imported${result.filePath ? `: ${result.filePath}` : "."}`
                            : "Backup import failed.",
                        );
                      } catch (error) {
                        setBackupMessage(
                          error instanceof Error ? error.message : "Backup import failed.",
                        );
                      } finally {
                        setIsBackupBusy(false);
                      }
                    }}
                    className="rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] bg-[var(--bg-1)] px-3 py-2 text-sm text-[var(--fg-1)] transition-colors hover:bg-[var(--bg-2)] hover:text-[var(--fg-0)] disabled:opacity-60"
                  >
                    Import backup
                  </button>
                </div>
                <p className="text-[12px] text-[var(--fg-3)]">
                  Import replaces current local cached folders, labels, messages,
                  and sync state.
                </p>
                {backupMessage && (
                  <p className="text-[12px] text-[var(--fg-2)]">{backupMessage}</p>
                )}
              </div>
            </SettingsSection>
          </div>
        );
      }

      case "ai":
        return (
          <div className="space-y-6">
            <SettingsSection
              title="AI providers"
              description="Connect local provider keys for optional AI features."
            >
              <div className="space-y-3">
                <div className="rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] bg-[var(--bg-1)] px-4 py-3">
                  <SelectField
                    label="Active provider"
                    value={settings.aiProvider}
                    options={aiProviderOptions}
                    onChange={(value) => onSettingsChange({ aiProvider: value })}
                  />
                </div>

                <div className="rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] bg-[var(--bg-1)] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-[var(--fg-0)]">
                        Gemini
                      </p>
                      <p className="mt-1 text-[12px] leading-relaxed text-[var(--fg-2)]">
                        Used for summaries when you trigger AI on a message.
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-[4px] border px-2 py-1 font-mono-jetbrains text-[10px]",
                        geminiKeyStatus?.configured
                          ? "border-[var(--success-token)] text-[var(--success-token)]"
                          : "border-[var(--border-0)] text-[var(--fg-3)]",
                      )}
                    >
                      {geminiKeyStatus?.configured ? "configured" : "not set"}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                    <input
                      type="password"
                      value={geminiApiKeyDraft}
                      onChange={(event) =>
                        setGeminiApiKeyDraft(event.target.value)
                      }
                      autoComplete="off"
                      spellCheck={false}
                      placeholder={
                        geminiKeyStatus?.configured
                          ? "Paste a new Gemini API key to replace it"
                          : "Paste Gemini API key"
                      }
                      className="min-w-0 rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] bg-[var(--bg-2)] px-3 py-2 font-mono-jetbrains text-sm text-[var(--fg-1)] outline-none transition-colors placeholder:text-[var(--fg-3)] focus:border-[var(--ryze-accent)]"
                    />
                    <button
                      type="button"
                      onClick={handleSaveGeminiKey}
                      disabled={isSavingGeminiKey}
                      className={cn(
                        "rounded-[var(--radius-ryze-sm)] bg-[var(--ryze-accent)] px-3 py-2 text-sm font-medium text-[var(--ryze-accent-fg)] transition-colors hover:bg-[var(--ryze-accent-hover)]",
                        isSavingGeminiKey && "cursor-not-allowed opacity-60",
                      )}
                    >
                      {geminiKeyStatus?.configured ? "Replace" : "Save"}
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="min-w-0 text-[12px] leading-relaxed text-[var(--fg-2)]">
                      {geminiKeyStatus?.source === "local"
                        ? "Stored encrypted on this device. The saved key cannot be viewed here."
                        : geminiKeyStatus?.source === "environment"
                          ? "Using GEMINI_API_KEY from the local environment until a key is saved here."
                          : geminiKeyStatus?.encryptionAvailable === false
                            ? "Encrypted key storage is not available on this device."
                            : "The key is encrypted locally and hidden after saving."}
                    </p>
                    {geminiKeyStatus?.source === "local" && (
                      <button
                        type="button"
                        onClick={handleDeleteGeminiKey}
                        disabled={isSavingGeminiKey}
                        className="shrink-0 rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] px-3 py-1.5 text-[12px] text-[var(--fg-2)] transition-colors hover:border-[var(--danger-token)] hover:text-[var(--danger-token)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {geminiKeyMessage && (
                    <p className="mt-3 text-[12px] text-[var(--fg-2)]">
                      {geminiKeyMessage}
                    </p>
                  )}
                </div>

                <div className="rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] bg-[var(--bg-1)] px-4 py-3">
                  <div className="mb-3">
                    <p className="text-sm font-medium text-[var(--fg-0)]">
                      Gemini model
                    </p>
                    <p className="mt-1 text-[12px] leading-relaxed text-[var(--fg-2)]">
                      Choose which Gemini model RYZE uses for AI summaries.
                    </p>
                  </div>

                  <SelectField
                    label="Model"
                    value={settings.geminiModel}
                    options={geminiModelOptions}
                    onChange={(value) =>
                      onSettingsChange({ geminiModel: value })
                    }
                  />
                </div>

                <div className="rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] bg-[var(--bg-1)] px-4 py-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-[var(--fg-0)]">
                        Ollama
                      </p>
                      <p className="mt-1 text-[12px] leading-relaxed text-[var(--fg-2)]">
                        Run summaries through a local Ollama model.
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-[4px] border px-2 py-1 font-mono-jetbrains text-[10px]",
                        settings.aiProvider === "ollama"
                          ? "border-[var(--success-token)] text-[var(--success-token)]"
                          : "border-[var(--border-0)] text-[var(--fg-3)]",
                      )}
                    >
                      {settings.aiProvider === "ollama" ? "active" : "local"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="block space-y-2">
                      <span className="text-xs uppercase tracking-wider text-[var(--fg-2)]">
                        Server URL
                      </span>
                      <input
                        type="url"
                        value={settings.ollamaBaseUrl}
                        onChange={(event) =>
                          onSettingsChange({
                            ollamaBaseUrl: event.target.value,
                          })
                        }
                        placeholder="http://127.0.0.1:11434"
                        className="w-full rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] bg-[var(--bg-2)] px-3 py-2 font-mono-jetbrains text-sm text-[var(--fg-1)] outline-none transition-colors placeholder:text-[var(--fg-3)] focus:border-[var(--ryze-accent)]"
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-xs uppercase tracking-wider text-[var(--fg-2)]">
                        Model
                      </span>
                      <input
                        type="text"
                        value={settings.ollamaModel}
                        onChange={(event) =>
                          onSettingsChange({
                            ollamaModel: event.target.value,
                          })
                        }
                        placeholder="llama3.2"
                        className="w-full rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] bg-[var(--bg-2)] px-3 py-2 font-mono-jetbrains text-sm text-[var(--fg-1)] outline-none transition-colors placeholder:text-[var(--fg-3)] focus:border-[var(--ryze-accent)]"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </SettingsSection>
          </div>
        );

      case "about":
        return (
          <div className="space-y-6">
            <SettingsSection
              title="Client status"
              description="Operational details for the local mail client."
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] bg-[var(--bg-1)] px-4 py-3">
                  <span className="text-sm text-[var(--fg-1)]">Version</span>
                  <span className="font-mono-jetbrains text-[12px] text-[var(--fg-2)]">
                    v0.4.2
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] bg-[var(--bg-1)] px-4 py-3">
                  <span className="text-sm text-[var(--fg-1)]">
                    Accounts connected
                  </span>
                  <span className="font-mono-jetbrains text-[12px] text-[var(--fg-2)]">
                    {accounts.length}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] bg-[var(--bg-1)] px-4 py-3">
                  <span className="text-sm text-[var(--fg-1)]">
                    Storage path
                  </span>
                  <span className="font-mono-jetbrains text-[12px] text-[var(--fg-2)]">
                    ~/ryze/db.sqlite
                  </span>
                </div>
              </div>
            </SettingsSection>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              x: "-50%",
              y: "calc(-50% + 20px)",
            }}
            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
            exit={{
              opacity: 0,
              scale: 0.95,
              x: "-50%",
              y: "calc(-50% + 20px)",
            }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-1/2 z-[51] flex h-[min(760px,calc(100vh-48px))] w-[min(1080px,calc(100vw-48px))] overflow-hidden rounded-[20px] border border-[var(--border-1)] bg-[var(--bg-1)] shadow-[0_16px_48px_-12px_oklch(0_0_0_/_0.6)]"
          >
            <div className="flex w-[240px] shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--bg-0)_68%,black)]">
              <div className="border-b border-[var(--border-subtle)] px-5 py-4">
                <h2 className="text-[18px] font-semibold tracking-normal text-[var(--fg-0)]">
                  Settings
                </h2>
              </div>
              <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-3">
                {tabGroups.map(([section, sectionTabs]) => (
                  <div key={section}>
                    <div className="px-2.5 pb-2 font-mono-jetbrains text-[10px] uppercase tracking-[0.08em] text-[var(--fg-3)]">
                      {section}
                    </div>
                    <div className="space-y-0.5">
                      {sectionTabs.map((tab) => {
                        const Icon = tab.icon;

                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-[6px] border-l-2 px-3 py-2 text-[13px] transition-colors",
                              activeTab === tab.id
                                ? "border-[var(--ryze-accent)] bg-[var(--bg-3)] font-medium text-[var(--fg-0)]"
                                : "border-transparent text-[var(--fg-2)] hover:bg-[var(--bg-2)] hover:text-[var(--fg-0)]",
                            )}
                          >
                            <Icon size={15} strokeWidth={1.5} />
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex flex-1 flex-col bg-[var(--bg-1)]">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-[var(--radius-ryze-sm)] p-1.5 text-[var(--fg-3)] transition-colors hover:bg-[var(--bg-3)] hover:text-[var(--danger-token)]"
              >
                <X size={16} strokeWidth={1.5} />
              </button>

              <div className="flex-1 overflow-y-auto px-7 py-6 scrollbar-thin">
                <div className="mb-5 pr-10">
                  <h3 className="text-[24px] font-semibold text-[var(--fg-0)]">
                    {activeTabConfig.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-[var(--fg-2)]">
                    {activeTabConfig.description}
                  </p>
                </div>

                {renderContent()}
              </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {isAddEmailOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsAddEmailOpen(false)}
                  className="fixed inset-0 z-[60] bg-black/50"
                />
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.98,
                    x: "-50%",
                    y: "calc(-50% + 12px)",
                  }}
                  animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                  exit={{
                    opacity: 0,
                    scale: 0.98,
                    x: "-50%",
                    y: "calc(-50% + 12px)",
                  }}
                  transition={{ duration: 0.16 }}
                  className="fixed left-1/2 top-1/2 z-[61] w-[420px] rounded-[var(--radius-ryze-lg)] border border-[var(--border-1)] bg-[var(--bg-2)] p-5 shadow-[0_16px_48px_-12px_oklch(0_0_0_/_0.6)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-medium text-xl text-[var(--fg-0)]">
                        Add Email
                      </h4>
                      <p className="mt-1 text-sm  text-[var(--fg-2)]">
                        Connect Outlook, Gmail, or a private IMAP mailbox.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddEmailOpen(false)}
                      className="rounded-[var(--radius-ryze-sm)] p-1.5 text-[var(--fg-3)] transition-colors hover:bg-[var(--bg-3)]"
                    >
                      <X size={15} strokeWidth={1.8} />
                    </button>
                  </div>

                  <div className="mt-5 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setHasStartedMicrosoftConnect(true);
                        onConnectMicrosoft();
                      }}
                      disabled={isConnectingMicrosoft || isConnectingGoogle || isConnectingImap}
                      className={cn(
                        "flex w-full items-center justify-center gap-2 rounded-[var(--radius-ryze-sm)] border px-3 py-2.5 text-sm  transition-colors",
                        isConnectingMicrosoft || isConnectingGoogle || isConnectingImap
                          ? "cursor-not-allowed border-[var(--border-subtle)] bg-[var(--bg-1)] text-[var(--fg-3)]"
                          : "border-[var(--border-0)] bg-[var(--bg-0)] text-[var(--fg-1)] hover:border-[var(--ryze-accent)]",
                      )}
                    >
                      <Mail size={14} />
                      {isConnectingMicrosoft ? "Connecting..." : "Sign in with Microsoft"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setHasStartedGoogleConnect(true);
                        onConnectGoogle();
                      }}
                      disabled={isConnectingGoogle || isConnectingMicrosoft || isConnectingImap}
                      className={cn(
                        "flex w-full items-center justify-center gap-2 rounded-[var(--radius-ryze-sm)] border px-3 py-2.5 text-sm  transition-colors",
                        isConnectingGoogle || isConnectingMicrosoft || isConnectingImap
                          ? "cursor-not-allowed border-[var(--border-subtle)] bg-[var(--bg-1)] text-[var(--fg-3)]"
                          : "border-[var(--border-0)] bg-[var(--bg-0)] text-[var(--fg-1)] hover:border-[var(--ryze-accent)]",
                      )}
                    >
                      <Mail size={14} />
                      {isConnectingGoogle ? "Connecting..." : "Sign in with Google"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsImapFormOpen((value) => !value)}
                      disabled={isConnectingGoogle || isConnectingMicrosoft || isConnectingImap}
                      className={cn(
                        "flex w-full items-center justify-center gap-2 rounded-[var(--radius-ryze-sm)] border px-3 py-2.5 text-sm transition-colors",
                        isConnectingGoogle || isConnectingMicrosoft || isConnectingImap
                          ? "cursor-not-allowed border-[var(--border-subtle)] bg-[var(--bg-1)] text-[var(--fg-3)]"
                          : "border-[var(--border-0)] bg-[var(--bg-0)] text-[var(--fg-1)] hover:border-[var(--ryze-accent)]",
                      )}
                    >
                      <Mail size={14} />
                      Connect with IMAP
                    </button>
                  </div>

                  {isImapFormOpen && (
                    <div className="mt-4 space-y-3 rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] bg-[var(--bg-1)] p-3">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="email"
                          value={imapDraft.email}
                          onChange={(event) =>
                            setImapDraft((prev) => ({
                              ...prev,
                              email: event.target.value,
                              username: prev.username || event.target.value,
                            }))
                          }
                          placeholder="Email"
                          className="rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] bg-[var(--bg-2)] px-3 py-2 text-sm text-[var(--fg-1)] outline-none focus:border-[var(--ryze-accent)]"
                        />
                        <input
                          type="text"
                          value={imapDraft.displayName}
                          onChange={(event) =>
                            setImapDraft((prev) => ({
                              ...prev,
                              displayName: event.target.value,
                            }))
                          }
                          placeholder="Display name"
                          className="rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] bg-[var(--bg-2)] px-3 py-2 text-sm text-[var(--fg-1)] outline-none focus:border-[var(--ryze-accent)]"
                        />
                      </div>
                      <div className="grid grid-cols-[minmax(0,1fr)_80px] gap-2">
                        <input
                          type="text"
                          value={imapDraft.host}
                          onChange={(event) =>
                            setImapDraft((prev) => ({
                              ...prev,
                              host: event.target.value,
                            }))
                          }
                          placeholder="imap.example.com"
                          className="rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] bg-[var(--bg-2)] px-3 py-2 text-sm text-[var(--fg-1)] outline-none focus:border-[var(--ryze-accent)]"
                        />
                        <input
                          type="number"
                          value={imapDraft.port}
                          onChange={(event) =>
                            setImapDraft((prev) => ({
                              ...prev,
                              port: Number(event.target.value),
                            }))
                          }
                          className="rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] bg-[var(--bg-2)] px-3 py-2 text-sm text-[var(--fg-1)] outline-none focus:border-[var(--ryze-accent)]"
                        />
                      </div>
                      <input
                        type="text"
                        value={imapDraft.username}
                        onChange={(event) =>
                          setImapDraft((prev) => ({
                            ...prev,
                            username: event.target.value,
                          }))
                        }
                        placeholder="Username"
                        className="w-full rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] bg-[var(--bg-2)] px-3 py-2 text-sm text-[var(--fg-1)] outline-none focus:border-[var(--ryze-accent)]"
                      />
                      <input
                        type="password"
                        value={imapDraft.password}
                        onChange={(event) =>
                          setImapDraft((prev) => ({
                            ...prev,
                            password: event.target.value,
                          }))
                        }
                        placeholder="App password"
                        className="w-full rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] bg-[var(--bg-2)] px-3 py-2 text-sm text-[var(--fg-1)] outline-none focus:border-[var(--ryze-accent)]"
                      />
                      <label className="flex items-center gap-2 text-xs text-[var(--fg-2)]">
                        <input
                          type="checkbox"
                          checked={imapDraft.secure}
                          onChange={(event) =>
                            setImapDraft((prev) => ({
                              ...prev,
                              secure: event.target.checked,
                              port: event.target.checked ? 993 : 143,
                            }))
                          }
                        />
                        Use TLS
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setHasStartedImapConnect(true);
                          onConnectImap(imapDraft);
                        }}
                        disabled={isConnectingImap}
                        className="w-full rounded-[var(--radius-ryze-sm)] bg-[var(--ryze-accent)] px-3 py-2 text-sm font-medium text-[var(--ryze-accent-fg)] transition-colors hover:bg-[var(--ryze-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isConnectingImap ? "Saving..." : "Save IMAP account"}
                      </button>
                      <p className="text-[11px] leading-relaxed text-[var(--fg-3)]">
                        Passwords are encrypted locally with the OS keychain.
                        Live IMAP sync is the next setup step.
                      </p>
                    </div>
                  )}

                  {connectMicrosoftError && (
                    <p className="mt-3 text-xs  text-[var(--danger-token)]">
                      {connectMicrosoftError}
                    </p>
                  )}
                  {connectGoogleError && (
                    <p className="mt-3 text-xs  text-[var(--danger-token)]">
                      {connectGoogleError}
                    </p>
                  )}
                  {connectImapError && (
                    <p className="mt-3 text-xs text-[var(--danger-token)]">
                      {connectImapError}
                    </p>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
