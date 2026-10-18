const { chromium } = require('playwright');

(async () => {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => consoleErrors.push(err.message));

    console.log('Navigating to http://localhost:5173/ ...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const content = await page.content();
    console.log('Page loaded. Length:', content.length);
    console.log('Has btn-copy-chase-line-ui in DOM:', content.includes('btn-copy-chase-line-ui'));
    console.log('Has btn-chase-slip-nav-ui in DOM:', content.includes('btn-chase-slip-nav-ui'));

    // Check navbar button
    const navBtn = await page.$('#btn-chase-slip-nav-ui');
    console.log('Found #btn-chase-slip-nav-ui:', !!navBtn);

    // Check action bar button
    const cardBtn = await page.$('#btn-copy-chase-line-ui');
    console.log('Found #btn-copy-chase-line-ui:', !!cardBtn);

    if (navBtn) {
      console.log('Clicking #btn-chase-slip-nav-ui to open modal...');
      await navBtn.click();
      await page.waitForTimeout(1000);

      const modalContent = await page.content();
      console.log('Modal visible:', modalContent.includes('chase-slip-modal-overlay'));
      console.log('Has slip textarea:', modalContent.includes('chase-slip-textarea'));
      console.log('Has copy slip button:', modalContent.includes('btn-copy-slip-action'));

      await page.screenshot({ path: 'scratch/screenshot_chase_slip_modal.png' });
      console.log('Saved screenshot to scratch/screenshot_chase_slip_modal.png');

      // Click copy button
      const copyBtn = await page.$('#btn-copy-slip-action');
      if (copyBtn) {
        await copyBtn.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'scratch/screenshot_chase_slip_copied.png' });
        console.log('Saved screenshot after clicking copy button');
      }
    }

    console.log('Console errors:', consoleErrors.length);
    if (consoleErrors.length > 0) console.log('Errors:', consoleErrors);
  } catch (err) {
    console.error('Test error:', err.message);
  } finally {
    if (browser) await browser.close();
  }
})();
