import {screamShake} from './scream_shake.mjs';
export function createChimneyReaction(scene){
 let root=null,base=null,last=null;
 return{apply(c){root??=scene.getObjectByName('Approved_brick_placement_once');if(!root)throw Error('J105 brick placement missing');base??={x:root.position.x,z:root.rotation.z};
 const shake=screamShake(c?.elapsed??-1),amplitude=shake.house;
 root.position.x=base.x+.06*amplitude;root.rotation.z=base.z+.005*amplitude;root.updateMatrixWorld(true);
 last={...shake,dx:root.position.x-base.x,roll:root.rotation.z-base.z,frequencyHz:2.4,target:root.name,restored:amplitude===0};
 },record(){return last;}};
}
