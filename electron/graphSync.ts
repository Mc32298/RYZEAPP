// electron/graphSync.ts
import type {
  GraphMailFolder,
  GraphMailFolderListResponse,
  GraphMessage,
  GraphMessageListResponse,
  FolderSyncResult,
  GraphFolderKey,
} from "./types";
import {
  upsertLocalGraphMessage,
  deleteLocalMessage,
  saveFolderSyncState,
  getFolderDeltaLink,
  clearFolderSyncState,
  saveFoldersToLocalDb,
  shouldRunInitialFullSync,
  getLocalFolders,
} from "./dbHelpers";
import { sleep, getGraphRetryDelayMs } from "./utils";
import { db } from "./database";

const maxGraphFetchAttempts = 4; // module-private

// =============================================================================
// INTERNAL HELPERS (not exported)
// =============================================================================

function shouldSkipMessageSyncForFolder(folder: GraphMailFolder) {
  const displayName = (folder.displayName || "").toLowerCase().trim();
  const wellKnownName = (folder.wellKnownName || "").toLowerCase().trim();

  const skippedWellKnownNames = new Set([
    "outbox",
    "syncissues",
    "conflicts",
    "localfailures",
    "serverfailures",
  ]);

  const skippedDisplayNames = new Set([
    "sync issues",
    "conflicts",
    "local failures",
    "server failures",
    "outbox",
  ]);

  return (
    skippedWellKnownNames.has(wellKnownName) ||
    skippedDisplayNames.has(displayName)
  );
}

function getFolderSyncPriority(folder: GraphMailFolder) {
  const displayName = (folder.displayName || "").toLowerCase().trim();
  const wellKnownName = (folder.wellKnownName || "").toLowerCase().trim();

  if (wellKnownName === "inbox" || displayName === "inbox") return 0;
  if (wellKnownName === "sentitems" || displayName === "sent items") return 1;
  if (wellKnownName === "drafts" || displayName === "drafts") return 2;
  if (wellKnownName === "archive" || displayName === "archive") return 3;
  if (
    wellKnownName === "deleteditems" ||
    displayName === "deleted items" ||
    displayName === "trash"
  ) {
    return 4;
  }

  // Custom/user folders before Outlook diagnostic folders.
  if (!shouldSkipMessageSyncForFolder(folder)) return 10;

  return 999;
}

function getMessageSyncFolders(folders: GraphMailFolder[]) {
  return [...folders]
    .filter((folder) => !shouldSkipMessageSyncForFolder(folder))
    .sort((a, b) => {
      const priorityDiff = getFolderSyncPriority(a) - getFolderSyncPriority(b);
      if (priorityDiff !== 0) return priorityDiff;

      return (a.path || a.displayName || "").localeCompare(
        b.path || b.displayName || "",
      );
    });
}

// =============================================================================
// EXPORTED SYNC FUNCTIONS
// =============================================================================

/**
 * Fetches messages from a specific mail folder (top 50, sorted by newest first).
 * Retries on rate-limit (429) and server errors (503/504) up to maxGraphFetchAttempts.
 */
export async function fetchGraphFolderMessages(accessToken: string, folderId: string) {
  const query = new URLSearchParams({
    $top: "100",
    $orderby: "receivedDateTime desc",
    $select:
      "id,subject,bodyPreview,receivedDateTime,isRead,hasAttachments,from,toRecipients,ccRecipients,flag", // <--- Added ,flag
  });

  const encodedFolderId = encodeURIComponent(folderId);

  let nextUrl: string | undefined =
    `https://graph.microsoft.com/v1.0/me/mailFolders/${encodedFolderId}/messages?${query.toString()}`;

  const allMessages: GraphMessage[] = [];

  while (nextUrl) {
    let page: GraphMessageListResponse | null = null;

    for (let attempt = 1; attempt <= maxGraphFetchAttempts; attempt += 1) {
      const response = await fetch(nextUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        page = (await response.json()) as GraphMessageListResponse;
        break;
      }

      const errorText = await response.text();

      const shouldRetry =
        response.status === 429 ||
        response.status === 500 ||
        response.status === 502 ||
        response.status === 503 ||
        response.status === 504;

      if (!shouldRetry || attempt === maxGraphFetchAttempts) {
        throw new Error(
          `Microsoft Graph messages request failed (${response.status}) for folder ${folderId}: ${errorText}`,
        );
      }

      await sleep(getGraphRetryDelayMs(response, attempt));
    }

    if (!page) {
      break;
    }

    allMessages.push(...page.value);
    nextUrl = page["@odata.nextLink"];

    // Small pause so large mailboxes do not hammer Microsoft Graph.
    await sleep(80);
  }

  return {
    value: allMessages,
  } satisfies GraphMessageListResponse;
}

