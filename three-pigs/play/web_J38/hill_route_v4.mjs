export const HILL={x:62,z:-34,height:7.8,length:24,width:20};
const start=[19,0],distance=Math.hypot(HILL.x-start[0],HILL.z-start[1]);
export const HILL_FORWARD=[(HILL.x-start[0])/distance,(HILL.z-start[1])/distance];
export function hillXZ(u,v=0){const [dx,dz]=HILL_FORWARD;return[HILL.x+dx*u-dz*v,HILL.z+dz*u+dx*v];}
export function hillUV(x,z){const [dx,dz]=HILL_FORWARD;return[(x-HILL.x)*dx+(z-HILL.z)*dz,-(x-HILL.x)*dz+(z-HILL.z)*dx];}
export function hillRise(x,z){const[u,v]=hillUV(x,z),r=(u/HILL.length)**2+(v/HILL.width)**2;return r<1?HILL.height*(1-r)**2:0;}
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
function progress(t){
 const keys=[[207,-distance,8],[209.35,-25,11],[211.65,-.7,3],[212.45,1.7,5],[215.2,22,9]];
 let i=0;while(i<keys.length-2&&t>keys[i+1][0])i++;
 const[a,x,va]=keys[i],[b,y,vb]=keys[i+1],u=clamp((t-a)/(b-a)),h=b-a;
 return(2*u**3-3*u*u+1)*x+(u**3-2*u*u+u)*h*va+(-2*u**3+3*u*u)*y+(u**3-u*u)*h*vb;
}
export function applyHillStory(s,t){
 const a=s.actors.find(a=>a.id==='wolf');
 if(t<5){const text='仲良しの3人は、それぞれ自分の家を建てることにしました';s.scene={...s.scene,caption:text};s.branch={...s.branch,caption:{...s.branch.caption,text}};}
 if(t>=23&&t<29){
  const q=t-23,u=2.5-.68*q,[x,z]=hillXZ(u,.25),[dx,dz]=HILL_FORWARD;
  Object.assign(a,{x,z,yOffset:0,yaw:Math.atan2(-dx,-dz),motion:'walk_front',motionTime:q,walkDistance:.68*q,walkVelocity:[-.68*dx,-.68*dz],visible:true,hillSequence:'introduction'});delete a.worldY;
  const d=4.1+.35*smooth(q/6);s.camera={id:'J114_v4_wolf_hill_introduction',position:[x-dx*d,1.55,z-dz*d],target:[x,.75,z],fov:38,terrainRelative:true};s.cutOpacity=0;
 }
 if(t>=207&&t<215.2){
  const u=progress(t),j=clamp((t-211.65)/.8),hop=t>=211.65&&t<212.45?1.45*4*j*(1-j):0;
  let[x,z]=hillXZ(u),[dx,dz]=HILL_FORWARD;
  if(t<209.35){const q=clamp((t-207)/2.35),p0=[19.35,-10.4],p1=[25,-10.4],p3=hillXZ(-25),p2=[p3[0]-HILL_FORWARD[0]*11*2.35/3,p3[1]-HILL_FORWARD[1]*11*2.35/3],r=1-q;
   [x,z]=[0,1].map(i=>r**3*p0[i]+3*r*r*q*p1[i]+3*r*q*q*p2[i]+q**3*p3[i]);
   [dx,dz]=[0,1].map(i=>3*r*r*(p1[i]-p0[i])+6*r*q*(p2[i]-p1[i])+3*q*q*(p3[i]-p2[i]));
  }
  const rear=(dx*(19-x)+dz*(-z))/(Math.hypot(dx,dz)*Math.hypot(19-x,z))<-.35;
  Object.assign(a,{x,z,yOffset:hop,yaw:Math.atan2(dx,dz),motion:hop>0?'walk':'run_spiral',motionTime:t-207,walkDistance:u+distance,visible:true,runAway:rear,hillSequence:'escape',hillJump:hop>0});delete a.worldY;delete a.singleHotJump;delete a.encounterReaction;
  const blend=smooth((t-209.3)/1.2),focus=hillXZ(-2);s.camera={id:'J114_v4_hill_escape',position:[19,2.6,0],target:[x+(focus[0]-x)*blend,1.9+(9.3-1.9)*blend,z+(focus[1]-z)*blend],fov:40,terrainRelative:false};
  s.hillEscape={u,jump:hop,terrainOcclusion:true,constantScale:true};
 }
 return s;
}
