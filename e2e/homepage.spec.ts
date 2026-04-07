import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  // Update this to match your actual page title or content
  await expect(page).toHaveTitle(/DoomSSH/i);
});
