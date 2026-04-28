export function calculateAveragePrice(coins) {
  if (!coins.length) {
    return 0;
  }

  return coins.reduce((sum, coin) => sum + (coin.current_price || 0), 0) / coins.length;
}

export function countPositiveTrend(coins) {
  return coins.filter((coin) => (coin.price_change_percentage_24h || 0) > 0).length;
}
