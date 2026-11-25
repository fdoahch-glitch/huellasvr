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
 // Textura PBR nueva y propia por mundo: no reutilizar mapas antiguos que
 // provocaban colores lavados, repetición de mosaico o incompatibilidad de UV.
 const detail=new B.DynamicTexture('paleogeography-ground-detail-'+worldKey,{width:1024,height:1024},scene,false,B.Texture.TRILINEAR_SAMPLINGMODE);
 const ctx=detail.getContext(),image=ctx.createImageData(1024,1024);
 for(let py=0;py<1024;py++)for(let px=0;px<1024;px++){
  const q=(py*1024+px)*4,n=fbm(px*.009,py*.009,P.seed),fine=noise(px*.055,py*.055,P.seed+37),grain=noise(px*.24,py*.24,P.seed+83);
  const layer=clamp(n*.56+fine*.3+grain*.14);
  let c=mix(palette[0],palette[1],smooth(.18,.52,layer));
  c=mix(c,palette[2],smooth(.48,.84,layer)*.72);
  c=mix(c,palette[3],smooth(.68,.94,grain)*.28);
  const shade=.84+fine*.2+grain*.08;
  image.data[q]=Math.round(clamp(c.r*shade)*255);image.data[q+1]=Math.round(clamp(c.g*shade)*255);image.data[q+2]=Math.round(clamp(c.b*shade)*255);image.data[q+3]=255;
 }
 ctx.putImageData(image,0,0);detail.update(false);detail.wrapU=detail.wrapV=B.Texture.WRAP_ADDRESSMODE;detail.uScale=detail.vScale=3.2;detail.anisotropicFilteringLevel=8;
 const normalTexture=new B.DynamicTexture('paleogeography-ground-normal-'+worldKey,{width:1024,height:1024},scene,false,B.Texture.TRILINEAR_SAMPLINGMODE);
 const normalContext=normalTexture.getContext(),normalImage=normalContext.createImageData(1024,1024);
 for(let py=0;py<1024;py++)for(let px=0;px<1024;px++){
  const q=(py*1024+px)*4,n=noise(px*.035,py*.035,P.seed+83),f=noise(px*.14,py*.14,P.seed+101);
  normalImage.data[q]=Math.round(116+n*34);normalImage.data[q+1]=Math.round(116+f*34);normalImage.data[q+2]=245;normalImage.data[q+3]=255;
 }
 normalContext.putImageData(normalImage,0,0);normalTexture.update(false);normalTexture.wrapU=normalTexture.wrapV=B.Texture.WRAP_ADDRESSMODE;normalTexture.uScale=normalTexture.vScale=3.2;normalTexture.anisotropicFilteringLevel=8;
 mat.albedoTexture=detail;mat.bumpTexture=normalTexture;mat.bumpTexture.level=.32;mat.albedoColor=new B.Color3(1,1,1);mat.useVertexColors=true;mat.metallic=0;mat.roughness=.94;mat.backFaceCulling=true;mat.environmentIntensity=.42;
 // La ortofoto y las tres capas ya contienen el color y el detalle geológico.
 // Multiplicarlas otra vez por la paleta vertex-color oscurecía el suelo hasta gris/negro.
 mat.useVertexColors=false;
 mesh.material=mat;mesh.isPickable=true;mesh.checkCollisions=true;mesh.receiveShadows=true;mesh.metadata={ground:true,paleogeography:true,world:worldKey};
 // Capa base continua bajo la topografía irregular: elimina los grandes vacíos blancos
 // en los bordes de las máscaras de altura sin alterar canales ni colisiones.
 const minGroundY=positions.reduce((min,value,index)=>index%3===1?Math.min(min,value):min,Infinity);
 const underlay=B.MeshBuilder.CreateGround('paleogeography-underlay-'+worldKey,{width:760,height:760,subdivisions:2},scene);
 underlay.position.y=(Number.isFinite(minGroundY)?minGroundY:-8)-3.5;
 const underlayMat=new B.PBRMaterial('paleogeography-underlay-material-'+worldKey,scene);
 underlayMat.albedoColor=palette[0].scale(.92);underlayMat.metallic=0;underlayMat.roughness=1;
 underlayMat.backFaceCulling=true;underlay.material=underlayMat;underlay.isPickable=false;underlay.checkCollisions=false;underlay.receiveShadows=false;
 underlay.metadata={ground:true,paleogeographyUnderlay:true,world:worldKey};
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
 // Rocas propias de la paleogeografía: malla irregular facetada, sin GLB heredados
 // ni poliedros genéricos. Cada arquetipo comparte geometría/material por Thin Instances.
 const archetypes=[
  {name:'fractured-outcrop',count:20,scale:[2.1,1.15,1.55],rough:.22},
  {name:'rounded-boulder',count:24,scale:[1.45,.92,1.3],rough:.12},
  {name:'stratified-slab',count:18,scale:[1.9,.48,1.15],rough:.2},
  {name:'talus-block',count:24,scale:[.92,.68,.82],rough:.28},
  {name:'gravel',count:54,scale:[.36,.2,.3],rough:.1}
 ];
 const makeRock=(spec,kind)=>{
  const mesh=new B.Mesh('paleogeology-rock-'+worldKey+'-'+spec.name,scene),positions=[],indices=[],colors=[];
  const rings=7,segments=12;
  const shapeSeed=P.seed+kind*31;
  for(let j=0;j<=rings;j++){
   const v=j/rings,phi=.12+v*(Math.PI-.24),sin=Math.sin(phi),cos=Math.cos(phi);
   for(let i=0;i<=segments;i++){
    const u=i/segments*Math.PI*2;
    const n1=hash(i+kind*17,j+kind*7,shapeSeed),n2=hash(i*3+5,j*5+9,shapeSeed+19);
    const radial=1+(n1-.5)*spec.rough+(n2-.5)*spec.rough*.55;
    const x=Math.cos(u)*sin*radial,y=cos*(1+(n2-.5)*spec.rough*.7),z=Math.sin(u)*sin*radial;
    positions.push(x,y,z);
    const band=clamp(.32+cos*.28+(n1-.5)*.22+(j%3)*.035),c=mix(palette[kind%palette.length],palette[(kind+1)%palette.length],band);
    colors.push(c.r,c.g,c.b,1);
   }
  }
  for(let j=0;j<rings;j++)for(let i=0;i<segments;i++){
   const a=j*(segments+1)+i,b=a+1,c=a+segments+1,d=c+1;
   indices.push(a,c,b,b,c,d);
  }
  const normals=[];B.VertexData.ComputeNormals(positions,indices,normals);
  const vd=new B.VertexData();vd.positions=positions;vd.indices=indices;vd.normals=normals;vd.colors=colors;vd.applyToMesh(mesh,true);
  const mat=new B.PBRMaterial('paleogeology-rock-pbr-'+worldKey+'-'+spec.name,scene);
  mat.albedoColor=new B.Color3(1,1,1);mat.useVertexColors=true;mat.metallic=0;mat.roughness=.97;mat.backFaceCulling=false;mesh.material=mat;
  mesh.isPickable=false;mesh.receiveShadows=true;
  return mesh;
 };
 for(let kind=0;kind<archetypes.length;kind++){
  const spec=archetypes[kind],mesh=makeRock(spec,kind),matrices=[];
  for(let i=0,attempt=0;i<spec.count&&attempt<spec.count*16;attempt++){
   const a=hash(attempt,kind+3,P.seed)*Math.PI*2,r=20+Math.sqrt(hash(attempt+17,kind+9,P.seed+7))*124,x=Math.cos(a)*r,z=Math.sin(a)*r;
   if(!validAt(x,z)||waterDistanceAt(x,z)<(kind===4?1.8:3.5))continue;
   if(Math.hypot(x,z)<21)continue;
   const base=.55+hash(attempt+5,kind+13,P.seed+11)*1.1,sc=spec.scale;
   const scale=new B.Vector3(base*sc[0],base*sc[1],base*sc[2]);
   const rotation=B.Quaternion.RotationYawPitchRoll(hash(attempt+1,kind,P.seed)*Math.PI*2,(hash(attempt+2,kind,P.seed)*.34)-.17,(hash(attempt+3,kind,P.seed)*.34)-.17);
   const y=heightAt(x,z),position=new B.Vector3(x,y+scale.y*.38,z);
   matrices.push(...B.Matrix.Compose(scale,rotation,position).toArray());i++;
  }
  if(matrices.length){mesh.thinInstanceSetBuffer('matrix',new Float32Array(matrices),16,true);mesh.thinInstanceRefreshBoundingInfo(true);mesh.metadata={paleogeography:true,world:worldKey,rockArchetype:spec.name,instances:matrices.length/16};batches.push({mesh,count:matrices.length/16});}
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