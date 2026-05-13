export type AccountProviderKind = "microsoft" | "google" | "imap";

export function getAccountProviderKind(accountId: string): AccountProviderKind {
  if (accountId.startsWith("ms-")) return "microsoft";
  if (accountId.startsWith("google-")) return "google";
  if (accountId.startsWith("imap-")) return "imap";
  throw new Error(`Unsupported account provider for ID: ${accountId}`);
}
