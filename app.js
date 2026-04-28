import { fetchCoins } from "./api.js";
import { DASHBOARD_CONFIG } from "./config.js";
import { createCompactFormatter, createCurrencyFormatter } from "./formatters.js";
import {
  getNextLanguage,
  getSavedLanguagePreference,
  isSupportedLanguage,
  saveLanguagePreference,
} from "./language.js";
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, getMessages } from "./messages.js";
import { calculateAveragePrice, countPositiveTrend } from "./stats.js";
import {
  renderError,
  renderLoading,
  renderRows,
  setStatus,
  updateCurrencyNote,
  updateStats,
  updateTimestamp,
} from "./ui.js";

const tableBody = document.getElementById("coinTable");
const statusBadge = document.getElementById("statusBadge");
const currencySelect = document.getElementById("currencySelect");
const currencyNote = document.getElementById("currencyNote");
const lastUpdated = document.getElementById("lastUpdated");
const statAverage = document.getElementById("statAverage");
const statPositive = document.getElementById("statPositive");
const statCount = document.getElementById("statCount");
const refreshBtn = document.getElementById("refreshBtn");
const refreshHeroBtn = document.getElementById("refreshHeroBtn");
const languageToggleBtn = document.getElementById("languageToggleBtn");

let currentLanguage = DEFAULT_LANGUAGE;
let isLoading = false;
let pendingReload = false;

function currentMessages() {
  return getMessages(currentLanguage);
}

function initializeLanguagePreference() {
  const savedLanguage = getSavedLanguagePreference(localStorage);
  if (savedLanguage && isSupportedLanguage(savedLanguage, SUPPORTED_LANGUAGES)) {
    currentLanguage = savedLanguage;
  }
}

function toggleLanguage() {
  currentLanguage = getNextLanguage(currentLanguage);
  saveLanguagePreference(localStorage, currentLanguage);
  applyStaticMessages();
  loadCoins();
}

function setControlsDisabled(disabled) {
  [refreshBtn, refreshHeroBtn, languageToggleBtn, currencySelect].forEach((element) => {
    if (element) {
      element.disabled = disabled;
    }
  });
}

function setTextById(id, value) {
  const element = document.getElementById(id);
  if (!element) {
    return;
  }
  element.textContent = value;
}

function applyStaticMessages() {
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
  setTextById("languageToggleBtnText", staticMessages.toggleLanguageButton);
}

function resolveCurrencyFetchContext(selectedCurrency, messages) {
  if (selectedCurrency !== "rsd") {
    return {
      apiCurrency: selectedCurrency,
      conversionRate: 1,
      rateNote: "",
    };
  }

  const baseCurrency = DASHBOARD_CONFIG.rsdFallback.baseCurrency;
  const conversionRate = DASHBOARD_CONFIG.rsdFallback.eurToRsdRate;
  return {
    apiCurrency: baseCurrency,
    conversionRate,
    rateNote: messages.labels.rateReference(baseCurrency, selectedCurrency, conversionRate),
  };
}

function applyCurrencyConversion(coins, conversionRate) {
  if (conversionRate === 1) {
    return coins;
  }

  return coins.map((coin) => ({
    ...coin,
    current_price: (coin.current_price || 0) * conversionRate,
    market_cap: (coin.market_cap || 0) * conversionRate,
  }));
}

async function loadCoins() {
  if (isLoading) {
    pendingReload = true;
    return;
  }

  isLoading = true;
  setControlsDisabled(true);
  const messages = currentMessages();
  const selectedCurrency = currencySelect.value;
  const currencyContext = resolveCurrencyFetchContext(selectedCurrency, messages);
  const currencyCode = selectedCurrency;
  const currencyFormatter = createCurrencyFormatter(currencyCode, messages.locale);
  const compactFormatter = createCompactFormatter(messages.locale);
  setStatus(statusBadge, messages.status.loading);
  renderLoading(tableBody, messages);

  try {
    const rawData = await fetchCoins(currencyContext.apiCurrency, DASHBOARD_CONFIG.topCoinsCount);
    const data = applyCurrencyConversion(rawData, currencyContext.conversionRate);
    renderRows(tableBody, data, currencyFormatter, compactFormatter);

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
    const isRateLimited = error && error.status === 429;
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
      loadCoins();
    }
  }
}

refreshBtn.addEventListener("click", loadCoins);
refreshHeroBtn.addEventListener("click", loadCoins);
currencySelect.addEventListener("change", loadCoins);
if (languageToggleBtn) {
  languageToggleBtn.addEventListener("click", toggleLanguage);
}
initializeLanguagePreference();
applyStaticMessages();
loadCoins();
setInterval(loadCoins, DASHBOARD_CONFIG.autoRefreshIntervalMs);
