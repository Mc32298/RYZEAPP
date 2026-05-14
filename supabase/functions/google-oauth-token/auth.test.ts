import { describe, expect, it } from "vitest";

import { validateFunctionApiKey } from "./auth";

describe("validateFunctionApiKey", () => {
  it("rejects requests without an apikey header", () => {
    expect(
      validateFunctionApiKey({
        apiKeyHeader: null,
        expectedApiKey: "expected-key",
      }),
    ).toEqual({
      ok: false,
      error: "missing_apikey_header",
      status: 401,
    });
  });

  it("rejects requests with the wrong apikey header", () => {
    expect(
      validateFunctionApiKey({
        apiKeyHeader: "wrong-key",
        expectedApiKey: "expected-key",
      }),
    ).toEqual({
      ok: false,
      error: "invalid_apikey_header",
      status: 401,
    });
  });

  it("accepts requests with the expected apikey header", () => {
    expect(
      validateFunctionApiKey({
        apiKeyHeader: "expected-key",
        expectedApiKey: "expected-key",
      }),
    ).toEqual({
      ok: true,
    });
  });
});
