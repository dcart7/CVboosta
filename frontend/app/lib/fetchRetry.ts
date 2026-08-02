const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
let legacyWebAuthStorageCleared = false;

function clearLegacyWebAuthStorage(): void {
  if (legacyWebAuthStorageCleared || typeof window === "undefined") return;
  legacyWebAuthStorageCleared = true;
  try {
    window.localStorage.removeItem("access_token");
    window.localStorage.removeItem("user_email");
  } catch {
    // Restricted storage must not block the product.
  }
}

clearLegacyWebAuthStorage();

function isRetriableHttpStatus(status: number): boolean {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

function isSafeMethod(method: string): boolean {
  return method === "GET" || method === "HEAD" || method === "OPTIONS";
}

function retryDelayMs(response: Response, fallbackMs: number): number {
  const retryAfter = response.headers.get("Retry-After")?.trim();
  if (!retryAfter) return fallbackMs;
  const seconds = Number(retryAfter);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.min(seconds * 1_000, 15_000);
  }
  const timestamp = Date.parse(retryAfter);
  if (!Number.isNaN(timestamp)) {
    return Math.min(Math.max(timestamp - Date.now(), 0), 15_000);
  }
  return fallbackMs;
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
 * Fetch with timeouts and bounded exponential backoff. GET/HEAD/OPTIONS may be
 * retried normally; unsafe methods are retried only when the caller provides
 * an Idempotency-Key understood by the server. Never retries auth failures.
 */
export async function fetchWithRetry(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  options?: FetchRetryOptions,
): Promise<Response> {
  const requestedAttempts = Math.max(1, options?.attempts ?? 5);
  const baseDelayMs = options?.baseDelayMs ?? 400;
  const timeoutMs = options?.timeoutMs ?? 20_000;

  const headers = new Headers(init?.headers || {});
  // Web auth is cookie-only. Native clients can still use the access_token
  // returned by the backend without exposing it to browser JavaScript.
  clearLegacyWebAuthStorage();

  const method = (init?.method || "GET").toUpperCase();
  const hasIdempotencyKey = headers.has("Idempotency-Key");
  // A network timeout does not prove that a POST failed. Retrying an unsafe
  // request without a server idempotency contract can duplicate purchases,
  // accounts, quota consumption, or generated documents.
  const maxAttempts =
    isSafeMethod(method) || hasIdempotencyKey ? requestedAttempts : 1;

  const mergedInit: RequestInit = {
    ...init,
    headers,
    credentials: init?.credentials ?? "include",
  };

  if (init?.signal) {
    return fetch(input, mergedInit);
  }

  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let delayMs = baseDelayMs * 2 ** attempt;
    try {
      const res = await fetch(input, {
        ...mergedInit,
        signal: controller.signal,
      });

      if (res.status === 401 || res.status === 403) {
        return res;
      }
      if (res.ok) {
        return res;
      }
      const idempotencyConflict =
        res.status === 409 &&
        hasIdempotencyKey &&
        res.headers.has("Retry-After");
      if (
        (!isRetriableHttpStatus(res.status) && !idempotencyConflict) ||
        attempt === maxAttempts - 1
      ) {
        return res;
      }
      delayMs = retryDelayMs(res, delayMs);
      lastError = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastError = err;
      if (attempt === maxAttempts - 1) {
        throw err;
      }
    } finally {
      clearTimeout(timer);
    }
    await sleep(delayMs);
  }
  throw lastError;
}
