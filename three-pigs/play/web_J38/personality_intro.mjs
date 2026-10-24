import {INTRO_SCENES,PERSONALITIES} from './personality_intro_data.mjs';
import {NORMAL_WORLD,constructionStateAt,rendererHouseStates} from './story_world_state.mjs';
const clamp=x=>Math.max(0,Math.min(1,x));
const anchors={intro_pig1:[-.7,3.4],intro_pig2:[-21.9,-9.4],intro_pig3:[18,-8.4],forest_entry:[8,3.652],
straw_work:[-.7,3.4],straw_play:[-2.2,4.4],wood_work:[-21.9,-9.4],brick_work:[18,-8.4],brick_helper:[20,-8.4],
straw_door:[1.45,1.4],wood_door:[-20.65,-11.4],brick_door:[19.35,-10.4],
straw_inside:[1.45,-1.2],wood_inside:[-20.65,-14],brick_inside:[19.35,-13]};
const ids={pig1:'pig_straw',pig2:'pig_wood',pig3:'pig_brick',wolf:'wolf'};
const label={pig1:'長男',pig2:'次男',pig3:'三男',wolf:'狼',narrator:''};
const shot=(id,position,target,fov=48)=>({id,position,target,fov,terrainRelative:true});
const portrait=(id,a)=>shot(id,[a.x+2.6,1.25,a.z+4.7],[a.x,.8,a.z],42);
export const INTRO_CUTS=[0,2.5,5,7.5,10,10.8,12.4,13.8,14.7,15.5,16.9,18,18.8,20.7,21.8,22.8,24,26,27.4,29.6,32.3,34.4,35.5,38.1,40];
export function constructionAt(t){
 return Object.fromEntries(Object.entries(rendererHouseStates(constructionStateAt(t))).map(([key,h])=>[key,h.constructionStage]));
}
export function introStory(t){
 const world=constructionStateAt(t),help=world.cooperation;
 const scene=INTRO_SCENES.find(s=>t>=s.start&&t<s.end)||INTRO_SCENES[0];
 const entities=structuredClone(scene.entryState.actors);
 for(const e of scene.events)if(t>=e.at&&entities[e.entity])Object.assign(entities[e.entity],e.values);
 const actors=Object.entries(entities).map(([id,a])=>{const p=anchors[a.anchor];if(!p)throw Error('Unknown intro anchor '+a.anchor);return{id:ids[id],scriptId:id,...a,x:p[0],z:p[1],yOffset:0,yaw:0,motion:'idle',motionTime:0};});
 for(const m of scene.moves){if(t<m.start)continue;const a=actors.find(a=>a.scriptId===m.actor),u=clamp((t-m.start)/(m.end-m.start));
  const p=anchors[u<.5?m.path[0]:m.endAnchor];if(!p)throw Error('Unbound intro move');
  Object.assign(a,{x:p[0],z:p[1],anchor:u<.5?m.path[0]:m.endAnchor,yaw:0});
 }
 const a=id=>actors.find(a=>a.scriptId===id);
 if(help.phase==='deciding'){const anchor=NORMAL_WORLD.projects[help.helperProjectId].plot.workAnchor,p=anchors[anchor];Object.assign(a(help.helperId),{x:p[0],z:p[1],anchor,yaw:.7});}
 if(t<2.5){a('pig1').x+=Math.sin(t*2.5)*.09;a('pig1').yaw=Math.sin(t*1.5)*.2;}
 else if(t<5)a('pig2').yaw=t<3.65?-.7:.7;
 else if(t<7.5)a('pig3').yaw=t<6.2?.65:0;
 if(t>=7.5&&t<9.9)a('wolf').x+=Math.min(.45,(t-7.5)*.4);
 if(t>=16.9&&t<18)a('pig1').yaw=Math.sin(t*6)*.3;
 if(help.phase==='travelling'){a(help.recipientId).yaw=(Math.floor((t-help.depart)*1.3)%2)?.6:0;a(help.helperId).visible=false;}
 if(['sharing_plan','building_together'].includes(help.phase)){a(help.recipientId).yaw=.7;a(help.helperId).yaw=-.7;}
 let camera;
 if(t<10)camera=portrait('introduce_'+(t<2.5?'pig1':t<5?'pig2':t<7.5?'pig3':'wolf'),a(t<2.5?'pig1':t<5?'pig2':t<7.5?'pig3':'wolf'));
 else if(t<10.8)camera=shot('straw_materials',[1.5,1.7,7.5],[-1.3,.6,3.2],51);
 else if(t<14.7)camera=shot('straw_assembly',[8.3,3.3,10.5],[1.9,2,-1.7],49);
 else if(t<15.5)camera=shot('straw_unfinished_tie',[1.6,1.05,3.7],[.2,.65,.1],36);
 else if(t<16.9)camera=portrait('straw_proud',a('pig1'));
 else if(t<18)camera=shot('straw_play',[3.7,1.7,9.8],[-1,.85,3.6],46);
 else if(t<18.8)camera=shot('wood_materials',[-20,1.5,-5.8],[-22.1,.4,-9.1],43);
 else if(t<22.8)camera=shot('wood_assembly',[-12.8,3.2,-2.8],[-20.2,2,-14.2],48);
 else if(t<24)camera=shot('wood_unfitted_brace',[-18.7,1.7,-5.8],[-22.1,.65,-9.5],44);
 else if(t<26)camera=portrait('helper_decides',a('pig2'));
 else if(t<29.6)camera=shot('brick_recheck',[23.9,2.8,-2.5],[19.6,.9,-10.7],43);
 else if(t<32.3)camera=shot('brothers_cooperate',[21.3,1.6,-2.4],[19,.85,-8.5],43);
 else if(t<35.5)camera=shot('brick_assembly',[27.2,3.4,-2.1],[20,2,-13.4],49);
 else camera=shot('three_houses_complete',[4,9,32],[0,1,-9],56);
 const line=scene.lines.find(l=>t>=l.start&&t<l.end),caption=line?(label[line.speaker]?label[line.speaker]+'「'+line.text+'」':line.text):'';
 const subject=t<2.5?'pig1':t<5?'pig2':t<7.5?'pig3':t<10?'wolf':null;
 const houses=rendererHouseStates(world);
 const cutOpacity=scene.moves.filter(m=>!(scene.id==='PB116_03'&&m.actor==='pig2')).reduce((q,m)=>Math.max(q,clamp(1-Math.abs(t-(m.start+m.end)/2)/.2)),0);
 return{time:t,duration:116,scene:{id:scene.id,at:scene.start,title:scene.title,caption},actors,houses,world,effects:[],camera,ended:false,cutOpacity,schematicChimney:false,
 intro:{subject,label:subject?PERSONALITIES[subject].label:null,oneLine:subject?PERSONALITIES[subject].oneLine:null,construction:t>=10&&t<35.5,checking:t>=26&&t<29.6,cooperating:t>=29.6&&t<35.5},movementMode:'illustrated_construction_montage'};
}

