import {CENTERS} from './strategy.mjs';
export const HOUSE_DOOR_X=-.65;
const SITES=['straw','wood','brick'],LABEL=['長男','次男','三男'];
const clamp=x=>Math.max(0,Math.min(1,x)),lerp=(a,b,u)=>a+(b-a)*u;
const local=(site,ps)=>ps.map(([x,z])=>[CENTERS[site][0]+x,CENTERS[site][2]+z]);
export function followHousePath(a,ps,v,motion='walk'){
 const ds=ps.slice(1).map((p,i)=>Math.hypot(p[0]-ps[i][0],p[1]-ps[i][1]));
 const distance=ds.reduce((a,b)=>a+b,0)*clamp(v);let left=distance,j=0;
 while(j<ds.length-1&&left>ds[j])left-=ds[j++];
 const p=ps[j],b=ps[j+1],u=ds[j]?left/ds[j]:0;
 Object.assign(a,{x:lerp(p[0],b[0],u),z:lerp(p[1],b[1],u),yaw:Math.atan2(b[0]-p[0],b[1]-p[1]),walkDistance:distance,motion:v>0&&v<1?motion:'idle'});
 if(a.motion!=='idle')delete a.reactionPose;
}
export function houseCamera(site,inside=false){const c=CENTERS[site];return {id:'house_'+site+(inside?'_inside':'_outside'),position:[c[0]+(inside?0:-6.5),c[1]+(inside?2.4:3.2),c[2]+(inside?-7.2:10)],target:[c[0]-.2,c[1]+1.05,c[2]+(inside?.1:1)],fov:48,fitAspect:1.35,terrainRelative:false};}
export function roomPig(s,site,j){const c=CENTERS[site],a=s.actors.find(a=>a.id==='pig_'+SITES[j]);Object.assign(a,{visible:true,x:c[0]+[-1.25,0,1.15][j],z:c[2]-.1,worldY:c[1]+.34,yOffset:0,motion:'idle',reactionPose:2});return a;}
export function raidEscapeRoute(site,next,j){
 const c=CENTERS[site],n=next?CENTERS[next]:null;
 const ps=local(site,[[[-1.25,0,1.15][j],-.1],[HOUSE_DOOR_X,-.8],[HOUSE_DOOR_X,-3.7]]);
 if(!next)return [...ps,[c[0]+4.3,c[2]-4],[c[0]+11,c[2]-6-j*.7]];
 const side=site==='straw'?-4.3:4.3;
 return [...ps,[c[0]+side,c[2]-3.7],[c[0]+side,-7],[n[0]+HOUSE_DOOR_X,-7],[n[0]+HOUSE_DOOR_X,n[2]+4],[n[0]+HOUSE_DOOR_X,n[2]+.7],[n[0]+[-1.25,0,1.15][j],n[2]-.1]];
}
function clean(s,q){
 for(const a of s.actors){for(const k of ['worldY','strategyWorldY','strategyLift','reactionPose','reactionBuild','stance','ownerDoor','encounterReaction','encounterClose','shelterRunner','runAway','bombPose','bonkPose','singleHotJump','tailFlame','puzzleEntry','buildFacingAz','buildMirror'])delete a[k];Object.assign(a,{visible:false,motion:'idle',motionTime:q,yOffset:0,yaw:0,walkDistance:0});}
 for(const h of Object.values(s.houses))Object.assign(h,{intact:true,constructionStage:5,time:0,door:'closed',doorOpen:0,deform:0,blowAway:false,security:null,doorSwing:'inward'});
 for(const k of ['gustOverride','battle','intro','drama','escape','fireScene','tailFlame','chimneyImpact','resultCard','completion','comic','shelter','egress','encounter','personalityWindow','fullImage','puzzleEffect','strategyConstruction','strategyPrelude'])s[k]=null;
 s.effects=[];s.cutOpacity=0;s.animationTime=131+q;s.effectTime=131+q;
}
function makeScene(ending){return(s,q)=>{
 clean(s,q);
 const last=ending.duels.length-1,i=Math.min(last,Math.floor(q/48)),u=q-i*48,site=SITES[i],c=CENTERS[site],duel=ending.duels[i],win=duel.winner==='pig';
 const actor=id=>s.actors.find(a=>a.id===id),wolf=actor('wolf');
 for(let j=0;j<i;j++)s.houses[SITES[j]].doorOpen=1;
 for(let j=0;j<=i;j++)roomPig(s,site,j);
 Object.assign(wolf,{visible:true,x:c[0]-.65,z:c[2]+6,yaw:Math.PI});
 const fx=s.strategy={revision:3,site,phase:u,duel,inside:false,checked:duel.prepared,tool:0,cartZ:5.6,press:0,breach:0,brace:win?1:0,steam:0,fire:0,rearOpen:0,shake:0,arrival:null};
 const interior=()=>{fx.inside=true;wolf.visible=false;s.camera=houseCamera(site,true);};
 const outside=()=>{fx.inside=false;wolf.visible=true;s.camera=houseCamera(site,false);};
 outside();let cap='';
 if(u<6){interior();s.houses[site].doorOpen=i>0?1-clamp(u/1.2):0;cap=i===0?'家の中。長男は玄関の戸に支えを掛け、戸締まりを確かめます。':i===1?'次男の家の中。長男を迎え入れ、玄関の戸を閉めました。':'三男の家の中。兄二匹を迎え、三匹で戸を補強します。';}
 else if(u<10){wolf.motion='blow';fx.shake=Math.sin(u*18)*.015;cap='狼が家へ息を吹きつける。でも、壁も屋根もびくともしません。';}
 else if(u<16){interior();fx.fire=i>0?clamp((u-11)/1.2):0;fx.steam=i>0&&u>13?1:0;const owner=actor('pig_'+site);owner.x=c[0]+.55;owner.z=c[2]-.65;owner.reactionPose=6;cap=i===0?'長男「戸は内側から支えてある。ここで家を守ろう」':i===1?'次男が室内の釜に火をつける。家の左右の配管へ蒸気を送ります。':'三匹は室内で二重の支えを確認。三男が釜へ火をつけます。';}
 else if(u<22){fx.fire=i>0?1:0;fx.steam=i>0?1:0;fx.tool=i>0?2:1;fx.cartZ=lerp(5.6,3.35,clamp((u-18)/4));wolf.x=c[0]-1.7;wolf.z=c[2]+fx.cartZ+.3;wolf.motion='walk';wolf.walkDistance=u*.6;cap=i===0?'狼は持参した押し具を、家の玄関へ運びます。':i===1?'家から蒸気が噴き出す。狼は板の覆いで身を守り、玄関へ。':'狼は覆いを支えながら家へ接近。玄関の継ぎ目に押し具を掛けます。';}
 else{fx.fire=i>0?1:0;fx.steam=i>0?1:0;fx.tool=i>0?2:1;fx.cartZ=3.35;fx.press=clamp((u-22)/2);fx.shake=.02*Math.sin(u*20);wolf.x=c[0]-1.7;wolf.z=c[2]+3.65;cap='狼が家の戸へ押し具を掛ける。壁は耐えても、戸の支えがきしみます。';}
 const danger=i===2?38:26,breakAt=danger+4;
 if(u>=24&&u<danger){interior();cap=i===2?'家の中で三匹が補強を見守ります。二重の支えは耐えられるでしょうか。':'家の中。戸の支えが押されている――裏口へ逃げる準備をします。';}
 if(u>=danger){
  if(win){fx.breach=0;fx.shake=0;
   if(u<(i===2?48:38)){interior();cap='家の戸と内側の補強が耐えました。狼は中へ入れません！';}
   else{const r=u-(i===2?48:38);outside();fx.tool=0;fx.press=0;fx.fire=0;fx.steam=0;wolf.x=c[0]-1.7;wolf.z=c[2]+3.65+clamp(r/4)*7;wolf.motion='walk';wolf.walkDistance=r*1.75;wolf.visible=r<4;s.houses[site].doorOpen=clamp((r-4)/.5);
    for(let j=0;j<=i;j++){const a=actor('pig_'+SITES[j]),v=clamp((r-5-j*.3)/2);followHousePath(a,local(site,[[[-1.25,0,1.15][j],-.1],[HOUSE_DOOR_X,.8],[HOUSE_DOOR_X,3.8],[-1+j*1.1,4.5]]),v);a.worldY=c[1]+.34*(1-clamp((a.z-c[2]-2.4)/1.2));if(v===1)a.reactionPose=3;}
    cap='狼が去ってから玄関を開けます。自分たちの家を守り切りました。';}
  }else{fx.breach=clamp((u-breakAt)/2);s.houses[site].doorOpen=fx.breach;fx.rearOpen=clamp((u-danger)/.45);
   const next=i<2?SITES[i+1]:null,duration=i<2?47.7-danger:9.7;
   for(let j=0;j<=i;j++){const a=actor('pig_'+SITES[j]),delay=.6+j*.28,v=clamp((u-danger-delay)/(duration-delay));followHousePath(a,raidEscapeRoute(site,next,j),v,'paper_run');a.shelterRunner=v>0&&v<1;const inSource=Math.abs(a.x-c[0])<2&&a.z>c[2]-2.7,n=next?CENTERS[next]:null,inNext=n&&Math.abs(a.x-n[0])<2&&a.z<n[2]+3.3;if(inSource)a.worldY=c[1]+.34;else if(inNext)a.worldY=n[1]+.34;else delete a.worldY;}
   if(u<danger+2){interior();cap='戸の支えが外れかけた！ 狼が入る前に、裏口から逃げよう！';}
   else if(u<breakAt+2){wolf.visible=false;s.camera={id:'house_rear_'+site,position:[c[0]-5,c[1]+2.6,c[2]-8],target:[c[0]-.65,c[1]+1,c[2]-2.3],fov:48,fitAspect:1.35,terrainRelative:false};cap=u<breakAt?'家の裏口を開け、子ブタは外へ。玄関はまだ閉じています。':'玄関が押し開かれ始めました。子ブタは裏口から逃げ続けます。';}
   else if(u<breakAt+5){outside();fx.tool=0;fx.press=0;followHousePath(wolf,local(site,[[-1.7,3.65],[HOUSE_DOOR_X,3.5],[HOUSE_DOOR_X,.65]]),(u-breakAt-2)/2.8);wolf.worldY=c[1]+.34*clamp((3.5-(wolf.z-c[2]))/1.1);cap='家の玄関が破られた！ 狼が戸口を通って中へ入ります。';}
   else{wolf.visible=false;fx.tool=0;fx.press=0;const a=actor('pig_straw');s.camera={id:'strategy_transfer_'+site,position:[a.x+2.7,1.8,a.z+6],target:[a.x,.8,a.z],groundFocus:[a.x,a.z],fov:48,fitAspect:1.35,terrainRelative:false};cap=next?LABEL[i+1]+'の家へ！ 開けてもらった玄関から、中へ逃げ込みます。':'三匹は家の裏から、ぐるぐる脚で一目散に逃げ出しました――';}
   if(next){fx.arrival={site:next,doorOpen:1};s.houses[next].doorOpen=1;const n=CENTERS[next],host=roomPig(s,next,i+1);host.z=n[2]+.5;const a=actor('pig_straw');if(Math.abs(a.x-n[0])<2&&a.z<n[2]+5){s.camera=houseCamera(next);s.camera.id='house_arrival_'+next;}}
  }
 }
 if(i===2&&!win&&u>=48){for(const a of s.actors)a.visible=false;fx.inside=false;s.fullImage={key:u<53?'dinner_a':'dinner_b'};cap=u<53?'その夜、おおかみの家では――':'おおかみ「ごちそうさまでした。」';}
 if(u<.3&&i>0)s.cutOpacity=.7*(1-u/.3);return cap;
};}
export function raidPlan(ending){const length=(ending.duels.length-1)*48+(ending.duels.length===3?58:48),scene=makeScene(ending);return {branch:131,length,resume:240.45,scene,resumeScene(s){const text=scene(s,length-.001);s.scene={...s.scene,caption:text};s.branch={...s.branch,caption:{...s.branch?.caption,text}};return s;}};}
