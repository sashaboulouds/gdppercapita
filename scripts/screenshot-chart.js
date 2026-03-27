const puppeteer = require('puppeteer');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
const country = process.argv[2] || 'kosovo';

async function screenshotChart() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // OG image size with 2x resolution
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });

  const url = `${BASE_URL}/countries/${country}.html`;
  console.log(`Loading ${url}...`);

  await page.goto(url, { waitUntil: 'networkidle0' });

  // Scroll down 350px
  await page.evaluate(() => {
    window.scrollTo(0, 294);
  });

  // Wait for chart to render
  await new Promise(r => setTimeout(r, 800));

  const outputPath = path.join(__dirname, '..', 'screenshots', `${country}-chart.png`);
  await page.screenshot({ path: outputPath, type: 'png' });

  console.log(`Screenshot saved to ${outputPath}`);

  await browser.close();
}

screenshotChart().catch(console.error);
