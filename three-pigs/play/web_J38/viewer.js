const COMPRESSED_ASSETS={"./assets/BombProp.glb": "./assets/BombProp.glb.gz", "./assets/Bomb_Fuse_v1.glb": "./assets/Bomb_Fuse_v1.glb.gz", "./assets/BrickHouse.glb": "./assets/BrickHouse.glb.gz", "./assets/BunkerHouse.glb": "./assets/BunkerHouse.glb.gz", "./assets/Bunker_GustHold_v1.glb": "./assets/Bunker_GustHold_v1.glb.gz", "./assets/Bunker_Hatch_v1.glb": "./assets/Bunker_Hatch_v1.glb.gz", "./assets/CastleHouse.glb": "./assets/CastleHouse.glb.gz", "./assets/Castle_GustHold_v1.glb": "./assets/Castle_GustHold_v1.glb.gz", "./assets/Explosion_House_v1.glb": "./assets/Explosion_House_v1.glb.gz", "./assets/Explosion_Small_v1.glb": "./assets/Explosion_Small_v1.glb.gz", "./assets/FortressHouse.glb": "./assets/FortressHouse.glb.gz", "./assets/Fortress_GustHold_v1.glb": "./assets/Fortress_GustHold_v1.glb.gz", "./assets/KarakuriFortHouse.glb": "./assets/KarakuriFortHouse.glb.gz", "./assets/KarakuriFort_GustHold_v1.glb": "./assets/KarakuriFort_GustHold_v1.glb.gz", "./assets/KarakuriHouse.glb": "./assets/KarakuriHouse.glb.gz", "./assets/Karakuri_Door_v1.glb": "./assets/Karakuri_Door_v1.glb.gz", "./assets/Karakuri_GustHold_v1.glb": "./assets/Karakuri_GustHold_v1.glb.gz", "./assets/Karakuri_Security_v1.glb": "./assets/Karakuri_Security_v1.glb.gz", "./assets/StrawHouse.glb": "./assets/StrawHouse.glb.gz", "./assets/TentHouse.glb": "./assets/TentHouse.glb.gz", "./assets/Tent_BlowAway_v1.glb": "./assets/Tent_BlowAway_v1.glb.gz", "./assets/Tent_Flatten_v1.glb": "./assets/Tent_Flatten_v1.glb.gz", "./assets/TreehouseHouse.glb": "./assets/TreehouseHouse.glb.gz", "./assets/Treehouse_BlowAway_v1.glb": "./assets/Treehouse_BlowAway_v1.glb.gz", "./assets/WoodHouse.glb": "./assets/WoodHouse.glb.gz", "./assets/environment.glb": "./assets/environment.glb.gz", "./assets/vegetation_prototypes.glb": "./assets/vegetation_prototypes.glb.gz", "./assets/Wood_BlowAway_v2.glb": "./assets/Wood_BlowAway_v2.glb.gz", "./assets/Wood_VillageTopple_J59.glb": "./assets/Wood_VillageTopple_J59.glb.gz"};
import {failLoading,finishLoadStep,beginReceiving,endReceiving,receivedChunk} from './story_loading_progress.mjs';
import {installAnimalReactions} from './animal_reactions.js';
import {createPersonalityWindow} from './personality_window_v8.js';
import {siteHouses,preparePuzzleSites,wrapPuzzleBuildings} from './puzzle_houses.mjs';
import {createPuzzleEffectsLayer} from './puzzle_effects_layer.js';
import {createStrategyProps,installStrategyContact} from './strategy_props.js';
import {getCast as getPuzzleCast} from './personality_story.mjs';
import {inspectTravelActor,installTravelSupport,createWalkSurface} from './travel_support_v7.js';
import {createCommonHome,createHomePath}from './common_home_v6.js';
import {setCompletionAspect}from './completed_story.mjs';
import {COMMON_HOME,routeClearance,OPENING_DURATION,setTravelGround}from './opening_v7.mjs';
import {reviseStrawDoor,reviseCollapseDoor} from './single_straw_door_v5.js';
import {createStoryHill} from './hill_landscape_v4.js';
import {hillUV,hillXZ,hillRise} from './hill_route_v4.mjs';
let storyHill,travelWalkSurface,travelWalkMeshes=[],personalityWindow;
import {soilShader} from './scenery_layout.mjs';
import {installVillainFaces} from './villain_faces.js';
import {installEncounterPerformers} from './encounter_performers.js';
import {installDoorHost} from './door_host.js';
import {createShelterDoors} from './shelter_doors.js';
import {installWolfEscape} from './wolf_escape.js';
import {createComicEffects} from './comic_effects.js';
import {installStrawJoy} from './straw_joy.js';
import {installStrawWorkshopPreview} from './straw_workshop_preview.js';
import {installPerformerActions} from './performer_actions.js';
import {installPaperTheatre} from './paper_theatre.js';
let qaContactTerrain=null;
import {createBlowawayDeparture} from './no-extra-departure.mjs';
import {createConstructionBridge} from './construction_bridge.js';
import {applyRoofRattle,restoreRoofRattle} from './roof_rattle.mjs';
import {createStoryPlayer} from './story_player.js';
import {createStoryWind} from './story_wind.js';
import {createStoryBuildings} from './story_buildings.js';
import {configureStoryBindings,sampleStory,STORY_DURATION,decideEnding} from './story_timeline.mjs';
import {prepareStoryAssetPlan} from './story_asset_plan.mjs';
const selectedSites=siteHouses(getPuzzleCast());sampleStory(0);
const selectedAssets=prepareStoryAssetPlan(sampleStory,STORY_DURATION,selectedSites,decideEnding());
window.__storyAssetPlan=()=>selectedAssets;
import {createCharacterLayer} from './characters.js';
import * as THREE from 'three';
import {createVillageLandscape as createPerimeterLandscape,plots} from './village.js';
import {createVillageLandscape as createBaselineLandscape} from './village_baseline.js';
const isBaseline=new URLSearchParams(location.search).get('fences')==='j45';const createVillageLandscape=isBaseline?createBaselineLandscape:createPerimeterLandscape;let omitYardFences=false;
const isYardFence=o=>['Structural oak and carved trim','Wood ends and annual rings','Twisted hemp ropes','J15 hairline end checks'].some(n=>o.name.replaceAll('_',' ').startsWith(n));
import {MeshoptDecoder} from '../vendor/meshopt_decoder.mjs';
import {createContactPass} from './ambient.js';
import {createSeamlessSky} from './sky.js';
import {GLTFLoader} from '../vendor/loaders/GLTFLoader.js';
import {mergeGeometries} from '../vendor/utils/BufferGeometryUtils.js';
const diagnostics={assets:[],images:[],meshDecodeMs:0,meshDecodedBytes:0,phases:{},cpuLOD:[],cpuRender:[],gpu:[],gpuSupport:false,gpuDisjoint:0};
const $=s=>document.querySelector(s),canvas=$('main > canvas'),stage=$('main');
canvas.style.visibility='hidden';for(const id of ['view','orbit','walk'])$('#'+id).disabled=true;
const lutReady=new THREE.TextureLoader().loadAsync('./assets/agx_j37_lut.webp');let agxLUT;
lutReady.then(t=>{agxLUT=t;t.colorSpace=THREE.SRGBColorSpace;t.generateMipmaps=false;t.minFilter=THREE.LinearFilter;t.magFilter=THREE.LinearFilter;});
THREE.ShaderChunk.tonemapping_pars_fragment=THREE.ShaderChunk.tonemapping_pars_fragment.replace(/vec3 AgXToneMapping\( vec3 color \) \{[\s\S]*?\n\}/,`uniform sampler2D agxLUT;
vec3 AgXToneMapping(vec3 color){
 vec3 p=clamp((log2(max(color,vec3(1.e-10)))+12.47393)/16.499999,0.,1.)*63.;
 vec3 i=floor(p),f=fract(p),j=min(i+1.,vec3(63.));
 vec3 a=mix(texture2D(agxLUT,vec2((p.x+.5+i.y*64.)/4096.,(i.z+.5)/64.)).rgb,texture2D(agxLUT,vec2((p.x+.5+j.y*64.)/4096.,(i.z+.5)/64.)).rgb,f.y);
 vec3 b=mix(texture2D(agxLUT,vec2((p.x+.5+i.y*64.)/4096.,(j.z+.5)/64.)).rgb,texture2D(agxLUT,vec2((p.x+.5+j.y*64.)/4096.,(j.z+.5)/64.)).rgb,f.y);
 return mix(a,b,f.z);
}`);
THREE.ShaderChunk.shadowmap_pars_fragment=THREE.ShaderChunk.shadowmap_pars_fragment.replace(/#if defined\( SHADOWMAP_TYPE_PCF \)[\s\S]*?#elif defined\( SHADOWMAP_TYPE_PCF_SOFT \)/,`#if defined( SHADOWMAP_TYPE_PCF )
 vec2 texelSize=1./shadowMapSize;float blocker=0.;float count=0.;
 for(int k=0;k<12;k++){float a=float(k)*2.399963;vec2 delta=vec2(cos(a),sin(a))*sqrt((float(k)+.5)/12.)*.003;float d=unpackRGBAToDepth(texture2D(shadowMap,shadowCoord.xy+delta));if(d<shadowCoord.z-.00002){blocker+=d;count+=1.;}}
 shadow=1.;if(count>0.){float radius=clamp((shadowCoord.z-blocker/count)*299.*.095/180.,texelSize.x,.02);shadow=0.;
 for(int k=0;k<24;k++){float a=float(k)*2.399963;vec2 delta=vec2(cos(a),sin(a))*sqrt((float(k)+.5)/24.)*radius;shadow+=texture2DCompare(shadowMap,shadowCoord.xy+delta,shadowCoord.z);}shadow/=24.;}
 #elif defined( SHADOWMAP_TYPE_PCF_SOFT )`);
function bindGrading(m){if(m.userData.j38Grading)return;m.userData.j38Grading=true;const hook=m.onBeforeCompile,cache=m.customProgramCacheKey;m.onBeforeCompile=function(shader,r){hook.call(this,shader,r);shader.uniforms.agxLUT={value:agxLUT};};m.customProgramCacheKey=function(){return cache.call(this)+'/J37displayLUT';};m.needsUpdate=true;}
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});renderer.localClippingEnabled=true;
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;renderer.shadowMap.type=THREE.PCFShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.AgXToneMapping;renderer.toneMappingExposure=Math.pow(2,.45);
let environmentGroup=new THREE.Group(),sourceEnvironment;
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(43,1,.08,2200);scene.background=new THREE.Color('#b4d4e5');scene.fog=new THREE.Fog('#bccbd2',90,620);
scene.add(environmentGroup);
const textureLoader=new THREE.TextureLoader(),requiredTexturePromises=[];
function loadRequiredTexture(url){let resolve,reject;const p=new Promise((yes,no)=>{resolve=yes;reject=no;});requiredTexturePromises.push(p);return textureLoader.load(url,resolve,undefined,reject);}

