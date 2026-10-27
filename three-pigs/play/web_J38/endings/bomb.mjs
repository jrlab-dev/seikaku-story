import {allFallScene,LENGTH as AF_LENGTH} from './all_fall.mjs';
import {siteHouses} from '../puzzle_houses.mjs';
import {getCast} from '../personality_story.mjs';
import * as BASE from '../story_timeline_v4.mjs';
import {openingSample,applyWolfPersonality,OPENING_DURATION,OPENING_SHIFT} from '../opening_v8.mjs';

export const BRANCH=183.0,BOMB=12.5,SKIP=3.6,LENGTH=BOMB+AF_LENGTH-SKIP;
function baseAt(t){
 t=Math.max(0,Math.min(240.45,t));const old=t<OPENING_DURATION?0:Math.round((t-OPENING_SHIFT)*1e9)/1e9;
 let s=BASE.sampleStory(old);s.storyTime=old;s.time=t;s.scene={...s.scene,at:s.scene.at+OPENING_SHIFT};
 if(t<OPENING_DURATION)s=openingSample(s,t);
 return applyWolfPersonality(s,t);
}
function adopt(s,b){for(const k of Object.keys(s))delete s[k];Object.assign(s,b);}
function quiet(s){s.gustOverride=null;s.battle=null;s.intro=null;s.drama=null;s.escape=null;s.fireScene=null;s.tailFlame=null;s.chimneyImpact=null;s.resultCard=null;s.completion=null;s.comic=null;s.effects=[];}
const HOUSE=[20,1.06,-14],SPOT=[19.35,-8.2],DOOR=[19.45,-10.9];
const CAM={id:'J118_bomb_wolf',position:[15.5,2.36,-9.6],target:[19.35,1.91,-8.2],fov:44,terrainRelative:false};
const HOUSE_CAM={id:'J118_bomb_house',position:[14.2,3.4,-1.6],target:[20,2.2,-13.2],fov:48,terrainRelative:false};

export function bombScene(s,q,L){
 if(q>=BOMB){const cap=allFallScene(s,q-BOMB+SKIP,AF_LENGTH);s.houses={...s.houses,brick:{...s.houses.brick,intact:true,constructionStage:1,blowAway:false}};return cap;}
 adopt(s,baseAt(BRANCH-.6));quiet(s);
 const wolf=s.actors.find(a=>a.id==='wolf');for(const a of s.actors)a.visible=a===wolf;
 for(const k of ['reactionPose','walkDistance','worldY','stance'])delete wolf[k];
 Object.assign(wolf,{visible:true,x:SPOT[0],z:SPOT[1],yaw:Math.PI,yOffset:0,motion:'idle',motionTime:q});
 let cap;s.camera=CAM;
 if(q<2.4){wolf.bombPose=0;cap='狼「吹いてもだめなら……そうだ！」';}
 else if(q<4.4){wolf.bombPose=1;cap='狼「できたぞ、特製のばくだん！」';}
 else if(q<6.2){wolf.bombPose=2;Object.assign(wolf,{x:DOOR[0]-.9,z:DOOR[1],yaw:Math.PI/2});s.camera=HOUSE_CAM;cap='狼「火をつけて……」';if(q>5.2)s.puzzleEffect={kind:'bomb',time:(q-5.2)*2,at:[DOOR[0],0,DOOR[1]+.4]};}
 else if(q<7.6){const w=q-6.2;s.puzzleEffect={kind:'bomb',time:2+w*2,at:[DOOR[0],0,DOOR[1]+.4]};delete wolf.bombPose;Object.assign(wolf,{x:DOOR[0]-.9-w*2.6,z:DOOR[1]+w*1.4,yaw:Math.atan2(-2.6,1.4),motion:'run_spiral',motionTime:w,runAway:false});s.camera=HOUSE_CAM;cap='狼「にげろー！」';}
 else if(q<8.8){s.puzzleEffect={kind:'bomb',time:4.8+(q-7.6)*2.5,at:[DOOR[0],0,DOOR[1]+.4]};wolf.bombPose=4;Object.assign(wolf,{x:DOOR[0]-4.5,z:DOOR[1]+2});s.camera=HOUSE_CAM;cap='……';}
 else{
  const r=q-8.8;wolf.visible=false;s.camera=HOUSE_CAM;
  s.houses={...s.houses,brick:{...s.houses.brick,intact:true,constructionStage:r<.6?5:1,blowAway:false}};s.puzzleEffect={kind:'explosion_house',time:Math.min(7.9,r),at:[HOUSE[0],0,HOUSE[2]]};
  if(r<1.1)s.comic={id:'bomb_boom',start:0,duration:1.1,text:'ドカーン！',kind:'collapse',house:'brick',power:1.6,phase:r,sourceWorld:[HOUSE[0],HOUSE[1]+3,HOUSE[2]],sourceTerrainRelative:false,style:'J84_manga'};
  cap='ドカーン！ 三男の家が、吹き飛びました！';
 }
 s.cutOpacity=0;
 return cap;
}
export function bombResume(s){const cap=bombScene(s,LENGTH-.001,LENGTH);s.scene={...s.scene,caption:cap};s.branch={...s.branch,caption:{...s.branch.caption,text:cap}};return s;}

