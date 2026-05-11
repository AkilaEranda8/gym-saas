import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test("should display the dashboard page title", async ({ page }) => {
    await expect(page).toHaveTitle(/PowerHouse|Gym|Dashboard/i);
  });

  test("should show member stats cards", async ({ page }) => {
    await page.waitForSelector("[data-testid='stats-cards'], .stats-card, [class*='StatsCard']", {
      timeout: 10_000,
    });

    const statsContainer = page.locator("[data-testid='stats-cards']").or(
      page.locator("text=Total Members").first()
    );
    await expect(statsContainer).toBeVisible();
  });

  test("should render the sidebar navigation", async ({ page }) => {
    await expect(page.locator("nav, aside")).toBeVisible();
    await expect(page.getByRole("link", { name: /Members/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Billing/i })).toBeVisible();
  });

  test("should navigate to Members page from sidebar", async ({ page }) => {
    await page.getByRole("link", { name: /^Members$/i }).click();
    await expect(page).toHaveURL(/members/);
    await page.waitForLoadState("networkidle");
  });

  test("should navigate to Billing page from sidebar", async ({ page }) => {
    await page.getByRole("link", { name: /^Billing$/i }).click();
    await expect(page).toHaveURL(/billing/);
    await page.waitForLoadState("networkidle");
  });
});