const terrainNear=loadRequiredTexture('./assets/terrain_near.webp'),roadNear=loadRequiredTexture('./assets/road_near.webp'),terrainFar=loadRequiredTexture('./assets/terrain_atlas.webp');
for(const t of [terrainNear,roadNear,terrainFar]){t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;}
function landscapeMaterial(mat,road){mat=mat.clone();mat.normalMap=null;mat.roughness=.98;mat.onBeforeCompile=shader=>{shader.uniforms.nearMap={value:road?roadNear:terrainNear};shader.uniforms.grassMap={value:terrainNear};shader.uniforms.farMap={value:terrainFar};shader.vertexShader='varying vec3 sceneryWorld;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nsceneryWorld=(modelMatrix*vec4(transformed,1.0)).xyz;');shader.fragmentShader='uniform sampler2D nearMap; uniform sampler2D grassMap; uniform sampler2D farMap; varying vec3 sceneryWorld;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`vec2 wp=vec2(sceneryWorld.x,-sceneryWorld.z); vec2 nuv=(wp+96.0)/192.0; vec3 nearColour=texture2D(nearMap,nuv).rgb; vec3 grassColour=texture2D(grassMap,nuv).rgb; vec3 smoothGrass=(grassColour+texture2D(grassMap,nuv+vec2(.0007,0.)).rgb+texture2D(grassMap,nuv-vec2(.0007,0.)).rgb+texture2D(grassMap,nuv+vec2(0.,.0007)).rgb+texture2D(grassMap,nuv-vec2(0.,.0007)).rgb)/5.; grassColour=mix(vec3(.180,.240,.050),smoothGrass,.15); vec3 farColour=texture2D(farMap,(wp+900.0)/1800.0).rgb; vec2 houseDelta=max(abs(wp-vec2(2.1,2.25))-vec2(2.55,2.2),vec2(0.)); float contactAO=1.-.20*exp(-length(houseDelta)*4.); float grain=fract(sin(dot(floor(wp*45.),vec2(127.1,311.7)))*43758.5453); grassColour*=1.+(grain-.5)*.16*(1.-smoothstep(.02,.08,length(fwidth(wp)))); grassColour*=contactAO;nearColour*=contactAO; float edge=max(abs(wp.x),abs(wp.y)); vec3 terrainColour=mix(grassColour,farColour,smoothstep(70.0,90.0,edge)); diffuseColor.rgb=${road?'mix(nearColour,terrainColour,smoothstep(65.0,100.0,length(wp)))':'mix(grassColour,farColour,smoothstep(70.0,90.0,edge))'};`);if(!road)soilShader(shader);};mat.customProgramCacheKey=()=>road?'road-atlas':'terrain-atlas-J92-soil';return mat;}
const sky=loadRequiredTexture('./assets/sky.jpg');sky.mapping=THREE.EquirectangularReflectionMapping;sky.colorSpace=THREE.SRGBColorSpace;scene.background=sky;scene.backgroundIntensity=.935;scene.backgroundRotation.y=THREE.MathUtils.degToRad(305);
const envPixels=new Float32Array(512*256*4);for(let i=0;i<512*256;i++)envPixels.set([.70*.85,.78*.85,.87*.85,1],i*4);const envSource=new THREE.DataTexture(envPixels,512,256,THREE.RGBAFormat,THREE.FloatType);envSource.mapping=THREE.EquirectangularReflectionMapping;envSource.needsUpdate=true;const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromEquirectangular(envSource).texture;scene.environmentIntensity=.60;envSource.dispose();pmrem.dispose();
const sun=new THREE.DirectionalLight(0xffffff,7.0);sun.color.setRGB(1,.88,.68);sun.position.set(-90,75,60);sun.castShadow=true;sun.shadow.mapSize.set(4096,4096);sun.shadow.radius=3.5;Object.assign(sun.shadow.camera,{left:-90,right:90,top:90,bottom:-90,near:1,far:300});sun.shadow.bias=-.00008;sun.shadow.normalBias=.002;scene.add(sun,sun.target);
const contactPass=createContactPass(renderer,camera);
const target=new THREE.Vector3(),spherical=new THREE.Spherical();let mode='manual',modeStart=0,view='hero',ready=false,lastLOD=0,lodTransitions=0,lodCounts=[0,0,0],shrubCounts=[0,0],loadedSeconds=0;
const presets={hero:[[11,3.5,18],[-.5,1.7,-2.5]],front:[[2.1,4.5,12.75],[2.1,2,-2.25]],right:[[17.1,4.5,-2.25],[2.1,2,-2.25]],back:[[2.1,4.5,-17.25],[2.1,2,-2.25]],left:[[-12.9,4.5,-2.25],[2.1,2,-2.25]],low:[[10,.60,10],[2.1,1.55,-1.8]],top:[[2.1,19,1],[2.1,0,-2.25]],forest:[[-40,8,-44],[-63,6,-65]],distant:[[80,35,105],[2.1,3,-2.25]]};
function pose(){camera.position.copy(target).add(new THREE.Vector3().setFromSpherical(spherical));camera.position.y=Math.max(.2,camera.position.y);camera.lookAt(target)}
function setView(n){view=n;mode='manual';$('#orbit').setAttribute('aria-pressed','false');$('#walk').setAttribute('aria-pressed','false');const[p,t]=presets[n];camera.position.fromArray(p);target.fromArray(t);spherical.setFromVector3(camera.position.clone().sub(target));camera.userData.baseFov=n==='hero'?27.484:35.638;resize();pose();lastLOD=0;if(ready)updateLOD();}
function resize(){renderer.setSize(stage.clientWidth,stage.clientHeight,false);contactPass.resize(canvas.width,canvas.height);camera.aspect=stage.clientWidth/stage.clientHeight;setCompletionAspect(camera.aspect);camera.fov=2*THREE.MathUtils.radToDeg(Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.userData.baseFov||28)/2)*Math.max(1,(camera.userData.fitAspect??1.6)/camera.aspect)));camera.updateProjectionMatrix()}new ResizeObserver(resize).observe(stage);resize();setView('hero');
$('#view').onchange=e=>setView(e.target.value);
for(const n of ['orbit','walk'])$('#'+n).onclick=()=>{mode=mode===n?'manual':n;modeStart=performance.now();camera.userData.baseFov=n==='walk'?60:35;resize();for(const k of ['orbit','walk'])$('#'+k).setAttribute('aria-pressed',String(mode===k));};
const fixedStoryCamera=document.body.classList.contains('story-theatre');
if(fixedStoryCamera){
 canvas.setAttribute('aria-label','三びきのこぶたの物語');
 for(const type of ['pointerdown','pointermove','pointerup','pointercancel','wheel','keydown','touchstart','touchmove','dblclick'])canvas.addEventListener(type,e=>{if(e.cancelable)e.preventDefault();e.stopImmediatePropagation();},{capture:true,passive:false});
}
let drag=null;canvas.addEventListener('contextmenu',e=>e.preventDefault());canvas.addEventListener('pointerdown',e=>{canvas.focus();canvas.setPointerCapture(e.pointerId);drag={x:e.clientX,y:e.clientY,pan:e.button===2||e.shiftKey};mode='manual'});canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);canvas.addEventListener('pointermove',e=>{if(!drag)return;let dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;if(drag.pan){const right=new THREE.Vector3().setFromMatrixColumn(camera.matrix,0),up=new THREE.Vector3().setFromMatrixColumn(camera.matrix,1);target.addScaledVector(right,-dx*spherical.radius*.0015).addScaledVector(up,dy*spherical.radius*.0015)}else{spherical.theta-=dx*.005;spherical.phi=THREE.MathUtils.clamp(spherical.phi+dy*.004,.06,Math.PI-.06)}pose();});canvas.addEventListener('wheel',e=>{e.preventDefault();spherical.radius=THREE.MathUtils.clamp(spherical.radius*Math.exp(e.deltaY*.001),2,700);pose();},{passive:false});
const keys=new Set();canvas.addEventListener('keydown',e=>{if('wasdqe'.includes(e.key.toLowerCase())){keys.add(e.key.toLowerCase());e.preventDefault()}});window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>keys.clear());
let strawDeparture;
let playToken=0;let data,batches=new Map(),staticHouse,collapseHouse=new THREE.Group(),mixer,action,collapsePromise,initialNetwork=[],firstInteractiveMs=0,elapsed=0,running=false,animationEvents=[],staticMeshCount=0,captureTimes=[],shrubGrounding=[];
function prepare(o){o.traverse(x=>{if(x.isMesh){x.castShadow=true;x.receiveShadow=true;for(const m of Array.isArray(x.material)?x.material:[x.material])bindGrading(m);}})}
function mergeStatic(root){root.traverse(o=>{if(!o.isMesh)return;const sourceName=o.name.replaceAll('_',' ');if(sourceName.startsWith('Seamless earthen entrance'))o.userData.web_role='road';if(['Structural oak and carved trim','Wood ends and annual rings','Twisted hemp ropes','J15 hairline end checks'].some(n=>sourceName.startsWith(n))){o.geometry=o.geometry.clone();const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)p.setX(i,2.1+(p.getX(i)-2.1)*1.2);p.needsUpdate=true;o.geometry.computeBoundingSphere();}if(sourceName.startsWith('J6 garden')||sourceName.startsWith('J6 mixed height flowering plants')||sourceName.startsWith('J6 planted border stones')||sourceName.startsWith('J7 climbing ivy')){o.geometry=o.geometry.clone();const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++){if(p.getX(i)>2.1){p.setX(i,p.getX(i)+1.5);p.setZ(i,1.75+(p.getZ(i)+3.5)*.22);}else{p.setX(i,p.getX(i)-2.5);p.setZ(i,p.getZ(i)+1.3);}if(sourceName.startsWith('J7 climbing ivy'))p.setY(i,p.getY(i)*.25);}p.needsUpdate=true;o.geometry.computeBoundingSphere();}});root.updateMatrixWorld(true);const groups=new Map();root.traverse(o=>{if(!o.isMesh||o.name.replaceAll('_',' ').startsWith('J7 climbing ivy')||(omitYardFences&&isYardFence(o)))return;const mats=Array.isArray(o.material)?o.material:[o.material];if(mats.length!==1){prepare(o);environmentGroup.add(o.clone());return}const key=mats[0].uuid+'_'+Object.keys(o.geometry.attributes).sort().join(',')+'_'+!!o.geometry.index;let g=groups.get(key);if(!g)groups.set(key,g={material:['terrain','road'].includes(o.userData.web_role)?landscapeMaterial(mats[0],o.userData.web_role==='road'):mats[0],geometries:[],role:o.userData.web_role});g.geometries.push(o.geometry.clone().applyMatrix4(o.matrixWorld));});for(const g of groups.values()){const geometry=mergeGeometries(g.geometries,false);if(!geometry)throw Error('Static geometry merge failed');const m=new THREE.Mesh(geometry,g.material);m.userData.web_role=g.role;m.castShadow=g.role==='prop';m.receiveShadow=true;environmentGroup.add(m);staticMeshCount++;}}
function batchHouse(root){
 root.updateMatrixWorld(true);const group=new THREE.Group(),map=new Map();group.name='Static_house_material_batches';
 root.traverse(o=>{if(!o.isMesh)return;if(Array.isArray(o.material))throw Error('Unsupported multi-material house');const key=o.material.uuid+'_'+Object.keys(o.geometry.attributes).sort().join(',')+'_'+!!o.geometry.index;let b=map.get(key);if(!b)map.set(key,b={material:o.material,geometries:[]});b.geometries.push(o.geometry.clone().applyMatrix4(o.matrixWorld));});
 for(const b of map.values()){const geometry=mergeGeometries(b.geometries,false);if(!geometry)throw Error('House batch mismatch');group.add(new THREE.Mesh(geometry,b.material));}diagnostics.houseMaterialBatches=group.children.length;return group;
}
function makeBatches(root){root.updateMatrixWorld(true);root.traverse(o=>{const id=o.userData.protoId;if(!id)return;const inverse=o.matrixWorld.clone().invert(),parts=[];o.traverse(p=>{if(!p.isMesh)return;const mesh=new THREE.InstancedMesh(p.geometry,p.material,Math.max(data.trees.length,data.shrubs.length));mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.count=0;mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;scene.add(mesh);parts.push({mesh,local:inverse.clone().multiply(p.matrixWorld)});});batches.set(id,parts);});}
const savedLODMatrix=new THREE.Matrix4(),lodSphere=new THREE.Sphere(),lodCenter=new THREE.Vector3();let lodValid=false;
const matrix=new THREE.Matrix4(),finalMatrix=new THREE.Matrix4(),point=new THREE.Vector3(),frustum=new THREE.Frustum(),proj=new THREE.Matrix4();
function updateLOD(){camera.updateMatrixWorld();proj.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);if(lodValid&&savedLODMatrix.equals(proj))return;lodValid=true;savedLODMatrix.copy(proj);renderer.shadowMap.needsUpdate=true;frustum.setFromProjectionMatrix(proj);for(const ps of batches.values())for(const p of ps)p.mesh.count=0;lodCounts=[0,0,0];shrubCounts=[0,0];for(const [kind,list]of[['tree',data.trees],['shrub',data.shrubs]])for(const item of list){point.fromArray(item.position);const d=point.distanceTo(camera.position);const level=kind==='tree'?(d<32||(['J tree 013 part 0','J tree 007 part 0','J tree 010 part 0'].includes(item.name)&&d<160)?0:d<125?1:2):(d<110?0:1);if(item.lastLevel!==undefined&&item.lastLevel!==level)lodTransitions++;item.lastLevel=level;if(!frustum.intersectsSphere(lodSphere.set(lodCenter.copy(point).addScaledVector(camera.up,kind==='tree'?5:1),kind==='tree'?14:4)))continue;if(kind==='tree')lodCounts[level]++;else shrubCounts[level]++;matrix.fromArray(item.matrix);const ps=batches.get(`${kind}_${item.spec}_${level}`);if(!ps)throw Error('Missing LOD prototype');for(const p of ps){finalMatrix.multiplyMatrices(matrix,p.local);p.mesh.setMatrixAt(p.mesh.count++,finalMatrix);}}for(const ps of batches.values())for(const p of ps){p.mesh.visible=p.mesh.count>0;p.mesh.instanceMatrix.needsUpdate=true;}}
function evaluateAt(t){renderer.shadowMap.needsUpdate=true;action.enabled=true;action.paused=false;strawDeparture?.before();mixer.setTime(t);strawDeparture?.apply(t);}
let strawPlacement=null;function deformStraw(amount){const g=strawPlacement||staticHouse?.parent;if(!g)return;const d=g.userData;if(!d.j116Base){if(!amount)return;g.updateMatrix();d.j116Base=g.matrix.clone();g.matrixAutoUpdate=false;}if(!amount){g.matrix.copy(d.j116Base);g.matrixAutoUpdate=true;delete d.j116Base;g.updateMatrixWorld(true);return;}const p=new THREE.Vector3().setFromMatrixPosition(d.j116Base),m=new THREE.Matrix4().makeTranslation(p.x,p.y,p.z).multiply(new THREE.Matrix4().set(1,.6*amount,0,0,0,1,0,0,0,-.8*amount,1,0,0,0,0,1)).multiply(new THREE.Matrix4().makeTranslation(-p.x,-p.y,-p.z));g.matrix.copy(d.j116Base).premultiply(m);g.updateMatrixWorld(true);}
function resetHouse(){renderer.shadowMap.needsUpdate=true;playToken++;running=false;elapsed=0;if(action){action.reset().play();evaluateAt(0);action.paused=true;}collapseHouse.visible=false;staticHouse.visible=true;animationEvents.push({event:'reset',at:performance.now(),time:elapsed});}
function startCollapse(){renderer.shadowMap.needsUpdate=true;running=false;elapsed=0;action.reset().play();evaluateAt(0);staticHouse.visible=false;collapseHouse.visible=true;running=true;captureTimes=[0,2,4,8];animationEvents.push({event:'play',at:performance.now(),time:elapsed});}
$('#collapse').onclick=async()=>{const button=$('#collapse'),token=++playToken;button.disabled=true;button.textContent='崩壊データ読込中…';$('#report').style.display='none';try{if(!action)await loadCollapse();if(token===playToken)startCollapse();}catch(e){$('#report').style.display='block';$('#report').textContent='崩壊データを読み込めませんでした。再生ボタンで再試行できます。';console.error(e);}finally{button.disabled=false;button.textContent='藁の家の崩壊を再生';}};$('#reset').onclick=resetHouse;
const started=performance.now();
const measuredDecoder={...MeshoptDecoder,decodeGltfBufferAsync(count,stride,bytes,mode,filter){return MeshoptDecoder.ready.then(()=>{const target=new Uint8Array(count*stride),t=performance.now();MeshoptDecoder.decodeGltfBuffer(target,count,stride,bytes,mode,filter);diagnostics.meshDecodeMs+=performance.now()-t;diagnostics.meshDecodedBytes+=target.byteLength;return target;});}};

