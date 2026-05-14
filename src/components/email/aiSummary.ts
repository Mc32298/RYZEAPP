export type AiActionId = "reply" | "remind_3d" | "remind_7d";

export interface AiSuggestedAction {
  actionId: AiActionId;
  label: string;
  reason: string;
  confidence: number;
  requiresConfirmation: boolean;
}

export interface AiSummaryResult {
  summary: string;
  keyPoints: string[];
  suggestedActions: AiSuggestedAction[];
  confidence: number;
  uncertainty: string;
}

export const LOW_CONFIDENCE_THRESHOLD = 0.55;
