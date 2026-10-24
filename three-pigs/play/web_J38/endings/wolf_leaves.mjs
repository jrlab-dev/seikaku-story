import * as BASE from '../story_timeline_v4.mjs';
import {openingSample,applyWolfPersonality,OPENING_DURATION,OPENING_SHIFT} from '../opening_v8.mjs';

const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
export const BRANCH=134.3,LENGTH=25;

function baseAt(t){
 t=Math.max(0,Math.min(240.45,t));const old=t<OPENING_DURATION?0:Math.round((t-OPENING_SHIFT)*1e9)/1e9;
 let s=BASE.sampleStory(old);s.storyTime=old;s.time=t;s.scene={...s.scene,at:s.scene.at+OPENING_SHIFT};
 if(t<OPENING_DURATION)s=openingSample(s,t);
 return applyWolfPersonality(s,t);
}
function adopt(s,b){for(const k of Object.keys(s))delete s[k];Object.assign(s,b);}
function quiet(s){s.gustOverride=null;s.battle=null;s.intro=null;s.drama=null;s.escape=null;s.fireScene=null;s.tailFlame=null;s.chimneyImpact=null;s.resultCard=null;s.completion=null;s.comic=null;}
function put(a,o){delete a.reactionPose;delete a.reactionBuild;delete a.walkDistance;delete a.worldY;delete a.buildMirror;Object.assign(a,{visible:true,yOffset:0,motion:'idle',motionTime:0},o);}
const ROUTE=[[1.45,3.1],[4.72,4.17],[8.6,3.52],[13.55,1.9]];
function along(d){for(let i=0;i<ROUTE.length-1;i++){const[a,b]=[ROUTE[i],ROUTE[i+1]],l=Math.hypot(b[0]-a[0],b[1]-a[1]);if(d<=l||i===ROUTE.length-2){const u=Math.min(1,d/l);return{x:a[0]+(b[0]-a[0])*u,z:a[1]+(b[1]-a[1])*u,yaw:Math.atan2(b[0]-a[0],b[1]-a[1])};}d-=l;}}
const fadeIn=(q,at)=>q<at+.35?.85*(1-smooth((q-at)/.35)):0,fadeOut=(q,end)=>q>end-.4?.85*smooth((q-(end-.4))/.4):0;

