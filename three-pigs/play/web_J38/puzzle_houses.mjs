const F='OCEAN';
const lv=(code,f)=>+code[F.indexOf(f)];
export const HOUSES=[
 ['castle',{O:5,C:5,E:5,A:5,N:5},5],['freeload',{O:1,C:1,E:1,A:1,N:1},null],
 ['tent',{C:1,E:5,N:1},0],['karakuri_fort',{O:5,C:5,N:5},4],['bunker',{C:5,E:1,N:5},4],
 ['fortress',{C:5,N:5},4],['karakuri',{O:5,C:5},3],['treehouse',{O:5,C:1},1],
 ['straw',{C:1},1],['wood',{C:3},2],['brick',{C:5},3],
];
export function houseOf(code){for(const[id,c,s]of HOUSES)if(Object.entries(c).every(([f,v])=>lv(code,f)===v))return{id,strength:s};}
const VISUAL={straw:'straw',wood:'wood',brick:'brick',tent:'tent',fortress:'fortress',treehouse:'treehouse',karakuri:'karakuri',castle:'castle',bunker:'bunker',karakuri_fort:'karakuri_fort'};
export const SITE_DEFAULT={straw:'straw',wood:'wood',brick:'brick'};
const ROLE={straw:'pig_straw',wood:'pig_wood',brick:'pig_brick'};
export function siteHouses(cast){
 const out={};for(const site of ['straw','wood','brick']){const h=houseOf(cast[ROLE[site]]);const visual=h.id==='freeload'?SITE_DEFAULT[site]:VISUAL[h.id];
  out[site]={id:h.id,visual,strength:h.id==='freeload'?{straw:1,wood:2,brick:3}[site]:h.strength,chimney:visual==='brick'};}
 return out;
}
export const NAME={straw:'わらの家',wood:'木の家',brick:'れんがの家',tent:'テント',fortress:'鉄の要塞',treehouse:'ツリーハウス',karakuri:'発明の家',bunker:'地下シェルター',castle:'お城',karakuri_fort:'からくり要塞'};
const MODEL={straw:'StrawHouse',wood:'WoodHouse',brick:'BrickHouse',tent:'TentHouse',fortress:'FortressHouse',treehouse:'TreehouseHouse',karakuri:'KarakuriHouse',bunker:'BunkerHouse',castle:'CastleHouse',karakuri_fort:'KarakuriFortHouse'};
const MANIFEST={straw:'Straw',wood:'Wood',brick:'Brick',tent:'Tent',fortress:'Fortress',treehouse:'Treehouse',karakuri:'Karakuri',bunker:'Bunker',castle:'Castle',karakuri_fort:'KarakuriFort'};
const FALL={straw:['Straw_BlowAway_v2.glb','Straw_BlowAway_v2'],wood:['Wood_BlowAway_v2.glb','Wood_BlowAway_v2'],tent:['Tent_BlowAway_v1.glb','Tent_BlowAway_v1'],treehouse:['Treehouse_BlowAway_v1.glb','Treehouse_BlowAway_v1']};

