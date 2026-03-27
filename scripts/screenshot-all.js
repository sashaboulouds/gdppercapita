const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
const OUTPUT_DIR = path.join(__dirname, '..', 'screenshots', 'countries');

async function screenshotAll() {
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Get list of countries from the countries folder
  const countriesDir = path.join(__dirname, '..', 'countries');
  const files = fs.readdirSync(countriesDir).filter(f => f.endsWith('.html'));

  console.log(`Generating screenshots for ${files.length} countries...`);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // OG image size with 2x resolution
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });

  let count = 0;
  for (const file of files) {
    const slug = file.replace('.html', '');
    const url = `${BASE_URL}/countries/${file}`;

    try {
      await page.goto(url, { waitUntil: 'networkidle0' });

      // Scroll down 294px
      await page.evaluate(() => {
        window.scrollTo(0, 294);
      });

      // Wait for chart to render
      await new Promise(r => setTimeout(r, 800));

      const outputPath = path.join(OUTPUT_DIR, `${slug}.png`);
      await page.screenshot({ path: outputPath, type: 'png' });

      count++;
      if (count % 10 === 0) {
        console.log(`Progress: ${count}/${files.length}`);
      }
    } catch (err) {
      console.error(`Error with ${slug}: ${err.message}`);
    }
  }

  await browser.close();
  console.log(`\nDone! Generated ${count} screenshots in /screenshots/countries/`);
}

screenshotAll().catch(console.error);
