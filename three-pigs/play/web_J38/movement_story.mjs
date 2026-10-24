import {correctedActors} from './continuous_routes.mjs';
import * as BASE from './encounter_story.mjs';
export * from './encounter_story.mjs';
export function sampleStory(t){
 const s=correctedActors(BASE.sampleStory(t),t),w=s.actors.find(a=>a.id==='wolf');
 if(w&&['walk','walk_front'].includes(w.motion)){
  const next=correctedActors(BASE.sampleStory(Math.min(s.duration,t+.01)),t+.01).actors.find(a=>a.id==='wolf');
  const dx=next.x-w.x,dz=next.z-w.z,speed=Math.hypot(dx,dz)/.01;
  if(speed>.001&&speed<8)w.yaw=Math.atan2(dx,dz);
  w.walkDistance=w.motion==='walk_front'?w.motionTime*1.6:w.motionTime;
  w.walkVelocity=[dx/.01,dz/.01];
 }
 return s;
}

