const BASE_URL = "https://api.coingecko.com/api/v3/coins/markets";

function buildApiUrl(code, topCoinsCount) {
  const params = new URLSearchParams({
    vs_currency: code,
    order: "market_cap_desc",
    per_page: String(topCoinsCount),
    page: "1",
    sparkline: "false",
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
