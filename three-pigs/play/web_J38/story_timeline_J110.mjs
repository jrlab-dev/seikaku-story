import * as BASE from './story_timeline_J109.mjs';
export * from './story_timeline_J109.mjs';
export const CUT_START=204.85,CUT_END=206.10,CUT_SECONDS=1.25,SCREAM_START=201.85,SCREAM_END=204.85;
export let STORY_DURATION=228.45,SCENES=[];
let branch='normal';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const sourceTime=t=>t<CUT_START-1e-8?t:t+CUT_SECONDS;
export const revisedTime=t=>t<CUT_START?t:Math.max(CUT_START,t-CUT_SECONDS);
export function selectBranch(id){
 branch=id;BASE.selectBranch(id);STORY_DURATION=id==='peace'?BASE.STORY_DURATION:228.45;
 SCENES=BASE.SCENES.map(s=>({...s,at:id==='peace'?s.at:revisedTime(s.at)}));return{id,duration:STORY_DURATION};
}
export function sampleStory(t){
 if(branch==='peace')return BASE.sampleStory(t);
 t=clamp(t,0,STORY_DURATION);const old=sourceTime(t),s=BASE.sampleStory(old),age=t-SCREAM_START,active=t>=SCREAM_START-1e-8&&t<SCREAM_END-1e-8;
 s.time=t;s.duration=STORY_DURATION;s.ended=t>=STORY_DURATION;s.J110={sourceTime:old,removedSeconds:CUT_SECONDS};s.scene={...s.scene,at:revisedTime(s.scene.at||0)};
 s.chimneyImpact={elapsed:age,active,translationMetres:.06,rollRadians:.005};
 if(active)s.comic={text:'ギャー!!',kind:'chimney_scream',phase:age,power:2,sourceWorld:[21.13,6.12,-14.81],sourceTerrainRelative:false};
 else if(s.comic?.kind==='chimney_scream')s.comic=null;
 return s;
}
export function createStoryClock(){let time=0,playing=false;return{get time(){return time},get playing(){return playing},play(){if(time>=STORY_DURATION)time=0;playing=true},pause(){playing=false},reset(){time=0;playing=false},seek(t){time=clamp(Number.isFinite(t)?t:0,0,STORY_DURATION)},tick(dt){if(playing)time=clamp(time+clamp(dt,0,.1),0,STORY_DURATION);if(time>=STORY_DURATION)playing=false;return sampleStory(time)}}}
selectBranch('normal');
