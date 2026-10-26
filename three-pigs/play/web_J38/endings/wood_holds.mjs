import {smooth} from '../endings.mjs';

const WOOD=[-20,-.14,-15],DOOR={x:-20.65,z:-12.8,floor:.16};
const SHIFT={x:-40,y:-1.2,z:-1};
const WOLF_AT_WOOD=[-20.667657758522502,-9.5];
const BRANCH=160,LENGTH=21;
function deformAt(q,start){
 if(q<.7)return start+(.155-start)*smooth(q/.7);
 const u=q-.7;return .11+.045*Math.exp(-2.2*u)*Math.cos(u*7.5);
}
function stepY(z){const h=DOOR.z;return DOOR.floor-.3+.3*smooth((h+1.3-z)/1.1)+.18*smooth((h+.65-z)/.3)*(1-smooth((h-.25-z)/.35));}
function hideAll(s){for(const a of s.actors)a.visible=false;}
function pig(s,id,props){const a=s.actors.find(a=>a.id===id);delete a.reactionPose;delete a.worldY;Object.assign(a,{visible:true,yOffset:0,motion:'idle',motionTime:0},props);return a;}

function scene(s,q,L){
 const wolf=s.actors.find(a=>a.id==='wolf');
 const g0=s.gustOverride,e0=s.effectTime,d0=s.houses.wood.deform??.085;
 s.effects=[];s.intro=null;s.drama=null;s.escape=null;s.fireScene=null;s.tailFlame=null;s.chimneyImpact=null;s.resultCard=null;s.comic=null;s.gustOverride=null;s.battle=null;s.shelter=null;s.egress=null;
 const deform=deformAt(q,d0);
 Object.assign(s.houses.wood,{intact:true,time:0,blowAway:false,constructionStage:5,deform,door:'closed',doorOpen:0});
 hideAll(s);
 Object.assign(wolf,{visible:true,x:WOLF_AT_WOOD[0],z:WOLF_AT_WOOD[1],yaw:Math.atan2(-.5575561835,-.8301392065),yOffset:0,motion:'idle',motionTime:q});delete wolf.reactionPose;delete wolf.worldY;
 const wide={id:'J79_wood_breath_count',position:[-30,3.66,-6],target:[-20,1.96,-14],fov:48,terrainRelative:false};
 let cap;s.cutOpacity=0;
 if(q<2.4){
  const now=e0+q;
  if(g0&&now<g0.end){s.gustOverride={...g0,phase:now<g0.exhale?'inhale':now<g0.emission?'release':now<g0.impact?'travel':'impact',front:Math.max(0,Math.min(1,(now-g0.emission)/(g0.impact-g0.emission))),age:now-g0.impact};s.battle={house:'wood',round:2,phase:s.gustOverride.phase,deform};}
  s.effectTime=now;wolf.motion=g0&&now<g0.end?'blow':'idle';wolf.motionTime=10.95+q;
  s.camera=wide;
  cap=q<1.1?'ぐぐっ……！':'木の家は、ゆがんだけれど、たおれません！';
  if(q>=.25&&q<1.9)s.comic={text:'ギシギシッ！',kind:'build',side:'right',phase:(q-.25)/1.65};
 } else if(q<5.6){
  const u=q-2.4;
  pig(s,'pig_wood',{x:-20.3,z:-13.55,yaw:Math.PI,worldY:DOOR.floor,reactionPose:u<1.5?2:3});
  pig(s,'pig_straw',{x:-21.15,z:-13.75,yaw:Math.PI,worldY:DOOR.floor,reactionPose:u<1.4?7:3});
  wolf.visible=false;
  s.camera={id:'J116_wood_holds_inside',position:[-20.65,1.55,-16.55],target:[-20.65,.95,-13.2],fov:50,terrainRelative:false};
  cap='次男「大丈夫。補強はしてある！」';
 } else if(q<8.6){
  wolf.motion='tired';wolf.motionTime=q-5.6;
  s.camera=tiredCamera();
  cap='狼「はあ、はあ……。ここもだめか。」';
  s.comic={text:'はあ… はあ…',kind:'tired',side:'left',phase:q-5.6};
 } else if(q<11.6){
  wolf.reactionPose=4;
  s.camera=tiredCamera();
  cap='狼「こんなにじょうぶな木の家は、むりだ。あきらめよう。」';
 } else if(q<15.4){
  const w=q-11.6,d=1.15*w,away=[WOLF_AT_WOOD[0]-WOOD[0],WOLF_AT_WOOD[1]-WOOD[2]],len=Math.hypot(...away),dir=[away[0]/len,away[1]/len];
  Object.assign(wolf,{motion:'walk',walkDistance:d,motionTime:w,yaw:Math.atan2(dir[0],dir[1]),x:WOLF_AT_WOOD[0]+dir[0]*d,z:WOLF_AT_WOOD[1]+dir[1]*d});
  s.camera={id:'J116_wood_wolf_walks_home',position:[-22.3,1.6,-12.2],target:[-20.7+dir[0]*3,.75,-9.5+dir[1]*3],fov:46,terrainRelative:true};
  cap='おおかみは、とぼとぼ帰っていきました。';
 } else {
  const u=q-15.4,run=Math.min(1,u/2.2),open=smooth((u-2.4)/.7);
  wolf.visible=false;
  const from=[-12.9,-10.6],to=[-18.7,-11.25];
  const brick=pig(s,'pig_brick',{x:from[0]+(to[0]-from[0])*smooth(run),z:from[1]+(to[1]-from[1])*smooth(run),yaw:run<1?Math.atan2(to[0]-from[0],to[1]-from[1]):Math.PI,motion:run<1?'paper_run':'idle',motionTime:u});
  if(run>=1&&u>=3.3)brick.reactionPose=3;
  Object.assign(s.houses.wood,{door:open>.01?'open':'closed',doorOpen:open});
  if(u>=2.6){
   if(u<4.8)pig(s,'pig_straw',{x:-21.45,z:-13.45,yaw:0,worldY:DOOR.floor,reactionPose:u>=3.3?4:5});
   else{// 結びの場面で長男が戸口から出てくる位置へ、歩いてつなぐ
    const w=Math.min(1,(u-4.8)/.8),z=-13.45+.75*w;
    pig(s,'pig_straw',{x:-21.45+.8*w,z,yaw:0,worldY:stepY(z),motion:'walk',motionTime:u-4.8});}
   pig(s,'pig_wood',{x:-20.7,z:-13.45,yaw:0,worldY:DOOR.floor,reactionPose:u>=3.3?3:5});
  }
  const framing=smooth(u/2.6),blend=(a,b)=>a+(b-a)*framing;
  s.camera={id:'J116_wood_trio_at_door',position:[blend(-12,DOOR.x+4.3),blend(4.1,DOOR.floor+2.25),blend(-.5,DOOR.z+7)],target:[blend(-17.4,DOOR.x),DOOR.floor+.95,blend(-11.5,DOOR.z+1)],fov:blend(52,42),terrainRelative:false};
  cap=u<2.6?'三男「おーい！ ふたりとも、だいじょうぶ？」':u<3.3?'戸が開いて……':'次男「三男！ 木の家が、ぼくたちを守ってくれたよ！」';
 }
 return cap;
}
function tiredCamera(){return{id:'J116_wood_wolf_tired',position:[WOLF_AT_WOOD[0]-3.98,1.16,WOLF_AT_WOOD[1]+.99],target:[WOLF_AT_WOOD[0],.71,WOLF_AT_WOOD[1]],fov:44,terrainRelative:false};}

