import { test, expect } from '@playwright/test';

test.describe('Add Alumni Records', () => {

  // test('Add alumni with valid data', async ({ page }) => {

  //   await page.goto('http://localhost:3000/add-records.html');
  //   await page.click('#sidebar-add');

  //   // Personal Info
  //   await page.locator('label:has-text("Full Name") + input').fill('John Valid');
  //   await page.locator('label:has-text("Sex") + input').fill('M');
  //   await page.locator('label:has-text("Student - Number") + input').fill('2023-87098');
  //   await page.locator('label:has-text("Email") + input').fill('john.valid@test.com');
  //   await page.locator('label:text-is("Number") + input').fill('9123456789');
  //   await page.locator('label:has-text("Entry Date") + input').fill('06/07/2000');

  //   // Employment History
  //   const employment = page.locator('.employment-row').first();
  //   await employment.locator('label:has-text("Employer") + input').fill('Tech Corp');
  //   await employment.locator('label:has-text("Position") + input').fill('Software Engineer');
  //   await employment.locator('label:has-text("Start") + input').fill('01/2024');
  //   await employment.locator('label:has-text("End") + input').fill('01/2025');

  //   // Graduate Info
  //   const grad = page.locator('.graduate-row').first();
  //   await grad.locator('label:has-text("Degree") + input').fill('BS Computer Science');
  //   await grad.locator('label:has-text("Latin Honor") + input').fill('Cum Laude');
  //   await grad.locator('label:has-text("Graduation Year") + input').fill('06/2024');
  //   await grad.locator('label:has-text("Year Started") + input').fill('2020');

  //   await grad.locator('label:has-text("Semester Started") + select').selectOption('1st');
  //   await grad.locator('label:has-text("Semester Graduated") + select').selectOption('2nd');

  //   const dialogPromise = page.waitForEvent('dialog');
  //   await page.click('button:has-text("Add")');

  //   const dialog = await dialogPromise;
  //   expect(dialog.message()).toContain('Alumni added successfully');

  //   await dialog.dismiss();
  // });

  test('Add alumni with invalid gender', async ({ page }) => {

    await page.goto('http://localhost:3000/add-records.html');
    await page.click('#sidebar-add');

    await page.locator('label:has-text("Full Name") + input').fill('Jane Doe');
    await page.locator('label:has-text("Sex") + input').fill('INVALID');
    await page.locator('label:has-text("Student - Number") + input').fill('2023-12345');
    await page.locator('label:has-text("Email") + input').fill('jane@test.com');
    await page.locator('label:text-is("Number") + input').fill('9123456789');

    const dialogPromise = page.waitForEvent('dialog');
    await page.click('button:has-text("Add")');

    const dialog = await dialogPromise;
    expect(dialog.message()).toContain('Invalid input for gender');

    await dialog.dismiss();
  });

  test('Add alumni with invalid student number', async ({ page }) => {

    await page.goto('http://localhost:3000/add-records.html');
    await page.click('#sidebar-add');

    await page.locator('label:has-text("Full Name") + input').fill('Test User');
    await page.locator('label:has-text("Sex") + input').fill('M');
    await page.locator('label:has-text("Student - Number") + input').fill('INVALID');
    await page.locator('label:has-text("Email") + input').fill('test@test.com');
    await page.locator('label:text-is("Number") + input').fill('9123456789');
    await page.locator('label:has-text("Entry Date") + input').fill('06/07/2000');

    const dialogPromise = page.waitForEvent('dialog');
    await page.click('button:has-text("Add")');

    const dialog = await dialogPromise;
    expect(dialog.message()).toContain('Please follow student number format');

    await dialog.dismiss();
  });

  test('Add alumni with missing email', async ({ page }) => {

    await page.goto('http://localhost:3000/add-records.html');
    await page.click('#sidebar-add');

    await page.locator('label:has-text("Full Name") + input').fill('Email Test');
    await page.locator('label:has-text("Sex") + input').fill('M');
    await page.locator('label:has-text("Student - Number") + input').fill('2023-12345');
    await page.locator('label:text-is("Number") + input').fill('9123456789');
    await page.locator('label:has-text("Entry Date") + input').fill('06/07/2000');

    const dialogPromise = page.waitForEvent('dialog');
    await page.click('button:has-text("Add")');

    const dialog = await dialogPromise;
    expect(dialog.message()).toContain('Please input an email');

    await dialog.dismiss();
  });

    test('Add alumni with missing graduation info', async ({ page }) => {

    await page.goto('http://localhost:3000/add-records.html');
    await page.click('#sidebar-add');

    await page.locator('label:has-text("Full Name") + input').fill('Grad Test');
    await page.locator('label:has-text("Sex") + input').fill('M');
    await page.locator('label:has-text("Student - Number") + input').fill('2023-12936');
    await page.locator('label:has-text("Email") + input').fill('grad@test.com');
    await page.locator('label:text-is("Number") + input').fill('9123456789');
    await page.locator('label:has-text("Entry Date") + input').fill('06/07/2000');
    await page.locator('label:has-text("Degree") + input').fill('f');

    await page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Please input year started');
    });

    await page.click('button:has-text("Add")');
  });

    test('Add alumni with missing graduation info 2', async ({ page }) => {

    await page.goto('http://localhost:3000/add-records.html');
    await page.click('#sidebar-add');

    await page.locator('label:has-text("Full Name") + input').fill('Grad Test');
    await page.locator('label:has-text("Sex") + input').fill('M');
    await page.locator('label:has-text("Student - Number") + input').fill('2023-12936');
    await page.locator('label:has-text("Email") + input').fill('grad@test.com');
    await page.locator('label:text-is("Number") + input').fill('9123456789');
    await page.locator('label:has-text("Entry Date") + input').fill('06/07/2000');
    await page.locator('label:has-text("Degree") + input').fill('f');
    await page.locator('label:has-text("Year Started") + input').fill('2020');

    await page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Please select which semester started');
    });

    await page.click('button:has-text("Add")');
  });
});
