import { describe, it, expect, vi } from "vitest";
import {
  refreshMailboxAfterReply,
  resolveManualSyncProvider,
} from "./mailSyncRouting";

describe("resolveManualSyncProvider", () => {
  it("should resolve google to google", () => {
    expect(resolveManualSyncProvider("google")).toBe("google");
  });

  it("should resolve imap to imap", () => {
    expect(resolveManualSyncProvider("imap")).toBe("imap");
  });

  it("should resolve microsoft to microsoft", () => {
    expect(resolveManualSyncProvider("microsoft")).toBe("microsoft");
  });
});

describe("refreshMailboxAfterReply", () => {
  it("should call syncMail and refreshLocalUi", async () => {
    const syncMail = vi.fn().mockResolvedValue(undefined);
    const refreshLocalUi = vi.fn().mockResolvedValue(undefined);

    await refreshMailboxAfterReply({
      provider: "google",
      accountId: "test-id",
      syncMail,
      refreshLocalUi,
    });

    expect(syncMail).toHaveBeenCalledWith("test-id");
    expect(refreshLocalUi).toHaveBeenCalled();
  });

  it("should work even if syncMail is missing", async () => {
    const refreshLocalUi = vi.fn().mockResolvedValue(undefined);

    await refreshMailboxAfterReply({
      provider: "microsoft",
      accountId: "test-id",
      refreshLocalUi,
    });

    expect(refreshLocalUi).toHaveBeenCalled();
  });
});
