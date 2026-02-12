import { test, expect } from '@playwright/test';

test.describe('Add and Delete Multiple Alumni Records', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the Add Records page before each test
    await page.goto('add-records.html');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should add and delete 3 alumni records', async ({ page }) => {
    for (let i = 1; i <= 3; i++) {
      await page.getByPlaceholder('Your Full Name').fill(`Test Alumni ${i}`);
      await page.getByPlaceholder('Your Email').fill(`alumni${i}@up.edu.ph`);
      await page.getByPlaceholder('xxxx-xxxxx').fill(`202${i}-12345`);

      const employmentAddBtn = page.locator('.section-title')
                                   .filter({ hasText: 'Employment History' })
                                   .locator('button');
      await employmentAddBtn.click();
      const lastEmploymentRow = page.locator('#employment-container .employment-row').last();
      await lastEmploymentRow.getByPlaceholder('Employer').fill(`Employer ${i}`);
      await lastEmploymentRow.getByPlaceholder('Position').fill(`Position ${i}`);
      
      const graduateAddBtn = page.locator('.section-title')
                                 .filter({ hasText: 'Graduate Info' })
                                 .locator('button');
      await graduateAddBtn.click();
      const lastGraduateRow = page.locator('#graduate-container .graduate-row').last();
      await lastGraduateRow.getByPlaceholder('Degree').fill(`Degree ${i}`);
      await lastGraduateRow.getByPlaceholder('Latin Honor').fill('magna_cum_laude');
    }

    await expect(page.locator('#employment-container .employment-row')).toHaveCount(3);
    await expect(page.locator('#graduate-container .graduate-row')).toHaveCount(3);

    const employmentRows = page.locator('#employment-container .employment-row');
    const graduateRows = page.locator('#graduate-container .graduate-row');

    for (let i = 0; i < 3; i++) {
      await employmentRows.first().locator('.circle-btn.minus').click();
      await graduateRows.first().locator('.circle-btn.minus').click();
    }

    await expect(page.locator('#employment-container .employment-row')).toHaveCount(0);
    await expect(page.locator('#graduate-container .graduate-row')).toHaveCount(0);
  });
});
