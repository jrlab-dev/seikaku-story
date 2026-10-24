import * as BASE from './arrival_story.mjs';
import {branchId} from './branch_context.mjs';
import {HOUSE_CENTERS} from './construction_camera.mjs';
import {gustAt} from './story_gust.mjs';
export * from './arrival_story.mjs';
export const WALK_INSERT=3,INSERT_AT=97.5;
export let STORY_DURATION=217.2,SCENES=[];
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
export function selectBranch(id){BASE.selectBranch(id);STORY_DURATION=id==='peace'?BASE.STORY_DURATION:217.2;SCENES=BASE.SCENES.map(s=>({...s,at:id==='normal'&&s.at>INSERT_AT?s.at+WALK_INSERT+(s.at>=177.5?8:0):s.at}));return{id,duration:STORY_DURATION};}
export const sourceTime=t=>t<97.5?t:t<100.5?97.5:t<180.5?t-3:t<188.5?177.5:t<213.2?t-11:202.2;
export const MANGA_EVENTS=[
 {id:'straw_break',start:105.8,duration:.85,text:'ガシャーン！',kind:'collapse',house:'straw',power:1.2},
 {id:'wood_break',start:133.35,duration:.85,text:'ガシャーン！',kind:'collapse',house:'wood',power:1.3},
 {id:'wood_slam',start:118,duration:.6,text:'バーン！',kind:'door',house:'wood',power:1.05},
 {id:'brick_slam',start:148.75,duration:.6,text:'バーン！',kind:'door',house:'brick',power:1.15},
 {id:'pig_escape',start:109.2,duration:.55,text:'ダダーッ！',kind:'escape',actor:'pig_straw',power:1},
 {id:'brothers_escape',start:137.1,duration:.55,text:'ダダーッ！',kind:'escape',actor:'pig_wood',power:1},
 {id:'wolf_escape',start:184.2,duration:.85,text:'ビューッ！',kind:'escape',actor:'wolf',power:1.35}
];
function sourceFor(s,c){if(c.kind==='build')return s.build.target.map((x,i)=>x+(i===1?.25:0));if(c.house){const h=HOUSE_CENTERS[c.house];return c.kind==='door'?[h[0]-.65,h[1]+1.4,h[2]+2.2]:[h[0],h[1]+3,h[2]];}const a=s.actors.find(a=>a.id===(c.actor||'wolf'));return a?[a.x,.95,a.z]:null;}
export function sampleStory(t){if(branchId()==='peace')return BASE.sampleStory(t);t=Math.max(0,Math.min(217.2,t));const old=sourceTime(t),s=BASE.sampleStory(old);s.duration=217.2;s.ended=t>=217.2;s.effectTime=s.effectTime??s.animationTime??s.time;s.time=t;s.scene.at=s.scene.at>INSERT_AT?s.scene.at+3+(s.scene.at>=177.5?8:0):s.scene.at;s.manga={baseTime:old,insertedWalk:t>=97.5&&t<100.5};
 if(t<24){const n=Math.min(3,Math.floor(t/6)),a=s.actors.find(x=>x.visible),c=n===3?[72,0,38]:HOUSE_CENTERS[['straw','wood','brick'][n]];Object.assign(a,{x:c[0],z:c[2],yOffset:0,motion:'idle'});delete a.worldY;
  s.camera=n===3?{id:'J84_wolf_remote_hill',position:[c[0]-5,2.3,c[2]+5.5],target:[c[0],.95,c[2]],fov:23.96500634612084,terrainRelative:true}:{id:'J84_intro_plot_'+a.id,position:[c[0]+2.8,1.9,c[2]+5.6],target:[c[0],.8,c[2]],fov:23.96500634612084,terrainRelative:true};
  a.yaw=n===3?-Math.PI/4:.15*Math.sin(t*1.4);s.introPlacement={subject:a.id,plotCenter:c,remote:n===3,distanceFromVillage:n===3?Math.hypot(c[0]-2.1,c[2]+2.25):null};
 }
 if(t>=97.5&&t<100.5){const q=t-97.5,u=q/3,a=s.actors.find(a=>a.id==='wolf'),start=[9.55,4.72],end=[4.45,3.7],yaw=Math.atan2(end[0]-start[0],end[1]-start[1]);Object.assign(a,{x:start[0]+(end[0]-start[0])*u,z:start[1]+(end[1]-start[1])*u,yaw,motion:'walk',motionTime:q*1.5});
  const arrival=BASE.sampleStory(97.5).camera,follow={position:[a.x+3.7,2.35,a.z+5],target:[a.x-1,.95,a.z-2.6]},blend=smooth((q-1.4)/1.6);s.camera={id:'J84_restored_intro_walk',position:follow.position.map((x,i)=>x+(arrival.position[i]-x)*blend),target:follow.target.map((x,i)=>x+(arrival.target[i]-x)*blend),fov:46,terrainRelative:true};s.arrivalFix=null;s.introWalk={progress:u,restored:true};
 }
 if(t>=100.5&&t<102.5){const a=s.actors.find(a=>a.id==='wolf');a.motionTime+=4.5;}

 if(t>=180.5&&t<188.5){const q=t-180.5,phase=q<1.5?'notice':q<3?'idea':q<5.7?'add_wood':q<6.4?'ignite':'fire';s.fireScene={elapsed:q,phase};s.comic=null;s.tailFlame=null;s.gustOverride=null;s.effects=[];s.cutOpacity=0;s.intro=null;s.drama=null;s.camera={id:'J84_brick_interior_cause',position:[122.6,32.4,-74.8],target:[119.7,31.1,-81.5],fov:44,terrainRelative:false};
  for(const a of s.actors){a.visible=a.id!=='wolf';a.motion='idle';a.worldY=30;a.yOffset=0;a.yaw=Math.PI*.1;delete a.ownerDoor;if(a.id==='pig_straw'){a.x=122.2;a.z=-79.5;}if(a.id==='pig_wood'){a.x=122.3;a.z=-82.1;}if(a.id==='pig_brick'){a.x=120.2+1.46*smooth((q-2.3)/.7);a.z=-80.4-smooth((q-2.3)/.7);if(q>=3){const u=smooth((q-3)/2.7);a.motion='door_host';a.motionTime=q;a.ownerDoor={contactXZ:[121-1.75*u+.65*smooth((q-6)/.35),-81.3+.2*u+.6*smooth((q-6)/.35)],floor:30,phase:'closing',open:0,thresholdZ:-79,houseX:120};}}a.yaw=Math.atan2(118.2-a.x,-82.35-a.z);}
  const text=q<1.5?'三男「えんとつから音がする……おおかみだ！」':q<3?'三男「……そうだ。薪を足して、火をくべよう！」':q<5.7?'次男「薪はここだよ！」 三男が暖炉へ運びます。':q<6.4?'薪を置いて、火をつけます。':'小さな火がつき、煙がえんとつを上がりました。';s.scene.caption=text;s.branch.caption={...s.branch.caption,text};
 }
 if(old>=182.6&&old<184.8&&t<213.2){const a=s.actors.find(a=>a.id==='wolf'),open=smooth((old-182.6)/.4)*(1-smooth((old-184.35)/.45));Object.assign(s.houses.brick,{doorOpen:open,door:open>.01?'open':'closed',doorSwing:'inward'});s.wolfExit={doorOpen:open,threshold:-11.8,flameStarts:182.8};if(old<183.2)s.camera={id:'J84_wolf_open_door_shock',position:[25,3.46,-2.5],target:[19.35,2.4,-11.8],fov:46,terrainRelative:false};
  if(old<184.2){const u=smooth((old-183.05)/.65);Object.assign(a,{visible:old>=182.8,x:19.35,z:-13+2.6*u,motion:old<183.12?'startled':'run_spiral',motionTime:Math.max(0,old-183.12),runAway:false,yaw:0});a.worldY=1.06+.3*(1-smooth((a.z+11.8)/1.3));a.tailFlame={active:old>=182.8,elapsed:old-182.8,fade:1};s.tailFlame=a.tailFlame;s.wolfExit.expression=old<183.12?'surprise':'panic';}
 }
 if(t>=213.2){s.resultCard={elapsed:t-213.2,completion:Math.min(1,(t-213.2)/2.5),label:'ストーリー完成度',meaning:'通常ルートを最後まで辿った完成度'};s.scene.caption='通常ルートを最後までたどりました。みんな無事！';s.branch.caption={...s.branch.caption,text:s.scene.caption};s.comic=null;}

 let c=s.comic;
 if(c?.kind==='build'){c={...c,power:1,phase:c.phase*.28,house:s.build.house};}
 if(c?.kind==='breath'){const round=s.battle?.round||1;c={...c,text:round>1?'ブオオッ！':'フオオッ！',power:round===3?1.3:round===2?1.15:1.05,actor:'wolf'};if(c.phase>.75)c=null;}
 if(c?.kind==='tired'){c={...c,power:.7};if(c.phase>1.2)c=null;}
 const g=s.gustOverride!==undefined?s.gustOverride:gustAt(s.effectTime);if(!c&&g&&g.house==='straw'&&s.effectTime>=g.emission&&s.effectTime<g.emission+.75)c={text:'ブオオッ！',kind:'breath',phase:s.effectTime-g.emission,power:1.2,actor:'wolf'};
 for(const e of MANGA_EVENTS)if(old>=e.start&&old<e.start+e.duration)c={...e,phase:old-e.start};
 if(c){c.sourceWorld=sourceFor(s,c);c.sourceTerrainRelative=['breath','escape','tired'].includes(c.kind);c.style='J84_manga';}s.comic=c;return s;
}
export function createStoryClock(){let time=0,playing=false;return{get time(){return time},get playing(){return playing},play(){if(time>=STORY_DURATION)time=0;playing=true;},pause(){playing=false;},reset(){time=0;playing=false;},seek(t){time=Math.max(0,Math.min(STORY_DURATION,Number.isFinite(t)?t:0));},tick(dt){if(playing)time=Math.min(STORY_DURATION,time+Math.max(0,Math.min(.1,dt)));if(time>=STORY_DURATION-1e-8)playing=false;return sampleStory(time);}};}
selectBranch('normal');
