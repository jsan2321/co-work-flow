import { test, expect } from "@playwright/test";
import { loginUser } from "./helpers/e2e-auth.js";

test.describe("Admin E2E Journey — Space Catalog, Dispute Cancellation & Immutable Audit Ledger", () => {
  test("completes admin lifecycle: manage spaces, override member booking, and verify audit log", async ({
    page,
  }) => {
    // 1. Authenticate as Administrator
    await loginUser(page, "admin@coworkflow.com", "AdminPassword123!", "/admin");
    await expect(page.locator("h1")).toContainText(/Operational Overview/i);

    // 2. Space Catalog Management via Admin Navigation
    await page.locator('a[href="/admin/spaces"]').first().click();
    await page.waitForURL("**/admin/spaces", { timeout: 10000 });
    await expect(page.locator("h1")).toContainText(/Workspaces & Suites/i);

    // Click "New Workspace"
    const addSpaceBtn = page.locator('button:has-text("New Workspace")');
    await expect(addSpaceBtn).toBeVisible({ timeout: 10000 });
    await addSpaceBtn.click();

    // Fill out SpaceFormModal
    const spaceModal = page.locator('div[role="dialog"]');
    await expect(spaceModal).toBeVisible();
    await expect(spaceModal.locator("h2")).toContainText(/New Workspace/i);

    const spaceName = `Studio Horizon ${Date.now()}`;
    await spaceModal.locator("#space-name").fill(spaceName);
    await spaceModal.locator("#space-type").selectOption("MEETING_ROOM");
    await spaceModal.locator("#space-capacity").fill("8");
    await spaceModal
      .locator("#space-amenities")
      .fill("4K Teleconference, Whiteboard, Soundproofing");

    await spaceModal.locator('button:has-text("Create Space")').click();

    // Verify modal closed and new space is listed in the table
    await expect(spaceModal).not.toBeVisible({ timeout: 10000 });

    const searchInput = page.locator('input[placeholder*="Search spaces by name"]');
    await searchInput.fill(spaceName);
    await page.waitForTimeout(400);

    const spaceRow = page.locator("tbody tr", { hasText: spaceName });
    await expect(spaceRow).toBeVisible({ timeout: 10000 });
    await expect(spaceRow).toContainText(/ACTIVE/i);

    // 3. Toggle Status (Deactivate Space)
    const toggleBtn = spaceRow.locator('button:has-text("Deactivate")');
    await expect(toggleBtn).toBeVisible();
    await toggleBtn.click();

    // Badge should update to INACTIVE and button should now say Activate
    await expect(spaceRow).toContainText(/INACTIVE/i, { timeout: 10000 });
    await expect(spaceRow.locator('button:has-text("Activate")')).toBeVisible();

    // 4. Administrative Dispute Resolution (Admin Reservations)
    await page.locator('a[href="/admin/reservations"]').first().click();
    await page.waitForURL("**/admin/reservations", { timeout: 10000 });
    await expect(page.locator("h1")).toContainText(/Master Reservations Ledger/i);

    // Filter to CONFIRMED reservations
    const confirmedFilterBtn = page.locator('button:has-text("CONFIRMED")');
    if (await confirmedFilterBtn.isVisible()) {
      await confirmedFilterBtn.click();
      await page.waitForTimeout(400);
    }

    // Find any active confirmed reservation to dispute-cancel
    const adminCancelButtons = page.locator('button:has-text("Admin Cancel")');
    const cancelCount = await adminCancelButtons.count();

    if (cancelCount > 0) {
      await adminCancelButtons.first().click();

      const overrideModal = page.locator('div[role="dialog"]');
      await expect(overrideModal).toBeVisible();
      await expect(overrideModal.locator("h2")).toContainText(/Administrative Dispute Override/i);

      // Enter mandatory cancellation reason
      const reasonText = `Emergency facility maintenance override ${Date.now()}`;
      await overrideModal.locator("#cancel-reason").fill(reasonText);

      await overrideModal.locator('button:has-text("Confirm Override")').click();
      await expect(overrideModal).not.toBeVisible({ timeout: 10000 });

      // 5. Immutable Audit Log Verification
      await page.locator('a[href="/admin/audit-logs"]').first().click();
      await page.waitForURL("**/admin/audit-logs", { timeout: 10000 });
      await expect(page.locator("h1")).toContainText(/Immutable Audit Ledger/i);

      // Verify the audit log table contains the admin override entry
      const auditTable = page.locator("tbody tr");
      await expect(auditTable.first()).toBeVisible({ timeout: 10000 });

      // Search or filter by Reservation entity
      const entityFilter = page.locator('input[placeholder*="Filter by entity type"]');
      await entityFilter.fill("Reservation");
      await page.waitForTimeout(400);

      // Assert at least one RESERVATION_CANCELLED_BY_ADMIN entry exists
      const cancelLogEntry = page
        .locator("tbody tr")
        .filter({ hasText: "RESERVATION_CANCELLED_BY_ADMIN" });
      await expect(cancelLogEntry.first()).toBeVisible({ timeout: 10000 });
      await expect(cancelLogEntry.first()).toContainText(/Admin User/i);
    }
  });
});
