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
    await expect(page.locator("#cardboard-button")).toBeVisible();
    await expect(page.locator("#touch-controls")).toBeAttached();
    await page.locator("#world-canvas").focus();
    const cameraBeforeKeyboard = await page.evaluate(() => window.__HUELLAS_TEST_CAMERA__?.());
    expect(cameraBeforeKeyboard).toBeTruthy();
    await page.keyboard.down("ArrowLeft");
    await page.waitForTimeout(120);
    await page.keyboard.up("ArrowLeft");
    const cameraAfterKeyboard = await page.evaluate(() => window.__HUELLAS_TEST_CAMERA__?.());
    expect(cameraAfterKeyboard.alpha).toBeLessThan(cameraBeforeKeyboard.alpha);
    await page.locator("#reset-camera").click();
    const cameraAfterReset = await page.evaluate(() => window.__HUELLAS_TEST_CAMERA__?.());
    expect(cameraAfterReset.alpha).toBeCloseTo(cameraBeforeKeyboard.alpha, 4);
    expect(cameraAfterReset.beta).toBeCloseTo(cameraBeforeKeyboard.beta, 4);
    expect(cameraAfterReset.radius).toBeCloseTo(cameraBeforeKeyboard.radius, 4);
    expect(cameraAfterReset.targetX).toBeCloseTo(cameraBeforeKeyboard.targetX, 4);
    expect(cameraAfterReset.targetY).toBeCloseTo(cameraBeforeKeyboard.targetY, 4);
    expect(cameraAfterReset.targetZ).toBeCloseTo(cameraBeforeKeyboard.targetZ, 4);

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

test("mantiene la exploración normal si el navegador no ofrece giroscopio", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "DeviceOrientationEvent", {
      configurable: true,
      value: undefined
    });
  });
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page.locator(".world-card").filter({ hasText: "Cuenca de Tolar" }).click();
  await expect(page.locator("#render-status")).toContainText("Dinosaurio cargado");
  await expect(page.locator("#cardboard-button")).toBeEnabled();
  await page.locator("#cardboard-button").click();
  await expect(page.locator("#render-status")).toContainText("no ofrece sensores de orientación");
  await expect(page.locator("#explorer")).not.toHaveClass(/cardboard-mode/);
  await expect(page.locator("#world-canvas")).toBeVisible();
});


test("libera y reconstruye escenas al cambiar repetidamente de mundo", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  for (const title of ["Cuenca de Tolar", "Cuenca de Hornitos", "Cuenca de Toqui", "Llanura de Dorotea", "Canal de Dorotea", "Cuenca de Tolar"]) {
    await page.locator(".world-card").filter({ hasText: title }).click();
    await expect(page.locator("#render-status")).toContainText("Dinosaurio cargado");
    await expect(page.locator("#world-canvas")).toHaveCount(1);
    await page.locator("#back-button").click();
    await expect(page.locator("#home")).toBeVisible();
    await expect(page.locator("#explorer")).toHaveClass(/hidden/);
  }
  expect(errors).toEqual([]);
});


test("la última selección de mundo prevalece si se pulsa rápidamente", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await page.locator(".world-card").filter({ hasText: "Cuenca de Tolar" }).dispatchEvent("click");
  await page.locator(".world-card").filter({ hasText: "Canal de Dorotea" }).dispatchEvent("click");
  await expect(page.locator("#world-title")).toHaveText("Canal de Dorotea");
  await expect(page.locator("#render-status")).toContainText("Dinosaurio cargado");
  expect(errors).toEqual([]);
});
