import * as THREE from 'three';
import {CENTERS} from './endings/strategy.mjs';
export function createHouseDefence(scene,entries,swapped){
 const root=new THREE.Group();root.name='House_defence';scene.add(root);
 const mat=(color,metalness=0)=>new THREE.MeshStandardMaterial({color,metalness,roughness:.75,side:THREE.DoubleSide});
 const wood=mat(0x97633a),iron=mat(0x455660,.5),brass=mat(0xba8a45,.4),red=mat(0xa74731),floorMat=mat(0xb5a288);
 const cube=new THREE.BoxGeometry(1,1,1),cylinder=new THREE.CylinderGeometry(1,1,1,16);
 const box=(g,m,x,y,z,w,h,d)=>{const o=new THREE.Mesh(cube,m);o.position.set(x,y,z);o.scale.set(w,h,d);g.add(o);o.receiveShadow=true;return o;};
 const tube=(g,m,x,y,z,r,h)=>{const o=new THREE.Mesh(cylinder,m);o.position.set(x,y,z);o.scale.set(r,h,r);g.add(o);return o;};
 const groups={},restore=new Map();
 for(const[site,c]of Object.entries(CENTERS)){
  const g=new THREE.Group();g.position.fromArray(c);root.add(g);
  const home=swapped[site]?.staticScene??entries[site].placement.children[0];
  const scenes=[home,swapped[site]?.hatch?.scene].filter(Boolean),cut=[],backs=[];
  for(const scene of scenes)scene.traverse(o=>{
   if(/__(Roof|Turret|Battlement|Frame|Chimney|Alarm|Flag|Antenna|Gable|Window_Back|Automation|Gears|Radar|Punch)/.test(o.name)||/__Wall_Back$/.test(o.name))cut.push(o);
   if(/__(Wall_Back|Window_Back)$/.test(o.name))backs.push(o);
   if(/__Wall_(Front|Left|Right)$/.test(o.name))o.traverse(m=>{if(m.isMesh){m.material=Array.isArray(m.material)?m.material.map(v=>{const a=v.clone();a.side=THREE.DoubleSide;return a;}):m.material.clone();if(!Array.isArray(m.material))m.material.side=THREE.DoubleSide;}});
  });
  for(const o of [...cut,...backs])restore.set(o,o.visible);
  const room=new THREE.Group();g.add(room);box(room,floorMat,0,.325,0,4.35,.03,4.1);
  const bars=new THREE.Group();room.add(bars);box(bars,wood,-.65,1.05,1.9,1.9,.18,.16);const second=box(bars,wood,-.65,1.65,1.9,1.9,.18,.16);second.rotation.z=.18;
  for(const x of[-1.6,.3])box(room,iron,x,1.25,1.91,.13,1.3,.18);
  const stove=new THREE.Group();room.add(stove);stove.position.set(1.65,.34,-1.05);
  box(stove,iron,0,.2,0,.75,.4,.65);tube(stove,iron,0,.65,0,.36,.55);tube(stove,brass,0,.96,0,.4,.08);
  const flame=new THREE.Group();stove.add(flame);for(let k=0;k<5;k++){const m=new THREE.Mesh(new THREE.ConeGeometry(.055,.26,6),new THREE.MeshBasicMaterial({color:k%2?0xffcc43:0xff6a1e}));m.position.set((k-2)*.11,.25,-.36);flame.add(m);}
  const lever=new THREE.Group();lever.position.set(-.48,.5,-.1);stove.add(lever);box(lever,brass,0,.12,0,.05,.35,.05);tube(lever,red,0,.3,0,.09,.08);
  const light=new THREE.PointLight(0xffddaa,5,8);light.position.set(0,2,0);room.add(light);
  const rear=new THREE.Group();g.add(rear);rear.name='House_rear_exit';
  const backMat=entries[site].kind.includes('fort')?iron:mat(0xb97a59),backZ=entries[site].kind.includes('fort')?-2.12:-2.17;
  box(rear,backMat,-1.9,1.7,backZ,.8,2.8,.24);box(rear,backMat,1.1,1.7,backZ,2.4,2.8,.24);box(rear,backMat,-.65,2.7,backZ,1.7,.8,.24);
  const leaf=new THREE.Group();leaf.position.set(-1.45,.34,backZ-.15);rear.add(leaf);box(leaf,wood,.8,.95,0,1.6,1.9,.12);box(leaf,iron,.8,.55,-.07,1.5,.12,.05);box(leaf,iron,.8,1.45,-.07,1.5,.12,.05);tube(leaf,brass,1.4,1,-.12,.07,.08);
  const jets=new THREE.Group();g.add(jets);for(const x of[-2,2]){box(jets,brass,x,.8,2.35,.1,.1,1);box(jets,brass,x,1,2.8,.1,.5,.1);}
  const steam=Array.from({length:12},()=>{const o=new THREE.Mesh(new THREE.SphereGeometry(.1,8,6),new THREE.MeshBasicMaterial({color:0xe5f2ed,transparent:true,opacity:.22,depthWrite:false}));jets.add(o);return o;});
  const cart=new THREE.Group();g.add(cart);box(cart,wood,-.65,.3,0,1.6,.16,1.1);const canopy=box(cart,wood,-.65,1.8,0,2,.12,1.7);for(const x of[-1.55,.25])for(const z of[-.7,.7])box(cart,iron,x,.95,z,.07,1.7,.07);
  const shield=box(cart,wood,-.65,.95,-.65,1.8,1.25,.12);for(const x of[-1.35,.05])for(const z of[-.4,.4]){const o=tube(cart,iron,x,.18,z,.2,.12);o.rotation.z=Math.PI/2;}
  const press=new THREE.Group();g.add(press);press.position.set(-.65,1.25,2.55);const shaft=tube(press,brass,0,0,.45,.08,.9);shaft.rotation.x=Math.PI/2;box(press,iron,0,0,0,.65,.55,.12);const wheel=new THREE.Mesh(new THREE.TorusGeometry(.26,.04,6,16),brass);wheel.position.z=.9;press.add(wheel);box(press,iron,0,0,.9,.5,.04,.05);
  groups[site]={g,room,bars,second,stove,flame,lever,light,rear,leaf,jets,steam,cart,canopy,shield,press,wheel,cut,backs,home};
 }
 let last=null;
 function apply(s){
  for(const[o,v]of restore)o.visible=v;
  const f=s?.strategy??s?.strategyPrelude??s?.houseOccupancy;last=f??null;root.visible=!!f;
  for(const[site,r]of Object.entries(groups)){
   const active=f?.site===site,arrive=f?.arrival?.site===site,inside=active&&!!f.inside;
   r.g.visible=active||arrive;if(!r.g.visible)continue;
   const a=active?f:{},t=a.phase??0;
   r.room.visible=inside;r.bars.visible=(s.houses[site].doorOpen??0)<.05;r.bars.rotation.z=a.shake??0;r.second.visible=site==='brick'||!!a.brace;
   r.stove.visible=site!=='straw';r.flame.visible=(a.fire??0)>0;r.flame.scale.y=.9+.15*Math.sin(t*15);r.lever.rotation.z=(a.fire??0)*-.6;r.light.intensity=inside?6:0;
   for(const o of r.backs)o.visible=false;
   if(inside)for(const o of r.cut)o.visible=false;
   r.rear.visible=!inside;r.leaf.rotation.y=-(a.rearOpen??0)*Math.PI*.65;
   r.jets.visible=site!=='straw'&&!inside;r.steam.forEach((o,k)=>{const u=(t*.8+k/12)%1;o.visible=(a.steam??0)>0;o.position.set(k%2?2:-2,1+u*.2,2.8+u*2);o.scale.setScalar(.8+u*3);});
   r.cart.visible=!!a.tool&&!inside;r.cart.position.z=a.cartZ??5.6;r.canopy.visible=a.tool===2;r.shield.visible=a.tool===2;r.press.visible=!!a.press&&!inside;r.wheel.rotation.z=t*4;
  }
 }
 apply(null);return{apply,reset:()=>apply(null),record:()=>last,root};
}
