import assert from 'node:assert/strict';
import {contest,STRATEGY_CAST,evaluateStrategy} from '../three-pigs/play/web_J38/strategy_rules.mjs';
import {setStoryMode,setCast,getRawCast} from '../three-pigs/play/web_J38/personality_story.mjs';
import {sampleStory,selectBranch,STORY_DURATION} from '../three-pigs/play/web_J38/story_timeline.mjs';
import {PRESETS} from '../three-pigs/test-settings.mjs';
let pairs=0,ties=0,samples=0;
for(let o=1;o<=5;o++)for(let c=1;c<=5;c++)for(let p=1;p<=5;p++)for(let q=1;q<=5;q++){
 const w=''+o+c+'321',b=''+p+q+'344',d=contest(w,b);pairs++;
 assert.equal(d.winner,p+q>o+c||(p+q===o+c&&q>=3)?'pig':'wolf');
 if(p+q===o+c)ties++;
 if(p<5&&d.winner==='pig')assert.equal(contest(w,''+(p+1)+q+'344').winner,'pig');
 if(q<5&&d.winner==='pig')assert.equal(contest(w,''+p+(q+1)+'344').winner,'pig');
}
assert.equal(evaluateStrategy(STRATEGY_CAST).id,'strategy_win');
assert.equal(evaluateStrategy({...STRATEGY_CAST,wolf:'54321'}).id,'strategy_hold_straw');
assert.equal(evaluateStrategy({...STRATEGY_CAST,pig_straw:'55144'}).id,'strategy_hold_straw');
assert.equal(evaluateStrategy({...STRATEGY_CAST,wolf:'55351'}).id,'peace');
setStoryMode('strategy');
for(const p of PRESETS.filter(p=>p.mode==='strategy')){
 setCast(p.cast);selectBranch('normal');
 assert.deepEqual(getRawCast(),p.cast);
 const duration=STORY_DURATION;
 assert.equal(duration,p.id==='strategy_hold_straw'?179:p.id==='strategy_hold_wood'?227:285);
 for(let t=131;t<=duration;t+=.2){
  const s=sampleStory(t);samples++;
  assert.ok(s.scene.caption.length>0,'caption '+t);
  assert.ok(s.strategy,'strategy '+t);
  assert.ok(s.fullImage||s.actors.some(a=>a.visible),'actors or illustrated ending '+t);
  for(const a of s.actors.filter(a=>a.visible))for(const k of ['x','z','yaw'])assert.ok(Number.isFinite(a[k]),k+' '+t);
  assert.ok(Object.values(s.houses).every(h=>h.intact===true),'no unexplained collapse');
  if(s.actors.some(a=>a.motion==='paper_run'))for(const a of s.actors.filter(a=>a.motion==='paper_run')){assert.equal(a.spiralRunTime,t);assert.equal(a.reactionPose,undefined);}
 }
 const end=sampleStory(duration);
 assert.equal(end.ended,true);
 assert.equal(end.personality.ending.id,p.id);
 const first=JSON.stringify(sampleStory(156));sampleStory(duration);assert.equal(JSON.stringify(sampleStory(156)),first,'seek restoration');
}
setCast(STRATEGY_CAST);selectBranch('normal');
assert.match(sampleStory(190).scene.caption,/火をつけ/);
assert.ok(sampleStory(190).actors.find(a=>a.id==='pig_wood').visible);
assert.ok(sampleStory(260).strategy.bridge>0);
for(let t=258;t<265;t+=.1){
 const s=sampleStory(t),wolf=s.actors.find(a=>a.id==='wolf');
 const expected=1.06+.04+1.45*Math.max(0,1-Math.abs(wolf.z+14-6.9)/1.6);
 assert.ok(Math.abs(wolf.strategyWorldY-expected)<1e-9,'wolf stands on the bridge');
 assert.ok(Number.isFinite(s.strategy.toolLift)&&Number.isFinite(s.strategy.toolPitch),'canopy follows the bridge');
}
assert.equal(sampleStory(277).fullImage.key,'dinner_a');
assert.equal(sampleStory(282).fullImage.key,'dinner_b');
assert.equal(sampleStory(280).actors.filter(a=>a.visible).length,0);
for(const [start,end] of [[131,179],[179,227],[227,285]]){
 const danger=start+(start===227?38:26);
 const a=sampleStory(danger+1),b=sampleStory(danger+6);
 assert.ok(a.actors.some(x=>x.id.startsWith('pig_')&&x.motion==='paper_run'),'escape before intrusion');
 assert.equal(a.strategy.gate,0,'gate stays locked at escape onset');
 assert.ok(b.strategy.breach>0,'door is mechanically breached later');
 assert.equal(sampleStory(start+25).strategy.decoy,0,'no decoy opens the gate');
}
setStoryMode('classic');
console.log(JSON.stringify({pairs,ties,timelineSamples:samples,presets:4,rawValuesPreserved:true,deterministicSeek:true}));
