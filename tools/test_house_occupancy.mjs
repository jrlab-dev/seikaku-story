import assert from 'node:assert/strict';
import fs from 'node:fs';
import {setStoryMode,setCast} from '../three-pigs/play/web_J38/personality_story.mjs';
import {sampleStory,selectBranch,STORY_DURATION} from '../three-pigs/play/web_J38/story_timeline.mjs';
import {PRESETS} from '../three-pigs/test-settings.mjs';
import {CENTERS} from '../three-pigs/play/web_J38/endings/strategy.mjs';
const sites=['straw','wood','brick'];let samples=0,frontCrossings=0,rearCrossings=0;
setStoryMode('strategy');
for(const p of PRESETS.filter(p=>p.mode==='strategy')){
 setCast(p.cast);selectBranch('normal');
 for(const [i,t]of [61.8,83.3,110].entries()){
  const s=sampleStory(t),c=CENTERS[sites[i]],a=s.actors.find(a=>a.id==='pig_'+sites[i]);
  assert.ok(s.houseOccupancy.inside);assert.ok(Math.abs(a.x-c[0])<2&&Math.abs(a.z-c[2])<2);assert.ok(a.worldY>=c[1]+.25);
 }
 let prev=sampleStory(131);
 for(let t=131.05;t<STORY_DURATION;t+=.05){
  const s=sampleStory(t),f=s.strategy,c=CENTERS[f.site];samples++;
  assert.equal(f.revision,3);assert.equal(f.gate,undefined);assert.equal(f.wall,undefined);assert.equal(f.bridge,undefined);
  assert.doesNotMatch(s.scene.caption,/門|前庭|橋/);
  if(f.inside&&f.phase<24)for(const a of s.actors.filter(a=>a.visible&&a.id.startsWith('pig_'))){assert.ok(Math.abs(a.x-c[0])<2);assert.ok(Math.abs(a.z-c[2])<2);assert.ok(a.worldY>=c[1]+.25);}
  if(prev.camera.id===s.camera.id)for(const a of s.actors.filter(a=>a.visible)){
   const b=prev.actors.find(b=>b.id===a.id);if(!b.visible)continue;
   for(const site of sites){const cc=CENTERS[site];for(const [z,rear]of [[2.25,false],[-2.15,true]]){
    const delta=a.z-b.z;if(Math.abs(delta)<1e-9)continue;const v=(cc[2]+z-b.z)/delta;if(v<=0||v>1)continue;
    const x=b.x+(a.x-b.x)*v-cc[0];if(Math.abs(x)>2.3)continue;
    assert.ok(x> -1.1&&x<-.2,`${a.id} must cross the real doorway: ${t} ${site} ${x}`);
    if(rear){assert.ok((s.strategy.site===site?s.strategy.rearOpen:0)>.9);rearCrossings++;}
    else{assert.ok(s.houses[site].doorOpen>.9);frontCrossings++;}
   }}
  }
  prev=s;
 }
 const before=JSON.stringify(sampleStory(191));sampleStory(STORY_DURATION);assert.equal(JSON.stringify(sampleStory(191)),before);
}
assert.ok(frontCrossings>0);assert.ok(rearCrossings>0);
console.log(JSON.stringify({passed:true,samples,frontCrossings,rearCrossings}));
