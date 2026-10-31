import * as THREE from 'three';
import {CENTERS} from './endings/strategy.mjs';
import {createRaidProps} from './strategy_raid_props.js';
export function installStrategyContact(layer,ground){
 const update=layer.update.bind(layer);
 layer.update=(camera,dt)=>{
  const result=update(camera,dt);
  if(!layer.costumeSceneState?.strategy&&!layer.costumeSceneState?.strategyConstruction&&!layer.costumeSceneState?.strategyPrelude)return result;
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
export function createStrategyProps(scene,houses={}){
 const root=new THREE.Group();root.name='Strategy_defences';scene.add(root);
 const material=(color,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness:.72,metalness});
 const oak=material(0x815735),iron=material(0x43575b,.45),brass=material(0xb99750,.5),red=material(0xb84935),blue=material(0x598d94),stone=material(0x9d9b88);
 const geom=new THREE.BoxGeometry(1,1,1),ball=new THREE.SphereGeometry(1,12,8),cyl=new THREE.CylinderGeometry(1,1,1,16);
 const mesh=(parent,g,m,x,y,z,sx=1,sy=1,sz=1)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=false;o.receiveShadow=true;parent.add(o);return o;};
 const box=(p,m,x,y,z,a,b,c)=>mesh(p,geom,m,x,y,z,a,b,c);
 const groups={},guards={},benches={};
 const workRoot=new THREE.Group();workRoot.name='Construction_workbenches';scene.add(workRoot);
 for(const[site,c]of Object.entries(CENTERS)){
  const g=new THREE.Group();workRoot.add(g);benches[site]=g;
  const z=site==='wood'?3.461624:3.510001;
  g.position.set(c[0]-.45,c[1],c[2]+z+.65);
  box(g,oak,0,.55,0,.9,.09,.5);
  for(const x of[-.34,.34])for(const dz of[-.16,.16])box(g,oak,x,.27,dz,.075,.54,.075);
  box(g,iron,0,.63,0,.48,.08,.28);
  mesh(g,cyl,brass,.2,.7,0,.13,.07,.13);
 }
 for(const[site,house]of Object.entries(houses)){
  const nodes=[];house.staticScene.traverse(o=>{if(/__Robot(?:_[12])?$/.test(o.name))nodes.push(o);});
  guards[site]=nodes.map(o=>{o.updateWorldMatrix(true,true);const center=new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3()),parent=o.parent,pivot=new THREE.Group();pivot.position.copy(parent.worldToLocal(center));parent.add(pivot);pivot.updateWorldMatrix(true,false);pivot.attach(o);return pivot;});
 }
 for(const[site,c]of Object.entries(CENTERS)){
  const g=new THREE.Group();g.position.set(c[0],c[1]+.04,c[2]);root.add(g);
  box(g,stone,0,.015,4.8,4.7,.1,1.0);
  for(const x of[-2.4,2.4]){
   if(x<0)box(g,iron,x,.72,3.5,.12,.12,2.6);
   else{box(g,iron,x,.72,2.9,.12,.12,1.3);}
   for(const z of[2.3,4.8])box(g,oak,x,.85,z,.16,1.7,.18);
  }
  for(const x of[-1.8,1.8]){box(g,iron,x,.75,4.95,1.15,.1,.13);for(const dx of[-.4,0,.4])box(g,iron,x+dx,.4,4.95,.07,.8,.1);}
  for(const x of [-1.15,1.15]){box(g,oak,x,1.05,3.15,.19,2.1,.25);mesh(g,ball,brass,x,2.18,3.15,.15,.15,.15);}
  box(g,oak,0,2.03,3.15,2.5,.18,.28);
  const gate=x=>{const d=new THREE.Group();d.position.set(x,.98,3.15);g.add(d);for(const dx of[-.48,-.24,0,.24,.48])box(d,site==='wood'?blue:iron,dx,0,0,.065,1.8,.12);for(const y of[-.85,.85])box(d,iron,0,y,0,1.02,.08,.12);return d;};
  const left=gate(-.54),right=gate(.54);
  for(const door of[left,right]){
   for(const x of[-.36,.36])box(door,brass,x,0,.08,.045,1.72,.04);
   mesh(door,ball,brass,door===left?.33:-.33,-.03,.12,.07,.045,.07);
  }
  const r={g,left,right};groups[site]=r;r.raid=createRaidProps(g,site);
  for(const o of g.children)if(o.position.z===3.15)o.position.z=4.95;
  {
   for(const z of[3.55,4.75])box(g,oak,2.4,.9,z,.15,1.8,.12);
   box(g,oak,2.4,1.82,4.15,.2,.12,1.35);
   const pivot=new THREE.Group();pivot.position.set(2.4,0,3.55);g.add(pivot);r.exit=pivot;
   box(pivot,blue,0,.86,.6,.1,1.65,1.2);mesh(pivot,ball,brass,.1,.83,1.04,.06,.06,.06);
  }
  if(site==='straw'){
   box(g,iron,-1.8,.75,3.1,.16,1.5,.16);
   const head=new THREE.Group();head.position.set(-1.8,1.65,4.9);g.add(head);r.head=head;
   box(g,iron,-1.8,.75,4.9,.16,1.5,.16);
   mesh(head,ball,blue,0,0,0,.38,.3,.32);
   for(const x of[-.14,.14])mesh(head,ball,brass,x,.035,.28,.085,.085,.045);
   box(head,iron,0,-.12,.36,.13,.045,.09);
   r.lamp=mesh(g,ball,new THREE.MeshStandardMaterial({color:0xb44733,emissive:0x551000}),-1.8,2.14,4.9,.14,.18,.14);
   const dummy=new THREE.Group();g.add(dummy);r.dummy=dummy;dummy.position.set(-3.2,0,5);
   box(dummy,oak,0,.5,0,.055,1,.055);mesh(dummy,ball,brass,0,1.1,0,.2,.2,.16);box(dummy,red,0,.78,0,.4,.4,.08);
  }
  if(site==='wood'||site==='brick'){
   for(const x of[2.18,2.92])for(const z of[4,4.6])box(g,iron,x,.2,z,.1,.4,.1);
   box(g,iron,2.55,.41,4.3,.95,.07,.8);
   mesh(g,cyl,iron,2.55,.7,4.3,.43,.58,.43);
   const lid=mesh(g,cyl,brass,2.55,1.02,4.3,.46,.09,.46);
   mesh(g,ball,oak,2.55,1.12,4.3,.1,.08,.1);
   box(g,brass,1.9,.9,4.3,1.1,.1,.1);box(g,brass,1.4,.68,4.3,.1,.5,.1);
   box(g,iron,1.4,.45,4.3,.2,.15,.2);
   const lever=new THREE.Group();lever.position.set(1.4,.53,4.3);g.add(lever);r.lever=lever;
   box(lever,iron,0,.3,0,.055,.6,.055);mesh(lever,ball,red,0,.6,0,.1,.1,.1);
   const flames=new THREE.Group();flames.position.set(2.55,.28,4.65);g.add(flames);r.fire=flames;
   for(let k=0;k<5;k++)mesh(flames,new THREE.ConeGeometry(.06,.28,6),material(k%2?0xffcf54:0xe8752b),(k-2)*.12,0,0);
   const canvas=document.createElement('canvas');canvas.width=canvas.height=64;
   const ctx=canvas.getContext('2d'),gradient=ctx.createRadialGradient(32,32,0,32,32,32);
   gradient.addColorStop(0,'rgba(239,248,250,.65)');gradient.addColorStop(.5,'rgba(230,243,247,.3)');gradient.addColorStop(1,'rgba(230,243,247,0)');
   ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);
   const steamMaterial=new THREE.SpriteMaterial({map:new THREE.CanvasTexture(canvas),transparent:true,depthWrite:false,opacity:.8});
   r.steam=Array.from({length:18},()=>{const o=new THREE.Sprite(steamMaterial);g.add(o);return o;});
   r.dummy=new THREE.Group();g.add(r.dummy);r.dummy.position.set(-2.5,0,5.5);
   box(r.dummy,oak,0,.4,0,.05,.8,.05);box(r.dummy,red,0,.9,0,.45,.45,.06);
  }
  if(site==='brick'){
   const gear=new THREE.Group();gear.position.set(-.95,.7,5.25);g.add(gear);r.gear=gear;
   const ring=new THREE.Mesh(new THREE.TorusGeometry(.38,.09,6,20),brass);gear.add(ring);
   for(let k=0;k<10;k++){const a=k/10*Math.PI*2;const tooth=box(gear,brass,Math.cos(a)*.43,Math.sin(a)*.43,0,.16,.16,.15);tooth.rotation.z=a;}
   box(gear,iron,0,0,0,.06,.67,.1);box(gear,iron,0,0,0,.67,.06,.1);
   box(g,iron,-.95,.3,5.25,.14,.6,.16);
   const shape=new THREE.Shape();shape.moveTo(0,0);shape.lineTo(.5,0);shape.lineTo(.5,.2);shape.closePath();
   const wedge=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.16,bevelEnabled:false}),oak);g.add(wedge);r.wedge=wedge;
   box(g,brass,0,.1,5.25,2.4,.1,.11);
  }
 }
 let last=null;
 function apply(st){
  const f=st?.strategy??(st?.strategyPrelude?{scan:0,decoy:0,steam:0,lever:0,gear:0,wedge:0,alarm:0,fire:0,exit:0,...st.strategyPrelude}:null);root.visible=!!f;last=f??null;
 workRoot.visible=false;
  for(const[site,g]of Object.entries(benches))g.visible=site===st?.strategyConstruction?.site;
  for(const[site,rigs]of Object.entries(guards))for(const rig of rigs)rig.rotation.y=f?.site===site?(f.scan??0):0;
  for(const[site,r]of Object.entries(groups)){
   const active=f?.site===site,arrival=f?.arrival?.site===site;
   r.g.visible=active||arrival;if(!r.g.visible){r.raid.apply(null);continue;}
   const state=active?f:{phase:0,gate:f.arrival.gate,exit:0,scan:0,decoy:0,steam:0,lever:0,gear:0,wedge:0,alarm:0,fire:0};
   const t=state.phase;r.left.position.x=-.54-(state.gate??0)*.95;r.right.position.x=.54+(state.gate??0)*.95;
   r.raid.apply(active?state:null);r.left.rotation.z=-(state.breach??0)*.18;r.right.rotation.z=(state.breach??0)*.18;
   if(r.exit)r.exit.rotation.y=Math.PI/2*(state.exit??0);
   if(r.head){r.head.rotation.y=state.scan;r.lamp.material.emissive.setHex(state.alarm&&Math.floor(t*4)%2?0xff3a00:0x220700);}
   if(r.dummy){r.dummy.visible=state.decoy>0;r.dummy.rotation.z=Math.sin(t*5)*.12;}
   if(r.lever){r.lever.rotation.z=-.75*state.lever;r.fire.visible=!!state.fire; r.fire.scale.y=.9+Math.sin(t*9)*.12;
    r.steam.forEach((o,k)=>{o.visible=state.revision!==2&&state.steam>.01;const u=(t*.65+k*.23)%1;o.position.set((k%6-2.5)*.45,.6+u*1.5,4.6+Math.sin(k)*.1);o.scale.setScalar((.7+u*.8)*state.steam);});
   }
   if(r.gear){r.gear.visible=state.revision!==2;r.gear.rotation.z=state.gear;r.wedge.visible=state.wedge>0;r.wedge.position.set(-1.9+state.wedge*.55,.26,5.35);r.wedge.rotation.z=.2;}
  }
 }
 apply(null);
 return{apply,reset:()=>apply(null),record:()=>last,root};
}
