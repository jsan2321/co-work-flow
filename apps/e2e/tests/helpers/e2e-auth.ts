import { Page, expect } from "@playwright/test";

export interface TestUserCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export async function registerTestUser(
  page: Page,
  overrides?: Partial<TestUserCredentials>
): Promise<TestUserCredentials> {
  const timestamp = Date.now();
  const credentials: TestUserCredentials = {
    firstName: overrides?.firstName || "Alex",
    lastName: overrides?.lastName || "Rivera",
    email:
      overrides?.email ||
      `alex_${timestamp}_${Math.floor(Math.random() * 1000)}@coworkflow-test.com`,
    password: overrides?.password || "SecurePass123!",
  };

  await page.goto("/register");
  await expect(page.locator("h1")).toContainText(/Join CoWorkFlow/i);

  await page.fill("#firstName", credentials.firstName);
  await page.fill("#lastName", credentials.lastName);
  await page.fill("#email", credentials.email);
  await page.fill("#password", credentials.password);

  await page.click('button[type="submit"]');

  // Registration redirects to /dashboard upon success
  await page.waitForURL("**/dashboard", { timeout: 15000 });
  await expect(page.locator("h1")).toContainText(/Welcome/i);

  return credentials;
}

export async function loginUser(
  page: Page,
  email: string,
  password: string,
  expectedPath: "/dashboard" | "/admin" = "/dashboard"
): Promise<void> {
  await page.goto("/login");
  await expect(page.locator("h1")).toContainText(/Sign in to CoWorkFlow/i);

  await page.fill("#email", email);
  await page.fill("#password", password);

  await page.click('button[type="submit"]');

  await page.waitForURL(`**${expectedPath}`, { timeout: 15000 });
}

export async function inspectBrowserStorage(page: Page): Promise<{
  localStorage: Record<string, string>;
  sessionStorage: Record<string, string>;
}> {
  return await page.evaluate(() => {
    const ls: Record<string, string> = {};
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key) {
        ls[key] = window.localStorage.getItem(key) || "";
      }
    }

    const ss: Record<string, string> = {};
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const key = window.sessionStorage.key(i);
      if (key) {
        ss[key] = window.sessionStorage.getItem(key) || "";
      }
    }

    return { localStorage: ls, sessionStorage: ss };
  });
}
