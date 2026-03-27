#!/usr/bin/env python3
"""
Generate country pages from template + data.
Usage: python scripts/generate-country-pages.py
"""

import json
import re
import os

# ============================================================================
# NEIGHBORS DATA
# ============================================================================
NEIGHBORS = {
    'AFG': ['IRN', 'PAK', 'TKM', 'UZB', 'TJK', 'CHN'],
    'ALB': ['MNE', 'KOS', 'MKD', 'GRC'],
    'DZA': ['MAR', 'TUN', 'LBY', 'NER', 'MLI', 'MRT'],
    'AND': ['FRA', 'ESP'],
    'AGO': ['COD', 'COG', 'ZMB', 'NAM', 'BWA'],
    'ARG': ['CHL', 'BOL', 'PRY', 'BRA', 'URY'],
    'ARM': ['GEO', 'AZE', 'IRN', 'TUR'],
    'AUS': ['NZL'],
    'AUT': ['DEU', 'CZE', 'SVK', 'HUN', 'SVN', 'ITA', 'CHE', 'LIE'],
    'AZE': ['RUS', 'GEO', 'ARM', 'IRN', 'TUR'],
    'BHR': ['SAU', 'QAT'],
    'BGD': ['IND', 'MMR'],
    'BLR': ['RUS', 'UKR', 'POL', 'LTU', 'LVA'],
    'BEL': ['FRA', 'DEU', 'NLD', 'LUX'],
    'BLZ': ['MEX', 'GTM'],
    'BEN': ['TGO', 'BFA', 'NER', 'NGA'],
    'BTN': ['IND', 'CHN'],
    'BOL': ['BRA', 'PRY', 'ARG', 'CHL', 'PER'],
    'BIH': ['HRV', 'SRB', 'MNE'],
    'BWA': ['ZAF', 'NAM', 'ZMB', 'ZWE'],
    'BRA': ['ARG', 'URY', 'PRY', 'BOL', 'PER', 'COL', 'VEN', 'GUY', 'SUR'],
    'BRN': ['MYS'],
    'BGR': ['ROU', 'SRB', 'MKD', 'GRC', 'TUR'],
    'BFA': ['MLI', 'NER', 'BEN', 'TGO', 'GHA', 'CIV'],
    'BDI': ['RWA', 'TZA', 'COD'],
    'KHM': ['THA', 'LAO', 'VNM'],
    'CMR': ['NGA', 'TCD', 'CAF', 'COG', 'GAB', 'GNQ'],
    'CAN': ['USA'],
    'CAF': ['TCD', 'SDN', 'SSD', 'COD', 'COG', 'CMR'],
    'TCD': ['LBY', 'SDN', 'CAF', 'CMR', 'NGA', 'NER'],
    'CHL': ['ARG', 'BOL', 'PER'],
    'CHN': ['RUS', 'MNG', 'KAZ', 'KGZ', 'TJK', 'AFG', 'PAK', 'IND', 'NPL', 'BTN', 'MMR', 'LAO', 'VNM', 'PRK', 'KOR'],
    'COL': ['VEN', 'BRA', 'PER', 'ECU', 'PAN'],
    'COD': ['COG', 'CAF', 'SSD', 'UGA', 'RWA', 'BDI', 'TZA', 'ZMB', 'AGO'],
    'COG': ['GAB', 'CMR', 'CAF', 'COD', 'AGO'],
    'CRI': ['NIC', 'PAN'],
    'HRV': ['SVN', 'HUN', 'SRB', 'BIH', 'MNE'],
    'CYP': ['TUR', 'GRC'],
    'CZE': ['DEU', 'POL', 'SVK', 'AUT'],
    'DNK': ['DEU', 'SWE', 'NOR'],
    'DJI': ['ERI', 'ETH', 'SOM'],
    'DOM': ['HTI'],
    'ECU': ['COL', 'PER'],
    'EGY': ['LBY', 'SDN', 'ISR'],
    'SLV': ['GTM', 'HND'],
    'GNQ': ['CMR', 'GAB'],
    'ERI': ['SDN', 'ETH', 'DJI'],
    'EST': ['RUS', 'LVA', 'FIN'],
    'SWZ': ['ZAF', 'MOZ'],
    'ETH': ['ERI', 'DJI', 'SOM', 'KEN', 'SSD', 'SDN'],
    'FIN': ['SWE', 'NOR', 'RUS', 'EST'],
    'FRA': ['ESP', 'AND', 'BEL', 'LUX', 'DEU', 'CHE', 'ITA'],
    'GAB': ['CMR', 'GNQ', 'COG'],
    'GMB': ['SEN'],
    'GEO': ['RUS', 'AZE', 'ARM', 'TUR'],
    'DEU': ['DNK', 'POL', 'CZE', 'AUT', 'CHE', 'FRA', 'LUX', 'BEL', 'NLD'],
    'GHA': ['CIV', 'BFA', 'TGO'],
    'GRC': ['ALB', 'MKD', 'BGR', 'TUR', 'CYP'],
    'GTM': ['MEX', 'BLZ', 'SLV', 'HND'],
    'GIN': ['SEN', 'MLI', 'CIV', 'LBR', 'SLE', 'GNB'],
    'GNB': ['SEN', 'GIN'],
    'GUY': ['VEN', 'BRA', 'SUR'],
    'HTI': ['DOM'],
    'HND': ['GTM', 'SLV', 'NIC'],
    'HUN': ['SVK', 'UKR', 'ROU', 'SRB', 'HRV', 'SVN', 'AUT'],
    'ISL': ['NOR', 'GBR'],
    'IND': ['PAK', 'CHN', 'NPL', 'BTN', 'BGD', 'MMR', 'LKA'],
    'IDN': ['MYS', 'PNG', 'TLS', 'PHL'],
    'IRN': ['IRQ', 'TUR', 'ARM', 'AZE', 'TKM', 'AFG', 'PAK'],
    'IRQ': ['SYR', 'TUR', 'IRN', 'KWT', 'SAU', 'JOR'],
    'IRL': ['GBR'],
    'ISR': ['LBN', 'SYR', 'JOR', 'EGY'],
    'ITA': ['FRA', 'CHE', 'AUT', 'SVN', 'SMR'],
    'JAM': ['CUB', 'HTI'],
    'JPN': ['KOR', 'CHN', 'RUS'],
    'JOR': ['SYR', 'IRQ', 'SAU', 'ISR'],
    'KAZ': ['RUS', 'CHN', 'KGZ', 'UZB', 'TKM'],
    'KEN': ['ETH', 'SOM', 'SSD', 'UGA', 'TZA'],
    'KOR': ['PRK', 'JPN', 'CHN'],
    'KOS': ['SRB', 'MNE', 'ALB', 'MKD'],
    'KWT': ['IRQ', 'SAU'],
    'KGZ': ['KAZ', 'CHN', 'TJK', 'UZB'],
    'LAO': ['CHN', 'MMR', 'THA', 'VNM', 'KHM'],
    'LVA': ['EST', 'LTU', 'RUS', 'BLR'],
    'LBN': ['SYR', 'ISR'],
    'LSO': ['ZAF'],
    'LBR': ['GIN', 'CIV', 'SLE'],
    'LBY': ['TUN', 'DZA', 'NER', 'TCD', 'SDN', 'EGY'],
    'LIE': ['CHE', 'AUT'],
    'LTU': ['LVA', 'BLR', 'POL', 'RUS'],
    'LUX': ['BEL', 'DEU', 'FRA'],
    'MDG': ['MOZ'],
    'MWI': ['MOZ', 'TZA', 'ZMB'],
    'MYS': ['THA', 'IDN', 'BRN', 'SGP', 'PHL'],
    'MLI': ['DZA', 'NER', 'BFA', 'CIV', 'GIN', 'SEN', 'MRT'],
    'MRT': ['DZA', 'MLI', 'SEN', 'MAR'],
    'MUS': ['MDG'],
    'MEX': ['USA', 'GTM', 'BLZ'],
    'MDA': ['ROU', 'UKR'],
    'MNG': ['RUS', 'CHN'],
    'MNE': ['HRV', 'BIH', 'SRB', 'KOS', 'ALB'],
    'MAR': ['DZA', 'MRT', 'ESP'],
    'MOZ': ['ZAF', 'SWZ', 'ZWE', 'ZMB', 'MWI', 'TZA'],
    'MMR': ['BGD', 'IND', 'CHN', 'LAO', 'THA'],
    'NAM': ['AGO', 'ZMB', 'BWA', 'ZAF'],
    'NPL': ['IND', 'CHN'],
    'NLD': ['DEU', 'BEL'],
    'NZL': ['AUS'],
    'NIC': ['HND', 'CRI'],
    'NER': ['DZA', 'LBY', 'TCD', 'NGA', 'BEN', 'BFA', 'MLI'],
    'NGA': ['BEN', 'NER', 'TCD', 'CMR'],
    'MKD': ['SRB', 'KOS', 'ALB', 'GRC', 'BGR'],
    'NOR': ['SWE', 'FIN', 'RUS'],
    'OMN': ['UAE', 'SAU', 'YEM'],
    'PAK': ['IRN', 'AFG', 'CHN', 'IND'],
    'PAN': ['CRI', 'COL'],
    'PNG': ['IDN', 'AUS'],
    'PRY': ['BRA', 'ARG', 'BOL'],
    'PER': ['ECU', 'COL', 'BRA', 'BOL', 'CHL'],
    'PHL': ['IDN', 'MYS', 'TWN', 'VNM'],
    'POL': ['DEU', 'CZE', 'SVK', 'UKR', 'BLR', 'LTU', 'RUS'],
    'PRT': ['ESP'],
    'QAT': ['SAU', 'BHR', 'UAE'],
    'ROU': ['HUN', 'SRB', 'BGR', 'MDA', 'UKR'],
    'RUS': ['NOR', 'FIN', 'EST', 'LVA', 'BLR', 'UKR', 'GEO', 'AZE', 'KAZ', 'CHN', 'MNG', 'PRK', 'POL', 'LTU'],
    'RWA': ['UGA', 'TZA', 'BDI', 'COD'],
    'SAU': ['JOR', 'IRQ', 'KWT', 'QAT', 'UAE', 'OMN', 'YEM'],
    'SEN': ['MRT', 'MLI', 'GIN', 'GNB', 'GMB'],
    'SRB': ['HUN', 'ROU', 'BGR', 'MKD', 'KOS', 'MNE', 'BIH', 'HRV'],
    'SGP': ['MYS', 'IDN'],
    'SVK': ['POL', 'UKR', 'HUN', 'AUT', 'CZE'],
    'SVN': ['ITA', 'AUT', 'HUN', 'HRV'],
    'SOM': ['ETH', 'DJI', 'KEN'],
    'ZAF': ['NAM', 'BWA', 'ZWE', 'MOZ', 'SWZ', 'LSO'],
    'SSD': ['SDN', 'ETH', 'KEN', 'UGA', 'COD', 'CAF'],
    'ESP': ['PRT', 'FRA', 'AND', 'MAR'],
    'LKA': ['IND'],
    'SDN': ['EGY', 'LBY', 'TCD', 'CAF', 'SSD', 'ETH', 'ERI'],
    'SUR': ['GUY', 'BRA'],
    'SWE': ['NOR', 'FIN', 'DNK'],
    'CHE': ['DEU', 'FRA', 'ITA', 'AUT', 'LIE'],
    'SYR': ['TUR', 'IRQ', 'JOR', 'ISR', 'LBN'],
    'TWN': ['CHN', 'JPN', 'PHL'],
    'TJK': ['KGZ', 'UZB', 'AFG', 'CHN'],
    'TZA': ['KEN', 'UGA', 'RWA', 'BDI', 'COD', 'ZMB', 'MWI', 'MOZ'],
    'THA': ['MMR', 'LAO', 'KHM', 'MYS'],
    'TLS': ['IDN'],
    'TGO': ['GHA', 'BFA', 'BEN'],
    'TUN': ['DZA', 'LBY'],
    'TUR': ['GRC', 'BGR', 'GEO', 'ARM', 'AZE', 'IRN', 'IRQ', 'SYR'],
    'TKM': ['KAZ', 'UZB', 'AFG', 'IRN'],
    'UGA': ['SSD', 'KEN', 'TZA', 'RWA', 'COD'],
    'UKR': ['RUS', 'BLR', 'POL', 'SVK', 'HUN', 'ROU', 'MDA'],
    'ARE': ['SAU', 'OMN', 'QAT'],
    'GBR': ['IRL', 'FRA'],
    'USA': ['CAN', 'MEX'],
    'URY': ['BRA', 'ARG'],
    'UZB': ['KAZ', 'TJK', 'KGZ', 'AFG', 'TKM'],
    'VEN': ['COL', 'BRA', 'GUY'],
    'VNM': ['CHN', 'LAO', 'KHM'],
    'YEM': ['SAU', 'OMN'],
    'ZMB': ['COD', 'TZA', 'MWI', 'MOZ', 'ZWE', 'BWA', 'NAM', 'AGO'],
    'ZWE': ['ZMB', 'MOZ', 'ZAF', 'BWA'],
}

