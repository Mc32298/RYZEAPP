import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { validateFunctionApiKey } from "./auth.ts";

type TokenProxyRequest =
  | {
      grantType: "authorization_code";
      clientId: string;
      code: string;
      codeVerifier: string;
      redirectUri: string;
    }
  | {
      grantType: "refresh_token";
      clientId: string;
      refreshToken: string;
    };

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

serve(async (req) => {
  if (req.method !== "POST") {
    return json(405, { error: "method_not_allowed" });
  }

  let payload: TokenProxyRequest;
  try {
    payload = (await req.json()) as TokenProxyRequest;
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const configuredClientId =
    Deno.env.get("GOOGLE_OAUTH_CLIENT_ID")?.trim() || "";
  const clientSecret = Deno.env.get("GOOGLE_OAUTH_CLIENT_SECRET")?.trim() || "";
  const configuredRedirectUri =
    Deno.env.get("GOOGLE_OAUTH_REDIRECT_URI")?.trim() || "";
  const expectedApiKey =
    Deno.env.get("GOOGLE_OAUTH_PROXY_API_KEY")?.trim() || "";

  const apiKeyValidation = validateFunctionApiKey({
    apiKeyHeader: req.headers.get("apikey"),
    expectedApiKey,
  });
  if (!apiKeyValidation.ok) {
    return json(apiKeyValidation.status, { error: apiKeyValidation.error });
  }

  if (!configuredClientId || !clientSecret || !configuredRedirectUri) {
    return json(500, { error: "google_oauth_not_configured" });
  }

  if (!payload.clientId?.trim()) {
    return json(400, { error: "missing_client_id" });
  }

  if (payload.clientId.trim() !== configuredClientId) {
    return json(400, {
      error: "oauth_client_mismatch",
      error_description:
        "Desktop GOOGLE_OAUTH_CLIENT_ID does not match Supabase function GOOGLE_OAUTH_CLIENT_ID.",
      desktopClientIdSuffix: payload.clientId.trim().slice(-32),
      functionClientIdSuffix: configuredClientId.slice(-32),
    });
  }

  const params = new URLSearchParams({
    client_id: configuredClientId,
    client_secret: clientSecret,
  });

  if (payload.grantType === "authorization_code") {
    if (
      !payload.code?.trim() ||
      !payload.codeVerifier?.trim() ||
      !payload.redirectUri?.trim()
    ) {
      return json(400, { error: "missing_authorization_code_fields" });
    }

    if (payload.redirectUri !== configuredRedirectUri) {
      return json(400, { error: "invalid_redirect_uri" });
    }

    params.set("grant_type", "authorization_code");
    params.set("code", payload.code);
    params.set("code_verifier", payload.codeVerifier);
    params.set("redirect_uri", configuredRedirectUri);
  } else if (payload.grantType === "refresh_token") {
    if (!payload.refreshToken?.trim()) {
      return json(400, { error: "missing_refresh_token" });
    }

    params.set("grant_type", "refresh_token");
    params.set("refresh_token", payload.refreshToken);
  } else {
    return json(400, { error: "unsupported_grant_type" });
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const responseText = await tokenResponse.text();

  return new Response(responseText, {
    status: tokenResponse.status,
    headers: {
      "Content-Type": "application/json",
    },
  });
});
