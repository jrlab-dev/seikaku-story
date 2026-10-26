import * as BASE from './story_timeline_v4.mjs';
import {applyPigEscapeRule} from './pig_escape.mjs';
import {openingSample,applyWolfPersonality,OPENING_DURATION,OPENING_SHIFT}from './opening_v8.mjs';
import {applyPersonality,setCast,decideEnding,applyStances,getCast} from './personality_story.mjs';
import {siteHouses,puzzleCaption,applyTentAway} from './puzzle_houses.mjs';
import {planFor,planDuration,mapTime} from './endings.mjs';
export {setCast,getCast,decideEnding} from './personality_story.mjs';
{const q=typeof location!=='undefined'&&new URLSearchParams(location.search).get('cast');if(q){const[a,b,c,d]=q.split(',');setCast({pig_straw:a,pig_wood:b,pig_brick:c,wolf:d});}}
export * from './story_timeline_v4.mjs';
export let STORY_DURATION=240.45,SCENES=[];
let branch='normal';
export function selectBranch(id){branch=id;BASE.selectBranch(id);STORY_DURATION=id==='peace'?BASE.STORY_DURATION:BASE.STORY_DURATION+OPENING_SHIFT;SCENES=id==='peace'?BASE.SCENES:[{id:'opening_v7',at:0,title:'あるところに'},...BASE.SCENES.filter(s=>s.at>=23).map(s=>({...s,at:s.at+OPENING_SHIFT}))];return{id,duration:STORY_DURATION};}
export function sampleStory(t){
 if(branch==='peace')return applyPigEscapeRule(BASE.sampleStory(t));
 const ending=decideEnding(),plan=planFor(ending);STORY_DURATION=planDuration(plan);
 t=Math.max(0,Math.min(STORY_DURATION,t));const m=mapTime(plan,t);
 let s=baseSample(m.baseTime);
 if(m.phase==='variant'){const cap=plan.scene(s,m.q,plan.length);s.scene={...s.scene,caption:cap,id:'ending_'+ending.id};s.branch={...s.branch,caption:{...s.branch.caption,text:cap}};s.personality={beats:[]};applyStances(s,-1,!!plan.calm);}
 else{s=applyPersonality(s,m.baseTime);if(m.phase==='resume'){const f=plan?.resumeScene??plan?.after;if(f)s=f(s,m.baseTime)??s;}}
 if(s.resultCard&&ending.completion!=null){s.resultCard={...s.resultCard,target:ending.completion/100,meaning:ending.title};if(plan?.finale){s.scene={...s.scene,caption:plan.finale};s.branch={...s.branch,caption:{...s.branch.caption,text:plan.finale}};}}
 s.audioMap=m.phase==='variant'?{src:'bed',t:m.q}:{src:'base',t:m.phase==='resume'?m.baseTime:t};s.time=t;s.duration=STORY_DURATION;s.ended=t>=STORY_DURATION;s.endingPhase=m.phase;s.personality={...s.personality,ending};
 const sites=siteHouses(getCast());if(s.scene?.caption)s.scene={...s.scene,caption:puzzleCaption(s.scene.caption,sites)};if(s.branch?.caption?.text)s.branch={...s.branch,caption:{...s.branch.caption,text:puzzleCaption(s.branch.caption.text,sites)}};if(s.resultCard?.meaning)s.resultCard={...s.resultCard,meaning:puzzleCaption(s.resultCard.meaning,sites)};s.puzzleSites=sites;if(m.phase==='base')applyTentAway(s,sites);
 return applyPigEscapeRule(s);
}
function baseSample(t){
 t=Math.max(0,Math.min(240.45,t));const old=t<OPENING_DURATION?0:Math.round((t-OPENING_SHIFT)*1e9)/1e9;
 let s=BASE.sampleStory(old);s.storyTime=old;s.time=t;s.scene={...s.scene,at:s.scene.at+OPENING_SHIFT};
 if(t<OPENING_DURATION)s=openingSample(s,t);
 else if(t<OPENING_DURATION+.35)s.cutOpacity=.85*(1-(t-OPENING_DURATION)/.35);
 return applyWolfPersonality(s,t);
}
export function createStoryClock(){let time=0,playing=false;return{get time(){return time},get playing(){return playing},play(){if(time>=STORY_DURATION)time=0;playing=true},pause(){playing=false},reset(){time=0;playing=false},seek(t){time=Math.max(0,Math.min(STORY_DURATION,Number.isFinite(t)?t:0))},tick(dt){if(playing)time=Math.min(STORY_DURATION,time+Math.max(0,Math.min(.1,dt)));if(time>=STORY_DURATION)playing=false;return sampleStory(time)}}}
selectBranch('normal');
