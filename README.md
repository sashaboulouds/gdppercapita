# GDP Per Capita

Minimalist website to visualize GDP per capita (nominal) across countries.

**Domain:** gdppercapita.com (or gdp-per-capita.com)

## Why this site?

Existing alternatives have limitations:
- **Wikipedia**: Up-to-date IMF 2026 data, but just a table with no charts or filters
- **World Bank**: UX too complex
- **Worldometers**: Also just a table
- **Our World in Data**: PPP-adjusted data, not raw nominal figures

**Our approach:** Table + time series charts, country filtering, raw nominal data, simple and fast UX.

## Features

- **Table**: List of countries with GDP per capita, sortable and filterable
- **Chart**: Time series evolution, compare multiple countries
- **Filters**: Select specific countries for comparison
- **Responsive**: Desktop and mobile

## Data source

**IMF World Economic Outlook (WEO) 2026**
- Source: https://data.imf.org/en/Data-Explorer?datasetUrn=IMF.RES:WEO(9.0.0)
- Wikipedia reference: https://en.wikipedia.org/wiki/List_of_countries_by_GDP_(nominal)_per_capita

> Note: Afghanistan, Lebanon, Palestine, and Sri Lanka use 2023-2024 data.

## Tech stack

- **Frontend**: Vanilla HTML/CSS/JS (or lightweight framework TBD)
- **Data**: Static JSON (no backend)
- **Charts**: TBD (Chart.js, D3.js, or other)
- **Hosting**: Static (Vercel, Netlify, GitHub Pages)

## Style

- Minimalist
- Functional
- Fast (no bloat)
- Clean typography

## Structure

```
/
├── index.html
├── style.css
├── app.js
├── data/
│   └── gdp-per-capita.json
└── README.md
```

## TODO

- [ ] Fetch IMF data and format as JSON
- [ ] Build sortable/filterable table
- [ ] Add time series charts
- [ ] Country selector for comparison
- [ ] Responsive design
- [ ] Deploy

## License

MIT