# Group constants
INCOME_GROUPS = ['HIC', 'UMIC', 'LMIC', 'LIC']
GEO_GROUPS = ['EU27', 'EURO', 'ASEAN', 'GCC', 'NORDIC', 'LATAM', 'ME', 'SSA']
ECON_GROUPS = ['G7', 'G20', 'OECD', 'BRICS', 'ADVANCED']

REGIONAL_LEADERS = {
    'EU27': 'DEU', 'EURO': 'DEU', 'ASEAN': 'IDN', 'GCC': 'SAU',
    'NORDIC': 'SWE', 'LATAM': 'BRA', 'ME': 'SAU', 'SSA': 'ZAF', 'BRICS': 'CHN',
}

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def slugify(name):
    slug = name.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    return slug.strip('-')

def format_gdp(value):
    if value is None:
        return "N/A"
    if value >= 1000:
        return f"${value:,.0f}"
    return f"${value:.0f}"

def get_latest_data(country_data, target_year=None):
    if target_year and str(target_year) in country_data:
        return target_year, country_data[str(target_year)]
    years = sorted([int(y) for y in country_data.keys()], reverse=True)
    for year in years:
        val = country_data.get(str(year))
        if val is not None:
            return year, val
    return None, None

def ordinal(n):
    if 10 <= n % 100 <= 20:
        suffix = 'th'
    else:
        suffix = {1: 'st', 2: 'nd', 3: 'rd'}.get(n % 10, 'th')
    return f"{n}{suffix}"

