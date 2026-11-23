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
 valle:{title:'Valle de Huellas',sky:'img/valle.jpg',ground:'img/valle_c.jpg',height:'img/valle_h.png',fog:'#a99b7d',hemi:'#d9e7d5',sun:'#fff0cf',dinos:['atacamatitan','arackar','gonkoken','chilesaurus','stegouros'],trees:30,ferns:28,rocks:30,water:'river'},
 atacamatitan:{title:'Atacamatitan · Formación Tolar',sky:'img/atacamatitan_sky.jpg',ground:'img/atacamatitan_c.jpg',height:'img/atacamatitan_h.png',fog:'#c99b70',hemi:'#ffe8cb',sun:'#fff0cf',dinos:['atacamatitan'],trees:7,ferns:20,rocks:46,water:'braided'},
 arackar:{title:'Arackar · Formación Hornitos',sky:'img/arackar_sky.jpg',ground:'img/arackar_c.jpg',height:'img/arackar_h.png',fog:'#c7a27c',hemi:'#ffe2c0',sun:'#ffd59a',dinos:['arackar'],trees:12,ferns:36,rocks:35,water:'lagoon'},
 patagonia:{title:'Gonkoken · Formación Dorotea',sky:'img/gonkoken_sky.jpg',ground:'img/gonkoken_c.jpg',height:'img/gonkoken_h.png',fog:'#aebfc0',hemi:'#e3eee8',sun:'#f5f4e9',dinos:['gonkoken'],trees:48,ferns:65,rocks:18,water:'estuary'},
 stegouros:{title:'Stegouros · Formación Dorotea',sky:'img/stegouros_sky.jpg',ground:'img/stegouros_c.jpg',height:'img/stegouros_h.png',fog:'#a8b59b',hemi:'#e5f0d7',sun:'#fff0d0',dinos:['stegouros'],trees:70,ferns:90,rocks:16,water:'stream'},
 aysen:{title:'Chilesaurus · Formación Toqui',sky:'img/aysen_sky.jpg',ground:'img/aysen_c.jpg',height:'img/aysen_h.png',fog:'#a2aaad',hemi:'#d9e0df',sun:'#f1ead9',dinos:['chilesaurus'],trees:34,ferns:60,rocks:30,water:'braided'}
};
const requested = (params.get('mundo') || 'valle').toLowerCase();
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
 const size=worldKey==='valle'?210:180;
 const opts={width:size,height:size,subdivisions:Math.round(90*Q),minHeight:-1.2,maxHeight:2.4};
 if(WORLD.height){ground=BABYLON.MeshBuilder.CreateGroundFromHeightMap('terrain',WORLD.height,{...opts,onReady:mesh=>{mesh.position.y=-.15;}} ,scene);} 
 if(!ground) ground=BABYLON.MeshBuilder.CreateGround('terrain',{width:size,height:size,subdivisions:Math.round(80*Q)},scene);
 const m=new BABYLON.StandardMaterial('terrain-material',scene);m.diffuseTexture=new BABYLON.Texture(WORLD.ground,scene);m.diffuseTexture.uScale=12;m.diffuseTexture.vScale=12;m.specularColor=new BABYLON.Color3(.04,.04,.04);m.roughness=.96;ground.material=m;ground.checkCollisions=true;ground.isPickable=true;ground.metadata={ground:true};pickables.push(ground);
 const detail=new BABYLON.StandardMaterial('near-earth',scene);detail.diffuseTexture=new BABYLON.Texture(worldKey==='stegouros'?'img/tx_leaves_d.jpg':worldKey==='atacamatitan'?'img/tex_sand_d.jpg':'img/tx_dirt_d.jpg',scene);detail.diffuseTexture.uScale=26;detail.diffuseTexture.vScale=26;
 // Suelo secundario cercano con material de textura de alta frecuencia para reforzar detalle.
 const near=BABYLON.MeshBuilder.CreateGround('near-ground',{width:46,height:46,subdivisions:32},scene);near.position.y=.015;near.material=detail;near.isPickable=true;near.metadata={ground:true};pickables.push(near);
}
function addLighting(){const hemi=new BABYLON.HemisphericLight('ambient',new BABYLON.Vector3(0,1,0),scene);hemi.diffuse=BABYLON.Color3.FromHexString(WORLD.hemi);hemi.groundColor=new BABYLON.Color3(.22,.2,.17);hemi.intensity=.82;const sun=new BABYLON.DirectionalLight('sun',new BABYLON.Vector3(-.5,-1,.35),scene);sun.position=new BABYLON.Vector3(-35,55,-20);sun.diffuse=BABYLON.Color3.FromHexString(WORLD.sun);sun.intensity=.9;scene.environmentIntensity=.7;}
function addWater(){
 const color=worldKey==='arackar'?'#379fa4':worldKey==='atacamatitan'?'#779c9a':worldKey==='aysen'?'#587c88':'#477f78';
 const positions=worldKey==='arackar'?[[8,-27,21,13]]:worldKey==='patagonia'?[[0,-32,55,10]]:[[3,-19,46,5],[20,-30,32,4],[-22,-37,26,3]];
 positions.forEach((p,i)=>{const w=BABYLON.MeshBuilder.CreateGround('water-'+i,{width:p[2],height:p[3],subdivisions:24},scene);w.position.set(p[0],.06+i*.003,p[1]);const wm=new BABYLON.StandardMaterial('water-mat-'+i,scene);wm.diffuseColor=BABYLON.Color3.FromHexString(color);wm.emissiveColor=BABYLON.Color3.FromHexString(color).scale(.12);wm.specularColor=new BABYLON.Color3(.65,.75,.8);wm.alpha=.82;wm.roughness=.16;w.material=wm;w.isPickable=false;});
}
async function loadContainer(path){if(assetCache.has(path))return assetCache.get(path);const p=BABYLON.SceneLoader.LoadAssetContainerAsync('',path,scene);assetCache.set(path,p);return p;}
function fitRoot(root,targetLength){const meshes=root.getChildMeshes(false);let min=new BABYLON.Vector3(Infinity,Infinity,Infinity),max=new BABYLON.Vector3(-Infinity,-Infinity,-Infinity);meshes.forEach(m=>{m.computeWorldMatrix(true);const b=m.getBoundingInfo().boundingBox;min=BABYLON.Vector3.Minimize(min,b.minimumWorld);max=BABYLON.Vector3.Maximize(max,b.maximumWorld);});const span=max.x-min.x||max.z-min.z||1;const scale=targetLength/span;root.scaling.setAll(scale);root.position.y-=min.y*scale;}
async function spawnDino(id,index,total,center){const data=DINO[id];const path=quality==='baja'?data.low:data.file;let container;try{container=await loadContainer(path);}catch(e){if(path!==data.file)container=await loadContainer(data.file);else throw e;}
 const root=new BABYLON.TransformNode('dino-'+id+'-'+index,scene);const instances=container.instantiateModelsToScene(n=>n+'-'+index,false,{doNotInstantiate:true});instances.rootNodes.forEach(n=>n.parent=root);instances.animationGroups.forEach(a=>{a.start(true);animationGroups.push(a);});root.metadata={dinoId:id};fitRoot(root,data.length*(index===0?1:0.72+rand(index+2)*.22));
 const angle=total===1?Math.PI:((index/total)*Math.PI*2);const radius=total===1?12:8+rand(index+9)*8;root.position.x=(center?.x||0)+Math.cos(angle)*radius;root.position.z=(center?.z||-15)+Math.sin(angle)*radius;root.rotation.y=data.flip?Math.PI:Math.PI*.5;root.getChildMeshes().forEach(m=>{m.isPickable=true;m.metadata={...(m.metadata||{}),dinoId:id};pickables.push(m);});dinoRoots.push({root,id,phase:rand(index+4)*6.28,origin:root.position.clone(),radius:1.5+rand(index+8)*2});return root;
}
async function addVegetation(){
 const specs=[];if(WORLD.trees){specs.push([worldKey==='atacamatitan'||worldKey==='arackar'?'models/veg/araucaria_joven.glb':'models/veg/araucaria_adulta.glb',WORLD.trees]);}if(WORLD.ferns)specs.push(['models/veg/fern_tripo.glb',WORLD.ferns]);if(WORLD.rocks)specs.push(['models/env/rock_07.glb',WORLD.rocks]);
 for(const [file,count] of specs){let c;try{c=await loadContainer(file);}catch(e){continue;}const n=Math.max(5,Math.round(count*Q));for(let i=0;i<n;i++){const group=c.instantiateModelsToScene(s=>s+'-env-'+file.replace(/\W/g,'')+'-'+i,false,{doNotInstantiate:true});const root=new BABYLON.TransformNode('env-'+i,scene);group.rootNodes.forEach(x=>x.parent=root);const a=rand(i+file.length),b=rand(i+file.length+51),angle=a*Math.PI*2,dist=11+b*69;root.position.set(Math.cos(angle)*dist,0,Math.sin(angle)*dist-18);const scale=file.includes('araucaria')?3.2+rand(i+2)*3.8:file.includes('fern')?.8+rand(i+3)*.9:.5+rand(i+7)*1.4;root.scaling.setAll(scale);root.rotation.y=rand(i+99)*Math.PI*2;root.getChildMeshes().forEach(m=>{m.isPickable=false;});}}
}
function addMountains(){const color=worldKey==='atacamatitan'||worldKey==='arackar'?'#a75d3e':worldKey==='aysen'?'#9ba9b1':'#536b57';const material=mat('distant-rock',color);for(let i=0;i<18;i++){const a=i/18*Math.PI*2;const h=12+rand(i+77)*28;const rock=BABYLON.MeshBuilder.CreateCylinder('ridge-'+i,{height:h,diameterTop:1,diameterBottom:18+rand(i+3)*12,tessellation:5},scene);rock.position.set(Math.cos(a)*82,h/2-1,Math.sin(a)*82-15);rock.rotation.z=(rand(i+4)-.5)*.22;rock.material=material;rock.isPickable=false;}}
function addParticles(){const p=new BABYLON.ParticleSystem('ambient-dust',700,scene);p.particleTexture=new BABYLON.Texture('https://assets.babylonjs.com/textures/flare.png',scene);p.emitter=new BABYLON.Vector3(0,2,-15);p.minEmitBox=new BABYLON.Vector3(-42,0,-42);p.maxEmitBox=new BABYLON.Vector3(42,15,42);p.color1=new BABYLON.Color4(.9,.78,.55,.25);p.color2=new BABYLON.Color4(.7,.85,.75,.12);p.minSize=.025;p.maxSize=.11;p.minLifeTime=5;p.maxLifeTime=12;p.emitRate=quality==='baja'?10:32;p.direction1=new BABYLON.Vector3(-.1,.1,-.1);p.direction2=new BABYLON.Vector3(.1,.3,.1);p.minEmitPower=.05;p.maxEmitPower=.3;p.updateSpeed=.01;p.start();}
function showInfo(id){const d=DINO[id];if(!d)return;$('infoTitle').textContent=d.name;$('infoBody').textContent=d.text;$('info').classList.remove('hidden');}
function closeInfo(){$('info').classList.add('hidden');}
function onPick(evt){if(!evt.hit||!evt.pickedMesh)return;let m=evt.pickedMesh;while(m&&!m.metadata?.dinoId&&!m.metadata?.ground)m=m.parent;if(m?.metadata?.dinoId){showInfo(m.metadata.dinoId);return;}if(m?.metadata?.ground&&evt.pickedPoint){target=evt.pickedPoint.clone();moving=true;}}
function movePlayer(dt){if(!moving||!target||xr?.baseExperience?.state===BABYLON.WebXRState.IN_XR)return;const dest=new BABYLON.Vector3(target.x,1.65,target.z);dest.y=1.65;const delta=dest.subtract(camera.position);delta.y=0;const len=delta.length();if(len<.45){moving=false;return;}delta.normalize();camera.position.addInPlace(delta.scale(Math.min(len,dt*4.5)));}
function animateDinos(t){dinoRoots.forEach(d=>{const s=t*.00022+d.phase;d.root.position.x=d.origin.x+Math.sin(s)*d.radius;d.root.position.z=d.origin.z+Math.cos(s*.73)*d.radius*.7;const dx=Math.cos(s)*d.radius, dz=-Math.sin(s*.73)*d.radius*.7;if(Math.abs(dx)+Math.abs(dz)>.02)d.root.rotation.y=Math.atan2(dx,dz)+(DINO[d.id].flip?Math.PI:0);});}
async function enterXR(){try{if(!navigator.xr){$('sensorNotice').classList.remove('hidden');return;}if(!xr)xr=await scene.createDefaultXRExperienceAsync({uiOptions:{sessionMode:'immersive-vr',referenceSpaceType:'local-floor',customButtons:[]},disableTeleportation:true});await xr.baseExperience.enterXRAsync('immersive-vr','local-floor');}catch(e){console.warn('WebXR no disponible',e);$('sensorNotice').classList.remove('hidden');}}
function bindControls(){scene.onPointerObservable.add(pi=>{if(pi.type===BABYLON.PointerEventTypes.POINTERPICK)onPick(pi.pickInfo);});canvas.addEventListener('pointerdown',()=>{if(camera.inputs.attached.pointers){}},{passive:true});$('explore').onclick=()=>startExperience(false);$('visor').onclick=()=>startExperience(true);$('vrButton').onclick=enterXR;$('closeInfo').onclick=closeInfo;$('timeButton').onclick=()=>{night=!night;scene.ambientColor=night?new BABYLON.Color3(.12,.16,.25):new BABYLON.Color3(.3,.3,.3);$('timeButton').textContent=night?'🌙':'☀️';};$('rainButton').onclick=()=>{raining=!raining;$('rainButton').textContent=raining?'🌧️':'🌧';if(raining){if(!rainSystem){rainSystem=new BABYLON.ParticleSystem('rain',1800,scene);rainSystem.particleTexture=new BABYLON.Texture('https://assets.babylonjs.com/textures/flare.png',scene);rainSystem.emitter=new BABYLON.Vector3(0,18,-10);rainSystem.minEmitBox=new BABYLON.Vector3(-55,0,-55);rainSystem.maxEmitBox=new BABYLON.Vector3(55,0,55);rainSystem.color1=new BABYLON.Color4(.65,.75,.9,.5);rainSystem.color2=new BABYLON.Color4(.8,.85,1,.35);rainSystem.minSize=.025;rainSystem.maxSize=.05;rainSystem.minLifeTime=1;rainSystem.maxLifeTime=2;rainSystem.emitRate=1200;rainSystem.direction1=new BABYLON.Vector3(0,-1,0);rainSystem.direction2=new BABYLON.Vector3(.2,-1,.2);rainSystem.minEmitPower=8;rainSystem.maxEmitPower=13;}rainSystem.start();}else rainSystem?.stop();};$('soundButton').onclick=()=>{soundOn=!soundOn;$('soundButton').textContent=soundOn?'🔊':'🔇';};$('qualityButton').onclick=()=>{const next=quality==='alta'?'media':quality==='media'?'baja':'alta';location.search=new URLSearchParams({...Object.fromEntries(params),q:next}).toString();};$('retrySensors').onclick=()=>enterXR();$('continueTouch').onclick=()=>{$('sensorNotice').classList.add('hidden');};}
async function startExperience(withVR){$('loader').style.opacity='0';setTimeout(()=>$('loader').classList.add('hidden'),750);$('hud').classList.remove('hidden');$('worldLabel').textContent=WORLD.title;if(withVR)await enterXR();}
async function init(){
 try{engine=new BABYLON.Engine(canvas,true,{disableWebGL2Support:false,doNotHandleContextLost:false,preserveDrawingBuffer:false,stencil:true,antialias:true,adaptToDeviceRatio:true});if(!engine.webGLVersion||engine.webGLVersion<2)throw new Error('Este dispositivo no ofrece WebGL 2.');
 scene=new BABYLON.Scene(engine);scene.clearColor=new BABYLON.Color4(.65,.76,.77,1);scene.collisionsEnabled=true;scene.fogMode=BABYLON.Scene.FOGMODE_EXP2;scene.fogColor=BABYLON.Color3.FromHexString(WORLD.fog);scene.fogDensity=.0038;
 camera=new BABYLON.UniversalCamera('player-camera',new BABYLON.Vector3(0,1.65,12),scene);camera.minZ=.08;camera.maxZ=320;camera.fov=.92;camera.speed=.35;camera.inertia=.82;camera.angularSensibility=3800;camera.attachControl(canvas,true);camera.keysUp.push(87);camera.keysDown.push(83);camera.keysLeft.push(65);camera.keysRight.push(68);camera.applyGravity=false;camera.checkCollisions=true;camera.ellipsoid=new BABYLON.Vector3(.35,.85,.35);
 setProgress(.08,'Creando el paisaje…');addSky();addLighting();addTerrain();addWater();addMountains();setProgress(.2,'Cargando dinosaurios…');
 const ids=WORLD.dinos;for(let i=0;i<ids.length;i++){await spawnDino(ids[i],i,ids.length,worldKey==='valle'?{x:0,z:-12}:null);setProgress(.2+.53*(i+1)/ids.length,'Cargando '+DINO[ids[i]].name+'…');}
 setProgress(.76,'Poblando el paisaje…');await addVegetation();setProgress(.9,'Preparando atmósfera…');addParticles();bindControls();scene.onBeforeRenderObservable.add(()=>{const now=performance.now(),dt=Math.min(.05,(now-lastTime)/1000||0);lastTime=now;movePlayer(dt);animateDinos(now);});
 engine.runRenderLoop(()=>{if(scene&&scene.activeCamera)scene.render();});window.addEventListener('resize',()=>engine.resize());setProgress(1,'¡Mundo listo!');$('startButtons').classList.remove('hidden');
 }catch(err){console.error(err);$('loadText').textContent='No se pudo iniciar el mundo: '+err.message;$('startButtons').classList.remove('hidden');$('explore').onclick=()=>location.reload();}
}
window.addEventListener('DOMContentLoaded',init);
})();
