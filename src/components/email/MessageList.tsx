import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Paperclip,
  User,
  Calendar,
  Archive,
  Trash2,
  Bell,
  Check,
  FolderInput,
  Tag,
} from "lucide-react";
import {
  EmailThread,
  EmailLabel,
  MailFolder,
  EmailThreadRow,
} from "@/types/email";
import { type DensityMode } from "./emailPreferences";
import { threadRowMatchesFilters } from "./threadView";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";

interface MessageListProps {
  emails: EmailThread[];
  threadRows: EmailThreadRow[];
  folderLabel: string;
  folderUnreadCount: number;
  folderTotalCount: number;
  syncLabel: string;
  selectedId: string | null;
  onSelect: (email: EmailThread) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  searchQuery: string;
  onClearSearch: () => void;
  density: DensityMode;
  showPreviewText: boolean;
  showAvatars: boolean;
  onSnooze: (id: string, snoozedUntil?: string) => void;

  selectedEmailIds: string[];
  onToggleEmailSelection: (emailId: string) => void;
  onClearEmailSelection: () => void;
  onBulkDelete: (emailIds: string[]) => Promise<void>;
  onBulkMoveToFolder: (
    emailIds: string[],
    destinationFolderId: string,
  ) => Promise<void>;
  onBulkApplyLabel: (emailIds: string[], labelId: string) => Promise<void>;
  folders: MailFolder[];
  labels: EmailLabel[];
}

type SnoozePreset = {
  label: string;
  value: string;
};

function toIsoAtLocalTime(base: Date, hours: number, minutes: number) {
  const next = new Date(base);
  next.setHours(hours, minutes, 0, 0);
  return next.toISOString();
}

function buildSnoozePresets(): SnoozePreset[] {
  const now = new Date();
  const laterToday = new Date(now);
  laterToday.setHours(now.getHours() + 3, 0, 0, 0);

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  return [
    { label: "Later today", value: laterToday.toISOString() },
    { label: "Tomorrow morning", value: toIsoAtLocalTime(tomorrow, 8, 0) },
    { label: "Next week", value: toIsoAtLocalTime(nextWeek, 8, 0) },
  ];
}

function formatDateTimeLocalValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

const bulkToolbarVariants = {
  hidden: {
    opacity: 0,
    y: -8,
    scale: 0.98,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.98,
    filter: "blur(4px)",
  },
};

const dropdownVariants = {
  hidden: {
    opacity: 0,
    y: -6,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    y: -4,
    scale: 0.98,
  },
};

function formatTimestamp(date: Date): string {
  if (isToday(date)) {
    return format(date, "HH:mm");
  }

  if (isYesterday(date)) {
    return "Yesterday";
  }

  return format(date, "MMM d");
}

