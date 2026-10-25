import {getStoryAssetPlan} from './story_asset_plan.mjs';
import * as THREE from 'three';
import {walkView} from './walk_orientation.mjs';
const IDS=['pig_straw','pig_wood','pig_brick','wolf'];
const FRONT={bomb:{wolf:[1,4,5,6,7,8]},react:{pig:[0,3,4,7,8],wolf:[2,4,6]},stance:{pig:[0,1,2,3,4,5,6,7,8],wolf:[0,1,2,3,4,5,6,7,8]}};
export async function installAnimalReactions(layer){
 const defs=await(await fetch('./reactions/manifest.json')).json();
 const load=async url=>{const t=await new THREE.TextureLoader().loadAsync(url);t.colorSpace=THREE.SRGBColorSpace;t.generateMipmaps=false;t.minFilter=t.magFilter=THREE.LinearFilter;return t;};
 const needs=getStoryAssetPlan()?.reactions;for(const[k,d]of Object.entries(defs)){if(needs&&!needs.includes(k)){delete defs[k];continue;}d.texture=await load(d.url);}
 const rigs=new Map();
 for(const a of layer.actors){const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({transparent:true,alphaTest:.5,depthTest:true,depthWrite:true,side:THREE.DoubleSide,toneMapped:false}));mesh.name='J117_reaction_'+a.data.id;mesh.visible=false;a.root.add(mesh);rigs.set(a,mesh);}
 let poses=new Map();const apply=layer.applyStory.bind(layer),update=layer.update.bind(layer);
 layer.applyStory=(p,t)=>{poses=new Map(p.map(p=>[p.id,p]));return apply(p,t);};
 const audit=[];
 layer.update=(camera,dt)=>{const result=update(camera,dt);audit.length=0;
  for(const[a,mesh]of rigs){const p=poses.get(a.data.id),wolf=a.data.id==='wolf';
   let kind=null,idx=null;
   if(p&&a.requestedVisible!==false&&a.card.visible){
    if(p.bombPose!=null){kind='bomb';idx=p.bombPose;}// J118：爆弾の狼の9コマ
    else if(p.reactionPose!=null){kind='react';idx=p.reactionPose;}
    else if(p.reactionBuild&&a.motion==='build_hammer'){kind='react';idx=p.reactionBuild==='hurry'?1:2;}
    else if(p.stance!=null&&a.motion==='idle'){kind='stance';idx=p.stance;}
   }
   const d=kind&&defs[kind+'_'+a.data.id];
   if(!d){if(mesh.visible){mesh.visible=false;a.card.layers.set(0);for(const o of a.root.children)if(o.name==='paper_cut_edge')o.layers.set(0);}continue;}
   const az=Math.atan2(camera.position.x-a.root.position.x,camera.position.z-a.root.position.z),view=walkView(a.yaw,az,1);
   if(kind==='stance'&&(view.rear||Math.abs(view.side)>.75)){mesh.visible=false;a.card.layers.set(0);continue;}// 後ろ姿・真横では元の絵のまま
   const front=FRONT[kind][wolf?'wolf':'pig'].includes(idx);let mirror=front?false:(p.buildMirror??view.mirror);if(wolf&&((kind==='react'&&idx===5)||(kind==='bomb'&&idx===3)))mirror=!mirror;
   const f=d.frames[idx],[cx,cy,cw,ch]=f.cell,[l,t,r,b]=f.bounds;let[ax,ay]=f.anchor;// 座る・かがむ絵を立ち姿と同じ倍率で描くため、絵1枚ごとではなく『その組の立ち姿の身長』で倍率を決める
   const rf=d.frames[d.ref??0],s=a.data.heightMetres/(rf.bounds[3]-rf.bounds[1]);
   let u0=cx/d.size[0],u1=(cx+cw)/d.size[0];if(mirror){[u0,u1]=[u1,u0];ax=cw-ax;}
   const q=mesh.geometry.attributes.position,u=mesh.geometry.attributes.uv;
   q.setXYZ(0,-ax*s,ay*s,0);q.setXYZ(1,(cw-ax)*s,ay*s,0);q.setXYZ(2,-ax*s,(ay-ch)*s,0);q.setXYZ(3,(cw-ax)*s,(ay-ch)*s,0);
   u.setXY(0,u0,1-cy/d.size[1]);u.setXY(1,u1,1-cy/d.size[1]);u.setXY(2,u0,1-(cy+ch)/d.size[1]);u.setXY(3,u1,1-(cy+ch)/d.size[1]);q.needsUpdate=u.needsUpdate=true;mesh.geometry.computeBoundingSphere();
   mesh.material.map=d.texture;mesh.material.needsUpdate=true;mesh.rotation.set(0,az-a.root.rotation.y,0);mesh.position.set(0,0,.01);mesh.visible=true;
   a.card.layers.set(31);for(const o of a.root.children)if(o.name==='paper_cut_edge')o.layers.set(31);
   audit.push({id:a.data.id,kind,idx,mirror});
  }
  return result;
 };
 window.__animalReactionAudit=()=>audit.slice();
 return layer;
}

const ORDER=[['E',2,0,1],['N',4,2,3],['A',3,6,7],['C',1,4,5],['O',0,8,null]];
export function stanceFor(code){for(const[,i,hi,lo]of ORDER){const d=code[i];if(d==='5'&&hi!=null)return hi;if(d==='1'&&lo!=null)return lo;}return null;}

export function typesFor(code){const out=[];for(const[,i,hi,lo]of ORDER){const d=code[i];if(d==='5'&&hi!=null)out.push(hi);else if(d==='1'&&lo!=null)out.push(lo);}return out;}
export function castTypes(cast){const used=new Set(),out={};for(const role of ['pig_straw','pig_wood','pig_brick','wolf']){const code=cast[role];if(!code)continue;const opts=typesFor(code),pick=opts.find(k=>!used.has(k))??opts[0]??9;used.add(pick);out[role]=pick;}return out;}
