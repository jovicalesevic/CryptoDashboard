export const DEFAULT_LANGUAGE = "sr";
export const SUPPORTED_LANGUAGES = ["sr", "en"];

export const LANGUAGE_MESSAGES = {
  sr: {
    locale: "sr-RS",
    static: {
      heroTitle: "Moj Pro Dashboard",
      refreshHeroButton: "Osveži cene",
      marketTag: "Kripto tržište",
      mainTitle: "Moderan Kripto Dashboard",
      mainSubtitle: "Najvećih 10 valuta po tržišnoj kapitalizaciji i promena u poslednjih 24h.",
      sourceLabel: "Izvor",
      sourceName: "CoinGecko Public API",
      sourceNote: "Bez API ključa",
      topTenTitle: "Top 10 Valuta",
      topTenDescription: "Pregled najvažnijih kripto valuta, real-time cene i trendovi.",
      updateLabel: "Ažuriranje",
      updateMode: "Automatski na učitavanje",
      sentimentTitle: "Tržišni Sentiment",
      sentimentDescription: "Pratite trendove i volatilnost u realnom vremenu.",
      autoRefreshLabel: (seconds) => `Auto osvežavanje: ${seconds}s`,
      currencyLabel: "Valuta",
      refreshDataButton: "Osveži podatke",
      statCountLabel: "Valute",
      statAverageLabel: "Prosečna Cena",
      statPositiveLabel: "Pozitivni Trend",
      tableSectionTitle: "Top 10 kripto valuta",
      tableHeaderCurrency: "Valuta",
      tableHeaderPrice: "Cena",
      tableHeaderChange24h: "24h promena",
      tableHeaderMarketCap: "Tržišna Kapitalizacija",
      toggleLanguageButton: "EN",
    },
    status: {
      loading: "Učitavanje...",
      live: "Uživo",
      error: "Greška",
      rateLimited: "Limit zahteva",
    },
    table: {
      loading: "Učitavanje podataka...",
      error: "Greška pri učitavanju podataka. Pokušajte ponovo.",
      rateLimited: (seconds) =>
        `Dosegnut je API limit. Pokušajte ponovo za oko ${seconds} sekundi.`,
    },
    labels: {
      lastUpdated: "Poslednje osvežavanje:",
      currencyNote: (code, rateNote = "") =>
        `Cene u ${code.toUpperCase()} i promena u poslednjih 24h.${rateNote ? ` ${rateNote}` : ""}`,
      rateReference: (base, quote, rate) =>
        `Za poređenje koristimo kurs 1 ${base.toUpperCase()} = ${rate} ${quote.toUpperCase()}.`,
    },
  },
  en: {
    locale: "en-US",
    static: {
      heroTitle: "My Pro Dashboard",
      refreshHeroButton: "Refresh prices",
      marketTag: "Crypto market",
      mainTitle: "Modern Crypto Dashboard",
      mainSubtitle: "Top 10 currencies by market cap and their 24h change.",
      sourceLabel: "Source",
      sourceName: "CoinGecko Public API",
      sourceNote: "No API key required",
      topTenTitle: "Top 10 Currencies",
      topTenDescription: "Overview of major crypto assets, real-time prices, and trends.",
      updateLabel: "Updates",
      updateMode: "Automatic on load",
      sentimentTitle: "Market Sentiment",
      sentimentDescription: "Track market trends and volatility in real time.",
      autoRefreshLabel: (seconds) => `Auto refresh: ${seconds}s`,
      currencyLabel: "Currency",
      refreshDataButton: "Refresh data",
      statCountLabel: "Currencies",
      statAverageLabel: "Average Price",
      statPositiveLabel: "Positive Trend",
      tableSectionTitle: "Top 10 crypto currencies",
      tableHeaderCurrency: "Currency",
      tableHeaderPrice: "Price",
      tableHeaderChange24h: "24h change",
      tableHeaderMarketCap: "Market Cap",
      toggleLanguageButton: "SR",
    },
    status: {
      loading: "Loading...",
      live: "Live",
      error: "Error",
      rateLimited: "Rate limited",
    },
    table: {
      loading: "Loading data...",
      error: "Error loading data. Please try again.",
      rateLimited: (seconds) => `API rate limit reached. Retry in about ${seconds} seconds.`,
    },
    labels: {
      lastUpdated: "Last updated:",
      currencyNote: (code, rateNote = "") =>
        `Prices in ${code.toUpperCase()} and 24h change.${rateNote ? ` ${rateNote}` : ""}`,
      rateReference: (base, quote, rate) =>
        `Reference rate used for comparison: 1 ${base.toUpperCase()} = ${rate} ${quote.toUpperCase()}.`,
    },
  },
};

export function getMessages(language) {
  return LANGUAGE_MESSAGES[language] ?? LANGUAGE_MESSAGES[DEFAULT_LANGUAGE];
}
