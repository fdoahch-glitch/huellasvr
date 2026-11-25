import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const models = [
  ["atacamatitan.glb", "Atacamatitan chilensis", "406c6d4801fff213da935e5ddc10f9ec55771054"],
  ["arackar.glb", "Arackar licanantay", "1f218c5d8cfdb7df51a1e0a2ca93222470d9e274"],
  ["chilesaurus.glb", "Chilesaurus diegosuarezi", "ece19a4dd4cc6cd1cc021b20f00273fbdb1b6d01"],
  ["gonkoken.glb", "Gonkoken nanoi", "5dd6e1a71c1e9c55efbd8cee311c4d147a08cd1c"],
  ["stegouros.glb", "Stegouros elengassen", "430ddcb1a829e3680e6d8c0d74bad2d6c9efafb8"]
];
const requiredAnimations = ["Idle", "Walk", "Run", "Neck_Look"];

function readGlb(buffer) {
  assert.equal(buffer.toString("ascii", 0, 4), "glTF", "Cabecera GLB inválida");
  assert.equal(buffer.readUInt32LE(4), 2, "El GLB debe usar glTF 2.0");
  assert.equal(buffer.readUInt32LE(8), buffer.length, "La longitud declarada no coincide");
  const jsonLength = buffer.readUInt32LE(12);
  assert.equal(buffer.toString("ascii", 16, 20), "JSON", "Falta el chunk JSON");
  return JSON.parse(buffer.subarray(20, 20 + jsonLength).toString("utf8").trim());
}

test("incluye exactamente los cinco modelos originales y sus esqueletos", async () => {
  for (const [file, species, expectedGitBlob] of models) {
    const bytes = await readFile(new URL("../public/models/" + file, import.meta.url));
    const gitBlobHash = createHash("sha1")
      .update(Buffer.concat([Buffer.from("blob " + bytes.length + "\0"), bytes]))
      .digest("hex");
    assert.equal(gitBlobHash, expectedGitBlob, file + " debe conservar los bytes del GLB original");
    const gltf = readGlb(bytes);
    assert.ok(gltf.skins?.length, file + " debe conservar su esqueleto");
    assert.ok(gltf.meshes?.length, file + " debe contener geometría");
    const names = new Set((gltf.animations ?? []).map((animation) => animation.name));
    for (const animation of requiredAnimations) {
      assert.ok(names.has(animation), species + " debe incluir " + animation);
    }
  }
});

test("el Chilesaurus conserva también su clip Run_Dino", async () => {
  const bytes = await readFile(new URL("../public/models/chilesaurus.glb", import.meta.url));
  const gltf = readGlb(bytes);
  assert.ok(gltf.animations.some((animation) => animation.name === "Run_Dino"));
});

test("la configuración conecta cada especie con su mundo y archivo GLB", async () => {
  const source = await readFile(new URL("../src/dinosaurs/DinosaurManager.ts", import.meta.url), "utf8");
  for (const [file, species] of models) {
    assert.ok(source.includes(file), "Falta el archivo " + file);
    assert.ok(source.includes(species), "Falta la especie " + species);
  }
  for (const animation of requiredAnimations) {
    assert.ok(source.includes('"'+animation+'"'), "Falta la animación " + animation);
  }
});
