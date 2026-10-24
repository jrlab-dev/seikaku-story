import * as BASE from './story_timeline_J96.mjs';
export * from './story_timeline_J96.mjs';
export let STORY_DURATION=229.7,SCENES=[];
let branch='normal';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function caption(s,text){s.scene.caption=text;s.branch.caption={...s.branch.caption,text};}
export function selectBranch(id){branch=id;BASE.selectBranch(id);STORY_DURATION=id==='peace'?BASE.STORY_DURATION:229.7;SCENES=id==='peace'?BASE.SCENES:[{id:'J102_purpose',at:0,title:'それぞれの家を建てよう'},...BASE.SCENES.map(s=>({...s,at:s.at+5}))];return{id,duration:STORY_DURATION};}
export function sampleStory(t){
 if(branch==='peace')return BASE.sampleStory(t);
 t=clamp(t,0,229.7);const old=Math.max(0,t-5),s=BASE.sampleStory(old);
 s.time=t;s.duration=229.7;s.ended=t>=229.7;s.J102={sourceTime:old,introAdded:5};s.scene={...s.scene,at:(s.scene.at||0)+5};
 if(t<5){
  s.intro=null;s.drama=null;s.build=null;s.completion=null;s.effects=[];s.comic=null;s.cutOpacity=0;
  for(const a of s.actors){const i=['pig_straw','pig_wood','pig_brick'].indexOf(a.id);a.visible=i>=0;if(i>=0){Object.assign(a,{x:.5+i*1.35,z:4.1,yaw:0,motion:'idle',motionTime:t,yOffset:0});delete a.worldY;delete a.ownerDoor;}}
  s.camera={id:'J102_purpose_three_pigs',position:[1.85,1.5,9.1],target:[1.85,.85,4.1],fov:45,terrainRelative:true};
  caption(s,'3びきの子ぶたは、それぞれの家を建てて暮らすことにしました。');
 }
 if(old>=110&&old<110.2)caption(s,'戸をしっかり閉めました。');
 if(old>=186&&old<188){caption(s,'屋根の上で、コトコト……。');s.camera={...BASE.sampleStory(186.8).camera,id:'J102_roof_before_fire'};s.comic=null;s.effects=s.effects.filter(e=>e.effect!=='comic_plop_caption');}
 const q=t-201.85;
 s.chimneyImpact={elapsed:q,active:q>=0&&q<3.9,translationMetres:.06,rollRadians:.005};
 if(q>=0&&q<3.9){s.comic={text:'ギャー!!',kind:'chimney_scream',phase:q,power:2,sourceWorld:[21.13,6.12,-14.81],sourceTerrainRelative:false};s.effects=s.effects.filter(e=>e.effect!=='comic_plop_caption');}
 return s;
}
export function createStoryClock(){let time=0,playing=false;return{get time(){return time},get playing(){return playing},play(){if(time>=STORY_DURATION)time=0;playing=true},pause(){playing=false},reset(){time=0;playing=false},seek(t){time=clamp(Number.isFinite(t)?t:0,0,STORY_DURATION)},tick(dt){if(playing)time=clamp(time+clamp(dt,0,.1),0,STORY_DURATION);if(time>=STORY_DURATION)playing=false;return sampleStory(time)}}}
selectBranch('normal');
