#!/usr/bin/env python3
"""
Normalize country names from IMF World Economic Outlook data.

This script transforms formal IMF country names into simplified,
commonly-used names for better readability in visualizations.

Usage:
    python normalize-country-names.py input.json output.json
"""

import json
import sys

# Mapping of IMF names to simplified names
NAME_MAPPING = {
    "Afghanistan, Islamic Republic of": "Afghanistan",
    "Andorra, Principality of": "Andorra",
    "Armenia, Republic of": "Armenia",
    "Aruba, Kingdom of the Netherlands": "Aruba",
    "Azerbaijan, Republic of": "Azerbaijan",
    "Bahamas, The": "Bahamas",
    "Bahrain, Kingdom of": "Bahrain",
    "Belarus, Republic of": "Belarus",
    "Brunei Darussalam": "Brunei",
    "China, People's Republic of": "China",
    "Comoros, Union of the": "Comoros",
    "Congo, Democratic Republic of the": "Democratic Republic of Congo",
    "Congo, Republic of": "Congo-Brazzaville",
    "Côte d'Ivoire": "Cote d'Ivoire",
    "Croatia, Republic of": "Croatia",
    "Czech Republic": "Czechia",
    "Egypt, Arab Republic of": "Egypt",
    "Equatorial Guinea, Republic of": "Equatorial Guinea",
    "Eritrea, The State of": "Eritrea",
    "Estonia, Republic of": "Estonia",
    "Eswatini, Kingdom of": "Eswatini",
    "Ethiopia, The Federal Democratic Republic of": "Ethiopia",
    "Fiji, Republic of": "Fiji",
    "Gambia, The": "Gambia",
    "Hong Kong Special Administrative Region, People's Republic of China": "Hong Kong",
    "Iran, Islamic Republic of": "Iran",
    "Kazakhstan, Republic of": "Kazakhstan",
    "Korea, Republic of": "South Korea",
    "Kosovo, Republic of": "Kosovo",
    "Kyrgyz Republic": "Kyrgyzstan",
    "Lao P.D.R.": "Laos",
    "Latvia, Republic of": "Latvia",
    "Lesotho, Kingdom of": "Lesotho",
    "Liechtenstein, Principality of": "Liechtenstein",
    "Lithuania, Republic of": "Lithuania",
    "Macao Special Administrative Region, People's Republic of China": "Macao",
    "Madagascar, Republic of": "Madagascar",
    "Marshall Islands, Republic of the": "Marshall Islands",
    "Mauritania, Islamic Republic of": "Mauritania",
    "Micronesia, Federated States of": "Micronesia",
    "Moldova, Republic of": "Moldova",
    "Mozambique, Republic of": "Mozambique",
    "Nauru, Republic of": "Nauru",
    "Netherlands, The": "Netherlands",
    "North Macedonia, Republic of": "North Macedonia",
    "Palau, Republic of": "Palau",
    "Poland, Republic of": "Poland",
    "Russian Federation": "Russia",
    "San Marino, Republic of": "San Marino",
    "São Tomé and Príncipe, Democratic Republic of": "Sao Tome and Principe",
    "Serbia, Republic of": "Serbia",
    "Slovak Republic": "Slovakia",
    "Slovenia, Republic of": "Slovenia",
    "South Sudan, Republic of": "South Sudan",
    "St. Kitts and Nevis": "Saint Kitts and Nevis",
    "St. Lucia": "Saint Lucia",
    "St. Vincent and the Grenadines": "Saint Vincent and the Grenadines",
    "Syrian Arab Republic": "Syria",
    "Taiwan Province of China": "Taiwan",
    "Tajikistan, Republic of": "Tajikistan",
    "Tanzania, United Republic of": "Tanzania",
    "Timor-Leste, Democratic Republic of": "Timor-Leste",
    "Türkiye, Republic of": "Turkey",
    "Uzbekistan, Republic of": "Uzbekistan",
    "Venezuela, República Bolivariana de": "Venezuela",
    "Yemen, Republic of": "Yemen",
}


def normalize_country_names(data: dict) -> dict:
    """Apply name normalization to all countries in the dataset."""
    for country in data.get("countries", []):
        original_name = country.get("name", "")
        if original_name in NAME_MAPPING:
            country["name"] = NAME_MAPPING[original_name]
    return data


def main():
    if len(sys.argv) != 3:
        print(f"Usage: {sys.argv[0]} input.json output.json")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    normalized_data = normalize_country_names(data)

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(normalized_data, f, indent=2, ensure_ascii=False)

    print(f"Normalized {len(NAME_MAPPING)} country names")
    print(f"Output written to {output_file}")


if __name__ == "__main__":
    main()
