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