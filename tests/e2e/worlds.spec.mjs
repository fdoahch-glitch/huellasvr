import { test, expect } from "@playwright/test";

test("abre, renderiza y permite salir de los cinco mundos con WebGL2", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/");
  await expect(page.locator("#home")).toBeVisible();

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

    await page.locator("#back-button").click();
    await expect(page.locator("#home")).toBeVisible();
  }

  expect(pageErrors).toEqual([]);
});
