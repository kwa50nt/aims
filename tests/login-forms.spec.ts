import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login-forms.html');
  });

  test('should display the Log-in text', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Log-in', exact: true })).toBeVisible();
  });

  test('should allow input in textboxes and mask the password', async ({ page }) => {
    const emailInput = page.getByPlaceholder('Email');
    const passwordInput = page.getByPlaceholder('Password');

    await emailInput.fill('alumni@up.edu.ph');
    await expect(emailInput).toHaveValue('alumni@up.edu.ph');

    await passwordInput.fill('supersecret123');
    await expect(passwordInput).toHaveValue('supersecret123');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('Register hyperlink should be clickable', async ({ page }) => {
    await page.getByRole('link', { name: 'Register' }).click();
  });

  test('Log-in button should navigate to index.html', async ({ page }) => {
    await page.getByPlaceholder('Email').fill('alumni@up.edu.ph');
    await page.getByPlaceholder('Password').fill('supersecret123');
    await page.getByRole('button', { name: 'Log-in' }).click();
    await expect(page).toHaveURL('http://localhost:3000/'); //this should work since index.html is hidden. the url is a string, so its index.html if its empty dapat
  });

});