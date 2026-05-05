import { describe, expect, it } from "vitest";

import {
  buildGoogleAuthorizationCodeParams,
  buildGoogleRefreshTokenParams,
  formatGoogleTokenExchangeError,
} from "./googleOAuth";

describe("googleOAuth", () => {
  it("builds a PKCE authorization code exchange without client_secret", () => {
    const params = buildGoogleAuthorizationCodeParams({
      clientId: "client-id",
      code: "auth-code",
      redirectUri: "http://127.0.0.1:42814/auth/google/callback",
      codeVerifier: "verifier",
    });

    expect(params.get("client_id")).toBe("client-id");
    expect(params.get("code_verifier")).toBe("verifier");
    expect(params.get("client_secret")).toBeNull();
  });

  it("builds a refresh token exchange without client_secret", () => {
    const params = buildGoogleRefreshTokenParams({
      clientId: "client-id",
      refreshToken: "refresh-token",
    });

    expect(params.get("refresh_token")).toBe("refresh-token");
    expect(params.get("client_secret")).toBeNull();
  });

  it("explains missing client_secret errors as a wrong oauth client type", () => {
    expect(
      formatGoogleTokenExchangeError(
        400,
        JSON.stringify({
          error: "invalid_request",
          error_description: "client_secret is missing.",
        }),
      ),
    ).toContain("Desktop app");
  });
});
