import { ArcRotateCamera, Camera, Scene, TransformNode } from "@babylonjs/core";

export interface WorldControls { dispose: () => void; }
type Direction = "left" | "right" | "up" | "down" | "zoom-in" | "zoom-out";

const keyDirections: Record<string, Direction> = {
  ArrowLeft: "left", a: "left", A: "left",
  ArrowRight: "right", d: "right", D: "right",
  ArrowUp: "up", w: "up", W: "up",
  ArrowDown: "down", s: "down", S: "down"
};
const radians = Math.PI / 180;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const angleDelta = (value: number, origin: number) => ((value - origin + 540) % 360) - 180;

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
  _worldRoot: TransformNode, status: HTMLElement
): Promise<WorldControls> {
  camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput");
  camera.attachControl(canvas, true);
  const activeKeys = new Set<string>();
  const onKeyDown = (event: KeyboardEvent) => {
    const direction = keyDirections[event.key];
    if (!direction || (event.target instanceof HTMLElement && /INPUT|TEXTAREA|BUTTON|SELECT/.test(event.target.tagName))) return;
    event.preventDefault();
    if (!activeKeys.has(event.key)) moveCamera(camera, direction);
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

  const explorer = document.querySelector<HTMLElement>("#explorer");
  const cardboardButton = document.querySelector<HTMLButtonElement>("#cardboard-button");
  let cardboardActive = false;
  let cardboardPending = false;
  let disposed = false;
  let orientationBaseline: { alpha: number; beta: number; gamma: number; screenAngle: number; cameraAlpha: number; cameraBeta: number } | null = null;
  let sensorTimeout: number | null = null;

  const getScreenAngle = (): number => {
    const angle = Number(screen.orientation?.angle ?? 0);
    return ((angle % 360) + 360) % 360;
  };
  const resetOrientationBaseline = () => { orientationBaseline = null; };

  const onDeviceOrientation = (event: DeviceOrientationEvent) => {
    if (!cardboardActive || event.alpha === null || event.beta === null) return;
    if (sensorTimeout !== null) {
      window.clearTimeout(sensorTimeout);
      sensorTimeout = null;
    }
    const gamma = event.gamma ?? 0;
    const screenAngle = getScreenAngle();
    if (!orientationBaseline) {
      orientationBaseline = { alpha: event.alpha, beta: event.beta, gamma, screenAngle, cameraAlpha: camera.alpha, cameraBeta: camera.beta };
      status.textContent = "Modo casco activo · sensor conectado";
      return;
    }
    if (screenAngle !== orientationBaseline.screenAngle) {
      orientationBaseline = { alpha: event.alpha, beta: event.beta, gamma, screenAngle, cameraAlpha: camera.alpha, cameraBeta: camera.beta };
      return;
    }
    const yaw = angleDelta(event.alpha, orientationBaseline.alpha);
    const betaDelta = event.beta - orientationBaseline.beta;
    const gammaDelta = gamma - orientationBaseline.gamma;
    const screenRadians = screenAngle * radians;
    // Rotate the phone tilt axes into the current screen orientation (0/90/180/270°).
    const pitch = betaDelta * Math.cos(screenRadians) + gammaDelta * Math.sin(screenRadians);
    camera.alpha = orientationBaseline.cameraAlpha - yaw * radians;
    camera.beta = clamp(
      orientationBaseline.cameraBeta + pitch * radians,
      camera.lowerBetaLimit ?? 0.15,
      camera.upperBetaLimit ?? Math.PI - 0.15
    );
  };

  async function enableCardboard(): Promise<void> {
    if (cardboardActive || cardboardPending || disposed) return;
    cardboardPending = true;
    if (cardboardButton) cardboardButton.disabled = true;
    try {
      if (!window.isSecureContext) throw new Error("El modo casco necesita una conexión HTTPS segura para acceder a los sensores del celular.");
      if (typeof DeviceOrientationEvent === "undefined") throw new Error("Este navegador no ofrece sensores de orientación");
      const orientationApi = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
        requestPermission?: () => Promise<"granted" | "denied">
      };
      if (typeof orientationApi.requestPermission === "function") {
        const permission = await orientationApi.requestPermission();
        if (permission !== "granted") throw new Error("Permiso de orientación denegado");
      }
      if (disposed) return;
      camera.setCameraRigMode(Camera.RIG_MODE_STEREOSCOPIC_SIDEBYSIDE_PARALLEL, { interaxialDistance: 0.064 });
      cardboardActive = true;
      orientationBaseline = null;
      window.addEventListener("deviceorientation", onDeviceOrientation, true);
      screen.orientation?.addEventListener("change", resetOrientationBaseline);
      window.addEventListener("orientationchange", resetOrientationBaseline);
      camera.detachControl();
      explorer?.classList.add("cardboard-mode");
      if (cardboardButton) {
        cardboardButton.textContent = "Salir del casco";
        cardboardButton.setAttribute("aria-pressed", "true");
      }
      status.textContent = "Modo casco activo · esperando orientación del celular";
      sensorTimeout = window.setTimeout(() => {
        sensorTimeout = null;
        if (!orientationBaseline && cardboardActive) {
          disableCardboard();
          status.textContent = "No se detectó el giroscopio. Revisa los permisos del navegador y vuelve a intentarlo."; 
        }
      }, 5000);
    } catch (error) {
      camera.setCameraRigMode(Camera.RIG_MODE_NONE, {});
      const reason = error instanceof Error ? error.message : "No se pudo activar la orientación";
      status.textContent = `No se pudo activar el modo casco: ${reason}`;
    } finally {
      cardboardPending = false;
      if (cardboardButton && !disposed) cardboardButton.disabled = false;
    }
  }

  function disableCardboard(): void {
    if (!cardboardActive) return;
    cardboardActive = false;
    orientationBaseline = null;
    if (sensorTimeout !== null) window.clearTimeout(sensorTimeout);
    sensorTimeout = null;
    window.removeEventListener("deviceorientation", onDeviceOrientation, true);
    screen.orientation?.removeEventListener("change", resetOrientationBaseline);
    window.removeEventListener("orientationchange", resetOrientationBaseline);
    camera.setCameraRigMode(Camera.RIG_MODE_NONE, {});
    camera.attachControl(canvas, true);
    explorer?.classList.remove("cardboard-mode");
    if (cardboardButton) {
      cardboardButton.textContent = "Modo casco";
      cardboardButton.setAttribute("aria-pressed", "false");
    }
    status.textContent = "Modo 3D normal · controles de PC y móvil activos";
  }

  const toggleCardboard = () => {
    if (cardboardActive) disableCardboard();
    else void enableCardboard();
  };
  if (cardboardButton) {
    cardboardButton.disabled = false;
    cardboardButton.addEventListener("click", toggleCardboard);
    cardboardButton.setAttribute("aria-pressed", "false");
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
      cardboardButton?.removeEventListener("click", toggleCardboard);
      disableCardboard();
      if (cardboardButton) {
        cardboardButton.disabled = true;
        cardboardButton.textContent = "Modo casco";
        cardboardButton.setAttribute("aria-pressed", "false");
      }
      camera.detachControl();
    }
  };
}
