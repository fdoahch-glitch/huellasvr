import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../src/domain/worlds.ts", import.meta.url), "utf8");

test("declara exactamente los cinco mundos acordados", () => {
  const worldIds = ["tolar", "hornitos", "toqui", "dorotea-superior", "dorotea-inferior"];
  for (const id of worldIds) assert.ok(source.includes('id: "' + id + '"'), "Falta el mundo " + id);
});

test("mantiene los cinco dinosaurios chilenos vinculados a su mundo", () => {
  for (const name of ["Atacamatitan chilensis", "Arackar licanantay", "Chilesaurus diegosuarezi", "Gonkoken nanoi", "Stegouros elengassen"]) {
    assert.ok(source.includes(name), "Falta la especie " + name);
  }
});

test("los puntos de interés incluyen nivel de evidencia", () => {
  assert.match(source, /evidence: "direct-evidence"/);
  assert.match(source, /evidence: "scientific-interpretation"/);
  assert.match(source, /evidence: "artistic-reconstruction"/);
});

test("cada mundo tiene identidad, paleta y puntos de interés válidos", () => {
  const worldSource = source.slice(source.indexOf("export const worlds"));
  const paletteMatches = [...worldSource.matchAll(/palette: \{[^}]+\}/g)];
  assert.equal(paletteMatches.length, 5, "Cada mundo debe declarar una paleta propia");

  const poiIds = [...worldSource.matchAll(/\{ id: "([^"]+)", title:/g)].map((match) => match[1]);
  assert.ok(poiIds.length >= 20, "Deben existir al menos cuatro hitos por mundo");
  assert.equal(new Set(poiIds).size, poiIds.length, "Los identificadores de hitos deben ser únicos");
  assert.equal([...worldSource.matchAll(/position: \[(-?[0-9.]+), (-?[0-9.]+), (-?[0-9.]+)\]/g)].length, poiIds.length,
    "Cada hito debe tener coordenadas 3D");
});

test("cada módulo de mundo está conectado al identificador correcto en la fábrica", async () => {
  const factory = await readFile(new URL("../src/worlds/WorldFactory.ts", import.meta.url), "utf8");
  const modules = [
    ["tolar", "buildTolar", "tolar"],
    ["hornitos", "buildHornitos", "hornitos"],
    ["toqui", "buildToqui", "toqui"],
    ["gonkoken", "buildGonkoken", "dorotea-superior"],
    ["stegouros", "buildStegouros", "dorotea-inferior"]
  ];
  for (const [folder, builder, id] of modules) {
    const moduleSource = await readFile(new URL("../src/worlds/" + folder + "/index.ts", import.meta.url), "utf8");
    assert.ok(moduleSource.includes('getWorld("' + id + '")'), folder + " debe resolver " + id);
    assert.ok(factory.includes('case "' + id + '": return ' + builder + "(scene)"), "La fábrica debe despachar " + id);
  }
});

test("la geometría comparte la misma función de altura para terreno y elementos apoyados", async () => {
  const geometry = await readFile(new URL("../src/worlds/common/ProceduralWorld.ts", import.meta.url), "utf8");
  assert.match(geometry, /function terrainHeight\(/);
  assert.match(geometry, /const elevation = terrainHeight\(world, px, pz\);[\s\S]*positions\.push\(px, elevation, pz\)/);
  assert.match(geometry, /addTree\(vegetationBatches, x, z, terrainHeight\(world, x, z\), scale, world\.vegetation/);
  assert.match(geometry, /addRock\(rockInstances, x, terrainHeight\(world, x, z\), z, 1\.1/);
  assert.match(geometry, /terrainHeight\(world, poi\.position\[0\], poi\.position\[2\]\)/);
});


test("el terreno se dibuja desde la cámara superior y usa normales de doble cara", async () => {
  const geometry = await readFile(new URL("../src/worlds/common/ProceduralWorld.ts", import.meta.url), "utf8");
  assert.match(geometry, /groundMaterial\.backFaceCulling = false/);
  assert.match(geometry, /groundMaterial\.twoSidedLighting = true/);
  assert.match(geometry, /VertexData\.ComputeNormals\(positions, indices, normals\)/);
});

test("los cuerpos de agua siguen el relieve y los ríos son continuos", async () => {
  const geometry = await readFile(new URL("../src/worlds/common/ProceduralWorld.ts", import.meta.url), "utf8");
  assert.match(geometry, /function addPond\(/);
  assert.match(geometry, /function addRiver\(/);
  assert.match(geometry, /MeshBuilder\.CreateRibbon/);
  assert.match(geometry, /terrainHeight\(world, x, z\) \+ 0\.28/);
  assert.match(geometry, /terrainHeight\(world, leftX, z\) \+ 0\.3/);
  assert.match(geometry, /terrainHeight\(world, rightX, z\) \+ 0\.3/);
});

test("la vegetación tiene formas distintas para matorral, helechos y ribera", async () => {
  const geometry = await readFile(new URL("../src/worlds/common/ProceduralWorld.ts", import.meta.url), "utf8");
  assert.match(geometry, /type === "sparse" \|\| type === "low"/);
  assert.match(geometry, /type === "ferns"/);
  assert.match(geometry, /type === "riparian" \? 5 : 4/);
  assert.match(geometry, /transforms\.fronds\.push/);
  assert.match(geometry, /transforms\.foliage\.push/);
  assert.match(geometry, /flushThinInstances\(scene, root, `foliage-/);
  assert.match(geometry, /flushThinInstances\(scene, root, `fern-fronds-/);
  assert.match(geometry, /thinInstanceRefreshBoundingInfo\(true\)/);
});


test("la vegetación, rocas y estratos se agrupan en lotes de thin instances", async () => {
  const geometry = await readFile(new URL("../src/worlds/common/ProceduralWorld.ts", import.meta.url), "utf8");
  assert.match(geometry, /function flushThinInstances\(/);
  assert.match(geometry, /thinInstanceSetBuffer\("matrix"/);
  assert.match(geometry, /flushThinInstances\(scene, root, `rocks-/);
  assert.match(geometry, /flushThinInstances\(scene, root, `strata-rock-/);
  assert.match(geometry, /mesh\.freezeWorldMatrix\(\)/);
});
