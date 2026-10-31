import * as THREE from 'three';
export function createRaidProps(parent,site){
 const root=new THREE.Group();root.name='Independent_defence_and_tools';parent.add(root);
 const mat=(color,metalness=0,opacity=1)=>new THREE.MeshStandardMaterial({color,metalness,roughness:.65,transparent:opacity<1,opacity,depthWrite:opacity===1});
 const oak=mat(0x9e7447),metal=mat(0x405962,.55),copper=mat(0xb58342,.5),red=mat(0xac4f3d),glass=mat(0x8dc7c8,.15,.3);
 const cube=new THREE.BoxGeometry(1,1,1),cyl=new THREE.CylinderGeometry(1,1,1,12);
 const box=(g,m,x,y,z,w,h,d)=>{const o=new THREE.Mesh(cube,m);o.position.set(x,y,z);o.scale.set(w,h,d);g.add(o);o.receiveShadow=true;return o;};
 const tube=(g,m,x,y,z,r,l)=>{const o=new THREE.Mesh(cyl,m);o.position.set(x,y,z);o.scale.set(r,l,r);g.add(o);return o;};
 const group=()=>{const g=new THREE.Group();root.add(g);return g;};
 const cart=group();cart.name='Wolf_owned_folding_tools';
 for(const x of[-1.08,1.08])box(cart,oak,x,.2,0,.14,.15,1.2);
 for(const x of[-1,1])for(const z of[-.45,.45]){const w=tube(cart,metal,x,.16,z,.19,.1);w.rotation.z=Math.PI/2;}
 const front=box(cart,oak,0,.65,-.5,2.3,.85,.12);
 for(const x of[-.95,.95])box(cart,metal,x,.65,-.58,.065,.9,.04);
 const roof=box(cart,oak,0,1.7,0,2.55,.15,1.6);roof.rotation.z=.08;
 const sides=[-1.2,1.2].map(x=>box(cart,glass,x,.95,0,.09,1.4,1.5));
 for(const x of[-1.2,1.2])for(const z of[-.65,.65])box(cart,oak,x,.95,z,.07,1.5,.07);
 const spare=box(cart,oak,0,.4,0,2.15,.16,.75);
 const carried=tube(cart,copper,0,.55,0,.09,1.4);carried.rotation.z=Math.PI/2;
 const press=group();press.name='Wolf_screw_press';press.position.set(0,1.12,4.99);
 const shaft=tube(press,copper,0,0,0,.085,1.08);shaft.rotation.z=Math.PI/2;
 const feet=[-1,1].map(sign=>box(press,metal,sign*.55,0,0,.13,.5,.35));
 const rings=Array.from({length:12},(_,i)=>{const r=new THREE.Mesh(new THREE.TorusGeometry(.092,.018,4,12),metal);r.rotation.y=Math.PI/2;press.add(r);return r;});
 const wheel=new THREE.Group();wheel.position.set(-.8,-.02,.45);press.add(wheel);
 wheel.add(new THREE.Mesh(new THREE.TorusGeometry(.25,.035,6,20),copper));
 box(wheel,metal,0,0,0,.45,.045,.045);box(wheel,metal,0,0,0,.045,.45,.045);box(wheel,oak,.2,0,.12,.07,.07,.25);
 box(press,metal,-.8,0,.2,.06,.06,.45);
 const bolts=group();bolts.name='Gate_locked_crossbars';
 const halves=[-1,1].map(sign=>box(bolts,red,sign*.5,.65,4.88,.98,.14,.16));
 const brace=box(bolts,copper,0,1.3,4.86,2.2,.18,.2);
 const rams=group();rams.name='Automatic_repellers';
 const pads=[];for(const x of[-1.75,1.75]){box(rams,metal,x,.8,4.8,.26,.3,.7);const p=box(rams,red,x,.9,5.2,.58,.6,.2);pads.push(p);}
 const wall=group();wall.name='Independent_rising_wall';wall.position.z=6.9;
 box(wall,metal,0,.6,0,4.6,1.2,.26);if(site==='brick')for(const x of[-2.2,2.2])box(root,metal,x,.08,6.9,.4,.16,.65);
 const bridge=group();bridge.name='Wolf_folding_bridge';
 const ramp=(z1,y1,z2,y2)=>{const d=Math.hypot(z2-z1,y2-y1),o=box(bridge,oak,-.4,(y1+y2)/2,(z1+z2)/2,2.7,.12,d);o.rotation.x=-Math.atan2(y2-y1,z2-z1);};
 ramp(8.5,0,6.9,1.45);ramp(6.9,1.45,5.3,0);
 for(const z of[6.7,7.1])box(bridge,metal,-.4,.71,z,2.7,1.42,.08);
 const jets=group();jets.name='Independent_side_jets';
 for(const x of[-2.2,2.2]){box(jets,copper,x,.1,5.8,.12,.12,1.6);box(jets,copper,x,.55,6.4,.12,1,.12);box(jets,copper,x-Math.sign(x)*.15,1,6.4,.4,.12,.12);}
 const canvas=document.createElement('canvas');canvas.width=canvas.height=32;const ctx=canvas.getContext('2d'),grad=ctx.createRadialGradient(16,16,0,16,16,16);grad.addColorStop(0,'rgba(245,252,252,.8)');grad.addColorStop(1,'rgba(245,252,252,0)');ctx.fillStyle=grad;ctx.fillRect(0,0,32,32);
 const sm=new THREE.SpriteMaterial({map:new THREE.CanvasTexture(canvas),transparent:true,depthWrite:false,opacity:.8});
 const steam=Array.from({length:16},()=>{const o=new THREE.Sprite(sm);jets.add(o);return o;});
 function apply(f){
  root.visible=f?.revision===2;if(!root.visible)return;
  const t=f.phase??0,b=f.breach??0;
  cart.visible=!!f.tool;cart.position.set(0,f.toolLift??0,f.cartZ??8.3);cart.rotation.x=f.toolPitch??0;
  front.visible=f.tool>=2;roof.visible=f.tool>=3;sides.forEach(o=>o.visible=f.tool>=3);spare.visible=!f.bridge;carried.visible=!f.press;
  for(const o of cart.children)if(o.geometry===cube&&o.scale.x===.07)o.visible=f.tool>=3;
  if(f.tool===1){roof.visible=false;front.visible=false;}
  press.visible=(f.press??0)>0;press.scale.setScalar(f.press??0);shaft.scale.y=1.08+1.9*b;
  feet.forEach((o,j)=>o.position.x=(j?1:-1)*(.55+.95*b));rings.forEach((o,j)=>o.position.x=(j/11-.5)*(1+1.8*b));wheel.rotation.z=t*4;
  bolts.visible=(f.gate??0)<.01||b>0;halves.forEach((o,j)=>{o.position.x=(j?1:-1)*(.5+.95*b);o.rotation.z=(j?1:-1)*b*.3;});brace.visible=!!f.brace;
  rams.visible=site==='straw';pads.forEach(o=>o.position.z=5.2+(f.ram??0)*1.3);
  wall.visible=site==='brick'&&(f.wall??0)>0;wall.scale.y=f.wall??0;
  bridge.visible=site==='brick'&&(f.bridge??0)>0;bridge.scale.z=Math.max(.001,f.bridge??0);bridge.position.z=8.5*(1-bridge.scale.z);
  jets.visible=site!=='straw';steam.forEach((o,k)=>{const u=(t*.7+k/16)%1,side=f.jetSide||1;o.visible=(f.steam??0)>0;o.position.set(side*(2.2-u*1.6),1+Math.sin(k)*.15,6.4+(k%3-1)*.12);o.scale.setScalar((.22+u*.5)*(f.steam??0));});
 }
 apply(null);return{apply,root};
}
