/* Huellas VR · vegetación procedural nativa Babylon.js 9.37.2
 * Geometría generada en CPU una vez por mundo; render masivo con Thin Instances.
 * No requiere Blender, plugins externos ni recursos descargados.
 */
(() => {
 'use strict';
 const B=window.BABYLON;
 if(!B)return;
 const PROFILES={
  atacamatitan:{grass:0,ferns:28,shrubs:12,grassColor:'#9b8b55',leafColor:'#78834c',fernColor:'#78834c'},
  arackar:{grass:0,ferns:42,shrubs:20,grassColor:'#a49a63',leafColor:'#71814c',fernColor:'#71814c'},
  patagonia:{grass:90,ferns:54,shrubs:34,grassColor:'#81934f',leafColor:'#496e43',fernColor:'#547b48'},
  stegouros:{grass:110,ferns:72,shrubs:42,grassColor:'#819b58',leafColor:'#527647',fernColor:'#60884d'},
  aysen:{grass:125,ferns:80,shrubs:48,grassColor:'#718b50',leafColor:'#426d45',fernColor:'#527b4b'},
  valle:{grass:80,ferns:40,shrubs:24,grassColor:'#819451',leafColor:'#527548',fernColor:'#63854c'}
 };
 const hex=c=>B.Color3.FromHexString(c);
 function material(name,color,scene,alpha=1){
  const m=new B.StandardMaterial(name,scene);m.diffuseColor=hex(color);m.emissiveColor=hex(color).scale(.075);
  m.specularColor=new B.Color3(.025,.035,.02);m.roughness=1;m.backFaceCulling=false;m.alpha=alpha;
  return m;
 }
 function bladeGeometry(scene,name,width,height){
  const mesh=new B.Mesh(name,scene),v=new B.VertexData();
  v.positions=[-width/2,0,0,width/2,0,0,0,height,0, -width*.16,height*.62,0,width*.16,height*.62,0,0,height,0];
  v.indices=[0,1,2,3,4,5];v.normals=[];B.VertexData.ComputeNormals(v.positions,v.indices,v.normals);v.applyToMesh(mesh,true);
  mesh.isVisible=false;mesh.isPickable=false;return mesh;
 }
 function fernGeometry(scene){
  const mesh=new B.Mesh('procedural-fern-frond-geometry',scene),p=[0,0,0],idx=[];
  // Raquis central y; foliolos lanceolados a ambos lados, formando una fronda reconocible.
  for(let k=0;k<=8;k++)p.push(0,.16+k*.115,0);
  for(let k=0;k<8;k++){const y=.22+k*.105,w=.22*(1-k/11);
   const base=1+k;const left=p.length/3;p.push(-w,y,0,0,y+.075,0);
   const right=p.length/3;p.push(w,y,0,0,y+.075,0);
   idx.push(base,left,left+1,base,right,right+1);
  }
  for(let k=0;k<8;k++)idx.push(0,1+k,2+k);
  const v=new B.VertexData();v.positions=p;v.indices=idx;v.normals=[];B.VertexData.ComputeNormals(p,idx,v.normals);v.applyToMesh(mesh,true);
  mesh.isVisible=false;mesh.isPickable=false;return mesh;
 }
 function matrices(points,scaleFn){
  return points.map((p,i)=>{
   const s=scaleFn(i),q=B.Quaternion.RotationYawPitchRoll(p.yaw||0,0,p.tilt||0);
   return B.Matrix.Compose(new B.Vector3(s.x,s.y,s.z),q,new B.Vector3(p.x,p.y,p.z));
  });
 }
 function place(count,seed,opts,api){
  const out=[];let state=seed>>>0;
  const rnd=()=>{state=(state*1664525+1013904223)>>>0;return state/4294967296;};
  for(let tries=0;out.length<count&&tries<count*35+100;tries++){
   const a=rnd()*Math.PI*2,r=opts.min+Math.sqrt(rnd())*(opts.max-opts.min);
   const x=Math.cos(a)*r,z=Math.sin(a)*r;
   if(!api.terrainValidAt(x,z))continue;
   if(api.waterDistanceAt&&api.waterDistanceAt(x,z)<(opts.water||1))continue;
   if(Math.hypot(x-api.home.x,z-api.home.z)<(opts.keep||8))continue;
   out.push({x,y:api.terrainHeightAt(x,z),z,yaw:rnd()*Math.PI*2,tilt:(rnd()-.5)*.18});
  }
  return out;
 }
 function thin(mesh,points,material,name,scaleFn){
  if(!points.length){mesh.dispose();return 0;}
  mesh.name=name;mesh.material=material;mesh.isVisible=true;mesh.isPickable=false;mesh.checkCollisions=false;
  mesh.thinInstanceSetBuffer('matrix',new Float32Array(matrices(points,scaleFn).flatMap(m=>Array.from(m.m))),16,true);
  mesh.thinInstanceRefreshBoundingInfo(true);return points.length;
 }

 // Viento por vértices en GPU: modifica únicamente las hojas y frondas.
 // Funciona sobre StandardMaterial mediante el sistema oficial MaterialPluginBase.
 class VegetationWindPlugin extends B.MaterialPluginBase{
  constructor(mat,strength){
   super(mat,'HuellasVegetationWind',180,{HUELLAS_VEGETATION_WIND:false});
   this.strength=strength;this._enable(true);
  }
  getClassName(){return 'HuellasVegetationWindPlugin';}
  isCompatible(language){return language===B.ShaderLanguage.GLSL;}
  prepareDefines(defines){defines.HUELLAS_VEGETATION_WIND=true;}
  getUniforms(){
   return {ubo:[{name:'huellasWindTime',size:1,type:'float'},{name:'huellasWindStrength',size:1,type:'float'}],
    vertex:`uniform float huellasWindTime;
uniform float huellasWindStrength;`};
  }
  bindForSubMesh(ubo){
   ubo.updateFloat('huellasWindTime',performance.now()*.001);
   ubo.updateFloat('huellasWindStrength',this.strength);
  }
  getCustomCode(type,language){
   if(type!=='vertex'||language!==B.ShaderLanguage.GLSL)return null;
   return {
    CUSTOM_VERTEX_UPDATE_POSITION:`
     float huellasWindPhase = huellasWindTime + positionUpdated.y * 2.7 + positionUpdated.x * 1.3;
     float huellasWindMask = clamp(positionUpdated.y / 1.2, 0.0, 1.0);
     positionUpdated.x += sin(huellasWindPhase) * 0.075 * huellasWindStrength * huellasWindMask;
     positionUpdated.z += cos(huellasWindPhase * 0.73) * 0.035 * huellasWindStrength * huellasWindMask;
    `
   };
  }
 }
 function enableWind(mat,strength){
  if(!B.MaterialPluginBase||!B.ShaderLanguage)return false;
  try{new VegetationWindPlugin(mat,strength);return true;}
  catch(error){console.warn('[Huellas VR] Viento GPU no disponible para este material:',error);return false;}
 }
 function create(api){
  const scene=api.scene,profile=PROFILES[api.worldKey]||PROFILES.valle;
  if(!scene||!api.terrainHeightAt||!api.terrainValidAt)return {created:false,reason:'scene-or-terrain-api-missing'};
  const root=new B.TransformNode('procedural-vegetation-'+api.worldKey,scene);
  let total=0;
  const grassMat=material('procedural-grass-material-'+api.worldKey,profile.grassColor,scene);
  const fernMat=material('procedural-fern-material-'+api.worldKey,profile.fernColor,scene);
  const leafMat=material('procedural-shrub-leaf-material-'+api.worldKey,profile.leafColor,scene);
  // Textura procedural de relieve generada por Babylon.js (sin imágenes externas).
  let surfaceTexture=null;
  if(typeof B.NoiseProceduralTexture==='function'){
   try{
    surfaceTexture=new B.NoiseProceduralTexture('huellas-vegetation-noise-'+api.worldKey,128,scene);
    surfaceTexture.octaves=3;surfaceTexture.persistence=2;surfaceTexture.brightness=.16;
    surfaceTexture.animationSpeedFactor=0;surfaceTexture.refreshRate=0;
    [grassMat,fernMat,leafMat].forEach(m=>{m.bumpTexture=surfaceTexture;m.bumpTexture.level=.09;});
   }catch(error){surfaceTexture=null;console.warn('[Huellas VR] Textura procedural de relieve no disponible:',error);}
  }
  const windStrength=profile.wind??1;
  const windReady=[grassMat,fernMat,leafMat].map(m=>enableWind(m,windStrength)).filter(Boolean).length;

  const grassGeo=bladeGeometry(scene,'procedural-grass-blade-geo',.105,.72);
  const fernGeo=fernGeometry(scene);
  const shrubGeo=bladeGeometry(scene,'procedural-shrub-leaf-geo',.34,.92);
  [grassGeo,fernGeo,shrubGeo].forEach(m=>m.parent=root);
  const seed=({atacamatitan:711,arackar:827,patagonia:941,stegouros:1061,aysen:1181,valle:1297}[api.worldKey]||1297);
  const grass=place(profile.grass,seed,{min:7,max:49,water:1.1,keep:7},api);
  const ferns=place(profile.ferns,seed+101,{min:8,max:63,water:1.8,keep:7},api);
  const shrubs=place(profile.shrubs,seed+211,{min:14,max:75,water:2.2,keep:10},api);
  total+=thin(grassGeo,grass,grassMat,'procedural-grass-thin-'+api.worldKey,i=>{const h=.35+(i%7)*.065;return{x:.7+(i%3)*.12,y:h,z:.7+(i%3)*.12};});
  total+=thin(fernGeo,ferns,fernMat,'procedural-fern-thin-'+api.worldKey,i=>{const h=.75+(i%5)*.14;return{x:h,y:h,z:h};});
  total+=thin(shrubGeo,shrubs,leafMat,'procedural-shrub-thin-'+api.worldKey,i=>{const h=.8+(i%4)*.16;return{x:h,y:h,z:h};});
  // Las copias de malla usan geometría/material compartidos; sin cuerpos Havok por hoja.
  return {created:true,total,grass:grass.length,ferns:ferns.length,shrubs:shrubs.length,windMaterials:windReady,proceduralBump:!!surfaceTexture,root};
 }
 window.HuellasProceduralVegetation={create,profiles:PROFILES};
})();