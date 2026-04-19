import { test, expect } from '@playwright/test';
import { mockElectronBridge } from '../support/mocks';

test.beforeEach(async ({ page }) => {
  await mockElectronBridge(page);
});

test.describe('Sidebar Regression Tests', () => {
  test('Sidebar should be present on main builder pages', async ({ page }) => {
    // Check resumes dashboard
    await page.goto('/builder');
    await expect(page.getByTestId('main-sidebar')).toBeVisible();
    await expect(page.getByTestId('main-sidebar').getByText('Resumes', { exact: true })).toBeVisible();

    // Check Job Tracker
    await page.goto('/builder/jobs');
    await expect(page.getByTestId('main-sidebar')).toBeVisible();
    await expect(page.getByTestId('main-sidebar').getByText('Job Tracker', { exact: true })).toBeVisible();

    // Check Interview Prep
    await page.goto('/builder/interview-prep');
    await expect(page.getByTestId('main-sidebar')).toBeVisible();
    await expect(page.getByTestId('main-sidebar').getByText('Interview Prep', { exact: true })).toBeVisible();

    // Check Editor
    await page.goto('/builder/test-id');
    await expect(page.getByTestId('main-sidebar')).toBeVisible();
  });

  test('Sidebar should collapse and expand', async ({ page }) => {
    await page.goto('/builder');
    
    const sidebar = page.getByTestId('main-sidebar');
    const initialBox = await sidebar.boundingBox();
    expect(initialBox?.width).toBeCloseTo(256, 1);

    // Toggle collapse
    const toggleButton = page.getByRole('button', { name: /Collapse Sidebar|Expand Sidebar/i });
    await toggleButton.click();

    // Wait for animation
    await page.waitForTimeout(500);
    const collapsedBox = await sidebar.boundingBox();
    expect(collapsedBox?.width).toBeCloseTo(64, 1);

    // Labels should be hidden when collapsed
    await expect(page.getByTestId('main-sidebar').getByText('Resumes', { exact: true })).not.toBeVisible();

    // Toggle expand
    await toggleButton.click();
    await page.waitForTimeout(500);
    const expandedBox = await sidebar.boundingBox();
    expect(expandedBox?.width).toBeCloseTo(256, 1);
    await expect(page.getByTestId('main-sidebar').getByText('Resumes', { exact: true })).toBeVisible();
  });

  test('Main layout should be fixed to window height with no global scrollbar', async ({ page }) => {
    await page.goto('/builder');
    
    // Check if the root layout div has h-screen or equivalent and overflow-hidden
    const layout = page.locator('div.h-screen.overflow-hidden').first();
    await expect(layout).toBeVisible();

    // Verify that the body itself doesn't scroll
    const isScrollable = await page.evaluate(() => {
      return document.documentElement.scrollHeight > document.documentElement.clientHeight;
    });
    expect(isScrollable).toBe(false);
  });

  test('Settings dialog should open from sidebar', async ({ page }) => {
    await page.goto('/builder');
    await page.getByTestId('main-sidebar').getByText('Settings').click();
    await expect(page.getByText('Configure your preferences and API keys')).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByText('Configure your preferences and API keys')).not.toBeVisible();
  });
});
