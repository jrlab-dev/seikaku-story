import {PROFILE_TEXT,TYPE_NAMES} from './personality_text.mjs';
import {stanceFor,castTypes} from './animal_reactions.js';
import {siteHouses,puzzleCaption,NAME as HOUSE_NAME} from './puzzle_houses.mjs';

export const DEFAULT_CAST={pig_straw:'33535',pig_wood:'55331',pig_brick:'33333',wolf:'11311'};
const ROLE_LABEL={pig_straw:'長男',pig_wood:'次男',pig_brick:'三男',wolf:'おおかみ'};
let cast={...DEFAULT_CAST};
const lv=d=>d==='1'?'low':d==='5'?'high':'mid';
const F={O:0,C:1,E:2,A:3,N:4};
const f=(role,k)=>lv(cast[role][F[k]]);

export function setCast(next){
 const c={...DEFAULT_CAST,...(next||{})};
 for(const[k,v]of Object.entries(c))if(!/^[135]{5}$/.test(v))throw Error('cast code must be 5 digits of 1/3/5: '+k+'='+v);
 cast=c;return getCast();
}
export function getCast(){return{...cast};}

const BEATS=[
 {id:'straw_O',role:'pig_straw',k:'O',from:41,to:44.5,line:{low:'長男「いつもの形で、すぐ作れる！」',mid:null,high:'長男「わらで、見たことない形にしよう！」'},pose:{high:0}},
 {id:'wood_O',role:'pig_wood',k:'O',from:62.5,to:66,line:{low:'次男「木は、昔ながらの組み方で。」',mid:'次男「木なら、しっかり組める。」',high:null}},
 {id:'brick_O',role:'pig_brick',k:'O',from:84,to:87.5,line:{low:'三男「風が心配。いつものれんがで。」',mid:null,high:'三男「風が心配。れんがで工夫してみよう。」'},pose:{high:0}},
 {id:'straw_C',role:'pig_straw',k:'C',from:51.5,to:58.5,line:{low:'長男「早く仕上げて、遊びに行こう！」',mid:'長男「早く仕上げて、遊びに行こう！」',high:'長男「早く遊びたい。でも結び目は確かめる。」'},build:{low:'hurry',high:'check'},split:56,line2:{low:'長男「結び目の確認は、あとでいいや。」',mid:null,high:'長男「よし、ほどけない。」'}},
 {id:'wood_C',role:'pig_wood',k:'C',from:73.6,to:80,line:{low:'次男「細かいところは、まあいいか。」',mid:'次男「木組みを、順番につなごう。」',high:null},build:{low:'hurry'},split:77.9,line2:{low:'次男「補強は、あとでいいや。」',mid:'次男「補強も、やっておこう。」',high:null}},
 {id:'brick_C',role:'pig_brick',k:'C',from:97.1,to:106.5,line:{low:'三男「急ごう。目地はだいたいでいい。」',mid:null,high:'三男「目地をそろえて、一つずつ。」'},build:{low:'hurry',high:'check'},split:103.5,line2:{low:'三男「すき間は……まあ大丈夫。」',mid:null,high:'三男「最後まで、すき間を確かめよう。」'}},
 {id:'straw_E',role:'pig_straw',k:'E',from:58.85,to:62,line:{low:'長男「……できた。」',mid:'長男「できた！」',high:null},joy:{low:3}},
 {id:'wood_E',role:'pig_wood',k:'E',from:80.35,to:83.5,line:{low:'次男「よし。」',mid:null,high:'次男「やったー！ できたよー！」'},joy:{low:3,high:4}},
 {id:'brick_E',role:'pig_brick',k:'E',from:107.2,to:110,line:{low:'三男「うん。これで安心。」',mid:null,high:'三男「できた！ これなら安心だ！」'},joy:{low:3,high:4}},
 {id:'straw_A',role:'pig_straw',k:'A',from:130,to:130.9,line:{low:'長男「だめ、開けないよ。」',mid:null,high:'長男「ごめんね。でも開けられないよ。」'}},
 {id:'wood_A',role:'pig_wood',k:'A',from:140.6,to:144.75,line:{low:'次男「……もう、早く入って！」',mid:null,high:'次男「こっち！ だいじょうぶ、入って！」'},pose:{low:8}},
 {id:'brick_A',role:'pig_brick',k:'A',from:171,to:175.5,line:{low:'三男「……二人とも、早く中へ。」',mid:null,high:'三男「よく来たね！ 走って中へ！」'},pose:{low:8}},
 {id:'straw_N',role:'pig_straw',k:'N',from:134.3,to:135.9,line:{low:'長男「家が飛んだ。木の家へ行こう。」',mid:'長男「家が飛んじゃった！」',high:null},pose:{low:6}},
 {id:'wood_N',role:'pig_wood',k:'N',from:161.8,to:163.4,line:{low:null,mid:'次男「わっ、れんがの家へ！」',high:'ふたり「わあっ！ 逃げろー！」'},pose:{high:7}},
 {id:'brick_N',role:'pig_brick',k:'N',from:205,to:206.5,line:{low:'三男「えんとつから音……おおかみだね。」',mid:null,high:'三男「えんとつから音が！ おおかみだ！」'},pose:{low:6,high:7}},
 {id:'wolf_A',role:'wolf',k:'A',from:127.2,to:130,line:{low:null,mid:'狼「お願いだ。中へ入れてくれ。」',high:'狼「少し休ませてくれないか。話をしよう。」'},wolfPose:{mid:0,high:1}},
 {id:'wolf_E',role:'wolf',k:'E',from:131,to:133.15,line:{low:'狼「……なら、ふうっ。」',mid:null,high:'狼「それなら、ふううううーっ！！」'}},
 {id:'wolf_C',role:'wolf',k:'C',from:154.3,to:157.3,line:{low:null,mid:'狼「もう一度、強く吹いてみるか。」',high:'狼「まだまだ！ 何度でも吹くぞ。」'}},
 {id:'wolf_O',role:'wolf',k:'O',from:197.5,to:201.5,line:{low:null,mid:'狼「正面がだめなら……煙突だ！」',high:'狼「ふふん、上から入ればいいんだ！」'}},
 {id:'wolf_N',role:'wolf',k:'N',from:219,to:220.25,line:{low:null,mid:'狼「あちち……逃げるが勝ちだ！」',high:'狼「ぎゃあ！ 火だ火だ、逃げろーっ！」'}},
];

