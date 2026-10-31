import {raidPlan} from './strategy_house_raid.mjs';
export const CENTERS={straw:[2.1,0,-2.25],wood:[-20,-.14,-15],brick:[20,1.06,-14]};
const SITES=['straw','wood','brick'],LABEL=['長男','次男','三男'];
const clamp=x=>Math.max(0,Math.min(1,x)),lerp=(a,b,u)=>a+(b-a)*u;
const OWNER=[1.4,3.9],GUEST=j=>[-.9+j*1.15,3.9];
function pathPoint(points,progress){
 const lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));
 const total=lengths.reduce((a,b)=>a+b,0),distance=total*clamp(progress);
 let left=distance,index=0;
 while(index<lengths.length-1&&left>lengths[index])left-=lengths[index++];
 const a=points[index],b=points[index+1]??a,u=lengths[index]?left/lengths[index]:0;
 return{x:lerp(a[0],b[0],u),z:lerp(a[1],b[1],u),distance,yaw:Math.atan2(b[0]-a[0],b[1]-a[1])};
}
function follow(a,points,progress,motion='walk'){
 const p=pathPoint(points,progress);Object.assign(a,p,{motion:progress>0&&progress<1?motion:'idle'});
 a.walkDistance=p.distance;
 if(a.motion!=='idle')delete a.reactionPose;
 return a;
}
function transferRoute(site,next,j){
 const c=CENTERS[site],n=CENTERS[next],start=site==='straw'?OWNER:j===0?GUEST(0):OWNER;
 const local=points=>points.map(([x,z])=>[c[0]+x,c[2]+z]);
 const exit=site==='straw'?local([start,[1.65,4.15],[3.8,4.15],[3.8,6.5],[-4,6.5]]):local([start,[0,3.9],[0,6.5]]);
 const roadX=site==='straw'?c[0]-4:c[0];
 return[...exit,[roadX,-7],[n[0],-7],[n[0],n[2]+5.9],[n[0],n[2]+4.25],[n[0]+GUEST(j)[0],n[2]+GUEST(j)[1]]];
}
function caption(s,text){s.scene={...s.scene,caption:text};s.branch={...s.branch,caption:{...s.branch.caption,text}};}
export function strategyPreparation(s,t,cast){
 const i=t>=84?2:t>=62.5?1:0,start=[41,62.5,84][i];
 if(t<start||t>110)return;
 const checked=+cast['pig_'+SITES[i]][1]>=3;
 const lines=[
  ['壁も戸も丈夫に作ろう。家の中で安心して暮らすんだ。','家の戸の支えと裏口。どちらも確かめよう。'],
  ['蒸気は左右から。相手の動きを見て切り替えよう。','火と予備の配管、非常口も確かめよう。'],
  ['丈夫な家と二重の戸の支え。兄弟も中へ迎えよう。','家の補強と裏口。逃げ道も確かめよう。']
 ];
 caption(s,LABEL[i]+'「'+(t-start<8?lines[i][0]:checked?lines[i][1]:'仕掛けはできた。動きの確認は、あとでいいや。')+'」');
}
function clean(s,q){
 for(const a of s.actors){
  for(const k of ['worldY','reactionPose','reactionBuild','stance','ownerDoor','encounterReaction','encounterClose','shelterRunner','runAway','bombPose','bonkPose','singleHotJump','tailFlame','puzzleEntry'])delete a[k];
  Object.assign(a,{visible:false,motion:'idle',motionTime:q,yOffset:0,yaw:0,walkDistance:0});
 }
 for(const h of Object.values(s.houses))Object.assign(h,{intact:true,constructionStage:5,time:0,door:'closed',doorOpen:0,deform:0,blowAway:false,security:null});
 for(const k of ['gustOverride','battle','intro','drama','escape','fireScene','tailFlame','chimneyImpact','resultCard','completion','comic','shelter','egress','encounter','personalityWindow','fullImage','puzzleEffect'])s[k]=null;
 s.effects=[];s.cutOpacity=0;s.animationTime=131+q;s.effectTime=131+q;
}
export function strategyPlan(ending){
 return raidPlan(ending);
}
