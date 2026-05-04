import { describe, expect, it } from "vitest";
import {
  loadStoredInsightsCollapsed,
  saveStoredInsightsCollapsed,
} from "./readingInsightsCollapse";

function createStorage(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial));

  return {
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
  };
}

describe("readingInsightsCollapse", () => {
  it("defaults to expanded when nothing is stored", () => {
    expect(loadStoredInsightsCollapsed(createStorage())).toBe(false);
  });

  it("loads the stored collapsed preference", () => {
    expect(
      loadStoredInsightsCollapsed(
        createStorage({ "ryze-reading-ai-insights-collapsed": "true" }),
      ),
    ).toBe(true);
  });

  it("persists the collapse preference as a string", () => {
    const storage = createStorage();

    saveStoredInsightsCollapsed(storage, true);

    expect(storage.getItem("ryze-reading-ai-insights-collapsed")).toBe("true");
  });
});