# ============================================================================
# MAIN
# ============================================================================

# Load data
with open('data/gdp-per-capita.json', 'r') as f:
    data = json.load(f)

# Load template
with open('templates/country.html', 'r') as f:
    template = f.read()

# Load footer
with open('templates/footer.html', 'r') as f:
    footer = f.read()

# Build group membership lookup
groups = data.get('groups', [])
country_groups = {}
group_info = {}

for g in groups:
    group_info[g['code']] = {'name': g['name'], 'members': g.get('members', [])}
    for member in g.get('members', []):
        if member not in country_groups:
            country_groups[member] = []
        country_groups[member].append(g['code'])

# Calculate GDP per capita ranking (using 2026 projected data)
gdp_per_capita_list = []
for country in data['countries']:
    code = country['code']
    gdp_year, gdp_pc = get_latest_data(country['data'], 2026)
    if gdp_pc:
        gdp_per_capita_list.append({'code': code, 'gdp_pc': gdp_pc, 'year': gdp_year})

gdp_per_capita_list.sort(key=lambda x: x['gdp_pc'], reverse=True)
rank_lookup = {item['code']: {'rank': item['rank'], 'year': item['year']}
               for item in [{'code': x['code'], 'rank': i+1, 'year': x['year']}
                           for i, x in enumerate(gdp_per_capita_list)]}

