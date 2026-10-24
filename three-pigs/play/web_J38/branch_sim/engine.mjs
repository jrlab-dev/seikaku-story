export const VERSION = 'J56-1';
export const DRAMA_TYPES = Object.freeze(['material_compared','idea_shift','task_deferred','repeated_check','help_offered','plan_conflict','role_agreed','pressure_recall']);
export const MATERIALS = Object.freeze({
  straw:{work:[3,3,3,2,3], resistance:0.8, shape:1, units:8},
  wood:{work:[4,5,4,3,3], resistance:1.05, shape:0.65, units:12},
  brick:{work:[5,7,4,3,4], resistance:1.35, shape:0.3, units:16}
});
export const TASKS = Object.freeze(['frame','walls','roof','binding','reinforcement']);
const SCALES = {small:0.8,regular:1,large:1.5};
const GOALS = {live_soon:{speed:0.3,shape:0,weather:0},creative_home:{speed:0,shape:0.8,weather:0},storm_shelter:{speed:0,shape:0,weather:1.5},leave_time_to_help:{speed:0.7,shape:0,weather:0}};
const copy = x => structuredClone(x);
const sum = x => x.reduce((a,b)=>a+b,0);
const round = x => Math.round(x*1e6)/1e6;
const own = (obj,key) => Object.hasOwn(obj,key);
function demand(ok,message){if(!ok) throw new Error(message);}
function unit(v,label){demand(Number.isFinite(v)&&v>=0&&v<=1,`${label}: expected 0..1`);}
export function validate(input){
  demand(input && Array.isArray(input.actors)&&input.actors.length>0&&input.actors.length<=6,'actors: expected 1..6');
  const ids = new Set();
  for(const a of input.actors){
    demand(typeof a.id==='string'&&/^[a-z][a-z0-9_-]{0,39}$/.test(a.id)&&!ids.has(a.id),'unique safe actor id required');ids.add(a.id);
    for(const k of ['O','C','E','A','N'])unit(a.traits?.[k],`${a.id}.${k}`);
    demand(own(SCALES,a.maxScale),'maxScale invalid');
    for(const m of Object.keys(MATERIALS))unit(a.familiarity?.[m],`familiarity.${m}`);
    demand(own(GOALS,a.goal),'known independent goal required');
  }
  const w=input.world;
  demand(w&&Number.isInteger(w.arrival)&&w.arrival>=1&&w.arrival<=180,'arrival: expected 1..180 work minutes');
  for(const m of Object.keys(MATERIALS))demand(Number.isInteger(w.stock?.[m])&&w.stock[m]>=0,'stock: nonnegative integer required');
  for(const k of ['weatherCue','callReach','kinship'])unit(w[k],k);
  for(const k of ['wind','escapeMinutes','routeMinutes','foodAvailable','foodNeed'])demand(Number.isFinite(w[k])&&w[k]>=0,`${k}: nonnegative required`);
  for(const k of ['routeOpen','safeRefugeAvailable','negotiationAllowed'])demand(typeof w[k]==='boolean',`${k}: boolean required`);
  demand(['food','shelter','scripted_pressure'].includes(w.wolfGoal),'wolfGoal invalid');
  for(const k of ['O','C','E','A','N'])unit(w.wolfTraits?.[k],`wolf.${k}`);
  return input;
}
export function comparePlans(actor,world,stock=world.stock){
  const {O,C,A}=actor.traits, rows=[],goal=GOALS[actor.goal];
  for(const [material,m] of Object.entries(MATERIALS))for(const [scale,factor] of Object.entries(SCALES)){
    const required=Object.fromEntries(TASKS.map((t,i)=>[t,Math.ceil(m.work[i]*factor)]));
    const work=sum(Object.values(required)),units=Math.ceil(m.units*factor);
    const feasible=factor<=SCALES[actor.maxScale]&&stock[material]>=units;
    const parts={
      shape:round((O*3.6+goal.shape)*m.shape),
      usableSoon:round(((1-C)*2.2+A*0.8+goal.speed)*(1-work/45)),
      weather:round((world.weatherCue*C*8+goal.weather)*(m.resistance/1.35)),
      familiarity:actor.familiarity[material],
      ambition:round(O*2.7*({small:0,regular:0.4,large:1}[scale])),
      deadline:round(-C*5*Math.max(0,work+2-world.arrival)/world.arrival)
    };
    rows.push({material,scale,required,work,units,feasible,parts,score:round(sum(Object.values(parts))),
      unavailableReason:feasible?null:factor>SCALES[actor.maxScale]?'敷地の規模を超える':'材料が足りない'});
  }
  const ranked=rows.filter(x=>x.feasible).sort((a,b)=>b.score-a.score||a.work-b.work||a.material.localeCompare(b.material));
  const selected=ranked[0]??null,alternative=ranked[1]??null;
  const labels={shape:'好きな形',usableSoon:'早く使える',weather:'風への備え',familiarity:'材料への慣れ',ambition:'広い設計',deadline:'残り時間'};
  const strongest=selected?Object.entries(selected.parts).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([k])=>labels[k]).join('と'):'';
  return {selected,alternative,candidates:rows,reason:selected?`${strongest}を優先して比較した`:'材料または敷地条件を満たす案がない',
    rejectedReason:alternative?`${alternative.material}/${alternative.scale}も可能だが総合優先度が低い`:null};
}
export function initialState(input){
  validate(input);
  return {version:VERSION,at:0,stock:copy(input.world.stock),world:copy(input.world),actors:Object.fromEntries(input.actors.map(a=>[a.id,{...copy(a),spent:0,ledger:[],knowledge:[],worry:a.traits.N,checks:0,ideaSeen:false,helpConsidered:false,mode:'own',location:a.id,cooperation:null}])),projects:{},drama:[],ending:null};
}
export function taskDone(p,t){return (p.progress[t]??0)>=(p.required[t]??Infinity);}
export function completedTasks(p){return Object.keys(p.required).filter(t=>taskDone(p,t));}
export function exteriorComplete(p){return ['frame','walls','roof'].every(t=>taskDone(p,t));}
export function windReady(p){return TASKS.every(t=>taskDone(p,t));}
export function remaining(p){return sum(Object.keys(p.required).map(t=>Math.max(0,p.required[t]-(p.progress[t]??0))));}
function nextTask(p){return [...TASKS.slice(0,1),...(p.required.feature?['feature']:[]),...TASKS.slice(1)].find(t=>!taskDone(p,t));}
export function quality(p){return {binding:Math.min(1,p.progress.binding/p.required.binding),reinforcement:Math.min(1,p.progress.reinforcement/p.required.reinforcement)};}
export function physicalTest(p,wind){
  demand(Number.isFinite(wind)&&wind>=0,'wind invalid');
  const shell=['frame','walls','roof'].map(t=>Math.min(1,p.progress[t]/p.required[t]));
  const q=quality(p),closed=exteriorComplete(p);
  const resistance=round(MATERIALS[p.material].resistance*Math.min(...shell)+(q.binding*0.35)+(q.reinforcement*0.45));
  return {resistance,wind,closed,windReady:windReady(p),holds:closed&&resistance>=wind,quality:q,
    missing:TASKS.filter(t=>!taskDone(p,t))};
}
export function reduce(state,event){
  const s=copy(state);demand(Number.isFinite(event.at)&&event.at>=s.at,'event time must not go backwards');s.at=event.at;
  if(event.kind==='drama'){
    demand(DRAMA_TYPES.includes(event.type),'unknown drama type');s.drama.push(copy(event));return s;
  }
  if(event.type==='planned'){
    const a=s.actors[event.actorId],p=event.plan;
    demand(a&&!s.projects[a.id],'duplicate or unknown project');
    if(!p)return s;
    demand(s.stock[p.material]>=p.units,'stock exhausted');s.stock[p.material]-=p.units;
    s.projects[a.id]={ownerId:a.id,material:p.material,scale:p.scale,required:copy(p.required),progress:Object.fromEntries(Object.keys(p.required).map(k=>[k,0])),decision:copy(event.decision)};
  } else if(event.type==='action'){
    const a=s.actors[event.actorId];demand(a,'unknown actor');
    demand(event.at===a.spent+1,'one minute per actor per tick required');
    a.spent++;a.ledger.push({at:event.at,action:event.action,target:event.target??a.id,task:event.task??null});
    if(event.action==='work'){
      const p=s.projects[event.target];demand(p&&own(p.required,event.task)&&!taskDone(p,event.task),'invalid work target');
      const prerequisites={frame:[],feature:['frame'],walls:['frame'],roof:['walls'],binding:['roof'],reinforcement:['walls']}[event.task];
      demand(prerequisites.every(k=>taskDone(p,k)),'work prerequisites missing');
      if(event.target!==a.id)demand(a.cooperation?.phase==='agreed'&&a.cooperation.target===event.target&&a.cooperation.task===event.task,'help requires exact role agreement');
      p.progress[event.task]=Math.min(p.required[event.task],p.progress[event.task]+1);
    }
    if(event.action==='check'){
      a.checks++;const fact=event.fact; if(!a.knowledge.includes(fact))a.knowledge.push(fact);
      a.worry=Math.max(0,round(a.worry-0.08));
    }
    if(event.action==='idea'){
      a.ideaSeen=true;
      if(event.adopt){const p=s.projects[a.id];p.required.feature=event.featureWork;p.progress.feature=0;}
    }
    if(event.patch){
      demand(Object.keys(event.patch).every(k=>['mode','cooperation','helpConsidered','location'].includes(k)),'forbidden actor patch');
      Object.assign(a,copy(event.patch));
    }
  } else if(event.type==='ending')s.ending=copy(event.value);
  else throw new Error(`unknown event ${event.type}`);
  return s;
}
export function replay(input,events,at=Infinity){
  demand((Number.isFinite(at)&&at>=0)||at===Infinity,'replay time invalid');
  return events.filter(e=>e.at<=at).reduce(reduce,initialState(input));
}
function decideWolf(state){
  const w=state.world;
  const feasible=w.negotiationAllowed&&((w.wolfGoal==='food'&&w.foodAvailable>=w.foodNeed)||(w.wolfGoal==='shelter'&&Object.values(state.projects).some(exteriorComplete)));
  const talkScore=round(w.wolfTraits.A*2+(w.wolfGoal==='food'?0.3:0.1));
  const pressureScore=1.1;
  return {goal:w.wolfGoal,feasible,talkScore,pressureScore,choice:feasible&&talkScore>=pressureScore?'agreement':'pressure',
    reason:!feasible?'目的を満たす交渉条件がない':talkScore>=pressureScore?'要求を満たせる提案を話して受け入れる':'要求を通す行動を優先する'};
}
export function resolveEnding(state){
  const wolf=decideWolf(state),w=state.world;
  if(wolf.choice==='agreement')return {kind:'early_peace',wolf,physical:{},routes:[],safe:true,injuryDepicted:false,reason:'交渉条件と行動判断がそろい、風を試す前に合意'};
  const physical=Object.fromEntries(Object.entries(state.projects).map(([id,p])=>[id,physicalTest(p,w.wind)]));
  const shelters=Object.entries(physical).filter(([,p])=>p.holds).map(([id])=>id);
  const routes=[];
  for(const a of Object.values(state.actors)){
    if(physical[a.location]?.holds){routes.push({actorId:a.id,origin:a.location,destination:a.location,arrived:true,callDelay:0});continue;}
    const destination=shelters.find(id=>state.actors[id].traits.A+w.kinship>=0.8)??(w.safeRefugeAvailable?'village_refuge':null);
    const callDelay=a.traits.E>=w.callReach?0:2;
    routes.push({actorId:a.id,origin:a.location,destination,callDelay,arrived:!!destination&&w.routeOpen&&w.routeMinutes+callDelay<=w.escapeMinutes});
  }
  const safe=routes.every(r=>r.arrived),allHold=Object.keys(physical).length===Object.keys(state.actors).length&&Object.values(physical).every(p=>p.holds);
  return {kind:!safe?'safety_unresolved':allHold?'homes_hold':shelters.length?'evacuated_to_shared_home':'village_refuge',wolf,physical,routes,safe,injuryDepicted:false,
    reason:!safe?'安全な退避に必要な経路または時間が不足':allHold?'実施工が今回の風に耐えた':'耐えた家または村の退避先へ移動'};
}
export function simulate(input){
  let state=initialState(input);const events=[];
  const emit=e=>{events.push(copy(e));state=reduce(state,e);};
  const drama=(at,type,actorId,data={})=>emit({kind:'drama',type,at,actorId,causalId:`${actorId}:${data.cause??type}`,...data});
  for(const a of input.actors){
    const decision=comparePlans(a,input.world,state.stock);
    emit({kind:'state',type:'planned',at:0,actorId:a.id,plan:decision.selected,decision});
    drama(0,'material_compared',a.id,{decision,cause:'material'});
  }
  for(let t=1;t<=input.world.arrival;t++){
    const before=copy(state);
    for(const id of input.actors.map(a=>a.id)){
      const a=before.actors[id],p=state.projects[id];
      const act=(action,data={})=>emit({kind:'state',type:'action',at:t,actorId:id,action,...data});
      if(t===1){act('plan');continue;}
      if(!p){act('wait_material');continue;}
      if(a.cooperation && a.cooperation.phase!=='complete'){
        const co=a.cooperation,target=state.projects[co.target];
        if(co.phase==='travel'){
          const left=co.remaining-1;act('travel',{patch:{location:left?`route:${id}:${co.target}`:co.target,cooperation:{...co,remaining:left,phase:left?'travel':'negotiate'}}});continue;
        }
        if(co.phase==='negotiate'){
          drama(t,'plan_conflict',co.target,{helperId:id,progressAllowed:false,cause:'cooperation',reason:'作業場所と次の手順を確認する'});
          act('consult',{patch:{cooperation:{...co,phase:'assign'}}});continue;
        }
        if(co.phase==='assign'){
          if(remaining(target)<=2||input.world.arrival-t<3){
            drama(t,'plan_conflict',co.target,{helperId:id,cause:'cooperation',response:'declined',reason:'残作業が少ないか到着直前のため、共同作業を始めない'});
            act('declined_help',{patch:{cooperation:{...co,phase:'return',remaining:2}}});continue;
          }
          const task=taskDone(target,'walls')&&!taskDone(target,'reinforcement')?'reinforcement':nextTask(target);
          if(!task){act('return',{patch:{cooperation:{...co,phase:'return',remaining:2}}});continue;}
          drama(t,'role_agreed',co.target,{helperId:id,task,cause:'cooperation',response:'conditional',condition:'担当工程だけを進める。他の工程は所有者が続ける'});
          act('agree',{patch:{cooperation:{...co,phase:'agreed',task}}});continue;
        }
        if(co.phase==='return'){
          const left=co.remaining-1;act('travel_return',{patch:{location:left?`route:${co.target}:${id}`:id,cooperation:{...co,remaining:left,phase:left?'return':'complete'}}});continue;
        }
        if(co.phase==='agreed'){
          if(taskDone(target,co.task)||co.worked>=co.limit){act('return',{patch:{cooperation:{...co,phase:'return',remaining:2}}});continue;}
          act('work',{target:co.target,task:co.task,patch:{cooperation:{...co,worked:co.worked+1}}});continue;
        }
      }
      const negotiating=Object.values(before.actors).some(h=>h.cooperation?.target===id&&['negotiate','assign'].includes(h.cooperation.phase));
      if(negotiating){act('consult');continue;}
      if(taskDone(p,'frame')&&!a.ideaSeen&&a.traits.O>=0.75){
        const cost=a.traits.C<0.5?6:3;
        const adopt=a.traits.C<0.5||remaining(p)+cost<input.world.arrival-t;
        drama(t,'idea_shift',id,{cause:'design',from:nextTask(p),to:'roof_feature',adopt,reason:adopt?'新しい形を工程に加える':'残り時間を見て保留'});
        act('idea',{adopt,featureWork:cost});continue;
      }
      const checkLimit=a.traits.C>=0.7&&a.traits.N>=0.7?3:a.traits.C>=0.7?1:0;
      if(taskDone(p,'walls')&&!taskDone(p,'roof')&&a.checks<checkLimit){
        const fact=`${id}:binding_unfinished`;
        drama(t,'repeated_check',id,{cause:'checking',fact,alreadyKnown:a.knowledge.includes(fact),qualityChange:false,next: a.checks+1===checkLimit?'工程へ戻る':'確認する'});
        act('check',{fact});continue;
      }
      const receiving=Object.values(state.actors).some(h=>h.cooperation?.target===id&&!['return','complete'].includes(h.cooperation.phase));
      if(input.world.cooperationAllowed!==false&&taskDone(p,'binding')&&!a.helpConsidered&&!receiving){
        const candidates=Object.values(before.actors).filter(b=>b.id!==id&&before.projects[b.id]&&remaining(before.projects[b.id])>3)
          .filter(b=>!state.actors[b.id].cooperation||state.actors[b.id].cooperation.phase==='complete')
          .filter(b=>!Object.values(state.actors).some(h=>h.cooperation?.target===b.id&&h.cooperation.phase!=='complete'))
          .sort((x,y)=>(remaining(before.projects[y.id])+(y.checks>1?10:0))-(remaining(before.projects[x.id])+(x.checks>1?10:0)));
        const target=candidates[0],w=input.world;
        const audible=target&&(target.traits.E>=w.callReach||a.traits.E>=w.callReach||t>=w.arrival-10);
        if(target&&audible&&a.traits.A>=0.65&&(!windReady(p)&&a.traits.C>=0.8)){
        }else if(target&&audible&&a.traits.A>=0.65&&w.arrival-t>=8){
          const limit=a.traits.C>=0.8?2:4;
          drama(t,'help_offered',target.id,{helperId:id,cause:'cooperation',ownPending:TASKS.filter(k=>!taskDone(p,k)),scope:'移動して具体的な一工程を分担',limit});
          if(!windReady(p))drama(t,'task_deferred',id,{cause:'help_cost',task:'reinforcement',reason:'相手の停滞を先に助ける',returnExpected:true});
          act('offer',{patch:{helpConsidered:true,cooperation:{target:target.id,phase:'travel',remaining:2,worked:0,limit}}});continue;
        }else if(target&&audible){
          act(a.traits.A>=0.65?'advice':'decline',{patch:{helpConsidered:true}});continue;
        }
      }
      if(exteriorComplete(p)&&a.traits.O>=0.75&&a.traits.C<0.35&&!windReady(p)&&input.world.weatherCue<0.85){
        if(a.mode!=='rest')drama(t,'task_deferred',id,{cause:'unfinished_binding',task:nextTask(p),reason:'外形ができたので遊びを優先',returnExpected:false});
        act('rest',{patch:{mode:'rest'}});continue;
      }
      const task=nextTask(p);act(task?'work':'idle',task?{target:id,task}:{});
    }
  }
  const ending=resolveEnding(state);
  for(const [id,p] of Object.entries(state.projects)){
    if(remaining(p)>0)drama(input.world.arrival,'task_deferred',id,{cause:'deadline',tasks:Object.keys(p.required).filter(k=>!taskDone(p,k)),reason:'到着時点で残る実作業',returnExpected:ending.kind==='early_peace'});
    const causalIds=[...new Set(state.drama.filter(e=>e.actorId===id&&e.type!=='pressure_recall').map(e=>e.causalId))];
    drama(input.world.arrival,'pressure_recall',id,{cause:'payoff',recalls:causalIds,phase:ending.kind==='early_peace'?'negotiation':'wind_and_escape',physical:ending.physical[id]??null,next:ending.kind});
  }
  emit({kind:'state',type:'ending',at:input.world.arrival,value:ending});
  return {version:VERSION,input:copy(input),events,state};
}
export function summarize(run){
  const s=run.state;
  return {caseId:run.input.id,workMinutes:s.world.arrival,ending:s.ending.kind,safe:s.ending.safe,
    homes:Object.values(s.projects).map(p=>({ownerId:p.ownerId,material:p.material,scale:p.scale,completed:completedTasks(p),exteriorComplete:exteriorComplete(p),windReady:windReady(p),remaining:remaining(p),quality:quality(p),reason:p.decision.reason})),
    actors:Object.values(s.actors).map(a=>({id:a.id,spent:a.spent,checks:a.checks,actions:a.ledger.reduce((v,e)=>(v[e.action]=(v[e.action]??0)+1,v),{}),cooperation:a.cooperation})),
    dramaCount:s.drama.length};
}