export async function fetchGraphFolderMessagesDeltaPage(
  accessToken: string,
  url: string,
) {
  for (let attempt = 1; attempt <= maxGraphFetchAttempts; attempt += 1) {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Prefer: "odata.maxpagesize=100",
      },
    });

    if (response.ok) {
      return (await response.json()) as GraphMessageListResponse;
    }

    const errorText = await response.text();

    const shouldRetry =
      response.status === 429 ||
      response.status === 500 ||
      response.status === 502 ||
      response.status === 503 ||
      response.status === 504;

    if (!shouldRetry || attempt === maxGraphFetchAttempts) {
      throw new Error(
        `Microsoft Graph message delta request failed (${response.status}): ${errorText}`,
      );
    }

    await sleep(getGraphRetryDelayMs(response, attempt));
  }

  throw new Error("Microsoft Graph message delta request failed after retries");
}

export async function syncFolderInitialFullDelta(
  accessToken: string,
  accountId: string,
  folderId: string,
): Promise<FolderSyncResult> {
  const query = new URLSearchParams({
    $select:
      "id,subject,bodyPreview,receivedDateTime,isRead,hasAttachments,from,toRecipients,ccRecipients,flag", // <--- Added ,flag
  });

  let nextUrl: string | undefined =
    `https://graph.microsoft.com/v1.0/me/mailFolders/${encodeURIComponent(
      folderId,
    )}/messages/delta?${query.toString()}`;

  let deltaLink = "";
  let syncedCount = 0;

  while (nextUrl) {
    const page = await fetchGraphFolderMessagesDeltaPage(accessToken, nextUrl);

    const writePage = db.transaction(() => {
      for (const message of page.value) {
        if (message["@removed"]) {
          deleteLocalMessage(accountId, message.id);
          continue;
        }

        upsertLocalGraphMessage(accountId, folderId, message);
        syncedCount += 1;
      }
    });

    writePage();

    if (page["@odata.deltaLink"]) {
      deltaLink = page["@odata.deltaLink"];
      break;
    }

    nextUrl = page["@odata.nextLink"];

    await sleep(80);
  }

  if (!deltaLink) {
    throw new Error(
      `Microsoft Graph did not return a deltaLink for folder ${folderId}`,
    );
  }

  saveFolderSyncState(accountId, folderId, deltaLink, "full");

  return {
    success: true,
    syncedCount,
    deltaLink,
  };
}

