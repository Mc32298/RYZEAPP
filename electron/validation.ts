// electron/validation.ts
import crypto from "crypto";
import { isValidAccountId } from "./accountId";
import type { GraphFolderKey, BackendSettings } from "./types";

/** Well-known Microsoft Graph folder keys that are valid move destinations */
export const allowedMoveDestinations = new Set<GraphFolderKey>([
  "inbox",
  "sentitems",
  "drafts",
  "archive",
  "deleteditems",
]);

export const allowedFolderIcons = new Set([
  "folder",
  "briefcase",
  "users",
  "star",
  "heart",
  "home",
  "receipt",
  "shopping",
  "travel",
  "code",
  "bank",
  "alert",
  "archive",
  "tag",
]);

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function assertString(
  value: unknown,
  fieldName: string,
  maxLength = 4096,
): string {
  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be a string`);
  }

  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error(`${fieldName} is required`);
  }

  if (trimmed.length > maxLength) {
    throw new Error(`${fieldName} is too long`);
  }

  return trimmed;
}

export function optionalString(
  value: unknown,
  fieldName: string,
  maxLength = 4096,
): string {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be a string`);
  }

  if (value.length > maxLength) {
    throw new Error(`${fieldName} is too long`);
  }

  return value;
}

/**
 * Validates an accountId string.
 * Must follow the pattern: (ms|google)-<alphanumeric/dot/dash/underscore>
 */
export function validateAccountId(accountId: unknown): string {
  const value = assertString(accountId, "accountId", 256);

  if (!isValidAccountId(value)) {
    throw new Error("Invalid accountId");
  }

  return value;
}

/**
 * Validates a Microsoft Graph message ID (opaque string, just length-checks it).
 */
export function validateMessageId(messageId: unknown): string {
  return assertString(messageId, "messageId", 2048);
}

export function validateLabelId(labelId: unknown): string {
  const value = assertString(labelId, "labelId", 128);

  if (!/^label-[A-Za-z0-9._-]+$/.test(value)) {
    throw new Error("Invalid labelId");
  }

  return value;
}

export function validateLabelName(name: unknown): string {
  const value = assertString(name, "name", 64).replace(/\s+/g, " ").trim();

  if (value.length < 2) {
    throw new Error("Label name must be at least 2 characters");
  }

  return value;
}

export function validateFolderName(name: unknown): string {
  const value = assertString(name, "folderName", 64)
    .replace(/\s+/g, " ")
    .trim();

  if (value.length < 2) {
    throw new Error("Folder name must be at least 2 characters");
  }

  const reservedNames = new Set([
    "inbox",
    "sent",
    "sent items",
    "drafts",
    "archive",
    "deleted items",
    "trash",
    "junk",
    "junk email",
    "outbox",
  ]);

  if (reservedNames.has(value.toLowerCase())) {
    throw new Error("That folder name is reserved by the mail provider.");
  }

  if (/[\\/:*?"<>|]/.test(value)) {
    throw new Error("Folder name contains invalid characters.");
  }

  return value;
}

export function validateLabelColor(color: unknown): string {
  const value = optionalString(color, "color", 16).trim() || "#C9A84C";

  if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
    throw new Error("Invalid label color");
  }

  return value;
}

export function validateFolderId(folderId: unknown): string {
  return assertString(folderId, "folderId", 2048);
}

export function validateFolderIcon(icon: unknown): string {
  const value = optionalString(icon, "icon", 64).trim();

  if (!value) {
    return "folder";
  }

  if (!allowedFolderIcons.has(value)) {
    throw new Error("Invalid folder icon");
  }

  return value;
}

/**
 * Validates and normalizes a folder destination for move operations.
 * Only allows the well-known folder keys defined in allowedMoveDestinations.
 */
export function validateDestinationFolder(destinationFolder: unknown): GraphFolderKey {
  const folder = assertString(
    destinationFolder,
    "destinationFolder",
    64,
  ).toLowerCase() as GraphFolderKey;

  if (!allowedMoveDestinations.has(folder)) {
    throw new Error("Invalid destination folder");
  }

  return folder;
}

/**
 * Server-side defense-in-depth strip for outgoing email HTML.
 * The renderer's ComposeDrawer already runs DOMPurify, so this catches anything
 * that slips through a compromised renderer before it reaches Microsoft Graph.
 * We only need to kill executable content — legitimate formatting must survive.
 */
