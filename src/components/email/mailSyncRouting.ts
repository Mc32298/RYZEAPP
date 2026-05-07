import type { Account } from "@/types/email";

export function resolveManualSyncProvider(provider: Account["provider"]) {
  if (provider === "google") return "google";
  if (provider === "imap") return "imap";
  return "microsoft";
}

export async function refreshMailboxAfterReply({
  provider,
  accountId,
  syncGmailEmails,
  syncImapEmails,
  syncMicrosoftEmails,
  syncMicrosoftInbox,
  refreshLocalUi,
}: {
  provider: ReturnType<typeof resolveManualSyncProvider>;
  accountId: string;
  syncGmailEmails?: (accountId: string) => Promise<unknown>;
  syncImapEmails?: (accountId: string) => Promise<unknown>;
  syncMicrosoftEmails?: (accountId: string) => Promise<unknown>;
  syncMicrosoftInbox?: (accountId: string) => Promise<unknown>;
  refreshLocalUi: () => Promise<unknown>;
}) {
  if (provider === "google") {
    await syncGmailEmails?.(accountId);
  } else if (provider === "imap") {
    await syncImapEmails?.(accountId);
  } else {
    if (syncMicrosoftEmails) {
      await syncMicrosoftEmails(accountId);
    } else {
      await syncMicrosoftInbox?.(accountId);
    }
  }

  await refreshLocalUi();
}