export async function syncFolderDelta(
  accessToken: string,
  accountId: string,
  folderId: string,
): Promise<FolderSyncResult> {
  const deltaLink = getFolderDeltaLink(accountId, folderId);

  if (!deltaLink) {
    return syncFolderInitialFullDelta(accessToken, accountId, folderId);
  }

  let nextUrl: string | undefined = deltaLink;
  let updatedCount = 0;
  let deletedCount = 0;
  let nextDeltaLink = "";

  try {
    while (nextUrl) {
      const page = await fetchGraphFolderMessagesDeltaPage(
        accessToken,
        nextUrl,
      );

      const writePage = db.transaction(() => {
        for (const message of page.value) {
          if (message["@removed"]) {
            deleteLocalMessage(accountId, message.id);
            deletedCount += 1;
            continue;
          }

          upsertLocalGraphMessage(accountId, folderId, message);
          updatedCount += 1;
        }
      });

      writePage();

      if (page["@odata.deltaLink"]) {
        nextDeltaLink = page["@odata.deltaLink"];
        break;
      }

      nextUrl = page["@odata.nextLink"];

      await sleep(50);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    // Delta links can expire. When that happens, reset this folder and full-sync it again.
    if (
      message.includes("410") ||
      message.toLowerCase().includes("sync state") ||
      message.toLowerCase().includes("deltalink")
    ) {
      clearFolderSyncState(accountId, folderId);
      return syncFolderInitialFullDelta(accessToken, accountId, folderId);
    }

    throw error;
  }

  if (nextDeltaLink) {
    saveFolderSyncState(accountId, folderId, nextDeltaLink, "delta");
  }

  return {
    success: true,
    updatedCount,
    deletedCount,
  };
}

export async function syncMailboxInitialFull(accessToken: string, accountId: string) {
  const foldersResponse = await fetchGraphMailFolders(accessToken);
  const folders = Array.isArray(foldersResponse)
    ? foldersResponse
    : foldersResponse.value || [];
  const foldersToSync = getMessageSyncFolders(folders);

  console.log(
    `[sync] Initial full sync for ${accountId}: ${folders.length} folders`,
  );
  console.log(`[sync] Message sync folders: ${foldersToSync.length}`);

  saveFoldersToLocalDb(accountId, folders);

  for (const folder of foldersToSync) {
    try {
      console.log(
        `[sync] Full delta sync folder: ${folder.displayName} (${folder.id})`,
      );
      const result = await syncFolderInitialFullDelta(
        accessToken,
        accountId,
        folder.id,
      );
      console.log(
        `[sync] Finished folder: ${folder.displayName} (${result.syncedCount ?? 0} messages)`,
      );
    } catch (error) {
      console.error(
        `[sync] Failed folder: ${folder.displayName} (${folder.id})`,
        error,
      );

      // Keep syncing other folders. One bad folder must not block the mailbox.
      clearFolderSyncState(accountId, folder.id);
    }
  }

  return { success: true };
}

export async function syncMailboxTargetedDelta(
  accessToken: string,
  accountId: string,
  folderIds: string[],
) {
  const folders = getLocalFolders(accountId) as GraphMailFolder[];

  const folderIdSet = new Set(folderIds.filter(Boolean));
  const foldersToSync = getMessageSyncFolders(folders).filter((folder) =>
    folderIdSet.has(folder.id),
  );

  console.log(
    `[sync] Targeted delta sync for ${accountId}: ${foldersToSync.length} folders`,
  );

  for (const folder of foldersToSync) {
    try {
      const result = (await syncFolderDelta(
        accessToken,
        accountId,
        folder.id,
      )) as {
        success: boolean;
        updatedCount?: number;
        syncedCount?: number;
        deletedCount?: number;
      };

      console.log(
        `[sync] Targeted delta finished folder: ${folder.displayName} (${result.updatedCount ?? result.syncedCount ?? 0} changed, ${result.deletedCount ?? 0} deleted)`,
      );
    } catch (error) {
      console.error(
        `[sync] Targeted delta failed folder: ${folder.displayName} (${folder.id})`,
        error,
      );

      clearFolderSyncState(accountId, folder.id);
    }
  }

  return { success: true };
}

export async function syncMailboxDelta(accessToken: string, accountId: string) {
  const foldersResponse = await fetchGraphMailFolders(accessToken);
  const folders = Array.isArray(foldersResponse)
    ? foldersResponse
    : foldersResponse.value || [];
  const foldersToSync = getMessageSyncFolders(folders);

  console.log(`[sync] Delta sync for ${accountId}: ${folders.length} folders`);
  console.log(`[sync] Message delta folders: ${foldersToSync.length}`);

  saveFoldersToLocalDb(accountId, folders);

  for (const folder of foldersToSync) {
    try {
      const result = (await syncFolderDelta(
        accessToken,
        accountId,
        folder.id,
      )) as {
        success: boolean;
        updatedCount?: number;
        syncedCount?: number;
        deletedCount?: number;
      };

      const changedCount = result.updatedCount ?? result.syncedCount ?? 0;
      const deletedCount = result.deletedCount ?? 0;

      console.log(
        `[sync] Delta finished folder: ${folder.displayName} (${changedCount} changed, ${deletedCount} deleted)`,
      );
    } catch (error) {
      console.error(
        `[sync] Delta failed folder: ${folder.displayName} (${folder.id})`,
        error,
      );

      clearFolderSyncState(accountId, folder.id);
    }
  }

  return { success: true };
}

export async function fetchGraphMailFoldersPage(accessToken: string, url: string) {
  for (let attempt = 1; attempt <= maxGraphFetchAttempts; attempt += 1) {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      return (await response.json()) as GraphMailFolderListResponse & {
        "@odata.nextLink"?: string;
      };
    }

    const errorText = await response.text();

    if (
      response.status === 404 ||
      response.status === 403 ||
      errorText.includes("ErrorItemNotFound") ||
      errorText.includes("ErrorAccessDenied")
    ) {
      return { value: [] };
    }

    const shouldRetry =
      response.status === 429 ||
      response.status === 503 ||
      response.status === 504;

    if (!shouldRetry || attempt === maxGraphFetchAttempts) {
      throw new Error(
        `Microsoft Graph folders request failed (${response.status}): ${errorText}`,
      );
    }

    await sleep(getGraphRetryDelayMs(response, attempt));
  }

  throw new Error("Microsoft Graph folders request failed after retries");
}

