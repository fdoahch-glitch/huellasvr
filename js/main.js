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
 atacamatitan:{title:'Atacamatitan · Formación Tolar',sky:'img/atacamatitan_sky.jpg',ground:'img/atacamatitan_c.jpg',height:'img/atacamatitan_h.png',fog:'#d8c2a4',hemi:'#fff0dc',sun:'#fff2d6',dinos:['atacamatitan'],terrainMeta:[-.5,.5,-.5,.5,-.003,.06],terrainWidth:300,forestTex:'atacamatitan',forestN:{adult:22,young:28,fern:50,grass:0},rivers:[{pts:[[-160,-34],[-153.5,-33.6],[-144.5,-33.1],[-133.8,-32.5],[-122.3,-31.9],[-110.6,-31.2],[-99.6,-30.6],[-90,-30],[-81.8,-29.5],[-74.3,-28.9],[-67.2,-28.4],[-60.4,-27.9],[-53.7,-27.5],[-47,-27.2],[-40,-27],[-32.9,-27],[-25.7,-27.1],[-18.6,-27.3],[-11.4,-27.6],[-4.3,-28],[2.9,-28.5],[10,-29],[16.7,-29.7],[22.8,-30.7],[28.8,-31.9],[35.1,-33],[42.1,-34],[50.2,-34.7],[60,-35],[72.5,-34.8],[87.8,-34.2],[104.6,-33.4],[121.5,-32.4],[137.3,-31.4],[150.5,-30.5],[160,-30]],w:18},{pts:[[-90,-30],[-86.5,-31.1],[-81.8,-32.6],[-76.2,-34.4],[-69.9,-36.3],[-63.3,-38.1],[-56.6,-39.8],[-50,-41],[-43.5,-42],[-36.7,-42.8],[-29.8,-43.5],[-22.7,-44],[-15.3,-44.3],[-7.8,-44.3],[0,-44],[8.6,-43.3],[18.2,-42],[28.2,-40.5],[38,-38.9],[46.9,-37.3],[54.5,-35.9],[60,-35]],w:7}],lagoons:[],bars:[{x:8,z:-27,rx:16,rz:3.2,rot:.05},{x:-60,z:-17,rx:10,rz:3,rot:.2},{x:70,z:-24,rx:11,rz:3,rot:-.1},{x:-50,z:38,rx:12,rz:3,rot:0},{x:60,z:40,rx:10,rz:2.6,rot:.1}],flora:{adult:3,young:5,fern:30,fern2:50,pebble:220,rocks:70,logs:3}},
 arackar:{title:'Arackar · Formación Hornitos',sky:'img/arackar_sky.jpg',ground:'img/arackar_c.jpg',height:'img/arackar_h.png',fog:'#e2c6a0',hemi:'#ffe6c8',sun:'#ffd9a0',dinos:['arackar'],terrainMeta:[-.5,.5,-.5,.5,-.003,.06],terrainWidth:300,forestTex:'arackar',forestN:{adult:45,young:70,fern:110,grass:0},lagoons:[{x:8,z:-31,rx:20,rz:11,rot:0,y:.045},{x:-38,z:-12,rx:7,rz:5,rot:0,y:.045}],flora:{adult:5,young:9,fern:50,fern2:80,pebble:120,rocks:34,logs:3}},
 patagonia:{title:'Gonkoken · Formación Dorotea',sky:'img/gonkoken_sky.jpg',ground:'img/gonkoken_c.jpg',height:'img/gonkoken_h.png',fog:'#b7c4c6',hemi:'#e4ecec',sun:'#f2f4ff',dinos:['gonkoken'],terrainMeta:[-.5,.5,-.5,.5,-.003,.06],terrainWidth:300,forestTex:'gonkoken',forestN:{adult:60,young:110,fern:140,grass:0},rivers:[{pts:[[-160,46],[-154,44],[-145.6,41.2],[-135.7,37.9],[-125,34.3],[-114.2,30.6],[-103.9,27.1],[-95,24],[-87.1,21.2],[-79.6,18.6],[-72.4,16.1],[-65.6,13.6],[-59.2,11.2],[-53.3,8.6],[-48,6],[-43.2,3.3],[-39.1,.6],[-35.4,-2.1],[-32.1,-4.9],[-29.2,-7.8],[-26.5,-10.8],[-24,-14],[-21.7,-17.6],[-19.8,-21.7],[-18.2,-26.1],[-16.9,-30.4],[-15.7,-34.3],[-14.8,-37.6],[-14,-40]],w:9}],lagoons:[{x:0,z:-330,rx:900,rz:300,rot:0,y:.045}],bars:[{x:-45,z:-21,rx:6,rz:1.8,rot:.1},{x:40,z:-30,rx:7,rz:2,rot:-.1},{x:4,z:-24.5,rx:5,rz:1.5,rot:.1},{x:-85,z:36,rx:6,rz:1.6,rot:0},{x:60,z:37,rx:5,rz:1.5,rot:.15}],flora:{adult:5,young:7,fern:40,fern2:60,pebble:160,rocks:10,logs:9}},
 stegouros:{title:'Stegouros · Formación Dorotea',sky:'img/stegouros_sky.jpg',ground:'img/stegouros_c.jpg',height:'img/stegouros_h.png',fog:'#a9b8a0',hemi:'#e6f0d6',sun:'#fff4d8',dinos:['stegouros'],terrainMeta:[-.5,.5,-.5,.5,-.003,.06],terrainWidth:300,forestTex:'stegouros',forestN:{adult:200,young:320,fern:300,grass:0},rivers:[{pts:[[-160,-6],[-151.5,-6.8],[-139.6,-8.1],[-125.4,-9.6],[-110.2,-11.1],[-95.1,-12.4],[-81.3,-13.5],[-70,-14],[-61,-13.9],[-53.2,-13.1],[-46.5,-12.1],[-40.4,-10.9],[-34.8,-9.9],[-29.5,-9.1],[-24,-9],[-18.7,-9.6],[-13.8,-10.7],[-9.3,-12.2],[-5,-13.8],[-.7,-15.3],[3.6,-16.4],[8,-17],[11.8,-16.8],[14.6,-16.1],[17.1,-15],[20.1,-13.8],[24.4,-12.7],[30.8,-12],[40,-12],[53.6,-12.7],[71.4,-14.1],[91.6,-15.8],[112.3,-17.6],[131.9,-19.4],[148.4,-21],[160,-22]],w:5}],lagoons:[],flora:{adult:16,young:26,fern:100,fern2:170,pebble:50,rocks:14,logs:10}},
 aysen:{title:'Chilesaurus · Formación Toqui',sky:'img/aysen_sky.jpg',ground:'img/aysen_c.jpg',height:'img/aysen_h.png',fog:'#9da2a2',hemi:'#d6d8d4',sun:'#f4ead6',dinos:['chilesaurus'],terrainMeta:[-.5,.5,-.5,.5,-.003,.06],terrainWidth:300,forestTex:'aysen',forestN:{adult:90,young:200,fern:280,grass:0},rivers:[{pts:[[-110,160],[-106.3,151.5],[-101.3,139.7],[-95.2,125.7],[-88.7,110.6],[-82,95.6],[-75.6,81.7],[-70,70],[-64.9,60.4],[-59.8,51.7],[-54.9,43.9],[-50.2,36.8],[-45.7,30.1],[-41.7,23.9],[-38,18],[-34.8,12.5],[-32,7.8],[-29.5,3.5],[-27.3,-.4],[-25.4,-4.2],[-23.6,-8],[-22,-12],[-20.6,-16.3],[-19.4,-21],[-18.4,-25.6],[-17.6,-30.1],[-17,-34.1],[-16.5,-37.5],[-16,-40]],w:7},{pts:[[70,160],[67.7,151.5],[64.6,139.7],[60.8,125.7],[56.7,110.6],[52.6,95.6],[48.6,81.7],[45,70],[41.7,60.4],[38.4,51.7],[35.1,43.9],[32,36.8],[29.1,30.1],[26.4,23.9],[24,18],[21.9,12.5],[20.2,7.8],[18.6,3.5],[17.3,-.4],[16.1,-4.2],[15,-8],[14,-12],[13.1,-16.3],[12.3,-21],[11.7,-25.6],[11.1,-30.1],[10.7,-34.1],[10.3,-37.5],[10,-40]],w:6},{pts:[[-38,18],[-37.4,16.5],[-36.6,14.5],[-35.6,12.2],[-34.5,9.6],[-33.3,6.9],[-32.2,4.3],[-31,2],[-29.7,-.2],[-28.3,-2.6],[-26.8,-4.9],[-25.3,-7.1],[-24,-9.1],[-22.8,-10.8],[-22,-12]],w:3.5}],lagoons:[{x:0,z:-125,rx:210,rz:92,rot:0,y:.045}],bars:[{x:-35,z:-17,rx:14,rz:3.5,rot:.1},{x:5,z:-24,rx:16,rz:4,rot:-.05},{x:45,z:-32,rx:13,rz:3,rot:.1},{x:-85,z:-34,rx:15,rz:4,rot:0},{x:30,z:31,rx:14,rz:3.2,rot:.05},{x:-60,z:29,rx:12,rz:3,rot:0},{x:100,z:-36,rx:12,rz:3,rot:0}],flora:{adult:7,young:12,fern:110,fern2:190,pebble:200,rocks:26,logs:6}}
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
 const m=new BABYLON.StandardMaterial('panorama-sky',scene);m.backFaceCulling=false;m.disableLighting=true;m.emissiveTexture=new BABYLON.Texture(WORLD.sky,scene,false,true);m.emissiveColor=new BABYLON.Color3(1,1,1);sky.material=m;sky.rotation.y=(WORLD.panoRot??23)*Math.PI/180;return sky;
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
    const ia=j*N+i,ib=ia+1,ic=(j+1)*N+i,id=ic+1;
    if(valid[ia]&&valid[ib]&&valid[ic]&&valid[id]){
     const h=u+v<=1?H[ia]*(1-u-v)+H[ib]*u+H[ic]*v:H[ib]*(1-v)+H[ic]*(1-u)+H[id]*(u+v-1);
     return h-shY;
    }
    let best=-1,bd=Infinity;
    for(let oz=-2;oz<=2;oz++)for(let ox=-2;ox<=2;ox++){const xx=i+ox,zz=j+oz;if(xx<0||zz<0||xx>=N||zz>=N||!valid[zz*N+xx])continue;const dd=(xx-fi)*(xx-fi)+(zz-fj)*(zz-fj);if(dd<bd){bd=dd;best=zz*N+xx;}}
    return best>=0?H[best]-shY:0;
   };
   terrainValidAt=(x,z)=>{
    const [fi,fj]=cell(x,z),i=Math.floor(fi),j=Math.floor(fj);
    if(i<1||j<1||i>=N-2||j>=N-2)return false;
    const k=j*N+i;if(!valid[k]||!valid[k+1]||!valid[k+N]||!valid[k+N+1])return false;
    return D[Math.round(fj)*N+Math.round(fi)]>=8&&slope(Math.round(fi),Math.round(fj))<32;
   };
   const positions=[],uvs=[],indices=[],id=new Int32Array(N*N).fill(-1);
   for(let j=0;j<N;j++)for(let i=0;i<N;i++)if(valid[j*N+i]){
    id[j*N+i]=positions.length/3;
    positions.push(mnx*S+(i+.5)*dx-shX,H[j*N+i]-shY,mnz*S+(j+.5)*dz-shZ);
    uvs.push((i+.5)/N,1-(j+.5)/N);
   }
   for(let j=0;j<N-1;j++)for(let i=0;i<N-1;i++){
    const a=id[j*N+i],b=id[j*N+i+1],c=id[(j+1)*N+i],d=id[(j+1)*N+i+1];
    if(a<0||b<0||c<0||d<0)continue;
    indices.push(a,c,b,b,c,d);
   }
   const normals=[];BABYLON.VertexData.ComputeNormals(positions,indices,normals);
   const mesh=new BABYLON.Mesh('original-photo-terrain-'+worldKey,scene),vd=new BABYLON.VertexData();
   vd.positions=positions;vd.indices=indices;vd.normals=normals;vd.uvs=uvs;vd.applyToMesh(mesh,true);
   mesh.isPickable=true;mesh.checkCollisions=true;mesh.metadata={ground:true};ground=mesh;pickables.push(mesh);
   const m=new BABYLON.StandardMaterial('photo-terrain-'+worldKey,scene);
   const detailProfiles={
    atacamatitan:{sand:'img/tex_sand_d.jpg',gravel:'img/tx_stones_d.jpg',crack:'img/tx_stones_d.jpg',normal:'img/tex_sand_n.jpg',size:2.4},
    arackar:{sand:'img/tex_crack_d.jpg',gravel:'img/tex_gsand_d.jpg',crack:'img/tx_stones_d.jpg',normal:'img/tex_gsand_n.jpg',size:2.2},
    patagonia:{sand:'img/tx_dirt_d.jpg',gravel:'img/tex_gsand_d.jpg',crack:'img/tex_gsand_d.jpg',normal:'img/tx_dirt_n.jpg',size:3},
    stegouros:{sand:'img/tx_leaves_d.jpg',gravel:'img/tx_redplants_d.jpg',crack:'img/tx_stones_d.jpg',normal:'img/tx_leaves_n.jpg',size:2.4},
    aysen:{sand:'img/tx_dirt_d.jpg',gravel:'img/tx_stones_d.jpg',crack:'img/tx_stones_d.jpg',normal:'img/tx_dirt_n.jpg',size:3}
   }[worldKey];
   const compositeCanvas=document.createElement('canvas');compositeCanvas.width=compositeCanvas.height=2048;
   const cc=compositeCanvas.getContext('2d',{alpha:false});
   const loadImage=src=>new Promise((ok,no)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=()=>no(new Error('No se pudo cargar textura '+src));im.src=src;});
   const baseImage=new Image();baseImage.onload=()=>{
    cc.drawImage(baseImage,0,0,2048,2048);
    const finish=()=>{
     const compositeTexture=new BABYLON.DynamicTexture('terrain-composite-'+worldKey,{width:2048,height:2048},scene,false,BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
     compositeTexture.getContext().drawImage(compositeCanvas,0,0);compositeTexture.update(false);
     compositeTexture.wrapU=compositeTexture.wrapV=BABYLON.Texture.CLAMP_ADDRESSMODE;compositeTexture.anisotropicFilteringLevel=8;
     m.diffuseTexture=compositeTexture;m.diffuseColor=new BABYLON.Color3(1,1,1);
     m.specularColor=new BABYLON.Color3(.025,.025,.025);m.roughness=.98;
     const normal=new BABYLON.Texture(detailProfiles?.normal||'img/tx_dirt_n.jpg',scene,false,true);normal.wrapU=normal.wrapV=BABYLON.Texture.WRAP_ADDRESSMODE;normal.uScale=normal.vScale=300/(detailProfiles?.size||3);normal.anisotropicFilteringLevel=8;m.bumpTexture=normal;m.bumpTexture.level=.7;
     mesh.material=m;mesh.refreshBoundingInfo();resolve();
    };
    if(!detailProfiles){finish();return;}
    Promise.all([loadImage(detailProfiles.sand),loadImage(detailProfiles.gravel),loadImage(detailProfiles.crack)]).then(images=>{
     const alphas=[.38,.26,.18],sizes=[2.4,2.2,2.8];
     images.forEach((im,k)=>{const pat=cc.createPattern(im,'repeat');if(!pat)return;const tilePx=2048*sizes[k]/300;if(pat.setTransform&&typeof DOMMatrix!=='undefined')pat.setTransform(new DOMMatrix().scale(tilePx/im.width,tilePx/im.height));cc.save();cc.globalAlpha=alphas[k];cc.globalCompositeOperation=k===0?'soft-light':'multiply';cc.fillStyle=pat;cc.fillRect(0,0,2048,2048);cc.restore();});
     finish();
    }).catch(reject);
   };
   baseImage.onerror=()=>reject(new Error('No se pudo cargar la textura base '+WORLD.ground));baseImage.src=WORLD.ground;
  };
  img.onerror=()=>reject(new Error('No se pudo cargar el mapa de relieve '+WORLD.height));
  img.src=WORLD.height;
 });
}
let terrainMap=null;
let terrainHeightAt=(x,z)=>0;
let terrainValidAt=(x,z)=>true;

