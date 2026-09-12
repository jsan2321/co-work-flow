import { test, expect } from "@playwright/test";

test.describe("Smoke Test — Platform Foundations", () => {
  test("loads landing page and displays CoWorkFlow title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/CoWorkFlow/i);
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/CoWorkFlow/i);
  });
});
