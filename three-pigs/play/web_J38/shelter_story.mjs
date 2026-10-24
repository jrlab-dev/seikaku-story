import * as BASE from './revised_story.mjs';
import {branchId} from './branch_context.mjs';
export * from './revised_story.mjs';
const clamp=v=>Math.max(0,Math.min(1,v)),smooth=v=>{v=clamp(v);return v*v*(3-2*v);},mix=(a,b,u)=>a+(b-a)*u;
export const SHELTERS=[{house:'wood',start:113.1,end:121.5,x:-20.65,z:-12.8,floor:.16,opening:113.2,closing:120.4,entrants:[{id:'pig_straw',arrive:115,enter:117.8,inside:119.9,waitZ:-11.1}]},{house:'brick',start:143.5,end:152,x:19.35,z:-11.8,floor:1.36,opening:143.5,closing:149.1,entrants:[{id:'pig_straw',arrive:145,enter:145.5,inside:147.5,waitZ:-10.1},{id:'pig_wood',arrive:145.4,enter:146.9,inside:148.9,waitZ:-8.9}]}];
export function sampleStory(t){const s=BASE.sampleStory(t);if(branchId()==='peace')return s;
 if(t>=93&&t<97.5){for(const [house,x,z,floor] of [['straw',1.45,-.05,.30],['wood',-20.65,-12.8,.16],['brick',19.35,-11.8,1.36]]){
  const a=s.actors.find(a=>a.id==='pig_'+house),initial=BASE.sampleStory(93).actors.find(a=>a.id==='pig_'+house),v=clamp((t-94)/2.3),open=smooth((t-93.1)/.65)*(1-smooth((t-96.55)/.75));
  Object.assign(a,{x:mix(initial.x,x,v),z:mix(initial.z,z-1.5,v),yaw:Math.PI,visible:true,motion:t>=94&&t<96.3?'walk':'idle',motionTime:t-93,yOffset:0});delete a.worldY;if(a.z<z+1.3)a.worldY=floor-.3+.3*smooth((z+1.3-a.z)/1.1)+.18*smooth((z+.65-a.z)/.3)*(1-smooth((z-.25-a.z)/.35));
  Object.assign(s.houses[house],{doorOpen:open,door:open>.01?'open':'closed'});
 }}
 for(const h of SHELTERS){if(t<h.start||t>=h.end)continue;const open=smooth((t-h.opening)/.7)*(1-smooth((t-h.closing)/.75));s.houses[h.house].doorOpen=open;s.houses[h.house].door=open>.01?'open':'closed';
  const entry=[];for(const e of h.entrants){const a=s.actors.find(a=>a.id===e.id),initial=BASE.sampleStory(h.start-.001).actors.find(a=>a.id===e.id),u=clamp((t-h.start)/(e.arrive-h.start)),v=clamp((t-e.enter)/(e.inside-e.enter));
   let x=mix(initial.x,h.x,u),z=mix(initial.z,e.waitZ,u);if(t>=e.enter){x=h.x;z=mix(e.waitZ,h.z-1.5,v);}Object.assign(a,{x,z,visible:true,motion:t<e.arrive?'paper_run':t>=e.enter&&t<e.inside?'walk':'idle',motionTime:t-h.start,yaw:Math.PI,yOffset:0});delete a.worldY;
   if(z<h.z+1.3)a.worldY=h.floor-.3+.3*smooth((h.z+1.3-z)/1.1)+.18*smooth((h.z+.65-z)/.3)*(1-smooth((h.z-.25-z)/.35));
   if(z<h.z-.65){a.x+= (e.id==='pig_straw'?-.35:.35)*smooth((h.z-.65-z)/.85);x=a.x;}
   entry.push({id:e.id,x,z,thresholdZ:h.z,inside:z<h.z-.55,fullyInside:z<h.z-.8,visible:a.visible});
  }
  if(h.house==='brick'&&t>=148&&t<149.85){s.scene.caption='三びきは、順番に家の中へ。';s.branch.caption={...s.branch.caption,text:s.scene.caption};}
  s.escape=null;s.drama=null;s.intro=null;s.shelter={house:h.house,expectedEntrants:h.entrants.length,expectedOccupants:h.entrants.length+1,doorOpen:open,entries:entry,allInside:entry.every(e=>e.fullyInside)};
  s.camera={id:'J80_'+h.house+'_physical_entry',position:[h.x+4.3,h.floor+2.25,h.z+7],target:[h.x,h.floor+1,h.z+1],fov:42,terrainRelative:false};
 }
 if(t>=184.2&&t<193.2){const q=t-184.2,a=s.actors.find(a=>a.id==='wolf');const distance=q<.7?15*q*q/.7:10.5+30*(q-.7),points=[[19.35,-10.4],[26,-10.1],[32,-12],[55,-24],[95,-44],[320,-156.5]];let left=distance,x=points[0][0],z=points[0][1],yaw=0;
  for(let i=1;i<points.length;i++){const p=points[i-1],n=points[i],len=Math.hypot(n[0]-p[0],n[1]-p[1]),u=clamp(left/len);x=mix(p[0],n[0],u);z=mix(p[1],n[1],u);yaw=Math.atan2(n[0]-p[0],n[1]-p[1]);if(left<=len)break;left-=len;}
  Object.assign(a,{x,z,yaw,visible:true,motion:'run_spiral',motionTime:q*1.6,yOffset:0,runAway:true});delete a.worldY;
  s.camera={id:'J80_wolf_depth_sprint',position:[14,2.5,-7.2],target:[55,1,-28],fov:46,terrainRelative:false};s.retreat={distance,speed:q<.7?30*q/.7:30,position:[x,z],noOpacityFade:true,fixedCamera:true};
  if(q>=1.8){s.scene.caption='火はすぐに消えました。おおかみは無事に逃げました。';s.branch.caption={...s.branch.caption,text:s.scene.caption};}
 }
 if(t>=193.2&&t<198){const open=smooth((t-193.2)/.65)*(1-smooth((t-197.1)/.75));Object.assign(s.houses.brick,{doorOpen:open,door:open>.01?'open':'closed'});
  for(const [i,id]of ['pig_straw','pig_wood','pig_brick'].entries()){const a=s.actors.find(a=>a.id===id),start=193.9+i*.8,u=clamp((t-start)/1.5),z=mix(-13.3,-8.8,u),x=mix(19.35,[18.1,19.7,21.3][i],smooth((z+11)/2.2));Object.assign(a,{x,z,yaw:0,visible:true,motion:u>0&&u<1?'walk':'idle',motionTime:t-start,yOffset:0});delete a.worldY;if(z<-10.5)a.worldY=1.06+.3*smooth((-10.5-z)/1.1)+.18*smooth((-11.15-z)/.3)*(1-smooth((-12.05-z)/.35));}
  if(t<197.2)s.camera={id:'J80_three_leave_open_door',position:[23.65,3.61,-4.8],target:[19.35,2.36,-10.8],fov:42,terrainRelative:false};
  s.egress={house:'brick',expected:3,doorOpen:open,allOutside:s.actors.filter(a=>a.id.startsWith('pig_')).every(a=>a.z>-10.5)};
 }
 return s;}
