const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};

export const STRAW_BRANCH=131,STRAW_LENGTH=30;
const HOUSE=[2.1,0,-2.25],WOLF=[1.45,3.1],DOOR_IN=[1.45,-.78],FLOOR=.3;
const ROUTE=[[1.45,3.1],[2.76,4.29],[4.72,4.17],[6.67,3.91],[8.6,3.52],[11.95,2.52]];
const mix=(a,b,u)=>a+(b-a)*u;
function along(route,d){for(let i=1;i<route.length;i++){const[a,b]=[route[i-1],route[i]],l=Math.hypot(b[0]-a[0],b[1]-a[1]);if(d<=l||i===route.length-1){const u=Math.min(1,d/l);return{x:mix(a[0],b[0],u),z:mix(a[1],b[1],u),yaw:Math.atan2(b[0]-a[0],b[1]-a[1])};}d-=l;}}
function gust(start,now){const g={house:'straw',inhale:start,exhale:start+1.1,emission:start+1.35,impact:start+2.3,end:start+3.8,wind:[0,0,-1],wallZ:-.1};if(now<g.inhale||now>=g.end)return null;return{...g,phase:now<g.exhale?'inhale':now<g.emission?'release':now<g.impact?'travel':'impact',front:Math.max(0,Math.min(1,(now-g.emission)/(g.impact-g.emission))),age:now-g.impact};}
function sway(age,peak){if(age<0)return 0;const rise=smooth(age/.35);return peak*rise*Math.exp(-1.6*age)*Math.cos(Math.max(0,age-.35)*7.5);}
const BLOWS=[{at:0,peak:.09,text:'フーッ！'},{at:7,peak:.13,text:'ブオーッ！'}];

export function strawHolds(s,q,L){
 const T=STRAW_BRANCH+q,actor=id=>s.actors.find(a=>a.id===id),wolf=actor('wolf'),pig=actor('pig_straw'),wood=actor('pig_wood'),brick=actor('pig_brick');
 for(const a of s.actors){a.visible=false;delete a.reactionPose;delete a.encounterReaction;delete a.encounterClose;}
 s.effects=[];s.gustOverride=null;s.battle=null;s.intro=null;s.drama=null;s.escape=null;s.fireScene=null;s.tailFlame=null;s.chimneyImpact=null;s.resultCard=null;s.comic=null;s.effectTime=T;
 Object.assign(s.houses.straw,{intact:true,time:0,blowAway:false,constructionStage:5,door:'closed',doorOpen:0,doorSwing:'inward',deform:0});
 Object.assign(wolf,{visible:true,x:WOLF[0],z:WOLF[1],yaw:-Math.PI,yOffset:0,motion:'idle',motionTime:q});delete wolf.worldY;
 const wideShot={id:'J116_straw_holds_wide',position:[7,2.35,8.2],target:[2.1,1.35,.35],fov:46,terrainRelative:true};
 let cap,camera=wideShot;
 if(q<11){
  const b=q<7?BLOWS[0]:BLOWS[1],g=gust(STRAW_BRANCH+b.at,T);
  s.gustOverride=g;s.houses.straw.deform=sway(q-b.at-2.3,b.peak);s.battle={house:'straw',round:q<7?1:2,phase:g?.phase??'rest',deform:s.houses.straw.deform};
  if(g&&T>=g.exhale)wolf.motion='blow';
  if(g&&T>=g.emission)s.comic={text:b.text,kind:'breath',side:'left',phase:T-g.emission};
  if(q<4)cap=q<2.3?'狼「それなら、ふうーっ！」':'わらの家は、ゆらゆら……。でも、飛ばされません！';
  else if(q<7){
   wolf.visible=false;s.comic=null;
   Object.assign(pig,{visible:true,x:1.25,z:-2.35,worldY:FLOOR,yaw:0,yOffset:0,motion:'idle',motionTime:q,reactionPose:q<5.4?2:3});
   camera={id:'J116_straw_holds_inside',position:[2.95,1.3,-1.0],target:[1.25,.9,-2.35],fov:54,terrainRelative:false};
   cap=q<5.4?'長男「ちゃんと確かめておいてよかった！」':'長男（よし。この家なら、だいじょうぶ。）';
  }
  else cap=q<9.3?'狼「もう一度！ ふううーっ！」':'ぐらり……。それでも、わらの家は立っています！';
 } else if(q<17.5){
  camera={id:'J116_straw_holds_wolf_tired',position:[4.6,1.75,6.9],target:[1.45,1.1,2.7],fov:44,terrainRelative:false};
  if(q<14.5){wolf.motion='tired';cap='狼「はあ、はあ……。なんて丈夫な家なんだ。」';s.comic={text:'はあ… はあ…',kind:'tired',side:'left',phase:q-11};}
  else{wolf.reactionPose=4;cap='狼「こんな家は、むりだ。あきらめよう。」';}
 } else {
  const w=q-17.5,d=Math.min(1.15*w,13),p=along(ROUTE,d);
  Object.assign(wolf,{motion:'walk',walkDistance:d,motionTime:w,x:p.x,z:p.z,yaw:p.yaw,visible:w<6});
  camera={id:'J116_straw_holds_wolf_leaves',position:[5.2,2.1,9.8],target:[mix(1.45,wolf.x,.85),1.15,mix(3.1,wolf.z,.85)],fov:46,terrainRelative:false};
  cap='おおかみは、とぼとぼ帰っていきました。';
  if(w>=4.5){
   const v=w-4.5,open=smooth(v/.6);
   s.houses.straw.doorOpen=open;s.houses.straw.door=open>.01?'open':'closed';
   camera={id:'J116_straw_holds_door',position:[1.75,1.75,5.6],target:[1.6,1.05,-.2],fov:46,terrainRelative:false};
   const u=smooth((v-.5)/1.6),z=mix(DOOR_IN[1],1.15,u);
   Object.assign(pig,{visible:true,x:DOOR_IN[0],z,yaw:0,yOffset:0,motion:v>.5&&v<2.1?'walk':'idle',motionTime:v,walkDistance:Math.max(0,z-DOOR_IN[1])});
   const sill=z>-.55&&z<.3?.24*Math.sin(Math.PI*(z+.55)/.85):0,down=Math.max(0,Math.min(1,(z-.1)/.65));
   if(down<1)pig.worldY=FLOOR*(1-down)+sill;else delete pig.worldY;
   cap=v<2.2?'長男は、そっと戸を開けて外へ出ました。':'長男「おーい！ もう、だいじょうぶだよー！」';
   if(v>=2.2&&v<3.8)pig.reactionPose=6;
   if(v>=3.8){
    const r=v-3.8,k=smooth(r/2.6);
    const m=smooth(r/1.2);camera={id:'J116_straw_holds_three_wave',position:[mix(1.75,1.45,m),mix(1.75,1.65,m),mix(5.6,6.2,m)],target:[mix(1.6,1.45,m),mix(1.05,.9,m),mix(-.2,1.2,m)],fov:mix(46,52,m),terrainRelative:false};
    Object.assign(wood,{visible:true,x:mix(-3.6,.15,k),z:mix(2.6,1.45,k),yaw:Math.atan2(3.75,-1.15),yOffset:0,motion:r<2.6?'walk':'celebrate_home',motionTime:r,walkDistance:3.9*k});delete wood.worldY;
    Object.assign(brick,{visible:true,x:mix(6.6,2.75,k),z:mix(2.6,1.45,k),yaw:Math.atan2(-3.85,-1.15),yOffset:0,motion:r<2.6?'walk':'celebrate_home',motionTime:r,walkDistance:4*k});delete brick.worldY;
    pig.motion=r<2.6?'idle':'celebrate_home';delete pig.reactionPose;
    cap=r<2.6?'次男と三男も、かけつけてきました。':'3びきは、そろって手をふりました。';
   }
  }
 }
 s.camera=camera;s.cutOpacity=0;// 結び（resumeScene）へ同じカメラ・同じ立ち位置で続くので暗転しない
 return cap;
}


