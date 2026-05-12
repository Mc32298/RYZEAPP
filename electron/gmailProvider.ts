import { MailProvider, GoogleStoredToken, GmailMessage, GmailMessagePart } from "./types";
import { db } from "./database";
import {
  validateAccountId,
  assertString,
  optionalString,
  sanitizeOutgoingHtml,
} from "./validation";
import * as fs from "fs";
import * as path from "path";
import { safeStorage, app } from "electron";
import {
  formatGoogleTokenExchangeError,
  buildGoogleTokenExchangeDebugContext,
  isGoogleUnauthorizedClientError,
} from "./googleOAuth";
import { buildGmailMoveLabelMutation } from "./gmailMove";

import {
  gmailUpsertFolders,
  gmailFetchMessagesForLabel,
} from \"./gmailSync\";

import {
  GMAIL_SYSTEM_FOLDERS,
  gmailUpsertMessage,
  gmailExtractBody,
} from \"./gmailSync\";

const googleTokenFilePath = path.join(
  app.getPath("userData"),
  "google-oauth-tokens.json",
);

const GOOGLE_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID || "";
const GOOGLE_TOKEN_PROXY_URL = process.env.GOOGLE_OAUTH_TOKEN_PROXY_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_OAUTH_REDIRECT_URI || "http://127.0.0.1:53682";

const tokenRefreshLeadMs = 60 * 1000;

function getGoogleTokenProxyUrl() {
  const rawValue = GOOGLE_TOKEN_PROXY_URL.trim();
  if (!rawValue) {
    throw new Error(
      "Missing GOOGLE_OAUTH_TOKEN_PROXY_URL. Configure your Supabase Edge Function endpoint.",
    );
  }

  const value = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(rawValue)
    ? rawValue
    : `https://${rawValue}`;

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(
      `GOOGLE_OAUTH_TOKEN_PROXY_URL is not a valid URL: "${rawValue}".`,
    );
  }

  const isLocalhost =
    parsed.hostname === "localhost" ||
    parsed.hostname === "127.0.0.1" ||
    parsed.hostname === "::1";

  if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && isLocalhost)) {
    throw new Error(
      "GOOGLE_OAUTH_TOKEN_PROXY_URL must be https (or localhost http for development).",
    );
  }

  return parsed.toString();
}

type GoogleTokenProxyRequest =
  | {
      grantType: "authorization_code";
      clientId: string;
      code: string;
      codeVerifier: string;
      redirectUri: string;
    }
  | {
      grantType: "refresh_token";
      clientId: string;
      refreshToken: string;
    };

async function exchangeGoogleTokenViaProxy(request: GoogleTokenProxyRequest) {
  const proxyUrl = getGoogleTokenProxyUrl();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const anonKey = SUPABASE_ANON_KEY.trim();
  if (anonKey) {
    headers.apikey = anonKey;
    if (anonKey.split(".").length === 3) {
      headers.Authorization = `Bearer ${anonKey}`;
    }
  }

  const response = await fetch(proxyUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(request),
  });

  const responseText = await response.text();

  if (!response.ok) {
    const debugContext = buildGoogleTokenExchangeDebugContext({
      clientId: request.clientId,
      redirectUri:
        request.grantType === "authorization_code"
          ? request.redirectUri
          : GOOGLE_REDIRECT_URI,
    });
    if (
      response.status === 401 &&
      responseText.includes("UNAUTHORIZED_INVALID_JWT_FORMAT")
    ) {
      throw new Error(
        "Google token proxy authorization failed (Supabase 401). Use a legacy JWT anon key in SUPABASE_ANON_KEY, or deploy the function with JWT verification disabled.",
      );
    }
    throw new Error(
      formatGoogleTokenExchangeError(response.status, responseText, debugContext),
    );
  }

  try {
    return JSON.parse(responseText) as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
      scope?: string;
      token_type: string;
    };
  } catch {
    throw new Error("Google token proxy returned invalid JSON.");
  }
}

function loadGoogleTokens(): Record<string, GoogleStoredToken> {
  try {
    if (!fs.existsSync(googleTokenFilePath)) return {};
    const fileContents = fs.readFileSync(googleTokenFilePath, "utf8");
    if (!fileContents) return {};
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error("Secure token storage is not available on this system");
    }
    const decoded = safeStorage.decryptString(Buffer.from(fileContents, "base64"));
    return JSON.parse(decoded) as Record<string, GoogleStoredToken>;
  } catch (error) {
    console.error("Failed to load stored Google tokens:", error);
    return {};
  }
}

function saveGoogleTokens(tokens: Record<string, GoogleStoredToken>) {
  try {
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error("Secure token storage is not available on this system");
    }
    const content = safeStorage.encryptString(JSON.stringify(tokens)).toString("base64");
    fs.writeFileSync(googleTokenFilePath, content, { encoding: "utf8", mode: 0o600 });
  } catch (error) {
    console.error("Failed to save Google tokens:", error);
    throw error;
  }
}

export class GmailProvider implements MailProvider {
  private activeTokenRefreshPromises = new Map<string, Promise<string>>();

