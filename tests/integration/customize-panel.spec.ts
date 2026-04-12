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
    await page.locator('nav button[title="Layout"]').click();
    console.log('Waiting for Layout content...');
    await expect(page.getByText('Column Layout', { exact: false })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Paper Size', { exact: false })).toBeVisible();
    console.log('Layout section verified.');

    // -- TYPOGRAPHY SECTION --
    console.log('Clicking Typography tab...');
    await page.locator('nav button[title="Typography"]').click();
    await expect(page.getByText('Font Family', { exact: false })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Base Font Size', { exact: false })).toBeVisible();
    console.log('Typography section verified.');

    // -- ENTRY SECTION --
    await page.locator('nav button[title="Entry"]').click();
    await expect(page.getByText('Entry Layout')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Column Width')).toBeVisible();
    await expect(page.getByText('List Style')).toBeVisible();

    // -- COLORS SECTION --
    await page.locator('nav button[title="Colors"]').click();
    await expect(page.getByText('Accent Color')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Accent Targets')).toBeVisible();
    await expect(page.getByText('Background', { exact: true })).toBeVisible();

    // -- HEADER SECTION --
    await page.locator('nav button[title="Header"]').click();
    await expect(page.getByText('Header Layout')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Contact Details')).toBeVisible();
    await expect(page.getByText('Show Photo')).toBeVisible();

    // -- SECTIONS SECTION --
    await page.locator('nav button[title="Sections"]').click();
    await expect(page.getByText('Section Headings')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Skills', { exact: true })).toBeVisible();
    await expect(page.getByText('Entry Order')).toBeVisible();
  });

  test('interactions in modular sections should update the state', async ({ page }) => {
    await page.goto('/builder/test-id');
    await page.getByRole('button', { name: 'style', exact: true }).click();
    
    // Switch to Colors
    await page.getByTitle('Colors').click();
    
    // Click an accent color preset (e.g., the red one #dc2626)
    // We can find it by title if we set it, or just by background color
    // In our ACCENT_PRESETS, #dc2626 is the 5th one.
    const redPreset = page.locator('button[title="#dc2626"]');
    await redPreset.click();
    
    // Since we can't easily check the internal Zustand state from Playwright 
    // without exposing it, we can verify that the button now has the 'ring-primary' class
    // which indicates it's active.
    await expect(redPreset).toHaveClass(/ring-primary/);
  });
});
