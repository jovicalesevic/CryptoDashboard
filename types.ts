export type Tone = "idle" | "success" | "error";

export type Language = "sr" | "en";

export type CurrencyCode = "usd" | "eur" | "rsd";

export type Coin = {
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number | null;
  sparkline_in_7d?: {
    price: number[];
  };
};

export type Messages = {
  locale: string;
  static: {
    heroTitle: string;
    refreshHeroButton: string;
    marketTag: string;
    mainTitle: string;
    mainSubtitle: string;
    sourceLabel: string;
    sourceName: string;
    sourceNote: string;
    topTenTitle: string;
    topTenDescription: string;
    updateLabel: string;
    updateMode: string;
    sentimentTitle: string;
    sentimentDescription: string;
    autoRefreshLabel: (seconds: number) => string;
    currencyLabel: string;
    refreshDataButton: string;
    statCountLabel: string;
    statAverageLabel: string;
    statPositiveLabel: string;
    tableSectionTitle: string;
    tableHeaderCurrency: string;
    tableHeaderPrice: string;
    tableHeaderChange24h: string;
    tableHeaderMarketCap: string;
    tableHeaderTrend7d: string;
    toggleLanguageButton: string;
  };
  status: {
    loading: string;
    live: string;
    error: string;
    rateLimited: string;
  };
  table: {
    loading: string;
    error: string;
    rateLimited: (seconds: number) => string;
  };
  labels: {
    lastUpdated: string;
    currencyNote: (code: string, rateNote?: string) => string;
    rateReference: (base: string, quote: string, rate: number, source: string) => string;
    rateFallback: (base: string, quote: string, rate: number) => string;
    noTrendData: string;
  };
};
