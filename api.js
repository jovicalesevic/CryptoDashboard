const BASE_URL = "https://api.coingecko.com/api/v3/coins/markets";
const RETRYABLE_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);
function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function isAbortError(error) {
    return error instanceof DOMException && error.name === "AbortError";
}
function shouldRetry(error, attempt, retryCount) {
    if (attempt >= retryCount || isAbortError(error)) {
        return false;
    }
    const typedError = error;
    if (!typedError?.status) {
        return true;
    }
    return RETRYABLE_STATUSES.has(typedError.status);
}
async function fetchJsonWithPolicy(url, options) {
    let lastError;
    for (let attempt = 0; attempt <= options.retryCount; attempt += 1) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), options.timeoutMs);
        const onAbort = () => controller.abort();
        options.signal?.addEventListener("abort", onAbort);
        try {
            const response = await fetch(url, { signal: controller.signal });
            if (!response.ok) {
                const error = new Error("Request failed.");
                error.status = response.status;
                throw error;
            }
            return (await response.json());
        }
        catch (error) {
            lastError = error;
            if (!shouldRetry(error, attempt, options.retryCount)) {
                throw error;
            }
            await wait(options.retryBackoffMs * (attempt + 1));
        }
        finally {
            clearTimeout(timeout);
            options.signal?.removeEventListener("abort", onAbort);
        }
    }
    throw lastError;
}
function buildApiUrl(code, topCoinsCount) {
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
export async function fetchCoins(code, topCoinsCount, options) {
    return fetchJsonWithPolicy(buildApiUrl(code, topCoinsCount), options);
}
export async function fetchExchangeRate(apiUrl, baseCurrency, quoteCurrency, options) {
    const params = new URLSearchParams({
        from: baseCurrency.toUpperCase(),
        to: quoteCurrency.toUpperCase(),
    });
    const data = await fetchJsonWithPolicy(`${apiUrl}?${params.toString()}`, options);
    const quoteCode = quoteCurrency.toUpperCase();
    const rate = data?.rates?.[quoteCode];
    if (!rate || typeof rate !== "number") {
        throw new Error("Exchange rate is missing in FX response.");
    }
    return rate;
}
