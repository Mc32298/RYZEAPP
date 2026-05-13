export interface GoogleOAuthEnv {
  clientId: string;
  redirectUri: string;
  scope: string;
  tokenProxyUrl: string;
  supabaseAnonKey: string;
}

const DEFAULT_GOOGLE_OAUTH_REDIRECT_URI = "http://127.0.0.1:53682";
const DEFAULT_GOOGLE_OAUTH_SCOPE =
  "openid email profile https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.send";

export function getGoogleOAuthEnv(): GoogleOAuthEnv {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim() || "";
  const redirectUri =
    process.env.GOOGLE_OAUTH_REDIRECT_URI?.trim() ||
    DEFAULT_GOOGLE_OAUTH_REDIRECT_URI;
  const scope =
    process.env.GOOGLE_OAUTH_SCOPE?.trim() || DEFAULT_GOOGLE_OAUTH_SCOPE;
  const tokenProxyUrl = process.env.GOOGLE_OAUTH_TOKEN_PROXY_URL?.trim() || "";
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY?.trim() || "";

  if (!clientId) {
    throw new Error("Missing GOOGLE_OAUTH_CLIENT_ID");
  }

  if (
    clientId === "<google_client_id>" ||
    !clientId.endsWith(".apps.googleusercontent.com")
  ) {
    throw new Error(
      "GOOGLE_OAUTH_CLIENT_ID is still a placeholder or not a valid Google OAuth client id.",
    );
  }

  const parsedRedirect = new URL(redirectUri);
  const isLoopbackHost =
    parsedRedirect.hostname === "127.0.0.1" ||
    parsedRedirect.hostname === "localhost";

  if (parsedRedirect.protocol !== "http:" || !isLoopbackHost) {
    throw new Error(
      "GOOGLE_OAUTH_REDIRECT_URI must be a localhost loopback URL",
    );
  }

  if (!parsedRedirect.port) {
    throw new Error(
      "GOOGLE_OAUTH_REDIRECT_URI must include an explicit port, for example: http://127.0.0.1:53682",
    );
  }

  return {
    clientId,
    redirectUri,
    scope,
    tokenProxyUrl,
    supabaseAnonKey,
  };
}
