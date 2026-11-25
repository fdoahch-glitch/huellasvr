import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const read = (path) => readFileSync(resolve(root, path));
const assets = [
  'models/veg/araucaria_adulta.glb',
  'models/veg/araucaria_joven.glb',
  'models/env/rock_07.glb',
  'models/env/rock_09.glb',
  'models/env/dead_tree_trunk_02.glb',
  'models/env/cerro_desierto.glb',
];

globalThis.window = globalThis;
globalThis.self = globalThis;
globalThis.devicePixelRatio = 1;
globalThis.addEventListener ||= () => {};
globalThis.removeEventListener ||= () => {};
globalThis.document ||= {
  addEventListener() {},
  removeEventListener() {},
  createElement() { return { getContext() { return null; } }; },
};

vm.runInThisContext(read('vendor/babylon/babylon.js').toString('utf8'), { filename: 'babylon.js' });
vm.runInThisContext(read('vendor/babylon/babylonjs.loaders.min.js').toString('utf8'), { filename: 'babylonjs.loaders.min.js' });

const B = globalThis.BABYLON;
assert.equal(B?.Engine?.Version, '9.37.2', 'La prueba debe ejecutar la versión Babylon distribuida por el proyecto');
assert.equal(typeof B?.Mesh?.prototype?.simplify, 'function', 'Mesh.simplify() no está disponible en el bundle');
assert.equal(B.SimplificationType?.QUADRATIC, 0, 'SimplificationType.QUADRATIC no está disponible');
assert.equal(typeof B.NullEngine, 'function', 'Babylon NullEngine no está disponible');

function policy(file) {
  const tree = file.includes('araucaria') || file.includes('dead_tree');
  const rock = file.includes('rock') || file.includes('pebble') || file.includes('cerro_desierto');
  const near = tree ? 58 : rock ? 22 : 34;
  const far = tree ? 112 : rock ? 42 : 68;
  const settings = tree
    ? [{ quality: .82, distance: near, optimizeMesh: true }, { quality: .64, distance: far, optimizeMesh: true }]
    : rock
      ? [{ quality: .72, distance: near, optimizeMesh: true }, { quality: .46, distance: far, optimizeMesh: true }]
      : [{ quality: .82, distance: near, optimizeMesh: true }, { quality: .62, distance: far, optimizeMesh: true }];
  return { near, far, settings };
}

function snapshot(mesh) {
  const positions = mesh.getVerticesData(B.VertexBuffer.PositionKind);
  const indices = mesh.getIndices();
  assert.ok(positions?.length && indices?.length, 'La geometría debe tener posiciones e índices');
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3) {
    for (let axis = 0; axis < 3; axis++) {
      min[axis] = Math.min(min[axis], positions[i + axis]);
      max[axis] = Math.max(max[axis], positions[i + axis]);
    }
  }
  const hullArea = (a, b) => {
    const count = positions.length / 3;
    const step = Math.max(1, Math.ceil(count / 512));
    const points = [];
    for (let i = 0; i < count; i += step) points.push([positions[i * 3 + a], positions[i * 3 + b]]);
    points.sort((x, y) => x[0] - y[0] || x[1] - y[1]);
    const cross = (o, x, y) => (x[0] - o[0]) * (y[1] - o[1]) - (x[1] - o[1]) * (y[0] - o[0]);
    const lower = [];
    const upper = [];
    for (const point of points) {
      while (lower.length >= 2 && cross(lower.at(-2), lower.at(-1), point) <= 0) lower.pop();
      lower.push(point);
    }
    for (let i = points.length - 1; i >= 0; i--) {
      const point = points[i];
      while (upper.length >= 2 && cross(upper.at(-2), upper.at(-1), point) <= 0) upper.pop();
      upper.push(point);
    }
    const hull = lower.slice(0, -1).concat(upper.slice(0, -1));
    let area = 0;
    for (let i = 0; i < hull.length; i++) {
      const aPoint = hull[i];
      const bPoint = hull[(i + 1) % hull.length];
      area += aPoint[0] * bPoint[1] - bPoint[0] * aPoint[1];
    }
    return Math.abs(area) / 2;
  };
  const kinds = mesh.getVerticesDataKinds?.() || [];
  let gpuBytes = indices.byteLength || indices.length * 4;
  for (const kind of kinds) {
    const data = mesh.getVerticesData(kind);
    if (data) gpuBytes += data.byteLength || data.length * 4;
  }
  return {
    triangles: Math.floor(indices.length / 3),
    vertices: Math.floor(positions.length / 3),
    min,
    max,
    size: max.map((value, axis) => value - min[axis]),
    silhouette: { xy: hullArea(0, 1), xz: hullArea(0, 2), yz: hullArea(1, 2) },
    normals: !!mesh.getVerticesData(B.VertexBuffer.NormalKind),
    uvs: !!mesh.getVerticesData(B.VertexBuffer.UVKind),
    colors: !!mesh.getVerticesData(B.VertexBuffer.ColorKind),
    materialClass: mesh.material?.getClassName?.() || mesh.material?.constructor?.name || null,
    gpuBytes,
  };
}

