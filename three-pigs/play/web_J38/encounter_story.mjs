import * as BASE from './road_escape_story.mjs';
import {branchId} from './branch_context.mjs';
export * from './road_escape_story.mjs';
export let STORY_DURATION=224.7,SCENES=[];
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);},mix=(a,b,u)=>a+(b-a)*u;
export const sourceJ84Time=t=>t<97.5?t:t<100.5?97.5:t<105.5?t-3:t<110?102.5:t-7.5;
export function selectBranch(id){BASE.selectBranch(id);STORY_DURATION=id==='peace'?BASE.STORY_DURATION:224.7;SCENES=BASE.SCENES.map(s=>({...s,at:id==='peace'?s.at:s.at+(s.at>=102.5?7.5:s.at>=97.5?3:0)}));return{id,duration:STORY_DURATION};}
export function sampleStory(t){if(branchId()==='peace')return BASE.sampleStory(t);t=Math.max(0,Math.min(224.7,t));const old=sourceJ84Time(t),s=BASE.sampleStory(old);s.time=t;s.duration=224.7;s.ended=t>=224.7;s.j85SourceTime=old;
 if(t>=97.5&&t<100.5){const q=t-97.5,a=s.actors.find(a=>a.id==='wolf');Object.assign(a,{x:14.35-1.6*q,z:4.3-.018*(14.35-1.6*q-2)**2+1.446045*smooth(q/3),yaw:-Math.PI/2,motion:'walk_front',motionTime:q,visible:true});s.camera={id:'J85_frontal_wolf_approach',position:[4.3,1.65,5.2],target:[a.x,.85,a.z],fov:44,terrainRelative:true};s.comic=null;s.cutOpacity=0;s.frontApproach={elapsed:q,sourceArtUnchanged:true};s.scene.caption='道の向こうから、おおかみが歩いてきます。';s.branch.caption={...s.branch.caption,text:s.scene.caption};}
 if(t>=104.6&&t<110){const q=t-105.5,a=s.actors.find(a=>a.id==='pig_straw'),open=q<1.8?smooth((t-104.6)/.5):1-smooth((q-1.8)/.32);Object.assign(s.houses.straw,{doorOpen:open,door:open>.01?'open':'closed',doorSwing:'inward'});Object.assign(a,{visible:true,x:1.45-1.15*smooth((q-1.35)/.4),z:-.78-.9*smooth((q-1.35)/.4),worldY:.3,yaw:0,motion:'idle',motionTime:q,yOffset:0});delete a.ownerDoor;
  if(q>=0&&q<2.12)a.encounterReaction={elapsed:Math.min(1.1,Math.max(0,q-.1))};if(q>=1.35&&q<2.12)a.encounterClose={progress:smooth((q-1.35)/.77)};
  s.encounter={elapsed:q,phase:q<0?'peek':q<1.35?'notice':q<1.8?'inside':q<2.12?'slam':'closed',doorOpen:open,insideDepth:-.05-a.z};
  if(q>=0){const from=BASE.sampleStory(102.5).camera,u=smooth(q/.4)*(1-smooth((q-3.6)/.9));s.camera={id:'J85_straw_notice_and_slam',position:from.position.map((n,i)=>mix(n,[1.8,1.9,2.4][i],u)),target:from.target.map((n,i)=>mix(n,[1.45,1.1,-.5][i],u)),fov:mix(from.fov,43,u),terrainRelative:true};s.comic=q>=.25&&q<1.5?{text:'！',kind:'alert',phase:q-.25,power:1.1,actor:'pig_straw',sourceWorld:[a.x,2,a.z],sourceTerrainRelative:true,style:'J84_manga'}:q>=2.12&&q<2.8?{text:'バーン！',kind:'door',phase:q-2.12,power:1.2,house:'straw',sourceWorld:[1.45,1.5,-.05],sourceTerrainRelative:false,style:'J84_manga'}:null;const text=q<1.35?'長男「狼だ！」':q<2.12?'長男は家の中から、勢いよく扉を閉めます。':'バーン！ 戸をしっかり閉めました。';s.scene.caption=text;s.branch.caption={...s.branch.caption,text};}
 }
 return s;
}
export function createStoryClock(){let time=0,playing=false;return{get time(){return time},get playing(){return playing},play(){if(time>=STORY_DURATION)time=0;playing=true;},pause(){playing=false;},reset(){time=0;playing=false;},seek(t){time=Math.max(0,Math.min(STORY_DURATION,Number.isFinite(t)?t:0));},tick(dt){if(playing)time=Math.min(STORY_DURATION,time+Math.max(0,Math.min(.1,dt)));if(time>=STORY_DURATION-1e-8)playing=false;return sampleStory(time);}};}
selectBranch('normal');