function resumeScene(s){
 for(const a of s.actors){if(!a.visible||!a.id.startsWith('pig_'))continue;a.x+=SHIFT.x;a.z+=SHIFT.z;if(a.worldY!=null)a.worldY+=SHIFT.y;}
 if(s.egress){const b3=s.actors.find(a=>a.id==='pig_brick');if(b3?.visible){const original={x:b3.x,z:b3.z},u=Math.max(0,Math.min(1,(b3.z-SHIFT.z+13.3)/4.5)),merge=smooth(((s.storyTime??0)-219.25)/.9);b3.x=-18.7+(original.x+18.7)*merge;b3.z=(-11.25+1.45*u)*(1-merge)+original.z*merge;delete b3.worldY;}}
 if(s.egress){const pw=s.actors.find(a=>a.id==='pig_wood');if(pw?.visible&&pw.z<-13.45){pw.z=-13.45;pw.x=-20.7;pw.worldY=DOOR.floor;pw.motion='idle';}}
 const c=s.camera;if(c){const dy=c.terrainRelative?0:SHIFT.y;s.camera={...c,id:c.id+'_at_wood',position:[c.position[0]+SHIFT.x,c.position[1]+dy,c.position[2]+SHIFT.z],target:[c.target[0]+SHIFT.x,c.target[1]+dy,c.target[2]+SHIFT.z]};}
 const b=s.houses.brick;
 s.houses.wood={...s.houses.wood,intact:true,time:0,blowAway:false,constructionStage:5,deform:.11,door:b.door,doorOpen:b.doorOpen??0};
 s.houses.brick={...b,door:'closed',doorOpen:0};
 if(s.egress)s.egress={...s.egress,house:'wood'};
 return s;
}

export const WOOD_HOLDS={branch:BRANCH,length:LENGTH,resume:228.7,scene,resumeScene,finale:'木の家で守り切ったルート。みんな無事！'};
