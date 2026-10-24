export const COMPLETION={start:24.5,end:28,poseAt:24.85,settleSeconds:1.2};
export function applyStrawCompletion(s,t){
 if(t<COMPLETION.start||t>=COMPLETION.end)return s;
 const elapsed=t-COMPLETION.start,T=COMPLETION.settleSeconds,u=Math.min(T,elapsed),omega=2*Math.PI/10.5;
 const angle=2*Math.PI+omega*(u/2+T/(2*Math.PI)*Math.sin(Math.PI*u/T));
 s.camera={id:'J77_completion_settle',position:[2.1+15*Math.sin(angle),4.5,-2.25+15*Math.cos(angle)],target:[2.1,1.9,-2.25],fov:48,terrainRelative:false};
 const pig=s.actors.find(a=>a.id==='pig_straw');for(const a of s.actors)a.visible=a===pig;
 Object.assign(pig,{visible:true,x:2.1,z:1.65,yOffset:0,yaw:angle,motion:t>=COMPLETION.poseAt?'celebrate_home':'idle',motionTime:t-COMPLETION.poseAt,anchor:'J77_completed_straw_front'});delete pig.worldY;delete pig.buildMirror;
 Object.assign(s.houses.straw,{intact:true,time:0,constructionStage:5,door:'closed',blowAway:false});
 s.build=null;s.completion={actor:pig.id,house:'straw',elapsed,joy:t>=COMPLETION.poseAt,cameraAngle:angle};s.effects=[];s.cutOpacity=0;s.intro=null;
 s.scene={...s.scene,title:'長男の家ができた',caption:t>=COMPLETION.poseAt?'長男「できたー！」':''};
 s.drama={kind:'completion_joy',note:'家を完成させた喜び',recall:null};return s;
}
