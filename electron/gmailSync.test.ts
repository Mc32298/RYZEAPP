import { afterEach, describe, expect, it, vi } from "vitest";

const runSpy = vi.fn();

vi.mock("./database", () => ({
  db: {
    prepare: () => ({
      run: (...args: unknown[]) => runSpy(...args),
    }),
  },
}));

import { gmailFetchMessagesForLabel } from "./gmailSync";

describe("gmailFetchMessagesForLabel", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    runSpy.mockReset();
  });

  it("uses a numeric default maxResults when maxMessages is omitted", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({
        ok: true,
        json: async () => ({ messages: [] }),
      } as Response);

    await gmailFetchMessagesForLabel("token", "account-1", "INBOX");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const requestUrl = new URL(String(fetchMock.mock.calls[0][0]));
    expect(requestUrl.searchParams.get("maxResults")).toBe("50");
  });

  it("stores a message under SENT when both SENT and IMPORTANT labels exist", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messages: [{ id: "msg-1" }] }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "msg-1",
          labelIds: ["IMPORTANT", "SENT"],
          payload: { headers: [] },
          snippet: "",
        }),
      } as Response);

    await gmailFetchMessagesForLabel("token", "account-1", "IMPORTANT", 1);

    const args = runSpy.mock.calls.at(-1) ?? [];
    expect(args[2]).toBe("SENT");
  });
});
