import {getStoryAssetPlan} from './story_asset_plan.mjs';
import * as THREE from 'three';
import {wrapAngle} from './sprite_math.mjs';
export async function installTwoPoseRun(layer){
 const plan=getStoryAssetPlan();if(plan&&!Object.values(plan.motions).some(ms=>ms.includes('run_two_pose')))return layer;
 const manifest=await (await fetch('./assets/run_two_pose/manifest.json')).json();
 const frames=await Promise.all(manifest.frames.map(async f=>{
  const texture=await new THREE.TextureLoader().loadAsync(f.url);
  texture.colorSpace=THREE.SRGBColorSpace;texture.generateMipmaps=false;
  texture.minFilter=texture.magFilter=THREE.LinearFilter;return {...f,texture};
 }));
 const originalUpdate=layer.update.bind(layer);
 const originalWarnings=layer.viewWarnings.bind(layer),originalCapabilities=layer.motionCapabilities.bind(layer);
 layer.viewWarnings=()=>[...originalWarnings(),...layer.actors.filter(a=>a.requestedVisible&&a.runStatus&&!a.runStatus.supported).map(a=>a.data.label+'（走行の角度が未制作）')];
 layer.motionCapabilities=()=>({...originalCapabilities(),runTwoPose:{actors:['pig_straw','pig_wood'],phases:2,authoredViews:1,view:'right-facing oblique',fullDirectionSupport:false}});
 layer.update=(camera,dt)=>{
  const result=originalUpdate(camera,dt);
  for(const a of layer.actors){
   if(a.motion!=='run_two_pose'){a.runStatus=null;continue;}
   const relative=wrapAngle(a.yaw-a.status.azimuth),supported=a.status.supported&&Math.abs(wrapAngle(relative-Math.PI/4))<=Math.PI/6;
   const phase=Math.floor((a.motionTime+1e-7)/.8)%2;
   a.runStatus={phase,relativeDegrees:relative*180/Math.PI,supported,authoredViews:1};
   a.card.visible=a.requestedVisible&&supported;a.shadow.visible=a.card.visible&&!a.elevated;
   if(!supported){if(a.requestedVisible)result.unsupported.push(a.data.label+'（走行の角度が未制作）');continue;}
   const f=frames.find(f=>a.data.id==='pig_'+f.kind&&f.phase===phase);if(!f)throw Error('Missing real running pose');
   const pair=frames.filter(x=>x.kind===f.kind),scale=a.data.heightMetres/Math.max(...pair.map(x=>x.heightPixels));
   const [x0,y0,x1,y1]=f.bounds,[ax,ay]=f.footAnchor,p=a.card.geometry.attributes.position,uv=a.card.geometry.attributes.uv;
   const bob=.012*(1-Math.cos(a.motionTime/.8*Math.PI*2));
   p.setXYZ(0,(x0-ax)*scale,(ay-y0)*scale+bob,0);p.setXYZ(1,(x1-ax)*scale,(ay-y0)*scale+bob,0);
   p.setXYZ(2,(x0-ax)*scale,bob,0);p.setXYZ(3,(x1-ax)*scale,bob,0);
   uv.setXY(0,x0/1254,1-y0/1254);uv.setXY(1,x1/1254,1-y0/1254);uv.setXY(2,x0/1254,1-y1/1254);uv.setXY(3,x1/1254,1-y1/1254);
   p.needsUpdate=uv.needsUpdate=true;a.card.geometry.computeBoundingSphere();a.card.material.map=f.texture;
   a.frameKey='run_two_pose:'+phase;a.renderedMotion='run_two_pose';
  }
  return result;
 };
 return layer;
}
