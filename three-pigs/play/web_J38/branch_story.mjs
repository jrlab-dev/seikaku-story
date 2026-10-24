import {applyConstructionMontage} from './construction_montage.mjs';
import {sampleStory as base,SCENES as NORMAL_SCENES} from './story_escape_150.mjs';
import {branchId,setBranchId} from './branch_context.mjs';
import {RUNS,PEACE_LINES,causalLogAt,captionProjection,branchEvidence} from './branch_projection.mjs';
export {configureStoryBindings,storyBindings,DOORS,routeBetween,routePose} from './story_escape_150.mjs';
export {branchEvidence};
export let STORY_DURATION=150;
export let SCENES=NORMAL_SCENES;
export function selectBranch(id){setBranchId(id);STORY_DURATION=id==='normal'?150:88;SCENES=id==='normal'?NORMAL_SCENES.map(s=>({...s,title:s.at===25?'次男が木の家を建てる':s.at===40?'三男がれんがの家を建てる':s.title})):[...NORMAL_SCENES.filter(s=>s.at<64),...PEACE_LINES.map(l=>({id:'peace_'+l.id,at:l.at,title:{request:'食べ物を求める狼',offer:'食べ物を分ける提案',listen:'狼が話を聞く',boundary:'家を守る条件',promise:'約束と謝罪',invite:'いっしょに食べよう'}[l.id]}))];return{id,duration:STORY_DURATION};}
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
const shot=(id,position,target,fov=48)=>({id,position,target,fov,terrainRelative:true});
export function sampleStory(seconds){
 const id=branchId(),duration=id==='normal'?150:88,t=clamp(Number.isFinite(seconds)?seconds:0,0,duration);
 let s=structuredClone(base(id==='peace'&&t>=64?63.9:t));
 if(id==='peace'&&t>=7.5&&t<10){s.intro.oneLine='お腹はすいた。でも、相手の話も聞いてみたい。';}
 if(id==='peace'&&t>=64){
  s.time=t;s.duration=duration;s.ended=t>=duration;s.cutOpacity=0;s.schematicChimney=false;s.escape=null;s.effects=[];
  s.sourceTime=39.9;s.intro=null;s.drama={kind:'peace',note:'',recall:null};
  for(const h of Object.values(s.houses))Object.assign(h,{intact:true,time:0,door:'closed',constructionStage:5,blowAway:false});
  const pig=s.actors.find(a=>a.scriptId==='pig1'),wolf=s.actors.find(a=>a.scriptId==='wolf');
  for(const a of s.actors)Object.assign(a,{visible:false,alive:true,motion:'idle',motionTime:0});
  const u=clamp((t-64)/3),emerge=smooth((t-66)/1.5),relax=smooth((t-71.5)/2),invite=smooth((t-83.5)/2.5);
  Object.assign(wolf,{visible:true,x:8+(4.1-8)*u+.2*relax,z:3.652+(3.3-3.652)*u,yOffset:0,anchor:'peace_straw_path'});
  Object.assign(pig,{visible:t>=66,x:1.45-.15*smooth((t-67.5)/.7)+.25*invite,z:1.4+1.1*emerge,yOffset:0,anchor:'peace_straw_door'});
  wolf.yaw=Math.atan2(pig.x-wolf.x,pig.z-wolf.z)+.08*Math.sin((t-71.5)*2)*relax;
  pig.yaw=Math.atan2(wolf.x-pig.x,wolf.z-pig.z);
  const stage=PEACE_LINES.findLast(l=>t>=l.at);
  s.scene={id:'peace_'+stage.id,at:stage.at,title:SCENES.find(x=>x.id==='peace_'+stage.id)?.title??'和解',caption:''};
  if(t<67.5)s.camera=shot('peace_arrival',[wolf.x+2.8,1.6,wolf.z+5.5],[wolf.x,.8,wolf.z],46);
  else if(t<71.5)s.camera=shot('peace_offer_two_shot',[5.3,1.65,9.7],[2.65,.85,2.8],45);
  else if(t<75.5)s.camera=shot('peace_wolf_listens',[-1.3,1.65,8.2],[2.8,.85,2.9],45);
  else if(t<79.5)s.camera=shot('peace_promise_two_shot',[5.3,1.65,9.7],[2.65,.85,2.8],45);
  else if(t<83.5)s.camera=shot('peace_wolf_accepts',[-1.3,1.65,8.2],[2.8,.85,2.9],45);
  else {const pull=smooth((t-83.5)/4.5);s.camera=shot('peace_intact_home',[5.3+3*pull,1.65+1.6*pull,9.7+5*pull],[2.65,1+pull,1.9-1.5*pull],48);}
  s.drama.note=t<67.5?'大きな声に、長男は警戒':t<71.5?'食べ物を分けるという提案':t<75.5?'押し通すのをやめ、話を聞く':t<79.5?'家には吹かないという条件':t<83.5?'約束を受け入れて、謝る':'家を壊さず、食事へ招く';
 }
 if(id==='normal'&&s.travel?.includes('wolf')&&!s.escape&&((t>=64&&t<66)||(t>=86&&t<87.7)||(t>=107&&t<108.8)||(t>=134&&t<140.7))){
  const a=s.actors.find(a=>a.id==='wolf'),az=a.yaw+((t>=64&&t<66)||(t>=86&&t<87.7)?Math.PI/4:-Math.PI/4);
  s.camera=shot('J71_walk_travel',((t>=86&&t<87.7)||(t>=107&&t<108.8))?[a.x+2.8,1.8,a.z+5.8]:[a.x+Math.sin(az)*5.8,1.8,a.z+Math.cos(az)*5.8],[a.x,.8,a.z],48);
 }
 if(id==='normal'){applyConstructionMontage(s,t);if(t>=134&&t<140.7&&s.scene.caption)s.scene.caption='おおかみは、森へ歩いて帰りました。';}
 s.time=t;s.duration=duration;s.ended=t>=duration;
 const projection=captionProjection(id,t,s.scene.caption);s.scene.caption=projection.text;
 s.branch={id,caption:projection,causalHistory:causalLogAt(id,t),ending:t>=duration?structuredClone(RUNS[id].state.ending):null};
 s.world.causalHistory=s.branch.causalHistory;s.world.resolutionId='J57_'+id;
 if(id==='peace'&&t>=64)for(const a of s.actors)if(a.scriptId==='wolf'){a.motion=t<67?'walk':'idle';a.motionTime=t-64;}
 return s;
}
export function createStoryClock(){let time=0,playing=false;return{get time(){return time},get playing(){return playing},play(){if(time>=STORY_DURATION)time=0;playing=true;},pause(){playing=false;},reset(){time=0;playing=false;},seek(t){time=clamp(Number.isFinite(t)?t:0,0,STORY_DURATION);},tick(dt){if(playing)time=clamp(time+clamp(dt,0,.1),0,STORY_DURATION);if(time>=STORY_DURATION-1e-8){time=STORY_DURATION;playing=false;}return sampleStory(time);}};}
