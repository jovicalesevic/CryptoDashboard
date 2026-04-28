import test from "node:test";
import assert from "node:assert/strict";

import { calculateAveragePrice, countPositiveTrend } from "../stats.js";

test("calculateAveragePrice returns 0 for empty list", () => {
  assert.equal(calculateAveragePrice([]), 0);
});

test("calculateAveragePrice computes expected average", () => {
  const coins = [{ current_price: 100 }, { current_price: 200 }, { current_price: 300 }];
  assert.equal(calculateAveragePrice(coins), 200);
});

test("countPositiveTrend counts coins with positive 24h change", () => {
  const coins = [
    { price_change_percentage_24h: 5.6 },
    { price_change_percentage_24h: -1.2 },
    { price_change_percentage_24h: 0 },
    { price_change_percentage_24h: 2.1 },
  ];

  assert.equal(countPositiveTrend(coins), 2);
});
