export function createCurrencyFormatter(code, locale) {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: code.toUpperCase(),
        maximumFractionDigits: 2,
    });
}
export function createCompactFormatter(locale) {
    return new Intl.NumberFormat(locale, {
        notation: "compact",
        maximumFractionDigits: 2,
    });
}
