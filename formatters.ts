export function createCurrencyFormatter(code: string, locale: string): Intl.NumberFormat {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code.toUpperCase(),
    maximumFractionDigits: 2,
  });
}

export function createCompactFormatter(locale: string): Intl.NumberFormat {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 2,
  });
}
