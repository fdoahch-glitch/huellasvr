/* Huellas VR · reconstrucción paleogeográfica Babylon.js
 * Superficie PBR propia y cordones geológicos 3D por mundo.
 * No sustituye la evidencia del mapa de altura: la usa como base topográfica.
 */
(() => {
'use strict';
const B=window.BABYLON;
const PALEO={
 atacamatitan:{seed:11,soil:['#a9573f','#c77b51','#d49a68','#8e4b42'],rock:['#74483d','#96543f','#ad6b4d'],ridge:['#8b4d45','#b66d52','#d19a70'],wet:0,relief:1.0},
 arackar:{seed:23,soil:['#c5a77d','#dfc79e','#a98262','#81776b'],rock:['#71665a','#97846a','#b6a082'],ridge:['#8c8275','#c2ad8e','#e1d0ae'],wet:.08,relief:.82},
 patagonia:{seed:37,soil:['#6c7866','#a59a79','#c5b58e','#657b79'],rock:['#66736c','#8e9481','#c0b69a'],ridge:['#68756d','#879185','#b1b39d'],wet:.72,relief:.52},
 stegouros:{seed:53,soil:['#626d50','#9b906e','#b9a27a','#5b7567'],rock:['#68705f','#99927a','#b6aa8c'],ridge:['#5e6d5d','#82907a','#a7a58b'],wet:.82,relief:.62},
 aysen:{seed:41,soil:['#5b696a','#8c8c7b','#b0a28a','#586d70'],rock:['#50585b','#7b8581','#a1a397'],ridge:['#454e50','#697577','#8e9993'],wet:.55,relief:1.12}
};
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
function hash(x,z,seed){const n=Math.sin(x*127.1+z*311.7+seed*74.7)*43758.5453;return n-Math.floor(n);}
function noise(x,z,seed){const ix=Math.floor(x),iz=Math.floor(z),fx=x-ix,fz=z-iz,u=fx*fx*(3-2*fx),v=fz*fz*(3-2*fz);return (hash(ix,iz,seed)*(1-u)+hash(ix+1,iz,seed)*u)*(1-v)+(hash(ix,iz+1,seed)*(1-u)+hash(ix+1,iz+1,seed)*u)*v;}
function fbm(x,z,seed){let a=.5,f=1,s=0;for(let i=0;i<5;i++){s+=noise(x*f,z*f,seed+i*13)*a;f*=2.03;a*=.5;}return s;}
function color(hex){return B.Color3.FromHexString(hex);}
function mix(a,b,t){return B.Color3.Lerp(a,b,clamp(t));}
function createSurface(scene,worldKey,heightAt,validAt,waterDistanceAt,sourceMaterial){
 const P=PALEO[worldKey];if(!P)return null;
 const N=220,extent=150,step=extent*2/N,positions=[],colors=[],indices=[],uvs=[];
 const palette=P.soil.map(color);
 const grid=new Int32Array((N+1)*(N+1));grid.fill(-1);
 for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){
  const x=-extent+i*step,z=-extent+j*step;if(!validAt(x,z))continue;
  const y=heightAt(x,z)+.035,idx=positions.length/3;grid[j*(N+1)+i]=idx;
  positions.push(x,y,z);uvs.push(i/N,1-j/N);
  const n=fbm(x*.055,z*.055,P.seed),fine=noise(x*.24,z*.24,P.seed+9),slope=clamp(Math.abs(heightAt(x+1,z)-heightAt(x-1,z))+Math.abs(heightAt(x,z+1)-heightAt(x,z-1))*.45);
  const wet=clamp((1-waterDistanceAt(x,z)/15))*P.wet;
  const layer=clamp((n*.62+fine*.22+wet*.16));
  let c=mix(palette[0],palette[1],smooth(.18,.52,layer));
  c=mix(c,palette[2],smooth(.48,.82,layer)*.65);
  c=mix(c,palette[3],smooth(.28,.72,slope)*.34);
  const fleck=.91+fine*.17;c.scaleInPlace(fleck);
  colors.push(c.r,c.g,c.b,1);
 }
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){
  const a=grid[j*(N+1)+i],b=grid[j*(N+1)+i+1],c=grid[(j+1)*(N+1)+i],d=grid[(j+1)*(N+1)+i+1];
  if(a<0||b<0||c<0||d<0)continue;indices.push(a,b,c,b,d,c);
 }
 const normals=[];B.VertexData.ComputeNormals(positions,indices,normals);
 const mesh=new B.Mesh('paleogeography-ground-'+worldKey,scene),vd=new B.VertexData();
 vd.positions=positions;vd.indices=indices;vd.normals=normals;vd.colors=colors;vd.uvs=uvs;vd.applyToMesh(mesh,true);
 const mat=new B.PBRMaterial('paleogeography-ground-pbr-'+worldKey,scene);
 const sourceAlbedo=sourceMaterial?.albedoTexture||sourceMaterial?.diffuseTexture||null,sourceNormal=sourceMaterial?.bumpTexture||null;
 let detail=sourceAlbedo;
 if(!detail){
  detail=new B.DynamicTexture('paleogeography-ground-detail-'+worldKey,{width:512,height:512},scene,false,B.Texture.TRILINEAR_SAMPLINGMODE);
  const ctx=detail.getContext(),image=ctx.createImageData(512,512);
  for(let py=0;py<512;py++)for(let px=0;px<512;px++){const q=(py*512+px)*4,n=noise(px*.055,py*.055,P.seed),f=noise(px*.23,py*.23,P.seed+37),grain=clamp(.58+n*.28+f*.14);image.data[q]=Math.round(176+grain*62);image.data[q+1]=Math.round(166+grain*70);image.data[q+2]=Math.round(145+grain*78);image.data[q+3]=255;}
  ctx.putImageData(image,0,0);detail.update(false);detail.wrapU=detail.wrapV=B.Texture.WRAP_ADDRESSMODE;detail.uScale=detail.vScale=18;detail.anisotropicFilteringLevel=8;
 }
 let normalTexture=sourceNormal;
 if(!normalTexture){
  normalTexture=new B.DynamicTexture('paleogeography-ground-normal-'+worldKey,{width:512,height:512},scene,false,B.Texture.TRILINEAR_SAMPLINGMODE);
  const normalContext=normalTexture.getContext(),normalImage=normalContext.createImageData(512,512);
  for(let py=0;py<512;py++)for(let px=0;px<512;px++){const q=(py*512+px)*4,n=noise(px*.075,py*.075,P.seed+83),f=noise(px*.31,py*.31,P.seed+101);normalImage.data[q]=Math.round(112+n*28);normalImage.data[q+1]=Math.round(112+f*30);normalImage.data[q+2]=245;normalImage.data[q+3]=255;}
  normalContext.putImageData(normalImage,0,0);normalTexture.update(false);normalTexture.wrapU=normalTexture.wrapV=B.Texture.WRAP_ADDRESSMODE;normalTexture.uScale=normalTexture.vScale=18;normalTexture.anisotropicFilteringLevel=8;
 }
 mat.albedoTexture=detail;mat.bumpTexture=normalTexture;mat.bumpTexture.level=sourceNormal?.level??.42;mat.albedoColor=new B.Color3(1,1,1);mat.useVertexColors=true;mat.metallic=0;mat.roughness=.94;mat.backFaceCulling=true;mat.environmentIntensity=.42;
 mesh.material=mat;mesh.isPickable=true;mesh.checkCollisions=true;mesh.receiveShadows=true;mesh.metadata={ground:true,paleogeography:true,world:worldKey};
 return mesh;
}
function createRidges(scene,worldKey,heightAt){
 const P=PALEO[worldKey],N=480,R=42,inner=137,outer=322;
 const positions=new Float32Array((N+1)*R*3),colors=new Float32Array((N+1)*R*4),indices=[];
 const bands=P.ridge.map(color),seed=P.seed;
 const peakProfile={
  atacamatitan:[.18,.32,.48,.27,.62,.36,.22,.53,.3,.68,.2,.42],
  arackar:[.22,.38,.3,.52,.27,.45,.32,.56,.24,.4,.3,.48],
  patagonia:[.18,.28,.34,.2,.38,.25,.3,.18,.36,.23,.28,.2],
  stegouros:[.2,.27,.24,.34,.22,.3,.18,.32,.24,.28,.2,.3],
  aysen:[.3,.46,.62,.35,.72,.4,.58,.31,.66,.42,.55,.3]
 }[worldKey];
 for(let j=0;j<R;j++){
  const t=j/(R-1),radius=inner+(outer-inner)*t;
  for(let i=0;i<=N;i++){
   const a=i/N*Math.PI*2,sector=a/(Math.PI*2)*peakProfile.length,k=j*(N+1)+i;
   const idx=Math.floor(sector),blend=sector-idx,peak=peakProfile[idx]*(1-blend)+peakProfile[(idx+1)%peakProfile.length]*blend;
   const ridgeNoise=fbm(Math.cos(a)*radius*.022,Math.sin(a)*radius*.022,seed+31);
   const spur=noise(Math.cos(a)*radius*.075,Math.sin(a)*radius*.075,seed+71);
   const crest=Math.pow(Math.max(0,Math.sin(a*3+seed*.13)*.5+.5),2);
   let h=(peak*.62+ridgeNoise*.28+crest*.1)*P.relief*(.52+.48*smooth(inner,outer,radius));
   h*=1.0+spur*.24;h=Math.max(.8,h*74*(1-smooth(outer-28,outer,radius)));
   const base=radius<160?heightAt(Math.cos(a)*Math.min(radius,149),Math.sin(a)*Math.min(radius,149)):-1.5;
   positions[k*3]=Math.cos(a)*radius;positions[k*3+1]=base+h;positions[k*3+2]=Math.sin(a)*radius;
   const rockBand=clamp((h/80)*.72+ridgeNoise*.28),c=mix(bands[0],bands[1],smooth(.15,.58,rockBand));
   const c2=mix(c,bands[2],smooth(.48,.9,rockBand)*.8),shade=.87+spur*.25;
   colors[k*4]=c2.r*shade;colors[k*4+1]=c2.g*shade;colors[k*4+2]=c2.b*shade;colors[k*4+3]=1;
  }
 }
 for(let j=0;j<R-1;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+1,c=a+N+1,d=c+1;indices.push(a,b,c,b,d,c);}
 const normals=[];B.VertexData.ComputeNormals(positions,indices,normals);
 const mesh=new B.Mesh('paleogeography-ridges-'+worldKey,scene),vd=new B.VertexData();vd.positions=Array.from(positions);vd.indices=indices;vd.normals=normals;vd.colors=Array.from(colors);vd.applyToMesh(mesh,true);
 const mat=new B.PBRMaterial('paleogeography-ridges-pbr-'+worldKey,scene);mat.albedoColor=new B.Color3(1,1,1);mat.useVertexColors=true;mat.metallic=0;mat.roughness=.98;mat.backFaceCulling=false;
 mesh.material=mat;mesh.isPickable=false;mesh.receiveShadows=true;mesh.metadata={paleogeography:true,world:worldKey,geology:'eroded-ridge-system'};
 return mesh;
}
function createRockFields(scene,worldKey,heightAt,validAt,waterDistanceAt){
 const P=PALEO[worldKey],palette=P.rock.map(color),batches=[];
 const archetypes=[
  {name:'angular',type:4,scale:[1.35,.72,1.05]},
  {name:'rounded',type:3,scale:[1.05,.72,.92]},
  {name:'slab',type:4,scale:[1.45,.38,1.05]},
  {name:'boulder',type:3,scale:[1.55,.86,1.3]},
  {name:'pebble',type:4,scale:[.42,.24,.34]}
 ];
 for(let kind=0;kind<archetypes.length;kind++){
  const spec=archetypes[kind],mesh=B.MeshBuilder.CreatePolyhedron('paleogeology-rock-'+worldKey+'-'+spec.name,{type:spec.type,size:1},scene);
  const mat=new B.PBRMaterial('paleogeology-rock-material-'+worldKey+'-'+spec.name,scene);mat.albedoColor=palette[kind%palette.length];mat.metallic=0;mat.roughness=.96;mesh.material=mat;mesh.isPickable=false;mesh.receiveShadows=true;
  const matrices=[];
  const count=kind===4?40:kind===3?12:kind===2?14:kind===1?16:18;
  for(let i=0,attempt=0;i<count&&attempt<count*12;attempt++){
   const a=hash(attempt,kind+3,P.seed)*Math.PI*2,r=18+Math.sqrt(hash(attempt+17,kind+9,P.seed+7))*124,x=Math.cos(a)*r,z=Math.sin(a)*r;
   if(!validAt(x,z)||waterDistanceAt(x,z)<(kind===4?2.5:5))continue;
   if(Math.hypot(x,z)<19)continue;
   const base=.38+hash(attempt+5,kind+13,P.seed+11)*.78,sc=spec.scale;
   const scale=new B.Vector3(base*sc[0],base*sc[1],base*sc[2]);
   const rotation=B.Quaternion.RotationYawPitchRoll(hash(attempt+1,kind,P.seed)*Math.PI*2,(hash(attempt+2,kind,P.seed)*.28)-.14,(hash(attempt+3,kind,P.seed)*.28)-.14);
   const position=new B.Vector3(x,heightAt(x,z)+scale.y*.45,z);
   matrices.push(...B.Matrix.Compose(scale,rotation,position).toArray());i++;
  }
  if(matrices.length){mesh.thinInstanceSetBuffer('matrix',new Float32Array(matrices),16,true);mesh.thinInstanceRefreshBoundingInfo(true);batches.push({mesh,count:matrices.length/16});}
  else mesh.dispose();
 }
 return batches;
}
function rebuild(options){
 const {scene,worldKey,heightAt,validAt,waterDistanceAt}=options;
 if(!scene||!PALEO[worldKey])throw new Error('Reconstrucción paleogeográfica: faltan escena o mundo válido.');
 const oldGround=options.oldGround;
 const ground=createSurface(scene,worldKey,heightAt,validAt,waterDistanceAt,oldGround?.material);
 if(!ground||ground.getTotalVertices()<5000)throw new Error('La nueva superficie paleogeográfica quedó incompleta para '+worldKey);
 if(oldGround){oldGround.isVisible=false;oldGround.isPickable=false;oldGround.checkCollisions=false;oldGround.metadata={...(oldGround.metadata||{}),supersededBy:ground.name};}
 const oldMountains=scene.getMeshByName('original-mountain-ring-'+(worldKey==='patagonia'?'gonkoken':worldKey));
 if(oldMountains){oldMountains.isVisible=false;oldMountains.setEnabled(false);}
 const ridges=createRidges(scene,worldKey,heightAt),rocks=createRockFields(scene,worldKey,heightAt,validAt,waterDistanceAt);
 return {ground,ridges,rockBatches:rocks.length,rockInstances:rocks.reduce((n,item)=>n+item.count,0),vertices:ground.getTotalVertices(),triangles:Math.floor(ground.getTotalIndices()/3),world:worldKey};
}
window.HuellasPaleogeography={rebuild,worlds:Object.keys(PALEO)};
})();