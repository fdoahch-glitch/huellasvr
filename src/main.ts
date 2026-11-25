import { Engine, Scene, PointerEventTypes } from "@babylonjs/core";
import { worlds, type WorldId } from "./domain/worlds";
import { buildWorld } from "./worlds/WorldFactory";
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

let engine: Engine | null = null;
let scene: Scene | null = null;
let activeWorld: WorldId | null = null;
let cameraHome: { alpha: number; beta: number; radius: number } | null = null;
let pointerObserver: number | null = null;

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
  try {
    status.textContent = "Construyendo paisaje…";
    await ensureEngine();
    disposeWorld();
    activeWorld = id;
    scene = new Scene(engine!);
    const built = buildWorld(scene, id);
    cameraHome = { alpha: built.camera.alpha, beta: built.camera.beta, radius: built.camera.radius };
    const definition = worlds.find((item) => item.id === id)!;
    title.textContent = definition.title;
    subtitle.textContent = `${definition.species} · ${definition.period}`;
    infoTitle.textContent = "Bienvenido a " + definition.title;
    infoCopy.textContent = definition.summary + " Arrastra para mirar alrededor; selecciona un marcador dorado para explorar un hito.";
    evidenceTag.textContent = "Paisaje reconstruido a partir de evidencia";
    home.classList.add("hidden"); explorer.classList.remove("hidden");
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
    status.textContent = "Escenario activo · WebGL2";
  } catch (error) {
    disposeWorld();
    home.classList.remove("hidden"); explorer.classList.add("hidden");
    const message = error instanceof Error ? error.message : "No se pudo iniciar el escenario.";
    window.alert(message);
    status.textContent = "No se pudo iniciar";
  }
}

function disposeWorld(): void {
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

backButton.addEventListener("click", () => {
  disposeWorld();
  explorer.classList.add("hidden");
  home.classList.remove("hidden");
});
resetButton.addEventListener("click", () => {
  const camera = scene?.activeCamera;
  if (camera && cameraHome && "alpha" in camera) {
    camera.alpha = cameraHome.alpha;
    camera.beta = cameraHome.beta;
    camera.radius = cameraHome.radius;
    camera.setTarget(camera.getTarget());
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