import {getStoryAssetPlan} from './story_asset_plan.mjs';
import {isPigEscapeMotion} from './pig_escape.mjs';
import * as THREE from 'three';
import {frameQuad} from './sprite_math.mjs';

export const REACTIONS={
 fear:{label:'怖がりな反応',line:'「わっ！……こ、こわかった！」',onset:1.02,markAt:1.04,markEnd:1.72,recover:3.8,color:'#235b82',symbol:'!!'},
 calm:{label:'落ち着いた反応',line:'「……大丈夫。道を確かめよう。」',onset:1.5,markAt:1.55,markEnd:2.06,recover:2.35,color:'#385c43',symbol:'…'},
 anger:{label:'怒りやすい反応',line:'「ちょっと！……まずは逃げよう。」',onset:1.18,markAt:1.22,markEnd:1.85,recover:2.85,color:'#a53b28',symbol:'anger'}
};
const clamp=x=>Math.max(0,Math.min(1,x));
function textureCanvas(draw,w=256,h=256){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.minFilter=t.magFilter=THREE.LinearFilter;return t;}
function markTexture(profile){return textureCanvas((c,w,h)=>{
 c.lineJoin='round';c.lineCap='round';c.strokeStyle='#fff7df';c.lineWidth=19;c.fillStyle=profile.color;
 if(profile.symbol==='anger'){
  const strokes=[[[50,100],[88,100],[88,56]],[[130,56],[130,100],[176,100]],[[50,140],[88,140],[88,187]],[[130,187],[130,140],[176,140]]];
  for(const pts of strokes){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
  c.strokeStyle=profile.color;c.lineWidth=10;for(const pts of strokes){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
 }else if(profile.symbol==='…'){for(const px of [80,128,176]){c.beginPath();c.arc(px,128,12,0,Math.PI*2);c.fill();}}
 else{c.font='900 145px sans-serif';c.textAlign='center';c.textBaseline='middle';c.strokeText(profile.symbol,128,126);c.fillText(profile.symbol,128,126);}
 });}
function expressionTexture(original,frame,kind){
 const c=document.createElement('canvas');c.width=original.width;c.height=original.height;const ctx=c.getContext('2d');ctx.drawImage(original,0,0);
 const [ox,oy,w,h]=frame.cell;const point=(u,v)=>[ox+u*w,oy+v*h];
 const skin=(u,v)=>{const [x,y]=point(u,v),d=ctx.getImageData(Math.round(x),Math.round(y),1,1).data;return 'rgb('+d[0]+','+d[1]+','+d[2]+')';};
 ctx.lineCap='round';ctx.lineJoin='round';
 for(const [u,v]of [[.42,.273],[.65,.255]]){
  const [x,y]=point(u,v);ctx.fillStyle=skin(u-.065,v+.07);ctx.beginPath();ctx.ellipse(x,y,w*.068,h*.062,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#452c22';ctx.lineWidth=3.6;
  if(kind==='calm'){ctx.beginPath();ctx.moveTo(x-13,y+3);ctx.quadraticCurveTo(x,y-7,x+13,y+3);ctx.stroke();}
  else {
   ctx.fillStyle='#fff9e7';ctx.beginPath();ctx.ellipse(x,y,kind==='fear'?15:14,kind==='fear'?23:15,0,0,Math.PI*2);ctx.fill();ctx.stroke();
   ctx.fillStyle='#352820';ctx.beginPath();ctx.ellipse(x+(kind==='anger'?3:0),y+3,kind==='fear'?4:5,kind==='fear'?7:8,0,0,Math.PI*2);ctx.fill();
   if(kind==='anger'){ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x-16,y-20+(u<.5?-6:5));ctx.lineTo(x+16,y-20+(u<.5?5:-6));ctx.stroke();}
  }
 }
 ctx.strokeStyle=skin(.55,.413);ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(...point(.407,.338));ctx.bezierCurveTo(...point(.45,.397),...point(.63,.389),...point(.66,.329));ctx.stroke();
 const [mx,my]=point(.55,.388);
 ctx.strokeStyle='#57362c';ctx.fillStyle='#57362c';ctx.lineWidth=3.5;
 if(kind==='fear'){ctx.beginPath();ctx.ellipse(mx,my,8,11,0,0,Math.PI*2);ctx.fill();}
 if(kind==='calm'){ctx.beginPath();ctx.moveTo(mx-12,my);ctx.quadraticCurveTo(mx,my+6,mx+12,my);ctx.stroke();}
 if(kind==='anger'){ctx.beginPath();ctx.moveTo(mx-15,my+3);ctx.lineTo(mx+15,my-1);ctx.stroke();}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.generateMipmaps=false;t.minFilter=t.magFilter=THREE.LinearFilter;return t;
}
function paperMaterial(map,backOnly=false){
 const m=new THREE.MeshBasicMaterial({map,side:THREE.DoubleSide,alphaTest:.5,transparent:false,toneMapped:false});
 m.onBeforeCompile=shader=>{
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n'+(backOnly?'diffuseColor.rgb=vec3(.98,.91,.73);':'if(!gl_FrontFacing) diffuseColor.rgb=vec3(.88,.80,.64);'));
 };m.customProgramCacheKey=()=>backOnly?'paper-edge-v1':'paper-front-back-v1';return m;
}
export async function installPaperTheatre(layer){
 const runDefinitions=await (await fetch('./run_cycles.json')).json(),runClips={};
 for(const [id,def]of Object.entries(runDefinitions)){const ms=getStoryAssetPlan()?.motions[id];if(ms&&!ms.some(m=>isPigEscapeMotion(m)))continue;const textures=await Promise.all(def.frames.map(async f=>{const t=await new THREE.TextureLoader().loadAsync(f.url);t.colorSpace=THREE.SRGBColorSpace;t.generateMipmaps=false;t.minFilter=t.magFilter=THREE.LinearFilter;return t;}));runClips[id]={...def,textures};}
 const original=layer.update.bind(layer),originalApply=layer.applyStory.bind(layer);let profile='fear',time=0,enabled=true,manual=false,manualTempo=null,storyTime=0,storyReaction=false,encounterReaction=null;
 const data=new Map(),runTimes=new Map();
 for(const a of layer.actors){
  const h=a.data.heightMetres,source=a.card.geometry,grid=new THREE.PlaneGeometry(1,1,24,24),edge=new THREE.Mesh(grid.clone(),paperMaterial(a.card.material.map,true));
  edge.name='paper_cut_edge';a.root.add(edge);
  const originalMat=a.card.material,material=paperMaterial(originalMat.map),run=runClips[a.data.id],runMaterial=run?new THREE.MeshBasicMaterial({map:run.textures[0],transparent:true,alphaTest:7/255,side:THREE.DoubleSide,toneMapped:false,depthWrite:true}):null;
  const mark=new THREE.Mesh(new THREE.PlaneGeometry(h*.55,h*.55),new THREE.MeshBasicMaterial({map:markTexture(REACTIONS.fear),transparent:true,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));a.root.add(mark);
  const originalTexture=originalMat.map,faces=a.data.id==='pig_straw'?Object.fromEntries(Object.keys(REACTIONS).map(k=>[k,expressionTexture(originalTexture.image,a.data.frames[0],k)])):{};
  data.set(a,{source,grid,edge,originalMat,material,run,runMaterial,mark,originalTexture,faces,marks:Object.fromEntries(Object.entries(REACTIONS).map(([k,v])=>[k,markTexture(v)]))});
 }
 layer.applyStory=(poses,t)=>{runTimes.clear();for(const p of poses)if(Number.isFinite(p.spiralRunTime))runTimes.set(p.id,p.spiralRunTime);encounterReaction=poses.find(p=>p.encounterReaction)?.encounterReaction??null;storyTime=t;storyReaction=poses.some(p=>p.id==='pig_straw'&&['straw_inside','straw_continuous_escape','wood_inside','wood_continuous_escape'].includes(p.anchor))&&((t>=72.3&&t<81)||(t>=90.3&&t<102));if(!manual)time=t-(t>=90.3&&t<102?90.3:72.3);if(encounterReaction)time=1.02+encounterReaction.elapsed;return originalApply(poses,t);};
 layer.update=(camera,dt)=>{
  for(const[a,d]of data){a.card.geometry=d.source;a.card.material=d.originalMat;a.card.rotation.z=0;d.edge.visible=d.mark.visible=false;}
  const result=original(camera,dt);if(!enabled)return result;
  for(const[a,d]of data){
   if(!a.card.visible)continue;
   if(a.renderedMotion==='walk'&&!isPigEscapeMotion(a.motion))continue;// J118：歩きは描いたコマをそのまま見せる（紙を揺らす・曲げる表現をしない）
   const h=a.data.heightMetres,isPig=a.data.id.startsWith('pig_'),running=isPig&&isPigEscapeMotion(a.motion),lead=a.data.id==='pig_straw',reactor=(manual||storyReaction||!!encounterReaction)&&(lead||(a.data.id==='pig_wood'&&storyTime>=90.3&&storyTime<102)),r=REACTIONS[profile],emotional=reactor&&time>=r.onset&&time<r.recover,react=emotional&&!running;
   let q,uv,map;
   const showMark=()=>{d.mark.visible=!encounterReaction&&reactor&&time>=r.markAt&&time<Math.max(r.markEnd,2.45);if(d.mark.visible){d.mark.material.map=d.marks[profile];d.mark.quaternion.copy(camera.quaternion);d.mark.position.set(h*.52,h*1.17,0);const pop=1+.16*Math.sin(clamp((time-r.markAt)/.16)*Math.PI);d.mark.scale.setScalar(pop);}};
   if(running&&d.run){
    const k=h/d.run.nominalHeight,idx=((Math.floor((runTimes.get(a.data.id)??storyTime)*13*(manualTempo??1))%d.run.frames.length)+d.run.frames.length)%d.run.frames.length,pos=d.grid.attributes.position,u=d.grid.attributes.uv,[w,ht]=d.run.canvas,[ax,ay]=d.run.anchor,scale=k/d.run.pixelsPerMetre,mirror=Math.sin(a.yaw-a.card.rotation.y)<0;
    q={left:-ax*scale,right:(w-ax)*scale,top:ay*scale,bottom:(ay-ht)*scale};
    for(let i=0;i<pos.count;i++){const col=i%25,row=Math.floor(i/25),nx=col/24,ny=1-row/24;pos.setXYZ(i,q.left+nx*(q.right-q.left),q.bottom+ny*(q.top-q.bottom),0);u.setXY(i,mirror?1-nx:nx,ny);}
    pos.needsUpdate=u.needsUpdate=true;d.grid.computeBoundingSphere();a.card.geometry=d.grid;d.runMaterial.map=d.run.textures[idx];a.card.material=d.runMaterial;a.card.rotation.set(0,Math.atan2(camera.position.x-a.root.position.x,camera.position.z-a.root.position.z),0);a.renderedMotion='paper_run';showMark();
    const bounds=d.run.frames[idx].bounds;
    a.paperStatus={profile:reactor?profile:null,paper:true,running,runRepresentation:'approved J68 integrated run mechanism',runFrame:idx,mirror,source:d.run.source,lowerOriginalLegsVisible:false,bodyBottom:q.bottom,bodyTopY:q.top,visibleTopY:(ay-bounds[1])*scale,visibleFootY:(ay-bounds[3])*scale,markVisible:d.mark.visible,root:a.root.position.toArray()};continue;
   }
   if(running||react){
    const frame=a.data.frames[running?1:0];q=frameQuad(frame,h);uv=frame.uvRect;map=react?(d.faces[profile]??d.originalTexture):d.originalTexture;
   }else{
    const pos=d.source.attributes.position,u=d.source.attributes.uv;
    q={left:pos.getX(0),right:pos.getX(1),top:pos.getY(0),bottom:pos.getY(2)};uv=[u.getX(2),u.getY(2),u.getX(1),u.getY(1)];map=d.originalMat.map;
   }
   const bottom=q.bottom,top=q.top,ratio=(bottom-q.bottom)/(q.top-q.bottom),vBottom=uv[1]+ratio*(uv[3]-uv[1]);
   const elapsed=time-r.onset,envelope=emotional?Math.exp(-Math.max(0,elapsed)*(profile==='fear'?.4:profile==='anger'?.9:2.2)):0;
   const wobble=encounterReaction?.025*Math.sin(time*12):profile==='fear'?Math.sin(elapsed*26)*.16*envelope:profile==='anger'?Math.sin(elapsed*15)*.12*envelope:Math.sin(elapsed*5)*.035*envelope;
   const turn=encounterReaction?.08*Math.sin(time*7):react?(profile==='fear'?1.35*Math.sin(elapsed*11)*envelope:profile==='anger'?.48*Math.sin(elapsed*7)*envelope:.12*Math.sin(elapsed*4)*envelope):running?.07*Math.sin(time*9):.025*Math.sin(time*2);
   const bend=emotional?(profile==='fear'?.24:profile==='anger'?.18:.055)*envelope*(running?.45:1):running?.07:.018;
   const pos=d.grid.attributes.position,u=d.grid.attributes.uv;
   for(let i=0;i<pos.count;i++){const col=i%25,row=Math.floor(i/25),nx=col/24,ny=1-row/24,y=bottom+ny*(top-bottom),x=q.left+nx*(q.right-q.left),z=bend*h*Math.sin(nx*Math.PI)*Math.sin(ny*Math.PI/2);pos.setXYZ(i,x+wobble*(y-bottom),y,z);u.setXY(i,uv[0]+nx*(uv[2]-uv[0]),vBottom+ny*(uv[3]-vBottom));}
   pos.needsUpdate=u.needsUpdate=true;d.grid.computeBoundingSphere();a.card.geometry=d.grid;a.card.material=d.material;d.material.map=map;a.card.rotation.y+=turn;
   d.edge.geometry.copy(d.grid);d.edge.geometry.scale(1.016,1.006,1);d.edge.material.map=map;d.edge.rotation.copy(a.card.rotation);d.edge.position.set(-Math.sin(a.card.rotation.y)*.006,0,-Math.cos(a.card.rotation.y)*.006);d.edge.visible=true;
   showMark();
   a.paperStatus={profile:lead?profile:null,paper:true,running,runRepresentation:running?'source art pending':null,lowerOriginalLegsVisible:running?false:null,bodyBottom:bottom,markVisible:d.mark.visible,reacting:react,turnRadians:turn,bendMetres:bend*h,bodyTopY:top,bodyStandingTopY:q.top,root:a.root.position.toArray()};
  }
  return result;
 };
 const controls=document.createElement('div');controls.id='paper-controls';controls.style.cssText='position:fixed;top:12px;right:14px;z-index:30;background:#fff5dd;padding:10px;border-radius:12px;color:#302e28;font:14px system-ui';controls.textContent='紙人形の反応：';
 for(const[k,r]of Object.entries(REACTIONS)){const button=document.createElement('button');button.textContent=r.label;button.style.margin='4px';button.onclick=()=>{profile=k;manual=false;window.__storyTest.setBranch('normal').then(()=>{window.__storyTest.seek(72.3);window.__storyTest.play();});};controls.append(button);}
 document.body.append(controls);
 return {setTempo(value){manualTempo=value;},setTrails(value){},set(k,t){if(!REACTIONS[k])throw Error('Unknown paper reaction');profile=k;time=t;manual=true;enabled=true;},status(){return{profile,time,reaction:REACTIONS[profile],actors:layer.actors.filter(a=>a.card.visible).map(a=>({id:a.data.id,...a.paperStatus,rotorMinimumWorldY:a.paperStatus?.running&&data.get(a).run?a.root.position.y+(a.paperStatus.visibleFootY??0):null,legCycle:[]})),facialMethod:'runtime vector stage makeup over unchanged source atlas',bigFiveClaim:'illustrative reactions, not a psychometric or moral classification'};}};
}