function mergeSpatialMeshes(meshes) {
  const materials = new Set(meshes.map(mesh => mesh.material).filter(Boolean));
  const preserveMaterialGroups = materials.size > 1 || meshes.some(mesh => mesh.material?.getClassName?.() === 'MultiMaterial');
  return B.Mesh.MergeMeshes(meshes, true, true, undefined, preserveMaterialGroups, preserveMaterialGroups);
}

function compare(original, lod) {
  let boundsDrift = 0;
  for (let axis = 0; axis < 3; axis++) {
    if (original.size[axis] < .01) continue;
    boundsDrift = Math.max(boundsDrift,
      Math.abs(original.min[axis] - lod.min[axis]) / original.size[axis],
      Math.abs(original.max[axis] - lod.max[axis]) / original.size[axis]);
  }
  const silhouetteRatios = {};
  for (const key of ['xy', 'xz', 'yz']) {
    if (original.silhouette[key] > 1e-5) {
      silhouetteRatios[key] = lod.silhouette[key] / original.silhouette[key];
    }
  }
  assert.ok(lod.triangles > 0 && lod.triangles < original.triangles, 'Cada LOD debe reducir triángulos');
  assert.ok(lod.vertices <= original.vertices, 'El LOD no debe aumentar vértices');
  assert.ok(boundsDrift <= .025, `La caja geométrica cambió ${(boundsDrift * 100).toFixed(2)}%`);
  for (const [axis, ratio] of Object.entries(silhouetteRatios)) {
    assert.ok(ratio >= .78 && ratio <= 1.22, `La silueta ${axis} cambió demasiado: ${ratio}`);
  }
  assert.ok(!original.normals || lod.normals, 'Se perdieron normales');
  assert.ok(!original.uvs || lod.uvs, 'Se perdieron coordenadas UV');
  assert.ok(!original.colors || lod.colors, 'Se perdieron colores por vértice');
  assert.equal(lod.materialClass, original.materialClass, 'Cambió la clase del material');
  return { boundsDriftPercent: boundsDrift * 100, silhouetteRatios };
}

async function drainQueue(scene, tasks, timeoutMs = 90000) {
  if (!tasks.length) return;
  const start = Date.now();
  await new Promise((resolvePromise, rejectPromise) => {
    const pump = () => {
      const queue = scene._simplificationQueue;
      if (queue && !queue.running && queue._simplificationArray.length) {
        try { queue.executeNext(); } catch (error) { rejectPromise(error); return; }
      }
      if (tasks.every(task => task.done) && (!queue || (!queue.running && queue._simplificationArray.length === 0))) {
        resolvePromise();
        return;
      }
      if (Date.now() - start > timeoutMs) {
        rejectPromise(new Error('Tiempo agotado al procesar la cola de simplificación Babylon'));
        return;
      }
      setTimeout(pump, 8);
    };
    pump();
  });
}

