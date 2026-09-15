import { test, expect } from "@playwright/test";
import { registerTestUser } from "./helpers/e2e-auth.js";

test.describe("Member E2E Journey — Discovery, Availability Booking & Cancellation", () => {
  test("completes full member lifecycle from signup to booking and cutoff cancellation", async ({
    page,
  }) => {
    // 1. User registers a brand-new account
    const member = await registerTestUser(page);
    expect(member.email).toContain("@coworkflow-test.com");

    // 2. Discover spaces catalog
    await page.locator('a[href="/spaces"]').first().click();
    await page.waitForURL("**/spaces", { timeout: 10000 });
    await expect(page.locator("h1")).toContainText(/Explore Workspaces/i);

    // Verify space cards are rendered
    const availabilityBtns = page.locator('button:has-text("Check Availability")');
    await expect(availabilityBtns.first()).toBeVisible({ timeout: 10000 });
    const count = await availabilityBtns.count();
    expect(count).toBeGreaterThan(0);

    // Search for a meeting room
    const searchInput = page.locator('input[placeholder*="Search by space name"]');
    await searchInput.fill("Boardroom");
    await page.waitForTimeout(400); // Debounce / re-render
    await expect(page.locator('h3:has-text("Boardroom")')).toBeVisible({ timeout: 10000 });

    // 3. Open space details
    await page.locator('button:has-text("Check Availability")').first().click();

    await page.waitForURL("**/spaces/*", { timeout: 10000 });
    await expect(page.locator("h1")).toContainText(/Boardroom/i);

    // 4. Select next day to guarantee all daylight hours are in the future
    const dayButtons = page.locator("div.overflow-x-auto button:has(span.font-serif)");
    if ((await dayButtons.count()) > 1) {
      await dayButtons.nth(1).click();
    }

    // Wait for availability matrix to load slots
    await page.waitForTimeout(500);

    // Find first available slot button in matrix
    const availableSlot = page.locator('button:has-text("Available")').first();
    await expect(availableSlot).toBeVisible({ timeout: 10000 });
    await availableSlot.click();

    // 5. Docked selection summary appears with "Book This Space" button
    const bookBtn = page.locator('button:has-text("Book This Space")');
    await expect(bookBtn).toBeVisible();
    await bookBtn.click();

    // 6. Confirm Booking Modal opens
    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal.locator("h2")).toContainText(/Confirm Reservation/i);

    const purposeInput = modal.locator("#booking-purpose");
    if (await purposeInput.isVisible()) {
      await purposeInput.fill("Executive Strategy Session");
    }

    // Submit reservation
    const confirmBtn = modal.locator('button:has-text("Confirm Reservation")');
    await confirmBtn.click();

    // 7. Verification: Redirected to /reservations
    await page.waitForURL("**/reservations", { timeout: 15000 });
    await expect(page.locator("h1")).toContainText(/My Reservations/i);

    // Find the confirmed booking card
    const reservationCard = page
      .locator("div.rounded-\\[8px\\]")
      .filter({ hasText: "Boardroom" })
      .first();
    await expect(reservationCard).toBeVisible({ timeout: 10000 });
    await expect(reservationCard).toContainText(/CONFIRMED/i);

    // 8. Self-service cutoff cancellation
    const cancelBtn = reservationCard.locator('button:has-text("Cancel Reservation")');
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();

    // Cancel modal opens
    const cancelModal = page.locator('div[role="dialog"]');
    await expect(cancelModal).toBeVisible();
    await expect(cancelModal.locator("h2")).toContainText(/Cancel Reservation/i);

    const confirmCancelBtn = cancelModal.locator('button:has-text("Confirm Cancellation")');
    await confirmCancelBtn.click();

    // Wait for modal to close and queries to invalidate
    await expect(cancelModal).not.toBeVisible({ timeout: 10000 });

    // Switch to "Past & Cancelled" tab to verify status is CANCELLED
    const pastTab = page.locator('button:has-text("Past & Cancelled")');
    await pastTab.click();

    const cancelledItem = page
      .locator("div.rounded-\\[8px\\]")
      .filter({ hasText: "Boardroom" })
      .first();
    await expect(cancelledItem).toBeVisible({ timeout: 10000 });
    await expect(cancelledItem).toContainText(/CANCELLED/i);
  });
});
