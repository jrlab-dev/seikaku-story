const CAST_LEVELS={pig1:{O:'中',C:'中',E:'高',A:'中',N:'高'},pig2:{O:'高',C:'高',E:'中',A:'中',N:'低'},pig3:{O:'中',C:'中',E:'中',A:'中',N:'中'}};
import {PERSONALITIES} from './personality_intro_data.mjs';
export const CAUSAL_LINES=[
[5,8,'長男「丸い屋根、楽しそう！」','pig1'],[8,11,'長男「早く作って、みんなと遊びたい！」','pig1'],
[11,14,'次男「使い慣れた方法が安心だな。」','pig2'],[14,17,'次男「困ったときは、うちへおいで。」','pig2'],
[17,20,'三男「強い風でも、安心して暮らしたい。」','pig3'],[20,23,'三男「ここでいいかな……もう一度確認。」','pig3'],
[23,26,'おおかみ「おれの言うことを聞かせてやる。」','wolf'],[26,29,'おおかみ「だめなら、別の手を考えるさ。」','wolf'],
[29,32.5,'長男「わらなら、好きな形ですぐ作れる！」','pig1'],[32.5,36,'長男「丸い屋根にしよう。早く遊びたいな！」','pig1'],
[36,39.5,'長男「軽いわらを、思いついた形に！」','pig1'],[39.5,44,'長男「早く仕上げて、遊びに行こう！」','pig1'],[44,46.5,'長男「結び目の確認は、あとでいいや。」','pig1'],
[50.5,54,'次男「木なら、組み方を工夫できる。」','pig2'],[54,57.5,'次男「雨風をしのいで、兄弟も迎えたい。」','pig2'],
[57.5,61.6,'次男「まず柱、つぎに壁。順番に。」','pig2'],[61.6,65.9,'次男「新しい木組みも、しっかりつなごう。」','pig2'],[65.9,68,'次男「最後の補強も、忘れずに。」','pig2'],
[72,75.5,'三男「風が心配。重いれんがなら丈夫そう。」','pig3'],[75.5,79,'三男「急がず、小さな家をきちんと作ろう。」','pig3'],
[79,85.1,'三男「土台の位置、もう一度。」','pig3'],[85.1,91.5,'三男「目地をそろえて、一つずつ。」','pig3'],[91.5,94.5,'三男「最後まで、すき間を確かめよう。」','pig3']];
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
export function applyCausalRevision(s,t,base){
 const line=CAUSAL_LINES.find(x=>t>=x[0]&&t<x[1]);
 if(line){s.scene={...s.scene,caption:line[2]};s.branch={...s.branch,caption:{...s.branch.caption,text:line[2]}};s.causalRevision={subject:line[3],traits:CAST_LEVELS[line[3]]??PERSONALITIES[line[3]].levels,materialRule:'normal route retained; desire, familiarity, available materials and workmanship together'};}
 if(t>=5&&t<11){const p=s.actors.find(a=>a.id==='pig_straw');p.introPose=t<8?'joy':'neutral';}
 if(t>=14&&t<17)s.actors.find(a=>a.id==='pig_wood').introPose='greet';
 if(t>=17&&t<23){const p=s.actors.find(a=>a.id==='pig_brick'),q=t-17;let x=0;
  if(q>=1&&q<2)x=.38*smooth(q-1);else if(q>=2&&q<4)x=.38;else if(q>=4&&q<5)x=.38*(1-smooth(q-4));
  p.x+=x;if((q>=1&&q<2)||(q>=4&&q<5)){p.motion='walk';p.yaw=q<3?Math.PI/2:-Math.PI/2;p.walkDistance=q<3?x:.76-x;}else p.motion='idle';
 }
 if(t>=219){
  const start=base.sampleStory(219),u=smooth((t-219)/3),ids=['pig_straw','pig_wood','pig_brick'];
  ids.forEach((id,i)=>{const p=s.actors.find(a=>a.id===id),a=start.actors.find(a=>a.id===id),x=18+1.7*i,z=-8.8,dx=x-a.x,dz=z-a.z;
   Object.assign(p,{x:a.x+dx*u,z:a.z+dz*u,yOffset:0,motion:u<1?'walk':'idle',yaw:u<1?Math.atan2(dx,dz):0,walkDistance:Math.hypot(dx,dz)*u,finalRow:true});delete p.worldY;
  });
  s.finalRow={sameDepth:-8.8,spacing:1.7,settled:t>=222};
  const camera=s.camera,position=[...camera.position],target=[...camera.target];
  const frontZ=target[2]+Math.hypot(position[0]-target[0],position[2]-target[2]);
  position[0]+=(19.7-position[0])*u;position[2]+=(frontZ-position[2])*u;
  target[0]+=(19.7-target[0])*u;s.camera={...camera,position,target};
 }
 return s;
}
