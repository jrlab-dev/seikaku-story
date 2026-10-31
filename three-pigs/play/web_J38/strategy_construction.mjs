import {BUILDS} from './construction_montage.mjs';
import {constructionShot} from './construction_camera.mjs';
import {STRATEGY_BUILD_SITES} from './strategy_build_sites.mjs';
import {applyHouseOccupancy} from './strategy_occupancy.mjs';
const CENTERS={straw:[2.1,0,-2.25],wood:[-20,-.14,-15],brick:[20,1.06,-14]};
export const CONSTRUCTION_ENVELOPES={
 karakuri_fort:{min:[-3.385596,-.57,-2.985244],max:[3.385596,6.55,3.510001]},
 karakuri:{min:[-2.990001,0,-2.732329],max:[3.094127,5.8,3.461624]}
};
const MARGIN=1;
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
function clearEntry(a){
 for(const key of ['worldY','ownerDoor','encounterClose','encounterReaction','reactionBuild','stance','buildFacingAz','buildMirror','puzzleEntry','shelterRunner','runAway','roadCorrection','walkVelocity'])delete a[key];
}
function clearEntryScene(s){
 for(const key of ['encounter','shelter','egress','enterHouse','escape','travel','arrivalFix'])s[key]=null;
 s.comic=null;s.effects=[];
}
function caption(s,text){s.scene={...s.scene,caption:text};s.branch={...s.branch,caption:{...s.branch?.caption,text}};}

export function constructionStation(site,kind){
 const c=CENTERS[site],bounds=CONSTRUCTION_ENVELOPES[kind];
 if(!c||!bounds)return null;
 return{x:c[0]-.9,z:c[2]+bounds.max[2]+MARGIN,baseY:c[1],bounds};
}

export function applyStrategyConstruction(s,t,sites){
 if(!(t>=35&&t<131))return s;
 if(applyHouseOccupancy(s,t))return s;
 const site=s.build?.house||s.completion?.house||s.approach?.house;
 const kind=sites?.[site]?.visual,station=constructionStation(site,kind);
 if(!station)return s;
 const a=s.actors.find(a=>a.id==='pig_'+site);
 if(!a)return s;
 const c=CENTERS[site],{x,z,baseY,bounds}=station;
 if(s.build){
  const b=BUILDS.find(b=>b.id===site),sites=STRATEGY_BUILD_SITES[kind].map(rows=>rows.map(row=>({...row,target:row.target.map((v,k)=>v+c[k])})));
  const shot=constructionShot(b,s.build.cut,s.build.local,{sites,view:{radius:14.5,height:3.7,targetHeight:2.7}});
  const az=(45+shot.sector*90)*Math.PI/180;
  shot.worker=[shot.target[0]-.58*Math.cos(az),shot.target[1]-.57,shot.target[2]+.58*Math.sin(az)];shot.az=az;shot.mirror=false;
  shot.camera={id:'strategy_build_'+site+'_'+s.build.cut+'_'+shot.sector,position:[c[0]+Math.sin(az)*14.5,baseY+3.7,c[2]+Math.cos(az)*14.5],target:[c[0],baseY+2.7,c[2]],fov:48,terrainRelative:false};
  clearEntry(a);delete a.reactionPose;
  const [wx,wy,wz]=shot.worker;
  Object.assign(a,{x:wx,z:wz,worldY:wy,yOffset:0,yaw:shot.az,visible:true,motion:'build_hammer',motionTime:s.build.striking?1:0,buildMirror:shot.mirror,buildFacingAz:az});
  s.camera=shot.camera;
  s.strategyConstruction={site,kind,phase:'onsite',station:[wx,wy,wz],modelBounds:bounds,grounded:true};
  s.build={...s.build,worldRoot:[wx,wy,wz],target:shot.target,contactNode:shot.contactNode,contactSector:shot.sector,revealedSectors:shot.revealedSectors,workYaw:shot.az,platform:wy>baseY+.15,platformHeight:Math.max(0,wy-baseY),impact:s.build.striking,shot:'onsite_orbit',orbitHeading:shot.heading,orbitSide:shot.side};
  caption(s,['長男','次男','三男'][['straw','wood','brick'].indexOf(site)]+'は'+['柱を立てています。','梁を組んでいます。','壁を取り付けています。','足場に乗って屋根を仕上げます。','家を回り、仕上げを確かめます。'][s.build.cut]);
  return s;
 }
 Object.assign(a,{x,z,yOffset:0,yaw:Math.PI/4,visible:true});
 delete a.worldY;delete a.buildFacingAz;
 s.camera={id:'strategy_construction_'+site,position:[c[0]+6.5,baseY+4.9,c[2]+14.5],target:[c[0],baseY+2.6,c[2]+1.2],fov:48,fitAspect:1.35,terrainRelative:false};
 s.strategyConstruction={site,kind,station:[x,baseY,z],margin:MARGIN,modelBounds:bounds,grounded:true};
 return s;
}
