import * as THREE from 'three';
const REGIONS={
 directions:[[183,109,150,125],[695,112,147,130],[1182,123,110,119],[1635,139,65,112],[548,551,73,107],[939,536,121,119],[1407,526,181,130]],
 walk:[[482,91,166,148],[1097,93,165,148],[488,603,170,150],[1101,605,168,153]]
};
export async function villainTexture(original,kind){
 const edit=await new THREE.TextureLoader().loadAsync('./villain/'+kind+'.png'),w=original.image.width,h=original.image.height,c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(original.image,0,0);
 const before=x.getImageData(0,0,w,h).data;
 const e=document.createElement('canvas');e.width=w;e.height=h;const ex=e.getContext('2d');ex.drawImage(edit.image,0,0,w,h);
 for(const [sx,sy,rw,rh] of REGIONS[kind]){const patch=document.createElement('canvas');patch.width=rw;patch.height=rh;const p=patch.getContext('2d');p.drawImage(e,sx,sy,rw,rh,0,0,rw,rh);p.globalCompositeOperation='destination-in';p.save();p.translate(rw/2,rh/2);p.scale(rw/2,rh/2);const g=p.createRadialGradient(0,0,.74,0,0,1);g.addColorStop(0,'white');g.addColorStop(1,'transparent');p.fillStyle=g;p.beginPath();p.arc(0,0,1,0,Math.PI*2);p.fill();p.restore();x.drawImage(patch,sx,sy);}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.generateMipmaps=false;t.minFilter=t.magFilter=THREE.LinearFilter;
 const after=x.getImageData(0,0,w,h).data;let changedPixels=0,outsideFaceChangedPixels=0;
 for(let y=0;y<h;y++)for(let xx=0;xx<w;xx++){const i=(y*w+xx)*4;if([0,1,2,3].some(k=>before[i+k]!==after[i+k])){changedPixels++;if(!REGIONS[kind].some(([sx,sy,rw,rh])=>xx>=sx&&xx<sx+rw&&y>=sy&&y<sy+rh))outsideFaceChangedPixels++;}}
 t.userData.villain={kind,regions:REGIONS[kind],sourceSize:[w,h],changedPixels,outsideFaceChangedPixels,bodyPreserved:outsideFaceChangedPixels===0};window.__villainAudit??={};window.__villainAudit[kind]=t.userData.villain;
 if(outsideFaceChangedPixels)throw Error('Expression edit escaped face mask');edit.dispose();return t;
}
export async function installVillainFaces(layer){const a=layer.actors.find(a=>a.data.id==='wolf');a.card.material.map=await villainTexture(a.card.material.map,'directions');return layer;}

