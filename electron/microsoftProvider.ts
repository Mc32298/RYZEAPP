import { MailProvider, MicrosoftStoredToken } from "./types";
import { db } from "./database";
import {
  validateAccountId,
  validateMessageId,
  assertString,
  optionalString,
  sanitizeOutgoingHtml,
  parseRecipients,
  validateDestinationFolder,
} from "./validation";
import * as fs from "fs";
import * as path from "path";
import { safeStorage, app } from "electron";

import { buildGraphReplyPayload } from \"./mailReplyPayload\";

import {
  syncMailboxInitialFull,
  syncMailboxDelta,
  shouldRunInitialFullSync,
  createGraphMailFolder,
  renameGraphMailFolder,
  deleteGraphMailFolder,
  emptyGraphMailFolder,
} from \"./graphSync\";
import {
  getKnownFolderName,
  getFolderAndDescendantIds,
} from \"./dbHelpers\";

import {
  parseStoredAttachments,
  shouldUseLocalMessageBody,
} from \"./mailBodyCache\";

const microsoftTokenFilePath = path.join(
  app.getPath("userData"),
  "microsoft-oauth-tokens.json",
);

const tokenRefreshLeadMs = 60 * 1000;

function logProviderFailure(context: string, status: number, errorText: string) {
  console.error(`${context} failed`, {
    status,
    errorSnippet: errorText.slice(0, 512),
  });
}

function userSafeProviderError(context: string, status: number) {
  return `${context} failed (${status}).`;
}

function loadMicrosoftTokens() {
  try {
    if (!fs.existsSync(microsoftTokenFilePath)) {
      return {} as Record<string, MicrosoftStoredToken>;
    }

    const fileContents = fs.readFileSync(microsoftTokenFilePath, "utf8");
    if (!fileContents) {
      return {} as Record<string, MicrosoftStoredToken>;
    }

    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error("Secure token storage is not available on this system");
    }

    const decoded = safeStorage.decryptString(
      Buffer.from(fileContents, "base64"),
    );
    return JSON.parse(decoded) as Record<string, MicrosoftStoredToken>;
  } catch (error) {
    console.error("Failed to load stored Microsoft tokens:", error);
    return {} as Record<string, MicrosoftStoredToken>;
  }
}

function saveMicrosoftTokens(tokens: Record<string, MicrosoftStoredToken>) {
  try {
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error("Secure token storage is not available on this system");
    }

    const payload = JSON.stringify(tokens);
    const content = safeStorage.encryptString(payload).toString("base64");

    fs.writeFileSync(microsoftTokenFilePath, content, {
      encoding: "utf8",
      mode: 0o600,
    });
  } catch (error) {
    console.error("Failed to save Microsoft tokens:", error);
    throw error;
  }
}

async function exchangeRefreshToken(
  refreshToken: string,
  clientId: string,
  tenantId: string,
  scope: string,
) {
  const authority = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0`;
  const refreshParams = new URLSearchParams({
    client_id: clientId,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    scope,
  });

  const refreshResponse = await fetch(`${authority}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: refreshParams.toString(),
  });

  if (!refreshResponse.ok) {
    const errorText = await refreshResponse.text();
    throw new Error(
      `Microsoft refresh token exchange failed (${refreshResponse.status}): ${errorText}`,
    );
  }

  return (await refreshResponse.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope: string;
    token_type: string;
  };
}

function getMicrosoftOAuthEnv() {
  const clientId =
    process.env.MICROSOFT_OAUTH_CLIENT_ID?.trim() ||
    process.env.VITE_MICROSOFT_OAUTH_CLIENT_ID?.trim();

  const tenantId = process.env.MICROSOFT_OAUTH_TENANT_ID?.trim() || "common";

  const redirectUri =
    process.env.MICROSOFT_OAUTH_REDIRECT_URI?.trim() ||
    process.env.VITE_MICROSOFT_OAUTH_REDIRECT_URI?.trim() ||
    "http://127.0.0.1:42813/auth/microsoft/callback";

  const scope =
    process.env.MICROSOFT_OAUTH_SCOPE?.trim() ||
    "openid profile offline_access User.Read Mail.Read Mail.ReadWrite Mail.Send Calendars.Read";

  if (!clientId) {
    throw new Error("Missing MICROSOFT_OAUTH_CLIENT_ID");
  }

  return {
    clientId,
    tenantId,
    redirectUri,
    scope,
  };
}

