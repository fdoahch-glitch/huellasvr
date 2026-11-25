import type { Scene } from "@babylonjs/core";
import { getWorld } from "../../domain/worlds";
import { buildProceduralWorld, type BuiltWorld } from "../common/ProceduralWorld";
export const buildStegouros = (scene: Scene): BuiltWorld => buildProceduralWorld(scene, getWorld("dorotea-inferior"));