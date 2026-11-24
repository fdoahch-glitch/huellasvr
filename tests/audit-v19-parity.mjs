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
 atacamatitan:{full:'models/atacamatitan.glb',low:'models/lo_atacamatitan.glb',sizes:[10,9.8,9.5,9.2,9,8.8,8.5,8.2,7.5,7,6.5,6,5.5,4.5,4,3.6,3.2,2.8,2.5,2.2,2,1.8],count:12,gait:'walk:.10,run:.50'},
 arackar:{full:'models/arackar.glb',low:'models/lo_arackar.glb',sizes:[8,7.8,7.5,7.2,7,6.8,6.5,6.2,5.5,5.2,5,4.5,4,3.2,2.8,2.5,2.3,2.1,1.9,1.7,1.5,1.3,1.2],count:13,gait:'walk:.16,run:.72'},
 patagonia:{full:'models/gonkoken.glb',low:'models/lo_gonkoken.glb',sizes:[4,3.8,3.6,3.4,3.2,3,2.8,2.6,2.3,2,1.8,1.5,1.3],count:12,gait:'walk:.08,run:1'},
 stegouros:{full:'models/stegouros.glb',low:'models/lo_stegouros.glb',sizes:[2,1.9,1.8,1.7,1.6,1.5,1.4,1.2,1,.9,.8],count:10,gait:'walk:.22,run:.60'},
 aysen:{full:'models/chilesaurus.glb',low:'models/lo_chilesaurus.glb',sizes:[3,2.9,2.8,2.7,2.6,2.5,2.4,2.2,2.1,2,1.9,1.8,1.6,1.5,1.4,1.3,1.2,1.1,1,.9,.8,.7],count:14,gait:'walk:.45,run:2.2'}
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
  assert.ok(main.includes('totalDinos=10'),'El límite total de dinosaurios debe ser 10');
  assert.ok(main.includes('basePerSpecies=Math.floor(totalDinos/ids.length)')&&main.includes('extraDinos=totalDinos%ids.length'),'La distribución de los diez dinosaurios entre especies debe ser equilibrada');
  assert.ok(main.includes('herdSize=basePerSpecies+(speciesIndex<extraDinos?1:0)'),'La carga debe respetar el reparto por especie en cada mundo');
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
check('La cámara WebXR conserva altura de cabeza sobre el suelo local',()=>{assert.ok(main.includes('headHeight=Math.max(1.1,Math.min(2.2,xrCamera.position.y||1.65))'));assert.ok(main.includes('terrainHeightAt(px,pz)+headHeight'));});
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
check('Lluvia recupera densidad y tinte de niebla de v19',()=>{assert.ok(main.includes('1+1.4*rainBlend'));assert.ok(main.includes("BABYLON.Color3.FromHexString('#8d949c')"));assert.ok(main.includes("timeMode==='noche'?.2:1"));});
check('Lluvia gradual afecta iluminación, cielo, nubes y niebla',()=>{
 for(const token of ['rainBlend+=(Number(raining)-rainBlend)','1-.3*rainBlend','1-.6*rainBlend','1-.38*rainBlend','1+1.4*rainBlend','.5+.4*rainBlend'])assert.ok(main.includes(token),'Falta '+token);
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
check('Diagnóstico mide coste CPU por actualización y carga de partículas',()=>{for(const token of ['cpuUpdateMs','cpuUpdateAvgMs','scene?.particleSystems?.length','CPU actualización JS:'])assert.ok(main.includes(token),'Falta '+token);});
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

check('Ciclo de vida WebGL2: pausa en segundo plano y recuperación de contexto',()=>{
 for(const token of ['onContextLostObservable','onContextRestoredObservable','visibilitychange','stopRenderLoop(renderLoop)','runRenderLoop(renderLoop)','pagehide','pageshow'])assert.ok(main.includes(token),'Falta '+token);
 assert.ok(main.includes('if(!contextLost&&scene&&scene.activeCamera)scene.render()'));
});
check('Errores de carga: salida segura sin bucle de recarga',()=>{
 assert.ok(main.includes("$('explore').textContent='Volver al inicio'"));
 assert.ok(main.includes("$('visor').disabled=true"));
 assert.ok(main.includes("location.href=location.pathname"));
 assert.doesNotMatch(main,/location\.reload\(\)/);
});
check('Todos los controles DOM usados por el motor existen en index.html',()=>{
 const ids=[...new Set([...main.matchAll(/\$\('([^']+)'\)/g)].map(m=>m[1]))];
 for(const id of ids)assert.ok(html.includes('id="'+id+'"'),'Falta elemento #'+id);
});
check('Recursos locales literales del motor presentes en el repositorio',()=>{
 const paths=[...new Set([...(main+'\\n'+html).matchAll(/(?:models|img)\/[A-Za-z0-9_./-]+\.(?:glb|jpg|png|webp)/g)].map(m=>m[0]))];
 for(const file of paths)assert.ok(exists(file),'Recurso no encontrado: '+file);
});
check('Diagnóstico de rendimiento expone CPU, GPU y estado XR',()=>{
 for(const token of ['__HUELLAS_VR_DIAGNOSTICS__','cpuUpdateAvgMs','activeMeshes','getLoadedTexturesCache','xrState','heapMB'])assert.ok(main.includes(token),'Falta diagnóstico '+token);
});


check('Orientación frontal explícita e independiente por especie',()=>{
 const expected={atacamatitan:'-Math.PI/2',arackar:'0',gonkoken:'-Math.PI/2',stegouros:'-Math.PI/2',chilesaurus:'-Math.PI/2'};
 for(const [id,yaw] of Object.entries(expected)){
  const at=main.indexOf(id+':{name:');assert.ok(at>=0,'Falta especie '+id);
  const end=main.indexOf('},',at),spec=main.slice(at,end<0?at+500:end);
  assert.ok(spec.includes('forwardYaw:'+yaw),'Orientación no explícita para '+id);
 }
 assert.ok(!main.includes('DINO[d.id].flip'),'Se mantiene la inversión genérica antigua');
});
check('Clips clonados: sufijos numéricos y crossfade',()=>{
 assert.ok(main.includes('function resolveDinoClip(clips,semantic)'));
 assert.ok(main.includes("replace(/(?:[-_ ]"));
 assert.ok(main.includes('setWeightForAllAnimatables'));
 assert.ok(main.includes('transitionElapsed/.24'));
 assert.ok(main.includes("resolveDinoClip(clips,'Idle')"));
});
check('Base de montañas busca terreno válido antes de interpolar',()=>{
 assert.ok(main.includes('const mountainBaseAt=(x,z)=>'));
 assert.ok(main.includes('for(let inward=2;inward<=90;inward+=2)'));
 assert.ok(main.includes('edgeY=mountainBaseAt(edgeX,edgeZ)'));
});

check('La manada conserva adultos y juveniles en todos los niveles de calidad',()=>{
 assert.ok(main.includes('sizeIndex=sizes.length>1&&total>1?Math.round(index*(sizes.length-1)/(total-1)):index'));
 assert.ok(main.includes('const juvenile=targetLength<=data.length*.58'));
});
check('Los temporizadores de descanso y bebida se descuentan una sola vez por fotograma',()=>{
 const start=main.indexOf("if(d.state==='graze'||d.state==='drink'||d.state==='rest')");
 const end=main.indexOf("if(t<d.lookUntil)",start);
 const segment=main.slice(start,end);
 assert.equal((segment.match(/d\.timer-=step/g)||[]).length,1,'Temporizador doble para drink/rest/graze');
});
check('IA ecológica: personalidades, separación y respuestas sociales',()=>{
 for(const token of ['function dinoSpacingRadius','function choosePlayerApproach','function chooseDinoSocial','function updateDinoSocial','function tryDinoFlee','dinoBehaviorCheck','exerciseSocial','goal===\'flee\'','d.goal===\'graze\''])assert.ok(main.includes(token),'Falta conducta '+token);
 assert.ok(main.includes('socialPartner'));assert.ok(main.includes('juvenile,personality'));assert.ok(main.includes('playDirection'));assert.ok(main.includes("d.goal='play'"));assert.ok(main.includes('const angle=Math.atan2(d.root.position.x-partner.root.position.x'));
});
check('API de prueba temporal para reproducir los cuatro clips',()=>{
 assert.ok(main.includes("params.get('test')==='1'"));
 assert.ok(main.includes('window.__HUELLAS_VR_TEST__'));
 assert.ok(main.includes('d.testClip||'));
});

check('Havok Physics V2 y controlador de personaje',()=>{
 assert.ok(html.includes('HavokPhysics_umd.js'));
 for(const token of ['new BABYLON.HavokPlugin','scene.enablePhysics','new BABYLON.PhysicsCharacterController','new BABYLON.PhysicsAggregate','physicsController.integrate'])assert.ok(main.includes(token),'Falta '+token);
});

check('Sincronización física de WebXR',()=>{
 assert.ok(main.includes('const inXR=xr?.baseExperience?.state===BABYLON.WebXRState.IN_XR'));
 assert.ok(main.includes('const view=xr.input?.xrCamera'));
 assert.ok(main.includes('view.position.set(next.x,terrainHeightAt(next.x,next.z)+headHeight,next.z)'));
});
check('Colisionadores simplificados de vegetación y rocas',()=>{
 assert.ok(main.includes('environment-physics-collider-'));
 assert.ok(main.includes("a.file.includes('araucaria_adulta')"));
 assert.ok(main.includes('BABYLON.PhysicsShapeType.CYLINDER'));
});

check('Mezcla del terreno por pendiente y variación procedural estable',()=>{
 assert.ok(main.includes('const smoothMask=(a,b,v)=>'));
 assert.ok(main.includes('normalY=1/Math.sqrt(1+sx*sx+sz*sz)'));
 assert.ok(main.includes('coverage=flat*'));
 assert.ok(main.includes('weights[k]*coverage'));
});

check('Panorama esencial se espera y registra fallos',()=>{
 assert.ok(main.includes('await addSky()'));
 assert.ok(main.includes('Panorama listo:'));
 assert.ok(main.includes('Falló panorama:'));
 assert.ok(main.includes('sky:{ready:skyReady,error:skyError,url:WORLD.sky}'));
});

check('Mapas del terreno con carga verificada',()=>{
 assert.ok(main.includes('terrainNormalReady=true'));
 assert.ok(main.includes('No se pudo cargar el mapa normal'));
 assert.ok(main.includes('terrain:{photo:terrainPhotoReady,normal:terrainNormalReady,error:terrainTextureError'));
});

check('Escalones del controlador Havok',()=>{
 assert.ok(main.includes('physicsController.maxStepHeight=.35'));
 assert.ok(main.includes('physicsController.maxSlopeCosine=Math.cos(50*Math.PI/180)'));
});

check('Mapeo de panoramas por mundo',()=>{
 for(const path of ['atacamatitan_sky.jpg','arackar_sky.jpg','gonkoken_sky.jpg','stegouros_sky.jpg','aysen_sky.jpg'])assert.ok(main.includes(path),'Falta panorama '+path);
});

check('Instrumentación de diagnóstico',()=>{
 for(const token of ['new BABYLON.SceneInstrumentation(scene)','new BABYLON.EngineInstrumentation(engine)','drawCallsCounter','gpuFrameTimeCounter','physicsTimeCounter','huellasPerfDiagnostics'])assert.ok(main.includes(token),'Falta '+token);
});

check('Domo panorámico dentro del plano lejano y nubes visibles',()=>{
 assert.ok(main.includes("CreateSphere('sky-dome',{diameter:500,segments:32}"));
 assert.ok(main.includes('camera.maxZ=320'));
 assert.ok(main.includes("{diameter:498,segments:32}"),'La capa de nubes debe quedar dentro del domo panorámico');
 assert.ok(main.includes('new BABYLON.Texture(WORLD.sky,scene,false,true'),'El panorama debe conservar la orientación vertical del original');
});

check('Materiales PBR para suelo, montañas y agua',()=>{
 assert.ok(main.includes("new BABYLON.PBRMaterial('photo-terrain-pbr-"));
 assert.ok(main.includes("new BABYLON.PBRMaterial('original-mountain-pbr-"));
 assert.ok(main.includes("new BABYLON.StandardMaterial('original-water-unlit-"));
 assert.ok(main.includes('waterMat.disableLighting=true'));
 assert.ok(main.includes('if(WORLD.noBank===false)'),'El agua debe respetar noBank del mundo v19');
 assert.ok(main.includes('m.metallic=0'));
});
check('Vegetación 3D utiliza los GLB originales de v19 sin bosque procedural duplicado',()=>{
 assert.ok(main.includes('await addVegetation()'));
 assert.ok(main.includes('models/veg/araucaria_adulta.glb'));
 assert.ok(main.includes('models/veg/fern_tripo.glb'));
 assert.ok(main.includes('addForest3D();'),'Debe conservarse el sistema de bosque 3D del original v19');
 assert.ok(main.includes("CreateDisc('butterfly-left-"),'Las alas ambientales no deben ser paneles rectangulares');
});

check('Colisión dinámica de dinosaurios con obstáculos y manada',()=>{
 assert.ok(main.includes('function isDinoPositionBlocked'));
 assert.ok(main.includes('environmentCollisionZones.push'));
 assert.ok(main.includes('const obstacle=isDinoPositionBlocked(d,nx,nz)'));
 assert.ok(main.includes('collisionCheck(){'));
});

check('Mejoras visuales Babylon.js/WebGL2: perfiles, PBR, sombras y postprocesado',()=>{
 for(const token of ['VISUAL_PROFILE={ultra:','function tuneVisualMaterials(root,foliage=false)','material.sheen.isEnabled=true','function addEnvironmentLighting()','new BABYLON.EquiRectangularCubeTexture','scene.environmentTexture=environmentTexture','function addVisualPipeline()','DefaultRenderingPipeline','fxaaEnabled=VP.samples<=1','bloomEnabled=VP.bloom>0','shadowGenerator=new BABYLON.ShadowGenerator(VP.shadow','waterMat.disableLighting=true','waterGlossMat.disableLighting=true','anisotropicFilteringLevel=VP.anisotropy','function addSSAO()','new BABYLON.SSAORenderingPipeline','function addAdvancedVisualEffects()','new BABYLON.SSRRenderingPipeline','function createParticleSystem(name,capacity)','BABYLON.GPUParticleSystem.IsSupported','new BABYLON.GPUParticleSystem','particleBackend','ssao:!!ssaoPipeline','environmentReady','thinInstances:scene.meshes.some(m=>m.hasThinInstances)'])assert.ok(main.includes(token),'Falta mejora visual '+token);
 assert.ok(main.includes('addVisualPipeline();bindControls()'));
 assert.ok(main.includes("!['ultra','alta'].includes(quality)")&&main.includes('mobileDevice'),'SSAO debe limitarse a escritorio de alta calidad');
 assert.ok(main.includes('removeSSAO()')&&main.includes('addSSAO()'),'SSAO debe liberarse en VR y restaurarse al salir');
 assert.ok(main.includes('createParticleSystem(\'ambient-dust\',VP.particles)')&&main.includes("createParticleSystem('rain',rainCapacity)"),'Polvo y lluvia deben usar GPU con fallback');
 assert.ok(main.includes("quality!=='ultra'||mobileDevice"),'SSR debe limitarse a perfil ultra en escritorio');
 assert.ok(main.includes('state===BABYLON.WebXRState.IN_XR')&&main.includes('ssrPipeline.isEnabled=false'),'Los efectos avanzados deben apagarse al entrar en VR');
 assert.ok(!main.includes('THREE.WebGLRenderer'));
});


check('Optimización de rendimiento: colisiones espaciales e IA LOD',()=>{
 for(const token of ['function buildEnvironmentCollisionGrid()','function rebuildDinoCollisionGrid()','function nearbyGridItems(','collisionGridReady?nearbyGridItems','playerDistance>65','d.nextLodUpdate=t+200'])assert.ok(main.includes(token),'Falta optimización '+token);
});
check('Preparación completa del mundo antes de habilitar la experiencia',()=>{
 assert.ok(main.includes('await scene.whenReadyAsync()'),'La carga no espera texturas y materiales');
 assert.ok(main.includes('buildEnvironmentCollisionGrid()'),'No se prepara el índice espacial antes de entrar');
 assert.ok(main.includes("setProgress(.96,'Finalizando texturas, iluminación y materiales…')"));
 assert.ok(main.indexOf('await scene.whenReadyAsync()')<main.indexOf("setProgress(1,'¡Mundo listo!')"));
});
check('Recursos compartidos y un solo bucle de renderizado',()=>{
 assert.ok(main.includes('particleTextureCache'),'La textura de partículas no se comparte');
 assert.ok(main.includes('if(!renderLoopStarted){engine.runRenderLoop(renderLoop);renderLoopStarted=true;}'));
 assert.ok(main.includes('antialias:false'),'El antialias del contexto no debe duplicar el MSAA del pipeline');
});


check('Motor Babylon.js, cargadores y Havok servidos localmente sin CDN',()=>{
 const html=read('index.html');
 for(const file of ['vendor/babylon/babylon.js','vendor/babylon/babylonjs.loaders.min.js','vendor/babylon/havok/HavokPhysics_umd.js'])assert.ok(html.includes(file),'Falta referencia local '+file);
 assert.ok(!html.includes('https://cdn.babylonjs.com')&&!html.includes('https://cdn.babylonjs.com/havok'),'Se detectó dependencia Babylon/Havok externa en index.html');
 for(const file of ['vendor/babylon/babylon.js','vendor/babylon/babylonjs.loaders.min.js','vendor/babylon/havok/HavokPhysics_umd.js','vendor/babylon/havok/HavokPhysics.wasm'])assert.ok(fs.existsSync(new URL('../'+file,import.meta.url)),'No está versionado '+file);
});


check('Optimización CPU ULTRA: mezcla de audio sin automatizaciones por fotograma y colores reutilizados',()=>{
 const start=main.indexOf('function updateEnvironment(dt){'),end=main.indexOf('function initAmbientAudio()',start),environment=main.slice(start,end);
 assert.ok(start>=0&&end>start,'No se encuentra el actualizador ambiental');
 assert.equal((environment.match(/setTargetAtTime/g)||[]).length,0,'Audio programa eventos WebAudio repetidos en cada fotograma');
 for(const token of ['function syncAmbientAudioMix()','ambientAudioMixKey','ENVIRONMENT_COLOR_CACHE','ENVIRONMENT_COLOR_SCRATCH','BABYLON.Color3.LerpToRef'])assert.ok(main.includes(token),'Falta optimización CPU '+token);
});
check('Diagnóstico de rendimiento ULTRA: tiempos por sistema y percentiles de fotograma',()=>{
 for(const token of ['cpuStagesMs','frameP50Ms','frameP95Ms','frameP99Ms','fps1PercentLow','frameTimeSamples','gpuFrameTimeMs','captureGPUFrameTime'])assert.ok(main.includes(token),'Falta métrica '+token);
 for(const token of ['cpuStageMs.player','cpuStageMs.herd','cpuStageMs.dinosaurs','cpuStageMs.footFx','cpuStageMs.environment','cpuStageMs.gaze','cpuStageMs.water'])assert.ok(main.includes(token),'Falta desglose CPU '+token);
});


check('Matrices estáticas congeladas sin inmovilizar dinosaurios ni atmósfera móvil',()=>{
 assert.ok(main.includes('function freezeStaticEnvironmentTransforms()'));
 assert.ok(main.includes('mesh.freezeWorldMatrix()'));
 assert.ok(main.includes('node.metadata?.dinoId||node===skyLife?.anchor'));
 assert.ok(main.includes("mesh.name==='sky-dome'"));
 assert.ok(main.includes("mesh.name.startsWith('dino-footprint-pool-')"));
 assert.ok(main.includes('freezeStaticEnvironmentTransforms()'));
 assert.ok(main.includes('frozenWorldMatrices:'));
});


check('Smoke browser tolera frames lentos sin depender de requestAnimationFrame para sondear estado',()=>{
 const smoke=read('tests/browser-smoke.mjs');
 const waits=[...smoke.matchAll(/waitForFunction\([\s\S]*?\{polling:100,timeout:\d+\}\)/g)];
 assert.ok(waits.length>=5,'Las esperas del navegador deben usar polling por intervalo en vez de polling RAF');
 assert.ok(!smoke.includes('},{timeout:60000});'),'La espera de inicio no debe depender del ciclo RAF');
});
