/** Visibility-only assembly. Use a fresh clone of the approved static GLTF scene. */
export function createConstructionController({scene, manifest}) {
  if (!scene?.traverse || manifest?.schema !== 1 || !Array.isArray(manifest.parts)) throw new TypeError('Invalid construction inputs');
  const byName = new Map();
  scene.traverse(o => { const list = byName.get(o.name) || []; list.push(o); byName.set(o.name, list); });
  const parts = manifest.parts.map(p => {
    const candidates = byName.get(p.node_name) || [];
    if (candidates.length !== 1) throw new Error(`Expected one construction node: ${p.node_name}; found ${candidates.length}`);
    if (!Number.isInteger(p.first_stage) || p.first_stage < 1 || p.first_stage > 5) throw new Error('Invalid first_stage');
    return {object:candidates[0], firstStage:p.first_stage, visible:candidates[0].visible};
  });
  const nodes = new Set(parts.map(p => p.object));
  if (nodes.size !== parts.length) throw new Error('Duplicate construction nodes');
  for (const p of parts) for(let a=p.object.parent;a;a=a.parent) if(nodes.has(a)) throw new Error('Overlapping construction nodes');
  scene.traverse(o => {
    if (!o.isMesh) return;
    let a=o; while(a && !nodes.has(a)) a=a.parent;
    if (!a) throw new Error(`Unmapped render mesh: ${o.name}`);
  });
  let stage=5, disposed=false;
  function setStage(value) {
    if(disposed) throw new Error('Construction controller disposed');
    const index=typeof value==='string' ? manifest.stages.find(s=>s.id===value)?.index : value;
    if(!Number.isInteger(index) || index<0 || index>5) throw new RangeError('Construction stage must be 0..5 or a manifest stage id');
    for(const p of parts) p.object.visible=p.visible && p.firstStage<=index;
    stage=index;return stage;
  }
  return {setStage, reset:()=>setStage(0), complete:()=>setStage(5), get stage(){return stage;},
    dispose(){if(disposed)return;for(const p of parts)p.object.visible=p.visible;disposed=true;}
  };
}
