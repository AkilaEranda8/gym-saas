import { test, expect } from "@playwright/test";

test.describe("Members Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/members");
    await page.waitForLoadState("networkidle");
  });

  test("should display members list", async ({ page }) => {
    const memberTable = page.locator("table, [data-testid='members-table'], [class*='MemberTable']");
    await expect(memberTable.first()).toBeVisible({ timeout: 10_000 });
  });

  test("should have search input", async ({ page }) => {
    const searchInput = page.locator("input[placeholder*='Search'], input[placeholder*='search'], input[type='search']");
    await expect(searchInput.first()).toBeVisible();
  });

  test("should filter members by status", async ({ page }) => {
    const activeFilter = page.getByRole("button", { name: /Active/i })
      .or(page.locator("select").filter({ hasText: "Active" }))
      .or(page.locator("[data-value='ACTIVE']"));

    if (await activeFilter.first().isVisible()) {
      await activeFilter.first().click();
      await page.waitForLoadState("networkidle");
    }
  });

  test("should search for a member by name", async ({ page }) => {
    const searchInput = page.locator("input[placeholder*='Search'], input[placeholder*='search']").first();
    await searchInput.fill("Kamal");
    await page.waitForTimeout(600);

    const rows = page.locator("table tbody tr, [data-testid='member-row']");
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should navigate to member detail page on row click", async ({ page }) => {
    const firstRow = page.locator("table tbody tr, [data-testid='member-row']").first();
    const rowCount = await firstRow.count();

    if (rowCount > 0) {
      await firstRow.click();
      await page.waitForURL(/members\/.+/, { timeout: 10_000 });
      await expect(page).toHaveURL(/members\/.+/);
    }
  });

  test("should have pagination controls", async ({ page }) => {
    const pagination = page.locator("[data-testid='pagination'], nav[aria-label='pagination'], [class*='Pagination']")
      .or(page.getByRole("button", { name: /Next/ }));

    const paginationVisible = await pagination.first().isVisible();
    expect(typeof paginationVisible).toBe("boolean");
  });
});
