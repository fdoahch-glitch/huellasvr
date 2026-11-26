import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("los controles de escritorio cubren flechas y WASD en los dos ejes", async () => {
  const source = await readFile(new URL("../src/controls/WorldControls.ts", import.meta.url), "utf8");
  for (const key of ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "a:", "d:", "w:", "s:"]) {
    assert.ok(source.includes(key), "Falta el control de teclado " + key);
  }
  for (const direction of ["left", "right", "up", "down", "zoom-in", "zoom-out"]) {
    assert.ok(source.includes('"'+direction+'"'), "Falta la dirección " + direction);
  }
});

test("Cardboard ofrece estéreo lado a lado y seguimiento de orientación sin WebXR", async () => {
  const source = await readFile(new URL("../src/controls/WorldControls.ts", import.meta.url), "utf8");
  assert.ok(source.includes("Camera.RIG_MODE_STEREOSCOPIC_SIDEBYSIDE_PARALLEL"));
  assert.ok(source.includes('window.addEventListener("deviceorientation"'));
  assert.ok(source.includes("requestPermission"));
  assert.ok(source.includes("angleDelta(event.alpha, orientationBaseline.alpha)"));
  assert.ok(source.includes("camera.setCameraRigMode(Camera.RIG_MODE_NONE, {})"));
  assert.ok(source.includes('cardboardButton.textContent = "Salir del casco"'));
  assert.ok(!source.includes("WebXRDefaultExperience"));
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.ok(html.includes('id="cardboard-button"'));
  assert.ok(html.includes("pantalla doble + giroscopio"));
});

test("los controles táctiles detienen la repetición y se liberan al salir del mundo", async () => {
  const source = await readFile(new URL("../src/controls/WorldControls.ts", import.meta.url), "utf8");
  assert.ok(source.includes('querySelectorAll<HTMLElement>("[data-control]")'));
  assert.ok(source.includes("pointerdown"));
  assert.ok(source.includes("pointerup"));
  assert.ok(source.includes("pointercancel"));
  assert.ok(source.includes("clearInterval"));
  assert.ok(source.includes("const touchHandlers = new Map"));
  assert.ok(source.includes('button.removeEventListener("pointerdown", handlers.pointerdown)'));
  assert.ok(source.includes('button.removeEventListener("pointercancel", handlers.pointercancel)'));
  assert.ok(source.includes("camera.detachControl()"));
  assert.ok(source.includes(`removeByType("ArcRotateCameraKeyboardMoveInput")`));
  const main = await readFile(new URL("../src/main.ts", import.meta.url), "utf8");
  assert.ok(main.includes("worldControls?.dispose()"));
  assert.ok(main.includes("setupWorldControls(worldScene, built.camera, canvas, built.root, status)"));
  assert.ok(main.includes("if (requestId !== worldLoadSequence) return;"));
  assert.ok(main.includes("disposeWorld(false)"));
});

test("los hitos del escenario siguen siendo seleccionables en el modo de navegador", async () => {
  const world = await readFile(new URL("../src/worlds/common/ProceduralWorld.ts", import.meta.url), "utf8");
  const main = await readFile(new URL("../src/main.ts", import.meta.url), "utf8");
  assert.ok(world.includes("mesh.isPickable = true"));
  assert.ok(main.includes("PointerEventTypes.POINTERPICK"));
  assert.ok(main.includes("metadata.poiId"));
  assert.ok(main.includes("definition.landmarks.find"));
});

test("la medición usa frame-times, estabilización y restaura controles incluso ante error", async () => {
  const main = await readFile(new URL("../src/main.ts", import.meta.url), "utf8");
  assert.ok(main.includes("const warmupMs = 2000"));
  assert.ok(main.includes("const measurementMs = 10000"));
  assert.ok(main.includes("measuredScene.onBeforeRenderObservable.add"));
  assert.ok(main.includes("measuredEngine.getDeltaTime()"));
  assert.ok(main.includes("finally {"));
  assert.ok(main.includes("performanceMeasuring = false"));
  assert.ok(main.includes("CPU, GPU time, VRAM y memoria física"));
  assert.ok(!main.includes("engine.getFps()"));
});
