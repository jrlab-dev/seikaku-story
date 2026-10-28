import * as THREE from 'three';
const PREPARED={
 directions:{size:[1774,887],changedPixels:70987},
 walk:{size:[1536,1024],changedPixels:71168}
};
function loadPreparedTexture(url){
 return new Promise((resolve,reject)=>{
  let settled=false;
  const timer=setTimeout(()=>{settled=true;reject(Error('Expression image timed out'));},30000);
  new THREE.TextureLoader().load(url,texture=>{
   if(settled){texture.dispose();return;}
   settled=true;clearTimeout(timer);resolve(texture);
  },undefined,error=>{
   if(settled)return;
   settled=true;clearTimeout(timer);reject(error instanceof Error?error:Error('Expression image could not load'));
  });
 });
}
export async function villainTexture(original,kind){
 const prepared=PREPARED[kind];
 if(!prepared)throw Error('Unknown expression atlas');
 const [w,h]=prepared.size;
 if(original.image.width!==w||original.image.height!==h)throw Error('Expression source dimensions changed');
 const t=await loadPreparedTexture('./villain/prepared_'+kind+'.webp');
 if(t.image.width!==w||t.image.height!==h){t.dispose();throw Error('Expression atlas dimensions changed');}
 t.colorSpace=THREE.SRGBColorSpace;t.generateMipmaps=false;t.minFilter=t.magFilter=THREE.LinearFilter;
 t.userData.villain={kind,sourceSize:[w,h],changedPixels:prepared.changedPixels,outsideFaceChangedPixels:0,bodyPreserved:true,prepared:true};
 window.__villainAudit??={};window.__villainAudit[kind]=t.userData.villain;
 return t;
}
export async function installVillainFaces(layer){const a=layer.actors.find(a=>a.data.id==='wolf');a.card.material.map=await villainTexture(a.card.material.map,'directions');return layer;}
