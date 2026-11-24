/* Huellas VR · Babylon.js + WebGL 2 + WebXR
 * Migración nativa: no A-Frame, no Three.js, no WebGPU.
 */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const canvas = $('renderCanvas');
const params = new URLSearchParams(location.search);
const qualityParam = params.get('q');
const quality = qualityParam || ((navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 3 ? 'media' : 'alta');
const Q = { alta: 1, media: .68, baja: .42 }[quality] || 1;
const DINO = {
 atacamatitan:{name:'Atacamatitan',file:'models/atacamatitan.glb',low:'models/lo_atacamatitan.glb',length:14,flip:false,text:'Titanosaurio del Cretácico superior. Sus huesos aparecieron en el desierto de Atacama, cerca de Conchi Viejo.'},
 arackar:{name:'Arackar',file:'models/arackar.glb',low:'models/lo_arackar.glb',length:7,flip:false,text:'Titanosaurio de Atacama. Su nombre viene del kunza, la lengua de los atacameños. El ejemplar hallado medía unos 6 m.'},
 gonkoken:{name:'Gonkoken',file:'models/gonkoken.glb',low:'models/lo_gonkoken.glb',length:4,flip:true,text:'Dinosaurio pico de pato de la Patagonia chilena. Vivió hace unos 71 millones de años y medía entre 3,5 y 4 m.'},
 chilesaurus:{name:'Chilesaurus',file:'models/chilesaurus.glb',low:'models/lo_chilesaurus.glb',length:3,flip:true,text:'Vivió hace unos 147 millones de años y comía plantas. Lo descubrió Diego Suárez, un niño de 7 años.'},
 stegouros:{name:'Stegouros',file:'models/stegouros.glb',low:'models/lo_stegouros.glb',length:2,flip:true,text:'Vivió hace unos 74 millones de años en la Patagonia chilena. Medía cerca de 2 m y su cola tenía siete pares de placas.'}
};
const WORLDS = {
 valle:{title:'Valle de Huellas',sky:'img/valle.jpg',ground:'img/valle_c.jpg',height:'img/valle_h.png',fog:'#988e78',hemi:'#ffffff',sun:'#fff1d6',dinos:['atacamatitan','arackar','gonkoken','chilesaurus','stegouros'],terrainMeta:[-.4045716,.4045716,-.4901887,.4901887,0,.4671936],terrainWidth:190,trees:55,ferns:40,rocks:40},
 atacamatitan:{title:'Atacamatitan · Formación Tolar',sky:'img/atacamatitan_sky.jpg',ground:'img/atacamatitan_c.jpg',height:'img/atacamatitan_h.png',fog:'#d8c2a4',hemi:'#fff0dc',sun:'#fff2d6',dinos:['atacamatitan'],terrainMeta:[-.5,.5,-.5,.5,-.003,.06],terrainWidth:300,rivers:[{pts:[[-160,-34],[-144,-33],[-122,-32],[-99,-30],[-74,-29],[-47,-27],[-18,-27],[10,-29],[35,-33],[60,-35],[88,-34],[121,-32],[160,-30]],w:18},{pts:[[-90,-30],[-76,-34],[-63,-38],[-50,-41],[-30,-43],[-8,-44],[18,-42],[40,-38],[60,-35]],w:7}],lagoons:[],flora:{adult:3,young:5,fern:30,fern2:50,pebble:220,rocks:70,logs:3}},
 arackar:{title:'Arackar · Formación Hornitos',sky:'img/arackar_sky.jpg',ground:'img/arackar_c.jpg',height:'img/arackar_h.png',fog:'#e2c6a0',hemi:'#ffe6c8',sun:'#ffd9a0',dinos:['arackar'],terrainMeta:[-.5,.5,-.5,.5,-.003,.06],terrainWidth:300,lagoons:[{x:8,z:-31,rx:20,rz:11,rot:0,y:.045},{x:-38,z:-12,rx:7,rz:5,rot:0,y:.045}],flora:{adult:5,young:9,fern:50,fern2:80,pebble:120,rocks:34,logs:3}},
 patagonia:{title:'Gonkoken · Formación Dorotea',sky:'img/gonkoken_sky.jpg',ground:'img/gonkoken_c.jpg',height:'img/gonkoken_h.png',fog:'#b7c4c6',hemi:'#e4ecec',sun:'#f2f4ff',dinos:['gonkoken'],terrainMeta:[-.5,.5,-.5,.5,-.003,.06],terrainWidth:300,rivers:[{pts:[[-160,46],[-145,41],[-125,34],[-104,27],[-87,21],[-72,16],[-53,9],[-39,1],[-29,-8],[-24,-14],[-18,-26],[-14,-40]],w:9}],lagoons:[{x:0,z:-330,rx:900,rz:300,rot:0,y:.045}],flora:{adult:5,young:7,fern:40,fern2:60,pebble:160,rocks:10,logs:9}},
 stegouros:{title:'Stegouros · Formación Dorotea',sky:'img/stegouros_sky.jpg',ground:'img/stegouros_c.jpg',height:'img/stegouros_h.png',fog:'#a9b8a0',hemi:'#e6f0d6',sun:'#fff4d8',dinos:['stegouros'],terrainMeta:[-.5,.5,-.5,.5,-.003,.06],terrainWidth:300,rivers:[{pts:[[-160,-6],[-139,-8],[-110,-11],[-81,-13],[-61,-14],[-40,-11],[-24,-9],[-9,-12],[8,-17],[24,-13],[53,-13],[91,-16],[131,-19],[160,-22]],w:5}],lagoons:[],flora:{adult:16,young:26,fern:100,fern2:170,pebble:50,rocks:14,logs:10}},
 aysen:{title:'Chilesaurus · Formación Toqui',sky:'img/aysen_sky.jpg',ground:'img/aysen_c.jpg',height:'img/aysen_h.png',fog:'#9da2a2',hemi:'#d6d8d4',sun:'#f4ead6',dinos:['chilesaurus'],terrainMeta:[-.5,.5,-.5,.5,-.003,.06],terrainWidth:300,rivers:[{pts:[[-110,160],[-101,140],[-88,111],[-75,82],[-64,60],[-50,37],[-38,18],[-29,4],[-22,-12],[-17,-34],[-16,-40]],w:7},{pts:[[70,160],[65,140],[57,111],[49,82],[42,60],[32,37],[24,18],[20,4],[14,-12],[11,-34],[10,-40]],w:6},{pts:[[-38,18],[-36,12],[-33,7],[-30,0],[-27,-5],[-24,-9],[-22,-12]],w:3.5}],lagoons:[{x:0,z:-125,rx:210,rz:92,rot:0,y:.045}],flora:{adult:9,young:20,fern:90,fern2:150,pebble:75,rocks:22,logs:7}}
};
const requested = (params.get('mundo') || 'atacamatitan').toLowerCase();
const worldKey = WORLDS[requested] ? requested : 'valle';
const WORLD = WORLDS[worldKey];
let engine, scene, camera, xr, player, ground, waterMesh, rainSystem, soundOn=true, night=false, raining=false, moving=false, target=null, lastTime=0, dinoRoots=[], pickables=[], assetCache=new Map(), animationGroups=[];
const setProgress=(v,t)=>{$('progressFill').style.width=Math.round(v*100)+'%';$('loadText').textContent=t;};
function mat(name,color,rough=.9){const m=new BABYLON.StandardMaterial(name,scene);m.diffuseColor=BABYLON.Color3.FromHexString(color);m.specularColor=new BABYLON.Color3(.08,.08,.08);m.roughness=rough;return m;}
function rand(seed){let x=Math.sin(seed*127.1+311.7)*43758.5453;return x-Math.floor(x);}
function addSky(){
 const sky=BABYLON.MeshBuilder.CreateSphere('sky-dome',{diameter:900,segments:32},scene);sky.isPickable=false;sky.infiniteDistance=true;
 const m=new BABYLON.StandardMaterial('panorama-sky',scene);m.backFaceCulling=false;m.disableLighting=true;m.emissiveTexture=new BABYLON.Texture(WORLD.sky,scene,false,true);m.emissiveTexture.coordinatesMode=BABYLON.Texture.FIXED_EQUIRECTANGULAR_MODE;m.emissiveColor=new BABYLON.Color3(1,1,1);sky.material=m;sky.rotation.y=Math.PI;return sky;
}
function addTerrain(){
 const T=WORLD,meta=T.terrainMeta||[-.5,.5,-.5,.5,-.003,.06],width=T.terrainWidth||300;
 const [mnx,mxx,mnz,mxz,mny,mxy]=meta;
 return new Promise((resolve,reject)=>{
  const img=new Image();
  img.onload=()=>{
   const N=img.width,H=new Float32Array(N*N),valid=new Uint8Array(N*N);
   const cv=document.createElement('canvas');cv.width=cv.height=N;
   const cx=cv.getContext('2d',{willReadFrequently:true});cx.drawImage(img,0,0);
   const px=cx.getImageData(0,0,N,N).data,S=width/(mxx-mnx),dx=(mxx-mnx)*S/N,dz=(mxz-mnz)*S/N;
   for(let k=0;k<N*N;k++){H[k]=((px[k*4]*256+px[k*4+1])/65535*(mxy-mny)+mny)*S;valid[k]=px[k*4+2]>127?1:0;}
   const D=new Uint8Array(N*N),R=14;
   for(let j=0;j<N;j++)for(let i=0;i<N;i++){
    if(!valid[j*N+i]){D[j*N+i]=0;continue;}
    let best=R;
    for(let r=1;r<=R&&r<best;r++)for(let t=-r;t<=r;t++){
     const edges=[[i+t,j-r],[i+t,j+r],[i-r,j+t],[i+r,j+t]];
     for(const [xx,zz] of edges)if(xx<0||zz<0||xx>=N||zz>=N||!valid[zz*N+xx]){best=r;break;}
    }
    D[j*N+i]=best;
   }
   const slope=(i,j)=>{const l=H[j*N+Math.max(0,i-1)],r=H[j*N+Math.min(N-1,i+1)],u=H[Math.max(0,j-1)*N+i],d=H[Math.min(N-1,j+1)*N+i];return Math.atan(Math.hypot((r-l)/(2*dx),(d-u)/(2*dz)))*57.3;};
   let bi=N>>1,bj=N>>1,bestScore=-1;const RR=22;
   for(let j=RR;j<N-RR;j+=4)for(let i=RR;i<N-RR;i+=4){
    if(D[j*N+i]<12)continue;const h0=H[j*N+i];let score=0,bad=false;
    for(let oy=-RR;oy<=RR&&!bad;oy+=3)for(let ox=-RR;ox<=RR;ox+=3){
     if(ox*ox+oy*oy>RR*RR)continue;const k=(j+oy)*N+i+ox;
     if(!valid[k]){bad=true;break;}if(Math.abs(H[k]-h0)<.9)score++;
    }
    if(!bad&&score>bestScore){bestScore=score;bi=i;bj=j;}
   }
   const shX=mnx*S+(bi+.5)*dx,shZ=mnz*S+(bj+.5)*dz,shY=H[bj*N+bi];
   terrainMap={N,S,dx,dz,mnx,mnz,shX,shZ,shY,H,valid,D,width};
   const cell=(x,z)=>[(x+shX-mnx*S)/dx-.5,(z+shZ-mnz*S)/dz-.5];
   terrainHeightAt=(x,z)=>{
    const [fi,fj]=cell(x,z),i=Math.max(0,Math.min(N-2,Math.floor(fi))),j=Math.max(0,Math.min(N-2,Math.floor(fj))),u=Math.max(0,Math.min(1,fi-i)),v=Math.max(0,Math.min(1,fj-j));
    return H[j*N+i]*(1-u)*(1-v)+H[j*N+i+1]*u*(1-v)+H[(j+1)*N+i]*(1-u)*v+H[(j+1)*N+i+1]*u*v-shY;
   };
   terrainValidAt=(x,z)=>{const [fi,fj]=cell(x,z),i=Math.round(fi),j=Math.round(fj);return i>=1&&j>=1&&i<N-1&&j<N-1&&D[j*N+i]>=8&&slope(i,j)<32;};
   const positions=[],uvs=[],indices=[],id=new Int32Array(N*N).fill(-1);
   for(let j=0;j<N;j++)for(let i=0;i<N;i++)if(valid[j*N+i]){
    id[j*N+i]=positions.length/3;
    positions.push(mnx*S+(i+.5)*dx-shX,H[j*N+i]-shY,mnz*S+(j+.5)*dz-shZ);
    uvs.push((i+.5)/N,1-(j+.5)/N);
   }
   for(let j=0;j<N-1;j++)for(let i=0;i<N-1;i++){
    const a=id[j*N+i],b=id[j*N+i+1],c=id[(j+1)*N+i],d=id[(j+1)*N+i+1];
    if(a<0||b<0||c<0||d<0)continue;indices.push(a,c,b,b,c,d);
   }
   const normals=[];BABYLON.VertexData.ComputeNormals(positions,indices,normals);
   const mesh=new BABYLON.Mesh('original-photo-terrain-'+worldKey,scene),vd=new BABYLON.VertexData();
   vd.positions=positions;vd.indices=indices;vd.normals=normals;vd.uvs=uvs;vd.applyToMesh(mesh,true);
   mesh.isPickable=true;mesh.checkCollisions=true;mesh.metadata={ground:true};ground=mesh;pickables.push(mesh);
   const m=new BABYLON.StandardMaterial('photo-terrain-'+worldKey,scene);
   m.diffuseTexture=new BABYLON.Texture(WORLD.ground,scene,false,true);m.diffuseTexture.wrapU=m.diffuseTexture.wrapV=BABYLON.Texture.CLAMP_ADDRESSMODE;
   m.diffuseTexture.anisotropicFilteringLevel=8;m.diffuseColor=new BABYLON.Color3(1,1,1);
   m.specularColor=new BABYLON.Color3(.025,.025,.025);m.roughness=.98;
   const normalPath=worldKey==='atacamatitan'?'img/tex_redsand_n.jpg':worldKey==='arackar'?'img/tex_crack_n.jpg':worldKey==='patagonia'?'img/tex_dirt_n.jpg':worldKey==='stegouros'?'img/tex_leaves_n.jpg':'img/tex_dirt_n.jpg';
   const normal=new BABYLON.Texture(normalPath,scene,false,true);normal.wrapU=normal.wrapV=BABYLON.Texture.WRAP_ADDRESSMODE;normal.uScale=normal.vScale=55;normal.anisotropicFilteringLevel=8;m.bumpTexture=normal;m.bumpTexture.level=.34;
   mesh.material=m;mesh.refreshBoundingInfo();resolve();
  };
  img.onerror=()=>reject(new Error('No se pudo cargar el mapa de relieve '+WORLD.height));
  img.src=WORLD.height;
 });
}
let terrainMap=null;
let terrainHeightAt=(x,z)=>0;
let terrainValidAt=(x,z)=>true;
let terrainSamples=null,terrainSize=300,terrainResolution=256,terrainCenterHeight=0;
function terrainHeightAt(x,z){
 if(!terrainSamples)return 0;
 const u=(x/terrainSize+.5)*(terrainResolution-1),v=(z/terrainSize+.5)*(terrainResolution-1);
 const ix=Math.max(0,Math.min(terrainResolution-2,Math.floor(u))),iz=Math.max(0,Math.min(terrainResolution-2,Math.floor(v)));
 const fx=Math.max(0,Math.min(1,u-ix)),fz=Math.max(0,Math.min(1,v-iz));
 const a=terrainSamples[iz*terrainResolution+ix],b=terrainSamples[iz*terrainResolution+ix+1],c=terrainSamples[(iz+1)*terrainResolution+ix],d=terrainSamples[(iz+1)*terrainResolution+ix+1];
 return a*(1-fx)*(1-fz)+b*fx*(1-fz)+c*(1-fx)*fz+d*fx*fz-terrainCenterHeight;
}

function addLighting(){const hemi=new BABYLON.HemisphericLight('ambient',new BABYLON.Vector3(0,1,0),scene);hemi.diffuse=BABYLON.Color3.FromHexString(WORLD.hemi);hemi.groundColor=new BABYLON.Color3(.22,.2,.17);hemi.intensity=.82;const sun=new BABYLON.DirectionalLight('sun',new BABYLON.Vector3(-.5,-1,.35),scene);sun.position=new BABYLON.Vector3(-35,55,-20);sun.diffuse=BABYLON.Color3.FromHexString(WORLD.sun);sun.intensity=.9;scene.environmentIntensity=.7;}
function addWater(){
 const waterMat=new BABYLON.StandardMaterial('original-water-'+worldKey,scene);
 waterMat.diffuseColor=BABYLON.Color3.FromHexString(worldKey==='arackar'?'#3fa5a6':worldKey==='atacamatitan'?'#6f9fae':worldKey==='patagonia'?'#4a6f70':worldKey==='stegouros'?'#485c48':'#38535f');
 waterMat.emissiveColor=waterMat.diffuseColor.scale(.08);waterMat.specularColor=new BABYLON.Color3(.55,.68,.72);waterMat.alpha=.88;waterMat.roughness=.2;
 const bankMat=new BABYLON.StandardMaterial('original-water-bank-'+worldKey,scene);bankMat.diffuseColor=BABYLON.Color3.FromHexString(worldKey==='atacamatitan'?'#b9784d':worldKey==='arackar'?'#c9ad7b':'#8c927e');bankMat.roughness=1;
 (WORLD.rivers||[]).forEach((river,index)=>{
  const pts=river.pts.map(p=>new BABYLON.Vector3(p[0],terrainHeightAt(p[0],p[1])+.11,p[1]));
  if(pts.length<2)return;
  const curve=BABYLON.Curve3.CreateCatmullRomSpline(pts,Math.max(24,pts.length*5),false);
  const path=curve.getPoints(),left=[],right=[];
  for(let i=0;i<path.length;i++){
   const prev=path[Math.max(0,i-1)],next=path[Math.min(path.length-1,i+1)],dx=next.x-prev.x,dz=next.z-prev.z,len=Math.hypot(dx,dz)||1,nx=-dz/len,nz=dx/len;
   const w=river.w*.5;left.push(new BABYLON.Vector3(path[i].x+nx*w,path[i].y,path[i].z+nz*w));right.push(new BABYLON.Vector3(path[i].x-nx*w,path[i].y,path[i].z-nz*w));
  }
  const ribbon=BABYLON.MeshBuilder.CreateRibbon('original-river-'+index,{pathArray:[left,right],sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene);ribbon.material=waterMat;ribbon.isPickable=false;
 });
 (WORLD.lagoons||[]).forEach((l,index)=>{
  const disk=BABYLON.MeshBuilder.CreateDisc('original-lagoon-'+index,{radius:1,tessellation:96,sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene);
  disk.scaling.set(l.rx,1,l.rz);disk.rotation.x=Math.PI/2;disk.rotation.z=l.rot||0;disk.position.set(l.x,terrainHeightAt(l.x,l.z)+(l.y||.08),l.z);disk.material=waterMat;disk.isPickable=false;
 });
}
async function loadContainer(path){if(assetCache.has(path))return assetCache.get(path);const p=BABYLON.SceneLoader.LoadAssetContainerAsync('',path,scene);assetCache.set(path,p);return p;}
function fitRoot(root,targetLength){const meshes=root.getChildMeshes(false);let min=new BABYLON.Vector3(Infinity,Infinity,Infinity),max=new BABYLON.Vector3(-Infinity,-Infinity,-Infinity);meshes.forEach(m=>{m.computeWorldMatrix(true);const b=m.getBoundingInfo().boundingBox;min=BABYLON.Vector3.Minimize(min,b.minimumWorld);max=BABYLON.Vector3.Maximize(max,b.maximumWorld);});const sx=max.x-min.x,sz=max.z-min.z,span=Math.max(sx,sz)||1;const scale=targetLength/span;root.scaling.setAll(scale);const baseYaw=sx>sz?Math.PI/2:0;root.rotation.y=baseYaw;root.position.y=-min.y*scale;return baseYaw;}
async function spawnDino(id,index,total,center){const data=DINO[id];const path=quality==='baja'?data.low:data.file;let container;try{container=await loadContainer(path);}catch(e){if(path!==data.file)container=await loadContainer(data.file);else throw e;}
 const root=new BABYLON.TransformNode('dino-'+id+'-'+index,scene);const instances=container.instantiateModelsToScene(n=>n+'-'+index,false,{doNotInstantiate:true});instances.rootNodes.forEach(n=>n.parent=root);const clips=instances.animationGroups||[];const idle=clips.find(a=>a.name.toLowerCase()==='idle')||clips[0];clips.forEach(a=>{if(a!==idle)a.stop();animationGroups.push(a);});if(idle)idle.start(true);root.metadata={dinoId:id};const baseYaw=fitRoot(root,data.length*(index===0?1:0.72+rand(index+2)*.22));
 const angle=total===1?Math.PI:((index/total)*Math.PI*2);const radius=total===1?12:8+rand(index+9)*8;root.position.x=(center?.x||0)+Math.cos(angle)*radius;root.position.z=(center?.z||-15)+Math.sin(angle)*radius;root.position.y+=terrainHeightAt(root.position.x,root.position.z);root.rotation.y=baseYaw+(data.flip?Math.PI:0);root.getChildMeshes().forEach(m=>{m.isPickable=true;m.metadata={...(m.metadata||{}),dinoId:id};pickables.push(m);});dinoRoots.push({root,id,clips,clipName:idle?.name||'',baseYaw,lookUntil:0,phase:rand(index+4)*6.28,origin:root.position.clone(),radius:1.5+rand(index+8)*2});return root;
}
async function addVegetation(){
 const F=WORLD.flora||{adult:5,young:8,fern:35,fern2:55,pebble:100,rocks:30,logs:5};
 const specs=[
  ['models/veg/araucaria_adulta.glb',F.adult||0,2.8,4.8,'tree'],
  ['models/veg/araucaria_joven.glb',F.young||0,1.8,3.6,'tree'],
  ['models/veg/fern_tripo.glb',F.fern||0,.8,1.7,'fern'],
  ['models/veg/fern_small.glb',F.fern2||0,.6,1.35,'fern'],
  ['models/veg/pebble.glb',F.pebble||0,.25,.75,'ground'],
  ['models/env/rock_07.glb',F.rocks||0,.5,1.45,'ground'],
  ['models/env/dead_tree_trunk_02.glb',F.logs||0,.8,1.5,'ground']
 ];
 const waterDistance=(x,z)=>{
  let best=1e9;
  (WORLD.rivers||[]).forEach(r=>{for(let i=1;i<r.pts.length;i++){const a=r.pts[i-1],b=r.pts[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));best=Math.min(best,Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t)-r.w*.5);}});
  (WORLD.lagoons||[]).forEach(l=>{const d=Math.hypot((x-l.x)/l.rx,(z-l.z)/l.rz);best=Math.min(best,(d-1)*Math.min(l.rx,l.rz));});
  return best;
 };
 for(let si=0;si<specs.length;si++){
  const [file,count,minScale,maxScale,type]=specs[si];if(!count)continue;
  let container;try{container=await loadContainer(file);}catch(e){console.warn('No se pudo cargar vegetación original',file,e);continue;}
  const n=Math.max(0,Math.round(count*Q));
  for(let i=0,placed=0,attempt=0;i<n&&attempt<n*14+80;attempt++){
   const angle=rand(attempt+si*177+worldKey.length)*Math.PI*2,dist=type==='tree'?20+Math.sqrt(rand(attempt+si*83+9))*43:10+Math.sqrt(rand(attempt+si*31+27))*47;
   const x=Math.cos(angle)*dist,z=Math.sin(angle)*dist-14;
   if(!terrainValidAt(x,z))continue;
   const wd=waterDistance(x,z);
   if(type==='tree'&&wd<5)continue;
   if(type==='ground'&&wd<1.2)continue;
   const group=container.instantiateModelsToScene(name=>name+'-world-'+si+'-'+i,false,{doNotInstantiate:true});
   const root=new BABYLON.TransformNode('world-vegetation-'+si+'-'+i,scene);
   group.rootNodes.forEach(node=>node.parent=root);
   const scale=minScale+rand(i+si*53+7)*(maxScale-minScale);
   root.position.set(x,terrainHeightAt(x,z),z);root.scaling.setAll(scale);root.rotation.y=rand(i+si*97+4)*Math.PI*2;
   root.getChildMeshes().forEach(m=>{m.isPickable=false;m.checkCollisions=false;});
   i++;placed++;
  }
 }
}
function addMountains(){
 // Cordillera procedural ported from the original v19 mountain generator:
 // broad ridgelines, layered geology, forested lower slopes and world-specific volcanoes.
 const profiles={
  atacamatitan:{bands:[[150,205,26],[205,262,58],[258,318,100]],strata:['#b5654a','#c98a5c','#9c5a5a','#d9b48a','#8e4f45','#c47a52','#a86a58'],forest:'#7a7040',forestH:5,rock:'#8a6a5a',haze:'#e6d6c2',seed:11},
  arackar:{bands:[[150,205,22],[205,262,44],[258,318,74]],strata:['#dccdb2','#c6ae8c','#e8dec8','#8c7d6c','#bfa07c','#5e5650','#d2c0a0'],forest:'#6c8048',forestH:10,rock:'#7a7068',haze:'#ecd4b2',seed:23,volcano:{ang:-1.95,d:245,h:125,rad:120,col:'#4c4440'}},
  patagonia:{bands:[[150,205,16],[205,262,30],[258,318,48]],forest:'#45603a',forestH:999,forestF:.8,rock:'#7a7a70',rock2:'#646a66',haze:'#c9d3d4',seed:37,open:{ang:-Math.PI/2,w:1,k:[1,1,1]}},
  stegouros:{bands:[[150,205,28],[205,262,40],[258,318,58]],forest:'#3f5a34',forestH:999,forestF:.92,rock:'#6a6c60',rock2:'#5a5e56',haze:'#bccab8',seed:53},
  aysen:{bands:[[150,205,22],[205,262,52],[258,318,96]],forest:'#3d5a33',forestH:999,forestF:.5,rock:'#4e4f52',rock2:'#3e4044',haze:'#b4babc',seed:41,open:{ang:-Math.PI/2,w:.5,k:[1,.6,0]},volcano:{ang:-1.15,d:250,h:150,rad:125,col:'#3a3634'}}
 };
 const M=profiles[worldKey]||profiles.atacamatitan;
 const hash=(x,y)=>{const v=Math.sin(x*127.1+y*311.7+M.seed*74.7)*43758.5453;return v-Math.floor(v);};
 const noise=(x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);return (hash(xi,yi)*(1-u)+hash(xi+1,yi)*u)*(1-v)+(hash(xi,yi+1)*(1-u)+hash(xi+1,yi+1)*u)*v;};
 const ridged=(x,y,o)=>{let sum=0,amp=.5,freq=1,weight=1;for(let i=0;i<o;i++){let n=1-Math.abs(noise(x*freq,y*freq)*2-1);n*=n;sum+=n*amp*weight;weight=Math.min(1,n*2);freq*=2.03;amp*=.5;}return sum;};
 const fbm=(x,y,o)=>{let sum=0,amp=.5,freq=1;for(let i=0;i<o;i++){sum+=noise(x*freq,y*freq)*amp;freq*=2.1;amp*=.5;}return sum;};
 const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
 const NA=Q>=.6?520:300,NR=Q>=.6?64:40,R0=136,R1=320,count=(NA+1)*NR;
 const positions=new Float32Array(count*3),colors=new Float32Array(count*4),indices=[];
 const heights=new Float32Array(count),rock=BABYLON.Color3.FromHexString(M.rock),rock2=BABYLON.Color3.FromHexString(M.rock2||M.rock),forest=BABYLON.Color3.FromHexString(M.forest);
 const strata=M.strata?M.strata.map(c=>BABYLON.Color3.FromHexString(c)):null;let maxH=0;
 for(let j=0;j<NR;j++){
  const tr=j/(NR-1),radius=R0+(R1-R0)*Math.pow(tr,.85);
  for(let i=0;i<=NA;i++){
   const theta=i/NA*Math.PI*2,x=Math.cos(theta)*radius,z=Math.sin(theta)*radius,k=j*(NA+1)+i;
   let h=-12+14*smooth(R0,150,radius);
   M.bands.forEach((band,bi)=>{
    const mid=(band[0]+band[1])*.5,half=(band[1]-band[0])*.5,profile=Math.max(0,1-Math.pow((radius-mid)/(half*1.25),2));
    const n=ridged(x*(.009+bi*.0015)+bi*17,z*(.009+bi*.0015)-bi*9,5),big=fbm(x*.004+bi*3,z*.004,2);
    let amp=band[2]*(.55+big)*n*profile*1.55;
    if(M.open){const d=Math.atan2(Math.sin(theta-M.open.ang),Math.cos(theta-M.open.ang));amp*=1-M.open.k[bi]*Math.exp(-Math.pow(d/M.open.w,2));}
    h=Math.max(h,h*.4+amp);
   });
   if(h>0)h=118*Math.tanh(h/118);
   if(M.volcano){const V=M.volcano,vx=Math.cos(V.ang)*V.d,vz=Math.sin(V.ang)*V.d,dist=Math.hypot(x-vx,z-vz);if(dist<V.rad){let cone=V.h*Math.pow(1-dist/V.rad,1.2)*(.92+.16*fbm(x*.05,z*.05,2));if(dist<V.rad*.09)cone-=(V.rad*.09-dist)*.8;h=Math.max(h,cone);}}
   positions[k*3]=x;positions[k*3+1]=h;positions[k*3+2]=z;heights[k]=h;maxH=Math.max(maxH,h);
  }
 }
 for(let j=0;j<NR-1;j++)for(let i=0;i<NA;i++){const a=j*(NA+1)+i,b=a+1,c=a+NA+1,d=c+1;indices.push(a,b,c,b,d,c);}
 const normals=new Float32Array(count*3);BABYLON.VertexData.ComputeNormals(positions,indices,normals);
 for(let k=0;k<count;k++){
  const x=positions[k*3],y=heights[k],z=positions[k*3+2],ny=normals[k*3+1],slope=1-ny,hn=y/(maxH||1),n1=fbm(x*.05,z*.05,3),n2=noise(x*.3,z*.3);
  let c;
  if(strata){c=strata[(Math.floor(y*.22+n1*3.2+x*.004)%strata.length+strata.length)%strata.length].clone();c=BABYLON.Color3.Lerp(c,rock,slope*.5);const forestZone=(1-smooth(M.forestH*.5,M.forestH,y+n1*8))*(1-smooth(.35,.7,slope));c=BABYLON.Color3.Lerp(c,forest,forestZone*.85);}
  else{const blend=smooth(M.forestF-.1,M.forestF+.12,hn+(n1-.5)*.25+slope*.25);c=BABYLON.Color3.Lerp(forest,BABYLON.Color3.Lerp(rock,rock2,n2),blend);}
  if(M.volcano){const V=M.volcano,dist=Math.hypot(x-Math.cos(V.ang)*V.d,z-Math.sin(V.ang)*V.d),volcanoZone=1-smooth(V.rad*.45,V.rad*.95,dist);if(volcanoZone>0)c=BABYLON.Color3.Lerp(c,BABYLON.Color3.FromHexString(V.col),volcanoZone*.9);}
  const shade=.85+.3*n2;colors[k*4]=c.r*shade;colors[k*4+1]=c.g*shade;colors[k*4+2]=c.b*shade;colors[k*4+3]=1;
 }
 const mesh=new BABYLON.Mesh('world-mountain-range-'+worldKey,scene),vd=new BABYLON.VertexData();
 vd.positions=Array.from(positions);vd.indices=indices;vd.normals=Array.from(normals);vd.colors=Array.from(colors);vd.applyToMesh(mesh,true);
 const material=new BABYLON.StandardMaterial('mountain-strata-material-'+worldKey,scene);material.diffuseColor=new BABYLON.Color3(1,1,1);material.specularColor=new BABYLON.Color3(.025,.025,.025);material.roughness=1;material.useVertexColors=true;material.backFaceCulling=false;mesh.material=material;mesh.isPickable=false;mesh.applyFog=true;
}

