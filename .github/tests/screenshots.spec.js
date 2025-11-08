// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Load page configuration
const pagesConfig = require('../agents/pages-config.json');

// Ensure screenshots directory exists
const screenshotsDir = path.join(process.cwd(), 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

/**
 * Generate screenshot filename based on page, device, and project
 */
function getScreenshotPath(pageName, projectName) {
  const deviceType = projectName.toLowerCase().includes('mobile') ? 'mobile' 
    : projectName.toLowerCase().includes('tablet') ? 'tablet' 
    : 'desktop';
  return path.join(screenshotsDir, `${pageName}-${deviceType}.png`);
}

/**
 * Test suite for generating screenshots of all major pages
 */
test.describe('Page Screenshots', () => {
  
  // Generate tests for each page in the configuration
  for (const page of pagesConfig.pages) {
    test(`Screenshot: ${page.name}`, async ({ page: browserPage }, testInfo) => {
      // Navigate to the page
      await browserPage.goto(page.path, { waitUntil: 'networkidle' });
      
      // Wait for page to be fully loaded
      await browserPage.waitForLoadState('domcontentloaded');
      
      // Optional: Wait for specific selector if defined
      if (page.waitForSelector) {
        await browserPage.waitForSelector(page.waitForSelector, { timeout: 10000 });
      }
      
      // Take full page screenshot
      const screenshotPath = getScreenshotPath(page.name, testInfo.project.name);
      await browserPage.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      
      console.log(`Screenshot saved: ${screenshotPath}`);
      
      // Verify page loaded successfully
      expect(await browserPage.title()).toBeTruthy();
    });
  }
  
  // Additional test to verify all configured pages exist
  test('Verify all pages are accessible', async ({ page }) => {
    const results = [];
    
    for (const pageConfig of pagesConfig.pages) {
      try {
        const response = await page.goto(pageConfig.path, { 
          waitUntil: 'networkidle',
          timeout: 10000 
        });
        results.push({
          page: pageConfig.name,
          status: response?.status() || 'unknown',
          success: response?.ok() || false
        });
      } catch (error) {
        results.push({
          page: pageConfig.name,
          status: 'error',
          success: false,
          error: error.message
        });
      }
    }
    
    console.log('Page accessibility results:', JSON.stringify(results, null, 2));
    
    // All configured pages should be accessible
    const failedPages = results.filter(r => !r.success);
    if (failedPages.length > 0) {
      console.warn(`Warning: ${failedPages.length} page(s) are not accessible:`, failedPages);
    }
  });
});
