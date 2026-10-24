import * as BASE from './story_timeline_J110.mjs';
export * from './story_timeline_J110.mjs';
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
export function sampleStory(t){
 const s=BASE.sampleStory(t);if(s.branch.id!=='normal'||t<23||t>=29)return s;
 const q=t-23,u=q/6,x=22-.7*q,z=4.3-.018*(x-2)**2;
 const tangent=[-1,.036*(x-2)],length=Math.hypot(...tangent),forward=tangent.map(n=>n/length);
 const primitive=v=>.5*(v*Math.sqrt(1+.036*.036*v*v)+Math.asinh(.036*v)/.036);
 const distance=primitive(20)-primitive(x-2),a=s.actors.find(a=>a.id==='wolf');
 Object.assign(a,{x,z,yaw:Math.atan2(tangent[0],tangent[1]),visible:true,motion:'walk_front',motionTime:q,walkDistance:distance,walkVelocity:[-.7,.7*.036*(x-2)],yOffset:0,wolfIntroWalk:true});delete a.worldY;
 const d=3.4+2.2*smooth(u),cf=[-.845,.535];
 s.camera={id:'J112_wolf_intro_walk_pullback',position:[x+cf[0]*d,1.25+.25*smooth(u),z+cf[1]*d],target:[x,.78,z],fov:36+4*smooth(u),terrainRelative:true};
 s.cutOpacity=0;s.wolfIntroWalk={elapsed:q,distance,roadCenter:[x,z],forward,cameraDistance:d,sourceInterval:[23,29]};return s;
}
export function createStoryClock(){let time=0,playing=false;return{get time(){return time},get playing(){return playing},play(){if(time>=BASE.STORY_DURATION)time=0;playing=true},pause(){playing=false},reset(){time=0;playing=false},seek(t){time=Math.max(0,Math.min(BASE.STORY_DURATION,Number.isFinite(t)?t:0))},tick(dt){if(playing)time=Math.min(BASE.STORY_DURATION,time+Math.max(0,Math.min(.1,dt)));if(time>=BASE.STORY_DURATION)playing=false;return sampleStory(time)}}}
