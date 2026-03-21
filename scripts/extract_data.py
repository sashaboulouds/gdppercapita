import csv
import json
from pathlib import Path
from datetime import date

DATA_DIR = Path(__file__).parent.parent / "data"
CSV_PATH = DATA_DIR / "dataset_2026-03-21T15_12_27.214805571Z_DEFAULT_INTEGRATION_IMF.RES_WEO_9.0.0.csv"
OUTPUT_PATH = DATA_DIR / "gdp-per-capita.json"

def main():
    countries = []
    years = list(range(1980, 2031))  # 1980-2030

    with open(CSV_PATH, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)

        for row in reader:
            # Filter only GDP per capita in USD (NGDPDPC)
            series_code = row.get('SERIES_CODE', '')
            if 'NGDPDPC' not in series_code:
                continue

            country_code = series_code.split('.')[0]
            country_name = row.get('COUNTRY', '')

            # Extract year values
            data = {}
            for year in years:
                value = row.get(str(year), '')
                if value and value != 'n/a':
                    try:
                        num = float(value)
                        data[year] = round(num, 2)
                    except ValueError:
                        pass

            if data:
                countries.append({
                    'code': country_code,
                    'name': country_name,
                    'data': data
                })

    # Sort by country name
    countries.sort(key=lambda x: x['name'])

    output = {
        'source': 'IMF World Economic Outlook (WEO) 2026',
        'indicator': 'GDP per capita, current prices, US dollars',
        'updated': date.today().isoformat(),
        'years': years,
        'countries': countries
    }

    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2)

    file_size = OUTPUT_PATH.stat().st_size / 1024
    print(f"Generated: {OUTPUT_PATH}")
    print(f"Countries: {len(countries)}")
    print(f"Years: {years[0]}-{years[-1]}")
    print(f"File size: {file_size:.1f} KB")

if __name__ == '__main__':
    main()
