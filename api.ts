import type { Coin } from "./types";

const BASE_URL = "https://api.coingecko.com/api/v3/coins/markets";

type ApiError = Error & { status?: number };

type FxResponse = {
  rates?: Record<string, number>;
};

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

export async function fetchCoins(code: string, topCoinsCount: number): Promise<Coin[]> {
  const response = await fetch(buildApiUrl(code, topCoinsCount));
  if (!response.ok) {
    const error: ApiError = new Error("Failed to fetch coin data.");
    error.status = response.status;
    throw error;
  }

  return (await response.json()) as Coin[];
}

export async function fetchExchangeRate(
  apiUrl: string,
  baseCurrency: string,
  quoteCurrency: string
): Promise<number> {
  const params = new URLSearchParams({
    from: baseCurrency.toUpperCase(),
    to: quoteCurrency.toUpperCase(),
  });
  const response = await fetch(`${apiUrl}?${params.toString()}`);
  if (!response.ok) {
    const error: ApiError = new Error("Failed to fetch exchange rate.");
    error.status = response.status;
    throw error;
  }

  const data = (await response.json()) as FxResponse;
  const quoteCode = quoteCurrency.toUpperCase();
  const rate = data?.rates?.[quoteCode];
  if (!rate || typeof rate !== "number") {
    throw new Error("Exchange rate is missing in FX response.");
  }

  return rate;
}
