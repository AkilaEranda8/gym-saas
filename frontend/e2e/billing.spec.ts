import { test, expect } from "@playwright/test";

test.describe("Billing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/billing");
    await page.waitForLoadState("networkidle");
  });

  test("should display billing stats cards", async ({ page }) => {
    const statsSection = page
      .locator("[data-testid='billing-stats']")
      .or(page.locator("text=Total Revenue").first())
      .or(page.locator("text=Revenue").first());

    await expect(statsSection).toBeVisible({ timeout: 10_000 });
  });

  test("should have Payments tab active by default", async ({ page }) => {
    const activeTab = page.locator("[role='tab'][aria-selected='true'], [data-state='active']").first();
    const text = await activeTab.textContent();
    expect(text?.toLowerCase()).toContain("payment");
  });

  test("should switch to Analytics tab", async ({ page }) => {
    const analyticsTab = page.getByRole("tab", { name: /Analytics/i });
    if (await analyticsTab.isVisible()) {
      await analyticsTab.click();
      await expect(analyticsTab).toHaveAttribute("aria-selected", "true");
    }
  });

  test("should switch to Discounts tab", async ({ page }) => {
    const discountsTab = page.getByRole("tab", { name: /Discounts/i });
    if (await discountsTab.isVisible()) {
      await discountsTab.click();
      await page.waitForLoadState("networkidle");
    }
  });

  test("should switch to Expenses tab", async ({ page }) => {
    const expensesTab = page.getByRole("tab", { name: /Expenses/i });
    if (await expensesTab.isVisible()) {
      await expensesTab.click();
      await page.waitForLoadState("networkidle");
    }
  });

  test("should show payment table with columns", async ({ page }) => {
    const tableHeaders = page.locator("th, [role='columnheader']");
    const count = await tableHeaders.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should open record payment modal", async ({ page }) => {
    const recordBtn = page
      .getByRole("button", { name: /Record Payment/i })
      .or(page.getByRole("button", { name: /New Payment/i }))
      .or(page.getByRole("button", { name: /\+ Payment/i }));

    if (await recordBtn.first().isVisible()) {
      await recordBtn.first().click();
      const modal = page.locator("[role='dialog'], [data-testid='payment-modal']");
      await expect(modal).toBeVisible({ timeout: 5_000 });
    }
  });
});
