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

test("WebXR comprueba immersive-vr antes de crear la experiencia y ofrece entrar y salir", async () => {
  const source = await readFile(new URL("../src/controls/WorldControls.ts", import.meta.url), "utf8");
  assert.ok(source.includes('isSessionSupported("immersive-vr")'));
  assert.ok(source.includes('createDefaultXRExperienceAsync'));
  assert.ok(source.includes('enterXRAsync("immersive-vr", "local-floor")'));
  assert.ok(source.includes("exitXRAsync"));
  assert.ok(source.includes("onStateChangedObservable"));
  assert.ok(source.includes("VR no disponible"));
});

test("los controles táctiles detienen la repetición y se liberan al salir del mundo", async () => {
  const source = await readFile(new URL("../src/controls/WorldControls.ts", import.meta.url), "utf8");
  assert.ok(source.includes('querySelectorAll<HTMLElement>("[data-control]")'));
  assert.ok(source.includes("pointerdown"));
  assert.ok(source.includes("pointerup"));
  assert.ok(source.includes("pointercancel"));
  assert.ok(source.includes("clearInterval"));
  assert.ok(source.includes("camera.detachControl()"));
  const main = await readFile(new URL("../src/main.ts", import.meta.url), "utf8");
  assert.ok(main.includes("worldControls?.dispose()"));
  assert.ok(main.includes("setupWorldControls(scene, built.camera, canvas, built.root, status)"));
});
