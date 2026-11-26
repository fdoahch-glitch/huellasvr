/// <reference types="vite/client" />
import { ArcRotateCamera, Engine, Scene, Vector3, PointerEventTypes, type Observer, type PointerInfo } from "@babylonjs/core";
import { worlds, type WorldId } from "./domain/worlds";
import { buildWorld } from "./worlds/WorldFactory";
import { loadDinosaur, type DinosaurAnimation, type LoadedDinosaur } from "./dinosaurs/DinosaurManager";
import { setupWorldControls, type WorldControls } from "./controls/WorldControls";
import "./styles.css";

const home = document.querySelector<HTMLElement>("#home")!;
const explorer = document.querySelector<HTMLElement>("#explorer")!;
const list = document.querySelector<HTMLElement>("#world-list")!;
const canvas = document.querySelector<HTMLCanvasElement>("#world-canvas")!;
const title = document.querySelector<HTMLElement>("#world-title")!;
const subtitle = document.querySelector<HTMLElement>("#world-subtitle")!;
const infoTitle = document.querySelector<HTMLElement>("#info-title")!;
const infoCopy = document.querySelector<HTMLElement>("#info-copy")!;
const evidenceTag = document.querySelector<HTMLElement>("#evidence-tag")!;
const status = document.querySelector<HTMLElement>("#render-status")!;
const backButton = document.querySelector<HTMLButtonElement>("#back-button")!;
const resetButton = document.querySelector<HTMLButtonElement>("#reset-camera")!;
const performanceButton = document.querySelector<HTMLButtonElement>("#performance-button")!;
let lastWorldLoadMs: number | null = null;
let performanceMeasuring = false;

let engine: Engine | null = null;
let scene: Scene | null = null;
let activeWorld: WorldId | null = null;
let activeDinosaur: LoadedDinosaur | null = null;
let worldControls: WorldControls | null = null;
let cameraHome: { alpha: number; beta: number; radius: number; target: Vector3 } | null = null;
let worldLoadSequence = 0;
let pointerObserver: Observer<PointerInfo> | null = null;

const evidenceLabels = {
  "direct-evidence": "Evidencia geológica/paleontológica",
  "scientific-interpretation": "Interpretación científica",
  "artistic-reconstruction": "Reconstrucción artística"
};

function renderWorldCards(): void {
  list.innerHTML = "";
  for (const world of worlds) {
    const card = document.createElement("button");
    card.className = "world-card";
    card.type = "button";
    card.style.setProperty("--world-accent", world.palette.accent);
    card.innerHTML = `<span class="card-number">0${worlds.indexOf(world) + 1}</span><span class="card-landscape"></span><span class="card-content"><strong>${world.title}</strong><small>${world.species}</small><span>${world.subtitle}</span></span><span class="card-arrow">↗</span>`;
    card.addEventListener("click", () => void enterWorld(world.id));
    list.append(card);
  }
}

async function ensureEngine(): Promise<void> {
  if (engine) return;
  status.textContent = "Comprobando WebGL2…";
  engine = new Engine(canvas, true, {
    preserveDrawingBuffer: false,
    stencil: true,
    adaptToDeviceRatio: true,
    antialias: true,
    powerPreference: "high-performance"
  });
  if (!(engine as Engine & { webGLVersion?: number }).webGLVersion || (engine as Engine & { webGLVersion?: number }).webGLVersion! < 2) {
    engine.dispose(); engine = null;
    throw new Error("Este navegador no ha creado un contexto WebGL2. Prueba con un navegador actualizado y aceleración gráfica habilitada.");
  }
  engine.setHardwareScalingLevel(Math.min(1.5, Math.max(1, window.devicePixelRatio > 1.5 ? 1.25 : 1)));
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", onVisibility);
}

function resize(): void { engine?.resize(); }
function onVisibility(): void {
  if (!engine) return;
  if (document.hidden) engine.stopRenderLoop();
  else if (scene) engine.runRenderLoop(() => scene?.render());
}

