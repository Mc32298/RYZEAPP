import { motion, AnimatePresence } from "framer-motion";
import {
  Reply,
  ReplyAll,
  Forward,
  Archive,
  Trash2,
  MoreHorizontal,
  Paperclip,
  Send,
  Tag,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { EmailThread, EmailLabel } from "@/types/email";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import DOMPurify from "dompurify";
import { useState, useEffect, useRef } from "react";
import { ConversationMessageCard } from "./ConversationMessageCard";
import { ReadingInsightsRail } from "./ReadingInsightsRail";
import { deriveReadingInsights, type AiTone } from "./readingInsights";
import {
  loadStoredInsightsCollapsed,
  saveStoredInsightsCollapsed,
} from "./readingInsightsCollapse";
import {
  getDefaultExpandedMessageIds,
  getReadingTimelineMessages,
  scrollReadingTimelineToBottom,
  stripQuotedHtml,
} from "./threadView";
import {
  getConversationSenderName,
  renderThreadMessageHtml,
} from "./threadMessageRendering";
import { getInlineReplyTargetMessage } from "./replyComposer";

interface ReadingPaneProps {
  email: EmailThread | null;
  threadMessages: EmailThread[];
  relatedEmails: EmailThread[];
  onReplyWithTone: (tone: AiTone) => void;
  onReply: (message?: EmailThread) => void;
  onInlineReplySend: (
    message: EmailThread,
    bodyText: string,
    conversationMessages: EmailThread[],
  ) => Promise<void>;
  onReplyAll: (message?: EmailThread) => void;
  onForward: (message?: EmailThread) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  showAvatars: boolean;
  currentUserEmail: string;
  blockRemoteImages: boolean;
  confirmExternalLinks: boolean;
  labels: EmailLabel[];
  onToggleLabel: (email: EmailThread, label: EmailLabel) => void;
  onToggleStar: (id: string) => void;
  onMarkUnread: (id: string) => void;
  onDownloadAttachment: (
    messageId: string,
    attachmentId: string,
    filename: string,
  ) => void;
  isDarkMode: boolean;
}

const SAFE_URL_PROTOCOLS = new Set([
  "http:",
  "https:",
  "mailto:",
  "cid:",
  "blob:",
]);

function ActionButton({
  icon: Icon,
  label,
  shortcut,
  onClick,
  variant = "default",
}: {
  icon: LucideIcon;
  label: string;
  shortcut?: string;
  onClick?: () => void;
  variant?: "default" | "danger";
}) {
  return (
    <button
      onClick={onClick}
      title={`${label}${shortcut ? ` (${shortcut})` : ""}`}
      className={cn(
        "flex h-7 items-center gap-1.5 rounded-[6px] px-2.5 text-[12px] font-medium transition-colors",
        variant === "danger"
          ? "text-[var(--fg-1)] hover:bg-[var(--bg-2)] hover:text-[var(--danger-token)]"
          : "text-[var(--fg-1)] hover:bg-[var(--bg-2)] hover:text-[var(--fg-0)]",
      )}
    >
      <Icon size={13} strokeWidth={1.5} />
      {label}
      {shortcut && (
        <kbd className="rounded-[var(--radius-ryze-xs)] border border-[var(--border-0)] px-1 py-0.5 font-mono-jetbrains text-[10px] leading-none text-[var(--fg-3)]">
          {shortcut}
        </kbd>
      )}
    </button>
  );
}

function IconActionButton({
  icon: Icon,
  label,
  shortcut,
  onClick,
  isActive = false,
}: {
  icon: LucideIcon;
  label: string;
  shortcut?: string;
  onClick?: () => void;
  isActive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={`${label}${shortcut ? ` (${shortcut})` : ""}`}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-[6px] border transition-colors",
        isActive
          ? "border-[var(--ryze-accent)] bg-[var(--ryze-accent-soft)] text-[var(--ryze-accent)]"
          : "border-transparent text-[var(--fg-3)] hover:bg-[var(--bg-2)] hover:text-[var(--fg-1)]",
      )}
    >
      <Icon size={14} strokeWidth={1.5} />
    </button>
  );
}

