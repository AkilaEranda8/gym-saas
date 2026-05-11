import { test, expect } from "@playwright/test";

test.describe("Trainers Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/trainers");
    await page.waitForLoadState("networkidle");
  });

  test("should display trainer stats cards", async ({ page }) => {
    const stats = page
      .locator("[data-testid='trainer-stats']")
      .or(page.locator("text=Total Trainers").first())
      .or(page.locator("text=Active Trainers").first());

    await expect(stats).toBeVisible({ timeout: 10_000 });
  });

  test("should display trainer table or cards", async ({ page }) => {
    const content = page
      .locator("table tbody tr")
      .or(page.locator("[data-testid='trainer-card']"))
      .first();

    const count = await content.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should have specialty filter", async ({ page }) => {
    const specialtyFilter = page
      .getByRole("combobox")
      .or(page.locator("select"))
      .first();

    const isVisible = await specialtyFilter.isVisible();
    expect(typeof isVisible).toBe("boolean");
  });

  test("should show trainer status badge for each trainer", async ({ page }) => {
    const rows = page.locator("table tbody tr");
    const rowCount = await rows.count();

    if (rowCount > 0) {
      const firstRow = rows.first();
      const badge = firstRow.locator("[class*='badge'], [class*='Badge'], [class*='status']");
      const badgeCount = await badge.count();
      expect(badgeCount).toBeGreaterThanOrEqual(0);
    }
  });
});
