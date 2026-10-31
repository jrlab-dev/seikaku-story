import {CENTERS} from './strategy.mjs';
const SITES=['straw','wood','brick'],LABEL=['長男','次男','三男'],OWNER=[1.4,3.9],GUEST=j=>[-.9+j*1.15,3.9];
const clamp=x=>Math.max(0,Math.min(1,x)),lerp=(a,b,u)=>a+(b-a)*u;
const local=(site,ps)=>ps.map(([x,z])=>[CENTERS[site][0]+x,CENTERS[site][2]+z]);
function follow(a,ps,v,motion='walk'){
 const ds=ps.slice(1).map((p,i)=>Math.hypot(p[0]-ps[i][0],p[1]-ps[i][1]));
 const distance=ds.reduce((a,b)=>a+b,0)*clamp(v);let left=distance,j=0;
 while(j<ds.length-1&&left>ds[j])left-=ds[j++];
 const p=ps[j],b=ps[j+1],u=ds[j]?left/ds[j]:0;
 Object.assign(a,{x:lerp(p[0],b[0],u),z:lerp(p[1],b[1],u),yaw:Math.atan2(b[0]-p[0],b[1]-p[1]),walkDistance:distance,motion:v>0&&v<1?motion:'idle'});
 if(a.motion!=='idle')delete a.reactionPose;
}
export function raidEscapeRoute(site,next,j){
 const c=CENTERS[site],n=next?CENTERS[next]:null,start=j===SITES.indexOf(site)?OWNER:GUEST(j);
 const ps=local(site,[start,[1.65,4.15],[3.8,4.15],[3.8,6.5]]);
 if(!next)return [...ps,[c[0]+7,c[2]+8],[c[0]+14,c[2]+9+j*.7]];
 const roadX=site==='straw'?c[0]-4:c[0]+3.8;if(site==='straw')ps.push([roadX,c[2]+6.5]);
 return [...ps,[roadX,-7],[n[0],-7],[n[0],n[2]+5.9],[n[0],n[2]+4.25],[n[0]+GUEST(j)[0],n[2]+GUEST(j)[1]]];
}
function clean(s,q){
 for(const a of s.actors){for(const k of ['worldY','strategyWorldY','strategyLift','reactionPose','reactionBuild','stance','ownerDoor','encounterReaction','encounterClose','shelterRunner','runAway','bombPose','bonkPose','singleHotJump','tailFlame','puzzleEntry'])delete a[k];Object.assign(a,{visible:false,motion:'idle',motionTime:q,yOffset:0,yaw:0,walkDistance:0});}
 for(const h of Object.values(s.houses))Object.assign(h,{intact:true,constructionStage:5,time:0,door:'closed',doorOpen:0,deform:0,blowAway:false,security:null});
 for(const k of ['gustOverride','battle','intro','drama','escape','fireScene','tailFlame','chimneyImpact','resultCard','completion','comic','shelter','egress','encounter','personalityWindow','fullImage','puzzleEffect'])s[k]=null;
 s.effects=[];s.cutOpacity=0;s.animationTime=131+q;s.effectTime=131+q;
}
function makeScene(ending){return(s,q)=>{
 clean(s,q);
 const last=ending.duels.length-1,i=Math.min(last,Math.floor(q/48)),u=q-i*48,site=SITES[i],c=CENTERS[site],duel=ending.duels[i],win=duel.winner==='pig';
 const actor=id=>s.actors.find(a=>a.id===id);
 const put=(id,x,z,pose=null)=>{const a=actor(id);Object.assign(a,{visible:true,x:c[0]+x,z:c[2]+z});if(pose!==null)a.reactionPose=pose;return a;};
 const owner=put('pig_'+site,...OWNER,2),wolf=put('wolf',0,8.5);wolf.yaw=Math.PI;
 for(let j=0;j<i;j++)put('pig_'+SITES[j],...GUEST(j),2);
 const walk=(a,ps,start,duration,motion)=>follow(a,local(site,ps),(u-start)/duration,motion);
 const fx=s.strategy={revision:2,site,phase:u,duel,gate:0,exit:0,scan:0,decoy:0,steam:0,lever:0,gear:0,wedge:0,alarm:0,fire:0,checked:duel.prepared,tool:0,cartZ:8.3,press:0,breach:0,brace:win?1:0,ram:0,wall:0,bridge:0,jetSide:0};
 s.camera={id:'strategy_'+site,position:[c[0]-6.5,c[1]+2.7,c[2]+12.7],target:[c[0],c[1]+1.05,c[2]+5.7],fov:48,fitAspect:1.35,terrainRelative:false};
 const detail=(name,z=5.6)=>{s.camera={id:'strategy_'+name,position:[c[0]-4.3,c[1]+2.3,c[2]+10.4],target:[c[0],c[1]+.95,c[2]+z],fov:43,fitAspect:1.05,terrainRelative:false};};
 let cap='';
 if(i===0){
  fx.alarm=u>=3?1:0;fx.scan=Math.sin(u)*.5;
  if(u<6){wolf.motion=u<3?'blow':'idle';cap=u<3?'狼「まずは、ふうーっ！」':'門はびくともしない。見張りも狼を見逃しません。';}
  else if(u<12){walk(wolf,[[0,8.5],[0,6.7],[0,8.5]],6,6);fx.ram=Math.sin(clamp((u-6)/6)*Math.PI);cap='近づくと、押し戻し装置が作動。狼は退けられました。';}
  else if(u<18){fx.tool=1;fx.cartZ=8.1;put('wolf',-.85,8.5);cap=u<15?'狼が持ってきたのは、折り畳み板と、ねじ式の押し具。':'狼「門を開けてもらう必要はない。道具を組み直そう」';detail('tools',8);}
  else if(u<24){fx.tool=2;fx.cartZ=lerp(8.1,5.7,clamp((u-18)/5));put('wolf',-.85,fx.cartZ+.3);fx.ram=.35+.2*Math.sin(u*3);cap='板を盾にして進む。見張りは作動したまま、盾が押し返します。';}
  else{fx.tool=2;fx.cartZ=5.7;fx.press=clamp((u-24)/2);put('wolf',-.85,6);fx.ram=.35+.2*Math.sin(u*3);cap=u<26?'狼が自分の押し具を門の継ぎ目へ。ねじを回します。':win?'補強した閂が支える。押し具の力では広がりません！':'門がきしみ始めた！ 長男はすぐに非常口へ。';}
 }else if(i===1){
  fx.alarm=u>=12?1:0;fx.fire=u>=7?1:0;fx.lever=u>=8?1:0;fx.steam=u>=9?1:0;fx.jetSide=Math.floor(u/2)%2?1:-1;
  if(u<7){wolf.visible=false;cap='長男「盾と押し具だ！」 次男「なら、盾の横も狙おう」';}
  else if(u<13){wolf.visible=false;walk(owner,[OWNER,[1.7,4.4]],7,2);detail('stove',4.3);cap='次男が火をつける。左右の配管を、内側から切り替えます。';}
  else if(u<20){fx.tool=2;fx.cartZ=lerp(6.3,8.3,clamp((u-15)/3));put('wolf',-.85,fx.cartZ+.3);walk(owner,[[1.7,4.4],OWNER],13,2);cap=u<16?'次男は盾の横へ噴射！ 正面を隠すだけでは進めません。':'狼はいったん後退。次男は噴射する側を変えて見張ります。';}
  else if(u<24){fx.tool=3;fx.cartZ=lerp(8.3,5.7,clamp((u-20)/4));put('wolf',-.85,fx.cartZ+.3);cap='狼は板を屋根と側板へ組み替え、覆いの下から再挑戦。';}
  else{fx.tool=3;fx.cartZ=5.7;fx.press=clamp((u-24)/2);put('wolf',-.85,6);fx.steam=win?1.4:1;cap=u<26?'次男は予備の噴射へ。狼は覆いを支え、押し具を回します。':win?'予備の噴射と門の補強が効いた。狼は進めません！':'蒸気は止まらない。でも門がきしむ――二匹は非常口へ！';}
 }else{
  fx.fire=u>=8?1:0;fx.lever=u>=8?1:0;fx.steam=u>=15?.8:0;fx.jetSide=Math.floor(u/2)%2?1:-1;fx.wall=u>=12?1:0;fx.alarm=u>=15?1:0;
  if(u<8){wolf.visible=false;cap='兄二匹が道具のことを伝える。三男「覆いごと止める壁を使おう」';}
  else if(u<15){wolf.visible=false;fx.wall=clamp((u-10)/2);cap='手前の壁、左右の蒸気、奥の門。それぞれ別に動きます。';}
  else if(u<23){fx.tool=3;fx.cartZ=8.2;put('wolf',-.85,8.6);cap='せり上がった壁が、覆いの進路をふさぐ。前と同じ策では進めません。';}
  else if(u<31){fx.tool=3;fx.cartZ=8.2;fx.bridge=clamp((u-23)/4);put('wolf',-.85,8.6);cap=u<27?'狼は残していた板をつなぎ、壁をまたぐ橋に組み替えます。':'見張りも蒸気も止まらない。狼は覆いと橋を組み合わせます。';detail('bridge',7);}
  else if(u<36){fx.tool=3;fx.bridge=1;fx.cartZ=lerp(8.2,5.7,clamp((u-31)/4));put('wolf',-.85,fx.cartZ+.3);wolf.strategyLift=1.45*Math.max(0,1-Math.abs(fx.cartZ-6.9)/1.6);fx.toolLift=wolf.strategyLift;cap='橋で壁を越え、覆いで蒸気をしのぐ。最後の門は、まだ閉じています。';}
  else{fx.tool=3;fx.cartZ=5.7;fx.bridge=1;fx.press=clamp((u-36)/2);put('wolf',-.85,6);cap=u<38?'最後の門に押し具を掛ける。三匹が内側の補強を確かめます。':win?'最後の補強が耐えた！ 道具を重ねても、ここは突破できません。':'最後の門もきしみ始めた！ 三匹はすぐ非常口へ！';}
 }
 if(fx.tool>=2){
  const moving=(i===0&&u>=18&&u<23)||(i===1&&((u>=15&&u<18)||(u>=20&&u<24)))||(i===2&&u>=31&&u<35);
  if(moving){wolf.motion='walk';wolf.walkDistance=u*.65;}
 }
 if(i===2&&fx.bridge===1&&fx.tool){
  const height=z=>1.45*Math.max(0,1-Math.abs(z-6.9)/1.6),front=height(fx.cartZ-.45),rear=height(fx.cartZ+.45);
  fx.toolLift=(front+rear)/2;fx.toolPitch=Math.atan2(front-rear,.9);
  delete wolf.strategyLift;wolf.strategyWorldY=c[1]+.04+height(wolf.z-c[2]);
 }
 const danger=i===2?38:26,breakAt=danger+4;
 if(u>=danger){
  fx.breach=win?0:clamp((u-breakAt)/2);fx.gate=fx.breach;fx.press=1;
  if(!win){
   fx.exit=clamp((u-danger)/.5);const next=i<2?SITES[i+1]:null,duration=i<2?47.6-danger:9.5;
   for(let j=0;j<=i;j++){const a=actor('pig_'+SITES[j]),delay=.5+j*.25,v=clamp((u-danger-delay)/(duration-delay));follow(a,raidEscapeRoute(site,next,j),v,'paper_run');a.visible=true;a.shelterRunner=v>0&&v<1;delete a.reactionPose;}
   if(u>=breakAt+2){walk(wolf,[[-.85,6],[0,5.7],[0,4.25],[1.65,4.15],[3.8,4.15]],breakAt+2,5);fx.tool=0;fx.press=0;delete wolf.strategyWorldY;}
   if(next){fx.arrival={site:next,gate:1};const n=CENTERS[next],p=clamp((u-danger)/duration);if(p>.68)put('pig_'+next,n[0]-c[0]+1.6,n[2]-c[2]+6.2,6);}
   if(u>=danger+6){
    const a=actor('pig_straw');wolf.visible=false;const p=clamp((u-danger)/duration),arrival=next?clamp((p-.78)/.22):0;
    const left=i===0?clamp((p-.14)/.12)*(1-clamp((p-.55)/.15)):0,behind=i===1?clamp((a.x+10)/3)*(1-clamp((a.x-7)/3)):0;
    s.camera={id:'strategy_transfer_'+site,position:[a.x+lerp(lerp(2.5,-3.5,left),4.5,Math.max(behind,arrival)),1.7,a.z+lerp(lerp(5.2,1,behind),9.4,arrival)],target:[a.x,.8,a.z],groundFocus:[a.x,a.z],fov:46,fitAspect:1.05,terrainRelative:false};
    cap=next?(p>.78?LABEL[i+1]+'「こっちへ！ 何が起きたか教えて！」':i===0?'長男は、用意していた非常口から次男の家へ！':'二匹は三男の家へ。次の守りに経験をつなぎます。'):'三びきは、ぐるぐる脚で一目散に逃げ出しました――';
   }
  }
 }
 if(i>0&&u<5){walk(owner,[[1.6,6.2],[0,5.7],[0,4.25],OWNER],0,4);fx.gate=u<=4?1:1-clamp(u-4);}
 const finish=i===2?48:38;
 if(win&&u>=finish){
  const r=u-finish;fx.tool=0;fx.press=0;fx.ram=0;fx.steam=0;fx.gate=clamp(r-4);walk(wolf,[[-.85,6],[-.85,10.5]],finish,7);wolf.visible=r<7;delete wolf.strategyWorldY;
  if(i===2){wolf.strategyWorldY=c[1]+.04+1.45*Math.max(0,1-Math.abs(wolf.z-c[2]-6.9)/1.6);if(r>=7){fx.wall=clamp(8-r);fx.bridge=0;}}
  for(let j=0;j<=i;j++){const a=actor('pig_'+SITES[j]),start=j===i?OWNER:GUEST(j),v=(r-5-j*.7)/2;follow(a,local(site,[start,[start[0],4.25],[0,4.45],[0,5.9],[-.9+j*1.2,6.3]]),v);if(v>=1){a.reactionPose=3;a.yaw=0;}}
  cap=duel.attack===duel.defence?'備えを確かめておいた、その差で守り切りました。':'狼の工夫を上回る備え。狼は引き上げました。';
  if(r>=4)s.camera={id:'strategy_defended_'+site,position:[c[0]+2.5,c[1]+2.6,c[2]+11.8],target:[c[0]+.35,c[1]+.9,c[2]+6.3],fov:43,fitAspect:1.35,terrainRelative:false};
 }
 if(i===2&&!win&&u>=48){for(const a of s.actors)a.visible=false;s.fullImage={key:u<53?'dinner_a':'dinner_b'};cap=u<53?'その夜、おおかみの家では――':'おおかみ「ごちそうさまでした。」';}
 if(u<.35&&i>0)s.cutOpacity=.7*(1-u/.35);if(u>47.6&&i<last)s.cutOpacity=.7*clamp((u-47.6)/.4);
 return cap;
};}
export function raidPlan(ending){const length=(ending.duels.length-1)*48+(ending.duels.length===3?58:48),scene=makeScene(ending);return {branch:131,length,resume:240.45,scene,resumeScene(s){const text=scene(s,length-.001);s.scene={...s.scene,caption:text};s.branch={...s.branch,caption:{...s.branch?.caption,text}};return s;}};}
