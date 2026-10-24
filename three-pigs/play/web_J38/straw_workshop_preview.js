export function installStrawWorkshopPreview(layer){
 const apply=layer.applyStory.bind(layer),update=layer.update.bind(layer),poses=new Map();
 layer.applyStory=(items,t)=>{poses.clear();for(const p of items)poses.set(p.id,p);return apply(items,t);};
 layer.update=(camera,dt)=>{const result=update(camera,dt);for(const a of layer.actors){const pose=poses.get(a.data.id);if(pose?.motion!=='build_hammer'||!a.card.visible)continue;
  const mirror=!!pose.buildMirror;if(mirror){const p=a.card.geometry.attributes.position;for(let i=0;i<p.count;i++)p.setX(i,-p.getX(i));p.needsUpdate=true;a.card.geometry.computeBoundingSphere();}
  a.paperStatus={...a.paperStatus,mirror,prototype:'J78_all_builds'};
 }return result;};
}
