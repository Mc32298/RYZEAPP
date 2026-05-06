import { useState, useEffect } from "react";
import { isInboxFolder } from "./folderHelpers";
import {
  buildFolderDropPayload,
  hasDraggedEmailData,
  type FolderDropPayload,
} from "./sidebarDragDrop";
import { motion, AnimatePresence } from "framer-motion";
import {
  Inbox,
  Bell,
  Clock3,
  Timer,
  FileEdit,
  Send,
  Archive,
  Trash2,
  Folder,
  Settings,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MailFolder, Account, EmailLabel } from "@/types/email";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeFolder: string;
  onFolderSelect: (folderId: string) => void;
  unreadCounts: Record<string, number>;
  folders: MailFolder[];
  accounts: Account[];
  labels: EmailLabel[];
  activeLabelId: string | null;
  onLabelSelect: (labelId: string) => void;
  onCompose: () => void;
  onRefresh: () => void;
  onOpenSettings: () => void;
  onRenameFolder: (folder: MailFolder, displayName: string) => void;
  onDeleteFolder: (folder: MailFolder) => void;
  onEmptyFolder: (folder: MailFolder) => void;
  onSetFolderIcon: (folder: MailFolder, icon: string) => void;
  onCreateLabel: (name: string) => void;
  onCreateFolder: (name: string) => void;
  onRenameLabel: (label: EmailLabel) => void;
  onDeleteLabel: (label: EmailLabel) => void;
  onEmailDropToFolder: (data: FolderDropPayload) => void | Promise<boolean>;
  labelCounts: Record<string, number>;
  currentAccount: Account;
  onAccountSwitch?: (account: Account) => void;
}

const KNOWN_FOLDERS = [
  { key: "inbox", icon: Inbox, label: "Inbox" },
  { key: "drafts", icon: FileEdit, label: "Drafts" },
  { key: "sentitems", icon: Send, label: "Sent" },
  { key: "archive", icon: Archive, label: "Archive" },
  { key: "deleteditems", icon: Trash2, label: "Trash" },
];

const SNOOZE_VIEWS = [
  { key: "snoozed", icon: Bell, label: "Snoozed" },
  { key: "snoozed-due-today", icon: Clock3, label: "Due Today" },
  { key: "snoozed-waiting", icon: Timer, label: "Waiting" },
];

type KnownFolderConfig = (typeof KNOWN_FOLDERS)[number];
type SidebarSystemFolder = KnownFolderConfig & {
  folder: MailFolder;
  hasChildren: boolean;
};

export function getSidebarFolderSections(
  folders: MailFolder[],
  accountId: string,
) {
  const currentAccountFolders = folders.filter(
    (folder) => folder.accountId === accountId,
  );
  const systemFolders = KNOWN_FOLDERS.map((known) => {
    const folder = currentAccountFolders.find(
      (candidate) => candidate.wellKnownName === known.key,
    );
    if (!folder) return null;

    return {
      ...known,
      folder,
      hasChildren: currentAccountFolders.some(
        (candidate) => candidate.parentFolderId === folder.id,
      ),
    };
  }).filter(Boolean) as SidebarSystemFolder[];

  const customRoots = currentAccountFolders.filter((folder) => {
    if (folder.wellKnownName) return false;
    if (!folder.parentFolderId) return true;
    return !currentAccountFolders.some((parent) => parent.id === folder.parentFolderId);
  });

  return {
    currentAccountFolders,
    systemFolders,
    customRoots,
  };
}

