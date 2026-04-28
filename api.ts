import type { Coin } from "./types.js";
import type { ApiError } from "./types.js";

const BASE_URL = "https://api.coingecko.com/api/v3/coins/markets";

type FxResponse = {
  rates?: Record<string, number>;
};

type RequestOptions = {
  signal?: AbortSignal;
  timeoutMs: number;
  retryCount: number;
  retryBackoffMs: number;
};

const RETRYABLE_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function shouldRetry(error: unknown, attempt: number, retryCount: number): boolean {
  if (attempt >= retryCount || isAbortError(error)) {
    return false;
  }

  const typedError = error as ApiError;
  if (!typedError?.status) {
    return true;
  }

  return RETRYABLE_STATUSES.has(typedError.status);
}

async function fetchJsonWithPolicy<T>(url: string, options: RequestOptions): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= options.retryCount; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs);
    const onAbort = (): void => controller.abort();
    options.signal?.addEventListener("abort", onAbort);

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        const error: ApiError = new Error("Request failed.");
        error.status = response.status;
        throw error;
      }
      return (await response.json()) as T;
    } catch (error) {
      lastError = error;
      if (!shouldRetry(error, attempt, options.retryCount)) {
        throw error;
      }

      await wait(options.retryBackoffMs * (attempt + 1));
    } finally {
      clearTimeout(timeout);
      options.signal?.removeEventListener("abort", onAbort);
    }
  }

  throw lastError;
}

function buildApiUrl(code: string, topCoinsCount: number): string {
  const params = new URLSearchParams({
    vs_currency: code,
    order: "market_cap_desc",
    per_page: String(topCoinsCount),
    page: "1",
    sparkline: "true",
    price_change_percentage: "24h",
  });

  return `${BASE_URL}?${params.toString()}`;
}

export async function fetchCoins(
  code: string,
  topCoinsCount: number,
  options: RequestOptions
): Promise<Coin[]> {
  return fetchJsonWithPolicy<Coin[]>(buildApiUrl(code, topCoinsCount), options);
}

export async function fetchExchangeRate(
  apiUrl: string,
  baseCurrency: string,
  quoteCurrency: string,
  options: RequestOptions
): Promise<number> {
  const params = new URLSearchParams({
    from: baseCurrency.toUpperCase(),
    to: quoteCurrency.toUpperCase(),
  });
  const data = await fetchJsonWithPolicy<FxResponse>(`${apiUrl}?${params.toString()}`, options);
  const quoteCode = quoteCurrency.toUpperCase();
  const rate = data?.rates?.[quoteCode];
  if (!rate || typeof rate !== "number") {
    throw new Error("Exchange rate is missing in FX response.");
  }

  return rate;
}
