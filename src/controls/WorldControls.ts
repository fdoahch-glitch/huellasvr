import { ArcRotateCamera, Scene, TransformNode } from "@babylonjs/core";
import { WebXRDefaultExperience } from "@babylonjs/core/XR/webXRDefaultExperience";
import "@babylonjs/core/Materials/Node/Blocks";

export interface WorldControls { dispose: () => void; }
type Direction = "left" | "right" | "up" | "down" | "zoom-in" | "zoom-out";

const keyDirections: Record<string, Direction> = {
  ArrowLeft: "left", a: "left", A: "left",
  ArrowRight: "right", d: "right", D: "right",
  ArrowUp: "up", w: "up", W: "up",
  ArrowDown: "down", s: "down", S: "down"
};

function moveCamera(camera: ArcRotateCamera, direction: Direction): void {
  const rotation = 0.025;
  switch (direction) {
    case "left": camera.alpha -= rotation; break;
    case "right": camera.alpha += rotation; break;
    case "up": camera.beta = Math.max(camera.lowerBetaLimit ?? 0.2, camera.beta - rotation); break;
    case "down": camera.beta = Math.min(camera.upperBetaLimit ?? Math.PI / 2, camera.beta + rotation); break;
    case "zoom-in": camera.radius = Math.max(camera.lowerRadiusLimit ?? 5, camera.radius * 0.96); break;
    case "zoom-out": camera.radius = Math.min(camera.upperRadiusLimit ?? 200, camera.radius * 1.04); break;
  }
}

export async function setupWorldControls(
  scene: Scene, camera: ArcRotateCamera, canvas: HTMLCanvasElement,
  worldRoot: TransformNode, status: HTMLElement
): Promise<WorldControls> {
  camera.attachControl(canvas, true);
  const activeKeys = new Set<string>();
  const onKeyDown = (event: KeyboardEvent) => {
    const direction = keyDirections[event.key];
    if (!direction || (event.target instanceof HTMLElement && /INPUT|TEXTAREA|BUTTON|SELECT/.test(event.target.tagName))) return;
    event.preventDefault();
    activeKeys.add(event.key);
  };
  const onKeyUp = (event: KeyboardEvent) => { activeKeys.delete(event.key); };
  const onBlur = () => activeKeys.clear();
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);

  const touchPad = document.querySelector<HTMLElement>("#touch-controls");
  const timers = new Map<HTMLElement, number>();
  const touchButtons = [...(touchPad?.querySelectorAll<HTMLElement>("[data-control]") ?? [])];
  const stopTouch = (button: HTMLElement) => {
    const timer = timers.get(button);
    if (timer !== undefined) window.clearInterval(timer);
    timers.delete(button);
    button.classList.remove("pressed");
  };
  const startTouch = (button: HTMLElement) => {
    const direction = button.dataset.control as Direction | undefined;
    if (!direction) return;
    stopTouch(button);
    moveCamera(camera, direction);
    button.classList.add("pressed");
    timers.set(button, window.setInterval(() => moveCamera(camera, direction), 45));
  };
  for (const button of touchButtons) {
    button.addEventListener("pointerdown", (event) => { event.preventDefault(); button.setPointerCapture(event.pointerId); startTouch(button); });
    button.addEventListener("pointerup", () => stopTouch(button));
    button.addEventListener("pointercancel", () => stopTouch(button));
    button.addEventListener("lostpointercapture", () => stopTouch(button));
    button.addEventListener("contextmenu", (event) => event.preventDefault());
  }

  let disposed = false;
  let xrExperience: Awaited<ReturnType<typeof WebXRDefaultExperience.CreateAsync>> | null = null;
  const vrButton = document.querySelector<HTMLButtonElement>("#vr-button");
  if (vrButton) {
    vrButton.disabled = true;
    vrButton.textContent = "Comprobando VR…";
    const xrNavigator = navigator as Navigator & { xr?: { isSessionSupported: (mode: string) => Promise<boolean> } };
    try {
      const supported = Boolean(xrNavigator.xr && await xrNavigator.xr.isSessionSupported("immersive-vr"));
      if (supported && !disposed) {
        const floorMeshes = worldRoot.getChildMeshes(false).filter((mesh) => mesh.name.includes("terrain"));
        xrExperience = await WebXRDefaultExperience.CreateAsync(scene, { floorMeshes, disableDefaultUI: true });
        xrExperience.baseExperience.onStateChangedObservable.add((state) => {
          if (!vrButton) return;
          if (state === 2) vrButton.textContent = "Salir de VR";
          else if (state === 0) vrButton.textContent = "Entrar en VR";
        });
        if (!disposed) {
          vrButton.disabled = false;
          vrButton.textContent = "Entrar en VR";
          vrButton.addEventListener("click", enterOrExitVR);
          status.textContent = "WebXR disponible · controles de visor y mandos preparados";
        }
      } else if (!disposed) {
        vrButton.textContent = "VR no disponible en este dispositivo";
        status.textContent = "Modo 3D · este navegador o dispositivo no ofrece WebXR inmersivo";
      }
    } catch {
      if (!disposed) {
        vrButton.textContent = "VR no disponible";
        status.textContent = "Modo 3D · WebXR no pudo inicializarse";
      }
    }
  }

  async function enterOrExitVR(): Promise<void> {
    if (!xrExperience || !vrButton) return;
    try {
      if (xrExperience.baseExperience.state === 2) {
        await xrExperience.baseExperience.exitXRAsync();
        vrButton.textContent = "Entrar en VR";
      } else {
        await xrExperience.baseExperience.enterXRAsync("immersive-vr", "local-floor");
        vrButton.textContent = "Salir de VR";
      }
    } catch {
      status.textContent = "No se pudo iniciar VR · comprueba HTTPS, permisos y compatibilidad del visor";
    }
  }

  const renderObserver = scene.onBeforeRenderObservable.add(() => {
    for (const key of activeKeys) {
      const direction = keyDirections[key];
      if (direction) moveCamera(camera, direction);
    }
  });

  return {
    dispose: () => {
      disposed = true;
      scene.onBeforeRenderObservable.remove(renderObserver);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      for (const button of touchButtons) stopTouch(button);
      vrButton?.removeEventListener("click", enterOrExitVR);
      if (vrButton) { vrButton.disabled = true; vrButton.textContent = "Entrar en VR"; }
      if (xrExperience) {
        xrExperience.dispose();
        xrExperience = null;
      }
      camera.detachControl();
    }
  };
}
