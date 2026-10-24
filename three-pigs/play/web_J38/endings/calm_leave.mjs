import {smooth,WOLF_AT_BRICK,BRICK} from '../endings.mjs';
const CHIMNEY=[21.2093,-14.9975],IN_CHIMNEY=3.327,ON_ROOF=5.227;
export const CALM_LEAVE={branch:213.85,length:14,resume:228.7,finale:'おおかみが落ち着いて帰ったルート。みんな無事！',
 scene(s,q,L){
  const wolf=s.actors.find(a=>a.id==='wolf');for(const a of s.actors)a.visible=a===wolf;
  s.effects=[];s.gustOverride=null;s.battle=null;s.intro=null;s.drama=null;s.escape=null;s.fireScene=null;s.chimneyImpact=null;s.resultCard=null;s.comic=null;s.tailFlame=null;
  delete wolf.anchor;delete wolf.reactionPose;delete wolf.worldY;delete wolf.runAway;delete wolf.singleHotJump;
  Object.assign(wolf,{x:CHIMNEY[0],z:CHIMNEY[1],yaw:0,yOffset:IN_CHIMNEY,motion:'idle',motionTime:q,visible:false});
  let cap,cut=0,camera={id:'chimney_plop',position:[28,6.5,-3],target:[21.13,4.8,-14.81],fov:48,terrainRelative:true};
  if(q<1.5){cap='狼「熱っ……。」';s.comic={text:'あつっ…',kind:'tired',side:'left',phase:q};}
  else if(q<6.6){ // 煙突からゆっくり出て、屋根の上で落ち着いてひとこと → 去るポーズ。しっぽの小さな火はすぐ消える
   const u=smooth((q-1.5)/1.0);wolf.visible=true;wolf.yOffset=IN_CHIMNEY+(ON_ROOF-IN_CHIMNEY)*u;wolf.reactionPose=q<4.6?8:5;
   cap=q<3.2?'狼「熱っ……。」':'狼「熱っ……。今日はここまでだ。」';
   s.tailFlame={active:q<3.6,elapsed:q,fade:q<3.1?1:Math.max(0,(3.6-q)/.5),offset:[.42,.32]};
   if(q>=2.6)camera={id:'J116_calm_on_roof',position:[25.0,6.5,-8.4],target:[21.2,5.85,-15.0],fov:42,terrainRelative:true};
   cut=q>6.2?.85*smooth((q-6.2)/.4):0;
  }
  else{ // 地上：来た道を普通に歩いて帰る（2回で帰る結末と同じ道とカメラ）
   const away=[WOLF_AT_BRICK[0]-BRICK[0],WOLF_AT_BRICK[1]-BRICK[2]],len=Math.hypot(...away),dir=[away[0]/len,away[1]/len];
   const w=q-6.6,d=1.15*w;Object.assign(wolf,{visible:true,yOffset:0,motion:'walk',walkDistance:d,motionTime:w,yaw:Math.atan2(dir[0],dir[1]),x:WOLF_AT_BRICK[0]+dir[0]*d,z:WOLF_AT_BRICK[1]+dir[1]*d});
   cap='おおかみは、落ち着いて歩いて帰っていきました。';
   camera={id:'J116_calm_walks_home',position:[15.5+dir[0]*d*.55,2.6,-9.6+dir[1]*d*.55],target:[wolf.x,1.2,wolf.z],fov:46,terrainRelative:false};
   cut=w<.35?.85*(1-smooth(w/.35)):q>L-.4?.85*smooth((q-(L-.4))/.4):0;
  }
  wolf.tailFlame=s.tailFlame;s.camera=camera;s.cutOpacity=cut;
  return cap;
 }};
