import {ROAD_CENTER}from './home_road_v6.mjs';
export const OPENING_DURATION=44,OPENING_SHIFT=39;
export const COMMON_HOME={x:-48,z:-34,width:3.6,depth:3.7};
const clamp=x=>Math.max(0,Math.min(1,x));
export const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
const lerp=(a,b,u)=>a.map((v,i)=>v+(b[i]-v)*u);
export const OPENING_LINES=[
 [0,3,'あるところに、みどりいっぱいの村がありました。'],
 [3,6,'3びきのこぶたは、小さな家でなかよくくらしていました。'],
 [6,9.5,'大きくなると、いっしょの家は、だんだんきゅうくつに。'],
 [9.5,12,'そこで、自分たちの家をつくる旅に出ることにしました。'],
 [12,18,'住みなれた家をあとにして、3びきは出発です。'],
 [18,30,'道をたどって、新しいくらしの場所をさがします。'],
 [30,38,'ひらけた土地に、たどり着きました。'],
 [38,41,'ふり返ると、もとの家が遠くに見えます。'],
 [41,44,'ここから、3びきの新しいくらしがはじまります。']];
const knots=[[-48,-30.7],[-47.8,-29.6],[-47,-27.622],[-46,-26.852002008125204]];
export const JOURNEY_POINTS=[];
for(let i=0;i<knots.length-1;i++)for(let k=0;k<30;k++){
 const p0=knots[Math.max(0,i-1)],p1=knots[i],p2=knots[i+1],p3=knots[Math.min(knots.length-1,i+2)],t=k/30;
 JOURNEY_POINTS.push([0,1].map(a=>.5*((2*p1[a])+(-p0[a]+p2[a])*t+(2*p0[a]-5*p1[a]+4*p2[a]-p3[a])*t*t+(-p0[a]+3*p1[a]-3*p2[a]+p3[a])*t*t*t)));
}
for(const p of ROAD_CENTER)if(p[0]>=-46&&p[0]<=-8)JOURNEY_POINTS.push(p);
const lengths=[0];for(let i=1;i<JOURNEY_POINTS.length;i++)lengths.push(lengths.at(-1)+Math.hypot(...JOURNEY_POINTS[i].map((x,k)=>x-JOURNEY_POINTS[i-1][k])));
export const JOURNEY_LENGTH=lengths.at(-1);
export function journeyAt(distance){
 distance=Math.max(0,Math.min(JOURNEY_LENGTH,distance));let i=1;while(i<lengths.length-1&&lengths[i]<distance)i++;
 const a=JOURNEY_POINTS[i-1],b=JOURNEY_POINTS[i],q=(distance-lengths[i-1])/(lengths[i]-lengths[i-1]),v=b.map((n,k)=>n-a[k]),n=Math.hypot(...v);
 return{x:a[0]+v[0]*q,z:a[1]+v[1]*q,dx:v[0]/n,dz:v[1]/n,distance};
}
export function journeyDistance(t){const u=clamp((t-12)/26),r=.04;
 const f=u<r?u*u/(2*r):u>1-r?1-r-(1-u)**2/(2*r):u-r/2;
 return JOURNEY_LENGTH*f/(1-r);
}
export function routeClearance(x,z){let d=Infinity;for(let i=0;i<JOURNEY_POINTS.length;i+=3)d=Math.min(d,Math.hypot(x-JOURNEY_POINTS[i][0],z-JOURNEY_POINTS[i][1]));return d;}
export function openingSample(s,t){
 const {x,z}=COMMON_HOME,ids=['pig_straw','pig_wood','pig_brick'],line=OPENING_LINES.find(l=>t>=l[0]&&t<l[1])??OPENING_LINES.at(-1),d=journeyDistance(t),p=journeyAt(d);
 for(const a of s.actors){const i=ids.indexOf(a.id);a.visible=i>=0;delete a.worldY;if(i<0)continue;
  Object.assign(a,{x:x+(i-1)*1.35,z:z+3.3,yOffset:0,yaw:0,motion:'idle',motionTime:t,introPose:t>=9.5?'greet':t>=6&&i===1?'concern':'neutral',openingV6:true});
  if(t>=12){const q=journeyAt(Math.max(0,d-i*1.7)),form=smooth(d/5),arrive=smooth((t-38)/2.7);
   const end=journeyAt(JOURNEY_LENGTH);a.x=q.x+(i-1)*1.35*(1-form);a.z=q.z;
   a.x+=(end.x+(i-1)*1.5-a.x)*arrive;a.z+=(end.z-a.z)*arrive;
   a.motion=t<40.7?'walk':'idle';a.motionTime=t-12;a.walkDistance=Math.max(0,d-i*1.7)+Math.hypot(end.x+(i-1)*1.5-q.x,end.z-q.z)*arrive;a.yaw=Math.atan2(q.dx,q.dz);delete a.introPose;
   if(t>=40.7&&t<41){a.yaw=Math.atan2(x-a.x,z-a.z);a.motion='walk';a.walkDistance=i*.8;}
   if(t>=41){a.yaw=.8;a.introPose=i===0?'joy':i===1?'greet':'neutral';}
  }
 }
 let position,target;
 if(t<12){const wide=[x-9,7.6,z+16],medium=[x,3.0,z+10.6],near=[x,2.2,z+8.6],u=smooth(t/3),v=smooth((t-6)/1.1);position=lerp(lerp(wide,medium,u),near,v);target=lerp([x,1.4,z],[x,.85,z+3.3],u);}
 else if(t<38){const u=smooth((t-12)/2),homePos=[x,2.2,z+8.6],homeTarget=[x,.85,z+3.3];
  const trail=[p.x+p.dx*8+p.dz*7,3.4,p.z+p.dz*8-p.dx*7];position=lerp(homePos,trail,u);target=lerp(homeTarget,[p.x-1.2,.8,p.z-.6],u);
 }else{const end=journeyAt(JOURNEY_LENGTH),u=smooth((t-38)/2.7);position=lerp([end.x+end.dx*8+end.dz*7,3.4,end.z+end.dz*8-end.dx*7],[end.x+8,3.3,end.z+8],u);target=lerp([end.x-1.2,.8,end.z-.6],[end.x-12,1.6,end.z-10],u);}
 s.camera={id:'J114_v6_independence',position,target,fov:46+3*smooth((t-12)/2),terrainRelative:true};
 for(const h of Object.values(s.houses)){h.constructionStage=0;h.intact=true;h.doorOpen=0;}
 s.build=null;s.completion=null;s.drama=null;s.intro=null;s.effects=[];s.comic=null;s.resultCard=null;s.fireScene=null;s.tailFlame=null;
 s.scene={id:'opening_v6',at:line[0],title:'家を出て、新しい土地へ',caption:line[2]};s.branch.caption={...s.branch.caption,text:line[2]};
 s.cutOpacity=t>43.65?smooth((t-43.65)/.35)*.85:0;
 s.openingV6={active:true,phase:OPENING_LINES.indexOf(line),distance:d,totalDistance:JOURNEY_LENGTH,commonHome:COMMON_HOME};return s;
}