  async refreshToken(accountId: string): Promise<string> {
    const tokens = loadGoogleTokens();
    const token = tokens[accountId];

    if (!token) throw new Error("No Google token stored for this account");
    if (token.expiresAt > Date.now() + tokenRefreshLeadMs) return token.accessToken;
    if (!token.refreshToken) {
      throw new Error("Google refresh token missing. Please reconnect the account.");
    }

    const existing = this.activeTokenRefreshPromises.get(accountId);
    if (existing) return existing;

    const refreshPromise = (async () => {
      try {
        const clientId = token.clientId || GOOGLE_CLIENT_ID;
        let refreshed: {
          access_token: string;
          refresh_token?: string;
          expires_in: number;
          scope?: string;
          token_type: string;
        };
        try {
          refreshed = await exchangeGoogleTokenViaProxy({
            grantType: "refresh_token",
            clientId,
            refreshToken: token.refreshToken!,
          });
        } catch (error) {
          if (
            error instanceof Error &&
            isGoogleUnauthorizedClientError(error.message)
          ) {
            const latestTokens = loadGoogleTokens();
            if (latestTokens[accountId]) {
              delete latestTokens[accountId];
              saveGoogleTokens(latestTokens);
            }
            throw new Error(
              "Google OAuth credentials changed for this account. Reconnect the Google account to continue syncing.",
            );
          }
          throw error;
        }

        const latestTokens = loadGoogleTokens();
        latestTokens[accountId] = {
          ...token,
          accessToken: refreshed.access_token,
          expiresAt: Date.now() + refreshed.expires_in * 1000,
          scope: refreshed.scope || token.scope,
          token_type: refreshed.token_type || token.tokenType,
          clientId,
        };
        saveGoogleTokens(latestTokens);
        return latestTokens[accountId].accessToken;
      } finally {
        this.activeTokenRefreshPromises.delete(accountId);
      }
    })();

    this.activeTokenRefreshPromises.set(accountId, refreshPromise);
    return refreshPromise;
  }

  getTokens(): Record<string, GoogleStoredToken> {
    return loadGoogleTokens();
  }

  saveToken(accountId: string, token: GoogleStoredToken): void {
    const tokens = loadGoogleTokens();
    tokens[accountId] = token;
    saveGoogleTokens(tokens);
  }

  deleteToken(accountId: string): void {
    const tokens = loadGoogleTokens();
    if (tokens[accountId]) {
      delete tokens[accountId];
      saveGoogleTokens(tokens);
    }
  }

