import {sampleStory as sample140,SCENES as OLD_SCENES,configureStoryBindings,storyBindings,DOORS,routeBetween,routePose} from './story_drama_140.mjs';
export {configureStoryBindings,storyBindings,DOORS,routeBetween,routePose};
export const STORY_DURATION=150;
export const ESCAPES=[
 {house:'straw',start:72.3,end:81,baseEnd:77,extra:4,expose:1,surprise:1.8,depart:2.6,arrive:8.4,actors:['pig1'],inside:[[1.45,-1.6]],destination:'wood'},
 {house:'wood',start:90.3,end:102,baseEnd:92,extra:6,expose:1,surprise:1.8,depart:2.6,arrive:11.3,actors:['pig1','pig2'],inside:[[-20.7,-14.7],[-19.3,-14.7]],destination:'brick'}
];
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
export function to140(t){if(t<72.3)return t;if(t<81)return 72.3+(t-72.3)*4.7/8.7;if(t<90.3)return t-4;if(t<102)return 86.3+(t-90.3)*5.7/11.7;return t-10;}
export function from140(t){if(t<72.3)return t;if(t<77)return 72.3+(t-72.3)*8.7/4.7;if(t<86.3)return t+4;if(t<92)return 90.3+(t-86.3)*11.7/5.7;return t+10;}
export const SCENES=OLD_SCENES.map(s=>({...s,at:from140(s.at)}));
const shot=(id,position,target,fov=50)=>({id,position,target,fov,terrainRelative:true});
function pathFor(e,i){
 const route=routeBetween(e.house,e.destination);
 if(e.house==='straw')return [e.inside[i],[.7,1.7],[-2,3.95],...route.filter(([x])=>x<=-2.1)];
 const laneRoute=route.map(([x,z])=>[x,z+(i===0?-.48:.48)]);
 laneRoute[0]=[-20.65+(i===0?-.48:.48),-11.0];
 laneRoute[laneRoute.length-1]=i===0?[18.45,-9.7]:[20.3,-9.7];
 return [e.inside[i],...laneRoute];
}
export function runAlong(path,elapsed,duration){
 const p=routePose(path,clamp(elapsed/duration));
 return {...p,yOffset:0,motionDistance:p.distance};
}
export function sampleStory(seconds){
 const t=clamp(Number.isFinite(seconds)?seconds:0,0,150),old=to140(t),s=structuredClone(sample140(old));
 s.time=t;s.duration=150;s.ended=t>=150;s.scene.at=from140(s.scene.at);s.camera.interval=s.camera.interval?.map(from140);
 s.effects=s.effects.map(v=>({...v,start:from140(v.start),end:from140(v.end)}));
 s.world.time=t;s.escape=null;
 for(const e of ESCAPES){
  if(t<e.start)continue;
  s.houses[e.house].intact=false;s.houses[e.house].time=clamp((t-e.start)*2,0,8);s.houses[e.house].blowAway=true;
  if(t>=e.end)continue;
  const q=t-e.start;s.cutOpacity=0;s.drama.recall=null;s.escape={house:e.house,elapsed:q,phase:q<e.expose?'house_leaves':q<e.surprise?'exposed_unharmed':q<e.depart?'surprised_jump':q<e.arrive?'two_pose_run':'arrived',safeActors:e.actors};
  for(const [i,id]of e.actors.entries()){
   const a=s.actors.find(a=>a.scriptId===id),delay=i*.12,runStart=e.depart+delay,runEnd=e.arrive+delay;
   const arrivalCut=q>=e.arrive-1.1;
   const p=arrivalCut?{...routePose(pathFor(e,i),1),yaw:0,yOffset:0}:q<runStart?{x:e.inside[i][0],z:e.inside[i][1],yOffset:0,yaw:0}:runAlong(pathFor(e,i),q-runStart,runEnd-runStart);
   if(q>=e.surprise+delay&&q<e.surprise+delay+.68)p.yOffset=Math.sin(Math.PI*(q-e.surprise-delay)/.68)*.48;
   const firstExit=pathFor(e,i)[1],pastDepartureLeg=(p.motionDistance||0)>Math.hypot(firstExit[0]-e.inside[i][0],firstExit[1]-e.inside[i][1]);
   p.yOffset+=pastDepartureLeg?0:(e.house==='straw'?.30*(1-smooth((p.z-.4)/1.15)):.30*(1-smooth((p.z+12.4)/1.4)));
   Object.assign(a,p,{visible:true,alive:true,motion:!arrivalCut&&q>=runStart&&q<runEnd?'run_two_pose':'idle',motionTime:p.motionDistance||0,anchor:q<runStart?e.house+'_inside':q<runEnd?e.house+'_continuous_escape':e.destination+'_arrival'});
  }
  const leader=s.actors.find(a=>a.scriptId===e.actors[0]),peer=e.actors.length>1?s.actors.find(a=>a.scriptId===e.actors[1]):leader;
  const center=[(leader.x+peer.x)/2,(leader.z+peer.z)/2],home=e.house==='straw'?[1.45,-1.6]:[-20,-14.7];
  if(q<e.depart){
   const push=smooth((q-.7)/1.5),dist=11-3.4*push;
   s.camera=shot(e.house+'_blow_reveal',[home[0]+dist*(e.house==='straw'?-.4:.4),2.6,home[1]+dist],[home[0],1.35,home[1]],52);
  }else{
   const follow=smooth((q-e.depart)/.6),az=Math.atan2(Math.sin(leader.yaw)+Math.sin(peer.yaw),Math.cos(leader.yaw)+Math.cos(peer.yaw))-Math.PI/4,dist=e.actors.length===1?5.3:6.5;
   s.camera=shot(e.house+'_continuous_escape',[center[0]+Math.sin(az)*dist,1.75,center[1]+Math.cos(az)*dist],[center[0],.85,center[1]],48);
  }
  if(q>=e.arrive-1.1){s.camera=shot(e.house+'_arrival_cut',[center[0]+3.5,2,center[1]+7],[center[0],.9,center[1]],48);s.escape.phase='arrival_cut';}
  s.scene.title=e.house==='straw'?'家が倒れた！ びっくりして木の家へ':'ふたりとも無事！ れんがの家へ';
  s.scene.caption=q<e.expose?'家が後ろへ吹き飛んで――':q<e.depart?(e.house==='straw'?'長男「わっ！ 家が吹き飛んだ！」':'ふたり「わっ！ 逃げよう！」'):(e.house==='straw'?'長男は、木の家へ急ぎます。':'ふたりは、いっしょにれんがの家へ。');
  s.drama.note=q<e.depart?'家が倒れても、こぶたは無傷':'一度びっくりしてから、走って避難';
 }
 if(t>=150)s.scene.caption='おしまい — みんな無事';
 return s;
}
export function createStoryClock(){let time=0,playing=false;return{get time(){return time},get playing(){return playing},play(){if(time>=150)time=0;playing=true;},pause(){playing=false;},reset(){time=0;playing=false;},seek(t){time=clamp(Number.isFinite(t)?t:0,0,150);},tick(dt){if(playing)time=clamp(time+clamp(dt,0,.1),0,150);if(time>=150)playing=false;return sampleStory(time);}};}
