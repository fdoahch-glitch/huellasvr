import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));
const main=read('js/main.js');
const home=read('js/home.js');
const html=read('index.html');
const check=(label,fn)=>{try{fn();console.log('PASS',label);}catch(e){console.error('FAIL',label,'-',e.message);process.exitCode=1;}};

check('Sintaxis JavaScript',()=>{new vm.Script(main);new vm.Script(home);});
check('Motor Babylon.js + WebGL2; sin Three.js/A-Frame',()=>{
 assert.match(html,/babylon\.js/);assert.match(main,/new BABYLON\.Engine/);assert.match(main,/engine\.webGLVersion<2/);
 assert.doesNotMatch(main,/\bAFRAME\b|\bTHREE\b/);
});
check('La portada no inicia una escena 3D antes de elegir mundo',()=>{
 assert.match(main,/if\(!params\.has\('mundo'\)\)return/);
 assert.match(home,/has\('mundo'\)/);
});
check('Cinco escenas separadas y selección de mundo',()=>{
 for(const key of ['atacamatitan','arackar','patagonia','stegouros','aysen']){
  assert.match(main,new RegExp('\\b'+key+':\\{title:'));
  assert.ok(html.includes('data-world="'+key+'"'),key+' no está en la portada');
 }
});
const species={
 atacamatitan:{full:'models/atacamatitan.glb',low:'models/lo_atacamatitan.glb',sizes:[10,9.8,9.5,9.2,9,8.8,8.5,8.2,7.5,7,6.5,6,5.5,4.5,4,3.6,3.2,2.8,2.5,2.2,2,1.8],count:22,gait:'walk:.10,run:.50'},
 arackar:{full:'models/arackar.glb',low:'models/lo_arackar.glb',sizes:[8,7.8,7.5,7.2,7,6.8,6.5,6.2,5.5,5.2,5,4.5,4,3.2,2.8,2.5,2.3,2.1,1.9,1.7,1.5,1.3,1.2],count:24,gait:'walk:.16,run:.72'},
 patagonia:{full:'models/gonkoken.glb',low:'models/lo_gonkoken.glb',sizes:[4,3.8,3.6,3.4,3.2,3,2.8,2.6,2.3,2,1.8,1.5,1.3],count:22,gait:'walk:.08,run:1'},
 stegouros:{full:'models/stegouros.glb',low:'models/lo_stegouros.glb',sizes:[2,1.9,1.8,1.7,1.6,1.5,1.4,1.2,1,.9,.8],count:18,gait:'walk:.22,run:.60'},
 aysen:{full:'models/chilesaurus.glb',low:'models/lo_chilesaurus.glb',sizes:[3,2.9,2.8,2.7,2.6,2.5,2.4,2.2,2.1,2,1.9,1.8,1.6,1.5,1.4,1.3,1.2,1.1,1,.9,.8,.7],count:28,gait:'walk:.45,run:2.2'}
};
function glbAnimations(file){
 const b=fs.readFileSync(path.join(root,file));
 assert.equal(b.toString('utf8',0,4),'glTF',file+' no es GLB');
 let off=12;
 while(off<b.length){
  const size=b.readUInt32LE(off),type=b.readUInt32LE(off+4);off+=8;
  const chunk=b.subarray(off,off+size);off+=size;
  if(type===0x4e4f534a)return JSON.parse(chunk.toString('utf8').replace(/\0+$/,'').trimEnd());
 }
 throw new Error('GLB sin bloque JSON: '+file);
}
check('Todos los modelos de dinosaurio y sus animaciones originales',()=>{
 const required=['Idle','Walk','Run','Neck_Look'];
 for(const [id,d] of Object.entries(species))for(const file of [d.full,d.low]){
  assert.ok(exists(file),'Falta '+file);
  const names=(glbAnimations(file).animations||[]).map(a=>a.name);
  for(const clip of required)assert.ok(names.includes(clip),file+' no contiene '+clip);
 }
});
check('Tamaños, cantidades y velocidades de manada del original v19',()=>{
 for(const [key,d] of Object.entries(species)){
  assert.ok(main.includes(' '+key+':{center:'),'Falta configuración de manada '+key);
  const sizeText=d.sizes.map(x=>String(x).replace(/^0[.]/,'.')).join(',');assert.ok(main.includes('sizes:['+sizeText+']'),'Tamaños incorrectos '+key);
  assert.ok(main.includes(key+':'+d.count),'Cantidad incorrecta '+key);
  const gaitId=key==='patagonia'?'gonkoken':key==='aysen'?'chilesaurus':key;assert.ok(main.includes(gaitId+':{walk:'+d.gait.split(',')[0].split(':')[1]+',run:'+d.gait.split(',')[1].split(':')[1]),'Perfil de marcha incorrecto '+key);
 }
 assert.match(main,/function updateHerdMode/);assert.match(main,/function herdDrinkTarget/);
 for(const state of ['graze','drink','rest'])assert.ok(main.includes("'"+state+"'"));
});
check('Selección de dinosaurios, información y locomoción',()=>{
 for(const token of ['function onPick(evt)','function showInfo(id,actor=null)','function closeInfo()','scene.onPointerObservable','function movePlayer(dt)','xr-standard-trigger'])assert.ok(main.includes(token),'Falta '+token);
});
check('Terreno, mezcla de texturas, montañas, ríos y lagunas',()=>{
 for(const token of ['detailProfiles','function addMountains()','function addWater()','function addSandBars()','terrainHeightAt'])assert.ok(main.includes(token),'Falta '+token);
});
check('Selección por mirada para visores WebXR sin mando',()=>{
 assert.ok(main.includes('function updateXRGaze()'));
 assert.ok(main.includes('performance.now()-xrGazeSince>=1400'));
 assert.ok(main.includes('updateXRGaze();'));
});
check('Visor móvil recupera salida rápida, bloqueo horizontal y pantalla activa',()=>{for(const token of ["screen.orientation?.lock?.('landscape')","navigator.wakeLock.request('screen')","stereoTapTimes.length>=3","event.key==='Escape'",'function updateStereoOrientation()'])assert.ok(main.includes(token),'Falta '+token);assert.ok(html.includes('id="exitHint"'));});
check('Controles de orientación móvil y visor estereoscópico',()=>{
 for(const token of ['function toggleMobileOrientation()','Orientation.requestPermission','deviceorientation','function toggleMobileStereo()','RIG_MODE_STEREOSCOPIC_SIDEBYSIDE_PARALLEL'])assert.ok(main.includes(token),'Falta '+token);
 for(const id of ['sensorButton','stereoButton'])assert.ok(html.includes('id="'+id+'"'),'Falta control '+id);
});
check('Controles WebXR, suelo local y seguimiento',()=>{
 for(const token of ['immersive-vr','local-floor','onInitialXRPoseSetObservable','onStateChangedObservable','onControllerAddedObservable','WebXRFeatureName.MOVEMENT'])assert.ok(main.includes(token),'Falta '+token);
});
check('Inicialización de iluminación sin referencias obsoletas',()=>{
 assert.ok(main.includes('sunLight.shadowMinZ=1'));
 assert.ok(main.includes('sunLight.shadowMaxZ=420'));
 assert.ok(main.includes('sunLight.shadowFrustumSize=210'));
 assert.doesNotMatch(main,/(?<![\\w$])sun\\.(?:shadowMinZ|shadowMaxZ|shadowFrustumSize)/);
});
check('Atmósfera v19: nubes móviles, pterosaurios, estrellas, luna y mariposas',()=>{
 for(const token of ['function addSkyLife()','function updateSkyLife(dt)','moving-cloud-dome','night-sky-stars','night-moon','sky-pterosaur-','ambient-butterfly-','sunbeam-','floating-atmosphere-motes'])assert.ok(main.includes(token),'Falta '+token);
});
check('Sonido nocturno original y mezcla de lluvia',()=>{
 assert.ok(main.includes('nightInsectGain'));assert.ok(main.includes('insectLfo.frequency.value=13'));
 assert.ok(main.includes("timeMode==='noche'&&!raining&&soundOn"));
});
check('Cerros desérticos GLB originales en Atacamatitan',()=>{assert.ok(main.includes("worldKey==='atacamatitan')specs.unshift({file:'models/env/cerro_desierto.glb',n:11"));assert.ok(exists('models/env/cerro_desierto.glb'));});
check('Catálogo ambiental v19: rocas y helechos GLB complementarios',()=>{
 for(const file of ['models/env/rock_09.glb','models/env/fern_02.glb','models/env/rock_07.glb','models/env/dead_tree_trunk_02.glb']){assert.ok(main.includes(file),'No se instancia '+file);assert.ok(exists(file),'Falta recurso '+file);}
});
check('Lluvia gradual afecta iluminación, cielo, nubes y niebla',()=>{
 for(const token of ['rainBlend+=(Number(raining)-rainBlend)','1-.3*rainBlend','1-.6*rainBlend','1-.38*rainBlend','1+.4*rainBlend','.5+.4*rainBlend'])assert.ok(main.includes(token),'Falta '+token);
});
check('Lluvia escalada por calidad para limitar carga GPU en móvil',()=>{
 assert.ok(main.includes("quality==='alta'?900:quality==='media'?520:260"));
 assert.ok(main.includes("quality==='alta'?620:quality==='media'?360:180"));
});
check('Paisaje sonoro v19: viento, agua, lluvia, insectos y llamados de manada',()=>{
 for(const token of ['waterGain','nightInsectGain','waterLfo.frequency.value=.7','insectLfo.frequency.value=13','call.frequency.setValueAtTime','function updateDinoFootFX'])assert.ok(main.includes(token),'Falta '+token);
});
check('Clima, ciclo horario y sonido',()=>{
 for(const token of ['function cycleTimeOfDay()','function initAmbientAudio()','function updateEnvironment(dt)','rainSystem'])assert.ok(main.includes(token),'Falta '+token);
});
check('Selección de la instancia exacta de dinosaurio',()=>{
 assert.ok(main.includes('const actor=dinoRoots.find(item=>item.root===node)'));
 assert.ok(main.includes('showInfo(actor.id,actor)'));
});
check('Dinosaurios beben junto a las orillas reales de cada escena',()=>{
 assert.ok(main.includes('const from=d.root.position,candidates=[]'));
 assert.ok(main.includes('waterDistanceAt(x,z)'));
 assert.ok(main.includes('river.w*.5+1.15'));
 assert.ok(main.includes('WORLD.lagoons||[]'));
});
check('Optimización de vegetación y diagnóstico de rendimiento',()=>{
 assert.ok(main.includes('BABYLON.Mesh.MergeMeshes'));assert.ok(main.includes('__HUELLAS_VR_DIAGNOSTICS__'));
 assert.ok(main.includes('media: .6, baja: .3'));assert.ok(main.includes('mobileDevice ||'));
});
check('Todos los recursos GLB referenciados existen',()=>{
 const refs=[...new Set([...main.matchAll(/['"](models\/[^'"]+\.glb)['"]/g)].map(m=>m[1]))];
 assert.ok(refs.length>=15,'Inventario GLB inesperadamente incompleto');
 for(const file of refs)assert.ok(exists(file),'Falta '+file);
});
check('Cielos, mapas de terreno y texturas de las cinco escenas',()=>{
 const keys=['atacamatitan','arackar','gonkoken','stegouros','aysen'];
 for(const key of keys)for(const suffix of ['_sky.jpg','_c.jpg','_h.png'])assert.ok(exists('img/'+key+suffix),'Falta img/'+key+suffix);
 for(const file of ['img/tex_sand_d.jpg','img/tex_sand_n.jpg','img/tex_crack_d.jpg','img/tex_gsand_d.jpg','img/tex_gsand_n.jpg','img/tx_dirt_d.jpg','img/tx_dirt_n.jpg','img/tx_leaves_d.jpg','img/tx_leaves_n.jpg','img/tx_redplants_d.jpg','img/tx_redplants_n.jpg','img/tx_stones_d.jpg','img/tx_stones_n.jpg'])assert.ok(exists(file),'Falta '+file);
});
