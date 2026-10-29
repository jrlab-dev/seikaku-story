export const STRATEGY_CAST={pig_straw:'54144',pig_wood:'44342',pig_brick:'54234',wolf:'55321'};
export const normalizeCode=code=>String(code).replace(/[12]/g,'1').replace(/[45]/g,'5');
export const normalizeCast=cast=>Object.fromEntries(Object.entries(cast).map(([k,v])=>[k,normalizeCode(v)]));
export function contest(wolf,pig){
 const attack=+wolf[0]+ +wolf[1],defence=+pig[0]+ +pig[1],prepared=+pig[1]>=3;
 return{attack,defence,prepared,winner:defence>attack||(defence===attack&&prepared)?'pig':'wolf'};
}
export function evaluateStrategy(cast){
 if(+cast.wolf[3]>=4&&+cast.pig_straw[3]>=4)return{id:'peace',title:'話し合って和解',completion:35,reasons:['狼が話を求め、長男が応じる']};
 const sites=['straw','wood','brick'],labels=['長男','次男','三男'],duels=[];
 for(let i=0;i<3;i++){
  const d={site:sites[i],...contest(cast.wolf,cast['pig_'+sites[i]])};duels.push(d);
  if(d.winner==='pig')return{id:'strategy_hold_'+d.site,title:labels[i]+'の対策で守り切る',completion:100,duels,cast:{...cast},reasons:[d.attack===d.defence?'同点：事前に確認した対策が攻略を防ぐ':'防御の工夫と実行力が攻略を上回る']};
 }
 return{id:'strategy_win',title:'三つの対策を攻略し、狼が勝つ',completion:0,duels,cast:{...cast},reasons:['狼が各家の対策を観察し、工夫と実行力で突破する']};
}
