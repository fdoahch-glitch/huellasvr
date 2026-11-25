/* Huellas VR · vegetación procedural nativa Babylon.js 9.37.2
 * Geometría generada en CPU una vez por mundo; render masivo con Thin Instances.
 * No requiere Blender, plugins externos ni recursos descargados.
 */
(() => {
 'use strict';
 const B=window.BABYLON;
 if(!B)return;
 const PROFILES={
  // Atacama: matorral ralo y vegetación restringida a depresiones; sin bosque genérico.
  atacamatitan:{trees:5,grass:5,ferns:8,shrubs:16,wind:.24,grassColor:'#aa955e',leafColor:'#85804f',fernColor:'#8c8757'},
  arackar:{trees:7,grass:12,ferns:10,shrubs:18,wind:.32,grassColor:'#b5a36c',leafColor:'#8d8958',fernColor:'#929064'},
  // Dorotea / Gonkoken: delta abierto con bandas de ribera y claros amplios.
  patagonia:{trees:14,grass:38,ferns:22,shrubs:26,wind:.62,grassColor:'#879653',leafColor:'#547449',fernColor:'#66824c'},
  stegouros:{trees:10,grass:48,ferns:32,shrubs:28,wind:.58,grassColor:'#8d9b5a',leafColor:'#5c7849',fernColor:'#708a52'},
  // Formación Toqui / Chilesaurus: abanico deltaico volcánico, ribera localizada.
  aysen:{trees:8,grass:30,ferns:20,shrubs:18,wind:.7,grassColor:'#718d5a',leafColor:'#496f4e',fernColor:'#5f8052'},
  valle:{trees:18,grass:52,ferns:28,shrubs:24,wind:.55,grassColor:'#819451',leafColor:'#527548',fernColor:'#63854c'}
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
  const origin=opts.origin||{x:0,z:0},forward=opts.forward||null,cone=opts.cone??Math.PI*2;
  const baseAngle=forward?Math.atan2(forward.z,forward.x):0;
  for(let tries=0;out.length<count&&tries<count*55+140;tries++){
   const a=forward?baseAngle+(rnd()-.5)*cone:rnd()*Math.PI*2,r=opts.min+Math.sqrt(rnd())*(opts.max-opts.min);
   const x=origin.x+Math.cos(a)*r,z=origin.z+Math.sin(a)*r;
   if(!api.terrainValidAt(x,z))continue;
   const waterDistance=api.waterDistanceAt?api.waterDistanceAt(x,z):1e9;
   if(waterDistance<(opts.water||1)||(Number.isFinite(opts.waterMax)&&waterDistance>opts.waterMax))continue;
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
    [grassMat,fernMat,leafMat,canopyMat,distantCanopyMat].forEach(m=>{m.bumpTexture=surfaceTexture;m.bumpTexture.level=.07;});
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
  const view=api.camera?.getForwardRay?.().direction||null,treeOrigin=api.camera?.position||{x:0,z:12};
  const arid=['atacamatitan','arackar'].includes(api.worldKey);
  const trees=place(profile.trees||0,seed+307,{min:19,max:96,water:arid?.8:3.2,waterMax:arid?undefined:58,keep:13,origin:{x:treeOrigin.x,z:treeOrigin.z},forward:view,cone:1.72},api);
  const grassScale=i=>{const h=.35+(i%7)*.065;return{x:.7+(i%3)*.12,y:h,z:.7+(i%3)*.12};};
  const fernScale=i=>{const h=.75+(i%5)*.14;return{x:h,y:h,z:h};};
  const shrubScale=i=>{const h=.8+(i%4)*.16;return{x:h,y:h,z:h};};
  function dynamicBatch(mesh,points,mat,name,scaleFn,maxDistance){
   mesh.name=name;mesh.material=mat;mesh.isVisible=points.length>0;mesh.setEnabled(points.length>0);mesh.isPickable=false;mesh.checkCollisions=false;
   mat.useVertexColor=true;mat.useVertexAlpha=false;
   const buffer=new Float32Array(points.length*16),colors=new Float32Array(points.length*4),visibleMatrices=new Array(points.length),hiddenMatrices=new Array(points.length);
   points.forEach((p,i)=>{
    const sc=scaleFn(i),rotation=B.Quaternion.RotationYawPitchRoll(p.yaw||0,0,p.tilt||0),position=new B.Vector3(p.x,p.y,p.z);
    const visible=B.Matrix.Compose(new B.Vector3(sc.x,sc.y,sc.z),rotation,position);
    const hidden=B.Matrix.Compose(B.Vector3.Zero(),rotation,position);
    visibleMatrices[i]=visible.m.slice();hiddenMatrices[i]=hidden.m.slice();buffer.set(visible.m,i*16);
    const tint=.91+(i%9)*.022;colors.set([tint,tint*(.96+(i%3)*.012),tint*(.9+(i%4)*.018),1],i*4);
   });
   mesh.thinInstanceSetBuffer('matrix',buffer,16,true);mesh.thinInstanceSetBuffer('color',colors,4,true);mesh.thinInstanceRefreshBoundingInfo(true);
   return {mesh,points,buffer,scaleFn,maxDistance,visibleMatrices,hiddenMatrices};
  }
  const foliageBatches=[
   dynamicBatch(grassGeo,grass,grassMat,'procedural-grass-thin-'+api.worldKey,grassScale,30),
   dynamicBatch(fernGeo,ferns,fernMat,'procedural-fern-thin-'+api.worldKey,fernScale,58),
   dynamicBatch(shrubGeo,shrubs,leafMat,'procedural-shrub-thin-'+api.worldKey,shrubScale,78)
  ];
  total+=grass.length+ferns.length+shrubs.length;

  // LOD y culling dinámicos: los cuatro batches comparten las posiciones,
  // pero cada árbol solo conserva activa la representación adecuada a cámara.
  const treeHeightFactor=({atacamatitan:1.28,arackar:1.22,patagonia:1.48,stegouros:1.38,aysen:1.42}[api.worldKey]||1.3);
  const nearScale=i=>{const h=(.98+(i%5)*.13)*treeHeightFactor;return{x:h*.92,y:h*1.08,z:h*.92};};
  const farScale=i=>{const h=(.9+(i%4)*.12)*treeHeightFactor;return{x:h*.9,y:h,z:h*.9};};
  function treeBatch(mesh,points,mat,name,scaleFn){
   mesh.name=name;mesh.material=mat;mesh.isVisible=points.length>0;mesh.setEnabled(points.length>0);mesh.isPickable=false;mesh.checkCollisions=false;
   mat.useVertexColor=true;mat.useVertexAlpha=false;
   const buffer=new Float32Array(points.length*16),colors=new Float32Array(points.length*4),visibleMatrices=new Array(points.length),hiddenMatrices=new Array(points.length);
   points.forEach((p,i)=>{
    const sc=scaleFn(i),rotation=B.Quaternion.RotationYawPitchRoll(p.yaw||0,0,p.tilt||0),position=new B.Vector3(p.x,p.y,p.z);
    const visible=B.Matrix.Compose(new B.Vector3(sc.x,sc.y,sc.z),rotation,position),hidden=B.Matrix.Compose(B.Vector3.Zero(),rotation,position);
    visibleMatrices[i]=visible.m.slice();hiddenMatrices[i]=hidden.m.slice();buffer.set(visible.m,i*16);
    const tint=.92+(i%7)*.023;colors.set([tint,tint*(.97+(i%3)*.01),tint*(.9+(i%4)*.02),1],i*4);
   });
   mesh.thinInstanceSetBuffer('matrix',buffer,16,true);mesh.thinInstanceSetBuffer('color',colors,4,true);mesh.thinInstanceRefreshBoundingInfo(true);
   return {buffer,visibleMatrices,hiddenMatrices};
  }
  const nearWood=treeBatch(treeNearGeo.wood,trees,trunkMat,'procedural-tree-near-wood-'+api.worldKey,nearScale);
  const nearLeaves=treeBatch(treeNearGeo.foliage,trees,canopyMat,'procedural-tree-near-crown-'+api.worldKey,nearScale);
  const farWood=treeBatch(treeFarGeo.wood,trees,trunkMat,'procedural-tree-far-wood-'+api.worldKey,farScale);
  const farLeaves=treeBatch(treeFarGeo.foliage,trees,distantCanopyMat,'procedural-tree-far-crown-'+api.worldKey,farScale);
  const treeBatches=[nearWood,nearLeaves,farWood,farLeaves];
  const treeMeshes=[treeNearGeo.wood,treeNearGeo.foliage,treeFarGeo.wood,treeFarGeo.foliage];
  const lastCamera={position:null,forward:null,time:0};
  let visibleNear=0,visibleFar=0;
  const camera=api.camera||scene.activeCamera;
  function refreshTreeLod(force=false){
   if(!camera||!camera.position)return;
   const now=performance.now(),pos=camera.position,forward=camera.getForwardRay?camera.getForwardRay().direction:null;
   if(!force&&now-lastCamera.time<400)return;
   if(!force&&lastCamera.position){
    const moved=B.Vector3.DistanceSquared(pos,lastCamera.position);
    const turned=forward&&lastCamera.forward?B.Vector3.Dot(forward,lastCamera.forward):1;
    if(moved<2.25&&turned>.985)return;
   }
   visibleNear=0;visibleFar=0;
   foliageBatches.forEach(batch=>{
    batch.points.forEach((p,i)=>{
     const dx=p.x-pos.x,dz=p.z-pos.z,distSq=dx*dx+dz*dz;
     let inView=true;
     if(forward&&distSq>64){const inv=1/Math.sqrt(distSq);inView=(dx*forward.x+dz*forward.z)*inv>-.28;}
     const visible=inView&&distSq<=batch.maxDistance*batch.maxDistance;
     batch.buffer.set(visible?batch.visibleMatrices[i]:batch.hiddenMatrices[i],i*16);
    });
    batch.mesh.thinInstanceBufferUpdated('matrix');
   });
   const buffers=treeBatches;
   trees.forEach((p,i)=>{
    const dx=p.x-pos.x,dz=p.z-pos.z,distSq=dx*dx+dz*dz;
    let inView=true;
    if(forward&&distSq>324){const inv=1/Math.sqrt(distSq);inView=(dx*forward.x+dz*forward.z)*inv>-.18;}
    const near=inView&&distSq<=48*48;
    const far=inView&&distSq>48*48&&distSq<=145*145;
    if(near)visibleNear++;else if(far)visibleFar++;
    for(let b=0;b<2;b++){
     const batch=buffers[b];batch.buffer.set(near?batch.visibleMatrices[i]:batch.hiddenMatrices[i],i*16);
    }
    for(let b=2;b<4;b++){
     const batch=buffers[b];batch.buffer.set(far?batch.visibleMatrices[i]:batch.hiddenMatrices[i],i*16);
    }
   });
   treeMeshes.forEach((mesh,index)=>mesh.thinInstanceBufferUpdated('matrix'));
   lastCamera.position=pos.clone();lastCamera.forward=forward?forward.clone():null;lastCamera.time=now;
  }
  refreshTreeLod(true);
  const treeLodObserver=scene.onBeforeRenderObservable.add(()=>refreshTreeLod());
  total+=trees.length*2;

  // Las copias de malla usan geometría/material compartidos; sin cuerpos Havok por hoja.
  return {created:true,total,grass:grass.length,ferns:ferns.length,shrubs:shrubs.length,trees:trees.length,treeNear:visibleNear,treeFar:visibleFar,treeLod:'camera-distance+view-direction',treeCullDistance:145,foliageCull:'camera-distance+view-direction',foliageDistances:{grass:30,ferns:58,shrubs:78},treeLodObserver,refreshTreeLod,treeMeshes,windMaterials:windReady,proceduralBump:!!surfaceTexture,root,backend:'babylon-native-thin-instances'};
 }
 window.HuellasProceduralVegetation={create,profiles:PROFILES};
})();