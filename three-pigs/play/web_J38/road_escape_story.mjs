import * as BASE from './manga_story.mjs';
import {branchId} from './branch_context.mjs';
import {ROAD_ROUTE} from './road_escape_route.mjs';
export * from './manga_story.mjs';
export const START=194.2,SPRINT=195.2,END=204.2,SETTLED=196.5;
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);},mix=(a,b,u)=>a+(b-a)*u;
export const roadZ=x=>x>33?4.3-.018*31**2-(x-33)*.73:4.3-.018*(x-2)**2;
export function routeAt(d){let lo=0,hi=ROAD_ROUTE.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(ROAD_ROUTE[m][0]<d)lo=m;else hi=m;}const a=ROAD_ROUTE[lo],b=ROAD_ROUTE[hi],u=clamp((d-a[0])/(b[0]-a[0]));return{x:mix(a[1],b[1],u),z:mix(a[2],b[2],u),yaw:Math.atan2(b[1]-a[1],b[2]-a[2])};}
export function sampleStory(t){const s=BASE.sampleStory(t);if(branchId()==='peace'||t<START||t>=END)return s;
 const u=smooth((t-START)/(SETTLED-START)),v=1-u,from=[25,3.46,-2.5],c1=[28,2.7,7],c2=[10,2.7,9],to=[13,2.4,roadZ(26)+13*(roadZ(26)-roadZ(95))/69];
 s.camera={id:'J85_road_center_depth',position:from.map((n,i)=>v*v*v*n+3*v*v*u*c1[i]+3*v*u*u*c2[i]+u*u*u*to[i]),target:[19.35,2.4,-11.8].map((n,i)=>mix(n,[95,1.5,roadZ(95)][i],u)),fov:46,terrainRelative:false,roadFocusWeight:smooth((t-START)/.3)*(1-smooth((t-196.05)/.45))};
 const a=s.actors.find(a=>a.id==='wolf');
 if(t>=SPRINT){const q=t-SPRINT,d=q<.7?15*q*q/.7:10.5+30*(q-.7),p=routeAt(d);Object.assign(a,p,{runAway:q>=.7});delete a.worldY;s.retreat={...s.retreat,distance:d,position:[p.x,p.z],fixedCamera:t>=SETTLED,centeredCamera:false,roadCentered:true};if(s.comic?.actor==='wolf')s.comic.sourceWorld=[p.x,.95,p.z];}
 s.roadEscape={progress:u,cameraSettled:t>=SETTLED,roadAxis:[33,roadZ(33),95,roadZ(95)],wolfOnMainRoad:a.x>=22,roadOffset:a.x>=22?a.z-roadZ(a.x):null};return s;
}
