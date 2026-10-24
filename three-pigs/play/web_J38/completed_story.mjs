import * as BASE from './branch_story.mjs';
import {branchId} from './branch_context.mjs';
import {BUILDS} from './construction_montage.mjs';
import {HOUSE_CENTERS,constructionShot,BUILD_VIEW} from './construction_camera.mjs';
export {configureStoryBindings,storyBindings,DOORS,routeBetween,routePose,branchEvidence} from './branch_story.mjs';
export const JOYS=[
 {house:'straw',start:24.5,end:28,poseDelay:.35,label:'長男',caption:'長男「できたー！」',expression:'exuberant'},
 {house:'wood',start:43,end:46.5,poseDelay:.35,label:'次男',caption:'次男「よし、できた！」',expression:'friendly'},
 {house:'brick',start:66.5,end:70,poseDelay:.7,label:'三男',caption:'三男「うん。これで安心。」',expression:'relieved'}
];
export let STORY_DURATION=160.5,SCENES=[];
let completionAspect=960/690;
export function setCompletionAspect(aspect){completionAspect=aspect;}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function sourceTime(t){let shift=0;for(const j of JOYS){if(t<j.start)break;if(t<j.end)return j.start-shift;shift+=3.5;}return Math.round((t-shift)*1e9)/1e9;}
export function displayTime(t){return t+(t>=24.5?3.5:0)+(t>=39.5?3.5:0)+(t>=59.5?3.5:0);}
export function selectBranch(id){BASE.selectBranch(id);STORY_DURATION=id==='peace'?88:160.5;SCENES=id==='peace'?BASE.SCENES:[...BASE.SCENES.map(s=>({...s,at:displayTime(s.at)})),...JOYS.map(j=>({id:'joy_'+j.house,at:j.start,title:j.label+'の家が完成'}))].sort((a,b)=>a.at-b.at);return{id,duration:STORY_DURATION};}
function joyCamera(j,elapsed){
 const b=BUILDS.find(b=>b.id===j.house),c=HOUSE_CENTERS[j.house],T=1.2,u=Math.min(T,elapsed),omega=2*Math.PI/(b.end-b.start),angle=2*Math.PI+omega*(u/2+T/(2*Math.PI)*Math.sin(Math.PI*u/T));
 const position=[c[0]+BUILD_VIEW.radius*Math.sin(angle),b.baseY+BUILD_VIEW.height,c[2]+BUILD_VIEW.radius*Math.cos(angle)],target=[c[0],b.baseY+BUILD_VIEW.targetHeight,c[2]],q=clamp((elapsed-j.poseDelay)/2.45,0,1),w=q*q*(3-2*q),actor=[c[0]-.65,b.baseY+.87,c[2]+3.9];
 const end=[c[0]+1.8,b.baseY+2.35,c[2]+7.7],look=[c[0]+.2,c[2]+1.0],lookDistance=Math.hypot(end[0]-look[0],end[2]-look[1]),forward=[(look[0]-end[0])/lookDistance,(look[1]-end[2])/lookDistance],footDistance=(actor[0]-end[0])*forward[0]+(actor[2]-end[2])*forward[1],pitch=Math.atan2(end[1]-b.baseY,footDistance)-Math.atan(.91*Math.tan(24*Math.PI/180)*Math.max(1,1.6/completionAspect));
 const aim=[look[0],end[1]-Math.tan(pitch)*lookDistance,look[1]];

 for(let i=0;i<3;i++){position[i]+=(end[i]-position[i])*w;target[i]+=(aim[i]-target[i])*w;}
 return{id:'J114_v7_'+j.house+'_feet_in_frame',position,target,fov:48,terrainRelative:false,angle,pushWeight:w,completionFraming:true};
}
function completion(s,j,t){const c=HOUSE_CENTERS[j.house],elapsed=t-j.start,cam=joyCamera(j,elapsed),pig=s.actors.find(a=>a.id==='pig_'+j.house),joy=elapsed+1e-8>=j.poseDelay;
 for(const a of s.actors)a.visible=a===pig;
 Object.assign(pig,{visible:true,x:c[0]-.65,z:c[2]+3.9,yOffset:0,yaw:cam.angle,motion:joy?'celebrate_home':'idle',motionTime:elapsed-j.poseDelay,anchor:'completed_'+j.house+'_front'});delete pig.worldY;delete pig.buildMirror;
 Object.assign(s.houses[j.house],{intact:true,time:0,constructionStage:5,door:'closed',blowAway:false});
 s.camera=cam;s.build=null;s.completion={actor:pig.id,house:j.house,elapsed,joy,cameraAngle:cam.angle,expression:j.expression};s.effects=[];s.cutOpacity=0;s.intro=null;
 s.scene={id:'joy_'+j.house,at:j.start,title:j.label+'の家ができた',caption:joy?j.caption:''};
 s.drama={kind:'completion_joy',note:'家を完成させた喜び',recall:null};
 s.branch.caption={...s.branch.caption,text:s.scene.caption};return s;
}
function transition(s,from,to,u,duration,endVelocity=[0,0,0]){const h00=2*u**3-3*u*u+1,h01=-2*u**3+3*u*u,h11=u**3-u*u;
 const path=u=>{const a=2*u**3-3*u*u+1,b=-2*u**3+3*u*u,c=u**3-u*u;return from.position.map((x,i)=>a*x+b*to.position[i]+c*duration*endVelocity[i]);};
 const pos=path(u),target=from.target.map((x,i)=>h00*x+h01*to.target[i]);
 let lift=0;for(let k=0;k<=40;k++){const p=path(k/40);for(const hc of Object.values(HOUSE_CENTERS)){const d=Math.hypot(p[0]-hc[0],p[2]-hc[2]);lift=Math.max(lift,5*Math.exp(-((d/5)**2)));}}
 const up=lift*Math.sin(Math.PI*u)**2;pos[1]+=up;target[1]+=up*.6;
 s.camera={id:'J78_continuous_transfer',position:pos,target,fov:48,terrainRelative:false};s.cutOpacity=0;
}
export function sampleStory(seconds){if(branchId()==='peace')return BASE.sampleStory(seconds);
 const t=clamp(Number.isFinite(seconds)?seconds:0,0,160.5),src=sourceTime(t),s=BASE.sampleStory(src);
 s.animationTime=src;s.time=t;s.duration=160.5;s.ended=t>=160.5;s.scene={...s.scene,at:displayTime(s.scene.at)};
 const j=JOYS.find(j=>t>=j.start&&t<j.end);if(j)return completion(s,j,t);
 for(let i=0;i<2;i++){const a=JOYS[i],b=BUILDS[i+1],start=BUILDS[i].end,end=b.start;if(src>=start&&src<end){const c=HOUSE_CENTERS[b.id],to={position:[c[0],b.baseY+4.5,c[2]+15],target:[c[0],b.baseY+1.9,c[2]],fov:48};transition(s,joyCamera(a,3.5),to,(src-start)/(end-start),end-start,[0,0,0]);}}
 if(src>=59.5&&src<64){const to=BASE.sampleStory(63.999).camera;transition(s,joyCamera(JOYS[2],3.5),to,(src-59.5)/4.5,4.5);}
 return s;
}
export function createStoryClock(){let time=0,playing=false;return{get time(){return time},get playing(){return playing},play(){if(time>=STORY_DURATION)time=0;playing=true;},pause(){playing=false;},reset(){time=0;playing=false;},seek(t){time=clamp(Number.isFinite(t)?t:0,0,STORY_DURATION);},tick(dt){if(playing)time=clamp(time+clamp(dt,0,.1),0,STORY_DURATION);if(time>=STORY_DURATION-1e-8){time=STORY_DURATION;playing=false;}return sampleStory(time);}};}
selectBranch('normal');