function getMicrosoftOAuthRefreshConfig(
  token: MicrosoftStoredToken,
) {
  const clientId = token.clientId?.trim();
  const tenantId = token.tenantId?.trim();
  const scope = token.oauthScope?.trim();

  if (clientId && tenantId && scope) {
    return {
      clientId,
      tenantId,
      scope,
    };
  }

  const env = getMicrosoftOAuthEnv();
  return {
    clientId: env.clientId,
    tenantId: env.tenantId,
    scope: env.scope,
  };
}

export class MicrosoftProvider implements MailProvider {
  private activeTokenRefreshPromises = new Map<string, Promise<string>>();

  async refreshToken(accountId: string): Promise<string> {
    const tokens = loadMicrosoftTokens();
    const token = tokens[accountId];

    if (!token) throw new Error("No Microsoft token stored for this account");
    if (token.expiresAt > Date.now() + tokenRefreshLeadMs) {
      return token.accessToken;
    }
    if (!token.refreshToken) {
      throw new Error(
        "Microsoft refresh token missing. Please reconnect the account.",
      );
    }

    const existing = this.activeTokenRefreshPromises.get(accountId);
    if (existing) return existing;

    const refreshPromise = (async () => {
      try {
        const { clientId, tenantId, scope } = getMicrosoftOAuthRefreshConfig(token);
        const refreshed = await exchangeRefreshToken(
          token.refreshToken!,
          clientId,
          tenantId,
          scope,
        );
        const latestTokens = loadMicrosoftTokens();
        latestTokens[accountId] = {
          ...token,
          accessToken: refreshed.access_token,
          refreshToken: refreshed.refresh_token || token.refreshToken,
          expiresAt: Date.now() + refreshed.expires_in * 1000,
          scope: refreshed.scope || token.scope,
          tokenType: refreshed.token_type || token.tokenType,
          clientId,
          tenantId,
          oauthScope: scope,
        };
        saveMicrosoftTokens(latestTokens);
        return latestTokens[accountId].accessToken;
      } finally {
        this.activeTokenRefreshPromises.delete(accountId);
      }
    })();

    this.activeTokenRefreshPromises.set(accountId, refreshPromise);
    return refreshPromise;
  }

  getTokens(): Record<string, MicrosoftStoredToken> {
    return loadMicrosoftTokens();
  }

  saveToken(accountId: string, token: MicrosoftStoredToken): void {
    const tokens = loadMicrosoftTokens();
    tokens[accountId] = token;
    saveMicrosoftTokens(tokens);
  }

  deleteToken(accountId: string): void {
    const tokens = loadMicrosoftTokens();
    if (tokens[accountId]) {
      delete tokens[accountId];
      saveMicrosoftTokens(tokens);
    }
  }

  getOAuthEnv() {
    return getMicrosoftOAuthEnv();
  }

  async sendEmail(accountId: string, payload: any): Promise<any> {
    const to = assertString(payload?.to, "to", 4096);
    const cc = optionalString(payload?.cc, "cc", 4096);
    const subject = optionalString(payload?.subject, "subject", 512);
    const body = optionalString(payload?.body, "body", 500_000);

    const accessToken = await this.refreshToken(accountId);

    const messagePayload = {
      message: {
        subject: subject || "(No subject)",
        body: {
          contentType: "html",
          content: sanitizeOutgoingHtml(body || " "),
        },
        toRecipients: parseRecipients(to),
        ccRecipients: parseRecipients(cc),
      },
      saveToSentItems: true,
    };

    const response = await fetch("https://graph.microsoft.com/v1.0/me/sendMail", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messagePayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logProviderFailure("Microsoft send mail", response.status, errorText);
      throw new Error(userSafeProviderError("Microsoft send mail", response.status));
    }

    return { success: true };
  }

