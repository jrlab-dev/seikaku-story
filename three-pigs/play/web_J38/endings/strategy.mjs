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
  ['見張りの動きを調べよう。非常口も用意しておく。','警報と非常口。どちらも動くか確かめよう。'],
  ['蒸気は自分で操作しよう。仕組みを組み合わせるんだ。','火と配管、レバー。順番に確かめよう。'],
  ['入口を切り替えられるようにしよう。','扉と歯車をつないで、動くか試そう。']
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
function sceneFor(ending){
 return(s,q)=>{
  clean(s,q);
  const last=ending.duels.length-1,i=Math.min(last,Math.floor(q/48)),u=q-i*48,site=SITES[i],c=CENTERS[site],duel=ending.duels[i],win=duel.winner==='pig';
  const actor=id=>s.actors.find(a=>a.id===id);
  function put(id,x,z,motion='idle',pose=null){
   const a=actor(id);Object.assign(a,{visible:true,x:c[0]+x,z:c[2]+z,motion,motionTime:u});
   if(pose!=null)a.reactionPose=pose;return a;
  }
  const owner=put('pig_'+site,...OWNER,'idle',2),wolf=put('wolf',-.8,7);
  for(let j=0;j<i;j++)put('pig_'+SITES[j],...GUEST(j),'idle',j===0?2:6);
  const localPath=points=>points.map(([x,z])=>[c[0]+x,c[2]+z]);
  const walk=(a,points,start,duration)=>follow(a,localPath(points),(u-start)/duration);
  wolf.yaw=Math.PI;
  s.camera={id:'strategy_'+site,position:[c[0]+5.4,c[1]+3.6,c[2]+13.7],target:[c[0],c[1]+1.25,c[2]+4.2],fov:47,terrainRelative:false};
  s.strategy={site,phase:u,duel,gate:0,exit:0,scan:Math.sin(u*.9)*.65,decoy:0,steam:0,lever:0,gear:0,wedge:0,alarm:0,fire:0,checked:duel.prepared};
  const fx=s.strategy,code=ending.cast['pig_'+site];
  let cap='';
  if(i===0){
   if(u<6){wolf.motion=u<3?'blow':'idle';cap=u<3?'狼「まずは、ふうーっ！」':'息ではびくともしない。見張りも入口を守っています。';}
   else if(u<13){walk(wolf,[[-.8,7],[-2.7,7]],6,5);cap='狼は近づく場所を変え、見張りが戻る順番を確かめます。';}
   else if(u<20){put('wolf',-2.7,7,'idle',0).yaw=-Math.PI/2;cap='狼「どちらから近づいても、同じ順番で戻るんだね」';}
   else if(u<28){fx.decoy=clamp((u-20)/2);fx.scan=-1.1;walk(wolf,[[-2.7,7],[0,7]],22,5);cap='おとりへ見張りが向いた。その隙に、狼は反対側へ。';}
   else if(u<38){fx.decoy=1;fx.scan=win?0:-1.1;fx.alarm=1;fx.gate=win?0:clamp((u-28)/2);walk(wolf,win?[[0,7],[0,5.8]]:[[0,7],[0,5.65],[0,4.25],[-.65,3.8]],28,6);owner.reactionPose=+code[4]>=4?7:6;cap=win?'独立した見張りが入口を守り、おとり作戦を防ぎました！':'警報が鳴った！ 狼が前庭の入口を抜けてきました。';}
  }else if(i===1){
   fx.fire=u>=8?1:0;
   if(u<7){cap=+code[4]<=2?'次男「まず落ち着いて。何が効かなかった？」':'次男「来たんだね。何が起きたか教えて！」';wolf.visible=false;}
   else if(u<13){fx.lever=clamp((u-7)/2);fx.steam=clamp((u-9)/2);walk(owner,[OWNER,[1.7,4.5]],7,2);cap='次男が火をつけ、レバーを引く。配管から蒸気が噴き出します。';s.camera={id:'strategy_stove',position:[c[0]+.8,c[1]+2.25,c[2]+8.8],target:[c[0]+1.8,c[1]+.8,c[2]+4.2],fov:43,terrainRelative:false};}
   else if(u<20){fx.lever=1;fx.steam=1;walk(owner,[[1.7,4.5],OWNER],13,2);walk(wolf,[[-.8,7],[-.8,7.7]],13,3);cap='狼は蒸気へ飛び込まず、離れた場所で待ちます。';}
   else if(u<28){fx.lever=.8;fx.steam=.65;fx.decoy=1;walk(wolf,[[-.8,7.7],[-2,7.7],[1.2,7.7],[0,7.7]],20,8);cap='音とおとりで別の入口へ。次男は見極めながら操作します。';}
   else if(u<38){fx.lever=1;fx.steam=win?.9:Math.max(0,1-(u-28)/4);fx.gate=win?0:clamp((u-28)/2);walk(wolf,win?[[0,7.7],[0,5.8]]:[[0,7.7],[0,5.65],[0,4.25],[-.65,3.8]],31,6);cap=win?'予備の蒸気が間に合った。狼の進む隙を作りません！':'蒸気が弱まるまで待っていた狼が、前庭へ踏み込みます。';}
  }else{
   if(u<8){wolf.visible=false;cap='三男「二人の話を聞いて、仕掛けを組み直そう」';}
   else if(u<15){wolf.visible=false;fx.gear=(u-8)*1.3;fx.gate=.5+.4*Math.sin((u-8)*1.3);for(const a of s.actors)if(a.id.startsWith('pig_')&&a.visible)a.yaw=Math.atan2(c[0]-a.x,c[2]+4.95-a.z);cap=duel.prepared?'三匹で、扉が開いて閉じる動きを確かめます。':'三男「動きの確認は、あとで。まず扉を開け閉めしよう」';}
   else if(u<23){fx.gear=u*1.4;fx.gate=u<19?.85:0;put('wolf',-.8,5.6);cap=u<19?'狼が近づくと、扉が開いて閉じます。':'扉がぴたり。今度は、狼も一度は止められました。';}
   else if(u<31){fx.gear=u*.7;fx.gate=.2;walk(wolf,[[-.8,5.6],[-2,5.8]],23,2);if(u>=25)wolf.reactionPose=0;cap='狼「左右の扉は、この歯車で開いて閉じるんだね」';}
   else if(u<40){fx.wedge=win&&u>=35?1-clamp((u-35)/3):clamp((u-31)/4);fx.gear=win?u*.9:Math.min(u,35)*.7;fx.gate=win?0:.46;put('wolf',-2,5.8);cap=win&&u>=35?'予備の仕組みがくさびを押し出し、扉を閉めます！':u<35?'狼は動く歯車の下へ、くさびを差し込みます。':'歯車が止まった！ 扉は閉まり切らず、隙間が残りました。';}
   else if(u<48){fx.wedge=win?0:1;fx.gear=win?u*.9:35*.7;fx.gate=win?0:.46;walk(wolf,win?[[-2,5.8],[0,5.8],[0,7.5]]:[[-2,5.8],[0,5.8],[0,4.25],[-.65,3.8]],40,5);owner.reactionPose=+code[4]>=4?7:6;cap=win?'仕掛けが働き、狼は前庭へ進めません。':'三男が直そうとするより先に、狼が隙間を抜けました。';}
  }
  if(i===2&&u>=23&&u<40)wolf.yaw=Math.PI/2;
  if(i===2&&u>=23&&u<40)s.camera={id:'strategy_wedge_detail',position:[c[0]-4.7,c[1]+2.25,c[2]+9.2],target:[c[0]-.65,c[1]+.8,c[2]+5.1],fov:43,terrainRelative:false};
  if(i>0&&u<5){walk(owner,[[1.6,6.2],[0,5.7],[0,4.25],OWNER],0,4);fx.gate=u<=4?1:1-clamp(u-4);}
  s.houses[site].doorOpen=fx.gate;s.houses[site].door=fx.gate>.1?'open':'closed';
  const finishAt=i===2?48:38;
  if(u>=finishAt){
   const r=u-finishAt;
   if(win){
    fx.gate=clamp(r-4);wolf.x=c[0];wolf.z=c[2]+(i===2?7.5:5.8)+r*.65;wolf.yaw=0;wolf.motion='walk';wolf.walkDistance=r*.65;wolf.visible=r<7;
    owner.reactionPose=3;
    if(r>=5)for(let j=0;j<=i;j++){
     const a=actor('pig_'+SITES[j]),start=j===i?OWNER:GUEST(j),delay=5+j*.7,progress=(r-delay)/2;
     follow(a,localPath([start,[start[0],4.25],[0,4.45],[0,5.9],[-.9+j*1.2,6.3]]),progress);
     if(progress>=1){a.reactionPose=3;a.yaw=0;}
    }
    if(r>=4){const reveal=clamp(r-4);s.camera={id:'strategy_defended_'+site,position:[c[0]+lerp(5.4,2.5,reveal),c[1]+lerp(3.6,2.6,reveal),c[2]+lerp(13.7,11.8,reveal)],target:[c[0]+lerp(0,.35,reveal),c[1]+lerp(1.25,.9,reveal),c[2]+lerp(4.2,6.3,reveal)],fov:lerp(47,43,reveal),terrainRelative:false};}
    cap=duel.attack===duel.defence?'同じ力でも、先に確認した備えが守り切りました。':'用意した対策が攻略を上回り、狼は引き上げました。';
   }else if(i===2){
    fx.wedge=1;fx.gate=1;fx.gear=35*.7;
    follow(wolf,localPath([[-.65,3.8],[0,4.25],[0,5.9],[-1.35,6.4]]),r/2.5);if(r>=2.5){wolf.reactionPose=0;wolf.yaw=Math.PI/2;}
    for(let j=0;j<3;j++){const a=actor('pig_'+SITES[j]),start=j===2?OWNER:GUEST(j),delay=(j+1)*1.1;follow(a,localPath([start,[0,4.25],[0,5.9],[.1+j*1.05,6.2]]),(r-delay)/2.5);if(r>=delay+2.5){a.reactionPose=j===1?6:7;a.yaw=-Math.PI/2;}}
    s.camera={id:'strategy_finale',position:[c[0]+2.5,c[1]+2.6,c[2]+11.8],target:[c[0]+.35,c[1]+.9,c[2]+6.2],fov:43,terrainRelative:false};
    cap=r<5?'三匹「……まいった。僕たちの負けだ」':'三つの対策を観察して突破。今回は、狼の勝ちです。';
   }else{
    fx.gate=1;fx.exit=clamp(r/.7);fx.alarm=i===0?1:0;
    const nextSite=SITES[i+1],next=CENTERS[nextSite],p=clamp(r/9.5);
    fx.arrival={site:nextSite,gate:1};
    wolf.visible=false;
    for(let j=0;j<=i;j++){
     const a=actor('pig_'+SITES[j]),delay=(i===0?.6:0)+j*.35,v=clamp((r-delay)/(9.5-delay));
     follow(a,transferRoute(site,nextSite,j),v,'paper_run');
     Object.assign(a,{visible:true,motionTime:r,shelterRunner:v>0&&v<1});
     delete a.worldY;delete a.reactionPose;
    }
    const target=actor('pig_straw'),host=actor('pig_'+SITES[i+1]);
    if(p>.65)Object.assign(host,{visible:true,x:next[0]+1.6,z:next[2]+6.2,motion:'idle',reactionPose:6});
    s.houses[nextSite].doorOpen=1;
    const arrival=clamp((p-.7)/.3);
    const leftSide=i===0?clamp((p-.14)/.12)*(1-clamp((p-.55)/.15)):0;
    const behindFirst=i===1?clamp((target.x+10)/3)*(1-clamp((target.x-7)/3)):0;
    const offsetX=lerp(lerp(2.5,-3.5,leftSide),4.5,behindFirst),offsetZ=lerp(5.2,1,behindFirst);
    s.camera={id:'strategy_transfer_'+site,position:[target.x+lerp(offsetX,4.5,arrival),1.7,target.z+lerp(offsetZ,9.4,arrival)],target:[target.x,.8,target.z],groundFocus:[target.x,target.z],fov:lerp(44,49,arrival),terrainRelative:false};
    cap=r<1?(i===0?'長男が非常口を開けます。':'次男「ここは退こう。三男の家へ！」'):p>.7?LABEL[i+1]+'「こっちへ！ 前庭へ急いで！」':i===0?'用意していた非常口から、次男の家へ！':'二匹は三男の家へ走ります。';
   }
  }
  if(u<.35&&i>0)s.cutOpacity=.7*(1-u/.35);
  if(u>47.6&&i<last)s.cutOpacity=.7*clamp((u-47.6)/.4);
  s.houses[site].doorOpen=fx.gate;
  s.camera.fitAspect=['strategy_wedge_detail','strategy_stove'].includes(s.camera.id)||s.camera.id.startsWith('strategy_transfer')?1.05:1.35;
  return cap;
 };
}
export function strategyPlan(ending){
 const length=(ending.duels.length-1)*48+(ending.duels.length===3?58:48),scene=sceneFor(ending);
 return{branch:131,length,resume:240.45,scene,resumeScene(s){const text=scene(s,length-.001);caption(s,text);return s;}};
}
