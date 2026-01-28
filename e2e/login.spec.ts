import { test, expect } from '@playwright/test';

/**
 * Login Flow E2E Tests (P1.5)
 *
 * Test accounts:
 * - Admin: admin@devotion.ventures / admin123
 * - Customer: customer@devco.se / customer123
 */

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('shows login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /logga in/i })).toBeVisible();
    await expect(page.getByLabel(/e-post/i)).toBeVisible();
    await expect(page.getByLabel(/lösenord/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /logga in/i })).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.getByLabel(/e-post/i).fill('invalid@example.com');
    await page.getByLabel(/lösenord/i).fill('wrongpassword');
    await page.getByRole('button', { name: /logga in/i }).click();

    // Wait for error message
    await expect(
      page.getByText(/felaktigt användarnamn eller lösenord/i)
    ).toBeVisible({ timeout: 10000 });
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    await page.getByLabel(/e-post/i).fill('customer@devco.se');
    await page.getByLabel(/lösenord/i).fill('customer123');
    await page.getByRole('button', { name: /logga in/i }).click();

    // Wait for redirect to /app
    await expect(page).toHaveURL(/\/app/, { timeout: 15000 });

    // Should see dashboard content
    await expect(page.getByText(/dashboard|översikt/i)).toBeVisible();
  });

  test('admin login redirects to dashboard', async ({ page }) => {
    await page.getByLabel(/e-post/i).fill('admin@devotion.ventures');
    await page.getByLabel(/lösenord/i).fill('admin123');
    await page.getByRole('button', { name: /logga in/i }).click();

    // Wait for redirect to /app
    await expect(page).toHaveURL(/\/app/, { timeout: 15000 });

    // Admin should see admin badge or admin link
    await expect(
      page.getByRole('button', { name: /admin/i }).or(page.getByText(/admin/i))
    ).toBeVisible();
  });

  test('shows remaining attempts after failed login', async ({ page }) => {
    await page.getByLabel(/e-post/i).fill('test@example.com');
    await page.getByLabel(/lösenord/i).fill('wrongpassword');
    await page.getByRole('button', { name: /logga in/i }).click();

    // Should show remaining attempts
    await expect(page.getByText(/försök kvar/i)).toBeVisible({ timeout: 10000 });
  });

  test('forgot password link is visible', async ({ page }) => {
    const forgotLink = page.getByRole('link', { name: /glömt lösenord/i });
    await expect(forgotLink).toBeVisible();

    await forgotLink.click();
    await expect(page).toHaveURL(/\/forgot-password/);
  });
});

test.describe('Logout Flow', () => {
  test('user can logout', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/e-post/i).fill('customer@devco.se');
    await page.getByLabel(/lösenord/i).fill('customer123');
    await page.getByRole('button', { name: /logga in/i }).click();

    // Wait for dashboard
    await expect(page).toHaveURL(/\/app/, { timeout: 15000 });

    // Open user menu and click logout
    await page.getByRole('button', { name: /användarmeny/i }).click();
    await page.getByRole('button', { name: /logga ut/i }).click();

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });
});
