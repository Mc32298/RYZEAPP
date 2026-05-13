import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAiExtractions } from "./aiExtraction";
import { db } from "./database";

vi.mock("./database", () => {
  return {
    db: {
      prepare: vi.fn().mockReturnValue({
        all: vi.fn(),
        run: vi.fn(),
      }),
    },
  };
});

global.fetch = vi.fn();

describe("getAiExtractions", () => {
  const messageId = "msg123";
  const bodyText = "Meeting at 2pm tomorrow about the project.";

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = "test-api-key";
    
    // Default mock for db.prepare
    (db.prepare as any).mockReturnValue({
      all: vi.fn().mockReturnValue([]),
      run: vi.fn(),
    });
  });

  it("returns cached extractions if they exist", async () => {
    const cachedData = [
      { id: "ext-1", messageId, type: "event", content: '{"title":"Meeting"}', createdAt: "2023-01-01" },
    ];
    (db.prepare("SELECT * FROM ai_extractions WHERE messageId = ?").all as any).mockReturnValue(cachedData);

    const result = await getAiExtractions(messageId, bodyText);

    expect(result).toEqual(cachedData);
    expect(db.prepare).toHaveBeenCalledWith("SELECT * FROM ai_extractions WHERE messageId = ?");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("calls Gemini API and saves results if no cache", async () => {
    const mockAll = vi.fn()
      .mockReturnValueOnce([]) // Initial cache check
      .mockReturnValueOnce([ // Return from DB after insert
        { id: "ext-2", messageId, type: "event", content: '{"title":"Meeting","start":"...","end":"..."}', createdAt: "..." }
      ]);
    
    (db.prepare as any).mockReturnValue({
      all: mockAll,
      run: vi.fn(),
    });

    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: '[{"type":"event","content":{"title":"Meeting","start":"...","end":"..."}}]',
                },
              ],
            },
          },
        ],
      }),
    });

    const result = await getAiExtractions(messageId, bodyText);

    expect(fetch).toHaveBeenCalled();
    expect(db.prepare).toHaveBeenCalledWith("INSERT INTO ai_extractions (id, messageId, type, content, createdAt) VALUES (?, ?, ?, ?, ?)");
    expect(result.length).toBe(1);
    expect(result[0].type).toBe("event");
  });

  it("returns empty array if API key is missing", async () => {
    delete process.env.GEMINI_API_KEY;

    const result = await getAiExtractions(messageId, bodyText);

    expect(result).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });
});
