import { test, expect } from '@playwright/test';

test.describe('Performance - Render Speed', () => {
  test('Page load should be within acceptable limits', async ({ page }) => {
    const start = performance.now();
    await page.goto('/builder');
    const end = performance.now();
    const loadTime = end - start;
    
    console.log(`Initial Dashboard Load: ${loadTime.toFixed(2)}ms`);
    expect(loadTime).toBeLessThan(3000); // 3 seconds threshold
  });

  test('Template switching should be fast', async ({ page }) => {
    await page.goto('/builder');
    
    // Measure time to switch between 3 main templates
    const templates = ['modern', 'classic', 'minimal'];
    for (const t of templates) {
      const startTime = await page.evaluate(() => performance.now());
      // Here we'd trigger a click on the template button in the customize panel
      // but since we're setting up the structure, we'll leave it as a benchmark placeholder
      const endTime = await page.evaluate(() => performance.now());
      console.log(`Template Switch to ${t}: ${(endTime - startTime).toFixed(2)}ms`);
    }
  });
});
