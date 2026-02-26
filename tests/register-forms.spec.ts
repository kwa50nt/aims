import { test, expect } from '@playwright/test';

test.describe('Register Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/register-forms.html');
  });

  test('should display all static elements (logo and headings)', async ({ page }) => {
    await expect(page.locator('#upse-logo')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Alumni Management System' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Register', exact: true })).toBeVisible();
  });

  test('form inputs and register button should be interactable', async ({ page }) => {
    const emailInput = page.getByPlaceholder('Email');
    const passwordInput = page.getByPlaceholder('Password');
    const registerButton = page.getByRole('button', { name: 'Register' });

    await expect(emailInput).toBeEditable();
    await emailInput.fill('test@up.edu.ph');
    await expect(passwordInput).toBeEditable();
    await passwordInput.fill('password123');

    await expect(registerButton).toBeEnabled();
  });

  test('Log-in hyperlink should navigate to login-forms.html', async ({ page }) => {
    await page.getByRole('link', { name: 'Log-in' }).click();
    await expect(page).toHaveURL('http://localhost:3000/login-forms');
  });

});