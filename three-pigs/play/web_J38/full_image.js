import * as THREE from 'three';
export function createFullImage(scene){
 const loader=new THREE.TextureLoader(),textures={},sprite=new THREE.Sprite(new THREE.SpriteMaterial({transparent:true,depthTest:false,depthWrite:false,toneMapped:false}));
 sprite.renderOrder=10500;sprite.visible=false;scene.add(sprite);
 for(const k of ['dinner_a','dinner_b']){const t=loader.load('./assets/endings/'+k+'.jpg');t.colorSpace=THREE.SRGBColorSpace;textures[k]=t;}
 return{update(img,camera){sprite.visible=!!img;if(!img)return;const t=textures[img.key];if(!t?.image)return;sprite.material.map=t;sprite.material.opacity=img.opacity??1;sprite.material.needsUpdate=true;
  sprite.position.set(0,0,.5).unproject(camera);const d=Math.abs(sprite.position.clone().applyMatrix4(camera.matrixWorldInverse).z),h=2*d*Math.tan(THREE.MathUtils.degToRad(camera.fov)/2),w=h*camera.aspect,ia=t.image.width/t.image.height;
  if(w/h>ia)sprite.scale.set(w*1.002,w/ia*1.002,1);else sprite.scale.set(h*ia*1.002,h*1.002,1);},
  ready:()=>Object.values(textures).every(t=>t.image&&t.image.complete!==false)};
}
