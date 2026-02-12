import { test, expect } from '@playwright/test';

test.describe('Add Records Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('add-records.html');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display correct page title and sidebar', async ({ page }) => {
    await expect(page).toHaveTitle(/Alumni Management System/);
    await expect(page.getByRole('heading', { name: 'Alumni Information Management System' })).toBeVisible();
    const activeSidebar = page.locator('.sidebar-item.active');
    await expect(activeSidebar).toContainText('Add Alumni');
  });

  test('should allow filling out personal information', async ({ page }) => {
    await page.getByPlaceholder('Your Full Name').fill('Juan Dela Cruz');
    await page.getByPlaceholder('Your Email').fill('juan@up.edu.ph');
    await page.getByPlaceholder('xxxx-xxxxx').fill('2020-12345');
    await expect(page.getByPlaceholder('Your Full Name')).toHaveValue('Juan Dela Cruz');
  });
  test('should add a new employment row when clicking the plus button', async ({ page }) => {
    const rows = page.locator('#employment-container .employment-row');
    const initialCount = await rows.count();
    // add button
    const addBtn = page.locator('.section-title')
                       .filter({ hasText: 'Employment History' })
                       .locator('button');
    await addBtn.click();
    await expect(rows).toHaveCount(initialCount + 1);
    await expect(rows.last().getByPlaceholder('Employer')).toBeVisible();
  });
});