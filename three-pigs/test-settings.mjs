import {evaluateEnding} from './play/web_J38/story_rules.mjs';
export const ROLES=['pig_straw','pig_wood','pig_brick','wolf'];
const base=['31333','33333','35333','35313'];
const preset=(id,label,changes={})=>({id,label,cast:Object.fromEntries(ROLES.map((r,i)=>[r,changes[r]??base[i]]))});
export const PRESETS=[
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
export function flow(cast){const id=evaluateEnding(cast).id;return{id,label:PRESETS.find(p=>p.id===id)?.label??id};}
export function changesFor(cast){
 const current=flow(cast),changes={};
 for(const role of ROLES){changes[role]=[];
  for(let i=0;i<5;i++){
   const alternatives=[];
   for(const value of ['1','3','5']){
    if(value===cast[role][i])continue;
    const digits=[...cast[role]];digits[i]=value;
    const next=flow({...cast,[role]:digits.join('')});
    if(next.id!==current.id)alternatives.push({value,...next});
   }
   changes[role].push(alternatives);
  }
 }
 return{current,changes};
}
