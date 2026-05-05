import type { Account } from "@/types/email";
import type { ComposeDraft } from "./ComposeDrawer";

export function resolveComposerAccount(
  accounts: Account[],
  fallbackAccount: Account,
  accountId?: string | null,
) {
  if (!accountId) return fallbackAccount;
  return accounts.find((account) => account.id === accountId) || fallbackAccount;
}

export function resolveCurrentUserEmail(
  accounts: Account[],
  fallbackAccount: Account,
  accountId?: string | null,
) {
  return resolveComposerAccount(accounts, fallbackAccount, accountId).email;
}

export function createComposeDraft({
  currentAccount,
  signatureHtml,
  prefill,
}: {
  currentAccount: Account;
  signatureHtml: string;
  prefill?: Partial<ComposeDraft>;
}): ComposeDraft {
  return {
    id: `draft-${Date.now()}`,
    accountId: prefill?.accountId || currentAccount.id,
    provider: prefill?.provider || currentAccount.provider,
    to: prefill?.to || "",
    cc: prefill?.cc || "",
    subject: prefill?.subject || "",
    body: prefill?.body ?? signatureHtml,
    isMinimized: false,
    isFullscreen: false,
    aiTone: prefill?.aiTone,
    aiHint: prefill?.aiHint,
  };
}
