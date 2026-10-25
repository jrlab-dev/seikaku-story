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
 const c=CENTER[site],head=[c[0]-.65,c[1]+1.64,c[2]+3.2],stand={x:c[0]-.65,z:c[2]+3.45};
 const camera={id:'J118_karakuri_'+site,position:[c[0]+4.6,c[1]+2.3,c[2]+9.2],target:[c[0]-.65,c[1]+1.25,c[2]+2.6],fov:46,terrainRelative:false};
 return function(s,q,L){
  adopt(s,baseAt(BRANCH[site]-.4));quiet(s);
  const wolf=s.actors.find(a=>a.id==='wolf');for(const a of s.actors)a.visible=a===wolf;
  for(const k of ['reactionPose','walkDistance','worldY','stance','bombPose'])delete wolf[k];
  Object.assign(wolf,{visible:true,x:stand.x,z:stand.z,yaw:Math.PI,yOffset:0,motion:'idle',motionTime:q});
  const sec=Math.max(0,Math.min(8,q-SEC0));
  s.houses={...s.houses,[site]:{...s.houses[site],intact:true,time:0,constructionStage:5,door:'closed',doorOpen:0,blowAway:false,security:q>=SEC0?sec:null}};
  s.camera=camera;let cap;
  if(q<SEC0){wolf.motion='blow';cap='狼「それなら、ふうーっ！」';}
  else if(sec<1.9){cap='ビーッ、ビーッ！ 発明の家のセキュリティが動き出した！';if(sec<.9)s.comic=comic('alarm','ビーッ！','alert',sec,[c[0],c[1]+5.4,c[2]],1.2);}
  else if(sec<3.6){wolf.motion='startled';wolf.motionTime=sec-1.9;cap='狼「いたっ！」';if(sec<2.8)s.comic=comic('bonk1','ゴツン！','collapse',sec-1.9,head,1.5);}
  else if(sec<4.1){wolf.motion='startled';wolf.motionTime=sec-3.6;cap='狼「ひゃあ、もうかんべん！」';s.comic=comic('bonk2','ゴツン！','collapse',sec-3.6,head,1.6);}
  else if(q<SEC0+8.2){const w=q-(SEC0+4.1),d=4.6*w;wolf.motion='walk';wolf.walkDistance=d;wolf.motionTime=w;wolf.yaw=0;wolf.z=stand.z+d;
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
