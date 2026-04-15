import { test, expect } from '@playwright/test';

test.describe('Edit Alumni Records', () => {
  test('Attempt to fill-in alumni page', async ({ page }) => {

    await page.goto('http://localhost:3000/edit-records.html');

    await page.locator('label:has-text("First Name") + input').fill('Grad');
    await page.locator('label:has-text("Last Name") + input').fill('Test');
    await page.locator('label:has-text("Sex Assigned at Birth") + select').selectOption('Male');
    await page.locator('label:has-text("Student-Number") + input').fill('2023-12936');
    await page.locator('label:has-text("Email Address (Primary)") + input').fill('grad@test.com');
    await page.locator('label:has-text("Mobile Number (Primary)") + input').fill('9123456789');
    await page.locator('label:has-text("Entry Date") + input').fill('06/2000');
    await page.locator('label:has-text("Degree") + input').fill('f');
    await page.locator('label:has-text("Year and Semester Started") + input').fill('2020');

    await page.click('button:has-text("Cancel")');
    await page.click('button:has-text("Save")');
  });
});