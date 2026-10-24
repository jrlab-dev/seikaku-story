import * as BASE from './shelter_story.mjs';
import {branchId} from './branch_context.mjs';
export * from './shelter_story.mjs';
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);},mix=(a,b,u)=>a+(b-a)*u;
export const WELCOMES=[{house:'wood',owner:'pig_wood',start:113.1,end:121.5,x:-20.65,z:-12.8,floor:.16,opening:113.1,close:117.25,entrants:[{id:'pig_straw',inside:117.2}]},{house:'brick',owner:'pig_brick',start:143.5,end:152,x:19.35,z:-11.8,floor:1.36,opening:143.5,close:148,entrants:[{id:'pig_straw',inside:147.2},{id:'pig_wood',inside:147.95}]}];
function floorY(h,z){return h.floor-.3+.3*smooth((h.z+1.3-z)/1.1)+.18*smooth((h.z+.65-z)/.3)*(1-smooth((h.z-.25-z)/.35));}
const points=[[19.35,-10.4],[26,-10.1],[32,-12],[55,-24],[95,-44],[320,-156.5]],table=[];let total=0;
for(let i=0;i<points.length-1;i++)for(let j=0;j<100;j++){const u=j/100,p0=points[Math.max(0,i-1)],p1=points[i],p2=points[i+1],p3=points[Math.min(points.length-1,i+2)],p=[0,1].map(k=>.5*((2*p1[k])+(-p0[k]+p2[k])*u+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*u*u+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*u*u*u));if(table.length)total+=Math.hypot(p[0]-table.at(-1).x,p[1]-table.at(-1).z);table.push({d:total,x:p[0],z:p[1]});}
function route(d){const i=Math.max(1,table.findIndex(p=>p.d>=d)),a=table[i-1],b=table[i],u=clamp((d-a.d)/(b.d-a.d));return{x:mix(a.x,b.x,u),z:mix(a.z,b.z,u),yaw:Math.atan2(b.x-a.x,b.z-a.z)};}
export function sampleStory(t){const s=BASE.sampleStory(t);if(branchId()==='peace')return s;
 for(const h of WELCOMES){if(t<h.start||t>=h.end)continue;
  const open=smooth((t-h.opening)/1.15)*(1-smooth((t-h.close)/.75));Object.assign(s.houses[h.house],{doorOpen:open,doorSwing:'inward',door:open>.01?'open':'closed'});
  const entries=[];for(const [n,e]of h.entrants.entries()){
   const a=s.actors.find(a=>a.id===e.id),initial=BASE.sampleStory(h.start-.001).actors.find(a=>a.id===e.id),u=clamp((t-h.start)/(e.inside-h.start)),endZ=h.z-1.55,z=mix(initial.z,endZ,u),x=mix(initial.x,h.x,smooth(clamp(u/.72)))+(n===0?-.35:.35)*smooth((h.z-.7-z)/.85),distance=Math.hypot(h.x-initial.x,endZ-initial.z)*u;
   Object.assign(a,{x,z,yaw:Math.PI,visible:true,motion:t<e.inside?'paper_run':'idle',motionTime:distance,yOffset:0});delete a.worldY;if(z<h.z+1.3)a.worldY=floorY(h,z);a.shelterRunner=t<e.inside;
   entries.push({id:e.id,x,z,thresholdZ:h.z,fullyInside:z<h.z-.8,running:t<e.inside,visible:true});
  }
  const owner=s.actors.find(a=>a.id===h.owner),angle=Math.PI*.62*open,dx=1.185,dz=-.02,cx=h.x-.755+Math.cos(angle)*dx+Math.sin(angle)*dz,cz=h.z-.01-Math.sin(angle)*dx+Math.cos(angle)*dz;
  Object.assign(owner,{visible:true,motion:'door_host',motionTime:t-h.start,x:cx-.7,z:cz-.35,yaw:Math.PI/2,yOffset:0,ownerDoor:{house:h.house,contactXZ:[cx,cz],open,phase:t<h.opening+1.15?'opening':t<h.close?'welcoming':t<h.close+.75?'closing':'inside',floor:h.floor,thresholdZ:h.z,houseX:h.x+.65}});delete owner.worldY;
  if(t>=h.close+.8){owner.x=h.x-.6;owner.z=h.z-1.65;owner.worldY=h.floor;owner.motion='idle';delete owner.ownerDoor;}
  s.shelter={house:h.house,expectedEntrants:h.entrants.length,expectedOccupants:h.entrants.length+1,owner:h.owner,doorOpen:open,entries,allInside:entries.every(a=>a.fullyInside),closingAt:h.close};s.welcome={owner:h.owner,phase:owner.ownerDoor?.phase??'inside',close:h.close};
  s.camera={id:'J82_'+h.house+'_host_and_running_entry',position:[h.x+4.7,h.floor+2.15,h.z+7],target:[h.x-.4,h.floor+1,h.z+.7],fov:46,terrainRelative:false};
  const text=t<h.close?(h.house==='wood'?'次男「こっち！ そのまま入って！」':'三男「ふたりとも、走って中へ！」'):t<h.close+1.3?(h.house==='wood'?'長男が入ると、次男はすぐに戸をしめました。':'ふたりが入ると、三男はすぐに戸をしめました。'):'おおかみの足音が、近づいてきます。';s.scene.caption=text;s.branch.caption={...s.branch.caption,text};
 }
 if(t>=183.2&&t<193.2){const q=Math.max(0,t-184.2),u=smooth((t-183.2)/1),a=s.actors.find(a=>a.id==='wolf');
  if(t>=184.2){const d=q<.7?15*q*q/.7:10.5+30*(q-.7),p=route(d);Object.assign(a,p);s.retreat={...s.retreat,distance:d,position:[p.x,p.z],fixedCamera:false,centeredCamera:true};}
  s.camera={id:'J81_centered_depth_escape',position:[mix(25,14,u),mix(2.4,2.5,u),mix(-2.5,-7.2,u)],target:[20,1.4,-12],fov:mix(50,46,u),terrainRelative:false,centeredActor:'wolf',centerWeight:u,initialTerrainPosition:[25,-2.5],initialTerrainTarget:[20,-12]};
 }
 return s;
}
