export function createCumulativeStraw({THREE,entry,prepare,house="straw",center=[2.1,0,-2.25]}){
 const root=new THREE.Group();root.name='J78_fixed_'+house+'_construction';entry.placement.add(root);root.visible=false;
 entry.source.updateMatrixWorld(true);root.matrix.copy(entry.source.matrix);root.matrixAutoUpdate=false;
 const inverse=new THREE.Matrix4().copy(entry.source.matrixWorld).invert(),units=[];
 const plane=(x,y,z,c)=>new THREE.Plane(new THREE.Vector3(x,y,z),c);
 const vis=entry.kind||house,[cx,baseY,cz]=center,kind={straw:'Straw',wood:'Wood',brick:'Brick',tent:'Tent',fortress:'Fortress',treehouse:'Treehouse',karakuri:'Karakuri',bunker:'Bunker',castle:'Castle',karakuri_fort:'KarakuriFort'}[vis],name=x=>kind+'__'+x;
 const quadrant=s=>[plane(s===0||s===3?-1:1,0,0,s===0||s===3?cx:-cx),plane(0,0,s<2?1:-1,s<2?-cz:cz)];
 const parts=entry.manifest.parts,allNames=stage=>parts.filter(p=>p.first_stage===stage).map(p=>p.node_name);
 function add(id,stage,sector,names,planes=[]){
  const group=new THREE.Group();group.name=id;root.add(group);
  for(const name of names){const source=entry.source.getObjectByName(name);if(!source)continue;const o=source.clone(true);o.matrix.multiplyMatrices(inverse,source.matrixWorld);o.matrixAutoUpdate=false;group.add(o);
   o.traverse(m=>{if(m.isMesh){const ms=Array.isArray(m.material)?m.material:[m.material],clones=ms.map(mat=>{const c=mat.clone();c.clippingPlanes=planes;c.clipShadows=true;return c;});m.material=Array.isArray(m.material)?clones:clones[0];}});
  }
  prepare(group);units.push({id,stage,sector,names,planes,group,initial:[]});
 }
 add('foundation',0,0,[name('Foundation')]);add('floor',0,0,[name('Floor')]);if(vis==='tent')add('ground',0,0,[name('Groundsheet'),name('Pegs')]);
 for(let s=0;s<4;s++)add('post_'+s,1,s,[name(vis==='brick'?'Corner_quoins':'Frame')],[...quadrant(s),plane(0,-1,0,baseY+2.55)]);
 for(let s=0;s<4;s++)add('beam_'+s,2,s,[name(vis==='brick'?'Corner_quoins':'Frame')],[...quadrant(s),plane(0,1,0,-baseY-2.55)]);
 for(let s=0;s<4;s++){
  const side=['Front','Right','Back','Left'][s];
  add('wall_'+s,3,s,[name('Wall_'+side),name('Window_'+side)]);
  if(vis==='straw')add('binding_'+s,3,s,[name('Wall_Bindings')],quadrant(s));
 }
 if(!['straw','wood','brick'].includes(vis)){add('extra2',2,0,allNames(2).filter(n=>!n.endsWith('__Frame')));add('extra3',3,0,allNames(3).filter(n=>!/__(Wall|Window)_/.test(n)));}
 for(let s=0;s<4;s++)add('roof_'+s,4,s,allNames(4),quadrant(s));
 for(let s=0;s<4;s++)add('finish_'+s,5,s,allNames(5),quadrant(s));
 root.updateWorldMatrix(true,true);
 for(const u of units)u.group.traverse(o=>{if(o.isMesh)u.initial.push({object:o,matrix:o.matrixWorld.toArray()});});
 let active=false,build=null;
 return{
  apply(b){build=b;active=!!b&&b.house===house;root.visible=active;if(!active)return;
   const completed=Math.min(4,b.visit+(b.workPhase>=.35?1:0));
   for(const u of units)u.group.visible=u.stage<b.stage||u.stage===b.stage&&(u.sector<completed||(b.revealedSectors||[]).includes(u.sector));
  },
  contactVisible(node,target){return active&&units.some(u=>u.group.visible&&u.names.includes(node)&&u.planes.every(p=>p.distanceToPoint(new THREE.Vector3(...target))>=-1e-6));},
  audit(){root.updateWorldMatrix(true,true);let maxWorldTransformDelta=0;for(const u of units)for(const m of u.initial){const now=m.object.matrixWorld.elements;for(let i=0;i<16;i++)maxWorldTransformDelta=Math.max(maxWorldTransformDelta,Math.abs(now[i]-m.matrix[i]));}
   return{active,stage:build?.stage,visit:build?.visit,visibleUnits:units.filter(u=>u.group.visible).map(u=>u.id),counts:Object.fromEntries(['post','beam','wall','binding','roof','finish'].map(prefix=>[prefix,units.filter(u=>u.group.visible&&u.id.startsWith(prefix+'_')).length])),maxWorldTransformDelta,units:units.map(u=>({id:u.id,worldMatrix:u.group.matrixWorld.toArray(),clipPlanes:u.planes.map(p=>[...p.normal.toArray(),p.constant])})),method:'fixed source-mesh partitions; deterministic cumulative visibility; no actor-bound transforms'};
  }
 };
}