THREE.Cache.enabled=true;
async function preloadSharedImage(uri,signal){
 const url=new URL('./assets/'+uri,location.href).href,t0=performance.now();
 const cached=THREE.Cache.get(url);if(cached)return await cached;
 const promise=(async()=>{const response=await fetch(url,{signal});if(!response.ok)throw Error('Image '+response.status+' '+uri);const blob=await response.blob(),t1=performance.now();const bitmap=await createImageBitmap(blob,{premultiplyAlpha:'none',colorSpaceConversion:'none'}),t2=performance.now();diagnostics.images.push({uri,bytes:blob.size,fetchAndHttpDecodeMs:t1-t0,decodeMs:t2-t1,ready:t2});return bitmap;})();
 THREE.Cache.add(url,promise);try{const bitmap=await promise;THREE.Cache.add(url,bitmap);return bitmap;}catch(e){THREE.Cache.remove(url);throw e;}
}
const sharedImagesReady=Promise.resolve();

const loader=new GLTFLoader().setMeshoptDecoder(measuredDecoder);
async function readAssetResponse(response){
 if(!response.body)return response.arrayBuffer();
 const reader=response.body.getReader(),chunks=[];let bytes=0;beginReceiving();
 try{for(;;){const{done,value}=await reader.read();if(done)break;chunks.push(value);bytes+=value.byteLength;receivedChunk(value.byteLength);}const buffer=new Uint8Array(bytes);let offset=0;for(const chunk of chunks){buffer.set(chunk,offset);offset+=chunk.byteLength;}return buffer.buffer;}
 finally{endReceiving(bytes);reader.releaseLock();}
}
const SPLIT_ASSETS=["./assets/Straw_VillageTopple_J59.glb", "./assets/Wood_BlowAway_v2.glb", "./assets/Wood_VillageTopple_J59.glb"];async function fetchAssetBuffer(url,signal){if(typeof DecompressionStream==='function'&&COMPRESSED_ASSETS[url]){try{const response=await fetch(COMPRESSED_ASSETS[url],{signal});if(!response.ok)throw Error('Compressed asset '+response.status);const packed=await readAssetResponse(response);return await new Response(new Blob([packed]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();}catch(error){if(signal?.aborted)throw error;console.warn('Using original model',url);}}if(!SPLIT_ASSETS.includes(url)){const response=await fetch(url,{signal});if(!response.ok)throw Error('Asset '+response.status+' '+url);return readAssetResponse(response);}const m=await fetch(url+'.parts.json',{signal});if(!m.ok)throw Error('Asset parts '+m.status+' '+url);const info=await m.json(),dir=url.slice(0,url.lastIndexOf('/')+1),bufs=await Promise.all(info.parts.map(p=>fetch(dir+p,{signal}).then(r=>{if(!r.ok)throw Error('Asset part '+r.status+' '+p);return readAssetResponse(r);})));const out=new Uint8Array(info.size);let o=0;for(const b of bufs){out.set(new Uint8Array(b),o);o+=b.byteLength;}return out.buffer;}
const parsedAssets=new Map();
async function loadAsset(url,signal){
 let task=parsedAssets.get(url);if(!task){task=(async()=>{const t0=performance.now(),buffer=await fetchAssetBuffer(url,signal),t1=performance.now(),result=await loader.parseAsync(buffer,new URL('.',new URL(url,location.href)).href),t2=performance.now();diagnostics.assets.push({url,fetchAndHttpDecodeMs:t1-t0,parseIncludingImagesMs:t2-t1,decodedBytes:buffer.byteLength,start:t0,bytesReady:t1,parsed:t2});return result;})();parsedAssets.set(url,task);task.catch(()=>{if(parsedAssets.get(url)===task)parsedAssets.delete(url);});}
 const source=await task,scene=source.scene.clone(true),materials=new Map();scene.traverse(o=>{if(o.isMesh){const clone=m=>{if(!materials.has(m))materials.set(m,m.clone());return materials.get(m);};o.material=Array.isArray(o.material)?o.material.map(clone):clone(o.material);}});return{...source,scene,animations:source.animations.map(c=>c.clone())};
}
const unusedHouse=()=>({scene:new THREE.Group(),animations:[]});

async function load(){const [env,proto,vegetation,house]=await Promise.all([loadAsset('./assets/environment.glb'),loadAsset('./assets/vegetation_prototypes.glb'),fetch('./assets/vegetation.json').then(r=>r.json()),selectedSites.straw.visual==='straw'?loadAsset('./assets/StrawHouse.glb'):Promise.resolve(unusedHouse()),sharedImagesReady]);await Promise.all([lutReady,...requiredTexturePromises]);if(selectedSites.straw.visual==='straw')reviseStrawDoor(house.scene);diagnostics.phases.assetsReady=performance.now();const assemblyStart=performance.now();scene.background=createSeamlessSky(renderer,sky).texture;diagnostics.phases.skyConversionMs=performance.now()-assemblyStart;contactPass.setLUT(agxLUT);data=vegetation;env.scene.traverse(o=>{if(o.isMesh&&!o.userData.web_role){let parent=o.parent;while(parent&&!parent.userData.web_role)parent=parent.parent;if(parent)o.userData.web_role=parent.userData.web_role;}});env.scene.updateMatrixWorld(true);proto.scene.traverse(o=>{if(o.isMesh){const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats)if(m.name.includes('rough bark')){m.map=null;m.normalMap=null;m.color.setRGB(.215,.159,.0925);m.roughness=.92;m.needsUpdate=true;}}});proto.scene.updateMatrixWorld(true);let terrain;env.scene.traverse(o=>{if(o.isMesh&&o.userData.web_role==='terrain')terrain=o;});if(!terrain)throw Error('Missing terrain');const ray=new THREE.Raycaster(),prototypeBottom={};proto.scene.traverse(o=>{if(o.userData.protoId?.startsWith('shrub_'))prototypeBottom[o.userData.protoId]=new THREE.Box3().setFromObject(o).min.y;});for(const item of (data.groundingPrecomputed?[]:data.shrubs)){ray.set(new THREE.Vector3(item.position[0],200,item.position[2]),new THREE.Vector3(0,-1,0));const hit=ray.intersectObject(terrain,false)[0];if(!hit)continue;const bottom=prototypeBottom[`shrub_${item.spec}_0`]*item.matrix[5],old=item.matrix[13];item.matrix[13]=hit.point.y-bottom-.04;item.position[1]=item.matrix[13];shrubGrounding.push(item.matrix[13]-old);}env.scene.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])if(m.name.startsWith('J lawn blade')){m.emissive.copy(m.color).multiplyScalar(.55);}});sourceEnvironment=env.scene.clone(true);mergeStatic(env.scene);makeBatches(proto.scene);const placement=new THREE.Group();placement.name='Approved_building_placement_once';placement.position.set(2.1,0,-2.25);scene.add(placement);staticHouse=batchHouse(house.scene);placement.add(staticHouse,collapseHouse);prepare(staticHouse);prepare(collapseHouse);resetHouse();updateLOD();scene.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])bindGrading(m);});diagnostics.phases.assemblyMs=performance.now()-assemblyStart;const compileStart=performance.now();await contactPass.compile(scene);diagnostics.phases.compileMs=performance.now()-compileStart;await initialDraw();loadedSeconds=(performance.now()-started)/1000;firstInteractiveMs=performance.now();initialNetwork=networkRecords();ready=true;finishLoadStep('scenery');canvas.style.visibility='visible';for(const id of ['view','orbit','walk'])$('#'+id).disabled=false;$('#loading').hidden=true;$('#village-open').disabled=false;$('#story-play').disabled=false;for(const id of ['collapse','reset','measure','save'])$('#'+id).disabled=false;}
function networkRecords(){return [...performance.getEntriesByType('navigation'),...performance.getEntriesByType('resource')].filter(e=>e.name.startsWith(location.origin)&&!e.name.includes('__scenery_evidence')).map(e=>({url:e.name.replace(location.origin,''),encodedBodySize:e.encodedBodySize,decodedBodySize:e.decodedBodySize,transferSize:e.transferSize,duration:e.duration}));}
async function loadCollapse(){if(collapsePromise)return collapsePromise;collapsePromise=(async()=>{const collapse=await loadAsset('./assets/Straw_VillageTopple_J59.glb');const placement=staticHouse.parent;placement.remove(collapseHouse);collapseHouse=collapse.scene;placement.add(collapseHouse);prepare(collapseHouse);collapseHouse.visible=false;const clip=collapse.animations.find(c=>c.name==='Straw_VillageTopple_J59');if(!clip||Math.abs(clip.duration-8)>.001)throw Error('Collapse contract mismatch');reviseCollapseDoor(collapseHouse,clip,(await loadAsset('./assets/StrawHouse.glb')).scene);strawDeparture=createBlowawayDeparture(THREE,collapseHouse,clip,[0,0,-1]);mixer=new THREE.AnimationMixer(collapseHouse);action=mixer.clipAction(clip).setLoop(THREE.LoopOnce,1);action.clampWhenFinished=true;const token=playToken;resetHouse();playToken=token;await contactPass.compile(scene);})().catch(e=>{collapsePromise=null;throw e;});return collapsePromise;}

