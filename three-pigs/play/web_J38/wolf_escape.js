import {getStoryAssetPlan} from './story_asset_plan.mjs';
import * as THREE from 'three';
export async function installWolfEscape(layer){
 const plan=getStoryAssetPlan(),needs=plan?.wolf,motions=plan?.motions.wolf;
 if(plan&&!needs.frontRun&&!needs.rearRun&&!needs.hotJump&&!needs.tail&&!motions?.some(m=>['idea','tired'].includes(m)))return;
 const image=(url,needed)=>needed===false?Promise.resolve(new THREE.Texture()):new THREE.TextureLoader().loadAsync(url);
 const panicTexture=await image('./wolf_panic_jump.png',needs?.hotJump);panicTexture.colorSpace=THREE.SRGBColorSpace;panicTexture.generateMipmaps=false;panicTexture.minFilter=panicTexture.magFilter=THREE.LinearFilter;
 const panicGeometry=new THREE.PlaneGeometry(1,1),panicMaterial=new THREE.MeshBasicMaterial({map:panicTexture,transparent:true,alphaTest:32/255,depthWrite:true,side:THREE.DoubleSide,toneMapped:false});
 const run=await(await fetch('./escape_wolf/build.json')).json(),textures=await Promise.all(run.frames.map(async f=>{const t=await image(f.url,needs?.frontRun);t.colorSpace=THREE.SRGBColorSpace;t.generateMipmaps=false;t.minFilter=t.magFilter=THREE.LinearFilter;return t;}));
 const rear=await(await fetch('./escape_wolf_rear/build.json')).json(),rearTextures=await Promise.all(rear.frames.map(async f=>{const t=await image(f.url,needs?.rearRun);t.colorSpace=THREE.SRGBColorSpace;t.generateMipmaps=false;t.minFilter=t.magFilter=THREE.LinearFilter;return t;}));
 const v2=await(await fetch('./wolf_tired_idea_v2.json')).json();
 const loadV2=async n=>{const t=await image('./wolf_'+n+'_v2.png',motions?.includes(n));t.colorSpace=THREE.SRGBColorSpace;t.generateMipmaps=false;t.minFilter=t.magFilter=THREE.LinearFilter;return t;};
 const ideaTexture=await loadV2('idea'),ideaGeometry=new THREE.PlaneGeometry(1,1),ideaMaterial=new THREE.MeshBasicMaterial({map:ideaTexture,transparent:true,alphaTest:7/255,depthWrite:true,side:THREE.DoubleSide,toneMapped:false});
 const tiredTexture=await loadV2('tired');tiredTexture.colorSpace=THREE.SRGBColorSpace;tiredTexture.generateMipmaps=false;tiredTexture.minFilter=tiredTexture.magFilter=THREE.LinearFilter;
 const tiredGeometry=new THREE.PlaneGeometry(1,1),tiredMaterial=new THREE.MeshBasicMaterial({map:tiredTexture,transparent:true,alphaTest:7/255,depthWrite:true,side:THREE.DoubleSide,toneMapped:false});
 const shockGeometry=new THREE.PlaneGeometry(1,1,48,48),geometry=new THREE.PlaneGeometry(1,1),material=new THREE.MeshBasicMaterial({map:textures[0],transparent:true,alphaTest:7/255,depthWrite:true,side:THREE.DoubleSide,toneMapped:false});
 const flameShape=new THREE.Shape();flameShape.moveTo(0,0);flameShape.bezierCurveTo(-.27,.12,-.20,.3,-.12,.44);flameShape.bezierCurveTo(-.10,.25,.03,.30,.03,.65);flameShape.bezierCurveTo(.24,.40,.12,.27,.23,.34);flameShape.bezierCurveTo(.33,.10,.12,-.02,0,0);
 const flame=new THREE.Group(),outer=new THREE.Mesh(new THREE.ShapeGeometry(flameShape),new THREE.MeshBasicMaterial({color:'#ff741f',transparent:true,side:THREE.DoubleSide,depthWrite:false,toneMapped:false})),inner=new THREE.Mesh(new THREE.ShapeGeometry(flameShape),new THREE.MeshBasicMaterial({color:'#ffe664',transparent:true,side:THREE.DoubleSide,depthWrite:false,toneMapped:false}));inner.scale.set(.55,.63,1);inner.position.z=.003;flame.add(outer,inner);
 const wolf=layer.actors.find(a=>a.data.id==='wolf');wolf.root.add(flame);let tail=null,away=false,jumpPose=false;
 const apply=layer.applyStory.bind(layer),update=layer.update.bind(layer);
 layer.applyStory=(poses,t)=>{jumpPose=!!poses.find(p=>p.id==='wolf')?.singleHotJump;away=!!poses.find(p=>p.id==='wolf')?.runAway;tail=poses.find(p=>p.id==='wolf')?.tailFlame??null;return apply(poses,t);};
 layer.update=(camera,dt)=>{const result=update(camera,dt),a=wolf;flame.visible=false;if(!a.card.visible)return result;
  if(a.motion==='run_spiral'||a.motion==='startled'){
   const phase=a.motion==='startled'?0:Math.floor(a.motionTime*run.fps+1e-7)%8,ax=512,ay=971,scale=a.data.heightMetres/run.nominalHeight/run.pixelsPerMetre,p=geometry.attributes.position,u=geometry.attributes.uv;
   const az=Math.atan2(camera.position.x-a.root.position.x,camera.position.z-a.root.position.z),mirror=away?false:Math.sin(a.yaw-az)<0;
   p.setXYZ(0,-ax*scale,ay*scale,0);p.setXYZ(1,(1024-ax)*scale,ay*scale,0);p.setXYZ(2,-ax*scale,(ay-1024)*scale,0);p.setXYZ(3,(1024-ax)*scale,(ay-1024)*scale,0);
   let u0=0,u1=1;if(mirror)[u0,u1]=[u1,u0];u.setXY(0,u0,1);u.setXY(1,u1,1);u.setXY(2,u0,0);u.setXY(3,u1,0);p.needsUpdate=u.needsUpdate=true;geometry.computeBoundingSphere();material.map=(away?rearTextures:textures)[phase];
   if(a.motion==='startled'){const pp=shockGeometry.attributes.position,uvs=shockGeometry.attributes.uv;for(let i=0;i<pp.count;i++){const col=i%49,row=Math.floor(i/49),sx=col/48*1024,sy=row/48*1024,mx=mirror?342:682,ex=mirror?304:720,mouth=Math.exp(-(((sx-mx)/83)**2+((sy-525)/64)**2)),eyes=Math.exp(-(((sx-ex)/130)**2+((sy-410)/50)**2));pp.setXYZ(i,(sx-ax-(sx-mx)*.32*mouth)*scale,(ay-sy+12*eyes)*scale,0);uvs.setXY(i,mirror?1-col/48:col/48,1-row/48);}pp.needsUpdate=uvs.needsUpdate=true;shockGeometry.computeBoundingSphere();a.card.geometry=shockGeometry;}else a.card.geometry=geometry;a.card.material=material;a.card.rotation.set(0,az,0);for(const o of a.root.children)if(o.name==='paper_cut_edge')o.visible=false;
   a.paperStatus={...a.paperStatus,expression:a.motion==='startled'?'surprised_open_eyes':'panicked_open_mouth',action:a.motion,running:a.motion==='run_spiral',runRepresentation:'approved J68 integrated run mechanism',source:away?rear.source:run.source,rearView:away,opacity:material.opacity,runFrame:phase,mirror,lowerOriginalLegsVisible:false,visibleFootY:(ay-run.frames[phase].bounds[3])*scale,root:a.root.position.toArray()};
  }
  if(a.motion==='tired'){
   const d=v2.tired,[w,h]=d.size,[ax,ay]=d.anchor,p=tiredGeometry.attributes.position,scale=a.data.heightMetres/v2.idea.body,breath=1+.009*Math.sin(a.motionTime*7),az=Math.atan2(camera.position.x-a.root.position.x,camera.position.z-a.root.position.z);
   p.setXYZ(0,-ax*scale,ay*scale*breath,0);p.setXYZ(1,(w-ax)*scale,ay*scale*breath,0);p.setXYZ(2,-ax*scale,(ay-h)*scale*breath,0);p.setXYZ(3,(w-ax)*scale,(ay-h)*scale*breath,0);p.needsUpdate=true;tiredGeometry.computeBoundingSphere();
   a.card.geometry=tiredGeometry;a.card.material=tiredMaterial;a.card.rotation.set(0,az,0);for(const o of a.root.children)if(o.name==='paper_cut_edge')o.visible=false;
   a.paperStatus={...a.paperStatus,action:'tired',running:false,tiredAsset:'wolf_tired_v2.png',visibleFootY:0};
  }
  if(a.motion==='idea'){
   const d=v2.idea,[w,h]=d.size,[ax,ay]=d.anchor,p=ideaGeometry.attributes.position,scale=a.data.heightMetres/d.body,az=Math.atan2(camera.position.x-a.root.position.x,camera.position.z-a.root.position.z);
   p.setXYZ(0,-ax*scale,ay*scale,0);p.setXYZ(1,(w-ax)*scale,ay*scale,0);p.setXYZ(2,-ax*scale,(ay-h)*scale,0);p.setXYZ(3,(w-ax)*scale,(ay-h)*scale,0);p.needsUpdate=true;ideaGeometry.computeBoundingSphere();
   a.card.geometry=ideaGeometry;a.card.material=ideaMaterial;a.card.rotation.set(0,az,0);for(const o of a.root.children)if(o.name==='paper_cut_edge')o.visible=false;
   a.paperStatus={...a.paperStatus,action:'idea',running:false,ideaAsset:'wolf_idea_v2.png',visibleFootY:0};
  }
  const singleJump=jumpPose;
  if(singleJump){
   const w=panicTexture.image.width,h=panicTexture.image.height,p=panicGeometry.attributes.position,scale=a.data.heightMetres/(h*.887),ax=w*.39,ay=h*.926,az=Math.atan2(camera.position.x-a.root.position.x,camera.position.z-a.root.position.z);
   p.setXYZ(0,-ax*scale,ay*scale,0);p.setXYZ(1,(w-ax)*scale,ay*scale,0);p.setXYZ(2,-ax*scale,(ay-h)*scale,0);p.setXYZ(3,(w-ax)*scale,(ay-h)*scale,0);const uv=panicGeometry.attributes.uv;uv.setXY(0,1,1);uv.setXY(1,0,1);uv.setXY(2,1,0);uv.setXY(3,0,0);uv.needsUpdate=true;p.needsUpdate=true;panicGeometry.computeBoundingSphere();a.card.geometry=panicGeometry;a.card.material=panicMaterial;a.card.rotation.set(0,az,0);
   a.paperStatus={...a.paperStatus,expression:'panicked_open_mouth',running:false,runRepresentation:null,source:'wolf_panic_jump.png',mirror:true,lowerOriginalLegsVisible:true,visibleFootY:0,singleJump:true};
  }
  if(tail?.active){
   const az=a.card.rotation.y,sign=a.paperStatus?.mirror?-1:1,offset=new THREE.Vector3((a.motion==='run_spiral'?-.57:-.78)*sign,a.motion==='run_spiral'?.57:.60,.03).applyAxisAngle(new THREE.Vector3(0,1,0),az);
   if(singleJump)offset.set(.71,.47,.03).applyAxisAngle(new THREE.Vector3(0,1,0),az);
   flame.position.copy(offset);flame.rotation.set(0,az,0);flame.scale.set(.62,.66+.07*Math.sin(tail.elapsed*30),1);flame.visible=true;outer.material.opacity=inner.material.opacity=tail.fade;
  }
  a.paperStatus={...a.paperStatus,tailFlameVisible:flame.visible,tailFlameElapsed:tail?.elapsed??null};return result;
 };
}
