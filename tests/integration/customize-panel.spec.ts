import { test, expect } from '@playwright/test';
import { mockElectronBridge } from '../support/mocks';

test.beforeEach(async ({ page }) => {
  await mockElectronBridge(page);
});

test.describe('Integration - Customize Panel Modularization', () => {
  test('should navigate through all customization sections and verify visibility', async ({ page }) => {
    // 1. Go to builder
    await page.goto('/builder/test-id');
    
    // 2. Wait for content to load
    await expect(page.getByText('Personal Details')).toBeVisible();
    
    // 3. Switch to 'Style' panel
    const styleTab = page.locator('button[aria-label="style"], button:has-text("style")').first();
    await styleTab.click();
    
    // -- TEMPLATES SECTION --
    // Verify initial state (Templates tab should be active by default)
    await expect(page.getByText('Modern', { exact: true })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Classic', { exact: true })).toBeVisible();

    // -- LAYOUT SECTION --
    console.log('Clicking Layout tab...');
    await page.getByTestId('nav-layout').click();
    await expect(page.getByText('Paper Size')).toBeVisible({ timeout: 10000 });
    console.log('Layout section verified.');

    // -- TYPOGRAPHY SECTION --
    console.log('Clicking Typography tab...');
    await page.getByTestId('nav-typography').click();
    await expect(page.getByText('Font Family')).toBeVisible({ timeout: 10000 });
    console.log('Typography section verified.');

    // -- ENTRY SECTION --
    await page.getByTestId('nav-entry').click();
    await expect(page.getByText('Column Width')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('List Style')).toBeVisible();

    // -- COLORS SECTION --
    await page.getByTestId('nav-colors').click();
    await expect(page.getByText('Accent Color')).toBeVisible({ timeout: 10000 });

    // -- HEADER SECTION --
    await page.getByTestId('nav-header').click();
    await expect(page.getByText('Contact Details')).toBeVisible({ timeout: 10000 });

    // -- SECTIONS SECTION --
    await page.getByTestId('nav-sections').click();
    await expect(page.getByText('Section Headings')).toBeVisible({ timeout: 10000 });
  });

  test('interactions in modular sections should update the state', async ({ page }) => {
    await page.goto('/builder/test-id');
    await page.getByRole('button', { name: 'style', exact: true }).click();
    
    // Switch to Colors
    await page.getByTestId('nav-colors').click();
    await expect(page.getByText('Accent Color')).toBeVisible({ timeout: 10000 });

    // Click an accent color preset - use the title attribute to find it
    // The button has title attribute with color code like "#dc2626"
    const redColorButton = page.locator('button[title="#dc2626"]');
    await redColorButton.click();
    
    // Verify the button was clicked by checking class changed
    await expect(redColorButton).toHaveClass(/ring-primary/);
  });
});
