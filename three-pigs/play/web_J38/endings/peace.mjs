const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
const mix=(a,b,u)=>a+(b-a)*u,clamp=x=>Math.max(0,Math.min(1,x));
const DOOR=[1.45,-.05],INSIDE_Z=-.78,FLOOR=.30;
const stepY=z=>z>=DOOR[1]+1.3?null:FLOOR-.3+.3*smooth((DOOR[1]+1.3-z)/1.1)+.18*smooth((DOOR[1]+.65-z)/.3)*(1-smooth((DOOR[1]-.25-z)/.35));
const ROW={pig_wood:[-1.55,3.0],pig_straw:[0,3.0],wolf:[1.45,3.1],pig_brick:[2.95,3.0]};
const HILL={pig_wood:[17.0,-8.8],pig_straw:[18.5,-8.8],wolf:[19.95,-8.75],pig_brick:[21.5,-8.8]};

function place(a,x,z,o={}){Object.assign(a,{visible:true,x,z,yOffset:0,motion:'idle',...o});delete a.worldY;delete a.reactionPose;delete a.ownerDoor;delete a.encounterReaction;delete a.encounterClose;delete a.runAway;}
function walk(a,from,to,q,start,speed=1.15,o={}){
 const len=Math.hypot(to[0]-from[0],to[1]-from[1]),d=Math.max(0,Math.min(len,(q-start)*speed)),u=len?d/len:1,moving=q>start&&d<len;
 place(a,mix(from[0],to[0],u),mix(from[1],to[1],u),{yaw:moving?Math.atan2(to[0]-from[0],to[1]-from[1]):(o.yaw??0),motion:moving?'walk':'idle',walkDistance:d,motionTime:Math.max(0,q-start)});
 return moving;
}
const shot=(id,position,target,fov=44)=>({id:'J116_peace_'+id,position,target,fov,terrainRelative:false});

export const LINES=[
 [0,'狼「少し休ませてくれないか。話をしよう。」'],
 [3,'長男「……おなか、すいてるの？」'],
 [6,'長男は、戸を少しだけ開けて話を聞きました。'],
 [10,'狼「みんなと同じで、住む家をさがしていたんだ。」'],
 [14,'長男「それなら、いっしょに考えよう！」'],
 [18,'そこへ、次男と三男が歩いてきました。'],
 [20.5,'三男「土台なら、手伝えるよ。」'],
 [23,'長男「まずは、みんなでごはんにしよう！」'],
 [26,'おおかみが、はじめて笑いました。'],
 [29,'4人は、丘の上の空き地へ。'],
];
const LENGTH=33;

