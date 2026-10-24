export const GUSTS=[
 {house:'straw',inhale:14,exhale:15.1,emission:15.35,impact:16.3,end:18.5,wind:[0,0,-1],wallZ:-.1},
 {house:'wood',inhale:28,exhale:29.1,emission:29.35,impact:30.3,end:32.5,wind:[-.5575561834996304,0,-.8301392065438943],wallZ:-12.85},
 {house:'brick',inhale:43,exhale:44.1,emission:44.35,impact:45.3,end:49.2,wind:[0,0,-1],wallZ:-11.85}
];
export function gustAt(t){
 const g=GUSTS.find(g=>t>=g.inhale&&t<g.end);if(!g)return null;
 return {...g,phase:t<g.exhale?'inhale':t<g.emission?'release':t<g.impact?'travel':'impact',front:Math.max(0,Math.min(1,(t-g.emission)/(g.impact-g.emission))),age:t-g.impact};
}
