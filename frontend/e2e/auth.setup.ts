import { test as setup, expect } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, ".auth/user.json");

setup("authenticate as gym owner", async ({ page }) => {
  await page.goto("/login");

  await page.waitForSelector("input[name='username'], input[type='email']", { timeout: 15_000 });

  const usernameInput = page.locator("input[name='username'], input[type='email']").first();
  const passwordInput = page.locator("input[name='password'], input[type='password']").first();

  await usernameInput.fill(process.env.E2E_OWNER_EMAIL ?? "owner@test.com");
  await passwordInput.fill(process.env.E2E_OWNER_PASSWORD ?? "Test@1234");

  await page.locator("button[type='submit']").click();

  await page.waitForURL("**/dashboard", { timeout: 20_000 });
  await expect(page).toHaveURL(/dashboard/);

  await page.context().storageState({ path: authFile });
});
