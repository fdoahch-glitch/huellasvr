import {
  ArcRotateCamera, Color3, Color4, DirectionalLight, HemisphericLight, Mesh, MeshBuilder,
  Scene, StandardMaterial, TransformNode, Vector3, VertexData
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

function makeTerrain(scene: Scene, root: TransformNode, world: WorldDefinition, seed: number): void {
  const rand = seeded(seed);
  const positions: number[] = [], indices: number[] = [], uvs: number[] = [];
  const segments = 100, size = 240;
  const heightAt = (x: number, z: number) => {
    const basin = Math.sin(x * 0.035) * 2.4 + Math.cos(z * 0.028) * 2.1;
    const ridges = Math.sin((x + z) * 0.022) * Math.cos(z * 0.04) * 3.2;
    const channel = world.terrain === "channel" || world.terrain === "riverplain"
      ? -Math.exp(-Math.pow((x - Math.sin(z * 0.025) * 25) / 18, 2)) * 2.4 : 0;
    const fan = world.terrain === "fan" ? Math.max(0, 9 - Math.abs(z + x * 0.38) * 0.07) * 0.24 : 0;
    const volcanic = world.terrain === "volcanic" ? Math.sin(x * 0.055) * 4 + Math.cos(z * 0.06) * 3 : 0;
    return basin + ridges + channel + fan + volcanic + (rand() - 0.5) * 0.45;
  };
  for (let z = 0; z <= segments; z++) {
    for (let x = 0; x <= segments; x++) {
      const px = (x / segments - 0.5) * size, pz = (z / segments - 0.5) * size;
      positions.push(px, heightAt(px, pz), pz);
      uvs.push(x / segments * 12, z / segments * 12);
      if (x < segments && z < segments) {
        const a = z * (segments + 1) + x, b = a + segments + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
  }
  const mesh = new Mesh(`${world.id}-terrain`, scene);
  const data = new VertexData();
  data.positions = positions; data.indices = indices; data.uvs = uvs;
  const normals: number[] = [];
  VertexData.ComputeNormals(positions, indices, normals);
  data.normals = normals; data.applyToMesh(mesh, true);
  mesh.material = material(scene, `${world.id}-ground`, world.palette.ground);
  mesh.parent = root;
  mesh.isPickable = false;
}

function addRock(scene: Scene, root: TransformNode, mat: StandardMaterial, x: number, y: number, z: number, scale: number, seed: number): Mesh {
  const rock = MeshBuilder.CreatePolyhedron(`rock-${seed}`, { type: 1, size: scale, flat: true }, scene);
  rock.position.set(x, y + scale * 0.36, z);
  rock.scaling.set(1.1 + (seed % 3) * 0.12, 0.65 + (seed % 4) * 0.12, 0.9);
  rock.rotation.y = seed * 0.73;
  rock.material = mat; rock.parent = root; rock.isPickable = false;
  return rock;
}

function addTree(scene: Scene, root: TransformNode, trunkMat: StandardMaterial, leafMat: StandardMaterial, x: number, z: number, scale: number, type: string, i: number): void {
  const trunk = MeshBuilder.CreateCylinder(`trunk-${i}`, { height: scale * 2.1, diameterTop: scale * 0.12, diameterBottom: scale * 0.28, tessellation: 7 }, scene);
  trunk.position.set(x, scale * 1.05, z); trunk.material = trunkMat; trunk.parent = root; trunk.isPickable = false;
  if (type === "sparse" || type === "mixed") {
    for (let tier = 0; tier < 3; tier++) {
      const crown = MeshBuilder.CreateCylinder(`crown-${i}-${tier}`, { height: scale * 1.0, diameterTop: 0, diameterBottom: scale * (1.5 - tier * 0.28), tessellation: 7 }, scene);
      crown.position.set(x, scale * (1.1 + tier * 0.52), z);
      crown.material = leafMat; crown.parent = root; crown.isPickable = false;
    }
  } else if (type === "ferns") {
    for (let j = 0; j < 5; j++) {
      const frond = MeshBuilder.CreateCylinder(`frond-${i}-${j}`, { height: scale * 0.95, diameterTop: scale * 0.025, diameterBottom: scale * 0.12, tessellation: 5 }, scene);
      frond.position.set(x + Math.cos(j * 1.256) * scale * 0.25, scale * 0.5, z + Math.sin(j * 1.256) * scale * 0.25);
      frond.rotation.z = Math.PI / 3; frond.rotation.y = j * 1.256;
      frond.material = leafMat; frond.parent = root; frond.isPickable = false;
    }
  } else {
    const crown = MeshBuilder.CreateSphere(`crown-${i}`, { diameter: scale * 1.55, segments: 6 }, scene);
    crown.position.set(x, scale * 1.8, z); crown.scaling.y = 0.75;
    crown.material = leafMat; crown.parent = root; crown.isPickable = false;
  }
}

function addStrata(scene: Scene, root: TransformNode, rockMat: StandardMaterial, accentMat: StandardMaterial, world: WorldDefinition): void {
  const rand = seeded(world.id.length * 191);
  for (let i = 0; i < 17; i++) {
    const side = i % 2 ? 1 : -1;
    const x = side * (57 + rand() * 30), z = -82 + rand() * 155;
    const h = 9 + rand() * 24, w = 13 + rand() * 18, d = 12 + rand() * 25;
    const mesa = MeshBuilder.CreateBox(`outcrop-${world.id}-${i}`, { width: w, height: h, depth: d }, scene);
    mesa.position.set(x, h / 2 - 1, z); mesa.rotation.y = (rand() - 0.5) * 0.22;
    mesa.material = i % 4 === 0 ? accentMat : rockMat; mesa.parent = root; mesa.isPickable = false;
    for (let band = 0; band < 2; band++) {
      const ledge = MeshBuilder.CreateBox(`stratum-${world.id}-${i}-${band}`, { width: w * 1.04, height: 0.7, depth: d * 1.04 }, scene);
      ledge.position.set(x, h * (0.28 + band * 0.32), z); ledge.material = band ? accentMat : rockMat;
      ledge.parent = root; ledge.isPickable = false;
    }
  }
}

function addWater(scene: Scene, root: TransformNode, world: WorldDefinition, waterMat: StandardMaterial): void {
  if (world.water === "none") return;
  if (world.water === "meandering") {
    for (let i = 0; i < 5; i++) {
      const segment = MeshBuilder.CreateGround(`water-${world.id}-${i}`, { width: 15 + i * 1.5, height: 42, subdivisions: 2 }, scene);
      segment.position.set(Math.sin(i * 0.8) * 18, -0.4, -72 + i * 34);
      segment.rotation.y = Math.cos(i * 0.8) * 0.16;
      segment.material = waterMat; segment.parent = root; segment.isPickable = false;
    }
  } else {
    const water = MeshBuilder.CreateGround(`water-${world.id}`, { width: world.water === "seasonal" ? 27 : 38, height: world.water === "seasonal" ? 18 : 28, subdivisions: 2 }, scene);
    water.position.set(world.id === "tolar" ? 0 : 16, -0.45, 42); water.material = waterMat; water.parent = root; water.isPickable = false;
  }
}

function addLandmark(scene: Scene, root: TransformNode, world: WorldDefinition, index: number, poi: WorldDefinition["landmarks"][number], markerMat: StandardMaterial): Mesh {
  const marker = MeshBuilder.CreateCylinder(`poi-${poi.id}`, { height: 2.2, diameterTop: 0.2, diameterBottom: 0.9, tessellation: 12 }, scene);
  marker.position.set(poi.position[0], poi.position[1] + 1.1, poi.position[2]);
  marker.material = markerMat; marker.parent = root; marker.metadata = { poiId: poi.id, worldId: world.id, poiIndex: index };
  const orb = MeshBuilder.CreateSphere(`poi-orb-${poi.id}`, { diameter: 1.05, segments: 12 }, scene);
  orb.position.set(poi.position[0], poi.position[1] + 2.6, poi.position[2]); orb.material = markerMat; orb.parent = root;
  orb.metadata = marker.metadata;
  return marker;
}

export interface BuiltWorld { scene: Scene; camera: import("@babylonjs/core").ArcRotateCamera; root: TransformNode; }

export function buildProceduralWorld(scene: Scene, world: WorldDefinition): BuiltWorld {
  scene.clearColor = new Color4(...color(world.palette.sky).asArray(), 1);
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
  makeTerrain(scene, root, world, world.id.length * 827 + world.id.charCodeAt(0));
  addStrata(scene, root, rockMat, accentMat, world);
  addWater(scene, root, world, waterMat);

  const rand = seeded(world.id.length * 733);
  const vegetationCount = world.vegetation === "sparse" ? 22 : world.vegetation === "low" ? 30 : 54;
  for (let i = 0; i < vegetationCount; i++) {
    const x = (rand() - 0.5) * 190, z = (rand() - 0.5) * 180;
    if (Math.abs(x) < 20 && z > -15 && z < 18) continue;
    const scale = 2.2 + rand() * (world.vegetation === "sparse" ? 2.5 : 4.2);
    addTree(scene, root, trunkMat, leafMat, x, z, scale, world.vegetation, i);
  }
  for (let i = 0; i < 78; i++) {
    const x = (rand() - 0.5) * 200, z = (rand() - 0.5) * 190;
    if (Math.abs(x) < 17 && z > -18 && z < 18) continue;
    addRock(scene, root, rockMat, x, 0, z, 1.1 + rand() * 3.4, i);
  }
  world.landmarks.forEach((poi, i) => addLandmark(scene, root, world, i, poi, markerMat));

  const camera = new ArcRotateCamera(`camera-${world.id}`, -Math.PI / 2, 1.08, 105, new Vector3(0, 3, 0), scene);
  camera.lowerRadiusLimit = 24; camera.upperRadiusLimit = 170;
  camera.lowerBetaLimit = 0.28; camera.upperBetaLimit = Math.PI / 2.05;
  camera.wheelDeltaPercentage = 0.012; camera.panningSensibility = 65;
  camera.attachControl(true);
  return { scene, camera, root };
}

function requireArcCamera(): typeof import("@babylonjs/core").ArcRotateCamera {
  return (globalThis as unknown as { __ArcRotateCamera?: typeof import("@babylonjs/core").ArcRotateCamera }).__ArcRotateCamera
    ?? (class extends (Object as unknown as typeof import("@babylonjs/core").ArcRotateCamera) {} as never);
}