async function testAsset(file) {
  const engine = new B.NullEngine({ renderWidth: 640, renderHeight: 480, textureSize: 128 });
  const scene = new B.Scene(engine);
  try {
    const camera = new B.FreeCamera('lod-runtime-camera', new B.Vector3(0, 5, -140), scene);
    camera.setTarget(B.Vector3.Zero());
    const data = read(file).toString('base64');
    const container = await B.SceneLoader.LoadAssetContainerAsync('', 'data:application/octet-stream;base64,' + data, scene, undefined, '.glb');
    const sourceMeshes = container.meshes.filter(mesh => mesh.getTotalVertices?.() > 0);
    assert.ok(sourceMeshes.length, `${file}: no se encontraron mallas GLB originales`);
    const lodPolicy = policy(file);
    const tasks = [];
    for (const sourceMesh of sourceMeshes) {
      const triangles = Math.floor((sourceMesh.getTotalIndices?.() || 0) / 3);
      if (triangles < 600 || sourceMesh.getLODLevels?.().length >= 2) continue;
      const task = { done: false };
      sourceMesh.simplify(lodPolicy.settings, false, B.SimplificationType.QUADRATIC, () => { task.done = true; });
      tasks.push(task);
    }
    await drainQueue(scene, tasks);
    const sourceLods = new Map(sourceMeshes.map(mesh => [
      mesh,
      (mesh.getLODLevels?.() || []).slice().sort((a, b) => a.distanceOrScreenCoverage - b.distanceOrScreenCoverage).slice(0, 2),
    ]));
    for (const [sourceMesh, levels] of sourceLods) {
      if (Math.floor((sourceMesh.getTotalIndices?.() || 0) / 3) >= 600) {
        assert.equal(levels.length, 2, `${file}: cada malla fuente compatible debe generar dos LOD`);
      }
      for (const level of levels) {
        level.mesh.setEnabled(false);
        level.mesh.isVisible = false;
      }
    }
    const hasLod = [...sourceLods.values()].some(levels => levels.length === 2);
    if (!hasLod) {
      const triangleCount = sourceMeshes.reduce((sum, mesh) => sum + (mesh.getTotalIndices?.() || 0) / 3, 0);
      console.log('VEGETATION_LOD_SKIP', JSON.stringify({ file, triangleCount, reason: 'no eligible source mesh' }));
      return;
    }

    const baseMeshes = [];
    const lodMeshes = [[], []];
    const roots = [];
    const instanceCount = file.includes('cerro_desierto') ? 2 : 4;
    for (let index = 0; index < instanceCount; index++) {
      const suffix = '-lod-runtime-' + index;
      const instance = container.instantiateModelsToScene(name => name + suffix, false, { doNotInstantiate: true });
      const rootNode = new B.TransformNode('lod-runtime-root-' + index, scene);
      const pivot = new B.TransformNode('lod-runtime-pivot-' + index, scene);
      pivot.parent = rootNode;
      instance.rootNodes.forEach(node => { node.parent = pivot; });
      rootNode.position.set((index % 2) * 12 - 6, 0, Math.floor(index / 2) * 12 - 6);
      rootNode.scaling.setAll(.8 + index * .12);
      rootNode.rotation.y = index * .3;
      rootNode.computeWorldMatrix(true);
      const allMeshes = rootNode.getChildMeshes(false);
      allMeshes.forEach(mesh => mesh.computeWorldMatrix(true));
      const instanceBase = [];
      const usedLodMeshes = new Set();
      for (const sourceMesh of sourceMeshes) {
        const base = allMeshes.find(mesh => mesh.name === sourceMesh.name + suffix && mesh.getTotalVertices?.() > 0);
        assert.ok(base, `${file}: falta la malla base clonada ${sourceMesh.name}`);
        instanceBase.push(base);
        const levels = sourceLods.get(sourceMesh) || [];
        for (let levelIndex = 0; levelIndex < 2; levelIndex++) {
          const sourceLod = levels[levelIndex]?.mesh;
          let lodClone = null;
          if (sourceLod) {
            const candidates = allMeshes.filter(mesh => mesh.name === sourceLod.name + suffix && !usedLodMeshes.has(mesh));
            lodClone = candidates.find(mesh => mesh.getTotalVertices?.() === sourceLod.getTotalVertices?.()) || null;
            if (!lodClone) lodClone = candidates[0] || null;
          }
          if (!lodClone) {
            lodClone = (sourceLod || base).clone((sourceLod || base).name + '-lod-copy-' + levelIndex + '-' + index, null, true);
            lodClone.parent = base.parent;
            lodClone.position.copyFrom(base.position);
            lodClone.rotation.copyFrom(base.rotation);
            lodClone.scaling.copyFrom(base.scaling);
            if (base.rotationQuaternion) lodClone.rotationQuaternion = base.rotationQuaternion.clone();
          }
          usedLodMeshes.add(lodClone);
          lodClone.setEnabled(true);
          lodClone.isVisible = true;
          lodMeshes[levelIndex].push(lodClone);
        }
      }
      baseMeshes.push(...instanceBase);
      roots.push(rootNode);
    }

    const base = mergeSpatialMeshes(baseMeshes);
    const near = mergeSpatialMeshes(lodMeshes[0]);
    const far = mergeSpatialMeshes(lodMeshes[1]);
    assert.ok(base && near && far, `${file}: no se pudieron fusionar base/near/far en lotes espaciales`);
    for (const mesh of [base, near, far]) {
      mesh.position.set(0, 0, 0);
      mesh.computeWorldMatrix(true);
      mesh.refreshBoundingInfo();
    }
    base.addLODLevel(lodPolicy.near, near);
    base.addLODLevel(lodPolicy.far, far);
    const original = snapshot(base);
    const nearStats = snapshot(near);
    const farStats = snapshot(far);
    const nearComparison = compare(original, nearStats);
    const farComparison = compare(original, farStats);
    assert.equal(base.getLODLevels().length, 2, `${file}: deben quedar exactamente dos LOD`);
    assert.equal(snapshot(base).triangles, original.triangles, `${file}: se modificó la geometría original`);
    assert.equal(snapshot(base).vertices, original.vertices, `${file}: se modificó el conteo de vértices original`);
    assert.ok(farStats.triangles < nearStats.triangles, `${file}: el LOD lejano debe ser más ligero que el cercano`);

    const center = base.getBoundingInfo().boundingSphere.centerWorld.clone();
    camera.position.set(center.x, center.y, center.z - Math.max(6, lodPolicy.near * .35));
    camera.computeWorldMatrix(true);
    assert.equal(base.getLOD(camera), base, `${file}: el nivel original debe usarse a corta distancia`);
    camera.position.set(center.x, center.y, center.z - lodPolicy.far - 12);
    camera.computeWorldMatrix(true);
    assert.equal(base.getLOD(camera), far, `${file}: el segundo LOD debe usarse a larga distancia`);

    const lodBytes = nearStats.gpuBytes + farStats.gpuBytes;
    assert.ok(lodBytes < 24 * 1024 * 1024, `${file}: el lote de prueba supera el presupuesto móvil de geometría LOD`);
    console.log('VEGETATION_LOD_ASSET_PASS', JSON.stringify({
      file, instances: instanceCount,
      original: { triangles: original.triangles, vertices: original.vertices },
      near: { triangles: nearStats.triangles, vertices: nearStats.vertices, comparison: nearComparison },
      far: { triangles: farStats.triangles, vertices: farStats.vertices, comparison: farComparison },
      lodGeometryMB: +(lodBytes / 1048576).toFixed(2),
    }));
  } finally {
    scene.dispose();
    engine.dispose();
  }
}

for (const asset of assets) await testAsset(asset);
console.log('VEGETATION_LOD_RUNTIME_PASS', JSON.stringify({ babylon: B.Engine.Version, assets: assets.length }));
