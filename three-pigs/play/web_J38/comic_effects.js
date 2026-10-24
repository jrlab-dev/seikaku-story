import {createChimneyLid} from './chimney_lid.js';
import * as THREE from 'three';
import {createFullImage} from './full_image.js';
import {createStoryWind} from './story_wind.js';
import {createFireScene} from './fire_scene.js';
import {createStoryResult} from './story_result.js';
import {screamShake} from './scream_shake.mjs';
import {createChimneyReaction} from './chimney_reaction.js';
const overlap=(a,b)=>Math.max(0,Math.min(a[2],b[2])-Math.max(a[0],b[0]))*Math.max(0,Math.min(a[3],b[3])-Math.max(a[1],b[1]));
export function createComicEffects(scene,characters,ground){
 const chimney=createChimneyReaction(scene),lid=createChimneyLid(scene);if(typeof window!=='undefined')window.__chimneyLid=lid;
 const voiceTail=new THREE.Mesh(new THREE.BufferGeometry(),new THREE.MeshBasicMaterial({color:0xffd23f,side:THREE.DoubleSide,depthTest:false,depthWrite:false,toneMapped:false}));voiceTail.renderOrder=9999;voiceTail.frustumCulled=false;voiceTail.visible=false;scene.add(voiceTail);
 const fire=createFireScene(scene,characters),result=createStoryResult(scene),fullImage=createFullImage(scene),wind=createStoryWind(scene,characters,ground),cache=new Map(),sprite=new THREE.Sprite(new THREE.SpriteMaterial({transparent:true,depthTest:false,depthWrite:false,toneMapped:false}));sprite.renderOrder=10000;sprite.frustumCulled=false;scene.add(sprite);sprite.visible=false;let state,last=null;
 function texture(text,kind){const key=text+kind;if(cache.has(key))return cache.get(key);const c=document.createElement('canvas');c.width=1024;c.height=320;const x=c.getContext('2d'),pal={build:['#fff03c','#ff9d18','#ff493e'],breath:['#d9ffff','#38dcff','#3688ff'],collapse:['#fff540','#ff8b1f','#ff3154'],door:['#fff15e','#ff5b9d','#c33aff'],escape:['#f6ff45','#59f5df','#24b8fa'],tired:['#e9ffff','#8ce5ff','#77b1fc']}[kind]||['#fff22f','#ff9c21','#ff3b53'];
  x.translate(512,160);x.transform(1,0,-.10,1,0,0);x.lineJoin='round';x.lineCap='round';x.font='900 144px "Hiragino Kaku Gothic ProN",sans-serif';x.textAlign='center';x.textBaseline='middle';const w=Math.min(890,x.measureText(text).width);if(x.measureText(text).width>890)x.font='900 '+Math.floor(144*890/x.measureText(text).width)+'px "Hiragino Kaku Gothic ProN",sans-serif';
  x.save();x.translate(12,14);x.strokeStyle='#172333';x.lineWidth=53;x.strokeText(text,0,0);x.restore();x.strokeStyle='#fffce7';x.lineWidth=39;x.strokeText(text,0,0);x.strokeStyle='#172333';x.lineWidth=21;x.strokeText(text,0,0);const g=x.createLinearGradient(0,-72,0,72);g.addColorStop(0,pal[0]);g.addColorStop(.48,pal[1]);g.addColorStop(1,pal[2]);x.fillStyle=g;x.fillText(text,0,0);
  for(const sign of [-1,1]){x.strokeStyle=pal[1];x.lineWidth=7;x.beginPath();x.moveTo(sign*(w/2+35),-38);x.lineTo(sign*(w/2+55),-64);x.moveTo(sign*(w/2+31),40);x.lineTo(sign*(w/2+60),52);x.stroke();}
  const pixels=x.getImageData(0,0,1024,320).data;let l=1024,r=0,top=320,bottom=0;for(let yy=0;yy<320;yy++)for(let xx=0;xx<1024;xx++)if(pixels[(yy*1024+xx)*4+3]>8){l=Math.min(l,xx);r=Math.max(r,xx);top=Math.min(top,yy);bottom=Math.max(bottom,yy);}const t=new THREE.CanvasTexture(c);t.userData.opaqueBounds=[l/1024,top/320,r/1024,bottom/320];t.colorSpace=THREE.SRGBColorSpace;t.minFilter=t.magFilter=THREE.LinearFilter;cache.set(key,t);return t;
 }
 const project=(p,camera)=>{const q=new THREE.Vector3(...p).project(camera);return[(q.x+1)/2,(1-q.y)/2];};
 return{apply(s){state=s;chimney.apply(s.chimneyImpact);lid.apply(s);wind.apply(s);fire.apply(s);},updateVisual(camera){wind.updateVisual(camera);fire.update(camera);fullImage.update(state?.fullImage,camera);result.update(state?.resultCard,camera);const c=state?.comic;sprite.visible=!!c;voiceTail.visible=false;if(!c){last=null;return;}sprite.material.map=texture(c.text,c.kind);sprite.material.needsUpdate=true;
  const scream=c.kind==='chimney_scream',shake=screamShake(c.phase||0);
  const age=c.phase||0,pop=1+.13*Math.sin(Math.min(1,age/.16)*Math.PI)*Math.exp(-age*1.5),widthBase=(c.kind==='tired'?.52:c.kind==='collapse'?.70:.64)*(c.kind==='build'?1:Math.min(1.08,c.power||1))*pop,rotation=scream?.18+shake.textRotation:(c.side==='right'?-1:1)*(.055+.045*Math.exp(-age*10));
  let width=scream?1.28:widthBase,height=width*320/1024*camera.aspect;
  const ww=Math.cos(rotation)*width+Math.abs(Math.sin(rotation))*height/camera.aspect,hh=Math.cos(rotation)*height+Math.abs(Math.sin(rotation))*width*camera.aspect,faces=[],bodies=[];
  for(const a of characters.actors){if(!a.card.visible||!a.requestedVisible)continue;a.card.updateWorldMatrix(true,false);const box=new THREE.Box3().setFromObject(a.card),points=[];for(const xx of [box.min.x,box.max.x])for(const yy of [box.min.y,box.max.y])for(const zz of [box.min.z,box.max.z])points.push(project([xx,yy,zz],camera));const b=[Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1])),Math.max(...points.map(p=>p[0])),Math.max(...points.map(p=>p[1]))];if(b[2]<0||b[0]>1||b[3]<0||b[1]>1)continue;bodies.push(b);faces.push([b[0]-.015,b[1]-.015,b[2]+.015,b[1]+.48*(b[3]-b[1])]);}
  let source=c.sourceWorld?.slice();if(source&&c.sourceTerrainRelative)source[1]+=ground(source[0],source[2]);const point=source?project(source,camera):[.5,.5],action=[point[0]-.065,point[1]-.065,point[0]+.065,point[1]+.065];
  const alpha=sprite.material.map.userData.opaqueBounds,cs=Math.cos(rotation),sn=Math.sin(rotation),opaque=(x,y)=>{const ps=[];for(const u of[alpha[0],alpha[2]])for(const v of[alpha[1],alpha[3]]){const dx=(u-.5)*width,dy=(v-.5)*height;ps.push([x+cs*dx+sn*dy/camera.aspect,y-sn*dx*camera.aspect+cs*dy]);}return[Math.min(...ps.map(p=>p[0])),Math.min(...ps.map(p=>p[1])),Math.max(...ps.map(p=>p[0])),Math.max(...ps.map(p=>p[1]))];},off=opaque(0,0);
  const candidates=[];for(const y of [-off[1]+.008,.30,.46,.63])for(const x of [-off[0]+.015,1-off[2]-.015,.5]){const b=opaque(x,y);if(b[0]<.005||b[2]>.995||b[1]<.005||b[3]>.84)continue;const faceArea=faces.reduce((s,f)=>s+overlap(b,f),0),actionArea=c.kind==='alert'?0:overlap(b,action);let cost=faceArea*100000+actionArea*20000+bodies.reduce((s,f)=>s+overlap(b,f),0)*1500+y*3+Math.abs(x-point[0])*.2;candidates.push({x,y,b,cost,faceArea,actionArea});}
  candidates.sort((a,b)=>a.cost-b.cost);let pick=candidates[0]||{x:.5,y:.15,b:[0,0,1,.3],faceArea:0,actionArea:0};
  let sizeRatio=null;
  if(scream){
   const b=opaque(0,0),fit=Math.min(1,.93/(b[2]-b[0]),.71/(b[3]-b[1]));width*=fit;height*=fit;
   const o=opaque(0,0),cl=(x,a,b)=>Math.max(a,Math.min(b,x)),u=Math.min(1,age/.45),x=cl(point[0]+.13*u+shake.textX,.035-o[0],.965-o[2]),y=cl(point[1]-.23-.035*u+shake.textY,.035-o[1],.76-o[3]);
   pick={x,y,b:opaque(x,y),faceArea:0,actionArea:0};sizeRatio=width/.64;
   const pts=[[point[0],point[1]],[point[0]+.09,point[1]-.13],[point[0]+.045,point[1]-.11]].map(([x,y])=>new THREE.Vector3(x*2-1,1-y*2,.49).unproject(camera));
   voiceTail.geometry.setAttribute('position',new THREE.Float32BufferAttribute(pts.flatMap(p=>p.toArray()),3));voiceTail.geometry.computeBoundingSphere();voiceTail.visible=true;

  }sprite.position.set(pick.x*2-1,1-pick.y*2,.5).unproject(camera);const d=Math.abs(sprite.position.clone().applyMatrix4(camera.matrixWorldInverse).z),h=2*d*Math.tan(THREE.MathUtils.degToRad(camera.fov)/2);sprite.scale.set(h*camera.aspect*width,h*height,1);sprite.material.rotation=rotation;
  last={shake:scream?shake:null,sizeRatioVsNormalSameText:sizeRatio,text:c.text,kind:c.kind,phase:age,power:c.power,pulse:pop,screenWidthFraction:width,screenHeightFraction:height,rotation,bounds:pick.b,sourceWorld:source,sourceScreen:point,faceOverlap:pick.faceArea,actionOverlap:pick.actionArea,style:'color-gradient, heavy outline, offset shadow, impact rays',sizeTargetVersusJ83:1.8};
 },record(){return{chimney:chimney.record(),chimneyLid:lid.record(),wind:wind.record(),comic:last,fire:fire.record(),result:result.record()};},reset(){chimney.apply(null);state=null;last=null;sprite.visible=false;voiceTail.visible=false;wind.reset();}};
}
