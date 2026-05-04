import {
  Clock3,
  Sparkles,
} from "lucide-react";
import type { EmailThread } from "@/types/email";
import type { AiTone, ReadingInsightModel } from "./readingInsights";

interface ReadingInsightsRailProps {
  email: EmailThread;
  aiSummary: string;
  aiKeyPoints: string[];
  aiSuggestedActions: string[];
  aiError: string;
  isAiSummarizing: boolean;
  insights: ReadingInsightModel;
  onSummarize: () => void;
  onToneSelect: (tone: AiTone) => void;
  onNextAction: () => void;
}

const toneLabels: Record<AiTone, string> = {
  short: "Short",
  polite: "Polite",
  firm: "Firm",
  detailed: "Detailed",
  decline: "Decline",
  "follow-up": "Follow up",
};

export function ReadingInsightsRail({
  email,
  aiSummary,
  aiKeyPoints,
  aiSuggestedActions,
  aiError,
  isAiSummarizing,
  insights,
  onSummarize,
  onToneSelect,
  onNextAction,
}: ReadingInsightsRailProps) {
  const summaryText = aiSummary || insights.summaryFallback;
  const keyPoints =
    aiKeyPoints.length > 0 ? aiKeyPoints : insights.primaryPanel.items;
  const suggestedActions =
    aiSuggestedActions.length > 0
      ? aiSuggestedActions
      : [insights.nextAction.label, ...insights.reminderOptions.slice(0, 2)];

  return (
    <aside className="flex h-full w-[320px] shrink-0 flex-col border-l border-[var(--border-subtle)] bg-[var(--bg-1)] px-4 py-4 text-[var(--fg-1)]">
      <div className="border-b border-[var(--border-subtle)] pb-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[var(--fg-0)]">
            <Sparkles size={14} className="text-[var(--ryze-accent)]" />
            <p className="text-[14px] font-semibold">AI summary</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-[4px] border border-[var(--ryze-accent)] px-2 py-1 font-mono-jetbrains text-[10px] text-[var(--ryze-accent)]">
              on-device
            </span>
            <button
              type="button"
              onClick={onSummarize}
              className="rounded-[4px] border border-[var(--border-0)] px-2 py-1 font-mono-jetbrains text-[10px] text-[var(--fg-2)] transition-colors hover:bg-[var(--bg-2)] hover:text-[var(--fg-0)]"
            >
              refresh
            </button>
          </div>
        </div>
        <p className="font-mono-jetbrains text-[10.5px] text-[var(--fg-3)]">
          {email.threadCount || 1} messages · {isAiSummarizing ? "working..." : "1.8s"} · local key
        </p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pt-4">
        <section>
          <p className="text-[13px] leading-7 text-[var(--fg-1)]">
            {aiError
              ? "Summary unavailable. Local insight cards are still active."
              : summaryText}
          </p>
        </section>

        <section className="border-t border-[var(--border-subtle)] pt-4">
          <h2 className="mb-3 font-mono-jetbrains text-[10px] uppercase tracking-[0.08em] text-[var(--fg-3)]">
            Key points
          </h2>
          <div className="space-y-2.5">
            {keyPoints.map((item) => (
              <p
                key={item}
                className="text-[13px] leading-relaxed text-[var(--fg-1)]"
              >
                <span className="mr-2 text-[var(--ryze-accent)]">-</span>
                {item}
              </p>
            ))}
          </div>
        </section>

        <section className="border-t border-[var(--border-subtle)] pt-4">
          <h2 className="mb-3 font-mono-jetbrains text-[10px] uppercase tracking-[0.08em] text-[var(--fg-3)]">
            Suggested actions
          </h2>
          <div className="space-y-2">
            {suggestedActions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={onNextAction}
                className="flex w-full items-start gap-3 rounded-[6px] border border-[var(--border-subtle)] px-3 py-3 text-left text-[13px] text-[var(--fg-1)] transition-colors hover:border-[var(--border-1)] hover:bg-[var(--bg-2)]"
              >
                <span className="mt-0.5 h-4 w-4 rounded-[4px] border border-[var(--border-1)]" />
                <span>{item}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="border-t border-[var(--border-subtle)] pt-4">
          <div className="mb-3 flex items-center gap-2 text-[var(--fg-3)]">
            <Clock3 size={13} className="text-[var(--ryze-accent)]" />
            <h2 className="font-mono-jetbrains text-[10px] uppercase tracking-[0.08em]">
              Tone
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {insights.toneOptions.map((tone) => (
              <button
                key={tone}
                type="button"
                onClick={() => onToneSelect(tone)}
                className="rounded-[6px] border border-[var(--border-subtle)] px-2.5 py-1.5 text-[11px] text-[var(--fg-2)] transition-colors hover:bg-[var(--bg-2)] hover:text-[var(--fg-0)]"
              >
                {toneLabels[tone]}
              </button>
            ))}
          </div>
        </section>

        <div className="rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-3 font-mono-jetbrains text-[10.5px] leading-relaxed text-[var(--fg-2)]">
          Summary generated locally. Thread contents stay on this device except when you explicitly trigger an external provider.
        </div>
      </div>
    </aside>
  );
}
