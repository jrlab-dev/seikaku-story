import {openingSample as previousOpening} from './opening_v7.mjs';
export {COMMON_HOME,JOURNEY_POINTS,JOURNEY_LENGTH,journeyAt,routeClearance,OPENING_DURATION,OPENING_SHIFT,setTravelGround,journeyDistance} from './opening_v7.mjs';
export const PROFILES=[
 {id:'pig_straw',code:'33535',label:'長男',name:'繊細な行動派',pages:[
  ['思いつくと、すぐ人を誘って動く。','相手の小さな反応も気になりがち。'],
  ['行動は早いけれど、','その場の空気に左右されやすい。']]},
 {id:'pig_wood',code:'55331',label:'次男',name:'大胆な職人',pages:[
  ['新しい方法を試すのが好き。','最後まで、手を抜かず仕上げる。'],
  ['難しい仕事にも挑戦する。','自分のやり方を通しすぎることも。']]},
 {id:'pig_brick',code:'33333',label:'三男',name:'究極のバランサー',pages:[
  ['極端なところがなく、','いろいろな相手と組める。'],
  ['どこでも自然になじみ、','周りがうまく動くのを支える。']]},
 {id:'wolf',code:'11311',label:'おおかみ',name:'動じない我が道',pages:[
  ['流行や人の目を気にせず、','自分の基準で物事を決める。'],
  ['何が起きても動じにくい。','人に合わせず、孤立しやすい。']]}
];
function explanation(profile,elapsed,pageSeconds){
 const page=Math.min(1,Math.floor(elapsed/pageSeconds));
 return {...profile,phase:'narrator',lines:profile.pages[page],page,elapsed,source:'current site personality-types.js; exact cast code'};
}
export function openingSample(s,t){
 s=previousOpening(s,t);
 if(t>=5&&t<32){const index=Math.floor((t-5)/9);s.personalityWindow=explanation(PROFILES[index],t-5-index*9,4.5);}
 else s.personalityWindow=null;
 return s;
}
export function applyWolfPersonality(s,t){
 if(t>=35&&t<41){
  s.personalityWindow=explanation(PROFILES[3],t-35,3);
  s.scene={...s.scene,caption:''};s.branch.caption={...s.branch.caption,text:''};
 }
 return s;
}
