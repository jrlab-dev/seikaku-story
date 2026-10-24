import {createGustAtmosphere} from './gust_atmosphere.js';
import * as THREE from 'three';
import {gustAt} from './story_gust.mjs';
const mouths=[[293,242],[849,242],[1328,248],[1745,236],[220,640],[516,648],[920,664],[1441,652]];
const cells=[[76,35,148.5,387,.0033165829145728643],[477,38,214.5,386,.0033082706766917294],[911,37,209,389,.0033],[1367,45,174.5,379,.003350253807106599],[43,450,189.5,387,.0034464751958224547],[505,456,186.5,382,.0034464751958224547],[911,453,206,387,.0033673469387755102],[1391,455,179.5,385,.003410852713178295]];
const clamp=v=>Math.max(0,Math.min(1,v));
export function createStoryWind(scene,characters,ground=()=>0){
 const group=new THREE.Group();group.name='J50_expanding_gust';scene.add(group);
 const atmosphere=createGustAtmosphere(group,ground);
 const ribbons=[];
 for(let j=0;j<7;j++){
  const geometry=new THREE.BufferGeometry(),points=32,positions=new Float32Array(points*2*3),indices=[];
  for(let i=0;i<points-1;i++){const k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setIndex(indices);
  const material=new THREE.MeshBasicMaterial({color:0xfff9e8,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false,depthTest:true,toneMapped:false});
  const mesh=new THREE.Mesh(geometry,material);mesh.frustumCulled=false;group.add(mesh);ribbons.push(mesh);
 }
 let state=null,last=null;const source=new THREE.Vector3(),end=new THREE.Vector3(),side=new THREE.Vector3(),dir=new THREE.Vector3(),v=new THREE.Vector3();
 const actor=()=>characters.actors.find(a=>a.data.id==='wolf');
 function restore(){const a=actor();if(a)a.card.scale.set(1,1,1);group.visible=false;last=null;}
 return{
  apply(s){state=s;},
  updateVisual(camera){
   const a=actor(),g=state&&(state.gustOverride!==undefined?state.gustOverride:gustAt(state.time));if(!a||!g||!a.card.visible){restore();return;}
   const breath=g.phase==='inhale'?Math.sin(clamp((state.time-g.inhale)/(g.exhale-g.inhale))*Math.PI):0;
   a.card.scale.set(1+.025*breath,1+.018*breath,1);
   group.visible=state.time>=g.emission;
   last={house:g.house,phase:g.phase,front:g.front,impactAt:g.impact,time:state.time,wind:g.wind,visible:group.visible};
   if(!group.visible)return;
   const index=a.index??0,[cx,cy,fx,fy,scale]=cells[index],[mx,my]=mouths[index];
   const x=(mx-cx-fx)*scale,y=(fy-(my-cy))*scale;
   a.card.updateWorldMatrix(true,false);source.set(x,y,.025).applyMatrix4(a.card.matrixWorld);
   dir.fromArray(g.wind);side.set(-dir.z,0,dir.x);
   const length=Math.max(.8,(g.wallZ-source.z)/dir.z);end.copy(source).addScaledVector(dir,length);end.y+=.16;
   const envelope=Math.min(1,clamp((state.time-g.emission)/.13),clamp((g.end-state.time)/.4));
   ribbons.forEach((r,j)=>{
    let lo=0,hi=g.front;
    if(j>=3){const phase=(state.time-g.emission-(j-3)*.16)/.95;hi=Math.min(g.front,phase>=0?(phase%1):0);lo=Math.max(0,hi-.24);}
    const attr=r.geometry.attributes.position;
    for(let i=0;i<32;i++){
     const u=i/31,f=lo+(hi-lo)*u,spread=f*f*(.42+(j%3)*.15),osc=Math.sin(f*8-state.time*9+j*2.1);
     v.copy(source).lerp(end,f).addScaledVector(side,(j<3?j-1:(j%2?1:-1))*spread*.85);
     v.y+=(j<3?j-1:Math.sin(f*8+j))*spread+osc*.10*f;
     const width=(j<3?.028:.045)*(1+f*1.8)*Math.sin(Math.PI*u)*Math.min(1,f*15);
     attr.setXYZ(i*2,v.x,v.y-width,v.z);attr.setXYZ(i*2+1,v.x,v.y+width,v.z);
    }
    attr.needsUpdate=true;r.material.opacity=envelope*(j<3?.44:.55);r.visible=hi>lo+.002;
   });
   const air=atmosphere.update({state,g,source,end,dir,side,camera,envelope});
   if(g.house==='brick'&&g.age>=0){
    for(let j=3;j<7;j++){
     const r=ribbons[j],p=r.geometry.attributes.position,u=((g.age+(j-3)*.18)%.75)/.75,radius=.1+u*.6;
     for(let i=0;i<32;i++){const f=i/31,ang=(-.6+f*1.2)*Math.PI+(j%2?0:Math.PI),width=.02*Math.sin(f*Math.PI);v.copy(end).addScaledVector(dir,-.08-u*.16).addScaledVector(side,Math.cos(ang)*radius);v.y+=Math.sin(ang)*radius;p.setXYZ(i*2,v.x,v.y-width,v.z);p.setXYZ(i*2+1,v.x,v.y+width,v.z);}
     p.needsUpdate=true;r.visible=true;r.material.opacity=(1-u)*envelope*.4;
    }
   }
   last={...last,air,mouth:source.toArray(),wall:end.toArray(),mouthScreen:source.clone().project(camera).toArray(),frame:index,ribbonCount:ribbons.filter(r=>r.visible).length};
  },
  record(){return last?structuredClone(last):null;},
  reset(){state=null;restore();}
 };
}
