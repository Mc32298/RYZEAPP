import { describe, expect, it } from "vitest";

import {
  buildGoogleAuthorizationCodeParams,
  buildGoogleTokenExchangeDebugContext,
  buildGoogleRefreshTokenParams,
  formatGoogleTokenExchangeError,
  isGoogleUnauthorizedClientError,
} from "./googleOAuth";

describe("googleOAuth", () => {
  it("builds a PKCE authorization code exchange with an installed-app client_secret", () => {
    const params = buildGoogleAuthorizationCodeParams({
      clientId: "client-id",
      clientSecret: "client-secret",
      code: "auth-code",
      redirectUri: "http://127.0.0.1:42814/auth/google/callback",
      codeVerifier: "verifier",
    });

    expect(params.get("client_id")).toBe("client-id");
    expect(params.get("code_verifier")).toBe("verifier");
    expect(params.get("client_secret")).toBe("client-secret");
  });

  it("builds a refresh token exchange with an installed-app client_secret", () => {
    const params = buildGoogleRefreshTokenParams({
      clientId: "client-id",
      clientSecret: "client-secret",
      refreshToken: "refresh-token",
    });

    expect(params.get("refresh_token")).toBe("refresh-token");
    expect(params.get("client_secret")).toBe("client-secret");
  });

  it("explains missing client_secret errors as a bundled client type mismatch", () => {
    expect(
      formatGoogleTokenExchangeError(
        400,
        JSON.stringify({
          error: "invalid_request",
          error_description: "client_secret is missing.",
        }),
      ),
    ).toContain("bundled Google client ID");
  });

  it("preserves other invalid_request errors from Google", () => {
    expect(
      formatGoogleTokenExchangeError(
        400,
        JSON.stringify({
          error: "invalid_request",
          error_description: "Invalid parameter value for redirect_uri: not a valid loopback address.",
        }),
      ),
    ).toContain("Invalid parameter value for redirect_uri");
  });

  it("formats oauth client mismatch errors from the token proxy", () => {
    expect(
      formatGoogleTokenExchangeError(
        400,
        JSON.stringify({
          error: "oauth_client_mismatch",
          error_description:
            "Desktop GOOGLE_OAUTH_CLIENT_ID does not match Supabase function GOOGLE_OAUTH_CLIENT_ID.",
          desktopClientIdSuffix: "desktop.apps.googleusercontent.com",
          functionClientIdSuffix: "function.apps.googleusercontent.com",
        }),
      ),
    ).toContain("do not match");
  });

  it("builds a safe debug context without secrets", () => {
    expect(
      buildGoogleTokenExchangeDebugContext({
        clientId: "1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com",
        redirectUri: "http://127.0.0.1:53682",
      }),
    ).toEqual({
      clientIdSuffix: "vwxyz.apps.googleusercontent.com",
      redirectUri: "http://127.0.0.1:53682",
      usesPkce: true,
    });
  });

  it("detects unauthorized_client responses", () => {
    expect(
      isGoogleUnauthorizedClientError(
        JSON.stringify({
          error: "unauthorized_client",
          error_description: "Unauthorized",
        }),
      ),
    ).toBe(true);
  });

  it("does not flag non-authorization failures as unauthorized_client", () => {
    expect(
      isGoogleUnauthorizedClientError(
        JSON.stringify({
          error: "invalid_grant",
          error_description: "Token has been expired or revoked.",
        }),
      ),
    ).toBe(false);
  });
});
