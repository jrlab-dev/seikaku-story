import * as BASE from './completed_story.mjs';
import {branchId} from './branch_context.mjs';
import {HOUSE_CENTERS,BUILD_VIEW} from './construction_camera.mjs';
export {configureStoryBindings,storyBindings,DOORS,routeBetween,routePose,branchEvidence} from './completed_story.mjs';
export const REPLACEMENTS=[
 {kind:'intro',from:0,to:10,duration:24},
 {kind:'approach',house:'straw',from:14,to:14,duration:3},
 {kind:'approach',house:'wood',from:32.5,to:32.5,duration:3},
 {kind:'approach',house:'brick',from:51,to:51,duration:3},
 {kind:'wood_battle',from:98.5,to:100.8,duration:11.8},
 {kind:'brick_battle',from:119.5,to:134.3,duration:22},
 {kind:'wolf_retreat',from:144.5,to:151.5,duration:9}
];
export const SEGMENTS=[];let cursor=0,at=0;
for(const r of REPLACEMENTS){if(r.from>cursor){SEGMENTS.push({kind:'base',from:cursor,to:r.from,start:at,end:at+r.from-cursor});at+=r.from-cursor;}SEGMENTS.push({...r,start:at,end:at+r.duration});at+=r.duration;cursor=r.to;}
SEGMENTS.push({kind:'base',from:cursor,to:160.5,start:at,end:at+160.5-cursor});
const TOTAL=Math.round(SEGMENTS.at(-1).end*1e6)/1e6;
export let STORY_DURATION=TOTAL,SCENES=[];
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);},mix=(a,b,u)=>a+(b-a)*u;
export function newTime(old){const s=SEGMENTS.find(s=>s.kind==='base'&&old>=s.from&&old<s.to)||SEGMENTS.find(s=>s.kind!=='base'&&old>=s.from&&old<s.to);return s?s.start+(s.kind==='base'?old-s.from:(old-s.from)/(s.to-s.from)*(s.end-s.start)):TOTAL;}
export function selectBranch(id){BASE.selectBranch(id);STORY_DURATION=id==='peace'?88:TOTAL;SCENES=id==='peace'?BASE.SCENES:[...BASE.SCENES.map(s=>({...s,at:newTime(s.at)})),...SEGMENTS.filter(s=>s.kind!=='base').map(s=>({id:s.kind+(s.house||''),at:s.start,title:{intro:'四人の性格を紹介',approach:'家へ寄って建築開始',wood_battle:'木の家へ二度の風',brick_battle:'三度の風にも動かない',wolf_retreat:'しっぽの火にびっくり'}[s.kind]}))].sort((a,b)=>a.at-b.at);return{id,duration:STORY_DURATION};}
const INTRO=[
 {id:'pig_straw',label:'長男',source:.8,text:'長男は、ひらめいたらすぐ挑戦。できたら次の楽しみへ！'},
 {id:'pig_wood',label:'次男',source:3.5,text:'次男は、慣れた手順でこつこつ。困った相手には「おいで！」'},
 {id:'pig_brick',label:'三男',source:6,text:'三男は、心配だからもう一度確認。納得するまで丁寧に。'},
 {id:'wolf',label:'おおかみ',source:8.5,text:'おおかみは、力で押し通したい。だめなら別の手を急いで試す。'}
];
function setCaption(s,text){s.scene.caption=text;s.branch.caption={...s.branch.caption,text,kind:'story_dialogue',sourceEventIndices:[],causalIds:[]};}
function wide(house){const c=HOUSE_CENTERS[house];return{id:'J79_'+house+'_breath_count',position:[c[0]-10,c[1]+3.8,c[2]+9],target:[c[0],c[1]+2.1,c[2]+1],fov:48,terrainRelative:false};}
function gust(house,start,now){const g={house,inhale:start,exhale:start+1.1,emission:start+1.35,impact:start+2.3,end:start+3.8,wind:house==='wood'?[-.5575561835,0,-.8301392065]:[0,0,-1],wallZ:house==='wood'?-12.85:-11.85};if(now<g.inhale||now>=g.end)return null;return{...g,phase:now<g.exhale?'inhale':now<g.emission?'release':now<g.impact?'travel':'impact',front:clamp((now-g.emission)/(g.impact-g.emission)),age:now-g.impact};}
export function sampleStory(seconds){
 if(branchId()==='peace')return BASE.sampleStory(seconds);
 const t=clamp(Number.isFinite(seconds)?seconds:0,0,TOTAL),seg=SEGMENTS.find(s=>t>=s.start&&t<s.end)||SEGMENTS.at(-1),q=t-seg.start;
 let source=seg.kind==='base'?seg.from+q:seg.from;
 if(seg.kind==='intro')source=INTRO[Math.min(3,Math.floor(q/6))].source;
 if(seg.kind==='wolf_retreat')source=q<6?144.5+Math.min(6.15,q/6*6.15):150.65;
 source=Math.round(source*1e9)/1e9;
 let s=BASE.sampleStory(source);s.time=t;s.duration=TOTAL;s.ended=t>=TOTAL;s.scene={...s.scene,at:newTime(s.scene.at)};s.revision={kind:seg.kind,baseTime:source,elapsed:q};s.comic=null;s.tailFlame=null;
 if(seg.kind==='intro'){
  const n=Math.min(3,Math.floor(q/6)),a=INTRO[n],actor=s.actors.find(x=>x.id===a.id),local=q-n*6;
  for(const x of s.actors)x.visible=x===actor;s.intro=null;s.drama=null;s.scene={id:'intro_'+a.id,at:seg.start+n*6,title:a.label+'の紹介',caption:a.text};setCaption(s,a.text);
  actor.yaw=.25*Math.sin(local*1.4);s.camera={id:'J79_intro_'+a.id,position:[actor.x+2.5,1.35,actor.z+4.6],target:[actor.x,.85,actor.z],fov:42,terrainRelative:true};
  s.narration={actor:a.id,readSeconds:6,charCount:[...a.text].length};
 } else if(seg.kind==='approach'){
  const c=HOUSE_CENTERS[seg.house],u=smooth(q/3),a=s.actors.find(a=>a.id==='pig_'+seg.house);
  s.camera={id:'J79_build_approach_'+seg.house,position:[c[0],c[1]+mix(4.5,BUILD_VIEW.height,u),c[2]+mix(15,BUILD_VIEW.radius,u)],target:[c[0],c[1]+mix(1.9,BUILD_VIEW.targetHeight,u),c[2]],fov:48,terrainRelative:false};
  s.build=null;s.completion=null;s.effects=[];s.drama=null;s.intro=null;
  for(const x of s.actors)x.visible=x===a;Object.assign(a,{x:c[0],z:c[2]+3.9,yOffset:0,yaw:0,motion:'idle'});delete a.worldY;delete a.buildMirror;
  s.houses[seg.house].constructionStage=0;setCaption(s,{straw:'長男「さあ、さっさと作ろう！」',wood:'次男「順番に、木を組んでいこう。」',brick:'三男「位置を確かめて、一つずつ。」'}[seg.house]);
  s.approach={house:seg.house,u,radius:mix(15,BUILD_VIEW.radius,u)};
 } else if(seg.kind==='wood_battle'){
  const wolf=s.actors.find(a=>a.id==='wolf'),second=q>=8.3,round=second?2:1,start=seg.start+(second?8.3:0),g=gust('wood',start,t);
  for(const a of s.actors)a.visible=a===wolf;Object.assign(wolf,{x:-18.4,z:-9.5,yaw:Math.atan2(-.5575561835,-.8301392065),motion:g&&t>=g.exhale?'blow':'idle',motionTime:q});
  s.camera=wide('wood');s.effects=[];s.intro=null;s.drama=null;s.escape=null;
  const amount=q<2.3?0:q<3.1?.065*smooth((q-2.3)/.8):q<10.6?.065:.065+.095*smooth((q-10.6)/1.2);
  Object.assign(s.houses.wood,{intact:true,time:0,blowAway:false,constructionStage:5,deform:amount});s.effectTime=t;s.gustOverride=g;s.battle={house:'wood',round,phase:g?.phase??'rest',deform:amount};
  setCaption(s,q<2.3?'狼「ふうーっ！」':q<5.3?'木の家は、ぐにゃり。でも、まだ立っています。':q<8.3?'狼「もう少し強く吹くか。」':q<10.6?'狼「ふううーっ！」':'ぐぐっ……！');
  s.comic=g&&t>=g.emission?{text:round===1?'フーッ！':'ブオーッ！',kind:'breath',side:'left',phase:(t-g.emission)}:null;
 } else if(seg.kind==='brick_battle'){
  const wolf=s.actors.find(a=>a.id==='wolf');for(const a of s.actors)a.visible=a===wolf;
  const round=Math.min(3,Math.floor(q/5)+1),start=seg.start+(round-1)*5,g=q<15?gust('brick',start,t):null;
  Object.assign(wolf,{x:19.35,z:-8.2,yaw:Math.PI,motion:q>=15&&q<18?'tired':q>=18&&q<22?'idea':g&&t>=g.exhale?'blow':'idle',motionTime:q});s.camera=q>=15?{id:'J79_tired_and_idea',position:[15.5,2.36,-9.6],target:[19.35,1.91,-8.2],fov:44,terrainRelative:false}:wide('brick');s.effects=[];s.intro=null;s.drama=null;s.escape=null;
  s.effectTime=t;s.gustOverride=g;s.battle={house:'brick',round:q<15?round:3,phase:q>=15?'rest':g?.phase??'rest',deform:0};Object.assign(s.houses.brick,{intact:true,time:0,constructionStage:5});
  const local=q%5;
  setCaption(s,q<15?(local<3.8?['一度目。狼「ふうーっ！」','二度目。狼「もっと強く、ふうーっ！」','三度目。狼「ふううーっ！」'][round-1]:'びくともしない！'):q<18?'狼「はあ、はあ……。なんて丈夫な家だ。」':'狼「どうしよう……そうだ、煙突から入ろう！」');
  s.comic=g&&t>=g.emission?{text:'フーッ！',kind:'breath',side:'left',phase:t-g.emission}:q>=15&&q<18?{text:'はあ… はあ…',kind:'tired',side:'left',phase:q-15}:null;
 } else if(seg.kind==='wolf_retreat'){
  const wolf=s.actors.find(a=>a.id==='wolf');for(const a of s.actors)a.visible=a===wolf;
  wolf.visible=true;wolf.motion=q<6?'run_spiral':'idle';wolf.motionTime=q;wolf.yOffset=0;
  s.effects=[];s.gustOverride=null;s.effectTime=t;s.intro=null;s.drama=null;
  if(q>=6)s.camera={id:'J79_wolf_unharmed',position:[wolf.x+4.3,1.65,wolf.z+5.3],target:[wolf.x,.85,wolf.z],fov:44,terrainRelative:true};
  s.tailFlame={active:q<1.8,elapsed:q+.5,fade:q<1.55?1:clamp((1.8-q)/.25)};
  setCaption(s,q<1.8?'狼「わっ、火だ！ 逃げろーっ！」':q<6?'火はすぐに消えました。おおかみは無事です。':'狼「ふう……もう、こりごりだ！」');
 } else {
  if(source>=10&&source<14){const c=HOUSE_CENTERS.straw;s.camera={id:'J79_straw_build_establish',position:[c[0],4.5,c[2]+15],target:[c[0],1.9,c[2]],fov:48,terrainRelative:false};}
  if(s.build&&s.build.visit%2===0&&s.build.workPhase>=.35)s.comic={text:{straw:'トントン！',wood:'カンカン！',brick:'コンコン！'}[s.build.house],kind:'build',side:s.build.contactSector%2?'right':'left',phase:(s.build.workPhase-.35)/.65};
  if(source>=100.8&&source<103.4)s.camera=wide('wood');
  if(source>=100.8&&source<101.3)s.houses.wood.deform=.16*(1-smooth((source-100.8)/.5));
  if(source>=140.5&&source<144)setCaption(s,'煙突の下から、あわてた声が！');
  if(source>=144&&source<144.5){s.tailFlame={active:true,elapsed:source-144,fade:1};setCaption(s,'狼「わっ、火だ！ 逃げろーっ！」');}
  if(source>=157.5)setCaption(s,'おしまい — みんな無事');
 }
 s.actors.find(a=>a.id==='wolf').tailFlame=s.tailFlame;s.world.time=t;if(s.ended){s.branch.ending=BASE.sampleStory(160.5).branch.ending;setCaption(s,'おしまい — みんな無事');}
 return s;
}
export function createStoryClock(){let time=0,playing=false;return{get time(){return time},get playing(){return playing},play(){if(time>=STORY_DURATION)time=0;playing=true;},pause(){playing=false;},reset(){time=0;playing=false;},seek(t){time=clamp(Number.isFinite(t)?t:0,0,STORY_DURATION);},tick(dt){if(playing)time=clamp(time+clamp(dt,0,.1),0,STORY_DURATION);if(time>=STORY_DURATION-1e-8){time=STORY_DURATION;playing=false;}return sampleStory(time);}};}
selectBranch('normal');
