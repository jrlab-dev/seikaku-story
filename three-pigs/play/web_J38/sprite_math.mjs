export const TAU = Math.PI * 2;
export const wrapAngle = a => Math.atan2(Math.sin(a), Math.cos(a));
export function chooseFrame(bodyYaw, cameraAzimuth, previous = null, hysteresis = 4 * Math.PI / 180) {
  const angle = wrapAngle(bodyYaw - cameraAzimuth);
  if (previous !== null && Math.abs(wrapAngle(angle - previous * Math.PI / 4)) <= Math.PI / 8 + hysteresis) return previous;
  return ((Math.round(angle / (Math.PI / 4)) % 8) + 8) % 8;
}
export function viewSupport(position, height, camera, range = [-15,25]) {
  const dx=camera.x-position.x, dz=camera.z-position.z, distance=Math.hypot(dx,dz);
  const elevation=Math.atan2(camera.y-position.y-height*.5,distance)*180/Math.PI;
  return {supported:distance>.15 && elevation>=range[0] && elevation<=range[1], elevation, azimuth:Math.atan2(dx,dz)};
}
export function frameQuad(frame,height) {
  const scale=height/frame.heightPixels, [x0,y0,x1,y1]=frame.crop, [ax,ay]=frame.footAnchor;
  return {left:(x0-ax)*scale,right:(x1-ax)*scale,top:(ay-y0)*scale,bottom:(ay-y1)*scale,scale};
}
export const STATIC_LAYOUT = [
 {id:'pig_straw',x:9.5,z:-3.5,yaw:0},
 {id:'pig_wood',x:11.3,z:-3,yaw:0},
 {id:'pig_brick',x:13.2,z:-3.5,yaw:0},
 {id:'wolf',x:16,z:-3.3,yaw:0}
];
export function testLayout(kind,t=0,activeIds=STATIC_LAYOUT.map(p=>p.id)) {
 const pose=STATIC_LAYOUT.filter(p=>activeIds.includes(p.id)).map(p=>({...p}));
 const actor=pose.find(p=>p.id==='wolf')||pose.find(p=>p.id==='pig_straw');
 if(kind==='occlusion') {
  if(actor)Object.assign(actor,{x:20,z:-18.5,yaw:0});
  const third=pose.find(p=>p.id==='pig_brick');if(third)Object.assign(third,{x:10,z:9.5,yaw:0});
 }
 if(kind==='translation') {
  const t01=Math.max(0,Math.min(1,t/10)),distance=5*t01;
  if(actor)Object.assign(actor,{x:18,z:1-distance,yaw:Math.PI});
 }
 return pose;
}

