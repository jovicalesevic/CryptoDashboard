import { expect, test } from "@playwright/test";

const coinsPayload = [
  {
    name: "Bitcoin",
    symbol: "btc",
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    current_price: 65000,
    market_cap: 1200000000000,
    price_change_percentage_24h: 2.45,
    sparkline_in_7d: {
      price: [62000, 62500, 63000, 64000, 63800, 64500, 65000],
    },
  },
  {
    name: "Ethereum",
    symbol: "eth",
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    current_price: 3200,
    market_cap: 380000000000,
    price_change_percentage_24h: -1.15,
    sparkline_in_7d: {
      price: [3300, 3280, 3260, 3240, 3220, 3210, 3200],
    },
  },
];

test("smoke: language toggle, RSD note, and table render", async ({ page }) => {
  await page.route("**/api.coingecko.com/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(coinsPayload),
    });
  });

  await page.route("**/api.frankfurter.app/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        amount: 1,
        base: "EUR",
        date: "2026-01-01",
        rates: { RSD: 117.2 },
      }),
    });
  });

  await page.goto("/");

  await expect(page.locator("#tableHeaderCurrency")).toHaveText("Valuta");
  await expect(page.locator("#coinTable tr")).toHaveCount(2);

  await page.locator("#currencySelect").selectOption("rsd");
  await expect(page.locator("#currencyNote")).toContainText("1 EUR = 117.2 RSD");

  await page.locator("#languageToggleBtn").click();
  await expect(page.locator("#tableHeaderCurrency")).toHaveText("Currency");
  await expect(page.locator("#currencyNote")).toContainText("1 EUR = 117.2 RSD");
});
