export type TokenHealth = "ok" | "expiring" | "expired" | "n/a";

export function deriveTokenHealth(
  expiresAt: number | null | undefined,
  now = Date.now(),
): TokenHealth {
  if (!expiresAt) return "n/a";
  if (expiresAt <= now) return "expired";
  if (expiresAt - now <= 15 * 60 * 1000) return "expiring";
  return "ok";
}

export function deriveSyncHealth({
  hasMessages,
  tokenHealth,
}: {
  hasMessages: boolean;
  tokenHealth: TokenHealth;
}): "ok" | "warning" | "idle" {
  if (!hasMessages) return "idle";
  if (tokenHealth === "expired" || tokenHealth === "expiring") return "warning";
  return "ok";
}