let storyPlayer=null;
let characterLayer=null,characterLoading=false,characterOrbit=false,characterOrbitStart=0,lastCharacterStatus=0;
let villagePromise=null,villageController=null,villageToken=0,villageReady=false,villageAttemptStart=0,villageCompletedAt=0,villageTransfer=[],villageAudit=null,villageGround=null,villageEvents=[],travel=null,travelHistory=[];
const villageLabel=$('#village-state'),villageOverlay=$('#village-overlay'),villageMessage=$('#village-message');
Object.assign(presets,{
 compare_top:[[0,82,-6],[0,0,-6.01]],
 acting_front:[[5,1.6,9],[2.1,1.8,-2.25]],
 acting_low:[[-10,.8,3],[-20,1.3,-15]],
 between_houses:[[-8,1.6,-10],[20,2.6,-14]],
 front_gate:[[0,.7,20],[2.1,1.7,-2.25]],
 rear_gate:[[0,2.264,-33],[2.1,1.5,-2.25]],
 left_gate:[[-39,1.2,-17],[-20,1.5,-15]],
 right_gate:[[39,2,-12],[20,2.6,-14]],
 perimeter_back:[[-33,8,-35],[0,1,-10]],

 village:[[33,31,49],[0,0,-8]],village_top:[[0,60,-7],[0,0,-7.01]],
 wood_front:[[-20,3.66,1],[-20,1.86,-15]],wood_back:[[-20,3.66,-30],[-20,1.86,-15]],wood_low:[[-27,.70,-2],[-20,2.16,-15]],wood_left:[[-35,3.66,-15],[-20,1.86,-15]],wood_right:[[-5,3.66,-15],[-20,1.86,-15]],
 brick_front:[[20,4.86,2],[20,3.06,-14]],brick_back:[[20,4.86,-29],[20,3.06,-14]],brick_low:[[28,1.75,-2],[20,2.56,-14]],brick_left:[[5,4.86,-14],[20,3.06,-14]],brick_right:[[35,4.86,-14],[20,3.06,-14]]
});
function villageRecord(){return{ready:villageReady,requestedAt:villageAttemptStart,allThreeReadyAt:villageCompletedAt,requestToAllThreeMs:villageCompletedAt?villageCompletedAt-villageAttemptStart:null,initialView:'approved straw garden',transfer:villageTransfer,audit:villageAudit,events:villageEvents,travelHistory,characterMovement:false,woodBrickCollapse:false};}
async function villageAssets(){
 if(villagePromise)return villagePromise;
 const controller=new AbortController();villageController=controller;const signal=controller.signal;
 let task;task=(async()=>{const response=await fetch('./assets/village_assets.json',{signal});if(!response.ok)throw Error('Village manifest '+response.status);const manifest=await response.json();
 const images=Promise.resolve();
 const [wood,brick,grid]=await Promise.all([selectedSites.wood.visual==='wood'?loadAsset('./assets/WoodHouse.glb',signal):Promise.resolve(unusedHouse()),selectedSites.brick.visual==='brick'?loadAsset('./assets/BrickHouse.glb',signal):Promise.resolve(unusedHouse()),fetch('./assets/ground_grid.json',{signal}).then(r=>{if(!r.ok)throw Error('Ground '+r.status);return r.json();}),images]);
 return{wood,brick,grid};
 })().catch(e=>{if(villagePromise===task)villagePromise=null;controller.abort();throw e;});villagePromise=task;return task;
}
$('#village-cancel').onclick=()=>{villageToken++;villageController?.abort();villagePromise=null;villageOverlay.hidden=true;$('#village-open').disabled=false;villageLabel.textContent='藁の家の庭 · 村の準備を取り消しました';villageEvents.push({event:'cancel',at:performance.now(),ready:villageReady});};
$('#village-open').onclick=async()=>{
 if(villageReady){setView('village');$('#view').value='village';villageEvents.push({event:'revisit',at:performance.now()});return;}
 const token=++villageToken;villageAttemptStart=performance.now();$('#village-open').disabled=true;villageOverlay.hidden=false;villageMessage.textContent='三軒の村を準備しています。完成した区画へまとめて切り替えます…';villageEvents.push({event:'request',at:villageAttemptStart});
 let previousEnvironment=null,pendingEnvironment=null,previousView=view;
 try{const assets=await villageAssets();if(token!==villageToken)return;
 villageMessage.textContent='建物・庭・道を仕上げています…';$('#village-cancel').disabled=true;
 const env=sourceEnvironment.clone(true);const landscape=createVillageLandscape(env,assets.grid,roadNear,bindGrading);
 for(const r of landscape.replacements){r.source.geometry=r.geometry;if(r.source.userData.web_role==='terrain')qaContactTerrain=r.source;}
 const before=environmentGroup;previousEnvironment=before;environmentGroup=new THREE.Group();pendingEnvironment=environmentGroup;environmentGroup.name='J45_environment';omitYardFences=true;mergeStatic(env);environmentGroup.add(landscape.group);
 for(const [i,key]of ['wood','brick'].entries()){const placement=new THREE.Group(),p=plots[i];placement.name='Approved_'+key+'_placement_once';placement.position.set(p.x,p.y,p.z);placement.rotation.y=0;placement.scale.setScalar(1);const house=batchHouse(assets[key].scene);prepare(house);house.traverse(o=>{if(o.isMesh){const dm=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:4});o.customDepthMaterial=dm;const m=o.material;if(!m.userData.villageShadow){m.userData.villageShadow=true;const hook=m.onBeforeCompile,cache=m.customProgramCacheKey;m.onBeforeCompile=function(shader,r){hook.call(this,shader,r);shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_begin>',THREE.ShaderChunk.lights_fragment_begin.replaceAll('directionalLightShadow.shadowBias','(directionalLightShadow.shadowBias - 0.00032)'));};m.customProgramCacheKey=function(){return cache.call(this)+'/village-shadow-receiver';};m.needsUpdate=true;}}});placement.add(house);environmentGroup.add(placement);}
 storyHill=createStoryHill(landscape.ground,landscapeMaterial(new THREE.MeshStandardMaterial({roughness:1}),false),roadNear);environmentGroup.add(storyHill.group);
 for(const[kind,list]of [['tree',data.trees],['shrub',data.shrubs]])for(const item of list){let[x,y,z]=item.position;const oldGround=landscape.ground(x,z),[u,v]=hillUV(x,z),corridor=kind==='tree'?11:1.8;if(u>-48&&u<26&&Math.abs(v)<corridor){[x,z]=hillXZ(u,(v<0?-1:1)*(kind==='tree'?14+Math.abs(u)%4:3));item.position[0]=item.matrix[12]=x;item.position[2]=item.matrix[14]=z;}
  if(x<-33&&(Math.hypot(x-COMMON_HOME.x,z-COMMON_HOME.z)<7||routeClearance(x,z)<(kind==='tree'?4:1.7))){z-=12;item.position[2]=item.matrix[14]=z;}
  const delta=storyHill.ground(x,z)-oldGround;item.position[1]+=delta;item.matrix[13]+=delta;}
 scene.add(environmentGroup);before.visible=false;villageGround=storyHill.ground;villageAudit=landscape.checks;
 scene.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])bindGrading(m);});setView('village');$('#view').value='village';updateLOD();renderer.shadowMap.needsUpdate=true;await contactPass.compile(scene);await initialDraw();
 villageReady=true;villageCompletedAt=performance.now();villageTransfer=networkRecords().filter(r=>!initialNetwork.some(i=>i.url===r.url));villageEvents.push({event:'commit',at:villageCompletedAt,ready:true});
 for(const o of $('#view').options)if('village' in o.dataset)o.disabled=false;
 for(const b of document.querySelectorAll('[data-travel]'))b.disabled=false;
 villageLabel.textContent='三軒の村 · すべての家へ移動できます';$('#character-load').disabled=false;$('#story-play').disabled=false;$('#village-open').textContent='村全体へ';$('#variant').textContent=isBaseline?'比較：J45 四開口の外周':'J46 道路二開口・奥行き短縮';villageOverlay.hidden=true;scene.remove(before);
 before.traverse(o=>{if(o.isMesh)o.geometry.dispose();});
 saveEvidence('village_ready',true).catch(console.error);
 }catch(e){if(token!==villageToken)return;if(previousEnvironment){scene.remove(pendingEnvironment);environmentGroup=previousEnvironment;omitYardFences=false;previousEnvironment.visible=true;setView(previousView);$('#view').value=previousView;renderer.shadowMap.needsUpdate=true;}console.error(e);villageOverlay.hidden=true;villageLabel.textContent='村を準備できませんでした。元の庭を保っています。再試行できます。';villageEvents.push({event:'failure',at:performance.now(),message:String(e),ready:villageReady});}
 finally{if(token===villageToken){$('#village-open').disabled=false;$('#village-cancel').disabled=false;}}
};
for(const button of document.querySelectorAll('[data-travel]'))button.onclick=()=>beginVillageTravel(button.dataset.travel);
function beginVillageTravel(id){
 if(!villageReady)return;mode='manual';$('#orbit').setAttribute('aria-pressed','false');$('#walk').setAttribute('aria-pressed','false');
 const p=id==='straw'?{x:2.1,y:0,z:-2.25}:plots.find(x=>x.id===id),start=camera.position.clone();
 const roadZ=x=>4.3-.018*(x-2)**2;let sx=start.x,route=[start,new THREE.Vector3(sx,villageGround(sx,roadZ(sx))+1.65,roadZ(sx))];
 for(let i=1;i<=12;i++){let x=THREE.MathUtils.lerp(sx,p.x-.65,i/12);route.push(new THREE.Vector3(x,villageGround(x,roadZ(x))+1.65,roadZ(x)));}
 route.push(new THREE.Vector3(p.x-.65,p.y+1.65,p.z+7),new THREE.Vector3(p.x-.65,p.y+1.65,p.z+5.5));
 travel={id,start:performance.now(),curve:new THREE.CatmullRomCurve3(route),target:new THREE.Vector3(p.x,p.y+1.8,p.z),duration:11000,nextCapture:1};
 camera.userData.baseFov=55;resize();travelHistory.push({event:'start',id,at:travel.start});$('#village-state').textContent=p.name?p.name+'へカメラ移動中':'藁の家へカメラ移動中';
}
function updateVillageTravel(now){if(!travel)return;const t=Math.min(1,(now-travel.start)/travel.duration),q=travel.curve.getPointAt(t);camera.position.copy(q);camera.position.y=Math.max(camera.position.y,villageGround(q.x,q.z)+.55);target.copy(travel.target);camera.lookAt(target);camera.updateMatrixWorld(true);spherical.setFromVector3(camera.position.clone().sub(target));if(t>=travel.nextCapture/4&&travel.nextCapture<4){travelHistory.push({event:'progress',id:travel.id,fraction:travel.nextCapture/4,camera:camera.position.toArray(),groundClearance:camera.position.y-villageGround(camera.position.x,camera.position.z)});saveEvidence(travel.id+'_route_'+travel.nextCapture,true).catch(console.error);travel.nextCapture++;}if(t===1){travelHistory.push({event:'arrive',id:travel.id,at:now,camera:camera.position.toArray()});view=travel.id+'_arrival';travel=null;$('#village-state').textContent='到着 · ドラッグで自由に周囲を見られます';saveEvidence(view,true).catch(console.error);}}
canvas.addEventListener('pointerdown',()=>{if(travel){travelHistory.push({event:'interrupted',id:travel.id,at:performance.now()});travel=null;}});
$('#view').addEventListener('change',()=>travel=null);for(const id of ['orbit','walk'])$('#'+id).addEventListener('click',()=>travel=null);canvas.addEventListener('keydown',()=>travel=null);
load().catch(e=>{failLoading();const box=$('#loading');box.textContent='読み込みに失敗しました。';const retry=document.createElement('button');retry.textContent='読み込みを再試行';retry.onclick=()=>location.reload();box.append(document.createElement('br'),retry);console.error(e)});
let measure=null,lastTime=performance.now(),lastStats=0,latestReport=null;
function record(){return{story:storyPlayer?.status()??{ready:false},characters:characterLayer?.record()??{ready:false,visualValidation:'pending'},village:villageRecord(),fenceLayout:isBaseline?'J45 perimeter':'J46 two road openings',version:'J46 two road openings and shorter depth; shared texture preload; landscape webp95; original sky with periodic shader seam blend; pregrounding; batches; cached shadows',time:new Date().toISOString(),viewport:{width:innerWidth,height:innerHeight,canvasWidth:canvas.width,canvasHeight:canvas.height,dpr:renderer.getPixelRatio()},camera:camera.position.toArray(),target:target.toArray(),view,mode,loadSeconds:loadedSeconds,firstInteractiveMs,initialNetwork,currentNetwork:networkRecords(),treeLOD:lodCounts,shrubLOD:shrubCounts,lodTransitions,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,staticBatches:staticMeshCount,shrubGrounding:{count:shrubGrounding.length,maxCorrection:Math.max(...shrubGrounding.map(Math.abs))},animation:{elapsed,running,staticVisible:staticHouse.visible,collapseVisible:collapseHouse.visible,events:animationEvents.slice(-10)},diagnostics:diagnosticRecord(),mobilePerformance:'unmeasured',userAgent:navigator.userAgent};}
async function saveEvidence(name,image=false,extra={}){if(!new URLSearchParams(location.search).has('dev')||new URLSearchParams(location.search).has('qa'))return {skipped:true,reason:'dedicated harness owns offscreen evidence'};const result=await fetch('/__scenery_evidence',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,record:{...record(),...extra},image:image?canvas.toDataURL('image/png'):null})});if(!result.ok)throw Error('Evidence save failed');return result.json();}
$('#save').onclick=async()=>{const r=await saveEvidence(view+'_'+(collapseHouse.visible?'collapse':'static'),true);$('#report').style.display='block';$('#report').textContent='検証画像保存: '+r.saved;};
$('#measure').onclick=()=>{diagnostics.cpuLOD=[];diagnostics.cpuRender=[];diagnostics.gpu=[];measure={start:performance.now(),samples:[]};$('#measure').disabled=true;$('#report').style.display='block';$('#report').textContent='10秒計測中…';};

