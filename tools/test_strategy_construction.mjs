import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';

const root=process.argv[2];
if(!root)throw Error('Pass the player source directory');
const {applyStrategyConstruction,constructionStation,CONSTRUCTION_ENVELOPES}=await import(pathToFileURL(root+'/strategy_construction.mjs'));
const {sampleStory,setCast}=await import(pathToFileURL(root+'/story_timeline.mjs'));
const {setStoryMode}=await import(pathToFileURL(root+'/personality_story.mjs'));
setStoryMode('strategy');setCast({pig_straw:'54144',pig_wood:'44342',pig_brick:'54234',wolf:'55321'});
const positions=new Map();let samples=0;
for(let n=0;n<=2620;n++){
 const t=n/20,s=sampleStory(t),before=structuredClone(s),out=applyStrategyConstruction(s,t,s.puzzleSites);
 assert.equal(out,s);
 const active=s.strategyConstruction;
 if(s.houseOccupancy){
  const f=s.houseOccupancy,a=s.actors.find(a=>a.id==='pig_'+f.site);
  assert.equal(s.movementMode,'house_entry');assert.equal(a.visible,true);
  assert.ok(Number.isFinite(a.worldY));assert.equal(s.build,null);assert.equal(s.completion,null);
  const same=structuredClone(s);applyStrategyConstruction(s,t,s.puzzleSites);assert.deepEqual(s,same);
  continue;
 }
 if(!active)continue;
 if(active.phase==='inspection'){
  for(const station of active.stations){const a=s.actors.find(a=>a.id==='pig_'+station.site);assert.equal(a.motion,'idle');assert.equal(a.worldY,undefined);assert.equal(a.visible,true);assert.equal(a.x,station.station[0]);assert.equal(a.z,station.station[2]);}
  assert.equal(s.movementMode,'exterior_inspection');assert.equal(s.encounter,null);continue;
 }
 const a=s.actors.find(a=>a.id==='pig_'+active.site),station=constructionStation(active.site,active.kind);
 if(s.build){
  assert.equal(active.phase,'onsite');
  assert.equal(a.motion,'build_hammer');assert.equal(a.reactionBuild,undefined);
  assert.ok(Number.isFinite(a.worldY));assert.ok(s.build.contactNode);
  assert.deepEqual(s.build.worldRoot,[a.x,a.worldY,a.z]);
  assert.equal(s.build.impact,s.build.striking);
  assert.ok(Math.abs(Math.hypot(a.x-s.build.target[0],a.z-s.build.target[2])-.58)<1e-8);
  if(s.build.stage===4){assert.ok(s.build.platform);assert.ok(s.build.platformHeight>2);}
  const key=active.site,point=[a.x.toFixed(2),a.z.toFixed(2)].join(',');
  if(!positions.has(key))positions.set(key,new Set());positions.get(key).add(point);
  const again=sampleStory(t);assert.deepEqual(again,s,'construction is seek deterministic');
  samples++;continue;
 }
 assert.equal(a.x,station.x);assert.equal(a.z,station.z);assert.equal(a.yOffset,0);assert.equal(a.worldY,undefined);
 assert.ok(a.z-active.station[2]>-1e-9);
 const zCenter={straw:-2.25,wood:-15,brick:-14}[active.site];
 assert.ok(a.z-zCenter>=CONSTRUCTION_ENVELOPES[active.kind].max[2]+1-1e-9);
 assert.deepEqual(s.houses,before.houses);assert.equal(a.motion,before.actors.find(p=>p.id===a.id).motion);
 samples++;
}
assert.equal(positions.size,3);assert.ok(samples>500);
for(const points of positions.values())assert.ok(points.size>=5,'five building stages need multiple actual work positions');
for(const kind of ['straw','wood','brick','tent']){
 const s={build:{house:'straw'},actors:[],camera:{id:'original'}};
 assert.deepEqual(applyStrategyConstruction(s,54,{straw:{visual:kind}}),s);
 assert.equal(s.strategyConstruction,undefined);
}
for(const t of [0,34.99,131,200]){
 const s={build:{house:'straw'},actors:[{id:'pig_straw',x:0,z:0}],camera:{id:'original'}};
 assert.equal(applyStrategyConstruction(s,t,{straw:{visual:'karakuri_fort'}}).camera.id,'original');
}
console.log(JSON.stringify({passed:true,samples,sites:positions.size,visualValidation:'pending parent browser inspection'}));
