import {COMMON_HOME,JOURNEY_POINTS,JOURNEY_LENGTH,journeyAt,routeClearance}from './opening_v6.mjs';
export {COMMON_HOME,JOURNEY_POINTS,JOURNEY_LENGTH,journeyAt,routeClearance};
export const OPENING_DURATION=35,OPENING_SHIFT=12;
let ground=()=>0;export function setTravelGround(fn){ground=fn;}
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)},lerp=(a,b,u)=>a.map((v,i)=>v+(b[i]-v)*u);
export const PROFILES=[
 {id:'pig_straw',code:'33535',label:'長男',name:'繊細な行動派',narrator:['思いつくと、まずみんなを誘う。','相手の反応が気になりやすい。'],line:['ここに家を作ろう！','……ねえ、みんなはどう思う？']},
 {id:'pig_wood',code:'55331',label:'次男',name:'大胆な職人',narrator:['新しい方法を試すのが好き。','最後まで、手を抜かず仕上げる。'],line:['この組み方、試してみよう。','細かいところまで仕上げるぞ。']},
 {id:'pig_brick',code:'33333',label:'三男',name:'究極のバランサー',narrator:['慎重さも、思い切りもほどよい。','相手に合わせて、協力を考える。'],line:['丈夫さも、作りやすさも大事。','三人で、できることを分けよう。']}
];
export function journeyDistance(t){const u=clamp((t-5)/27),r=.04,f=u<r?u*u/(2*r):u>1-r?1-r-(1-u)**2/(2*r):u-r/2;return JOURNEY_LENGTH*f/(1-r);}
export function openingSample(s,t){
 const {x,z}=COMMON_HOME,ids=PROFILES.map(p=>p.id),d=journeyDistance(t),p=journeyAt(d),end=journeyAt(JOURNEY_LENGTH);
 for(const a of s.actors){const i=ids.indexOf(a.id);a.visible=i>=0;delete a.worldY;if(i<0)continue;
  Object.assign(a,{x:x+(i-1)*1.35,z:z+3.3,yOffset:0,yaw:0,motion:'idle',motionTime:t,introPose:t>=2.5?'greet':'neutral',openingV7:true});
  if(t>=5){const q=journeyAt(Math.max(0,d-i*1.7)),form=smooth(d/5),arrive=smooth((t-32)/2.3);
   a.x=q.x+(i-1)*1.35*(1-form);a.z=q.z;
   a.x+=(end.x+(i-1)*1.5-a.x)*arrive;a.z+=(end.z-a.z)*arrive;
   a.motion=t<34.3?'walk':'idle';a.motionTime=t-5;a.walkDistance=Math.max(0,d-i*1.7)+Math.hypot(end.x+(i-1)*1.5-q.x,end.z-q.z)*arrive;a.yaw=Math.atan2(q.dx,q.dz);delete a.introPose;
   if(t>=34.3){a.yaw=Math.atan2(x-a.x,z-a.z);a.motion='walk';a.walkDistance=i*.8;}
  }
 }
 let position,target;
 const homeY=ground(x,z+3.3),near=[x,homeY+2.2,z+8.6],homeTarget=[x,homeY+.85,z+3.3];
 if(t<5){const u=smooth(t/2.4);position=lerp([x-6,homeY+5.6,z+15],near,u);target=lerp([x,homeY+1.3,z],homeTarget,u);}
 else if(t<32){const u=smooth((t-5)/1.2),base=ground(p.x,p.z),trail=[p.x+p.dx*9+p.dz*7,base+4.4,p.z+p.dz*9-p.dx*7];
  position=lerp(near,trail,u);target=lerp(homeTarget,[p.x-1.2,base+2.3,p.z-.6],u);
 }else{const u=smooth((t-32)/2.3),base=ground(end.x,end.z);position=lerp([end.x+end.dx*9+end.dz*7,base+4.4,end.z+end.dz*9-end.dx*7],[end.x+8,base+3.3,end.z+8],u);target=lerp([end.x-1.2,base+2.3,end.z-.6],[end.x-12,base+1.6,end.z-10],u);}
 s.camera={id:'J114_v7_travel_profiles',position,target,fov:49,terrainRelative:false};
 for(const h of Object.values(s.houses)){h.constructionStage=0;h.intact=true;h.doorOpen=0;}
 s.build=null;s.completion=null;s.drama=null;s.intro=null;s.effects=[];s.comic=null;s.resultCard=null;s.fireScene=null;s.tailFlame=null;
 const index=t>=5&&t<32?Math.floor((t-5)/9):-1,profile=PROFILES[index],elapsed=profile?t-5-index*9:0,phase=elapsed<4.7?'narrator':'character';
 s.personalityWindow=profile?{...profile,phase,lines:phase==='narrator'?profile.narrator:profile.line,index,elapsed,source:'site personality-types.js; exact cast code'}:null;
 const caption=t<2.5?'3びきのこぶたは、小さな家で暮らしていました。':t<5?'大きくなった3びきは、自分たちの家を作ることに。':t<32?'':'新しい土地に到着。ふり返ると、前の家が遠くに。';
 s.scene={id:'opening_v7',at:0,title:'旅をしながら3びきを紹介',caption};s.branch.caption={...s.branch.caption,text:caption};s.cutOpacity=t>34.65?smooth((t-34.65)/.35)*.85:0;
 s.travelV7={distance:d,totalDistance:JOURNEY_LENGTH,phase:index>=0?'profile_travel':t<5?'home':'arrival'};return s;
}