/** Recursive component to render folders and all their sub-folders */
const FolderItem = ({
  folder,
  allFolders,
  depth,
  activeFolder,
  activeLabelId,
  unreadCounts,
  onFolderClick,
  onRename,
  onEmpty,
  onDelete,
  openPrompt,
  openConfirm,
  onEmailDropToFolder,
  icon: Icon = Folder,
}: any) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isActive = activeFolder === folder.id && !activeLabelId;
  const [isDragOver, setIsDragOver] = useState(false);
  const unread = unreadCounts[folder.id] || 0;
  const children = allFolders.filter(
    (f: MailFolder) => f.parentFolderId === folder.id,
  );

  return (
    <div className="space-y-0.5 mt-0.5">
      <ContextMenu>
        <ContextMenuTrigger className="block w-full">
          <button
            onClick={() => {
              onFolderClick(folder.id);
              if (children.length > 0 && !isExpanded) setIsExpanded(true);
            }}
            onDragOver={(event) => {
              if (!hasDraggedEmailData(event.dataTransfer.types)) return;
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
              if (!isDragOver) setIsDragOver(true);
            }}
            onDragEnter={(event) => {
              if (!hasDraggedEmailData(event.dataTransfer.types)) return;
              event.preventDefault();
              if (!isDragOver) setIsDragOver(true);
            }}
            onDragLeave={() => {
              if (isDragOver) setIsDragOver(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragOver(false);

              const dropPayload = buildFolderDropPayload(
                event.dataTransfer.getData.bind(event.dataTransfer),
                folder.id,
              );
              if (!dropPayload) return;

              void onEmailDropToFolder(dropPayload);
              if (children.length > 0 && !isExpanded) setIsExpanded(true);
            }}
            className={cn(
              "flex w-full items-center justify-between rounded-[6px] border-l-2 py-1.5 pr-2.5 text-[13px] transition-colors",
              isDragOver
                ? "border-[var(--ryze-accent)] bg-[var(--ryze-accent-soft)] text-[var(--fg-0)]"
                : isActive
                ? "border-[var(--ryze-accent)] bg-[var(--bg-3)] font-medium text-[var(--fg-0)]"
                : "border-transparent text-[var(--fg-1)] hover:bg-[var(--bg-2)] hover:text-[var(--fg-0)]",
            )}
            style={{ paddingLeft: `${8 + depth * 12}px` }}
          >
            <div className="flex items-center gap-1.5 truncate">
              {children.length > 0 ? (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--radius-ryze-sm)] text-[var(--fg-3)] transition-colors hover:bg-[var(--bg-3)] hover:text-[var(--fg-0)]"
                >
                  {isExpanded ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </div>
              ) : (
                <div className="w-5 shrink-0" />
              )}
              <Icon
                size={14}
                className={cn(
                  "shrink-0",
                  (isActive || isDragOver) && "text-[var(--ryze-accent)]",
                )}
              />
              <span className="truncate">{folder.displayName}</span>
            </div>
            {unread > 0 && (
              <span
                className={cn(
                  "ml-2 shrink-0 font-mono-jetbrains text-[10.5px] font-medium",
                  isActive
                    ? "text-[var(--fg-1)]"
                    : "text-[var(--fg-2)]",
                )}
              >
                {unread}
              </span>
            )}
          </button>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {/* Replaced blocked native prompts with Custom React Modals */}
          {!folder.wellKnownName && (
            <ContextMenuItem
              onSelect={() => {
                openPrompt(
                  "Rename Folder",
                  folder.displayName,
                  (newName: string) => {
                    if (newName) onRename(folder, newName);
                  },
                );
              }}
            >
              Rename Folder
            </ContextMenuItem>
          )}
          <ContextMenuItem
            onSelect={() => {
              openConfirm(
                "Empty Folder",
                `Are you sure you want to empty "${folder.displayName}"?`,
                true,
                () => {
                  onEmpty(folder);
                },
              );
            }}
          >
            Empty Folder
          </ContextMenuItem>
          {!folder.wellKnownName && (
            <>
              <ContextMenuSeparator />
              <ContextMenuItem
                onSelect={() => {
                  openConfirm(
                    "Delete Folder",
                    `Are you sure you want to completely delete "${folder.displayName}"?`,
                    true,
                    () => {
                      onDelete(folder);
                    },
                  );
                }}
                                className="text-[var(--danger-token)] focus:text-[var(--danger-token)]"
              >
                Delete Folder
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>

      <AnimatePresence>
        {isExpanded && children.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-0.5"
          >
            {children.map((child: MailFolder) => (
                <FolderItem
                  key={child.id}
                  folder={child}
                allFolders={allFolders}
                depth={depth + 1}
                activeFolder={activeFolder}
                activeLabelId={activeLabelId}
                unreadCounts={unreadCounts}
                onFolderClick={onFolderClick}
                onRename={onRename}
                onEmpty={onEmpty}
                  onDelete={onDelete}
                  openPrompt={openPrompt}
                  openConfirm={openConfirm}
                  onEmailDropToFolder={onEmailDropToFolder}
                  icon={Folder}
                />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function Sidebar({
  isCollapsed,
  activeFolder,
  onFolderSelect,
  unreadCounts,
  folders,
  accounts,
  labels,
  activeLabelId,
  onLabelSelect,
  onCompose,
  onRefresh,
  onOpenSettings,
  onRenameFolder,
  onEmptyFolder,
  onDeleteFolder,
  onCreateFolder,
  onCreateLabel,
  onRenameLabel,
  onDeleteLabel,
  onEmailDropToFolder,
  labelCounts,
  currentAccount,
  onAccountSwitch,
}: SidebarProps) {
  const [expandedAccounts, setExpandedAccounts] = useState<
    Record<string, boolean>
  >({});
  const [pendingCreate, setPendingCreate] = useState<{
    type: "folder" | "label";
    accountId: string;
    name: string;
  } | null>(null);

  // --- CUSTOM INLINE DIALOG STATE ---
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    type: "prompt" | "confirm";
    title: string;
    message?: string;
    value?: string;
    onConfirm: (val?: string) => void;
    danger?: boolean;
  }>({ isOpen: false, type: "prompt", title: "", onConfirm: () => {} });

  const openPrompt = (
    title: string,
    value: string,
    onConfirm: (val: string) => void,
  ) => {
    setDialog({ isOpen: true, type: "prompt", title, value, onConfirm });
  };

  const openConfirm = (
    title: string,
    message: string,
    danger: boolean,
    onConfirm: () => void,
  ) => {
    setDialog({
      isOpen: true,
      type: "confirm",
      title,
      message,
      danger,
      onConfirm,
    });
  };

  const toggleAccount = (accountId: string) => {
    setExpandedAccounts((prev) => ({ ...prev, [accountId]: !prev[accountId] }));
  };

  const handleFolderClick = (account: Account, folderId: string) => {
    if (onAccountSwitch) onAccountSwitch(account);
    onFolderSelect(folderId);
    onLabelSelect("");
  };

  const handleLabelClick = (account: Account, labelId: string) => {
    if (onAccountSwitch) onAccountSwitch(account);
    onFolderSelect("");
    onLabelSelect(labelId);
  };

  useEffect(() => {
    if (pendingCreate && pendingCreate.accountId === currentAccount.id) {
      if (pendingCreate.type === "folder") {
        onCreateFolder(pendingCreate.name);
      } else {
        onCreateLabel(pendingCreate.name);
      }
      setPendingCreate(null);
    }
  }, [currentAccount.id, pendingCreate, onCreateFolder, onCreateLabel]);

  // Uses custom openPrompt instead of blocked window.prompt
  const triggerCreate = (type: "folder" | "label", account: Account) => {
    openPrompt(`New ${type}`, "", (name) => {
      if (!name) return;
      if (currentAccount.id !== account.id) {
        if (onAccountSwitch) onAccountSwitch(account);
        setPendingCreate({ type, accountId: account.id, name });
      } else {
        if (type === "folder") onCreateFolder(name);
        else onCreateLabel(name);
      }
    });
  };

  const allInboxesUnread = folders
    .filter(isInboxFolder)
    .reduce((sum, folder) => sum + (unreadCounts[folder.id] || 0), 0);

  const currentAccountFolders = folders.filter(
    (folder) => folder.accountId === currentAccount.id,
  );
  const { systemFolders, customRoots } = getSidebarFolderSections(
    folders,
    currentAccount.id,
  );

  const currentAccountLabels = labels.filter(
    (label) => label.accountId === currentAccount.id,
  );

  if (isCollapsed) return null;

  return (
    <>
      <div className="relative flex h-full min-h-0 w-[var(--sidebar-w)] flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-1)] px-2 py-2 text-[var(--fg-1)]">
        <div className="pb-3">
          <button
            onClick={onCompose}
            className="flex h-9 w-full items-center justify-between rounded-[var(--radius-ryze-md)] bg-[var(--ryze-accent)] px-3 text-[13px] font-medium text-[var(--ryze-accent-fg)] transition-colors hover:bg-[var(--ryze-accent-hover)]"
          >
            <span className="flex items-center gap-2">
              <FileEdit size={16} />
              Compose
            </span>
            <span className="rounded-[4px] bg-black/10 px-1.5 py-px font-mono-jetbrains text-[10px]">
              C
            </span>
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-1 scrollbar-thin">
          <div className="space-y-0.5">
            <button
              onClick={() => {
                onFolderSelect("all-inboxes");
                onLabelSelect("");
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-[6px] border-l-2 px-2.5 py-1.5 text-[13px] transition-colors",
                activeFolder === "all-inboxes" && !activeLabelId
                  ? "border-[var(--ryze-accent)] bg-[var(--bg-3)] font-medium text-[var(--fg-0)]"
                  : "border-transparent text-[var(--fg-1)] hover:bg-[var(--bg-2)] hover:text-[var(--fg-0)]",
              )}
            >
              <div className="flex items-center gap-3">
                <Inbox
                  size={15}
                  className={
                    activeFolder === "all-inboxes" && !activeLabelId
                      ? "text-[var(--ryze-accent)]"
                      : ""
                  }
                />
                All Inboxes
              </div>
              {allInboxesUnread > 0 && (
                <span className="font-mono-jetbrains text-[10.5px] font-medium text-[var(--fg-1)]">
                  {allInboxesUnread}
                </span>
              )}
            </button>

            {systemFolders.map(({ folder, icon: Icon, label, hasChildren }) => {
              const isActive = activeFolder === folder.id && !activeLabelId;
              if (hasChildren) {
                return (
                  <FolderItem
                    key={folder.id}
                    folder={folder}
                    allFolders={currentAccountFolders}
                    depth={0}
                    activeFolder={activeFolder}
                    activeLabelId={activeLabelId}
                    unreadCounts={unreadCounts}
                    onFolderClick={(fid: string) =>
                      handleFolderClick(currentAccount, fid)
                    }
                    onRename={onRenameFolder}
                    onEmpty={onEmptyFolder}
                    onDelete={onDeleteFolder}
                    openPrompt={openPrompt}
                    openConfirm={openConfirm}
                    onEmailDropToFolder={onEmailDropToFolder}
                    icon={Icon}
                  />
                );
              }

              return (
                <button
                  key={folder.id}
                  onClick={() => handleFolderClick(currentAccount, folder.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-[6px] border-l-2 px-2.5 py-1.5 text-[13px] transition-colors",
                    isActive
                      ? "border-[var(--ryze-accent)] bg-[var(--bg-3)] font-medium text-[var(--fg-0)]"
                      : "border-transparent text-[var(--fg-1)] hover:bg-[var(--bg-2)] hover:text-[var(--fg-0)]",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={15}
                      className={isActive ? "text-[var(--ryze-accent)]" : ""}
                    />
                    {label}
                  </div>
                  {(unreadCounts[folder.id] || 0) > 0 && (
                    <span className="font-mono-jetbrains text-[10.5px] font-medium text-[var(--fg-1)]">
                      {unreadCounts[folder.id] || 0}
                    </span>
                  )}
                </button>
              );
            })}

            {SNOOZE_VIEWS.map(({ key, icon: Icon, label }) => {
              const isActive = activeFolder === key && !activeLabelId;
              const unread = unreadCounts[key] || 0;

              return (
                <button
                  key={key}
                  onClick={() => {
                    onFolderSelect(key);
                    onLabelSelect("");
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-[6px] border-l-2 px-2.5 py-1.5 text-[13px] transition-colors",
                    isActive
                      ? "border-[var(--ryze-accent)] bg-[var(--bg-3)] font-medium text-[var(--fg-0)]"
                      : "border-transparent text-[var(--fg-1)] hover:bg-[var(--bg-2)] hover:text-[var(--fg-0)]",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={15}
                      className={isActive ? "text-[var(--ryze-accent)]" : ""}
                    />
                    {label}
                  </div>
                  {unread > 0 && (
                    <span className="font-mono-jetbrains text-[10.5px] font-medium text-[var(--fg-1)]">
                      {unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center justify-between px-2.5 pb-1 pt-4">
              <span className="font-mono-jetbrains text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--fg-3)]">
                Accounts
              </span>
              <span className="font-mono-jetbrains text-[10px] text-[var(--fg-3)]">
                {accounts.length}
              </span>
            </div>
            {accounts.map((account) => {
              const isCurrent = account.id === currentAccount.id;
              return (
                <button
                  key={account.id}
                  onClick={() => onAccountSwitch?.(account)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-[6px] px-2.5 py-2 text-left transition-colors",
                    isCurrent
                      ? "bg-[var(--bg-2)] text-[var(--fg-0)]"
                      : "text-[var(--fg-1)] hover:bg-[var(--bg-2)] hover:text-[var(--fg-0)]",
                  )}
                >
                  <div
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] font-mono-jetbrains text-[10px] font-semibold"
                    style={{ backgroundColor: `${account.color}33`, color: account.color }}
                  >
                    {account.initials}
                  </div>
                  <span className="min-w-0 flex-1 truncate">{account.email}</span>
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{
                      backgroundColor: isCurrent
                        ? "var(--success-token)"
                        : "var(--warning-token)",
                    }}
                  />
                </button>
              );
            })}
          </div>

          <div className="space-y-0.5">
            <div className="group flex items-center justify-between pb-1 pl-2.5 pr-3 pt-3">
              <span className="font-mono-jetbrains text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--fg-3)]">
                Folders
              </span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  triggerCreate("folder", currentAccount);
                }}
                className="relative z-10 ml-auto flex items-center justify-center rounded-[var(--radius-ryze-sm)] p-1 text-[var(--fg-3)] transition-colors hover:bg-[var(--bg-3)] hover:text-[var(--fg-0)]"
                title="Create folder"
              >
                <Plus size={14} strokeWidth={2.5} />
              </button>
            </div>

            {customRoots.map((folder) => (
              <FolderItem
                key={folder.id}
                folder={folder}
                allFolders={currentAccountFolders}
                depth={0}
                activeFolder={activeFolder}
                activeLabelId={activeLabelId}
                unreadCounts={unreadCounts}
                onFolderClick={(fid: string) => handleFolderClick(currentAccount, fid)}
                onRename={onRenameFolder}
                onEmpty={onEmptyFolder}
                onDelete={onDeleteFolder}
                openPrompt={openPrompt}
                openConfirm={openConfirm}
                onEmailDropToFolder={onEmailDropToFolder}
                icon={Folder}
              />
            ))}
          </div>

          <div className="space-y-0.5">
            <div className="group flex items-center justify-between pb-1 pl-2.5 pr-3 pt-3">
              <span className="font-mono-jetbrains text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--fg-3)]">
                Labels
              </span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  triggerCreate("label", currentAccount);
                }}
                className="relative z-10 ml-auto flex items-center justify-center rounded-[var(--radius-ryze-sm)] p-1 text-[var(--fg-3)] transition-colors hover:bg-[var(--bg-3)] hover:text-[var(--fg-0)]"
                title="Create label"
              >
                <Plus size={14} strokeWidth={2.5} />
              </button>
            </div>

            {currentAccountLabels.map((label) => {
              const unread = labelCounts[label.id] || 0;
              return (
                <ContextMenu key={label.id}>
                  <ContextMenuTrigger className="block w-full">
                    <button
                      onClick={() => handleLabelClick(currentAccount, label.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-[6px] border-l-2 px-2.5 py-1.5 text-[13px] transition-colors",
                        activeLabelId === label.id
                          ? "border-[var(--ryze-accent)] bg-[var(--bg-3)] font-medium text-[var(--fg-0)]"
                          : "border-transparent text-[var(--fg-1)] hover:bg-[var(--bg-2)] hover:text-[var(--fg-0)]",
                      )}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: label.color }}
                        />
                        <span className="truncate">{label.name}</span>
                      </div>
                      {unread > 0 && (
                        <span
                          className={cn(
                            "ml-2 shrink-0 font-mono-jetbrains text-[10.5px] font-medium",
                            activeLabelId === label.id
                              ? "text-[var(--fg-1)]"
                              : "text-[var(--fg-2)]",
                          )}
                        >
                          {unread}
                        </span>
                      )}
                    </button>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem
                      onSelect={() => {
                        openPrompt("Rename Label", label.name, async (newName) => {
                          if (newName && window.electronAPI?.renameLabel) {
                            try {
                              await window.electronAPI.renameLabel({
                                accountId: currentAccount.id,
                                labelId: label.id,
                                name: newName,
                              });
                              onRefresh();
                            } catch (e) {}
                          }
                        });
                      }}
                    >
                      Rename Label
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      onSelect={() => {
                        openConfirm(
                          "Delete Label",
                          `Delete label "${label.name}"?`,
                          true,
                          () => {
                            onDeleteLabel(label);
                          },
                        );
                      }}
                      className="text-[var(--danger-token)] focus:text-[var(--danger-token)]"
                    >
                      Delete Label
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-1 border-t border-[var(--border-subtle)] p-2">
          <button
            onClick={onRefresh}
            className="flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-ryze-sm)] py-2 text-[13px] text-[var(--fg-2)] transition-colors hover:bg-[var(--bg-2)] hover:text-[var(--fg-0)]"
          >
            <RefreshCw size={15} />
            Sync
          </button>
          <button
            onClick={onOpenSettings}
            className="flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-ryze-sm)] py-2 text-[13px] text-[var(--fg-2)] transition-colors hover:bg-[var(--bg-2)] hover:text-[var(--fg-0)]"
          >
            <Settings size={15} />
            Settings
          </button>
        </div>
      </div>

      {/* --- NATIVE REACT MODAL OVERLAY --- */}
      {dialog.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-[280px] rounded-[var(--radius-ryze-lg)] border border-[var(--border-1)] bg-[var(--bg-2)] p-5 shadow-[0_16px_48px_-12px_oklch(0_0_0_/_0.6)]"
          >
            <h3 className="mb-2 text-[14px] font-medium text-[var(--fg-0)]">
              {dialog.title}
            </h3>
            {dialog.message && (
              <p className="mb-4 text-[12px] leading-relaxed text-[var(--fg-2)]">
                {dialog.message}
              </p>
            )}
            {dialog.type === "prompt" && (
              <input
                type="text"
                autoFocus
                className="mb-4 w-full rounded-[var(--radius-ryze-md)] border border-[var(--border-0)] bg-[var(--bg-1)] px-2.5 py-2 text-[13px] text-[var(--fg-0)] outline-none transition-colors focus:border-[var(--ryze-accent)]"
                value={dialog.value || ""}
                onChange={(e) =>
                  setDialog({ ...dialog, value: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    dialog.onConfirm(dialog.value);
                    setDialog({ ...dialog, isOpen: false });
                  }
                }}
              />
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDialog({ ...dialog, isOpen: false })}
                className="rounded-[var(--radius-ryze-sm)] px-4 py-1.5 text-[12px] font-medium text-[var(--fg-2)] transition-colors hover:bg-[var(--bg-3)] hover:text-[var(--fg-0)]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  dialog.onConfirm(
                    dialog.type === "prompt" ? dialog.value : undefined,
                  );
                  setDialog({ ...dialog, isOpen: false });
                }}
                className={cn(
                  "rounded-[var(--radius-ryze-sm)] px-4 py-1.5 text-[12px] font-medium transition-colors",
                  dialog.danger
                    ? "bg-[var(--danger-token)] text-white"
                    : "bg-[var(--ryze-accent)] text-[var(--ryze-accent-fg)] hover:bg-[var(--ryze-accent-hover)]",
                )}
              >
                {dialog.type === "prompt" ? "Save" : "Confirm"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