function isSafeUrl(value: string): boolean {
  try {
    const urlToParse = value.startsWith("//") ? `https:${value}` : value;
    const parsed = new URL(urlToParse, window.location.origin);
    return SAFE_URL_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
}

function isRemoteHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value, window.location.origin);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

const TRUSTED_SENDERS_STORAGE_KEY = "email-client-trusted-image-senders";

function normalizeEmailAddress(email: string) {
  return email.trim().toLowerCase();
}

function loadTrustedImageSenders(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(TRUSTED_SENDERS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((item) => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function saveTrustedImageSenders(senders: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    TRUSTED_SENDERS_STORAGE_KEY,
    JSON.stringify(senders),
  );
}

function makeRemoteImagePlaceholder(doc: Document) {
  const placeholder = doc.createElement("div");
  placeholder.textContent = "Remote image blocked (Check Privacy Settings)";
  placeholder.setAttribute(
    "style",
    "display:inline-block;padding:12px 14px;border:1px solid var(--border-0);background:var(--bg-1);color:var(--fg-2);font-size:12px;border-radius:5px;",
  );
  return placeholder;
}

function removeTrackingAndUnsafeAttributes(
  html: string,
  blockRemoteImages: boolean,
): string {
  if (typeof window === "undefined") {
    return "";
  }

  const parser = new window.DOMParser();
  const doc = parser.parseFromString(html || "", "text/html");

  doc.querySelectorAll("*").forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value;

      if (name.startsWith("on")) {
        element.removeAttribute(attribute.name);
        return;
      }

      if (["srcdoc"].includes(name)) {
        element.removeAttribute(attribute.name);
        return;
      }

      if (
        ["href", "src", "xlink:href", "poster", "background"].includes(name)
      ) {
        if (!isSafeUrl(value)) {
          element.removeAttribute(attribute.name);
        }
      }
    });
  });

  doc.querySelectorAll("a").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || !isSafeUrl(href)) {
      link.removeAttribute("href");
      return;
    }

    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer nofollow");
  });

  doc.querySelectorAll("img, source").forEach((mediaElement) => {
    mediaElement.removeAttribute("srcset");
    mediaElement.removeAttribute("sizes");
  });

  if (blockRemoteImages) {
    doc.querySelectorAll("img").forEach((image) => {
      const src = image.getAttribute("src") ?? "";

      if (!src || isRemoteHttpUrl(src) || src.startsWith("//")) {
        image.replaceWith(makeRemoteImagePlaceholder(doc));
        return;
      }

      if (!isSafeUrl(src)) {
        image.replaceWith(makeRemoteImagePlaceholder(doc));
      }
    });
  }

  return doc.body.innerHTML;
}