const SHIFT=[2.1-20,0-1.06,-2.25+14];
const START={pig_wood:[.15,1.45],pig_straw:[1.45,1.15],pig_brick:[2.75,1.45]};
const ROW={pig_wood:[18+SHIFT[0],-8.8+SHIFT[2]],pig_straw:[19.7+SHIFT[0],-8.8+SHIFT[2]],pig_brick:[21.4+SHIFT[0],-8.8+SHIFT[2]]};
const CAM0={position:[1.45,1.65,6.2],target:[1.45,.9,1.2],fov:52},CAM1={position:[19.7+SHIFT[0],1.75,-1.9+SHIFT[2]],target:[19.7+SHIFT[0],1.15,-10.4+SHIFT[2]+.3],fov:46};
function resumeScene(s,baseTime){
 const r=baseTime-228.7,w=smooth((r-.5)/3.2),c=smooth(r/5.5);
 for(const id of Object.keys(START)){
  const a=s.actors.find(x=>x.id===id),[x0,z0]=START[id],[x1,z1]=ROW[id];
  delete a.worldY;delete a.reactionPose;
  const walking=r>.5&&r<3.7,dx=x1-x0,dz=z1-z0;
  Object.assign(a,{visible:true,x:mix(x0,x1,w),z:mix(z0,z1,w),yOffset:0,motion:walking?'walk':r<=.5?'celebrate_home':'idle',motionTime:r,walkDistance:Math.hypot(dx,dz)*w,yaw:walking?Math.atan2(dx,dz):0});
 }
 for(const a of s.actors)if(!START[a.id])a.visible=false;
 s.camera={id:'J116_straw_holds_closing',position:CAM0.position.map((v,i)=>mix(v,CAM1.position[i],c)),target:CAM0.target.map((v,i)=>mix(v,CAM1.target[i],c)),fov:mix(CAM0.fov,CAM1.fov,c),terrainRelative:false};
 s.houses.straw={...s.houses.straw,intact:true,time:0,blowAway:false,constructionStage:5,deform:0,door:r<1.6?'open':'closed',doorOpen:1-smooth((r-1)/.6),doorSwing:'inward'};
 s.houses.wood={...s.houses.wood,intact:true,time:0,blowAway:false,deform:0};
 s.houses.brick={...s.houses.brick,intact:true,time:0,door:'closed',doorOpen:0};
 s.egress=null;s.fireScene=null;s.tailFlame=null;s.chimneyImpact=null;s.effects=[];s.gustOverride=null;s.comic=null;
 return s;
}

export const PLAN={branch:STRAW_BRANCH,length:STRAW_LENGTH,resume:228.7,scene:strawHolds,resumeScene,finale:'わらの家が耐えたルート。みんな無事！'};
