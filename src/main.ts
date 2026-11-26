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
  const loadStartedAt = performance.now();
  const requestId = ++worldLoadSequence;
  try {
    status.textContent = "Construyendo paisaje…";
    await ensureEngine();
    if (requestId !== worldLoadSequence) return;
    disposeWorld();
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
    disposeWorld();
    home.classList.remove("hidden"); explorer.classList.add("hidden");
    const message = error instanceof Error ? error.message : "No se pudo iniciar el escenario.";
    window.alert(message);
    status.textContent = "No se pudo iniciar";
  }
}

function disposeWorld(): void {
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
  if (!engine || !scene || !activeWorld) {
    window.alert("Abre un mundo antes de medir el rendimiento.");
    return;
  }
  performanceButton.disabled = true;
  const originalLabel = performanceButton.textContent;
  performanceButton.textContent = "Midiendo…";
  const samples: number[] = [];
  const startedAt = performance.now();
  const sample = () => {
    if (!engine || !scene) return;
    samples.push(engine.getFps());
  };
  sample();
  await new Promise<void>((resolve) => {
    const interval = window.setInterval(sample, 250);
    window.setTimeout(() => {
      window.clearInterval(interval);
      resolve();
    }, 10000);
  });
  const elapsedMs = performance.now() - startedAt;
  const sorted = [...samples].sort((a, b) => a - b);
  const averageFps = samples.length ? samples.reduce((sum, value) => sum + value, 0) / samples.length : 0;
  const minimumFps = samples.length ? Math.min(...samples) : 0;
  const lowPercentileFps = sorted.length ? sorted[Math.floor((sorted.length - 1) * 0.05)] : 0;
  const memory = (performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
  const gl = (engine as Engine & { _gl?: WebGL2RenderingContext })._gl;
  const debugInfo = gl?.getExtension("WEBGL_debug_renderer_info");
  const gpu = debugInfo ? gl?.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "No disponible";
  const memoryText = memory
    ? `${(memory.usedJSHeapSize / 1048576).toFixed(1)} MB usados / ${(memory.totalJSHeapSize / 1048576).toFixed(1)} MB asignados`
    : "El navegador no expone métricas de memoria JavaScript";
  const rows = [
    ["Fecha", new Date().toLocaleString()],
    ["Mundo", activeWorld ?? "No disponible"],
    ["Duración de medición", `${(elapsedMs / 1000).toFixed(1)} s`],
    ["FPS promedio", averageFps.toFixed(1)],
    ["FPS mínimo muestreado", minimumFps.toFixed(1)],
    ["FPS percentil bajo (5 %)", lowPercentileFps.toFixed(1)],
    ["Muestras", String(samples.length)],
    ["Carga del último mundo", lastWorldLoadMs === null ? "No registrada" : `${lastWorldLoadMs.toFixed(0)} ms`],
    ["Memoria JavaScript", memoryText],
    ["GPU", String(gpu ?? "No disponible")],
    ["Navegador", navigator.userAgent],
    ["Plataforma", navigator.platform],
    ["Pantalla", `${window.innerWidth} × ${window.innerHeight} · DPR ${window.devicePixelRatio}`],
    ["WebGL", "WebGL2"]
  ];
  const html = `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Informe de rendimiento HUELLAS VR</title><style>body{font:16px system-ui;max-width:850px;margin:40px auto;padding:0 18px;color:#20352d}h1{color:#17664c}table{width:100%;border-collapse:collapse}td{padding:10px;border-bottom:1px solid #d9e2dc;vertical-align:top}td:first-child{font-weight:700;width:38%}p{line-height:1.5;color:#53665d}</style><h1>HUELLAS VR — Informe de rendimiento</h1><p>Medición local realizada en este dispositivo mientras el mundo permaneció abierto. Los resultados dependen del equipo, navegador, temperatura y carga del sistema.</p><table>${rows.map(([key, value]) => `<tr><td>${key}</td><td>${String(value).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]!)}</td></tr>`).join("")}</table><p>Nota: los FPS se muestrean cada 250 ms; la memoria solo se informa si el navegador la expone. Este informe no se envía a ningún servidor.</p></html>`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `huellas-vr-rendimiento-${new Date().toISOString().replace(/[:.]/g, "-")}.html`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  performanceButton.disabled = false;
  performanceButton.textContent = originalLabel;
  status.textContent = `Medición lista · ${averageFps.toFixed(1)} FPS promedio`;
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