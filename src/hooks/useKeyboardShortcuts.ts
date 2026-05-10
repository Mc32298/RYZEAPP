import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { EmailThread } from "@/types/email";
import type { ComposeDraft as Draft } from "@/components/email/ComposeDrawer";

export interface UseKeyboardShortcutsParams {
  isSessionLocked: boolean;
  isCommandPaletteOpen: boolean;
  isGlobalSearchOpen: boolean;
  searchQuery: string;
  selectedEmailId: string | null;
  folderEmails: EmailThread[];
  emails: EmailThread[];
  handleArchive: (id: string) => void | Promise<void>;
  handleDelete: (id: string) => void | Promise<void>;
  handleMarkRead: (id: string) => void;
  handleMarkUnread: (id: string) => void;
  handleQuickApplyLabel: () => void;
  handleQuickMove: () => void;
  handleCompose: (prefill?: Partial<Draft>) => void;
  handleReply: (message?: EmailThread) => void;
  handleSelectEmail: (email: EmailThread) => void | Promise<void>;
  handleSnooze: (id: string, snoozedUntilOverride?: string) => Promise<void>;
  handleToggleStar: (id: string) => void;
  setIsCommandPaletteOpen: Dispatch<SetStateAction<boolean>>;
  setIsGlobalSearchOpen: Dispatch<SetStateAction<boolean>>;
  setGlobalSearchDraft: Dispatch<SetStateAction<string>>;
  setGlobalSearchSelectedIndex: Dispatch<SetStateAction<number>>;
  setIsGlobalSearchActionMenuOpen: Dispatch<SetStateAction<boolean>>;
  setGlobalSearchActionIndex: Dispatch<SetStateAction<number>>;
  setIsCalendarOpen: Dispatch<SetStateAction<boolean>>;
}

export function useKeyboardShortcuts(params: UseKeyboardShortcutsParams): void {
  const {
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
  } = params;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isSessionLocked) return;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      if (isCommandPaletteOpen) {
        if (event.key === "Escape") {
          event.preventDefault();
          setIsCommandPaletteOpen(false);
        }
        return;
      }

      if (isGlobalSearchOpen) {
        if (event.key === "Escape") {
          event.preventDefault();
          setIsGlobalSearchOpen(false);
        }
        return;
      }

      if (event.shiftKey && event.code === "Space") {
        event.preventDefault();
        setGlobalSearchDraft(searchQuery);
        setGlobalSearchSelectedIndex(0);
        setIsGlobalSearchActionMenuOpen(false);
        setGlobalSearchActionIndex(0);
        setIsGlobalSearchOpen(true);
        return;
      }

      const target = event.target as HTMLElement;
      const isInInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;
      if (isInInput) return;

      switch (event.key) {
        case "t":
        case "T":
          event.preventDefault();
          setIsCalendarOpen((prev) => !prev);
          break;
        case "c":
        case "C":
          event.preventDefault();
          handleCompose();
          break;
        case "r":
        case "R":
          event.preventDefault();
          handleReply();
          break;
        case "e":
        case "E":
        case "a":
        case "A":
          if (selectedEmailId) {
            event.preventDefault();
            handleArchive(selectedEmailId);
          }
          break;
        case "d":
        case "D":
        case "Delete":
        case "Backspace":
          if (selectedEmailId) {
            event.preventDefault();
            handleDelete(selectedEmailId);
          }
          break;
        case "s":
        case "S":
          if (selectedEmailId) {
            event.preventDefault();
            handleToggleStar(selectedEmailId);
          }
          break;
        case "u":
        case "U":
          if (selectedEmailId) {
            event.preventDefault();
            const selected = emails.find((email) => email.id === selectedEmailId);
            if (selected?.isRead) {
              handleMarkUnread(selectedEmailId);
            } else {
              handleMarkRead(selectedEmailId);
            }
          }
          break;
        case "l":
        case "L":
          event.preventDefault();
          handleQuickApplyLabel();
          break;
        case "m":
        case "M":
          event.preventDefault();
          handleQuickMove();
          break;
        case "z":
        case "Z":
          if (selectedEmailId) {
            event.preventDefault();
            void handleSnooze(selectedEmailId);
          }
          break;
        case "n":
        case "N": {
          event.preventDefault();
          const unread = folderEmails.filter((email) => !email.isRead);
          if (unread.length === 0) break;
          const currentIndex = unread.findIndex(
            (email) => email.id === selectedEmailId,
          );
          const nextUnread = unread[currentIndex + 1] ?? unread[0];
          if (nextUnread) void handleSelectEmail(nextUnread);
          break;
        }
        case "ArrowDown": {
          event.preventDefault();
          const idx = folderEmails.findIndex(
            (email) => email.id === selectedEmailId,
          );
          const next = folderEmails[idx + 1] ?? folderEmails[0];
          if (next) handleSelectEmail(next);
          break;
        }
        case "ArrowUp": {
          event.preventDefault();
          const idx = folderEmails.findIndex(
            (email) => email.id === selectedEmailId,
          );
          const prev =
            folderEmails[idx - 1] ?? folderEmails[folderEmails.length - 1];
          if (prev) handleSelectEmail(prev);
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
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
  ]);
}
