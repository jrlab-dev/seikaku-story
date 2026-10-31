import fs from 'node:fs';
import assert from 'node:assert/strict';
import {PRESETS} from '../three-pigs/test-settings.mjs';
import {setStoryMode,setCast} from '../three-pigs/play/web_J38/personality_story.mjs';
import {sampleStory,selectBranch,STORY_DURATION} from '../three-pigs/play/web_J38/story_timeline.mjs';
import {CENTERS} from '../three-pigs/play/web_J38/endings/strategy.mjs';
import {viewSupport} from '../three-pigs/play/web_J38/sprite_math.mjs';

// Pass bounds extracted from the shipped models; missing geometry must fail closed.
const args=process.argv.slice(2),option=name=>{const i=args.indexOf(name);return i<0?null:args[i+1];};
const boundsFile=option('--bounds');
assert.ok(boundsFile,'Usage: node tools/test_strategy_geometry.mjs --bounds model-bounds.json [--output result.json]');
const geometry=JSON.parse(fs.readFileSync(boundsFile,'utf8'));
const manifest=JSON.parse(fs.readFileSync(new URL('../three-pigs/play/web_J38/assets/characters/manifest.json',import.meta.url),'utf8'));
const actorDefinitions=Object.fromEntries(manifest.characters.map(a=>[a.id,a]));
for(const site of Object.keys(CENTERS))assert.ok(geometry.sites?.[site]?.walls?.length>=4,'Missing actual walls: '+site);
const STEP=.02,MAX_SPEED=12,POSITION_TOLERANCE=.02;
// A torso needs an 0.8 m corridor: use the same 0.4 m safety radius for all roles.
// This covers body clearance; broad atlas margins and motion limbs need rendered QA.
const radius=()=>.40;
const failures=[],counts={samples:0,continuousSegments:0,explicitCuts:0,visibilityChanges:0,wallChecks:0,gateCrossings:0,transferViewChecks:0};
const transferView={};
const fail=(type,preset,t,id,extra={})=>failures.push({type,preset,t:+t.toFixed(3),id,...extra});
const cutKey=s=>[s.scene?.id,s.camera?.id].join('/');
function clipSegment(a,b,min,max,pad=0){
 let lo=0,hi=1;
 for(const k of [0,1]){const v=k===0?'x':'z',d=b[v]-a[v],mn=min[k===0?0:2]-pad,mx=max[k===0?0:2]+pad;
  if(Math.abs(d)<1e-10){if(a[v]<mn||a[v]>mx)return null;}
  else{let x=(mn-a[v])/d,y=(mx-a[v])/d;if(x>y)[x,y]=[y,x];lo=Math.max(lo,x);hi=Math.min(hi,y);if(lo>hi)return null;}}
 return {lo,hi,x:a.x+(b.x-a.x)*lo,z:a.z+(b.z-a.z)*lo};
}
function planeCross(a,b,axis,value){const d=b[axis]-a[axis];if(Math.abs(d)<1e-9)return null;const u=(value-a[axis])/d;return u>0&&u<=1?{x:a.x+(b.x-a.x)*u,z:a.z+(b.z-a.z)*u}:null;}
function doorInterval(site){const h=geometry.sites[site],doors=geometry.models?.[h.kind]?.filter(x=>/__Door(?:_Left|_Right)?$/.test(x.name));assert.ok(doors?.length,'Missing actual doorway '+site);return [Math.min(...doors.map(x=>x.min[0]))+CENTERS[site][0],Math.max(...doors.map(x=>x.max[0]))+CENTERS[site][0]];}
const doorways=Object.fromEntries(Object.keys(CENTERS).map(site=>[site,doorInterval(site)]));
function walls(a,b,prev,s,preset,t){
 const r=radius(a.id);
 for(const [site,h]of Object.entries(geometry.sites)){
  if((prev.houses[site]?.constructionStage??0)<5||(s.houses[site]?.constructionStage??0)<5)continue;
  for(const wall of h.walls){counts.wallChecks++;const hit=clipSegment(a,b,wall.min,wall.max,r);if(!hit)continue;
   // POSITION bounds surround doorway holes, so carve only the model's real door interval.
   const [left,right]=doorways[site],open=Math.min(prev.houses[site]?.doorOpen??0,s.houses[site]?.doorOpen??0);
   if(/Wall_Front$/.test(wall.name)&&open>=.7&&hit.x-r>=left&&hit.x+r<=right)continue;
   const rearOpen=Math.min(prev.strategy?.site===site?prev.strategy.rearOpen??0:0,s.strategy?.site===site?s.strategy.rearOpen??0:0);
   if(/Wall_Back$/.test(wall.name)&&rearOpen>.9&&hit.x-r>=CENTERS[site][0]-1.45&&hit.x+r<=CENTERS[site][0]+.15)continue;
   fail('house-wall',preset,t,a.id,{site,wall:wall.name,from:[a.x,a.z],to:[b.x,b.z],torsoRadius:r,doorOpen:open});
  }
 }
}
function gates(a,b,prev,s,preset,t){
 if(s.strategy?.revision===3||s.strategyPrelude?.revision===3||s.houseOccupancy)return;
 const states=state=>{const f=state.strategy??state.strategyPrelude;if(!f)return{};const out={[f.site]:f};if(f.arrival)out[f.arrival.site]={gate:f.arrival.gate,exit:0};return out;};
 const before=states(prev),after=states(s);
 for(const[site,f]of Object.entries(after)){
 if(!before[site])continue;
 const old=before[site],c=CENTERS[site],r=radius(a.id),cross=planeCross(a,b,'z',c[2]+4.95);
 if(cross&&Math.abs(cross.x-c[0])<2.4+r){counts.gateCrossings++;const open=Math.min(old.gate??0,f.gate??0),half=.03+.95*open;
  if(Math.abs(cross.x-c[0])+r>half+.015)fail('closed-or-narrow-gate',preset,t,a.id,{site,gate:open,openingHalfWidth:half,xFromCentre:cross.x-c[0],torsoRadius:r});}
 for(const side of [-1,1]){const sideCross=planeCross(a,b,'x',c[0]+side*2.4);if(!sideCross||sideCross.z<c[2]+2.3-r||sideCross.z>c[2]+4.8+r)continue;
  const exit=side===1&&sideCross.z>=c[2]+3.55+r&&sideCross.z<=c[2]+4.75-r&&Math.min(old.exit??0,f.exit??0)>.8;
  if(!exit)fail('closed-side-barrier',preset,t,a.id,{site,side,zFromCentre:sideCross.z-c[2],exit:f.exit??0});}
 }
}
function transferVisibility(s,preset,t){
 if(!s.camera?.id?.startsWith('strategy_transfer'))return;
 const p=s.camera;
 if(!p.groundFocus){fail('missing-transfer-ground-focus',preset,t,'camera');return;}
 // The viewer raises eye and target from the walk surface at groundFocus.
 // Check the real sprite rejection function with a common local ground of zero.
 // Height differences along actual terrain and final sprite foot offsets need browser QA.
 const camera={x:p.position[0],y:p.position[1],z:p.position[2]};
 for(const a of s.actors.filter(a=>a.visible!==false&&a.id.startsWith('pig_'))){
  const def=actorDefinitions[a.id],height=def.visibilityHeightMetres??def.heightMetres;
  assert.ok(height>0,'Missing character height '+a.id);
  const status=viewSupport({x:a.x,y:0,z:a.z},height,camera,manifest.supportedElevationDegrees);counts.transferViewChecks++;
  const row=transferView[a.id]??={height,minimum:Infinity,maximum:-Infinity,samples:0};
  row.minimum=Math.min(row.minimum,status.elevation);row.maximum=Math.max(row.maximum,status.elevation);row.samples++;
  if(!status.supported)fail('transfer-view-unsupported',preset,t,a.id,{elevation:status.elevation,range:manifest.supportedElevationDegrees,height,cameraLocalY:camera.y,position:[a.x,a.z]});
 }
}
setStoryMode('strategy');
for(const p of PRESETS.filter(p=>p.mode==='strategy')){
 setCast(p.cast);selectBranch('normal');const duration=STORY_DURATION;
 let prev=sampleStory(0);
 for(let n=1;n<=Math.ceil(duration/STEP);n++){
  const t=Math.min(n*STEP,duration),s=sampleStory(t);counts.samples++;
  transferVisibility(s,p.id,t);
  if(cutKey(prev)!==cutKey(s)){counts.explicitCuts++;prev=s;continue;}
  for(const a of prev.actors){const b=s.actors.find(x=>x.id===a.id);if(a.visible===false||b?.visible===false||!b){counts.visibilityChanges++;continue;}
   const distance=Math.hypot(b.x-a.x,b.z-a.z);counts.continuousSegments++;
   if(distance>MAX_SPEED*STEP+POSITION_TOLERANCE)fail('position-jump',p.id,t,a.id,{distance,from:[a.x,a.z],to:[b.x,b.z],camera:s.camera?.id,caption:s.scene?.caption});
   if(distance>1e-7){walls(a,b,prev,s,p.id,t);gates(a,b,prev,s,p.id,t);}
  }
  prev=s;
 }
}
assert.equal(counts.gateCrossings,0,'No auxiliary gates remain');
assert.ok(counts.transferViewChecks>0||failures.some(f=>f.type==='missing-transfer-ground-focus'),'No transfer visibility samples were exercised');
// Keep every failure in the JSON; console output remains compact.
const totals=Object.fromEntries([...new Set(failures.map(f=>f.type))].map(type=>[type,failures.filter(f=>f.type===type).length]));
const result={checkedAt:new Date().toISOString(),method:'Actual model wall POSITION bounds; swept 0.8m torso corridor in XZ; real front doorway and new 1.6m rear exit must be open. Conservative bounds are not triangle collision or rendered visual QA.',stepSeconds:STEP,maxSpeedMetresPerSecond:MAX_SPEED,positionToleranceMetres:POSITION_TOLERANCE,torsoRadiusMetres:{pig:.40,wolf:.40},exclusions:'Only explicit scene/camera cuts and actor visibility changes; caption/phase boundaries are checked.',transferViewAssumption:'Real manifest heights and sprite_math.viewSupport; camera heights relative to groundFocus, actor local ground=0. Actual inter-actor terrain differences, foot offsets, occlusion and rendered pixels remain browser QA.',transferView,counts,totals,failures};
if(option('--output'))fs.writeFileSync(option('--output'),JSON.stringify(result,null,2));
console.log(JSON.stringify({...result,failures:failures.slice(0,30)},null,2));
assert.equal(failures.length,0,'Geometry regression failures: '+JSON.stringify(totals));
