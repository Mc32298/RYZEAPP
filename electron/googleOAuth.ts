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
  let parsedErrorDescription = "";

  try {
    const parsed = JSON.parse(errorText) as {
      error?: string;
      error_description?: string;
    };
    parsedErrorDescription = parsed.error_description?.trim() || "";
  } catch {
    parsedErrorDescription = "";
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
