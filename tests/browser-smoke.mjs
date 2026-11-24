import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const resultsDir=path.join(root,'test-results');mkdirSync(resultsDir,{recursive:true});
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.glb':'model/gltf-binary','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav'};
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
  const pageErrors=[];
  page.on('pageerror',e=>pageErrors.push(String(e.stack||e)));
  page.on('console',m=>{if(m.type()==='error')pageErrors.push('console: '+m.text());});
  const url='http://127.0.0.1:4173/?mundo='+world+'&q=baja&test=1';
  console.log('LOAD',world,url);
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>{
   const t=document.querySelector('#loadText')?.textContent||'';
   return t.includes('¡Mundo listo!')||t.includes('No se pudo iniciar el mundo');
  },{timeout:180000});
  await page.locator('#explore').click();
  await page.waitForFunction(()=>!document.querySelector('#hud')?.classList.contains('hidden'),{timeout:5000});
  await page.waitForTimeout(1200);
  await page.screenshot({path:path.join(resultsDir,world+'.png'),fullPage:false});
  const state=await page.evaluate(()=>{
   const d=window.__HUELLAS_VR_DIAGNOSTICS__?.();
   return {message:document.querySelector('#loadText')?.textContent||'',diagnostics:d||null};
  });
  if(!state.message.includes('¡Mundo listo!'))throw new Error(world+' no inició: '+state.message);
  if(!state.diagnostics)throw new Error(world+' no expuso el diagnóstico');
  if(!state.diagnostics.sky?.ready||state.diagnostics.sky.error)throw new Error(world+' no cargó el panorama '+JSON.stringify(state.diagnostics.sky));
  const expectedSky={atacamatitan:'img/atacamatitan_sky.jpg',arackar:'img/arackar_sky.jpg',patagonia:'img/gonkoken_sky.jpg',stegouros:'img/stegouros_sky.jpg',aysen:'img/aysen_sky.jpg'};
  if(state.diagnostics.sky.url!==expectedSky[world])throw new Error(world+' asignó un panorama incorrecto: '+state.diagnostics.sky.url);
  if(!state.diagnostics.terrain?.photo||!state.diagnostics.terrain?.normal||state.diagnostics.terrain.error)throw new Error(world+' no cargó las texturas esenciales del terreno '+JSON.stringify(state.diagnostics.terrain));
  if(!state.diagnostics.physics?.enabled||!state.diagnostics.physics?.controller||state.diagnostics.physics.colliders<1)throw new Error(world+' no inicializó Havok Physics V2: '+JSON.stringify(state.diagnostics.physics));
  await page.waitForFunction(()=>window.__HUELLAS_VR_DIAGNOSTICS__?.().physics?.support==='grounded',{timeout:15000});
  if(state.diagnostics.dinosaurs<3)throw new Error(world+' cargó menos de tres dinosaurios');
  if(!state.diagnostics.dinoStates?.length||state.diagnostics.dinoStates.some(d=>!d.active||!d.clip))throw new Error(world+' tiene dinosaurios sin AnimationGroup activo: '+JSON.stringify(state.diagnostics.dinoStates));
  if(state.diagnostics.meshes<10||state.diagnostics.textures<1)throw new Error(world+' no generó mallas/texturas suficientes: '+JSON.stringify(state.diagnostics));
  for(const clip of ['Idle','Walk','Run','Neck_Look']){
   const before=await page.evaluate(name=>window.__HUELLAS_VR_TEST__.setAnimation(name),clip);
   await page.waitForFunction(name=>{
    const d=window.__HUELLAS_VR_DIAGNOSTICS__?.().dinoStates?.[0];
    return d&&d.clip===name&&d.active&&d.playing;
   },clip,{timeout:10000});
   await page.waitForTimeout(300);
   if((clip==='Walk'||clip==='Run')&&before.movementPathFound){
    await page.waitForTimeout(1400);
    const after=await page.evaluate(()=>window.__HUELLAS_VR_DIAGNOSTICS__().dinoStates[0].position);
    const moved=Math.hypot(after.x-before.position.x,after.z-before.position.z);
    if(moved<.02){const debug=await page.evaluate(()=>window.__HUELLAS_VR_DIAGNOSTICS__().dinoStates[0]);throw new Error(world+' no desplazó el dinosaurio durante '+clip+' (distancia '+moved+'): '+JSON.stringify({before,after,debug}));}
   }
  }
  if(pageErrors.length)throw new Error(world+' errores de navegador: '+pageErrors.slice(0,8).join('\n'));
  console.log('PASS',world,JSON.stringify({fps:state.diagnostics.fps,meshes:state.diagnostics.meshes,textures:state.diagnostics.textures,dinosaurs:state.diagnostics.dinosaurs,clips:[...new Set(state.diagnostics.dinoStates.map(d=>d.clip))]}));
  await page.close();
 }
}catch(error){failed=true;console.error('FAIL browser smoke:',error);}
finally{await browser?.close();server.close();}
if(failed)process.exit(1);
