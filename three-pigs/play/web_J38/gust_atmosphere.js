import * as THREE from 'three';
const clamp=x=>Math.max(0,Math.min(1,x));
const seed=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
export function createGustAtmosphere(parent,ground){
 const dustGeometry=new THREE.PlaneGeometry(1,1),alpha=new THREE.InstancedBufferAttribute(new Float32Array(28),1);dustGeometry.setAttribute('aOpacity',alpha);
 const dustMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,uniforms:{dustColor:{value:new THREE.Color('#cdb88b')}},vertexShader:'attribute float aOpacity; varying vec2 vUv; varying float vOpacity; void main(){vUv=uv;vOpacity=aOpacity;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.0);}',fragmentShader:'uniform vec3 dustColor; varying vec2 vUv; varying float vOpacity; void main(){float r=length((vUv-.5)*2.0);float a=exp(-r*r*4.5)*(1.0-smoothstep(.65,1.0,r))*vOpacity;gl_FragColor=vec4(dustColor,a);}',toneMapped:false});
 const dust=new THREE.InstancedMesh(dustGeometry,dustMaterial,28);dust.frustumCulled=false;dust.name='Thin_ground_dust';parent.add(dust);
 const leafGeometry=new THREE.BufferGeometry();leafGeometry.setAttribute('position',new THREE.Float32BufferAttribute([0,.65,0,-.30,0,0,0,-.65,0,.30,0,0],3));leafGeometry.setIndex([0,1,2,0,2,3]);leafGeometry.computeVertexNormals();
 const leaves=new THREE.InstancedMesh(leafGeometry,new THREE.MeshBasicMaterial({color:0xb69c55,side:THREE.DoubleSide,depthWrite:true,toneMapped:false}),22);leaves.frustumCulled=false;leaves.name='Downwind_light_leaves';parent.add(leaves);
 for(let i=0;i<22;i++)leaves.setColorAt(i,new THREE.Color().setHSL(.10+seed(i)*.07,.35,.38+seed(i+21)*.17));
 const arcs=[];for(let i=0;i<3;i++){const m=new THREE.Mesh(new THREE.TorusGeometry(1,.018,5,40,Math.PI*1.4),new THREE.MeshBasicMaterial({color:0xfff4d9,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));m.name='Short_impact_curl_'+i;parent.add(m);arcs.push(m);}
 const dummy=new THREE.Object3D(),normal=new THREE.Vector3(0,0,1),q=new THREE.Quaternion();
 return{update({state,g,source,end,dir,side,camera,envelope}){
  const elapsed=state.time-g.emission,hit=Math.max(0,Math.sin(Math.PI*clamp(g.age/.34))),length=source.distanceTo(end);
  for(let i=0;i<28;i++){
   const birth=i*.039,age=elapsed-birth,cycle=age<0?-1:((age%1.1)/1.1),f=cycle<0?0:cycle;
   const alive=cycle>=0&&f<=g.front,spread=(seed(i)-.5)*(.3+f*1.55);
   dummy.position.copy(source).addScaledVector(dir,length*f).addScaledVector(side,spread);
   dummy.position.y=ground(dummy.position.x,dummy.position.z)+.10+.13*Math.sin(f*Math.PI)+seed(i+7)*.09;
   dummy.quaternion.copy(camera.quaternion);const size=.45+f*.6+seed(i+3)*.2;dummy.scale.set(size*2.1,size*.6,1);dummy.updateMatrix();dust.setMatrixAt(i,dummy.matrix);
   alpha.setX(i,alive?envelope*Math.sin(f*Math.PI)*(.20+.06*hit):0);
  }
  alpha.needsUpdate=true;dust.instanceMatrix.needsUpdate=true;
  for(let i=0;i<22;i++){
   const age=elapsed-i*.067,phase=age<0?-1:(age%1.25)/1.25,f=Math.max(0,phase),alive=phase>=0&&f<=g.front;
   dummy.position.copy(source).addScaledVector(dir,length*f).addScaledVector(side,(seed(i+60)-.5)*(.45+f*1.8));
   dummy.position.y=ground(dummy.position.x,dummy.position.z)+.06+Math.sin(f*Math.PI)*(.28+seed(i+44)*.6);
   dummy.rotation.set(f*12+i,f*9+i*.3,f*11+i*.5);const size=alive?(.08+seed(i+2)*.06)*Math.sin(f*Math.PI)*envelope:0;dummy.scale.set(size,size*1.6,size);dummy.updateMatrix();leaves.setMatrixAt(i,dummy.matrix);
  }
  leaves.instanceMatrix.needsUpdate=true;
  q.setFromUnitVectors(normal,dir);
  arcs.forEach((m,i)=>{const u=clamp((g.age-i*.045)/.34),fade=Math.sin(Math.PI*u);m.visible=g.age>=i*.045&&g.age<i*.045+.34;m.position.copy(end).addScaledVector(dir,-.12);m.position.y+=.4+i*.13;m.quaternion.copy(q);m.rotateZ(i*1.8);const radius=.28+u*(.85+i*.15);m.scale.set(radius*1.15,radius,1);m.material.opacity=fade*.42*envelope;});
  return{dustInstances:28,leafInstances:22,impactPulse:hit,opacityCap:.26};
 }};
}