function addLighting(){const L={atacamatitan:{hemi:1.05,sun:1.15,pos:[25,34,-10],ground:'#8a4e34'},arackar:{hemi:1,sun:1.1,pos:[-30,18,-20],ground:'#9a7a5a'},patagonia:{hemi:.95,sun:.8,pos:[20,30,-30],ground:'#5f6a52'},stegouros:{hemi:.95,sun:.85,pos:[15,36,-10],ground:'#4a5a34'},aysen:{hemi:.9,sun:.75,pos:[30,30,-20],ground:'#55584e'},valle:{hemi:.55,sun:.9,pos:[-12,22,10],ground:'#6b8a5a'}}[worldKey];const hemi=new BABYLON.HemisphericLight('ambient',new BABYLON.Vector3(0,1,0),scene);hemi.diffuse=BABYLON.Color3.FromHexString(WORLD.hemi);hemi.groundColor=BABYLON.Color3.FromHexString(L.ground);hemi.intensity=L.hemi;const sun=new BABYLON.DirectionalLight('sun',new BABYLON.Vector3(-L.pos[0],-L.pos[1],-L.pos[2]).normalize(),scene);sun.position=new BABYLON.Vector3(...L.pos);sun.diffuse=BABYLON.Color3.FromHexString(WORLD.sun);sun.intensity=L.sun;scene.environmentIntensity=.7;}
function addWater(){
 const waterPal={
  atacamatitan:{edge:'#d9c59b',mid:'#93b3b4',center:'#6f9fae'},
  arackar:{edge:'#a9cdc9',mid:'#68a5b8',center:'#4f93b3'},
  patagonia:{edge:'#86a39c',mid:'#5e837f',center:'#4a6f70'},
  stegouros:{edge:'#7c7a58',mid:'#5a6a50',center:'#485c48'},
  aysen:{edge:'#6f828a',mid:'#4a6672',center:'#38535f'}
 }[worldKey]||{edge:'#8aa5a0',mid:'#668a8c',center:'#456d78'};
 const waterTex=new BABYLON.DynamicTexture('water-ripple-texture-'+worldKey,256,scene,false,BABYLON.Texture.TRILINEAR_SAMPLINGMODE),wc=waterTex.getContext();
 const wg=wc.createLinearGradient(0,0,0,256);wg.addColorStop(0,waterPal.edge);wg.addColorStop(.48,waterPal.mid);wg.addColorStop(1,waterPal.center);wc.fillStyle=wg;wc.fillRect(0,0,256,256);
 for(let n=0;n<46;n++){const y=(n*37)%256,x=(n*71)%256;wc.beginPath();wc.ellipse(x,y,8+(n%7)*3,1+(n%3),-.15,0,Math.PI*2);wc.strokeStyle='rgba(235,245,238,'+(.045+(n%4)*.018)+')';wc.lineWidth=.8+(n%2)*.45;wc.stroke();}
 waterTex.update(false);waterTex.wrapU=waterTex.wrapV=BABYLON.Texture.WRAP_ADDRESSMODE;waterTex.uScale=4;waterTex.vScale=2;waterTex.anisotropicFilteringLevel=4;
 const waterMat=new BABYLON.StandardMaterial('original-water-'+worldKey,scene);
 waterMat.diffuseTexture=waterTex;waterMat.diffuseColor=new BABYLON.Color3(1,1,1);
 waterMat.emissiveColor=BABYLON.Color3.FromHexString(waterPal.center).scale(.06);waterMat.specularColor=new BABYLON.Color3(.42,.55,.58);waterMat.alpha=.94;waterMat.roughness=.24;
 const bankMat=new BABYLON.StandardMaterial('original-water-bank-'+worldKey,scene);bankMat.diffuseColor=BABYLON.Color3.FromHexString(worldKey==='atacamatitan'?'#b9784d':worldKey==='arackar'?'#c9ad7b':'#8c927e');bankMat.roughness=1;
 (WORLD.rivers||[]).forEach((river,index)=>{
  const pts=river.pts.map(p=>new BABYLON.Vector3(p[0],terrainHeightAt(p[0],p[1])+.11,p[1]));
  if(pts.length<2)return;
  const curve=BABYLON.Curve3.CreateCatmullRomSpline(pts,Math.max(24,pts.length*5),false);
  const path=curve.getPoints(),left=[],right=[],bankLeft=[],bankRight=[];
  for(let i=0;i<path.length;i++){
   const prev=path[Math.max(0,i-1)],next=path[Math.min(path.length-1,i+1)],dx=next.x-prev.x,dz=next.z-prev.z,len=Math.hypot(dx,dz)||1,nx=-dz/len,nz=dx/len;
   const w=river.w*.5,bw=w+1.6;
   left.push(new BABYLON.Vector3(path[i].x+nx*w,path[i].y+.045,path[i].z+nz*w));right.push(new BABYLON.Vector3(path[i].x-nx*w,path[i].y+.045,path[i].z-nz*w));
   bankLeft.push(new BABYLON.Vector3(path[i].x+nx*bw,path[i].y+.018,path[i].z+nz*bw));bankRight.push(new BABYLON.Vector3(path[i].x-nx*bw,path[i].y+.018,path[i].z-nz*bw));
  }
  const bank=BABYLON.MeshBuilder.CreateRibbon('original-river-bank-'+index,{pathArray:[bankLeft,bankRight],sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene);bank.material=bankMat;bank.isPickable=false;
  const ribbon=BABYLON.MeshBuilder.CreateRibbon('original-river-'+index,{pathArray:[left,right],sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene);ribbon.material=waterMat;ribbon.isPickable=false;
 });
 (WORLD.lagoons||[]).forEach((l,index)=>{
  const disk=BABYLON.MeshBuilder.CreateDisc('original-lagoon-'+index,{radius:1,tessellation:96,sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene);
  disk.scaling.set(l.rx,1,l.rz);disk.rotation.x=Math.PI/2;disk.rotation.z=l.rot||0;disk.position.set(l.x,terrainHeightAt(l.x,l.z)+(l.y||.08),l.z);disk.material=waterMat;disk.isPickable=false;
 });
}

function addSandBars(){const c=worldKey==='atacamatitan'?'#c9915a':worldKey==='aysen'?'#a4a197':'#b7a58a';const material=new BABYLON.StandardMaterial('original-sandbar-material',scene);material.diffuseColor=BABYLON.Color3.FromHexString(c);material.roughness=1;(WORLD.bars||[]).forEach((b,i)=>{const mesh=BABYLON.MeshBuilder.CreateDisc('original-sandbar-'+i,{radius:1,tessellation:48,sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene);mesh.scaling.set(b.rx,1,b.rz);mesh.rotation.x=Math.PI/2;mesh.rotation.z=b.rot||0;mesh.position.set(b.x,terrainHeightAt(b.x,b.z)+.035,b.z);mesh.material=material;mesh.isPickable=false;});}
async function loadContainer(path){if(assetCache.has(path))return assetCache.get(path);const p=BABYLON.SceneLoader.LoadAssetContainerAsync('',path,scene);assetCache.set(path,p);return p;}
function findFlatDinoPosition(cx,cz,index){
 let best={x:cx+Math.cos(index*2.4)*8,z:cz+Math.sin(index*2.4)*8},bestScore=Infinity;
 for(let ring=0;ring<=42;ring+=3)for(let a=0;a<24;a++){
  const ang=a*Math.PI*2/24,x=cx+Math.cos(ang)*ring,z=cz+Math.sin(ang)*ring;
  if(!terrainValidAt(x,z))continue;
  if(dinoRoots.some(d=>Math.hypot(d.root.position.x-x,d.root.position.z-z)<7))continue;
  let lo=1e9,hi=-1e9,ok=true;
  for(let q=0;q<8;q++){const px=x+Math.cos(q*Math.PI/4)*2.8,pz=z+Math.sin(q*Math.PI/4)*2.8;if(!terrainValidAt(px,pz)){ok=false;break;}const h=terrainHeightAt(px,pz);lo=Math.min(lo,h);hi=Math.max(hi,h);}
  if(!ok)continue;const score=(hi-lo)*5+ring*.015+Math.abs(rand(index*31+a)-.5)*.08;
  if(score<bestScore){bestScore=score;best={x,z};}
 }
 return best;
}
function fitRoot(root,targetLength){
 const visual=new BABYLON.TransformNode(root.name+'-visual-pivot',scene);
 const children=root.getChildren().slice();children.forEach(n=>n.parent=visual);
 visual.parent=root;visual.computeWorldMatrix(true);
 const meshes=visual.getChildMeshes(false);
 let min=new BABYLON.Vector3(Infinity,Infinity,Infinity),max=new BABYLON.Vector3(-Infinity,-Infinity,-Infinity);
 meshes.forEach(m=>{m.computeWorldMatrix(true);const b=m.getBoundingInfo().boundingBox;min=BABYLON.Vector3.Minimize(min,b.minimumWorld);max=BABYLON.Vector3.Maximize(max,b.maximumWorld);});
 const sx=max.x-min.x,sz=max.z-min.z,span=Math.max(sx,sz)||1,scale=targetLength/span;
 const cx=(min.x+max.x)*.5,cz=(min.z+max.z)*.5;
 visual.scaling.setAll(scale);visual.position.set(-cx*scale,-min.y*scale,-cz*scale);
 visual.computeWorldMatrix(true);
 const baseYaw=sx>sz?Math.PI/2:0;
 root.metadata=root.metadata||{};root.metadata.visualPivot=visual;
 return baseYaw;
}
async function spawnDino(id,index,total,center){
 const data=DINO[id],path=(quality==='baja'||index>=5)?data.low:data.file;
 let container;try{container=await loadContainer(path);}catch(e){if(path!==data.file)container=await loadContainer(data.file);else throw e;}
 const root=new BABYLON.TransformNode('dino-'+id+'-'+index,scene);
 const instances=container.instantiateModelsToScene(n=>n+'-'+index,false,{doNotInstantiate:true});
 instances.rootNodes.forEach(n=>n.parent=root);
 const clips=instances.animationGroups||[],idle=clips.find(a=>a.name.toLowerCase()==='idle')||clips[0];
 clips.forEach(a=>{if(a!==idle)a.stop();});
 if(idle)idle.start(true);
 root.metadata={dinoId:id};
 const baseYaw=fitRoot(root,data.length*(index===0?1:0.72+rand(index+2)*.22));
 const herdCenters={atacamatitan:{x:4,z:-4},arackar:{x:4,z:-4},patagonia:{x:4,z:-8},stegouros:{x:3,z:4},aysen:{x:3,z:-8}};
 const preferred=center||herdCenters[id]||{x:0,z:-15};
 const spot=findFlatDinoPosition(preferred.x,preferred.z,index);
 if(!spot||!terrainValidAt(spot.x,spot.z))throw new Error('No se encontró suelo firme para '+data.name);
 root.position.set(spot.x,terrainHeightAt(spot.x,spot.z),spot.z);
 root.rotation.y=baseYaw+(data.flip?Math.PI:0);
 root.getChildMeshes().forEach(m=>{m.isPickable=true;m.metadata={...(m.metadata||{}),dinoId:id};pickables.push(m);});
 dinoRoots.push({root,id,clips,clipName:idle?.name||'',baseYaw,lookUntil:0,phase:rand(index+4)*6.28,origin:root.position.clone(),home:{x:spot.x,z:spot.z},heading:rand(index+71)*Math.PI*2,target:null,state:'idle',timer:2+rand(index+82)*5,radius:Math.min(4,1.5+rand(index+8)*2),running:false,lastFootstep:0,stepDistance:0,footSide:1,footprints:[],lastFootPos:root.position.clone()});
 return root;
}
async function addVegetation(){
 const F=WORLD.flora||{adult:5,young:8,fern:35,fern2:55,pebble:100,rocks:30,logs:5};
 const specs=[
  ...(worldKey==='atacamatitan'?[['models/env/cerro_desierto.glb',11,70,120,'mountain']]:[]),
  ['models/veg/araucaria_adulta.glb',F.adult||0,15,23,'tree',20,50,5,16],
  ['models/veg/araucaria_joven.glb',F.young||0,3.5,8,'tree',10,44,3,12],
  ['models/veg/fern_tripo.glb',F.fern||0,.9,1.8,'fern',2.5,30,1.2,6],
  ['models/veg/fern_small.glb',F.fern2||0,.7,1.5,'fern',2.5,32,1.2,6],
  ['models/veg/pebble.glb',F.pebble||0,.12,.45,'ground',0,34,.4,0],
  ['models/env/rock_07.glb',F.rocks||0,.6,1.8,'ground',6,44,.4,0],
  ['models/env/dead_tree_trunk_02.glb',F.logs||0,3.5,6,'ground',8,40,3,4]
 ];
 const waterDistance=(x,z)=>{
  let best=1e9;
  (WORLD.rivers||[]).forEach(r=>{for(let i=1;i<r.pts.length;i++){const a=r.pts[i-1],b=r.pts[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));best=Math.min(best,Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t)-r.w*.5);}});
  (WORLD.lagoons||[]).forEach(l=>{const d=Math.hypot((x-l.x)/l.rx,(z-l.z)/l.rz);best=Math.min(best,(d-1)*Math.min(l.rx,l.rz));});
  return best;
 };
 for(let si=0;si<specs.length;si++){
  const [file,count,minWidth,maxWidth,type,rMin=10,rMax=47,water=1.2,keep=0]=specs[si];if(!count)continue;
  let container;try{container=await loadContainer(file);}catch(e){console.warn('No se pudo cargar vegetación original',file,e);continue;}
  const n=Math.max(0,Math.round(count*Q));
  for(let i=0,attempt=0;i<n&&attempt<n*18+100;attempt++){
   const angle=rand(attempt+si*177+worldKey.length)*Math.PI*2;
   const dist=type==='mountain'?85+Math.sqrt(rand(attempt+si*19+5))*40:rMin+Math.sqrt(rand(attempt+si*31+27))*(rMax-rMin);
   const x=Math.cos(angle)*dist,z=Math.sin(angle)*dist-14;
   if(type!=='mountain'&&!terrainValidAt(x,z))continue;
   const wd=waterDistance(x,z);
   if(wd<water)continue;
   if(keep&&Math.hypot(x-4,z+4)<keep)continue;
   const group=container.instantiateModelsToScene(name=>name+'-world-'+si+'-'+i,false,{doNotInstantiate:true});
   const root=new BABYLON.TransformNode('world-vegetation-'+si+'-'+i,scene);
   group.rootNodes.forEach(node=>node.parent=root);
   root.computeWorldMatrix(true);
   let min=new BABYLON.Vector3(Infinity,Infinity,Infinity),max=new BABYLON.Vector3(-Infinity,-Infinity,-Infinity);
   root.getChildMeshes(false).forEach(mesh=>{mesh.computeWorldMatrix(true);const box=mesh.getBoundingInfo().boundingBox;min=BABYLON.Vector3.Minimize(min,box.minimumWorld);max=BABYLON.Vector3.Maximize(max,box.maximumWorld);});
   const base=Math.max(max.x-min.x,max.z-min.z)||1,targetWidth=minWidth+rand(i+si*53+7)*(maxWidth-minWidth),scale=targetWidth/base;
   root.scaling.setAll(scale);root.position.set(x,type==='mountain'?terrainHeightAt(x,z)-2:terrainHeightAt(x,z),z);root.rotation.y=rand(i+si*97+4)*Math.PI*2;
   root.getChildMeshes().forEach(m=>{m.isPickable=false;m.checkCollisions=false;});
   i++;
  }
 }
}
function addMountains(){
 const key=worldKey==='patagonia'?'gonkoken':worldKey;
 const MTN={
  atacamatitan:{bands:[[150,205,26],[205,262,58],[258,318,100]],strata:['#b5654a','#c98a5c','#9c5a5a','#d9b48a','#8e4f45','#c47a52','#a86a58'],forest:'#7a7040',forestH:5,rock:'#8a6a5a',haze:'#e6d6c2',seed:11},
  arackar:{bands:[[150,205,22],[205,262,44],[258,318,74]],strata:['#dccdb2','#c6ae8c','#e8dec8','#8c7d6c','#bfa07c','#5e5650','#d2c0a0'],forest:'#6c8048',forestH:10,rock:'#7a7068',haze:'#ecd4b2',seed:23,volcano:{ang:-1.95,d:245,h:125,rad:120,col:'#4c4440',smoke:.35}},
  gonkoken:{bands:[[150,205,16],[205,262,30],[258,318,48]],forest:'#45603a',forestH:999,forestF:.8,rock:'#7a7a70',rock2:'#646a66',haze:'#c9d3d4',seed:37,open:{ang:-Math.PI/2,w:1,k:[1,1,1]}},
  stegouros:{bands:[[150,205,28],[205,262,40],[258,318,58]],forest:'#3f5a34',forestH:999,forestF:.92,rock:'#6a6c60',rock2:'#5a5e56',haze:'#bccab8',seed:53},
  aysen:{bands:[[150,205,22],[205,262,52],[258,318,96]],forest:'#3d5a33',forestH:999,forestF:.5,rock:'#4e4f52',rock2:'#3e4044',haze:'#b4babc',seed:41,open:{ang:-Math.PI/2,w:.5,k:[1,.6,0]},volcano:{ang:-1.15,d:250,h:150,rad:125,col:'#3a3634',smoke:1}}
 };
 const M=MTN[key];if(!M)return;
 const hash=(x,y)=>{const v=Math.sin(x*127.1+y*311.7+M.seed*74.7)*43758.5453;return v-Math.floor(v);};
 const noise=(x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);return (hash(xi,yi)*(1-u)+hash(xi+1,yi)*u)*(1-v)+(hash(xi,yi+1)*(1-u)+hash(xi+1,yi+1)*u)*v;};
 const ridged=(x,y,o)=>{let sum=0,amp=.5,freq=1,weight=1;for(let i=0;i<o;i++){let n=1-Math.abs(noise(x*freq,y*freq)*2-1);n*=n;sum+=n*amp*weight;weight=Math.min(1,n*2);freq*=2.03;amp*=.5;}return sum;};
 const fbm=(x,y,o)=>{let sum=0,amp=.5,freq=1;for(let i=0;i<o;i++){sum+=noise(x*freq,y*freq)*amp;freq*=2.1;amp*=.5;}return sum;};
 const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
 const NA=Q>=.6?520:300,NR=Q>=.6?64:40,R0=136,R1=320,count=(NA+1)*NR;
 const positions=new Float32Array(count*3),colors=new Float32Array(count*4),indices=[],heights=new Float32Array(count);
 const strata=M.strata?M.strata.map(c=>BABYLON.Color3.FromHexString(c)):null,rock=BABYLON.Color3.FromHexString(M.rock),rock2=BABYLON.Color3.FromHexString(M.rock2||M.rock),forest=BABYLON.Color3.FromHexString(M.forest);let maxH=0;
 for(let j=0;j<NR;j++){const tr=j/(NR-1),radius=R0+(R1-R0)*Math.pow(tr,.85);
  for(let i=0;i<=NA;i++){const theta=i/NA*Math.PI*2,x=Math.cos(theta)*radius,z=Math.sin(theta)*radius,k=j*(NA+1)+i;let h=-12+14*smooth(R0,150,radius);
   M.bands.forEach((band,bi)=>{const mid=(band[0]+band[1])*.5,half=(band[1]-band[0])*.5,profile=Math.max(0,1-Math.pow((radius-mid)/(half*1.25),2)),sc=.009+bi*.0015,n=ridged(x*sc+bi*17,z*sc-bi*9,5),big=fbm(x*.004+bi*3,z*.004,2);let amp=band[2]*(.55+big)*n*profile*1.55;if(M.open){const d=Math.atan2(Math.sin(theta-M.open.ang),Math.cos(theta-M.open.ang));amp*=1-M.open.k[bi]*Math.exp(-Math.pow(d/M.open.w,2));}h=Math.max(h,h*.4+amp);});
   if(h>0)h=118*Math.tanh(h/118);
   if(M.volcano){const V=M.volcano,vx=Math.cos(V.ang)*V.d,vz=Math.sin(V.ang)*V.d,dist=Math.hypot(x-vx,z-vz);if(dist<V.rad){let cone=V.h*Math.pow(1-dist/V.rad,1.2)*(.92+.16*fbm(x*.05,z*.05,2));if(dist<V.rad*.09)cone-=(V.rad*.09-dist)*.8;h=Math.max(h,cone);}}
   positions[k*3]=x;positions[k*3+1]=h;positions[k*3+2]=z;heights[k]=h;maxH=Math.max(maxH,h);
  }
 }
 for(let j=0;j<NR-1;j++)for(let i=0;i<NA;i++){const a=j*(NA+1)+i,b=a+1,c=a+NA+1,d=c+1;indices.push(a,b,c,b,d,c);}
 const normals=[];BABYLON.VertexData.ComputeNormals(positions,indices,normals);
 for(let k=0;k<count;k++){const x=positions[k*3],y=heights[k],z=positions[k*3+2],ny=normals[k*3+1],slope=1-ny,hn=y/(maxH||1),n1=fbm(x*.05,z*.05,3),n2=noise(x*.3,z*.3);let c;
  if(strata){c=strata[(Math.floor(y*.22+n1*3.2+x*.004)%strata.length+strata.length)%strata.length].clone();c=BABYLON.Color3.Lerp(c,rock,slope*.5);const fz=(1-smooth(M.forestH*.5,M.forestH,y+n1*8))*(1-smooth(.35,.7,slope));c=BABYLON.Color3.Lerp(c,forest,fz*.85);}
  else{const blend=smooth(M.forestF-.1,M.forestF+.12,hn+(n1-.5)*.25+slope*.25);c=BABYLON.Color3.Lerp(forest,BABYLON.Color3.Lerp(rock,rock2,n2),blend);}
  if(M.volcano){const V=M.volcano,dist=Math.hypot(x-Math.cos(V.ang)*V.d,z-Math.sin(V.ang)*V.d),zone=1-smooth(V.rad*.45,V.rad*.95,dist);if(zone>0)c=BABYLON.Color3.Lerp(c,BABYLON.Color3.FromHexString(V.col),zone*.9);}
  const shade=.85+.3*n2;colors[k*4]=c.r*shade;colors[k*4+1]=c.g*shade;colors[k*4+2]=c.b*shade;colors[k*4+3]=1;
 }
 const mesh=new BABYLON.Mesh('original-mountain-ring-'+key,scene),vd=new BABYLON.VertexData();vd.positions=positions;vd.indices=indices;vd.normals=normals;vd.colors=colors;vd.applyToMesh(mesh,true);
 const material=new BABYLON.StandardMaterial('original-mountain-material-'+key,scene);material.diffuseColor=new BABYLON.Color3(1,1,1);material.specularColor=new BABYLON.Color3(.015,.015,.015);material.roughness=1;material.useVertexColors=true;material.backFaceCulling=false;mesh.material=material;mesh.isPickable=false;mesh.applyFog=true;
 if(M.volcano&&M.volcano.smoke){const V=M.volcano,smoke=new BABYLON.ParticleSystem('volcano-smoke-'+key,quality==='baja'?60:150,scene);smoke.particleTexture=makeParticleTexture();smoke.emitter=new BABYLON.Vector3(Math.cos(V.ang)*V.d,V.h*.82,Math.sin(V.ang)*V.d);smoke.minEmitBox=new BABYLON.Vector3(-2,0,-2);smoke.maxEmitBox=new BABYLON.Vector3(2,2,2);smoke.color1=new BABYLON.Color4(.55,.53,.5,.42*V.smoke);smoke.color2=new BABYLON.Color4(.72,.69,.65,.2*V.smoke);smoke.minSize=5;smoke.maxSize=17;smoke.minLifeTime=5;smoke.maxLifeTime=12;smoke.emitRate=20*V.smoke;smoke.direction1=new BABYLON.Vector3(-.08,.8,-.08);smoke.direction2=new BABYLON.Vector3(.08,1.4,.08);smoke.minEmitPower=1;smoke.maxEmitPower=2.5;smoke.updateSpeed=.01;smoke.start();}
}
function waterDistanceAt(x,z){
 let best=1e9;
 (WORLD.rivers||[]).forEach(r=>{for(let i=1;i<r.pts.length;i++){const a=r.pts[i-1],b=r.pts[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));best=Math.min(best,Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t)-r.w*.5);}});
 (WORLD.lagoons||[]).forEach(l=>{const d=Math.hypot((x-l.x)/l.rx,(z-l.z)/l.rz);best=Math.min(best,(d-1)*Math.min(l.rx,l.rz));});
 return best;
}
function addForest3D(){
 const FT=WORLD.forestTex,FN=WORLD.forestN;if(!FT||!FN)return;
 const rnd=(n)=>rand(n+FT.length*197),center=({atacamatitan:{x:4,z:-4},arackar:{x:4,z:-4},patagonia:{x:4,z:-8},stegouros:{x:3,z:4},aysen:{x:3,z:-8}}[worldKey]||{x:0,z:-10});
 const bark=new BABYLON.StandardMaterial('forest-bark-'+FT,scene);bark.diffuseTexture=new BABYLON.Texture('img/'+FT+'_bark.jpg',scene);bark.diffuseColor=new BABYLON.Color3(.82,.78,.72);bark.specularColor=new BABYLON.Color3(.02,.02,.02);bark.roughness=1;
 const leaf=new BABYLON.StandardMaterial('forest-leaf-'+FT,scene);leaf.diffuseTexture=new BABYLON.Texture('img/'+FT+'_leaf.jpg',scene);leaf.backFaceCulling=false;leaf.specularColor=new BABYLON.Color3(.015,.02,.015);leaf.roughness=1;
 const frondMat=new BABYLON.StandardMaterial('forest-frond-'+FT,scene);frondMat.diffuseTexture=new BABYLON.Texture('img/'+FT+'_frond.png',scene);frondMat.useAlphaFromDiffuseTexture=true;frondMat.transparencyMode=BABYLON.Material.MATERIAL_ALPHATEST;frondMat.alphaCutOff=.4;frondMat.backFaceCulling=false;frondMat.specularColor=new BABYLON.Color3(.01,.02,.01);
 const grassMat=new BABYLON.StandardMaterial('forest-grass-'+FT,scene);grassMat.diffuseTexture=new BABYLON.Texture('img/'+FT+'_grass.png',scene);grassMat.useAlphaFromDiffuseTexture=true;grassMat.transparencyMode=BABYLON.Material.MATERIAL_ALPHATEST;grassMat.alphaCutOff=.35;grassMat.backFaceCulling=false;
 const merge=(meshes,name)=>{meshes.forEach(m=>m.computeWorldMatrix(true));const merged=BABYLON.Mesh.MergeMeshes(meshes,true,true,undefined,false,true);if(merged)merged.name=name;return merged;};
 const adultTrunk=BABYLON.MeshBuilder.CreateCylinder('adult-araucaria-trunk-geo',{height:1,diameterTop:.028,diameterBottom:.052,tessellation:8},scene);adultTrunk.position.y=.5;adultTrunk.bakeCurrentTransformIntoVertices();adultTrunk.position.set(0,0,0);
 const adultTiers=[];for(let i=0;i<5;i++){const radius=.17-i*.022,y=.74+i*.045,c=BABYLON.MeshBuilder.CreateCylinder('adult-crown-tier-'+i,{height:.05,diameterTop:0,diameterBottom:radius*2,tessellation:11},scene);c.position.y=y;adultTiers.push(c);}
 const adultTop=BABYLON.MeshBuilder.CreateCylinder('adult-crown-top',{height:.14,diameterTop:0,diameterBottom:.1,tessellation:8},scene);adultTop.position.y=.95;adultTiers.push(adultTop);
 const adultCrown=merge(adultTiers,'adult-araucaria-crown-geo');
 const youngTrunk=BABYLON.MeshBuilder.CreateCylinder('young-araucaria-trunk-geo',{height:.5,diameterTop:.04,diameterBottom:.07,tessellation:6},scene);youngTrunk.position.y=.25;youngTrunk.bakeCurrentTransformIntoVertices();youngTrunk.position.set(0,0,0);
 const youngTiers=[];for(let i=0;i<7;i++){const radius=.30-i*.036,y=.12+i*.12,c=BABYLON.MeshBuilder.CreateCylinder('young-crown-tier-'+i,{height:.13,diameterTop:.01,diameterBottom:radius*2,tessellation:10},scene);c.position.y=y;youngTiers.push(c);}
 const youngCrown=merge(youngTiers,'young-araucaria-crown-geo');
 const fernStem=BABYLON.MeshBuilder.CreateCylinder('tree-fern-stem-geo',{height:1,diameterTop:.14,diameterBottom:.22,tessellation:7},scene);fernStem.position.y=.5;fernStem.bakeCurrentTransformIntoVertices();fernStem.position.set(0,0,0);
 const fernParts=[];for(let k=0;k<10;k++){const p=BABYLON.MeshBuilder.CreatePlane('tree-fern-frond-'+k,{width:.62,height:1.5,sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene);p.position.y=1.75;p.rotation.x=-.25-(k%3)*.16;p.rotation.y=k/10*Math.PI*2+(k%2)*.3;fernParts.push(p);}
 const fernLeaves=merge(fernParts,'tree-fern-leaves-geo');
 const grassParts=[];for(let k=0;k<3;k++){const p=BABYLON.MeshBuilder.CreatePlane('grass-blade-'+k,{width:1,height:.8,sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene);p.position.y=.4;p.rotation.y=k*Math.PI/3;grassParts.push(p);}
 const grassGeo=merge(grassParts,'grass-clump-geo');
 const setThin=(mesh,instances,material,name)=>{if(!mesh||!instances.length)return;mesh.name=name;mesh.material=material;mesh.isPickable=false;mesh.thinInstanceSetBuffer('matrix',new Float32Array(instances.flatMap(m=>Array.from(m.m))),16,true);mesh.thinInstanceRefreshBoundingInfo(true);};
 const place=(count,opt,seed)=>{
  const out=[],tries=count*14;
  for(let t=0;t<tries&&out.length<count;t++){
   const a=rnd(seed+t*3+1)*Math.PI*2,r=opt.rMin+Math.sqrt(rnd(seed+t*3+2))*(opt.rMax-opt.rMin),x=Math.cos(a)*r,z=Math.sin(a)*r;
   if(!terrainValidAt(x,z))continue;
   const wd=waterDistanceAt(x,z);if(wd<(opt.water??3))continue;if(opt.wMax&&wd>opt.wMax&&rnd(seed+t*3+3)>.25)continue;
   if(opt.keepHerd&&Math.hypot(x-center.x,z-center.z)<opt.keepHerd)continue;
   out.push({x,z,y:terrainHeightAt(x,z)});
  }
  return out;
 };
 const makeMatrices=(list,scaleFn,offsetY=0)=>list.map((p,i)=>{const sc=scaleFn(i),rot=BABYLON.Quaternion.RotationYawPitchRoll(rnd(i*19+FT.length)*Math.PI*2,0,0);return BABYLON.Matrix.Compose(new BABYLON.Vector3(sc.x,sc.y,sc.z),rot,new BABYLON.Vector3(p.x,p.y+offsetY,p.z));});
 const adult=place(Math.round(FN.adult*Q),{rMin:46,rMax:130,water:7,keepHerd:16},11),adultH=adult.map((p,i)=>16+rnd(i*5+13)*16);
 setThin(adultTrunk,makeMatrices(adult,i=>({x:adultH[i],y:adultH[i],z:adultH[i]}),0),bark,'forest-adult-trunks-'+FT);
 setThin(adultCrown,makeMatrices(adult,i=>({x:adultH[i],y:adultH[i],z:adultH[i]}),0),leaf,'forest-adult-crowns-'+FT);
 const young=place(Math.round(FN.young*Q),{rMin:40,rMax:130,water:5,keepHerd:12},29),youngH=young.map((p,i)=>5+rnd(i*7+31)*8);
 setThin(youngTrunk,makeMatrices(young,i=>({x:youngH[i],y:youngH[i],z:youngH[i]})),bark,'forest-young-trunks-'+FT);
 setThin(youngCrown,makeMatrices(young,i=>({x:youngH[i],y:youngH[i],z:youngH[i]})),leaf,'forest-young-crowns-'+FT);
 const ferns=place(Math.round(FN.fern*Q),{rMin:7,rMax:120,water:3.5,wMax:45,keepHerd:6},53),fernH=ferns.map((p,i)=>1.1+rnd(i*11+59)*2.4);
 setThin(fernStem,makeMatrices(ferns,i=>({x:fernH[i],y:fernH[i],z:fernH[i]})),bark,'forest-fern-stems-'+FT);
 setThin(fernLeaves,makeMatrices(ferns,i=>({x:fernH[i],y:fernH[i],z:fernH[i]})),frondMat,'forest-fern-leaves-'+FT);
 const grass=place(Math.round((WORLD.walk?0:FN.grass)*Q),{rMin:2,rMax:60,water:1.2},79),grassH=grass.map((p,i)=>.35+rnd(i*13+83)*.6);
 setThin(grassGeo,makeMatrices(grass,i=>({x:grassH[i],y:grassH[i],z:grassH[i]})),grassMat,'forest-grass-'+FT);
}
function makeParticleTexture(){const tex=new BABYLON.DynamicTexture('procedural-particle',64,scene,false);const c=tex.getContext(),g=c.createRadialGradient(32,32,1,32,32,31);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(255,255,255,.75)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,64,64);tex.update(false);return tex;}
function addParticles(){const p=new BABYLON.ParticleSystem('ambient-dust',700,scene);p.particleTexture=makeParticleTexture();p.emitter=new BABYLON.Vector3(0,2,-15);p.minEmitBox=new BABYLON.Vector3(-42,0,-42);p.maxEmitBox=new BABYLON.Vector3(42,15,42);p.color1=new BABYLON.Color4(.9,.78,.55,.25);p.color2=new BABYLON.Color4(.7,.85,.75,.12);p.minSize=.025;p.maxSize=.11;p.minLifeTime=5;p.maxLifeTime=12;p.emitRate=quality==='baja'?10:32;p.direction1=new BABYLON.Vector3(-.1,.1,-.1);p.direction2=new BABYLON.Vector3(.1,.3,.1);p.minEmitPower=.05;p.maxEmitPower=.3;p.updateSpeed=.01;p.start();}
function showInfo(id){const d=DINO[id];if(!d)return;const actor=dinoRoots.find(x=>x.id===id);if(actor){actor.lookUntil=performance.now()+6500;actor.state='look';actor.target=null;actor.clipName='';}$('infoTitle').textContent=d.name;$('infoBody').textContent=d.text;$('info').classList.remove('hidden');}
function closeInfo(){$('info').classList.add('hidden');}
function onPick(evt){if(!evt.hit||!evt.pickedMesh)return;let m=evt.pickedMesh;while(m&&!m.metadata?.dinoId&&!m.metadata?.ground)m=m.parent;if(m?.metadata?.dinoId){showInfo(m.metadata.dinoId);return;}if(m?.metadata?.ground&&evt.pickedPoint){target=evt.pickedPoint.clone();moving=true;}}
function movePlayer(dt){
 if(!moving||!target||xr?.baseExperience?.state===BABYLON.WebXRState.IN_XR)return;
 if(!terrainValidAt(target.x,target.z)){moving=false;target=null;return;}
 const dx=target.x-camera.position.x,dz=target.z-camera.position.z,len=Math.hypot(dx,dz);
 if(len<.45){moving=false;target=null;return;}
 const advance=Math.min(len,dt*4.5),nx=camera.position.x+dx/len*advance,nz=camera.position.z+dz/len*advance;
 const samples=5;let safe=true;
 for(let i=1;i<=samples;i++){const t=i/samples,x=camera.position.x+(nx-camera.position.x)*t,z=camera.position.z+(nz-camera.position.z)*t;if(!terrainValidAt(x,z)){safe=false;break;}}
 if(!safe){moving=false;target=null;return;}
 camera.position.x=nx;camera.position.z=nz;camera.position.y=terrainHeightAt(nx,nz)+1.65;
}
function emitDinoFootFX(d,dx,dz,travelled){
 const L=DINO[d.id].length,groundY=terrainHeightAt(d.root.position.x,d.root.position.z);
 d.stepDistance=(d.stepDistance||0)+travelled;
 const stride=Math.max(.35,L*.22);
 if(d.stepDistance<stride)return;
 d.stepDistance=0;d.footSide*=-1;
 const len=Math.hypot(dx,dz)||1,side=d.footSide*L*.09;
 const x=d.root.position.x-(dz/len)*side,z=d.root.position.z+(dx/len)*side;
 if(L>=2.5){
  const matName='footprint-'+d.id;
  let material=scene.getMaterialByName(matName);
  if(!material){material=new BABYLON.StandardMaterial(matName,scene);material.diffuseColor=new BABYLON.Color3(.16,.12,.09);material.alpha=.22;material.specularColor=new BABYLON.Color3(0,0,0);material.disableLighting=false;}
  const mark=BABYLON.MeshBuilder.CreateDisc('dino-footprint',{radius:Math.max(.12,L*.055),tessellation:12},scene);
  mark.rotation.x=Math.PI/2;mark.rotation.z=Math.atan2(dx,dz);mark.position.set(x,groundY+.018,z);mark.material=material;mark.isPickable=false;
  d.footprints.push({mesh:mark,age:0});if(d.footprints.length>12){const old=d.footprints.shift();old.mesh.dispose();}
 }
 if(!d.dustFX){
  d.dustFX=new BABYLON.ParticleSystem('dino-dust-'+d.id,70,scene);d.dustFX.particleTexture=makeParticleTexture();
  d.dustFX.minLifeTime=.25;d.dustFX.maxLifeTime=.65;d.dustFX.minSize=.06;d.dustFX.maxSize=Math.max(.12,L*.035);
  d.dustFX.color1=new BABYLON.Color4(.65,.52,.37,.28);d.dustFX.color2=new BABYLON.Color4(.82,.72,.56,.12);
  d.dustFX.direction1=new BABYLON.Vector3(-.2,.35,-.2);d.dustFX.direction2=new BABYLON.Vector3(.2,.8,.2);
  d.dustFX.minEmitPower=.15;d.dustFX.maxEmitPower=.55;d.dustFX.emitRate=0;d.dustFX.manualEmitCount=0;d.dustFX.emitter=new BABYLON.Vector3(x,groundY+.08,z);
 }
 d.dustFX.emitter.set(x,groundY+.08,z);d.dustFX.manualEmitCount=d.running?16:8;d.dustFX.start();
}
function animateDinos(t,dt){
 const step=Math.min(.05,Math.max(0,dt||0));
 // Valores calibrados desde GAIT del original v19 (m/s por metro de longitud).
 const gait={
  atacamatitan:{walk:.10,run:.50,reverse:false},
  arackar:{walk:.16,run:.72,reverse:false},
  patagonia:{walk:.08,run:1.0,reverse:false},
  stegouros:{walk:.22,run:.60,reverse:true},
  aysen:{walk:.45,run:2.2,reverse:false}
 };
 dinoRoots.forEach(d=>{
  const root=d.root,groundY=terrainHeightAt(root.position.x,root.position.z);
  if(t<d.lookUntil){d.state='look';}
  else if(d.state==='look'){d.state='idle';d.timer=1.5;d.target=null;}
  if(d.state==='idle'){
   d.timer-=step;
   if(d.timer<=0){
    let candidate=null;
    for(let tries=0;tries<16&&!candidate;tries++){
     const a=rand(Math.floor(t)+tries*31+d.phase*100)*Math.PI*2,r=rand(Math.floor(t)+tries*17+d.phase*71)*d.radius;
     const x=d.home.x+Math.cos(a)*r,z=d.home.z+Math.sin(a)*r;
     const samples=[ [x,z],[x+Math.cos(a)*DINO[d.id].length*.3,z+Math.sin(a)*DINO[d.id].length*.3],[x-Math.cos(a)*DINO[d.id].length*.3,z-Math.sin(a)*DINO[d.id].length*.3] ];
     if(samples.every(p=>terrainValidAt(p[0],p[1])))candidate={x,z};
    }
    if(candidate){d.target=candidate;d.state='walk';}
    else d.timer=2;
   }
  }
  if(d.state==='walk'&&d.target){
   const dx=d.target.x-root.position.x,dz=d.target.z-root.position.z,dist=Math.hypot(dx,dz);
   if(dist<.35){d.state='idle';d.target=null;d.timer=2+rand(Math.floor(t)+d.phase*19)*4;}
   else{
    const desired=Math.atan2(dx,dz);let delta=desired-d.heading;
    while(delta>Math.PI)delta-=Math.PI*2;while(delta< -Math.PI)delta+=Math.PI*2;
    d.heading+=Math.sign(delta)*Math.min(Math.abs(delta),1.4*step);
    const profile=gait[d.id]||gait.atacamatitan,mode=d.running?'run':'walk',speed=DINO[d.id].length*profile[mode]*Math.min(1,Math.max(.35,1-Math.abs(delta)*.35));
    const nx=root.position.x+Math.sin(d.heading)*speed*step,nz=root.position.z+Math.cos(d.heading)*speed*step;
    const r=DINO[d.id].length*.3;
    const support=[[nx,nz],[nx+Math.sin(d.heading)*r,nz+Math.cos(d.heading)*r],[nx-Math.sin(d.heading)*r,nz-Math.cos(d.heading)*r]];
    if(support.every(p=>terrainValidAt(p[0],p[1]))){
     const heights=support.map(p=>terrainHeightAt(p[0],p[1]));
     const travelled=Math.hypot(nx-root.position.x,nz-root.position.z);root.position.x=nx;root.position.z=nz;root.position.y=Math.min(...heights);emitDinoFootFX(d,Math.sin(d.heading),Math.cos(d.heading),travelled);
    }else{d.state='idle';d.target=null;d.timer=2.5;}
   }
  }else root.position.y=groundY;
  if(d.footprints?.length){for(let i=d.footprints.length-1;i>=0;i--){const fp=d.footprints[i];fp.age+=step;if(fp.age>18){fp.mesh.dispose();d.footprints.splice(i,1);}else fp.mesh.material.alpha=.22*(1-fp.age/18);}}
  const desired=d.state==='look'?'Neck_Look':d.state==='walk'?(d.running?'Run':'Walk'):'Idle';
  if(d.clipName!==desired){
   const clip=d.clips.find(a=>a.name.toLowerCase()===desired.toLowerCase());
   if(clip){d.clips.forEach(a=>{if(a!==clip)a.stop();});const profile=gait[d.id]||gait.atacamatitan;clip.speedRatio=desired==='Walk'?(profile.walk/.10):desired==='Run'?(profile.run/.50):1;clip.start(true);d.clipName=desired;}
  }
  if(d.state==='walk')root.rotation.y=d.heading+d.baseYaw+(DINO[d.id].flip?Math.PI:0);
  else root.rotation.y=d.heading+d.baseYaw+(DINO[d.id].flip?Math.PI:0);
 });
}
async function enterXR(){try{if(!navigator.xr){$('sensorNotice').classList.remove('hidden');return;}if(!xr)xr=await scene.createDefaultXRExperienceAsync({uiOptions:{sessionMode:'immersive-vr',referenceSpaceType:'local-floor',customButtons:[]},disableTeleportation:true});await xr.baseExperience.enterXRAsync('immersive-vr','local-floor');}catch(e){console.warn('WebXR no disponible',e);$('sensorNotice').classList.remove('hidden');}}
function bindControls(){scene.onPointerObservable.add(pi=>{if(pi.type===BABYLON.PointerEventTypes.POINTERPICK)onPick(pi.pickInfo);});canvas.addEventListener('pointerdown',()=>{if(camera.inputs.attached.pointers){}},{passive:true});$('explore').onclick=()=>startExperience(false);$('visor').onclick=()=>startExperience(true);$('vrButton').onclick=enterXR;$('closeInfo').onclick=closeInfo;$('timeButton').onclick=()=>{night=!night;scene.ambientColor=night?new BABYLON.Color3(.12,.16,.25):new BABYLON.Color3(.3,.3,.3);$('timeButton').textContent=night?'🌙':'☀️';};$('rainButton').onclick=()=>{raining=!raining;$('rainButton').textContent=raining?'🌧️':'🌧';if(raining){if(!rainSystem){rainSystem=new BABYLON.ParticleSystem('rain',1800,scene);rainSystem.particleTexture=makeParticleTexture();rainSystem.emitter=new BABYLON.Vector3(0,18,-10);rainSystem.minEmitBox=new BABYLON.Vector3(-55,0,-55);rainSystem.maxEmitBox=new BABYLON.Vector3(55,0,55);rainSystem.color1=new BABYLON.Color4(.65,.75,.9,.5);rainSystem.color2=new BABYLON.Color4(.8,.85,1,.35);rainSystem.minSize=.025;rainSystem.maxSize=.05;rainSystem.minLifeTime=1;rainSystem.maxLifeTime=2;rainSystem.emitRate=1200;rainSystem.direction1=new BABYLON.Vector3(0,-1,0);rainSystem.direction2=new BABYLON.Vector3(.2,-1,.2);rainSystem.minEmitPower=8;rainSystem.maxEmitPower=13;}rainSystem.start();}else rainSystem?.stop();};$('soundButton').onclick=()=>{soundOn=!soundOn;$('soundButton').textContent=soundOn?'🔊':'🔇';};$('qualityButton').onclick=()=>{const next=quality==='alta'?'media':quality==='media'?'baja':'alta';location.search=new URLSearchParams({...Object.fromEntries(params),q:next}).toString();};$('retrySensors').onclick=()=>enterXR();$('continueTouch').onclick=()=>{$('sensorNotice').classList.add('hidden');};}
async function startExperience(withVR){$('loader').style.opacity='0';setTimeout(()=>$('loader').classList.add('hidden'),750);$('hud').classList.remove('hidden');$('worldLabel').textContent=WORLD.title;if(withVR)await enterXR();}
async function init(){
 try{engine=new BABYLON.Engine(canvas,true,{disableWebGL2Support:false,doNotHandleContextLost:false,preserveDrawingBuffer:false,stencil:true,antialias:true,adaptToDeviceRatio:true});if(!engine.webGLVersion||engine.webGLVersion<2)throw new Error('Este dispositivo no ofrece WebGL 2.');
 scene=new BABYLON.Scene(engine);scene.clearColor=new BABYLON.Color4(.65,.76,.77,1);scene.collisionsEnabled=true;scene.fogMode=BABYLON.Scene.FOGMODE_EXP2;scene.fogColor=BABYLON.Color3.FromHexString(WORLD.fog);scene.fogDensity=({atacamatitan:.0038,arackar:.0042,patagonia:.0052,stegouros:.0085,aysen:.006,valle:.006}[worldKey]||.0038);
 camera=new BABYLON.UniversalCamera('player-camera',new BABYLON.Vector3(0,1.65,12),scene);camera.minZ=.08;camera.maxZ=320;camera.fov=.92;camera.speed=.35;camera.inertia=.82;camera.angularSensibility=3800;camera.attachControl(canvas,true);camera.keysUp.push(87);camera.keysDown.push(83);camera.keysLeft.push(65);camera.keysRight.push(68);camera.applyGravity=false;camera.checkCollisions=false;camera.ellipsoid=new BABYLON.Vector3(.35,.85,.35);
 setProgress(.08,'Creando el paisaje…');addSky();addLighting();await addTerrain();camera.position.y=1.65+terrainHeightAt(0,12);addWater();addSandBars();addMountains();setProgress(.2,'Cargando dinosaurios…');
 const ids=WORLD.dinos,baseHerd={atacamatitan:22,arackar:24,patagonia:22,stegouros:18,aysen:28,valle:5}[worldKey]||5,herdSize=Math.max(3,Math.round(baseHerd*Q)),totalDinos=ids.length*herdSize;let loadedDinos=0;for(const id of ids){for(let n=0;n<herdSize;n++){await spawnDino(id,n,herdSize,null);loadedDinos++;setProgress(.2+.53*loadedDinos/totalDinos,'Cargando '+DINO[id].name+' · '+loadedDinos+'/'+totalDinos+'…');}}
 setProgress(.76,'Poblando el paisaje…');await addVegetation();addForest3D();setProgress(.9,'Preparando atmósfera…');addParticles();bindControls();scene.onBeforeRenderObservable.add(()=>{const now=performance.now(),dt=Math.min(.05,(now-lastTime)/1000||0);lastTime=now;movePlayer(dt);animateDinos(now,dt);});
 engine.runRenderLoop(()=>{if(scene&&scene.activeCamera)scene.render();});window.addEventListener('resize',()=>engine.resize());setProgress(1,'¡Mundo listo!');$('startButtons').classList.remove('hidden');
 }catch(err){console.error(err);$('loadText').textContent='No se pudo iniciar el mundo: '+err.message;$('startButtons').classList.remove('hidden');$('explore').onclick=()=>location.reload();}
}
window.addEventListener('DOMContentLoaded',init);
})();
