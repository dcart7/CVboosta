const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:3000/results');
  // inject some temp data
  await page.evaluate(() => {
    localStorage.setItem('optimized_cv', 'Denys Ivsyn\nExperience\nSoftware Engineer');
  });
  await page.goto('http://localhost:3000/results');
  
  await page.click('button:has-text("Download PDF")');
  await page.waitForTimeout(2000);
  await browser.close();
})();
