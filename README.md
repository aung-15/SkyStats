# SkyStats

**How COVID-19 Reshaped American Air Travel** — a DH 101 (Summer 2026) final project by Group 2.

A static data-journalism site tracing how the COVID-19 pandemic affected commercial air passenger volume, departures, and flight distances across the ten largest U.S. metropolitan areas, using the Bureau of Transportation Statistics' T-100 Segment dataset (2019–2025).

**Live site:** _add your GitHub Pages URL here after deploying_

## Pages

- `index.html` — Home
- `about.html` — About the team
- `data-critique.html` — Dataset critique (T-100 / BTS)
- `narrative.html` — Findings and interactive charts
- `sources.html` — Bibliography and data sources

## Tech

Plain HTML/CSS/JS — no build step or dependencies required. Charts are rendered with [Chart.js](https://www.chartjs.org/) (loaded via CDN) from data in `assets/data/skystats.json`, which was aggregated from the raw CSVs in `assets/data/raw/`.

## Running locally

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Team

Kyaw Htet Aung, Shelley Wang, Calvin Vo, Qichuan Xia, Sarah Min, Wenkang Huang
