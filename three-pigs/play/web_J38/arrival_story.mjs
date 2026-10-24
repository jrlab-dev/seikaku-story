import * as BASE from './welcome_story.mjs';
import {branchId} from './branch_context.mjs';
export * from './welcome_story.mjs';
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
export function sampleStory(t){const s=BASE.sampleStory(t);if(branchId()==='peace')return s;
 if(t>=97.5&&t<105){const a=s.actors.find(a=>a.id==='wolf'),q=t-97.5,duration=2,brake=.45,v=1/(duration-brake/2),u=q<duration-brake?v*q:q<duration?1-v*(duration-q)**2/(2*brake):1;
  const start=[4.45,3.7],end=[1.45,3.1],yaw=Math.atan2(end[0]-start[0],end[1]-start[1]),turn=smooth((q-duration)/.35),targetYaw=-Math.PI;
  Object.assign(a,{x:start[0]+(end[0]-start[0])*u,z:start[1]+(end[1]-start[1])*u,yaw:yaw+(targetYaw-yaw)*turn});
  if(q<duration){a.motion='walk';a.motionTime=Math.hypot(end[0]-start[0],end[1]-start[1])*u/1.15;}
  s.camera={id:'J83_continuous_wolf_arrival',position:[7,2.35,8.2],target:[2.1,1.35,.35],fov:46,terrainRelative:true};
  s.arrivalFix={house:'straw',distance:Math.hypot(end[0]-start[0],end[1]-start[1])*u,walking:q<duration,stoppedAt:99.5,oneContinuousCamera:true};
 }
 for(const [start,end]of [[121.2,122.1],[151.8,152.7]])if(t>=start&&t<end){
  const a=BASE.sampleStory(start-.001).camera,b=BASE.sampleStory(end).camera,u=smooth((t-start)/(end-start));
  s.camera={id:'J83_settled_arrival_transition',position:a.position.map((v,i)=>v+(b.position[i]-v)*u),target:a.target.map((v,i)=>v+(b.target[i]-v)*u),fov:a.fov+(b.fov-a.fov)*u,terrainRelative:false};
  s.camera.position[2]+=6*Math.sin(Math.PI*u);s.camera.target[1]-=.5*Math.sin(Math.PI*u);s.camera.fov+=8*Math.sin(Math.PI*u);
  s.arrivalTransition={start,end,stopped:true};
 }
 return s;
}
