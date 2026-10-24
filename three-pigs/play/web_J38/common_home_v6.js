import * as THREE from 'three';
import{COMMON_HOME,JOURNEY_POINTS}from './opening_v6.mjs';
export function createCommonHome(ground,source){
 const root=new THREE.Group();root.name='Distant_shared_home_v6';const{x,z,width,depth}=COMMON_HOME,base=ground(x,z)+.05;root.position.set(x,base,z);
 let oak;source.traverse(o=>{if(o.isMesh&&/Oak_0/.test(o.material.name)&&!oak)oak=o.material;});if(!oak)throw Error('Common home wood material missing');
 const texCanvas=document.createElement('canvas');texCanvas.width=texCanvas.height=128;const cx=texCanvas.getContext('2d'),pixels=cx.createImageData(128,128);for(let i=0;i<pixels.data.length;i+=4){const n=Math.sin(i*17.37)*43758.5453,v=235+Math.floor((n-Math.floor(n))*16);pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=v;pixels.data[i+3]=255;}cx.putImageData(pixels,0,0);const limeMap=new THREE.CanvasTexture(texCanvas);limeMap.wrapS=limeMap.wrapT=THREE.RepeatWrapping;limeMap.repeat.set(5,5);limeMap.colorSpace=THREE.SRGBColorSpace;
 const plaster=new THREE.MeshStandardMaterial({color:0xd3bc8a,map:limeMap,roughness:1}),wood=oak.clone(),dark=new THREE.MeshStandardMaterial({color:0x59422d,roughness:.97}),stone=new THREE.MeshStandardMaterial({color:0x8a8879,roughness:1}),roof=oak.clone();roof.color.multiplyScalar(.77);
 const add=(geo,mat,pos,rotation)=>{const m=new THREE.Mesh(geo,mat);m.position.fromArray(pos);if(rotation)m.rotation.set(...rotation);m.castShadow=m.receiveShadow=true;root.add(m);return m;},box=(size,pos,mat=plaster)=>add(new THREE.BoxGeometry(...size),mat,pos);
 box([width+.12,.24,depth+.12],[0,.12,0],stone);box([width,.13,depth],[0,.30,0],wood);
 box([width,2.3,.14],[0,1.48,-depth/2]);for(const side of [-1,1])box([.14,2.3,depth],[side*width/2,1.48,0]);
 const doorW=1.08;for(const side of [-1,1])box([(width-doorW)/2,2.3,.14],[side*(width+doorW)/4,1.48,depth/2]);box([doorW,.4,.14],[0,2.43,depth/2]);
 for(const side of [-1,1]){box([.12,2.44,.16],[side*(doorW/2+.02),1.48,depth/2+.04],dark);for(const zz of [-depth/2,depth/2])box([.15,2.5,.15],[side*width/2,1.55,zz],dark);}
 box([1.35,.13,.18],[0,2.6,depth/2+.04],dark);box([width+.15,.14,depth+.12],[0,2.64,0],dark);
 const roofW=2.1,run=roofW/6,slope=.57,angle=Math.atan(slope);
 for(const side of [-1,1])for(let row=0;row<6;row++)for(let col=0;col<13;col++){
  const xx=side*(row+.5)*run,yy=3.86-Math.abs(xx)*slope;
  add(new THREE.BoxGeometry(run/Math.cos(angle)+.08,.06,.35),roof,[xx,yy,-2.12+col*.35],[0,0,-side*angle]);
 }
 for(const zz of [-depth/2,depth/2]){const shape=new THREE.Shape();shape.moveTo(-width/2,0);shape.lineTo(width/2,0);shape.lineTo(0,1.04);shape.closePath();const g=new THREE.ExtrudeGeometry(shape,{depth:.1,bevelEnabled:false});add(g,plaster,[0,2.68,zz-.05]);}
 box([.12,.13,4.6],[0,3.88,0],dark);
 for(const side of [-1,1]){
  const xx=side*1.2,zz=depth/2+.085;box([.55,.65,.06],[xx,1.78,zz],dark);box([.45,.55,.07],[xx,1.78,zz+.02],new THREE.MeshStandardMaterial({color:0x374c4d,roughness:.5}));box([.05,.59,.08],[xx,1.78,zz+.07],wood);box([.5,.05,.08],[xx,1.78,zz+.07],wood);box([.64,.08,.19],[xx,1.42,zz+.03],wood);
  const m=box([2.13,.10,.12],[side*.92,3.23,depth/2+.08],dark);m.rotation.z=-side*Math.atan(1.04/1.8);
 }

 const hinge=new THREE.Group();hinge.position.set(-.51,.34,depth/2+.07);hinge.rotation.y=1.18;root.add(hinge);
 for(let i=0;i<5;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(.195,2.02,.07),wood);m.position.set(.1+i*.2,1.01,0);m.castShadow=m.receiveShadow=true;hinge.add(m);}
 for(const yy of [.5,1.6]){const m=new THREE.Mesh(new THREE.BoxGeometry(.88,.055,.04),dark);m.position.set(.5,yy,.06);hinge.add(m);}
 box([1.5,.16,.45],[0,.10,depth/2+.35],stone);
 for(const side of [-1,1]){box([.65,.3,.45],[side*1.3,.22,depth/2+.35],wood);for(let i=0;i<7;i++){const m=add(new THREE.IcosahedronGeometry(.13,1),new THREE.MeshStandardMaterial({color:[0x728353,0xb4a765,0x7c8956][i%3],roughness:1}),[side*1.3+(i%3-.9)*.19,.48+Math.floor(i/3)*.08,depth/2+.35]);m.scale.set(1,.7,1);}}
 root.visible=false;return{root,base,apply(state){root.visible=state.branch?.id==='normal';},record(){return{visible:root.visible,position:root.position.toArray(),width,depth,independentFromFutureHomes:true,wallFront:z+depth/2,doorWidth:doorW};}};
}
export function createHomePath(ground,texture){
 const p=[],uv=[],ix=[],points=[[-48,-31.7],...JOURNEY_POINTS.slice(0,61)];
 for(let i=0;i<points.length;i++){const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],n=Math.hypot(dx,dz);for(const side of [-1,1]){const x=points[i][0]-dz/n*.82*side,z=points[i][1]+dx/n*.82*side;p.push(x,ground(x,z)+.012,z);const sx=-6+(i*.08)%12,sz=4.3-.018*(sx-2)**2+side*.65;uv.push((sx+96)/192,(-sz+96)/192);}if(i){const k=i*2;ix.push(k-2,k,k-1,k-1,k,k+1);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();
 const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({map:texture,roughness:1,side:THREE.DoubleSide}));m.name='Shared_home_to_west_gate_3D_path';m.receiveShadow=true;return m;
}
