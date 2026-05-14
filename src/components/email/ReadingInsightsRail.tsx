import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Clock3, RefreshCw, Reply, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import type { EmailThread } from "@/types/email";
import type { AiSuggestedAction } from "./aiSummary";
import type {
  AiTone,
  ContactContextModel,
  ReadingInsightModel,
} from "./readingInsights";

interface ReadingInsightsRailProps {
  isCollapsed: boolean;
  email: EmailThread;
  aiSummary: string;
  aiKeyPoints: string[];
  aiSuggestedActions: AiSuggestedAction[];
  aiConfidence: number;
  aiUncertainty: string;
  canTrustAiActions: boolean;
  isActionBusy: boolean;
  aiError: string;
  isAiSummarizing: boolean;
  isAiDrafting: boolean;
  insights: ReadingInsightModel;
  contactContext: ContactContextModel | null;
  onSummarize: () => void;
  onToneSelect: (tone: AiTone) => void;
  onNextAction: (actionId: "reply" | "remind_3d" | "remind_7d") => void;
}

const toneLabels: Record<AiTone, string> = {
  short: "Short",
  polite: "Polite",
  firm: "Firm",
  detailed: "Detailed",
  decline: "Decline",
  "follow-up": "Follow up",
};

const RAIL_TRANSITION = {
  duration: 0.22,
  ease: [0.22, 1, 0.36, 1] as const,
};

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-mono-jetbrains text-[10px] uppercase tracking-[0.08em] text-[var(--fg-3)]">
      {children}
    </h2>
  );
}

