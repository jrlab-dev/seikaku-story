import * as THREE from 'three';
import {HILL,hillXZ,hillUV,hillRise} from './hill_route_v4.mjs';
export function createStoryHill(baseGround,material,roadTexture){
 const group=new THREE.Group();group.name='J114_v4_real_terrain_hill';
 const step=.4,nu=120,nv=100,ys=[],positions=[],uv=[],indices=[];
 for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){
  const u=-24+i*step,v=-20+j*step,[x,z]=hillXZ(u,v),rise=hillRise(x,z),y=baseGround(x,z)+rise-.018;
  ys.push(y);positions.push(x,y,z);uv.push((x+96)/192,(-z+96)/192);
 }
 for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+1,c=a+nu+1,d=c+1;indices.push(a,c,b,b,c,d);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
 const mesh=new THREE.Mesh(g,material);mesh.name='Hill_solid_triangle_surface';mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
 const ground=(x,z)=>{const[u,v]=hillUV(x,z),gx=(u+24)/step,gz=(v+20)/step;if(gx<0||gz<0||gx>=nu||gz>=nv)return baseGround(x,z);
  const i=Math.floor(gx),j=Math.floor(gz),tx=gx-i,tz=gz-j,a=j*(nu+1)+i,b=a+1,c=a+nu+1,d=c+1;
  const y=tx+tz<=1?ys[a]*(1-tx-tz)+ys[b]*tx+ys[c]*tz:ys[d]*(tx+tz-1)+ys[c]*(1-tx)+ys[b]*(1-tz);return Math.max(baseGround(x,z),y);
 };
 const pathPos=[],pathUV=[],pathIx=[];
 const across=8;
 for(let i=0;i<=360;i++){const u=-36+i*.16;for(let j=0;j<=across;j++){const v=-.72+1.44*j/across,[x,z]=hillXZ(u,v),sx=((i*.095)%12)-6,sz=4.3-.018*(sx-2)**2+v;pathPos.push(x,ground(x,z)+.012,z);pathUV.push((sx+96)/192,(-sz+96)/192);}if(i)for(let j=0;j<across;j++){const a=(i-1)*(across+1)+j,b=a+across+1;pathIx.push(a,a+1,b,a+1,b+1,b);}}

 const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.Float32BufferAttribute(pathPos,3));pg.setAttribute('uv',new THREE.Float32BufferAttribute(pathUV,2));pg.setIndex(pathIx);pg.computeVertexNormals();const pm=new THREE.MeshStandardMaterial({map:roadTexture,roughness:1,side:THREE.DoubleSide});const path=new THREE.Mesh(pg,pm);path.receiveShadow=true;path.name='Hill_contoured_footpath';group.add(path);
 const stoneMat=new THREE.MeshStandardMaterial({color:'#848374',roughness:1});
 for(let i=0;i<3;i++){const[x,z]=hillXZ(-.6+i*.65,3.3+i*.3),rock=new THREE.Mesh(new THREE.IcosahedronGeometry(1,1),stoneMat);rock.scale.set(.4+i*.12,.32+i*.07,.36);rock.position.set(x,ground(x,z)+.13,z);rock.rotation.y=i;rock.castShadow=rock.receiveShadow=true;group.add(rock);}
 return{group,mesh,path,ground,baseGround,info:{center:[HILL.x,HILL.z],height:HILL.height,triangles:indices.length/3,step,method:'opaque world-space triangle mesh with exact triangle interpolation for feet'}};
}