async function enterWorld(id: WorldId): Promise<void> {
  if (performanceMeasuring) return;
  const loadStartedAt = performance.now();
  const requestId = ++worldLoadSequence;
  try {
    status.textContent = "Construyendo paisaje…";
    await ensureEngine();
    if (requestId !== worldLoadSequence) return;
    disposeWorld(false);
    activeWorld = id;
    const worldScene = new Scene(engine!);
    scene = worldScene;
    const built = buildWorld(scene, id);
    // Only the small POI markers need ray-picking; skip terrain and decorative geometry.
    const isLandmark = (mesh: { metadata?: unknown }) => Boolean((mesh.metadata as { poiId?: string } | null)?.poiId);
    scene.pointerDownPredicate = isLandmark;
    scene.pointerUpPredicate = isLandmark;
    scene.skipPointerMovePicking = true;
    const dinosaur = await loadDinosaur(worldScene, id, built.root);
    if (requestId !== worldLoadSequence) {
      dinosaur.dispose();
      return;
    }
    const controls = await setupWorldControls(worldScene, built.camera, canvas, built.root, status);
    if (requestId !== worldLoadSequence) {
      controls.dispose();
      dinosaur.dispose();
      return;
    }
    activeDinosaur = dinosaur;
    worldControls = controls;
    if (import.meta.env.DEV) {
      Object.defineProperty(window, "__HUELLAS_TEST_CAMERA__", {
        configurable: true,
        value: () => { const target = built.camera.getTarget(); return { alpha: built.camera.alpha, beta: built.camera.beta, radius: built.camera.radius, targetX: target.x, targetY: target.y, targetZ: target.z, rigCameraCount: built.camera.rigCameras.length, rigMode: built.camera.cameraRigMode }; }
      });
    }
    cameraHome = { alpha: built.camera.alpha, beta: built.camera.beta, radius: built.camera.radius, target: built.camera.getTarget().clone() };
    const definition = worlds.find((item) => item.id === id)!;
    title.textContent = definition.title;
    subtitle.textContent = `${definition.species} · ${definition.period}`;
    infoTitle.textContent = "Bienvenido a " + definition.title;
    infoCopy.textContent = definition.summary + " PC: WASD/flechas y arrastre con ratón; móvil: controles táctiles y gestos. En un casco sencillo para celular, abre esta página mediante HTTPS, activa Modo casco y acepta el permiso de movimiento para ver una imagen por ojo y mirar moviendo la cabeza. Selecciona un marcador dorado para explorar un hito."
    evidenceTag.textContent = "Paisaje reconstruido a partir de evidencia";
    home.classList.add("hidden"); explorer.classList.remove("hidden");
    engine!.resize();
    setActiveAnimationButton("Idle");
    if (pointerObserver !== null) scene.onPointerObservable.remove(pointerObserver);
    pointerObserver = scene.onPointerObservable.add((pointer) => {
      if (pointer.type !== PointerEventTypes.POINTERPICK || !pointer.pickInfo?.hit) return;
      const metadata = pointer.pickInfo.pickedMesh?.metadata as { poiId?: string; worldId?: string } | undefined;
      if (!metadata?.poiId || metadata.worldId !== activeWorld) return;
      const poi = definition.landmarks.find((item) => item.id === metadata.poiId);
      if (!poi) return;
      infoTitle.textContent = poi.title;
      infoCopy.textContent = poi.description;
      evidenceTag.textContent = evidenceLabels[poi.evidence];
    });
    engine!.runRenderLoop(() => scene?.render());
    lastWorldLoadMs = performance.now() - loadStartedAt;
    status.textContent = `Dinosaurio cargado · ${activeDinosaur.definition.displayName} · animación Idle`;
  } catch (error) {
    // A stale request must never dispose or hide a newer world.
    if (requestId !== worldLoadSequence) return;
    disposeWorld(false);
    home.classList.remove("hidden"); explorer.classList.add("hidden");
    const message = error instanceof Error ? error.message : "No se pudo iniciar el escenario.";
    window.alert(message);
    status.textContent = "No se pudo iniciar";
  }
}

