import * as THREE from 'three';
export function createContactPass(renderer,camera){
 const target=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,samples:4});target.depthTexture=new THREE.DepthTexture(1,1,THREE.UnsignedIntType);
 const uniforms={agxLUT:{value:null},colour:{value:target.texture},depth:{value:target.depthTexture},inverseProjection:{value:camera.projectionMatrixInverse.clone()},resolution:{value:new THREE.Vector2(1,1)}};
 const material=new THREE.ShaderMaterial({uniforms,depthTest:false,depthWrite:false,toneMapped:false,vertexShader:'varying vec2 uv0;void main(){uv0=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`
 #include <tonemapping_pars_fragment>
 uniform sampler2D colour;uniform sampler2D depth;uniform mat4 inverseProjection;uniform vec2 resolution;varying vec2 uv0;
 vec3 pos(vec2 uv){float z=texture2D(depth,uv).x;vec4 p=inverseProjection*vec4(uv*2.-1.,z*2.-1.,1.);return p.xyz/p.w;}
 void main(){vec3 c=texture2D(colour,uv0).rgb;float z=texture2D(depth,uv0).x;
 if(z<.99999){vec3 p=pos(uv0);vec3 n=normalize(cross(dFdx(p),dFdy(p)));if(n.z<0.)n=-n;
 float radius=clamp(.26*resolution.y/max(-p.z,.5),2.,32.);float sum=0.;
 for(int i=0;i<12;i++){float a=float(i)*2.399963;float r=sqrt((float(i)+.5)/12.);vec2 uv=uv0+vec2(cos(a),sin(a))*radius*r/resolution;vec3 v=pos(uv)-p;float l=length(v);sum+=max(dot(n,v/max(l,.001))-.09,0.)*(1.-smoothstep(.08,.65,l));}
 float ao=1.-clamp(sum/12.*1.65,0.,.42);c*=ao;
 }
 gl_FragColor=vec4(AgXToneMapping(c),1.);#include <colorspace_fragment>
 }`.replace(';#include',';\n#include')});
 const scene=new THREE.Scene();scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),material));const postCamera=new THREE.Camera();renderer.info.autoReset=false;
 return{setLUT(t){uniforms.agxLUT.value=t;},async compile(world){renderer.setRenderTarget(target);await renderer.compileAsync(world,camera);renderer.setRenderTarget(null);await renderer.compileAsync(scene,postCamera);},resize(w,h){target.setSize(w,h);uniforms.resolution.value.set(w,h);},render(world){renderer.info.reset();renderer.setRenderTarget(target);renderer.render(world,camera);renderer.setRenderTarget(null);uniforms.inverseProjection.value.copy(camera.projectionMatrixInverse);renderer.render(scene,postCamera);}};
}
