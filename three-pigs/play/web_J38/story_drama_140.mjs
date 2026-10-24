import {sampleStory as sample116,configureStoryBindings,storyBindings,DOORS,routeBetween,routePose} from './story_timeline_116base.mjs';
import {NORMAL_WORLD} from './story_world_state.mjs';
import {causalHistoryAt} from './drama_events.mjs';
export {configureStoryBindings,storyBindings,DOORS,routeBetween,routePose};
export const STORY_DURATION=140;
export const INSERTS=[
 {id:'choose_a',at:10,duration:4,kind:'choice',projectId:'home-a',line:'わらなら、好きな形ですぐ作れる。'},
 {id:'decoration',at:14.7,duration:3,kind:'decoration',projectId:'home-a'},
 {id:'choose_b',at:18,duration:4,kind:'choice',projectId:'home-b',line:'木なら、手伝う時間も残せそう。'},
 {id:'brace_or_help',at:22.8,duration:3,kind:'dilemma',projectId:'home-b'},
 {id:'choose_c',at:26,duration:4,kind:'choice',projectId:'home-c',line:'形は小さく、風に備えてれんが。'},
 {id:'work_conflict',at:29.6,duration:6,kind:'conflict',projectId:'home-c'}
];
let added=0;for(const i of INSERTS){i.start=i.at+added;i.end=i.start+i.duration;added+=i.duration;}
export function toBaseTime(t){let offset=0;for(const i of INSERTS){if(t<i.start)return{time:t-offset,insert:null};if(t<i.end)return{time:i.at,insert:i,elapsed:t-i.start};offset+=i.duration;}return{time:t-offset,insert:null};}
export function fromBaseTime(t,before=false){return t+INSERTS.filter(i=>before?i.at<t:i.at<=t).reduce((n,i)=>n+i.duration,0);}
export const SCENES=[
 {id:'intro',at:0,title:'4人の紹介'},{id:'choose_build_a',at:10,title:'材料選びと藁の家'},{id:'choose_build_b',at:25,title:'木の家、残した補強'},{id:'choose_build_c',at:40,title:'レンガの家、衝突から分担へ'},
 {id:'straw_visit',at:64,title:'狼の来訪と藁の家'},{id:'wood_visit',at:77,title:'木の家へ避難'},{id:'reunion',at:92,title:'三びきの合流'},{id:'brick_holds',at:99,title:'完成した接合と強い家'},
 {id:'chimney',at:110,title:'煙突からすとん'},{id:'retreat',at:124,title:'狼は森へ'},{id:'safe',at:131,title:'みんな無事'}
];
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
const shot=(id,position,target,fov=46)=>({id,position,target,fov,terrainRelative:true});
const labels={pig1:'長男',pig2:'次男',pig3:'三男',wolf:'狼'};
const workPoints={'plot-center':[-.7,3.4],'plot-west':[-20.7,-9.4],'plot-east':[18,-8.4]};
export function sampleStory(seconds){
 const t=clamp(Number.isFinite(seconds)?seconds:0,0,140),mapped=toBaseTime(t),base=sample116(mapped.time);
 const s=structuredClone(base),scene=SCENES.findLast(v=>t>=v.at);
 s.time=t;s.sourceTime=mapped.time;s.duration=140;s.ended=t>=140;s.scene={...s.scene,id:scene.id,at:scene.at,title:scene.title};
 s.effects=s.effects.map(e=>({...e,start:fromBaseTime(e.start),end:fromBaseTime(e.end)}));
 s.camera.interval=s.camera.interval?.map(n=>fromBaseTime(n));
 s.world.sourceTime=s.world.time;s.world.time=t;s.world.resolutionId='normal-140-drama-v1';s.world.causalHistory=causalHistoryAt(t);
 s.drama={insert:mapped.insert?.id??null,kind:mapped.insert?.kind??null,elapsed:mapped.elapsed??0,note:'',recall:null};
 const i=mapped.insert,q=mapped.elapsed??0;
 if(i){
  const project=NORMAL_WORLD.projects[i.projectId],owner=s.actors.find(a=>a.scriptId===project.ownerId),p=workPoints[project.plotId];
  s.drama.projectId=project.projectId;s.drama.material=project.material;s.cutOpacity=0;
  if(i.kind==='choice'){
   for(const a of s.actors)a.visible=a===owner;
   const selected={straw:0,wood:1,brick:2}[project.material],choiceX=p[0]-1.75+selected*1.65;
   owner.x=p[0]+(choiceX-p[0])*.28*smooth((q-1.8)/1.7);owner.z=p[1]-.75;owner.yaw=q<1?-.7:q<2?.7:Math.atan2(choiceX-owner.x,1.3);
   s.camera=shot(i.id,[p[0],1.55,p[1]+5.8],[p[0],.65,p[1]+.25],48);
   s.scene.caption=labels[project.ownerId]+'「'+i.line+'」';s.drama.note='材料を見比べる';s.drama.selection=clamp((q-1.7)/.6);
   for(const h of Object.values(s.houses))if(h.projectId===i.projectId)h.constructionStage=0;
   s.world.projects[i.projectId].stage=0;s.world.projects[i.projectId].completed=false;
  }else if(i.kind==='decoration'){
   owner.yaw=Math.atan2(1.2-owner.x,.3-owner.z);
   s.camera=q<1?shot('binding_left_unfinished',[1.6,1.05,3.7],[.2,.65,.1],36):shot('roof_catches_attention',[6,2.6,9.5],[1,2.5,-.1],48);
   s.scene.caption='長男「屋根、いい形！ 結び目はあと。」';
   s.drama.note='結束から、屋根の形へ';s.drama.ornamentSelected=q>=1;
  }else if(i.kind==='dilemma'){
   owner.x=p[0];owner.z=p[1];owner.yaw=q<1.3?-.9:.8;
   s.camera=q<1.3?shot('brace_or_brother',[-17.1,1.6,-4.7],[-21.4,.7,-9.3],44):shot('brother_needs_help',[20.6,1.4,-3.4],[18,.8,-8.4],43);
   if(q>=1.3)s.actors.find(a=>a.scriptId===s.world.cooperation.recipientId).yaw=Math.sin(q*4)*.6;
   s.scene.caption='次男「あと一本……でも、弟が困ってる。」';
   s.drama.note='残る補強と、弟のあいだで';
  }else if(i.kind==='conflict'){
   const help=s.world.cooperation,a=s.actors.find(a=>a.scriptId===help.helperId),b=s.actors.find(a=>a.scriptId===help.recipientId);
   a.visible=b.visible=true;a.x=20-.45*smooth(q/1.5)+.25*smooth((q-2)/1.5);a.z=-8.4;b.x=18;b.z=-8.4;a.yaw=-.75;b.yaw=.75;
   s.camera=shot('work_order_conflict',[21.3,1.6,-2.4],[19,.85,-8.5],43);
   s.scene.caption=q<3?'三男「待って、そこはまだ！」':'次男「じゃあ、どこを手伝おう？」';
   s.drama.note=q<3?'手伝いのつもりが、手順の衝突に':'順番を確かめ、役割を分ける';
   s.world.cooperation.phase=q<3?'work_order_conflict':'agreeing_roles';
   s.drama.checkMark=q<3?'stop':'share';
  }
 }else{
  if(t>=71.5&&t<72.3){s.drama.recall='unfinished_binding';s.drama.note='あの結び残し';s.camera=shot('unfinished_binding_recall',[1.6,1.05,3.7],[.2,.65,.1],36);}
  if(t>=86.3&&t<87.1){s.drama.recall='unused_brace';s.drama.note='置いたままの補強材';s.camera=shot('unused_brace_recall',[-23.9,1.2,-6.6],[-23.1,.35,-9.6],40);}
  if(t>=103.7&&t<104.7){s.drama.recall='finished_joint';s.drama.note='ふたりで仕上げた接合';s.camera=shot('completed_joint_recall',[24,1.9,-6.4],[21.6,1.65,-11.7],43);}
 }
 if(mapped.time>=23&&mapped.time<25.9&&!i)s.scene.caption='';
 if(mapped.time>=29.6&&mapped.time<32.1&&!i){s.scene.caption='三男「こっちを支えて。」';s.world.cooperation.phase='agreed';s.world.cooperation.task='support_wall';}
 for(const project of Object.values(s.world.projects)){
  const choice=INSERTS.find(v=>v.kind==='choice'&&v.projectId===project.projectId),decided=t>=choice.start+2.3;
  const normal=NORMAL_WORLD.projects[project.projectId],stage=project.stage;
  project.material=decided?normal.material:null;project.reason=decided?normal.reason:null;
  project.design=decided?{scale:'compact',complexity:normal.workPlan==='rapid-thatch'?'playful_roof':'simple',scope:normal.workPlan}:null;
  const tasks=['foundation','structure','walls','roof','shell_finish'].slice(0,stage);
  if(project.completed&&normal.plan.bindingComplete)tasks.push('joint_finish');
  if(project.completed&&normal.plan.reinforcementComplete)tasks.push('reinforcement','final_check');
  const deferred=[];if(normal.workPlan==='rapid-thatch'&&t>=21.7)deferred.push('binding_finish');if(normal.workPlan==='timber-with-help'&&t>=36.8)deferred.push('last_brace');
  project.quality={jointQuality:tasks.includes('joint_finish')?'finished':stage?'provisional':'not_started',reinforced:tasks.includes('reinforcement')};
  project.completion={shellComplete:stage===5,completedTasks:tasks,deferredTasks:deferred,windPreparationComplete:tasks.includes('joint_finish')&&tasks.includes('reinforcement')};
  const involved=[s.world.cooperation.helperProjectId,s.world.cooperation.recipientProjectId].includes(project.projectId);
  project.cooperation=involved?{partnerId:project.projectId===s.world.cooperation.helperProjectId?s.world.cooperation.recipientId:s.world.cooperation.helperId,status:s.world.cooperation.phase,task:t>=53.6?'support_wall':null}:null;
  project.timeBudget={screenSeconds:t,constructionTimeModel:'ordered task events; not real-world duration',ownWorkDeferred:deferred.length>0,checkingScreenSeconds:project.projectId===s.world.cooperation.recipientProjectId?clamp(t-44,0,3.6):0,discussionScreenSeconds:involved?clamp(t-47.6,0,6):0};
  project.knowledge={confirmedSameMark:project.projectId===s.world.cooperation.recipientProjectId&&t>=45,physicalImprovementFromRepeatedCheck:false};
 }
 if(t===140)s.scene.caption='おしまい — みんな無事';
 return s;
}
export function createStoryClock(){let time=0,playing=false;return{get time(){return time},get playing(){return playing},play(){if(time>=140)time=0;playing=true;},pause(){playing=false;},reset(){time=0;playing=false;},seek(t){time=clamp(Number.isFinite(t)?t:0,0,140);},tick(dt){if(playing)time=clamp(time+clamp(dt,0,.1),0,140);if(time>=140)playing=false;return sampleStory(time);}};}