export async function preparePuzzleSites({THREE,loadAsset,prepare,cast,placements,sources}){
 const sites=siteHouses(cast),swapped={},manifests={};
 for(const site of ['straw','wood','brick']){
  const v=sites[site].visual;if(v===SITE_DEFAULT[site])continue;
  const placement=placements[site],detached=[...placement.children];for(const c of detached)placement.remove(c);
  const gltf=await loadAsset('./assets/'+MODEL[v]+'.glb');const staticScene=gltf.scene;prepare(staticScene);placement.add(staticScene);
  const src=(await loadAsset('./assets/'+MODEL[v]+'.glb')).scene;sources[site]=src;
  const r=await fetch('./'+MANIFEST[v]+'_construction.json');if(!r.ok)throw Error('Construction manifest '+v);manifests[site]=await r.json();
  let fall=null;
  if(FALL[v]){const g=await loadAsset('./assets/'+FALL[v][0]);prepare(g.scene);placement.add(g.scene);g.scene.visible=false;
   const clip=g.animations.find(c=>c.name===FALL[v][1]);const mixer=new THREE.AnimationMixer(g.scene),action=mixer.clipAction(clip);action.setLoop(THREE.LoopOnce,1);action.clampWhenFinished=true;
   fall={scene:g.scene,seek(t){action.reset().play();action.paused=false;mixer.setTime(Math.max(0,Math.min(clip.duration,t)));action.paused=true;}};}
  let hatch=null;
  if(v==='bunker'){const g=await loadAsset('./assets/Bunker_Hatch_v1.glb');prepare(g.scene);placement.add(g.scene);g.scene.visible=false;
   const clip=g.animations.find(c=>c.name==='Bunker_Hatch_v1');const mixer=new THREE.AnimationMixer(g.scene),action=mixer.clipAction(clip);action.setLoop(THREE.LoopOnce,1);action.clampWhenFinished=true;
   hatch={scene:g.scene,seek(t){action.reset().play();action.paused=false;mixer.setTime(t);action.paused=true;}};}
  swapped[site]={visual:v,staticScene,fall,hatch,detached};
 }
 return{sites,swapped,manifests};
}

export function wrapPuzzleBuildings(buildings,{swapped}){
 if(!Object.keys(swapped).length)return buildings;
 const apply=buildings.apply.bind(buildings),timeline=buildings.timeline.bind(buildings);let busy=null,last={};
 function show(){for(const[site,s]of Object.entries(swapped)){const st=last[site]||{},stage=st.constructionStage??5;
  if(stage<5||busy===site){s.staticScene.visible=false;if(s.fall)s.fall.scene.visible=false;continue;}
  if(st.intact===false&&s.fall){s.staticScene.visible=false;s.fall.scene.visible=true;s.fall.seek(st.time||0);}
  else if(s.hatch&&(st.doorOpen??0)>.05){s.staticScene.visible=false;if(s.fall)s.fall.scene.visible=false;s.hatch.scene.visible=true;s.hatch.seek(1.2+1.8*Math.min(1,st.doorOpen));}// ふたが開いた姿
  else{s.staticScene.visible=true;if(s.fall)s.fall.scene.visible=false;if(s.hatch)s.hatch.scene.visible=false;}
  if(s.hatch&&(stage<5||busy===site||st.intact===false||(st.doorOpen??0)<=.05))s.hatch.scene.visible=false;}}
 return{...buildings,
  apply(states){apply(states);last=states;show();},
  timeline(state){timeline(state);const b=state.build?.house,bs=b?(state.houses?.[b]?.constructionStage??5):5;busy=state.completion?.house||(b&&bs<5?b:null);show();}};
}

