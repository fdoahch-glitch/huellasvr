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
    await expect(page.locator("#render-status")).toHaveText("Escenario activo · WebGL2");

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
  await expect(page.locator("#render-status")).toHaveText("Escenario activo · WebGL2");
  const uiBounds = await page.evaluate(() => {
    const rect = (selector) => {
      const box = document.querySelector(selector).getBoundingClientRect();
      return { left: box.left, right: box.right, top: box.top, bottom: box.bottom };
    };
    return {
      topbar: rect(".world-topbar"),
      info: rect("#world-info"),
      controls: rect(".world-controls"),
      viewport: { width: innerWidth, height: innerHeight }
    };
  });
  for (const key of ["topbar", "info", "controls"]) {
    expect(uiBounds[key].left).toBeGreaterThanOrEqual(0);
    expect(uiBounds[key].right).toBeLessThanOrEqual(uiBounds.viewport.width);
  }
  expect(uiBounds.info.bottom).toBeLessThanOrEqual(uiBounds.viewport.height);
  expect(uiBounds.controls.bottom).toBeLessThanOrEqual(uiBounds.viewport.height);
  await page.screenshot({ path: testInfo.outputPath("mundo-movil.png") });
});
