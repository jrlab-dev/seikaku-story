const clamp=u=>Math.max(0,Math.min(1,u));
const mix=(a,b,u)=>a.map((v,i)=>v+(b[i]-v)*u);
const shot=(id,position,target,fov,extra={})=>({id,position,target,fov,terrainRelative:true,...extra});
function drift(id,t,start,end,a,b,target,fov,targetEnd=target){const u=clamp((t-start)/(end-start)),s=u*u*(3-2*u);return shot(id,mix(a,b,s),mix(target,targetEnd,s),fov,{movement:'short_dolly',interval:[start,end]});}
export const CAMERA_CUTS=[0,4.1,7.8,8,10.2,12.2,14,15.65,19,21,23.8,28,29.65,31.2,33.5,36,39.2,43,44.65,48,54,57.8,61,66.6,68,71,75,76.4,79.2];
export function cameraForStory(scene,t,actors){
 const w=actors.find(a=>a.id==='wolf');
 if(t<4.1)return drift('village_establish',t,0,4.1,[4,9,32],[3.5,8.6,30.5],[0,1,-9],56);
 if(t<7.8)return drift('pig_introduction',t,4.1,7.8,[3.5,1.2,5.1],[3.3,1.15,4.8],[1.45,.85,1.4],44);
 if(t<8)return shot('door_before_arrival',[5.6,1.7,6.3],[1.45,1.6,-1],48);
 if(t<10.2)return shot('wolf_arrival',[w.x+2.8,1.4,w.z+5],[w.x,.8,w.z],46);
 if(t<12.2)return shot('wolf_request',[5.4,1.25,1.9],[1.45,.85,3.1],46);
 if(t<14)return shot('straw_door_reply',[5.6,1.7,6.3],[1.45,1.6,-1],48);
 if(t<15.65)return drift('wolf_straw_breath',t,14,15.65,[5.4,1.25,1.9],[5.1,1.15,2.0],[1.45,.85,3.1],46);
 if(t<19)return drift('straw_collapse_low',t,15.65,19,[7.8,1.1,7.3],[8.3,1.2,7.4],[.5,2,-1],54);
 if(t<21)return shot('wood_arrival_wide',[-14,2.4,-3.5],[-20.3,1.4,-13],52);
 if(t<23.8)return drift('pig_help_reaction',t,21,23.8,[-18.5,1.2,-7.2],[-18.9,1.1,-7.8],[-20.65,.8,-11.4],43);
 if(t<28)return shot('wood_door_reply',[-15.5,2,-5.2],[-20.65,1.5,-14],46);
 if(t<29.65)return drift('wolf_wood_breath',t,28,29.65,[-23.9,1.3,-8.5],[-23.6,1.2,-8.7],[-18.4,.85,-9.5],40);
 if(t<31.2)return drift('wood_gust_arrival',t,29.65,31.2,[-11,1.1,-12.5],[-11.2,1.2,-12.3],[-20,2,-13.8],58);
 if(t<33.5)return drift('wood_collapse_low',t,31.2,33.5,[-13.6,.95,-4.2],[-13.9,1.05,-4.4],[-20,1.8,-14],55);
 if(t<36)return shot('brick_arrival_wide',[25,2.4,-2.5],[20,1.4,-12],50);
 if(t<39.2)return drift('pigs_relief_reaction',t,36,39.2,[21.5,1.35,-5],[21.2,1.3,-5.4],[19.4,.8,-9.7],43);
 if(t<43)return shot('brick_door_close',[24,1.8,-3],[19.7,1.9,-13],46);
 if(t<44.65)return drift('wolf_brick_blow',t,43,44.65,[23.1,1.3,-10.1],[22.8,1.2,-10.2],[19.35,.85,-8.2],42);
 if(t<48)return shot('brick_blow_reverse',[25,2.2,-2.5],[20,1.8,-12],48);
 if(t<54)return drift('brick_stands_firm',t,48,54,[26,1,-4],[25.6,1.15,-3.8],[20,2.5,-14],53);
 if(t<57.8)return shot('wolf_chimney_idea',[21.8,1.1,-4.8],[19.35,.85,-8.2],44);
 if(t<61)return shot('chimney_approach',[28,6.5,-3],[21.13,4.8,-14.81],48);
 if(t<66.6)return shot('chimney_plop',[28,6.5,-3],[21.13,4.8,-14.81],48);
 if(t<68)return shot('brick_exit_setup',[25,2.4,-2.5],[20,1.4,-12],50);
 if(t<71)return shot('wolf_departure_reaction',[w.x+3.2,1.4,w.z+5],[w.x,.85,w.z],44);
 if(t<75)return shot('wolf_forest_departure',[w.x+4,2.4,w.z+8],[w.x,1,w.z],48);
 if(t<76.4)return shot('pigs_emerge',[22,2.1,-2.5],[19.7,1,-10.1],42);
 if(t<79.2)return shot('three_pigs_close',[20,1.2,-4.8],[19.7,.8,-8.8],46);
 return drift('warm_closing_pullback',t,79.2,84,[20,1.2,-4.8],[21.4,1.7,-2.7],[19.7,.8,-8.8],46,[19.7,1.2,-10.4]);
}
