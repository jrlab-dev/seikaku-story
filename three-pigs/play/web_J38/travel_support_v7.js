import * as THREE from 'three';
const pixels=new WeakMap(),samples=new Map();
function alpha(image,x,y){let a=pixels.get(image);if(!a){const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);a=ctx.getImageData(0,0,c.width,c.height).data;pixels.set(image,a);}return a[(Math.max(0,Math.min(image.height-1,y))*image.width+Math.max(0,Math.min(image.width-1,x)))*4+3];}
function localFootPoints(card){
 const g=card.geometry,p=g.attributes.position,uv=g.attributes.uv,img=card.material.map.image;
 const key=[img.src,...uv.array,...p.array].join(':');if(samples.has(key))return samples.get(key);
 const rows=[];let minY=Infinity,maxY=-Infinity;
 for(let i=0;i<=48;i++){const u=i/48;let bottom=null;
  for(let k=0;k<=100;k++){const v=k/100,tu=uv.getX(0)+(uv.getX(1)-uv.getX(0))*u,tv=uv.getY(0)+(uv.getY(2)-uv.getY(0))*v;
   if(alpha(img,Math.floor(tu*img.width),Math.floor((1-tv)*img.height))<=180)continue;
   const point=new THREE.Vector3(p.getX(0)+(p.getX(1)-p.getX(0))*u,p.getY(0)+(p.getY(2)-p.getY(0))*v,0);bottom=point;minY=Math.min(minY,point.y);maxY=Math.max(maxY,point.y);
  }if(bottom)rows.push(bottom);
 }
 const result=rows.filter(p=>p.y<minY+(maxY-minY)*.12);samples.set(key,result);return result;
}
export function inspectTravelActor(a,camera,ground,terrain){
 const rig=a.root.getObjectByName('J114_discrete_pose_'+a.data.id),card=rig?.children[0];if(!card)return null;card.updateWorldMatrix(true,false);
 const feet=localFootPoints(card).map(p=>p.clone().applyMatrix4(card.matrixWorld)),clearance=feet.map(p=>p.y-ground(p.x,p.z));
 const head=a.root.position.clone().add(new THREE.Vector3(0,a.data.heightMetres*.82+(rig.position.y||0),0));
 const targets=[head,...feet.filter((_,i)=>i%Math.max(1,Math.floor(feet.length/4))===0)];
 const rays=targets.map(p=>{const distance=camera.position.distanceTo(p),ray=new THREE.Raycaster(camera.position,p.clone().sub(camera.position).normalize(),.01,distance-.018);const hit=(Array.isArray(terrain)?ray.intersectObjects(terrain,false):ray.intersectObject(terrain,false))[0];return !!hit;});
 return{id:a.data.id,visible:rig.visible,depthTest:card.material.depthTest,elevation:a.status?.elevation,root:a.root.position.toArray(),lift:rig.position.y,footPoints:feet.map(p=>p.toArray()),minimumFootClearance:Math.min(...clearance),maximumFootClearance:Math.max(...clearance),headBlockedByTerrain:rays[0],footTerrainRayBlocked:rays.slice(1).filter(Boolean).length,feetScreen:feet.map(p=>{const v=p.clone().project(camera);return[(v.x+1)/2,(1-v.y)/2,v.z];})};
}
export function createWalkSurface(base,meshes){
 const cells=new Map();let triangles=0;
 for(const mesh of meshes){mesh.updateWorldMatrix(true,false);const p=mesh.geometry.attributes.position,ix=mesh.geometry.index?.array??Array.from({length:p.count},(_,i)=>i);
  for(let k=0;k<ix.length;k+=3){const tri=[0,1,2].map(i=>new THREE.Vector3().fromBufferAttribute(p,ix[k+i]).applyMatrix4(mesh.matrixWorld).toArray()),xs=tri.map(p=>p[0]),zs=tri.map(p=>p[2]);if(Math.max(...xs)<-52||Math.min(...xs)>-4||Math.max(...zs)<-35||Math.min(...zs)>7)continue;triangles++;
   for(let x=Math.floor(Math.max(-52,Math.min(...xs)));x<=Math.floor(Math.min(-4,Math.max(...xs)));x++)for(let z=Math.floor(Math.max(-35,Math.min(...zs)));z<=Math.floor(Math.min(7,Math.max(...zs)));z++){const key=x+','+z,list=cells.get(key)||[];list.push(tri);cells.set(key,list);}
  }
 }
 const at=(x,z)=>{let y=base(x,z);for(const[a,b,c]of cells.get(Math.floor(x)+','+Math.floor(z))||[]){const det=(b[2]-c[2])*(a[0]-c[0])+(c[0]-b[0])*(a[2]-c[2]);if(Math.abs(det)<1e-10)continue;const u=((b[2]-c[2])*(x-c[0])+(c[0]-b[0])*(z-c[2]))/det,v=((c[2]-a[2])*(x-c[0])+(a[0]-c[0])*(z-c[2]))/det;if(u>=-1e-7&&v>=-1e-7&&u+v<=1.0000001)y=Math.max(y,u*a[1]+v*b[1]+(1-u-v)*c[1]);}return y;};at.triangles=triangles;return at;
}
export function installTravelSupport(layer,ground,baseGround){
 const apply=layer.applyStory.bind(layer);layer.applyStory=(poses,t)=>apply(poses.map(p=>p.openingV7?{...p,yOffset:ground(p.x,p.z)-baseGround(p.x,p.z)}:p),t);
 const update=layer.update.bind(layer);
 layer.update=(camera,dt)=>{const result=update(camera,dt),s=layer.costumeSceneState;
  if(!s?.travelV7)return result;
  for(const a of layer.actors){if(a.data.id==='wolf'||!a.requestedVisible)continue;const rig=a.root.getObjectByName('J114_discrete_pose_'+a.data.id),card=rig?.children[0];if(!card)continue;
   rig.position.y=0;card.updateWorldMatrix(true,false);
   const points=localFootPoints(card).map(p=>p.clone().applyMatrix4(card.matrixWorld));
   rig.position.y=Math.max(0,...points.map(p=>ground(p.x,p.z)+.018-p.y));rig.updateWorldMatrix(true,true);
   const sp=a.shadow.geometry.attributes.position;for(let k=0;k<sp.count;k++)sp.setY(k,ground(a.root.position.x+sp.getX(k),a.root.position.z+sp.getZ(k))-a.root.position.y+.014);sp.needsUpdate=true;a.shadow.visible=true;
  }return result;
 };return layer;
}

