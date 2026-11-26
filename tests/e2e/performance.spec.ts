import { expect, test } from "@playwright/test";

test("performance report downloads a single-world frame-time measurement", async ({ page }) => {
  await page.goto("/");
  await page.locator(".world-card").first().click();
  await expect(page.locator("#explorer")).toBeVisible();
  const button = page.locator("#performance-button");
  const downloadPromise = page.waitForEvent("download", { timeout: 20000 });
  await button.click();
  await expect(button).toBeDisabled();
  await expect(page.locator("#back-button")).toBeDisabled();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^huellas-vr-rendimiento-.*\.html$/);
  await expect(button).toBeEnabled();
  await expect(page.locator("#back-button")).toBeEnabled();
  await expect(page.locator("#render-status")).toContainText(/Medición lista|no se registraron frames/);
});
