import { expect, test } from "@playwright/test";

test("Cardboard mode enables stereo, follows phone orientation and exits cleanly", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "DeviceOrientationEvent", {
      configurable: true,
      value: class extends Event {
        alpha: number | null;
        beta: number | null;
        gamma: number | null;
        constructor(type: string, init: { alpha?: number | null; beta?: number | null; gamma?: number | null } = {}) {
          super(type);
          this.alpha = init.alpha ?? null;
          this.beta = init.beta ?? null;
          this.gamma = init.gamma ?? null;
        }
      }
    });
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

  await page.evaluate(() => {
    const baseline = new Event("deviceorientation") as DeviceOrientationEvent;
    Object.defineProperties(baseline, { alpha: { value: 40 }, beta: { value: 80 } });
    window.dispatchEvent(baseline);
  });
  const before = await page.evaluate(() => (window as Window & { __HUELLAS_TEST_CAMERA__?: () => { alpha: number; beta: number; radius: number } }).__HUELLAS_TEST_CAMERA__?.());
  await page.evaluate(() => {
    const moved = new Event("deviceorientation") as DeviceOrientationEvent;
    Object.defineProperties(moved, { alpha: { value: 50 }, beta: { value: 90 } });
    window.dispatchEvent(moved);
  });
  await expect.poll(async () => page.evaluate(() => (window as Window & { __HUELLAS_TEST_CAMERA__?: () => { alpha: number; beta: number; radius: number } }).__HUELLAS_TEST_CAMERA__?.())).not.toEqual(before);

  await button.click();
  await expect(page.locator("#explorer")).not.toHaveClass(/cardboard-mode/);
  await expect(button).toHaveAttribute("aria-pressed", "false");
  await expect(button).toHaveText("Modo casco");
});
