import {createBlowawayDeparture} from './no-extra-departure.mjs';
import {applyRoofRattle,restoreRoofRattle} from './roof_rattle.mjs';
import {createHouseCollapseController} from './house-collapse-controller.mjs';
export async function createWoodStoryCollapse({placement,loadAsset,prepare,THREE,collapseRequired=true}){
 if(!placement)throw Error('Wood placement is not ready');
 const staticScene=placement.children[0];
 if(!collapseRequired){staticScene.updateMatrix();const base=staticScene.matrix.clone();const deform=amount=>{staticScene.matrixAutoUpdate=false;staticScene.matrix.copy(base).premultiply(new THREE.Matrix4().set(1,-.5575561835*amount,0,0,0,1,0,0,0,-.8301392065*amount,1,0,0,0,0,1));};return{deform,reset(){staticScene.visible=true;deform(0);},seek(){},get state(){return 'intact';}};}
 const gltf=await loadAsset('./assets/Wood_VillageTopple_J59.glb');
 prepare(gltf.scene);placement.add(gltf.scene);
 const controller=createHouseCollapseController(THREE,{staticScene,collapseScene:gltf.scene,animations:gltf.animations,clipName:'Wood_VillageTopple_J59'});
 const departure=createBlowawayDeparture(THREE,gltf.scene,gltf.animations.find(c=>c.name==='Wood_VillageTopple_J59'),[-.5575561834996304,0,-.8301392065438943]);
 const deformationRoots=[staticScene,gltf.scene],bases=deformationRoots.map(o=>{o.updateMatrix();return o.matrix.clone();});
 const deform=amount=>{deformationRoots.forEach((o,i)=>{const m=new THREE.Matrix4().set(1,-.5575561835*amount,0,0,0,1,0,0,0,-.8301392065*amount,1,0,0,0,0,1);o.matrixAutoUpdate=false;o.matrix.copy(bases[i]).premultiply(m);});};
 return {...controller,deform,reset(){deform(0);restoreRoofRattle(gltf.scene);departure.reset();controller.reset();},seek(t){restoreRoofRattle(gltf.scene);departure.before();controller.seek(t);departure.apply(t);},get state(){return controller.state;}};
}
