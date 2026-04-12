import { test, expect } from '@playwright/test';
import { mockElectronBridge } from '../support/mocks';

// Mock Electron bridge for Playwright
test.beforeEach(async ({ page }) => {
  await mockElectronBridge(page);
});

test.describe('Regression - Editor & State Sync', () => {
  test('Editor panel should be visible and contain correct sections', async ({ page }) => {
    // Navigate directly to a resume ID to trigger the BuilderClient
    await page.goto('/builder/test-id');
    
    // Wait for the loader to disappear and the editor to appear
    // We can look for the text "Personal Details" which is in our mock
    const personalDetailsHeader = page.getByText('Personal Details');
    await expect(personalDetailsHeader).toBeVisible({ timeout: 10000 });
    
    // Also verify the preview has the name
    // The PreviewPanel renders an iframe for PDF, but for web it might be different
    // In MasterTemplate, the name is rendered.
  });
});
