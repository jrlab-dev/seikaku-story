import * as THREE from 'three';
export function connectedParts(g){
 const p=g.attributes.position,ix=g.index?.array||Array.from({length:p.count},(_,i)=>i),parent=Array.from({length:p.count},(_,i)=>i),find=i=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;},join=(a,b)=>parent[find(a)]=find(b),weld=new Map(),groups=new Map();
 for(let i=0;i<p.count;i++){const key=[p.getX(i),p.getY(i),p.getZ(i)].map(x=>Math.round(x*1e5)).join(',');if(weld.has(key))join(i,weld.get(key));else weld.set(key,i);}
 for(let i=0;i<ix.length;i+=3){join(ix[i],ix[i+1]);join(ix[i],ix[i+2]);}
 for(let i=0;i<ix.length;i+=3){const k=find(ix[i]);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(...ix.slice(i,i+3));}
 return [...groups.values()].map(ids=>{const box=new THREE.Box3();for(const i of ids)box.expandByPoint(new THREE.Vector3().fromBufferAttribute(p,i));return{ids,box};});
}
const moving=b=>b.min.x>=-1.405&&b.max.x<=.10&&b.max.y<=2.70&&b.min.z>=2.170&&b.max.z<=2.45;
export function reviseStrawDoor(source){
 if(source.userData.singleDoorV5)return;const door=source.getObjectByName('Straw__Door');if(!door)throw Error('Straw door missing');source.updateMatrixWorld(true);let iron;const old=[];let planks=0;
 door.traverse(o=>{if(!o.isMesh)return;if(/iron/i.test(o.material.name)){iron=o.material;old.push(o);return;}if(!/oak/i.test(o.material.name))return;
  o.geometry=o.geometry.clone();const p=o.geometry.attributes.position;
  for(const part of connectedParts(o.geometry)){const b=part.box;if(!moving(b)||b.max.y-b.min.y<2.2)continue;
   const cx=(b.min.x+b.max.x)/2,idx=Math.max(0,Math.min(7,Math.round((cx+1.27)/.174))),newCenter=-1.4+(idx+.5)*1.46/8,scale=.1785/(b.max.x-b.min.x);
   for(const i of new Set(part.ids))p.setX(i,newCenter+(p.getX(i)-cx)*scale);planks++;
  }p.needsUpdate=true;o.geometry.computeBoundingSphere();
 });
 if(planks!==8||!iron)throw Error('Unexpected straw leaf source '+planks);
 for(const m of old)m.removeFromParent();
 const add=(g,x,y,z)=>{const m=new THREE.Mesh(g,iron);m.name='Single_leaf_hardware';m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;door.add(m);return m;};
 for(const y of [.80,2.16]){add(new THREE.BoxGeometry(1.25,.062,.035),-.73,y,2.3275);for(const x of [-1.31,-.15])add(new THREE.SphereGeometry(.023,8,6),x,y,2.354);const pivot=add(new THREE.CylinderGeometry(.032,.032,.18,8),-1.365,y,2.30);}
 add(new THREE.BoxGeometry(.075,.14,.025),-.14,1.43,2.3275);const ring=add(new THREE.TorusGeometry(.074,.014,8,20),-.14,1.37,2.36);
 source.userData.singleDoorV5={leafCount:1,handleCount:1,hingeSide:'left',planks};source.updateMatrixWorld(true);
}
export function reviseCollapseDoor(collapse,clip,source){
 reviseStrawDoor(source);const left=collapse.getObjectByName('door_leaf_left'),right=collapse.getObjectByName('door_leaf_right');if(!left||!right)throw Error('Collapse door leaves missing');collapse.updateMatrixWorld(true);source.updateMatrixWorld(true);
 for(const node of [left,right]){const meshes=[];node.traverse(o=>{if(o.isMesh)meshes.push(o);});for(const m of meshes){if(m===node){m.geometry=new THREE.BufferGeometry();}else m.removeFromParent();}}
 const inverse=left.matrixWorld.clone().invert();let count=0;
 source.getObjectByName('Straw__Door').traverse(o=>{if(!o.isMesh)return;const g=o.geometry.clone().applyMatrix4(o.matrixWorld),ids=connectedParts(g).filter(p=>moving(p.box)).flatMap(p=>p.ids);if(!ids.length)return;g.setIndex(ids);g.applyMatrix4(inverse);g.computeBoundingSphere();const m=new THREE.Mesh(g,o.material);m.name='Single_straw_leaf_flight';m.castShadow=m.receiveShadow=true;left.add(m);count+=ids.length/3;});
 clip.tracks=clip.tracks.filter(t=>THREE.PropertyBinding.parseTrackName(t.name).nodeName!=='door_leaf_right');right.removeFromParent();collapse.userData.singleDoorV5={leafCount:1,triangles:count,flightNode:left.name};return clip;
}
