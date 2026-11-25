import type { Scene } from "@babylonjs/core";
import { getWorld } from "../../domain/worlds";
import { buildProceduralWorld, type BuiltWorld } from "../common/ProceduralWorld";
export const buildTolar = (scene: Scene): BuiltWorld => buildProceduralWorld(scene, getWorld("tolar"));