export function wolfLeavesScene(s,q,L){
 const by=id=>s.actors.find(a=>a.id===id);let cap;
 if(q<11){
  adopt(s,baseAt(Math.min(BRANCH+q,138.5)));const camSrc=baseAt(BRANCH).camera;quiet(s);
  const wolf=by('wolf'),pig=by('pig_straw');for(const a of s.actors)a.visible=a===wolf||a===pig;
  put(pig,{x:1.45,z:-1.6,yaw:0});put(wolf,{x:1.45,z:3.1,yaw:Math.PI,motionTime:q});
  s.camera={...camSrc,id:'J116_wolf_leaves_startled'};
  if(q<3){wolf.motion='startled';cap='狼「わっ！ 音が大きすぎる！」';
   if(q<1.4)s.comic={id:'wolf_startled',start:BRANCH,duration:1.4,text:'ドサドサッ！',kind:'collapse',actor:'wolf',power:1,phase:q,sourceWorld:[1.45,1.25,3.1],sourceTerrainRelative:true,style:'J84_manga'};
   pig.reactionPose=7;}
  else if(q<6.5){wolf.reactionPose=4;cap='狼「……やっぱり、今日はやめておこう。」';pig.reactionPose=8;}
  else{
   const w=q-7.3;pig.reactionPose=8;
   if(w<0){wolf.reactionPose=5;wolf.yaw=Math.atan2(ROUTE[1][0]-ROUTE[0][0],ROUTE[1][1]-ROUTE[0][1]);}
   else{const d=1.15*w,p=along(d);Object.assign(wolf,{motion:'walk',walkDistance:d,motionTime:w,x:p.x,z:p.z,yaw:p.yaw});}
   cap=q<8.9?'おおかみは、来た道を戻っていきました。':'長男は、ぽかんと見送りました。';
   const u=smooth((q-6.5)/4.5),P=camSrc.position,T=camSrc.target;s.camera={...camSrc,id:'J116_wolf_leaves_walk',position:[P[0]+2.0*u,P[1],P[2]-.4*u],target:[T[0]+3.2*u,T[1]-.1*u,T[2]+2.2*u]};
  }
  s.cutOpacity=fadeOut(q,11);
 }else if(q<15){
  adopt(s,baseAt(139));quiet(s);
  const straw=by('pig_straw'),wood=by('pig_wood'),brick=by('pig_brick');for(const a of s.actors)a.visible=a!==by('wolf');
  put(wood,{x:-20.4,z:-9.2,yaw:1.2});put(brick,{x:-19.3,z:-10.2,yaw:1.2});
  const w=Math.min(q-11,2.3),d=1.25*w,dir=[-.9,-.44];
  put(straw,{x:-14.6+dir[0]*d,z:-9.6+dir[1]*d,yaw:Math.atan2(dir[0],dir[1])});
  if(q-11<2.3){straw.motion='walk';straw.walkDistance=d;straw.motionTime=w;}else straw.yaw=Math.PI+.1;
  if(q<12.6){cap='長男は、次男の家へ行きました。';wood.reactionPose=6;}
  else{cap='次男・三男「だいじょうぶだった？」';wood.reactionPose=5;brick.reactionPose=2;}
  s.camera={id:'J116_wolf_leaves_wood_meet',position:[-14.6,1.9,-4.6],target:[-18.6,.85,-10.4],fov:46,terrainRelative:true};
  s.cutOpacity=Math.max(fadeIn(q,11),fadeOut(q,15));
 }else if(q<21.5){
  const keep=baseAt(139).houses,bt=47.2+(q-15)/6.5*(58.6-47.2);adopt(s,baseAt(bt));quiet(s);
  s.houses={...s.houses,wood:keep.wood,brick:keep.brick};
  const straw=by('pig_straw'),wood=by('pig_wood'),brick=by('pig_brick');for(const a of s.actors)a.visible=a!==by('wolf');
  put(wood,{x:-.3,z:1.9,yaw:.35});put(brick,{x:5.0,z:-3.0,yaw:-.35});
  wood.reactionPose=q<18?1:6;brick.reactionPose=q<19.8?2:6;
  cap=q<18?'3びきで、わらの家を建て直します。':q<19.8?'次男「結び目は、しっかりね。」':'三男「すき間も、確かめよう。」';
  s.camera={...s.camera,id:'J116_wolf_leaves_rebuild'};
  s.cutOpacity=Math.max(fadeIn(q,15),fadeOut(q,21.5));
 }else{
  const keep=baseAt(139).houses;adopt(s,baseAt(60.5));quiet(s);s.build=null;
  s.houses={...s.houses,wood:keep.wood,brick:keep.brick};
  const straw=by('pig_straw'),wood=by('pig_wood'),brick=by('pig_brick');for(const a of s.actors)a.visible=a!==by('wolf');
  lineup(s);
  cap='おおかみは、もう来ませんでした。3びきは、わらの家を建て直しました。';
  s.camera=shiftCamera(baseAt(228.7).camera,'J116_wolf_leaves_together');
  s.cutOpacity=Math.max(fadeIn(q,21.5),fadeOut(q,L));
 }
 return cap;
}

const BRICK_C=[20,1.06,-14],STRAW_C=[2.1,0,-2.25];
const SHIFT={x:STRAW_C[0]-BRICK_C[0],y:STRAW_C[1]-BRICK_C[1],z:STRAW_C[2]-BRICK_C[2]};
const LINE={pig_straw:[18.0+SHIFT.x,-8.8+SHIFT.z],pig_wood:[19.7+SHIFT.x,-8.8+SHIFT.z],pig_brick:[21.4+SHIFT.x,-8.8+SHIFT.z]};
const JOY={pig_straw:4,pig_wood:4,pig_brick:3};
function lineup(s,joy=true){for(const a of s.actors){if(a.id==='wolf'){a.visible=false;continue;}put(a,{x:LINE[a.id][0],z:LINE[a.id][1],yaw:0});if(joy)a.reactionPose=JOY[a.id];}}
function shiftCamera(c,id){const dy=c.terrainRelative?0:SHIFT.y;return{...c,id,position:[c.position[0]+SHIFT.x,c.position[1]+dy,c.position[2]+SHIFT.z],target:[c.target[0]+SHIFT.x,c.target[1]+dy,c.target[2]+SHIFT.z]};}
let doneStraw=null,keptWood=null;
export function wolfLeavesResume(s,baseTime){
 lineup(s,!!s.camera?.id?.startsWith('J80'));
 if(s.camera)s.camera=shiftCamera(s.camera,s.camera.id+'_at_straw');
 doneStraw??=baseAt(60.5).houses.straw;keptWood??=baseAt(139).houses.wood;
 s.houses={...s.houses,straw:{...doneStraw},wood:{...keptWood},brick:{...s.houses.brick,door:'closed',doorOpen:0}};
 s.egress=null;s.fireScene=null;s.tailFlame=null;s.comic=null;s.battle=null;s.gustOverride=null;
 if(s.chimneyImpact)s.chimneyImpact={...s.chimneyImpact,active:false};
 return s;
}
