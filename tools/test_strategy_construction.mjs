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
 if(s.strategyPrelude){
  const owner=s.actors.find(a=>a.id==='pig_straw'),wolf=s.actors.find(a=>a.id==='wolf');
  assert.equal(owner.x,3.5);assert.equal(owner.z,1.65);assert.equal(owner.worldY,undefined);
  assert.equal(owner.ownerDoor,undefined);assert.equal(owner.encounterClose,undefined);
  assert.equal(s.encounter,null);assert.equal(s.houses.straw.doorOpen,0);
  assert.ok(s.strategyPrelude.gate>=0&&s.strategyPrelude.gate<=1);
  if(t>=124){assert.equal(s.strategyPrelude.gate,0);assert.equal(wolf.x,1.3);assert.equal(wolf.z,4.75);}
  const same=structuredClone(s);applyStrategyConstruction(s,t,s.puzzleSites);assert.deepEqual(s,same);
 }
 if(!active)continue;
 if(active.phase==='inspection'){
  for(const station of active.stations){const a=s.actors.find(a=>a.id==='pig_'+station.site);assert.equal(a.motion,'idle');assert.equal(a.worldY,undefined);assert.equal(a.visible,true);assert.equal(a.x,station.station[0]);assert.equal(a.z,station.station[2]);}
  assert.equal(s.movementMode,'exterior_inspection');assert.equal(s.encounter,null);continue;
 }
 const a=s.actors.find(a=>a.id==='pig_'+active.site),station=constructionStation(active.site,active.kind);
 assert.equal(a.x,station.x);assert.equal(a.z,station.z);assert.equal(a.yOffset,0);assert.equal(a.worldY,undefined);
 assert.ok(a.z-active.station[2]>-1e-9);
 const zCenter={straw:-2.25,wood:-15,brick:-14}[active.site];
 assert.ok(a.z-zCenter>=CONSTRUCTION_ENVELOPES[active.kind].max[2]+1-1e-9);
 assert.deepEqual(s.houses,before.houses);assert.equal(a.motion,before.actors.find(p=>p.id===a.id).motion);
 if(before.build){
  assert.equal(s.build.stage,before.build.stage);assert.equal(s.build.striking,before.build.striking);
  assert.equal(s.build.platform,false);assert.equal(s.build.impact,false);
  const key=active.site;
  const pose=[a.x,a.z,...s.camera.position,...s.camera.target];
  if(positions.has(key))assert.deepEqual(pose,positions.get(key));else positions.set(key,pose);
 }
 samples++;
}
assert.equal(positions.size,3);assert.ok(samples>500);
for(const kind of ['straw','wood','brick','tent']){
 const s={build:{house:'straw'},actors:[],camera:{id:'original'}};
 assert.deepEqual(applyStrategyConstruction(s,54,{straw:{visual:kind}}),s);
 assert.equal(s.strategyConstruction,undefined);
}
for(const t of [0,34.99,131,200]){
 const s={build:{house:'straw'},actors:[{id:'pig_straw',x:0,z:0}],camera:{id:'original'}};
 assert.equal(applyStrategyConstruction(s,t,{straw:{visual:'karakuri_fort'}}).camera.id,'original');
}
for(const t of [121.5,122,123,124,127,130.999]){
 const s=sampleStory(t);assert.ok(s.strategyPrelude);const q=s.strategyPrelude;
 if(t===122)assert.equal(q.gate,1);if(t>=124)assert.equal(q.gate,0);
 assert.equal(s.camera.id,'strategy_straw');
}
const beforeAttack=sampleStory(130.999),attack=sampleStory(131);
for(const id of ['pig_straw','wolf']){const a=beforeAttack.actors.find(a=>a.id===id),b=attack.actors.find(a=>a.id===id);assert.ok(Math.hypot(a.x-b.x,a.z-b.z)<1e-9,'Prelude must join the attack positions for '+id);}
assert.deepEqual(beforeAttack.camera.position,attack.camera.position);assert.deepEqual(beforeAttack.camera.target,attack.camera.target);
console.log(JSON.stringify({passed:true,samples,sites:positions.size,visualValidation:'pending parent browser inspection'}));
