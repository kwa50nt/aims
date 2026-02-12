import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('/index.html');
  await page.waitForLoadState('domcontentloaded');
  
  await page.getByRole('checkbox').nth(1).check();
  await page.getByRole('checkbox').nth(2).check();
  await page.getByRole('checkbox').nth(3).check();
  await page.getByRole('checkbox').nth(1).uncheck();
  await page.getByRole('checkbox').nth(2).uncheck();
  await page.getByRole('checkbox').nth(3).uncheck();
  await page.getByRole('link', { name: 'Records', exact: true }).click();
  await page.getByRole('link', { name: 'Email Blast' }).click();
  await page.getByRole('link', { name: 'Add Records' }).click();
  await page.getByRole('link', { name: 'Alumni News' }).click();
  await page.getByText('admin.up.edu.ph').click();
  await page.locator('div').filter({ hasText: 'admin.up.edu.ph' }).click();
});