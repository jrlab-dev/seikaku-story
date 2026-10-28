import {siteHouses,NAME as HOUSE_NAME} from './puzzle_houses.mjs';
const lv=d=>d==='1'?'low':d==='5'?'high':'mid';
const F={O:0,C:1,E:2,A:3,N:4};
export function evaluateEnding(c){
 const L=(r,k)=>lv(c[r][F[k]]),adj={low:-.5,mid:0,high:.5};
 const P={low:1.25,mid:2,high:2.5}[L('wolf','E')];
 const sites=siteHouses(c),STR={0:0,1:1,2:1.5,3:3,4:4,5:5},S={straw:STR[sites.straw.strength],wood:STR[sites.wood.strength],brick:STR[sites.brick.strength]};
 const reasons=[],base={wolfBreath:P,strength:S};
 if(L('wolf','A')==='high'&&L('pig_straw','A')==='high'){reasons.push('狼が話し合いを求め、長男も話を聞く（協調性）');return{id:'peace',no:2,title:'早い和解',completion:35,reasons,...base};}
 const KK={id:'karakuri',no:'9',title:'発明の家のセキュリティ',completion:60};
 if(S.straw>P&&sites.straw.id==='karakuri'){reasons.push('長男の発明の家のセキュリティが、狼を追い返す');return{...KK,id:'karakuri_straw',reasons,...base};}
 if(S.straw>P){reasons.push('長男の'+HOUSE_NAME[sites.straw.visual]+'は、狼の息より丈夫');return{id:'straw_holds',no:3,title:HOUSE_NAME[sites.straw.visual]+'が耐える',completion:30,reasons,...base};}
 if(L('wolf','C')==='low'&&L('wolf','N')==='high'){reasons.push('狼は粘らず、家が崩れる音に自分で驚く（誠実性・感受性）');return{id:'wolf_leaves',no:5,title:'狼が自分で帰る',completion:35,reasons,...base};}
 if(S.wood>P&&sites.wood.id==='karakuri'){reasons.push('次男の発明の家のセキュリティが、狼を追い返す');return{...KK,id:'karakuri_wood',reasons,...base};}
 if(S.wood>P){reasons.push('次男の'+HOUSE_NAME[sites.wood.visual]+'が狼の息より丈夫');return{id:'wood_holds',no:4,title:HOUSE_NAME[sites.wood.visual]+'で守り切る',completion:55,reasons,...base};}
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
