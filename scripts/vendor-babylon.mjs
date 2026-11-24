import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const vendor=path.join(root,'vendor','babylon');
const packages=[
  {root:path.join(root,'node_modules','babylonjs'),files:[{pattern:/^babylon\.js$/,dest:'babylon.js'}]},
  {root:path.join(root,'node_modules','babylonjs-loaders'),files:[{pattern:/^babylonjs\.loaders\.min\.js$/,dest:'babylonjs.loaders.min.js'}]},
  {root:path.join(root,'node_modules','@babylonjs','havok'),files:[{pattern:/^HavokPhysics_umd\.js$/,dest:'havok/HavokPhysics_umd.js'},{pattern:/\.wasm$/i,dest:'havok'}]}
];
function findFiles(dir,predicate,out=[]){
  if(!fs.existsSync(dir))throw new Error('No existe el paquete: '+dir);
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(entry.name==='node_modules'||entry.name.startsWith('.'))continue;
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())findFiles(full,predicate,out);
    else if(predicate(entry.name,full))out.push(full);
  }
  return out;
}
fs.rmSync(vendor,{recursive:true,force:true});
fs.mkdirSync(vendor,{recursive:true});
for(const pkg of packages){
  for(const spec of pkg.files){
    const matches=findFiles(pkg.root,name=>spec.pattern.test(name));
    if(!matches.length)throw new Error('No se encontró '+spec.pattern+' en '+pkg.root);
    if(spec.pattern.source.includes('wasm')){
      for(const file of matches){
        const dest=path.join(vendor,spec.dest,path.basename(file));
        fs.mkdirSync(path.dirname(dest),{recursive:true});
        fs.copyFileSync(file,dest);
        console.log('Copiado',path.relative(root,dest));
      }
    }else{
      const file=matches.sort((a,b)=>a.length-b.length)[0];
      const dest=path.join(vendor,spec.dest);
      fs.mkdirSync(path.dirname(dest),{recursive:true});
      fs.copyFileSync(file,dest);
      console.log('Copiado',path.relative(root,dest));
    }
  }
}
const licenseDir=path.join(vendor,'licenses');
fs.mkdirSync(licenseDir,{recursive:true});
for(const [name,dir] of [['babylonjs','babylonjs'],['babylonjs-loaders','babylonjs-loaders'],['havok','@babylonjs/havok']]){
  const candidates=['LICENSE','LICENSE.md','LICENSE.txt'];
  const license=candidates.map(n=>path.join(root,'node_modules',dir,n)).find(fs.existsSync);
  if(license)fs.copyFileSync(license,path.join(licenseDir,name+'-'+path.basename(license)));
}
const required=['babylon.js','babylonjs.loaders.min.js','havok/HavokPhysics_umd.js'];
for(const file of required)if(!fs.existsSync(path.join(vendor,file)))throw new Error('Falta archivo local '+file);
if(!findFiles(path.join(vendor,'havok'),n=>/\.wasm$/i.test(n)).length)throw new Error('No se copió el WASM de Havok');
console.log('Babylon.js y Havok listos en vendor/babylon. Sin dependencias CDN.');