function disposeWorld(invalidatePendingLoads = true): void {
  if (invalidatePendingLoads) worldLoadSequence++;
  if (import.meta.env.DEV) delete (window as Window & { __HUELLAS_TEST_CAMERA__?: () => { alpha: number; beta: number; radius: number; rigCameraCount: number; rigMode: number } }).__HUELLAS_TEST_CAMERA__;
  worldControls?.dispose();
  worldControls = null;
  activeDinosaur?.dispose();
  activeDinosaur = null;
  if (scene) {
    if (pointerObserver !== null) scene.onPointerObservable.remove(pointerObserver);
    pointerObserver = null;
    scene.dispose();
    scene = null;
  }
  if (engine) engine.stopRenderLoop();
  activeWorld = null;
  cameraHome = null;
}

performanceButton.addEventListener("click", async () => {
  if (!engine || !scene || !activeWorld || performanceMeasuring) {
    if (!performanceMeasuring) window.alert("Abre un mundo antes de medir el rendimiento.");
    return;
  }
  const measuredWorld = activeWorld;
  const measuredLoadMs = lastWorldLoadMs;
  const measuredScene = scene;
  const measuredEngine = engine;
  const originalLabel = performanceButton.textContent;
  const backWasDisabled = backButton.disabled;
  const cardboardButton = document.querySelector<HTMLButtonElement>("#cardboard-button");
  const cardboardWasDisabled = cardboardButton?.disabled ?? false;
  const resetWasDisabled = resetButton.disabled;
  const frameTimes: number[] = [];
  const warmupMs = 2000;
  const measurementMs = 10000;
  const startedAt = performance.now();
  let observer: Observer<Scene> | null = null;
  performanceMeasuring = true;
  performanceButton.disabled = true;
  performanceButton.textContent = "Preparando medición…";
  backButton.disabled = true;
  resetButton.disabled = true;
  if (cardboardButton) cardboardButton.disabled = true;
  try {
    performanceButton.textContent = "Estabilizando…";
    observer = measuredScene.onBeforeRenderObservable.add(() => {
      const elapsed = performance.now() - startedAt;
      if (elapsed >= warmupMs && elapsed < warmupMs + measurementMs) {
        const frameMs = measuredEngine.getDeltaTime();
        if (Number.isFinite(frameMs) && frameMs > 0) frameTimes.push(frameMs);
      }
    });
    await new Promise<void>((resolve) => window.setTimeout(resolve, warmupMs + measurementMs));
    const elapsedMs = performance.now() - startedAt;
    const sorted = [...frameTimes].sort((a, b) => a - b);
    const averageFrameMs = frameTimes.length ? frameTimes.reduce((sum, value) => sum + value, 0) / frameTimes.length : null;
    const p95FrameMs = sorted.length ? sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1)] : null;
    const averageFps = averageFrameMs ? 1000 / averageFrameMs : null;
    const p95Fps = p95FrameMs ? 1000 / p95FrameMs : null;
    const memory = (performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
    const gl = measuredEngine.getRenderingCanvas()?.getContext("webgl2") as WebGL2RenderingContext | null;
    const debugInfo = gl?.getExtension("WEBGL_debug_renderer_info");
    const gpu = debugInfo ? gl?.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "No disponible en este navegador";
    const memoryText = memory
      ? `${(memory.usedJSHeapSize / 1048576).toFixed(1)} MB usados / ${(memory.totalJSHeapSize / 1048576).toFixed(1)} MB asignados (heap JS)`
      : "No disponible: el navegador no expone performance.memory";
    const rows: Array<[string, string]> = [
      ["Fecha", new Date().toLocaleString()],
      ["Mundo medido", measuredWorld],
      ["Estabilización previa", `${warmupMs / 1000} s`],
      ["Duración de medición", `${(elapsedMs - warmupMs) / 1000} s`],
      ["FPS promedio calculado por tiempo de frame", averageFps === null ? "No disponible" : averageFps.toFixed(1)],
      ["FPS equivalente al percentil 95 de frame-time", p95Fps === null ? "No disponible" : p95Fps.toFixed(1)],
      ["Frame-time promedio", averageFrameMs === null ? "No disponible" : `${averageFrameMs.toFixed(2)} ms`],
      ["Frame-time p95", p95FrameMs === null ? "No disponible" : `${p95FrameMs.toFixed(2)} ms`],
      ["Frames registrados", String(frameTimes.length)],
      ["Carga del mundo (última entrada)", measuredLoadMs === null ? "No registrada" : `${measuredLoadMs.toFixed(0)} ms`],
      ["Memoria JavaScript", memoryText],
      ["GPU", String(gpu ?? "No disponible en este navegador")],
      ["Navegador", navigator.userAgent],
      ["Plataforma", navigator.platform || "No informada"],
      ["Pantalla", `${window.innerWidth} × ${window.innerHeight} · DPR ${window.devicePixelRatio}`],
      ["WebGL", "WebGL2"],
      ["Métricas no medidas", "CPU, GPU time, VRAM y memoria física del dispositivo no son expuestas de forma fiable por los navegadores web."]
    ];
    const escapeHtml = (value: string) => value.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]!);
    const html = `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Informe de rendimiento HUELLAS VR</title><style>body{font:16px system-ui;max-width:850px;margin:40px auto;padding:0 18px;color:#20352d}h1{color:#17664c}table{width:100%;border-collapse:collapse}td{padding:10px;border-bottom:1px solid #d9e2dc;vertical-align:top}td:first-child{font-weight:700;width:38%}p{line-height:1.5;color:#53665d}</style><h1>HUELLAS VR — Informe de rendimiento</h1><p>Medición local de un solo mundo. Se descartan los primeros dos segundos para estabilización. Los frame-times se capturan desde el ciclo de renderizado de Babylon.js. Los resultados dependen del equipo, navegador, temperatura y carga del sistema.</p><table>${rows.map(([key, value]) => `<tr><td>${escapeHtml(key)}</td><td>${escapeHtml(value)}</td></tr>`).join("")}</table><p>Las métricas no disponibles se identifican expresamente. No se mide CPU, tiempo GPU, VRAM ni memoria física. El informe no se envía a ningún servidor.</p></html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    try {
      const link = document.createElement("a");
      link.href = url;
      link.download = `huellas-vr-rendimiento-${new Date().toISOString().replace(/[:.]/g, "-")}.html`;
      link.click();
    } finally {
      window.setTimeout(() => URL.revokeObjectURL(url), 1500);
    }
    status.textContent = frameTimes.length
      ? `Medición lista · ${averageFps!.toFixed(1)} FPS promedio · ${frameTimes.length} frames`
      : "Informe descargado · no se registraron frames; revisa si la pestaña estuvo en segundo plano";
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    status.textContent = `No se pudo generar el informe: ${message}`;
    window.alert("No se pudo completar la medición de rendimiento. " + message);
  } finally {
    if (observer) measuredScene.onBeforeRenderObservable.remove(observer);
    performanceMeasuring = false;
    performanceButton.disabled = false;
    performanceButton.textContent = originalLabel;
    backButton.disabled = backWasDisabled;
    resetButton.disabled = resetWasDisabled;
    if (cardboardButton) cardboardButton.disabled = cardboardWasDisabled;
  }
});

backButton.addEventListener("click", () => {
  disposeWorld();
  explorer.classList.add("hidden");
  home.classList.remove("hidden");
});
const animationButtons = [...document.querySelectorAll<HTMLButtonElement>("[data-animation]")];
function setActiveAnimationButton(animation: DinosaurAnimation): void {
  for (const button of animationButtons) {
    const active = button.dataset.animation === animation;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  }
}
animationButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const animation = button.dataset.animation as DinosaurAnimation | undefined;
    if (!animation || !activeDinosaur) return;
    if (!activeDinosaur.play(animation)) {
      status.textContent = `Animación ${animation} no disponible`;
      return;
    }
    setActiveAnimationButton(animation);
    status.textContent = `Dinosaurio cargado · ${activeDinosaur.definition.displayName} · animación ${animation}`;
  });
});

resetButton.addEventListener("click", () => {
  const camera = scene?.activeCamera as ArcRotateCamera | null;
  if (camera && cameraHome) {
    camera.alpha = cameraHome.alpha;
    camera.beta = cameraHome.beta;
    camera.radius = cameraHome.radius;
    camera.setTarget(cameraHome.target.clone());
  }
});
window.addEventListener("pagehide", () => {
  disposeWorld();
  engine?.dispose();
  engine = null;
  window.removeEventListener("resize", resize);
  document.removeEventListener("visibilitychange", onVisibility);
});

renderWorldCards();