export function decideEnding(c=cast){
 const L=(r,k)=>lv(c[r][F[k]]),adj={low:-.5,mid:0,high:.5};
 const P={low:1.25,mid:2,high:2.5}[L('wolf','E')];
 const sites=siteHouses(c),STR={0:0,1:1,2:1.5,3:3,4:4,5:5},S={straw:STR[sites.straw.strength],wood:STR[sites.wood.strength],brick:STR[sites.brick.strength]};
 const reasons=[],base={wolfBreath:P,strength:S};
 if(L('wolf','A')==='high'&&L('pig_straw','A')==='high'){reasons.push('狼が話し合いを求め、長男も話を聞く（協調性）');return{id:'peace',no:2,title:'早い和解',completion:35,reasons,...base};}
 const KK={id:'karakuri',no:'9',title:'発明の家のセキュリティ',completion:60};
 if(S.straw>P&&sites.straw.id==='karakuri'){reasons.push('長男の発明の家のセキュリティが、狼を追い返す');return{...KK,id:'karakuri_straw',reasons,...base};}
 if(S.straw>P){reasons.push('長男の'+HOUSE_NAME[sites.straw.visual]+'は、狼の息より丈夫');return{id:'straw_holds',no:3,title:'わらの家が耐える',completion:30,reasons,...base};}
 if(L('wolf','C')==='low'&&L('wolf','N')==='high'){reasons.push('狼は粘らず、家が崩れる音に自分で驚く（誠実性・感受性）');return{id:'wolf_leaves',no:5,title:'狼が自分で帰る',completion:35,reasons,...base};}
 if(S.wood>P&&sites.wood.id==='karakuri'){reasons.push('次男の発明の家のセキュリティが、狼を追い返す');return{...KK,id:'karakuri_wood',reasons,...base};}
 if(S.wood>P){reasons.push('次男の'+HOUSE_NAME[sites.wood.visual]+'が狼の息より丈夫');return{id:'wood_holds',no:4,title:'木の家で守り切る',completion:55,reasons,...base};}
 const W=k=>L('wolf',k);
 if(S.brick<=P){reasons.push('三男の'+HOUSE_NAME[sites.brick.visual]+'も倒れ、3びきは逃げ出す');return{id:'all_fall',no:'6',title:'狼のごちそうルート',completion:20,reasons,...base};}
 if(W('O')==='high'&&W('C')==='high'&&W('A')==='low'&&!['fortress','castle','karakuri','karakuri_fort','bunker'].includes(sites.brick.id)){reasons.push('狼が爆弾を発明して、'+HOUSE_NAME[sites.brick.visual]+'を吹き飛ばす');return{id:'bomb',no:'7',title:'狼のごちそうルート（爆弾）',completion:20,reasons,...base};}
 if(W('O')==='high'&&W('C')==='high'&&W('A')==='low'){reasons.push('狼の爆弾を、'+HOUSE_NAME[sites.brick.visual]+'がはね返す');return{id:'bomb_backfire',no:'8',title:'爆弾がはね返ったルート',completion:80,reasons,...base};}
 if(sites.brick.id==='karakuri'&&!(W('O')==='high'&&W('C')==='high'&&W('A')==='low')){reasons.push('三男の発明の家のセキュリティが、狼を追い返す');return{...KK,id:'karakuri_brick',reasons,...base};}
 if(!sites.brick.chimney){reasons.push('三男の'+HOUSE_NAME[sites.brick.visual]+'には煙突がなく、狼は入り口を見つけられない');return{id:'brick_two_blows',no:'1b',title:HOUSE_NAME[sites.brick.visual]+'で守り切る',completion:75,reasons,...base};}
 if(L('pig_brick','C')==='high'&&W('C')!=='high'){reasons.push('三男の家があまりに丈夫で、狼は2回吹いてあきらめる（三男の誠実性・狼の誠実性）');return{id:'brick_two_blows',no:'1b',title:'2回吹いて帰る',completion:75,reasons,...base};}
 if(W('O')==='low'&&W('C')!=='low'){reasons.push('狼は粘って吹き続けるが、別の入り方は思いつかない（開放性・誠実性）');return{id:'no_chimney',no:'1c',title:'煙突を思いつかず帰る',completion:85,reasons,...base};}
 if(L('pig_brick','O')==='high'){reasons.push('三男が煙突にふたをする工夫を思いつく（開放性）');return{id:'chimney_lid',no:'1d',title:'煙突にふた',completion:90,reasons,...base};}
 if(W('N')==='low'&&W('C')!=='low'){reasons.push('火が熱くても、狼は慌てず落ち着いて去る（感受性）');return{id:'calm_leave',no:'1e',title:'落ち着いて去る',completion:99,reasons,...base};}
 reasons.push('れんがの家まで逃げ、煙突から来た狼を火で追い返す');return{id:'original',no:'1a',title:'原作どおり完走',completion:100,reasons,...base};
}