export async function createGraphMailFolder(accessToken: string, displayName: string) {
  const response = await fetch(
    "https://graph.microsoft.com/v1.0/me/mailFolders",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        displayName,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Microsoft Graph folder creation failed (${response.status}): ${errorText}`,
    );
  }

  return (await response.json()) as GraphMailFolder;
}

export async function moveGraphMessageToFolder(
  accessToken: string,
  messageId: string,
  destinationFolderId: string,
) {
  const encodedMessageId = encodeURIComponent(messageId);
  const requestUrl = `https://graph.microsoft.com/v1.0/me/messages/${encodedMessageId}/move`;

  for (let attempt = 1; attempt <= maxGraphFetchAttempts; attempt += 1) {
    const response = await fetch(requestUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        destinationId: destinationFolderId,
      }),
    });

    if (response.ok) {
      return (await response.json()) as GraphMessage;
    }

    const errorText = await response.text();
    const shouldRetry =
      response.status === 429 ||
      response.status === 500 ||
      response.status === 502 ||
      response.status === 503 ||
      response.status === 504;

    if (!shouldRetry || attempt === maxGraphFetchAttempts) {
      throw new Error(
        `Microsoft Graph move failed (${response.status}): ${errorText}`,
      );
    }

    await sleep(getGraphRetryDelayMs(response, attempt));
  }

  throw new Error("Microsoft Graph move failed after retries");
}

export async function renameGraphMailFolder(
  accessToken: string,
  folderId: string,
  displayName: string,
) {
  const encodedFolderId = encodeURIComponent(folderId);

  const response = await fetch(
    `https://graph.microsoft.com/v1.0/me/mailFolders/${encodedFolderId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        displayName,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Microsoft Graph folder rename failed (${response.status}): ${errorText}`,
    );
  }

  return (await response.json()) as GraphMailFolder;
}

