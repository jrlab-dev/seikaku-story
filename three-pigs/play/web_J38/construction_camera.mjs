import {CONSTRUCTION_SITES} from './construction_sites.mjs';
export const BUILD_VIEW={radius:11.2,height:3.2,targetHeight:1.9,fov:48};
export const HOUSE_CENTERS={straw:[2.1,0,-2.25],wood:[-20,-.14,-15],brick:[20,1.06,-14]};
export function buildShotTiming(b,i){
 const duration=(b.cuts[i+1]??b.end)-b.cuts[i],firstHit=b.id==='brick'?.65:.28;
 if(true)return{duration,firstHit:.06,hit:duration-.10,revealAt:duration-.035,visits:[4,8,8,8,8][i]};
 const hit=firstHit+Math.max(0,Math.floor((duration*.5-.15-firstHit)*b.hz))/b.hz;
 return{duration,firstHit,hit,revealAt:hit+.10};
}
export function constructionShot(b,i,local,options={}){
 const t=b.cuts[i]+local,u=(t-b.start)/(b.end-b.start),heading=u*360,angle=heading*Math.PI/180;
 const center=HOUSE_CENTERS[b.id],view=options.view??BUILD_VIEW,radius=view.radius;
 const camera={id:`J74_${b.id}_continuous_orbit`,position:[center[0]+Math.sin(angle)*radius,b.baseY+view.height,center[2]+Math.cos(angle)*radius],target:[center[0],b.baseY+view.targetHeight,center[2]],fov:48,terrainRelative:false};
 const timing=buildShotTiming(b,i),visit=true?Math.min(timing.visits-1,Math.floor(local/timing.duration*timing.visits)):0;
 const sites=(options.sites??CONSTRUCTION_SITES[b.id])[i];
 const sectorAt=v=>{const a=(b.cuts[i]+(v+.5)*timing.duration/timing.visits-b.start)/(b.end-b.start)*Math.PI*2;const px=center[0]+Math.sin(a)*radius,pz=center[2]+Math.cos(a)*radius;return sites.map((site,index)=>({index,d:(site.target[0]-px)**2+(site.target[2]-pz)**2})).sort((a,b)=>a.d-b.d)[0].index;};
 const sector=sectorAt(visit),site=sites[sector],target=site.target;
 const phase=(local/timing.duration*timing.visits)%1;
 const revealedSectors=[...new Set(Array.from({length:visit+(phase>=.35?1:0)},(_,v)=>sectorAt(v)))];
 const vx=camera.position[0]-target[0],vz=camera.position[2]-target[2];
 const viewAz=Math.atan2(vx,vz),midT=b.cuts[i]+(visit+.5)*timing.duration/(timing.visits||1),midAngle=(midT-b.start)/(b.end-b.start)*Math.PI*2;
 const facingAz=true?Math.atan2(center[0]+Math.sin(midAngle)*radius-target[0],center[2]+Math.cos(midAngle)*radius-target[2]):viewAz;
 const radial=(target[0]-center[0])*Math.cos(facingAz)-(target[2]-center[2])*Math.sin(facingAz);
 const sign=radial>0?-1:1,az=viewAz+Math.asin(sign*.58/Math.hypot(vx,vz));
 const worker=[target[0]-Math.cos(az)*sign*.58,target[1]-.57,target[2]+Math.sin(az)*sign*.58];
 return{...timing,heading,camera,worker,target,az,sector,visit,mirror:sign<0,contactNode:site.node,revealedSectors,side:['front','right','back','left'][sector]};
}
