const { chromium } = require('playwright');

(async () => {
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const content = await page.content();
    console.log('Has btn-export-prediction:', content.includes('btn-export-prediction'));
    const btn = await page.$('#btn-export-prediction-jsx') || await page.$('#btn-export-prediction-ui');
    console.log('Button element found:', !!btn);
    if (btn) {
      const text = await btn.innerText();
      console.log('Button text:', text);
      await btn.click();
      await page.waitForTimeout(1000);
      const modal = await page.$('#export-prediction-modal');
      console.log('Modal element displayed after click:', !!modal);
      await page.screenshot({ path: 'scratch/screenshot_modal.png' });
    }
    await page.screenshot({ path: 'scratch/screenshot_preview.png' });
    console.log('Screenshot saved!');
    await browser.close();
  } catch (err) {
    console.error('Browser test error:', err.message);
  }
})();
