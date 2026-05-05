interface GoogleAuthorizationCodeParamsArgs {
  clientId: string;
  code: string;
  redirectUri: string;
  codeVerifier: string;
}

interface GoogleRefreshTokenParamsArgs {
  clientId: string;
  refreshToken: string;
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

  return params;
}

export function formatGoogleTokenExchangeError(
  status: number,
  errorText: string,
) {
  const normalized = errorText.toLowerCase();

  if (
    normalized.includes("client_secret is missing") ||
    normalized.includes('"error":"invalid_request"')
  ) {
    return [
      `Google token exchange failed (${status}): the configured Google OAuth client is not valid for a desktop PKCE flow.`,
      "Use a Google OAuth client of type Desktop app with the loopback redirect URI for this Electron app.",
    ].join(" ");
  }

  return `Google token exchange failed (${status}): ${errorText}`;
}
