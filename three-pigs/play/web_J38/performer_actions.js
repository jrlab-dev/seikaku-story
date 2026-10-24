import {walkPhase,walkView} from './walk_orientation.mjs';
import {villainTexture} from './villain_faces.js';
import * as THREE from 'three';
export async function installPerformerActions(layer){
 const defs=await (await fetch('./performer_actions.json')).json(),clips={};
 for(const[id,d]of Object.entries(defs)){let texture=await new THREE.TextureLoader().loadAsync(d.url);if(id==='wolf_walk')texture=await villainTexture(texture,'walk');texture.colorSpace=THREE.SRGBColorSpace;texture.generateMipmaps=false;texture.minFilter=texture.magFilter=THREE.LinearFilter;clips[id]={...d,texture};}
 const apply=layer.applyStory.bind(layer),update=layer.update.bind(layer),poses=new Map(),cache=new Map();
 layer.applyStory=(items,t)=>{poses.clear();items.forEach(p=>poses.set(p.id,p));const v=apply(items,t);for(const a of layer.actors){const p=poses.get(a.data.id);if(p?.worldY!==undefined)a.root.position.y=p.worldY;}return v;};
 layer.update=(camera,dt)=>{const result=update(camera,dt);
  for(const a of layer.actors){
   const d=clips[a.data.id+'_'+a.motion];if(!d||!a.card.visible)continue;if(a.motion==='walk'&&a.renderedMotion==='walk')continue;// J118：描いた歩きのコマ（性格の歩き方）を優先する
   let c=cache.get(a);if(!c){c={geometry:new THREE.PlaneGeometry(1,1),material:new THREE.MeshBasicMaterial({map:d.texture,transparent:true,alphaTest:7/255,depthWrite:true,side:THREE.DoubleSide,toneMapped:false})};cache.set(a,c);}
   const k=a.motion==='build_hammer'?Math.round(a.motionTime):(a.data.id==='wolf'&&a.motion==='walk'?Math.floor(walkPhase(poses.get(a.data.id)?.walkDistance??a.motionTime)/(Math.PI*2)*d.frames.length):Math.floor(a.motionTime*d.fps))%d.frames.length,f=d.frames[k],scale=a.data.heightMetres/d.bodyHeightPixels,[x,y,w,h]=f.cell,[ax,ay]=f.anchor;
   const az=Math.atan2(camera.position.x-a.root.position.x,camera.position.z-a.root.position.z),mirror=a.motion==='walk'&&walkView(a.yaw,az,1).mirror;
   const anchorX=mirror?w-ax:ax,left=-anchorX*scale,right=(w-anchorX)*scale,top=ay*scale,bottom=(ay-h)*scale,p=c.geometry.attributes.position,u=c.geometry.attributes.uv;
   p.setXYZ(0,left,top,0);p.setXYZ(1,right,top,0);p.setXYZ(2,left,bottom,0);p.setXYZ(3,right,bottom,0);
   let u0=x/d.size[0],u1=(x+w)/d.size[0];if(mirror)[u0,u1]=[u1,u0];const v0=1-(y+h)/d.size[1],v1=1-y/d.size[1];u.setXY(0,u0,v1);u.setXY(1,u1,v1);u.setXY(2,u0,v0);u.setXY(3,u1,v0);p.needsUpdate=u.needsUpdate=true;c.geometry.computeBoundingSphere();
   a.card.geometry=c.geometry;a.card.material=c.material;c.material.map=d.texture;a.card.rotation.set(0,az,0);
   for(const o of a.root.children)if(o.name==='paper_cut_edge')o.visible=false;
   a.paperStatus={...a.paperStatus,running:false,runRepresentation:null,action:a.motion,actionFrame:k,mirror,root:a.root.position.toArray(),visibleFootY:0,anchorX,sourceAnchor:[ax,ay],frameCell:f.cell,anchorErrorPixels:mirror?(w-ax-anchorX):0};
  }return result;
 };
}
