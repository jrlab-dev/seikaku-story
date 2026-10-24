const clone=x=>structuredClone(x);
export const actor=(id,traits,maxScale='small',familiarity={straw:0.45,wood:0.9,brick:0.4})=>({id,traits,maxScale,familiarity,goal:'live_soon'});
export const world={arrival:29,stock:{straw:100,wood:100,brick:100},weatherCue:0.75,callReach:0.5,kinship:0.7,
  wind:1.75,escapeMinutes:8,routeMinutes:4,routeOpen:true,safeRefugeAvailable:false,
  negotiationAllowed:true,foodAvailable:3,foodNeed:2,wolfGoal:'food',wolfTraits:{O:0.85,C:0.5,E:0.8,A:0.15,N:0.8}};
export const normal={id:'normal',label:'通常：外形完成→支援→風と避難',world:clone(world),actors:[
  actor('pig1',{O:0.9,C:0.2,E:0.85,A:0.5,N:0.2},'regular'),
  actor('pig2',{O:0.45,C:0.55,E:0.6,A:0.9,N:0.5}),
  actor('pig3',{O:0.4,C:0.9,E:0.2,A:0.5,N:0.85})
]};
const peace=clone(normal);peace.id='agreeable_wolf';peace.label='協調的な狼：条件が整い早期和解';peace.world.arrival=8;peace.world.wolfTraits.A=0.95;
const unfinished=clone(normal);unfinished.id='imaginative_unfinished';unfinished.label='想像力高・計画性低：規模と追加案で未完成';unfinished.actors=[actor('builder',{O:0.95,C:0.15,E:0.7,A:0.4,N:0.3},'large')];unfinished.world.arrival=16;unfinished.world.safeRefugeAvailable=true;
const ambitious=clone(unfinished);ambitious.id='planned_large';ambitious.label='想像力・計画性ともに高：大きな計画を完成';ambitious.actors[0].traits.C=0.95;ambitious.world.arrival=48;ambitious.world.wind=1.4;
const help=clone(normal);help.id='help_cost';help.label='助け合い：受け手の進捗と自宅の補強の代償';help.world.arrival=25;
export const CASES=[normal,peace,unfinished,ambitious,help];
