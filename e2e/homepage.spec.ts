import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  // Update this to match your actual page title or content
  await expect(page).toHaveTitle(/DoomSSH/i);
});

test('health check backend', async ({ request }) => {
  const response = await request.get('http://localhost:4000/health');
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.status).toBe('ok');
});
