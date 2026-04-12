import { test, expect } from '@playwright/test';
import { mockElectronBridge } from '../support/mocks';

test.beforeEach(async ({ page }) => {
  await mockElectronBridge(page);
});

test('has title', async ({ page }) => {
  await page.goto('/');
  // Update this to match your actual page title or content
  await expect(page).toHaveTitle(/DoomSSH/i);
});
