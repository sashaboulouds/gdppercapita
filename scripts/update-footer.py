#!/usr/bin/env python3
"""
Update footer in all static HTML files.
Usage: python scripts/update-footer.py
"""

import re
import os

# Files to update (relative to project root)
STATIC_FILES = [
    'index.html',
    'countries.html',
    'changelog.html',
    'reddit.html',
    'articles/country-groups.html',
    'articles/country-names.html',
    'articles/why-nominal-not-ppp.html',
    'articles/why-we-built-this.html',
]

# Load footer template
with open('templates/footer.html', 'r') as f:
    footer = f.read()

# Regex to match footer section
footer_pattern = re.compile(r'<footer>.*?</footer>', re.DOTALL)

updated = 0

for filepath in STATIC_FILES:
    if not os.path.exists(filepath):
        print(f"Skipping {filepath} (not found)")
        continue

    with open(filepath, 'r') as f:
        content = f.read()

    # Check if file has a footer
    if '<footer>' in content:
        new_content = footer_pattern.sub(footer.strip(), content)

        if new_content != content:
            with open(filepath, 'w') as f:
                f.write(new_content)
            print(f"Updated {filepath}")
            updated += 1
        else:
            print(f"No changes needed for {filepath}")
    else:
        print(f"No footer found in {filepath}")

print(f"\nDone! Updated {updated} files.")
