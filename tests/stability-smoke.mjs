import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.glb':'model/gltf-binary','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.wasm':'application/wasm'};
const server=createServer((req,res)=>{
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
 if(pathname.endsWith('/'))pathname+='index.html';
 const file=path.resolve(root,'.'+pathname);
 if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}
 if(!existsSync(file)||!statSync(file).isFile()){res.writeHead(404).end();return;}
 res.writeHead(200,{'content-type':mime[path.extname(file).toLowerCase()]||'application/octet-stream','cache-control':'no-store'});createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(4175,'127.0.0.1',resolve));
let browser,failed=false;
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1280,height:800}});
 const client=await page.context().newCDPSession(page);
 await client.send('HeapProfiler.enable').catch(()=>{});
 await client.send('Performance.enable').catch(()=>{});
 const pageErrors=[];page.on('pageerror',e=>pageErrors.push(String(e.stack||e)));
 const worlds=['atacamatitan','arackar','patagonia','stegouros','aysen'],samples=new Map();
 for(let cycle=0;cycle<2;cycle++){
  for(const world of worlds){
   const url='http://127.0.0.1:4175/?mundo='+world+'&q=baja&test=1&debug=1';
   await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForFunction(()=>window.__HUELLAS_VR_READY__===true||!!window.__HUELLAS_VR_INIT_ERROR__,undefined,{polling:100,timeout:90000});
   const startup=await page.evaluate(()=>({ready:window.__HUELLAS_VR_READY__,error:window.__HUELLAS_VR_INIT_ERROR__}));
   if(!startup.ready)throw new Error(world+' ciclo '+cycle+' no inició: '+JSON.stringify(startup.error));
   await page.locator('#explore').click();
   await page.waitForTimeout(450);
   await client.send('HeapProfiler.collectGarbage').catch(()=>{});
   const state=await page.evaluate(()=>{const d=window.__HUELLAS_VR_DIAGNOSTICS__?.();return d?{world:d.world,quality:d.quality,webglVersion:d.webglVersion,dinosaurs:d.dinosaurs,meshes:d.meshes,textures:d.textures,heapMB:d.heapMB,physics:d.physics,drinkPoints:d.drinkPoints}:null;});
   const metrics=await client.send('Performance.getMetrics').catch(()=>({metrics:[]}));
   const heapMetric=metrics.metrics?.find(x=>x.name==='JSHeapUsedSize')?.value;
   const heapMB=Number.isFinite(heapMetric)?Math.round(heapMetric/1048576*100)/100:state?.heapMB??null;
   if(!state||state.dinosaurs!==15||state.webglVersion!==2||!state.physics?.enabled||!state.physics?.controller||state.drinkPoints<1)throw new Error(world+' ciclo '+cycle+' estado de escena incompleto: '+JSON.stringify(state));
   const row={cycle,world,quality:'baja',heapMB,meshes:state.meshes,textures:state.textures,physics:state.physics.enabled,dinosaurs:state.dinosaurs};
   console.log('STABILITY_SAMPLE',JSON.stringify(row));
   const key=world;if(!samples.has(key))samples.set(key,[]);samples.get(key).push(row);
   if(pageErrors.length)throw new Error('Errores de navegador tras navegar repetidamente: '+pageErrors.slice(-8).join(' | '));
  }
 }
 for(const [world,rows] of samples){
  const first=rows[0].heapMB,second=rows[1].heapMB;
  if(Number.isFinite(first)&&Number.isFinite(second)&&second>first*1.85+40)throw new Error(world+' el heap creció excesivamente entre cargas equivalentes: '+JSON.stringify(rows));
 }
 const xr=await page.evaluate(async()=>({api:!!navigator.xr,immersiveVr:!!navigator.xr&&await navigator.xr.isSessionSupported('immersive-vr').catch(()=>false)}));
 console.log('WEBXR_DEVICE_CHECK',JSON.stringify(xr));
 if(!xr.immersiveVr)console.log('WEBXR_HARDWARE_PENDING: el navegador de CI no dispone de visor XR físico; la sesión real debe validarse en un dispositivo compatible.');
 console.log('STABILITY_RELOADS_PASS: diez cargas secuenciales, cinco mundos dos veces; heap JS comparado después de GC.');
}catch(error){failed=true;console.error('STABILITY_FAIL',error);}
finally{await browser?.close();server.close();}
if(failed)process.exit(1);