  async sendEmail(accountId: string, payload: any): Promise<any> {
    const to = assertString(payload?.to, "to", 4096);
    const cc = optionalString(payload?.cc, "cc", 4096);
    const subject = optionalString(payload?.subject, "subject", 512);
    const body = optionalString(payload?.body, "body", 500_000);

    const accessToken = await this.refreshToken(accountId);

    const lines: string[] = [
      `To: ${to}`,
      ...(cc ? [`Cc: ${cc}`] : []),
      `Subject: ${subject || "(No subject)"}`,
      "MIME-Version: 1.0",
      "Content-Type: text/html; charset=utf-8",
      "",
      sanitizeOutgoingHtml(body || " "),
    ];

    const raw = Buffer.from(lines.join("\r\n")).toString("base64url");

    const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gmail send failed (${response.status}): ${err}`);
    }

    return { success: true };
  }

  async markAsRead(accountId: string, messageId: string): Promise<void> {
    const accessToken = await this.refreshToken(accountId);

    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(messageId)}/modify`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ removeLabelIds: ["UNREAD"] }),
      },
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gmail mark-read failed (${response.status}): ${err}`);
    }

    db.prepare("UPDATE emails SET isRead = 1 WHERE id = ? AND accountId = ?").run(messageId, accountId);
  }

  async markAsUnread(accountId: string, messageId: string): Promise<void> {
    const accessToken = await this.refreshToken(accountId);

    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(messageId)}/modify`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ addLabelIds: ["UNREAD"] }),
      },
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gmail mark-unread failed (${response.status}): ${err}`);
    }

    db.prepare("UPDATE emails SET isRead = 0 WHERE id = ? AND accountId = ?").run(messageId, accountId);
  }

  async toggleStar(accountId: string, messageId: string, isStarred: boolean): Promise<void> {
    const accessToken = await this.refreshToken(accountId);

    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(messageId)}/modify`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(
          isStarred
            ? { addLabelIds: ["STARRED"] }
            : { removeLabelIds: ["STARRED"] },
        ),
      },
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gmail toggle-star failed (${response.status}): ${err}`);
    }

    db.prepare("UPDATE emails SET isStarred = ? WHERE id = ? AND accountId = ?").run(
      isStarred ? 1 : 0, messageId, accountId,
    );
  }

  async moveMessage(accountId: string, messageId: string, destination: string): Promise<void> {
    const dest = destination.toUpperCase();
    const validDestinations = new Set(["INBOX", "TRASH", "SPAM", "DRAFT", "ARCHIVE"]);
    if (!validDestinations.has(dest)) throw new Error("Invalid Gmail destination label");

    const accessToken = await this.refreshToken(accountId);
    const { addLabelIds, removeLabelIds } = buildGmailMoveLabelMutation(dest);

    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(messageId)}/modify`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ addLabelIds, removeLabelIds }),
      },
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gmail move failed (${response.status}): ${err}`);
    }

    db.prepare("UPDATE emails SET folder = ? WHERE id = ? AND accountId = ?").run(
      dest, messageId, accountId,
    );
  }

  async replyEmail(accountId: string, messageId: string, comment: string): Promise<void> {
    const accessToken = await this.refreshToken(accountId);

    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(messageId)}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) throw new Error(\"Failed to fetch message for reply context\");
    const message = await response.json() as GmailMessage;

    const headers = message.payload?.headers || [];
    const subject = headers.find(h => h.name.toLowerCase() === \"subject\")?.value || \"\";
    const replySubject = subject.toLowerCase().startsWith(\"re:\") ? subject : `Re: ${subject}`;
    const messageIdHeader = headers.find(h => h.name.toLowerCase() === \"message-id\")?.value || \"\";
    const references = headers.find(h => h.name.toLowerCase() === \"references\")?.value || \"\";
    const from = headers.find(h => h.name.toLowerCase() === \"from\")?.value || \"\";

    const emailLines: string[] = [
      `To: ${from}`,
      `Subject: ${replySubject}`,
      `In-Reply-To: ${messageIdHeader}`,
      `References: ${references ? `${references} ` : \"\"}${messageIdHeader}`,
      \"MIME-Version: 1.0\",
      \"Content-Type: text/html; charset=utf-8\",
      \"\",
      sanitizeOutgoingHtml(comment || \" \"),
    ];

    const raw = Buffer.from(emailLines.join(\"\\r\\n\")).toString(\"base64url\");

    const sendResponse = await fetch(\"https://gmail.googleapis.com/gmail/v1/users/me/messages/send\", {
      method: \"POST\",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        \"Content-Type\": \"application/json\",
      },
      body: JSON.stringify({
        threadId: message.threadId,
        raw,
      }),
    });

    if (!sendResponse.ok) {
      const err = await sendResponse.text();
      throw new Error(`Gmail reply failed (${sendResponse.status}): ${err}`);
    }
  }

  async sync(accountId: string): Promise<{ success: boolean }> {
    const accessToken = await this.refreshToken(accountId);
    await gmailUpsertFolders(accessToken, accountId);
    
    const labels = [\"INBOX\", \"SENT\", \"DRAFT\", \"SPAM\", \"TRASH\", \"IMPORTANT\", \"STARRED\"];
    for (const label of labels) {
      await gmailFetchMessagesForLabel(accessToken, accountId, label);
    }

    return { success: true };
  }

  async deleteAccount(accountId: string): Promise<void> {
    db.transaction(() => {
      db.prepare(\"DELETE FROM email_labels WHERE accountId = ?\").run(accountId);
      db.prepare(\"DELETE FROM emails WHERE accountId = ?\").run(accountId);
      db.prepare(\"DELETE FROM folders WHERE accountId = ?\").run(accountId);
    })();
    this.deleteToken(accountId);
  }

  async createFolder(_accountId: string, _displayName: string): Promise<any> {
    throw new Error(\"Label creation not yet implemented for Gmail provider\");
  }

  async renameFolder(_accountId: string, _folderId: string, _displayName: string): Promise<any> {
    throw new Error(\"Label renaming not yet implemented for Gmail provider\");
  }

  async deleteFolder(_accountId: string, _folderId: string): Promise<void> {
    throw new Error(\"Label deletion not yet implemented for Gmail provider\");
  }

  async emptyFolder(_accountId: string, _folderId: string): Promise<void> {
    throw new Error(\"Emptying labels not yet implemented for Gmail provider\");
  }

  async setFolderIcon(accountId: string, folderId: string, icon: string): Promise<any> {
    db.prepare(`UPDATE folders SET icon = ? WHERE accountId = ? AND id = ?`).run(icon, accountId, folderId);
    return db.prepare(`SELECT * FROM folders WHERE accountId = ? AND id = ?`).get(accountId, folderId);
  }

  async getBody(accountId: string, messageId: string): Promise<{ content: string; contentType: string; attachments?: any[]; source?: string; warning?: string }> {
    const accessToken = await this.refreshToken(accountId);

    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(messageId)}?format=full`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gmail get message failed (${response.status}): ${err}`);
    }

    const msg = (await response.json()) as GmailMessage;
    const folderId = (msg.labelIds ?? []).find((l) =>
      GMAIL_SYSTEM_FOLDERS.some((f) => f.id === l),
    ) ?? \"INBOX\";

    gmailUpsertMessage(accountId, folderId, msg);

    const body = gmailExtractBody(msg.payload as GmailMessagePart | undefined);
    return { content: body.content, contentType: body.contentType, source: \"gmail\" };
  }
}
