import * as THREE from 'three';
import {createPuzzleEffect} from './puzzle-effects-controller.mjs';
export async function createPuzzleEffectsLayer({scene,loadAsset,prepare,ground,required=['bomb','explosion_house','explosion_small']}){
 const make=async name=>{const g=await loadAsset('./assets/'+name+'.glb');const e=createPuzzleEffect(THREE,g);prepare?.(e.scene);e.scene.traverse(o=>{if(o.isMesh){o.castShadow=false;}});scene.add(e.scene);e.scene.visible=false;return e;};
 const names={bomb:'Bomb_Fuse_v1',explosion_house:'Explosion_House_v1',explosion_small:'Explosion_Small_v1'},fx={};await Promise.all(required.map(async k=>{if(names[k])fx[k]=await make(names[k]);}));
 return{apply(list){const on=new Set();
  for(const p of [].concat(list||[]).filter(Boolean)){const e=fx[p.kind];if(!e)continue;on.add(p.kind);const[x,y,z]=p.at;e.scene.position.set(x,(ground?ground(x,z):0)+(y||0),z);e.seek(Math.max(.001,p.time));if(p.kind==='bomb')e.scene.visible=true;}
  for(const[k,e]of Object.entries(fx))if(!on.has(k))e.scene.visible=false;}};
}
