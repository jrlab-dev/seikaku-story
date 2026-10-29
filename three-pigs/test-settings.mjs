import {evaluateEnding} from './play/web_J38/story_rules.mjs';
import {STRATEGY_CAST} from './play/web_J38/strategy_rules.mjs';
export const ROLES=['pig_straw','pig_wood','pig_brick','wolf'];
const base=['31333','33333','35333','35313'];
const preset=(id,label,changes={})=>({id,label,cast:Object.fromEntries(ROLES.map((r,i)=>[r,changes[r]??base[i]]))});
export const PRESETS=[
 {id:'strategy_win',mode:'strategy',label:'新作：三つの対策を攻略し、狼が勝つ',cast:{...STRATEGY_CAST}},
 {id:'strategy_hold_straw',mode:'strategy',label:'新作：長男の備えが狼を防ぐ',cast:{...STRATEGY_CAST,pig_straw:'55144'}},
 {id:'strategy_hold_wood',mode:'strategy',label:'新作：次男の備えが狼を防ぐ',cast:{...STRATEGY_CAST,pig_wood:'55342'}},
 {id:'strategy_hold_brick',mode:'strategy',label:'新作：三男の備えが狼を防ぐ',cast:{...STRATEGY_CAST,pig_brick:'55234'}},
 preset('peace','長男と狼が和解する',{pig_straw:'31353',wolf:'35353'}),
 preset('straw_holds','長男の家が耐えて終わる',{pig_straw:'35333'}),
 preset('karakuri_straw','長男の仕掛けが狼を追い返す',{pig_straw:'55333'}),
 preset('wolf_leaves','長男の家を壊した後、狼が怖くなって帰る',{wolf:'31315'}),
 preset('wood_holds','次男の家へ逃げ込み、そこで守り切る',{pig_wood:'35333'}),
 preset('karakuri_wood','次男の仕掛けが狼を追い返す',{pig_wood:'55333'}),
 preset('all_fall','三軒とも壊され、三匹が逃げる',{pig_brick:'33333'}),
 preset('bomb','三男の家を爆弾で壊され、三匹が逃げる',{wolf:'55313'}),
 preset('bomb_backfire','爆弾がはね返って狼が逃げる',{pig_brick:'35335',wolf:'55313'}),
 preset('karakuri_brick','三男の仕掛けが狼を追い返す',{pig_brick:'55333'}),
 preset('brick_two_blows','三男の家で、狼が二回吹いてあきらめる',{wolf:'33313'}),
 preset('no_chimney','三男の家で、煙突を思いつかず帰る',{wolf:'15313'}),
 preset('calm_leave','煙突から入るが、落ち着いて去る',{wolf:'35311'}),
 preset('original','煙突から入り、火に驚いて逃げる（原作型）')
];
export function flow(cast,mode='classic'){const ending=evaluateEnding(cast,{mode}),id=ending.id;return{id,label:PRESETS.find(p=>p.id===id)?.label??ending.title};}
export function changesFor(cast,mode='classic'){
 const current=flow(cast,mode),changes={};
 for(const role of ROLES){changes[role]=[];
  for(let i=0;i<5;i++){
   const alternatives=[];
   for(const value of ['1','2','3','4','5']){
    if(value===cast[role][i])continue;
    const digits=[...cast[role]];digits[i]=value;
    const next=flow({...cast,[role]:digits.join('')},mode);
    if(next.id!==current.id)alternatives.push({value,...next});
   }
   changes[role].push(alternatives);
  }
 }
 return{current,changes};
}
