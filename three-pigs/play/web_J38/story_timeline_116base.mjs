import {sampleStory as sample84,configureStoryBindings,storyBindings,DOORS,routeBetween,routePose} from './story_timeline_84.mjs';
import {introStory} from './personality_intro.mjs';
import {STORY_SCRIPT} from './story_script.mjs';
import {constructionStateAt,rendererHouseStates} from './story_world_state.mjs';
export {configureStoryBindings,storyBindings,DOORS,routeBetween,routePose};
export const STORY_DURATION=116;
export const SCENES=STORY_SCRIPT.scenes.map(s=>({id:s.id,at:s.start,title:s.title}));
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const names={narrator:'',wolf:'狼',pig1:'長男',pig2:'次男',pig3:'三男',pigs:'こぶたたち'};
export function sampleStory(seconds){
 const t=clamp(Number.isFinite(seconds)?seconds:0,0,116);
 if(t<40)return introStory(t);
 const old=sample84(t-32),s=STORY_SCRIPT.scenes.find(s=>t>=s.start&&t<s.end)||STORY_SCRIPT.scenes.at(-1);
 const line=s.lines.find(l=>t>=l.start&&t<l.end);
 const caption=line?(names[line.speaker]?names[line.speaker]+'「'+line.text+'」':line.text):t===116?'おしまい — みんな無事':'';
 const world=constructionStateAt(t),renderHouses=rendererHouseStates(world);
 return{...old,time:t,duration:116,world,scene:{id:s.id,at:s.start,title:s.title,caption},
 camera:{...old.camera,interval:old.camera.interval?.map(n=>n+32)},
 effects:old.effects.map(e=>({...e,start:e.start+32,end:e.end+32})),intro:null,
 houses:Object.fromEntries(Object.entries(old.houses).map(([id,h])=>[id,{...renderHouses[id],...h}])),legacyScene:old.scene.id,ended:t>=116};
}
export function createStoryClock(){let time=0,playing=false;return{get time(){return time},get playing(){return playing},play(){if(time>=116)time=0;playing=true;},pause(){playing=false;},reset(){time=0;playing=false;},seek(t){time=clamp(Number.isFinite(t)?t:0,0,116);},tick(dt){if(playing)time=clamp(time+clamp(dt,0,.1),0,116);if(time>=116)playing=false;return sampleStory(time);}};}