function addParticles(){const p=new BABYLON.ParticleSystem('ambient-dust',700,scene);p.particleTexture=new BABYLON.Texture('https://assets.babylonjs.com/textures/flare.png',scene);p.emitter=new BABYLON.Vector3(0,2,-15);p.minEmitBox=new BABYLON.Vector3(-42,0,-42);p.maxEmitBox=new BABYLON.Vector3(42,15,42);p.color1=new BABYLON.Color4(.9,.78,.55,.25);p.color2=new BABYLON.Color4(.7,.85,.75,.12);p.minSize=.025;p.maxSize=.11;p.minLifeTime=5;p.maxLifeTime=12;p.emitRate=quality==='baja'?10:32;p.direction1=new BABYLON.Vector3(-.1,.1,-.1);p.direction2=new BABYLON.Vector3(.1,.3,.1);p.minEmitPower=.05;p.maxEmitPower=.3;p.updateSpeed=.01;p.start();}
function showInfo(id){const d=DINO[id];if(!d)return;const actor=dinoRoots.find(x=>x.id===id);if(actor){actor.lookUntil=performance.now()+6500;actor.clipName='';}$('infoTitle').textContent=d.name;$('infoBody').textContent=d.text;$('info').classList.remove('hidden');}
function closeInfo(){$('info').classList.add('hidden');}
function onPick(evt){if(!evt.hit||!evt.pickedMesh)return;let m=evt.pickedMesh;while(m&&!m.metadata?.dinoId&&!m.metadata?.ground)m=m.parent;if(m?.metadata?.dinoId){showInfo(m.metadata.dinoId);return;}if(m?.metadata?.ground&&evt.pickedPoint){target=evt.pickedPoint.clone();moving=true;}}
function movePlayer(dt){if(!moving||!target||xr?.baseExperience?.state===BABYLON.WebXRState.IN_XR)return;const dest=new BABYLON.Vector3(target.x,1.65,target.z);dest.y=1.65;const delta=dest.subtract(camera.position);delta.y=0;const len=delta.length();if(len<.45){moving=false;return;}delta.normalize();camera.position.addInPlace(delta.scale(Math.min(len,dt*4.5)));camera.position.y=terrainHeightAt(camera.position.x,camera.position.z)+1.65;}
function animateDinos(t){dinoRoots.forEach(d=>{const s=t*.00022+d.phase,dx=Math.cos(s)*d.radius,dz=-Math.sin(s*.73)*d.radius*.7;d.root.position.x=d.origin.x+Math.sin(s)*d.radius;d.root.position.z=d.origin.z+Math.cos(s*.73)*d.radius*.7;const looking=t<d.lookUntil,running=!looking&&Math.sin(s*.23+d.phase)>.96,desired=looking?'Neck_Look':running?'Run':Math.abs(Math.cos(s))>.18?'Walk':'Idle';if(d.clipName!==desired){const clip=d.clips.find(a=>a.name.toLowerCase()===desired.toLowerCase());if(clip){d.clips.forEach(a=>{if(a!==clip)a.stop();});clip.start(true);d.clipName=desired;}}if(Math.abs(dx)+Math.abs(dz)>.02)d.root.rotation.y=Math.atan2(dx,dz)+d.baseYaw+(DINO[d.id].flip?Math.PI:0);});}
async function enterXR(){try{if(!navigator.xr){$('sensorNotice').classList.remove('hidden');return;}if(!xr)xr=await scene.createDefaultXRExperienceAsync({uiOptions:{sessionMode:'immersive-vr',referenceSpaceType:'local-floor',customButtons:[]},disableTeleportation:true});await xr.baseExperience.enterXRAsync('immersive-vr','local-floor');}catch(e){console.warn('WebXR no disponible',e);$('sensorNotice').classList.remove('hidden');}}
function bindControls(){scene.onPointerObservable.add(pi=>{if(pi.type===BABYLON.PointerEventTypes.POINTERPICK)onPick(pi.pickInfo);});canvas.addEventListener('pointerdown',()=>{if(camera.inputs.attached.pointers){}},{passive:true});$('explore').onclick=()=>startExperience(false);$('visor').onclick=()=>startExperience(true);$('vrButton').onclick=enterXR;$('closeInfo').onclick=closeInfo;$('timeButton').onclick=()=>{night=!night;scene.ambientColor=night?new BABYLON.Color3(.12,.16,.25):new BABYLON.Color3(.3,.3,.3);$('timeButton').textContent=night?'🌙':'☀️';};$('rainButton').onclick=()=>{raining=!raining;$('rainButton').textContent=raining?'🌧️':'🌧';if(raining){if(!rainSystem){rainSystem=new BABYLON.ParticleSystem('rain',1800,scene);rainSystem.particleTexture=new BABYLON.Texture('https://assets.babylonjs.com/textures/flare.png',scene);rainSystem.emitter=new BABYLON.Vector3(0,18,-10);rainSystem.minEmitBox=new BABYLON.Vector3(-55,0,-55);rainSystem.maxEmitBox=new BABYLON.Vector3(55,0,55);rainSystem.color1=new BABYLON.Color4(.65,.75,.9,.5);rainSystem.color2=new BABYLON.Color4(.8,.85,1,.35);rainSystem.minSize=.025;rainSystem.maxSize=.05;rainSystem.minLifeTime=1;rainSystem.maxLifeTime=2;rainSystem.emitRate=1200;rainSystem.direction1=new BABYLON.Vector3(0,-1,0);rainSystem.direction2=new BABYLON.Vector3(.2,-1,.2);rainSystem.minEmitPower=8;rainSystem.maxEmitPower=13;}rainSystem.start();}else rainSystem?.stop();};$('soundButton').onclick=()=>{soundOn=!soundOn;$('soundButton').textContent=soundOn?'🔊':'🔇';};$('qualityButton').onclick=()=>{const next=quality==='alta'?'media':quality==='media'?'baja':'alta';location.search=new URLSearchParams({...Object.fromEntries(params),q:next}).toString();};$('retrySensors').onclick=()=>enterXR();$('continueTouch').onclick=()=>{$('sensorNotice').classList.add('hidden');};}
async function startExperience(withVR){$('loader').style.opacity='0';setTimeout(()=>$('loader').classList.add('hidden'),750);$('hud').classList.remove('hidden');$('worldLabel').textContent=WORLD.title;if(withVR)await enterXR();}
async function init(){
 try{engine=new BABYLON.Engine(canvas,true,{disableWebGL2Support:false,doNotHandleContextLost:false,preserveDrawingBuffer:false,stencil:true,antialias:true,adaptToDeviceRatio:true});if(!engine.webGLVersion||engine.webGLVersion<2)throw new Error('Este dispositivo no ofrece WebGL 2.');
 scene=new BABYLON.Scene(engine);scene.clearColor=new BABYLON.Color4(.65,.76,.77,1);scene.collisionsEnabled=true;scene.fogMode=BABYLON.Scene.FOGMODE_EXP2;scene.fogColor=BABYLON.Color3.FromHexString(WORLD.fog);scene.fogDensity=.0038;
 camera=new BABYLON.UniversalCamera('player-camera',new BABYLON.Vector3(0,1.65,12),scene);camera.minZ=.08;camera.maxZ=320;camera.fov=.92;camera.speed=.35;camera.inertia=.82;camera.angularSensibility=3800;camera.attachControl(canvas,true);camera.keysUp.push(87);camera.keysDown.push(83);camera.keysLeft.push(65);camera.keysRight.push(68);camera.applyGravity=false;camera.checkCollisions=true;camera.ellipsoid=new BABYLON.Vector3(.35,.85,.35);
 setProgress(.08,'Creando el paisaje…');addSky();addLighting();await addTerrain();camera.position.y=1.65+terrainHeightAt(0,12);addWater();setProgress(.2,'Cargando dinosaurios…');
 const ids=WORLD.dinos,baseHerd={atacamatitan:22,arackar:24,patagonia:22,stegouros:18,aysen:28,valle:5}[worldKey]||5,herdSize=Math.max(3,Math.round(baseHerd*Q)),totalDinos=ids.length*herdSize;let loadedDinos=0;for(const id of ids){for(let n=0;n<herdSize;n++){await spawnDino(id,n,herdSize,{x:4,z:-4});loadedDinos++;setProgress(.2+.53*loadedDinos/totalDinos,'Cargando '+DINO[id].name+' · '+loadedDinos+'/'+totalDinos+'…');}}
 setProgress(.76,'Poblando el paisaje…');await addVegetation();setProgress(.9,'Preparando atmósfera…');addParticles();bindControls();scene.onBeforeRenderObservable.add(()=>{const now=performance.now(),dt=Math.min(.05,(now-lastTime)/1000||0);lastTime=now;movePlayer(dt);animateDinos(now);});
 engine.runRenderLoop(()=>{if(scene&&scene.activeCamera)scene.render();});window.addEventListener('resize',()=>engine.resize());setProgress(1,'¡Mundo listo!');$('startButtons').classList.remove('hidden');
 }catch(err){console.error(err);$('loadText').textContent='No se pudo iniciar el mundo: '+err.message;$('startButtons').classList.remove('hidden');$('explore').onclick=()=>location.reload();}
}
window.addEventListener('DOMContentLoaded',init);
})();