const gl=renderer.getContext(),gpuExt=gl.getExtension('EXT_disjoint_timer_query_webgl2'),gpuPending=[];diagnostics.gpuSupport=!!gpuExt;let gpuFrame=0;
async function initialDraw(){
 const q=gpuExt?gl.createQuery():null;if(q)gl.beginQuery(gpuExt.TIME_ELAPSED_EXT,q);
 const start=performance.now();contactPass.render(scene);diagnostics.phases.firstRenderSubmitMs=performance.now()-start;if(q)gl.endQuery(gpuExt.TIME_ELAPSED_EXT);
 await new Promise(requestAnimationFrame);
 if(q){while(!gl.getQueryParameter(q,gl.QUERY_RESULT_AVAILABLE)&&performance.now()-start<2000)await new Promise(requestAnimationFrame);if(gl.getQueryParameter(q,gl.QUERY_RESULT_AVAILABLE)&&!gl.getParameter(gpuExt.GPU_DISJOINT_EXT))diagnostics.phases.firstDrawGPUms=gl.getQueryParameter(q,gl.QUERY_RESULT)/1e6;gl.deleteQuery(q);}diagnostics.phases.firstDrawWallMs=performance.now()-start;
}
function measuredRender(){
 let query=null;if(gpuExt&&measure&&gpuFrame++%4===0&&gpuPending.length<12){query=gl.createQuery();gl.beginQuery(gpuExt.TIME_ELAPSED_EXT,query);}
 const t=performance.now();contactPass.render(scene);if(measure)diagnostics.cpuRender.push(performance.now()-t);
 if(query){gl.endQuery(gpuExt.TIME_ELAPSED_EXT);gpuPending.push(query);}
 if(gpuExt){const disjoint=gl.getParameter(gpuExt.GPU_DISJOINT_EXT);if(disjoint)diagnostics.gpuDisjoint++;while(gpuPending.length&&gl.getQueryParameter(gpuPending[0],gl.QUERY_RESULT_AVAILABLE)){const q=gpuPending.shift(),ns=gl.getQueryParameter(q,gl.QUERY_RESULT);if(!disjoint)diagnostics.gpu.push(ns/1e6);gl.deleteQuery(q);}}
}
function summary(values){if(!values.length)return null;const v=[...values].sort((a,b)=>a-b);return{count:v.length,mean:v.reduce((a,b)=>a+b,0)/v.length,median:v[Math.floor(v.length/2)],p95:v[Math.floor(v.length*.95)],max:v[v.length-1]};}
function diagnosticRecord(){return{images:diagnostics.images,houseMaterialBatches:diagnostics.houseMaterialBatches,groundingPrecomputed:data?.groundingPrecomputed,assets:diagnostics.assets,meshDecodeMs:diagnostics.meshDecodeMs,meshDecodedBytes:diagnostics.meshDecodedBytes,phases:diagnostics.phases,frameCPU:summary(diagnostics.cpuRender),lodCPU:summary(diagnostics.cpuLOD),frameGPU:summary(diagnostics.gpu),gpuSupport:diagnostics.gpuSupport,gpuDisjoint:diagnostics.gpuDisjoint};}

let qaManualClock=false;
function frame(now){requestAnimationFrame(frame);const rawDt=(now-lastTime)/1000,dt=Math.min(rawDt,.1);lastTime=now;const introCover=document.getElementById('cover');if(introCover&&!introCover.hidden)return;if(mode==='orbit'){const focus=plots.find(p=>view.startsWith(p.id));target.set(focus?.x??2.1,(focus?.y??0)+2,focus?.z??-2.25);spherical.radius=view.startsWith('village')?36:16;spherical.phi=1.42;spherical.theta=(now-modeStart)*.0002;pose()}if(mode==='walk'){const x=-8+((now-modeStart)*.0011)%16;camera.position.set(x,1.55,5.3-.018*(x-2)**2);target.set(2.1,2,-.1);camera.lookAt(target);camera.updateMatrixWorld(true);spherical.setFromVector3(camera.position.clone().sub(target));}
updateVillageTravel(now);
if(characterOrbit){const angle=(now-characterOrbitStart)*.00025;target.set(12.4,1.1,-3.5);camera.position.set(12.4+Math.sin(angle)*6,1.8,-3.5+Math.cos(angle)*6);camera.lookAt(target);camera.updateMatrixWorld(true);spherical.setFromVector3(camera.position.clone().sub(target));}
if(keys.size){const forward=target.clone().sub(camera.position);forward.y=0;forward.normalize();const right=new THREE.Vector3().crossVectors(forward,camera.up);for(const [key,vec,sign]of[['w',forward,1],['s',forward,-1],['d',right,1],['a',right,-1],['e',camera.up,1],['q',camera.up,-1]])if(keys.has(key))target.addScaledVector(vec,dt*5*sign);pose();}
if(ready){if(running){elapsed=Math.min(8,elapsed+Math.max(0,rawDt));evaluateAt(elapsed);if(elapsed===8){running=false;action.paused=true;animationEvents.push({event:'end',at:now,time:8});}}if(now-lastLOD>180){const lt=performance.now();updateLOD();if(measure)diagnostics.cpuLOD.push(performance.now()-lt);lastLOD=now;}$('#animation-state').textContent=collapseHouse.visible?`崩壊 ${elapsed.toFixed(2)} / 8.00秒${running?'':' · 終端保持'}`:'静的外観';}
if(!qaManualClock){storyPlayer?.tick(dt);if(ready)updateLOD();}
if(characterLayer){const status=characterLayer.update(camera,dt);if(now-lastCharacterStatus>150){$('#character-state').textContent=(status.kind==='translation'?'移動だけの技術試験 '+status.time.toFixed(1)+' / 10秒（歩行ではありません）':'静止画像・8方向切替')+'｜'+(status.unsupported.length?'この高さは画像未対応：'+status.unsupported.join('・')+' を非表示':'対応仰角内（描画の目視検証待ち）')+'｜低頭身の狼を取込済み・輪郭の実描画は検証待ち';$('#character-time').value=status.time;lastCharacterStatus=now;}}
storyPlayer?.updateEffects(camera);
measuredRender();
if(ready&&captureTimes.length&&elapsed>=captureTimes[0]){const at=captureTimes.shift();saveEvidence('playback_'+String(at),true).catch(console.error);}
if(ready&&now-lastStats>500){$('#stats').textContent=`実3D · 読込 ${loadedSeconds.toFixed(1)}秒 · ${canvas.clientWidth} × ${canvas.clientHeight}\n木LOD 近 ${lodCounts[0]} / 中 ${lodCounts[1]} / 遠 ${lodCounts[2]} · 切替 ${lodTransitions}\n${renderer.info.render.calls} draw calls · ${(renderer.info.render.triangles/1e6).toFixed(2)} M triangles`;lastStats=now;}
if(measure){measure.samples.push(rawDt*1000);if(now-measure.start>=10000){const a=measure.samples.slice(1).sort((a,b)=>a-b),mean=a.reduce((s,x)=>s+x,0)/a.length;latestReport={frames:a.length,meanFrameMs:mean,p95FrameMs:a[Math.floor(a.length*.95)],fps:1000/mean,durationMs:now-measure.start};measure=null;$('#measure').disabled=false;$('#report').textContent=JSON.stringify({performance:latestReport,frameCPU:diagnosticRecord().frameCPU,frameGPU:diagnosticRecord().frameGPU},null,2);saveEvidence('performance',false,{performance:latestReport}).catch(console.error);}}}
requestAnimationFrame(frame);

Object.assign(presets,{
 character_front:[[12.4,2.15,7.5],[12.4,1.2,-3.5]],
 character_back:[[12.4,2.15,-14.5],[12.4,1.2,-3.5]],
 character_west:[[6.4,1.8,-3.5],[12.4,1.2,-3.5]],
 character_east:[[23.4,2.15,-3.5],[12.4,1.2,-3.5]],
 character_diagonal:[[4.6,2.15,4.3],[12.4,1.2,-3.5]],
 character_low:[[12.4,.85,7.5],[12.4,.9,-3.5]],
 character_overhead:[[12.4,24,-3.49],[12.4,0,-3.5]],
 character_house_occlusion:[[20,2.2,-5],[20,1.8,-18.5]],
 character_fence_occlusion:[[10,1.2,16],[10,.7,9.5]]
});
function stopCharacterOrbit(){characterOrbit=false;$('#character-orbit').setAttribute('aria-pressed','false');}
canvas.addEventListener('pointerdown',stopCharacterOrbit);canvas.addEventListener('wheel',stopCharacterOrbit);canvas.addEventListener('keydown',stopCharacterOrbit);
$('#view').addEventListener('change',stopCharacterOrbit);
for(const id of ['orbit','walk'])$('#'+id).addEventListener('click',stopCharacterOrbit);
for(const b of document.querySelectorAll('[data-travel]'))b.addEventListener('click',stopCharacterOrbit);
let characterTask=null;
$('#character-load').onclick=async()=>{
 if(!villageReady)throw Error('Village is not ready');
 if(characterTask)return characterTask;
 stopCharacterOrbit();
 if(characterLayer){characterLayer.layout('static');setView('character_front');$('#view').value='character_front';return;}
 characterLoading=true;$('#character-load').disabled=true;$('#character-state').textContent='原画像と方向情報を準備しています…';
 characterTask=(async()=>{let candidate,paperStage;
 try{candidate=await createCharacterLayer({scene,ground:villageGround});candidate.group.visible=false;finishLoadStep('characters');candidate=await installVillainFaces(candidate);finishLoadStep('faces');paperStage=await installPaperTheatre(candidate);finishLoadStep('run');finishLoadStep('paper');await installPerformerActions(candidate);finishLoadStep('actions');installStrawWorkshopPreview(candidate);await installStrawJoy(candidate);finishLoadStep('joy');await installWolfEscape(candidate);finishLoadStep('wolf');await installDoorHost(candidate,villageGround);finishLoadStep('doors');installEncounterPerformers(candidate,villageGround);await installAnimalReactions(candidate);finishLoadStep('reactions');
 characterLayer=candidate;candidate.group.visible=true;window.__paperStage=paperStage;
 for(const b of document.querySelectorAll('[data-character-control]'))b.disabled=false;for(const o of document.querySelectorAll('option[data-character-view]'))o.disabled=false;
 setView('character_front');$('#view').value='character_front';$('#character-load').textContent='4体の静止配置に戻す';
 }catch(error){
  if(candidate){candidate.group.removeFromParent();const geometries=new Set(),materials=new Set(),textures=new Set();candidate.group.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){materials.add(m);if(m.map)textures.add(m.map);}});for(const value of [...geometries,...materials,...textures])value.dispose();}
  document.getElementById('paper-controls')?.remove();
  $('#character-state').textContent='登場人物の準備が完了していません。';throw error;
 }finally{characterLoading=false;characterTask=null;$('#character-load').disabled=false;}
 })();return characterTask;
};
$('#character-orbit').onclick=()=>{characterOrbit=!characterOrbit;characterOrbitStart=performance.now();mode='manual';travel=null;$('#orbit').setAttribute('aria-pressed','false');$('#walk').setAttribute('aria-pressed','false');$('#character-orbit').setAttribute('aria-pressed',String(characterOrbit));};
$('#character-occlusion').onclick=()=>{stopCharacterOrbit();characterLayer.layout('occlusion');setView('character_house_occlusion');$('#view').value='character_house_occlusion';};
$('#character-translate').onclick=()=>{stopCharacterOrbit();characterLayer.playTranslation();setView('character_front');$('#view').value='character_front';};
$('#character-pause').onclick=()=>characterLayer.pause();
$('#character-time').oninput=e=>characterLayer.seek(Number(e.target.value));

