import * as THREE from 'three';
import {mergeGeometries} from '../vendor/utils/BufferGeometryUtils.js';
export const plots=[{id:'wood',name:'木の家',x:-20,y:-.14,z:-15},{id:'brick',name:'レンガの家',x:20,y:1.06,z:-14}];
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
export function terrace(x,z,y){for(const p of plots){const d=Math.max(Math.abs(x-p.x)-5.05,Math.abs(z-(p.z+.75))-5.05);y=THREE.MathUtils.lerp(p.y,y,smooth(d/2));}return y;}
export function createVillageLandscape(env,grid,roadTexture,grading){
 const group=new THREE.Group();group.name='J45_open_yards_and_perimeter';let terrain,grass,curb;const flowers=[],sourceMaterials=[];
 env.updateMatrixWorld(true);env.traverse(o=>{if(!o.isMesh)return;const n=o.name.replaceAll('_',' ');if(o.userData.web_role==='terrain')terrain=o;if(n==='Short maintained grass')grass=o;if(n==='Hand laid stone')curb=o;if(/^J6 (garden|mixed height|planted border)/.test(n))flowers.push(o);for(const m of Array.isArray(o.material)?o.material:[o.material])sourceMaterials.push(m);});
 if(!terrain)throw Error('Village terrain source missing');
 let at=(x,z)=>{let gx=(x-grid.x0)/grid.step,gz=(z-grid.z0)/grid.step,ix=Math.max(0,Math.min(grid.nx-2,Math.floor(gx))),iz=Math.max(0,Math.min(grid.nz-2,Math.floor(gz))),tx=Math.max(0,Math.min(1,gx-ix)),tz=Math.max(0,Math.min(1,gz-iz));let a=grid.values[iz*grid.nx+ix],b=grid.values[iz*grid.nx+ix+1],c=grid.values[(iz+1)*grid.nx+ix],d=grid.values[(iz+1)*grid.nx+ix+1];return terrace(x,z,(a*(1-tx)+b*tx)*(1-tz)+(c*(1-tx)+d*tx)*tz);};
 const laneZ=x=>4.3-.018*(x-2)**2;
 const routes=plots.map(p=>new THREE.CatmullRomCurve3([new THREE.Vector3(p.x-.65,p.y,p.z+2.17),new THREE.Vector3(p.x-.65,p.y,p.z+5.8),new THREE.Vector3(p.x-.3,0,(p.z+5.8+laneZ(p.x))/2),new THREE.Vector3(p.x+.4,0,laneZ(p.x+.4))]));
 const pathPoints=routes.map(c=>c.getPoints(80));
 function onPath(x,z,extra=0){return pathPoints.some(points=>points.some(q=>(x-q.x)**2+(z-q.z)**2<(1.15+extra)**2));}
 const geometry=terrain.geometry.clone(),pos=geometry.attributes.position,world=new THREE.Vector3(),inv=terrain.matrixWorld.clone().invert();let altered=0,preservedMaxDelta=0;
 for(let i=0;i<pos.count;i++){world.fromBufferAttribute(pos,i).applyMatrix4(terrain.matrixWorld);let old=world.y;world.y=terrace(world.x,world.z,world.y);if(Math.abs(world.x)<13)preservedMaxDelta=Math.max(preservedMaxDelta,Math.abs(world.y-old));if(Math.abs(world.y-old)>1e-9)altered++;world.applyMatrix4(inv);pos.setXYZ(i,world.x,world.y,world.z);}
 const oldNormals=geometry.attributes.normal;geometry.deleteAttribute('normal');geometry.computeVertexNormals();const newNormals=geometry.attributes.normal;for(let i=0;i<pos.count;i++){world.fromBufferAttribute(pos,i).applyMatrix4(terrain.matrixWorld);if(!plots.some(p=>Math.abs(world.x-p.x)<8.1&&Math.abs(world.z-p.z-.75)<8.1))newNormals.setXYZ(i,oldNormals.getX(i),oldNormals.getY(i),oldNormals.getZ(i));}geometry.computeBoundingSphere();
 const cells=new Map(),ix=geometry.index.array,pa=geometry.attributes.position,vs=new Map();
 const pt=i=>{if(vs.has(i))return vs.get(i);const v=new THREE.Vector3().fromBufferAttribute(pa,i).applyMatrix4(terrain.matrixWorld).toArray();vs.set(i,v);return v;};
 for(let k=0;k<ix.length;k+=3){let tri=[pt(ix[k]),pt(ix[k+1]),pt(ix[k+2])],xs=tri.map(v=>v[0]),zs=tri.map(v=>v[2]),lx=Math.max(-40,Math.min(...xs)),hx=Math.min(40,Math.max(...xs)),lz=Math.max(-35,Math.min(...zs)),hz=Math.min(20,Math.max(...zs));if(lx>hx||lz>hz)continue;for(let x=Math.floor(lx/2);x<=Math.floor(hx/2);x++)for(let z=Math.floor(lz/2);z<=Math.floor(hz/2);z++){let key=x+','+z,list=cells.get(key)||[];list.push(tri);cells.set(key,list);}}
 const approximate=at;at=(x,z)=>{let top=-Infinity;for(const[a,b,c]of cells.get(Math.floor(x/2)+','+Math.floor(z/2))||[]){let det=(b[2]-c[2])*(a[0]-c[0])+(c[0]-b[0])*(a[2]-c[2]);if(Math.abs(det)<1e-9)continue;let u=((b[2]-c[2])*(x-c[0])+(c[0]-b[0])*(z-c[2]))/det,v=((c[2]-a[2])*(x-c[0])+(a[0]-c[0])*(z-c[2]))/det;if(u>=-1e-6&&v>=-1e-6&&u+v<=1.000001)top=Math.max(top,u*a[1]+v*b[1]+(1-u-v)*c[1]);}return isFinite(top)?top:approximate(x,z);};
const terrainReplacement={source:terrain,geometry};const replacements=[terrainReplacement];
 function clipTriangles(source,keep){if(!source)return;const g=source.geometry.clone(),p=g.attributes.position,ix=g.index?.array||Uint32Array.from({length:p.count},(_,i)=>i),out=[];const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();for(let k=0;k<ix.length;k+=3){a.fromBufferAttribute(p,ix[k]).applyMatrix4(source.matrixWorld);b.fromBufferAttribute(p,ix[k+1]).applyMatrix4(source.matrixWorld);c.fromBufferAttribute(p,ix[k+2]).applyMatrix4(source.matrixWorld);if(keep((a.x+b.x+c.x)/3,(a.z+b.z+c.z)/3))out.push(ix[k],ix[k+1],ix[k+2]);}g.setIndex(out);g.computeBoundingSphere();replacements.push({source,geometry:g});}
 clipTriangles(grass,(x,z)=>!plots.some(p=>Math.abs(x-p.x)<5.2&&Math.abs(z-p.z-.75)<5.2)&&!onPath(x,z,.1));
 clipTriangles(curb,(x,z)=>!plots.some(p=>Math.abs(x-p.x-.4)<1.6&&Math.abs(z-laneZ(x))<2.2));
 let wood=sourceMaterials.find(m=>/oak/i.test(m.name)&&m.map)||sourceMaterials.find(m=>/timber|wood/i.test(m.name)&&m.map);
 let stone=sourceMaterials.find(m=>/stone|granit/i.test(m.name)&&m.map)||new THREE.MeshStandardMaterial({color:0x8d8a73,roughness:.96});
 if(!wood)throw Error('Existing fence material missing');
 const buckets=new Map();function add(g,m){let gs=buckets.get(m)||[];gs.push(g);buckets.set(m,gs);}
 const vec=new THREE.Vector3(),up=new THREE.Vector3(0,1,0),quat=new THREE.Quaternion();
 function bar(a,b,r1,r2,mat,sides=7){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),length=av.distanceTo(bv),g=new THREE.CylinderGeometry(r2,r1,length,sides,1);quat.setFromUnitVectors(up,bv.clone().sub(av).normalize());g.applyQuaternion(quat);g.translate(...av.add(bv).multiplyScalar(.5).toArray());add(g,mat);}
 const rnd=i=>(Math.sin(i*53.183+7.23)*43758.5453)%1;
 function stoneAt(x,z,i){let g=new THREE.IcosahedronGeometry(1,1);g.scale(.16+Math.abs(rnd(i))*.09,.075+Math.abs(rnd(i+3))*.04,.18);g.rotateY(i*.71);g.translate(x,at(x,z)+.045,z);add(g,stone);}
 let idx=0;
 for(let pi=0;pi<plots.length;pi++){let p=plots[pi],gate=p.x-.65,front=p.z+5.35,back=p.z-3.8,left=p.x-4.9,right=p.x+4.9;
 function fence(ax,az,bx,bz){idx+=Math.ceil(Math.hypot(bx-ax,bz-az)/1.85)+1;}
 fence(left,front,left,back);fence(left,back,right,back);fence(right,back,right,front);fence(left,front,gate-1.12,front);fence(gate+1.12,front,right,front);
 for(const src of flowers){const g=src.geometry.clone().applyMatrix4(src.matrixWorld),pos=g.attributes.position;for(let i=0;i<pos.count;i++){const ox=pos.getX(i),oz=pos.getZ(i),y=pos.getY(i);let x,z;if(ox>2.1){x=p.x+3.25+(ox-2.55)*.43;z=p.z-2.55+(oz+3.5)*1.18;}else{x=p.x-3.8+(ox+.95)*1.25;z=p.z+4+(oz-.05)*.95;}pos.setXYZ(i,x,p.y+y,z);}g.deleteAttribute('normal');g.computeVertexNormals();g.computeBoundingSphere();add(g,src.material);}
 const points=routes[pi].getPoints(160),positions=[],uvs=[],indices=[];
 for(let i=0;i<points.length;i++){let q=points[i],prev=points[Math.max(0,i-1)],next=points[Math.min(points.length-1,i+1)],tangent=next.clone().sub(prev).normalize(),across=new THREE.Vector3(-tangent.z,0,tangent.x),width=1.72+.55*smooth((i/160-.84)/.16);
 for(let side of[-1,1]){let x=q.x+across.x*side*width/2,z=q.z+across.z*side*width/2;positions.push(x,at(x,z)+.045,z);let sx=((i*.19)%12)-6,sz=laneZ(sx)+side*.85;uvs.push((sx+96)/192,(-sz+96)/192);}if(i){let k=i*2;indices.push(k-2,k,k-1,k,k+1,k-1);}if(i>4&&i<points.length-7&&i%3===0)for(let s of[-1,1])stoneAt(q.x+across.x*s*(width/2+.13),q.z+across.z*s*(width/2+.13),idx++);}
 let road=new THREE.BufferGeometry();road.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));road.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));road.setIndex(indices);road.computeVertexNormals();const rm=new THREE.MeshStandardMaterial({map:roadTexture,roughness:.98,side:THREE.DoubleSide});rm.userData.isVillageRoad=true;add(road,rm);
 const sides=[],suv=[];for(let i=1;i<points.length;i++)for(let side of[0,1]){let ia=(i-1)*2+side,ib=i*2+side;let a=positions.slice(ia*3,ia*3+3),b=positions.slice(ib*3,ib*3+3),aa=[a[0],at(a[0],a[2])-.035,a[2]],bb=[b[0],at(b[0],b[2])-.035,b[2]];for(const v of[a,b,aa,b,bb,aa])sides.push(...v);for(const k of[ia,ib,ia,ib,ib,ia])suv.push(...uvs.slice(k*2,k*2+2));}let skirt=new THREE.BufferGeometry();skirt.setAttribute('position',new THREE.Float32BufferAttribute(sides,3));skirt.setAttribute('uv',new THREE.Float32BufferAttribute(suv,2));skirt.computeVertexNormals();const sm=rm.clone();sm.userData={isVillageSkirt:true};add(skirt,sm);
 }

 const fenceSegments=[
 {a:[-28,-26],b:[-5,-26],height:.8},{a:[5,-26],b:[28,-26],height:.8},
 {a:[28,-26],b:[32,-22],height:.8},{a:[32,-22],b:[32,-16],height:.8},
 {a:[32,-8],b:[32,8],height:.68},{a:[32,8],b:[26,14],height:.65},{a:[26,14],b:[6,14],height:.65},
 {a:[-6,14],b:[-26,14],height:.65},{a:[-26,14],b:[-32,8],height:.65},{a:[-32,8],b:[-32,-12.5],height:.68},
 {a:[-32,-20.5],b:[-32,-22],height:.8},{a:[-32,-22],b:[-28,-26],height:.8}
 ];
 const gates=[{name:'front',a:[-6,14],b:[6,14],width:12,clearWidth:11.86},{name:'rear',a:[-5,-26],b:[5,-26],width:10,clearWidth:9.86},{name:'left_road',a:[-32,-20.5],b:[-32,-12.5],width:8,clearWidth:7.86},{name:'right_road',a:[32,-16],b:[32,-8],width:8,clearWidth:7.86}];
 const perimeterMaterial=wood.clone();perimeterMaterial.name='J45 outer boundary oak';delete perimeterMaterial.userData.j38Grading;perimeterMaterial.userData.outerFence=true;
 let fenceIndex=0;const posts=[];const usedPosts=new Set();
 for(const seg of fenceSegments){const [ax,az]=seg.a,[bx,bz]=seg.b,count=Math.ceil(Math.hypot(bx-ax,bz-az)/2.2);let previous;
 for(let i=0;i<=count;i++){const t=i/count,x=THREE.MathUtils.lerp(ax,bx,t),z=THREE.MathUtils.lerp(az,bz,t),y=at(x,z),height=seg.height+.015*Math.abs(rnd(fenceIndex)),key=x.toFixed(4)+','+z.toFixed(4);
 if(!usedPosts.has(key)){bar([x,y-.07,z],[x,y+height,z],.069,.055,perimeterMaterial,7);posts.push({x,z,ground:y,bottom:y-.07,top:y+height,height});usedPosts.add(key);}
 if(previous)for(const ratio of [.38,.8])bar([previous.x,previous.y+seg.height*ratio,previous.z],[x,y+seg.height*ratio,z],.032,.028,perimeterMaterial,6);
 previous={x,y,z};fenceIndex++;
 }}
 for(const [mat,gs]of buckets){const g=mergeGeometries(gs.map(x=>{if(x.index)x=x.toNonIndexed();for(const n of Object.keys(x.attributes))if(!['position','normal','uv'].includes(n))x.deleteAttribute(n);for(const name of ['position','normal','uv']){const a=x.attributes[name];if(a&&!(a.array instanceof Float32Array)){const f=new Float32Array(a.count*a.itemSize);for(let i=0;i<a.count;i++)for(let c=0;c<a.itemSize;c++)f[i*a.itemSize+c]=a.getComponent(i,c);x.setAttribute(name,new THREE.Float32BufferAttribute(f,a.itemSize));}}if(!x.attributes.uv)x.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(x.attributes.position.count*2),2));return x;}));if(!g)throw Error('Village landscape merge failed');let m=new THREE.Mesh(g,mat);m.castShadow=!(mat.userData.isVillageRoad||mat.userData.isVillageSkirt);m.receiveShadow=true;m.userData.outerFence=!!mat.userData.outerFence;grading(mat);group.add(m);}
 return{group,replacements,ground:at,paths:pathPoints.map(ps=>ps.map(p=>[p.x,at(p.x,p.z),p.z])),checks:{fenceLayout:'perimeter',fenceSegments,gates,posts,interiorYardFences:0,terrainVerticesAdjusted:altered,originalGardenMaxHeightDelta:preservedMaxDelta,plots:plots.map(p=>({...p,scale:1,rotationY:0,door:[p.x-.65,p.y,p.z+2.15],roofMinX:p.x-3,roofMaxX:p.x+3})),newMeshes:group.children.length}};
}

