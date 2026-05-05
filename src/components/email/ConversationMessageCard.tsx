import { Download, FileText } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { EmailThread } from "@/types/email";
import {
  getConversationFolderLabel,
  getConversationMessageState,
  getConversationSenderEmail,
  getConversationSenderName,
  isConversationMessageFromCurrentUser,
} from "./threadMessageRendering";
import { SandboxedEmailFrame } from "./SandboxedEmailFrame";

interface ConversationMessageCardProps {
  email: EmailThread;
  isExpanded: boolean;
  isActive: boolean;
  isLatest: boolean;
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
  isLatest,
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
  const senderEmail = getConversationSenderEmail(email);
  const folderLabel = getConversationFolderLabel(email);
  const isFromCurrentUser = isConversationMessageFromCurrentUser(
    email,
    currentUserEmail,
  );
  const messageState = getConversationMessageState(email, currentUserEmail);
  const compactPreview =
    email.preview?.trim() ||
    email.subject?.trim() ||
    "No readable preview.";
  const downloadableAttachments =
    email.attachments?.filter((attachment) => !attachment.isInline) || [];

  return (
    <section
      className={cn(
        "flex w-full transition-colors",
        isFromCurrentUser ? "justify-end" : "justify-start",
      )}
      onClick={onFocus}
    >
      <div
        className={cn(
          "group flex max-w-[min(100%,720px)] gap-3",
          isExpanded ? "w-[min(100%,720px)]" : "w-[min(82%,560px)]",
          isFromCurrentUser && "flex-row-reverse",
        )}
      >
        {showAvatars && !isFromCurrentUser && (
          <div
            className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
            style={{ backgroundColor: email.sender.color }}
          >
            {email.sender.initials}
          </div>
        )}
        <div
          className={cn(
            "min-w-0 flex-1 rounded-[var(--radius-ryze-lg)] border transition-colors",
            isExpanded
              ? "border-[var(--border-1)] bg-[var(--bg-1)] p-4 shadow-[0_16px_38px_-24px_oklch(0_0_0_/_0.65)]"
              : "cursor-pointer border-[var(--border-0)] bg-[var(--bg-1)] px-3.5 py-3 hover:border-[var(--border-1)]",
            isFromCurrentUser &&
              (isExpanded
                ? "border-[color-mix(in_srgb,var(--ryze-accent)_34%,var(--border-1))] bg-[color-mix(in_srgb,var(--ryze-accent-soft)_58%,var(--bg-1))]"
                : "border-[color-mix(in_srgb,var(--ryze-accent)_22%,var(--border-0))] bg-[var(--ryze-accent-soft)]"),
            isActive && "ring-1 ring-[color-mix(in_srgb,var(--ryze-accent)_35%,transparent)]",
            isLatest && isExpanded && "p-5",
          )}
          onClick={() => {
            onFocus();
            if (!isExpanded) {
              onToggleExpanded();
            }
          }}
        >
          <div className="flex min-w-0 items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-[13px] font-semibold text-[var(--fg-0)]">
                  {senderName}
                </span>
                {isExpanded && (
                  <span className="shrink-0 font-mono-jetbrains text-[10px] uppercase tracking-[0.08em] text-[var(--fg-3)]">
                    {messageState}
                  </span>
                )}
              </div>
              {isExpanded && (senderEmail || folderLabel) && (
                <div className="mt-1 flex min-w-0 items-center gap-2 text-[11px] text-[var(--fg-2)]">
                  {senderEmail && (
                    <span className="truncate font-mono-jetbrains">
                      {senderEmail}
                    </span>
                  )}
                  {folderLabel && (
                    <span className="shrink-0 rounded-[var(--radius-ryze-xs)] border border-[var(--border-0)] px-1.5 py-0.5 font-mono-jetbrains text-[10px] uppercase text-[var(--fg-3)]">
                      {folderLabel}
                    </span>
                  )}
                </div>
              )}
            </div>
            <span className="shrink-0 font-mono-jetbrains text-[10px] text-[var(--fg-2)]">
              {format(email.timestamp, isExpanded ? "MMM d, h:mm a" : "h:mm a")}
            </span>
          </div>

          {!isExpanded && (
            <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-[var(--fg-2)]">
              {compactPreview}
            </p>
          )}

          {isExpanded && (
            <div className="mt-4">
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
                className="rounded-full border border-dashed border-[var(--border-0)] px-3 py-1.5 text-[12px] text-[var(--fg-2)] transition-colors hover:border-[var(--ryze-accent)] hover:text-[var(--ryze-accent)]"
              >
                {showQuoted ? "Hide quoted replies" : "Quoted previous replies"}
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
            <div className="mt-6 flex flex-wrap gap-3">
              {downloadableAttachments.map((attachment) => (
                <button
                  key={attachment.id}
                  type="button"
                  onClick={() =>
                    onDownloadAttachment(
                      email.messageId,
                      attachment.id,
                      attachment.filename,
                    )
                  }
                  className="flex min-w-[210px] max-w-[280px] items-center gap-3 rounded-[var(--radius-ryze-md)] border border-[var(--border-0)] bg-[var(--bg-1)] px-3 py-3 text-left transition-colors hover:border-[var(--border-1)] hover:bg-[var(--bg-2)]"
                  title={`Download ${attachment.filename}`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-ryze-sm)] bg-[var(--bg-2)] text-[var(--fg-2)]">
                    <FileText size={15} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono-jetbrains text-[12px] font-semibold text-[var(--fg-0)]">
                      {attachment.filename}
                    </span>
                    <span className="mt-1 block font-mono-jetbrains text-[10px] text-[var(--fg-2)]">
                      {Math.max(1, Math.round(attachment.size / 1024))} KB
                    </span>
                  </span>
                  <Download
                    size={13}
                    className="shrink-0 text-[var(--fg-3)]"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
          )}
        </div>
      </div>
    </section>
  );
}
