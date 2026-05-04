import { ChevronDown, ChevronRight, Download, Paperclip } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { EmailThread } from "@/types/email";
import {
  getConversationFolderLabel,
  getConversationSenderName,
} from "./threadMessageRendering";
import { SandboxedEmailFrame } from "./SandboxedEmailFrame";

interface ConversationMessageCardProps {
  email: EmailThread;
  isExpanded: boolean;
  isActive: boolean;
  showAvatars: boolean;
  currentUserEmail: string;
  visibleHtml: string;
  quotedHtml: string;
  showQuoted: boolean;
  isDarkMode: boolean;
  onToggleExpanded: () => void;
  onToggleQuoted: () => void;
  onFocus: () => void;
  onDownloadAttachment: (
    messageId: string,
    attachmentId: string,
    filename: string,
  ) => void;
}

export function ConversationMessageCard({
  email,
  isExpanded,
  isActive,
  showAvatars,
  currentUserEmail,
  visibleHtml,
  quotedHtml,
  showQuoted,
  isDarkMode,
  onToggleExpanded,
  onToggleQuoted,
  onFocus,
  onDownloadAttachment,
}: ConversationMessageCardProps) {
  const senderName = getConversationSenderName(email, currentUserEmail);
  const folderLabel = getConversationFolderLabel(email);
  const downloadableAttachments =
    email.attachments?.filter((attachment) => !attachment.isInline) || [];

  return (
    <section
      className={cn(
        "rounded-[var(--radius-ryze-md)] border transition-colors",
        isActive
          ? "border-[var(--ryze-accent)] bg-[var(--bg-1)]"
          : "border-[var(--border-subtle)] bg-[var(--bg-1)]",
      )}
    >
      <button
        type="button"
        onClick={() => {
          onFocus();
          onToggleExpanded();
        }}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            {showAvatars && (
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] text-xs font-semibold text-white"
                style={{ backgroundColor: email.sender.color }}
              >
                {email.sender.initials}
              </div>
            )}
            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-[var(--fg-0)]">
              {senderName}
            </span>
            {folderLabel && (
              <span className="shrink-0 rounded-[var(--radius-ryze-xs)] border border-[var(--border-0)] px-1.5 py-0.5 font-mono-jetbrains text-[10px] uppercase text-[var(--fg-3)]">
                {folderLabel}
              </span>
            )}
          </div>
          <p className="mt-1 line-clamp-1 text-[12px] text-[var(--fg-2)]">
            {email.preview}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-right font-mono-jetbrains text-[10px] text-[var(--fg-3)]">
            {format(email.timestamp, "MMM d, yyyy · HH:mm")}
          </span>
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-[var(--border-subtle)] px-4 pb-4 pt-3">
          <SandboxedEmailFrame
            html={visibleHtml}
            isDarkMode={isDarkMode}
            className="prose prose-invert max-w-none"
          />

          {quotedHtml && (
            <div className="mt-4">
              <button
                type="button"
                onClick={onToggleQuoted}
                className="text-[12px] text-[var(--ryze-accent)]"
              >
                {showQuoted ? "Hide quoted text" : "Show quoted text"}
              </button>
              {showQuoted && (
                <div className="mt-3 border-l border-[var(--border-1)] pl-4">
                  <SandboxedEmailFrame
                    html={quotedHtml}
                    isDarkMode={isDarkMode}
                  />
                </div>
              )}
            </div>
          )}

          {downloadableAttachments.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {downloadableAttachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-2 rounded-[var(--radius-ryze-sm)] border border-[var(--border-0)] px-2.5 py-2 text-[12px] text-[var(--fg-2)]"
                >
                  <Paperclip size={12} />
                  <span className="max-w-[220px] truncate">
                    {attachment.filename}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onDownloadAttachment(
                        email.messageId,
                        attachment.id,
                        attachment.filename,
                      )
                    }
                    className="ml-1 inline-flex items-center gap-1 rounded-[var(--radius-ryze-xs)] border border-[var(--border-0)] bg-[var(--bg-2)] px-2 py-1 text-[11px] font-semibold text-[var(--fg-1)] transition-colors hover:bg-[var(--bg-3)] hover:text-[var(--fg-0)]"
                  >
                    <Download size={11} />
                    Download
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
