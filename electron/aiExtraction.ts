import { db } from "./database";
import { AiExtraction } from "../src/types/email";
import crypto from "crypto";
import { getGeminiApiKey, getGeminiModel } from "./aiUtils";

export async function getAiExtractions(messageId: string, bodyText: string): Promise<AiExtraction[]> {
  const cached = db.prepare("SELECT * FROM ai_extractions WHERE messageId = ?").all(messageId) as AiExtraction[];
  if (cached.length > 0) return cached;

  let apiKey: string;
  let model: string;
  try {
    apiKey = getGeminiApiKey();
    model = getGeminiModel();
  } catch (error) {
    console.error("AI Extraction skipped:", error instanceof Error ? error.message : error);
    return [];
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Extract calendar events and tasks from this email. Return ONLY a JSON array of objects with 'type' (event/task) and 'content' (for events: {title, start, end}, for tasks: {title}). Email: ${bodyText}` }] }]
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error (${response.status}): ${errorText}`);
      return [];
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) return [];

    // Clean up potential markdown formatting from Gemini
    const jsonMatch = resultText.match(/\[.*\]/s);
    const extractions = JSON.parse(jsonMatch ? jsonMatch[0] : resultText);

    const stmt = db.prepare("INSERT INTO ai_extractions (id, messageId, type, content, createdAt) VALUES (?, ?, ?, ?, ?)");
    for (const ex of extractions) {
      const id = `ext-${crypto.randomUUID()}`;
      stmt.run(id, messageId, ex.type, JSON.stringify(ex.content), new Date().toISOString());
    }

    return db.prepare("SELECT * FROM ai_extractions WHERE messageId = ?").all(messageId) as AiExtraction[];
  } catch (error) {
    console.error("AI Extraction failed:", error);
    return [];
  }
}
