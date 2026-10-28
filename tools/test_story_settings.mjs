import assert from 'node:assert/strict';
import {PRESETS,ROLES,flow,changesFor} from '../three-pigs/test-settings.mjs';
import {evaluateEnding} from '../three-pigs/play/web_J38/story_rules.mjs';
assert.equal(new Set(PRESETS.map(p=>p.id)).size,14);
let alternatives=0,marked=0;
for(const p of PRESETS){
 assert.equal(flow(p.cast).id,p.id,p.id);
 const before=JSON.stringify(p.cast),a=changesFor(p.cast);
 for(const role of ROLES)for(let i=0;i<5;i++){
  for(const value of ['1','3','5']){
   if(value===p.cast[role][i])continue;
   const d=[...p.cast[role]];d[i]=value;
   const actual=evaluateEnding({...p.cast,[role]:d.join('')}).id;
   const match=a.changes[role][i].find(c=>c.value===value);
   assert.equal(!!match,actual!==p.id,p.id+' '+role+' '+i+' '+value);
   if(match){assert.equal(match.id,actual);marked++;}
   alternatives++;
  }
 }
 assert.equal(JSON.stringify(p.cast),before);
}
const peace=PRESETS.find(p=>p.id==='peace');
assert.ok(changesFor(peace.cast).changes.pig_straw[3].length);
for(const role of ['pig_wood','pig_brick'])assert.ok(changesFor(peace.cast).changes[role].every(c=>!c.length));
assert.equal(alternatives,560);
console.log(JSON.stringify({presets:14,alternatives,marked,peaceIgnoresLaterPigs:true}));