async function prepareStory(){
 if(!villageReady)await $('#village-open').onclick();
 if(!villageReady)throw Error('三軒の村を準備できませんでした');finishLoadStep('village');
 if(!characterLayer){try{await $('#character-load').onclick();}catch(error){console.warn('Retrying character preparation');await $('#character-load').onclick();}}
 if(!characterLayer)throw Error('キャラクターを準備できません');
 playToken++;running=false;captureTimes=[];
 if(selectedSites.straw.visual==='straw'&&selectedAssets.collapse.includes('straw'))await loadCollapse();
 const configResponse=await fetch('./assets/story_buildings.json');if(!configResponse.ok)throw Error('建物演出の定義を読み込めません');
 const config=await configResponse.json();let wood=null;
 if(config.wood&&selectedSites.wood.visual==='wood'){const module=await import(new URL(config.wood.module,import.meta.url).href);wood=await module.createWoodStoryCollapse({placement:environmentGroup.getObjectByName('Approved_wood_placement_once'),loadAsset,prepare,THREE,collapseRequired:selectedAssets.collapse.includes('wood')});}
 finishLoadStep('collapse');const assets=await villageAssets();let chimney;
 assets.brick.scene.traverse(o=>{if(o.name==='Brick__Chimney')chimney=o;});
 if(chimney){assets.brick.scene.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(chimney),center=b.getCenter(new THREE.Vector3()),x=20+center.x,z=-14+center.z,top=1.06+b.max.y-villageGround(x,z);configureStoryBindings({anchors:{brick_chimney_top:{x,z,y:top},brick_chimney_hidden:{x,z,y:top-1.9},brick_roof_edge:{x:23,z,y:4.5}}});}
 const constructionSources={straw:selectedSites.straw.visual==='straw'?(await loadAsset('./assets/StrawHouse.glb')).scene:new THREE.Group(),wood:assets.wood.scene,brick:assets.brick.scene};
 if(selectedSites.straw.visual==='straw')reviseStrawDoor(constructionSources.straw);
 strawPlacement=staticHouse.parent;
 const puzzle=await preparePuzzleSites({THREE,loadAsset,prepare,cast:getPuzzleCast(),assetPlan:selectedAssets,placements:{straw:strawPlacement,wood:environmentGroup.getObjectByName('Approved_wood_placement_once'),brick:environmentGroup.getObjectByName('Approved_brick_placement_once')},sources:constructionSources});
 finishLoadStep('houses');window.__puzzleSites=()=>puzzle.sites;
 const constructionEntries={};
 for(const [id,kind]of [['straw','Straw'],['wood','Wood'],['brick','Brick']]){
  let manifest=puzzle.manifests[id];if(!manifest){const response=await fetch('./'+kind+'_construction.json');if(!response.ok)throw Error('Construction manifest '+kind);manifest=await response.json();}
  constructionEntries[id]={source:constructionSources[id],manifest,kind:puzzle.sites[id].visual,placement:id==='straw'?strawPlacement:environmentGroup.getObjectByName('Approved_'+id+'_placement_once')};
 }
 const construction=createConstructionBridge({THREE,entries:constructionEntries,prepare,ground:villageGround,invalidate(){renderer.shadowMap.needsUpdate=true;}});
 finishLoadStep('construction');window.__constructionExterior=(...args)=>construction.exteriorContact(...args);
 if(new URLSearchParams(location.search).has('qa')){window.__constructionProbe=()=>construction.inspectParts();window.__constructionSites=()=>construction.contactSites();window.__constructionContactAudit=()=>construction.contactAudit();window.__cumulativeAudit=()=>construction.cumulativeAudit();}
 const doorParts=[];for(const id of ['straw','wood','brick']){if(['tent','bunker','treehouse','karakuri'].includes(constructionEntries[id].kind))continue;try{doorParts.push(createShelterDoors({[id]:constructionEntries[id]}));}catch(e){console.warn('Door setup failed',id,e.message);}}
 const doors={apply(st){for(const d of doorParts)d.apply(st);},record(){return Object.assign({},...doorParts.map(d=>d.record()));}};
 if(new URLSearchParams(location.search).has('qa'))window.__doorAudit=()=>doors.record();
 window.__terrainAudit=()=>{qaContactTerrain.updateMatrixWorld(true);return new THREE.Box3().setFromObject(qaContactTerrain);};
 let commonSource=constructionSources.straw,hasOak=false;commonSource.traverse(o=>{if(o.isMesh&&/Oak_0/.test(o.material?.name))hasOak=true;});
 if(!hasOak)commonSource=(await loadAsset('./assets/WoodHouse.glb')).scene;
 const commonHome=createCommonHome(villageGround,commonSource);environmentGroup.add(commonHome.root);prepare(commonHome.root);environmentGroup.add(createHomePath(villageGround,roadNear));
 environmentGroup.updateMatrixWorld(true);travelWalkMeshes=[];environmentGroup.traverse(o=>{if(o.isMesh&&(o.userData.web_role==='road'||o.material?.userData?.isVillageRoad||o.name==='Shared_home_to_west_gate_3D_path'))travelWalkMeshes.push(o);});travelWalkSurface=createWalkSurface(villageGround,travelWalkMeshes);setTravelGround(travelWalkSurface);installTravelSupport(characterLayer,travelWalkSurface,villageGround);personalityWindow=await createPersonalityWindow(canvas);finishLoadStep('home');

 if(new URLSearchParams(location.search).has('qa')){
  window.__commonHomeAudit=()=>{commonHome.root.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(commonHome.root),pts=[];for(const x of[b.min.x,b.max.x])for(const y of[b.min.y,b.max.y])for(const z of[b.min.z,b.max.z])pts.push(new THREE.Vector3(x,y,z).project(camera).toArray());return{...commonHome.record(),worldBounds:[b.min.toArray(),b.max.toArray()],projected:pts};};
  window.__commonHomePixels=()=>{const out=document.createElement('canvas');out.width=canvas.width;out.height=canvas.height;const c=out.getContext('2d',{willReadFrequently:true});c.drawImage(canvas,0,0);const before=c.getImageData(0,0,out.width,out.height).data,visible=commonHome.root.visible;commonHome.root.visible=false;measuredRender();c.drawImage(canvas,0,0);const after=c.getImageData(0,0,out.width,out.height).data;commonHome.root.visible=visible;measuredRender();let count=0;for(let i=0;i<before.length;i+=4)if(Math.max(Math.abs(before[i]-after[i]),Math.abs(before[i+1]-after[i+1]),Math.abs(before[i+2]-after[i+2]))>3)count++;return count;};
 }
 const buildings=wrapPuzzleBuildings(createStoryBuildings({doors,straw:{reset:resetHouse,seek(t){if(!action)return;running=false;elapsed=t;action.reset().play();evaluateAt(t);action.paused=true;staticHouse.visible=false;collapseHouse.visible=true;},deform:deformStraw},wood,construction,invalidate(){renderer.shadowMap.needsUpdate=true;}}),{swapped:puzzle.swapped,construction});
 await contactPass.compile(scene);
 finishLoadStep('render');const puzzleFx=await createPuzzleEffectsLayer({scene,loadAsset,prepare,ground:villageGround,required:selectedAssets.effects});const comic=createComicEffects(scene,characterLayer,villageGround);finishLoadStep('effects');
 const strategyFx=selectedAssets.ending.startsWith('strategy_')?createStrategyProps(scene,puzzle.swapped,constructionEntries):null;
 if(strategyFx)installStrategyContact(characterLayer,travelWalkSurface);
 return{characters:characterLayer,buildings,commonHome,personalityWindow,effects:Object.assign(Object.create(comic),comic,{apply(st){puzzleFx.apply(st?.puzzleEffect);strategyFx?.apply(st);return comic.apply(st);},reset(){strategyFx?.reset();comic.reset?.();}})};
}
function releaseStoryCameraCompetitors(){drag=null;keys.clear();mode='manual';travel=null;stopCharacterOrbit();for(const id of ['orbit','walk'])$('#'+id).setAttribute('aria-pressed','false');}
storyPlayer=createStoryPlayer({document,prepare:prepareStory,releaseOtherCameras:releaseStoryCameraCompetitors,onReset(){captureTimes=[];running=false;},applyCamera(p){
 camera.position.fromArray(p.position);target.fromArray(p.target);
 if(p.terrainRelative){camera.position.y+=villageGround(camera.position.x,camera.position.z);target.y+=villageGround(target.x,target.z);}
  if(p.groundFocus){const y=(travelWalkSurface??villageGround)(...p.groundFocus);camera.position.y=y+p.position[1];target.y=y+p.target[1];}
 if(camera.userData.baseFov!==p.fov||camera.userData.fitAspect!==(p.fitAspect??1.6)){camera.userData.baseFov=p.fov;camera.userData.fitAspect=p.fitAspect??1.6;resize();}
 if(p.roadFocusWeight){const a=characterLayer.actors.find(a=>a.data.id==='wolf');target.lerp(a.root.position.clone().add(new THREE.Vector3(0,a.data.heightMetres*.55,0)),p.roadFocusWeight);}
 if(p.centeredActor){const actor=characterLayer.actors.find(a=>a.data.id===p.centeredActor);camera.position.y+=(1-p.centerWeight)*villageGround(...p.initialTerrainPosition);target.y+=villageGround(...p.initialTerrainTarget);target.lerp(actor.root.position.clone().add(new THREE.Vector3(0,actor.data.heightMetres*.55,0)),p.centerWeight);}
 camera.lookAt(target);camera.updateMatrixWorld(true);spherical.setFromVector3(camera.position.clone().sub(target));
}});
for(const event of ['pointerdown','wheel','keydown'])canvas.addEventListener(event,()=>storyPlayer.releaseCamera());
for(const el of [$('#view'),$('#orbit'),$('#walk'),...document.querySelectorAll('[data-travel]')])el.addEventListener(el=== $('#view')?'change':'click',()=>storyPlayer.releaseCamera());
for(const id of ['character-load','character-orbit','character-occlusion','character-translate','character-time','collapse','reset'])$('#'+id).addEventListener(id==='character-time'?'input':'click',()=>storyPlayer.stop(),true);

function auditStoryCamera(){
 scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
 const names=['Approved_building_placement_once','Approved_wood_placement_once','Approved_brick_placement_once'];
 const placements=names.map(name=>scene.getObjectByName(name)).filter(Boolean);
 const houses=placements.map(p=>p.children[0]).filter(Boolean);
 const clearance=houses.map(h=>{const b=new THREE.Box3().setFromObject(h);return{name:h.parent.name,inside:b.containsPoint(camera.position),distance:b.distanceToPoint(camera.position),min:b.min.toArray(),max:b.max.toArray()};});
 const rect=canvas.getBoundingClientRect(),caption=$('#story-caption').getBoundingClientRect();
 const actors=(characterLayer?.actors||[]).filter(a=>a.requestedVisible).map(a=>{
  const b=new THREE.Box3().setFromObject(a.card),points=[];
  for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])points.push(new THREE.Vector3(x,y,z).project(camera));
  const screen={left:Math.min(...points.map(p=>(p.x+1)/2)),right:Math.max(...points.map(p=>(p.x+1)/2)),top:Math.min(...points.map(p=>(1-p.y)/2)),bottom:Math.max(...points.map(p=>(1-p.y)/2))};
  const head=a.root.position.clone().add(new THREE.Vector3(0,a.data.heightMetres*.82,0)),distance=camera.position.distanceTo(head),direction=head.clone().sub(camera.position).normalize(),ray=new THREE.Raycaster(camera.position,direction,0,distance-.1);
  const occluded=ray.intersectObjects(placements,true).some(hit=>{const mats=Array.isArray(hit.object.material)?hit.object.material:[hit.object.material];if(mats.some(m=>m?.clippingPlanes?.some(p=>p.distanceToPoint(hit.point)<-1e-5)))return false;let n=hit.object;while(n){if(!n.visible)return false;n=n.parent;}return true;});
  return{id:a.data.id,visible:a.card.visible,screen,screenHeightPixels:(screen.bottom-screen.top)*rect.height,sourceHeightPixels:a.data.frames.find(f=>f.index===a.index)?.heightPixels,elevation:a.status?.elevation,headOccludedByHouse:occluded,cameraDistance:distance};
 });
 return{shot:storyPlayer?.status().cameraShot,camera:camera.position.toArray(),target:target.toArray(),groundClearance:camera.position.y-villageGround(camera.position.x,camera.position.z),houseClearance:clearance,actors,captionTop:(caption.top-rect.top)/rect.height};
}
if(new URLSearchParams(location.search).has('qa'))window.__storyTest={record,actorsOnScreen:()=>characterLayer.actors.map(a=>{const foot=a.root.getWorldPosition(new THREE.Vector3()),head=foot.clone().add(new THREE.Vector3(0,1.32,0));return{id:a.data.id,visible:a.card.visible,foot:foot.project(camera).toArray(),head:head.project(camera).toArray()};}),auditCamera:auditStoryCamera,runStatus:()=>characterLayer.actors.map(a=>({id:a.data.id,visible:a.card.visible,renderedMotion:a.renderedMotion,motion:a.motion,mt:a.motionTime,pos:a.root.position.toArray(),run:a.runStatus})),seek:t=>storyPlayer.seek(t),bindings:()=>import('./story_timeline.mjs').then(m=>m.storyBindings())};

