import React, { useState, useEffect, useRef } from "react";
import DOMPurify from "dompurify";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Minimize2,
  Maximize2,
  Send,
  ChevronDown,
  Clock,
  Sparkles,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AiTone } from "./readingInsights";

export interface ComposeDraft {
  id: string;
  to: string;
  cc: string;
  subject: string;
  body: string;
  isMinimized: boolean;
  isFullscreen: boolean;
  aiTone?: AiTone;
  aiHint?: string;
}

interface ComposeDrawerProps {
  drafts: ComposeDraft[];
  onDraftUpdate: (id: string, updates: Partial<ComposeDraft>) => void;
  onDraftClose: (id: string) => void;
  onDraftSend: (id: string) => void;
  onDraftMinimize: (id: string) => void;
  onDraftRestore: (id: string) => void;
  onDraftFullscreen: (id: string) => void;
}

function ComposeCard({
  draft,
  onUpdate,
  onClose,
  onSend,
  onMinimize,
  onFullscreen,
}: {
  draft: ComposeDraft;
  onUpdate: (updates: Partial<ComposeDraft>) => void;
  onClose: () => void;
  onSend: () => void;
  onMinimize: () => void;
  onFullscreen: () => void;
}) {
  const [showCC, setShowCC] = useState(false);
  const [lastEditedAt, setLastEditedAt] = useState<Date | null>(null);
  const toRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!draft.isMinimized) {
      toRef.current?.focus();
    }
  }, [draft.isMinimized]);

  useEffect(() => {
    if (!editorRef.current) return;

    if (editorRef.current.innerHTML !== draft.body) {
      editorRef.current.innerHTML = draft.body || "";
    }
  }, [draft.body]);

  const updateDraft = (updates: Partial<ComposeDraft>) => {
    setLastEditedAt(new Date());
    onUpdate(updates);
  };

  const autosaveLabel = lastEditedAt
    ? `Saved ${lastEditedAt.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    : "Autosave ready";

  if (draft.isMinimized) return null;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "flex flex-col overflow-hidden rounded-t-[var(--radius-ryze-lg)] border border-[var(--border-1)] bg-[var(--bg-2)] shadow-[0_16px_48px_-12px_oklch(0_0_0_/_0.6)]",
        draft.isFullscreen ? "fixed inset-4 z-50" : "h-[520px] w-[480px]",
      )}
    >
      <div className="flex shrink-0 cursor-move select-none items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-1)] px-4 py-3">
        <div className="min-w-0">
          <span className="block truncate text-[13px] font-medium text-[var(--fg-1)]">
            {draft.subject || "New message"}
          </span>
          {draft.aiTone && (
            <div className="mt-1 flex items-center gap-2">
              <Sparkles size={12} className="text-[var(--ryze-accent)]" />
              <span className="text-[11px] text-[var(--fg-3)]">
                Tone: {draft.aiTone}
                {draft.aiHint ? ` · ${draft.aiHint}` : ""}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onMinimize}
            className="rounded-[var(--radius-ryze-sm)] p-1 text-[var(--fg-3)] transition-colors hover:bg-[var(--bg-3)] hover:text-[var(--fg-1)]"
            title="Minimize"
          >
            <Minimize2 size={13} strokeWidth={1.5} />
          </button>
          <button
            onClick={onFullscreen}
            className="rounded-[var(--radius-ryze-sm)] p-1 text-[var(--fg-3)] transition-colors hover:bg-[var(--bg-3)] hover:text-[var(--fg-1)]"
            title="Expand"
          >
            <Maximize2 size={13} strokeWidth={1.5} />
          </button>
          <button
            onClick={onClose}
            className="rounded-[var(--radius-ryze-sm)] p-1 text-[var(--fg-3)] transition-colors hover:bg-[var(--bg-3)] hover:text-[var(--danger-token)]"
            title="Close"
          >
            <X size={13} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-4 py-2.5">
          <span className="w-7 shrink-0 text-[12px] text-[var(--fg-2)]">
            To
          </span>
          <input
            ref={toRef}
            type="text"
            value={draft.to}
            onChange={(event) => updateDraft({ to: event.target.value })}
            className="flex-1 bg-transparent text-[13px] text-[var(--fg-0)] outline-none placeholder:text-[var(--fg-3)]"
            placeholder="Recipients"
          />
          <button
            onClick={() => setShowCC(!showCC)}
            className="text-[12px] text-[var(--fg-3)] transition-colors hover:text-[var(--fg-1)]"
          >
            CC
          </button>
        </div>

        {showCC && (
          <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-4 py-2.5">
            <span className="w-7 shrink-0 text-[12px] text-[var(--fg-2)]">
              CC
            </span>
            <input
              type="text"
              value={draft.cc}
              onChange={(event) => updateDraft({ cc: event.target.value })}
              className="flex-1 bg-transparent text-[13px] text-[var(--fg-0)] outline-none placeholder:text-[var(--fg-3)]"
              placeholder="CC recipients"
            />
          </div>
        )}

        <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-4 py-2.5">
          <span className="w-7 shrink-0 text-[12px] text-[var(--fg-2)]">
            Re
          </span>
          <input
            type="text"
            value={draft.subject}
            onChange={(event) => updateDraft({ subject: event.target.value })}
            className="flex-1 bg-transparent text-[13px] font-medium text-[var(--fg-0)] outline-none placeholder:text-[var(--fg-3)]"
            placeholder="Subject"
          />
        </div>

        <div
          ref={editorRef}
          contentEditable
          role="textbox"
          aria-multiline="true"
          data-placeholder="Write your message..."
          onInput={(event) => {
            const html = (event.currentTarget as HTMLDivElement).innerHTML;

            updateDraft({
              body: DOMPurify.sanitize(html, {
                USE_PROFILES: { html: true },
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
                ],
                FORBID_ATTR: [
                  "onerror",
                  "onload",
                  "onclick",
                  "onmouseover",
                  "srcdoc",
                ],
                ALLOW_DATA_ATTR: false,
              }),
            });
          }}
          className="compose-html-editor flex-1 overflow-y-auto bg-transparent p-4 text-[14px] leading-relaxed text-[var(--fg-0)] outline-none scrollbar-thin empty:before:pointer-events-none empty:before:text-[var(--fg-3)] empty:before:content-[attr(data-placeholder)]"
        />

        <div className="flex shrink-0 items-center justify-between border-t border-[var(--border-subtle)] px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <button
              onClick={onSend}
              disabled={!draft.to}
              className={cn(
                "flex h-8 items-center gap-2 rounded-[var(--radius-ryze-md)] px-3 text-[13px] font-medium transition-colors",
                draft.to
                  ? "bg-[var(--ryze-accent)] text-[var(--ryze-accent-fg)] hover:bg-[var(--ryze-accent-hover)]"
                  : "cursor-not-allowed bg-[var(--bg-3)] text-[var(--fg-3)]",
              )}
            >
              <Send size={13} strokeWidth={2} />
              Send
            </button>
            <button
              type="button"
              className="flex h-8 items-center gap-1.5 rounded-[var(--radius-ryze-md)] border border-[var(--border-0)] px-3 text-[12px] text-[var(--fg-2)] transition-colors hover:border-[var(--ryze-accent)] hover:bg-[var(--bg-3)] hover:text-[var(--fg-0)]"
              title="Schedule send"
            >
              <Clock size={12} />
              Later
            </button>
          </div>
          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden min-w-0 items-center gap-2 lg:flex">
              {[
                ["Tone", draft.body.length > 160],
                ["Clarity", Boolean(draft.subject.trim())],
                ["Length", draft.body.length > 0 && draft.body.length < 1200],
              ].map(([label, active]) => (
                <span
                  key={label as string}
                  className={cn(
                    "flex items-center gap-1 rounded-[var(--radius-ryze-sm)] border px-2 py-1 text-[10px]",
                    active
                      ? "border-[var(--ryze-accent)] bg-[var(--ryze-accent-soft)] text-[var(--ryze-accent)]"
                      : "border-[var(--border-0)] text-[var(--fg-3)]",
                  )}
                >
                  {active ? <Check size={10} /> : <Sparkles size={10} />}
                  {label}
                </span>
              ))}
            </div>
            <span className="hidden font-mono-jetbrains text-[10px] text-[var(--fg-3)] sm:inline">
              {autosaveLabel}
            </span>
            <button
              onClick={onClose}
              className="text-[12px] text-[var(--fg-3)] transition-colors hover:text-[var(--fg-1)]"
            >
              Discard
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ComposeDrawer({
  drafts,
  onDraftUpdate,
  onDraftClose,
  onDraftSend,
  onDraftMinimize,
  onDraftRestore,
  onDraftFullscreen,
}: ComposeDrawerProps) {
  const minimizedDrafts = drafts.filter((draft) => draft.isMinimized);
  const activeDrafts = drafts.filter((draft) => !draft.isMinimized);

  return (
    <>
      <div className="fixed bottom-0 right-4 z-40 flex items-end gap-3">
        <AnimatePresence>
          {activeDrafts.map((draft) => (
            <ComposeCard
              key={draft.id}
              draft={draft}
              onUpdate={(updates) => onDraftUpdate(draft.id, updates)}
              onClose={() => onDraftClose(draft.id)}
              onSend={() => onDraftSend(draft.id)}
              onMinimize={() => onDraftMinimize(draft.id)}
              onFullscreen={() => onDraftFullscreen(draft.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {minimizedDrafts.length > 0 && (
        <div className="fixed bottom-0 right-4 z-40 flex gap-2">
          <AnimatePresence>
            {minimizedDrafts.map((draft) => (
              <motion.button
                key={draft.id}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => onDraftRestore(draft.id)}
                className="flex items-center gap-2 rounded-t-[var(--radius-ryze-md)] border border-b-0 border-[var(--border-1)] bg-[var(--bg-2)] px-4 py-2.5 text-[13px] font-medium text-[var(--fg-2)] shadow-[0_16px_48px_-12px_oklch(0_0_0_/_0.6)] transition-colors hover:text-[var(--fg-0)]"
              >
                <span className="max-w-[160px] truncate">
                  {draft.subject || "New message"}
                </span>
                <ChevronDown size={12} className="shrink-0" />
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    onDraftClose(draft.id);
                  }}
                  className="ml-1 text-[var(--fg-3)] transition-colors hover:text-[var(--danger-token)]"
                >
                  <X size={11} />
                </button>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
