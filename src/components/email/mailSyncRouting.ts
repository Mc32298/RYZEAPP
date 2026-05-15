import type { Account } from "@/types/email";

const GMAIL_FOLLOW_UP_SYNC_DELAY_MS = 1500;

export function resolveManualSyncProvider(provider: Account["provider"]) {
  if (provider === "google") return "google";
  if (provider === "imap") return "imap";
  return "microsoft";
}

export async function refreshMailboxAfterReply({
  provider,
  accountId,
  syncMail,
  refreshLocalUi,
}: {
  provider: ReturnType<typeof resolveManualSyncProvider>;
  accountId: string;
  syncMail?: (accountId: string) => Promise<unknown>;
  refreshLocalUi: () => Promise<unknown>;
}) {
  if (syncMail) {
    await syncMail(accountId);
  }

  await refreshLocalUi();

  if (provider === "google" && syncMail) {
    window.setTimeout(() => {
      syncMail(accountId)
        .then(() => refreshLocalUi())
        .catch((error) => {
          console.error("Gmail follow-up sync after reply failed:", error);
        });
    }, GMAIL_FOLLOW_UP_SYNC_DELAY_MS);
  }
}
