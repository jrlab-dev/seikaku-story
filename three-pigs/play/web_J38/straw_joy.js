import * as THREE from 'three';
const CAST_JOY={
 pig_straw:{file:'joy_straw_front.webp',size:[1190,1322],anchor:[610,1247],bodyHeightPixels:1199,expression:'broad joyful smile'},
 pig_wood:{file:'joy_wood_front.webp',size:[1024,1536],anchor:[503.5,1395],bodyHeightPixels:1299,expression:'friendly open smile and small wave'},
 pig_brick:{file:'joy_brick_front.webp',size:[1024,1536],anchor:[516.5,1453],bodyHeightPixels:1372,expression:'quiet relieved smile with hands together'}
};
export async function installStrawJoy(layer){
 const assets=Object.fromEntries(await Promise.all(Object.entries(CAST_JOY).map(async([id,d])=>{const texture=await new THREE.TextureLoader().loadAsync('./'+d.file);texture.colorSpace=THREE.SRGBColorSpace;texture.generateMipmaps=false;texture.minFilter=texture.magFilter=THREE.LinearFilter;return[id,{...d,geometry:new THREE.PlaneGeometry(1,1),material:new THREE.MeshBasicMaterial({map:texture,transparent:true,alphaTest:7/255,depthWrite:true,side:THREE.DoubleSide,toneMapped:false})}];})));
 const update=layer.update.bind(layer);
 layer.update=(camera,dt)=>{const result=update(camera,dt);for(const a of layer.actors){const d=assets[a.data.id];if(!d||a.motion!=='celebrate_home'||!a.card.visible)continue;
 const scale=a.data.heightMetres/d.bodyHeightPixels,[ax,ay]=d.anchor,[w,h]=d.size,p=d.geometry.attributes.position;
 p.setXYZ(0,-ax*scale,ay*scale,0);p.setXYZ(1,(w-ax)*scale,ay*scale,0);p.setXYZ(2,-ax*scale,(ay-h)*scale,0);p.setXYZ(3,(w-ax)*scale,(ay-h)*scale,0);p.needsUpdate=true;d.geometry.computeBoundingSphere();a.card.geometry=d.geometry;a.card.material=d.material;const az=Math.atan2(camera.position.x-a.root.position.x,camera.position.z-a.root.position.z);a.card.rotation.set(0,az,0);for(const o of a.root.children)if(o.name==='paper_cut_edge')o.visible=false;
 a.paperStatus={...a.paperStatus,action:'celebrate_home',mirror:false,running:false,runRepresentation:null,joyAsset:d.file,facialExpression:d.expression,root:a.root.position.toArray(),visibleFootY:0};
 }return result;};
}
