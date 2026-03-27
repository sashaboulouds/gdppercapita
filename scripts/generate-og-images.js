const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
const OUTPUT_DIR = path.join(__dirname, '..', 'screenshots');

// Pages to capture with their output filenames
// Note: .html extension needed for localhost (Netlify handles pretty URLs in prod)
const PAGES = [
  { path: '/index.html', output: 'home.png' },
  { path: '/france.html', output: 'france.png' },
  { path: '/articles/country-groups.html', output: 'country-groups.png' },
  { path: '/articles/country-names.html', output: 'country-names.png' },
  { path: '/articles/why-nominal-not-ppp.html', output: 'why-nominal-not-ppp.png' },
  { path: '/articles/why-we-built-this.html', output: 'why-we-built-this.png' },
];

async function generateOGImages() {
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // OG image standard size, 2x resolution for better quality
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });

  for (const { path: pagePath, output } of PAGES) {
    const url = `${BASE_URL}${pagePath}`;
    console.log(`Capturing ${url}...`);

    await page.goto(url, { waitUntil: 'networkidle0' });

    // Wait a bit for any animations
    await new Promise(r => setTimeout(r, 500));

    const outputPath = path.join(OUTPUT_DIR, output);
    await page.screenshot({ path: outputPath, type: 'png' });

    console.log(`  → Saved to ${outputPath}`);
  }

  await browser.close();
  console.log('\nDone! Screenshots saved to /screenshots/');
}

generateOGImages().catch(console.error);