export async function deleteGraphMailFolder(accessToken: string, folderId: string) {
  const encodedFolderId = encodeURIComponent(folderId);

  const response = await fetch(
    `https://graph.microsoft.com/v1.0/me/mailFolders/${encodedFolderId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok && response.status !== 404) {
    const errorText = await response.text();
    throw new Error(
      `Microsoft Graph folder delete failed (${response.status}): ${errorText}`,
    );
  }

  return { success: true };
}

export async function deleteGraphMessage(accessToken: string, messageId: string) {
  const encodedMessageId = encodeURIComponent(messageId);
  const requestUrl = `https://graph.microsoft.com/v1.0/me/messages/${encodedMessageId}`;

  for (let attempt = 1; attempt <= maxGraphFetchAttempts; attempt += 1) {
    const response = await fetch(requestUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok || response.status === 404) {
      return;
    }

    const errorText = await response.text();
    const shouldRetry =
      response.status === 429 ||
      response.status === 500 ||
      response.status === 502 ||
      response.status === 503 ||
      response.status === 504;

    if (!shouldRetry || attempt === maxGraphFetchAttempts) {
      throw new Error(
        `Microsoft Graph message delete failed (${response.status}): ${errorText}`,
      );
    }

    await sleep(getGraphRetryDelayMs(response, attempt));
  }
}

export async function emptyGraphMailFolder(
  accessToken: string,
  folderId: string,
  isDeletedItemsFolder: boolean,
) {
  const deletedItemsFolderId = "deleteditems";
  let affectedCount = 0;

  let nextUrl: string | undefined =
    `https://graph.microsoft.com/v1.0/me/mailFolders/${encodeURIComponent(
      folderId,
    )}/messages?$top=100&$select=id`;

  const messageIds: string[] = [];

  while (nextUrl) {
    const listResponse = await fetch(nextUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!listResponse.ok) {
      const errorText = await listResponse.text();
      throw new Error(
        `Microsoft Graph list folder messages failed (${listResponse.status}): ${errorText}`,
      );
    }

    const page = (await listResponse.json()) as {
      value: Array<{ id: string }>;
      "@odata.nextLink"?: string;
    };

    messageIds.push(...page.value.map((message) => message.id));
    nextUrl = page["@odata.nextLink"];

    await sleep(80);
  }

  for (const messageId of messageIds) {
    if (isDeletedItemsFolder) {
      await deleteGraphMessage(accessToken, messageId);
    } else {
      await moveGraphMessageToFolder(
        accessToken,
        messageId,
        deletedItemsFolderId,
      );
    }

    affectedCount += 1;

    await sleep(120);
  }

  return {
    success: true,
    affectedCount,
  };
}

/**
 * Recursively fetches all mail folders (and sub-folders) for the authenticated user.
 * Annotates each folder with its depth and full path (e.g. "Inbox/Projects/Client A").
 */
export async function fetchGraphMailFolders(accessToken: string) {
  const query = new URLSearchParams({
    $top: "100",
  });

  const rootUrl = `https://graph.microsoft.com/v1.0/me/mailFolders?${query.toString()}`;
  const allFolders: GraphMailFolder[] = [];

  const fetchFolderTree = async (
    url: string,
    depth: number,
    parentPath: string,
  ) => {
    let nextUrl: string | undefined = url;

    while (nextUrl) {
      let page: GraphMailFolderListResponse & { "@odata.nextLink"?: string };

      try {
        page = await fetchGraphMailFoldersPage(accessToken, nextUrl);
      } catch (error) {
        console.error(
          `[sync] Failed to fetch folder page for path "${parentPath || "root"}":`,
          error,
        );
        throw error;
      }

      for (const folder of page.value) {
        const folderPath = parentPath
          ? `${parentPath}/${folder.displayName}`
          : folder.displayName;

        const normalizedFolder: GraphMailFolder = {
          ...folder,
          depth,
          path: folderPath,
        };

        allFolders.push(normalizedFolder);

        // Recurse into sub-folders
        const childQuery = new URLSearchParams({
          $top: "100",
        });

        const encodedFolderId = encodeURIComponent(folder.id);
        const childUrl = `https://graph.microsoft.com/v1.0/me/mailFolders/${encodedFolderId}/childFolders?${childQuery.toString()}`;

        try {
          await fetchFolderTree(childUrl, depth + 1, folderPath);
        } catch (error) {
          console.error(
            `[sync] Failed to fetch sub-folders for ${folder.displayName} (${folder.id}):`,
            error,
          );
        }
      }

      nextUrl = page["@odata.nextLink"];
    }
  };

  await fetchFolderTree(rootUrl, 0, "");

  return { value: allFolders };
}
