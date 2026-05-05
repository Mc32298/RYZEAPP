export function formatGoogleConnectError(error: unknown) {
  const fallback = "Google sign-in failed. Please try again.";
  const message = error instanceof Error ? error.message : fallback;
  const normalized = message.toLowerCase();

  if (normalized.includes("timed out waiting for google sign-in callback")) {
    return [
      "Google sign-in did not return to the app.",
      "If Google showed an Access blocked or policy_enforced page, this account is likely protected by Advanced Protection or another Google policy that does not allow RYZE.",
    ].join(" ");
  }

  if (
    normalized.includes("client_secret is missing") ||
    normalized.includes("expects a client secret")
  ) {
    return [
      "Google OAuth is misconfigured.",
      "The bundled Google client is the wrong type for this Electron PKCE flow. Replace it with a Google OAuth client of type Desktop app that uses the app's localhost redirect URI.",
    ].join(" ");
  }

  if (normalized.includes("policy_enforced")) {
    return [
      "Google blocked this sign-in with policy_enforced.",
      "That usually means Advanced Protection or an organization policy does not allow this app.",
    ].join(" ");
  }

  return message;
}
