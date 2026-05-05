import type { Account } from "@/types/email";

export function resolveManualSyncProvider(provider: Account["provider"]) {
  return provider === "google" ? "google" : "microsoft";
}

export async function refreshMailboxAfterReply({
  provider,
  accountId,
  syncGmailEmails,
  syncMicrosoftEmails,
  syncMicrosoftInbox,
  refreshLocalUi,
}: {
  provider: ReturnType<typeof resolveManualSyncProvider>;
  accountId: string;
  syncGmailEmails?: (accountId: string) => Promise<unknown>;
  syncMicrosoftEmails?: (accountId: string) => Promise<unknown>;
  syncMicrosoftInbox?: (accountId: string) => Promise<unknown>;
  refreshLocalUi: () => Promise<unknown>;
}) {
  if (provider === "google") {
    await syncGmailEmails?.(accountId);
  } else {
    if (syncMicrosoftEmails) {
      await syncMicrosoftEmails(accountId);
    } else {
      await syncMicrosoftInbox?.(accountId);
    }
  }

  await refreshLocalUi();
}
