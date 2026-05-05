import { describe, expect, it } from "vitest";

import {
  refreshMailboxAfterReply,
  resolveManualSyncProvider,
} from "./mailSyncRouting";

describe("resolveManualSyncProvider", () => {
  it("uses gmail sync for google accounts", () => {
    expect(resolveManualSyncProvider("google")).toBe("google");
  });

  it("uses microsoft sync for microsoft accounts", () => {
    expect(resolveManualSyncProvider("microsoft")).toBe("microsoft");
  });

  it("falls back to microsoft for unknown providers", () => {
    expect(resolveManualSyncProvider("local")).toBe("microsoft");
  });
});

describe("refreshMailboxAfterReply", () => {
  it("awaits Gmail sync before refreshing the local UI", async () => {
    const calls: string[] = [];

    await refreshMailboxAfterReply({
      provider: "google",
      accountId: "google-1",
      syncGmailEmails: async (accountId) => {
        calls.push(`gmail:${accountId}`);
      },
      syncMicrosoftInbox: async () => {
        calls.push("microsoft");
      },
      refreshLocalUi: async () => {
        calls.push("refresh");
      },
    });

    expect(calls).toEqual(["gmail:google-1", "refresh"]);
  });

  it("awaits Outlook sync before refreshing the local UI", async () => {
    const calls: string[] = [];

    await refreshMailboxAfterReply({
      provider: "microsoft",
      accountId: "ms-1",
      syncGmailEmails: async () => {
        calls.push("gmail");
      },
      syncMicrosoftEmails: async (accountId) => {
        calls.push(`microsoft-all:${accountId}`);
      },
      syncMicrosoftInbox: async (accountId) => {
        calls.push(`microsoft:${accountId}`);
      },
      refreshLocalUi: async () => {
        calls.push("refresh");
      },
    });

    expect(calls).toEqual(["microsoft-all:ms-1", "refresh"]);
  });
});
