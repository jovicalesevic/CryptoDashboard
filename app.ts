import { fetchCoins, fetchExchangeRate } from "./api";
import { DASHBOARD_CONFIG } from "./config";
import { createCompactFormatter, createCurrencyFormatter } from "./formatters";
import {
  getNextLanguage,
  getSavedLanguagePreference,
  isSupportedLanguage,
  saveLanguagePreference,
} from "./language";
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, getMessages } from "./messages";
import { calculateAveragePrice, countPositiveTrend } from "./stats";
import {
  renderError,
  renderLoading,
  renderRows,
  setStatus,
  updateCurrencyNote,
  updateStats,
  updateTimestamp,
} from "./ui";
import type { Coin, Language, Messages } from "./types";

type CurrencyFetchContext = {
  apiCurrency: string;
  conversionRate: number;
  rateNote: string;
};

type ApiError = Error & { status?: number };

const tableBody = document.getElementById("coinTable") as HTMLElement;
const statusBadge = document.getElementById("statusBadge") as HTMLElement;
const currencySelect = document.getElementById("currencySelect") as HTMLSelectElement;
const currencyNote = document.getElementById("currencyNote") as HTMLElement;
const lastUpdated = document.getElementById("lastUpdated") as HTMLElement;
const statAverage = document.getElementById("statAverage") as HTMLElement;
const statPositive = document.getElementById("statPositive") as HTMLElement;
const statCount = document.getElementById("statCount") as HTMLElement;
const refreshBtn = document.getElementById("refreshBtn") as HTMLButtonElement;
const refreshHeroBtn = document.getElementById("refreshHeroBtn") as HTMLButtonElement;
const languageToggleBtn = document.getElementById("languageToggleBtn") as HTMLButtonElement | null;

let currentLanguage: Language = DEFAULT_LANGUAGE;
let isLoading = false;
let pendingReload = false;

function currentMessages(): Messages {
  return getMessages(currentLanguage);
}

function initializeLanguagePreference(): void {
  const savedLanguage = getSavedLanguagePreference(localStorage);
  if (savedLanguage && isSupportedLanguage(savedLanguage, SUPPORTED_LANGUAGES)) {
    currentLanguage = savedLanguage;
  }
}

function toggleLanguage(): void {
  currentLanguage = getNextLanguage(currentLanguage);
  saveLanguagePreference(localStorage, currentLanguage);
  applyStaticMessages();
  void loadCoins();
}

function setControlsDisabled(disabled: boolean): void {
  [refreshBtn, refreshHeroBtn, languageToggleBtn, currencySelect].forEach((element) => {
    if (element) {
      element.disabled = disabled;
    }
  });
}

function setTextById(id: string, value: string): void {
  const element = document.getElementById(id);
  if (!element) {
    return;
  }
  element.textContent = value;
}

function applyStaticMessages(): void {
  const { static: staticMessages } = currentMessages();
  document.documentElement.lang = currentLanguage;
  setTextById("heroTitle", staticMessages.heroTitle);
  setTextById("refreshHeroBtnText", staticMessages.refreshHeroButton);
  setTextById("marketTag", staticMessages.marketTag);
  setTextById("mainTitle", staticMessages.mainTitle);
  setTextById("mainSubtitle", staticMessages.mainSubtitle);
  setTextById("sourceLabel", staticMessages.sourceLabel);
  setTextById("sourceName", staticMessages.sourceName);
  setTextById("sourceNote", staticMessages.sourceNote);
  setTextById("topTenTitle", staticMessages.topTenTitle);
  setTextById("topTenDescription", staticMessages.topTenDescription);
  setTextById("updateLabel", staticMessages.updateLabel);
  setTextById("updateMode", staticMessages.updateMode);
  setTextById("sentimentTitle", staticMessages.sentimentTitle);
  setTextById("sentimentDescription", staticMessages.sentimentDescription);
  setTextById(
    "autoRefreshLabel",
    staticMessages.autoRefreshLabel(Math.floor(DASHBOARD_CONFIG.autoRefreshIntervalMs / 1000))
  );
  setTextById("currencyLabel", staticMessages.currencyLabel);
  setTextById("refreshBtnText", staticMessages.refreshDataButton);
  setTextById("statCountLabel", staticMessages.statCountLabel);
  setTextById("statAverageLabel", staticMessages.statAverageLabel);
  setTextById("statPositiveLabel", staticMessages.statPositiveLabel);
  setTextById("tableSectionTitle", staticMessages.tableSectionTitle);
  setTextById("tableHeaderCurrency", staticMessages.tableHeaderCurrency);
  setTextById("tableHeaderPrice", staticMessages.tableHeaderPrice);
  setTextById("tableHeaderChange24h", staticMessages.tableHeaderChange24h);
  setTextById("tableHeaderMarketCap", staticMessages.tableHeaderMarketCap);
  setTextById("tableHeaderTrend7d", staticMessages.tableHeaderTrend7d);
  setTextById("languageToggleBtnText", staticMessages.toggleLanguageButton);
}

