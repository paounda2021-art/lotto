const { chromium } = require('playwright');

(async () => {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => {
      consoleErrors.push(err.message);
    });

    console.log('Navigating to http://localhost:5173/ ...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const content = await page.content();
    console.log('Page loaded. Length:', content.length);
    console.log('Has "แจ้งเตือน LINE" text:', content.includes('แจ้งเตือน LINE'));
    console.log('Has "📲 ส่งผลเข้า LINE" text:', content.includes('ส่งผลเข้า LINE'));

    // Click LINE settings button
    const lineBtn = await page.$('button[title*="แจ้งเตือนผลเข้ากลุ่ม LINE"]');
    console.log('Found LINE button in navbar:', !!lineBtn);
    if (lineBtn) {
      await lineBtn.click();
      await page.waitForTimeout(1000);
      const modalContent = await page.content();
      console.log('Modal opened. Has targetId U3a7529a...:', modalContent.includes('U3a7529a26c7c9a1a06d4cd374349a33c'));
      console.log('Has test send button:', modalContent.includes('ทดสอบส่งเข้า LINE ทันที'));
      await page.screenshot({ path: 'scratch/screenshot_line_modal.png' });
    }

    await page.screenshot({ path: 'scratch/screenshot_app_line.png' });
    console.log('Screenshots taken. Console errors:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      console.log('Errors:', consoleErrors);
    }
  } catch (err) {
    console.error('Test error:', err.message);
  } finally {
    if (browser) await browser.close();
  }
})();
