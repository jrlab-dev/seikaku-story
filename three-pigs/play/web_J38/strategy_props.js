import * as THREE from 'three';
import {CENTERS} from './endings/strategy.mjs';
import {createHouseDefence} from './strategy_house_props.js';
export function installStrategyContact(layer,ground){
 const update=layer.update.bind(layer);
 layer.update=(camera,dt)=>{
  const result=update(camera,dt);
  if(!layer.costumeSceneState?.strategy&&!layer.costumeSceneState?.strategyConstruction&&!layer.costumeSceneState?.strategyPrelude&&!layer.costumeSceneState?.houseOccupancy)return result;
  for(const a of layer.actors){
   if(!a.requestedVisible)continue;
   const foot=a.paperStatus?.running?(a.paperStatus.visibleFootY??0):0;
   const state=layer.costumeSceneState.actors.find(p=>p.id===a.data.id);
   a.root.position.y=(state?.strategyWorldY??state?.worldY??ground(a.root.position.x,a.root.position.z))+.018-foot+(state?.strategyLift??0);
   const p=a.shadow.geometry.attributes.position;
   for(let k=0;k<p.count;k++)p.setY(k,ground(a.root.position.x+p.getX(k),a.root.position.z+p.getZ(k))-a.root.position.y+.015);
   p.needsUpdate=true;a.shadow.visible=true;
  }
  return result;
 };
}
export function createStrategyProps(scene,houses={},entries={}){
 return createHouseDefence(scene,entries,houses);
}
