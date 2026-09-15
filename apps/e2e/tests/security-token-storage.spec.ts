import { test, expect } from "@playwright/test";
import { registerTestUser, inspectBrowserStorage } from "./helpers/e2e-auth.js";

test.describe("Security Audit — Zero Token Storage in Browser Client", () => {
  test("strictly forbids storing JWT access or refresh tokens in localStorage or sessionStorage", async ({
    page,
  }) => {
    // 1. Authenticate member and complete interactive session
    await registerTestUser(page);

    // Navigate across core member routes via client links
    await page.locator('a[href="/spaces"]').first().click();
    await page.waitForURL("**/spaces", { timeout: 10000 });
    await expect(page.locator("h1")).toContainText(/Explore Workspaces/i);

    await page.locator('a[href="/reservations"]').first().click();
    await page.waitForURL("**/reservations", { timeout: 10000 });
    await expect(page.locator("h1")).toContainText(/My Reservations/i);

    await page.locator('a[href="/dashboard"]').first().click();
    await page.waitForURL("**/dashboard", { timeout: 10000 });
    await expect(page.locator("h1")).toContainText(/Welcome/i);

    // 2. Extract client-side Web Storage
    const storage = await inspectBrowserStorage(page);

    // 3. Inspect localStorage
    const localKeys = Object.keys(storage.localStorage);
    const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

    for (const key of localKeys) {
      const lowerKey = key.toLowerCase();
      // Ensure no auth-sensitive keys exist
      expect(lowerKey).not.toContain("token");
      expect(lowerKey).not.toContain("jwt");
      expect(lowerKey).not.toContain("auth");
      expect(lowerKey).not.toContain("bearer");

      // Verify value does not contain a raw JWT string
      const val = storage.localStorage[key] || "";
      expect(jwtRegex.test(val.trim())).toBeFalsy();
    }

    // 4. Inspect sessionStorage
    const sessionKeys = Object.keys(storage.sessionStorage);
    for (const key of sessionKeys) {
      const lowerKey = key.toLowerCase();
      expect(lowerKey).not.toContain("token");
      expect(lowerKey).not.toContain("jwt");
      expect(lowerKey).not.toContain("auth");
      expect(lowerKey).not.toContain("bearer");

      const val = storage.sessionStorage[key] || "";
      expect(jwtRegex.test(val.trim())).toBeFalsy();
    }

    // 5. Verify HttpOnly cookie isolation: document.cookie cannot read refresh_token
    const clientVisibleCookies = await page.evaluate(() => document.cookie);
    expect(clientVisibleCookies).not.toContain("refresh_token");
  });
});
