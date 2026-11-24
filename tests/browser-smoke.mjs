import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const resultsDir=path.join(root,'test-results');mkdirSync(resultsDir,{recursive:true});
const visualMode=process.env.HUELLAS_VISUAL_TEST==='1',testQuality=visualMode?'ultra':'baja';
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
  page.on('pageerror',e=>pageErrors.push(String(e.stack||e)));
  page.on('console',m=>{if(m.type()==='error')pageErrors.push('console: '+m.text());});
  page.on('requestfailed',r=>failedRequests.push(r.url()+': '+(r.failure()?.errorText||'request failed')));
  page.on('response',r=>{if(r.status()>=400)failedRequests.push(r.status()+' '+r.url());});
  const url='http://127.0.0.1:4173/?mundo='+world+'&q='+testQuality+'&test=1&debug=1';
  console.log('LOAD',world,url);
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  try{
   await page.waitForFunction(()=>{
    const t=document.querySelector('#loadText')?.textContent||'';
    return t.includes('¡Mundo listo!')||t.includes('No se pudo iniciar el mundo');
   },{polling:100,timeout:60000});
  }catch(error){
   const progress=await page.locator('#loadText').textContent().catch(()=>' (sin texto de carga)');
   const startup=await page.evaluate(()=>({url:location.href,readyState:document.readyState,homeHidden:document.querySelector('#homeScreen')?.classList.contains('hidden'),mainScript:[...document.scripts].map(s=>s.src).filter(Boolean),babylon:typeof window.BABYLON,havok:typeof window.HavokPhysics,loadText:document.querySelector('#loadText')?.textContent})).catch(e=>({evaluateError:String(e)}));
   const shot=path.join(resultsDir,world+'-startup-failure.png');
   await page.screenshot({path:shot,fullPage:false}).catch(()=>{});
   throw new Error(world+' excedió 60 s durante la carga: '+progress+'; '+error.message+'; startup='+JSON.stringify(startup)+'; pageErrors='+pageErrors.slice(0,12).join(' | ')+'; failedRequests='+failedRequests.slice(0,20).join(' | ')+'; screenshot='+shot);
  }
  const startupMessage=await page.locator('#loadText').textContent().catch(()=>'');
  if(startupMessage.includes('No se pudo iniciar el mundo')){
   const shot=path.join(resultsDir,world+'-initialization-error.png');
   await page.screenshot({path:shot,fullPage:false}).catch(()=>{});
   throw new Error(world+' falló durante la inicialización: '+startupMessage+'; pageErrors='+pageErrors.slice(0,12).join(' | ')+'; failedRequests='+failedRequests.slice(0,20).join(' | ')+'; screenshot='+shot);
  }
  if(!startupMessage.includes('¡Mundo listo!'))throw new Error(world+' no llegó al estado listo; mensaje='+startupMessage);
  await page.locator('#explore').click();
  await page.waitForFunction(()=>!document.querySelector('#hud')?.classList.contains('hidden'),{polling:100,timeout:5000});
  await page.waitForTimeout(1200);
  if(visualMode)await page.waitForFunction(()=>window.__HUELLAS_VR_DIAGNOSTICS__?.().visual?.environmentReady===true,{polling:100,timeout:20000});
  await page.screenshot({path:path.join(resultsDir,world+'-'+testQuality+'.png'),fullPage:false,timeout:120000,animations:'disabled'});
  const state=await page.evaluate(()=>{
   const d=window.__HUELLAS_VR_DIAGNOSTICS__?.();
   return {message:document.querySelector('#loadText')?.textContent||'',diagnostics:d||null};
  });
  if(!state.message.includes('¡Mundo listo!'))throw new Error(world+' no inició: '+state.message);
  if(!state.diagnostics)throw new Error(world+' no expuso el diagnóstico');
  if(state.diagnostics.webglVersion!==2)throw new Error(world+' no usó WebGL2: '+state.diagnostics.webglVersion);
  if(!state.diagnostics.visual?.pipeline)throw new Error(world+' no activó el pipeline visual Babylon: '+JSON.stringify(state.diagnostics.visual));
  if(!['gpu','cpu'].includes(state.diagnostics.visual?.particleBackend))throw new Error(world+' no informó backend de partículas válido: '+JSON.stringify(state.diagnostics.visual));
  if(!visualMode&&world==='atacamatitan'&&state.diagnostics.visual?.ssao)throw new Error('SSAO no debe activarse en el perfil bajo de la prueba');
  if(visualMode&&!state.diagnostics.visual?.environmentReady)throw new Error(world+' no terminó de cargar IBL local: '+JSON.stringify(state.diagnostics.visual));
  if(visualMode&&state.diagnostics.visual?.environmentError)throw new Error(world+' falló la iluminación IBL: '+state.diagnostics.visual.environmentError);
  if(visualMode&&state.diagnostics.terrain?.skyFogEnabled!==false)throw new Error(world+' el panorama sigue afectado por la niebla: '+state.diagnostics.skyFogEnabled);
  if(visualMode&&!state.diagnostics.terrain?.albedoTexture)throw new Error(world+' no enlazó la textura albedo PBR del terreno: '+JSON.stringify(state.diagnostics.terrain));
  if(visualMode&&state.diagnostics.terrain?.groundBackFaceCulling!==true)throw new Error(world+' el terreno perdió el culling frontal optimizado');
  if(visualMode&&(!state.diagnostics.terrain?.cloudTextureHasAlpha||!state.diagnostics.terrain?.skyTextureReady))throw new Error(world+' no preparó correctamente las texturas del cielo: '+JSON.stringify(state.diagnostics.terrain));
  if(world==='atacamatitan'){const panel=await page.locator('#huellasPerfDiagnostics').textContent();if(!panel||!panel.includes('Draw calls')||!panel.includes('Havok'))throw new Error(world+' no mostró el panel de diagnóstico completo');}
  if(!state.diagnostics.sky?.ready||state.diagnostics.sky.error)throw new Error(world+' no cargó el panorama '+JSON.stringify(state.diagnostics.sky));
  const expectedSky={atacamatitan:'img/atacamatitan_sky.jpg',arackar:'img/arackar_sky.jpg',patagonia:'img/gonkoken_sky.jpg',stegouros:'img/stegouros_sky.jpg',aysen:'img/aysen_sky.jpg'};
  if(state.diagnostics.sky.url!==expectedSky[world])throw new Error(world+' asignó un panorama incorrecto: '+state.diagnostics.sky.url);
  if(!state.diagnostics.terrain?.photo||!state.diagnostics.terrain?.normal||state.diagnostics.terrain.error)throw new Error(world+' no cargó las texturas esenciales del terreno '+JSON.stringify(state.diagnostics.terrain));
  if(!state.diagnostics.terrain.diffuseReady||state.diagnostics.terrain.uvCount<6||!state.diagnostics.terrain.photoSample)throw new Error(world+' textura del terreno no enlazada al mesh: '+JSON.stringify(state.diagnostics.terrain));
  if(!String(state.diagnostics.terrain.materialType||'').includes('PBR'))throw new Error(world+' no usa material PBR en el terreno: '+state.diagnostics.terrain.materialType);
  if(visualMode){
   const visual=state.diagnostics.terrain||{};
   if(visual.riverBankMeshes!==0)throw new Error(world+' generó bancos de río que el original v19 desactiva: '+visual.riverBankMeshes);
   if(visual.cloudDomeDiameter<490||visual.cloudDomeDiameter>505)throw new Error(world+' la cúpula de nubes quedó fuera de la esfera del cielo: '+visual.cloudDomeDiameter);
   if(visual.proceduralForestMeshes!==0)throw new Error(world+' conserva copas procedurales separadas de sus troncos: '+visual.proceduralForestMeshes);
   if(!visual.skyDomeVisible||!visual.skyDomeAtCamera)throw new Error(world+' no renderiza el skybox centrado en cámara: '+JSON.stringify({visible:visual.skyDomeVisible,atCamera:visual.skyDomeAtCamera}));
  }
  if(!visualMode){
  const collision=await page.evaluate(()=>window.__HUELLAS_VR_TEST__?.collisionCheck?.());if(!collision?.havok||collision.aggregates<1||collision.environmentZones<1||!collision.probeBlocked)throw new Error(world+' no valida colisión con obstáculos: '+JSON.stringify(collision));
  console.log('GROUND',world,JSON.stringify(state.diagnostics.terrain));
  if(!state.diagnostics.physics?.enabled||!state.diagnostics.physics?.controller||state.diagnostics.physics.colliders<1)throw new Error(world+' no inicializó Havok Physics V2: '+JSON.stringify(state.diagnostics.physics));
  await page.waitForFunction(()=>window.__HUELLAS_VR_DIAGNOSTICS__?.().physics?.support==='grounded',{polling:100,timeout:15000});
  if(state.diagnostics.dinosaurs<3)throw new Error(world+' cargó menos de tres dinosaurios');
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
  if(state.diagnostics.meshes<10||state.diagnostics.textures<1)throw new Error(world+' no generó mallas/texturas suficientes: '+JSON.stringify(state.diagnostics));
  // SwiftShader puede bloquear el render durante segundos en ULTRA; la reproducción dinámica de clips se valida en la pasada funcional. La auditoría estática verifica los cuatro clips de cada GLB también en los modelos de alta calidad.
  if(!visualMode)for(const clip of ['Idle','Walk','Run','Neck_Look']){
   const before=await page.evaluate(name=>window.__HUELLAS_VR_TEST__.setAnimation(name),clip);
   await page.waitForFunction(name=>{
    const d=window.__HUELLAS_VR_DIAGNOSTICS__?.().dinoStates?.[0];
    return d&&d.clip===name&&d.active&&d.playing;
   },clip,{polling:100,timeout:10000});
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
