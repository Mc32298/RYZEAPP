interface GoogleAuthorizationCodeParamsArgs {
  clientId: string;
  clientSecret?: string;
  code: string;
  redirectUri: string;
  codeVerifier: string;
}

interface GoogleRefreshTokenParamsArgs {
  clientId: string;
  clientSecret?: string;
  refreshToken: string;
}

interface GoogleTokenExchangeDebugContextArgs {
  clientId: string;
  redirectUri: string;
}

interface GoogleTokenErrorPayload {
  error?: string;
  error_description?: string;
  desktopClientIdSuffix?: string;
  functionClientIdSuffix?: string;
}

function parseGoogleTokenErrorPayload(errorText: string): GoogleTokenErrorPayload {
  try {
    return JSON.parse(errorText) as GoogleTokenErrorPayload;
  } catch {
    return {};
  }
}

export function buildGoogleAuthorizationCodeParams(
  args: GoogleAuthorizationCodeParamsArgs,
) {
  const params = new URLSearchParams({
    client_id: args.clientId,
    grant_type: "authorization_code",
    code: args.code,
    redirect_uri: args.redirectUri,
    code_verifier: args.codeVerifier,
  });

  if (args.clientSecret?.trim()) {
    params.set("client_secret", args.clientSecret.trim());
  }

  return params;
}

export function buildGoogleRefreshTokenParams(
  args: GoogleRefreshTokenParamsArgs,
) {
  const params = new URLSearchParams({
    client_id: args.clientId,
    grant_type: "refresh_token",
    refresh_token: args.refreshToken,
  });

  if (args.clientSecret?.trim()) {
    params.set("client_secret", args.clientSecret.trim());
  }

  return params;
}

export function buildGoogleTokenExchangeDebugContext(
  args: GoogleTokenExchangeDebugContextArgs,
) {
  return {
    clientIdSuffix: args.clientId.slice(-32),
    redirectUri: args.redirectUri,
    usesPkce: true,
  };
}

export function formatGoogleTokenExchangeError(
  status: number,
  errorText: string,
  debugContext?: {
    clientIdSuffix: string;
    redirectUri: string;
    usesPkce: boolean;
  },
) {
  const normalized = errorText.toLowerCase();
  const parsed = parseGoogleTokenErrorPayload(errorText);
  const parsedErrorDescription = parsed.error_description?.trim() || "";
  const parsedError = parsed.error?.trim().toLowerCase() || "";

  if (parsedError === "oauth_client_mismatch") {
    return [
      `Google token exchange failed (${status}): desktop and token-proxy Google OAuth client IDs do not match.`,
      parsed.desktopClientIdSuffix && parsed.functionClientIdSuffix
        ? `Desktop suffix=${parsed.desktopClientIdSuffix}, proxy suffix=${parsed.functionClientIdSuffix}.`
        : "",
      "Set the same GOOGLE_OAUTH_CLIENT_ID in both the desktop app and Supabase function secrets, then reconnect the Google account.",
    ].join(" ");
  }

  if (
    normalized.includes("client_secret is missing") ||
    parsedErrorDescription.toLowerCase().includes("client_secret is missing")
  ) {
    return [
      `Google token exchange failed (${status}): the bundled Google client ID is not valid for a desktop PKCE flow.`,
      "Replace it with a Google OAuth client of type Desktop app that is configured for this Electron app's loopback redirect URI.",
      debugContext
        ? `Debug: clientIdSuffix=${debugContext.clientIdSuffix}, redirectUri=${debugContext.redirectUri}, usesPkce=${String(debugContext.usesPkce)}.`
        : "",
    ].join(" ");
  }

  if (
    normalized.includes("\"error\":\"unauthorized_client\"") ||
    parsedErrorDescription.toLowerCase().includes("unauthorized")
  ) {
    return [
      `Google token exchange failed (${status}): unauthorized client credentials for this token.`,
      "The refresh token is usually tied to a different Google OAuth client, or the client ID/secret pair is mismatched.",
      "Reconnect the Google account after confirming GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET are from the same OAuth client in Google Cloud Console.",
      debugContext
        ? `Debug: clientIdSuffix=${debugContext.clientIdSuffix}, redirectUri=${debugContext.redirectUri}, usesPkce=${String(debugContext.usesPkce)}.`
        : "",
    ].join(" ");
  }

  if (parsedErrorDescription) {
    return [
      `Google token exchange failed (${status}): ${parsedErrorDescription}`,
      debugContext
        ? `Debug: clientIdSuffix=${debugContext.clientIdSuffix}, redirectUri=${debugContext.redirectUri}, usesPkce=${String(debugContext.usesPkce)}.`
        : "",
    ].join(" ");
  }

  return [
    `Google token exchange failed (${status}): ${errorText}`,
    debugContext
      ? `Debug: clientIdSuffix=${debugContext.clientIdSuffix}, redirectUri=${debugContext.redirectUri}, usesPkce=${String(debugContext.usesPkce)}.`
      : "",
  ].join(" ");
}

export function isGoogleUnauthorizedClientError(errorText: string) {
  const normalized = errorText.toLowerCase();
  const parsed = parseGoogleTokenErrorPayload(errorText);
  const parsedError = parsed.error?.toLowerCase() || "";
  const parsedErrorDescription = parsed.error_description?.toLowerCase() || "";

  return (
    normalized.includes("\"error\":\"unauthorized_client\"") ||
    parsedError === "unauthorized_client" ||
    parsedErrorDescription.includes("unauthorized")
  );
}
