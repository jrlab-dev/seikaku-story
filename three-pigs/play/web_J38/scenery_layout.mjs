export const HOUSE_PLOTS=[
{id:'straw',minX:-.3978714,maxX:4.5978943,minZ:-4.6493988,maxZ:.1490097},
{id:'wood',minX:-22.5070763,maxX:-17.4874265,minZ:-17.4127069,maxZ:-12.5853615},
{id:'brick',minX:17.4879024,maxX:22.5112555,minZ:-16.4128721,maxZ:-11.5908279}
];
export function plotDistance(x,z,p){const cx=(p.minX+p.maxX)/2,cz=(p.minZ+p.maxZ)/2,hx=(p.maxX-p.minX)/2+.17,hz=(p.maxZ-p.minZ)/2+.17;return Math.max(Math.abs(x-cx)-hx,Math.abs(z-cz)-hz);}
export const inSoil=(x,z)=>HOUSE_PLOTS.some(p=>plotDistance(x,z,p)<.10);
export function soilShader(shader){
 const rects=HOUSE_PLOTS.map(p=>{const cx=(p.minX+p.maxX)/2,cz=(p.minZ+p.maxZ)/2,hx=(p.maxX-p.minX)/2+.17,hz=(p.maxZ-p.minZ)/2+.17;return 'max(abs(sceneryWorld.x-('+cx.toFixed(6)+'))-'+hx.toFixed(6)+',abs(sceneryWorld.z-('+cz.toFixed(6)+'))-'+hz.toFixed(6)+')';});
 const code=`
 float plotEdge=min(min(${rects[0]},${rects[1]}),${rects[2]});
 float soilNoise=fract(sin(dot(floor(sceneryWorld.xz*17.),vec2(127.1,311.7)))*43758.5453);
 float soilBroad=sin(sceneryWorld.x*3.1+sin(sceneryWorld.z*2.2))*sin(sceneryWorld.z*4.3)*.5+.5;
 float soilMask=1.-smoothstep(-.06,.10,plotEdge+(soilBroad-.5)*.035);
 vec3 soilColour=vec3(.245,.139,.065)*(1.+(soilNoise-.5)*.12+(soilBroad-.5)*.10);
 diffuseColor.rgb=mix(diffuseColor.rgb,soilColour,soilMask);
 `;
 shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n'+code);
}
export function removeWholeCurbComponents(meshes,remove,THREE){
 const parents=[],keys=new Map(),vertexMaps=[],positions=[];
 const find=n=>{let r=n;while(parents[r]!==r)r=parents[r];while(parents[n]!==n){const t=parents[n];parents[n]=r;n=t;}return r;};
 const join=(a,b)=>{a=find(a);b=find(b);if(a!==b)parents[b]=a;};
 for(const m of meshes){const p=m.geometry.attributes.position,map=new Uint32Array(p.count),v=new THREE.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld);const key=[v.x,v.y,v.z].map(n=>Math.round(n*10000)).join(',');let id=keys.get(key);if(id===undefined){id=parents.length;keys.set(key,id);parents.push(id);positions.push([v.x,v.y,v.z]);}map[i]=id;}const ix=m.geometry.index?.array||Uint32Array.from({length:p.count},(_,i)=>i);for(let i=0;i<ix.length;i+=3){join(map[ix[i]],map[ix[i+1]]);join(map[ix[i]],map[ix[i+2]]);}vertexMaps.push(map);}
 const groups=new Map();for(let i=0;i<parents.length;i++){const r=find(i);let g=groups.get(r);if(!g)groups.set(r,g={min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]});positions[i].forEach((n,k)=>{g.min[k]=Math.min(g.min[k],n);g.max[k]=Math.max(g.max[k],n);});}
 const removed=new Set(),centers=[];for(const [r,g]of groups){const x=(g.min[0]+g.max[0])/2,z=(g.min[2]+g.max[2])/2;if(remove(x,z,g))removed.add(r);else centers.push({x,z,radius:Math.max(g.max[0]-g.min[0],g.max[2]-g.min[2])/2});}
 const replacements=meshes.map((m,j)=>{const g=m.geometry.clone(),p=g.attributes.position,ix=g.index?.array||Uint32Array.from({length:p.count},(_,i)=>i),out=[];for(let i=0;i<ix.length;i+=3)if(!removed.has(find(vertexMaps[j][ix[i]])))out.push(ix[i],ix[i+1],ix[i+2]);g.setIndex(out);g.computeBoundingSphere();return{source:m,geometry:g};});
 return{replacements,centers,removed:removed.size,components:groups.size};
}

