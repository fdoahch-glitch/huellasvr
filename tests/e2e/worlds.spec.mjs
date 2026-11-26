import { test, expect } from "@playwright/test";

test("abre, renderiza y permite salir de los cinco mundos con WebGL2", async ({ page }, testInfo) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("#home")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("selector-desktop.png"), fullPage: true });

  const worlds = [
    ["Cuenca de Tolar", "Atacamatitan chilensis"],
    ["Cuenca de Hornitos", "Arackar licanantay"],
    ["Cuenca de Toqui", "Chilesaurus diegosuarezi"],
    ["Llanura de Dorotea", "Gonkoken nanoi"],
    ["Canal de Dorotea", "Stegouros elengassen"]
  ];

  for (const [title, species] of worlds) {
    await page.locator(".world-card").filter({ hasText: title }).click();
    await expect(page.locator("#world-title")).toHaveText(title);
    await expect(page.locator("#world-subtitle")).toContainText(species);
    await expect(page.locator("#render-status")).toContainText("Dinosaurio cargado");
    await expect(page.locator("#vr-button")).toBeVisible();
    await expect(page.locator("#touch-controls")).toBeAttached();
    await page.locator("#world-canvas").click({ position: { x: 20, y: 20 } });
    const cameraBeforeKeyboard = await page.evaluate(() => window.__HUELLAS_TEST_CAMERA__?.());
    expect(cameraBeforeKeyboard).toBeTruthy();
    await page.keyboard.down("ArrowLeft");
    await page.waitForTimeout(120);
    await page.keyboard.up("ArrowLeft");
    const cameraAfterKeyboard = await page.evaluate(() => window.__HUELLAS_TEST_CAMERA__?.());
    expect(cameraAfterKeyboard.alpha).toBeLessThan(cameraBeforeKeyboard.alpha);

    const cameraBeforeTouch = await page.evaluate(() => window.__HUELLAS_TEST_CAMERA__());
    await page.locator("#touch-controls [data-control=zoom-in]").click();
    const cameraAfterTouch = await page.evaluate(() => window.__HUELLAS_TEST_CAMERA__());
    expect(cameraAfterTouch.radius).toBeLessThan(cameraBeforeTouch.radius);
    for (const [animation, label] of [["Idle", "Reposo"], ["Walk", "Caminar"], ["Run", "Correr"], ["Neck_Look", "Mirar"]]) {
      const button = page.locator(`[data-animation="${animation}"]`);
      await button.click();
      await expect(button).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("#render-status")).toContainText(`animación ${animation}`);
    }
    const idleButton = page.locator(`[data-animation="Idle"]`);
    await idleButton.click();
    await expect(idleButton).toHaveAttribute("aria-pressed", "true");
    await expect(idleButton).toHaveClass(/active/);
    const lookButton = page.locator(`[data-animation="Neck_Look"]`);
    await expect(lookButton).toHaveAttribute("aria-pressed", "false");
    await expect(lookButton).not.toHaveClass(/active/);
    await expect(page.locator("#animation-controls .animation-button.active")).toHaveCount(1);

    const canvas = page.locator("#world-canvas");
    await expect(canvas).toBeVisible();
    const dimensions = await canvas.evaluate((element) => ({
      width: element.clientWidth,
      height: element.clientHeight,
      hasWebGL2: Boolean(element.getContext("webgl2"))
    }));
    expect(dimensions.width).toBeGreaterThan(0);
    expect(dimensions.height).toBeGreaterThan(0);
    expect(dimensions.hasWebGL2).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(title.toLowerCase().replaceAll(" ", "-") + ".png") });

    await page.locator("#back-button").click();
    await expect(page.locator("#home")).toBeVisible();
  }

  expect(pageErrors).toEqual([]);
});

test("el selector y el HUD caben en una pantalla móvil", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("#home")).toBeVisible();
  const cards = page.locator(".world-card");
  await expect(cards).toHaveCount(5);

  const homeBounds = await page.locator("#world-list").evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
  });
  expect(homeBounds.left).toBeGreaterThanOrEqual(0);
  expect(homeBounds.right).toBeLessThanOrEqual(390);
  expect(homeBounds.bottom).toBeLessThanOrEqual(844);
  await page.screenshot({ path: testInfo.outputPath("selector-mobile.png"), fullPage: true });

  await cards.filter({ hasText: "Cuenca de Tolar" }).click();
  await expect(page.locator("#render-status")).toContainText("Dinosaurio cargado");
  const uiBounds = await page.evaluate(() => {
    const rect = (selector) => {
      const box = document.querySelector(selector).getBoundingClientRect();
      return { left: box.left, right: box.right, top: box.top, bottom: box.bottom };
    };
    return {
      topbar: rect(".world-topbar"),
      info: rect("#world-info"),
      animations: rect("#animation-controls"),
      touch: rect("#touch-controls"),
      controls: rect(".world-controls"),
      viewport: { width: innerWidth, height: innerHeight }
    };
  });
  for (const key of ["topbar", "info", "animations", "touch", "controls"]) {
    expect(uiBounds[key].left).toBeGreaterThanOrEqual(0);
    expect(uiBounds[key].right).toBeLessThanOrEqual(uiBounds.viewport.width);
  }
  expect(uiBounds.info.bottom).toBeLessThan(0.4 * uiBounds.viewport.height);
  expect(uiBounds.info.bottom).toBeLessThan(uiBounds.animations.top);
  await expect(page.locator("#touch-controls")).toBeVisible();
  await expect(page.locator("#touch-controls [data-control]")).toHaveCount(6);
  const cameraBefore = await page.evaluate(() => window.__HUELLAS_TEST_CAMERA__());
  await page.locator("#touch-controls [data-control=zoom-in]").click();
  const cameraAfter = await page.evaluate(() => window.__HUELLAS_TEST_CAMERA__());
  expect(cameraAfter.radius).toBeLessThan(cameraBefore.radius);
  expect(uiBounds.controls.bottom).toBeLessThanOrEqual(uiBounds.viewport.height);
  await page.screenshot({ path: testInfo.outputPath("mundo-movil.png") });
});

test("mantiene la exploración 3D cuando WebXR no está disponible", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "xr", {
      configurable: true,
      value: { isSessionSupported: async () => false }
    });
  });
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page.locator(".world-card").filter({ hasText: "Cuenca de Tolar" }).click();
  await expect(page.locator("#render-status")).toContainText("Dinosaurio cargado");
  await expect(page.locator("#vr-button")).toBeDisabled();
  await expect(page.locator("#vr-button")).toHaveText("VR no disponible en este dispositivo");
  await expect(page.locator("#world-canvas")).toBeVisible();
});
