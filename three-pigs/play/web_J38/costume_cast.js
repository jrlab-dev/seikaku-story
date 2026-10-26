import * as THREE from 'three';
import {walkView,walkPhase} from './walk_orientation.mjs';
import {BUILDS} from './construction_montage.mjs';
import {HOUSE_CENTERS,BUILD_VIEW} from './construction_camera.mjs';
import {wolfStoryActing} from './wolf_acting_v1.mjs';
const ids=['pig_straw','pig_wood','pig_brick','wolf'];
const codes=['33535','55331','33333','11311'];
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
export async function installCostumeCast(layer,ground){
 const defs=await(await fetch('./costume114/manifest.json')).json();
 const load=async url=>{const t=await new THREE.TextureLoader().loadAsync(url);t.colorSpace=THREE.SRGBColorSpace;t.generateMipmaps=false;t.minFilter=t.magFilter=THREE.LinearFilter;return t};
 for(const d of Object.values(defs)){d.texture=await load(d.url);d.mirrorTexture=d.mirrorUrl?await load(d.mirrorUrl):d.texture;}
 const ringMaps=await Promise.all(Array.from({length:8},(_,n)=>load('./run_straw/run_'+String(n).padStart(2,'0')+'.webp')));
 const mat=map=>new THREE.MeshBasicMaterial({map,transparent:true,alphaTest:.5,depthTest:true,depthWrite:true,side:THREE.DoubleSide,toneMapped:false});
 const bodyRows={};
 for(const id of ids.slice(0,3)){const d=defs[id],c=document.createElement('canvas');c.width=d.size[0];c.height=d.size[1];const ctx=c.getContext('2d');ctx.drawImage(d.texture.image,0,0);const pix=ctx.getImageData(0,0,c.width,c.height).data;
  bodyRows[id]=[1,2].flatMap(index=>{const f=d.frames[index],[cx,cy,cw,ch]=f.cell,rows=[];for(let y=f.bounds[1]+1;y<f.bounds[3];y+=4){let last=-1;for(let x=f.bounds[0];x<f.bounds[2];x++)if(pix[((cy+y)*c.width+cx+x)*4+3]>180)last=x;if(last>=0)rows.push({x:last-f.anchor[0],y:f.anchor[1]-y,scale:1/(f.bounds[3]-f.bounds[1]),pose:index});}return rows;});
 }
 const hammerPixels={pig_straw:[348,296],pig_wood:[351,295],pig_brick:[337,280]};
 const buildSolutions=new Map();
 const rigs=new Map();
 for(const a of layer.actors){const root=new THREE.Group();root.name='J114_discrete_pose_'+a.data.id;a.root.add(root);const card=new THREE.Mesh(new THREE.PlaneGeometry(1,1),mat(defs[a.data.id].texture));root.add(card);
  const ring=new THREE.Mesh(new THREE.PlaneGeometry(.95,.42),mat(ringMaps[0]));ring.position.set(0,.21,.012);const u=ring.geometry.attributes.uv;u.setXY(0,240/1024,1-685/1024);u.setXY(1,790/1024,1-685/1024);u.setXY(2,240/1024,1-970/1024);u.setXY(3,790/1024,1-970/1024);ring.material.onBeforeCompile=s=>{s.fragmentShader=s.fragmentShader.replace('#include <alphatest_fragment>','#include <alphatest_fragment>\n vec2 rp=vec2(vMapUv.x*1024.-518.,(1.-vMapUv.y)*1024.-830.);vec2 re=vec2((.984*rp.x+.179*rp.y)/270.,(-.179*rp.x+.984*rp.y)/140.);if(dot(re,re)>1.04)discard;')};ring.material.customProgramCacheKey=()=>'J114_approved_ring_crop';root.add(ring);
  const flame=a.root.children.find(o=>o.isGroup&&o!==root&&o.children.some(x=>x.material?.color?.getHex()===0xff741f));rigs.set(a,{root,card,ring,flame});
 }
 layer.adaptCostumeState=s=>{
  if(!s.build)return;
  s.build={...s.build,target:[...s.build.target],worldRoot:[...s.build.worldRoot]};
  const p=s.actors.find(a=>a.id===s.build.actor),a=layer.actors.find(a=>a.data.id===p.id),f=defs[p.id].frames[2],cw=f.cell[2],ch=f.cell[3],scale=a.data.heightMetres/(f.bounds[3]-f.bounds[1]);
  const handX=(hammerPixels[p.id][0]-f.anchor[0])*scale*(p.buildMirror?-1:1),handY=(f.anchor[1]-hammerPixels[p.id][1])*scale;
  if(s.build.platform){const lift=s.build.target[1]-handY-p.worldY;p.worldY+=lift;s.build.platformHeight+=lift;}
  const b=BUILDS.find(b=>b.id===s.build.house),cut=s.build.cut,dt=(b.cuts[cut+1]??b.end)-b.cuts[cut],mid=b.cuts[cut]+(s.build.visit+.5)*dt/s.build.visits,orbit=(mid-b.start)/(b.end-b.start)*Math.PI*2,center=HOUSE_CENTERS[b.id];
  const cam=[center[0]+Math.sin(orbit)*BUILD_VIEW.radius,center[2]+Math.cos(orbit)*BUILD_VIEW.radius],baseAz=Math.atan2(cam[0]-s.build.target[0],cam[1]-s.build.target[2]),sign=p.buildMirror?-1:1,key=[p.id,cut,s.build.visit].join(':');
  let sol=buildSolutions.get(key);
  if(!sol){
   const options=[];
   search:for(const choiceSign of [sign,-sign]){for(const degrees of [0,10,-10,20,-20,30,-30]){for(const inset of [0,.1,.2,.3,.4,.5,-.1,-.2]){
    const az=baseAz+degrees*Math.PI/180,axis=[Math.cos(az)*choiceSign,0,-Math.sin(az)*choiceSign],hit=window.__constructionExterior({...s.build,target:[s.build.target[0]+Math.sin(baseAz)*inset,s.build.target[1],s.build.target[2]+Math.cos(baseAz)*inset]},axis,p.worldY+handY);if(!hit||Math.hypot(hit.point[0]-s.build.target[0],hit.point[2]-s.build.target[2])>1.5)continue;
    const target=hit.point,x=target[0]-axis[0]*Math.abs(handX),z=target[2]-axis[2]*Math.abs(handX);let clearance=Infinity,checked=0;const clearances={1:Infinity,2:Infinity};
    for(const row of bodyRows[p.id]){const by=row.y*row.scale*a.data.heightMetres,bx=row.x*row.scale*a.data.heightMetres,h=window.__constructionExterior({...s.build,target:[x,p.worldY,z]},axis,p.worldY+by);if(h){clearance=Math.min(clearance,h.distance-8-bx);clearances[row.pose]=Math.min(clearances[row.pose],h.distance-8-bx);checked++;}}
    let occluded=false;
    for(const portion of [-.48,0,.48]){const angle=orbit+portion*dt/s.build.visits/(b.end-b.start)*Math.PI*2,cx=center[0]+Math.sin(angle)*BUILD_VIEW.radius,cz=center[2]+Math.cos(angle)*BUILD_VIEW.radius;
     for(const by of [.2,.6,.9]){for(const bx of [-.18,0,.18]){const px=x+axis[0]*bx,pz=z+axis[2]*bx,dist=Math.hypot(px-cx,pz-cz),h=window.__constructionExterior({...s.build,target:[px,p.worldY,pz]},[(px-cx)/dist,0,(pz-cz)/dist],p.worldY+by*a.data.heightMetres);if(h&&h.distance<7.975)occluded=true;}}
    }
    if(occluded)continue;
    const shift=Math.max(0,-clearances[2]),upShift=Math.max(0,.008-clearances[1]);options.push({az,axis,target,node:hit.node,x:x-axis[0]*shift,z:z-axis[2]*shift,clearance:Math.min(clearances[2]+shift,clearances[1]+upShift),clearances,checked,shift,upShift,degrees,inset,sign:choiceSign});
    if(shift<.001&&Math.abs(degrees)<=20)break search;
   }}}
   sol=options.sort((a,b)=>(a.shift+Math.abs(a.degrees)*.0003+Math.abs(a.inset)*.003)-(b.shift+Math.abs(b.degrees)*.0003+Math.abs(b.inset)*.003))[0];if(!sol)throw Error('No exterior building contact '+key);buildSolutions.set(key,sol);
  }
  const poseShift=s.build.striking?0:sol.upShift-sol.shift;p.x=sol.x-sol.axis[0]*poseShift;p.z=sol.z-sol.axis[2]*poseShift;p.buildMirror=sol.sign<0;p.buildFacingAz=sol.az;s.build.workYaw=sol.az;s.build.worldRoot=[sol.x,p.worldY,sol.z];s.build.target=[...sol.target];s.build.contactNode=sol.node;
  s.build.costumeContact={height:handY,bodyClearance:sol.clearance,bodyRowsChecked:sol.checked,reachGap:sol.shift,raisedPoseStep:sol.upShift,platformCenter:[sol.x,p.worldY,sol.z],facingAdjustment:sol.degrees};

 };
 let poses=new Map(),time=0;const apply=layer.applyStory.bind(layer),update=layer.update.bind(layer);
 layer.applyStory=(p,t)=>{poses=new Map(p.map(p=>[p.id,p]));time=t;return apply(p,t)};
 let audit=[];
 layer.update=(camera,dt)=>{const result=update(camera,dt),state=layer.costumeSceneState,storyTime=state?.storyTime??state?.time??time;audit=[];
  for(const[a,r]of rigs){const p=poses.get(a.data.id),wolf=a.data.id==='wolf',normalWolf=wolf&&state?.branch?.id==='normal',base=normalWolf?defs.wolf_normal:defs[a.data.id],isWalk=['walk','walk_front'].includes(a.motion),run=['paper_run','run_two_pose','run_spiral'].includes(a.motion),fq=state?.fireScene?.elapsed;
   r.root.visible=a.card.visible&&a.requestedVisible;a.card.layers.set(31);for(const o of a.root.children)if(o!==r.root&&o!==a.card&&o!==a.shadow&&o!==r.flame)o.visible=false;
   if(!r.root.visible){r.ring.visible=false;continue;}
   let az=p?.buildFacingAz??Math.atan2(camera.position.x-a.root.position.x,camera.position.z-a.root.position.z),view=walkView(a.yaw,az,1),rear=!!p?.runAway||(isWalk&&view.rear&&a.motion!=='walk_front'),mirror=false,idx=0,d=base,kind='neutral',height=a.data.heightMetres;
   const walkIndex=Math.floor((p?.walkDistance??a.motionTime)/.40)%2;
   if(wolf){
    if(isWalk){if(rear){d=defs.rear_walk;idx=2+walkIndex;kind='walk_rear';}else if(a.motion==='walk_front'||Math.abs(view.side)<.45){idx=1+walkIndex;kind='walk_front';}else if(defs.walk){d=normalWolf?defs.wolf_walk_normal:defs.walk;idx=6+walkIndex;mirror=view.mirror;kind='walk_side';}else{idx=1+walkIndex;kind='walk_front';}}
    else if(a.motion==='blow'){idx=3;mirror=view.mirror;kind='blow';}
    else if(a.motion==='tired'){idx=5;kind='tired';}
    else if(p?.singleHotJump){idx=7;mirror=view.mirror;kind='hot_jump';}
    else if(run||a.motion==='startled'){idx=rear?8:6;mirror=rear?false:view.mirror;kind=rear?'escape_rear':'panic';}
    else if(normalWolf&&storyTime>=201){idx=6;kind='panic';mirror=view.mirror;}
    else if(normalWolf){const acting=wolfStoryActing(storyTime);d=defs.wolf_story_normal;idx=acting.index;kind=acting.name;}
    else if(defs.wolf_story){d=defs.wolf_story;idx=storyTime>=185.5?5:storyTime>=181.3?4:storyTime>=171.3?4:storyTime>=140.8&&storyTime<146.45?4:storyTime>=115?2:0;kind=['intent','smirk','talk','anger','frustration','idea'][idx];}
   }else{
    if(a.motion==='build_hammer'){idx=state?.build?.striking?2:1;mirror=!!p?.buildMirror;kind='build_'+(idx===2?'down':'up');}
    else if(a.motion==='celebrate_home'){idx=3;kind='joy';}
    else if(run||p?.encounterReaction||a.paperStatus?.reacting){idx=rear?7:4;mirror=!rear&&view.mirror;kind='fear';}
    else if(p?.ownerDoor){idx=5;mirror=true;kind='door';}
    else if(isWalk&&defs.walk){if(rear){d=defs['rear_walk_'+a.data.id]??defs.rear_walk;idx=walkIndex;kind='walk_rear';}else{d=defs.walk;idx=ids.indexOf(a.data.id)*2+walkIndex;mirror=view.mirror;kind='walk';}}
    if(fq!==undefined){if(a.data.id==='pig_brick'){idx=fq>=3&&fq<5.7?6:fq>=5.7&&fq<6.7?5:fq>=6.7?0:4;d=base;kind=fq>=3&&fq<5.7?'carry':fq>=5.7&&fq<6.7?'ignite':fq>=6.7?'relief':'notice';mirror=fq>=5.7&&fq<6.7;
      let x=p.x,z=p.z;if(fq>=3){const u=smooth((fq-3)/2.7);x=121.66+(119.28-121.66)*u;z=-81.4+.08*u;}if(fq>=6.03){const u=smooth((fq-6.03)/.67);x=119.28+.47*u;z=-81.32+.37*u;}a.root.position.set(x,30,z);
     }else{idx=fq<3?4:0;d=base;kind=fq<3?'notice':'watch';}}
   }
   if(p?.introPose){idx=p.introPose==='joy'?3:p.introPose==='greet'?5:p.introPose==='concern'?4:0;kind='intro_'+p.introPose;}
   const f=d.frames[idx],[cx,cy,cw,ch]=f.cell,[left,top,right,bottom]=f.bounds;let[ax,ay]=f.anchor;
   let scale=height/(bottom-top),clipBottom=ch;
   if(run){clipBottom=top+(bottom-top)*.77;scale=height/(bottom-top);}
   r.root.rotation.set(0,az,0);r.root.position.set(0,0,0);r.card.rotation.set((p?.introNod??0)*.07,0,0);
   const host=!!p?.ownerDoor&&fq===undefined;let handX=0,handY=height*.45;
   if(host){handX=(cw*.79-ax)*scale;handY=(ay-ch*.53)*scale;let x=p.ownerDoor.contactXZ[0],z=p.ownerDoor.contactXZ[1];for(let k=0;k<8;k++){az=Math.atan2(camera.position.x-x,camera.position.z-z);x=p.ownerDoor.contactXZ[0]+Math.cos(az)*handX;z=p.ownerDoor.contactXZ[1]-Math.sin(az)*handX;}a.root.position.set(x,p.ownerDoor.floor,z);r.root.rotation.y=az;}
   let u0=cx/d.size[0],u1=(cx+cw)/d.size[0];if(mirror){[u0,u1]=[u1,u0];ax=cw-ax;}
   const q=r.card.geometry.attributes.position,u=r.card.geometry.attributes.uv;q.setXYZ(0,-ax*scale,ay*scale,0);q.setXYZ(1,(cw-ax)*scale,ay*scale,0);q.setXYZ(2,-ax*scale,(ay-clipBottom)*scale,0);q.setXYZ(3,(cw-ax)*scale,(ay-clipBottom)*scale,0);u.setXY(0,u0,1-cy/d.size[1]);u.setXY(1,u1,1-cy/d.size[1]);u.setXY(2,u0,1-(cy+clipBottom)/d.size[1]);u.setXY(3,u1,1-(cy+clipBottom)/d.size[1]);q.needsUpdate=u.needsUpdate=true;r.card.geometry.computeBoundingSphere();r.card.material.map=mirror?d.mirrorTexture:d.texture;
   r.ring.visible=run;r.ring.material.map=ringMaps[Math.floor(Math.abs(a.motionTime||0)*10)%8];r.ring.scale.setScalar(height/1.35);
   if(r.flame?.visible){const offset=new THREE.Vector3((rear?.30:mirror?.47:-.47)*height/1.32,.43,.02).applyAxisAngle(new THREE.Vector3(0,1,0),az);r.flame.position.copy(offset);}
   r.root.updateWorldMatrix(true,true);const hand=host?new THREE.Vector3(-handX,handY,0):new THREE.Vector3(mirror?-.26:.26,height*.42,.025);r.root.localToWorld(hand);const mouth=new THREE.Vector3((kind==='blow'?(mirror?-.45:.45):0),height*.61,.025);r.root.localToWorld(mouth);
   a.paperStatus={...a.paperStatus,costume:true,pose:kind,poseIndex:idx,atlas:d.url,castCode:codes[ids.indexOf(a.data.id)],source:'scene-specific full-body sprites, no limb deformation',handWorld:hand.toArray(),mouthWorld:mouth.toArray(),running:run,rearView:rear,mirror,visibleFootY:0,lowerOriginalLegsVisible:!run,root:a.root.position.toArray()};
   let hammerError=null;if(kind==='build_down'&&state?.build){const hx=(hammerPixels[a.data.id][0]-f.anchor[0])*scale*(mirror?-1:1),hy=(f.anchor[1]-hammerPixels[a.data.id][1])*scale,hammer=new THREE.Vector3(hx,hy,0);r.root.localToWorld(hammer);hammerError=hammer.distanceTo(new THREE.Vector3(...state.build.target));}
   const box=new THREE.Box3().setFromObject(r.card),points=[new THREE.Vector3(box.min.x,box.min.y,box.min.z),new THREE.Vector3(box.max.x,box.max.y,box.max.z)].map(v=>v.project(camera).toArray());
   const projected=[0,1,2,3].map(i=>new THREE.Vector3().fromBufferAttribute(q,i).applyMatrix4(r.card.matrixWorld).project(camera)),screenBox={left:Math.min(...projected.map(v=>(v.x+1)/2)),right:Math.max(...projected.map(v=>(v.x+1)/2)),top:Math.min(...projected.map(v=>(1-v.y)/2)),bottom:Math.max(...projected.map(v=>(1-v.y)/2))};
   audit.push({screenBox,id:a.data.id,height:a.data.heightMetres,numberAtlas:mirror?(d.mirrorUrl??d.url):d.url,code:a.paperStatus.castCode,pose:kind,expression:normalWolf?(kind.startsWith('walk')?(rear?'rear_no_face':'confident'):kind==='blow'?'determined':kind==='tired'?'fatigue':kind==='hot_jump'||kind==='panic'?'heat_panic':kind):null,normalRouteWolf:normalWolf,idx,atlas:d.url,visible:r.root.visible,root:a.root.position.toArray(),oldCardRendered:a.card.layers.isEnabled(0),rear,mirror,ring:run,footY:a.root.position.y,groundY:ground(a.root.position.x,a.root.position.z),insideDepth:host?p.ownerDoor.thresholdZ-a.root.position.z:null,hand:hand.toArray(),mouth:mouth.toArray(),hammerError,buildContact:state?.build?.costumeContact??null,bodyClearance:state?.build?.costumeContact?.bodyClearance??null,bounds:points,tailFlame:!!r.flame?.visible});
  }return result;
 };window.__costumeAudit=()=>audit;return layer;
}
