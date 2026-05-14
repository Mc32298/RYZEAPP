import { describe, expect, it } from "vitest";
import { normalizeAiSummaryResult } from "./validation";

describe("normalizeAiSummaryResult", () => {
  it("parses structured actions and confidence fields", () => {
    const raw = JSON.stringify({
      summary: "Need a reply by Friday.",
      keyPoints: ["Deadline Friday"],
      suggestedActions: [
        {
          actionId: "reply",
          label: "Draft a deadline-confirmation reply",
          reason: "Sender asked for confirmation",
          confidence: 0.91,
          requiresConfirmation: false,
        },
      ],
      confidence: 0.88,
      uncertainty: "",
    });

    const normalized = normalizeAiSummaryResult(raw);
    expect(normalized.summary).toContain("Friday");
    expect(normalized.suggestedActions).toHaveLength(1);
    expect(normalized.suggestedActions[0].actionId).toBe("reply");
    expect(normalized.suggestedActions[0].confidence).toBe(0.91);
    expect(normalized.confidence).toBe(0.88);
  });

  it("falls back to low-confidence summary when JSON is invalid", () => {
    const normalized = normalizeAiSummaryResult("plain summary without json");
    expect(normalized.summary).toContain("plain summary");
    expect(normalized.suggestedActions).toEqual([]);
    expect(normalized.confidence).toBe(0.45);
    expect(normalized.uncertainty).toContain("could not be parsed");
  });
});
