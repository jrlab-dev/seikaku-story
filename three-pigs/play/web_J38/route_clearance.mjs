import {ROAD_SEGMENTS} from './road_network_data.mjs';
const cells=new Map(),cellSize=4;ROAD_SEGMENTS.forEach((s,i)=>{const lx=Math.floor((Math.min(s.a[0],s.b[0])-3)/cellSize),hx=Math.floor((Math.max(s.a[0],s.b[0])+3)/cellSize),lz=Math.floor((Math.min(s.a[1],s.b[1])-3)/cellSize),hz=Math.floor((Math.max(s.a[1],s.b[1])+3)/cellSize);for(let x=lx;x<=hx;x++)for(let z=lz;z<=hz;z++){const k=x+','+z;if(!cells.has(k))cells.set(k,[]);cells.get(k).push(i);}});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function roadProjection(x,z,radius=.62){
 let best=null;for(const i of cells.get(Math.floor(x/cellSize)+','+Math.floor(z/cellSize))||[]){const s=ROAD_SEGMENTS[i],dx=s.b[0]-s.a[0],dz=s.b[1]-s.a[1],u=clamp(((x-s.a[0])*dx+(z-s.a[1])*dz)/(dx*dx+dz*dz),0,1),cx=s.a[0]+u*dx,cz=s.a[1]+u*dz,d=Math.hypot(x-cx,z-cz),margin=s.width-radius,move=Math.max(0,d-margin);if(!best||move<best.move-1e-9)best={x:d>margin?cx+(x-cx)*margin/d:x,z:d>margin?cz+(z-cz)*margin/d:z,move,clearance:s.width-d,kind:s.kind};}
 return best;
}
const houses=[{x:2.1,z:-2.25},{x:-20,z:-15},{x:20,z:-14}];
export function roadScope(a,t){
 if(a.visible===false)return false;
 if(a.id==='wolf')return t>=97.5&&t<211.7&&!['climb','roof_walk','chimney','fall','startled'].includes(a.motion)&&!(a.worldY>2);
 if(t>=212)return /walk|run/.test(a.motion)||a.anchor?.startsWith('brick_front');
 return /walk|run/.test(a.motion);
}
export function isHouseGround(x,z){return houses.some(h=>Math.abs(x-h.x)<2.65&&z>h.z-2.6&&z<h.z+2.55);}
