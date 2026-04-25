const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function isRetriableHttpStatus(status: number): boolean {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

export type FetchRetryOptions = {
  /** Total attempts including the first try (default 5). */
  attempts?: number;
  /** Base delay before first retry in ms (default 400). */
  baseDelayMs?: number;
  /** Per-attempt timeout in ms (default 20000). */
  timeoutMs?: number;
};

/**
 * fetch with timeouts, exponential backoff, and retries on network errors
 * and transient server statuses (5xx, 429, etc.). Does not retry 401/403/404.
 */
export async function fetchWithRetry(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  options?: FetchRetryOptions,
): Promise<Response> {
  const maxAttempts = options?.attempts ?? 5;
  const baseDelayMs = options?.baseDelayMs ?? 400;
  const timeoutMs = options?.timeoutMs ?? 20_000;

  if (init?.signal) {
    return fetch(input, { credentials: init.credentials ?? "include", ...init });
  }

  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(input, {
        credentials: init?.credentials ?? "include",
        ...init,
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.status === 401 || res.status === 403) {
        return res;
      }
      if (res.ok) {
        return res;
      }
      if (!isRetriableHttpStatus(res.status) || attempt === maxAttempts - 1) {
        return res;
      }
      lastError = new Error(`HTTP ${res.status}`);
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      if (attempt === maxAttempts - 1) {
        throw err;
      }
    }
    await sleep(baseDelayMs * 2 ** attempt);
  }
  throw lastError;
}
