import * as THREE from 'three';
export function createSeamlessSky(renderer, texture) {
 const rt=new THREE.WebGLCubeRenderTarget(texture.image.height);
 Object.assign(rt.texture,{type:texture.type,colorSpace:texture.colorSpace,generateMipmaps:texture.generateMipmaps,minFilter:texture.minFilter,magFilter:texture.magFilter});
 const material=new THREE.ShaderMaterial({name:'PeriodicSkyConversion',uniforms:{source:{value:texture}},side:THREE.BackSide,blending:THREE.NoBlending,
 vertexShader:`varying vec3 direction;void main(){direction=normalize((modelMatrix*vec4(position,0.)).xyz);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform sampler2D source;varying vec3 direction;
 #include <common>
 void main(){vec2 uv=equirectUv(normalize(direction));float edge=min(uv.x,1.-uv.x);float w=.5*(1.-smoothstep(0.,.025,edge));gl_FragColor=mix(texture2D(source,uv),texture2D(source,vec2(1.-uv.x,uv.y)),w);}`});
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(5,5,5),material),filter=texture.minFilter;
 if(filter===THREE.LinearMipmapLinearFilter)texture.minFilter=THREE.LinearFilter;
 new THREE.CubeCamera(1,10,rt).update(renderer,mesh);
 texture.minFilter=filter;mesh.geometry.dispose();material.dispose();return rt;
}