async function resolveCurrencyFetchContext(
  selectedCurrency: string,
  messages: Messages
): Promise<CurrencyFetchContext> {
  if (selectedCurrency !== "rsd") {
    return {
      apiCurrency: selectedCurrency,
      conversionRate: 1,
      rateNote: "",
    };
  }

  const { baseCurrency, quoteCurrency, eurToRsdRate: fallbackRate, fxApiUrl, fxSourceName } =
    DASHBOARD_CONFIG.rsdFallback;

  try {
    const liveRate = await fetchExchangeRate(fxApiUrl, baseCurrency, quoteCurrency);
    return {
      apiCurrency: baseCurrency,
      conversionRate: liveRate,
      rateNote: messages.labels.rateReference(baseCurrency, selectedCurrency, liveRate, fxSourceName),
    };
  } catch {
    return {
      apiCurrency: baseCurrency,
      conversionRate: fallbackRate,
      rateNote: messages.labels.rateFallback(baseCurrency, selectedCurrency, fallbackRate),
    };
  }
}

function applyCurrencyConversion(coins: Coin[], conversionRate: number): Coin[] {
  if (conversionRate === 1) {
    return coins;
  }

  return coins.map((coin) => ({
    ...coin,
    current_price: (coin.current_price || 0) * conversionRate,
    market_cap: (coin.market_cap || 0) * conversionRate,
    sparkline_in_7d: {
      price: (coin.sparkline_in_7d?.price || []).map((value) => value * conversionRate),
    },
  }));
}

async function loadCoins(): Promise<void> {
  if (isLoading) {
    pendingReload = true;
    return;
  }

  isLoading = true;
  setControlsDisabled(true);
  const messages = currentMessages();
  setStatus(statusBadge, messages.status.loading);
  renderLoading(tableBody, messages);
  const selectedCurrency = currencySelect.value;
  const currencyContext = await resolveCurrencyFetchContext(selectedCurrency, messages);
  const currencyCode = selectedCurrency;
  const currencyFormatter = createCurrencyFormatter(currencyCode, messages.locale);
  const compactFormatter = createCompactFormatter(messages.locale);

  try {
    const rawData = await fetchCoins(currencyContext.apiCurrency, DASHBOARD_CONFIG.topCoinsCount);
    const data = applyCurrencyConversion(rawData, currencyContext.conversionRate);
    renderRows(tableBody, data, currencyFormatter, compactFormatter, messages);

    const average = calculateAveragePrice(data);
    const positive = countPositiveTrend(data);
    const totalCoins = data.length;
    statCount.textContent = String(totalCoins);
    updateStats(
      statAverage,
      statPositive,
      currencyFormatter.format(average),
      `${positive}/${totalCoins}`
    );
    updateCurrencyNote(currencyNote, currencyCode, messages, currencyContext.rateNote);
    updateTimestamp(lastUpdated, messages);
    setStatus(statusBadge, messages.status.live, "success");
  } catch (error) {
    const typedError = error as ApiError;
    const isRateLimited = typedError?.status === 429;
    const errorMessage = isRateLimited
      ? messages.table.rateLimited(DASHBOARD_CONFIG.rateLimitRetrySeconds)
      : messages.table.error;
    renderError(tableBody, errorMessage);
    setStatus(
      statusBadge,
      isRateLimited ? messages.status.rateLimited : messages.status.error,
      "error"
    );
  } finally {
    isLoading = false;
    setControlsDisabled(false);
    if (pendingReload) {
      pendingReload = false;
      void loadCoins();
    }
  }
}

refreshBtn.addEventListener("click", () => void loadCoins());
refreshHeroBtn.addEventListener("click", () => void loadCoins());
currencySelect.addEventListener("change", () => void loadCoins());
if (languageToggleBtn) {
  languageToggleBtn.addEventListener("click", toggleLanguage);
}
initializeLanguagePreference();
applyStaticMessages();
void loadCoins();
setInterval(() => void loadCoins(), DASHBOARD_CONFIG.autoRefreshIntervalMs);
