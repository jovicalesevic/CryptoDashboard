import { fetchCoins, fetchExchangeRate } from "./api.js";
import { DASHBOARD_CONFIG } from "./config.js";
import { createCompactFormatter, createCurrencyFormatter } from "./formatters.js";
import { getNextLanguage, getSavedLanguagePreference, isSupportedLanguage, saveLanguagePreference, } from "./language.js";
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, getMessages } from "./messages.js";
import { calculateAveragePrice, countPositiveTrend } from "./stats.js";
import { renderError, renderLoading, renderRows, setStatus, updateCurrencyNote, updateStats, updateTimestamp, } from "./ui.js";
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
const installBtn = document.getElementById("installBtn");
let currentLanguage = DEFAULT_LANGUAGE;
let isLoading = false;
let pendingReload = false;
let activeRequestController = null;
let deferredInstallPrompt = null;
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
    void loadCoins();
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
    setTextById("autoRefreshLabel", staticMessages.autoRefreshLabel(Math.floor(DASHBOARD_CONFIG.autoRefreshIntervalMs / 1000)));
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
    setTextById("installBtnText", staticMessages.installButton);
    setTextById("footerCopyright", staticMessages.footerCopyright);
}
async function resolveCurrencyFetchContext(selectedCurrency, messages, signal) {
    if (selectedCurrency !== "rsd") {
        return {
            apiCurrency: selectedCurrency,
            conversionRate: 1,
            rateNote: "",
        };
    }
    const { baseCurrency, quoteCurrency, eurToRsdRate: fallbackRate, fxApiUrl, fxSourceName } = DASHBOARD_CONFIG.rsdFallback;
    try {
        const liveRate = await fetchExchangeRate(fxApiUrl, baseCurrency, quoteCurrency, {
            signal,
            timeoutMs: DASHBOARD_CONFIG.requestTimeoutMs,
            retryCount: DASHBOARD_CONFIG.requestRetryCount,
            retryBackoffMs: DASHBOARD_CONFIG.requestRetryBackoffMs,
        });
        return {
            apiCurrency: baseCurrency,
            conversionRate: liveRate,
            rateNote: messages.labels.rateReference(baseCurrency, selectedCurrency, liveRate, fxSourceName),
        };
    }
    catch {
        return {
            apiCurrency: baseCurrency,
            conversionRate: fallbackRate,
            rateNote: messages.labels.rateFallback(baseCurrency, selectedCurrency, fallbackRate),
        };
    }
}
function isAbortError(error) {
    return error instanceof DOMException && error.name === "AbortError";
}
function applyCurrencyConversion(coins, conversionRate) {
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
async function loadCoins() {
    if (isLoading) {
        activeRequestController?.abort();
        pendingReload = true;
        return;
    }
    isLoading = true;
    const requestController = new AbortController();
    activeRequestController = requestController;
    setControlsDisabled(true);
    const messages = currentMessages();
    setStatus(statusBadge, messages.status.loading);
    renderLoading(tableBody, messages);
    const selectedCurrency = currencySelect.value;
    const currencyCode = selectedCurrency;
    const currencyFormatter = createCurrencyFormatter(currencyCode, messages.locale);
    const compactFormatter = createCompactFormatter(messages.locale);
    try {
        const currencyContext = await resolveCurrencyFetchContext(selectedCurrency, messages, requestController.signal);
        const rawData = await fetchCoins(currencyContext.apiCurrency, DASHBOARD_CONFIG.topCoinsCount, {
            signal: requestController.signal,
            timeoutMs: DASHBOARD_CONFIG.requestTimeoutMs,
            retryCount: DASHBOARD_CONFIG.requestRetryCount,
            retryBackoffMs: DASHBOARD_CONFIG.requestRetryBackoffMs,
        });
        const data = applyCurrencyConversion(rawData, currencyContext.conversionRate);
        renderRows(tableBody, data, currencyFormatter, compactFormatter, messages);
        const average = calculateAveragePrice(data);
        const positive = countPositiveTrend(data);
        const totalCoins = data.length;
        statCount.textContent = String(totalCoins);
        updateStats(statAverage, statPositive, currencyFormatter.format(average), `${positive}/${totalCoins}`);
        updateCurrencyNote(currencyNote, currencyCode, messages, currencyContext.rateNote);
        updateTimestamp(lastUpdated, messages);
        setStatus(statusBadge, messages.status.live, "success");
    }
    catch (error) {
        if (isAbortError(error)) {
            return;
        }
        const typedError = error;
        const isRateLimited = typedError?.status === 429;
        const errorMessage = isRateLimited
            ? messages.table.rateLimited(DASHBOARD_CONFIG.rateLimitRetrySeconds)
            : messages.table.error;
        renderError(tableBody, errorMessage);
        setStatus(statusBadge, isRateLimited ? messages.status.rateLimited : messages.status.error, "error");
    }
    finally {
        if (activeRequestController === requestController) {
            activeRequestController = null;
        }
        isLoading = false;
        setControlsDisabled(false);
        if (pendingReload) {
            pendingReload = false;
            void loadCoins();
        }
    }
}
function setupPwaInstall() {
    if ("serviceWorker" in navigator) {
        void navigator.serviceWorker.register("./sw.js");
    }
    window.addEventListener("beforeinstallprompt", (event) => {
        event.preventDefault();
        deferredInstallPrompt = event;
        installBtn?.classList.remove("hidden");
    });
    installBtn?.addEventListener("click", async () => {
        if (!deferredInstallPrompt) {
            return;
        }
        await deferredInstallPrompt.prompt();
        await deferredInstallPrompt.userChoice;
        deferredInstallPrompt = null;
        installBtn.classList.add("hidden");
    });
    window.addEventListener("appinstalled", () => {
        deferredInstallPrompt = null;
        installBtn?.classList.add("hidden");
    });
}
refreshBtn.addEventListener("click", () => void loadCoins());
refreshHeroBtn.addEventListener("click", () => void loadCoins());
currencySelect.addEventListener("change", () => void loadCoins());
if (languageToggleBtn) {
    languageToggleBtn.addEventListener("click", toggleLanguage);
}
initializeLanguagePreference();
setupPwaInstall();
applyStaticMessages();
void loadCoins();
setInterval(() => void loadCoins(), DASHBOARD_CONFIG.autoRefreshIntervalMs);