function MessageRow({
  row,
  isSelected,
  onSelect,
  onArchive,
  onDelete,
  onToggleSelected,
  onSnooze,
  density,
  showPreviewText,
  showAvatars,
  isBulkSelected,
}: {
  row: EmailThreadRow;
  isSelected: boolean;
  onSelect: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onToggleSelected: () => void;
  onSnooze: (snoozedUntil?: string) => void;
  density: DensityMode;
  showPreviewText: boolean;
  showAvatars: boolean;
  isBulkSelected: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isSnoozeMenuOpen, setIsSnoozeMenuOpen] = useState(false);
  const [isCustomSnoozeOpen, setIsCustomSnoozeOpen] = useState(false);
  const [customSnoozeValue, setCustomSnoozeValue] = useState(() => {
    const nextHour = new Date();
    nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
    return formatDateTimeLocalValue(nextHour);
  });
  const snoozePresets = buildSnoozePresets();
  const rowPadding = density === "compact" ? "py-2.5" : "py-3";
  const email = row.latestMessage;

  return (
    <motion.div
      draggable
      // By typing event as `any` (or React.DragEvent<HTMLDivElement>), we bypass
      // Framer Motion's custom pointer event types to access native HTML5 dataTransfer.
      onDragStart={(event: any) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData(
          "application/x-ryze-email",
          JSON.stringify({
            emailId: email.id,
            messageId: email.messageId,
            folderId: email.folder,
            subject: email.subject,
          }),
        );
      }}
      initial={false}
      animate={{ opacity: 1 }}
      layout="position"
      transition={{ duration: 0.16, ease: "easeOut" }}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative cursor-pointer border-b border-[var(--border-subtle)] px-3.5 transition-colors",
        rowPadding,
        isSelected ? "bg-[var(--bg-2)]" : "hover:bg-[var(--bg-1)]",
      )}
      style={{
        paddingLeft: isSelected ? "14px" : row.hasUnread ? "24px" : "16px",
        borderLeft: isSelected
          ? "2px solid var(--ryze-accent)"
          : "2px solid transparent",
      }}
    >
      {row.hasUnread && !isSelected && (
        <span className="absolute left-3 top-7 h-1.5 w-1.5 rounded-full bg-[var(--ryze-accent)] shadow-[0_0_0_2px_var(--bg-0)]" />
      )}

      <div
        className={cn(
          "absolute left-0 top-1/2 flex w-8 -translate-y-1/2 items-center justify-center transition-all duration-150",
          isHovered || isBulkSelected ? "opacity-100" : "opacity-0",
        )}
        onClick={(event) => {
          event.stopPropagation();
          onToggleSelected();
        }}
      >
        <div
          className={cn(
            "flex h-4 w-4 items-center justify-center rounded-[var(--radius-ryze-xs)] border transition-colors",
            isBulkSelected
              ? "border-[var(--ryze-accent)] bg-[var(--ryze-accent)]"
              : "border-[var(--border-1)] bg-transparent hover:border-[var(--ryze-accent)]",
          )}
        >
          {isBulkSelected && (
            <Check
              size={10}
              className="text-[var(--ryze-accent-fg)]"
              strokeWidth={3}
            />
          )}
        </div>
      </div>

      <div
        className={cn(
          "transition-all duration-150",
          isHovered || isBulkSelected ? "pl-5" : "pl-0",
          isHovered ? "pr-24" : "pr-0",
        )}
      >
        <div className="mb-1 flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-2">
            {showAvatars && (
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] text-[11px] font-semibold text-white"
                style={{ backgroundColor: email.sender.color }}
              >
                {email.sender.initials}
              </div>
            )}
            <span
              className={cn(
                "truncate text-[13.5px]",
                row.hasUnread
                  ? "font-bold text-[var(--fg-0)]"
                  : "font-medium text-[var(--fg-2)]",
                isSelected && "text-[var(--fg-0)]",
              )}
            >
              {email.sender.name}
            </span>
            {row.threadCount > 1 && (
              <span className="shrink-0 rounded-[var(--radius-ryze-xs)] border border-[var(--ryze-accent)] bg-[var(--ryze-accent-soft)] px-1.5 py-0.5 font-mono-jetbrains text-[10px] text-[var(--ryze-accent)]">
                {row.threadCount}
              </span>
            )}
            {row.participantCount > 1 && (
              <span className="shrink-0 font-mono-jetbrains text-[10px] text-[var(--fg-3)]">
                +{row.participantCount - 1}
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {row.hasAttachment && (
              <Paperclip
                size={11}
                className={cn(
                  "text-[var(--fg-3)]",
                  isSelected && "text-[var(--ryze-accent)]",
                )}
                strokeWidth={1.5}
              />
            )}
            <span
              className={cn(
                "font-mono-jetbrains text-[10.5px]",
                row.hasUnread
                  ? "font-medium text-[var(--fg-1)]"
                  : "text-[var(--fg-3)]",
                isSelected && "text-[var(--fg-1)]",
              )}
            >
              {formatTimestamp(email.timestamp)}
            </span>
          </div>
        </div>

        <div
          className={cn(
            "mb-0.5 truncate text-[13px]",
            row.hasUnread
              ? "font-semibold text-[var(--fg-0)]"
              : "font-normal text-[var(--fg-2)]",
            isSelected && "text-[var(--fg-0)]",
          )}
        >
          {email.subject}
        </div>

        {showPreviewText && (
          <div
            className={cn(
              "truncate text-[12.5px] leading-relaxed",
              row.hasUnread ? "text-[var(--fg-1)]" : "text-[var(--fg-3)]",
              isSelected && "text-[var(--fg-1)]",
            )}
          >
            {email.preview}
          </div>
        )}
      </div>
      {row.labels.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {row.labels.map((label) => (
            <span
              key={label.id}
              className="rounded-[var(--radius-ryze-xs)] border px-1.5 py-0.5 font-mono-jetbrains text-[10px] font-medium"
              style={{
                color: "var(--fg-0)",
                borderColor: label.color,
                backgroundColor: `color-mix(in srgb, ${label.color} 18%, var(--bg-1))`,
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 8, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 8, scale: 0.96 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className="absolute right-3 top-1/2 z-20 flex -translate-y-1/2 items-center gap-0.5 rounded-[var(--radius-ryze-sm)] border border-[var(--border-1)] bg-[var(--bg-2)] p-0.5 shadow-[0_16px_48px_-12px_oklch(0_0_0_/_0.6)]"
            onClick={(event) => event.stopPropagation()}
          >
            <motion.button
              type="button"
              onClick={onArchive}
              className="rounded-[var(--radius-ryze-sm)] p-1.5 text-[var(--fg-2)] transition-colors hover:bg-[var(--ryze-accent-soft)] hover:text-[var(--ryze-accent)]"
              title="Archive (E)"
            >
              <Archive size={13} strokeWidth={1.7} />
            </motion.button>

            <motion.button
              type="button"
              onClick={onDelete}
              className="rounded-[var(--radius-ryze-sm)] p-1.5 text-[var(--fg-2)] transition-colors hover:bg-[var(--bg-3)] hover:text-[var(--danger-token)]"
              title="Delete"
            >
              <Trash2 size={13} strokeWidth={1.7} />
            </motion.button>

            <div className="relative">
              <motion.button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSnoozeMenuOpen((prev) => !prev);
                }}
                className="rounded-[var(--radius-ryze-sm)] p-1.5 text-[var(--fg-2)] transition-colors hover:bg-[var(--bg-3)] hover:text-[var(--fg-0)]"
                title="Snooze"
              >
                <Bell size={13} strokeWidth={1.7} />
              </motion.button>
              <AnimatePresence>
                {isSnoozeMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full z-30 mt-1 w-44 rounded-[var(--radius-ryze-md)] border border-[var(--border-1)] bg-[var(--bg-2)] p-1 shadow-[0_16px_48px_-12px_oklch(0_0_0_/_0.6)]"
                  >
                    {snoozePresets.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setIsSnoozeMenuOpen(false);
                          setIsCustomSnoozeOpen(false);
                          onSnooze(preset.value);
                        }}
                        className="block w-full rounded-[var(--radius-ryze-sm)] px-2.5 py-1.5 text-left text-[12px] text-[var(--fg-2)] transition-colors hover:bg-[var(--bg-3)] hover:text-[var(--fg-0)]"
                      >
                        {preset.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setIsCustomSnoozeOpen((prev) => !prev);
                      }}
                      className="mt-1 block w-full rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] px-2.5 py-1.5 text-left text-[12px] text-[var(--fg-2)] transition-colors hover:bg-[var(--bg-3)] hover:text-[var(--fg-0)]"
                    >
                      Pick date & time
                    </button>
                    {isCustomSnoozeOpen && (
                      <div className="mt-2 rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] p-2">
                        <input
                          type="datetime-local"
                          value={customSnoozeValue}
                          onChange={(event) =>
                            setCustomSnoozeValue(event.target.value)
                          }
                          className="w-full rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] bg-[var(--bg-1)] px-2 py-1.5 text-[12px] text-[var(--fg-1)] outline-none focus:border-[var(--ryze-accent)]"
                        />
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            if (!customSnoozeValue) return;
                            const parsed = new Date(customSnoozeValue);
                            if (Number.isNaN(parsed.getTime())) return;
                            setIsSnoozeMenuOpen(false);
                            setIsCustomSnoozeOpen(false);
                            onSnooze(parsed.toISOString());
                          }}
                          className="mt-2 w-full rounded-[var(--radius-ryze-sm)] bg-[var(--ryze-accent)] px-2 py-1.5 text-[12px] font-medium text-[var(--ryze-accent-fg)] transition-colors hover:bg-[var(--ryze-accent-hover)]"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function MessageList({
  emails,
  threadRows,
  folderLabel,
  folderUnreadCount,
  folderTotalCount,
  syncLabel,
  selectedId,
  onSelect,
  onArchive,
  onDelete,
  searchQuery,
  onClearSearch,
  density,
  showPreviewText,
  showAvatars,
  selectedEmailIds,
  onToggleEmailSelection,
  onClearEmailSelection,
  onBulkDelete,
  onBulkMoveToFolder,
  onBulkApplyLabel,
  onSnooze,
  folders,
  labels,
}: MessageListProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isMoveMenuOpen, setIsMoveMenuOpen] = useState(false);
  const [isLabelMenuOpen, setIsLabelMenuOpen] = useState(false);
  const filterChips = ["All", "Unread", "Flagged", "Has files"];

  const toggleFilter = (filter: string) => {
    if (filter === "All") {
      setActiveFilters([]);
      return;
    }

    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((item) => item !== filter)
        : [...prev, filter],
    );
  };

  const filteredThreadRows = React.useMemo(() => {
    return threadRows.filter((row) =>
      threadRowMatchesFilters(row, {
        query: searchQuery,
        activeFilters,
      }),
    );
  }, [threadRows, searchQuery, activeFilters]);

  const selectedRowsInView = React.useMemo(
    () =>
      filteredThreadRows.filter((row) =>
        selectedEmailIds.includes(row.latestMessage.id),
      ),
    [filteredThreadRows, selectedEmailIds],
  );

  const selectedCount = selectedRowsInView.length;

  const selectableFolders = React.useMemo(
    () =>
      folders.filter((folder) => {
        const knownName = folder.wellKnownName || "";
        return knownName !== "drafts";
      }),
    [folders],
  );

  return (
    <div className="flex h-full min-h-0 w-[var(--list-w)] flex-col overflow-hidden border-r border-[var(--border-subtle)] bg-[var(--bg-0)]">
      <div className="border-b border-[var(--border-subtle)] px-4 pb-3 pt-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-[15px] font-semibold text-[var(--fg-0)]">
              {folderLabel}
            </h1>
            <div className="mt-1 flex items-center gap-2 font-mono-jetbrains text-[11px] text-[var(--fg-2)]">
              <span>
                {folderUnreadCount} unread
              </span>
              <span className="text-[var(--fg-3)]">·</span>
              <span>{folderTotalCount} total</span>
            </div>
          </div>
          <span className="pt-0.5 font-mono-jetbrains text-[11px] text-[var(--success-token)]">
            {syncLabel}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-3">
          {filterChips.map((chip) => {
            const isActive =
              chip === "All"
                ? activeFilters.length === 0
                : activeFilters.includes(chip);

            return (
              <button
                key={chip}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => toggleFilter(chip)}
                className={cn(
                  "border-b px-0.5 pb-1 text-[12.5px] transition-colors",
                  isActive
                    ? "border-[var(--ryze-accent)] font-medium text-[var(--fg-0)]"
                    : "border-transparent text-[var(--fg-2)] hover:text-[var(--fg-0)]",
                )}
              >
                {chip}
              </button>
            );
          })}
        </div>
        {searchQuery.trim().length > 0 && (
          <div className="mt-3 flex min-w-0 items-center justify-between gap-2 rounded-[var(--radius-ryze-md)] border border-[var(--ryze-accent)] bg-[var(--ryze-accent-soft)] px-2.5 py-1.5">
            <span className="min-w-0 truncate font-mono-jetbrains text-[11px] text-[var(--ryze-accent)]">
              Search: {searchQuery}
            </span>
            <button
              type="button"
              onClick={onClearSearch}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--radius-ryze-sm)] text-[var(--ryze-accent)] transition-colors hover:bg-[var(--bg-3)]"
              title="Clear search"
            >
              <X size={12} strokeWidth={2} />
            </button>
          </div>
        )}
      </div>

      <div className="relative z-20 border-b border-[var(--border-subtle)] px-4 py-2">
        <AnimatePresence initial={false}>
          {selectedCount > 0 ? (
            <motion.div
              key="bulk-toolbar"
              variants={bulkToolbarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="relative z-50 flex min-w-0 items-center gap-2 rounded-[var(--radius-ryze-lg)] border border-[var(--border-1)] bg-[var(--bg-2)] px-3 py-2 shadow-[0_16px_48px_-12px_oklch(0_0_0_/_0.6)]"
            >
              <motion.div
                key={selectedCount}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.14, ease: "easeOut" }}
                className="flex h-7 shrink-0 items-center gap-1.5 rounded-[var(--radius-ryze-sm)] border border-[var(--ryze-accent)] bg-[var(--ryze-accent-soft)] px-2 text-[var(--ryze-accent)]"
                title={`${selectedCount} selected`}
              >
                <Check size={11} strokeWidth={2.5} />
                <span className="font-mono-jetbrains text-[11px] font-semibold leading-none">
                  {selectedCount}
                </span>
              </motion.div>

              <div className="ml-auto flex min-w-0 items-center gap-1">
                <div className="relative">
                  <motion.button
                    type="button"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setIsMoveMenuOpen((prev) => !prev);
                      setIsLabelMenuOpen(false);
                    }}
                    className={cn(
                      "flex shrink-0 items-center gap-1 rounded-[var(--radius-ryze-sm)] border px-2 py-1.5 text-[11px] transition-colors",
                      isMoveMenuOpen
                        ? "border-[var(--ryze-accent)] bg-[var(--ryze-accent-soft)] text-[var(--ryze-accent)]"
                        : "border-[var(--border-0)] bg-[var(--bg-1)] text-[var(--fg-2)] hover:border-[var(--border-1)] hover:text-[var(--fg-0)]",
                    )}
                  >
                    <FolderInput size={12} />
                    Move
                  </motion.button>

                  <AnimatePresence>
                    {isMoveMenuOpen && (
                      <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ duration: 0.14, ease: "easeOut" }}
                        className="absolute right-0 top-full z-50 mt-1 max-h-72 w-56 origin-top-right overflow-y-auto rounded-[var(--radius-ryze-lg)] border border-[var(--border-1)] bg-[var(--bg-2)] p-1 shadow-[0_16px_48px_-12px_oklch(0_0_0_/_0.6)]"
                      >
                        {selectableFolders.map((folder, index) => (
                          <motion.button
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              duration: 0.12,
                              delay: index * 0.015,
                            }}
                            whileHover={{ x: 2 }}
                            whileTap={{ scale: 0.98 }}
                            key={folder.id}
                            type="button"
                            onClick={async () => {
                              setIsMoveMenuOpen(false);
                              await onBulkMoveToFolder(
                                selectedRowsInView.map(
                                  (row) => row.latestMessage.id,
                                ),
                                folder.id,
                              );
                            }}
                            className="flex w-full items-center gap-2 rounded-[var(--radius-ryze-sm)] px-2.5 py-2 text-left text-[12px] text-[var(--fg-2)] hover:bg-[var(--bg-3)] hover:text-[var(--fg-0)]"
                          >
                            <FolderInput size={12} className="shrink-0" />
                            <span className="truncate">
                              {folder.path || folder.displayName}
                            </span>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="relative">
                  <motion.button
                    type="button"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setIsLabelMenuOpen((prev) => !prev);
                      setIsMoveMenuOpen(false);
                    }}
                    className={cn(
                      "flex shrink-0 items-center gap-1 rounded-[var(--radius-ryze-sm)] border px-2 py-1.5 text-[11px] transition-colors",
                      isLabelMenuOpen
                        ? "border-[var(--ryze-accent)] bg-[var(--ryze-accent-soft)] text-[var(--ryze-accent)]"
                        : "border-[var(--border-0)] bg-[var(--bg-1)] text-[var(--fg-2)] hover:border-[var(--border-1)] hover:text-[var(--fg-0)]",
                    )}
                  >
                    <Tag size={12} />
                    Label
                  </motion.button>

                  <AnimatePresence>
                    {isLabelMenuOpen && (
                      <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ duration: 0.14, ease: "easeOut" }}
                        className="absolute right-0 top-full z-50 mt-1 max-h-72 w-56 origin-top-right overflow-y-auto rounded-[var(--radius-ryze-lg)] border border-[var(--border-1)] bg-[var(--bg-2)] p-1 shadow-[0_16px_48px_-12px_oklch(0_0_0_/_0.6)]"
                      >
                        {labels.length === 0 ? (
                          <div className="px-2.5 py-2 text-[12px] text-[var(--fg-3)]">
                            No labels created
                          </div>
                        ) : (
                          labels.map((label, index) => (
                            <motion.button
                              initial={{ opacity: 0, x: -4 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                duration: 0.12,
                                delay: index * 0.015,
                              }}
                              whileHover={{ x: 2 }}
                              whileTap={{ scale: 0.98 }}
                              key={label.id}
                              type="button"
                              onClick={async () => {
                                setIsLabelMenuOpen(false);
                                await onBulkApplyLabel(
                                  selectedRowsInView.map(
                                    (row) => row.latestMessage.id,
                                  ),
                                  label.id,
                                );
                              }}
                              className="flex w-full items-center gap-2 rounded-[var(--radius-ryze-sm)] px-2.5 py-2 text-left text-[12px] text-[var(--fg-2)] hover:bg-[var(--bg-3)] hover:text-[var(--fg-0)]"
                            >
                              <span
                                className="h-1.5 w-1.5 shrink-0 rounded-[2px]"
                                style={{ backgroundColor: label.color }}
                              />
                              <span className="truncate">{label.name}</span>
                            </motion.button>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <motion.button
                  type="button"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() =>
                    onBulkDelete(
                      selectedRowsInView.map((row) => row.latestMessage.id),
                    )
                  }
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] bg-[var(--bg-1)] text-[var(--fg-2)] transition-colors hover:border-[var(--danger-token)] hover:text-[var(--danger-token)]"
                  title="Delete selected"
                >
                  <Trash2 size={12} />
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={onClearEmailSelection}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-ryze-sm)] text-[var(--fg-3)] transition-colors hover:bg-[var(--bg-3)] hover:text-[var(--fg-0)]"
                  title="Clear selection"
                >
                  <X size={12} />
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.span
              key="message-count"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.14, ease: "easeOut" }}
              className="block font-mono-jetbrains text-[12px] text-[var(--fg-2)]"
            >
              {filteredThreadRows.length} thread
              {filteredThreadRows.length !== 1 ? "s" : ""}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div
        className="flex-1 overflow-y-auto scrollbar-thin transition-all duration-150"
      >
        {filteredThreadRows.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <Search
              size={28}
              className="mb-3 text-[var(--fg-3)]"
              strokeWidth={1}
            />
            <p className="text-[14px] text-[var(--fg-2)]">
              No messages found
            </p>
            <p className="mt-1 text-[12px] text-[var(--fg-2)]">
              Try a different search term
            </p>
          </div>
        ) : (
          filteredThreadRows.map((row) => (
            <MessageRow
              key={row.threadKey}
              row={row}
              isSelected={row.latestMessage.id === selectedId}
              isBulkSelected={selectedEmailIds.includes(row.latestMessage.id)}
              onSelect={() => onSelect(row.latestMessage)}
              onToggleSelected={() =>
                onToggleEmailSelection(row.latestMessage.id)}
              onArchive={() => onArchive(row.latestMessage.id)}
              onDelete={() => onDelete(row.latestMessage.id)}
              onSnooze={(snoozedUntil) =>
                onSnooze(row.latestMessage.id, snoozedUntil)
              }
              density={density}
              showPreviewText={showPreviewText}
              showAvatars={showAvatars}
            />
          ))
        )}
      </div>
    </div>
  );
}
