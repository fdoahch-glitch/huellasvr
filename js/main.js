/* Huellas VR · Babylon.js + WebGL 2 + WebXR
 * Migración nativa: no A-Frame, no Three.js, no WebGPU.
 */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const canvas = $('renderCanvas');
const params = new URLSearchParams(location.search);
const qualityParam = params.get('q');
const mobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent||'');
const quality = qualityParam || (mobileDevice || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 3 ? 'media' : 'alta');
const Q = { ultra: 1, alta: 1, media: .6, baja: .3 }[quality] || 1;
const VISUAL_PROFILE={ultra:{shadow:2048,blur:24,anisotropy:16,bloom:.18,samples:4,particles:900},alta:{shadow:1536,blur:18,anisotropy:12,bloom:.12,samples:4,particles:700},media:{shadow:1024,blur:12,anisotropy:8,bloom:.06,samples:2,particles:420},baja:{shadow:512,blur:8,anisotropy:4,bloom:0,samples:1,particles:180}};
const VP=VISUAL_PROFILE[quality]||VISUAL_PROFILE.alta;
const DINO = {
 atacamatitan:{name:'Atacamatitan',file:'models/atacamatitan.glb',low:'models/lo_atacamatitan.glb',length:14,forwardYaw:-Math.PI/2,text:'Titanosaurio del Cretácico superior. Sus huesos aparecieron en el desierto de Atacama, cerca de Conchi Viejo.'},
 arackar:{name:'Arackar',file:'models/arackar.glb',low:'models/lo_arackar.glb',length:7,forwardYaw:0,text:'Titanosaurio de Atacama. Su nombre viene del kunza, la lengua de los atacameños. El ejemplar hallado medía unos 6 m.'},
 gonkoken:{name:'Gonkoken',file:'models/gonkoken.glb',low:'models/lo_gonkoken.glb',length:4,forwardYaw:-Math.PI/2,text:'Dinosaurio pico de pato de la Patagonia chilena. Vivió hace unos 71 millones de años y medía entre 3,5 y 4 m.'},
 chilesaurus:{name:'Chilesaurus',file:'models/chilesaurus.glb',low:'models/lo_chilesaurus.glb',length:3,forwardYaw:-Math.PI/2,text:'Vivió hace unos 147 millones de años y comía plantas. Lo descubrió Diego Suárez, un niño de 7 años.'},
 stegouros:{name:'Stegouros',file:'models/stegouros.glb',low:'models/lo_stegouros.glb',length:2,forwardYaw:-Math.PI/2,text:'Vivió hace unos 74 millones de años en la Patagonia chilena. Medía cerca de 2 m y su cola tenía siete pares de placas.'}
};
const WORLDS = {
 valle:{title:'Valle de Huellas',sky:'img/valle.jpg',ground:'img/valle_c.jpg',height:'img/valle_h.png',fog:'#988e78',hemi:'#ffffff',sun:'#fff1d6',dinos:['atacamatitan','arackar','gonkoken','chilesaurus','stegouros'],terrainMeta:[-.4045716,.4045716,-.4901887,.4901887,0,.4671936],terrainWidth:190,trees:55,ferns:40,rocks:40},
 atacamatitan:{title:'Atacamatitan · Formación Tolar',sky:'img/atacamatitan_sky.jpg',ground:'img/atacamatitan_c.jpg',height:'img/atacamatitan_h.png',fog:'#d8c2a4',hemi:'#fff0dc',sun:'#fff2d6',dinos:['atacamatitan'],terrainMeta:[-.5,.5,-.5,.5,-.003,.06],terrainWidth:300,forestTex:'atacamatitan',forestN:{adult:22,young:28,fern:50,grass:0},rivers:[{pts:[[-160,-34],[-153.5,-33.6],[-144.5,-33.1],[-133.8,-32.5],[-122.3,-31.9],[-110.6,-31.2],[-99.6,-30.6],[-90,-30],[-81.8,-29.5],[-74.3,-28.9],[-67.2,-28.4],[-60.4,-27.9],[-53.7,-27.5],[-47,-27.2],[-40,-27],[-32.9,-27],[-25.7,-27.1],[-18.6,-27.3],[-11.4,-27.6],[-4.3,-28],[2.9,-28.5],[10,-29],[16.7,-29.7],[22.8,-30.7],[28.8,-31.9],[35.1,-33],[42.1,-34],[50.2,-34.7],[60,-35],[72.5,-34.8],[87.8,-34.2],[104.6,-33.4],[121.5,-32.4],[137.3,-31.4],[150.5,-30.5],[160,-30]],w:18},{pts:[[-90,-30],[-86.5,-31.1],[-81.8,-32.6],[-76.2,-34.4],[-69.9,-36.3],[-63.3,-38.1],[-56.6,-39.8],[-50,-41],[-43.5,-42],[-36.7,-42.8],[-29.8,-43.5],[-22.7,-44],[-15.3,-44.3],[-7.8,-44.3],[0,-44],[8.6,-43.3],[18.2,-42],[28.2,-40.5],[38,-38.9],[46.9,-37.3],[54.5,-35.9],[60,-35]],w:7}],lagoons:[],bars:[{x:8,z:-27,rx:16,rz:3.2,rot:.05},{x:-60,z:-17,rx:10,rz:3,rot:.2},{x:70,z:-24,rx:11,rz:3,rot:-.1},{x:-50,z:38,rx:12,rz:3,rot:0},{x:60,z:40,rx:10,rz:2.6,rot:.1}],flora:{adult:3,young:5,fern:30,fern2:50,pebble:220,rocks:70,logs:3}},
 arackar:{title:'Arackar · Formación Hornitos',sky:'img/arackar_sky.jpg',ground:'img/arackar_c.jpg',height:'img/arackar_h.png',fog:'#e2c6a0',hemi:'#ffe6c8',sun:'#ffd9a0',dinos:['arackar'],terrainMeta:[-.5,.5,-.5,.5,-.003,.06],terrainWidth:300,forestTex:'arackar',forestN:{adult:45,young:70,fern:110,grass:0},lagoons:[{x:8,z:-31,rx:20,rz:11,rot:0,y:.045},{x:-38,z:-12,rx:7,rz:5,rot:0,y:.045}],flora:{adult:5,young:9,fern:50,fern2:80,pebble:120,rocks:34,logs:3}},
 patagonia:{title:'Gonkoken · Formación Dorotea',sky:'img/gonkoken_sky.jpg',ground:'img/gonkoken_c.jpg',height:'img/gonkoken_h.png',fog:'#b7c4c6',hemi:'#e4ecec',sun:'#f2f4ff',dinos:['gonkoken'],terrainMeta:[-.5,.5,-.5,.5,-.003,.06],terrainWidth:300,forestTex:'gonkoken',forestN:{adult:60,young:110,fern:140,grass:0},rivers:[{pts:[[-160,46],[-154,44],[-145.6,41.2],[-135.7,37.9],[-125,34.3],[-114.2,30.6],[-103.9,27.1],[-95,24],[-87.1,21.2],[-79.6,18.6],[-72.4,16.1],[-65.6,13.6],[-59.2,11.2],[-53.3,8.6],[-48,6],[-43.2,3.3],[-39.1,.6],[-35.4,-2.1],[-32.1,-4.9],[-29.2,-7.8],[-26.5,-10.8],[-24,-14],[-21.7,-17.6],[-19.8,-21.7],[-18.2,-26.1],[-16.9,-30.4],[-15.7,-34.3],[-14.8,-37.6],[-14,-40]],w:9}],lagoons:[{x:0,z:-330,rx:900,rz:300,rot:0,y:.045}],bars:[{x:-45,z:-21,rx:6,rz:1.8,rot:.1},{x:40,z:-30,rx:7,rz:2,rot:-.1},{x:4,z:-24.5,rx:5,rz:1.5,rot:.1},{x:-85,z:36,rx:6,rz:1.6,rot:0},{x:60,z:37,rx:5,rz:1.5,rot:.15}],flora:{adult:5,young:7,fern:40,fern2:60,pebble:160,rocks:10,logs:9}},
 stegouros:{title:'Stegouros · Formación Dorotea',sky:'img/stegouros_sky.jpg',ground:'img/stegouros_c.jpg',height:'img/stegouros_h.png',fog:'#a9b8a0',hemi:'#e6f0d6',sun:'#fff4d8',dinos:['stegouros'],terrainMeta:[-.5,.5,-.5,.5,-.003,.06],terrainWidth:300,forestTex:'stegouros',forestN:{adult:200,young:320,fern:300,grass:0},rivers:[{pts:[[-160,-6],[-151.5,-6.8],[-139.6,-8.1],[-125.4,-9.6],[-110.2,-11.1],[-95.1,-12.4],[-81.3,-13.5],[-70,-14],[-61,-13.9],[-53.2,-13.1],[-46.5,-12.1],[-40.4,-10.9],[-34.8,-9.9],[-29.5,-9.1],[-24,-9],[-18.7,-9.6],[-13.8,-10.7],[-9.3,-12.2],[-5,-13.8],[-.7,-15.3],[3.6,-16.4],[8,-17],[11.8,-16.8],[14.6,-16.1],[17.1,-15],[20.1,-13.8],[24.4,-12.7],[30.8,-12],[40,-12],[53.6,-12.7],[71.4,-14.1],[91.6,-15.8],[112.3,-17.6],[131.9,-19.4],[148.4,-21],[160,-22]],w:5}],lagoons:[],flora:{adult:16,young:26,fern:100,fern2:170,pebble:50,rocks:14,logs:10}},
 aysen:{title:'Chilesaurus · Formación Toqui',sky:'img/aysen_sky.jpg',ground:'img/aysen_c.jpg',height:'img/aysen_h.png',fog:'#9da2a2',hemi:'#d6d8d4',sun:'#f4ead6',dinos:['chilesaurus'],terrainMeta:[-.5,.5,-.5,.5,-.003,.06],terrainWidth:300,forestTex:'aysen',forestN:{adult:90,young:200,fern:280,grass:0},rivers:[{pts:[[-110,160],[-106.3,151.5],[-101.3,139.7],[-95.2,125.7],[-88.7,110.6],[-82,95.6],[-75.6,81.7],[-70,70],[-64.9,60.4],[-59.8,51.7],[-54.9,43.9],[-50.2,36.8],[-45.7,30.1],[-41.7,23.9],[-38,18],[-34.8,12.5],[-32,7.8],[-29.5,3.5],[-27.3,-.4],[-25.4,-4.2],[-23.6,-8],[-22,-12],[-20.6,-16.3],[-19.4,-21],[-18.4,-25.6],[-17.6,-30.1],[-17,-34.1],[-16.5,-37.5],[-16,-40]],w:7},{pts:[[70,160],[67.7,151.5],[64.6,139.7],[60.8,125.7],[56.7,110.6],[52.6,95.6],[48.6,81.7],[45,70],[41.7,60.4],[38.4,51.7],[35.1,43.9],[32,36.8],[29.1,30.1],[26.4,23.9],[24,18],[21.9,12.5],[20.2,7.8],[18.6,3.5],[17.3,-.4],[16.1,-4.2],[15,-8],[14,-12],[13.1,-16.3],[12.3,-21],[11.7,-25.6],[11.1,-30.1],[10.7,-34.1],[10.3,-37.5],[10,-40]],w:6},{pts:[[-38,18],[-37.4,16.5],[-36.6,14.5],[-35.6,12.2],[-34.5,9.6],[-33.3,6.9],[-32.2,4.3],[-31,2],[-29.7,-.2],[-28.3,-2.6],[-26.8,-4.9],[-25.3,-7.1],[-24,-9.1],[-22.8,-10.8],[-22,-12]],w:3.5}],lagoons:[{x:0,z:-125,rx:210,rz:92,rot:0,y:.045}],bars:[{x:-35,z:-17,rx:14,rz:3.5,rot:.1},{x:5,z:-24,rx:16,rz:4,rot:-.05},{x:45,z:-32,rx:13,rz:3,rot:.1},{x:-85,z:-34,rx:15,rz:4,rot:0},{x:30,z:31,rx:14,rz:3.2,rot:.05},{x:-60,z:29,rx:12,rz:3,rot:0},{x:100,z:-36,rx:12,rz:3,rot:0}],flora:{adult:7,young:12,fern:110,fern2:190,pebble:200,rocks:26,logs:6}}
};
const HERD_CONFIG = {
 atacamatitan:{center:{x:4,z:-4},spread:9,sizes:[10,9.8,9.5,9.2,9,8.8,8.5,8.2,7.5,7,6.5,6,5.5,4.5,4,3.6,3.2,2.8,2.5,2.2,2,1.8],water:{x:3,z:-15.4,w:18,fdx:0,fdz:-1}},
 arackar:{center:{x:4,z:-4},spread:9,sizes:[8,7.8,7.5,7.2,7,6.8,6.5,6.2,5.5,5.2,5,4.5,4,3.2,2.8,2.5,2.3,2.1,1.9,1.7,1.5,1.3,1.2],water:{pond:true,x:8,z:-31,rx:20,rz:11}},
 patagonia:{center:{x:4,z:-8},spread:10,sizes:[4,3.8,3.6,3.4,3.2,3,2.8,2.6,2.3,2,1.8,1.5,1.3],water:{x:3,z:-28.4,w:22,fdx:0,fdz:-1}},
 stegouros:{center:{x:3,z:4},spread:9,sizes:[2,1.9,1.8,1.7,1.6,1.5,1.4,1.2,1,.9,.8],water:{x:3,z:-11.9,w:14,fdx:0,fdz:-1}},
 aysen:{center:{x:3,z:-8},spread:10,sizes:[3,2.9,2.8,2.7,2.6,2.5,2.4,2.2,2.1,2,1.9,1.8,1.6,1.5,1.4,1.3,1.2,1.1,1,.9,.8,.7],water:{x:3,z:-31.9,w:22,fdx:0,fdz:-1}}
};
const requested = (params.get('mundo') || 'atacamatitan').toLowerCase();
const worldKey = WORLDS[requested] ? requested : 'valle';
const WORLD = WORLDS[worldKey];
let havokInstance=null,physicsPlugin=null,physicsController=null,physicsAggregates=[],environmentCollisionZones=[],physicsReady=false,physicsLastSupport='not-started',skyReady=false,skyError=null,terrainPhotoReady=false,terrainNormalReady=false,terrainTextureError=null;
let engine, scene, camera, xr, player, ground, waterMesh, rainSystem, visualPipeline=null, ssaoPipeline=null, ssrPipeline=null, volumetricLight=null, environmentTexture=null, environmentReady=false, environmentError=null, particleBackend='cpu', soundOn=true, night=false, raining=false, moving=false, target=null, lastTime=0, dinoRoots=[], pickables=[], assetCache=new Map(), animationGroups=[], waterTextures=[], shadowGenerator=null, xrMovement=null, skyMaterial=null, hemiLight=null, sunLight=null, audioContext=null, audioMaster=null, rainGain=null, waterGain=null, lightingBase=null, timeMode='dia', skyLife=null, nightInsectGain=null, rainBlend=0, xrGazeActor=null, xrGazeSince=0, xrGazeFired=false;
let orientationEnabled=false,orientationBase=null,orientationHandler=null,stereoEnabled=false,stereoWakeLock=null,stereoTapTimes=[],cpuUpdateMs=0,cpuUpdateAvgMs=0,cpuStageMs={player:0,herd:0,dinosaurs:0,footFx:0,environment:0,gaze:0,water:0,total:0},frameTimeSamples=[],lastPerfFrameAt=0,ambientAudioMixKey='',renderLoop=null,contextLost=false,renderPausedForVisibility=false,renderLoopStarted=false,particleTextureCache=null,collisionCellSize=12,environmentCollisionGrid=new Map(),dinoCollisionGrid=new Map(),collisionGridReady=false;
const setProgress=(v,t)=>{$('progressFill').style.width=Math.round(v*100)+'%';$('loadText').textContent=t;};
function mat(name,color,rough=.9){const m=new BABYLON.StandardMaterial(name,scene);m.diffuseColor=BABYLON.Color3.FromHexString(color);m.specularColor=new BABYLON.Color3(.08,.08,.08);m.roughness=rough;return m;}
function tuneVisualMaterials(root,foliage=false){
 if(!root?.getChildMeshes)return;
 for(const mesh of root.getChildMeshes(false)){
  const materials=mesh.material?.getClassName?.()==='MultiMaterial'?(mesh.material.subMaterials||[]):[mesh.material];
  for(const material of materials){if(!material)continue;
   if('roughness' in material)material.roughness=Math.max(material.roughness??.8,.72);
   if('metallic' in material)material.metallic=Math.min(material.metallic??0,.08);
   if(material.specularColor)material.specularColor=BABYLON.Color3.Lerp(material.specularColor,new BABYLON.Color3(.12,.12,.12),.22);
   if(foliage&&material.sheen){material.sheen.isEnabled=true;material.sheen.intensity=quality==='ultra'?.2:quality==='alta'?.16:.1;material.sheen.color=new BABYLON.Color3(.62,.76,.48);}
   for(const key of ['albedoTexture','diffuseTexture','bumpTexture','opacityTexture','emissiveTexture','metallicTexture']){const tex=material[key];if(tex&&'anisotropicFilteringLevel' in tex)tex.anisotropicFilteringLevel=Math.min(12,VP.anisotropy);}
  }
 }
}
function rand(seed){let x=Math.sin(seed*127.1+311.7)*43758.5453;return x-Math.floor(x);}
function addSky(){
 const sky=BABYLON.MeshBuilder.CreateSphere('sky-dome',{diameter:500,segments:32},scene);sky.isPickable=false;sky.infiniteDistance=true;
 const m=new BABYLON.StandardMaterial('panorama-sky',scene);m.backFaceCulling=false;m.disableLighting=true;m.fogEnabled=false;
 const skyTint=({atacamatitan:[1.02,1,.96],arackar:[1,.97,.92],patagonia:[.9,.95,1],stegouros:[.93,1,.95],aysen:[.96,.98,1]}[worldKey]||[1,1,1]);
 m.emissiveColor=new BABYLON.Color3(...skyTint);sky.material=m;skyMaterial=m;sky.rotation.y=(WORLD.panoRot??23)*Math.PI/180;
 return new Promise((resolve,reject)=>{
  const pano=new BABYLON.Texture(WORLD.sky,scene,false,false,BABYLON.Texture.TRILINEAR_SAMPLINGMODE,()=>{skyReady=true;skyError=null;console.info('[Huellas VR] Panorama listo:',WORLD.sky);resolve(sky);},(message,exception)=>{skyReady=false;skyError=String(message||exception||'error desconocido');console.error('[Huellas VR] Falló panorama:',WORLD.sky,skyError);reject(new Error('No se pudo cargar el panorama esencial '+WORLD.sky+': '+skyError));});
  pano.anisotropicFilteringLevel=8;m.emissiveTexture=pano;
 });
}
function addSkyLife(){
 const anchor=new BABYLON.TransformNode('environment-sky-anchor',scene);
 const cloudTex=new BABYLON.DynamicTexture('moving-cloud-texture',{width:2048,height:512},scene,false,BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
 const ctx=cloudTex.getContext();ctx.clearRect(0,0,2048,512);
 let seed=77;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<46;i++){const x=rnd()*2048,y=65+rnd()*360,w=75+rnd()*190,h=16+rnd()*42;
  for(let k=0;k<7;k++){const px=x+(rnd()-.5)*w,py=y+(rnd()-.5)*h,r=w*(.16+rnd()*.18),g=ctx.createRadialGradient(px,py,1,px,py,r);
   g.addColorStop(0,'rgba(255,255,255,.48)');g.addColorStop(.55,'rgba(255,255,255,.19)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(px,py,r,r*.28,rnd()*.2,0,Math.PI*2);ctx.fill();
  }
 }
 cloudTex.update();cloudTex.wrapU=BABYLON.Texture.WRAP_ADDRESSMODE;
 const cloudMat=new BABYLON.StandardMaterial('moving-cloud-material',scene);cloudMat.diffuseTexture=cloudTex;cloudMat.opacityTexture=cloudTex;cloudMat.disableLighting=true;cloudMat.backFaceCulling=false;cloudMat.fogEnabled=false;cloudMat.alpha=.52;cloudMat.useAlphaFromDiffuseTexture=true;cloudMat.transparencyMode=BABYLON.Material.MATERIAL_ALPHABLEND;
 const clouds=BABYLON.MeshBuilder.CreateSphere('moving-cloud-dome',{diameter:875,segments:32},scene);clouds.parent=anchor;clouds.material=cloudMat;clouds.isPickable=false;clouds.infiniteDistance=true;clouds.rotation.x=Math.PI;
 const starCount=900,positions=new Float32Array(starCount*3);
 for(let i=0;i<starCount;i++){const a=rnd()*Math.PI*2,e=.08+rnd()*1.3,r=420;positions[i*3]=Math.cos(a)*Math.cos(e)*r;positions[i*3+1]=Math.sin(e)*r;positions[i*3+2]=Math.sin(a)*Math.cos(e)*r;}
 const starMesh=new BABYLON.Mesh('night-sky-stars',scene),starData=new BABYLON.VertexData();starData.positions=Array.from(positions);starData.applyToMesh(starMesh,true);starMesh.parent=anchor;starMesh.isPickable=false;starMesh.alwaysSelectAsActiveMesh=true;
 const starMat=new BABYLON.StandardMaterial('night-stars-material',scene);starMat.pointsCloud=true;starMat.pointSize=2.1;starMat.emissiveColor=new BABYLON.Color3(.88,.92,1);starMat.disableLighting=true;starMat.alpha=0;starMesh.material=starMat;
 const moon=BABYLON.MeshBuilder.CreateSphere('night-moon',{diameter:13,segments:20},scene);moon.parent=anchor;moon.position.set(-110,150,-170);moon.isPickable=false;
 const moonMat=new BABYLON.StandardMaterial('night-moon-material',scene);moonMat.emissiveColor=new BABYLON.Color3(.82,.87,1);moonMat.diffuseColor=new BABYLON.Color3(.3,.34,.42);moonMat.specularColor=new BABYLON.Color3(0,0,0);moonMat.alpha=0;moonMat.disableLighting=true;moon.material=moonMat;
 const pterosaurs=[];
 for(let i=0;i<4;i++){
  const root=new BABYLON.TransformNode('sky-pterosaur-'+i,scene);
  const body=BABYLON.MeshBuilder.CreateSphere('pterosaur-body-'+i,{diameter:1,segments:8},scene);body.parent=root;body.scaling.set(.16,.14,.85);body.position.z=.1;
  const head=BABYLON.MeshBuilder.CreateSphere('pterosaur-head-'+i,{diameter:.22,segments:6},scene);head.parent=root;head.position.z=.82;
  const wingGeo=(side)=>{const mesh=new BABYLON.Mesh('pterosaur-wing-'+i+'-'+side,scene),vd=new BABYLON.VertexData(),sgn=side==='L'?1:-1;vd.positions=[0,0,0,sgn*1.65,0,-.08,sgn*1.9,0,-.58,sgn*.22,0,-.36];vd.indices=[0,1,2,0,2,3];const n=[];BABYLON.VertexData.ComputeNormals(vd.positions,vd.indices,n);vd.normals=n;vd.applyToMesh(mesh,true);mesh.parent=root;mesh.position.x=side==='L'?.08:-.08;const m=new BABYLON.StandardMaterial('pterosaur-wing-mat-'+i+'-'+side,scene);m.diffuseColor=new BABYLON.Color3(.25,.22,.19);m.specularColor=new BABYLON.Color3(0,0,0);m.backFaceCulling=false;mesh.material=m;return mesh;};
  const left=wingGeo('L'),right=wingGeo('R');pterosaurs.push({root,left,right,phase:rnd()*Math.PI*2,radius:34+rnd()*28,height:18+rnd()*14,speed:(.035+rnd()*.025)*(i%2?1:-1),offset:rnd()*Math.PI*2});
 }
 const motesCount=quality==='baja'?0:90,motePositions=new Float32Array(motesCount*3);
 for(let i=0;i<motesCount;i++){motePositions[i*3]=(rnd()-.5)*30;motePositions[i*3+1]=rnd()*7;motePositions[i*3+2]=(rnd()-.5)*30;}
 const motes=new BABYLON.Mesh('floating-atmosphere-motes',scene),moteData=new BABYLON.VertexData();moteData.positions=Array.from(motePositions);moteData.applyToMesh(motes,true);motes.parent=anchor;motes.isPickable=false;
 const moteMat=new BABYLON.StandardMaterial('floating-motes-material',scene);moteMat.pointsCloud=true;moteMat.pointSize=3;moteMat.emissiveColor=new BABYLON.Color3(1,.88,.62);moteMat.disableLighting=true;moteMat.alpha=.42;motes.material=moteMat;
 const butterflies=[];
 if(quality!=='baja'&&['arackar','patagonia','stegouros','aysen'].includes(worldKey))for(let i=0;i<9;i++){
  const root=new BABYLON.TransformNode('ambient-butterfly-'+i,scene),wingMat=new BABYLON.StandardMaterial('butterfly-wing-material-'+i,scene);wingMat.diffuseColor=i%2?new BABYLON.Color3(1,.76,.25):new BABYLON.Color3(1,.94,.72);wingMat.emissiveColor=wingMat.diffuseColor.scale(.28);wingMat.backFaceCulling=false;
  const left=BABYLON.MeshBuilder.CreatePlane('butterfly-left-'+i,{width:.12,height:.15,sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene),right=BABYLON.MeshBuilder.CreatePlane('butterfly-right-'+i,{width:.12,height:.15,sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene);left.parent=root;right.parent=root;left.position.x=.055;right.position.x=-.055;left.rotation.y=Math.PI/2;right.rotation.y=-Math.PI/2;left.material=wingMat;right.material=wingMat;
  butterflies.push({root,left,right,phase:rnd()*6.28,speed:.5+rnd()*.6,x:(rnd()-.5)*24,z:-6+(rnd()-.5)*24,height:.8+rnd()*1.6});
 }
 const rays=[];
 if(quality!=='baja')for(let i=0;i<7;i++){const ray=BABYLON.MeshBuilder.CreatePlane('sunbeam-'+i,{width:4+rnd()*5,height:34+rnd()*14,sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene),rm=new BABYLON.StandardMaterial('sunbeam-material-'+i,scene),tex=new BABYLON.DynamicTexture('sunbeam-gradient-'+i,{width:32,height:256},scene,false);const g=tex.getContext(),grad=g.createLinearGradient(0,0,32,0);grad.addColorStop(0,'rgba(255,240,200,0)');grad.addColorStop(.5,'rgba(255,240,200,.38)');grad.addColorStop(1,'rgba(255,240,200,0)');g.fillStyle=grad;g.fillRect(0,0,32,256);tex.update();rm.diffuseTexture=tex;rm.opacityTexture=tex;rm.emissiveTexture=tex;rm.disableLighting=true;rm.backFaceCulling=false;rm.alpha=.1;rm.transparencyMode=BABYLON.Material.MATERIAL_ALPHABLEND;ray.material=rm;ray.parent=anchor;const a=rnd()*Math.PI*2,r=18+rnd()*32;ray.position.set(Math.cos(a)*r,15,Math.sin(a)*r-10);ray.rotation.y=rnd()*3;ray.isPickable=false;rays.push({mesh:ray,phase:rnd()*6.28,base:.05+rnd()*.07});}
 skyLife={anchor,clouds,cloudTex,starMat,moonMat,pterosaurs,motes,motePositions,butterflies,rays,cloudRotation:0};
}
function updateSkyLife(dt){
 if(!skyLife||!camera)return;
 skyLife.anchor.position.copyFrom(camera.position);skyLife.clouds.rotation.y+=dt*.0009;skyLife.cloudTex.uOffset=(skyLife.cloudTex.uOffset+dt*.000004)%1;
 const daylight=timeMode==='noche'?0:1,weather=1-rainBlend*.85,seconds=performance.now()*.001;
 const moteArr=skyLife.motes.getVerticesData(BABYLON.VertexBuffer.PositionKind);if(moteArr){for(let i=0;i<skyLife.motePositions.length/3;i++){moteArr[i*3]=skyLife.motePositions[i*3]+Math.sin(seconds*.4+i)*1.2;moteArr[i*3+1]=(skyLife.motePositions[i*3+1]+seconds*.08)%7;moteArr[i*3+2]=skyLife.motePositions[i*3+2]+Math.cos(seconds*.35+i*2)*1.2;}skyLife.motes.updateVerticesData(BABYLON.VertexBuffer.PositionKind,moteArr);}
 skyLife.motes.setEnabled(daylight>.1&&!raining&&quality!=='baja');
 skyLife.rays.forEach(r=>{r.mesh.material.alpha=r.base*(.6+.4*Math.sin(seconds*.3+r.phase))*daylight*weather*(timeMode==='atardecer'?1.6:1);r.mesh.setEnabled(r.mesh.material.alpha>.004);});
 skyLife.butterflies.forEach(b=>{b.phase+=dt*.001*b.speed;const x=b.x+Math.sin(b.phase*.9)*5,z=b.z+Math.cos(b.phase*.7)*5;b.root.position.set(camera.position.x+x,terrainHeightAt(camera.position.x+x,camera.position.z+z)+b.height+Math.sin(b.phase*3)*.3,camera.position.z+z);b.root.rotation.y=b.phase*.9+1.5;const flap=Math.sin(seconds*18+b.phase*9)*.9;b.left.rotation.z=flap;b.right.rotation.z=-flap;b.root.setEnabled(daylight>.3&&!raining);});
 const nightAlpha=timeMode==='noche'?1:0;
 skyLife.starMat.alpha+=(nightAlpha-skyLife.starMat.alpha)*(1-Math.exp(-dt*1.8));
 skyLife.moonMat.alpha+=(nightAlpha-skyLife.moonMat.alpha)*(1-Math.exp(-dt*1.8));
 skyLife.clouds.material.alpha+=(.5+.4*rainBlend-skyLife.clouds.material.alpha)*(1-Math.exp(-dt*1.5));
 const t=performance.now()*.00008;
 skyLife.pterosaurs.forEach((p,i)=>{p.phase+=dt*.00035;p.root.position.set(camera.position.x+Math.cos(p.phase+p.offset)*p.radius,camera.position.y+p.height+Math.sin(p.phase*1.7)*2,camera.position.z-20+Math.sin(p.phase+p.offset)*p.radius);p.root.rotation.y=Math.atan2(Math.cos(p.phase+p.offset)*p.speed,Math.sin(p.phase+p.offset)*p.speed)+Math.PI/2;const flap=Math.sin(performance.now()*.008+i*1.7)*.62;p.left.rotation.z=flap;p.right.rotation.z=-flap;p.root.setEnabled(timeMode!=='noche'&&!raining);});
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
   mesh.isPickable=true;mesh.checkCollisions=true;mesh.receiveShadows=true;mesh.metadata={ground:true};ground=mesh;pickables.push(mesh);
   const m=typeof BABYLON.PBRMaterial==='function'?new BABYLON.PBRMaterial('photo-terrain-pbr-'+worldKey,scene):new BABYLON.StandardMaterial('photo-terrain-'+worldKey,scene);
   const detailProfiles={
    atacamatitan:{sand:{src:'img/tex_sand_d.jpg',mean:[.2189,.1009,.0608],size:2.4},gravel:{src:'img/tx_stones_d.jpg',mean:[.1996,.1575,.1093],size:2.2},crack:{src:'img/tx_stones_d.jpg',mean:[.1996,.1575,.1093],size:2.2},normal:'img/tex_sand_n.jpg',photoLum:.18,photoSat:1.05,tint:[1,1,1]},
    arackar:{sand:{src:'img/tex_crack_d.jpg',mean:[.2,.12,.08],size:3.2},gravel:{src:'img/tex_gsand_d.jpg',mean:[.2967,.163,.0736],size:2.2},crack:{src:'img/tx_stones_d.jpg',mean:[.1996,.1575,.1093],size:2.2},normal:'img/tx_dirt_n.jpg',photoLum:.30,photoSat:.75,tint:[1.08,1.04,.98]},
    patagonia:{sand:{src:'img/tx_dirt_d.jpg',mean:[.1534,.1081,.0612],size:3},gravel:{src:'img/tex_gsand_d.jpg',mean:[.2967,.163,.0736],size:2.2},crack:{src:'img/tex_gsand_d.jpg',mean:[.2967,.163,.0736],size:2.2},normal:'img/tx_dirt_n.jpg',photoLum:.14,photoSat:.8,tint:[.97,1,1.02]},
    stegouros:{sand:{src:'img/tx_leaves_d.jpg',mean:[.2,.1183,.0443],size:2.4},gravel:{src:'img/tx_redplants_d.jpg',mean:[.1399,.0985,.0352],size:2.6},crack:{src:'img/tx_stones_d.jpg',mean:[.1996,.1575,.1093],size:2.2},normal:'img/tx_leaves_n.jpg',photoLum:.06,photoSat:.95,tint:[1,1,1]},
    aysen:{sand:{src:'img/tx_dirt_d.jpg',mean:[.1534,.1081,.0612],size:3},gravel:{src:'img/tx_stones_d.jpg',mean:[.1996,.1575,.1093],size:2.2},crack:{src:'img/tx_stones_d.jpg',mean:[.1996,.1575,.1093],size:2.2},normal:'img/tx_dirt_n.jpg',photoLum:.12,photoSat:.35,tint:[.95,.96,.98]}
   }[worldKey];
   const compositeCanvas=document.createElement('canvas');compositeCanvas.width=compositeCanvas.height=2048;
   const cc=compositeCanvas.getContext('2d',{alpha:false});
   const loadImage=src=>new Promise((ok,no)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=()=>no(new Error('No se pudo cargar textura '+src));im.src=src;});
   const baseImage=new Image();baseImage.onload=()=>{
    cc.save();cc.filter='saturate('+(Math.max(.9,(detailProfiles?.photoSat??1)*1.08))+') contrast(1.045) brightness('+(1.14+(detailProfiles?.photoLum??0)*.28)+')';cc.drawImage(baseImage,0,0,2048,2048);cc.restore();
    if(detailProfiles?.tint){const t=detailProfiles.tint;cc.save();cc.globalCompositeOperation='multiply';cc.fillStyle='rgb('+Math.round(t[0]*255)+','+Math.round(t[1]*255)+','+Math.round(t[2]*255)+')';cc.fillRect(0,0,2048,2048);cc.restore();}
    const finish=()=>{
     const compositeTexture=new BABYLON.DynamicTexture('terrain-composite-'+worldKey,{width:2048,height:2048},scene,false,BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
     compositeTexture.getContext().drawImage(compositeCanvas,0,0);compositeTexture.update(false);
     compositeTexture.wrapU=compositeTexture.wrapV=BABYLON.Texture.CLAMP_ADDRESSMODE;compositeTexture.anisotropicFilteringLevel=VP.anisotropy;
     if(m.albedoTexture!==undefined){m.albedoTexture=compositeTexture;m.albedoColor=new BABYLON.Color3(1,1,1);m.metallic=0;m.roughness=.96;m.environmentIntensity=.38;}else{m.diffuseTexture=compositeTexture;m.diffuseColor=new BABYLON.Color3(1,1,1);}terrainPhotoReady=true;terrainTextureError=null;
     if(m.specularColor)m.specularColor=new BABYLON.Color3(.025,.025,.025);if(m.roughness===undefined)m.roughness=.98;
     const normalSrc=detailProfiles?.normal||'img/tx_dirt_n.jpg';
     const normal=new BABYLON.Texture(normalSrc,scene,false,true,BABYLON.Texture.TRILINEAR_SAMPLINGMODE,()=>{terrainNormalReady=true;mesh.material=m;mesh.refreshBoundingInfo();resolve();},(message,exception)=>{terrainNormalReady=false;terrainTextureError=String(message||exception||'error desconocido');reject(new Error('No se pudo cargar el mapa normal '+normalSrc+': '+terrainTextureError));});
     normal.wrapU=normal.wrapV=BABYLON.Texture.WRAP_ADDRESSMODE;normal.uScale=normal.vScale=300/(detailProfiles?.sand?.size||3);normal.anisotropicFilteringLevel=VP.anisotropy;m.bumpTexture=normal;m.bumpTexture.level=quality==='baja'?.42:quality==='media'?.58:.78;
    };
    if(!detailProfiles){finish();return;}
    Promise.all([loadImage(detailProfiles.sand.src),loadImage(detailProfiles.gravel.src),loadImage(detailProfiles.crack.src)]).then(images=>{
     const layers=[detailProfiles.sand,detailProfiles.gravel,detailProfiles.crack],N=2048;
     const hash=(x,z,seed)=>{const q=Math.sin(x*127.1+z*311.7+seed*74.7)*43758.5453;return q-Math.floor(q);};
     const noise=(x,z,seed)=>{const ix=Math.floor(x),iz=Math.floor(z),u=x-ix,v=z-iz,su=u*u*(3-2*u),sv=v*v*(3-2*v);return (hash(ix,iz,seed)*(1-su)+hash(ix+1,iz,seed)*su)*(1-sv)+(hash(ix,iz+1,seed)*(1-su)+hash(ix+1,iz+1,seed)*su)*sv;};
     const maskSize=256,maskCanvases=[0,1,2].map(()=>{const c=document.createElement('canvas');c.width=c.height=maskSize;return c;}),maskData=maskCanvases.map(c=>c.getContext('2d').createImageData(maskSize,maskSize));
     const smoothMask=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
      for(let y=0;y<maskSize;y++)for(let x=0;x<maskSize;x++){
       const wx=(x/maskSize-.5)*300,wz=(y/maskSize-.5)*300;
       let flat=0;const e=1.25;
       if(terrainValidAt(wx,wz)&&terrainValidAt(wx-e,wz)&&terrainValidAt(wx+e,wz)&&terrainValidAt(wx,wz-e)&&terrainValidAt(wx,wz+e)){
        const sx=(terrainHeightAt(wx+e,wz)-terrainHeightAt(wx-e,wz))/(2*e),sz=(terrainHeightAt(wx,wz+e)-terrainHeightAt(wx,wz-e))/(2*e),normalY=1/Math.sqrt(1+sx*sx+sz*sz);
        flat=smoothMask(.55,.92,normalY);
       }
       const coverage=flat*(.82+.18*(1-smoothMask(.25,.9,noise(wx*.018+19,wz*.018-7,29))));
       const wg=Math.max(0,Math.min(1,(noise(wx*.045,wz*.045,5)-.58)/.20)),wc=Math.max(0,Math.min(1,(noise(wx*.03+11.7,wz*.03+11.7,13)-.60)/.20))*(1-wg),weights=[1-wg-wc,wg,wc],p=(y*maskSize+x)*4;
       for(let k=0;k<3;k++){const d=maskData[k].data;d[p]=d[p+1]=d[p+2]=255;d[p+3]=Math.round(255*weights[k]*coverage);}
      }
     maskCanvases.forEach((c,k)=>c.getContext('2d').putImageData(maskData[k],0,0));
     images.forEach((im,k)=>{
      const layer=layers[k],normalized=document.createElement('canvas');normalized.width=im.width;normalized.height=im.height;const nc=normalized.getContext('2d');nc.drawImage(im,0,0);const nd=nc.getImageData(0,0,im.width,im.height),px=nd.data,mean=layer.mean;
      for(let p=0;p<px.length;p+=4)for(let c=0;c<3;c++){const v=px[p+c]/255,lin=v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4),q=Math.pow(Math.max(.2,Math.min(3,lin/Math.max(.02,mean[c]))),1.5),srgb=q<=.0031308?q*12.92:1.055*Math.pow(q,1/2.4)-.055;px[p+c]=Math.max(0,Math.min(255,Math.round(srgb*255)));}
      nc.putImageData(nd,0,0);const tile=document.createElement('canvas');tile.width=tile.height=N;const tc=tile.getContext('2d'),pat=tc.createPattern(normalized,'repeat'),tilePx=N*layer.size/300;if(pat?.setTransform&&typeof DOMMatrix!=='undefined')pat.setTransform(new DOMMatrix().scale(tilePx/im.width,tilePx/im.height));tc.fillStyle=pat;tc.fillRect(0,0,N,N);const td=tc.getImageData(0,0,N,N),data=td.data;
      tc.putImageData(td,0,0);tc.globalCompositeOperation='destination-in';tc.drawImage(maskCanvases[k],0,0,N,N);tc.globalCompositeOperation='source-over';cc.save();cc.globalCompositeOperation='multiply';cc.drawImage(tile,0,0);cc.restore();tile.width=tile.height=normalized.width=normalized.height=1;
     });
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

function addEnvironmentLighting(){
 if(quality==='baja'||!BABYLON.EquiRectangularCubeTexture){environmentError=quality==='baja'?'desactivado por perfil bajo':'EquiRectangularCubeTexture no disponible';return;}
 try{
  const size=quality==='ultra'||quality==='alta'?256:128;
  environmentTexture=new BABYLON.EquiRectangularCubeTexture(WORLD.sky,scene,size,false,true,()=>{environmentReady=true;console.info('[Huellas VR] Iluminación basada en imagen local lista:',WORLD.sky,size+'px');},(message,error)=>{environmentReady=false;environmentError=String(message||error||'fallo al convertir panorama');console.warn('[Huellas VR] IBL no disponible; se conserva iluminación directa:',environmentError);},false,32);
  scene.environmentTexture=environmentTexture;scene.environmentIntensity=quality==='ultra'?.78:quality==='alta'?.68:.52;
 }catch(error){environmentTexture=null;environmentError=String(error);console.warn('[Huellas VR] No se pudo crear IBL; se conserva iluminación directa:',error);}
}
function addLighting(){const L={atacamatitan:{hemi:1.05,sun:1.15,pos:[25,34,-10],ground:'#8a4e34'},arackar:{hemi:1,sun:1.1,pos:[-30,18,-20],ground:'#9a7a5a'},patagonia:{hemi:.95,sun:.8,pos:[20,30,-30],ground:'#5f6a52'},stegouros:{hemi:.95,sun:.85,pos:[15,36,-10],ground:'#4a5a34'},aysen:{hemi:.9,sun:.75,pos:[30,30,-20],ground:'#55584e'},valle:{hemi:.55,sun:.9,pos:[-12,22,10],ground:'#6b8a5a'}}[worldKey];hemiLight=new BABYLON.HemisphericLight('ambient',new BABYLON.Vector3(0,1,0),scene);hemiLight.diffuse=BABYLON.Color3.FromHexString(WORLD.hemi);hemiLight.groundColor=BABYLON.Color3.FromHexString(L.ground);hemiLight.intensity=L.hemi;hemiLight.specular=new BABYLON.Color3(.12,.12,.12);sunLight=new BABYLON.DirectionalLight('sun',new BABYLON.Vector3(-L.pos[0],-L.pos[1],-L.pos[2]).normalize(),scene);sunLight.position=new BABYLON.Vector3(...L.pos);sunLight.diffuse=BABYLON.Color3.FromHexString(WORLD.sun);sunLight.intensity=L.sun;sunLight.shadowMinZ=1;sunLight.shadowMaxZ=420;sunLight.shadowFrustumSize=210;scene.environmentIntensity=.7;addEnvironmentLighting();scene.imageProcessingConfiguration.vignetteEnabled=quality==='ultra'||quality==='alta';scene.imageProcessingConfiguration.vignetteWeight=.12;scene.imageProcessingConfiguration.vignetteStretch=0;scene.clearColor=BABYLON.Color3.FromHexString(WORLD.fog).toColor4(1);scene.imageProcessingConfiguration.exposure=1.05;scene.imageProcessingConfiguration.contrast=1.08;scene.imageProcessingConfiguration.toneMappingEnabled=true;scene.imageProcessingConfiguration.toneMappingType=BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;lightingBase={hemi:L.hemi,sun:L.sun,fog:BABYLON.Color3.FromHexString(WORLD.fog),sky:skyMaterial?.emissiveColor?.clone()||new BABYLON.Color3(1,1,1),fogDensity:scene.fogDensity};shadowGenerator=new BABYLON.ShadowGenerator(VP.shadow,sunLight);shadowGenerator.useBlurExponentialShadowMap=true;shadowGenerator.blurKernel=VP.blur;shadowGenerator.bias=.00035;shadowGenerator.normalBias=.018;shadowGenerator.setDarkness(.20);shadowGenerator.transparencyShadow=true;shadowGenerator.enableSoftTransparentShadow=true;shadowGenerator.useContactHardeningShadow=quality==='ultra'||quality==='alta';if(shadowGenerator.useContactHardeningShadow)shadowGenerator.contactHardeningLightSizeUVRatio=.025;}
const TIME_OF_DAY={
 dia:{hemi:1,sun:1,sky:[1,1,1],hemiColor:null,sunColor:null,fog:null,icon:'☀️'},
 atardecer:{hemi:.8,sun:.8,sky:[1,.7,.54],hemiColor:'#ffc79a',sunColor:'#ff9a55',fog:'#c88c64',icon:'🌅'},
 noche:{hemi:.3,sun:.12,sky:[.1,.14,.28],hemiColor:'#7a90d4',sunColor:'#8fa4ff',fog:'#0e1526',icon:'🌙'}
};
const ENVIRONMENT_COLOR_CACHE={rainFog:BABYLON.Color3.FromHexString('#8d949c'),modes:Object.fromEntries(Object.entries(TIME_OF_DAY).map(([key,value])=>[key,{hemi:value.hemiColor?BABYLON.Color3.FromHexString(value.hemiColor):BABYLON.Color3.FromHexString(WORLD.hemi),sun:value.sunColor?BABYLON.Color3.FromHexString(value.sunColor):BABYLON.Color3.FromHexString(WORLD.sun),fog:value.fog?BABYLON.Color3.FromHexString(value.fog):null,sky:new BABYLON.Color3(...value.sky)}]))};
const ENVIRONMENT_COLOR_SCRATCH={hemi:new BABYLON.Color3(),sun:new BABYLON.Color3(),skyTarget:new BABYLON.Color3(),sky:new BABYLON.Color3(),fogTarget:new BABYLON.Color3(),fog:new BABYLON.Color3()};
function cycleTimeOfDay(){
 const modes=Object.keys(TIME_OF_DAY);timeMode=modes[(modes.indexOf(timeMode)+1)%modes.length];
 const button=$('timeButton');if(button)button.textContent=TIME_OF_DAY[timeMode].icon;
}
function syncAmbientAudioMix(){
 if(!audioContext)return;
 const key=[soundOn,raining,timeMode].join('|');if(key===ambientAudioMixKey)return;
 if(rainGain)rainGain.gain.setTargetAtTime(raining&&soundOn?.12:0,audioContext.currentTime,.25);
 if(nightInsectGain)nightInsectGain.gain.setTargetAtTime(timeMode==='noche'&&!raining&&soundOn?.008:0,audioContext.currentTime,.35);
 if(waterGain)waterGain.gain.setTargetAtTime(((WORLD.rivers||[]).length||(WORLD.lagoons||[]).length)&&soundOn?.12:0,audioContext.currentTime,.6);
 ambientAudioMixKey=key;
}
function updateEnvironment(dt){
 updateSkyLife(dt);
 if(!lightingBase||!hemiLight||!sunLight)return;
 const t=TIME_OF_DAY[timeMode]||TIME_OF_DAY.dia,c=ENVIRONMENT_COLOR_CACHE.modes[timeMode]||ENVIRONMENT_COLOR_CACHE.modes.dia,k=1-Math.exp(-Math.max(0,dt)*2.2);rainBlend+=(Number(raining)-rainBlend)*(1-Math.exp(-Math.max(0,dt)*.8));
 hemiLight.intensity+=(lightingBase.hemi*t.hemi*(1-.3*rainBlend)-hemiLight.intensity)*k;
 sunLight.intensity+=(lightingBase.sun*t.sun*(1-.6*rainBlend)-sunLight.intensity)*k;
 BABYLON.Color3.LerpToRef(hemiLight.diffuse,c.hemi,k,ENVIRONMENT_COLOR_SCRATCH.hemi);hemiLight.diffuse.copyFrom(ENVIRONMENT_COLOR_SCRATCH.hemi);
 BABYLON.Color3.LerpToRef(sunLight.diffuse,c.sun,k,ENVIRONMENT_COLOR_SCRATCH.sun);sunLight.diffuse.copyFrom(ENVIRONMENT_COLOR_SCRATCH.sun);
 const skyTarget=ENVIRONMENT_COLOR_SCRATCH.skyTarget;skyTarget.r=c.sky.r*(1-.38*rainBlend);skyTarget.g=c.sky.g*(1-.38*rainBlend);skyTarget.b=c.sky.b*(1-.3*rainBlend);
 if(skyMaterial){BABYLON.Color3.LerpToRef(skyMaterial.emissiveColor,skyTarget,k,ENVIRONMENT_COLOR_SCRATCH.sky);skyMaterial.emissiveColor.copyFrom(ENVIRONMENT_COLOR_SCRATCH.sky);}
 const fogTarget=c.fog||lightingBase.fog;BABYLON.Color3.LerpToRef(fogTarget,ENVIRONMENT_COLOR_CACHE.rainFog,rainBlend*.5*(timeMode==='noche'?.2:1),ENVIRONMENT_COLOR_SCRATCH.fogTarget);
 BABYLON.Color3.LerpToRef(scene.fogColor,ENVIRONMENT_COLOR_SCRATCH.fogTarget,k,ENVIRONMENT_COLOR_SCRATCH.fog);scene.fogColor.copyFrom(ENVIRONMENT_COLOR_SCRATCH.fog);
 scene.fogDensity+=(lightingBase.fogDensity*(1+1.4*rainBlend)-scene.fogDensity)*(1-Math.exp(-dt*1.4));
 syncAmbientAudioMix();
 if(rainSystem&&camera){rainSystem.emitter.copyFrom(camera.position);rainSystem.emitter.y+=15;}
}
function initAmbientAudio(){
 if(audioContext){if(audioContext.state==='suspended')audioContext.resume();return;}
 const AudioCtor=window.AudioContext||window.webkitAudioContext;if(!AudioCtor)return;
 try{
  audioContext=new AudioCtor();audioMaster=audioContext.createGain();audioMaster.gain.value=soundOn?.18:0;audioMaster.connect(audioContext.destination);
  const buffer=audioContext.createBuffer(1,audioContext.sampleRate*2,audioContext.sampleRate),data=buffer.getChannelData(0);let last=0;
  for(let i=0;i<data.length;i++){const white=Math.random()*2-1;last=(last+.025*white)/1.025;data[i]=last*2.8+white*.12;}
  const source=audioContext.createBufferSource();source.buffer=buffer;source.loop=true;
  const filter=audioContext.createBiquadFilter();filter.type='lowpass';filter.frequency.value=700;
  const wind=audioContext.createGain();wind.gain.value=.55;source.connect(filter);filter.connect(wind);wind.connect(audioMaster);source.start();
  const rainSource=audioContext.createBufferSource();rainSource.buffer=buffer;rainSource.loop=true;
  const rainFilter=audioContext.createBiquadFilter();rainFilter.type='highpass';rainFilter.frequency.value=1600;
  rainGain=audioContext.createGain();rainGain.gain.value=0;rainSource.connect(rainFilter);rainFilter.connect(rainGain);rainGain.connect(audioMaster);rainSource.start();
  const insect=audioContext.createOscillator(),insectGate=audioContext.createGain(),insectLfo=audioContext.createOscillator(),insectLfoGain=audioContext.createGain();insect.type='sine';insect.frequency.value=4300;insectGate.gain.value=0;insectLfo.type='square';insectLfo.frequency.value=13;insectLfoGain.gain.value=.0035;insectLfo.connect(insectLfoGain);insectLfoGain.connect(insectGate.gain);insect.connect(insectGate);nightInsectGain=insectGate;insectGate.connect(audioMaster);insect.start();insectLfo.start();
  const waterFilter=audioContext.createBiquadFilter();waterFilter.type='lowpass';waterFilter.frequency.value=900;const waterSource=audioContext.createBufferSource();waterSource.buffer=buffer;waterSource.loop=true;waterGain=audioContext.createGain();waterGain.gain.value=0;waterSource.connect(waterFilter);waterFilter.connect(waterGain);waterGain.connect(audioMaster);waterSource.start();
  const waterLfo=audioContext.createOscillator(),waterLfoGain=audioContext.createGain();waterLfo.frequency.value=.7;waterLfoGain.gain.value=.035;waterLfo.connect(waterLfoGain);waterLfoGain.connect(waterGain.gain);waterLfo.start();
  if(dinoRoots.length)setInterval(()=>{if(!soundOn||!audioContext||audioContext.state!=='running')return;const call=audioContext.createOscillator(),filter=audioContext.createBiquadFilter(),gain=audioContext.createGain();call.type='sawtooth';call.frequency.setValueAtTime(70+Math.random()*40,audioContext.currentTime);call.frequency.exponentialRampToValueAtTime(45+Math.random()*20,audioContext.currentTime+1.6);filter.type='lowpass';filter.frequency.value=260;gain.gain.setValueAtTime(0,audioContext.currentTime);gain.gain.linearRampToValueAtTime(.12,audioContext.currentTime+.3);gain.gain.linearRampToValueAtTime(0,audioContext.currentTime+1.7);call.connect(filter);filter.connect(gain);gain.connect(audioMaster);call.start();call.stop(audioContext.currentTime+1.8);},12000);
 }catch(error){console.warn('Audio ambiental no disponible',error);}
}
document.addEventListener('pointerdown',initAmbientAudio,{passive:true});
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
 waterTex.update(false);waterTex.wrapU=waterTex.wrapV=BABYLON.Texture.WRAP_ADDRESSMODE;waterTex.uScale=4;waterTex.vScale=2;waterTex.anisotropicFilteringLevel=Math.min(8,VP.anisotropy);waterTextures.push({tex:waterTex,speed:-.012});
 const waterMat=typeof BABYLON.PBRMaterial==='function'?new BABYLON.PBRMaterial('original-water-pbr-'+worldKey,scene):new BABYLON.StandardMaterial('original-water-'+worldKey,scene);
  if(waterMat.albedoTexture!==undefined){waterMat.albedoTexture=waterTex;waterMat.albedoColor=new BABYLON.Color3(1,1,1);waterMat.metallic=.08;waterMat.roughness=.16;waterMat.environmentIntensity=.95;}else{waterMat.diffuseTexture=waterTex;waterMat.diffuseColor=new BABYLON.Color3(1,1,1);waterMat.specularColor=new BABYLON.Color3(.52,.64,.68);waterMat.roughness=.18;}
  if(waterMat.clearCoat){waterMat.clearCoat.isEnabled=true;waterMat.clearCoat.intensity=quality==='ultra'?.2:quality==='alta'?.15:.08;waterMat.clearCoat.roughness=.22;}
  waterMat.emissiveColor=BABYLON.Color3.FromHexString(waterPal.center).scale(.035);waterMat.alpha=.92;waterMat.transparencyMode=BABYLON.Material.MATERIAL_ALPHABLEND;
 const bankMat=new BABYLON.StandardMaterial('original-water-bank-'+worldKey,scene);bankMat.diffuseColor=BABYLON.Color3.FromHexString(worldKey==='atacamatitan'?'#b9784d':worldKey==='arackar'?'#c9ad7b':'#8c927e');bankMat.roughness=1;
 const glossTex=new BABYLON.DynamicTexture('water-gloss-texture-'+worldKey,256,scene,false,BABYLON.Texture.TRILINEAR_SAMPLINGMODE);glossTex.getContext().drawImage(waterTex.getContext().canvas,0,0);glossTex.update(false);glossTex.wrapU=glossTex.wrapV=BABYLON.Texture.WRAP_ADDRESSMODE;glossTex.uScale=6;glossTex.vScale=3;waterTextures.push({tex:glossTex,speed:.018});
 const waterGlossMat=new BABYLON.StandardMaterial('original-water-gloss-'+worldKey,scene);waterGlossMat.diffuseTexture=glossTex;waterGlossMat.useAlphaFromDiffuseTexture=false;waterGlossMat.alpha=.24;waterGlossMat.specularColor=new BABYLON.Color3(.2,.25,.28);waterGlossMat.roughness=.18;waterGlossMat.disableDepthWrite=true;
 (WORLD.rivers||[]).forEach((river,index)=>{
  const pts=river.pts.map(p=>new BABYLON.Vector3(p[0],terrainHeightAt(p[0],p[1])+.11,p[1]));
  if(pts.length<2)return;
  const curve=BABYLON.Curve3.CreateCatmullRomSpline(pts,Math.max(24,pts.length*5),false);
  const path=curve.getPoints(),left=[],right=[],bankLeft=[],bankRight=[],shoreLeft=[],shoreRight=[];
  for(let i=0;i<path.length;i++){
   const prev=path[Math.max(0,i-1)],next=path[Math.min(path.length-1,i+1)],dx=next.x-prev.x,dz=next.z-prev.z,len=Math.hypot(dx,dz)||1,nx=-dz/len,nz=dx/len,p=path[i],bed=terrainHeightAt(p.x,p.z),w=river.w*.5,bw=w+1.6;
   p.y=bed+.11;
   const lx=p.x+nx*w,lz=p.z+nz*w,rx=p.x-nx*w,rz=p.z-nz*w,blx=p.x+nx*bw,blz=p.z+nz*bw,brx=p.x-nx*bw,brz=p.z-nz*bw;
   left.push(new BABYLON.Vector3(lx,bed+.155,lz));right.push(new BABYLON.Vector3(rx,bed+.155,rz));
   bankLeft.push(new BABYLON.Vector3(blx,terrainHeightAt(blx,blz)+.025,blz));bankRight.push(new BABYLON.Vector3(brx,terrainHeightAt(brx,brz)+.025,brz));
   shoreLeft.push(new BABYLON.Vector3(lx,terrainHeightAt(lx,lz)+.035,lz));shoreRight.push(new BABYLON.Vector3(rx,terrainHeightAt(rx,rz)+.035,rz));
  }
  const bankA=BABYLON.MeshBuilder.CreateRibbon('original-river-bank-left-'+index,{pathArray:[bankLeft,shoreLeft],sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene);bankA.material=bankMat;bankA.isPickable=false;
  const bankB=BABYLON.MeshBuilder.CreateRibbon('original-river-bank-right-'+index,{pathArray:[shoreRight,bankRight],sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene);bankB.material=bankMat;bankB.isPickable=false;
  const ribbon=BABYLON.MeshBuilder.CreateRibbon('original-river-'+index,{pathArray:[left,right],sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene);ribbon.material=waterMat;ribbon.isPickable=false;
  const gloss=BABYLON.MeshBuilder.CreateRibbon('original-river-gloss-'+index,{pathArray:[left.map(v=>new BABYLON.Vector3(v.x,v.y+.012,v.z)),right.map(v=>new BABYLON.Vector3(v.x,v.y+.012,v.z))],sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene);gloss.material=waterGlossMat;gloss.isPickable=false;
 });
 (WORLD.lagoons||[]).forEach((l,index)=>{
  const disk=BABYLON.MeshBuilder.CreateDisc('original-lagoon-'+index,{radius:1,tessellation:96,sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene);
  disk.scaling.set(l.rx,1,l.rz);disk.rotation.x=Math.PI/2;disk.rotation.y=l.rot||0;const edgeHeights=[];if(l.y==null){for(let k=0;k<16;k++)edgeHeights.push(terrainHeightAt(l.x+Math.cos(k/16*Math.PI*2)*l.rx*1.2,l.z+Math.sin(k/16*Math.PI*2)*l.rz*1.2));}disk.position.set(l.x,l.y!=null?l.y:(Math.max(...edgeHeights)+.03),l.z);disk.material=waterMat;disk.isPickable=false;
 });
}

function addSandBars(){const c=worldKey==='atacamatitan'?'#c9915a':worldKey==='aysen'?'#a4a197':'#b7a58a';const material=new BABYLON.StandardMaterial('original-sandbar-material',scene);material.diffuseColor=BABYLON.Color3.FromHexString(c);material.roughness=1;(WORLD.bars||[]).forEach((b,i)=>{const mesh=BABYLON.MeshBuilder.CreateDisc('original-sandbar-'+i,{radius:1,tessellation:48,sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene);mesh.scaling.set(b.rx,1,b.rz);mesh.rotation.x=Math.PI/2;mesh.rotation.y=b.rot||0;mesh.position.set(b.x,terrainHeightAt(b.x,b.z)+.035,b.z);mesh.material=material;mesh.isPickable=false;});}
async function loadContainer(path){if(assetCache.has(path))return assetCache.get(path);const p=BABYLON.SceneLoader.LoadAssetContainerAsync('',path,scene).catch(error=>{assetCache.delete(path);error.message='Recurso '+path+': '+(error?.message||String(error));throw error;});assetCache.set(path,p);return p;}
function dinoSpacingRadius(d){return Math.max(.55,Math.min(4.5,(d.length||DINO[d.id].length)*.30));}
function findFlatDinoPosition(cx,cz,index,maxRadius=42,supportRadius=2.8,targetLength=3){
 let best=null,bestScore=Infinity;
 for(let ring=0;ring<=maxRadius;ring+=2.5)for(let a=0;a<32;a++){
  const ang=a*Math.PI*2/32,x=cx+Math.cos(ang)*ring,z=cz+Math.sin(ang)*ring;
  if(!terrainValidAt(x,z))continue;
  if(dinoRoots.some(d=>Math.hypot(d.root.position.x-x,d.root.position.z-z)<dinoSpacingRadius(d)+Math.max(.55,Math.min(4.5,targetLength*.30))+.55))continue;
  let lo=1e9,hi=-1e9,ok=true;
  for(let q=0;q<8;q++){const px=x+Math.cos(q*Math.PI/4)*supportRadius,pz=z+Math.sin(q*Math.PI/4)*supportRadius;if(!terrainValidAt(px,pz)){ok=false;break;}const h=terrainHeightAt(px,pz);lo=Math.min(lo,h);hi=Math.max(hi,h);}
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
 root.metadata=root.metadata||{};root.metadata.visualPivot=visual;root.metadata.visualScale=scale;root.metadata.visualLength=span*scale;root.metadata.visualHeight=(max.y-min.y)*scale;root.metadata.floorAligned=true;
 return baseYaw;
}
function resolveDinoClip(clips,semantic){
 const target=String(semantic).toLowerCase().replace(/[^a-z]/g,'');
 const normalized=name=>String(name||'').toLowerCase().replace(/(?:[-_ ]\d+)+$/,'').replace(/[^a-z]/g,'');
 return clips.find(group=>normalized(group.name)===target)||clips.find(group=>normalized(group.name).startsWith(target))||null;
}
async function spawnDino(id,index,total,center){
 const data=DINO[id],path=(quality==='baja'||index>=5)?data.low:data.file;
 let container;try{container=await loadContainer(path);}catch(e){if(path!==data.file)container=await loadContainer(data.file);else throw e;}
 const root=new BABYLON.TransformNode('dino-'+id+'-'+index,scene);
 const instances=container.instantiateModelsToScene(n=>n+'-'+index,false,{doNotInstantiate:true});
 instances.rootNodes.forEach(n=>n.parent=root);
 const clips=instances.animationGroups||[],idle=resolveDinoClip(clips,'Idle')||clips[0];
 clips.forEach(a=>{if(a!==idle)a.stop();});
 if(idle){idle.start(true);idle.setWeightForAllAnimatables?.(1);}
 root.metadata={dinoId:id};
 const herd=HERD_CONFIG[worldKey],sizes=herd?.sizes||[],sizeIndex=sizes.length>1&&total>1?Math.round(index*(sizes.length-1)/(total-1)):index,baseSize=sizes[sizeIndex]??(sizes.length?sizes[index%sizes.length]*(.82+((index*37)%17)/70):data.length*(index===0?1:.82+rand(index+2)*.12));
 const targetLength=+baseSize.toFixed(2);fitRoot(root,targetLength);tuneVisualMaterials(root);const forwardYaw=data.forwardYaw??0;
 const preferred=center||herd?.center||{x:0,z:-15};
 const angle=index*2.4+.7,radius=6+(index%6)*2;
 const seedX=preferred.x+Math.cos(angle)*radius,seedZ=preferred.z+Math.sin(angle)*radius;
 const supportRadius=Math.max(2.8,targetLength*.3+.35),spot=findFlatDinoPosition(seedX,seedZ,index,10,supportRadius,targetLength)||findFlatDinoPosition(preferred.x,preferred.z,index,48,supportRadius,targetLength);
 if(!spot||!terrainValidAt(spot.x,spot.z))throw new Error('No se encontró suelo firme para '+data.name);
 root.position.set(spot.x,terrainHeightAt(spot.x,spot.z),spot.z);
 root.rotation.y=forwardYaw;
 root.getChildMeshes().forEach(m=>{m.isPickable=true;m.receiveShadows=true;m.metadata={...(m.metadata||{}),dinoId:id};pickables.push(m);shadowGenerator?.addShadowCaster(m,true);});root.metadata.targetLength=targetLength;
 const juvenile=targetLength<=data.length*.58,personalityRoll=rand(index*197+id.length*29),personality=juvenile?(personalityRoll<.68?'playful':personalityRoll<.88?'curious':'shy'):(index%7===1?'social':personalityRoll<.34?'curious':personalityRoll<.62?'social':personalityRoll<.82?'calm':'shy');
 dinoRoots.push({root,id,length:targetLength,clips,clipName:idle?'Idle':'',activeClip:idle||null,transitionFrom:null,transitionElapsed:0,baseYaw:forwardYaw,lookUntil:0,phase:rand(index+4)*6.28,origin:root.position.clone(),home:{x:spot.x,z:spot.z},herdCenter:{...preferred},heading:rand(index+71)*Math.PI*2,target:null,goal:null,state:'idle',timer:1.5+rand(index+82)*4,radius:Math.min(4,1.5+rand(index+8)*2),running:false,restLook:false,drankStamp:-1,juvenile,personality,curiosity:juvenile ? .82 : personality==='curious' ? .68 : personality==='social' ? .34 : .12,nextCuriosityAt:performance.now()+3500+rand(index*211+5)*10000,nextSocialAt:performance.now()+7000+rand(index*277+9)*14000,socialUntil:0,socialPartner:null,lastFootstep:0,stepDistance:0,actualSpeed:0,footDistance:0,dustDistance:0,footSide:1,lastFootPos:root.position.clone()});
 return root;
}
const VEGETATION_QUALITY={alta:1,media:.6,baja:.3}[quality]||1;
async function addVegetation(){
 const F=WORLD.flora||{},rockTint=({atacamatitan:'#c88a6a',arackar:'#6a625c',patagonia:'#bdb6a6',stegouros:'#a8a294',aysen:'#5d5c5a'}[worldKey]||'#8c8a82');
 // Parámetros exactos del catálogo VEG() de los cinco mundos publicados en v19.
 const specs=[
  {file:'models/veg/araucaria_adulta.glb',n:F.adult||0,size:[15,23],sink:.02,water:5,keep:3,rMin:20,rMax:50},
  {file:'models/veg/araucaria_joven.glb',n:F.young||0,size:[3.5,8],sink:.07,water:3,keep:2,rMin:9,rMax:44},
  {file:'models/veg/fern_tripo.glb',n:F.fern||0,free:true,clump:.65,size:[.9,1.8],sink:.05,water:1.2,keep:0,rMin:2.5,rMax:30},
  {file:'models/veg/fern_small.glb',n:F.fern2||0,free:true,clump:.6,size:[.7,1.5],sink:0,bright:1.15,water:1.2,keep:0,rMin:2.5,rMax:32},
  {file:'models/veg/pebble.glb',n:F.pebble||0,free:true,size:[.12,.45],sink:.2,squash:1.5,tint:rockTint,bright:1.6,band:[0,6],rMax:34},
  {file:'models/env/rock_07.glb',n:F.rocks||0,size:[.6,1.8],sink:.15,squash:1.4,tint:rockTint,bright:1.6,rMin:6,rMax:44},
  {file:'models/env/rock_09.glb',n:220,size:[.12,.4],sink:.2,squash:1.5,tint:'#d8b894',bright:1.9,rMax:16},
  {file:'models/env/fern_02.glb',n:110,size:[.7,1.3],bright:1.2,keep:1.2,rMax:18},
  {file:'models/env/rock_07.glb',n:40,size:[.35,.8],sink:.15,squash:1.4,tint:'#e0b898',bright:1.8,rMax:22},
  {file:'models/env/dead_tree_trunk_02.glb',n:F.logs||0,size:[3.5,6],sink:.1,water:3,keep:4,rMin:8,rMax:40}
 ];
 if(worldKey==='atacamatitan')specs.unshift({file:'models/env/cerro_desierto.glb',n:11,size:[70,120],squash:1.9,sink:.12,bright:1.6,tint:'#ffb090',water:-1,keep:0,rMin:85,rMax:125});
 const home=({atacamatitan:{x:4,z:-4},arackar:{x:4,z:-4},patagonia:{x:4,z:-8},stegouros:{x:3,z:4},aysen:{x:3,z:-8}}[worldKey]||{x:0,z:-10});
 const homes=[{p:home,r:({atacamatitan:9,arackar:8,patagonia:9,stegouros:7,aysen:8}[worldKey]||8)}];
 const hasWater=!!((WORLD.rivers||[]).length||(WORLD.lagoons||[]).length);
 const waterDistance=(x,z)=>hasWater?waterDistanceAt(x,z):1e9;
 const seedBase=({atacamatitan:77,arackar:173,patagonia:271,stegouros:367,aysen:463}[worldKey]||77);
 for(let si=0;si<specs.length;si++){
  const a=specs[si],count=Math.max(0,Math.round(a.n*VEGETATION_QUALITY));if(!count)continue;
  let container;try{container=await loadContainer(a.file);}catch(e){throw new Error('No se pudo cargar el modelo original '+a.file+': '+e.message);}
  const points=[],placed=[],physicsCandidates=[],rng=n=>rand(seedBase+si*7919+n*17.17);
  for(let i=0,attempt=0;i<count&&attempt<count*80+240;attempt++){
   let x,z;
   if(a.clump&&points.length&&rng(attempt*5+1)<a.clump){
    const q=points[Math.floor(rng(attempt*5+2)*points.length)],ang=rng(attempt*5+3)*Math.PI*2,dist=.6+rng(attempt*5+4)*1.8;
    x=q.x+Math.cos(ang)*dist;z=q.z+Math.sin(ang)*dist;
   }else{
    const ang=rng(attempt*5+1)*Math.PI*2,rMin=a.rMin??7,rMax=a.rMax??52,radius=rMin+Math.sqrt(rng(attempt*5+2))*(rMax-rMin);
    x=Math.cos(ang)*radius;z=Math.sin(ang)*radius;
   }
   if(Math.hypot(x,z)<6||!terrainValidAt(x,z))continue;
   const wd=waterDistance(x,z);
   if(a.band){if(wd<a.band[0]||wd>a.band[1])continue;}else if(hasWater&&wd<(a.water??.5))continue;
   if(!a.free&&homes.some(h=>Math.hypot(x-h.p.x,z-h.p.z)<=h.r+(a.keep||1)))continue;
   if(a.clump)points.push({x,z});placed.push({x,z,index:i++});
  }
  let dimensions=null,materialsAdjusted=false;const batchMeshes=[],batchRoots=[];
  for(let i=0;i<placed.length;i++){
   const p=placed[i],instances=container.instantiateModelsToScene(n=>n+'-veg-'+si+'-'+i,false,{doNotInstantiate:false});
   const root=new BABYLON.TransformNode('world-vegetation-'+si+'-'+i,scene);
   const visualPivot=new BABYLON.TransformNode('vegetation-pivot-'+si+'-'+i,scene);visualPivot.parent=root;
   instances.rootNodes.forEach(node=>{node.parent=visualPivot;tuneVisualMaterials(node,true);});root.computeWorldMatrix(true);
   const meshes=root.getChildMeshes(false);
   if(!dimensions){
    let min=new BABYLON.Vector3(Infinity,Infinity,Infinity),max=new BABYLON.Vector3(-Infinity,-Infinity,-Infinity);
    meshes.forEach(mesh=>{mesh.computeWorldMatrix(true);const bb=mesh.getBoundingInfo().boundingBox;min=BABYLON.Vector3.Minimize(min,bb.minimumWorld);max=BABYLON.Vector3.Maximize(max,bb.maximumWorld);});
    dimensions={base:Math.max(max.x-min.x,max.z-min.z)||1,height:max.y-min.y||1,minY:min.y,cx:(min.x+max.x)*.5,cz:(min.z+max.z)*.5};
   }
   if(!materialsAdjusted){
    meshes.forEach(mesh=>{
     mesh.isPickable=false;mesh.checkCollisions=false;
     const mats=mesh.material?[mesh.material,...(mesh.material.subMaterials||[])]:[];
     mats.forEach(m=>{if(!m)return;if(a.tint){const tint=BABYLON.Color3.FromHexString(a.tint);if(m.diffuseColor)m.diffuseColor.multiplyInPlace(tint);if(m.albedoColor)m.albedoColor.multiplyInPlace(tint);}if(a.bright){if(m.diffuseColor)m.diffuseColor.scaleInPlace(a.bright);if(m.albedoColor)m.albedoColor.scaleInPlace(a.bright);}if(m.roughness!==undefined)m.roughness=Math.max(.85,m.roughness);if(m.metallic!==undefined)m.metallic=0;if(m.environmentIntensity!==undefined)m.environmentIntensity=0;});
    });materialsAdjusted=true;
   }
   const width=a.size[0]+rng(p.index*7+31)*(a.size[1]-a.size[0]),scale=width/dimensions.base,squash=a.squash||1,vertical=.85+rng(p.index*7+37)*.3,sy=scale*squash*vertical;
    if(physicsReady&&(a.file.includes('araucaria_adulta')||a.file.includes('dead_tree_trunk')||(a.file.includes('rock_07')&&a.size[1]>1)))physicsCandidates.push({x:p.x,z:p.z,width,height:dimensions.height*sy,tree:a.file.includes('araucaria_adulta')||a.file.includes('dead_tree_trunk')});
   visualPivot.position.set(-dimensions.cx,-dimensions.minY,-dimensions.cz);
   root.position.set(p.x,terrainHeightAt(p.x,p.z)-(a.sink||0)*dimensions.height*sy,p.z);
   root.scaling.set(scale,sy,scale);
   root.rotation.set((rng(p.index*7+41)-.5)*(a.tilt||0),rng(p.index*7+43)*Math.PI*2,(rng(p.index*7+47)-.5)*(a.tilt||0));
   meshes.forEach(mesh=>{mesh.isPickable=false;mesh.checkCollisions=false;});
   batchMeshes.push(...meshes);batchRoots.push(root);
  }
   if(physicsReady&&physicsCandidates.length){
    const selected=physicsCandidates.sort((a,b)=>Math.hypot(a.x,a.z)-Math.hypot(b.x,b.z)).slice(0,24);
    selected.forEach((candidate,ci)=>{
     const radius=candidate.tree?Math.max(.32,candidate.width*.035):Math.max(.24,candidate.width*.28),height=Math.max(.6,candidate.height*(candidate.tree ? .62 : .82));environmentCollisionZones.push({x:candidate.x,z:candidate.z,radius:radius+.18,kind:candidate.tree?'tree':'rock'});
     const colliderMesh=BABYLON.MeshBuilder.CreateCylinder('environment-physics-collider-'+worldKey+'-'+si+'-'+ci,{height,diameter:radius*2,tessellation:8},scene);
     colliderMesh.position.set(candidate.x,terrainHeightAt(candidate.x,candidate.z)+height/2,candidate.z);colliderMesh.isVisible=false;colliderMesh.isPickable=false;colliderMesh.checkCollisions=false;
     physicsAggregates.push(new BABYLON.PhysicsAggregate(colliderMesh,BABYLON.PhysicsShapeType.CYLINDER,{mass:0,friction:.9,restitution:0},scene));
    });
   }
  if(batchMeshes.length){
   batchMeshes.forEach(mesh=>mesh.computeWorldMatrix(true));
   let merged=batchMeshes.length===1?batchMeshes[0]:null;
   if(batchMeshes.length>1){
    try{
     // No activar multiMultiMaterials: algunos GLB no tienen subMeshes compatibles
     // y Babylon puede fallar dentro de _MergeMeshesCoroutine leyendo .length.
     merged=BABYLON.Mesh.MergeMeshes(batchMeshes,true,true,undefined,false,false);
    }catch(mergeError){
     console.warn('[Huellas VR] No se pudieron fusionar las mallas de vegetación; se conservan las instancias originales.',a.file,mergeError);
     merged=null;
    }
   }
   if(merged){
    merged.name='vegetation-batch-'+worldKey+'-'+si;merged.isPickable=false;merged.checkCollisions=false;merged.receiveShadows=true;
    shadowGenerator?.addShadowCaster(merged,true);
    batchRoots.forEach(root=>root.dispose(false));
   }else{
    // La fusión es una optimización opcional: nunca debe impedir entrar al mundo.
    batchMeshes.forEach(mesh=>{mesh.isPickable=false;mesh.checkCollisions=false;mesh.receiveShadows=true;shadowGenerator?.addShadowCaster(mesh,true);});
   }
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
 const mountainBaseAt=(x,z)=>{
  if(terrainValidAt(x,z))return terrainHeightAt(x,z);
  const radius=Math.hypot(x,z)||1,stepX=x/radius,stepZ=z/radius;
  for(let inward=2;inward<=90;inward+=2){const sx=x-stepX*inward,sz=z-stepZ*inward;if(terrainValidAt(sx,sz))return terrainHeightAt(sx,sz);}
  return 0;
 };
 const hash=(x,y)=>{const v=Math.sin(x*127.1+y*311.7+M.seed*74.7)*43758.5453;return v-Math.floor(v);};
 const noise=(x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);return (hash(xi,yi)*(1-u)+hash(xi+1,yi)*u)*(1-v)+(hash(xi,yi+1)*(1-u)+hash(xi+1,yi+1)*u)*v;};
 const ridged=(x,y,o)=>{let sum=0,amp=.5,freq=1,weight=1;for(let i=0;i<o;i++){let n=1-Math.abs(noise(x*freq,y*freq)*2-1);n*=n;sum+=n*amp*weight;weight=Math.min(1,n*2);freq*=2.03;amp*=.5;}return sum;};
 const fbm=(x,y,o)=>{let sum=0,amp=.5,freq=1;for(let i=0;i<o;i++){sum+=noise(x*freq,y*freq)*amp;freq*=2.1;amp*=.5;}return sum;};
 const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
 const NA=Q>=.6?520:300,NR=Q>=.6?64:40,R0=136,R1=320,count=(NA+1)*NR;
 const positions=new Float32Array(count*3),colors=new Float32Array(count*4),indices=[],heights=new Float32Array(count);
 const strata=M.strata?M.strata.map(c=>BABYLON.Color3.FromHexString(c)):null,rock=BABYLON.Color3.FromHexString(M.rock),rock2=BABYLON.Color3.FromHexString(M.rock2||M.rock),forest=BABYLON.Color3.FromHexString(M.forest);let maxH=0;
 for(let j=0;j<NR;j++){const tr=j/(NR-1),radius=R0+(R1-R0)*Math.pow(tr,.85);
  for(let i=0;i<=NA;i++){const theta=i/NA*Math.PI*2,x=Math.cos(theta)*radius,z=Math.sin(theta)*radius,k=j*(NA+1)+i;const edgeX=x*150/radius,edgeZ=z*150/radius,edgeY=mountainBaseAt(edgeX,edgeZ),outerBase=edgeY-12*smooth(150,205,radius);let h=radius<=150?mountainBaseAt(x,z):outerBase;
   M.bands.forEach((band,bi)=>{const mid=(band[0]+band[1])*.5,half=(band[1]-band[0])*.5,profile=Math.max(0,1-Math.pow((radius-mid)/(half*1.25),2)),sc=.009+bi*.0015,n=ridged(x*sc+bi*17,z*sc-bi*9,5),big=fbm(x*.004+bi*3,z*.004,2);let amp=band[2]*(.55+big)*n*profile*1.55*smooth(142,174,radius);if(M.open){const d=Math.atan2(Math.sin(theta-M.open.ang),Math.cos(theta-M.open.ang));amp*=1-M.open.k[bi]*Math.exp(-Math.pow(d/M.open.w,2));}h=Math.max(h,h*.4+amp);});
   if(h>0)h=118*Math.tanh(h/118);
   if(M.volcano){const V=M.volcano,vx=Math.cos(V.ang)*V.d,vz=Math.sin(V.ang)*V.d,dist=Math.hypot(x-vx,z-vz);if(dist<V.rad){let cone=V.h*Math.pow(1-dist/V.rad,1.2)*(.92+.16*fbm(x*.05,z*.05,2));const craterRadius=V.rad*.11;if(dist<craterRadius){const craterFloor=V.h*.76+(dist/craterRadius)*V.h*.09;cone=Math.min(cone,craterFloor);}h=Math.max(h,cone);}}
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
 const material=typeof BABYLON.PBRMaterial==='function'?new BABYLON.PBRMaterial('original-mountain-pbr-'+key,scene):new BABYLON.StandardMaterial('original-mountain-material-'+key,scene);if(material.albedoColor)material.albedoColor=new BABYLON.Color3(1,1,1);else material.diffuseColor=new BABYLON.Color3(1,1,1);material.metallic=0;material.roughness=.94;material.useVertexColors=true;material.backFaceCulling=false;mesh.material=material;mesh.isPickable=false;mesh.applyFog=true;mesh.receiveShadows=true;shadowGenerator?.addShadowCaster(mesh,true);if(physicsReady)physicsAggregates.push(new BABYLON.PhysicsAggregate(mesh,BABYLON.PhysicsShapeType.MESH,{mass:0,friction:.9,restitution:0},scene));
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
 const setThin=(mesh,instances,material,name)=>{if(!mesh||!instances.length)return;mesh.name=name;mesh.material=material;mesh.isPickable=false;mesh.receiveShadows=true;mesh.thinInstanceSetBuffer('matrix',new Float32Array(instances.flatMap(m=>Array.from(m.m))),16,true);mesh.thinInstanceRefreshBoundingInfo(true);shadowGenerator?.addShadowCaster(mesh,true);};
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
 const forestRing=worldKey==='stegouros'?30:46;
 const adult=place(Math.round(FN.adult*VEGETATION_QUALITY),{rMin:forestRing,rMax:130,water:7,keepHerd:16},11),adultH=adult.map((p,i)=>16+rnd(i*5+13)*16);
 setThin(adultTrunk,makeMatrices(adult,i=>({x:adultH[i],y:adultH[i],z:adultH[i]}),0),bark,'forest-adult-trunks-'+FT);
 setThin(adultCrown,makeMatrices(adult,i=>({x:adultH[i],y:adultH[i],z:adultH[i]}),0),leaf,'forest-adult-crowns-'+FT);
 const young=place(Math.round(FN.young*VEGETATION_QUALITY),{rMin:forestRing-2,rMax:130,water:5,keepHerd:12},29),youngH=young.map((p,i)=>5+rnd(i*7+31)*8);
 setThin(youngTrunk,makeMatrices(young,i=>({x:youngH[i],y:youngH[i],z:youngH[i]})),bark,'forest-young-trunks-'+FT);
 setThin(youngCrown,makeMatrices(young,i=>({x:youngH[i],y:youngH[i],z:youngH[i]})),leaf,'forest-young-crowns-'+FT);
 const ferns=place(Math.round(FN.fern*VEGETATION_QUALITY),{rMin:7,rMax:120,water:3.5,wMax:45,keepHerd:6},53),fernH=ferns.map((p,i)=>1.1+rnd(i*11+59)*2.4);
 setThin(fernStem,makeMatrices(ferns,i=>({x:fernH[i],y:fernH[i],z:fernH[i]})),bark,'forest-fern-stems-'+FT);
 setThin(fernLeaves,makeMatrices(ferns,i=>({x:fernH[i],y:fernH[i],z:fernH[i]})),frondMat,'forest-fern-leaves-'+FT);
 const grass=place(Math.round((FN.grass||0)*VEGETATION_QUALITY),{rMin:2,rMax:60,water:1.2},79),grassH=grass.map((p,i)=>.35+rnd(i*13+83)*.6);
 setThin(grassGeo,makeMatrices(grass,i=>({x:grassH[i],y:grassH[i],z:grassH[i]})),grassMat,'forest-grass-'+FT);
}
function addSSAO(){
 if(ssaoPipeline||!BABYLON.SSAORenderingPipeline||!camera||mobileDevice||!['ultra','alta'].includes(quality)||xr?.baseExperience?.state===BABYLON.WebXRState.IN_XR)return;
 try{ssaoPipeline=new BABYLON.SSAORenderingPipeline('huellas-ssao',scene,.5,[camera]);console.info('[Huellas VR] SSAO de contacto activo en perfil',quality);}
 catch(error){ssaoPipeline=null;console.warn('[Huellas VR] SSAO no disponible; se conserva iluminación base:',error);}
}
function removeSSAO(){if(!ssaoPipeline)return;try{ssaoPipeline.dispose();}catch(error){console.warn('[Huellas VR] No se pudo liberar SSAO:',error);}ssaoPipeline=null;}
function addAdvancedVisualEffects(){
 if(quality!=='ultra'||mobileDevice||xr?.baseExperience?.state===BABYLON.WebXRState.IN_XR)return;
 const hasWater=!!((WORLD.rivers||[]).length||(WORLD.lagoons||[]).length);
 if(hasWater&&BABYLON.SSRRenderingPipeline){
  try{ssrPipeline=new BABYLON.SSRRenderingPipeline('huellas-ssr-'+worldKey,scene,[camera],true,BABYLON.Constants.TEXTURETYPE_UNSIGNED_BYTE);ssrPipeline.environmentTexture=environmentTexture||null;ssrPipeline.reflectivityThreshold=.055;ssrPipeline.maxDistance=72;ssrPipeline.maxSteps=48;ssrPipeline.step=2;ssrPipeline.blurDownsample=1;ssrPipeline.blurDispersionStrength=.025;ssrPipeline.strength=.62;console.info('[Huellas VR] SSR selectivo activo:',worldKey);}
  catch(error){ssrPipeline=null;console.warn('[Huellas VR] SSR no disponible; agua mantiene reflejos PBR/IBL:',error);}
 }
 // Rayos volumétricos desactivados: se priorizan estabilidad y rendimiento de la IA/render.

}
function addVisualPipeline(){
 if(!BABYLON.DefaultRenderingPipeline||!camera)return;
 try{
  visualPipeline=new BABYLON.DefaultRenderingPipeline('huellas-visual-pipeline',true,scene,[camera]);
  visualPipeline.samples=VP.samples;visualPipeline.fxaaEnabled=VP.samples<=1;visualPipeline.imageProcessingEnabled=true;
  visualPipeline.bloomEnabled=VP.bloom>0;
  if(visualPipeline.bloomEnabled){visualPipeline.bloomThreshold=.86;visualPipeline.bloomWeight=VP.bloom;visualPipeline.bloomKernel=quality==='ultra'?64:quality==='alta'?48:40;visualPipeline.bloomScale=.5;}
  visualPipeline.chromaticAberrationEnabled=false;visualPipeline.grainEnabled=false;
  addSSAO();addAdvancedVisualEffects();
  console.info('[Huellas VR] Postprocesado WebGL2 activo:',quality,'MSAA',VP.samples,'Bloom',visualPipeline.bloomEnabled);
 }catch(error){visualPipeline=null;removeSSAO();console.warn('[Huellas VR] Postprocesado no disponible; se mantiene renderizado base:',error);}
}
function createParticleSystem(name,capacity){
 if(BABYLON.GPUParticleSystem&&BABYLON.GPUParticleSystem.IsSupported){
  try{const gpu=new BABYLON.GPUParticleSystem(name,{capacity,randomTextureSize:1024},scene);particleBackend='gpu';return gpu;}
  catch(error){console.warn('[Huellas VR] Partículas GPU no disponibles; se usa CPU:',error);}
 }
 particleBackend='cpu';return new BABYLON.ParticleSystem(name,capacity,scene);
}
function makeParticleTexture(){if(particleTextureCache)return particleTextureCache;const tex=new BABYLON.DynamicTexture('procedural-particle',64,scene,false);const c=tex.getContext(),g=c.createRadialGradient(32,32,1,32,32,31);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(255,255,255,.75)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,64,64);tex.update(false);particleTextureCache=tex;return tex;}
function addParticles(){const p=createParticleSystem('ambient-dust',VP.particles);p.particleTexture=makeParticleTexture();p.emitter=new BABYLON.Vector3(0,2,-15);p.minEmitBox=new BABYLON.Vector3(-42,0,-42);p.maxEmitBox=new BABYLON.Vector3(42,15,42);p.color1=new BABYLON.Color4(.9,.78,.55,.25);p.color2=new BABYLON.Color4(.7,.85,.75,.12);p.minSize=.025;p.maxSize=.11;p.minLifeTime=5;p.maxLifeTime=12;p.emitRate=quality==='baja'?8:quality==='media'?20:quality==='ultra'?42:32;p.direction1=new BABYLON.Vector3(-.1,.1,-.1);p.direction2=new BABYLON.Vector3(.1,.3,.1);p.minEmitPower=.05;p.maxEmitPower=.3;p.updateSpeed=.01;p.start();}
async function initPhysics(){
 if(typeof window.HavokPhysics!=='function')throw new Error('No se cargó HavokPhysics_umd.js.');
 if(typeof BABYLON.HavokPlugin!=='function'||typeof BABYLON.PhysicsAggregate!=='function'||typeof BABYLON.PhysicsCharacterController!=='function')throw new Error('Esta versión de Babylon.js no expone el plugin o el controlador de personaje Physics V2.');
 havokInstance=await window.HavokPhysics();
 physicsPlugin=new BABYLON.HavokPlugin(true,havokInstance);
 scene.enablePhysics(new BABYLON.Vector3(0,-9.81,0),physicsPlugin);
 if(!scene.isPhysicsEnabled())throw new Error('Babylon no pudo activar Havok Physics V2.');
 if(!ground)throw new Error('No existe el terreno para crear el colisionador estático Havok.');
 const terrainCollider=new BABYLON.PhysicsAggregate(ground,BABYLON.PhysicsShapeType.MESH,{mass:0,friction:.9,restitution:0},scene);
 physicsAggregates.push(terrainCollider);
 physicsController=new BABYLON.PhysicsCharacterController(new BABYLON.Vector3(camera.position.x,camera.position.y-.75,camera.position.z),{capsuleHeight:1.8,capsuleRadius:.35},scene);
 physicsController.maxSlopeCosine=Math.cos(50*Math.PI/180);physicsController.maxStepHeight=.35;physicsController.maxCharacterSpeedForSolver=8;
 physicsController.staticFriction=.8;physicsController.dynamicFriction=.65;physicsController.keepDistance=.06;
 physicsReady=true;physicsLastSupport='initializing';
 console.info('[Huellas VR] Havok Physics V2 activo: terreno estático y controlador cápsula del jugador.');
}
function showInfo(id,actor=null){const d=DINO[id];if(!d)return;if(actor){actor.lookUntil=performance.now()+6500;actor.state='look';actor.target=null;actor.goal=null;actor.clipName='';}$('infoTitle').textContent=d.name;$('infoBody').textContent=d.text;$('info').classList.remove('hidden');}
function closeInfo(){$('info').classList.add('hidden');}
function onPick(evt){
 if(!evt.hit||!evt.pickedMesh)return;
 let node=evt.pickedMesh;
 while(node){
  const actor=dinoRoots.find(item=>item.root===node);
  if(actor){showInfo(actor.id,actor);return;}
  if(node.metadata?.ground){if(evt.pickedPoint){target=evt.pickedPoint.clone();moving=true;}return;}
  node=node.parent;
 }
}
function movePlayer(dt){
 if(!physicsController||!physicsReady)throw new Error('El controlador Havok del jugador no está inicializado.');
 const inXR=xr?.baseExperience?.state===BABYLON.WebXRState.IN_XR;
 if(inXR){
  const view=xr.input?.xrCamera;
  if(view&&dt>0){
   const current=physicsController.getPosition(),dx=view.position.x-current.x,dz=view.position.z-current.z,headHeight=Math.max(1.1,Math.min(2.2,view.position.y-terrainHeightAt(current.x,current.z)));
   const maxSpeed=5,desiredX=Math.max(-maxSpeed,Math.min(maxSpeed,dx/dt)),desiredZ=Math.max(-maxSpeed,Math.min(maxSpeed,dz/dt));
   const gravity=new BABYLON.Vector3(0,-9.81,0),support=physicsController.checkSupport(Math.max(dt,.001),new BABYLON.Vector3(0,-1,0)),velocity=physicsController.getVelocity(),supported=support.supportedState===(BABYLON.CharacterSupportedState?.SUPPORTED??2);
   physicsLastSupport=supported?'grounded':support.supportedState===BABYLON.CharacterSupportedState?.SLIDING?'sliding':'airborne';
   physicsController.setVelocity(new BABYLON.Vector3(desiredX,supported?Math.max(0,velocity.y):Math.max(-22,velocity.y-9.81*dt),desiredZ));
   physicsController.integrate(Math.max(dt,.001),support,gravity);
   const next=physicsController.getPosition();view.position.set(next.x,terrainHeightAt(next.x,next.z)+headHeight,next.z);
  }
  return;
 }
 const current=physicsController.getPosition(),camDelta=new BABYLON.Vector3(camera.position.x-current.x,0,camera.position.z-current.z);
 let desiredX=dt>0?camDelta.x/dt:0,desiredZ=dt>0?camDelta.z/dt:0;
 if(moving&&target){
  const dx=target.x-current.x,dz=target.z-current.z,len=Math.hypot(dx,dz);
  if(len<.45){moving=false;target=null;desiredX=0;desiredZ=0;}
  else{desiredX=dx/len*4.5;desiredZ=dz/len*4.5;}
 }
 const gravity=new BABYLON.Vector3(0,-9.81,0),support=physicsController.checkSupport(Math.max(dt,.001),new BABYLON.Vector3(0,-1,0));
 const velocity=physicsController.getVelocity(),supported=support.supportedState===(BABYLON.CharacterSupportedState?.SUPPORTED??2);
 physicsLastSupport=supported?'grounded':support.supportedState===BABYLON.CharacterSupportedState?.SLIDING?'sliding':'airborne';
 const vertical=supported?Math.max(0,velocity.y):Math.max(-22,velocity.y-9.81*dt);
 physicsController.setVelocity(new BABYLON.Vector3(desiredX,vertical,desiredZ));
 physicsController.integrate(Math.max(dt,.001),support,gravity);
 const next=physicsController.getPosition();camera.position.set(next.x,next.y+.75,next.z);
}
const dinoFootFX={ready:false,prints:[],dust:[],printIndex:0,dustIndex:0,printMaterial:null,dustMaterial:null};
function makeFootprintTexture(){
 const tex=new BABYLON.DynamicTexture('dino-footprint-texture',{width:128,height:128},scene,false,BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
 const c=tex.getContext();c.clearRect(0,0,128,128);c.fillStyle='rgba(42,27,18,.92)';
 c.beginPath();c.ellipse(64,77,27,34,-.08,0,Math.PI*2);c.fill();
 [[39,38,10,13,-.25],[58,27,10,14,-.08],[78,30,10,14,.12],[94,45,8,11,.38]].forEach(([x,y,rx,ry,a])=>{c.beginPath();c.ellipse(x,y,rx,ry,a,0,Math.PI*2);c.fill();});
 tex.update(false);tex.hasAlpha=true;return tex;
}
function initDinoFootFX(){
 if(dinoFootFX.ready)return;
 const printTex=makeFootprintTexture();
 dinoFootFX.printMaterial=new BABYLON.StandardMaterial('dino-footprint-pool-material',scene);
 dinoFootFX.printMaterial.diffuseTexture=printTex;dinoFootFX.printMaterial.opacityTexture=printTex;
 dinoFootFX.printMaterial.diffuseColor=new BABYLON.Color3(.72,.62,.5);dinoFootFX.printMaterial.specularColor=new BABYLON.Color3(0,0,0);
 dinoFootFX.printMaterial.useAlphaFromDiffuseTexture=true;dinoFootFX.printMaterial.disableLighting=true;dinoFootFX.printMaterial.zOffset=-2;
 const dustTex=makeParticleTexture();
 dinoFootFX.dustMaterial=new BABYLON.StandardMaterial('dino-dust-pool-material',scene);
 dinoFootFX.dustMaterial.diffuseTexture=dustTex;dinoFootFX.dustMaterial.opacityTexture=dustTex;
 dinoFootFX.dustMaterial.diffuseColor=new BABYLON.Color3(.72,.59,.43);dinoFootFX.dustMaterial.useAlphaFromDiffuseTexture=true;
 dinoFootFX.dustMaterial.disableLighting=true;dinoFootFX.dustMaterial.backFaceCulling=false;
 const printCount=quality==='baja'?28:quality==='media'?48:70,dustCount=quality==='baja'?16:quality==='media'?26:36;
 for(let i=0;i<printCount;i++){
  const mesh=BABYLON.MeshBuilder.CreatePlane('dino-footprint-pool-'+i,{size:1,sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene);
  mesh.rotation.x=Math.PI/2;mesh.material=dinoFootFX.printMaterial;mesh.isPickable=false;mesh.isVisible=false;mesh.visibility=0;
  dinoFootFX.prints.push({mesh,age:0,life:25,active:false});
 }
 for(let i=0;i<dustCount;i++){
  const mesh=BABYLON.MeshBuilder.CreatePlane('dino-dust-pool-'+i,{size:1,sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene);
  mesh.billboardMode=BABYLON.Mesh.BILLBOARDMODE_ALL;mesh.material=dinoFootFX.dustMaterial;mesh.isPickable=false;mesh.isVisible=false;mesh.visibility=0;
  dinoFootFX.dust.push({mesh,age:0,life:1.6,size:1,active:false});
 }
 dinoFootFX.ready=true;
}
function emitFootprint(x,y,z,angle,size){
 const pool=dinoFootFX.prints;if(!pool.length)return;
 const fp=pool[dinoFootFX.printIndex++%pool.length],m=fp.mesh;
 fp.age=0;fp.life=25;fp.active=true;m.isVisible=true;m.visibility=.7;m.position.set(x,y+.035,z);
 m.rotation.y=angle+Math.PI;m.scaling.set(size,size*1.15,1);
}
function emitGroundDust(x,y,z,size){
 const pool=dinoFootFX.dust;if(!pool.length)return;
 const p=pool[dinoFootFX.dustIndex++%pool.length],m=p.mesh;
 p.age=0;p.life=1.6;p.size=size;p.active=true;m.isVisible=true;m.visibility=.55;
 m.position.set(x+(Math.random()-.5)*size*.65,y+.22,z+(Math.random()-.5)*size*.65);
 m.scaling.set(size*.6,size*.6,1);
}
function updateDinoFootFX(dt){
 if(!dinoFootFX.ready)return;
 for(const fp of dinoFootFX.prints){if(!fp.active)continue;fp.age+=dt;const k=fp.age/fp.life;if(k>=1){fp.active=false;fp.mesh.isVisible=false;fp.mesh.visibility=0;}else fp.mesh.visibility=.7*(k<.8?1:(1-k)*5);}
 for(const p of dinoFootFX.dust){if(!p.active)continue;p.age+=dt;const k=p.age/p.life;if(k>=1){p.active=false;p.mesh.isVisible=false;p.mesh.visibility=0;continue;}p.mesh.position.y+=dt*.35;const scale=p.size*(.6+k*1.8);p.mesh.scaling.set(scale,scale,1);p.mesh.visibility=.55*(1-k)*(k<.1?k*10:1);}
}
function emitDinoFootFX(d,dx,dz,travelled){
 const L=d.length||DINO[d.id].length,groundY=terrainHeightAt(d.root.position.x,d.root.position.z),len=Math.hypot(dx,dz)||1;
 d.footDistance=(d.footDistance||0)+travelled;d.dustDistance=(d.dustDistance||0)+travelled;
 if(d.footDistance>Math.max(.45,L*.32)){
  d.footDistance=0;d.footSide*=-1;const side=d.footSide*L*.09;
  const x=d.root.position.x-(dz/len)*side,z=d.root.position.z+(dx/len)*side;
  emitFootprint(x,groundY,z,Math.atan2(dx,dz),Math.max(.2,L*.075));
 }
 if(d.dustDistance>Math.max(.55,L*.3)&&(d.running||Math.random()<.35)){
  d.dustDistance=0;emitGroundDust(d.root.position.x,groundY,d.root.position.z,Math.max(.5,L*.16));
 }
}
let herdMode='graze',herdStamp=0,herdModeTimer=10;
function updateHerdMode(dt){
 const config=HERD_CONFIG[worldKey];if(!config)return;
 herdModeTimer-=dt;if(herdModeTimer>0)return;
 const order=['graze','drink','rest'];herdMode=order[(order.indexOf(herdMode)+1)%order.length];herdStamp++;
 herdModeTimer=({graze:28,drink:40,rest:22}[herdMode]||28)+rand(herdStamp*71)*6;
}
function herdDrinkTarget(d,index){
 const from=d.root.position,candidates=[];
 // Busca la orilla desde la posición real del animal; no usa coordenadas aproximadas
 // que podían quedar lejos del río o dentro del agua.
 (WORLD.rivers||[]).forEach(river=>{
  for(let i=1;i<river.pts.length;i++){
   const a=river.pts[i-1],b=river.pts[i],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz)||1;
   const t=Math.max(0,Math.min(1,((from.x-a[0])*dx+(from.z-a[1])*dz)/(len*len)));
   const cx=a[0]+dx*t,cz=a[1]+dz*t,nx=-dz/len,nz=dx/len,edge=river.w*.5+1.15;
   for(const side of [-1,1]){
    const x=cx+nx*edge*side,z=cz+nz*edge*side,waterGap=waterDistanceAt(x,z);
    if(terrainValidAt(x,z)&&waterGap>=.25&&waterGap<=3.5)candidates.push({x,z,score:Math.hypot(x-from.x,z-from.z)+Math.abs(waterGap-1.15)*.8});
   }
  }
 });
 (WORLD.lagoons||[]).forEach(lagoon=>{
  const dx=from.x-lagoon.x,dz=from.z-lagoon.z;
  const theta=Math.atan2(dz/Math.max(lagoon.rz,1),dx/Math.max(lagoon.rx,1));
  for(let offset=-2;offset<=2;offset++){
   const a=theta+offset*.16,x=lagoon.x+Math.cos(a)*(lagoon.rx+1.4),z=lagoon.z+Math.sin(a)*(lagoon.rz+1.4),waterGap=waterDistanceAt(x,z);
   if(terrainValidAt(x,z)&&waterGap>=.25&&waterGap<=3.5)candidates.push({x,z,score:Math.hypot(x-from.x,z-from.z)+Math.abs(waterGap-1.4)});
  }
 });
 candidates.sort((a,b)=>a.score-b.score);
 return candidates.length?{x:candidates[0].x,z:candidates[0].z}:null;
}
function collisionCellKey(x,z){return Math.floor(x/collisionCellSize)+','+Math.floor(z/collisionCellSize);}
function freezeStaticEnvironmentTransforms(){
 let frozen=0;
 for(const mesh of scene.meshes){
  if(!mesh||mesh.isDisposed?.()||mesh.name==='sky-dome'||mesh.name.startsWith('dino-footprint-pool-')||mesh.name.startsWith('dino-dust-pool-'))continue;
  let node=mesh,dynamic=false;
  while(node){if(node.metadata?.dinoId||node===skyLife?.anchor){dynamic=true;break;}node=node.parent;}
  if(dynamic||mesh.getTotalVertices?.()<=0)continue;
  mesh.freezeWorldMatrix();frozen++;
 }
 return frozen;
}
function buildEnvironmentCollisionGrid(){environmentCollisionGrid.clear();for(const zone of environmentCollisionZones){const key=collisionCellKey(zone.x,zone.z);let bucket=environmentCollisionGrid.get(key);if(!bucket)environmentCollisionGrid.set(key,bucket=[]);bucket.push(zone);}collisionGridReady=true;}
function rebuildDinoCollisionGrid(){dinoCollisionGrid.clear();for(const actor of dinoRoots){if(!actor.root)continue;const p=actor.root.position,key=collisionCellKey(p.x,p.z);let bucket=dinoCollisionGrid.get(key);if(!bucket)dinoCollisionGrid.set(key,bucket=[]);bucket.push(actor);}}
function nearbyGridItems(grid,x,z,radius){const out=[],minX=Math.floor((x-radius)/collisionCellSize),maxX=Math.floor((x+radius)/collisionCellSize),minZ=Math.floor((z-radius)/collisionCellSize),maxZ=Math.floor((z+radius)/collisionCellSize);for(let gx=minX;gx<=maxX;gx++)for(let gz=minZ;gz<=maxZ;gz++){const bucket=grid.get(gx+','+gz);if(bucket)out.push(...bucket);}return out;}
function isDinoPositionBlocked(d,x,z){const bodyRadius=dinoSpacingRadius(d),zones=collisionGridReady?nearbyGridItems(environmentCollisionGrid,x,z,bodyRadius+10):environmentCollisionZones;for(const zone of zones){const min=bodyRadius+zone.radius,dx=x-zone.x,dz=z-zone.z;if(dx*dx+dz*dz<min*min)return {blocked:true,kind:zone.kind};}const actors=dinoCollisionGrid.size?nearbyGridItems(dinoCollisionGrid,x,z,10):dinoRoots;for(const other of actors){if(other===d||!other.root)continue;const min=bodyRadius+dinoSpacingRadius(other)+.45,dx=x-other.root.position.x,dz=z-other.root.position.z;if(dx*dx+dz*dz<min*min)return {blocked:true,kind:'dinosaur'};}return {blocked:false,kind:null};}
function choosePlayerApproach(d,index,t){
 if(!camera||t<d.nextCuriosityAt||d.curiosity<.2)return false;
 d.nextCuriosityAt=t+12000+rand(index*227+Math.floor(t/1000))*18000;
 const dx=camera.position.x-d.root.position.x,dz=camera.position.z-d.root.position.z,dist=Math.hypot(dx,dz);
 if(dist<3.5||dist>28)return false;
 const active=dinoRoots.filter(a=>a!==d&&a.goal==='approach'&&a.state==='walk'&&a.target&&a.socialUntil>t).length;
 if(active>=(d.juvenile?2:1)||rand(index*233+Math.floor(t/7000))>d.curiosity)return false;
 // El destino se busca con la misma regla en todos los mundos y perfiles.
 // La densidad de Ultra no debe convertir un único punto ocupado en un fallo de IA.
 const base=Math.atan2(dx,dz),stand=Math.max(2.8,Math.min(6.2,d.length*.22+1.55));
 const phase=rand(index*239+Math.floor(t/9000))*Math.PI*2;
 const radii=[stand,stand+1.25,Math.max(2.6,stand-0.7),stand+2.4];
 let spot=null;
 rebuildDinoCollisionGrid();
 for(let ring=0;ring<radii.length&&!spot;ring++){
  const radius=radii[ring];
  for(let k=0;k<32;k++){
   const offset=((k%2===0?1:-1)*Math.ceil(k/2))*Math.PI/16;
   const a=base+phase+offset;
   const x=camera.position.x-Math.sin(a)*radius;
   const z=camera.position.z-Math.cos(a)*radius;
   if(!terrainValidAt(x,z))continue;
   if(isDinoPositionBlocked(d,x,z).blocked)continue;
   spot={x,z};break;
  }
 }
 if(!spot)return false;
 d.target=spot;d.goal='approach';d.state='walk';d.running=!!d.juvenile&&dist>7;d.socialUntil=0;return true;
}
function chooseDinoSocial(d,index,t){
 if(t<d.nextSocialAt||(!d.juvenile&&d.personality!=='social'))return false;
 d.nextSocialAt=t+18000+rand(index*281+Math.floor(t/1000))*26000;
 if(!d.testSocial&&rand(index*283+Math.floor(t/5000))>(d.juvenile?.42:.18))return false;
 const active=dinoRoots.filter(a=>a.socialPartner&&a.socialUntil>t).length;
 if(active>=2)return false;
 const candidates=dinoRoots.filter(a=>a!==d&&a.id===d.id&&a.state==='idle'&&!a.socialPartner&&Math.hypot(a.root.position.x-d.root.position.x,a.root.position.z-d.root.position.z)>2&&Math.hypot(a.root.position.x-d.root.position.x,a.root.position.z-d.root.position.z)<120).map(partner=>{
  const dx=d.root.position.x-partner.root.position.x,dz=d.root.position.z-partner.root.position.z,dist=Math.hypot(dx,dz)||1,stand=dinoSpacingRadius(d)+dinoSpacingRadius(partner)+1.1,base=Math.atan2(dx,dz);
  let spot=null;for(let k=0;k<32&&!spot;k++){const a=base+k*Math.PI/16,x=partner.root.position.x+Math.sin(a)*stand,z=partner.root.position.z+Math.cos(a)*stand;if(terrainValidAt(x,z)&&!isDinoPositionBlocked(d,x,z).blocked)spot={x,z};}
  if(!spot&&dist>=dinoSpacingRadius(d)+dinoSpacingRadius(partner)+.5&&terrainValidAt(d.root.position.x,d.root.position.z))spot={x:d.root.position.x,z:d.root.position.z};
  return spot?{partner,x:spot.x,z:spot.z,dist}:null;
 }).filter(Boolean).sort((a,b)=>a.dist-b.dist);
 if(!candidates.length)return false;
 const {partner,x,z}=candidates[0];
 const playful=d.juvenile&&partner.juvenile&&d.personality==='playful';
 d.target={x,z};d.goal=playful?'play':'social';d.socialPartner=partner;d.playDirection=rand(index*337+Math.floor(t/1000))>.5?1:-1;d.state='walk';d.running=playful;d.socialUntil=t+10000+rand(index*293+Math.floor(t/1000))*7000;
 partner.socialPartner=d;partner.state='social';partner.goal='social';partner.target=null;partner.running=false;partner.actualSpeed=0;partner.socialUntil=d.socialUntil;partner.timer=8+rand(index*307+Math.floor(t/1000))*8;
 return true;
}
function updateDinoSocial(d,t,step){
 const partner=d.socialPartner;
 if(!partner||!partner.root||d.socialUntil<=t){d.socialPartner=null;if(d.state==='social'||d.state==='play'){d.state='idle';d.goal=null;d.timer=1.5;d.actualSpeed=0;}return;}
 const dx=partner.root.position.x-d.root.position.x,dz=partner.root.position.z-d.root.position.z;
 if(Math.hypot(dx,dz)>.1){const face=Math.atan2(dx,dz);let turn=face-d.heading;while(turn>Math.PI)turn-=Math.PI*2;while(turn< -Math.PI)turn+=Math.PI*2;d.heading+=Math.sign(turn)*Math.min(Math.abs(turn),1.7*step);}
 if(d.state==='play'){
  d.timer-=step;
  if(d.timer<=0&&d.socialUntil>t){
   const angle=Math.atan2(d.root.position.x-partner.root.position.x,d.root.position.z-partner.root.position.z)+(d.playDirection||1)*.9,stand=dinoSpacingRadius(d)+dinoSpacingRadius(partner)+1.35,x=partner.root.position.x+Math.sin(angle)*stand,z=partner.root.position.z+Math.cos(angle)*stand;
   if(terrainValidAt(x,z)&&!isDinoPositionBlocked(d,x,z).blocked){d.target={x,z};d.goal='play';d.state='walk';d.running=true;d.timer=0;}
   else d.timer=1.2;
  }
 }else if(d.state==='social'){d.timer-=step;if(d.timer<=0){d.socialUntil=t;d.socialPartner=null;d.state='idle';d.goal=null;d.timer=1.5;}}
}
function tryDinoFlee(d,index,t){
 if(d.personality!=='shy'||(d.state==='walk'&&d.goal==='flee')||!camera)return false;
 const dx=d.root.position.x-camera.position.x,dz=d.root.position.z-camera.position.z,dist=Math.hypot(dx,dz);
 if(dist>3.2||dist<.01)return false;
 const nx=dx/dist,nz=dz/dist,step=9+rand(index*311+Math.floor(t/1000))*5,x=d.root.position.x+nx*step,z=d.root.position.z+nz*step;
 if(!terrainValidAt(x,z)||isDinoPositionBlocked(d,x,z).blocked)return false;
 d.target={x,z};d.goal='flee';d.state='walk';d.running=true;d.lookUntil=0;d.socialUntil=0;d.socialPartner=null;return true;
}
function animateDinos(t,dt){
 const frameStep=Math.min(.05,Math.max(0,dt||0)),herd=HERD_CONFIG[worldKey];
 rebuildDinoCollisionGrid();
 dinoRoots.forEach((d,index)=>{
  const root=d.root,L=d.length||DINO[d.id].length,profile=({
   atacamatitan:{walk:.10,run:.50,},arackar:{walk:.16,run:.72,},
   gonkoken:{walk:.08,run:1,},stegouros:{walk:.22,run:.60,},
   chilesaurus:{walk:.45,run:2.2,}
  })[d.id]||{walk:.1,run:.5,reverse:false};
  const playerDistance=camera?Math.hypot(camera.position.x-root.position.x,camera.position.z-root.position.z):0;
  if(playerDistance>65&&d.state==='idle'&&!d.testClip&&!d.transitionFrom&&t<(d.nextLodUpdate||0))return;
  const step=playerDistance>65&&d.state==='idle'&&!d.testClip?Math.min(.25,Math.max(frameStep,(t-(d.lastLodUpdate||t-200))/1000)):frameStep;
  if(playerDistance>65&&d.state==='idle'&&!d.testClip){d.lastLodUpdate=t;d.nextLodUpdate=t+200;}
  tryDinoFlee(d,index,t);
  if(d.state==='social'||d.state==='play')updateDinoSocial(d,t,step);
  if(d.state==='graze'||d.state==='drink'||d.state==='rest'){d.timer-=step;if(d.timer<=0){d.state='idle';d.timer=1+rand(index*19+Math.floor(t))*2;d.goal=null;d.actualSpeed=0;}}
  if(t<d.lookUntil)d.state='look';
  else if(d.state==='look'){d.state='idle';d.timer=1.5;d.target=null;d.goal=null;d.actualSpeed=0;}
  if(d.state==='idle'){
   d.timer-=step;
   if(d.timer<=0){
    d.target=null;d.goal=null;d.running=false;d.actualSpeed=0;
    if(choosePlayerApproach(d,index,t)){d.timer=0;}
    else if(chooseDinoSocial(d,index,t)){d.timer=0;}
    else if(herd){
     if(herdMode==='rest'&&((index*7+herdStamp)%3!==0||rand(index*31+herdStamp)<.35)){
      d.state='rest';d.restLook=rand(index*43+herdStamp)<.35;d.timer=9+rand(index*47+herdStamp)*10;d.target={rest:true};
     }else{
      if(herdMode==='drink'&&d.drankStamp!==herdStamp){
       const w=herdDrinkTarget(d,index);if(w&&terrainValidAt(w.x,w.z)){d.target=w;d.goal='drink';}
      }
      if(!d.target){
       const a=rand(index*101+Math.floor(t*2)+d.phase*100)*Math.PI*2;
       const r=Math.sqrt(rand(index*67+Math.floor(t)+d.phase*71))*herd.spread;
       let x=herd.center.x+Math.cos(a)*r,z=herd.center.z+Math.sin(a)*r;
       if(rand(index*73+herdStamp)<.65){
        const b=rand(index*89+Math.floor(t*3))*Math.PI*2,rd=3.2+L*.45+rand(index*97+herdStamp)*3;
        x=camera.position.x+Math.cos(b)*rd;z=camera.position.z+Math.sin(b)*rd;
       }
       if(terrainValidAt(x,z)){d.target={x,z};d.goal='graze';}
      }
     }
    }else{
     const a=rand(index*101+Math.floor(t*2)+d.phase*100)*Math.PI*2,r=rand(index*67+Math.floor(t)+d.phase*71)*d.radius;
     const x=d.home.x+Math.cos(a)*r,z=d.home.z+Math.sin(a)*r;
     if(terrainValidAt(x,z))d.target={x,z};
    }
    if(d.target&&!d.target.rest){d.running=d.goal==='approach'?!!d.juvenile:(L<8&&rand(index*109+Math.floor(t*4))<.2)||(herdMode==='graze'&&rand(index*113+Math.floor(t))<.035);d.state='walk';}
    else if(!d.target)d.timer=2;
   }
  }
  if(d.state==='walk'&&d.target&&!d.target.rest){
   const dx=d.target.x-root.position.x,dz=d.target.z-root.position.z,dist=Math.hypot(dx,dz);
   if(dist<(d.goal==='drink'?.9:d.goal==='approach'?Math.max(1.8,d.length*.16+1.1):.45)){
    if(d.goal==='drink'){d.state='drink';d.timer=7+rand(index*127+herdStamp)*7;d.drankStamp=herdStamp;}
    else if(d.goal==='approach'){d.state='look';d.lookUntil=t+4500+rand(index*251+Math.floor(t/1000))*4500;d.socialUntil=d.lookUntil;d.timer=0;}
    else if(d.goal==='social'||d.goal==='play'){d.state=d.goal==='play'?'play':'social';d.timer=d.goal==='play'?2.2:5+rand(index*313+Math.floor(t/1000))*5;}
    else if(d.goal==='graze'){d.state='graze';d.timer=5+rand(index*317+Math.floor(t/1000))*8;}
    else if(d.goal==='flee'){d.state='idle';d.timer=4+rand(index*331+Math.floor(t/1000))*4;d.goal=null;}
    else{d.state='idle';d.timer=2+rand(index*131+Math.floor(t))*4;}
    d.target=null;d.running=false;d.actualSpeed=0;
   }else{
    const desired=Math.atan2(dx,dz),nominal=L*(d.running?profile.run:profile.walk),r=L*.3;
    const turnAngles=[0,.22,-.22,.44,-.44,.68,-.68,.94,-.94,1.2,-1.2,1.55,-1.55,Math.PI];
    let chosenStep=null,lastBlocked=null;
    for(const offset of turnAngles){
     const angle=desired+offset,nx=root.position.x+Math.sin(angle)*nominal*step,nz=root.position.z+Math.cos(angle)*nominal*step;
     const support=[[nx,nz],[nx+Math.sin(angle)*r,nz+Math.cos(angle)*r],[nx-Math.sin(angle)*r,nz-Math.cos(angle)*r]];
     const obstacle=isDinoPositionBlocked(d,nx,nz);
     if(obstacle.blocked){lastBlocked=obstacle.kind;continue;}
     if(!support.every(p=>terrainValidAt(p[0],p[1])))continue;
     chosenStep={angle,nx,nz,support};break;
    }
    if(chosenStep){
     let delta=chosenStep.angle-d.heading;while(delta>Math.PI)delta-=Math.PI*2;while(delta< -Math.PI)delta+=Math.PI*2;
     d.heading+=Math.sign(delta)*Math.min(Math.abs(delta),1.8*step);
     const heights=chosenStep.support.map(p=>terrainHeightAt(p[0],p[1])),travelled=Math.hypot(chosenStep.nx-root.position.x,chosenStep.nz-root.position.z);
     root.position.x=chosenStep.nx;root.position.z=chosenStep.nz;root.position.y=Math.min(...heights);d.actualSpeed=step>0?travelled/step:0;d.lastCollision=null;
     emitDinoFootFX(d,Math.sin(d.heading),Math.cos(d.heading),travelled);
    }else{
     d.actualSpeed=0;d.lastCollision=lastBlocked||'terrain';
     // Un bloqueo momentáneo no cancela el destino: la IA reintenta con
     // direcciones alternativas en el siguiente fotograma.
     d.blockedFrames=(d.blockedFrames||0)+1;
     if(d.blockedFrames>45){d.state='idle';d.target=null;d.timer=.8;d.blockedFrames=0;}
    }
    if(chosenStep)d.blockedFrames=0;
   }
  }else if(d.state!=='walk')root.position.y=terrainHeightAt(root.position.x,root.position.z);
  if(d.state==='look'&&camera){const tx=camera.position.x-root.position.x,tz=camera.position.z-root.position.z;if(Math.hypot(tx,tz)>.1){const face=Math.atan2(tx,tz);let turn=face-d.heading;while(turn>Math.PI)turn-=Math.PI*2;while(turn< -Math.PI)turn+=Math.PI*2;d.heading+=Math.sign(turn)*Math.min(Math.abs(turn),1.8*step);}}
   const desired=d.testClip||(d.state==='look'||d.state==='drink'||d.state==='graze'||d.state==='social'||d.state==='play'||(d.state==='rest'&&d.restLook)?'Neck_Look':d.state==='walk'?(d.running?'Run':'Walk'):'Idle');
  if(d.clipName!==desired){
   const clip=resolveDinoClip(d.clips,desired);
   if(clip&&clip!==d.activeClip){if(d.transitionFrom&&d.transitionFrom!==d.activeClip)d.transitionFrom.stop();d.transitionFrom=d.activeClip||null;d.transitionElapsed=0;clip.start(true);clip.setWeightForAllAnimatables?.(0);d.activeClip=clip;d.clipName=desired;}
   else if(clip===d.activeClip)d.clipName=desired;
  }
  if(d.activeClip){
   const gaitBase=profile[d.running?'run':'walk']||profile.walk||.1;
   const ratio=d.state==='walk'&&d.actualSpeed>0?Math.max(.35,Math.min(1.5,d.actualSpeed/(L*gaitBase))):1;d.activeClip.speedRatio=ratio;
   if(d.transitionFrom){d.transitionElapsed+=step;const blend=Math.min(1,d.transitionElapsed/.24);d.activeClip.setWeightForAllAnimatables?.(blend);d.transitionFrom.setWeightForAllAnimatables?.(1-blend);if(blend>=1){d.transitionFrom.stop();d.transitionFrom=null;d.activeClip.setWeightForAllAnimatables?.(1);}}
  }
  root.rotation.y=d.heading+d.baseYaw;
 });
}
async function enterXR(){try{
 if(stereoEnabled)await toggleMobileStereo();
 if(!navigator.xr){$('sensorNotice').classList.remove('hidden');return;}
 if(!xr){
  xr=await scene.createDefaultXRExperienceAsync({floorMeshes:[ground],uiOptions:{sessionMode:'immersive-vr',referenceSpaceType:'local-floor',customButtons:[]},disableTeleportation:true,disableNearInteraction:false});
  xr.baseExperience.onInitialXRPoseSetObservable.add(xrCamera=>{const px=camera.position.x,pz=camera.position.z,headHeight=Math.max(1.1,Math.min(2.2,xrCamera.position.y||1.65));xrCamera.position.x=px;xrCamera.position.y=terrainHeightAt(px,pz)+headHeight;xrCamera.position.z=pz;});
  xr.baseExperience.onStateChangedObservable.add(state=>{if(state===BABYLON.WebXRState.IN_XR){removeSSAO();if(ssrPipeline)ssrPipeline.isEnabled=false;if(volumetricLight)volumetricLight.isEnabled=false;}else if(state===BABYLON.WebXRState.NOT_IN_XR){addSSAO();if(ssrPipeline)ssrPipeline.isEnabled=true;if(volumetricLight)volumetricLight.isEnabled=true;}const hint=document.querySelector('#hud .hint');if(state===BABYLON.WebXRState.IN_XR&&hint)hint.textContent='Mira un dinosaurio durante 1,4 s para conocerlo · joystick para caminar y girar · gatillo para seleccionar';if(state===BABYLON.WebXRState.NOT_IN_XR){if(hint)hint.textContent='Arrastra para mirar · toca el suelo para caminar · toca un dinosaurio para conocerlo';if(xr.input?.xrCamera){const p=xr.input.xrCamera.position;camera.position.set(p.x,terrainHeightAt(p.x,p.z)+1.65,p.z);}}});
  xr.input.onControllerAddedObservable.add(controller=>{controller.onMotionControllerInitObservable.add(motionController=>{const trigger=motionController.getComponent('xr-standard-trigger');trigger?.onButtonStateChangedObservable.add(component=>{if(!component.pressed)return;const ray=controller.getForwardRay(120),pick=scene.pickWithRay(ray,mesh=>mesh.isPickable);if(pick?.hit)onPick(pick);});});});
  const fm=xr.baseExperience.featuresManager;
  if(BABYLON.WebXRFeatureName?.MOVEMENT){try{xrMovement=fm.enableFeature(BABYLON.WebXRFeatureName.MOVEMENT,'latest',{xrInput:xr.input,movementSpeed:1.15,rotationSpeed:1.0,movementOrientationFollowsViewerPose:true},true,false);}catch(moveError){console.warn('Movimiento por mandos no disponible; se conserva selección por puntero',moveError);}}
 }
 await xr.baseExperience.enterXRAsync('immersive-vr','local-floor');
 }catch(e){console.warn('WebXR no disponible',e);$('sensorNotice').classList.remove('hidden');}}
function updateXRGaze(){
 if(!xr||xr.baseExperience.state!==BABYLON.WebXRState.IN_XR){xrGazeActor=null;xrGazeFired=false;return;}
 const view=xr.input?.xrCamera||scene.activeCamera;if(!view)return;
 const pick=scene.pickWithRay(view.getForwardRay(120),mesh=>mesh.isPickable);
 let actor=null;
 if(pick?.hit&&pick.pickedMesh){let node=pick.pickedMesh;while(node&&!actor){actor=dinoRoots.find(item=>item.root===node)||null;node=node.parent;}}
 if(!actor){xrGazeActor=null;xrGazeFired=false;return;}
 if(xrGazeActor!==actor.root){xrGazeActor=actor.root;xrGazeSince=performance.now();xrGazeFired=false;return;}
 if(!xrGazeFired&&performance.now()-xrGazeSince>=1400){showInfo(actor.id,actor);xrGazeFired=true;}
}
function wrapAngleDelta(value,base){let d=(value-base)*Math.PI/180;while(d>Math.PI)d-=Math.PI*2;while(d< -Math.PI)d+=Math.PI*2;return d;}
async function toggleMobileOrientation(){
 if(orientationEnabled){window.removeEventListener('deviceorientation',orientationHandler,true);orientationEnabled=false;orientationBase=null;orientationHandler=null;$('sensorButton').textContent='🧭';return;}
 try{
  if(!window.isSecureContext)throw new Error('Los sensores requieren HTTPS.');
  const Orientation=window.DeviceOrientationEvent;
  if(Orientation&&typeof Orientation.requestPermission==='function'){const permission=await Orientation.requestPermission();if(permission!=='granted')throw new Error('Permiso de orientación denegado.');}
  if(!Orientation)throw new Error('Este navegador no ofrece sensores de orientación.');
  orientationBase=null;const startRotation=camera.rotation.clone();
  orientationHandler=event=>{
   if(!Number.isFinite(event.alpha)||!Number.isFinite(event.beta)||!Number.isFinite(event.gamma)||xr?.baseExperience?.state===BABYLON.WebXRState.IN_XR)return;
   const screenAngle=screen.orientation?.angle||window.orientation||0;
   if(!orientationBase)orientationBase={alpha:event.alpha,beta:event.beta,gamma:event.gamma,screen:screenAngle};
   const yaw=wrapAngleDelta(event.alpha,orientationBase.alpha)+((screenAngle-orientationBase.screen)*Math.PI/180);
   const pitch=wrapAngleDelta(event.beta,orientationBase.beta),roll=wrapAngleDelta(event.gamma,orientationBase.gamma);
   camera.rotation.set(startRotation.x+pitch,startRotation.y+yaw,startRotation.z-roll);
  };
  window.addEventListener('deviceorientation',orientationHandler,true);orientationEnabled=true;$('sensorButton').textContent='🧭✓';
  $('sensorNotice').classList.add('hidden');
 }catch(error){console.warn('Orientación móvil no disponible',error);$('sensorNotice').classList.remove('hidden');}
}
async function toggleMobileStereo(){
 if(stereoEnabled){
  camera.setCameraRigMode(BABYLON.Camera.RIG_MODE_NONE);stereoEnabled=false;$('stereoButton').textContent='🥽';
  $('hud').classList.remove('hidden');$('exitHint').classList.add('hidden');$('rotate').classList.add('hidden');
  try{if(document.fullscreenElement)await document.exitFullscreen();}catch(e){}
  try{screen.orientation?.unlock?.();}catch(e){}
  try{await stereoWakeLock?.release();}catch(e){}stereoWakeLock=null;stereoTapTimes=[];return;
 }
 try{
  camera.setCameraRigMode(BABYLON.Camera.RIG_MODE_STEREOSCOPIC_SIDEBYSIDE_PARALLEL,{interaxialDistance:.064});
  stereoEnabled=true;$('stereoButton').textContent='🥽✓';$('hud').classList.add('hidden');$('exitHint').classList.remove('hidden');
  try{const el=document.documentElement;if(el.requestFullscreen)await el.requestFullscreen({navigationUI:'hide'});else if(el.webkitRequestFullscreen)el.webkitRequestFullscreen();}catch(e){}
  try{await screen.orientation?.lock?.('landscape');}catch(e){}
  try{if(navigator.wakeLock)stereoWakeLock=await navigator.wakeLock.request('screen');}catch(e){}
  $('rotate').classList.toggle('hidden',window.innerHeight<=window.innerWidth);
 }catch(error){console.warn('Visor estereoscópico no disponible',error);stereoEnabled=false;$('stereoButton').textContent='🥽';$('hud').classList.remove('hidden');$('exitHint').classList.add('hidden');}
}
function updateStereoOrientation(){if(stereoEnabled)$('rotate').classList.toggle('hidden',window.innerHeight<=window.innerWidth);}

function bindControls(){window.addEventListener('resize',updateStereoOrientation);window.addEventListener('orientationchange',updateStereoOrientation);window.addEventListener('keydown',event=>{if(event.key==='Escape'&&stereoEnabled)toggleMobileStereo();});window.addEventListener('touchstart',()=>{if(!stereoEnabled)return;const now=performance.now();stereoTapTimes=stereoTapTimes.filter(t=>now-t<1200);stereoTapTimes.push(now);if(stereoTapTimes.length>=3)toggleMobileStereo();},{passive:true});$('exitHint').onclick=()=>toggleMobileStereo();scene.onPointerObservable.add(pi=>{if(pi.type===BABYLON.PointerEventTypes.POINTERPICK)onPick(pi.pickInfo);});canvas.addEventListener('pointerdown',()=>{if(camera.inputs.attached.pointers){}},{passive:true});$('explore').onclick=()=>startExperience(false);$('visor').onclick=()=>startExperience(true);$('vrButton').onclick=enterXR;$('sensorButton').onclick=toggleMobileOrientation;$('stereoButton').onclick=toggleMobileStereo;$('closeInfo').onclick=closeInfo;$('timeButton').onclick=cycleTimeOfDay;$('rainButton').onclick=()=>{raining=!raining;$('rainButton').textContent=raining?'🌧️':'🌧';if(raining){if(!rainSystem){const rainCapacity=quality==='alta'?900:quality==='media'?520:260;rainSystem=createParticleSystem('rain',rainCapacity);rainSystem.particleTexture=makeParticleTexture();rainSystem.emitter=new BABYLON.Vector3(0,18,-10);rainSystem.minEmitBox=new BABYLON.Vector3(-55,0,-55);rainSystem.maxEmitBox=new BABYLON.Vector3(55,0,55);rainSystem.color1=new BABYLON.Color4(.65,.75,.9,.5);rainSystem.color2=new BABYLON.Color4(.8,.85,1,.35);rainSystem.minSize=.025;rainSystem.maxSize=.05;rainSystem.minLifeTime=1;rainSystem.maxLifeTime=2;rainSystem.emitRate=quality==='alta'?620:quality==='media'?360:180;rainSystem.direction1=new BABYLON.Vector3(0,-1,0);rainSystem.direction2=new BABYLON.Vector3(.2,-1,.2);rainSystem.minEmitPower=8;rainSystem.maxEmitPower=13;}rainSystem.start();}else rainSystem?.stop();};$('soundButton').onclick=()=>{soundOn=!soundOn;$('soundButton').textContent=soundOn?'🔊':'🔇';if(audioMaster&&audioContext)audioMaster.gain.setTargetAtTime(soundOn?.18:0,audioContext.currentTime,.12);};$('qualityButton').onclick=()=>{const order=['ultra','alta','media','baja'],index=order.indexOf(quality),next=order[(index<0?1:index+1)%order.length];location.search=new URLSearchParams({...Object.fromEntries(params),q:next}).toString();};$('retrySensors').onclick=()=>enterXR();$('continueTouch').onclick=()=>{$('sensorNotice').classList.add('hidden');};}
async function startExperience(withVR){$('loader').style.opacity='0';setTimeout(()=>$('loader').classList.add('hidden'),750);$('hud').classList.remove('hidden');$('worldLabel').textContent=WORLD.title;if(withVR)await enterXR();}
function installDiagnostics(){
 let sceneInstrumentation=null,engineInstrumentation=null;
 if(params.get('debug')==='1'){
  try{
   if(BABYLON.SceneInstrumentation){sceneInstrumentation=new BABYLON.SceneInstrumentation(scene);sceneInstrumentation.captureFrameTime=true;sceneInstrumentation.captureRenderTime=true;sceneInstrumentation.captureActiveMeshesEvaluationTime=true;sceneInstrumentation.capturePhysicsTime=true;sceneInstrumentation.captureAnimationsTime=true;}
   if(BABYLON.EngineInstrumentation){engineInstrumentation=new BABYLON.EngineInstrumentation(engine);engineInstrumentation.captureGPUFrameTime=true;}
  }catch(error){console.warn('[Huellas VR] Instrumentación no disponible:',error);}
 }
 const percentile=(values,p)=>{if(!values.length)return null;const sorted=values.slice().sort((a,b)=>a-b);return Math.round(sorted[Math.min(sorted.length-1,Math.ceil((p/100)*sorted.length)-1)]*100)/100;};
 const snapshot=()=>{
  const p=physicsController?.getPosition?.()||camera?.position;
  const gpuCounter=engineInstrumentation?.gpuFrameTimeCounter;
  return {
   world:worldKey,quality,fps:Number.isFinite(engine?.getFps?.())?Math.round(engine.getFps()):0,
   meshes:scene?.meshes?.length||0,activeMeshes:scene?.getActiveMeshes?.().length||0,frozenWorldMatrices:scene?.meshes?.filter(m=>m.isWorldMatrixFrozen).length||0,collisionBuckets:{environment:environmentCollisionGrid.size,dinosaurs:dinoCollisionGrid.size},renderLoopStarted,
   textures:engine?.getLoadedTexturesCache?.().length||0,dinosaurs:dinoRoots.length,
   vegetationAssets:assetCache.size,particles:scene?.particleSystems?.length||0,visual:{pipeline:!!visualPipeline,bloom:!!visualPipeline?.bloomEnabled,ssao:!!ssaoPipeline,ssr:!!ssrPipeline&&!!ssrPipeline.isEnabled,volumetric:!!volumetricLight&&!!volumetricLight.isEnabled,environment:!!environmentTexture,environmentReady,environmentError,clearCoat:scene.materials.some(m=>!!m.clearCoat?.isEnabled),foliageSheen:scene.materials.some(m=>!!m.sheen?.isEnabled),thinInstances:scene.meshes.some(m=>m.hasThinInstances),particleBackend,shadowMap:VP.shadow,anisotropy:VP.anisotropy,profile:quality},
   dinoStates:dinoRoots.map(d=>({id:d.id,clip:d.clipName,active:!!d.activeClip,playing:!!d.activeClip?.isPlaying,state:d.state,goal:d.goal,personality:d.personality,juvenile:d.juvenile,socialPartner:d.socialPartner?.root?.name||null,heading:d.heading,speed:d.actualSpeed,target:d.target?{x:+d.target.x.toFixed(2),z:+d.target.z.toFixed(2)}:null,forwardYaw:d.baseYaw,position:{x:+d.root.position.x.toFixed(2),y:+d.root.position.y.toFixed(2),z:+d.root.position.z.toFixed(2)}})),
   cpuUpdateMs:Math.round(cpuUpdateMs*100)/100,cpuUpdateAvgMs:Math.round(cpuUpdateAvgMs*100)/100,cpuStagesMs:{...cpuStageMs},frameP50Ms:percentile(frameTimeSamples,50),frameP95Ms:percentile(frameTimeSamples,95),frameP99Ms:percentile(frameTimeSamples,99),fps1PercentLow:frameTimeSamples.length?Math.round(1000/Math.max(.01,percentile(frameTimeSamples,95))):null,frameSamples:frameTimeSamples.length,
   frameTimeMs:sceneInstrumentation?.frameTimeCounter?.current??null,renderTimeMs:sceneInstrumentation?.renderTimeCounter?.current??null,physicsTimeMs:sceneInstrumentation?.physicsTimeCounter?.current??null,drawCalls:sceneInstrumentation?.drawCallsCounter?.current??null,
   gpuFrameTimeMs:gpuCounter&&Number.isFinite(gpuCounter.current)?Math.round(gpuCounter.current/1e6*100)/100:null,
   heapMB:performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576):null,
   player:p?{x:+p.x.toFixed(2),y:+p.y.toFixed(2),z:+p.z.toFixed(2),groundY:typeof terrainHeightAt==='function'?+terrainHeightAt(p.x,p.z).toFixed(2):null}:null,
   sky:{ready:skyReady,error:skyError,url:WORLD.sky},terrain:{photo:terrainPhotoReady,normal:terrainNormalReady,error:terrainTextureError,ground:WORLD.ground,mesh:ground?.name||null,material:ground?.material?.name||null,diffuseTexture:ground?.material?.diffuseTexture?.name||null,albedoTexture:ground?.material?.albedoTexture?.name||null,skyFogEnabled:skyMaterial?.fogEnabled??null,materialType:ground?.material?.getClassName?.()||ground?.material?.constructor?.name||null,diffuseReady:!!(ground?.material?.albedoTexture?.isReady?.()||ground?.material?.diffuseTexture?.isReady?.()),uvCount:ground?.getVerticesData?.(BABYLON.VertexBuffer.UVKind)?.length||0,vertices:ground?.getTotalVertices?.()||0,photoSample:(()=>{try{const tex=ground?.material?.albedoTexture||ground?.material?.diffuseTexture,c=tex?.getContext?.();return c?[...c.getImageData(1024,1024,1,1).data]:null;}catch{return null;}})()},
   physics:{enabled:physicsReady,controller:!!physicsController,colliders:physicsAggregates.length,environmentZones:environmentCollisionZones.length,support:physicsLastSupport,dinoCollisionAvoidance:typeof isDinoPositionBlocked==='function'},xrState:xr?.baseExperience?.state??'desktop',
   webglVersion:engine?.webGLVersion??null,renderSize:{width:engine?.getRenderWidth?.()||0,height:engine?.getRenderHeight?.()||0},errors:[skyError,terrainTextureError].filter(Boolean)
  };
 };
 window.__HUELLAS_VR_DIAGNOSTICS__=snapshot;
 if(params.get('test')==='1')window.__HUELLAS_VR_TEST__={
  dinoBehaviorCheck(){let overlaps=0,minGap=Infinity;for(let i=0;i<dinoRoots.length;i++)for(let j=i+1;j<dinoRoots.length;j++){const a=dinoRoots[i],b=dinoRoots[j],gap=Math.hypot(a.root.position.x-b.root.position.x,a.root.position.z-b.root.position.z)-(dinoSpacingRadius(a)+dinoSpacingRadius(b));minGap=Math.min(minGap,gap);if(gap<-.05)overlaps++;}return {count:dinoRoots.length,overlaps,minGap:Number.isFinite(minGap)?+minGap.toFixed(3):null,juveniles:dinoRoots.filter(d=>d.juvenile).length,approaching:dinoRoots.filter(d=>d.goal==='approach').length,looking:dinoRoots.filter(d=>d.state==='look').length,grazing:dinoRoots.filter(d=>d.state==='graze').length,social:dinoRoots.filter(d=>d.state==='social'||d.state==='play').length,fleeing:dinoRoots.filter(d=>d.goal==='flee').length};},
  exerciseSocial(){for(const a of dinoRoots){a.state='idle';a.target=null;a.goal=null;a.socialPartner=null;a.socialUntil=0;a.nextSocialAt=0;}const candidates=dinoRoots.filter(a=>a.juvenile||a.personality==='social');for(const d of candidates){d.testSocial=true;const started=chooseDinoSocial(d,dinoRoots.indexOf(d),performance.now());d.testSocial=false;if(started)return {started:true,partner:d.socialPartner?.root?.name||null,juvenile:d.juvenile};}return {started:false,reason:'no-valid-nearby-partner',candidates:candidates.length,positions:dinoRoots.map(d=>({name:d.root.name,personality:d.personality,state:d.state,x:+d.root.position.x.toFixed(1),z:+d.root.position.z.toFixed(1),radius:dinoSpacingRadius(d)}))};},
  exercisePlayerApproach(){const t=performance.now(),candidates=dinoRoots.filter(a=>a.state==='idle'&&!a.socialPartner),diagnostics=candidates.map(d=>{const dx=camera.position.x-d.root.position.x,dz=camera.position.z-d.root.position.z,dist=Math.hypot(dx,dz);return {name:d.root.name,dist:+dist.toFixed(2),inRange:dist>=3.5&&dist<=18,terrain:terrainValidAt(camera.position.x,camera.position.z),curiosity:d.curiosity};});for(const d of candidates){d.curiosity=1;d.nextCuriosityAt=0;if(choosePlayerApproach(d,dinoRoots.indexOf(d),t))return {started:true,dinosaur:d.root.name,juvenile:d.juvenile,diagnostics};}return {started:false,reason:'no-valid-player-approach-position',camera:{x:+camera.position.x.toFixed(2),z:+camera.position.z.toFixed(2)},candidateCount:candidates.length,nearby:diagnostics.filter(d=>d.dist<=25).slice(0,12),nearest:diagnostics.sort((a,b)=>a.dist-b.dist).slice(0,5)};},
  collisionCheck(){const zone=environmentCollisionZones[0];const probe=zone?isDinoPositionBlocked({id:dinoRoots[0]?.id||'atacamatitan',length:0},zone.x,zone.z):{blocked:false,kind:null};return {havok:physicsReady,aggregates:physicsAggregates.length,environmentZones:environmentCollisionZones.length,probeBlocked:probe.blocked,probeKind:probe.kind};},
  setAnimation(name){
   const d=dinoRoots[0];if(!d)throw new Error('No hay dinosaurios cargados para probar.');
   if(!['Idle','Walk','Run','Neck_Look'].includes(name))throw new Error('Clip de prueba no permitido: '+name);
   // Aislar la prueba de locomoción: las pruebas sociales previas pueden dejar
   // un vínculo de pareja activo que bloquea el movimiento aunque exista destino.
   if(d.socialPartner){const partner=d.socialPartner;partner.socialPartner=null;partner.socialUntil=0;if(partner.state==='social'||partner.state==='play')partner.state='idle';}
   d.socialPartner=null;d.socialUntil=0;d.testSocial=false;d.state='idle';d.speed=0;
   d.testClip=name;d.clipName='';d.target=null;d.goal=null;d.running=name==='Run';d.lookUntil=name==='Neck_Look'?performance.now()+5000:0;
   if(name==='Walk'||name==='Run'){
    const radius=(d.length||DINO[d.id].length)*.3,start={x:d.root.position.x,z:d.root.position.z};let found=false,chosen=null;
    // La ruta de prueba debe respetar las mismas colisiones que usa animateDinos.
    // Antes solo se comprobaba el terreno: podía elegir un destino detrás de
    // otro dinosaurio y la locomoción se detenía en el primer fotograma.
    rebuildDinoCollisionGrid();
    for(let k=0;k<64&&!found;k++){
     const angle=k*Math.PI/32,sx=Math.sin(angle),cz=Math.cos(angle);
     for(const distance of [8,7,6,5,4,3]){
      const x=start.x+sx*distance,z=start.z+cz*distance;
      let valid=true;
      for(let travelled=.45;travelled<=distance;travelled+=.45){
       const px=start.x+sx*travelled,pz=start.z+cz*travelled;
       const support=[[px,pz],[px+sx*radius,pz+cz*radius],[px-sx*radius,pz-cz*radius]];
       if(isDinoPositionBlocked(d,px,pz).blocked||!support.every(p=>terrainValidAt(p[0],p[1]))){valid=false;break;}
      }
      if(valid){chosen={x,z,angle};found=true;break;}
     }
    }
    if(found){d.heading=chosen.angle;d.target={x:chosen.x,z:chosen.z};d.goal='test';d.state='walk';d.timer=0;d.running=name==='Run';}
    return {clip:name,movementPathFound:found,position:{x:start.x,y:d.root.position.y,z:start.z},target:chosen?{x:chosen.x,z:chosen.z}:null};
   }
   d.state=name==='Neck_Look'?'look':'idle';d.timer=100;
   return {clip:name,movementPathFound:false,position:{x:d.root.position.x,y:d.root.position.y,z:d.root.position.z}};
  },
  advanceDinoSimulation(frames=8){
   const count=Math.max(1,Math.min(120,Math.floor(frames)||8)),start=performance.now();
   for(let i=0;i<count;i++)animateDinos(start+i*50,.05);
   const d=dinoRoots[0];return {frames:count,position:{x:d.root.position.x,y:d.root.position.y,z:d.root.position.z},state:d.state,speed:d.actualSpeed,lastCollision:d.lastCollision||null};
  }
 };
 if(params.get('debug')!=='1')return;
 const panel=document.createElement('pre');panel.id='huellasPerfDiagnostics';
 Object.assign(panel.style,{position:'fixed',left:'8px',top:'8px',zIndex:'10000',margin:'0',padding:'8px 10px',maxWidth:'min(560px,94vw)',maxHeight:'42vh',overflow:'hidden',borderRadius:'8px',background:'rgba(0,0,0,.78)',color:'#d9ffe7',font:'11px/1.4 monospace',pointerEvents:'none',whiteSpace:'pre-wrap'});
 document.body.appendChild(panel);
 let elapsed=0;scene.onAfterRenderObservable.add(()=>{
  elapsed+=engine.getDeltaTime();if(elapsed<500)return;elapsed=0;
  const d=snapshot(),fmt=v=>v==null?'N/D':v;
  const pos=d.player?d.player.x.toFixed(1)+','+d.player.y.toFixed(1)+','+d.player.z.toFixed(1):'N/D';
  const dinos=d.dinoStates.slice(0,8).map(x=>x.id+':'+x.clip+(x.playing?'▶':'·')).join(' | ');
  panel.textContent='HUELLAS VR · DIAGNÓSTICO\n'+
   'Mundo: '+d.world+' · Calidad: '+d.quality+' · WebGL '+fmt(d.webglVersion)+' · '+d.renderSize.width+'×'+d.renderSize.height+
   '\nFPS: '+d.fps+' · CPU actualización JS: '+d.cpuUpdateMs+' ms (media '+d.cpuUpdateAvgMs+' ms) · frame: '+fmt(d.frameTimeMs)+' ms · render: '+fmt(d.renderTimeMs)+' ms · GPU: '+fmt(d.gpuFrameTimeMs)+' ms'+
   '\nDraw calls: '+fmt(d.drawCalls)+' · Física: '+fmt(d.physicsTimeMs)+' ms · Mallas activas: '+d.activeMeshes+'/'+d.meshes+' · Texturas: '+d.textures+' · Partículas: '+d.particles+' · VRAM: N/D'+
   '\nTerreno: foto '+(d.terrain.photo?'OK':'...')+' / normal '+(d.terrain.normal?'OK':'...')+' · Panorama: '+(d.sky.ready?'OK':'...')+
   '\nHavok: '+(d.physics.enabled?'ON':'OFF')+' · soporte: '+d.physics.support+' · colisionadores: '+d.physics.colliders+' · XR: '+d.xrState+
   '\nJugador xyz: '+pos+' · altura suelo: '+(d.player?d.player.groundY:'N/D')+' · Heap JS: '+(d.heapMB==null?'N/D':d.heapMB+' MB')+
   '\nDinosaurios: '+dinos+'\nCPU subsistemas ms: jugador '+d.cpuStagesMs.player+' / manada '+d.cpuStagesMs.herd+' / dinos '+d.cpuStagesMs.dinosaurs+' / FX '+d.cpuStagesMs.footFx+' / entorno '+d.cpuStagesMs.environment+' / mirada '+d.cpuStagesMs.gaze+' / agua '+d.cpuStagesMs.water+'\nFrame p50/p95/p99: '+fmt(d.frameP50Ms)+' / '+fmt(d.frameP95Ms)+' / '+fmt(d.frameP99Ms)+' ms · 1% low '+fmt(d.fps1PercentLow)+'\nErrores: '+(d.errors.length?d.errors.join(' | '):'ninguno');
 });
}
let initStage='preparación';
async function init(){
 if(!params.has('mundo'))return; // La portada no debe crear una escena 3D ni cargar modelos antes de elegir mundo.
 try{initStage='creación del motor WebGL2';engine=new BABYLON.Engine(canvas,false,{disableWebGL2Support:false,doNotHandleContextLost:false,preserveDrawingBuffer:false,stencil:true,antialias:false,adaptToDeviceRatio:true});if(!engine.webGLVersion||engine.webGLVersion<2)throw new Error('Este dispositivo no ofrece WebGL 2.');
  engine.onContextLostObservable.add(()=>{contextLost=true;lastTime=0;console.warn('WebGL2 perdió el contexto; esperando recuperación del navegador.');});
  engine.onContextRestoredObservable.add(()=>{contextLost=false;lastTime=0;console.info('Contexto WebGL2 restaurado.');});
 scene=new BABYLON.Scene(engine);installDiagnostics();scene.clearColor=new BABYLON.Color4(.65,.76,.77,1);scene.collisionsEnabled=true;scene.fogMode=BABYLON.Scene.FOGMODE_EXP2;scene.fogColor=BABYLON.Color3.FromHexString(WORLD.fog);scene.fogDensity=({atacamatitan:.0020,arackar:.0020,patagonia:.0022,stegouros:.0028,aysen:.0024,valle:.0024}[worldKey]||.0038);
 camera=new BABYLON.UniversalCamera('player-camera',new BABYLON.Vector3(0,1.65,12),scene);camera.rotation.y=Math.PI;camera.minZ=.08;camera.maxZ=320;camera.fov=.92;camera.speed=.35;camera.inertia=.82;camera.angularSensibility=3800;camera.attachControl(canvas,true);camera.keysUp.push(87);camera.keysDown.push(83);camera.keysLeft.push(65);camera.keysRight.push(68);camera.applyGravity=false;camera.checkCollisions=false;camera.ellipsoid=new BABYLON.Vector3(.35,.85,.35);
 initStage='terreno y mapa de altura';setProgress(.08,'Creando el paisaje…');initStage='carga del panorama '+WORLD.sky;await addSky();addSkyLife();addLighting();await addTerrain();camera.position.y=1.65+terrainHeightAt(0,12);initStage='inicialización de Havok Physics V2';await initPhysics();initDinoFootFX();addWater();addSandBars();addMountains();initStage='carga de dinosaurios';setProgress(.2,'Cargando dinosaurios…');
 const ids=WORLD.dinos,totalDinos=10,basePerSpecies=Math.floor(totalDinos/ids.length),extraDinos=totalDinos%ids.length;let loadedDinos=0;for(let speciesIndex=0;speciesIndex<ids.length;speciesIndex++){const id=ids[speciesIndex],herdSize=basePerSpecies+(speciesIndex<extraDinos?1:0);for(let n=0;n<herdSize;n++){initStage='dinosaurio '+id+' ('+(n+1)+'/'+herdSize+')';await spawnDino(id,n,herdSize,null);loadedDinos++;setProgress(.2+.53*loadedDinos/totalDinos,'Cargando '+DINO[id].name+' · '+loadedDinos+'/'+totalDinos+'…');}}
 initStage='vegetación y modelos ambientales';setProgress(.76,'Poblando el paisaje…');await addVegetation();buildEnvironmentCollisionGrid();initStage='bosques y atmósfera';addForest3D();setProgress(.9,'Preparando atmósfera e iluminación…');addParticles();addVisualPipeline();bindControls();scene.onBeforeRenderObservable.add(()=>{const now=performance.now(),debugPerf=params.get('debug')==='1',updateStart=now,dt=Math.min(.05,(now-lastTime)/1000||0);lastTime=now;if(debugPerf){if(lastPerfFrameAt){frameTimeSamples.push(now-lastPerfFrameAt);if(frameTimeSamples.length>300)frameTimeSamples.shift();}lastPerfFrameAt=now;}let stage=updateStart;movePlayer(dt);if(debugPerf){let mark=performance.now();cpuStageMs.player=mark-stage;stage=mark;}updateHerdMode(dt);if(debugPerf){let mark=performance.now();cpuStageMs.herd=mark-stage;stage=mark;}animateDinos(now,dt);if(debugPerf){let mark=performance.now();cpuStageMs.dinosaurs=mark-stage;stage=mark;}updateDinoFootFX(dt);if(debugPerf){let mark=performance.now();cpuStageMs.footFx=mark-stage;stage=mark;}updateEnvironment(dt);if(debugPerf){let mark=performance.now();cpuStageMs.environment=mark-stage;stage=mark;}updateXRGaze();if(debugPerf){let mark=performance.now();cpuStageMs.gaze=mark-stage;stage=mark;}for(const item of waterTextures)item.tex.uOffset=(item.tex.uOffset+dt*item.speed+1)%1;if(debugPerf){let mark=performance.now();cpuStageMs.water=mark-stage;}cpuUpdateMs=performance.now()-updateStart;cpuUpdateAvgMs+=(cpuUpdateMs-cpuUpdateAvgMs)*.08;if(debugPerf)cpuStageMs.total=cpuUpdateMs;});
 renderLoop=()=>{if(!contextLost&&scene&&scene.activeCamera)scene.render();};if(!renderLoopStarted){engine.runRenderLoop(renderLoop);renderLoopStarted=true;}
 initStage='espera de texturas, shaders y materiales del mundo';setProgress(.96,'Finalizando texturas, iluminación y materiales…');await scene.whenReadyAsync();const frozenEnvironmentMeshes=freezeStaticEnvironmentTransforms();console.info('[Huellas VR] Transformaciones estáticas congeladas:',frozenEnvironmentMeshes);
  document.addEventListener('visibilitychange',()=>{const inXR=xr?.baseExperience?.state===BABYLON.WebXRState.IN_XR;if(document.hidden&&!inXR){if(!renderPausedForVisibility){engine.stopRenderLoop(renderLoop);renderPausedForVisibility=true;}audioContext?.suspend?.().catch(()=>{});}else{lastTime=0;if(renderPausedForVisibility){engine.runRenderLoop(renderLoop);renderPausedForVisibility=false;}if(audioContext?.state==='suspended')audioContext.resume().catch(()=>{});}});
  window.addEventListener('pagehide',()=>{if(xr?.baseExperience?.state!==BABYLON.WebXRState.IN_XR)audioContext?.suspend?.().catch(()=>{});});window.addEventListener('pageshow',()=>{lastTime=0;if(!document.hidden&&renderPausedForVisibility){engine.runRenderLoop(renderLoop);renderPausedForVisibility=false;}});
  window.addEventListener('resize',()=>engine.resize());setProgress(1,'¡Mundo listo!');$('startButtons').classList.remove('hidden');
 }catch(err){console.error('Fallo al iniciar Huellas VR en '+initStage,err);const detail=String(err?.stack||err?.message||err).split('\n').slice(0,6).join('\n');$('loadText').style.whiteSpace='pre-wrap';$('loadText').textContent='No se pudo iniciar el mundo ['+initStage+']: '+(err?.message||String(err))+'\n'+detail;$('startButtons').classList.remove('hidden');$('explore').textContent='Volver al inicio';$('visor').disabled=true;$('explore').onclick=()=>{location.href=location.pathname;};}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