export function sanitizeOutgoingHtml(html: string): string {
  return html
    // Remove executable tags entirely (including their content)
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object[\s\S]*?<\/object>/gi, "")
    .replace(/<embed[\s\S]*?>/gi, "")
    // Strip inline event handlers (on* attributes)
    .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "")
    // Strip javascript: / vbscript: from href/src/action
    .replace(/(href|src|action)\s*=\s*["']?\s*(?:javascript|vbscript)\s*:[^"'>]*/gi, "");
}

export function stripHtmlForAi(input: string) {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object[\s\S]*?<\/object>/gi, "")
    .replace(/<embed[\s\S]*?>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function limitAiInput(value: string, maxLength = 12_000) {
  if (value.length <= maxLength) return value;

  return `${value.slice(0, maxLength)}\n\n[Email content truncated for privacy and performance.]`;
}

export function extractJsonObject(value: string) {
  const trimmed = value.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fencedMatch?.[1] || trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  return candidate.slice(start, end + 1);
}

export function normalizeAiSummaryResult(rawText: string) {
  const jsonText = extractJsonObject(rawText);

  if (jsonText) {
    try {
      const parsed = JSON.parse(jsonText) as {
        summary?: unknown;
        keyPoints?: unknown;
        suggestedActions?: unknown;
      };

      const summary =
        typeof parsed.summary === "string" ? parsed.summary.trim() : "";
      const keyPoints = Array.isArray(parsed.keyPoints)
        ? parsed.keyPoints
            .filter((item): item is string => typeof item === "string")
            .map((item) => item.trim())
            .filter(Boolean)
            .slice(0, 5)
        : [];
      const suggestedActions = Array.isArray(parsed.suggestedActions)
        ? parsed.suggestedActions
            .filter((item): item is string => typeof item === "string")
            .map((item) => item.trim())
            .filter(Boolean)
            .slice(0, 3)
        : [];

      if (summary || keyPoints.length > 0 || suggestedActions.length > 0) {
        return {
          summary,
          keyPoints,
          suggestedActions,
        };
      }
    } catch {
      // Fall back to using the raw model text as a summary.
    }
  }

  return {
    summary: rawText.trim(),
    keyPoints: [] as string[],
    suggestedActions: [] as string[],
  };
}

export function validateAiEmailPayload(payload: any) {
  return {
    subject: optionalString(payload?.subject, "subject", 512),
    senderName: optionalString(payload?.senderName, "senderName", 256),
    senderEmail: optionalString(payload?.senderEmail, "senderEmail", 512),
    body: optionalString(payload?.body, "body", 500_000),
    preview: optionalString(payload?.preview, "preview", 5000),
  };
}

export function validateAiReplyPayload(payload: any) {
  return {
    ...validateAiEmailPayload(payload),
    tone: optionalString(payload?.tone, "tone", 32).toLowerCase(),
  };
}

export function normalizeAiReplyResult(rawText: string) {
  const jsonText = extractJsonObject(rawText);

  if (jsonText) {
    try {
      const parsed = JSON.parse(jsonText) as { reply?: unknown };
      const reply = typeof parsed.reply === "string" ? parsed.reply.trim() : "";
      if (reply) return reply;
    } catch {
      // Fall back to plain text extraction.
    }
  }

  return rawText.trim();
}

export function sanitizeBackendSettings(settings: unknown) {
  const value = settings && typeof settings === "object" ? settings as Record<string, unknown> : {};
  const aiProvider = optionalString(value.aiProvider, "aiProvider", 32).trim();
  const geminiModel = optionalString(value.geminiModel, "geminiModel", 64).trim();
  const ollamaBaseUrl = optionalString(value.ollamaBaseUrl, "ollamaBaseUrl", 512).trim();
  const ollamaModel = optionalString(value.ollamaModel, "ollamaModel", 128).trim();

  return {
    aiProvider: aiProvider === "ollama" ? "ollama" : "gemini",
    geminiModel: geminiModel || "gemini-2.5-flash",
    ollamaBaseUrl: ollamaBaseUrl || "http://127.0.0.1:11434",
    ollamaModel: ollamaModel || "llama3.2",
  };
}

export function sanitizeDraftsPayload(drafts: unknown) {
  if (!Array.isArray(drafts)) {
    throw new Error("drafts must be an array");
  }

  return drafts.slice(0, 20).map((draft, index) => {
    const value = draft && typeof draft === "object" ? draft as Record<string, unknown> : {};
    const id = optionalString(value.id, `drafts[${index}].id`, 128).trim();

    return {
      id: id || `draft-${crypto.randomUUID()}`,
      to: optionalString(value.to, `drafts[${index}].to`, 4096),
      cc: optionalString(value.cc, `drafts[${index}].cc`, 4096),
      subject: optionalString(value.subject, `drafts[${index}].subject`, 512),
      body: sanitizeOutgoingHtml(
        optionalString(value.body, `drafts[${index}].body`, 500_000),
      ),
      isMinimized: Boolean(value.isMinimized),
      isFullscreen: Boolean(value.isFullscreen),
      scheduledSendAt:
        optionalString(value.scheduledSendAt, `drafts[${index}].scheduledSendAt`, 64) ||
        undefined,
      aiTone: optionalString(value.aiTone, `drafts[${index}].aiTone`, 32) || undefined,
      aiHint: optionalString(value.aiHint, `drafts[${index}].aiHint`, 2048) || undefined,
    };
  });
}

/**
 * Parses a comma-separated list of email addresses into the Graph API recipient format.
 * Throws if any address fails basic validation.
 */
export function parseRecipients(emailsString: string) {
  if (!emailsString) return [];

  return emailsString
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean)
    .map((email) => {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error(`Invalid email address: ${email}`);
      }

      return {
        emailAddress: {
          address: email,
        },
      };
    });
}
