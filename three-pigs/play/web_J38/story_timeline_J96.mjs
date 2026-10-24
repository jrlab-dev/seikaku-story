import * as BASE from './movement_story.mjs';
export * from './movement_story.mjs';
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)},lerp=(a,b,u)=>a+(b-a)*u;
export function wolfSourceTime(t){return t<202?t:t<203.15?202:t<204?202+(t-203.15)*2/.85:t;}
export function sampleStory(t){
 const source=wolfSourceTime(t),s=BASE.sampleStory(source);if(s.branch.id==='peace')return BASE.sampleStory(t);
 s.time=t;s.duration=224.7;s.wolfRevision={sourceTime:source,extraSeconds:0};
 const a=s.actors.find(a=>a.id==='wolf');
 if(t>=97.5&&t<100.5){
  const u=smooth((t-97.5)/3),base=s.camera,dx=base.position[0]-a.x,dz=base.position[2]-a.z,L=Math.hypot(dx,dz),factor=lerp(3.4/L,1,u);
  s.camera={...base,id:'J96_fullbody_entrance_pullback',position:[a.x+dx*factor,lerp(1.25,base.position[1],u),a.z+dz*factor],target:[a.x,lerp(.77,base.target[1],u),a.z],fov:lerp(36,base.fov,u)};
 }
 if(t>=201.5&&t<202){
  const end=BASE.sampleStory(202).actors.find(x=>x.id==='wolf'),base=BASE.sampleStory(201.5).camera,u=smooth((t-201.5)/.5),y=end.worldY??1.15;
  const pos=[end.x+2.5,y+1.4,end.z+4.5],target=[end.x,y+.88,end.z];
  s.camera={...base,id:'J96_approach_after_door_opens',position:base.position.map((x,i)=>lerp(x,pos[i],u)),target:base.target.map((x,i)=>lerp(x,target[i],u)),fov:lerp(base.fov,32,u),terrainRelative:false};
 }
 if(t>=202&&t<203.15){
  const q=t-202,jump=q>=.17&&q<=.87?.29*Math.sin(Math.PI*(q-.17)/.70):0,baseY=a.worldY??1.15;
  a.singleHotJump=true;a.motion='startled';a.motionTime=q;a.yOffset=jump;a.worldY=baseY+jump;a.runAway=false;a.encounterReaction={kind:'panic',elapsed:q};a.visible=true;
  s.tailFlame={active:true,elapsed:.7+q,fade:1};a.tailFlame=s.tailFlame;s.wolfExit={...s.wolfExit,expression:'panic',singleJump:true,jump};
  const close={position:[a.x+2.5,baseY+1.4,a.z+4.5],target:[a.x,baseY+.88,a.z],fov:32,terrainRelative:false};
  const u=smooth((q-.88)/.27),b=BASE.sampleStory(202).camera;
  s.camera={...close,id:'J96_hot_single_jump',position:close.position.map((x,i)=>lerp(x,b.position[i],u)),target:close.target.map((x,i)=>lerp(x,b.target[i],u)),fov:lerp(close.fov,b.fov,u)};
  s.comic={text:'あちっ、あちー！',kind:'alert',actor:'wolf',power:.82,phase:q,sourceWorld:[a.x,baseY+1.45+jump,a.z],sourceTerrainRelative:false,style:'J96_manga'};
  const text='おおかみ「あちっ、あちー！」';s.scene.caption=text;s.branch.caption={...s.branch.caption,text};
 }
 if(t>=203.15&&t<204)s.wolfRevision.fastExit=true;
 return s;
}
