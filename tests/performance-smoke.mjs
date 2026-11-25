import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.glb':'model/gltf-binary','.jpg':'image/jpeg','.png':'image/png','.wasm':'application/wasm'};
const server=createServer((req,res)=>{
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
 if(pathname.endsWith('/'))pathname+='index.html';
 const file=path.resolve(root,'.'+pathname);
 if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}
 if(!existsSync(file)||!statSync(file).isFile()){res.writeHead(404).end();return;}
 res.writeHead(200,{'content-type':mime[path.extname(file).toLowerCase()]||'application/octet-stream','cache-control':'no-store'});createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(4174,'127.0.0.1',resolve));
let browser,failed=false,hardwareValidated=false;
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--enable-webgl','--ignore-gpu-blocklist']});
 const results=[];let softwareOnly=false;
 for(const quality of ['equilibrado']){
  for(const world of ['atacamatitan','arackar','patagonia','stegouros','aysen']){
   const page=await browser.newPage({viewport:{width:1280,height:800}});
   const errors=[];page.on('pageerror',e=>errors.push(String(e)));
   await page.goto('http://127.0.0.1:4174/?mundo='+world+'&test=1&debug=1',{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForFunction(()=>{const t=document.querySelector('#loadText')?.textContent||'';return t.includes('¡Mundo listo!')||t.includes('No se pudo iniciar el mundo');},{polling:100,timeout:90000});
   const msg=await page.locator('#loadText').textContent();
   if(!msg.includes('¡Mundo listo!'))throw new Error(world+' no pudo cargar en '+quality+': '+msg);
   const renderer=await page.evaluate(()=>{
    const gl=document.querySelector('#renderCanvas')?.getContext('webgl2');
    const ext=gl?.getExtension('WEBGL_debug_renderer_info');
    return ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):'renderer-info-unavailable';
   });
   if(!renderer||renderer==='renderer-info-unavailable'||/swiftshader|llvmpipe|software rasterizer|softpipe/i.test(renderer)){
    console.log('PERFORMANCE_NOT_MEASURED: '+renderer+'; pruebas de GPU física omitidas sin convertir SwiftShader en FPS real.');
    softwareOnly=true;await page.close();break;
   }
   hardwareValidated=true;
   await page.waitForTimeout(12000);
   const d=await page.evaluate(()=>window.__HUELLAS_VR_DIAGNOSTICS__?.());
   const row={profile:quality,world,renderer,fps:d?.fps,frameP95Ms:d?.frameP95Ms,frameP99Ms:d?.frameP99Ms,fps1PercentLow:d?.fps1PercentLow,gpuFrameTimeMs:d?.gpuFrameTimeMs,cpuUpdateAvgMs:d?.cpuUpdateAvgMs,drawCalls:d?.drawCalls};
   results.push(row);console.log('HARDWARE_PERFORMANCE',JSON.stringify(row));
   if(!d||!Number.isFinite(d.frameP95Ms)||d.frameP95Ms>16.7||!Number.isFinite(d.fps1PercentLow)||d.fps1PercentLow<55)throw new Error(world+' '+quality+' no alcanzó el objetivo sostenido de 60 FPS: '+JSON.stringify(row));
   if(errors.length)throw new Error(world+' '+quality+' errores de navegador: '+errors.join(' | '));
   await page.close();
  }
  if(softwareOnly)break;
 }
 if(hardwareValidated)console.log('ALL_15_COMBINATIONS_HARDWARE_PASS',JSON.stringify(results));
 else console.log('HARDWARE_15_COMBINATIONS_PENDING: ejecutar las 15 combinaciones en PC/Android con GPU física; CI solo dispone de renderizado por software.');
}catch(e){failed=true;console.error('ALTA_PERFORMANCE_FAIL',e);}
finally{await browser?.close();server.close();}
if(failed)process.exit(1);
