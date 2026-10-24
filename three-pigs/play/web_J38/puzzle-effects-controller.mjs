export function createPuzzleEffect(THREE,gltf){
  const scene=gltf.scene,mixer=new THREE.AnimationMixer(scene);
  const clip=gltf.animations[0],action=clip?mixer.clipAction(clip):null;
  if(action){action.setLoop(THREE.LoopOnce,1);action.clampWhenFinished=true;action.play();}
  const smoke=[];
  scene.traverse(o=>{if(o.isMesh){let p=o,isSmoke=false;while(p){if(p.name.includes('__Smoke_'))isSmoke=true;p=p.parent;}if(isSmoke){o.castShadow=false;o.receiveShadow=false;o.material=Array.isArray(o.material)?o.material.map(m=>m.clone()):o.material.clone();for(const m of [].concat(o.material)){m.transparent=true;m.depthWrite=true;smoke.push(m);}}}});
  let time=0;
  function seek(t){time=Math.max(0,Math.min(8,t));if(action){action.reset().play();mixer.setTime(time);}for(const m of smoke){m.opacity=time<4?1:Math.max(0,1-(time-4)/4);m.depthWrite=time<=4;}scene.visible=smoke.length?time>0&&time<8:true;return time;}
  return {scene,seek,update:dt=>seek(time+Math.max(0,dt)),reset:()=>seek(0),get time(){return time;}};
}
