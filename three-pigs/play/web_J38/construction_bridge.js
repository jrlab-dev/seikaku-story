import {createCumulativeStraw} from './cumulative_straw.js';
import {createConstructionController} from './construction-controller.mjs';
export function createConstructionBridge({THREE,entries,prepare,invalidate,ground=()=>0}){
 const assemblies={},props={},records={};
 for(const [id,e]of Object.entries(entries)){
  const root=e.source.clone(true);root.name='J53_'+id+'_construction';prepare(root);
  const siblings=[...e.placement.children];e.placement.add(root);
  const controller=createConstructionController({scene:root,manifest:e.manifest});controller.reset();root.visible=false;
  assemblies[id]={root,siblings,controller};
  const group=new THREE.Group();group.name='J53_'+id+'_loose_materials';e.placement.add(group);props[id]=group;
  const material=new THREE.MeshStandardMaterial({color:id==='straw'?0xb99858:id==='wood'?0x987047:0xa85f41,roughness:.93});
  let oakMaterial; e.source.traverse(o=>{if(o.isMesh&&o.material?.name?.startsWith('Oak final'))oakMaterial=o.material;});
  for(let i=0;i<(id==='straw'?0:6);i++){
   const geometry=id==='straw'?new THREE.CylinderGeometry(.14,.18,1.05,9):new THREE.BoxGeometry(id==='wood'?1.4:.5,id==='wood'?.11:.22,id==='wood'?.2:.24);
   const mesh=new THREE.Mesh(geometry,oakMaterial||material);mesh.position.set(-3.1+(i%3)*.26,.18+Math.floor(i/3)*.19,5.1+(i%2)*.3);if(id==='straw')mesh.rotation.z=Math.PI/2;group.add(mesh);
  }
  if(id==='straw'){
   const seed=n=>{const x=Math.sin(n*127.1+31.7)*43758.5453;return x-Math.floor(x);};
   const colors=[0xb99d63,0xc4a568,0xa8864e,0xd1b67c].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:.94}));
   const rope=new THREE.MeshStandardMaterial({color:0x80623c,roughness:1});
   for(let b=0;b<3;b++){
    const bundle=new THREE.Group();bundle.position.set(-3.25+b*.38,.2+(b===2?.22:0),5.15+b*.17);bundle.rotation.y=b*.12;group.add(bundle);
    for(let j=0;j<100;j++){const radius=.16*Math.sqrt(seed(j+310*b)),angle=seed(j+55)*Math.PI*2,length=.95+seed(j+97)*.28;const m=new THREE.Mesh(new THREE.CylinderGeometry(.008,.012,length,5),colors[j%4]);m.rotation.z=Math.PI/2+(seed(j+9)-.5)*.08;m.position.set((seed(j+63)-.5)*.12,Math.cos(angle)*radius,Math.sin(angle)*radius);bundle.add(m);}
    for(const x of [-.18,.18]){const tie=new THREE.Mesh(new THREE.TorusGeometry(.17,.018,5,18),rope);tie.rotation.y=Math.PI/2;tie.position.x=x;bundle.add(tie);}
   }
  }
  if(id==='straw')group.position.x=-1.35;
  if(id==='wood')group.position.x=-.5;
  prepare(group);
 }
 const contactPreviews={};
 for(const[id,e]of Object.entries(entries)){
  const root=e.source.clone(true);root.name='J74_actual_construction_piece';e.placement.add(root);prepare(root);root.visible=false;
  const planes=[new THREE.Plane(new THREE.Vector3(1,0,0),0),new THREE.Plane(new THREE.Vector3(-1,0,0),0),new THREE.Plane(new THREE.Vector3(0,0,1),0),new THREE.Plane(new THREE.Vector3(0,0,-1),0)];
  root.traverse(o=>{if(o.isMesh){const ms=Array.isArray(o.material)?o.material:[o.material];const clones=ms.map(m=>{const c=m.clone();c.clippingPlanes=planes;c.clipShadows=true;return c;});o.material=Array.isArray(o.material)?clones:clones[0];}});
  contactPreviews[id]={root,planes,nodes:e.manifest.parts.map(p=>({object:root.getObjectByName(p.node_name),...p}))};
 }
 const woodBrace=new THREE.Group();entries.wood.placement.add(woodBrace);
 const looseTie=new THREE.Group();looseTie.name='Unfinished_straw_binding';entries.straw.placement.add(looseTie);
 const cordMaterial=new THREE.MeshStandardMaterial({color:0x896333,roughness:1});
 const loop=new THREE.Mesh(new THREE.TorusGeometry(.11,.018,7,22),cordMaterial);loop.rotation.y=Math.PI/2;loop.position.set(-1.9,.65,2.18);looseTie.add(loop);
 const cordCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(-1.9,.65,2.29),new THREE.Vector3(-1.92,.46,2.37),new THREE.Vector3(-1.86,.27,2.43),new THREE.Vector3(-1.72,.2,2.46)]);
 looseTie.add(new THREE.Mesh(new THREE.TubeGeometry(cordCurve,16,.017,6,false),cordMaterial));prepare(looseTie);
 const bm=new THREE.MeshStandardMaterial({color:0x9c7246,roughness:.85});
 const woodPlot=entries.wood.placement.getWorldPosition(new THREE.Vector3()),braceY=ground(woodPlot.x-3.1,woodPlot.z+5.4)-woodPlot.y;
 for(let i=0;i<1;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(2.15,.13,.2),bm);m.position.set(-3.1,braceY+.065,5.4);m.rotation.y=.15;woodBrace.add(m);}prepare(woodBrace);
 const check=new THREE.Group();entries.brick.placement.add(check);
 const post=new THREE.Mesh(new THREE.BoxGeometry(.06,.8,.06),bm);post.position.set(-1.8,.4,4.4);check.add(post);
 const mark=new THREE.Mesh(new THREE.SphereGeometry(.11,10,6),new THREE.MeshStandardMaterial({color:0xe8cf72,roughness:.9}));mark.position.set(-1.8,.85,4.4);check.add(mark);prepare(check);
 const choiceGroups={};
 const centers={straw:-2.8,wood:-.7,brick:-2};
 for(const[id,e]of Object.entries(entries)){
  const group=new THREE.Group();group.name='Three_material_candidates_'+id;e.placement.add(group);group.visible=false;
  const rings=[];
  for(const[k,material]of ['straw','wood','brick'].entries()){
   const holder=new THREE.Group(),model=props[material].clone(true);model.position.set(0,0,0);model.visible=true;model.updateMatrixWorld(true);
   const b=new THREE.Box3().setFromObject(model),c=b.getCenter(new THREE.Vector3());model.position.set(-c.x,-b.min.y,-c.z);holder.add(model);holder.scale.setScalar(.62);holder.position.set(centers[id]-1.75+k*1.65,.035,6.6);
   const plot=e.placement.getWorldPosition(new THREE.Vector3()),y=ground(plot.x+holder.position.x,plot.z+holder.position.z)-plot.y;
   holder.position.y=y+.18;group.add(holder);
   const support=new THREE.Mesh(new THREE.BoxGeometry(1.3,.16,.72),bm);support.position.set(holder.position.x,y+.08,holder.position.z);group.add(support);
   const ring=new THREE.Mesh(new THREE.TorusGeometry(.69,.025,5,48),new THREE.MeshBasicMaterial({color:0xe8c95f}));ring.rotation.x=Math.PI/2;ring.position.set(holder.position.x,y+.185,holder.position.z);ring.visible=false;group.add(ring);rings.push(ring);
  }
  choiceGroups[id]={group,rings};prepare(group);
 }
 const breeze=new THREE.Group();entries.brick.placement.add(breeze);
 const breezeLeaves=[];for(let i=0;i<3;i++){const leaf=new THREE.Mesh(new THREE.SphereGeometry(1,8,5),new THREE.MeshStandardMaterial({color:0xa48e4c,roughness:1}));leaf.scale.set(.15,.012,.08);breeze.add(leaf);breezeLeaves.push(leaf);}prepare(breeze);
 const actionRoot=new THREE.Group();actionRoot.name='J71_build_action';entries.straw.placement.parent.add(actionRoot);
 const platform=new THREE.Group();actionRoot.add(platform);
 const plank=new THREE.Mesh(new THREE.BoxGeometry(1.8,.12,.85),bm);plank.position.y=-.06;platform.add(plank);
 for(const x of [-.7,.7])for(const z of [-.3,.3]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.12,2.4,.12),bm);leg.position.set(x,-1.26,z);platform.add(leg);}
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle='#ffe588';ctx.strokeStyle='#8b5430';ctx.lineWidth=8;ctx.beginPath();for(let i=0;i<16;i++){const a=i*Math.PI/8,r=i%2?38:108,x=128+Math.cos(a)*r,y=128+Math.sin(a)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();ctx.fill();ctx.stroke();
 const impact=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(canvas),transparent:true,depthTest:true,toneMapped:false}));impact.scale.set(.36,.36,1);actionRoot.add(impact);
 const cumulatives=Object.fromEntries(Object.entries(entries).map(([house,entry])=>[house,createCumulativeStraw({THREE,entry,prepare,house,center:{straw:[2.1,0,-2.25],wood:[-20,-.14,-15],brick:[20,1.06,-14]}[house]})]));
 let activeCumulative=null;
 const exteriorGeometry={};
 function exteriorIndex(house){
  if(exteriorGeometry[house])return exteriorGeometry[house];
  const triangles=[],buckets=new Map(),root=assemblies[house].root;root.updateWorldMatrix(true,true);
  for(const part of entries[house].manifest.parts){if(/__Interior|__Door/.test(part.node_name))continue;
   root.getObjectByName(part.node_name)?.traverse(mesh=>{if(!mesh.isMesh)return;const g=mesh.geometry,pos=g.attributes.position,idx=g.index,va=new THREE.Vector3(),vb=new THREE.Vector3(),vc=new THREE.Vector3(),count=idx?idx.count:pos.count;
    for(let i=0;i<count;i+=3){va.fromBufferAttribute(pos,idx?idx.getX(i):i).applyMatrix4(mesh.matrixWorld);vb.fromBufferAttribute(pos,idx?idx.getX(i+1):i+1).applyMatrix4(mesh.matrixWorld);vc.fromBufferAttribute(pos,idx?idx.getX(i+2):i+2).applyMatrix4(mesh.matrixWorld);
     const min=Math.min(va.y,vb.y,vc.y),max=Math.max(va.y,vb.y,vc.y),t={v:[...va.toArray(),...vb.toArray(),...vc.toArray()],min,max,node:part.node_name,stage:part.first_stage},id=triangles.length;triangles.push(t);
     for(let b=Math.floor(min/.04);b<=Math.floor(max/.04);b++){if(!buckets.has(b))buckets.set(b,[]);buckets.get(b).push(id);}
    }
   });
  }
  return exteriorGeometry[house]={triangles,buckets,slices:new Map()};
 }
 const ev0=new THREE.Vector3(),ev1=new THREE.Vector3(),ev2=new THREE.Vector3(),ehit=new THREE.Vector3();
 let time=0,build=null;
 return{
  exteriorContact(b, axis, height){
   const index=exteriorIndex(b.house),key=height.toFixed(8);let segments=index.slices.get(key);
   if(!segments){segments=[];
    for(const id of index.buckets.get(Math.floor(height/.04))||[]){const t=index.triangles[id];if(height<t.min-1e-8||height>t.max+1e-8)continue;const pts=[];
     for(const [i,j]of [[0,3],[3,6],[6,0]]){const ay=t.v[i+1],by=t.v[j+1];if(Math.abs(by-ay)<1e-10)continue;const u=(height-ay)/(by-ay);if(u>=0&&u<=1){const x=t.v[i]+(t.v[j]-t.v[i])*u,z=t.v[i+2]+(t.v[j+2]-t.v[i+2])*u;if(!pts.some(p=>Math.abs(p[0]-x)+Math.abs(p[1]-z)<1e-8))pts.push([x,z]);}}
     if(pts.length>=2)segments.push([pts[0][0],pts[0][1],pts[1][0],pts[1][1],t.stage,t.node]);
    }index.slices.set(key,segments);
   }
   const ox=b.target[0]-axis[0]*8,oz=b.target[2]-axis[2]*8,dx=axis[0],dz=axis[2];let best=null,distance=16;
   for(const p of segments){if(p[4]>Math.max(2,b.stage))continue;const ex=p[2]-p[0],ez=p[3]-p[1],den=dx*ez-dz*ex;if(Math.abs(den)<1e-12)continue;const ax=p[0]-ox,az=p[1]-oz,t=(ax*ez-az*ex)/den,u=(ax*dz-az*dx)/den;if(t>=0&&t<distance&&u>=-1e-8&&u<=1+1e-8){distance=t;best={point:[ox+dx*t,height,oz+dz*t],node:p[5],distance:t};}}
   return best;
  },
  cumulativeAudit(){return activeCumulative?cumulatives[activeCumulative].audit():{active:false};},
  contactSites(){
   const output={};
   for(const[id,a]of Object.entries(assemblies)){
    a.root.updateWorldMatrix(true,true);const center=entries[id].placement.getWorldPosition(new THREE.Vector3());
    const cz={straw:-2.25,wood:-15,brick:-14}[id],cx={straw:2.1,wood:-20,brick:20}[id],base={straw:0,wood:-.14,brick:1.06}[id];
    output[id]=[];
    for(let stage=0;stage<5;stage++){
     const names=entries[id].manifest.parts.filter(p=>stage<2? /__(Frame|Corner_quoins)$/.test(p.node_name):stage===2||stage===4?/__Wall_(Front|Back|Left|Right)$/.test(p.node_name):/__Roof_(Thatch_|Left|Right|Main_Hip)/.test(p.node_name)).map(p=>p.node_name);
     const candidates=names.map(n=>a.root.getObjectByName(n));const sites=[];
     for(let sector=0;sector<4;sector++){
      const az=(45+sector*90)*Math.PI/180,right=new THREE.Vector3(Math.cos(az),0,-Math.sin(az));let hit=null;
      const desired=stage===3?3.05:.57;
      const heights=[desired,...Array.from({length:32},(_,i)=>desired+(i%2?1:-1)*(.025+Math.floor(i/2)*.025))];
      for(const height of heights){
       let origin=new THREE.Vector3(cx,base+height,cz).addScaledVector(right,-8),direction=right,objects=candidates;
       if(stage===2||stage===4){const side=['Front','Right','Back','Left'][sector],object=candidates.find(o=>o.name.endsWith('_'+side)),box=new THREE.Box3().setFromObject(object);objects=[object];
        if(sector===0){origin.set(box.min.x+.23,base+height,box.max.z+2);direction=new THREE.Vector3(0,0,-1);}
        if(sector===1){origin.set(box.max.x+2,base+height,box.max.z-.23);direction=new THREE.Vector3(-1,0,0);}
        if(sector===2){origin.set(box.max.x-.23,base+height,box.min.z-2);direction=new THREE.Vector3(0,0,1);}
        if(sector===3){origin.set(box.min.x-2,base+height,box.min.z+.23);direction=new THREE.Vector3(1,0,0);}
       }
       const ray=new THREE.Raycaster(origin,direction,0,16),hits=ray.intersectObjects(objects,true);if(hits.length){hit=hits[0];break;}
      }
      if(!hit)throw Error('No actual construction contact '+id+' '+stage+' '+sector);
      let node=hit.object;while(node&&!names.includes(node.name))node=node.parent;
      sites.push({target:hit.point.toArray(),node:node.name,sector,stage:stage+1});
     }output[id].push(sites);
    }
   }return output;
  },
  contactAudit(){
   if(!build)return null;
   const a=assemblies[build.house],part=entries[build.house].manifest.parts.find(p=>p.node_name===build.contactNode),object=a.root.getObjectByName(part.node_name),point=new THREE.Vector3(...build.target);object.updateWorldMatrix(true,true);
   let distance=Infinity;
   for(const d of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]){const direction=new THREE.Vector3(...d),ray=new THREE.Raycaster(point.clone().addScaledVector(direction,-.03),direction,0,.06);for(const hit of ray.intersectObject(object,true))distance=Math.min(distance,hit.point.distanceTo(point));}
   const p=contactPreviews[build.house],visible=cumulatives[build.house].contactVisible(part.node_name,build.target);
   return{node:part.node_name,target:build.target,surfaceDistance:distance,actualPartVisible:visible,preview:p.root.visible,independentStake:false,platform:build.platform};
  },
  inspectParts(){return Object.fromEntries(Object.entries(assemblies).map(([id,a])=>[id,entries[id].manifest.parts.map(p=>{const o=a.root.getObjectByName(p.node_name);const b=new THREE.Box3().setFromObject(o);return{name:p.node_name,stage:p.first_stage,min:b.min.toArray(),max:b.max.toArray()};})]));},
  apply(houses){for(const [id,a]of Object.entries(assemblies)){
   const stage=houses[id].constructionStage??5;a.controller.setStage(stage);
   a.root.visible=stage<5;if(stage<5)for(const o of a.siblings)o.visible=false;
   if(id==='brick'&&stage===5)a.siblings[0].visible=true;
   records[id]={stage,assemblyVisible:a.root.visible,visibleParts:a.root.visible?entries[id].manifest.parts.filter(p=>p.first_stage<=stage).length:0,completeStatic:stage===5&&houses[id].intact};
  }invalidate();},
  timeline(state){time=state.sourceTime??state.time;for(const[id,p]of Object.entries(props))p.visible=time<({straw:14.7,wood:22.8,brick:35.5}[id]);woodBrace.visible=time>=22.8;looseTie.visible=time>=14.7&&time<48.3;check.visible=time>=5&&time<35.5;mark.visible=time>=29.6||Math.floor(time*1.3)%2===0;
   const drama=state.drama,selected=drama?.kind==='choice',key=selected?Object.keys(state.houses).find(k=>state.houses[k].projectId===drama.projectId):null;
   for(const[id,c]of Object.entries(choiceGroups)){c.group.visible=selected&&id===key;c.rings.forEach((r,k)=>r.visible=c.group.visible&&['straw','wood','brick'][k]===drama.material&&drama.selection>.5);}
   if(selected)for(const p of Object.values(props))p.visible=false;
   breeze.visible=selected&&key==='brick';if(breeze.visible){const plot=entries.brick.placement.getWorldPosition(new THREE.Vector3());breezeLeaves.forEach((leaf,i)=>{const u=(drama.elapsed+i*.65)%4,x=.5-u*1.25,z=6.1+i*.35;leaf.position.set(x,ground(plot.x+x,plot.z+z)-plot.y+.12+Math.sin(u*4+i)*.05,z);leaf.rotation.set(.2,drama.elapsed*2+i,Math.sin(drama.elapsed*3+i)*.3);});}
   build=state.build||null;platform.visible=!!build?.platform;impact.visible=!!build?.impact;

   for(const p of Object.values(contactPreviews))p.root.visible=false;
   if(build){
    platform.position.fromArray(build.worldRoot);platform.rotation.y=build.workYaw;
    for(const leg of platform.children.slice(1)){leg.scale.y=build.platformHeight/2.4;leg.position.y=-.06-build.platformHeight/2;}
    impact.position.fromArray(build.target);for(const p of Object.values(props))p.visible=false;check.visible=false;}
   activeCumulative=state.completion?.house||build?.house||null;
   for(const[id,c]of Object.entries(cumulatives)){
    c.apply(id===activeCumulative?(state.completion?{house:id,stage:5,visit:7,workPhase:1}:build):null);
    if(id===activeCumulative){assemblies[id].root.visible=false;for(const o of assemblies[id].siblings)o.visible=false;contactPreviews[id].root.visible=false;}
   }
   if(state.world.cooperation===null){woodBrace.visible=false;if((state.animationTime??state.time)<64)looseTie.visible=false;}
   if(drama?.checkMark){mark.visible=true;mark.material.color.set(drama.checkMark==='stop'?0xc87550:0x8aaf72);}
   else mark.material.color.set(0xe8cf72);
  },
  record(){return{time,stages:structuredClone(records),props:{woodBrace:woodBrace.visible,looseTie:looseTie.visible,choices:Object.fromEntries(Object.entries(choiceGroups).map(([id,c])=>[id,c.group.visible])),breeze:breeze.visible},method:'discrete source mesh visibility; no reverse collapse; still-character reaction montage',brickPartialStage:'existing masonry corner columns; continuous low wall courses unavailable',workerHandAnimation:true,build:build?structuredClone(build):null};},
  reset(){for(const a of Object.values(assemblies)){a.controller.reset();a.root.visible=true;for(const o of a.siblings)o.visible=false;}for(const p of Object.values(props))p.visible=true;for(const c of Object.values(choiceGroups))c.group.visible=false;woodBrace.visible=false;looseTie.visible=false;breeze.visible=false;check.visible=false;invalidate();}
 };
}

