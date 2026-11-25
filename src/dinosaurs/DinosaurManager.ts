import {
  AnimationGroup,
  AbstractMesh,
  Scene,
  SceneLoader,
  TransformNode,
  Vector3
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { getWorld, type WorldId } from "../domain/worlds";
import { terrainHeight } from "../worlds/common/ProceduralWorld";

export type DinosaurAnimation = "Idle" | "Walk" | "Run" | "Neck_Look";

export interface DinosaurDefinition {
  id: WorldId;
  species: string;
  displayName: string;
  file: string;
  targetLength: number;
  yaw: number;
}

export interface LoadedDinosaur {
  root: TransformNode;
  definition: DinosaurDefinition;
  animationGroups: AnimationGroup[];
  play: (animation: DinosaurAnimation) => boolean;
  dispose: () => void;
}

export const dinosaurs: Record<WorldId, DinosaurDefinition> = {
  tolar: {
    id: "tolar",
    species: "Atacamatitan chilensis",
    displayName: "Atacamatitan",
    file: "atacamatitan.glb",
    targetLength: 13,
    yaw: 0
  },
  hornitos: {
    id: "hornitos",
    species: "Arackar licanantay",
    displayName: "Arackar",
    file: "arackar.glb",
    targetLength: 13,
    yaw: Math.PI / 2
  },
  toqui: {
    id: "toqui",
    species: "Chilesaurus diegosuarezi",
    displayName: "Chilesaurio",
    file: "chilesaurus.glb",
    targetLength: 11,
    yaw: 0
  },
  "dorotea-superior": {
    id: "dorotea-superior",
    species: "Gonkoken nanoi",
    displayName: "Gonkoken",
    file: "gonkoken.glb",
    targetLength: 13,
    yaw: 0
  },
  "dorotea-inferior": {
    id: "dorotea-inferior",
    species: "Stegouros elengassen",
    displayName: "Stegouros",
    file: "stegouros.glb",
    targetLength: 10,
    yaw: 0
  }
};

function boundsOf(meshes: AbstractMesh[]): { min: Vector3; max: Vector3 } {
  const min = new Vector3(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
  const max = new Vector3(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
  let count = 0;
  for (const mesh of meshes) {
    if (mesh.getTotalVertices() === 0) continue;
    mesh.computeWorldMatrix(true);
    const box = mesh.getBoundingInfo().boundingBox;
    min.minimizeInPlace(box.minimumWorld);
    max.maximizeInPlace(box.maximumWorld);
    count++;
  }
  if (!count || !Number.isFinite(min.x) || !Number.isFinite(max.x)) {
    throw new Error("El GLB no contiene geometría visible.");
  }
  return { min, max };
}

export async function loadDinosaur(
  scene: Scene,
  worldId: WorldId,
  worldRoot: TransformNode
): Promise<LoadedDinosaur> {
  const definition = dinosaurs[worldId];
  const world = getWorld(worldId);
  const result = await SceneLoader.ImportMeshAsync(null, "/models/", definition.file, scene);
  const root = new TransformNode(`dinosaur-${worldId}`, scene);
  root.parent = worldRoot;
  root.rotation.y = definition.yaw;

  const topLevel = result.meshes.filter((mesh) => mesh.parent === null);
  for (const mesh of topLevel) mesh.parent = root;

  const allMeshes = root.getChildMeshes(false);
  if (!allMeshes.length) {
    result.animationGroups.forEach((group) => group.dispose());
    root.dispose(false, true);
    throw new Error(`El modelo ${definition.displayName} no contiene mallas.`);
  }

  root.computeWorldMatrix(true);
  let bounds = boundsOf(allMeshes);
  const size = bounds.max.subtract(bounds.min);
  const longestSide = Math.max(size.x, size.y, size.z);
  if (!Number.isFinite(longestSide) || longestSide <= 0) {
    root.dispose(false, true);
    throw new Error(`No se pudo calcular el tamaño de ${definition.displayName}.`);
  }

  root.scaling.setAll(definition.targetLength / longestSide);
  root.computeWorldMatrix(true);
  bounds = boundsOf(allMeshes);
  const ground = terrainHeight(world, 0, 0);
  root.position.x -= (bounds.min.x + bounds.max.x) / 2;
  root.position.z -= (bounds.min.z + bounds.max.z) / 2;
  root.position.y += ground - bounds.min.y;
  root.computeWorldMatrix(true);

  const groups = result.animationGroups;
  const requiredAnimations: DinosaurAnimation[] = ["Idle", "Walk", "Run", "Neck_Look"];
  const availableNames = new Set(groups.map((group) => group.name.toLowerCase()));
  const missingAnimations = requiredAnimations.filter((name) => !availableNames.has(name.toLowerCase()));
  if (missingAnimations.length) {
    for (const group of groups) group.dispose();
    root.dispose(false, true);
    throw new Error(`${definition.displayName}: faltan animaciones ${missingAnimations.join(", ")}.`);
  }
  const byName = new Map(groups.map((group) => [group.name.toLowerCase(), group]));
  const play = (animation: DinosaurAnimation): boolean => {
    const selected = byName.get(animation.toLowerCase());
    if (!selected) return false;
    for (const group of groups) group.stop();
    selected.start(true, 1);
    return true;
  };

  if (!play("Idle")) {
    if (groups.length) {
      for (const group of groups) group.stop();
      groups[0].start(true, 1);
    }
  }

  return {
    root,
    definition,
    animationGroups: groups,
    play,
    dispose: () => {
      for (const group of groups) group.stop();
      root.dispose(false, true);
      for (const group of groups) group.dispose();
    }
  };
}