# Name lookup
name_lookup = {c['code']: c['name'] for c in data['countries']}
valid_codes = set(name_lookup.keys())

# GDP per capita for 2025
gdp_2025 = {}
for country in data['countries']:
    year, val = get_latest_data(country['data'], 2025)
    if val:
        gdp_2025[country['code']] = val

def get_comparisons(code, name):
    comps = []
    my_groups = country_groups.get(code, [])
    is_hic = 'HIC' in my_groups

    # 1. vs neighbors
    neighbors = NEIGHBORS.get(code, [])
    valid_neighbors = [n for n in neighbors if n in valid_codes]
    if valid_neighbors:
        comps.append(('vs Neighbors', f'{code}~{"~".join(valid_neighbors[:5])}'))

    # 2. vs USA or regional leader
    if code == 'USA':
        comps.append(('vs China', f'{code}~CHN'))
    elif is_hic:
        comps.append(('vs USA', f'{code}~USA'))
    else:
        leader = None
        for gg in GEO_GROUPS + ECON_GROUPS:
            if gg in my_groups and gg in REGIONAL_LEADERS:
                leader = REGIONAL_LEADERS[gg]
                if leader != code:
                    comps.append((f'vs {name_lookup.get(leader, leader)}', f'{code}~{leader}'))
                break
        if not leader or leader == code:
            if code != 'CHN':
                comps.append(('vs China', f'{code}~CHN'))

    # 3. vs World
    comps.append(('vs World', f'{code}~WORLD'))

    # 4. vs income group
    for ig in INCOME_GROUPS:
        if ig in my_groups:
            comps.append((f'vs {group_info[ig]["name"]}', f'{code}~{ig}'))
            break

    # 5. vs geo group
    for gg in GEO_GROUPS:
        if gg in my_groups:
            comps.append((f'vs {group_info[gg]["name"]}', f'{code}~{gg}'))
            break

    # 6. vs Similar economies
    if code in gdp_2025:
        my_gdp = gdp_2025[code]
        similar = []
        for c, g in gdp_2025.items():
            if c != code and c not in neighbors and 0.8 <= g/my_gdp <= 1.2:
                similar.append(c)
        if len(similar) >= 2:
            similar.sort(key=lambda c: abs(gdp_2025[c] - my_gdp))
            comps.append(('vs similar economies', f'{code}~{"~".join(similar[:4])}'))

    return comps

