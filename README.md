# Crypto Dashboard

A lightweight, single-page cryptocurrency dashboard that pulls live market data from the **CoinGecko public API** (no API key required). It shows the top 10 coins by market capitalization with prices, 24-hour change, and formatted market-cap figures in a responsive, dark-themed layout.

## Features

- **REST API integration** — Fetches real-time data from CoinGecko (`/coins/markets`) with error handling and loading states.
- **Multi-currency display** — Switch quote currency between **USD**, **EUR**, and **RSD**; table and summary stats update accordingly.
- **Market overview** — Top 10 assets by market cap, 24h price change (color-coded), and compact market-cap formatting.
- **Summary statistics** — Average price across the list and count of assets with a positive 24h trend.
- **Auto & manual refresh** — Data loads on page load; automatic refresh every **60 seconds**; dedicated refresh controls in the hero and toolbar.
- **Responsive UI** — Mobile-friendly grid and table layout built with **Tailwind CSS** (CDN).
- **Dark mode aesthetic** — Slate/cyan palette optimized for low-light viewing.

## Tech Stack

| Layer   | Technology                          |
| ------- | ----------------------------------- |
| Markup  | HTML5                               |
| Styling | CSS (Tailwind CSS via CDN)          |
| Logic   | Vanilla JavaScript (ES modules N/A) |

## Live Demo

**[https://jovicalesevic.github.io/CryptoDashboard/](https://jovicalesevic.github.io/CryptoDashboard/)**

> Enable **GitHub Pages** on this repository (branch `main`, folder `/ (root)`) if the demo is not live yet.

## Installation

1. **Clone** the repository:

   ```bash
   git clone https://github.com/jovicalesevic/CryptoDashboard.git
   cd CryptoDashboard
   ```

2. **Open** `index.html` in your browser (double-click the file or use a local static server).

No build step or package manager is required.

## API note

This project uses the [CoinGecko API](https://www.coingecko.com/en/api). Public endpoints are subject to rate limits; for heavy use, review CoinGecko’s terms and consider their paid plans.

## License

This project is released under the [MIT License](LICENSE).

## Author

**Jovica Lešević**
