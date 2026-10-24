import {gustAt} from './story_gust_84.mjs';
import {cameraForStory} from './story_camera_84.mjs';
import {STORY_SCRIPT} from './story_script_84.mjs';
export const STORY_DURATION=STORY_SCRIPT.durationSeconds;
export const SCENES=STORY_SCRIPT.scenes.map(s=>({id:s.id,at:s.start,title:s.title}));
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const lane=x=>4.3-.018*(x-2)**2;
export const DOORS={straw:[1.45,1.4],wood:[-20.65,-11.4],brick:[19.35,-10.4]};
const point=(x,z,y=0)=>({x,z,y});
function branch(id){const p=DOORS[id];if(id==='straw')return[p,[p[0],lane(p[0])]];const z=id==='wood'?-15:-14,x=p[0]+.65;return[p,[p[0],z+5.8],[x-.3,(z+5.8+lane(x))/2],[x+.4,lane(x+.4)]];}
function lanePoints(a,b){const n=Math.max(1,Math.ceil(Math.abs(b-a)));return Array.from({length:n+1},(_,i)=>{const x=a+(b-a)*i/n;return[x,lane(x)];});}
export function routeBetween(a,b){const from=branch(a),to=branch(b);return [...from,...lanePoints(from.at(-1)[0],to.at(-1)[0]).slice(1),...to.slice(0,-1).reverse()];}
export function routePose(points,u,offset=0){
 points=points.map(p=>Array.isArray(p)?point(...p):p);
 const lengths=points.slice(1).map((p,i)=>Math.hypot(p.x-points[i].x,p.z-points[i].z,(p.y||0)-(points[i].y||0)));
 const total=lengths.reduce((a,b)=>a+b,0);let remaining=clamp(u)*total;
 for(let i=0;i<lengths.length;i++)if(remaining<=lengths[i]||i===lengths.length-1){const a=points[i],b=points[i+1],f=lengths[i]?remaining/lengths[i]:0,yaw=Math.atan2(b.x-a.x,b.z-a.z);return{x:a.x+(b.x-a.x)*f+Math.cos(yaw)*offset,z:a.z+(b.z-a.z)*f-Math.sin(yaw)*offset,yOffset:(a.y||0)+((b.y||0)-(a.y||0))*f,yaw,distance:clamp(u)*total};}else remaining-=lengths[i];
 throw Error('Route needs at least two points');
}
const anchors={forest_entry:point(8,lane(8)),forest_exit:point(40,lane(40)),straw_escape_clear:point(-2.8,4.0),wood_escape_clear:point(-22,-8.8),straw_attack:point(1.45,3.1),wood_attack:point(-18.4,-9.5),brick_attack:point(19.35,-8.2),brick_wait_left:point(18.45,-9.7),brick_wait_right:point(20.3,-9.7),brick_front_left:point(18.1,-8.8),brick_front_center:point(19.7,-8.8),brick_front_right:point(21.3,-8.8),brick_rear:point(24,-17.8),brick_roof_edge:point(23,-14.81,4.5),brick_chimney_top:point(21.13,-14.81,5.77),brick_chimney_hidden:point(21.13,-14.81,3.9)};
for(const[id,p]of Object.entries(DOORS)){anchors[id+'_door']=point(...p);anchors[id+'_inside']=point(p[0],p[1]-2.6);}
const routes={path_to_straw:[[8,lane(8)],[1.45,lane(1.45)]],path_straw_to_wood:routeBetween('straw','wood').slice(1,-1),path_wood_to_brick:routeBetween('wood','brick').slice(1,-1),path_brick_to_forest:[...branch('brick').slice(1),...lanePoints(20.4,40).slice(1)]};
export function configureStoryBindings(data){if(data.anchors)for(const[k,v]of Object.entries(data.anchors)){if(!anchors[k])throw Error('Unknown anchor '+k);anchors[k]={...v};}}
export function storyBindings(){return structuredClone({anchors,routes});}
const ids={pig1:'pig_straw',pig2:'pig_wood',pig3:'pig_brick',wolf:'wolf'};
const label={narrator:'',wolf:'おおかみ',pig1:'いちばん上のこぶた',pig2:'ふたりめのこぶた',pig3:'いちばん下のこぶた',pigs:'こぶたたち'};
export function sampleStory(seconds){
 const t=clamp(Number.isFinite(seconds)?seconds:0,0,STORY_DURATION),scene=STORY_SCRIPT.scenes.find(s=>t>=s.start&&t<s.end)||STORY_SCRIPT.scenes.at(-1);
 const entities=structuredClone(scene.entryState.actors);
 for(const ev of scene.events.filter(e=>e.at<=t)){if(entities[ev.entity])Object.assign(entities[ev.entity],ev.values);}
 const actors=Object.entries(entities).map(([id,a])=>{const p=anchors[a.anchor];if(!p)throw Error('Missing anchor '+a.anchor);const look=DOORS[a.facing.replace('toward_','')];return{id:ids[id],scriptId:id,anchor:a.anchor,x:p.x,z:p.z,yOffset:p.y,yaw:look?Math.atan2(look[0]-p.x,look[1]-p.z):0,visible:a.visible,alive:a.alive,motion:'idle',motionTime:0};});
 const cuts=[],travel=[];
 for(const m of scene.moves){if(t<m.start)continue;const a=actors.find(a=>a.scriptId===m.actor),pts=m.path.flatMap(n=>routes[n]?routes[n].map(p=>point(...p)):[anchors[n]]);
  if(pts.some(p=>!p))throw Error('Unbound path '+m.path.join(','));
  const cut=scene.id==='11_everyone_safe'?75.8:Math.round((m.start+m.end));
  const cutAt=scene.id==='11_everyone_safe'?cut:cut/2;
  const continuous=m.actor==='wolf'&&m.style==='translate_static_sprite'&&!m.path[0].endsWith('_inside'),arrived=t>=(continuous?m.end:cutAt),p=continuous&&!arrived?(()=>{const total=routePose(pts,1).distance,half=(m.start+m.end)/2,speed=1.15,d=t<half?(t-m.start)*speed:total-(m.end-t)*speed;return routePose(pts,d/total);})():arrived?pts.at(-1):pts[0];
  Object.assign(a,{x:p.x+(m.actor==='pig2'&&!arrived&&m.path[0]==='wood_escape_clear'?1.4:0),z:p.z,yOffset:p.y||0,yaw:arrived?0:Math.atan2(pts.at(-1).x-p.x,pts.at(-1).z-p.z),motion:'idle',motionTime:0,anchor:arrived?m.endAnchor:m.path[0]});
  if(continuous&&!arrived){Object.assign(a,{yaw:p.yaw,motion:'walk',motionTime:p.distance/1.15});travel.push(a.id);}
  if(m.actor==='wolf'){
   const house=m.endAnchor.endsWith('_attack')?m.endAnchor.replace('_attack',''):null;
   if(arrived&&house){const door=DOORS[house];a.yaw=Math.atan2(door[0]-a.x,door[1]-a.z);}
   if(scene.id==='10_wolf_leaves'&&(!continuous||arrived)){
    const end=arrived?pts.at(-1):pts[0],other=(arrived?[...pts].reverse():pts).find(p=>Math.hypot(p.x-end.x,p.z-end.z)>.001);
    if(other)a.yaw=arrived?Math.atan2(end.x-other.x,end.z-other.z):Math.atan2(other.x-end.x,other.z-end.z);
   }
  }
  if(!continuous&&(m.end-m.start>2||m.style.startsWith('schematic')||scene.id==='11_everyone_safe'))cuts.push(cutAt);
 }
 const effects=scene.effects.filter(e=>t>=e.start&&t<e.end);
 const gust=gustAt(t);if(gust){const wolf=actors.find(a=>a.id==='wolf');wolf.motion=t>=gust.exhale?'blow':'idle';wolf.yaw=Math.atan2(gust.wind[0],gust.wind[2]);}
 if(t>=76.4)for(const a of actors.filter(a=>a.id!=='wolf'))a.yaw=0;
 const houses={};for(const id of ['straw','wood','brick']){const cue=STORY_SCRIPT.scenes.flatMap(s=>s.effects).find(e=>e.effect==='collapse_'+id);const start=cue?.start??Infinity;houses[id]={intact:t<start,time:clamp((t-start)*2,0,8),door:'closed'};}
 const line=scene.lines.find(l=>t>=l.start&&t<l.end),caption=line?(label[line.speaker]?label[line.speaker]+'「'+line.text+'」':line.text):t===84?'おしまい — みんな無事': '';
 const cutOpacity=cuts.reduce((max,cut)=>Math.max(max,clamp(1-Math.abs(t-cut)/.3)),0);
 return{time:t,duration:STORY_DURATION,scene:{id:scene.id,at:scene.start,title:scene.title,caption},actors,houses,effects,camera:cameraForStory(scene,t,actors),travel,ended:t>=STORY_DURATION,schematicChimney:t>=57.8&&t<66.6,cutOpacity,movementMode:'illustrated_story_cuts'};
}
export function createStoryClock(){let time=0,playing=false;return{get time(){return time},get playing(){return playing},play(){if(time>=STORY_DURATION)time=0;playing=true;},pause(){playing=false;},reset(){time=0;playing=false;},seek(t){time=clamp(Number.isFinite(t)?t:0,0,STORY_DURATION);},tick(dt){if(playing)time=clamp(time+clamp(dt,0,.1),0,STORY_DURATION);if(time>=STORY_DURATION)playing=false;return sampleStory(time);}};}
