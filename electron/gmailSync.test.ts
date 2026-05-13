import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./database", () => ({
  db: {
    prepare: () => ({
      run: () => undefined,
    }),
  },
}));

import { gmailFetchMessagesForLabel } from "./gmailSync";

describe("gmailFetchMessagesForLabel", () => {
  afterEach(() => {
    vi.restoreAllMocks();
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
});