export function peaceScene(s,q,L){
 const by=id=>s.actors.find(a=>a.id===id),wolf=by('wolf'),straw=by('pig_straw'),wood=by('pig_wood'),brick=by('pig_brick');
 s.effects=[];s.gustOverride=null;s.battle=null;s.intro=null;s.drama=null;s.escape=null;s.fireScene=null;s.tailFlame=null;s.chimneyImpact=null;s.resultCard=null;s.encounter=null;s.comic=null;s.shelter=null;
 for(const h of ['straw','wood','brick'])Object.assign(s.houses[h],{intact:true,time:0,blowAway:false,constructionStage:5,deform:0});
 for(const a of s.actors)a.visible=false;
 const open=q<3?0:q<14?.38*smooth((q-3)/.8):q<17?mix(.38,.95,smooth((q-14)/.6)):.95*(1-smooth((q-17)/.9));
 Object.assign(s.houses.straw,{doorOpen:open,door:open>.01?'open':'closed',doorSwing:'inward'});
 if(q<14){place(wolf,1.45,3.1,{yaw:Math.PI,motionTime:q});wolf.reactionPose=q<10?1:0;}
 else if(q<23){place(wolf,...ROW.wolf,{yaw:-Math.PI/2,motionTime:q});wolf.reactionPose=1;}
 else if(q<29){place(wolf,...ROW.wolf,{yaw:0,motionTime:q});wolf.reactionPose=q<26?0:6;}
 if(q>=3){
  if(q<14){place(straw,DOOR[0],INSIDE_Z+.2*smooth((q-3)/.8),{yaw:0,motionTime:q});straw.worldY=stepY(straw.z);straw.reactionPose=5;}
  else if(q<23){const from=[DOOR[0],INSIDE_Z+.2],moving=walk(straw,from,ROW.pig_straw,q,14.2,1.15,{yaw:Math.PI/2});const y=stepY(straw.z);if(y!=null)straw.worldY=y;if(!moving){straw.yaw=Math.PI/2;straw.reactionPose=q<18?5:3;}}
  else if(q<29){place(straw,...ROW.pig_straw,{yaw:0,motionTime:q});straw.reactionPose=q<26?4:3;}
 }
 if(q>=16&&q<23){const wf=[-6.2,3.1],bf=[9.2,3.1],sp=1.5;
  if(!walk(wood,wf,ROW.pig_wood,q,16,sp,{yaw:Math.PI/2})){wood.yaw=Math.PI/2;wood.reactionPose=q<20.5?3:5;}
  if(!walk(brick,bf,ROW.pig_brick,q,16,sp,{yaw:-Math.PI/2})){brick.yaw=-Math.PI/2;brick.reactionPose=q<20.5?3:6;}}
 else if(q>=23&&q<29){place(wood,...ROW.pig_wood,{yaw:0,motionTime:q});wood.reactionPose=q<26?4:3;place(brick,...ROW.pig_brick,{yaw:0,motionTime:q});brick.reactionPose=q<26?4:3;}
 if(q>=29){for(const [i,a] of [wood,straw,wolf,brick].entries()){const r=ROW[a.id],to=[r[0]+9,3.6+.2*i];walk(a,r,to,q,29+.15*i,1.25,{yaw:Math.PI/2});}}
 let cam;
 if(q<3)cam=shot('wolf_asks',[6.6,2.1,7.9],[1.9,1.25,.9],44);
 else if(q<10)cam=shot('door_talk',[-2.2,1.7,6.4],[1.6,1.1,1.6],42);
 else if(q<14)cam=shot('wolf_explains',[4.2,1.45,6.6],[1.3,1.0,2.0],40);
 else if(q<17)cam=shot('steps_out',[-2.4,1.7,7.4],[1.0,.95,1.4],44);
 else if(q<29){const u=smooth((q-17)/1.2);cam=shot('together',[mix(-2.4,.7,u),mix(1.7,1.55,u),mix(7.4,8.6,u)],[mix(1.0,.7,u),mix(.95,.9,u),mix(1.4,2.6,u)],mix(44,42,u));}
 else{const u=smooth((q-29)/4);cam=shot('to_hill',[mix(.7,4.2,u),mix(1.55,2.3,u),mix(8.6,10.6,u)],[mix(.7,6.2,u),mix(.9,1.15,u),mix(2.6,3.2,u)],mix(42,46,u));}
 s.camera=cam;
 s.cutOpacity=q>L-.4?.85*smooth((q-(L-.4))/.4):0;
 s.peace={phase:q<3?'ask':q<14?'listen':q<17?'step_out':q<23?'gather':q<29?'smile':'to_hill',doorOpen:open,housesIntact:true};
 let cap=LINES[0][1];for(const [at,text] of LINES)if(q>=at)cap=text;
 return cap;
}

export function peaceFinale(s,t){
 for(const h of ['straw','wood','brick'])Object.assign(s.houses[h],{intact:true,time:0,blowAway:false,constructionStage:5,deform:0,doorOpen:0,door:'closed'});
 s.tailFlame=null;s.comic=null;
 for(const a of s.actors){const p=HILL[a.id];if(!p)continue;place(a,...p,{yaw:0,motionTime:t});a.tailFlame=null;}
 s.actors.find(a=>a.id==='wolf').reactionPose=6;
 if(s.camera){const back=1.6;s.camera={...s.camera,id:(s.camera.id||'')+'_peace4',position:[19.55,s.camera.position[1]+.15,s.camera.position[2]+back],target:[19.55,s.camera.target[1],s.camera.target[2]]};}
 if(t<236.5){const text='おなかがいっぱいになったおおかみは、みんなと友だちになりました。';s.scene={...s.scene,caption:text};s.branch={...s.branch,caption:{...s.branch.caption,text}};}
 s.cutOpacity=t<232.35?.85*(1-smooth((t-232)/.35)):0;
 return s;
}

export const PEACE_PLAN={calm:true,branch:127,length:LENGTH,resume:232,scene:peaceScene,after:peaceFinale,finale:'おおかみと仲よくなったルート。みんな無事！'};
