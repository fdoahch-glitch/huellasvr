import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const resultsDir=path.join(root,'test-results');mkdirSync(resultsDir,{recursive:true});
const visualMode=process.env.HUELLAS_VISUAL_TEST==='1',testQuality='media';
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.glb':'model/gltf-binary','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav','.wasm':'application/wasm'};
const server=createServer((req,res)=>{
 let pathname;
 try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end('Bad request');return;}
 if(pathname.endsWith('/'))pathname+='index.html';
 const file=path.resolve(root,'.'+pathname);
 if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end('Forbidden');return;}
 if(!existsSync(file)||!statSync(file).isFile()){res.writeHead(404).end('Not found');return;}
 res.writeHead(200,{'content-type':mime[path.extname(file).toLowerCase()]||'application/octet-stream','cache-control':'no-store'});
 createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(4173,'127.0.0.1',resolve));
let browser;
let failed=false;
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']});
 for(const world of ['atacamatitan','arackar','patagonia','stegouros','aysen']){
  const page=await browser.newPage({viewport:{width:1280,height:800}});
  const pageErrors=[],failedRequests=[];
  page.on('pageerror',e=>pageErrors.push(String(e.stack||e)));page.on('framenavigated',frame=>console.log('FRAME_NAVIGATED',world,frame.url()));page.on('crash',()=>console.error('PAGE_CRASHED',world));page.on('close',()=>console.error('PAGE_CLOSED',world));
  page.on('console',m=>{if(m.type()==='error')pageErrors.push('console: '+m.text());});
  page.on('requestfailed',r=>failedRequests.push(r.url()+': '+(r.failure()?.errorText||'request failed')));
  page.on('response',r=>{if(r.status()>=400)failedRequests.push(r.status()+' '+r.url());});
  const url='http://127.0.0.1:4173/?mundo='+world+'&test=1&debug=1';
  console.log('LOAD',world,url);
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  try{
   await page.waitForFunction(()=>{
    return window.__HUELLAS_VR_READY__===true||!!window.__HUELLAS_VR_INIT_ERROR__;
   },undefined,{polling:100,timeout:90000});
  }catch(error){
   const startup=await page.evaluate(()=>({url:location.href,readyState:document.readyState,ready:window.__HUELLAS_VR_READY__,initError:window.__HUELLAS_VR_INIT_ERROR__,diagnostics:window.__HUELLAS_VR_DIAGNOSTICS__?.(),loadText:document.querySelector('#loadText')?.textContent,startButtons:document.querySelector('#startButtons')?.className})).catch(e=>({evaluateError:String(e)}));
   const shot=path.join(resultsDir,world+'-startup-failure.png');
   await page.screenshot({path:shot,fullPage:false}).catch(()=>{});
   throw new Error(world+' no completó el arranque real en 90 s: '+error.message+'; startup='+JSON.stringify(startup)+'; pageErrors='+pageErrors.slice(0,12).join(' | ')+'; failedRequests='+failedRequests.slice(0,20).join(' | ')+'; screenshot='+shot);
  }
  const startup=await page.evaluate(()=>({ready:window.__HUELLAS_VR_READY__,initError:window.__HUELLAS_VR_INIT_ERROR__,message:document.querySelector('#loadText')?.textContent||''}));
  if(startup.initError){
   const shot=path.join(resultsDir,world+'-initialization-error.png');
   await page.screenshot({path:shot,fullPage:false}).catch(()=>{});
   throw new Error(world+' falló en '+startup.initError.stage+': '+startup.initError.message+'; '+startup.initError.stack+'; pageErrors='+pageErrors.slice(0,12).join(' | ')+'; failedRequests='+failedRequests.slice(0,20).join(' | ')+'; screenshot='+shot);
  }
  if(startup.ready!==true)throw new Error(world+' no confirmó el estado de arranque completo: '+JSON.stringify(startup));
  await page.locator('#explore').click();
  await page.waitForFunction(()=>!document.querySelector('#hud')?.classList.contains('hidden'),undefined,{polling:100,timeout:5000});
  await page.waitForTimeout(1200);
  const nativeVegetation=await page.evaluate(()=>{const v=window.__HUELLAS_PROCEDURAL_VEGETATION__;return v?{created:v.created,backend:v.backend,total:v.total,trees:v.trees,grass:v.grass,ferns:v.ferns,shrubs:v.shrubs,treeLod:v.treeLod,treeCullDistance:v.treeCullDistance,treeMeshes:(v.treeMeshes||[]).map(m=>({name:m.name,visible:m.isVisible,enabled:m.isEnabled(),instances:m.thinInstanceCount||0})),windMaterials:v.windMaterials,proceduralBump:v.proceduralBump}:null;});
  if(!nativeVegetation?.created||nativeVegetation.backend!=='babylon-native-thin-instances'||nativeVegetation.total<1)throw new Error(world+' no generó vegetación nativa Babylon suficiente: '+JSON.stringify(nativeVegetation));
  if(nativeVegetation.trees<1||nativeVegetation.grass<0||nativeVegetation.ferns<0||nativeVegetation.shrubs<0||nativeVegetation.treeMeshes?.length!==4||nativeVegetation.treeMeshes.some(m=>!m.visible||!m.enabled||m.instances<1))throw new Error(world+' árboles nativos no visibles/habilitados o instancias incompletas: '+JSON.stringify(nativeVegetation));
  const nearCamera=await page.evaluate(()=>window.__HUELLAS_VR_TEST__?.cameraPosition?.());
  await page.screenshot({path:path.join(resultsDir,world+'-vegetation-near.png'),fullPage:false,timeout:120000,waitForFonts:false,animations:'disabled'});
  await page.evaluate(()=>window.__HUELLAS_VR_TEST__?.moveCameraAlongView?.(55));
  await page.waitForTimeout(550);
  await page.screenshot({path:path.join(resultsDir,world+'-vegetation-far.png'),fullPage:false,timeout:120000,waitForFonts:false,animations:'disabled'});
  if(nearCamera)await page.evaluate(p=>window.__HUELLAS_VR_TEST__?.setCameraPosition?.(p.x,p.y,p.z),nearCamera);
  await page.waitForTimeout(450);
  console.log('NATIVE_VEGETATION_PASS',world,JSON.stringify(nativeVegetation));
  if(visualMode)await page.waitForFunction(()=>window.__HUELLAS_VR_DIAGNOSTICS__?.().visual?.environmentReady===true,undefined,{polling:100,timeout:20000});
  const state=await page.evaluate(()=>{
   const d=window.__HUELLAS_VR_DIAGNOSTICS__?.();
   return {message:document.querySelector('#loadText')?.textContent||'',diagnostics:d||null};
  });
  await page.screenshot({path:path.join(resultsDir,world+'-'+testQuality+'.png'),fullPage:false,timeout:120000,waitForFonts:false,animations:'disabled'});
  if(world==='atacamatitan'){
   const inventory=await page.evaluate(()=>window.__HUELLAS_VR_TEST__?.visualMeshInventory?.()||[]);
   console.log('VISUAL_MESH_INVENTORY',world,JSON.stringify(inventory));
   await page.evaluate(()=>{window.__HUELLAS_VR_TEST__?.setSkyLayer?.('pterosaurs',false);window.__HUELLAS_VR_TEST__?.setSkyLayer?.('clouds',false);});
   await page.screenshot({path:path.join(resultsDir,world+'-sky-layers-off.png'),fullPage:false,timeout:120000,waitForFonts:false,animations:'disabled'});
   await page.evaluate(()=>{window.__HUELLAS_VR_TEST__?.setSkyLayer?.('pterosaurs',true);window.__HUELLAS_VR_TEST__?.setSkyLayer?.('clouds',true);});
  }
  if(!state.message.includes('¡Mundo listo!'))throw new Error(world+' no inició: '+state.message);
  if(!state.diagnostics)throw new Error(world+' no expuso el diagnóstico');
  if(state.diagnostics.webglVersion!==2)throw new Error(world+' no usó WebGL2: '+state.diagnostics.webglVersion);
  if(!state.diagnostics.visual?.pipeline)throw new Error(world+' no activó el pipeline visual Babylon: '+JSON.stringify(state.diagnostics.visual));
  const paleo=state.diagnostics.paleogeography;if(!paleo||paleo.world!==world||paleo.vertices<5000||paleo.triangles<8000||paleo.rockInstances<50||!state.diagnostics.terrain?.mesh?.startsWith?.('paleogeography-ground-')||!state.diagnostics.terrain?.meshVisible||!state.diagnostics.terrain?.meshEnabled||state.diagnostics.terrain?.meshTriangles<8000)throw new Error(world+' no completó la reconstrucción geométrica paleogeográfica: '+JSON.stringify({paleo,terrain:state.diagnostics.terrain}));
  if(!['gpu','cpu'].includes(state.diagnostics.visual?.particleBackend))throw new Error(world+' no informó backend de partículas válido: '+JSON.stringify(state.diagnostics.visual));
  if(state.diagnostics.quality!=='Equilibrado'||state.diagnostics.visual?.ssao||state.diagnostics.visual?.ssr)throw new Error('El perfil único equilibrado debe evitar efectos pesados: '+JSON.stringify(state.diagnostics.visual));
  if(visualMode&&!state.diagnostics.visual?.environmentReady)throw new Error(world+' no terminó de cargar IBL local: '+JSON.stringify(state.diagnostics.visual));
  if(visualMode&&state.diagnostics.visual?.environmentError)throw new Error(world+' falló la iluminación IBL: '+state.diagnostics.visual.environmentError);
  if(visualMode&&state.diagnostics.terrain?.skyFogEnabled!==false)throw new Error(world+' el panorama sigue afectado por la niebla: '+state.diagnostics.skyFogEnabled);
  if(visualMode&&!state.diagnostics.terrain?.albedoTexture)throw new Error(world+' no enlazó la textura albedo PBR del terreno: '+JSON.stringify(state.diagnostics.terrain));
  if(visualMode&&state.diagnostics.terrain?.groundBackFaceCulling!==true)throw new Error(world+' el terreno perdió el culling frontal optimizado');
  if(visualMode&&(!state.diagnostics.terrain?.cloudTextureHasAlpha||!state.diagnostics.terrain?.skyTextureReady))throw new Error(world+' no preparó correctamente las texturas del cielo: '+JSON.stringify(state.diagnostics.terrain));
  if(world==='atacamatitan'){const panel=await page.locator('#huellasPerfDiagnostics').textContent();if(!panel||!panel.includes('Draw calls')||!panel.includes('Havok'))throw new Error(world+' no mostró el panel de diagnóstico completo');}
  if(!state.diagnostics.sky?.ready||state.diagnostics.sky.error)throw new Error(world+' no cargó el panorama '+JSON.stringify(state.diagnostics.sky));
  if(!Number.isFinite(state.diagnostics.cameraFar)||state.diagnostics.cameraFar<=450)throw new Error(world+' el plano lejano recorta la esfera del cielo: '+state.diagnostics.cameraFar);
  const expectedSky={atacamatitan:'img/atacamatitan_sky.jpg',arackar:'img/arackar_sky.jpg',patagonia:'img/gonkoken_sky.jpg',stegouros:'img/stegouros_sky.jpg',aysen:'img/aysen_sky.jpg'};
  if(state.diagnostics.sky.url!==expectedSky[world])throw new Error(world+' asignó un panorama incorrecto: '+state.diagnostics.sky.url);
  if(!state.diagnostics.terrain?.photo||!state.diagnostics.terrain?.normal||state.diagnostics.terrain.error)throw new Error(world+' no cargó las texturas esenciales del terreno '+JSON.stringify(state.diagnostics.terrain));
  if(!state.diagnostics.terrain.diffuseReady||state.diagnostics.terrain.uvCount<6||!state.diagnostics.terrain.photoSample)throw new Error(world+' textura del terreno no enlazada al mesh: '+JSON.stringify(state.diagnostics.terrain));
  if(!String(state.diagnostics.terrain.materialType||'').includes('PBR'))throw new Error(world+' no usa material PBR en el terreno: '+state.diagnostics.terrain.materialType);
  const expectedMaskResolution=320;if(state.diagnostics.terrain.maskResolution!==expectedMaskResolution||state.diagnostics.terrain.layerCount!==3)throw new Error(world+' no aplicó la mezcla de tres capas con resolución de perfil: '+JSON.stringify(state.diagnostics.terrain));
  if(!Number.isFinite(state.diagnostics.renderScale)||state.diagnostics.renderScale<state.diagnostics.adaptiveResolution.min||state.diagnostics.renderScale>state.diagnostics.adaptiveResolution.max)throw new Error(world+' escala adaptativa de render fuera de límites: '+JSON.stringify(state.diagnostics.adaptiveResolution));
  if(state.diagnostics.dinosaurs!==15)throw new Error(world+' debe cargar exactamente 15 dinosaurios en '+testQuality+'; cargó '+state.diagnostics.dinosaurs);
  if(!Number.isFinite(state.diagnostics.vegetationInstances)||state.diagnostics.vegetationInstances<1)throw new Error(world+' no generó vegetación paleogeográfica nativa: '+state.diagnostics.vegetationInstances);
  if(!nativeVegetation||nativeVegetation.backend!=='babylon-native-thin-instances')throw new Error(world+' no utiliza el sistema de vegetación nativo de Babylon');
  if(state.diagnostics.drinkPoints<1)throw new Error(world+' no precalculó puntos válidos para beber: '+state.diagnostics.drinkPoints);
  if(state.diagnostics.dinoStates?.length!==15||state.diagnostics.dinoStates.some(d=>!d.active||!d.clip))throw new Error(world+' tiene uno o más dinosaurios sin animación activa en '+testQuality);
  const modeButtons=await page.evaluate(()=>({panorama:document.querySelector('#explore')?.textContent||'',stereo:document.querySelector('#visor')?.textContent||''}));
  if(!modeButtons.panorama.includes('360°')||!modeButtons.stereo.includes('visor'))throw new Error(world+' no presenta las dos modalidades móviles en el selector inicial: '+JSON.stringify(modeButtons));
  const stereoOn=await page.evaluate(()=>window.__HUELLAS_VR_TEST__?.toggleStereo?.());
  if(!stereoOn?.enabled||stereoOn.rigCameras!==2)throw new Error(world+' no activó el modo estereoscópico con dos cámaras: '+JSON.stringify(stereoOn));
  await page.evaluate(()=>window.__HUELLAS_VR_TEST__.setCameraRotation(.21,.42,.63));
  const stereoOff=await page.evaluate(()=>window.__HUELLAS_VR_TEST__?.toggleStereo?.());
  if(stereoOff?.enabled||stereoOff.rigCameras!==0)throw new Error(world+' no restauró la cámara panorámica al salir del modo visor: '+JSON.stringify(stereoOff));
  const restoredRotation=await page.evaluate(()=>window.__HUELLAS_VR_TEST__.cameraRotation());
  if(Math.abs(restoredRotation.x-.21)>.001||Math.abs(restoredRotation.y-.42)>.001||Math.abs(restoredRotation.z-.63)>.001)throw new Error(world+' perdió la orientación al volver del visor: '+JSON.stringify(restoredRotation));
  const xrNotice=await page.evaluate(()=>window.__HUELLAS_VR_TEST__?.sensorNotice?.('xr'));
  if(xrNotice?.mode!=='xr'||!xrNotice.title.includes('WebXR')||!xrNotice.retry.includes('WebXR'))throw new Error(world+' no distinguió la recuperación WebXR: '+JSON.stringify(xrNotice));
  const orientationNotice=await page.evaluate(()=>window.__HUELLAS_VR_TEST__?.sensorNotice?.('orientation'));
  if(orientationNotice?.mode!=='orientation'||!orientationNotice.title.includes('movimiento')||orientationNotice.retry!=='Reintentar')throw new Error(world+' no distinguió la recuperación de sensores móviles: '+JSON.stringify(orientationNotice));
  await page.evaluate(()=>document.querySelector('#continueTouch')?.click());
  const mobileModes=await page.evaluate(()=>window.__HUELLAS_VR_TEST__?.mobileModes?.());
  if(!mobileModes||mobileModes.stereoEnabled)throw new Error(world+' dejó el motor en estado estereoscópico inesperado: '+JSON.stringify(mobileModes));
  console.log('MOBILE_MODES_PASS',world,JSON.stringify({modeButtons,stereoOn,stereoOff,mobileModes}));
  const herdCheckAll=await page.evaluate(()=>window.__HUELLAS_VR_TEST__?.dinoBehaviorCheck?.());
  if(!herdCheckAll||herdCheckAll.count!==15||herdCheckAll.overlaps!==0)throw new Error(world+' presenta manada incompleta o solapada en '+testQuality+': '+JSON.stringify(herdCheckAll));
  if(!state.diagnostics.physics?.enabled||!state.diagnostics.physics?.controller||state.diagnostics.physics.colliders<1)throw new Error(world+' no inicializó Havok en '+testQuality+': '+JSON.stringify(state.diagnostics.physics));
  if(state.diagnostics.physics.obstacleColliders<1||state.diagnostics.physics.environmentZones<state.diagnostics.physics.obstacleColliders)throw new Error(world+' no preparó colisiones físicas del entorno y zonas de evitación completas: '+JSON.stringify(state.diagnostics.physics));
  if(state.diagnostics.dinoLod?.withoutLow!==0)throw new Error(world+' no cargó los 15 modelos LOD reducidos: '+JSON.stringify(state.diagnostics.dinoLod));
  const lodCheckAll=await page.evaluate(()=>window.__HUELLAS_VR_TEST__?.lodCheck?.());
  if(!lodCheckAll||lodCheckAll.count!==15||lodCheckAll.farLow!==15||lodCheckAll.nearHigh!==15||lodCheckAll.available!==15)throw new Error(world+' no cambia los 15 modelos por distancia en '+testQuality+': '+JSON.stringify(lodCheckAll));
  await page.waitForTimeout(350);
  if(visualMode){
   const visual=state.diagnostics.terrain||{};
   if(world==='atacamatitan'&&visual.riverBankMeshes!==0)throw new Error(world+' no debe mostrar ríos permanentes: '+visual.riverBankMeshes);if(['patagonia','stegouros','aysen'].includes(world)&&visual.riverBankMeshes<2)throw new Error(world+' no generó las orillas del sistema fluvial/deltaico: '+visual.riverBankMeshes);
   if(visual.cloudDomeDiameter<860||visual.cloudDomeDiameter>890)throw new Error(world+' la cúpula de nubes no conserva la escala original: '+visual.cloudDomeDiameter);
   if(visual.proceduralForestMeshes!==0)throw new Error(world+' conserva copas procedurales separadas de sus troncos: '+visual.proceduralForestMeshes);
   if(!visual.skyDomeVisible)throw new Error(world+' no muestra la esfera del panorama original');
  }
  if(!visualMode){
  await page.waitForFunction(()=>window.__HUELLAS_VR_DIAGNOSTICS__?.().physics?.controller===true,undefined,{polling:100,timeout:15000});
  const collision=await page.evaluate(()=>window.__HUELLAS_VR_TEST__?.collisionCheck?.());if(!collision?.havok||collision.aggregates<1||collision.environmentZones<1||collision.obstacleColliders<1||!collision.probeBlocked||!collision.playerProbeBlocked)throw new Error(world+' no valida colisión de jugador y dinosaurios con obstáculos: '+JSON.stringify(collision));
  console.log('GROUND',world,JSON.stringify(state.diagnostics.terrain));
  if(!state.diagnostics.physics?.enabled||!state.diagnostics.physics?.controller||state.diagnostics.physics.colliders<1)throw new Error(world+' no inicializó Havok Physics V2: '+JSON.stringify(state.diagnostics.physics));
  const physicsProbe=await page.evaluate(()=>window.__HUELLAS_VR_TEST__?.probeGroundSupport?.());
  if(!physicsProbe?.ready||physicsProbe.support!=='grounded')throw new Error(world+' Havok no detectó apoyo en la superficie de terreno muestreada: '+JSON.stringify(physicsProbe)+'; diagnostics='+JSON.stringify(await page.evaluate(()=>window.__HUELLAS_VR_DIAGNOSTICS__?.().physics)));
  if(state.diagnostics.dinosaurs!==15)throw new Error(world+' debe cargar exactamente 15 dinosaurios; cargó '+state.diagnostics.dinosaurs);
  if(state.diagnostics.dinoLod?.withoutLow!==0)throw new Error(world+' no cargó los 15 modelos LOD reducidos: '+JSON.stringify(state.diagnostics.dinoLod));
  const lodCheck=await page.evaluate(()=>window.__HUELLAS_VR_TEST__?.lodCheck?.());
  if(!lodCheck||lodCheck.count!==15||lodCheck.farLow!==15||lodCheck.nearHigh!==15||lodCheck.available!==15)throw new Error(world+' no cambió los 15 modelos por distancia con histéresis: '+JSON.stringify(lodCheck));
  await page.waitForTimeout(350);
  if(!state.diagnostics.dinoStates?.length||state.diagnostics.dinoStates.some(d=>!d.active||!d.clip))throw new Error(world+' tiene dinosaurios sin AnimationGroup activo: '+JSON.stringify(state.diagnostics.dinoStates));
  const herdCheck=await page.evaluate(()=>window.__HUELLAS_VR_TEST__?.dinoBehaviorCheck?.());
  if(!herdCheck||herdCheck.count!==state.diagnostics.dinosaurs||herdCheck.overlaps!==0)throw new Error(world+' presenta superposición entre dinosaurios al iniciar: '+JSON.stringify(herdCheck));
  if(!state.diagnostics.dinoStates.every(d=>d.personality&&typeof d.juvenile==='boolean'))throw new Error(world+' no asignó personalidad/edad a cada dinosaurio');
  if(!state.diagnostics.dinoStates.some(d=>d.juvenile))throw new Error(world+' no incluyó juveniles en la manada reducida: '+JSON.stringify(state.diagnostics.dinoStates.map(d=>({id:d.id,length:d.length,juvenile:d.juvenile}))));
  const socialCheck=await page.evaluate(()=>window.__HUELLAS_VR_TEST__?.exerciseSocial?.());
  const approachCheck=await page.evaluate(()=>window.__HUELLAS_VR_TEST__?.exercisePlayerApproach?.());
  if(!socialCheck?.started)throw new Error(world+' no pudo iniciar una interacción entre dinosaurios: '+JSON.stringify(socialCheck));
  if(!approachCheck?.started)throw new Error(world+' no pudo iniciar un acercamiento al jugador: '+JSON.stringify(approachCheck));
  console.log('HERD',world,JSON.stringify({herdCheck,socialCheck,approachCheck}));
  await page.waitForTimeout(2200);
  const movingHerdCheck=await page.evaluate(()=>window.__HUELLAS_VR_TEST__?.dinoBehaviorCheck?.());
  if(!movingHerdCheck||movingHerdCheck.overlaps!==0)throw new Error(world+' perdió la separación durante el movimiento: '+JSON.stringify(movingHerdCheck));
  const longRunHerd=await page.evaluate(()=>window.__HUELLAS_VR_TEST__?.simulateHerd?.(600));
  if(!longRunHerd||longRunHerd.count!==15||longRunHerd.overlaps!==0)throw new Error(world+' perdió separación o navegación en simulación extendida: '+JSON.stringify(longRunHerd));
  if(state.diagnostics.meshes<10||state.diagnostics.textures<1)throw new Error(world+' no generó mallas/texturas suficientes: '+JSON.stringify(state.diagnostics));
  // SwiftShader puede bloquear el render durante segundos en la prueba de máxima carga; la reproducción dinámica de clips se valida en la pasada funcional. La auditoría estática verifica los cuatro clips de cada GLB también en los modelos de alta calidad.
  if(!visualMode)for(const clip of ['Idle','Walk','Run','Neck_Look']){
   const before=await page.evaluate(name=>window.__HUELLAS_VR_TEST__.setAnimation(name),clip);
   if(!before.active||!before.playing)throw new Error(world+' no inició inmediatamente el clip '+clip+': '+JSON.stringify(before));
   try{
    await page.waitForFunction(name=>{
     const d=window.__HUELLAS_VR_DIAGNOSTICS__?.().dinoStates?.[0];
     return d&&d.clip===name&&d.active&&d.playing;
    },clip,{polling:100,timeout:10000});
   }catch(error){
    const diagnostic=await page.evaluate(()=>window.__HUELLAS_VR_DIAGNOSTICS__?.().dinoStates?.[0]||null).catch(()=>null);
    throw new Error(world+' no mantuvo activo el clip '+clip+': '+JSON.stringify(diagnostic)+'; '+error.message);
   }
   await page.waitForTimeout(300);
   if((clip==='Walk'||clip==='Run')&&before.movementPathFound){
    await page.evaluate(()=>window.__HUELLAS_VR_TEST__.advanceDinoSimulation(8));
    const after=await page.evaluate(()=>window.__HUELLAS_VR_DIAGNOSTICS__().dinoStates[0].position);
    const moved=Math.hypot(after.x-before.position.x,after.z-before.position.z);
    if(moved<.02){const debug=await page.evaluate(()=>window.__HUELLAS_VR_DIAGNOSTICS__().dinoStates[0]);throw new Error(world+' no desplazó el dinosaurio durante '+clip+' (distancia '+moved+'): '+JSON.stringify({before,after,debug}));}
   }
  }
  }
  if(pageErrors.length)throw new Error(world+' errores de navegador: '+pageErrors.slice(0,8).join('\n'));
  console.log('PASS',world,JSON.stringify({fps:state.diagnostics.fps,meshes:state.diagnostics.meshes,textures:state.diagnostics.textures,dinosaurs:state.diagnostics.dinosaurs,clips:[...new Set(state.diagnostics.dinoStates.map(d=>d.clip))]}));
  await page.close();
 }
}catch(error){failed=true;console.error('FAIL browser smoke:',error);}
finally{await browser?.close();server.close();}
if(failed)process.exit(1);