$('#story-inspect').onclick=()=>{document.body.classList.toggle('story-theatre');$('#story-inspect').textContent=document.body.classList.contains('story-theatre')?'検証操作を開く':'物語画面へ';};

if(new URLSearchParams(location.search).has('qa'))Object.assign(window.__storyTest,{
 probeRunView(t,relativeDegrees){
  storyPlayer.seek(t);const a=characterLayer.actors.find(a=>a.motion==='run_two_pose');if(!a)throw Error('No runner');
  const az=a.yaw-relativeDegrees*Math.PI/180;
  camera.position.set(a.root.position.x+Math.sin(az)*6,a.root.position.y+1.7,a.root.position.z+Math.cos(az)*6);
  camera.lookAt(a.root.position.clone().add(new THREE.Vector3(0,.8,0)));camera.updateMatrixWorld(true);characterLayer.update(camera,0);
  return {requestedRelativeDegrees:relativeDegrees,visible:a.card.visible,run:a.runStatus,warnings:characterLayer.viewWarnings(),capabilities:characterLayer.motionCapabilities()};
 },
 async initialize(){qaManualClock=true;await storyPlayer.initialize();},
 async setBranch(id){await storyPlayer.setBranch(id);},
 reset(){storyPlayer.reset();},play(){storyPlayer.play();},pause(){storyPlayer.pause();},
 advance(dt){storyPlayer.tick(dt);},sample(){return storyPlayer.sample();},
 renderAt(t){storyPlayer.seek(t);updateLOD();characterLayer.update(camera,0);storyPlayer.updateEffects(camera);scene.updateMatrixWorld(true);measuredRender();},
 videoFrame(label=''){
  const out=document.createElement('canvas');out.width=960;out.height=690;
  const ctx=out.getContext('2d');ctx.drawImage(canvas,0,0,960,690);
  const current=storyPlayer.sample();if((current.time<OPENING_DURATION+.35||(current.endingPhase&&current.endingPhase!=='base'))&&current.cutOpacity>0){ctx.fillStyle='rgba(38,52,41,'+current.cutOpacity+')';ctx.fillRect(0,0,960,690);}
  const caption=document.getElementById('story-caption').textContent;
  const expected=storyPlayer.sample().branch.caption.text;
  if(caption!==expected)throw Error('Caption and causal projection disagree');
  const wrap=(text,maxWidth)=>{const lines=[];let line='';for(const char of text){if(ctx.measureText(line+char).width>maxWidth&&line){lines.push(line);line=char;}else line+=char;}if(line)lines.push(line);return lines;};
  if(label){ctx.font='600 19px system-ui';ctx.fillStyle='rgba(25,40,29,.9)';ctx.fillRect(18,16,ctx.measureText(label).width+28,38);ctx.fillStyle='#fff';ctx.fillText(label,32,42);}
  let captionLayout=null;if(caption&&!window.__noCaption){ctx.font='600 24px system-ui';const lines=wrap(caption,838),height=lines.length*35+24,top=(current.completion||current.camera?.id==='J78_continuous_transfer')?20:662-height,width=(current.completion||current.camera?.id==='J78_continuous_transfer')?Math.min(880,Math.max(...lines.map(l=>ctx.measureText(l).width))+56):880,left=(960-width)/2;captionLayout={left,top,width,height};ctx.fillStyle='rgba(25,35,26,.94)';ctx.beginPath();ctx.roundRect(left,top,width,height,12);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';lines.forEach((line,i)=>ctx.fillText(line,480,top+35+i*35));}
  const profileWindow=window.__noWindow?null:personalityWindow?.draw(ctx,current);
  const note=document.getElementById('intro-card');if(!note.hidden&&note.textContent){ctx.font='600 18px system-ui';ctx.textAlign='left';const lines=wrap(note.textContent,650),height=lines.length*28+16;ctx.fillStyle='rgba(246,241,223,.94)';ctx.fillRect(18,64,Math.min(700,Math.max(...lines.map(l=>ctx.measureText(l).width))+28),height);ctx.fillStyle='#263b2b';lines.forEach((l,i)=>ctx.fillText(l,32,91+i*28));}
  return {png:out.toDataURL('image/png').split(',')[1],caption,captionLayout,profileWindow,projection:storyPlayer.sample().branch.caption};
 }
});

if(new URLSearchParams(location.search).has('qa'))Object.assign(window.__storyTest,{
 actorCenters(){return characterLayer.actors.map(a=>({id:a.data.id,center:a.root.position.clone().add(new THREE.Vector3(0,a.data.heightMetres*.55,0)).project(camera).toArray()}));},
 actorPixelAudit(id){const a=characterLayer.actors.find(a=>a.data.id===id),out=document.createElement('canvas');out.width=canvas.width;out.height=canvas.height;const c=out.getContext('2d',{willReadFrequently:true});c.drawImage(canvas,0,0);const before=c.getImageData(0,0,out.width,out.height).data;const visible=a.root.visible;a.root.visible=false;measuredRender();c.drawImage(canvas,0,0);const after=c.getImageData(0,0,out.width,out.height).data;a.root.visible=visible;measuredRender();let pixels=0,left=out.width,right=0,top=out.height,bottom=0;for(let i=0;i<before.length;i+=4){if(Math.max(Math.abs(before[i]-after[i]),Math.abs(before[i+1]-after[i+1]),Math.abs(before[i+2]-after[i+2]))>3){pixels++;const x=(i/4)%out.width,y=Math.floor(i/4/out.width);left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}}return{pixels,bounds:pixels?[left,top,right,bottom]:null,terrain:window.__terrainAudit()};}, wolfPixelAudit(){const a=characterLayer.actors.find(a=>a.data.id==='wolf'),out=document.createElement('canvas');out.width=canvas.width;out.height=canvas.height;const c=out.getContext('2d',{willReadFrequently:true});c.drawImage(canvas,0,0);const before=c.getImageData(0,0,out.width,out.height).data;const visible=a.root.visible;a.root.visible=false;measuredRender();c.drawImage(canvas,0,0);const after=c.getImageData(0,0,out.width,out.height).data;a.root.visible=visible;measuredRender();let pixels=0,left=out.width,right=0,top=out.height,bottom=0;for(let i=0;i<before.length;i+=4){if(Math.max(Math.abs(before[i]-after[i]),Math.abs(before[i+1]-after[i+1]),Math.abs(before[i+2]-after[i+2]))>3){pixels++;const x=(i/4)%out.width,y=Math.floor(i/4/out.width);left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}}return{pixels,bounds:pixels?[left,top,right,bottom]:null,terrain:window.__terrainAudit()};},
 exportContactGeometry(){
  if(!qaContactTerrain)throw Error('Actual deformed terrain unavailable');scene.updateMatrixWorld(true);qaContactTerrain.updateMatrixWorld(true);
  const triangles=o=>{const p=o.geometry.attributes.position,ix=o.geometry.index,out=[],v=new THREE.Vector3();for(let k=0;k<(ix?ix.count:p.count);k+=3){const t=[0,1,2].map(j=>v.fromBufferAttribute(p,ix?ix.getX(k+j):k+j).applyMatrix4(o.matrixWorld).toArray());if(Math.min(...t.map(v=>v[0]))>8||Math.max(...t.map(v=>v[0]))< -34||Math.min(...t.map(v=>v[2]))>1||Math.max(...t.map(v=>v[2]))< -28)continue;out.push(t);}return out;};
  const fence=[];environmentGroup.traverse(o=>{if(o.isMesh&&o.userData.outerFence)fence.push(...triangles(o));});
  return {terrain:triangles(qaContactTerrain),fence,checks:villageAudit,source:'Actual deformed triangle terrain and actual outerFence mesh after village construction'};
 },
 contactView(kind,t,view){
  storyPlayer.seek((kind==='Wood'?90.3:72.3)+t/2);const c=kind==='Wood'?[-24,-.14,-21]:[2.1,0,-10];
  const pos=view==='rear'?[c[0]-7,c[1]+1.5,c[2]-7]:view==='top'?[c[0],c[1]+16,c[2]+.01]:[c[0]+8,c[1]+4,c[2]+8];
  camera.position.fromArray(pos);camera.lookAt(new THREE.Vector3(...c).add(new THREE.Vector3(0,.5,0)));camera.userData.baseFov=50;camera.fov=50;camera.updateProjectionMatrix();camera.updateMatrixWorld(true);characterLayer.update(camera,0);scene.updateMatrixWorld(true);measuredRender();
 }
});

if(new URLSearchParams(location.search).has('qa'))Object.assign(window.__storyTest,{
 houseMotion(){scene.updateMatrixWorld(true);const box=o=>{const b=new THREE.Box3().setFromObject(o);return{min:b.min.toArray(),max:b.max.toArray(),size:b.getSize(new THREE.Vector3()).toArray(),center:b.getCenter(new THREE.Vector3()).toArray()};};const nodes=[...new Set(action.getClip().tracks.map(t=>THREE.PropertyBinding.findNode(collapseHouse,THREE.PropertyBinding.parseTrackName(t.name).nodeName)).filter(Boolean))],average=nodes.reduce((v,n)=>v.add(n.getWorldPosition(new THREE.Vector3())),new THREE.Vector3()).multiplyScalar(1/nodes.length);return{straw:{singleDoor:collapseHouse.userData.singleDoorV5??null,secondLeafNodePresent:!!collapseHouse.getObjectByName('door_leaf_right'),staticVisible:staticHouse.visible,collapseVisible:collapseHouse.visible,animatedPivotCentroid:average.toArray(),animatedCount:nodes.length,intact:box(staticHouse),moving:box(collapseHouse),departure:strawDeparture?.record?.()??null}};},
 groundProbe(){scene.updateMatrixWorld(true);return characterLayer.actors.filter(a=>a.card.visible).map(a=>{const x=a.root.position.x,z=a.root.position.z,ray=new THREE.Raycaster(new THREE.Vector3(x,100,z),new THREE.Vector3(0,-1,0));const hits=ray.intersectObject(qaContactTerrain,false),p=a.card.geometry.attributes.position,bob=Math.min(...Array.from({length:p.count},(_,i)=>p.getY(i)));return {id:a.data.id,motion:a.motion,position:a.root.position.toArray(),groundFunction:villageGround(x,z),actualTerrain:hits[0]?.point.y,rootAboveGround:a.root.position.y-villageGround(x,z),cardBottomAboveRoot:bob,shadowVisible:a.shadow.visible};});},
 groundView(t){this.renderAt(t);const a=characterLayer.actors.find(a=>a.data.id==='pig_straw'),az=a.yaw-Math.PI/4;camera.position.set(a.root.position.x+Math.sin(az)*4,a.root.position.y+.8,a.root.position.z+Math.cos(az)*4);camera.lookAt(a.root.position.clone().add(new THREE.Vector3(0,.5,0)));camera.updateMatrixWorld(true);characterLayer.update(camera,0);scene.updateMatrixWorld(true);measuredRender();}
});

if(new URLSearchParams(location.search).has('qa'))Object.assign(window.__storyTest,{
 paperAt(profile,t){window.__paperStage.set(profile,t);this.renderAt(72.3+t);if(t>=1&&t<2.6){const a=characterLayer.actors.find(a=>a.data.id==='pig_straw');camera.position.set(a.root.position.x+.6,villageGround(a.root.position.x,a.root.position.z)+1.95,a.root.position.z+4.1);camera.lookAt(a.root.position.clone().add(new THREE.Vector3(0,.85,0)));camera.fov=43;camera.updateProjectionMatrix();camera.updateMatrixWorld(true);characterLayer.update(camera,0);scene.updateMatrixWorld(true);measuredRender();}return window.__paperStage.status();},
 paperStatus(){return window.__paperStage.status();}
});

if(new URLSearchParams(location.search).has('qa'))Object.assign(window.__storyTest,{
 paperRunClose(t,tempo=1){window.__paperStage.setTempo(tempo);this.paperAt('calm',3.6+t);const a=characterLayer.actors.find(a=>a.data.id==='pig_straw'),p=a.root.position;camera.position.set(p.x+Math.sin(a.yaw-Math.PI/4)*4.2,p.y+1.65,p.z+Math.cos(a.yaw-Math.PI/4)*4.2);camera.lookAt(new THREE.Vector3(p.x,p.y+.68,p.z));camera.fov=40;camera.updateProjectionMatrix();camera.updateMatrixWorld(true);characterLayer.update(camera,0);scene.updateMatrixWorld(true);measuredRender();return window.__paperStage.status();},
 paperFit(t,standing=false){window.__paperStage.set('calm',3.6);const poses=characterLayer.actors.map((a,i)=>({id:a.data.id,x:-2+i*2,z:6,yOffset:0,yaw:Math.PI/4,visible:a.data.id.startsWith('pig_'),motion:standing?'idle':'paper_run',motionTime:t*2}));characterLayer.applyStory(poses,75.9);camera.position.set(0,1.85,13);camera.lookAt(new THREE.Vector3(0,.85,6));camera.fov=45;camera.updateProjectionMatrix();camera.updateMatrixWorld(true);characterLayer.update(camera,0);scene.updateMatrixWorld(true);measuredRender();return window.__paperStage.status();}
});

if(new URLSearchParams(location.search).has('qa'))Object.assign(window.__storyTest,{storyStatus:()=>storyPlayer.status(),revisionAudit(){scene.updateMatrixWorld(true);const boxes={};for(const [id,name]of [['straw','Approved_building_placement_once'],['wood','Approved_wood_placement_once'],['brick','Approved_brick_placement_once']]){const o=scene.getObjectByName(name)?.children[0];if(!o)continue;const b=new THREE.Box3().setFromObject(o),points=[];for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])points.push(new THREE.Vector3(x,y,z).project(camera));boxes[id]={left:Math.min(...points.map(p=>(p.x+1)/2)),right:Math.max(...points.map(p=>(p.x+1)/2)),top:Math.min(...points.map(p=>(1-p.y)/2)),bottom:Math.max(...points.map(p=>(1-p.y)/2)),matrix:o.matrix.toArray(),worldBounds:{min:b.min.toArray(),max:b.max.toArray()}};}return{boxes};}});

