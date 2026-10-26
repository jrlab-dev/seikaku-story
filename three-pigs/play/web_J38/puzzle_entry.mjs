const CENTERS={straw:[2.1,0,-2.25],wood:[-20,-.14,-15],brick:[20,1.06,-14]};
const OLD_DOOR={straw:[1.45,-.05,.3],wood:[-20.65,-12.8,.16],brick:[19.35,-11.8,1.36]};
const OWNER={straw:'pig_straw',wood:'pig_wood',brick:'pig_brick'};
const clamp=x=>Math.max(0,Math.min(1,x)),mix=(a,b,u)=>a+(b-a)*u;
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
const special=h=>h?.visual==='treehouse'||h?.visual==='bunker';
function clearContact(a){for(const k of ['ownerDoor','encounterClose','encounterReaction','reactionBuild','stance'])delete a[k];}
function caption(s,text){s.scene={...s.scene,caption:text};s.branch={...s.branch,caption:{...s.branch.caption,text}};}
export function entryPoint(kind,site,progress){
 const [cx,cy,cz]=CENTERS[site],p=clamp(progress);let z,y;
 if(kind==='treehouse'){
  if(p<.4){const u=p/.4;z=mix(6.2,2.7,u);y=0;}
  else if(p<.85){const u=(p-.4)/.45;z=mix(2.7,1.3,u);y=2.42*u;}
  else{const u=(p-.85)/.15;z=mix(1.3,.5,u);y=2.42;}
 }else{
  if(p<.5){const u=p/.5;z=mix(6.2,1.15,u);y=.38*smooth(u);}
  else if(p<.85){const u=(p-.5)/.35;z=mix(1.15,.03,u);y=mix(.38,-.34,u);}
  else{const u=(p-.85)/.15;z=mix(.03,-.2,u);y=mix(-.34,-1.5,u);}
 }
 return{x:cx-.65,z:cz+z,worldY:cy+y,progress:p};
}
function putPath(a,kind,site,p,escaping=false,outward=false,outsideZ=5.2){
 const point=entryPoint(kind,site,outward?1-p:p);clearContact(a);
 if(outward){const approach=kind==='treehouse'?.4:.5;point.z+=(outsideZ-6.2)*(1-clamp((1-p)/approach));}
 Object.assign(a,point,{yOffset:0,yaw:outward?0:Math.PI,motion:p>0&&p<1?(escaping?'paper_run':'walk'):'idle'});
 const routeProgress=outward?1-p:p;
 if((kind==='treehouse'&&routeProgress<.4)||(kind==='bunker'&&routeProgress<.5)){
  if(kind==='bunker')a.yOffset=point.worldY-CENTERS[site][1];
  delete a.worldY;
 }
 if(a.motion!=='paper_run'){delete a.shelterRunner;delete a.runAway;}
 if(kind==='bunker'&&((!outward&&p>=.999)||(outward&&p<=.001)))a.visible=false;
 a.puzzleEntry={house:site,kind,progress:p,outward};
 return point;
}
function cameraFor(s,site,kind,outside=false){
 const[cx,cy,cz]=CENTERS[site];
 s.camera=kind==='treehouse'?{id:'puzzle_treehouse_entry_'+site,position:[cx+6,cy+5.1,cz+10.7],target:[cx-.5,cy+2.1,cz+2.5],fov:48,terrainRelative:false}:{id:'puzzle_bunker_entry_'+site,position:[cx+4.8,cy+3.8,cz+7],target:[cx-.55,cy+.35,cz+.8],fov:46,terrainRelative:false};
 if(kind==='bunker'&&outside)s.camera={id:'puzzle_bunker_egress_'+site,position:[cx+6,cy+4.2,cz+11],target:[cx-.55,cy+.65,cz+2.7],fov:46,terrainRelative:false};
}
function host(a,site,kind,open){
 clearContact(a);delete a.reactionPose;
 const[cx,cy,cz]=CENTERS[site];
 Object.assign(a,{visible:true,motion:'idle',yaw:0,yOffset:0,x:cx+.25,z:cz+1.5,worldY:cy+2.42});
 if(kind==='bunker')Object.assign(a,{x:cx+.45,z:cz+.75,worldY:cy});
 a.puzzleEntry={house:site,kind,host:true};
}
function bodyInside(s,a,site,kind){
 const[dx,dz]=OLD_DOOR[site],p=clamp((dz+4-a.z)/5.55);
 putPath(a,kind,site,p,!!a.shelterRunner||a.motion==='paper_run');
}
export function applyPuzzleEntries(s,sites){
 if(!Object.values(sites).some(special))return s;
 const t=s.time,actors=s.actors||[];
 if(t>=110&&t<114.7){
  for(const site of ['straw','wood','brick']){
   const h=sites[site];if(!special(h))continue;
   const a=actors.find(a=>a.id===OWNER[site]);if(!a||a.visible===false)continue;
   const progress=clamp((t-111)/3.2),start=h.visual==='treehouse'?.25:.218;
   putPath(a,h.visual,site,start+(1-start)*progress);
   if(t<=111)a.motion='idle';
   if(h.visual==='bunker')Object.assign(s.houses[site],{doorOpen:t<114.35?1:1-smooth((t-114.35)/.35),door:'open'});
  }
 }
 const first=sites.straw;
 if(first.visual==='treehouse'&&t>=121.5&&t<131){
  const text=s.scene?.caption||'';
  if(/戸|扉|バーン/.test(text))caption(s,'長男は、ツリーハウスの奥へ引っこみました。');
  else if(text==='長男「だめ、開けないよ。」')caption(s,'長男「だめ、上がってこないで。」');
  else if(text==='長男「ごめんね。でも開けられないよ。」')caption(s,'長男「ごめんね。でも上がってこないで。」');
  if(s.comic?.kind==='door'||/バーン/.test(s.comic?.text||''))s.comic=null;
 }
 if(special(first)&&s.encounter&&t>=121.5&&t<127.5){
  const a=actors.find(a=>a.id==='pig_straw');
  if(a?.visible!==false){
   clearContact(a);const[cx,cy,cz]=CENTERS.straw;
   const inside=smooth((s.encounter.elapsed-1.35)/.75);
   Object.assign(a,{x:cx-.65,z:cz+1.3-.7*inside,worldY:cy+2.42,yOffset:0,motion:'idle'});
   if(first.visual==='bunker')Object.assign(a,{x:cx-.65,z:cz+.45,worldY:cy-.5-1.1*inside,visible:inside<.999});
   cameraFor(s,'straw',first.visual);
   if(/戸|扉|バーン/.test(s.scene.caption)){caption(s,first.visual==='treehouse'?'長男は、はしごの上から家の奥へ引っこみました。':'長男は、地下へもぐってふたを閉めました。');s.comic=null;}
  }
 }
 if(s.shelter&&special(sites[s.shelter.house])){
  const site=s.shelter.house,kind=sites[site].visual,owner=actors.find(a=>a.id===OWNER[site]);
  for(const e of s.shelter.entries||[]){
   const a=actors.find(a=>a.id===e.id);if(!a||a.visible===false)continue;
   const oldZ=a.z,[dx,dz]=OLD_DOOR[site],p=clamp((dz+4-oldZ)/5.55);
   if(p>0)bodyInside(s,a,site,kind);
   Object.assign(e,{x:a.x,z:a.z,fullyInside:p>=.999,visible:a.visible,progress:p});
  }
  if(owner?.visible!==false)host(owner,site,kind,s.shelter.doorOpen);
  if(owner&&kind==='treehouse'&&s.shelter.entries.every(e=>e.fullyInside)&&s.shelter.doorOpen<1){
   const u=1-s.shelter.doorOpen,[cx,cy,cz]=CENTERS[site];
   Object.assign(owner,{x:mix(cx+.25,cx-.65,u),z:mix(cz+1.5,cz+.5,u),worldY:cy+2.42,motion:u>0&&u<1?'walk':'idle',yaw:Math.PI});
  }
  if(owner&&kind==='bunker'&&s.shelter.entries.every(e=>e.fullyInside)&&s.shelter.doorOpen<1){
   const u=1-s.shelter.doorOpen,[cx,cy,cz]=CENTERS[site];
   Object.assign(owner,{x:mix(cx+.45,cx-.65,u),z:mix(cz+.75,cz+.3,u),worldY:cy-1.5*u,motion:'walk',yaw:Math.PI});
  }
  if(owner&&kind==='bunker'&&s.shelter.doorOpen<=.01)owner.visible=false;
  s.shelter.allInside=s.shelter.entries.every(e=>e.fullyInside);
  cameraFor(s,site,kind);
  if(/戸|扉/.test(s.scene.caption))caption(s,kind==='treehouse'?'長男たちは、はしごを上ってツリーハウスへ逃げこみました。':'みんな地下へ逃げこむと、ふたを閉めました。');
  if(kind==='treehouse'&&s.comic?.kind==='door')s.comic=null;
 }
 if(/_holds_inside$/.test(s.camera?.id||'')){
  const site=s.camera.id.includes('straw')?'straw':'wood',h=sites[site];
  if(h?.visual==='bunker'){
   for(const a of actors)if(a.id.startsWith('pig_'))a.visible=false;
   cameraFor(s,site,'bunker');
  }
 }
 if(first.visual==='bunker'&&s.camera?.id==='J116_straw_holds_door'){
  const a=actors.find(a=>a.id==='pig_straw');
  if(a?.visible!==false)putPath(a,'bunker','straw',clamp((a.z+.78)/1.93),false,true,3.4);
  cameraFor(s,'straw','bunker',true);
  if(/戸|扉/.test(s.scene.caption))caption(s,'長男は、ふたを開けて地下から外へ出ました。');
 }
 if(sites.wood.visual==='bunker'&&s.camera?.id==='J116_wood_trio_at_door'){
  for(const a of actors)if(['pig_straw','pig_wood'].includes(a.id))a.visible=false;
  if(t>=178)cameraFor(s,'wood','bunker',true);
  if(/戸|扉/.test(s.scene.caption))caption(s,'地下シェルターのふたが開いて……');
 }
 if(s.egress&&s.personality?.ending?.id!=='peace'&&special(sites[s.egress.house])){
  const site=s.egress.house,kind=sites[site].visual,[dx,dz]=OLD_DOOR[site];
  for(const a of actors){if(a.visible===false||!a.id.startsWith('pig_'))continue;
   if(site==='wood'&&a.id==='pig_brick'&&['wood_holds','karakuri_wood'].includes(s.personality?.ending?.id))continue;
   const original={x:a.x,z:a.z,motion:a.motion,yOffset:a.yOffset??0},p=clamp((a.z-(dz-1.5))/4.5);putPath(a,kind,site,p,false,true);
   const merge=smooth(Math.max((p-.8)/.2,((s.storyTime??0)-219.25)/.9));a.x=mix(a.x,original.x,merge);a.z=mix(a.z,original.z,merge);a.yOffset=mix(a.yOffset??0,original.yOffset,merge);
   if(merge>=.999)a.motion=original.motion;
  }
  cameraFor(s,site,kind,true);
 }
 if(s.peace&&special(first)){
  const a=actors.find(a=>a.id==='pig_straw'),kind=first.visual;
  if(a?.visible!==false&&s.peace.phase==='listen'){
   const[cx,cy,cz]=CENTERS.straw;clearContact(a);Object.assign(a,{x:cx-.65,z:cz+1.15,worldY:cy+2.42});
   if(kind==='bunker')Object.assign(a,{z:cz+.45,worldY:cy-.5});
  }
  if(a?.visible!==false&&['step_out','gather'].includes(s.peace.phase)){
   const p=clamp((a.z+.58)/3.58);putPath(a,kind,'straw',p,false,true,5.25);a.x-=1.45*smooth((p-.8)/.2);
  }
  if(['listen','step_out'].includes(s.peace.phase))cameraFor(s,'straw',kind);
  if(/戸|扉/.test(s.scene.caption))caption(s,kind==='treehouse'?'長男は、ツリーハウスの入口から話を聞きました。':'長男は、ふたを少し開けて話を聞きました。');
 }
 return s;
}
