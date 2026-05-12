import type { Account } from "@/types/email";

export function resolveManualSyncProvider(provider: Account["provider"]) {
  if (provider === "google") return "google";
  if (provider === "imap") return "imap";
  return "microsoft";
}

export async function refreshMailboxAfterReply({
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
}
