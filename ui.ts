import type { Coin, Messages, Tone } from "./types.js";

export function setStatus(statusBadge: HTMLElement, message: string, tone: Tone = "idle"): void {
  statusBadge.textContent = message;
  statusBadge.className =
    "rounded-full border px-4 py-2 text-xs uppercase tracking-[0.3em] " +
    (tone === "success"
      ? "border-cyan-400/40 bg-cyan-500/10 text-cyan-200"
      : tone === "error"
        ? "border-rose-400/40 bg-rose-500/10 text-rose-200"
        : "border-slate-700 bg-slate-950/50 text-slate-400");
}

export function renderLoading(tableBody: HTMLElement, messages: Messages): void {
  tableBody.innerHTML = `<tr><td colspan="5" class="px-4 py-6 text-center text-slate-500">${messages.table.loading}</td></tr>`;
}

export function renderError(tableBody: HTMLElement, message: string): void {
  tableBody.innerHTML = `<tr><td colspan="5" class="px-4 py-6 text-center text-rose-300">${message}</td></tr>`;
}

function buildSparklinePath(values: number[], width: number, height: number): string {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1 || 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function renderRows(
  tableBody: HTMLElement,
  coins: Coin[],
  currencyFormatter: Intl.NumberFormat,
  compactFormatter: Intl.NumberFormat,
  messages: Messages
): void {
  tableBody.innerHTML = "";
  coins.forEach((coin) => {
    const change = coin.price_change_percentage_24h ?? 0;
    const changeTone = change >= 0 ? "text-emerald-300" : "text-rose-300";
    const trendValues = coin.sparkline_in_7d?.price || [];
    const hasTrend = trendValues.length > 1;
    const sparklineColor = change >= 0 ? "#34d399" : "#fb7185";
    const sparklinePath = hasTrend ? buildSparklinePath(trendValues, 120, 32) : "";
    const row = document.createElement("tr");
    row.className = "hover:bg-slate-800/50 transition";

    row.innerHTML = `
      <td class="px-4 py-4">
        <div class="flex items-center gap-3">
          <img src="${coin.image}" alt="${coin.name}" class="h-8 w-8 rounded-full" />
          <div>
            <p class="font-semibold text-white">${coin.name}</p>
            <p class="text-xs uppercase tracking-[0.3em] text-slate-500">${coin.symbol}</p>
          </div>
        </div>
      </td>
      <td class="px-4 py-4 font-semibold text-slate-100">${currencyFormatter.format(
        coin.current_price
      )}</td>
      <td class="px-4 py-4 font-semibold ${changeTone}">${change.toFixed(2)}%</td>
      <td class="px-4 py-4 text-right text-slate-300">${compactFormatter.format(
        coin.market_cap
      )}</td>
      <td class="px-4 py-4">
        ${
          hasTrend
            ? `<svg viewBox="0 0 120 32" class="h-8 w-28" aria-label="7d trend">
                 <path d="${sparklinePath}" fill="none" stroke="${sparklineColor}" stroke-width="2" stroke-linecap="round" />
               </svg>`
            : `<span class="text-xs text-slate-500">${messages.labels.noTrendData}</span>`
        }
      </td>
    `;

    tableBody.appendChild(row);
  });
}

export function updateStats(
  statAverage: HTMLElement,
  statPositive: HTMLElement,
  average: string,
  positive: string
): void {
  statAverage.textContent = average;
  statPositive.textContent = positive;
}

export function updateTimestamp(lastUpdated: HTMLElement, messages: Messages): void {
  const now = new Date();
  lastUpdated.textContent = `${messages.labels.lastUpdated} ${now.toLocaleTimeString(messages.locale)}`;
}

export function updateCurrencyNote(
  currencyNote: HTMLElement,
  code: string,
  messages: Messages,
  rateNote = ""
): void {
  currencyNote.textContent = messages.labels.currencyNote(code, rateNote);
}
