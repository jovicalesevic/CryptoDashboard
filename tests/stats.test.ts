import test from "node:test";
import assert from "node:assert/strict";

import { calculateAveragePrice, countPositiveTrend } from "../stats";
import type { Coin } from "../types";

function createCoin(overrides: Partial<Coin>): Coin {
  return {
    name: "Coin",
    symbol: "c",
    image: "",
    current_price: 0,
    market_cap: 0,
    price_change_percentage_24h: 0,
    ...overrides,
  };
}

test("calculateAveragePrice returns 0 for empty list", () => {
  assert.equal(calculateAveragePrice([]), 0);
});

test("calculateAveragePrice computes expected average", () => {
  const coins = [
    createCoin({ current_price: 100 }),
    createCoin({ current_price: 200 }),
    createCoin({ current_price: 300 }),
  ];
  assert.equal(calculateAveragePrice(coins), 200);
});

test("countPositiveTrend counts coins with positive 24h change", () => {
  const coins = [
    createCoin({ price_change_percentage_24h: 5.6 }),
    createCoin({ price_change_percentage_24h: -1.2 }),
    createCoin({ price_change_percentage_24h: 0 }),
    createCoin({ price_change_percentage_24h: 2.1 }),
  ];

  assert.equal(countPositiveTrend(coins), 2);
});
