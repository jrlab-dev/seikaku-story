export function createBlowawayDeparture(THREE,scene,clip,wind){
 const nodes=[...new Set(clip.tracks.map(t=>THREE.PropertyBinding.findNode(scene,THREE.PropertyBinding.parseTrackName(t.name).nodeName)).filter(Boolean))];
 const materials=[];for(const n of nodes)n.traverse(o=>{if(o.isMesh){const clone=m=>{const c=m.clone();materials.push({m:c,opacity:c.opacity,transparent:c.transparent,depthWrite:c.depthWrite});return c;};o.material=Array.isArray(o.material)?o.material.map(clone):clone(o.material);}});
 let lastCarry=0;
 const before=()=>{for(const n of nodes){n.position.x-=wind[0]*lastCarry;n.position.z-=wind[2]*lastCarry;}lastCarry=0;};
 return{before,apply(time){const carry=Math.max(0,time-4)*12,fade=1-Math.max(0,Math.min(1,(time-6)/2));for(const n of nodes){n.position.x+=wind[0]*carry;n.position.z+=wind[2]*carry;n.visible=fade>0;}lastCarry=carry;for(const {m,opacity,transparent,depthWrite}of materials){m.opacity=opacity*fade;m.transparent=transparent||fade<1;m.depthWrite=fade<1?false:depthWrite;}},reset(){before();for(const n of nodes)n.visible=true;for(const {m,opacity,transparent,depthWrite}of materials){m.opacity=opacity;m.transparent=transparent;m.depthWrite=depthWrite;}}};
}
