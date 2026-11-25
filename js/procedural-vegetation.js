/* Huellas VR · vegetación procedural nativa Babylon.js 9.37.2
 * Geometría generada en CPU una vez por mundo; render masivo con Thin Instances.
 * No requiere Blender, plugins externos ni recursos descargados.
 */
(() => {
 'use strict';
 const B=window.BABYLON;
 if(!B)return;
 const PROFILES={
  atacamatitan:{trees:18,grass:0,ferns:28,shrubs:12,wind:.42,grassColor:'#9b8b55',leafColor:'#78834c',fernColor:'#78834c'},
  arackar:{trees:22,grass:0,ferns:42,shrubs:20,wind:.58,grassColor:'#a49a63',leafColor:'#71814c',fernColor:'#71814c'},
  patagonia:{trees:42,grass:90,ferns:54,shrubs:34,wind:.82,grassColor:'#81934f',leafColor:'#496e43',fernColor:'#547b48'},
  stegouros:{trees:48,grass:110,ferns:72,shrubs:42,wind:.74,grassColor:'#819b58',leafColor:'#527647',fernColor:'#60884d'},
  aysen:{trees:55,grass:125,ferns:80,shrubs:48,wind:.92,grassColor:'#718b50',leafColor:'#426d45',fernColor:'#527b4b'},
  valle:{trees:30,grass:80,ferns:40,shrubs:24,wind:.68,grassColor:'#819451',leafColor:'#527548',fernColor:'#63854c'}
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

 // Árboles low-poly nativos: tronco, ramas y copas compuestos en una sola geometría.
 function appendCylinder(out,base,tip,r0,r1,segments=6){
  const axis=tip.subtract(base),len=axis.length();if(len<.001)return;
  const dir=axis.scale(1/len),u=B.Vector3.Cross(dir,Math.abs(dir.y)<.9?B.Axis.Y:B.Axis.X).normalize(),v=B.Vector3.Cross(dir,u).normalize();
  const start=out.p.length/3;
  for(let j=0;j<2;j++)for(let i=0;i<segments;i++){
   const a=i/segments*Math.PI*2,rad=j?r1:r0,center=j?tip:base;
   const pt=center.add(u.scale(Math.cos(a)*rad)).add(v.scale(Math.sin(a)*rad));
   out.p.push(pt.x,pt.y,pt.z);
  }
  for(let i=0;i<segments;i++){const n=(i+1)%segments;out.idx.push(start+i,start+n,start+segments+i,start+n,start+segments+n,start+segments+i);}
 }
 function appendCrown(out,center,radii,segments=7,rings=4){
  const start=out.p.length/3;
  for(let y=0;y<=rings;y++){
   const phi=Math.PI*y/rings;
   for(let x=0;x<segments;x++){
    const theta=2*Math.PI*x/segments;
    out.p.push(center.x+radii.x*Math.sin(phi)*Math.cos(theta),center.y+radii.y*Math.cos(phi),center.z+radii.z*Math.sin(phi)*Math.sin(theta));
   }
  }
  for(let y=0;y<rings;y++)for(let x=0;x<segments;x++){
   const a=start+y*segments+x,b=start+y*segments+(x+1)%segments,d=start+(y+1)*segments+x,e=start+(y+1)*segments+(x+1)%segments;
   out.idx.push(a,d,b,b,d,e);
  }
 }
 function buildTreePart(scene,name,out){
  const mesh=new B.Mesh(name,scene),vd=new B.VertexData();vd.positions=out.p;vd.indices=out.idx;vd.normals=[];
  B.VertexData.ComputeNormals(vd.positions,vd.indices,vd.normals);vd.applyToMesh(mesh,true);mesh.isVisible=false;mesh.isPickable=false;return mesh;
 }
 function treeGeometry(scene,name,detail){
  const wood={p:[],idx:[]},foliage={p:[],idx:[]},height=detail?5.4:4.6;
  appendCylinder(wood,new B.Vector3(0,0,0),new B.Vector3(0,height*.76,0),detail?.32:.28,.12,detail?7:5);
  if(detail){
   for(let i=0;i<5;i++){
    const a=i*Math.PI*2/5+.25,y=height*(.34+i*.075),len=1.05-i*.09;
    const base=new B.Vector3(0,y,0),tip=new B.Vector3(Math.cos(a)*len,y+.7,Math.sin(a)*len);
    appendCylinder(wood,base,tip,.105,.035,5);
    appendCrown(foliage,tip,new B.Vector3(.62,.48,.62),7,4);
   }
   appendCrown(foliage,new B.Vector3(0,height*.78,0),new B.Vector3(1.12,1.05,1.12),8,5);
  }else{
   appendCrown(foliage,new B.Vector3(0,height*.78,0),new B.Vector3(.95,1.15,.95),6,3);
  }
  return {wood:buildTreePart(scene,name+'-wood',wood),foliage:buildTreePart(scene,name+'-foliage',foliage)};
 }
 function create(api){
  const scene=api.scene,profile=PROFILES[api.worldKey]||PROFILES.valle;
  if(!scene||!api.terrainHeightAt||!api.terrainValidAt)return {created:false,reason:'scene-or-terrain-api-missing'};
  const root=new B.TransformNode('procedural-vegetation-'+api.worldKey,scene);
  let total=0;
  const grassMat=material('procedural-grass-material-'+api.worldKey,profile.grassColor,scene);
  const fernMat=material('procedural-fern-material-'+api.worldKey,profile.fernColor,scene);
  const leafMat=material('procedural-shrub-leaf-material-'+api.worldKey,profile.leafColor,scene);
  const trunkMat=material('procedural-tree-trunk-material-'+api.worldKey,'#72543a',scene);
  const canopyMat=material('procedural-tree-canopy-material-'+api.worldKey,profile.leafColor,scene);
  const distantCanopyMat=material('procedural-tree-distant-material-'+api.worldKey,profile.fernColor,scene);

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
  const windReady=[grassMat,fernMat,leafMat,canopyMat,distantCanopyMat].map(m=>enableWind(m,windStrength*.62)).filter(Boolean).length;

  const grassGeo=bladeGeometry(scene,'procedural-grass-blade-geo',.105,.72);
  const fernGeo=fernGeometry(scene);
  const shrubGeo=bladeGeometry(scene,'procedural-shrub-leaf-geo',.34,.92);
  const treeNearGeo=treeGeometry(scene,'procedural-tree-near-geo',true);
  const treeFarGeo=treeGeometry(scene,'procedural-tree-far-geo',false);
  const treeNearMat=trunkMat;
  const treeFarMat=distantCanopyMat;

  [grassGeo,fernGeo,shrubGeo,treeNearGeo.wood,treeNearGeo.foliage,treeFarGeo.wood,treeFarGeo.foliage].forEach(m=>m.parent=root);
  const seed=({atacamatitan:711,arackar:827,patagonia:941,stegouros:1061,aysen:1181,valle:1297}[api.worldKey]||1297);
  const grass=place(profile.grass,seed,{min:7,max:49,water:1.1,keep:7},api);
  const ferns=place(profile.ferns,seed+101,{min:8,max:63,water:1.8,keep:7},api);
  const shrubs=place(profile.shrubs,seed+211,{min:14,max:75,water:2.2,keep:10},api);
  const trees=place(profile.trees||0,seed+307,{min:16,max:92,water:3.2,keep:13},api);
  const nearTrees=trees.filter(p=>Math.hypot(p.x-api.home.x,p.z-api.home.z)<39);
  const farTrees=trees.filter(p=>Math.hypot(p.x-api.home.x,p.z-api.home.z)>=39);

  total+=thin(grassGeo,grass,grassMat,'procedural-grass-thin-'+api.worldKey,i=>{const h=.35+(i%7)*.065;return{x:.7+(i%3)*.12,y:h,z:.7+(i%3)*.12};});
  total+=thin(fernGeo,ferns,fernMat,'procedural-fern-thin-'+api.worldKey,i=>{const h=.75+(i%5)*.14;return{x:h,y:h,z:h};});
  total+=thin(shrubGeo,shrubs,leafMat,'procedural-shrub-thin-'+api.worldKey,i=>{const h=.8+(i%4)*.16;return{x:h,y:h,z:h};});
  const nearScale=i=>{const h=.82+(i%5)*.12;return{x:h,y:h,z:h};};
  const farScale=i=>{const h=.9+(i%4)*.13;return{x:h,y:h,z:h};};
  total+=thin(treeNearGeo.wood,nearTrees,trunkMat,'procedural-tree-near-wood-'+api.worldKey,nearScale);
  total+=thin(treeNearGeo.foliage,nearTrees,canopyMat,'procedural-tree-near-crown-'+api.worldKey,nearScale);
  total+=thin(treeFarGeo.wood,farTrees,trunkMat,'procedural-tree-far-wood-'+api.worldKey,farScale);
  total+=thin(treeFarGeo.foliage,farTrees,distantCanopyMat,'procedural-tree-far-crown-'+api.worldKey,farScale);

  // Las copias de malla usan geometría/material compartidos; sin cuerpos Havok por hoja.
  return {created:true,total,grass:grass.length,ferns:ferns.length,shrubs:shrubs.length,trees:trees.length,treeNear:nearTrees.length,treeFar:farTrees.length,windMaterials:windReady,proceduralBump:!!surfaceTexture,root};
 }
 window.HuellasProceduralVegetation={create,profiles:PROFILES};
})();