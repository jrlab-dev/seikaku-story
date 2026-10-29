export const CENTERS={straw:[2.1,0,-2.25],wood:[-20,-.14,-15],brick:[20,1.06,-14]};
const SITES=['straw','wood','brick'],LABEL=['長男','次男','三男'];
const clamp=x=>Math.max(0,Math.min(1,x)),lerp=(a,b,u)=>a+(b-a)*u;
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
  const owner=put('pig_'+site,1.65,3.5,'idle',2),wolf=put('wolf',-.8,7);
  for(let j=0;j<i;j++)put('pig_'+SITES[j],-.9+j*1.05,3.2,'idle',j===0?2:6);
  wolf.yaw=Math.PI;
  s.camera={id:'strategy_'+site,position:[c[0]+5.4,c[1]+3.6,c[2]+13.7],target:[c[0],c[1]+1.25,c[2]+4.2],fov:47,terrainRelative:false};
  s.strategy={site,phase:u,duel,gate:0,exit:0,scan:Math.sin(u*.9)*.65,decoy:0,steam:0,lever:0,gear:0,wedge:0,alarm:0,fire:0,checked:duel.prepared};
  const fx=s.strategy,code=ending.cast['pig_'+site];
  let cap='';
  if(i===0){
   if(u<6){wolf.motion=u<3?'blow':'idle';cap=u<3?'狼「まずは、ふうーっ！」':'息ではびくともしない。見張りも入口を守っています。';}
   else if(u<13){wolf.x=c[0]+lerp(-.8,-2.7,clamp((u-6)/5));wolf.motion=u<11?'walk':'idle';wolf.walkDistance=Math.abs(wolf.x-c[0]+.8);wolf.yaw=-Math.PI/2;cap='狼は近づく場所を変え、見張りが戻る順番を確かめます。';}
   else if(u<20){wolf.reactionPose=0;cap='狼「どちらから近づいても、同じ順番で戻るんだね」';}
   else if(u<28){fx.decoy=clamp((u-20)/2);fx.scan=-1.1;wolf.x=c[0]+lerp(-2.7,.1,clamp((u-22)/5));wolf.motion=u>=22?'walk':'idle';wolf.walkDistance=2.8*clamp((u-22)/5);cap='おとりへ見張りが向いた。その隙に、狼は反対側へ。';}
   else if(u<38){fx.decoy=1;fx.scan=win?0:-1.1;fx.alarm=1;fx.gate=win?0:clamp((u-28)/2);wolf.z=c[2]+lerp(7,win?5.3:2.9,clamp((u-28)/6));wolf.motion=u<34?'walk':'idle';wolf.walkDistance=4.1*clamp((u-28)/6);owner.reactionPose=+code[4]>=4?7:6;cap=win?'独立した見張りが入口を守り、おとり作戦を防ぎました！':'警報が鳴った！ 狼が入口を抜けてきました。';}
  }else if(i===1){
   fx.fire=u>=8?1:0;
   if(u<7){cap=+code[4]<=2?'次男「まず落ち着いて。何が効かなかった？」':'次男「来たんだね。何が起きたか教えて！」';wolf.visible=false;}
   else if(u<13){fx.lever=clamp((u-7)/2);fx.steam=clamp((u-9)/2);owner.x=c[0]+1.7;owner.z=c[2]+4.5;cap='次男が火をつけ、レバーを引く。配管から蒸気が噴き出します。';s.camera={id:'strategy_stove',position:[c[0]+.8,c[1]+2.25,c[2]+8.8],target:[c[0]+1.8,c[1]+.8,c[2]+4.2],fov:43,terrainRelative:false};}
   else if(u<20){fx.lever=1;fx.steam=1;wolf.z=c[2]+lerp(5.8,7.7,clamp((u-13)/3));wolf.motion=u<16?'walk':'idle';wolf.yaw=0;wolf.walkDistance=1.9*clamp((u-13)/3);cap='狼は蒸気へ飛び込まず、離れた場所で待ちます。';}
   else if(u<28){fx.lever=.8;fx.steam=.65;fx.decoy=1;wolf.x=c[0]+Math.sin((u-20)*.65)*2;cap='音とおとりで別の入口へ。次男は見極めながら操作します。';}
   else if(u<38){fx.lever=1;fx.steam=win?.9:Math.max(0,1-(u-28)/4);wolf.z=c[2]+lerp(7,win?5.7:2.9,clamp((u-31)/6));wolf.motion=u>31?'walk':'idle';wolf.walkDistance=4.1*clamp((u-31)/6);cap=win?'予備の蒸気が間に合った。狼の進む隙を作りません！':'蒸気が弱まるまで待っていた狼が、入口へ踏み込みます。';}
  }else{
   if(u<8){wolf.visible=false;cap='三男「二人の話を聞いて、仕掛けを組み直そう」';}
   else if(u<15){wolf.visible=false;fx.gear=(u-8)*1.3;fx.gate=.5+.4*Math.sin((u-8)*1.3);cap=duel.prepared?'長男が弱点を点検し、次男が操作。三男が扉を調整します。':'三男「動きの確認は、あとで。まず扉を切り替えよう」';}
   else if(u<23){fx.gear=u*1.4;fx.gate=u<19?.85:0;wolf.z=c[2]+5.6;cap=u<19?'狼が近づくと、入口が切り替わります。':'扉がぴたり。今度は、狼も一度は止められました。';}
   else if(u<31){fx.gear=u*.7;fx.gate=.2;wolf.x=c[0]-2;wolf.z=c[2]+5.5;wolf.reactionPose=0;cap='狼「どちらの扉も、この歯車で動いているんだね」';}
   else if(u<40){fx.wedge=win&&u>=35?1-clamp((u-35)/3):clamp((u-31)/4);fx.gear=win?u*.9:Math.min(u,35)*.7;fx.gate=win?0:.46;wolf.x=c[0]-2;wolf.z=c[2]+5.5;cap=win&&u>=35?'予備の仕組みがくさびを押し出し、扉を閉めます！':u<35?'狼は動く歯車の下へ、くさびを差し込みます。':'歯車が止まった！ 扉は閉まり切らず、隙間が残りました。';}
   else if(u<48){fx.wedge=win?0:1;fx.gear=win?u*.9:35*.7;fx.gate=win?0:.46;const v=clamp((u-40)/5);wolf.x=c[0]+lerp(-2,0,clamp(v/.4));wolf.z=c[2]+lerp(5.5,win?7.5:2.8,clamp((v-.4)/.6));wolf.motion=u<45?'walk':'idle';wolf.walkDistance=3.4*v;wolf.yaw=win?0:Math.PI;owner.reactionPose=+code[4]>=4?7:6;cap=win?'仕掛けが働き、狼は中へ進めません。':'三男が直そうとするより先に、狼が隙間を抜けました。';}
  }
  if(i===2&&u>=23&&u<40)wolf.yaw=Math.PI/2;
  if(i===2&&u>=23&&u<40)s.camera={id:'strategy_wedge_detail',position:[c[0]-4.7,c[1]+2.25,c[2]+9.2],target:[c[0]-.65,c[1]+.8,c[2]+5.1],fov:43,terrainRelative:false};
  s.houses[site].doorOpen=fx.gate;s.houses[site].door=fx.gate>.1?'open':'closed';
  const finishAt=i===2?48:38;
  if(u>=finishAt){
   const r=u-finishAt;
   if(win){
    fx.gate=0;wolf.z=c[2]+7+r*.65;wolf.yaw=0;wolf.motion='walk';wolf.walkDistance=r*.65;wolf.visible=r<7;
    owner.reactionPose=3;
    cap=duel.attack===duel.defence?'同じ力でも、先に確認した備えが守り切りました。':'用意した対策が攻略を上回り、狼は引き上げました。';
   }else if(i===2){
    fx.wedge=1;fx.gate=1;fx.gear=35*.7;
    put('wolf',-1.35,6.4,'idle',0).yaw=Math.PI/2;
    for(let j=0;j<3;j++){const a=put('pig_'+SITES[j],.1+j*1.05,6.2,'idle',j===1?6:7);a.yaw=-Math.PI/2;}
    s.camera={id:'strategy_finale',position:[c[0]+2.5,c[1]+2.6,c[2]+11.8],target:[c[0]+.35,c[1]+.9,c[2]+6.2],fov:43,terrainRelative:false};
    s.cutOpacity=.5*(1-clamp(r/.3));
    cap=r<5?'三匹「……まいった。僕たちの負けだ」':'三つの対策を観察して突破。今回は、狼の勝ちです。';
   }else{
    fx.gate=1;fx.exit=clamp(r/.7);fx.alarm=i===0?1:0;
    const next=CENTERS[SITES[i+1]],p=clamp((r-1)/8);
    const a0=[c[0]+3.3,c[2]+3.7],b=[next[0]-.1,next[2]+4.4];
    wolf.visible=false;
    for(let j=0;j<=i;j++){
     const a=actor('pig_'+SITES[j]),v=clamp(p-j*.045);
     Object.assign(a,{visible:true,x:r<1?lerp(1.65+c[0],a0[0],r):lerp(a0[0],b[0],v),z:lerp(a0[1],b[1],v),motion:r<1?'walk':'paper_run',motionTime:r,walkDistance:Math.hypot(b[0]-a0[0],b[1]-a0[1])*v,yaw:Math.atan2(b[0]-a0[0],b[1]-a0[1]),shelterRunner:r>=1});
     delete a.worldY;delete a.reactionPose;
    }
    const target=actor('pig_straw'),host=actor('pig_'+SITES[i+1]);
    if(p>.7)Object.assign(host,{visible:true,x:next[0]+1.2,z:next[2]+3.4,motion:'idle',reactionPose:6});
    s.houses[SITES[i+1]].doorOpen=p>.65?1:0;
    const arrival=clamp((p-.7)/.3);
    s.camera={id:'strategy_transfer_'+site,position:[target.x+lerp(2.5,4.5,arrival),lerp(c[1],next[1],p)+lerp(2,3.2,arrival),target.z+lerp(5.2,9.4,arrival)],target:[target.x,lerp(c[1],next[1],p)+.85,target.z],fov:lerp(44,49,arrival),terrainRelative:false};
    cap=r<1?(i===0?'長男が非常口を開けます。':'次男「ここは退こう。三男の家へ！」'):p>.7?LABEL[i+1]+'「こっちへ！ 早く入って！」':i===0?'用意していた非常口から、次男の家へ！':'二匹は三男の家へ走ります。';
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
