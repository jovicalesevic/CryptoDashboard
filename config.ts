export const DASHBOARD_CONFIG = {
  topCoinsCount: 10,
  autoRefreshIntervalMs: 60_000,
  rateLimitRetrySeconds: 30,
  requestTimeoutMs: 12_000,
  requestRetryCount: 2,
  requestRetryBackoffMs: 600,
  rsdFallback: {
    baseCurrency: "eur",
    eurToRsdRate: 117.2,
    quoteCurrency: "rsd",
    fxApiUrl: "https://api.frankfurter.app/latest",
    fxSourceName: "Frankfurter API",
  },
} as const;
