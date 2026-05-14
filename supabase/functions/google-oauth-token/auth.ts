export function validateFunctionApiKey(args: {
  apiKeyHeader: string | null;
  expectedApiKey: string;
}) {
  const expectedApiKey = args.expectedApiKey.trim();

  if (!expectedApiKey) {
    return {
      ok: false as const,
      error: "server_api_key_not_configured",
      status: 500,
    };
  }

  if (!args.apiKeyHeader?.trim()) {
    return {
      ok: false as const,
      error: "missing_apikey_header",
      status: 401,
    };
  }

  if (args.apiKeyHeader.trim() !== expectedApiKey) {
    return {
      ok: false as const,
      error: "invalid_apikey_header",
      status: 401,
    };
  }

  return {
    ok: true as const,
  };
}
