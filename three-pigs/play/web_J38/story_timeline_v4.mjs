import {applyCausalRevision} from './causal_revision_v2.mjs';
import {applyHillStory} from './hill_route_v4.mjs';
import * as BASE from './story_timeline_J112.mjs';
export * from './story_timeline_J112.mjs';
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
const primitive=v=>.5*(v*Math.sqrt(1+.036*.036*v*v)+Math.asinh(.036*v)/.036);
export function sampleStory(t){
 const s=BASE.sampleStory(t);if(s.branch.id!=='normal')return s;
 const a=s.actors.find(a=>a.id==='wolf');
 const intro=t>=23&&t<29,arrival=t>=102.5&&t<105.5;
 if(intro||arrival){
  const start=intro?23:102.5,duration=intro?6:3,q=t-start,u=q/duration,x0=intro?22:14.35;
  a.walkDistance=primitive(x0-2)-primitive(a.x-2);a.wolfIntroWalk=true;
  const az=Math.atan2(s.camera.position[0]-a.x,s.camera.position[2]-a.z),d=3.4+1.0*smooth(u);
  s.camera={...s.camera,id:'J113_fullbody_walk_'+(intro?'introduction':'arrival'),position:[a.x+Math.sin(az)*d,1.25+.15*smooth(u),a.z+Math.cos(az)*d],target:[a.x,.78,a.z],fov:36+2*smooth(u)};
 }
 if(t>=205.05&&t<209){
  const elapsed=t-205.05,fade=1-smooth((elapsed-2.05)/.25);
  s.tailFlame={active:elapsed<2.3-1e-8,elapsed,fade};a.tailFlame=s.tailFlame;
 }
 if(t>=206.9-1e-8&&t<207){const text='おおかみ「あちっ、あちー！」';s.scene.caption=text;s.branch.caption={...s.branch.caption,text};}
 return applyHillStory(applyCausalRevision(s,t,BASE),t);
}
export function createStoryClock(){let time=0,playing=false;return{get time(){return time},get playing(){return playing},play(){if(time>=BASE.STORY_DURATION)time=0;playing=true},pause(){playing=false},reset(){time=0;playing=false},seek(t){time=Math.max(0,Math.min(BASE.STORY_DURATION,Number.isFinite(t)?t:0))},tick(dt){if(playing)time=Math.min(BASE.STORY_DURATION,time+Math.max(0,Math.min(.1,dt)));if(time>=BASE.STORY_DURATION)playing=false;return sampleStory(time)}}}
