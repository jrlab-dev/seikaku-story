import {smooth,WOLF_AT_BRICK,BRICK} from '../endings.mjs';

const ROPE_CAMERA={id:'J116_lid_rope',position:[121.6,31.35,-77.6],target:[119.5,31.0,-81.6],fov:42,terrainRelative:false};
const INTERIOR_CAMERA={id:'J116_lid_interior',position:[122.6,32.4,-74.8],target:[119.7,31.1,-81.5],fov:44,terrainRelative:false};
const ROOF_CAMERA={id:'J116_lid_roof',position:[24.6,7.7,-9.9],target:[20.75,6.35,-14.75],fov:40,terrainRelative:false};
const ROOF_WOLF={x:20.05,z:-14.55,yOffset:5.29};// 屋根の棟（高さ約6.35。この位置の地面は1.06）の上、えんとつの左

export const LENGTH=23;
export function chimneyLidScene(s,q,L){
 const by=id=>s.actors.find(a=>a.id===id),wolf=by('wolf'),straw=by('pig_straw'),wood=by('pig_wood'),brick=by('pig_brick');
 s.effects=[];s.gustOverride=null;s.battle=null;s.intro=null;s.drama=null;s.escape=null;s.tailFlame=null;s.chimneyImpact=null;s.resultCard=null;s.comic=null;s.fireScene=null;
 for(const a of s.actors){a.visible=false;delete a.reactionPose;delete a.buildMirror;a.yOffset=0;a.motion='idle';a.motionTime=q;}
 let cap,lid={open:1,pull:0,rope:true};
 if(q<9.6){
  const put=(a,x,z,yaw)=>Object.assign(a,{visible:true,x,z,yaw,worldY:30,anchor:'brick_inside'});
  put(straw,122.2,-79.5,-2.19);put(wood,122.3,-82.1,-1.63);put(brick,120.2,-80.4,-2.34);
  s.fireScene={elapsed:q>=3.2&&q<6.6?2:.5,phase:'notice'};s.camera=INTERIOR_CAMERA;
  if(q<3.2){brick.reactionPose=6;brick.buildMirror=true;straw.reactionPose=7;wood.reactionPose=7;cap='三男「えんとつから音が……おおかみだ！」';}
  else if(q<6.6){brick.reactionPose=0;straw.reactionPose=5;wood.reactionPose=5;cap='三男「そうだ、えんとつにふたをしよう！」';}
  else{
   s.camera=ROPE_CAMERA;brick.x=120.14;brick.z=-81.45;brick.reactionPose=2;brick.buildMirror=true;
   straw.x=120.85;straw.z=-81.95;straw.yaw=-2.3;straw.reactionPose=6;straw.buildMirror=true;wood.x=117.6;wood.z=-81.0;wood.yaw=-2.3;wood.reactionPose=5;
   lid.pull=smooth((q-8.0)/.6);
   if(q>=8.0)s.comic={text:'グイッ！',kind:'build',side:'left',phase:q-8.0};
   cap='三男は、えんとつのふたにつないだ ひもを、グイッと引きました。';
  }
  s.cutOpacity=q>9.2?.85*smooth((q-9.2)/.4):0;
 }else if(q<17.4){
  Object.assign(wolf,{visible:true,...ROOF_WOLF,anchor:'brick_roof_edge',yaw:-Math.PI/2});
  lid.rope=false;lid.pull=1;lid.open=1-smooth((q-10.0)/.45);s.camera=ROOF_CAMERA;
  if(q<10.0){wolf.reactionPose=3;cap='狼「しめしめ。えんとつから、そうっと……。」';}
  else if(q<12.4){wolf.reactionPose=q<10.45?3:2;cap='えんとつに、板のふたが パタン！';if(q>=10.4)s.comic={text:'パタン！',kind:'door',side:'right',phase:q-10.4,sourceWorld:[21.2,6.4,-15.0],sourceTerrainRelative:false};}
  else if(q<14.8){wolf.reactionPose=8;cap='狼「あれっ、ふたがしてある！ これじゃ入れない……。」';}
  else{wolf.reactionPose=4;cap='狼「……だめだ。今日は、あきらめよう。」';}
  s.cutOpacity=q<9.95?.85*(1-smooth((q-9.6)/.35)):q>17.0?.85*smooth((q-17.0)/.4):0;
 }else{
  lid.rope=false;lid.pull=1;lid.open=0;
  const away=[WOLF_AT_BRICK[0]-BRICK[0],WOLF_AT_BRICK[1]-BRICK[2]],len=Math.hypot(...away),dir=[away[0]/len,away[1]/len];
  const w=q-17.4,d=1.15*w;Object.assign(wolf,{visible:true,anchor:'brick_attack',x:WOLF_AT_BRICK[0]+dir[0]*d,z:WOLF_AT_BRICK[1]+dir[1]*d,yOffset:0,motion:'walk',walkDistance:d,motionTime:w,yaw:Math.atan2(dir[0],dir[1])});
  s.camera={id:'J116_lid_walk_home',position:[15.5+dir[0]*d*.55,2.6,-9.6+dir[1]*d*.55],target:[wolf.x,1.2,wolf.z],fov:46,terrainRelative:false};
  cap='おおかみは屋根からおりて、とぼとぼ帰っていきました。';
  s.cutOpacity=q<17.75?.85*(1-smooth((q-17.4)/.35)):q>L-.4?.85*smooth((q-(L-.4))/.4):0;
 }
 s.chimneyLid=lid;
 return cap;
}
