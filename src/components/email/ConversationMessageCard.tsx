import { Download, FileText } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { EmailThread } from "@/types/email";
import {
  getConversationFolderLabel,
  getConversationSenderEmail,
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
  const senderEmail = getConversationSenderEmail(email);
  const folderLabel = getConversationFolderLabel(email);
  const downloadableAttachments =
    email.attachments?.filter((attachment) => !attachment.isInline) || [];

  return (
    <section
      className={cn(
        "border-b border-[var(--border-subtle)] pb-8 transition-colors last:border-b-0",
        isActive && "bg-[color-mix(in_srgb,var(--bg-1)_42%,transparent)]",
      )}
      onClick={onFocus}
    >
      <button
        type="button"
        onClick={() => {
          onFocus();
          onToggleExpanded();
        }}
        className="flex w-full items-start gap-3.5 py-5 text-left"
      >
        {showAvatars && (
          <div
            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-white"
            style={{ backgroundColor: email.sender.color }}
          >
            {email.sender.initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-[15px] font-semibold text-[var(--fg-0)]">
              {senderName}
            </span>
            {senderEmail && (
              <span className="truncate font-mono-jetbrains text-[12px] text-[var(--fg-2)]">
                {senderEmail}
              </span>
            )}
            {folderLabel && (
              <span className="shrink-0 rounded-[var(--radius-ryze-xs)] border border-[var(--border-0)] px-1.5 py-0.5 font-mono-jetbrains text-[10px] uppercase text-[var(--fg-3)]">
                {folderLabel}
              </span>
            )}
          </div>
          <p className="mt-1 font-mono-jetbrains text-[11px] text-[var(--fg-2)]">
            to {email.to.length > 0 ? email.to.join(", ") : currentUserEmail}
          </p>
        </div>
        <span className="shrink-0 pt-1 text-right font-mono-jetbrains text-[11px] text-[var(--fg-2)]">
          {format(email.timestamp, "EEE, MMM d · h:mm a")}
        </span>
      </button>

      {isExpanded && (
        <div className={cn("pb-2", showAvatars ? "ml-[54px]" : "ml-0")}>
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
    </section>
  );
}
