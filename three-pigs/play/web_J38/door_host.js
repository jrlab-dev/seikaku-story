import * as THREE from 'three';
export async function installDoorHost(layer,ground){
 const configs={pig_wood:{url:'./owner_wood_door.png',width:1210,height:1300,body:1176,foot:[520,1234],hand:[1155,500]},pig_brick:{url:'./owner_brick_door.png',width:1142,height:1378,body:1287,foot:[470,1324],hand:[1114,555]}};
 for(const d of Object.values(configs)){d.texture=await new THREE.TextureLoader().loadAsync(d.url);d.texture.colorSpace=THREE.SRGBColorSpace;d.texture.generateMipmaps=false;d.texture.minFilter=d.texture.magFilter=THREE.LinearFilter;d.geometry=new THREE.PlaneGeometry(1,1,24,24);d.material=new THREE.MeshBasicMaterial({map:d.texture,transparent:true,alphaTest:7/255,depthWrite:true,side:THREE.DoubleSide,toneMapped:false});}
 const apply=layer.applyStory.bind(layer),update=layer.update.bind(layer);let poses=new Map();
 layer.applyStory=(items,t)=>{poses=new Map(items.map(p=>[p.id,p]));return apply(items,t);};
 layer.update=(camera,dt)=>{const result=update(camera,dt);for(const a of layer.actors){const p=poses.get(a.data.id),h=p?.ownerDoor,d=configs[a.data.id];if(!h||!d)continue;
  const scale=a.data.heightMetres/d.body,handX=(d.hand[0]-d.foot[0])*scale,handY=(d.foot[1]-d.hand[1])*scale;let x=h.contactXZ[0]+.7,z=h.contactXZ[1]-.35,az=0;
  for(let k=0;k<8;k++){az=Math.atan2(camera.position.x-x,camera.position.z-z);x=h.contactXZ[0]+Math.cos(az)*handX;z=h.contactXZ[1]-Math.sin(az)*handX;}
  const y=h.floor;a.root.position.set(x,y,z);a.card.visible=a.requestedVisible;a.shadow.visible=true;
  const pos=d.geometry.attributes.position;for(let i=0;i<pos.count;i++){const col=i%25,row=Math.floor(i/25),sx=col/24*d.width,sy=row/24*d.height,px=-(sx-d.foot[0])*scale,py=(d.foot[1]-sy)*scale,w=Math.max(0,1-py/.38),moving=h.phase==='opening'||h.phase==='closing',wave=moving?Math.sin(a.motionTime*17+(sx<d.foot[0]?0:Math.PI)):0;pos.setXYZ(i,px+w*.025*wave,py+w*.045*Math.max(0,wave),0);}
  pos.needsUpdate=true;d.geometry.computeBoundingSphere();a.card.geometry=d.geometry;a.card.material=d.material;a.card.rotation.set(0,az,0);for(const o of a.root.children)if(o.name==='paper_cut_edge')o.visible=false;
  a.paperStatus={...a.paperStatus,action:'door_host',phase:h.phase,doorOpen:h.open,contact:[h.contactXZ[0],y+handY,h.contactXZ[1]],handWorld:[x-Math.cos(az)*handX,y+handY,z+Math.sin(az)*handX],root:a.root.position.toArray(),running:false,thresholdZ:h.thresholdZ,insideDepth:h.thresholdZ-z};
 }return result;};
}
