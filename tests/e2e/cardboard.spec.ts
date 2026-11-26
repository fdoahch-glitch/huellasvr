import { expect, test } from "@playwright/test";

test("Cardboard mode switches to stereo split-screen and exits cleanly", async ({ page }) => {
  await page.addInitScript(() => {
    if (!("DeviceOrientationEvent" in window)) {
      Object.defineProperty(window, "DeviceOrientationEvent", { value: class extends Event {} });
    }
  });
  await page.goto("/");
  await page.locator(".world-card").first().click();
  await expect(page.locator("#explorer")).toBeVisible();
  const button = page.locator("#cardboard-button");
  await expect(button).toBeEnabled();
  await button.click();
  await expect(page.locator("#explorer")).toHaveClass(/cardboard-mode/);
  await expect(button).toHaveAttribute("aria-pressed", "true");
  await expect(button).toHaveText("Salir del casco");
  await button.click();
  await expect(page.locator("#explorer")).not.toHaveClass(/cardboard-mode/);
  await expect(button).toHaveAttribute("aria-pressed", "false");
  await expect(button).toHaveText("Modo casco");
});
