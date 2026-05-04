const INSIGHTS_COLLAPSED_STORAGE_KEY =
  "ryze-reading-ai-insights-collapsed";

type StorageLike = Pick<Storage, "getItem" | "setItem">;

export function loadStoredInsightsCollapsed(
  storage: StorageLike | null | undefined,
): boolean {
  return storage?.getItem(INSIGHTS_COLLAPSED_STORAGE_KEY) === "true";
}

export function saveStoredInsightsCollapsed(
  storage: StorageLike | null | undefined,
  isCollapsed: boolean,
): void {
  storage?.setItem(
    INSIGHTS_COLLAPSED_STORAGE_KEY,
    isCollapsed ? "true" : "false",
  );
}
