const BASE_URL = "https://api.coingecko.com/api/v3/coins/markets";

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

export async function fetchCoins(code, topCoinsCount) {
  const response = await fetch(buildApiUrl(code, topCoinsCount));
  if (!response.ok) {
    const error = new Error("Failed to fetch coin data.");
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export async function fetchExchangeRate(apiUrl, baseCurrency, quoteCurrency) {
  const params = new URLSearchParams({
    from: baseCurrency.toUpperCase(),
    to: quoteCurrency.toUpperCase(),
  });
  const response = await fetch(`${apiUrl}?${params.toString()}`);
  if (!response.ok) {
    const error = new Error("Failed to fetch exchange rate.");
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  const quoteCode = quoteCurrency.toUpperCase();
  const rate = data?.rates?.[quoteCode];
  if (!rate || typeof rate !== "number") {
    throw new Error("Exchange rate is missing in FX response.");
  }

  return rate;
}