  async markAsRead(accountId: string, messageId: string): Promise<void> {
    await this.updateReadStatus(accountId, messageId, true);
  }

  async markAsUnread(accountId: string, messageId: string): Promise<void> {
    await this.updateReadStatus(accountId, messageId, false);
  }

  private async updateReadStatus(accountId: string, messageId: string, isRead: boolean): Promise<void> {
    // Optimistic local update
    db.prepare(
      `UPDATE emails SET isRead = ? WHERE id = ? AND accountId = ?`,
    ).run(isRead ? 1 : 0, messageId, accountId);

    const accessToken = await this.refreshToken(accountId);
    const encodedMessageId = encodeURIComponent(messageId);

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/messages/${encodedMessageId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isRead }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 404 || errorText.includes("ErrorItemNotFound")) {
        db.prepare("DELETE FROM emails WHERE accountId = ? AND id = ?").run(
          accountId,
          messageId,
        );
        return;
      }
      logProviderFailure(`Mark as ${isRead ? 'read' : 'unread'}`, response.status, errorText);
      throw new Error(userSafeProviderError(`Mark as ${isRead ? 'read' : 'unread'}`, response.status));
    }
  }

  async toggleStar(accountId: string, messageId: string, isStarred: boolean): Promise<void> {
    const accessToken = await this.refreshToken(accountId);
    const encodedMessageId = encodeURIComponent(messageId);

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/messages/${encodedMessageId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          flag: {
            flagStatus: isStarred ? "flagged" : "notFlagged",
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 404 || errorText.includes("ErrorItemNotFound")) {
        db.prepare("DELETE FROM emails WHERE accountId = ? AND id = ?").run(
          accountId,
          messageId,
        );
        return;
      }
      logProviderFailure("Toggle star", response.status, errorText);
      throw new Error(userSafeProviderError("Toggle star", response.status));
    }

    db.prepare(
      "UPDATE emails SET isStarred = ? WHERE accountId = ? AND id = ?",
    ).run(isStarred ? 1 : 0, accountId, messageId);
  }

  async moveMessage(accountId: string, messageId: string, destination: string): Promise<void> {
    const destinationFolderKey = validateDestinationFolder(destination);
    const accessToken = await this.refreshToken(accountId);
    const encodedMessageId = encodeURIComponent(messageId);

    const targetFolderRow = db
      .prepare(
        `
      SELECT id FROM folders 
      WHERE accountId = ? AND wellKnownName = ? 
      LIMIT 1
    `,
      )
      .get(accountId, destinationFolderKey) as { id?: string } | undefined;

    const actualDestinationDbId = targetFolderRow?.id || destinationFolderKey;

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/messages/${encodedMessageId}/move`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destinationId: destinationFolderKey,
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 404 || errorText.includes("ErrorItemNotFound")) {
        db.prepare("DELETE FROM emails WHERE accountId = ? AND id = ?").run(
          accountId,
          messageId,
        );
        return;
      }
      logProviderFailure("Move message", response.status, errorText);
      throw new Error(userSafeProviderError("Move message", response.status));
    }

    const data: any = await response.json();

    if (data.id) {
      db.prepare(
        \"UPDATE emails SET folder = ?, id = ? WHERE accountId = ? AND id = ?\",
      ).run(actualDestinationDbId, data.id, accountId, messageId);
    } else {
      db.prepare(
        \"UPDATE emails SET folder = ? WHERE accountId = ? AND id = ?\",
      ).run(actualDestinationDbId, accountId, messageId);
    }
  }

  async replyEmail(accountId: string, messageId: string, comment: string): Promise<void> {
    const accessToken = await this.refreshToken(accountId);
    const encodedMessageId = encodeURIComponent(messageId);

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/messages/${encodedMessageId}/reply`,
      {
        method: \"POST\",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          \"Content-Type\": \"application/json\",
        },
        body: JSON.stringify(buildGraphReplyPayload(comment || \"\")),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      logProviderFailure(\"Microsoft reply\", response.status, errorText);
      throw new Error(userSafeProviderError(\"Microsoft reply\", response.status));
    }
  }

  async sync(accountId: string): Promise<{ success: boolean }> {
    const accessToken = await this.refreshToken(accountId);
    if (shouldRunInitialFullSync(accountId)) {
      return await syncMailboxInitialFull(accessToken, accountId);
    }
    await syncMailboxDelta(accessToken, accountId);
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

  async createFolder(accountId: string, displayName: string): Promise<any> {
    const accessToken = await this.refreshToken(accountId);
    const createdFolder = await createGraphMailFolder(accessToken, displayName);

    db.prepare(
      `
      INSERT OR REPLACE INTO folders (
        id, accountId, displayName, parentFolderId, wellKnownName, totalItemCount, unreadItemCount, depth, path
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    ).run(
      createdFolder.id,
      accountId,
      createdFolder.displayName || displayName,
      createdFolder.parentFolderId || \"\",
      getKnownFolderName(createdFolder),
      createdFolder.totalItemCount || 0,
      createdFolder.unreadItemCount || 0,
      0,
      createdFolder.displayName || displayName,
    );

    return createdFolder;
  }

  async renameFolder(accountId: string, folderId: string, displayName: string): Promise<any> {
    const accessToken = await this.refreshToken(accountId);
    const renamedFolder = await renameGraphMailFolder(accessToken, folderId, displayName);

    db.prepare(
      `UPDATE folders SET displayName = ? WHERE accountId = ? AND id = ?`,
    ).run(renamedFolder.displayName || displayName, accountId, folderId);

    return renamedFolder;
  }

  async deleteFolder(accountId: string, folderId: string): Promise<void> {
    const accessToken = await this.refreshToken(accountId);
    await deleteGraphMailFolder(accessToken, folderId);

    const folderIdsToDelete = getFolderAndDescendantIds(accountId, folderId);

    db.transaction(() => {
      for (const id of folderIdsToDelete) {
        db.prepare(\"DELETE FROM email_labels WHERE accountId = ? AND messageId IN (SELECT id FROM emails WHERE accountId = ? AND folder = ?)\").run(accountId, accountId, id);
        db.prepare(\"DELETE FROM emails WHERE accountId = ? AND folder = ?\").run(accountId, id);
        db.prepare(\"DELETE FROM folders WHERE accountId = ? AND id = ?\").run(accountId, id);
      }
    })();
  }

  async emptyFolder(accountId: string, folderId: string): Promise<void> {
    const folder = db.prepare(`SELECT wellKnownName, displayName FROM folders WHERE accountId = ? AND id = ? LIMIT 1`).get(accountId, folderId) as { wellKnownName?: string, displayName?: string };
    if (!folder) throw new Error(\"Folder not found\");

    const accessToken = await this.refreshToken(accountId);
    const isDeletedItemsFolder =
      folder.wellKnownName === \"deleteditems\" ||
      folder.displayName?.toLowerCase() === \"deleted items\" ||
      folder.displayName?.toLowerCase() === \"trash\";

    await emptyGraphMailFolder(accessToken, folderId, isDeletedItemsFolder);

    db.transaction(() => {
      db.prepare(\"DELETE FROM email_labels WHERE accountId = ? AND messageId IN (SELECT id FROM emails WHERE accountId = ? AND folder = ?)\").run(accountId, accountId, folderId);
      db.prepare(\"DELETE FROM emails WHERE accountId = ? AND folder = ?\").run(accountId, folderId);
    })();
  }

  async setFolderIcon(accountId: string, folderId: string, icon: string): Promise<any> {
    db.prepare(`UPDATE folders SET icon = ? WHERE accountId = ? AND id = ?`).run(icon, accountId, folderId);
    return db.prepare(`SELECT * FROM folders WHERE accountId = ? AND id = ?`).get(accountId, folderId);
  }

  async getBody(accountId: string, messageId: string): Promise<{ content: string; contentType: string; attachments?: any[]; source?: string; warning?: string }> {
    const localEmail = db
      .prepare(
        `
        SELECT bodyContent, bodyContentType, bodyPreview, hasAttachments, attachments
        FROM emails
        WHERE accountId = ?
          AND id = ?
        LIMIT 1
      `,
      )
      .get(accountId, messageId) as
      | {
          bodyContent?: string;
          bodyContentType?: string;
          bodyPreview?: string;
          hasAttachments?: number;
          attachments?: string;
        }
      | undefined;

    if (!localEmail) {
      throw new Error(\"Message not found locally.\");
    }

    const localAttachments = parseStoredAttachments(localEmail.attachments);

    if (
      shouldUseLocalMessageBody({
        bodyContent: localEmail.bodyContent,
        hasAttachments: Boolean(localEmail.hasAttachments),
        attachmentsJson: localEmail.attachments,
      })
    ) {
      return {
        content: localEmail.bodyContent || \"\",
        contentType: localEmail.bodyContentType || \"html\",
        attachments: localAttachments,
        source: \"local\",
      };
    }

    const accessToken = await this.refreshToken(accountId);

    const graphUrl =
      `https://graph.microsoft.com/v1.0/me/messages/${encodeURIComponent(
        messageId,
      )}` +
      `?$select=${encodeURIComponent(\"id,body,bodyPreview\")}` +
      `&$expand=${encodeURIComponent(
        \"attachments($select=id,name,size,contentType,isInline)\",
      )}`;

    const response = await fetch(graphUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Prefer: 'outlook.body-content-type=\"html\", IdType=\"ImmutableId\"',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error(\"Failed to fetch message body from Microsoft Graph:\", {
        status: response.status,
        accountId,
        messageId,
        errorText,
      });

      if (localEmail.bodyPreview?.trim()) {
        return {
          content: `<p>${escapeHtml(localEmail.bodyPreview).replace(
            /\\n/g,
            \"<br/>\",
          )}</p>`,
          contentType: \"html\",
          source: \"preview-fallback\",
          warning:
            \"Could not fetch the full email body from Microsoft Graph. Showing preview instead.\",
        };
      }

      throw new Error(
        `Cannot access full message body. Microsoft Graph returned ${response.status}.`,
      );
    }

    const message = (await response.json()) as {
      id: string;
      body?: {
        contentType?: string;
        content?: string;
      };
      bodyPreview?: string;
      attachments?: Array<{
        id?: string;
        name?: string;
        size?: number;
        contentType?: string;
        isInline?: boolean;
        contentId?: string;
        [\"@odata.type\"]?: string;
      }>;
    };

    const bodyContent = message.body?.content || \"\";
    const bodyContentType = message.body?.contentType || \"html\";
    const attachments = Array.isArray(message.attachments)
      ? message.attachments
          .filter((attachment) =>
            String(attachment?.[\"@odata.type\"] || \"\").includes(\"fileAttachment\"),
          )
          .map((attachment) => ({
            id: attachment.id || \"\",
            name: attachment.name || \"Unknown File\",
            size: attachment.size || 0,
            contentType: attachment.contentType || \"application/octet-stream\",
            isInline: Boolean(attachment.isInline),
            contentId: attachment.contentId || undefined,
          }))
          .filter((attachment) => attachment.id)
      : [];

    db.prepare(
      `
      UPDATE emails
      SET
        bodyContent = ?,
        bodyContentType = ?,
        attachments = ?,
        bodyPreview = CASE
          WHEN ? <> '' THEN ?
          ELSE bodyPreview
        END
      WHERE accountId = ?
        AND id = ?
    `,
    ).run(
      bodyContent,
      bodyContentType,
      JSON.stringify(attachments),
      message.bodyPreview || \"\",
      message.bodyPreview || \"\",
      accountId,
      messageId,
    );

    return {
      content: bodyContent,
      contentType: bodyContentType,
      attachments,
      source: \"graph\",
    };
  }
  }