function setCaption(s,text){s.scene={...s.scene,caption:text};s.branch={...s.branch,caption:{...s.branch.caption,text}};}
function actor(s,id){return s.actors?.find(a=>a.id===id);}

export function applyPersonality(s,t){
 if(s.personalityWindow){
  const role=s.personalityWindow.id,code=cast[role],text=PROFILE_TEXT[code];
  if(text){const page=s.personalityWindow.page??0;s.personalityWindow={...s.personalityWindow,code,name:TYPE_NAMES[code],pages:text.pages,lines:text.pages[Math.min(1,page)],label:ROLE_LABEL[role],portraitType:castTypes(cast)[role]??9};}
 }
 const applied=[];
 for(const b of BEATS){
  if(t<b.from||t>=b.to)continue;
  const level=f(b.role,b.k),second=b.split!=null&&t>=b.split;
  const text=(second?b.line2:b.line)?.[level];
  if(text&&s.scene?.caption)setCaption(s,text);
  const p=actor(s,b.role);
  if(p){
   if(b.pose&&b.pose[level]!=null)p.reactionPose=b.pose[level];
   if(b.joy&&b.joy[level]!=null&&(p.motion==='celebrate_home'||s.completion))p.reactionPose=b.joy[level];
   if(b.build&&b.build[level])p.reactionBuild=b.build[level];
   if(b.wolfPose&&b.wolfPose[level]!=null)p.reactionPose=b.wolfPose[level];
  }
  applied.push({beat:b.id,level});
 }
 applyStances(s,t);
 s.personality={cast:getCast(),beats:applied,ending:decideEnding()};
 return s;
}

export function applyStances(s,t,calm=false){{const ty=castTypes(cast);for(const a of s.actors||[])if(ty[a.id]!=null&&ty[a.id]!==9)a.walkStyle=ty[a.id];}// J118：歩き方の型はいつでも（緊張した場面でも歩き方はその人らしく）
 if(!(calm||t<122.5||t>=228.7))return s;for(const a of s.actors||[])if(cast[a.id]&&a.reactionPose==null&&!a.ownerDoor&&!a.runAway){const k=castTypes(cast)[a.id];a.stance=k===9?null:k;}return s;}
