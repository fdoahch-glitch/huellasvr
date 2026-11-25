import type { Scene } from "@babylonjs/core";
import { getWorld } from "../../domain/worlds";
import { buildProceduralWorld, type BuiltWorld } from "../common/ProceduralWorld";
export const buildToqui = (scene: Scene): BuiltWorld => buildProceduralWorld(scene, getWorld("toqui"));