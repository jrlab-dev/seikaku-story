import {wolfLeavesScene,wolfLeavesResume,BRANCH as WL_BRANCH,LENGTH as WL_LENGTH} from './endings/wolf_leaves.mjs';
import {CALM_LEAVE} from './endings/calm_leave.mjs';
import {PEACE_PLAN} from './endings/peace.mjs';
import {WOOD_HOLDS} from './endings/wood_holds.mjs';
import {PLAN as STRAW_HOLDS} from './endings/straw_holds.mjs';
import {allFallScene,allFallResume,BRANCH as AF_BRANCH,LENGTH as AF_LENGTH} from './endings/all_fall.mjs';
import {bombScene,bombResume,bombBackfireScene,BACKFIRE_LENGTH,BRANCH as BOMB_BRANCH,LENGTH as BOMB_LENGTH} from './endings/bomb.mjs';
import {karakuriPlan} from './endings/karakuri_security.mjs';
import {chimneyLidScene,LENGTH as CHIMNEY_LID_LENGTH} from './endings/chimney_lid.mjs';
export const BASE_DURATION=240.45;
export const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
export const BRICK=[20,1.06,-14],WOLF_AT_BRICK=[19.35,-8.2];

export function wolfGivesUp(lines,opt={}){
 return(s,q,L)=>{
  const wolf=s.actors.find(a=>a.id==='wolf');for(const a of s.actors)a.visible=a===wolf;
  s.effects=[];s.gustOverride=null;s.battle=null;s.intro=null;s.drama=null;s.escape=null;s.fireScene=null;s.tailFlame=null;s.chimneyImpact=null;s.resultCard=null;
  const away=[WOLF_AT_BRICK[0]-BRICK[0],WOLF_AT_BRICK[1]-BRICK[2]],len=Math.hypot(...away),dir=[away[0]/len,away[1]/len];
  Object.assign(wolf,{visible:true,x:WOLF_AT_BRICK[0],z:WOLF_AT_BRICK[1],yaw:Math.PI,yOffset:0,motion:'idle',motionTime:q});
  delete wolf.reactionPose;
  let cap,camera={id:'J116_wolf_gives_up',position:[15.5,2.36,-9.6],target:[19.35,1.91,-8.2],fov:44,terrainRelative:false};
  if(q<3){if(opt.tired===false){wolf.reactionPose=4;s.comic=null;}else{wolf.motion='tired';s.comic={text:'はあ… はあ…',kind:'tired',side:'left',phase:q};}cap=lines[0];}
  else if(q<6.5){wolf.reactionPose=opt.tired===false?5:4;cap=lines[1];s.comic=null;}
  else{const w=q-6.5,d=1.15*w;wolf.motion='walk';wolf.walkDistance=d;wolf.motionTime=w;wolf.yaw=Math.atan2(dir[0],dir[1]);wolf.x=WOLF_AT_BRICK[0]+dir[0]*d;wolf.z=WOLF_AT_BRICK[1]+dir[1]*d;cap=lines[2];s.comic=null;
   camera={id:'J116_wolf_walks_home',position:[15.5+dir[0]*d*.55,2.6,-9.6+dir[1]*d*.55],target:[wolf.x,1.2,wolf.z],fov:46,terrainRelative:false};}
  s.camera=camera;s.cutOpacity=q>L-.4?.85*smooth((q-(L-.4))/.4):0;
  return cap;
 };
}

export const ENDING_PLANS={
 calm_leave:CALM_LEAVE,
 karakuri_straw:karakuriPlan('straw'),karakuri_wood:karakuriPlan('wood'),karakuri_brick:karakuriPlan('brick'),
 bomb_backfire:{branch:BOMB_BRANCH,length:BACKFIRE_LENGTH,resume:228.7,scene:bombBackfireScene,finale:'爆弾がはね返ったルート。みんな無事！'},
 bomb:{branch:BOMB_BRANCH,length:BOMB_LENGTH,resume:BASE_DURATION,scene:bombScene,resumeScene:bombResume},
 all_fall:{branch:AF_BRANCH,length:AF_LENGTH,resume:BASE_DURATION,scene:allFallScene,resumeScene:allFallResume},
 wolf_leaves:{branch:WL_BRANCH,length:WL_LENGTH,resume:228.7,scene:wolfLeavesScene,resumeScene:wolfLeavesResume,finale:'おおかみが自分で帰ったルート。みんな無事！'},
 peace:PEACE_PLAN,
 wood_holds:WOOD_HOLDS,
 straw_holds:STRAW_HOLDS,
 chimney_lid:{branch:205,length:CHIMNEY_LID_LENGTH,resume:228.7,scene:chimneyLidScene,finale:'煙突にふたをしたルート。みんな無事！'},
 brick_two_blows:{branch:189.5,length:11,resume:228.7,
  scene:wolfGivesUp(['狼「はあ、はあ……。二回吹いても、びくともしない。」','狼「こんな丈夫な家は、むりだ。あきらめよう。」','おおかみは、とぼとぼ帰っていきました。']),
  finale:'二回であきらめたルート。みんな無事！'},
 no_chimney:{branch:197.5,length:11,resume:228.7,
  scene:wolfGivesUp(['狼「どうしよう……。いい手が、思いつかない。」','狼「しかたない。今日は帰ろう。」','おおかみは、あきらめて帰っていきました。'],{tired:false}),
  finale:'煙突までは来なかったルート。みんな無事！'},
};

export function planFor(ending){return ENDING_PLANS[ending?.id]??null;}
export function planDuration(plan){return plan?plan.branch+plan.length+(BASE_DURATION-plan.resume):BASE_DURATION;}
export function mapTime(plan,t){
 if(!plan||t<plan.branch)return{phase:'base',baseTime:t};
 const q=t-plan.branch;if(q<plan.length)return{phase:'variant',baseTime:plan.branch-.05,q};
 return{phase:'resume',baseTime:Math.min(BASE_DURATION,plan.resume+(q-plan.length))};
}
