export const OPENING_DURATION=20,OPENING_SHIFT=15;
export const COMMON_HOME={x:-10,z:16,width:3.6,depth:3.7};
export const OPENING_LINES=[
 [0,3.8,'あるところに、みどりいっぱいの村がありました。'],
 [3.8,7.8,'そこには、なかよしの3びきのこぶたがくらしていました。'],
 [7.8,12.5,'3びきが大きくなると、いっしょの家は、だんだんきゅうくつに。'],
 [12.5,16.5,'そこで、それぞれ自分の家をつくることにしました。'],
 [16.5,20,'さあ、3びきの家づくりのはじまりです。']];
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)},mix=(a,b,u)=>a.map((v,i)=>v+(b[i]-v)*u);
export function openingSample(s,t){
 const {x,z}=COMMON_HOME,arrive=smooth(t/3.8),close=smooth((t-7.8)/1.5),outside=smooth((t-12.5)/1.5),line=OPENING_LINES.find(l=>t>=l[0]&&t<l[1])??OPENING_LINES.at(-1);
 const start=[x-9,7.6,z+16],medium=[x,3.4,z+10.8],near=[x,2.2,z+8.1],last=[x,2.5,z+10];
 let pos=mix(start,medium,arrive),target=mix([x,1.5,z],[x,1.15,z+2.8],arrive);pos=mix(pos,near,close);target=mix(target,[x,.85,z+3.3],close);pos=mix(pos,last,outside);target=mix(target,[x,.9,z+4.2],outside);
 s.camera={id:'J114_v5_opening',position:pos,target,fov:46,terrainRelative:true};
 const ids=['pig_straw','pig_wood','pig_brick'],spacing=1.42-.20*close;
 for(const a of s.actors){const i=ids.indexOf(a.id);a.visible=i>=0;delete a.worldY;if(i<0)continue;
  Object.assign(a,{x:x+(i-1)*spacing,z:z+3.3,yOffset:0,yaw:0,motion:'idle',motionTime:t,introPose:t>=16.5?(i===0?'joy':i===1?'greet':'neutral'):'neutral',introNod:t>=14.2&&t<15.4?Math.sin((t-14.2)/1.2*Math.PI):0,openingV5:true});
  if(t>=7.8&&t<12.5&&i===1)a.introPose='concern';
 }
 for(const h of Object.values(s.houses)){h.constructionStage=0;h.intact=true;h.doorOpen=0;}
 s.build=null;s.completion=null;s.drama=null;s.intro=null;s.effects=[];s.comic=null;s.resultCard=null;s.fireScene=null;s.tailFlame=null;
 s.scene={id:'opening_v5',at:line[0],title:'あるところに',caption:line[2]};s.branch.caption={...s.branch.caption,text:line[2]};
 s.cutOpacity=t>19.65?smooth((t-19.65)/.35)*.85:0;
 s.openingV5={active:true,commonHome:COMMON_HOME,phase:OPENING_LINES.indexOf(line),peopleRemainOutside:true};return s;
}
