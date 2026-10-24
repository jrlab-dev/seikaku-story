import * as BASE from '../story_timeline_v4.mjs';
import {openingSample,applyWolfPersonality,OPENING_DURATION,OPENING_SHIFT} from '../opening_v8.mjs';

const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
export const BRANCH=183.0,LENGTH=15;
function baseAt(t){
 t=Math.max(0,Math.min(240.45,t));const old=t<OPENING_DURATION?0:Math.round((t-OPENING_SHIFT)*1e9)/1e9;
 let s=BASE.sampleStory(old);s.storyTime=old;s.time=t;s.scene={...s.scene,at:s.scene.at+OPENING_SHIFT};
 if(t<OPENING_DURATION)s=openingSample(s,t);
 return applyWolfPersonality(s,t);
}
function adopt(s,b){for(const k of Object.keys(s))delete s[k];Object.assign(s,b);}
function quiet(s){s.gustOverride=null;s.battle=null;s.intro=null;s.drama=null;s.escape=null;s.fireScene=null;s.tailFlame=null;s.chimneyImpact=null;s.resultCard=null;s.completion=null;s.comic=null;s.effects=[];}
function put(a,o){delete a.reactionPose;delete a.reactionBuild;delete a.walkDistance;delete a.worldY;delete a.buildMirror;delete a.stance;Object.assign(a,{visible:true,yOffset:0,motion:'idle',motionTime:0},o);}
const BRICK=[20,1.06,-14];
const START=[19.2,-7.6],DIR=(()=>{const d=[-1,.28],l=Math.hypot(...d);return[d[0]/l,d[1]/l];})();

export function allFallScene(s,q,L){
 const by=id=>s.actors.find(a=>a.id===id);let cap;
 if(q<3.6){
  adopt(s,baseAt(BRANCH-.6));quiet(s);
  for(const a of s.actors)a.visible=a.id==='wolf';
  s.houses={...s.houses,brick:{...s.houses.brick,intact:false,time:q*1.1,blowAway:true}};
  cap='三男の家も、吹き飛んでしまいました！';
 }else if(q<8){
  adopt(s,baseAt(BRANCH-.6));quiet(s);
  s.houses={...s.houses,brick:{...s.houses.brick,intact:false,time:8,blowAway:true}};
  const w=q-3.6,speed=4.2;
  ['pig_straw','pig_wood','pig_brick'].forEach((id,i)=>{const d=w*speed-i*1.1,x=START[0]+DIR[0]*d+(i-1)*.35*DIR[1],z=START[1]+DIR[1]*d-(i-1)*.35*DIR[0];
   put(by(id),{x,z,yaw:Math.atan2(DIR[0],DIR[1]),motion:'paper_run',motionTime:Math.max(0,d),runAway:true});});
  const wolf=by('wolf');wolf.visible=false;
  const lead=START[0]+DIR[0]*(w*speed-1.1),leadZ=START[1]+DIR[1]*(w*speed-1.1);
  s.camera={id:'J118_three_flee',position:[lead-DIR[1]*6.2+DIR[0]*2.2,2.3,leadZ+DIR[0]*6.2+DIR[1]*2.2],target:[lead,0.9,leadZ],fov:46,terrainRelative:false};
  cap='三びきは、あわてて逃げ出しました――';
 }else{
  adopt(s,baseAt(BRANCH-.6));quiet(s);for(const a of s.actors)a.visible=false;
  const r=q-8;s.fullImage={key:r<4?'dinner_a':'dinner_b'};
  cap=r<4?'その夜、おおかみの家では――':'おおかみ「ごちそうさまでした。」';
  if(r>=5.2)s.resultCard={elapsed:r-5.2,completion:Math.min(1,(r-5.2)/1.6),label:'ストーリー完成度',meaning:'狼のごちそうルート'};
 }
 s.cutOpacity=0;
 return cap;
}
export function allFallResume(s){const cap=allFallScene(s,LENGTH-.001,LENGTH);s.scene={...s.scene,caption:cap};s.branch={...s.branch,caption:{...s.branch.caption,text:cap}};return s;}
