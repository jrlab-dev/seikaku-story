import * as THREE from 'three';
export function createShelterDoors(entries){
 const doors={};const key=(p,ids)=>ids.map(i=>[p.getX(i),p.getY(i),p.getZ(i)].map(v=>Math.round(v*1e5)).join(',')).sort().join(';');
 for(const [id,{source,placement}] of Object.entries(entries)){
  const staticRoot=placement.children[0],hinge=new THREE.Group();hinge.name='J80_'+id+'_door_hinge';hinge.position.set(-1.405,.28,2.19);const keys=new Set();let leafTriangles=0,removed=0;
  source.updateMatrixWorld(true);
  source.traverse(o=>{if(!o.isMesh)return;let n=o,door=false;while(n){if(n.name.includes('__Door'))door=true;n=n.parent;}if(!door||!/oak|iron/i.test(o.material.name))return;
   const g=o.geometry.clone().applyMatrix4(o.matrixWorld),p=g.attributes.position,ix=g.index?.array||Array.from({length:p.count},(_,i)=>i),moving=[];
   const groups=new Map(),parent=Array.from({length:p.count},(_,i)=>i),find=i=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;},join=(a,b)=>{parent[find(a)]=find(b);},weld=new Map();
   for(let i=0;i<p.count;i++){const k=[p.getX(i),p.getY(i),p.getZ(i)].map(v=>Math.round(v*1e5)).join(',');if(weld.has(k))join(i,weld.get(k));else weld.set(k,i);}
   for(let i=0;i<ix.length;i+=3){join(ix[i],ix[i+1]);join(ix[i],ix[i+2]);}
   for(let i=0;i<ix.length;i+=3){const k=find(ix[i]);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(...ix.slice(i,i+3));}
   for(const ids of groups.values()){const box=new THREE.Box3();for(const k of ids)box.expandByPoint(new THREE.Vector3().fromBufferAttribute(p,k));
    if(box.min.x>=-1.405&&box.max.x<=.10&&box.max.y<=2.70&&box.min.z>=2.170&&box.max.z<=2.45){moving.push(...ids);for(let i=0;i<ids.length;i+=3){keys.add(key(p,ids.slice(i,i+3)));leafTriangles++;}}}

   if(moving.length){g.setIndex(moving);const compact=g.toNonIndexed();g.copy(compact);g.translate(1.405,-.28,-2.19);g.computeBoundingSphere();const m=new THREE.Mesh(g,o.material);m.castShadow=m.receiveShadow=true;hinge.add(m);}
  });
  staticRoot.traverse(o=>{if(!o.isMesh)return;const g=o.geometry.clone(),p=g.attributes.position,ix=g.index?.array||Array.from({length:p.count},(_,i)=>i),keep=[];
   for(let i=0;i<ix.length;i+=3){const ids=Array.from(ix.slice(i,i+3));if(keys.has(key(p,ids)))removed++;else keep.push(...ids);}if(keep.length!==ix.length){g.setIndex(keep);g.computeBoundingSphere();o.geometry=g;}});
  if(!leafTriangles||removed!==leafTriangles)throw Error(id+' leaf partition mismatch '+removed+'/'+leafTriangles);
  staticRoot.add(hinge);doors[id]={hinge,placement,staticRoot,leafTriangles,removed,open:0};
 }
 return{apply(states){for(const[id,d]of Object.entries(doors)){d.open=states[id].doorOpen??0;d.hinge.rotation.y=(states[id].doorSwing==='inward'?1:-1)*Math.PI*.62*d.open;}},record(){return Object.fromEntries(Object.entries(doors).map(([id,d])=>{d.placement.updateMatrixWorld(true);const cacheKey=d.hinge.rotation.y+'/'+d.open+'/'+d.staticRoot.visible+'/'+d.staticRoot.matrixWorld.elements.join(',');if(d.cacheKey===cacheKey)return[id,d.cached];const origin=new THREE.Vector3(-.65,1.1,3.4).applyMatrix4(d.placement.matrixWorld),direction=new THREE.Vector3(0,0,-1),ray=new THREE.Raycaster(origin,direction,0,3.2),hits=ray.intersectObject(d.staticRoot,true).filter(h=>{let n=h.object;while(n){if(!n.visible)return false;n=n.parent;}return true;});d.cacheKey=cacheKey;d.cached={open:d.open,angleDegrees:d.hinge.rotation.y*180/Math.PI,leafTriangles:d.leafTriangles,removed:d.removed,entranceRayHits:hits.slice(0,8).map(h=>({name:h.object.name,material:h.object.material.name,distance:h.distance,point:h.point.toArray()})),leafBounds:new THREE.Box3().setFromObject(d.hinge).toArray?.()??{min:new THREE.Box3().setFromObject(d.hinge).min.toArray(),max:new THREE.Box3().setFromObject(d.hinge).max.toArray()}};return[id,d.cached];}));}};
}
