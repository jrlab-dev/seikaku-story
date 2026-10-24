import {buildShotTiming,constructionShot} from './construction_camera.mjs';
export const BUILDS=[
 {id:'straw',actor:'pig_straw',start:14,end:24.5,cuts:[14,15.7,17.5,19.7,22],hz:3.2,baseY:0,front:.22,x:2.1,label:'長男',manner:'さっさと作って、遊びたい！'},
 {id:'wood',actor:'pig_wood',start:29,end:39.5,cuts:[29,31,33.1,35.3,37.4],hz:2.1,baseY:-.14,front:-12.5,x:-20,label:'次男',manner:'順番に、木を組んでいこう。'},
 {id:'brick',actor:'pig_brick',start:44,end:59.5,cuts:[44,47,50.1,53.3,56.5],hz:1.35,baseY:1.06,front:-11.5,x:20,label:'三男',manner:'位置を確かめて、一つずつ。'}
];
const stages=['土台','柱','壁','屋根','仕上げ'];
function syncProject(p,stage){
 p.stage=stage;p.completed=stage===5;p.bindingComplete=stage===5&&p.material!=='straw';p.reinforcementComplete=stage===5&&p.material!=='straw';
 p.quality={jointQuality:p.bindingComplete?'finished':'provisional',reinforced:p.reinforcementComplete};
 p.completion={shellComplete:stage===5,completedTasks:['foundation','structure','walls','roof','shell_finish'].slice(0,stage),deferredTasks:stage===5&&p.material==='straw'?['binding_finish']:[],windPreparationComplete:p.reinforcementComplete};
 p.design.scope=p.workPlan;
}

export function applyConstructionMontage(s,t){
 s.world.cooperation=null;
 for(const p of Object.values(s.world.projects)){
  p.cooperation=null;p.waitingForHelp=false;p.checking=false;
  p.timeBudget={screenSeconds:t,constructionTimeModel:'single-owner hammer cuts',ownWorkDeferred:p.material==='straw',discussionScreenSeconds:0};
  if(p.material==='wood'){p.workPlan='timber-own-work';p.tradeoff='標準的な木組みを順に仕上げる';p.reinforcementComplete=t>=39.5;p.deferredTasks=[];}
  if(p.material==='brick')p.tradeoff='位置を確認しながら丁寧に積む';
 }
 if(t>=64){for(const p of Object.values(s.world.projects))syncProject(p,5);if(s.drama?.note?.includes('ふたりで'))s.drama.note='丁寧に仕上げた接合';return s;}
 const b=BUILDS.find(b=>t>=b.start&&t<b.end);
 for(const v of BUILDS){
  let stage=t>=v.end?5:0;
  if(t>=v.start&&t<v.end){const i=v.cuts.findLastIndex(at=>t>=at),revealAt=buildShotTiming(v,i).revealAt;stage=i+(t+1e-7>=v.cuts[i]+revealAt?1:0);}
  s.houses[v.id].constructionStage=stage;
  const p=Object.values(s.world.projects).find(p=>p.material===v.id);if(p)syncProject(p,stage);
 }
 if(b){
  const i=b.cuts.findLastIndex(at=>t>=at),local=t-b.cuts[i],firstHit=b.id==='brick'?.65:.28,elapsed=Math.max(0,local-firstHit),phase=(elapsed*b.hz)%1;
  const timing=buildShotTiming(b,i),lastHit=local>=timing.hit&&local<timing.revealAt;
  const shot=constructionShot(b,i,local);
  const workPhase=true?(local/timing.duration*timing.visits)%1:0;
  const striking=true?(workPhase>=.35&&workPhase<.72):lastHit||(local+1e-7>=firstHit&&phase<.23),impact=true?striking:lastHit||(local+1e-7>=firstHit&&phase<.19);
  const [x,y,z]=shot.worker,elev=i===3?2.4:0;
  const actor=s.actors.find(a=>a.id===b.actor);
  for(const a of s.actors)a.visible=a===actor;
  Object.assign(actor,{x,z,worldY:y,yOffset:elev,yaw:Math.PI/4,visible:true,motion:'build_hammer',motionTime:striking?1:0,anchor:'own_'+b.id+'_construction'});
  if(true)actor.buildMirror=shot.mirror;
  s.build={house:b.id,actor:b.actor,stage:i+1,stageName:stages[i],cut:i,local,shot:'continuous_orbit',orbitHeading:shot.heading,orbitSide:shot.side,revealAt:shot.revealAt,striking,impact,worldRoot:[x,y,z],target:shot.target,workYaw:shot.az,contactNode:shot.contactNode,contactSector:shot.sector,revealedSectors:shot.revealedSectors,platform:elev>0,platformHeight:y-b.baseY};
  s.camera=shot.camera;
  if(true)Object.assign(s.build,{visit:shot.visit,visits:shot.visits,mirror:shot.mirror,workPhase,prototype:'J75_straw_only'});
  s.effects=[];s.cutOpacity=0;s.intro=null;s.drama={kind:'construction',note:b.manner,recall:null};
  s.scene={...s.scene,title:b.label+'が'+stages[i]+'を作る',caption:b.label+'「'+b.manner+'」'};
 }else if(t>=59.5){
  for(const [i,v]of BUILDS.entries()){const a=s.actors.find(a=>a.id===v.actor);Object.assign(a,{visible:true,x:v.x-.6,z:v.front+1.5,yOffset:0,yaw:0,motion:'idle',anchor:'own_'+v.id+'_complete'});}
  s.actors.find(a=>a.id==='wolf').visible=false;s.scene.caption='それぞれの家が、できあがりました。';s.drama={kind:'complete',note:'三つの家、それぞれの作り方',recall:null};
 }
 return s;
}
