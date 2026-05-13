import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

describe("googleOAuthConfig", () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("reads Google OAuth env with sensible defaults", async () => {
    vi.resetModules();
    process.env = {
      ...ORIGINAL_ENV,
      GOOGLE_OAUTH_CLIENT_ID:
        "1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com",
      GOOGLE_OAUTH_REDIRECT_URI: "",
      GOOGLE_OAUTH_SCOPE: "",
      GOOGLE_OAUTH_TOKEN_PROXY_URL: "https://example.supabase.co/functions/v1/google-oauth-token",
      SUPABASE_ANON_KEY: "publishable-key",
    };

    const { getGoogleOAuthEnv } = await import("./googleOAuthConfig");

    expect(getGoogleOAuthEnv()).toEqual({
      clientId:
        "1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com",
      redirectUri: "http://127.0.0.1:53682",
      scope:
        "openid email profile https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.send",
      tokenProxyUrl: "https://example.supabase.co/functions/v1/google-oauth-token",
      supabaseAnonKey: "publishable-key",
    });
  });

  it("throws when the Google OAuth client id is missing", async () => {
    vi.resetModules();
    process.env = {
      ...ORIGINAL_ENV,
      GOOGLE_OAUTH_CLIENT_ID: "",
    };

    const { getGoogleOAuthEnv } = await import("./googleOAuthConfig");

    expect(() => getGoogleOAuthEnv()).toThrow(
      "Missing GOOGLE_OAUTH_CLIENT_ID",
    );
  });

  it("throws when the Google OAuth client id is still a placeholder", async () => {
    vi.resetModules();
    process.env = {
      ...ORIGINAL_ENV,
      GOOGLE_OAUTH_CLIENT_ID: "<google_client_id>",
    };

    const { getGoogleOAuthEnv } = await import("./googleOAuthConfig");

    expect(() => getGoogleOAuthEnv()).toThrow(
      "GOOGLE_OAUTH_CLIENT_ID is still a placeholder",
    );
  });
});
