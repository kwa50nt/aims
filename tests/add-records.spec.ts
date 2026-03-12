import { test, expect } from '@playwright/test';

test.describe('Add Alumni Records', () => {
  test('Add alumni with invalid gender', async ({ page }) => {

    await page.goto('http://localhost:3000/add-records.html');

    await page.click('#sidebar-add');

    await page.fill('input[placeholder="Your Full Name"]', 'Jane Doe');
    await page.fill('input[placeholder="Gender"]', 'INVALID');
    await page.fill('input[placeholder="xxxx-xxxxx"]', '2023-12345');
    await page.fill('input[placeholder="Your Email"]', 'jane@test.com');
    await page.fill('input[placeholder="Your Number"]', '9123456789');

    const dialogPromise = page.waitForEvent('dialog');

    await page.click('button:has-text("Add")');

    const dialog = await dialogPromise;

    expect(dialog.message()).toContain('Invalid input for gender');

    await dialog.dismiss();
  });


  test('Add alumni with invalid student number', async ({ page }) => {

    await page.goto('http://localhost:3000/add-records.html');

    await page.click('#sidebar-add');

    await page.fill('input[placeholder="Your Full Name"]', 'Test User');
    await page.fill('input[placeholder="Gender"]', 'M');
    await page.fill('input[placeholder="xxxx-xxxxx"]', 'INVALID');
    await page.fill('input[placeholder="Your Email"]', 'test@test.com');
    await page.fill('input[placeholder="Your Number"]', '9123456789');

    const dialogPromise = page.waitForEvent('dialog');

    await page.click('button:has-text("Add")');

    const dialog = await dialogPromise;

    expect(dialog.message()).toContain('Please follow student number format');

    await dialog.dismiss();
  });


  test('Add alumni with missing email', async ({ page }) => {

    await page.goto('http://localhost:3000/add-records.html');

    await page.click('#sidebar-add');

    await page.fill('input[placeholder="Your Full Name"]', 'Email Test');
    await page.fill('input[placeholder="Gender"]', 'M');
    await page.fill('input[placeholder="xxxx-xxxxx"]', '2023-12345');
    await page.fill('input[placeholder="Your Number"]', '9123456789');
    await page.fill('input[placeholder="Your Number"]', '9123456789');

    const dialogPromise = page.waitForEvent('dialog');

    await page.click('button:has-text("Add")');

    const dialog = await dialogPromise;

    expect(dialog.message()).toContain('Please input an email');

    await dialog.dismiss();
  });

});