const WORD={straw:'わら',wood:'木',brick:'れんが',tent:'テント',fortress:'鉄',treehouse:'木',karakuri:'れんが',bunker:'鉄',castle:'石',karakuri_fort:'鉄'};
const SPEAKER={'長男':'straw','次男':'wood','三男':'brick'};
const SPECIAL={
 tent:{'わらなら、好きな形ですぐ作れる！':'テントなら、5秒で建つ！','丸い屋根にしよう。早く遊びたいな！':'三角にピンと張って、はい完成！','軽いわらを、思いついた形に！':'布をばさっと広げて……','結び目の確認は、あとでいいや。':'ひもはゆるくていいや。遊びに行こう！','できたー！':'できた！ じゃあ遊んでくるね！',
  '木なら、組み方を工夫できる。':'テントなら、すぐ建つ！','雨風をしのいで、兄弟も迎えたい。':'雨が降ったら、そのとき考えよう！','新しい木組みも、しっかりつなごう。':'柱を立てて、布をかけて……','よし、できた！':'できた！ 遊びに行こう！',
  '風が心配。重いれんがなら丈夫そう。':'テントなら、すぐ建つ！','急がず、小さな家をきちんと作ろう。':'さっさと建てて、遊びに行こう！','目地をそろえて、一つずつ。':'柱を立てて、布をかけて……','最後まで、すき間を確かめよう。':'すき間？ 気にしない！','うん。これで安心。':'できた！ じゃあね！'},
 wood:{'風が心配。重いれんがなら丈夫そう。':'木なら、しっかり組める。','急がず、小さな家をきちんと作ろう。':'順番に、木を組んでいこう。','目地をそろえて、一つずつ。':'木組みを、順番につなごう。','最後まで、すき間を確かめよう。':'最後の補強も、忘れずに。','うん。これで安心。':'よし、できた！',
  'わらなら、好きな形ですぐ作れる！':'木なら、組み方を工夫できる。','丸い屋根にしよう。早く遊びたいな！':'屋根は三角に組もう。','軽いわらを、思いついた形に！':'新しい木組みも、しっかりつなごう。','結び目の確認は、あとでいいや。':'補強は、あとでいいや。','できたー！':'よし、できた！'},
 straw:{'木なら、組み方を工夫できる。':'わらなら、すぐ作れる！','雨風をしのいで、兄弟も迎えたい。':'早く作って、みんなと遊びたい！','新しい木組みも、しっかりつなごう。':'軽いわらを、思いついた形に！','よし、できた！':'できたー！',
  '風が心配。重いれんがなら丈夫そう。':'わらなら、すぐ作れる！','急がず、小さな家をきちんと作ろう。':'さあ、さっさと作ろう！','目地をそろえて、一つずつ。':'わらを束ねて、ぎゅっと結ぼう。','最後まで、すき間を確かめよう。':'すき間は……まあいいか。','うん。これで安心。':'できたー！'},
 brick:{'わらなら、好きな形ですぐ作れる！':'重いれんがなら、丈夫そう。','丸い屋根にしよう。早く遊びたいな！':'急がず、きちんと作ろう。','軽いわらを、思いついた形に！':'目地をそろえて、一つずつ。','結び目の確認は、あとでいいや。':'すき間も確かめよう。','できたー！':'うん。これで安心。',
  '木なら、組み方を工夫できる。':'重いれんがなら、丈夫そう。','雨風をしのいで、兄弟も迎えたい。':'兄弟も迎えられる、丈夫な家に。','新しい木組みも、しっかりつなごう。':'目地をそろえて、一つずつ。','よし、できた！':'うん。これで安心。'},
 fortress:{'風が心配。重いれんがなら丈夫そう。':'狼が心配。鉄で要塞にしよう。','急がず、小さな家をきちんと作ろう。':'鍵は3つ。窓には鉄格子。念には念を。','目地をそろえて、一つずつ。':'鋲を一本ずつ、しっかり打とう。','最後まで、すき間を確かめよう。':'すき間はゼロ。煙突もつけない。','うん。これで安心。':'うん。これなら……たぶん安心。',
  'わらなら、好きな形ですぐ作れる！':'狼が心配。鉄で要塞にしよう。','丸い屋根にしよう。早く遊びたいな！':'塔も4つ立てよう。','軽いわらを、思いついた形に！':'鋲を一本ずつ、しっかり打とう。','結び目の確認は、あとでいいや。':'鍵は3つ。念には念を。','できたー！':'できた……たぶん安心。',
  '木なら、組み方を工夫できる。':'狼が心配。鉄で要塞にしよう。','雨風をしのいで、兄弟も迎えたい。':'兄弟も守れる、鉄の壁にしよう。','新しい木組みも、しっかりつなごう。':'鋲を一本ずつ、しっかり打とう。','よし、できた！':'できた……たぶん安心。'},
};
const BUILD={straw:['わらなら、好きな形ですぐ作れる！','丸い屋根にしよう。早く遊びたいな！','軽いわらを、思いついた形に！','結び目の確認は、あとでいいや。','できたー！'],
 wood:['木なら、組み方を工夫できる。','雨風をしのいで、兄弟も迎えたい。','新しい木組みも、しっかりつなごう。','よし、できた！'],
 brick:['風が心配。重いれんがなら丈夫そう。','急がず、小さな家をきちんと作ろう。','目地をそろえて、一つずつ。','最後まで、すき間を確かめよう。','うん。これで安心。']};
