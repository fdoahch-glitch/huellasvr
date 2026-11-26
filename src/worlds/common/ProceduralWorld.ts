import {
  ArcRotateCamera, Color3, Color4, DirectionalLight, HemisphericLight, Matrix, Mesh, MeshBuilder,
  Quaternion, Scene, StandardMaterial, TransformNode, Vector3, VertexData
} from "@babylonjs/core";
import type { WorldDefinition } from "../../domain/worlds";

const color = (hex: string) => Color3.FromHexString(hex);
const seeded = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};

function material(scene: Scene, name: string, hex: string, roughness = 1): StandardMaterial {
  const mat = new StandardMaterial(name, scene);
  mat.diffuseColor = color(hex);
  mat.specularColor = new Color3(0.12, 0.12, 0.12);
  mat.specularPower = 32 / roughness;
  return mat;
}

export function terrainHeight(world: WorldDefinition, x: number, z: number): number {
  const basin = Math.sin(x * 0.035) * 2.4 + Math.cos(z * 0.028) * 2.1;
  const ridges = Math.sin((x + z) * 0.022) * Math.cos(z * 0.04) * 3.2;
  const channel = world.terrain === "channel" || world.terrain === "riverplain"
    ? -Math.exp(-Math.pow((x - Math.sin(z * 0.025) * 25) / 18, 2)) * 2.4 : 0;
  const fan = world.terrain === "fan" ? Math.max(0, 9 - Math.abs(z + x * 0.38) * 0.07) * 0.24 : 0;
  const volcanic = world.terrain === "volcanic" ? Math.sin(x * 0.055) * 4 + Math.cos(z * 0.06) * 3 : 0;
  return basin + ridges + channel + fan + volcanic;
}

