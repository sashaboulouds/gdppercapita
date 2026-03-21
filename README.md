# GDP Per Capita

Minimalist website to visualize GDP per capita (nominal) across countries using IMF data.

**Live:** [gdppercapita.fyi](https://gdppercapita.fyi)

## Why this site?

Existing alternatives have limitations:
- **Our World in Data**: PPP-adjusted data only, not nominal
- **Wikipedia**: Up-to-date IMF data, but just a static table
- **World Bank**: Complex UX, data stops at 2024, no JSON export
- **IMF Data Explorer**: No visualization

**Our approach:** Interactive chart with country comparison, nominal GDP (not PPP), data through 2030, simple and fast UX.

## Features

- Interactive D3.js chart comparing countries over time
- 197 countries from IMF World Economic Outlook 2026
- Historical data (1980-2025) + IMF projections (2026-2030)
- Country selector with search and GDP bars (up to 20 countries)
- Export to PNG and JSON
- Shareable URLs
- Mobile responsive

## Articles

- [Why we built this site](https://gdppercapita.fyi/articles/why-we-built-this.html)
- [Why nominal GDP, not PPP](https://gdppercapita.fyi/articles/why-nominal-not-ppp.html)

## Data source

**IMF World Economic Outlook (October 2025)**
- Indicator: NGDPDPC (GDP per capita, current prices, USD)
- Source: [data.imf.org](https://data.imf.org/en/Data-Explorer?datasetUrn=IMF.RES:WEO(9.0.0))

> Note: Some countries (Afghanistan, Eritrea, Lebanon, Pakistan, Sri Lanka, Syria, West Bank and Gaza) show latest available data due to missing recent figures.

## Tech stack

- **Frontend**: Vanilla HTML/CSS/JS
- **Charts**: D3.js
- **Data**: Static JSON (239KB)
- **Hosting**: Netlify

## Structure

```
/
├── index.html
├── style.css
├── app.js
├── favicon.svg
├── data/
│   └── gdp-per-capita.json
├── articles/
│   ├── why-we-built-this.html
│   └── why-nominal-not-ppp.html
├── changelog.html
├── netlify/
│   └── functions/
│       └── views.js
└── README.md
```

## Links

- GitHub: [github.com/sashaboulouds/gdppercapita](https://github.com/sashaboulouds/gdppercapita)

## License

Code: MIT
Charts & visualizations: CC BY 4.0
Data: Subject to [IMF Terms of Use](https://www.imf.org/external/terms.htm)