const NEW_LINES={
 treehouse:['木の上に家を作ったら、景色が最高！','はしごをかけて、ブランコもつけよう！','板は、だいたいでいいや。','望遠鏡も置いちゃおう！','できた！ 空がよく見える！'],
 karakuri:['れんがの家に、発明をつめこもう。','自動ドアと、見張りロボもつけよう。','歯車を、一つずつ組み合わせて……','動くかどうか、しっかり試そう。','完成！ ロボくん、見張りをたのむよ。'],
 bunker:['地面の下なら、だれにも会わずにすむ。','穴を深く掘って、鉄のふたをしよう。','のぞき窓も、つけておこう。','花でかくして、見つからないように。','できた……ここなら安心。'],
 karakuri_fort:['狼が心配。発明で守りをかためよう。','鉄の壁に、見張りロボを2体。','パンチの仕掛けも、つけておこう。','警報ランプも、しっかり試そう。','できた……これなら、たぶん安心。'],
 castle:['どうせなら、お城を建てよう！','塔を4つ、旗も立てよう。','兄弟の部屋も、狼の客間も作ろう。','跳ね橋も、ちゃんと動くようにしよう。','完成！ みんなを招待しよう！']};
for(const[v,lines]of Object.entries(NEW_LINES)){SPECIAL[v]={};for(const list of Object.values(BUILD))list.forEach((l,i)=>{SPECIAL[v][l]=lines[i===list.length-1?lines.length-1:Math.min(i,lines.length-2)];});}
export function puzzleCaption(text,sites){
 if(!text)return text;let out=text;
 const m=out.match(/^(長男|次男|三男)「(.*)」$/);
 if(m){const site=SPEAKER[m[1]],v=sites[site]?.visual;if(v&&v!==SITE_DEFAULT[site]){const sp=SPECIAL[v]?.[m[2]];let body=sp??m[2].split(WORD[SITE_DEFAULT[site]]).join(WORD[v]);out=m[1]+'「'+body+'」';}}
 const marks={};for(const site of ['straw','wood','brick']){const v=sites[site].visual;if(v===SITE_DEFAULT[site])continue;const k='\u0001'+site+'\u0001';marks[k]=NAME[v];out=out.split(NAME[SITE_DEFAULT[site]]).join(k);}
 for(const[k,v]of Object.entries(marks))out=out.split(k).join(v);
 return out;
}

const TENT_AWAY={'長男「狼だ！」':'狼「こんにちは。だれかいるかな？」','長男は家の中から、勢いよく扉を閉めます。':'狼「……あれ？ 中は、からっぽだ。」','バーン！ 戸をしっかり閉めました。':'狼「……あれ？ 中は、からっぽだ。」','戸をしっかり閉めました。':'狼「……あれ？ 中は、からっぽだ。」',
 '狼「お願いだ。中へ入れてくれ。」':'狼「長男は、遊びに出かけたのかな。」','長男「だめ、開けないよ。」':'狼「まあいい。家ごと、いただこう。」','長男「家が飛んだ。木の家へ行こう。」':'長男「あっ！ ぼくのテントが飛んでった！」','狼「それなら、ふうーっ！」':'狼「それっ、ふうーっ！」'};
export function applyTentAway(s,sites){
 if(sites.straw.visual!=='tent')return s;const t=s.time;if(!(t>=121.5&&t<136))return s;
 const cap=s.scene?.caption;if(cap&&TENT_AWAY[cap]){const c=TENT_AWAY[cap];s.scene={...s.scene,caption:c};if(s.branch?.caption)s.branch={...s.branch,caption:{...s.branch.caption,text:c}};}
 if(t<133.5){const p=s.actors?.find(a=>a.id==='pig_straw');if(p)p.visible=false;if(s.comic&&['door','alert'].includes(s.comic.kind))s.comic=null;}
 return s;
}