export const BACKFIRE_LENGTH=22;
const SAY={fortress:'鉄の要塞は、びくともしない！ 爆風がはね返った！',castle:'お城は、びくともしない！ 爆風がはね返った！',karakuri_fort:'からくり要塞のパンチが、爆弾をはね返した！',karakuri:'見張りロボが、爆弾を打ち返した！',bunker:'地下シェルターは、地面の下で平気。爆風は狼のほうへ！'};
export function bombBackfireScene(s,q,L){
 if(q<8.8)return bombScene(s,q,L);
 adopt(s,baseAt(BRANCH-.6));quiet(s);
 const wolf=s.actors.find(a=>a.id==='wolf');for(const a of s.actors)a.visible=a===wolf;
 for(const k of ['reactionPose','walkDistance','worldY','stance'])delete wolf[k];
 const id=siteHouses(getCast()).brick.id,r=q-8.8;let cap;
 Object.assign(wolf,{visible:true,x:DOOR[0]-4.5,z:DOOR[1]+2,yaw:Math.PI,yOffset:0,motion:'idle',motionTime:q});s.camera=HOUSE_CAM;
 if(r<3.2){
  s.camera={id:'J118_bomb_backfire_flight',position:[10,5.5,5],target:[16,2.1,-8],fov:48,terrainRelative:false};
  if(r<1.1)s.comic={id:'bomb_boom',start:0,duration:1.1,text:'ドカーン！',kind:'collapse',house:'brick',power:1.6,phase:r,sourceWorld:[HOUSE[0],HOUSE[1]+3,HOUSE[2]],sourceTerrainRelative:false,style:'J84_manga'};
  s.puzzleEffect=[{kind:'explosion_small',time:Math.min(7.9,r),at:[DOOR[0],0,DOOR[1]+.6]}];
  if(r<.5)wolf.bombPose=4;else{const u=Math.min(1,(r-.5)/2.4);wolf.bombPose=5;Object.assign(wolf,{x:DOOR[0]-4.5-u*4,z:DOOR[1]+2+u*5,yOffset:3.2*Math.sin(Math.PI*Math.min(1,u*1.05))});}
  s.houses={...s.houses,brick:{...s.houses.brick,intact:true,constructionStage:5,gustHold:r}};
  cap=SAY[id]||SAY.fortress;
 }else if(r<6.5){wolf.bombPose=6;s.camera=CAM;Object.assign(wolf,{x:SPOT[0],z:SPOT[1]});cap='狼「け、けむい……」';}
 else if(r<10){wolf.bombPose=8;s.camera=CAM;Object.assign(wolf,{x:SPOT[0],z:SPOT[1]});cap='狼「爆弾は、もうこりごりだ……」';}
 else{const w=r-10,dx=-w*1.1,dz=w*.3;wolf.motion='walk';wolf.motionTime=w;wolf.walkDistance=1.1*w;Object.assign(wolf,{x:SPOT[0]+dx,z:SPOT[1]+dz,yaw:Math.atan2(-1.1,.3)});s.camera={...CAM,id:'J118_bomb_backfire_walks_home',position:[CAM.position[0]+dx,CAM.position[1],CAM.position[2]+dz],target:[CAM.target[0]+dx,CAM.target[1],CAM.target[2]+dz]};cap='おおかみは、すすだらけで帰っていきました。';
  s.cutOpacity=r>L-8.8-.4?.85*Math.min(1,(r-(L-8.8-.4))/.4):0;return cap;}
 s.cutOpacity=0;return cap;
}
