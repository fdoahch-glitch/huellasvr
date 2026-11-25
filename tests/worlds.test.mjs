import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../src/domain/worlds.ts", import.meta.url), "utf8");

test("declara exactamente los cinco mundos acordados", () => {
  for (const id of ["tolar", "hornitos", "toqui", "dorotea-superior", "dorotea-inferior"]) {
    assert.ok(source.includes(`id: "${id}"`), `Falta el mundo ${id}`);
  }
});

test("mantiene los cinco dinosaurios chilenos vinculados a su mundo", () => {
  for (const name of ["Atacamatitan chilensis", "Arackar licanantay", "Chilesaurus diegosuarezi", "Gonkoken nanoi", "Stegouros elengassen"]) {
    assert.ok(source.includes(name), `Falta la especie ${name}`);
  }
});

test("los puntos de interés incluyen nivel de evidencia", () => {
  assert.match(source, /evidence: "direct-evidence"/);
  assert.match(source, /evidence: "scientific-interpretation"/);
  assert.match(source, /evidence: "artistic-reconstruction"/);
});

test("cada mundo tiene identidad, paleta y puntos de interés válidos", async () => {
  const ids = [...source.matchAll(/id: "([^"]+)"/g)].map((match) => match[1]);
  const worldIds = ["tolar", "hornitos", "toqui", "dorotea-superior", "dorotea-inferior"];
  for (const id of worldIds) assert.equal(ids.filter((value) => value === id).length, 1, `ID duplicado o ausente: ${id}`);

  const worldSource = source.slice(source.indexOf("export const worlds"));
  const paletteMatches = [...worldSource.matchAll(/palette: \\{[^}]+\\}/g)];
  assert.equal(paletteMatches.length, 5, "Cada mundo debe declarar una paleta propia");
  for (const palette of paletteMatches) {
    for (const hex of palette[0].matchAll(/"?(#[0-9a-fA-F]{6})"?/g)) {
      assert.match(hex[1], /^#[0-9a-fA-F]{6}$/);
    }
  }

  const poiIds = [...worldSource.matchAll(/\\{ id: "([^"]+)", title:/g)].map((match) => match[1]);
  assert.ok(poiIds.length >= 20, "Deben existir al menos cuatro hitos por mundo");
  assert.equal(new Set(poiIds).size, poiIds.length, "Los identificadores de hitos deben ser únicos");
  assert.equal([...worldSource.matchAll(/position: \\[(-?[0-9.]+), (-?[0-9.]+), (-?[0-9.]+)\\]/g)].length, poiIds.length,
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
    const moduleSource = await readFile(new URL(`../src/worlds/${folder}/index.ts`, import.meta.url), "utf8");
    assert.match(moduleSource, new RegExp(`getWorld\\("\${id}"\\)`), `${folder} debe resolver ${id}`);
    assert.ok(factory.includes(`case "${id}": return ${builder}(scene)`), `La fábrica debe despachar ${id}`);
  }
});

test("la geometría comparte la misma función de altura para terreno y elementos apoyados", async () => {
  const geometry = await readFile(new URL("../src/worlds/common/ProceduralWorld.ts", import.meta.url), "utf8");
  assert.match(geometry, /function terrainHeight\\(/);
  assert.match(geometry, /positions\\.push\\(px, terrainHeight\\(world, px, pz\\), pz\\)/);
  assert.match(geometry, /terrainHeight\\(world, x, z\\), scale, world\\.vegetation/);
  assert.match(geometry, /terrainHeight\\(world, x, z\\), z, 1\\.1/);
  assert.match(geometry, /terrainHeight\\(world, poi\\.position\\[0\\], poi\\.position\\[2\\]\\)/);
});
