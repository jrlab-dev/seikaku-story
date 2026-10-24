import * as THREE from 'three';
export function createChimneyLid(scene){
 const plank=(()=>{const c=document.createElement('canvas');c.width=256;c.height=256;const x=c.getContext('2d');x.fillStyle='#9a6a3e';x.fillRect(0,0,256,256);
  for(let i=0;i<3;i++){x.fillStyle=['#a7744a','#946339','#a06f43'][i];x.fillRect(0,i*86,256,84);x.fillStyle='#4a2f1c';x.fillRect(0,i*86+83,256,3);}
  let seed=771;const r=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};for(let i=0;i<900;i++){x.fillStyle=`rgba(${r()>.5?'255,236,200':'60,35,18'},.08)`;x.fillRect(r()*256,r()*256,30+r()*90,1);}
  x.fillStyle='#3b3b3b';for(const yy of[40,126,212])for(const xx of[24,232]){x.beginPath();x.arc(xx,yy,6,0,7);x.fill();}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;})();
 const wood=new THREE.MeshStandardMaterial({map:plank,roughness:.85}),iron=new THREE.MeshStandardMaterial({color:'#3a3a3c',roughness:.6,metalness:.3}),rope=new THREE.MeshStandardMaterial({color:'#c9a66b',roughness:1});
 const hinge=new THREE.Group();hinge.name='J116_chimney_lid';scene.add(hinge);hinge.visible=false;
 const board=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),wood);board.castShadow=board.receiveShadow=true;hinge.add(board);
 const knob=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,.12,10),iron);hinge.add(knob);
 const inside=new THREE.Group();inside.name='J116_chimney_lid_rope';scene.add(inside);inside.visible=false;
 const cord=new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,1,8),rope);inside.add(cord);
 const handle=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.34,10),wood);handle.rotation.z=Math.PI/2;inside.add(handle);
 const pulley=new THREE.Mesh(new THREE.TorusGeometry(.09,.03,8,16),iron);inside.add(pulley);
 let top=null,last=null;
 function measure(){
  const house=scene.getObjectByName('Approved_brick_placement_once');if(!house)return null;house.updateMatrixWorld(true);
  const ray=new THREE.Raycaster(),hit=(x,z)=>{ray.set(new THREE.Vector3(x,40,z),new THREE.Vector3(0,-1,0));const h=ray.intersectObject(house,true)[0];return h?h.point.y:null;};
  const cx=21.13,cz=-14.81,y0=hit(cx,cz);if(y0==null)return null;
  const edge=(dx,dz)=>{let d=0;for(;d<1.5;d+=.01){const y=hit(cx+dx*d,cz+dz*d);if(y==null||y<y0-.05)break;}return d;};
  const l=edge(-1,0),r=edge(1,0),f=edge(0,1),b=edge(0,-1);
  const x0=cx-l,x1=cx+r,z0=cz-b,z1=cz+f;let y=y0;for(let i=0;i<=8;i++)for(let j=0;j<=8;j++){const v=hit(x0+(x1-x0)*i/8,z0+(z1-z0)*j/8);if(v!=null&&v<y0+.4)y=Math.max(y,v);}
  return{x:(x0+x1)/2,z:(z0+z1)/2,y,w:x1-x0,d:z1-z0,probe:{l,r,f,b,y0}};
 }
 return{
  probe(points){const house=scene.getObjectByName('Approved_brick_placement_once');const ray=new THREE.Raycaster();return points.map(([x,z])=>{ray.set(new THREE.Vector3(x,40,z),new THREE.Vector3(0,-1,0));const h=ray.intersectObject(house,true)[0];return[x,z,h?+h.point.y.toFixed(3):null];});},
  measure,
  apply(s){const c=s?.chimneyLid;hinge.visible=inside.visible=!!c;if(!c){last=null;return;}
   top??=measure();if(!top){hinge.visible=false;}
   else{const w=top.w+.14,d=top.d+.14,th=.09;
    hinge.position.set(top.x,top.y+.005,top.z-top.d/2-.07);hinge.rotation.set(-1.9*c.open,0,0);
    board.scale.set(w,th,d);board.position.set(0,th/2,d/2);knob.position.set(0,th+.06,d*.62);}
   const ax=119.3,az=-81.95,yTop=32.2,len=1.52+.35*c.pull;inside.visible=!!c.rope;
   pulley.position.set(ax,yTop,az);cord.scale.set(1,len,1);cord.position.set(ax,yTop-len/2,az);handle.position.set(ax,yTop-len,az);
   last={open:c.open,pull:c.pull,top,lidWorld:hinge.getWorldPosition(new THREE.Vector3()).toArray()};
  },
  record(){return last;}
 };
}
