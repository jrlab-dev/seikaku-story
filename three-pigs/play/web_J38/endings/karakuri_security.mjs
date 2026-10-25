import * as BASE from '../story_timeline_v4.mjs';
import {openingSample,applyWolfPersonality,OPENING_DURATION,OPENING_SHIFT} from '../opening_v8.mjs';
import {PLAN as STRAW_PLAN} from './straw_holds.mjs';
import {WOOD_HOLDS} from './wood_holds.mjs';

const CENTER={straw:[2.1,0,-2.25],wood:[-20,-.14,-15],brick:[20,1.06,-14]};
const OWNER={straw:'長男',wood:'次男',brick:'三男'};
const BRANCH={straw:131,wood:160,brick:183};
export const LENGTH=13,SEC0=1.5;// 吹いてから1.5秒でセキュリティが動き出す（家の動きの時刻＝q-SEC0）
function baseAt(t){
 t=Math.max(0,Math.min(240.45,t));const old=t<OPENING_DURATION?0:Math.round((t-OPENING_SHIFT)*1e9)/1e9;
 let s=BASE.sampleStory(old);s.storyTime=old;s.time=t;s.scene={...s.scene,at:s.scene.at+OPENING_SHIFT};
 if(t<OPENING_DURATION)s=openingSample(s,t);
 return applyWolfPersonality(s,t);
}
function adopt(s,b){for(const k of Object.keys(s))delete s[k];Object.assign(s,b);}
function quiet(s){s.gustOverride=null;s.battle=null;s.intro=null;s.drama=null;s.escape=null;s.fireScene=null;s.tailFlame=null;s.chimneyImpact=null;s.resultCard=null;s.completion=null;s.comic=null;s.effects=[];}
const comic=(id,text,kind,phase,at,power=1.3)=>({id,start:0,duration:.9,text,kind,power,phase,sourceWorld:at,sourceTerrainRelative:false,style:'J84_manga'});

function makeScene(site){
 const c=CENTER[site],head=[c[0]-.65,c[1]+1.2,c[2]+3.2],stand={x:c[0]-.65,z:c[2]+3.2};
 const camera={id:'J118_karakuri_'+site,position:[c[0]+4.6,c[1]+2.3,c[2]+9.2],target:[c[0]-.65,c[1]+1.25,c[2]+2.6],fov:46,terrainRelative:false};
 return function(s,q,L){
  adopt(s,baseAt(BRANCH[site]-.4));quiet(s);
  const wolf=s.actors.find(a=>a.id==='wolf');for(const a of s.actors)a.visible=a===wolf;
  for(const k of ['reactionPose','walkDistance','worldY','stance','bombPose','bonkPose','runAway'])delete wolf[k];
  Object.assign(wolf,{visible:true,x:stand.x,z:stand.z,yaw:Math.PI,yOffset:0,motion:'idle',motionTime:q});
  const sec=Math.round(Math.max(0,Math.min(8,q-SEC0))*1e9)/1e9;
  s.houses={...s.houses,[site]:{...s.houses[site],intact:true,time:0,constructionStage:5,door:'closed',doorOpen:0,blowAway:false,security:q>=SEC0?sec:null}};
  const close=Math.max(0,Math.min(1,(sec-.6)/.8)),mix=(a,b)=>a+(b-a)*close;
  s.camera={...camera,position:camera.position.map((v,i)=>mix(v,[c[0]+2.8,c[1]+2.2,c[2]+8][i])),target:camera.target.map((v,i)=>mix(v,[c[0]-.5,c[1]+1.6,c[2]+3][i])),fov:mix(46,42)};let cap;
  if(q<SEC0){wolf.motion='blow';cap='狼「それなら、ふうーっ！」';}
  else if(sec<1.9){wolf.bonkPose=0;cap='ビーッ、ビーッ！ 発明の家のセキュリティが動き出した！';if(sec<.9)s.comic=comic('alarm','ビーッ！','alert',sec,[c[0],c[1]+5.4,c[2]],.75);}
  else if(sec<4.5){const hit=sec<3.6?1.9:3.6,r=sec-hit;wolf.bonkPose=r<.48?1:2;wolf.yOffset=Math.max(0,1.2-510*1.32/645)*Math.max(0,1-r/.22);
   cap=sec<3.6?'狼「いたたたっ！ 頭がじーんとする！」':'狼「ひゃあ、もうかんべん！」';if(r<.55)s.comic=comic('bonk'+hit,'ゴツン！','collapse',r,head,.5);
   if(sec>3.25&&sec<3.6)wolf.bonkPose=0;}
  else if(q<SEC0+8.2){const w=q-(SEC0+4.5),d=4.6*w;wolf.motion='run_spiral';wolf.walkDistance=d;wolf.motionTime=w;wolf.yaw=0;wolf.z=stand.z+d;
   const drop=Math.max(0,c[1])*Math.min(1,d/6);s.camera={...s.camera,position:[c[0]+2.8,c[1]+2.2-drop,c[2]+8+d*.85],target:[c[0]-.5,c[1]+1.3-drop,c[2]+3+d*.85]};
   cap='おおかみは、あわてて逃げ帰りました。';if(w<.8)s.comic=comic('run','ダダーッ！','escape',w,[wolf.x,1,wolf.z],1.2);if(d>9)wolf.visible=false;}
  else{wolf.visible=false;cap=OWNER[site]+'「やったね、ロボくん！」';}
  s.cutOpacity=q>L-.4?.85*Math.min(1,(q-(L-.4))/.4):0;
  return cap;
 };
}
export function karakuriPlan(site){
 const resumeScene=site==='straw'?STRAW_PLAN.resumeScene:site==='wood'?WOOD_HOLDS.resumeScene:undefined;
 return{branch:BRANCH[site],length:LENGTH,resume:228.7,scene:makeScene(site),resumeScene,finale:'発明の家のセキュリティで追い返したルート。みんな無事！'};
}