function sanitizeEmailHtml(html: string, blockRemoteImages: boolean): string {
  if (typeof window === "undefined") {
    return "";
  }

  const normalizedHtml = removeTrackingAndUnsafeAttributes(
    html,
    blockRemoteImages,
  );

  return DOMPurify.sanitize(normalizedHtml, {
    USE_PROFILES: { html: true },
    // Explicit scheme allow-list — every permitted URI pattern is named here.
    // The previous regex had an ambiguous third branch that was hard to audit.
    // Breakdown:
    //   https?:|mailto:|cid:|blob:|tel:  — safe explicit schemes
    //   data:image\/                     — inline images only (blocks data:text/html etc.)
    //   #                                — in-page anchor fragments
    //   \/(?!\/)                         — absolute paths, NOT protocol-relative //evil.com
    //   \.\.?\/                          — relative paths ./ and ../
    //   \?                               — query strings
    ALLOWED_URI_REGEXP:
      /^(?:(?:https?|mailto|cid|blob|tel):|data:image\/|#|\/(?!\/)|\.\.?\/|\?)/i,
    ADD_TAGS: ["style"],
    ADD_ATTR: [
      "style",
      "align",
      "valign",
      "width",
      "height",
      "cellpadding",
      "cellspacing",
      "border",
      "bgcolor",
    ],
    FORBID_TAGS: [
      "script",
      "iframe",
      "object",
      "embed",
      "form",
      "input",
      "button",
      "meta",
      "link",
      "base",
      "svg",
      "math",
    ],
    // USE_PROFILES: { html: true } already strips all on* event handlers.
    // These are belt-and-suspenders for the most commonly abused ones.
    FORBID_ATTR: [
      "srcdoc",
      "onerror",
      "onload",
      "onclick",
      "onmouseover",
      "onfocus",
      "onblur",
      "onmouseenter",
      "onmouseleave",
      "onkeydown",
      "onkeyup",
      "onkeypress",
      "onsubmit",
      "onchange",
      "oninput",
      "ondblclick",
      "oncontextmenu",
      "ondragstart",
      "onpaste",
    ],
    ALLOW_DATA_ATTR: false,
  });
}

export function ReadingPane({
  email,
  threadMessages,
  relatedEmails,
  onReplyWithTone,
  onReply,
  onInlineReplySend,
  onReplyAll,
  onForward,
  onArchive,
  onDelete,
  showAvatars,
  currentUserEmail,
  blockRemoteImages,
  confirmExternalLinks,
  onDownloadAttachment,
  labels,
  onToggleLabel,
  onToggleStar,
  onMarkUnread,
  isDarkMode,
}: ReadingPaneProps) {
  const [loadRemoteImagesForThisEmail, setLoadRemoteImagesForThisEmail] =
    useState(false);
  const [trustedImageSenders, setTrustedImageSenders] = useState<string[]>(
    loadTrustedImageSenders,
  );
  const [isLabelMenuOpen, setIsLabelMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [aiKeyPoints, setAiKeyPoints] = useState<string[]>([]);
  const [aiSuggestedActions, setAiSuggestedActions] = useState<string[]>([]);
  const [isAiSummarizing, setIsAiSummarizing] = useState(false);
  const [aiError, setAiError] = useState("");
  const [expandedMessageIds, setExpandedMessageIds] = useState<string[]>([]);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [isAiInsightsCollapsed, setIsAiInsightsCollapsed] = useState(() =>
    loadStoredInsightsCollapsed(
      typeof window === "undefined" ? null : window.localStorage,
    ),
  );
  const [quotedOpenById, setQuotedOpenById] = useState<
    Record<string, boolean>
  >({});
  const [inlineReplyBody, setInlineReplyBody] = useState("");
  const [isInlineReplySending, setIsInlineReplySending] = useState(false);
  const [inlineReplyError, setInlineReplyError] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const senderEmail = normalizeEmailAddress(email?.sender.email || "");
  const isTrustedSender = senderEmail
    ? trustedImageSenders.includes(senderEmail)
    : false;
  const conversationMessages =
    threadMessages.length > 0 ? threadMessages : email ? [email] : [];
  const timelineMessages = getReadingTimelineMessages(conversationMessages);

  const handleTrustSender = () => {
    if (!senderEmail) return;

    setTrustedImageSenders((prev) => {
      if (prev.includes(senderEmail)) return prev;

      const next = [...prev, senderEmail];
      saveTrustedImageSenders(next);
      return next;
    });

    setLoadRemoteImagesForThisEmail(true);
  };

  useEffect(() => {
    setLoadRemoteImagesForThisEmail(false);
    setAiSummary("");
    setAiKeyPoints([]);
    setAiSuggestedActions([]);
    setAiError("");
    setIsAiSummarizing(false);
    setInlineReplyBody("");
    setInlineReplyError("");
  }, [email?.id]);

  useEffect(() => {
    const messages = threadMessages.length > 0 ? threadMessages : email ? [email] : [];
    const defaultExpanded = getDefaultExpandedMessageIds(messages);

    setExpandedMessageIds(defaultExpanded);
    setActiveMessageId(messages[0]?.id || email?.id || null);
    setQuotedOpenById({});
  }, [email?.id, threadMessages]);

  useEffect(() => {
    const firstFrame = window.requestAnimationFrame(() => {
      scrollReadingTimelineToBottom(scrollContainerRef.current);

      window.requestAnimationFrame(() => {
        scrollReadingTimelineToBottom(scrollContainerRef.current);
      });
    });

    return () => window.cancelAnimationFrame(firstFrame);
  }, [email?.id, timelineMessages.length]);

  const handleInlineReplySend = async () => {
    const bodyText = inlineReplyBody.trim();
    if (!bodyText || isInlineReplySending) return;

    setIsInlineReplySending(true);
    setInlineReplyError("");

    try {
      await onInlineReplySend(
        inlineReplyTargetMessage,
        bodyText,
        conversationMessages,
      );
      setInlineReplyBody("");
    } catch (error) {
      console.error("Inline reply failed:", error);
      setInlineReplyError(
        error instanceof Error ? error.message : "Failed to send reply.",
      );
    } finally {
      setIsInlineReplySending(false);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    saveStoredInsightsCollapsed(window.localStorage, isAiInsightsCollapsed);
  }, [isAiInsightsCollapsed]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.altKey || event.shiftKey || event.ctrlKey || event.metaKey) {
        return;
      }

      if (event.key.toLowerCase() !== "i") return;

      const target = event.target as HTMLElement | null;
      const isTypingField =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      if (isTypingField) return;

      event.preventDefault();
      setIsAiInsightsCollapsed((prev) => !prev);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleAiSummarize = async () => {
    const summaryEmail =
      (threadMessages.find((item) => item.id === activeMessageId) || email) ??
      null;
    if (!summaryEmail) return;

    if (!window.electronAPI?.summarizeEmailWithAi) {
      setAiError("AI is not available in this build.");
      return;
    }

    setIsAiSummarizing(true);
    setAiError("");

    try {
      const result = await window.electronAPI.summarizeEmailWithAi({
        subject: summaryEmail.subject,
        senderName: summaryEmail.sender.name,
        senderEmail: summaryEmail.sender.email,
        body: summaryEmail.body,
        preview: summaryEmail.preview,
      });

      setAiSummary(result.summary);
      setAiKeyPoints(result.keyPoints || []);
      setAiSuggestedActions(result.suggestedActions || []);
    } catch (error) {
      console.error("AI summarize failed:", error);
      setAiError(
        error instanceof Error ? error.message : "AI summarize failed.",
      );
    } finally {
      setIsAiSummarizing(false);
    }
  };

  if (!email) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="flex h-full min-h-0 flex-1 items-center justify-center bg-[var(--bg-0)] text-center"
      >
        <div className="max-w-[320px] px-6">
          <p className="text-[17px] font-medium text-[var(--fg-0)]">
            Your inbox is yours
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-[var(--fg-2)]">
            Select a message to read it locally.
          </p>
        </div>
      </motion.div>
    );
  }

  const shouldBlockRemoteImages =
    blockRemoteImages && !loadRemoteImagesForThisEmail && !isTrustedSender;
  const activeMessage =
    conversationMessages.find((item) => item.id === activeMessageId) || email;
  const inlineReplyTargetMessage = getInlineReplyTargetMessage(
    activeMessage,
    conversationMessages,
    currentUserEmail,
  );
  const derivedInsights = activeMessage
    ? deriveReadingInsights(activeMessage, conversationMessages)
    : null;
  const inlineCue = derivedInsights?.inlineCue || null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={email.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[var(--bg-0)]"
      >
        <div className="flex h-11 shrink-0 items-center gap-1 border-b border-[var(--border-subtle)] bg-[var(--bg-0)] px-4">
          <ActionButton
            icon={Reply}
            label="Reply"
            shortcut="R"
            onClick={() => onReply(activeMessage || email || undefined)}
          />
          <ActionButton
            icon={ReplyAll}
            label="Reply All"
            onClick={() => onReplyAll(activeMessage || email || undefined)}
          />
          <ActionButton
            icon={Forward}
            label="Forward"
            onClick={() => onForward(activeMessage || email || undefined)}
          />

          <ActionButton
            icon={Sparkles}
            label={isAiSummarizing ? "Summarizing..." : "AI Summary"}
            onClick={handleAiSummarize}
          />

          <div className="mx-1 h-4 w-px bg-[var(--border-0)]" />
          <ActionButton
            icon={Archive}
            label="Archive"
            shortcut="E"
            onClick={() => onArchive(email.id)}
          />
          <ActionButton
            icon={Trash2}
            label="Delete"
            variant="danger"
            onClick={() => onDelete(email.id)}
          />

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsLabelMenuOpen((prev) => !prev)}
              className={cn(
                "flex h-7 items-center gap-1.5 rounded-[6px] border px-2.5 text-[12px] font-medium transition-colors",
                isLabelMenuOpen
                  ? "border-[var(--ryze-accent)] bg-[var(--ryze-accent-soft)] text-[var(--ryze-accent)]"
                  : "border-transparent text-[var(--fg-1)] hover:bg-[var(--bg-2)] hover:text-[var(--fg-0)]",
              )}
            >
              <Tag size={13} strokeWidth={1.5} />
              Label
            </button>

            {isLabelMenuOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-[var(--radius-ryze-lg)] border border-[var(--border-1)] bg-[var(--bg-2)] p-1 shadow-[0_16px_48px_-12px_oklch(0_0_0_/_0.6)]">
                {labels.length === 0 ? (
                  <div className="px-2.5 py-2 text-[12px] text-[var(--fg-3)]">
                    Create a label in the sidebar first.
                  </div>
                ) : (
                  labels.map((label) => {
                    const checked = email.labels.some(
                      (item) => item.id === label.id,
                    );

                    return (
                      <button
                        key={label.id}
                        type="button"
                        onClick={() => onToggleLabel(email, label)}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-[var(--radius-ryze-sm)] px-2.5 py-2 text-left text-[12px] transition-colors",
                          checked
                            ? "bg-[var(--ryze-accent-soft)] text-[var(--ryze-accent)]"
                            : "text-[var(--fg-2)] hover:bg-[var(--bg-3)] hover:text-[var(--fg-0)]",
                        )}
                      >
                        <span className="w-3">{checked ? "✓" : ""}</span>
                        <span
                          className="h-1.5 w-1.5 rounded-[2px]"
                          style={{ backgroundColor: label.color }}
                        />
                        <span className="truncate">{label.name}</span>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-1">
            <IconActionButton
              icon={Sparkles}
              label={
                isAiInsightsCollapsed
                  ? "Show AI insights"
                  : "Hide AI insights"
              }
              shortcut="Alt+I"
              onClick={() => setIsAiInsightsCollapsed((prev) => !prev)}
              isActive={!isAiInsightsCollapsed}
            />
            <button
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className={cn(
                "rounded-sm border p-1.5 transition-all duration-150",
                isMoreMenuOpen
                  ? "border-[var(--ryze-accent)] bg-[var(--ryze-accent-soft)] text-[var(--ryze-accent)]"
                  : "border-transparent text-[var(--fg-3)] hover:bg-[var(--bg-2)] hover:text-[var(--fg-1)]",
              )}
            >
              <MoreHorizontal size={15} strokeWidth={1.5} />
            </button>

            {isMoreMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-[var(--radius-ryze-lg)] border border-[var(--border-1)] bg-[var(--bg-2)] p-1 shadow-[0_16px_48px_-12px_oklch(0_0_0_/_0.6)]">
                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    onMarkUnread(email.id);
                  }}
                  className="flex w-full items-center px-2.5 py-2 text-left text-[12px] text-[var(--fg-2)] hover:bg-[var(--bg-3)] hover:text-[var(--fg-0)]"
                >
                  Mark as unread
                </button>
                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    window.print();
                  }}
                  className="flex w-full items-center px-2.5 py-2 text-left text-[12px] text-[var(--fg-2)] hover:bg-[var(--bg-3)] hover:text-[var(--fg-0)]"
                >
                  Print message
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 border-b border-[var(--border-subtle)] px-10 py-5">
          <h1 className="text-[22px] font-semibold leading-tight tracking-normal text-[var(--fg-0)]">
            {email.subject}
          </h1>
          {email.labels.length > 0 && (
            <div
              className={cn(
                "mt-4 flex gap-1.5",
                showAvatars ? "ml-12" : "ml-0",
              )}
            >
              {email.labels.map((label) => (
                <span
                  key={label.id}
                  className="rounded-[var(--radius-ryze-sm)] border px-2 py-0.5 font-mono-jetbrains text-[11px] font-medium"
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
        </div>

        <div className="min-h-0 flex flex-1 overflow-hidden">
          <div
            ref={scrollContainerRef}
            className="min-w-0 flex flex-1 flex-col overflow-y-auto overscroll-contain px-10 py-7 scrollbar-thin"
          >
            {blockRemoteImages &&
              !loadRemoteImagesForThisEmail &&
              !isTrustedSender && (
                <div className="mb-4 rounded-[var(--radius-ryze-md)] border border-[var(--border-0)] bg-[var(--bg-1)] px-4 py-3 text-[13px] text-[var(--fg-2)]">
                  <div className="flex items-center justify-between gap-4">
                    <span>
                      Remote images are blocked to protect your privacy.
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setLoadRemoteImagesForThisEmail(true)}
                        className="rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] px-3 py-1.5 text-[12px] font-medium text-[var(--fg-1)] transition-colors hover:bg-[var(--bg-3)] hover:text-[var(--fg-0)]"
                      >
                        Load once
                      </button>

                      <button
                        type="button"
                        onClick={handleTrustSender}
                        className="rounded-[var(--radius-ryze-sm)] bg-[var(--ryze-accent)] px-3 py-1.5 text-[12px] font-medium text-[var(--ryze-accent-fg)] transition-colors hover:bg-[var(--ryze-accent-hover)]"
                      >
                        Trust sender
                      </button>
                    </div>
                  </div>
                </div>
              )}

            {blockRemoteImages && isTrustedSender && (
              <div className="mb-4 rounded-[var(--radius-ryze-md)] border border-[var(--border-0)] bg-[var(--bg-1)] px-4 py-3 text-[13px] text-[var(--fg-2)]">
                <div className="flex items-center justify-between gap-4">
                  <span>
                    Images are loaded automatically because you trust{" "}
                    {email.sender.email}.
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setTrustedImageSenders((prev) => {
                        const next = prev.filter(
                          (sender) => sender !== senderEmail,
                        );
                        saveTrustedImageSenders(next);
                        return next;
                      });
                      setLoadRemoteImagesForThisEmail(false);
                    }}
                    className="rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] px-3 py-1.5 text-[12px] font-medium text-[var(--fg-1)] transition-colors hover:bg-[var(--bg-3)] hover:text-[var(--fg-0)]"
                  >
                    Stop trusting
                  </button>
                </div>
              </div>
            )}

            {inlineCue && (
              <div className="mb-4 rounded-[var(--radius-ryze-md)] border border-[var(--ryze-accent)] bg-[var(--ryze-accent-soft)] px-4 py-3">
                <div className="mb-1 flex items-center gap-2 font-mono-jetbrains text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--ryze-accent)]">
                  <Sparkles size={13} />
                  AI cue
                </div>
                <p className="text-[13px] font-semibold text-[var(--fg-0)]">
                  {inlineCue.title}
                </p>
                <p className="mt-1 text-[12px] text-[var(--fg-2)]">
                  {inlineCue.detail}
                </p>
              </div>
            )}

            <div className="space-y-0">
              {timelineMessages.map((message) => {
                let renderedBody = sanitizeEmailHtml(
                  message.body || "",
                  shouldBlockRemoteImages,
                );

                if (!renderedBody.trim() && message.body?.trim()) {
                  renderedBody = sanitizeEmailHtml(message.body || "", true);
                }

                if (!renderedBody.trim()) {
                  const fallbackText =
                    message.preview?.trim() ||
                    message.subject?.trim() ||
                    "This email has no readable content.";

                  renderedBody = `<p>${fallbackText
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#39;")
                    .replace(/\n/g, "<br/>")}</p>`;
                }

                renderedBody = renderThreadMessageHtml(
                  renderedBody,
                  shouldBlockRemoteImages,
                  message.attachments || [],
                );

                const trimmed = stripQuotedHtml(renderedBody);
                const isExpanded = expandedMessageIds.includes(message.id);
                const isActive = activeMessageId === message.id;

                return (
                  <ConversationMessageCard
                    key={message.id}
                    email={message}
                    isExpanded={isExpanded}
                    isActive={isActive}
                    showAvatars={showAvatars}
                    currentUserEmail={currentUserEmail}
                    visibleHtml={trimmed.visibleHtml}
                    quotedHtml={trimmed.quotedHtml}
                    showQuoted={Boolean(quotedOpenById[message.id])}
                    onFocus={() => setActiveMessageId(message.id)}
                    onToggleExpanded={() =>
                      setExpandedMessageIds((prev) =>
                        prev.includes(message.id)
                          ? prev.filter((id) => id !== message.id)
                          : [...prev, message.id],
                      )
                    }
                    onToggleQuoted={() =>
                      setQuotedOpenById((prev) => ({
                        ...prev,
                        [message.id]: !prev[message.id],
                      }))
                    }
                    onDownloadAttachment={onDownloadAttachment}
                    isDarkMode={isDarkMode}
                  />
                );
              })}
              <div
                className="mt-8 rounded-[var(--radius-ryze-lg)] border border-[var(--border-1)] bg-[var(--bg-1)] p-4"
              >
                <div className="mb-4 flex items-center gap-2 font-mono-jetbrains text-[10px] uppercase tracking-[0.08em] text-[var(--fg-2)]">
                  <Reply size={12} />
                  Reply to{" "}
                  {getConversationSenderName(
                    inlineReplyTargetMessage,
                    currentUserEmail,
                  )}
                </div>
                <textarea
                  value={inlineReplyBody}
                  onChange={(event) => {
                    setInlineReplyBody(event.target.value);
                    setInlineReplyError("");
                  }}
                  className="h-24 w-full resize-none bg-transparent text-[14px] leading-relaxed text-[var(--fg-0)] outline-none placeholder:text-[var(--fg-3)]"
                  placeholder="Type a reply..."
                  onFocus={() => setActiveMessageId(activeMessage.id)}
                />
                {inlineReplyError && (
                  <p className="mt-3 text-[12px] text-[var(--danger-token)]">
                    {inlineReplyError}
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleInlineReplySend}
                      disabled={!inlineReplyBody.trim() || isInlineReplySending}
                      className={cn(
                        "flex items-center gap-2 rounded-[var(--radius-ryze-md)] px-4 py-2 text-[13px] font-semibold transition-colors",
                        inlineReplyBody.trim() && !isInlineReplySending
                          ? "bg-[var(--ryze-accent)] text-[var(--ryze-accent-fg)] hover:bg-[var(--ryze-accent-hover)]"
                          : "cursor-not-allowed bg-[var(--bg-3)] text-[var(--fg-3)]",
                      )}
                    >
                      <Send size={13} strokeWidth={2} />
                      {isInlineReplySending ? "Sending..." : "Send"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onReply(inlineReplyTargetMessage)}
                      className="rounded-[var(--radius-ryze-md)] px-3 py-2 text-[13px] font-semibold text-[var(--fg-1)] transition-colors hover:bg-[var(--bg-2)] hover:text-[var(--fg-0)]"
                    >
                      Pop out
                    </button>
                  </div>
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-ryze-sm)] text-[var(--fg-2)] transition-colors hover:bg-[var(--bg-2)] hover:text-[var(--fg-0)]"
                    title="Attach file"
                  >
                    <Paperclip size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {activeMessage && derivedInsights && (
            <ReadingInsightsRail
              isCollapsed={isAiInsightsCollapsed}
              email={activeMessage}
              aiSummary={aiSummary}
              aiKeyPoints={aiKeyPoints}
              aiSuggestedActions={aiSuggestedActions}
              aiError={aiError}
              isAiSummarizing={isAiSummarizing}
              insights={derivedInsights}
              onSummarize={handleAiSummarize}
              onToneSelect={(tone) => onReplyWithTone(tone)}
              onNextAction={() => onReply(activeMessage)}
            />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