# Generate pages
generated = 0

for country in data['countries']:
    code = country['code']
    name = country['name']
    slug = slugify(name)
    country_data = country['data']

    # GDP data
    gdp_2026 = country_data.get('2026')
    if gdp_2026 is not None:
        latest_year = 2026
        latest_value = gdp_2026
        is_projected = True
    else:
        latest_year, latest_value = get_latest_data(country_data)
        is_projected = latest_year and latest_year > 2025

    if latest_value is None:
        print(f"Skipping {name} ({code}): no data")
        continue

    gdp_2030 = country_data.get('2030')
    has_2030 = gdp_2030 is not None

    # Growth
    if has_2030:
        growth = ((gdp_2030 - latest_value) / latest_value * 100)
        growth_fmt = f"+{growth:.0f}%" if growth > 0 else f"{growth:.0f}%"
    else:
        growth_fmt = "N/A"

    # Rank and intro
    rank_info = rank_lookup.get(code, None)
    if rank_info and rank_info['rank'] > 0:
        year_label = f"{rank_info['year']}, projected" if rank_info['year'] > 2025 else str(rank_info['year'])
        intro = f"{name} ranks <u>{ordinal(rank_info['rank'])}</u> in the world by GDP per capita ({year_label}). GDP per capita measures the average economic output per person in current US dollars, based on <a href=\"https://data.imf.org/en/Data-Explorer?datasetUrn=IMF.RES:WEO(9.0.0)\" target=\"_blank\" rel=\"noopener\">IMF World Economic Outlook</a> data."
    else:
        intro = f"GDP per capita measures the average economic output per person in current US dollars, based on <a href=\"https://data.imf.org/en/Data-Explorer?datasetUrn=IMF.RES:WEO(9.0.0)\" target=\"_blank\" rel=\"noopener\">IMF World Economic Outlook</a> data."

    # Comparisons
    comparisons = get_comparisons(code, name)
    comp_html = '\n'.join([
        f'        <a href="/?country={url}" class="compare-btn">{label}</a>'
        for label, url in comparisons
    ])

    # Labels
    latest_label = "Projected" if is_projected else "Latest"
    latest_label_lower = "projected" if is_projected else "at"

    # Build HTML
    html = template
    html = html.replace('{{name}}', name)
    html = html.replace('{{code}}', code)
    html = html.replace('{{slug}}', slug)
    html = html.replace('{{gdp_latest_fmt}}', format_gdp(latest_value))
    html = html.replace('{{latest_year}}', str(latest_year))
    html = html.replace('{{latest_label}}', latest_label)
    html = html.replace('{{latest_label_lower}}', latest_label_lower)
    html = html.replace('{{gdp_2030_fmt}}', format_gdp(gdp_2030))
    html = html.replace('{{growth_fmt}}', growth_fmt)
    html = html.replace('{{intro}}', intro)
    html = html.replace('{{comparisons}}', comp_html)
    html = html.replace('{{footer}}', footer)

    # Handle conditional 2030 section
    if has_2030:
        html = html.replace('{{#if has_2030}}', '')
        html = html.replace('{{/if}}', '')
    else:
        # Remove the 2030 section
        html = re.sub(r'\{\{#if has_2030\}\}.*?\{\{/if\}\}', '', html, flags=re.DOTALL)

    # Write file to countries/ folder
    filepath = f'countries/{slug}.html'
    with open(filepath, 'w') as f:
        f.write(html)

    generated += 1
    print(f"Generated {filepath}")

print(f"\nDone! Generated {generated} country pages.")
