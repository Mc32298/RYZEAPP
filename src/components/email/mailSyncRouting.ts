import type { Account } from "@/types/email";

export function resolveManualSyncProvider(provider: Account["provider"]) {
  return provider === "google" ? "google" : "microsoft";
}
