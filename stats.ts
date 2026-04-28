import type { Coin } from "./types.js";

export function calculateAveragePrice(coins: Coin[]): number {
  if (!coins.length) {
    return 0;
  }

  return coins.reduce((sum, coin) => sum + (coin.current_price || 0), 0) / coins.length;
}

export function countPositiveTrend(coins: Coin[]): number {
  return coins.filter((coin) => (coin.price_change_percentage_24h || 0) > 0).length;
}
