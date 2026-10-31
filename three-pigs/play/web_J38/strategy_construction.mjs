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
 if(t>=110&&t<114.7){
  const stations=[];
  for(const site of ['straw','wood','brick']){
   const kind=sites?.[site]?.visual,station=constructionStation(site,kind),a=s.actors.find(a=>a.id==='pig_'+site);
   if(!station||!a)continue;
   clearEntry(a);Object.assign(a,{x:station.x,z:station.z,yOffset:0,yaw:0,motion:'idle',walkDistance:0,visible:true,anchor:'strategy_'+site+'_inspection'});
   Object.assign(s.houses[site],{intact:true,constructionStage:5,door:'closed',doorOpen:0});
   stations.push({site,kind,station:[station.x,station.baseY,station.z],margin:MARGIN,modelBounds:station.bounds,grounded:true});
  }
  if(stations.length){
   clearEntryScene(s);s.build=null;s.completion=null;s.movementMode='exterior_inspection';
   s.strategyConstruction={...stations.at(-1),phase:'inspection',stations};
   caption(s,'三匹は、完成した家の外で仕掛けを点検します。');
  }
  return s;
 }
 if(t>=121.5&&CONSTRUCTION_ENVELOPES[sites?.straw?.visual]){
  if(s.strategyPrelude)return s;
  const c=CENTERS.straw,owner=s.actors.find(a=>a.id==='pig_straw'),wolf=s.actors.find(a=>a.id==='wolf');
  if(!owner||!wolf)return s;
  clearEntryScene(s);
  clearEntry(owner);Object.assign(owner,{x:c[0]+1.4,z:c[2]+3.9,yOffset:0,yaw:0,motion:'idle',walkDistance:0,visible:true,reactionPose:2,anchor:'strategy_straw_gate'});
  const u=smooth((t-121.5)/2.5),x=wolf.x+(c[0]-wolf.x)*u,z=wolf.z+(c[2]+8.5-wolf.z)*u;
  clearEntry(wolf);delete wolf.reactionPose;
  Object.assign(wolf,{x,z,yOffset:0,visible:true,yaw:Math.PI,motion:t<124?'walk':'idle',motionTime:t-121.5,walkDistance:Math.hypot(x-(c[0]-.65),z-(c[2]+5.9)),anchor:'strategy_straw_gate_approach'});
  for(const a of s.actors)if(a.id==='pig_wood'||a.id==='pig_brick')a.visible=false;
  Object.assign(s.houses.straw,{door:'closed',doorOpen:0});
  s.build=null;s.completion=null;s.intro=null;s.drama=null;
  s.strategyPrelude={site:'straw',phase:t-122,gate:1-smooth((t-122)/2)};
  s.camera={id:'strategy_straw',position:[c[0]-6.5,c[1]+2.7,c[2]+12.7],target:[c[0],c[1]+1.05,c[2]+5.7],fov:48,fitAspect:1.35,terrainRelative:false};
  caption(s,t<124?'長男が前庭の門を閉める。':'長男は前庭の門を閉め、見張りを確かめました。');
  return s;
 }
 const site=s.build?.house||s.completion?.house||s.approach?.house;
 const kind=sites?.[site]?.visual,station=constructionStation(site,kind);
 if(!station)return s;
 const a=s.actors.find(a=>a.id==='pig_'+site);
 if(!a)return s;
 const c=CENTERS[site],{x,z,baseY,bounds}=station;
 Object.assign(a,{x,z,yOffset:0,yaw:Math.PI/4,visible:true});
 delete a.worldY;delete a.buildFacingAz;
 s.camera={id:'strategy_construction_'+site,position:[c[0]+6.5,baseY+4.9,c[2]+14.5],target:[c[0],baseY+2.6,c[2]+1.2],fov:48,fitAspect:1.35,terrainRelative:false};
 s.strategyConstruction={site,kind,station:[x,baseY,z],margin:MARGIN,modelBounds:bounds,grounded:true};
 if(s.build){
  s.build={...s.build,worldRoot:[x,baseY,z],platform:false,platformHeight:0,impact:false,workYaw:Math.PI/4,shot:'fixed_exterior_station',target:[x+.45,baseY+.65,z-.35],contactNode:null};
  a.buildMirror=false;
 }
 return s;
}
