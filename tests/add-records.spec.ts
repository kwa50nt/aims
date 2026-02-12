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
  
  test('should add and delete an employment row', async ({ page }) => {
    const rows = page.locator('#employment-container .employment-row');
    const initialCount = await rows.count();
    const addBtn = page.locator('.section-title')
                       .filter({ hasText: 'Employment History' })
                       .locator('button');
    await addBtn.click();
    await expect(rows).toHaveCount(initialCount + 1);
    await expect(rows.last().getByPlaceholder('Employer')).toBeVisible();
    const deleteBtn = rows.last().locator('.circle-btn.minus');
    await deleteBtn.click();
    await expect(rows).toHaveCount(initialCount);
  });

  test('should add and delete a graduate info row', async ({ page }) => {
    const rows = page.locator('#graduate-container .graduate-row');
    const initialCount = await rows.count();
    const addBtn = page.locator('.section-title')
                       .filter({ hasText: 'Graduate Info' })
                       .locator('button');
    await addBtn.click();
    await expect(rows).toHaveCount(initialCount + 1);
    await expect(rows.last().getByPlaceholder('Degree')).toBeVisible();
    await rows.last().getByPlaceholder('Degree').fill('BS Economics');
    await expect(rows.last().getByPlaceholder('Degree')).toHaveValue('BS Economics');
    const deleteBtn = rows.last().locator('.circle-btn.minus');
    await deleteBtn.click();
    await expect(rows).toHaveCount(initialCount);
  });

});