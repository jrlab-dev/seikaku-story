import * as THREE from 'three';
import {chooseFrame,viewSupport,frameQuad,testLayout} from './sprite_math.mjs';
import {getCast} from './personality_story.mjs';
import {castTypes} from './animal_reactions.js';
export function validateManifest(manifest) {
 if(manifest.schema!==1||manifest.characters.length!==4)throw Error('4体の画像定義が必要です');
 for(const c of manifest.characters){
  if(c.enabled===false)continue;
  if(!(c.heightMetres>0))throw Error(c.id+': 表示尺度が未確定です');
  if(c.frames.length!==8||Array.from({length:8},(_,i)=>i).some(i=>!c.frames.some(f=>f.index===i)))throw Error(c.id+': 8方向が未完了です');
  for(const f of c.frames)if(!(f.heightPixels>0)||f.uvRect.some(v=>!Number.isFinite(v)||v<0||v>1))throw Error(c.id+': 座標が不正です');
 }
}
function makeShadow(ground,x,z,radius){
 const g=new THREE.PlaneGeometry(radius*2,radius*2,12,12),p=g.attributes.position;
 for(let i=0;i<p.count;i++){const px=p.getX(i),pz=-p.getY(i);p.setXYZ(i,px,ground(x+px,z+pz)-ground(x,z)+.018,pz);}
 g.computeVertexNormals();
 const bytes=new Uint8Array(32*32*4);
 for(let y=0;y<32;y++)for(let x=0;x<32;x++){let r=Math.hypot((x-15.5)/15.5,(y-15.5)/15.5),i=(y*32+x)*4;bytes[i]=17;bytes[i+1]=25;bytes[i+2]=17;bytes[i+3]=Math.round(48*Math.max(0,1-r*r)**2);}
 const map=new THREE.DataTexture(bytes,32,32);map.needsUpdate=true;map.magFilter=THREE.LinearFilter;map.minFilter=THREE.LinearFilter;
 const material=new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false,depthTest:true,toneMapped:false,side:THREE.DoubleSide});
 const mesh=new THREE.Mesh(g,material);mesh.name='Independent_ground_contact_shadow';mesh.renderOrder=1;return mesh;
}
export async function createCharacterLayer({scene,ground}) {
 const response=await fetch('./assets/characters/manifest.json');if(!response.ok)throw Error('画像定義を読み込めません');
 const manifest=await response.json();validateManifest(manifest);
 const group=new THREE.Group();group.name='J47_directional_static_characters';const actors=[];
 try {
  for(const c of manifest.characters){
   if(c.enabled===false)continue;
   const texture=await new THREE.TextureLoader().loadAsync(c.url);
   if(texture.image.width!==c.atlasSize[0]||texture.image.height!==c.atlasSize[1])throw Error(c.id+': アトラス寸法が不一致です');
   texture.colorSpace=THREE.SRGBColorSpace;texture.generateMipmaps=false;texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;
   const material=new THREE.MeshBasicMaterial({map:texture,alphaTest:.5,alphaToCoverage:true,transparent:false,depthWrite:true,depthTest:true,toneMapped:false,side:THREE.FrontSide});
   const card=new THREE.Mesh(new THREE.PlaneGeometry(1,1),material);card.name=c.id+'_directional_card';card.castShadow=false;card.receiveShadow=false;
   const root=new THREE.Group();root.name=c.id;root.add(card);group.add(root);
   const shadow=makeShadow(ground,0,0,c.heightMetres*.27);root.add(shadow);
   actors.push({data:c,root,card,shadow,index:null,yaw:0,status:null});
  }
 } catch(error){for(const a of actors){a.card.geometry.dispose();a.card.material.map.dispose();a.card.material.dispose();a.shadow.geometry.dispose();a.shadow.material.map.dispose();a.shadow.material.dispose();}throw error;}
 const motionSets=[];
 const motionResponse=await fetch('./assets/characters/motion_manifest.json');
 if(!motionResponse.ok)throw Error('動作画像定義を読み込めません');
 const motionManifest=await motionResponse.json();
 if(motionManifest.schema!==1||!Array.isArray(motionManifest.sets))throw Error('動作画像定義が不正です');
 const urlCast=typeof location!=='undefined'&&new URLSearchParams(location.search).get('cast'),castNow=urlCast?Object.fromEntries(['pig_straw','pig_wood','pig_brick','wolf'].map((k,i)=>[k,urlCast.split(',')[i]])):getCast(),need=castTypes(castNow);
 for(const set of motionManifest.sets){
  if(set.style!=null&&need[set.characterId]!==set.style)continue;
  const owner=actors.find(a=>a.data.id===set.characterId);
  if(!owner||!['walk','blow'].includes(set.motion)||!(set.phases>0)||(set.style==null&&set.frames.length!==set.phases*8))throw Error('動作画像の方向・枚数が不正です');
  for(const f of set.frames)if(!(f.worldUnitsPerPixel>0)||!f.footAnchor||f.uvRect.some(v=>!Number.isFinite(v)||v<0||v>1))throw Error('動作画像の尺度または座標が不正です');
  const texture=await new THREE.TextureLoader().loadAsync(set.url);
  if(texture.image.width!==set.atlasSize[0]||texture.image.height!==set.atlasSize[1])throw Error('動作画像の寸法が不一致です');
  texture.colorSpace=THREE.SRGBColorSpace;texture.generateMipmaps=false;texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;
  motionSets.push({...set,texture});
 }
 let kind='static',time=0,playing=false;
 function place(a,p){
  a.root.position.set(p.x,ground(p.x,p.z)+(p.yOffset||0),p.z);a.yaw=p.yaw;a.requestedVisible=p.visible!==false;a.motion=p.motion||'idle';a.walkStyle=p.walkStyle??null;a.motionTime=p.motionTime||0;a.elevated=(p.yOffset||0)>.1;
  const g=a.shadow.geometry.attributes.position;
  for(let i=0;i<g.count;i++)g.setY(i,ground(p.x+g.getX(i),p.z+g.getZ(i))-a.root.position.y+.018);
  g.needsUpdate=true;a.shadow.geometry.computeBoundingSphere();
 }
 function applyFrame(a,index){
  const walking=a.motion==='walk'||a.motion==='walk_front',motion=walking?'walk':a.motion;if(a.motion==='walk_front')index=0;
  const base=motionSets.find(s=>s.characterId===a.data.id&&s.motion===motion&&s.style==null),styled=walking&&a.walkStyle!=null?motionSets.find(s=>s.characterId===a.data.id&&s.motion==='walk'&&s.style===a.walkStyle):null;
  const STRIDE=[1.25,.6,.6,1.05,.9,.85,1,.95,.9,1],cycle=.62*a.data.heightMetres*(walking&&a.walkStyle!=null?STRIDE[a.walkStyle]:1);
  const pick=(set,ph)=>set?.frames.find(f=>f.index===index&&f.phase===ph);
  const ph=n=>walking&&a.walkDist!=null?Math.floor(a.walkDist/cycle*n)%n:Math.floor(a.motionTime*((base||{}).fps||6))%n;
  let set=base,phase=base?ph(base.phases):0,f;
  if(styled&&pick(styled,ph(styled.phases))){set=styled;phase=ph(styled.phases);}
  const key=(set?.motion||'idle')+':'+(set?.style??'')+':'+phase+':'+index;
  if(a.frameKey===key)return;
  f=set?pick(set,phase):a.data.frames.find(f=>f.index===index);if(!f)throw Error(a.data.id+': 必要な方向がありません');
  if(!a.idleTexture)a.idleTexture=a.card.material.map;
  a.card.material.map=set?.texture||a.idleTexture;
  const q=frameQuad(f,set?f.heightPixels*f.worldUnitsPerPixel:a.data.heightMetres),p=a.card.geometry.attributes.position,uv=a.card.geometry.attributes.uv,[u0,v0,u1,v1]=f.uvRect;
  p.setXYZ(0,q.left,q.top,0);p.setXYZ(1,q.right,q.top,0);p.setXYZ(2,q.left,q.bottom,0);p.setXYZ(3,q.right,q.bottom,0);
  uv.setXY(0,u0,v1);uv.setXY(1,u1,v1);uv.setXY(2,u0,v0);uv.setXY(3,u1,v0);
  p.needsUpdate=true;uv.needsUpdate=true;a.card.geometry.computeBoundingSphere();a.index=index;a.frameKey=key;a.renderedMotion=set?.motion||'idle';
 }
 function setLayout(next,t=0){
  kind=next;time=t;
  for(const p of testLayout(kind,time,actors.map(a=>a.data.id)))place(actors.find(a=>a.data.id===p.id),p);
 }
 setLayout('static');scene.add(group);
 return {
  group,actors,manifest,
  applyStory(poses,t){playing=false;kind='story';const dt=t-time;time=t;for(const p of poses){const a=actors.find(a=>a.data.id===p.id);if(!a)throw Error('Unknown story actor '+p.id);
   const prev=a.root.position.clone();place(a,p);
   if(a.motion==='walk'||a.motion==='walk_front'){const d=Math.hypot(a.root.position.x-prev.x,a.root.position.z-prev.z);a.walkDist=(dt>0&&dt<=.25&&(a.prevMotion==='walk'||a.prevMotion==='walk_front'))?(a.walkDist||0)+d:(a.motionTime||0)*1.4;}
   a.prevMotion=a.motion;}},
  motionCapabilities(){return{walkComplete:actors.every(a=>motionSets.some(s=>s.characterId===a.data.id&&s.motion==='walk')),sets:motionSets.map(s=>({id:s.characterId,motion:s.motion,phases:s.phases})),pending:motionManifest.pending||[]};},
  viewWarnings(){return actors.filter(a=>a.requestedVisible&&a.status&&!a.status.supported).map(a=>a.data.label);},
  layout(next){playing=false;setLayout(next);},
  playTranslation(){setLayout('translation');playing=true;},
  pause(){playing=false;},
  seek(t){playing=false;setLayout('translation',Math.max(0,Math.min(10,t)));},
  update(camera,dt){
   if(playing){time=Math.min(10,time+Math.max(0,dt));setLayout('translation',time);if(time>=10)playing=false;}
   const warnings=[];
   for(const a of actors){
    const v=viewSupport(a.root.position,a.data.visibilityHeightMetres??a.data.heightMetres,camera.position,manifest.supportedElevationDegrees);
    a.card.visible=v.supported&&a.requestedVisible;a.shadow.visible=a.card.visible&&!a.elevated;a.status=v;
    if(!a.requestedVisible)continue;
    if(!v.supported){warnings.push(a.data.label);continue;}
    const index=chooseFrame(a.yaw,v.azimuth,a.index);
    applyFrame(a,index);
    a.card.rotation.y=v.azimuth;
   }
   return {kind,time,playing,unsupported:warnings,actors:actors.map(a=>({id:a.data.id,frame:a.index,position:a.root.position.toArray(),bodyYaw:a.yaw,elevation:a.status?.elevation,visible:a.card.visible}))};
  },
  record(){return {kind,time,playing,walkAnimation:false,overheadSupported:false,visualValidation:'pending',excluded:manifest.characters.filter(c=>c.enabled===false).map(c=>({id:c.id,reason:c.status,plannedScale:c.plannedScale})),actors:actors.map(a=>({id:a.data.id,frame:a.index,position:a.root.position.toArray(),bodyYaw:a.yaw,visible:a.card.visible,elevation:a.status?.elevation}))};}
 };
}