if(new URLSearchParams(location.search).has("qa"))window.__storyTest.roadAudit=()=>{const roadZ=x=>x>33?4.3-.018*31**2-(x-33)*.73:4.3-.018*(x-2)**2;return{camera:camera.position.toArray(),target:target.toArray(),fov:camera.fov,points:[22,26,33,40,55,75,95,130,180,240].map(x=>{const z=roadZ(x),y=villageGround(x,z)+.026,p=new THREE.Vector3(x,y,z).project(camera);return{x,y,z,screen:p.toArray()};}),wolf:characterLayer.actors.find(a=>a.data.id==="wolf").root.position.toArray()};};

if(new URLSearchParams(location.search).has('qa'))Object.assign(window.__storyTest,{
 sceneryView(position,look,fov=46){camera.position.fromArray(position);target.fromArray(look);camera.fov=fov;camera.updateProjectionMatrix();camera.lookAt(target);camera.updateMatrixWorld(true);updateLOD();characterLayer.update(camera,0);scene.updateMatrixWorld(true);renderer.shadowMap.needsUpdate=true;measuredRender();return this.videoFrame('');},
 sceneryGeometry(){const rows=[];sourceEnvironment.updateMatrixWorld(true);sourceEnvironment.traverse(o=>{if(!o.isMesh)return;const n=o.name.replaceAll('_',' ');if(/Hand laid stone|earthen|maintained grass/i.test(n)||['terrain','road'].includes(o.userData.web_role)){const g=o.geometry.clone().applyMatrix4(o.matrixWorld);rows.push({name:o.name,role:o.userData.web_role,positions:Array.from(g.attributes.position.array),indices:g.index?Array.from(g.index.array):null});}});return{meshes:rows,parts:window.__constructionProbe(),audit:villageAudit};},
 sceneryState(){return{camera:camera.position.toArray(),target:target.toArray(),fov:camera.fov,actors:characterLayer.actors.map(a=>({id:a.data.id,position:a.root.position.toArray(),yaw:a.yaw,motion:a.motion,visible:a.card.visible,run:a.runStatus})),sample:storyPlayer.sample(),background:window.__sceneryAudit?.()};}
});


if(new URLSearchParams(location.search).has('qa'))window.__storyTest.sourceNodes=()=>{const rows=[];sourceEnvironment.traverse(o=>{if(o.isMesh){const b=new THREE.Box3().setFromObject(o);rows.push({name:o.name,role:o.userData.web_role,mat:Array.isArray(o.material)?o.material.map(m=>m.name):o.material.name,vertices:o.geometry.attributes.position.count,bounds:[b.min.toArray(),b.max.toArray()]});}});return rows;};


if(new URLSearchParams(location.search).has('qa')){
 const pixels=new WeakMap();
 function opaqueAt(m,u,v){const img=m.map?.image;if(!img)return true;let data=pixels.get(img);if(!data){const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);data={w:c.width,h:c.height,p:ctx.getImageData(0,0,c.width,c.height).data};pixels.set(img,data);}const x=Math.max(0,Math.min(data.w-1,Math.floor(u*data.w))),y=Math.max(0,Math.min(data.h-1,Math.floor((1-v)*data.h)));return data.p[(y*data.w+x)*4+3]>127;}
 window.__storyTest.feetAudit=()=>characterLayer.actors.filter(a=>a.requestedVisible&&/walk|run/.test(a.motion)).map(a=>{
 const points=[],root=a.cosplayRoot||a.card,world=new THREE.Vector3(),base=a.root.position.y;
 root.updateWorldMatrix(true,true);root.traverse(o=>{if(!o.isMesh||!o.layers.test(camera.layers))return;let n=o;while(n&&n!==a.root){if(!n.visible)return;n=n.parent;}const g=o.geometry,p=g.attributes.position,u=g.attributes.uv,m=o.material;if(Array.isArray(m))return;const ix=g.index?.array||Uint32Array.from({length:p.count},(_,i)=>i),res=p.count<20?18:1;
 for(let k=0;k<ix.length;k+=3)for(let i=0;i<=res;i++)for(let j=0;j<=res-i;j++){const b=i/res,c=j/res,aa=1-b-c,ids=[ix[k],ix[k+1],ix[k+2]],weights=[aa,b,c];world.set(0,0,0);let tu=0,tv=0;for(let z=0;z<3;z++){world.x+=p.getX(ids[z])*weights[z];world.y+=p.getY(ids[z])*weights[z];world.z+=p.getZ(ids[z])*weights[z];if(u){tu+=u.getX(ids[z])*weights[z];tv+=u.getY(ids[z])*weights[z];}}world.applyMatrix4(o.matrixWorld);if(world.y<base-.08||world.y>base+.42)continue;if(!opaqueAt(m,tu,tv))continue;points.push([world.x,world.y,world.z]);}
 });
 return{id:a.data.id,motion:a.motion,root:a.root.position.toArray(),visible:root.visible,points,maxRadius:points.reduce((r,p)=>Math.max(r,Math.hypot(p[0]-a.root.position.x,p[2]-a.root.position.z)),0)};
 });
 window.__storyTest.introBounds=()=>characterLayer.actors.filter(a=>a.requestedVisible).map(a=>{
 const points=[],root=a.cosplayRoot||a.card,world=new THREE.Vector3(),base=a.root.position.y;
 root.updateWorldMatrix(true,true);root.traverse(o=>{if(!o.isMesh||!o.layers.test(camera.layers))return;let n=o;while(n&&n!==a.root){if(!n.visible)return;n=n.parent;}const g=o.geometry,p=g.attributes.position,u=g.attributes.uv,m=o.material;if(Array.isArray(m))return;const ix=g.index?.array||Uint32Array.from({length:p.count},(_,i)=>i),res=p.count<20?18:1;
 for(let k=0;k<ix.length;k+=3)for(let i=0;i<=res;i++)for(let j=0;j<=res-i;j++){const b=i/res,c=j/res,aa=1-b-c,ids=[ix[k],ix[k+1],ix[k+2]],weights=[aa,b,c];world.set(0,0,0);let tu=0,tv=0;for(let z=0;z<3;z++){world.x+=p.getX(ids[z])*weights[z];world.y+=p.getY(ids[z])*weights[z];world.z+=p.getZ(ids[z])*weights[z];if(u){tu+=u.getX(ids[z])*weights[z];tv+=u.getY(ids[z])*weights[z];}}world.applyMatrix4(o.matrixWorld);if(!opaqueAt(m,tu,tv))continue;world.project(camera);points.push([(world.x+1)*480,(1-world.y)*345,world.z]);}
 });
 return{id:a.data.id,motion:a.motion,root:a.root.position.toArray(),visible:root.visible,bounds:points.length?[Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1])),Math.max(...points.map(p=>p[0])),Math.max(...points.map(p=>p[1]))]:null};
 });
}


if(new URLSearchParams(location.search).has('qa'))window.__storyTest.introContactAudit=()=>window.__storyTest.feetAudit().map(a=>({...a,points:undefined,minGroundClearance:Math.min(...a.points.map(p=>p[1]-villageGround(p[0],p[2])))}));

if(new URLSearchParams(location.search).has('qa'))window.__storyTest.hillAudit=()=>{
 const state=storyPlayer.sample(),seq=state.actors.find(a=>a.id==='wolf')?.hillSequence;if(!seq)return{...storyHill.info,sequence:null};
 const a=characterLayer.actors.find(a=>a.data.id==='wolf'),pos=a.root.position.clone(),ray=new THREE.Raycaster(new THREE.Vector3(pos.x,100,pos.z),new THREE.Vector3(0,-1,0));storyHill.mesh.updateMatrixWorld(true);
 const groundHit=ray.intersectObject(storyHill.mesh,false)[0],s=storyPlayer.sample(),head=pos.clone().add(new THREE.Vector3(0,a.data.heightMetres*.9,0)),sight=new THREE.Raycaster(camera.position,head.clone().sub(camera.position).normalize()),block=sight.intersectObject(storyHill.mesh,false)[0];
 return{...storyHill.info,root:pos.toArray(),ground:villageGround(pos.x,pos.z),actualHill:groundHit?.point.y,actualBase:ray.intersectObject(qaContactTerrain,false)[0]?.point.y,head:head.project(camera).toArray(),foot:pos.clone().project(camera).toArray(),visible:a.requestedVisible,scale:a.root.scale.toArray(),headBlockedByHill:!!block&&block.distance<camera.position.distanceTo(a.root.position.clone().add(new THREE.Vector3(0,a.data.heightMetres*.9,0))),hop:s.hillEscape?.jump??0,sequence:s.actors.find(a=>a.id==='wolf')?.hillSequence??null,opacity:(a.root.getObjectByName('J114_discrete_pose_wolf')?.children[0]??a.card).material.opacity};
};
if(new URLSearchParams(location.search).has('qa'))window.__storyTest.hillView=(index)=>{
 const center=new THREE.Vector3(62,storyHill.ground(62,-34)-3,-34),angles=[0,Math.PI/2,Math.PI,3*Math.PI/2],angle=angles[index%4];camera.position.copy(center).add(new THREE.Vector3(Math.sin(angle)*39,index===3?30:8,Math.cos(angle)*39));camera.lookAt(center);camera.fov=49;camera.updateProjectionMatrix();camera.updateMatrixWorld(true);characterLayer.update(camera,0);updateLOD();scene.updateMatrixWorld(true);measuredRender();
};

if(new URLSearchParams(location.search).has('qa'))window.__storyTest.travelSurfaceAudit=()=>characterLayer.actors.filter(a=>a.requestedVisible&&a.data.id!=='wolf').map(a=>({...inspectTravelActor(a,camera,travelWalkSurface||villageGround,[qaContactTerrain,...travelWalkMeshes]),baseTerrain:villageGround(a.root.position.x,a.root.position.z),walkSurface:travelWalkSurface?.(a.root.position.x,a.root.position.z),walkTriangles:travelWalkSurface?.triangles}));

window.__prepareStory=()=>storyPlayer?.initialize?.();

window.__prepareIntro=()=>storyPlayer.prepareIntro();window.__unlockStoryAudio=()=>storyPlayer.unlockAudio();
