import type { Scene } from "@babylonjs/core";
import type { WorldId } from "../domain/worlds";
import type { BuiltWorld } from "./common/ProceduralWorld";
import { buildTolar } from "./tolar";
import { buildHornitos } from "./hornitos";
import { buildToqui } from "./toqui";
import { buildGonkoken } from "./gonkoken";
import { buildStegouros } from "./stegouros";

export function buildWorld(scene: Scene, id: WorldId): BuiltWorld {
  switch (id) {
    case "tolar": return buildTolar(scene);
    case "hornitos": return buildHornitos(scene);
    case "toqui": return buildToqui(scene);
    case "dorotea-superior": return buildGonkoken(scene);
    case "dorotea-inferior": return buildStegouros(scene);
  }
}