export function ReadingInsightsRail({
  isCollapsed,
  email,
  aiSummary,
  aiKeyPoints,
  aiSuggestedActions,
  aiConfidence,
  aiUncertainty,
  canTrustAiActions,
  isActionBusy,
  aiError,
  isAiSummarizing,
  isAiDrafting,
  insights,
  contactContext,
  onSummarize,
  onToneSelect,
  onNextAction,
}: ReadingInsightsRailProps) {
  const summaryText = aiSummary || insights.summaryFallback;
  const keyPoints =
    aiKeyPoints.length > 0 ? aiKeyPoints : insights.primaryPanel.items;
  const visibleSignals = keyPoints.slice(0, 2);
  const suggestedActions: AiSuggestedAction[] =
    aiSuggestedActions.length > 0
      ? aiSuggestedActions
      : [
          ...insights.actionItems.slice(0, 2).map((label) => ({
            actionId: "reply" as const,
            label,
            reason: "",
            confidence: 0.55,
            requiresConfirmation: false,
          })),
          {
            actionId: "reply" as const,
            label: insights.nextAction.label,
            reason: "",
            confidence: 0.55,
            requiresConfirmation: false,
          },
        ].slice(0, 3);
  const actionButtons: Array<{
    id: "reply" | "remind_3d" | "remind_7d";
    label: string;
    icon: typeof Reply;
    tone: "primary" | "secondary";
  }> = [
    { id: "reply", label: "Draft reply", icon: Reply, tone: "primary" },
    { id: "remind_3d", label: "3 days", icon: Clock3, tone: "secondary" },
  ];
  const contextBadges = contactContext
    ? [
        `Trust: ${contactContext.trustStatus}`,
        contactContext.relationshipStrength,
        ...(contactContext.knownLabels[0] ? [contactContext.knownLabels[0]] : []),
      ]
    : [];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 14 : 320 }}
      transition={RAIL_TRANSITION}
      className="flex h-full shrink-0 flex-col overflow-hidden border-l border-[var(--border-subtle)] bg-[var(--bg-1)] text-[var(--fg-1)]"
    >
      <AnimatePresence initial={false} mode="wait">
        {!isCollapsed && (
          <motion.div
            key="insights-content"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{
              opacity: { duration: 0.14, ease: "easeOut" },
              x: RAIL_TRANSITION,
            }}
            className="flex h-full min-w-[320px] flex-col px-4 py-4"
          >
            <div className="border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[var(--fg-0)]">
                  <Sparkles size={14} className="text-[var(--ryze-accent)]" />
                  <p className="text-[13px] font-semibold">Insights</p>
                </div>
                <button
                  type="button"
                  onClick={onSummarize}
                  title="Refresh summary"
                  className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[var(--fg-3)] transition-colors hover:bg-[var(--bg-2)] hover:text-[var(--fg-0)]"
                >
                  <RefreshCw size={13} />
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2 font-mono-jetbrains text-[10px] text-[var(--fg-3)]">
                <span>{email.threadCount || 1} msg</span>
                <span>local</span>
                <span>{isAiSummarizing ? "working" : "ready"}</span>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pt-4">
              <section className="space-y-3">
                <SectionLabel>Next actions</SectionLabel>
                <div className="grid grid-cols-1 gap-2">
                  {actionButtons.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.id}
                        type="button"
                        onClick={() => onNextAction(action.id)}
                        disabled={!canTrustAiActions || isActionBusy}
                        className={
                          action.tone === "primary"
                            ? "flex items-center gap-2 rounded-[6px] border border-[var(--ryze-accent)] bg-[var(--ryze-accent-soft)] px-3 py-2 text-left text-[12px] font-medium text-[var(--ryze-accent)] transition-colors hover:bg-[var(--bg-2)] disabled:cursor-not-allowed disabled:opacity-50"
                            : "flex items-center gap-2 rounded-[6px] border border-[var(--border-subtle)] px-3 py-2 text-left text-[12px] text-[var(--fg-2)] transition-colors hover:bg-[var(--bg-2)] hover:text-[var(--fg-0)] disabled:cursor-not-allowed disabled:opacity-50"
                        }
                      >
                        <Icon size={13} />
                        {action.label}
                      </button>
                    );
                  })}
                </div>
                {suggestedActions.length > 0 && (
                  <div className="space-y-1.5">
                    {suggestedActions.slice(0, 2).map((item) => (
                      <p
                        key={`${item.actionId}-${item.label}`}
                        className="rounded-[6px] border border-[var(--border-subtle)] px-2.5 py-2 text-[12px] leading-relaxed text-[var(--fg-2)]"
                      >
                        {item.label}
                      </p>
                    ))}
                  </div>
                )}
                <p className="font-mono-jetbrains text-[10px] text-[var(--fg-3)]">
                  AI confidence: {Math.round(aiConfidence * 100)}%
                </p>
                {!canTrustAiActions && (
                  <p className="rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-2.5 py-2 text-[11px] text-[var(--fg-2)]">
                    {aiUncertainty || "Confidence is low. Review manually before acting."}
                  </p>
                )}
              </section>

              <section className="space-y-3 border-t border-[var(--border-subtle)] pt-4">
                <SectionLabel>Summary</SectionLabel>
                <p className="text-[13px] leading-6 text-[var(--fg-1)]">
                  {aiError
                    ? "Summary unavailable. Local insight cards are still active."
                    : summaryText}
                </p>
              </section>

              <section className="border-t border-[var(--border-subtle)] pt-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <SectionLabel>Signals</SectionLabel>
                  <button
                    type="button"
                    onClick={() => onNextAction("remind_7d")}
                    className="font-mono-jetbrains text-[10px] text-[var(--fg-3)] transition-colors hover:text-[var(--fg-1)]"
                  >
                    next week
                  </button>
                </div>
                <div className="space-y-1.5">
                  {visibleSignals.map((item) => (
                    <p
                      key={item}
                      className="rounded-[6px] border border-[var(--border-subtle)] px-2.5 py-2 text-[12px] leading-relaxed text-[var(--fg-2)]"
                    >
                      {item}
                    </p>
                  ))}
                  {suggestedActions.map((item) => (
                    <div
                      key={`${item.actionId}-${item.label}-signal`}
                      className="rounded-[6px] border border-transparent px-2.5 py-1 text-[12px] leading-relaxed text-[var(--fg-3)]"
                    >
                      {item.label}
                    </div>
                  ))}
                </div>
              </section>

              <section className="border-t border-[var(--border-subtle)] pt-4">
                <div className="mb-2 flex items-center gap-2 text-[var(--fg-3)]">
                  <Clock3 size={13} className="text-[var(--ryze-accent)]" />
                  <SectionLabel>Tone</SectionLabel>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {insights.toneOptions.map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      disabled={isAiDrafting}
                      onClick={() => onToneSelect(tone)}
                      className="flex items-center justify-center gap-1 rounded-[5px] border border-[var(--border-subtle)] px-2 py-1.5 text-[10.5px] text-[var(--fg-2)] transition-colors hover:bg-[var(--bg-2)] hover:text-[var(--fg-0)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isAiDrafting ? <Loader2 size={10} className="animate-spin" /> : null}
                      {toneLabels[tone]}
                    </button>
                  ))}
                </div>
              </section>
              {contactContext && (
                <section className="border-t border-[var(--border-subtle)] pt-4">
                  <SectionLabel>Contact</SectionLabel>
                  <div className="mt-3 space-y-2 text-[12px] text-[var(--fg-2)]">
                    <div className="flex flex-wrap gap-1.5">
                      {contextBadges.map((badge) => (
                        <span
                          key={badge}
                          className="rounded-[4px] border border-[var(--border-0)] px-2 py-1 font-mono-jetbrains text-[10px] text-[var(--fg-2)]"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                    <p className="leading-relaxed">
                      {contactContext.accountHistorySummary}
                    </p>
                    <p className="leading-relaxed">
                      {contactContext.lastReplySummary}
                    </p>
                    {contactContext.recentThreadSubjects[0] && (
                      <p className="truncate text-[var(--fg-3)]">
                        {contactContext.recentThreadSubjects[0]}
                      </p>
                    )}
                  </div>
                </section>
              )}

              <div className="border-t border-[var(--border-subtle)] pt-3 font-mono-jetbrains text-[10px] text-[var(--fg-3)]">
                Local by default
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}
