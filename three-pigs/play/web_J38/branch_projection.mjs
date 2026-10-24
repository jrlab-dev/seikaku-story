import {simulate} from './branch_sim/engine.mjs';
import {normal} from './branch_sim/cases.mjs';
const peace=structuredClone(normal);peace.id='peace_same_build';peace.world.wolfTraits.A=.95;
const solo=structuredClone(normal);solo.label='通常：各自で建築→風と避難';solo.world.cooperationAllowed=false;solo.world.wind=1.95;
export const RUNS={normal:simulate(solo),peace:simulate(peace)};
for(const [id,r]of Object.entries(RUNS)){
 const p=Object.values(r.state.projects);
 if(p.map(x=>x.material).join(',')!=='straw,wood,brick')throw Error('No asset binding for changed material order');
 if(id==='normal'&&(r.state.ending.kind!=='evacuated_to_shared_home'||Object.values(r.state.ending.physical).map(x=>x.holds).join(',')!=='false,false,true'))throw Error('Normal physical outcome no longer matches authored scene');
 if(id==='peace'&&r.state.ending.kind!=='early_peace')throw Error('Peace is not supported by the simulation');
}
function source(id,type,actorId,match=()=>true){const r=RUNS[id],index=r.events.findIndex(e=>e.kind==='drama'&&e.type===type&&e.actorId===actorId&&match(e));if(index<0)throw Error(`Missing source event ${type}/${actorId}`);return {sourceIndex:index,sourceEvent:r.events[index]};}
const shared=[
 [10,'material_compared','pig1'],[18.7,'idea_shift','pig1'],[21.7,'task_deferred','pig1',e=>e.cause==='unfinished_binding'],
 [25,'material_compared','pig2'],[33.8,'task_deferred','pig2',e=>e.cause==='help_cost'],
 [40,'material_compared','pig3'],[44.5,'repeated_check','pig3'],[47.6,'help_offered','pig3'],[47.6,'plan_conflict','pig3'],[53.6,'role_agreed','pig3']
];
export const PEACE_LINES=[
 {at:64,end:67.5,id:'request',speaker:'狼',text:'腹ぺこだ！ 食べ物はないか！',reason:'食料を求めて来訪。強い声に相手は警戒する。'},
 {at:67.5,end:71.5,id:'offer',speaker:'長男',text:'そんなに怒らないで。パンなら分けられるよ。',reason:'相手の目的を満たせる具体的な提案。'},
 {at:71.5,end:75.5,id:'listen',speaker:'狼',text:'……分けてくれるのか。じゃあ、話そう。',reason:'要求を満たす提案と協調的な応答がそろい、攻撃を選ばない。'},
 {at:75.5,end:79.5,id:'boundary',speaker:'長男',text:'うん。家には吹かないって約束して。',reason:'食料の提案と、家を守る条件を両立させる。'},
 {at:79.5,end:83.5,id:'promise',speaker:'狼',text:'約束する。強く言って、ごめん。',reason:'条件を受け入れ、強い要求から対話に切り替える。'},
 {at:83.5,end:88,id:'invite',speaker:'長男',text:'じゃあ、いっしょに食べよう。',reason:'交渉が成立。食事への招待で締め、家は壊さない。'}
];
export const PROJECTIONS=Object.fromEntries(['normal','peace'].map(id=>[id,[
 ...shared.filter(row=>id==='peace'||![33.8,47.6,53.6].includes(row[0])).map(([at,type,actorId,match])=>({at,type,actorId,...source(id,type,actorId,match)})),
 ...(id==='normal'?[[71.5,'pig1'],[90.3,'pig2'],[113.7,'pig3']].map(([at,actorId])=>({at,type:'pressure_recall',actorId,...source(id,'pressure_recall',actorId)})):
 PEACE_LINES.map(l=>({at:l.at,type:'negotiation_beat',actorId:l.speaker==='狼'?'wolf':'pig1',beatId:l.id,text:`${l.speaker}「${l.text}」`,reason:l.reason,sourceIndex:RUNS.peace.events.length-1,sourceEvent:RUNS.peace.events.at(-1)})))
]]));
export function causalLogAt(id,t){return structuredClone(PROJECTIONS[id].filter(e=>e.at<=t));}
export function captionProjection(id,t,fallback){
 let caption=fallback,types=[],actorId=null;
 if(t>=10&&t<14){actorId='pig1';types=['material_compared'];caption='長男「わらなら、好きな形ですぐ作れる。」';}
 else if(t>=25&&t<29){actorId='pig2';types=['material_compared'];caption='次男「慣れた木組みで、風にも備えよう。」';}
 else if(t>=40&&t<44){actorId='pig3';types=['material_compared'];caption='三男「小さなれんがの家で、風に備えよう。」';}
 else if(t>=18.7&&t<21.7){actorId='pig1';types=['idea_shift'];}
 else if(t>=33.8&&t<36.8){actorId='pig2';types=['task_deferred'];}
 else if(t>=44.5&&t<47.6){actorId='pig3';types=['repeated_check'];}
 else if(t>=47.6&&t<53.6){actorId='pig3';types=['help_offered','plan_conflict'];}
 else if(t>=53.6&&t<56.1){actorId='pig3';types=['role_agreed'];caption='三男「壁の補強をお願い。」';}
 if(id==='normal'&&((t>=14&&t<24.5)||(t>=29&&t<39.5)||(t>=44&&t<64))){caption=fallback;types=[];actorId=null;}
 if(id==='normal'&&t>=67&&t<69)caption='狼「腹ぺこだ。中へ入れてくれ！」';
 if(id==='peace'&&t>=7.5&&t<9.8)caption='狼「腹ぺこだ。村で聞いてみよう。」';
 if(id==='peace'&&t>=64){const line=PEACE_LINES.find(l=>t>=l.at&&t<l.end);caption=line?`${line.speaker}「${line.text}」`:'おしまい — 話して、分け合って';types=['negotiation_beat'];actorId=line?.speaker==='狼'?'wolf':'pig1';}
 const history=causalLogAt(id,t),source=history.filter(e=>types.includes(e.type)&&(!actorId||e.actorId===actorId));
 return {text:caption,kind:types.length?'causal_dialogue':'story_dialogue',sourceEventIndices:[...new Set(source.map(e=>e.sourceIndex))],causalIds:[...new Set(source.map(e=>e.sourceEvent.causalId).filter(Boolean))],beat:id==='peace'&&t>=64?PEACE_LINES.find(l=>t>=l.at&&t<l.end)?.id??'end':null};
}
export function branchEvidence(id){const r=RUNS[id];return{caseId:id,input:r.input,ending:r.state.ending,projections:PROJECTIONS[id],scope:'Two authored branches only; work minutes mapped by semantic events, not elapsed video seconds.'};}