function makeTerrain(scene: Scene, root: TransformNode, world: WorldDefinition): void {
  const positions: number[] = [], indices: number[] = [], uvs: number[] = [], colors: number[] = [];
  const baseColor = color(world.palette.ground), rockColor = color(world.palette.rock);
  const segments = 100, size = 240;
  for (let z = 0; z <= segments; z++) {
    for (let x = 0; x <= segments; x++) {
      const px = (x / segments - 0.5) * size, pz = (z / segments - 0.5) * size;
      const elevation = terrainHeight(world, px, pz);
      positions.push(px, elevation, pz);
      uvs.push(x / segments * 12, z / segments * 12);
      const noise = (Math.sin(px * 0.11) + Math.cos(pz * 0.13) + Math.sin((px + pz) * 0.07)) / 3;
      const rockBlend = Math.min(0.45, Math.max(0, (elevation + 4) * 0.012 + (noise + 1) * 0.08));
      const shade = Color3.Lerp(baseColor, rockColor, rockBlend).scale(0.92 + noise * 0.12);
      colors.push(Math.min(1, shade.r), Math.min(1, shade.g), Math.min(1, shade.b), 1);
      if (x < segments && z < segments) {
        const a = z * (segments + 1) + x, b = a + segments + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
  }
  const mesh = new Mesh(`${world.id}-terrain`, scene);
  const data = new VertexData();
  data.positions = positions; data.indices = indices; data.uvs = uvs; data.colors = colors;
  const normals: number[] = [];
  VertexData.ComputeNormals(positions, indices, normals);
  data.normals = normals; data.applyToMesh(mesh, true);
  const groundMaterial = material(scene, `${world.id}-ground`, world.palette.ground);
  groundMaterial.diffuseColor = Color3.White();
  groundMaterial.backFaceCulling = false;
  groundMaterial.twoSidedLighting = true;
  mesh.material = groundMaterial;
  mesh.useVertexColors = true;
  mesh.parent = root;
  mesh.isPickable = true;
  mesh.freezeWorldMatrix();
}

type InstanceTransform = { position: Vector3; scaling: Vector3; rotation?: Vector3 };

function flushThinInstances(
  scene: Scene, root: TransformNode, name: string, materialRef: StandardMaterial,
  transforms: InstanceTransform[], geometry: "box" | "sphere" | "cylinder" | "rock"
): Mesh | null {
  if (!transforms.length) return null;
  const mesh = geometry === "box"
    ? MeshBuilder.CreateBox(name, { size: 1 }, scene)
    : geometry === "sphere"
      ? MeshBuilder.CreateSphere(name, { diameter: 1, segments: 7 }, scene)
      : geometry === "cylinder"
        ? MeshBuilder.CreateCylinder(name, { height: 1, diameter: 1, tessellation: 7 }, scene)
        : MeshBuilder.CreatePolyhedron(name, { type: 1, size: 1, flat: true }, scene);
  const matrices = new Float32Array(transforms.length * 16);
  transforms.forEach((item, index) => {
    const rotation = item.rotation ?? Vector3.Zero();
    const matrix = Matrix.Compose(
      item.scaling,
      Quaternion.RotationYawPitchRoll(rotation.y, rotation.x, rotation.z),
      item.position
    );
    matrix.copyToArray(matrices, index * 16);
  });
  mesh.thinInstanceSetBuffer("matrix", matrices, 16, true);
  mesh.thinInstanceRefreshBoundingInfo(true);
  mesh.material = materialRef;
  mesh.parent = root;
  mesh.isPickable = false;
  mesh.freezeWorldMatrix();
  return mesh;
}

function addRock(transforms: InstanceTransform[], x: number, y: number, z: number, scale: number, seed: number): void {
  transforms.push({
    position: new Vector3(x, y + scale * 0.36, z),
    scaling: new Vector3(scale * (1.1 + (seed % 3) * 0.12), scale * (0.65 + (seed % 4) * 0.12), scale * 0.9),
    rotation: new Vector3(0, seed * 0.73, 0)
  });
}

function addTree(transforms: { foliage: InstanceTransform[]; trunks: InstanceTransform[]; fronds: InstanceTransform[] }, x: number, z: number, groundY: number, scale: number, type: string): void {
  if (type === "sparse" || type === "low") {
    const clusters = type === "sparse" ? 3 : 5;
    for (let j = 0; j < clusters; j++) {
      const angle = j / clusters * Math.PI * 2;
      const diameter = scale * (type === "sparse" ? 0.52 : 0.42);
      transforms.foliage.push({
        position: new Vector3(x + Math.cos(angle) * scale * 0.22, groundY + scale * 0.28, z + Math.sin(angle) * scale * 0.22),
        scaling: new Vector3(diameter, diameter * 0.58, diameter)
      });
    }
    return;
  }

  const trunkHeight = scale * (type === "ferns" ? 0.32 : 2.1);
  transforms.trunks.push({
    position: new Vector3(x, groundY + trunkHeight * 0.5, z),
    scaling: new Vector3(scale * 0.2, trunkHeight, scale * 0.2)
  });

  if (type === "ferns") {
    for (let j = 0; j < 7; j++) {
      const angle = j / 7 * Math.PI * 2;
      const reach = scale * (0.78 + (j % 3) * 0.08);
      transforms.fronds.push({
        position: new Vector3(x + Math.cos(angle) * reach * 0.3, groundY + scale * 0.52, z + Math.sin(angle) * reach * 0.3),
        scaling: new Vector3(scale * 0.12, reach, scale * 0.12),
        rotation: new Vector3(Math.sin(angle) * 0.82, 0, Math.cos(angle) * 0.82)
      });
    }
    return;
  }

  const canopyCount = type === "riparian" ? 5 : 4;
  for (let j = 0; j < canopyCount; j++) {
    const angle = j / canopyCount * Math.PI * 2;
    const diameter = scale * (j === 0 ? 1.12 : 0.92);
    transforms.foliage.push({
      position: new Vector3(x + Math.cos(angle) * scale * 0.36, groundY + scale * (1.55 + (j % 2) * 0.18), z + Math.sin(angle) * scale * 0.36),
      scaling: new Vector3(diameter, diameter * 0.82, diameter)
    });
  }
}

function addStrata(world: WorldDefinition, batches: { rock: InstanceTransform[]; accent: InstanceTransform[] }): void {
  const rand = seeded(world.id.length * 191);
  for (let i = 0; i < 17; i++) {
    const side = i % 2 ? 1 : -1;
    const x = side * (57 + rand() * 30), z = -82 + rand() * 155;
    const h = 9 + rand() * 24, w = 13 + rand() * 18, d = 12 + rand() * 25;
    const groundY = terrainHeight(world, x, z);
    const target = i % 4 === 0 ? batches.accent : batches.rock;
    target.push({ position: new Vector3(x, groundY + h / 2, z), scaling: new Vector3(w, h, d), rotation: new Vector3(0, (rand() - 0.5) * 0.22, 0) });
    for (let band = 0; band < 2; band++) {
      (band ? batches.accent : batches.rock).push({
        position: new Vector3(x, groundY + h * (0.28 + band * 0.32), z),
        scaling: new Vector3(w * 1.04, 0.7, d * 1.04)
      });
    }
  }
}

function createWaterSurface(scene: Scene, root: TransformNode, name: string, positions: number[], indices: number[], waterMat: StandardMaterial): void {
  const mesh = new Mesh(name, scene);
  const data = new VertexData();
  data.positions = positions;
  data.indices = indices;
  const normals: number[] = [];
  VertexData.ComputeNormals(positions, indices, normals);
  data.normals = normals;
  data.applyToMesh(mesh, true);
  waterMat.backFaceCulling = false;
  waterMat.twoSidedLighting = true;
  mesh.material = waterMat;
  mesh.parent = root;
  mesh.isPickable = false;
}

function addPond(scene: Scene, root: TransformNode, world: WorldDefinition, waterMat: StandardMaterial, centerX: number, centerZ: number, radiusX: number, radiusZ: number): void {
  const positions: number[] = [], indices: number[] = [];
  const segments = 48, rings = 7;
  positions.push(centerX, terrainHeight(world, centerX, centerZ) + 0.28, centerZ);
  for (let ring = 1; ring <= rings; ring++) {
    const radius = ring / rings;
    for (let segment = 0; segment < segments; segment++) {
      const angle = segment / segments * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radiusX * radius;
      const z = centerZ + Math.sin(angle) * radiusZ * radius;
      positions.push(x, terrainHeight(world, x, z) + 0.28, z);
    }
  }
  for (let segment = 0; segment < segments; segment++) {
    indices.push(0, 1 + segment, 1 + (segment + 1) % segments);
  }
  for (let ring = 0; ring < rings - 1; ring++) {
    const inner = 1 + ring * segments, outer = inner + segments;
    for (let segment = 0; segment < segments; segment++) {
      const next = (segment + 1) % segments;
      indices.push(inner + segment, outer + segment, inner + next);
      indices.push(inner + next, outer + segment, outer + next);
    }
  }
  createWaterSurface(scene, root, `water-pond-${world.id}`, positions, indices, waterMat);
}

function addRiver(scene: Scene, root: TransformNode, world: WorldDefinition, waterMat: StandardMaterial): void {
  const left: Vector3[] = [], right: Vector3[] = [];
  const steps = 96;
  for (let i = 0; i <= steps; i++) {
    const z = -112 + i * 2.35;
    const centerX = Math.sin(z * 0.025) * 25 + Math.sin(z * 0.061) * 4;
    const halfWidth = 6.5 + (Math.sin(i * 0.17) + 1) * 1.6;
    const leftX = centerX - halfWidth, rightX = centerX + halfWidth;
    left.push(new Vector3(leftX, terrainHeight(world, leftX, z) + 0.3, z));
    right.push(new Vector3(rightX, terrainHeight(world, rightX, z) + 0.3, z));
  }
  const river = MeshBuilder.CreateRibbon(`water-river-${world.id}`, {
    pathArray: [left, right],
    closeArray: false,
    closePath: false,
    sideOrientation: Mesh.DOUBLESIDE
  }, scene);
  waterMat.backFaceCulling = false;
  waterMat.twoSidedLighting = true;
  river.material = waterMat;
  river.parent = root;
  river.isPickable = false;
}

function addWater(scene: Scene, root: TransformNode, world: WorldDefinition, waterMat: StandardMaterial): void {
  if (world.water === "none") return;
  if (world.water === "meandering") {
    addRiver(scene, root, world, waterMat);
    return;
  }
  const centerX = world.id === "tolar" ? 0 : 16;
  const centerZ = 42;
  const radiusX = world.water === "seasonal" ? 13.5 : 19;
  const radiusZ = world.water === "seasonal" ? 9 : 14;
  addPond(scene, root, world, waterMat, centerX, centerZ, radiusX, radiusZ);
}

function addLandmark(scene: Scene, root: TransformNode, world: WorldDefinition, index: number, poi: WorldDefinition["landmarks"][number], markerMat: StandardMaterial): Mesh {
  const marker = MeshBuilder.CreateCylinder(`poi-${poi.id}`, { height: 2.2, diameterTop: 0.2, diameterBottom: 0.9, tessellation: 12 }, scene);
  const groundY = terrainHeight(world, poi.position[0], poi.position[2]);
  marker.position.set(poi.position[0], groundY + poi.position[1] + 1.1, poi.position[2]);
  marker.material = markerMat; marker.parent = root; marker.metadata = { poiId: poi.id, worldId: world.id, poiIndex: index };
  const orb = MeshBuilder.CreateSphere(`poi-orb-${poi.id}`, { diameter: 1.05, segments: 12 }, scene);
  orb.position.set(poi.position[0], groundY + poi.position[1] + 2.6, poi.position[2]); orb.material = markerMat; orb.parent = root;
  orb.metadata = marker.metadata;
  return marker;
}

export interface BuiltWorld { scene: Scene; camera: import("@babylonjs/core").ArcRotateCamera; root: TransformNode; }

export function buildProceduralWorld(scene: Scene, world: WorldDefinition): BuiltWorld {
  const skyColor = color(world.palette.sky);
  scene.clearColor = new Color4(skyColor.r, skyColor.g, skyColor.b, 1);
  scene.ambientColor = new Color3(0.25, 0.25, 0.25);
  const root = new TransformNode(`world-root-${world.id}`, scene);
  const hemi = new HemisphericLight(`hemi-${world.id}`, new Vector3(0, 1, 0), scene);
  hemi.intensity = 0.86; hemi.groundColor = new Color3(0.38, 0.34, 0.3);
  const sun = new DirectionalLight(`sun-${world.id}`, new Vector3(-0.45, -1, 0.32), scene);
  sun.position = new Vector3(40, 80, -30); sun.intensity = 1.15;
  const rockMat = material(scene, `rock-${world.id}`, world.palette.rock);
  const accentMat = material(scene, `accent-${world.id}`, world.palette.accent);
  const trunkMat = material(scene, `trunk-${world.id}`, "#554538");
  const leafMat = material(scene, `leaf-${world.id}`, world.palette.vegetation);
  const waterMat = material(scene, `water-${world.id}`, world.palette.water ?? "#568b91", 0.45);
  waterMat.alpha = 0.88;
  const markerMat = material(scene, `marker-${world.id}`, "#f4d35e", 0.5);
  makeTerrain(scene, root, world);
  const strataBatches: { rock: InstanceTransform[]; accent: InstanceTransform[] } = { rock: [], accent: [] };
  addStrata(world, strataBatches);
  flushThinInstances(scene, root, `strata-rock-${world.id}`, rockMat, strataBatches.rock, "box");
  flushThinInstances(scene, root, `strata-accent-${world.id}`, accentMat, strataBatches.accent, "box");
  addWater(scene, root, world, waterMat);

  const rand = seeded(world.id.length * 733);
  const vegetationBatches = { foliage: [] as InstanceTransform[], trunks: [] as InstanceTransform[], fronds: [] as InstanceTransform[] };
  const rockInstances: InstanceTransform[] = [];
  const vegetationCount = world.vegetation === "sparse" ? 22 : world.vegetation === "low" ? 30 : 54;
  for (let i = 0; i < vegetationCount; i++) {
    const x = (rand() - 0.5) * 190, z = (rand() - 0.5) * 180;
    if (Math.abs(x) < 20 && z > -15 && z < 18) continue;
    const scale = 2.2 + rand() * (world.vegetation === "sparse" ? 2.5 : 4.2);
    addTree(vegetationBatches, x, z, terrainHeight(world, x, z), scale, world.vegetation);
  }
  for (let i = 0; i < 78; i++) {
    const x = (rand() - 0.5) * 200, z = (rand() - 0.5) * 190;
    if (Math.abs(x) < 17 && z > -18 && z < 18) continue;
    addRock(rockInstances, x, terrainHeight(world, x, z), z, 1.1 + rand() * 3.4, i);
  }
  flushThinInstances(scene, root, `foliage-${world.id}`, leafMat, vegetationBatches.foliage, "sphere");
  flushThinInstances(scene, root, `trunks-${world.id}`, trunkMat, vegetationBatches.trunks, "cylinder");
  flushThinInstances(scene, root, `fern-fronds-${world.id}`, leafMat, vegetationBatches.fronds, "cylinder");
  flushThinInstances(scene, root, `rocks-${world.id}`, rockMat, rockInstances, "rock");
  world.landmarks.forEach((poi, i) => addLandmark(scene, root, world, i, poi, markerMat));

  const camera = new ArcRotateCamera(`camera-${world.id}`, -Math.PI / 2, 1.08, 60, new Vector3(0, 3, 0), scene);
  camera.lowerRadiusLimit = 24; camera.upperRadiusLimit = 170;
  camera.lowerBetaLimit = 0.28; camera.upperBetaLimit = Math.PI / 2.05;
  camera.wheelDeltaPercentage = 0.012; camera.panningSensibility = 65;
  return { scene, camera, root };
}
