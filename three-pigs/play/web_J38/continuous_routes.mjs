import {ROAD_SEGMENTS} from './road_network_data.mjs';
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
const lane=x=>4.3-.018*(x-2)**2;
const branch=id=>ROAD_SEGMENTS.filter(s=>s.kind===id).flatMap((s,i)=>i?[s.b]:[s.a,s.b]);
const paths={wood:branch('wood'),brick:branch('brick')};
function center(id,z){if(id==='straw')return[1.45,z];const ps=paths[id];if(z<=ps[0][1])return[ps[0][0],z];for(let i=1;i<ps.length;i++)if(ps[i][1]>=z){const a=ps[i-1],b=ps[i],u=(z-a[1])/(b[1]-a[1]);return[a[0]+u*(b[0]-a[0]),z];}return ps.at(-1);}
function out(id,z){if(id==='straw')return[[1.45,z],[1.45,lane(1.45)]];return[center(id,z),...paths[id].filter(p=>p[1]>z+.001)];}
function main(a,b){const n=Math.ceil(Math.abs(b-a)/.12);return Array.from({length:n+1},(_,i)=>{const x=a+(b-a)*i/n;return[x,lane(x)]});}
function between(a,za,b,zb){const first=out(a,za),last=out(b,zb).reverse();return [...first,...main(first.at(-1)[0],last[0][0]).slice(1),...last.slice(1)];}
function prepared(points){const ps=[points[0]],ds=[0];let length=0;for(const p of points.slice(1)){const d=Math.hypot(p[0]-ps.at(-1)[0],p[1]-ps.at(-1)[1]);if(d<1e-7)continue;length+=d;ps.push(p);ds.push(length);}return{ps,ds,length};}
function along(path,u,offset=0){const d=clamp(u)*path.length;let lo=0,hi=path.ds.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(path.ds[m]<d)lo=m;else hi=m;}const a=path.ps[lo],b=path.ps[hi],f=(d-path.ds[lo])/(path.ds[hi]-path.ds[lo]),yaw=Math.atan2(b[0]-a[0],b[1]-a[1]);return{x:a[0]+(b[0]-a[0])*f+Math.cos(yaw)*offset,z:a[1]+(b[1]-a[1])*f-Math.sin(yaw)*offset,yaw};}
const wolfArrival=prepared([...main(9.55,1.45),[1.45,3.1]]);
const wolfWood=prepared(between('straw',3.1,'wood',-9.5)),wolfBrick=prepared(between('wood',-9.5,'brick',-8.2));
const strawEscape=prepared(between('straw',-1.6,'wood',-5.0464043655));
const woodEscapes=[0,1].map(i=>{const p=between('wood',-14.7,'brick',i===0?-2.3538399374:-1.2120592094);p[0]=i===0?[-20.7,-14.7]:[-19.3,-14.7];p.splice(1,0,[-20.65,-12.9]);return prepared(p);});
const entryPaths={straw:prepared([center('wood',-5.0464043655),...paths.wood.filter(p=>p[1]<-5.0464).reverse(),[-20.65,-12.8],[-20.65,-13.5],[-21,-14.35]]),pig0:prepared([center('brick',-2.3538399374),...paths.brick.filter(p=>p[1]<-2.35384).reverse(),[19.35,-11.8],[19.35,-12.5],[19,-13.35]]),pig1:prepared([center('brick',-1.2120592094),...paths.brick.filter(p=>p[1]<-1.21206).reverse(),[19.35,-11.8],[19.35,-12.5],[19.7,-13.35]])};
export function correctedActors(s,t){
 const old=s.actors.map(a=>({...a}));
 for(const a of s.actors){
 let p=null;
 if(a.id==='wolf'){
 if(t>=97.5&&t<100.5){const x=14.35-1.6*(t-97.5);p={x,z:lane(x),yaw:Math.atan2(-1,.036*(x-2))};}
 else if(t>=100.5&&t<105.5){const q=t-100.5,brake=.45,v=1/(5-brake/2),u=q<5-brake?v*q:1-v*(5-q)**2/(2*brake);p=along(wolfArrival,u);}
 else if(t>=128.8&&t<131.7)p=along(wolfWood,(t<130.25?(t-128.8)*1.15:wolfWood.length-(131.7-t)*1.15)/wolfWood.length);
 else if(t>=131.7&&t<157.5&&a.anchor?.includes('wood')){const c=center('wood',-9.5);p={x:c[0],z:c[1]};}
 else if(t>=157.5&&t<162.3)p=along(wolfBrick,(t<159.9?(t-157.5)*1.15:wolfBrick.length-(162.3-t)*1.15)/wolfBrick.length);
 }
 if(a.id==='pig_straw'){
 if(t>=118.9&&t<123.6)p=along(strawEscape,(t-118.9)/4.7);
 else if(t>=123.6&&t<127.7)p=along(entryPaths.straw,(t-123.6)/4.1);
 }
 if(['pig_straw','pig_wood'].includes(a.id)){
 const i=a.id==='pig_straw'?0:1,start=146.4+i*.12;
 if(t>=start&&t<154)p=along(woodEscapes[i],(t-start)/(154-start));
 else if(t>=154&&t<(i?158.45:157.7))p=along(i?entryPaths.pig1:entryPaths.pig0,(t-154)/((i?158.45:157.7)-154));
 }
 if(t>=212&&a.id.startsWith('pig_')&&a.z>-11.0){const i=['pig_straw','pig_wood','pig_brick'].indexOf(a.id),goals=[[19.13,-9.35],[19.57,-8.55],[19.13,-7.75]],u=clamp((a.z+10.5)/1.7),v=smooth(u);const blend=smooth((a.z+11)/2.2);p={x:a.x+(19.35+(goals[i][0]-19.35)*v-a.x)*blend,z:a.z<=-10.5?a.z:-10.5+(goals[i][1]+10.5)*u};}
 if(p&&a.id.startsWith('pig_')){
 if(t>=118.9&&t<123.6){a.yOffset=p.x>0&&p.z<1.55?.3*(1-smooth((p.z-.4)/1.15)):0;delete a.worldY;}
 if(t>=146.4&&t<154){a.yOffset=p.x<-17&&p.z<-11?.3*(1-smooth((p.z+12.4)/1.4)):0;delete a.worldY;}
 const h=t>=123.6&&t<127.7&&a.id==='pig_straw'?{z:-12.8,floor:.16}:t>=154&&t<(a.id==='pig_wood'?158.45:157.7)&&a.id!=='pig_brick'?{z:-11.8,floor:1.36}:null;
 if(h){a.yOffset=0;delete a.worldY;if(p.z<h.z+1.3)a.worldY=h.floor-.3+.3*smooth((h.z+1.3-p.z)/1.1)+.18*smooth((h.z+.65-p.z)/.3)*(1-smooth((h.z-.25-p.z)/.35));}
 }
 if(p){a.roadCorrection={original:[a.x,a.z],distance:Math.hypot(p.x-a.x,p.z-a.z),method:'continuous existing road centerline'};Object.assign(a,p);}
 }
 if(s.camera?.id?.includes('continuous_escape')){
 const ids=t<140?['pig_straw']:['pig_straw','pig_wood'],before=old.filter(a=>ids.includes(a.id)),after=s.actors.filter(a=>ids.includes(a.id)),cx=a=>a.reduce((v,p)=>v+p.x,0)/a.length,cz=a=>a.reduce((v,p)=>v+p.z,0)/a.length,az=a=>Math.atan2(a.reduce((v,p)=>v+Math.sin(p.yaw),0),a.reduce((v,p)=>v+Math.cos(p.yaw),0)),angle=az(after)-az(before),ox=cx(before),oz=cz(before),nx=cx(after),nz=cz(after);
 for(const k of ['position','target']){const q=s.camera[k],x=q[0]-ox,z=q[2]-oz;s.camera[k]=[nx+x*Math.cos(angle)+z*Math.sin(angle),q[1],nz-x*Math.sin(angle)+z*Math.cos(angle)];}
 }
 return s;
}

