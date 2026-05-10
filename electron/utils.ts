export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getGraphRetryDelayMs(response: Response, attempt: number) {
  const retryAfterHeader = response.headers.get("retry-after");
  const retryAfterSeconds = retryAfterHeader
    ? Number.parseInt(retryAfterHeader, 10)
    : NaN;

  if (Number.isFinite(retryAfterSeconds)) {
    return Math.max(retryAfterSeconds, 1) * 1000;
  }

  return Math.min(30_000, attempt * 5000);
}
