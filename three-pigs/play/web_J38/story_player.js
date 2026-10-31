import {finishLoadStep,failLoading} from './story_loading_progress.mjs';
import {createStoryAudio} from './story_audio.mjs';
import {STORY_AUDIO_CONFIG} from './story_audio_config.mjs';
import {doorAudioPatches} from './door_audio.mjs';
import {siteHouses} from './puzzle_houses.mjs';
import {getCast} from './personality_story.mjs';
import {SCENES,STORY_DURATION,sampleStory,createStoryClock,selectBranch,decideEnding} from './story_timeline.mjs';
export function createStoryPlayer({document,prepare,applyCamera,releaseOtherCameras,onReset}){
 const $=id=>document.getElementById(id),clock=createStoryClock(),audio=createStoryAudio({config:{...STORY_AUDIO_CONFIG,patches:doorAudioPatches(siteHouses(getCast())),bedAsset:decideEnding().id.startsWith('karakuri_')?'./audio/karakuri_bed.m4a':STORY_AUDIO_CONFIG.bedAsset},document});let resources=null,pending=null,active=false,director=true,lastText=null,error='';
 selectBranch(new URLSearchParams(document.location.search).get('branch')??'normal');
 function refreshScenes(){ $('story-scene').replaceChildren();for(const s of SCENES){const o=document.createElement('option');o.value=s.at;o.textContent=s.title;$('story-scene').append(o);}$('story-time').max=STORY_DURATION;const title=sampleStory(0).branch.id==='peace'?'三びきのこぶた — 話して、分け合って':'三びきのこぶた — 低い倒壊と走行';document.querySelector('header h1').textContent=title;document.title=title;document.querySelector('#story-controls strong').textContent=`三びきのこぶた · ${STORY_DURATION}秒`;}
 refreshScenes();
 function status(){const sampled=sampleStory(clock.time);return{ready:!!resources,active,time:clock.time,duration:STORY_DURATION,branchId:sampled.branch.id,captionProjection:sampled.branch.caption,ended:sampled.ended,playing:clock.playing,director,wind:resources?.effects?.record?.()??null,audio:audio.status(),cameraShot:sampled.camera.id,buildings:resources?.buildings.capabilities()??{},houseState:resources?.buildings.record()??null,motion:resources?.characters.motionCapabilities?.()??{},error,visualValidation:'see saved offscreen validation',desktopValidation:false,mobilePerformance:'unmeasured'};}
 function render(){if(!resources||!active)return;if(document.body.classList.contains('story-theatre'))director=true;const state=sampleStory(clock.time);resources.characters.adaptCostumeState?.(state);audio.sync(state.audioMap?.t??clock.time,clock.playing&&state.branch.id==='normal',state.audioMap?.src,clock.time);resources.characters.costumeSceneState=state;resources.characters.applyStory(state.actors,state.animationTime??clock.time);resources.buildings.apply(state.houses);resources.buildings.timeline?.(state);resources.commonHome?.apply(state);resources.personalityWindow?.apply(state);resources.effects?.apply({...state,time:state.effectTime??state.animationTime??state.time});
  if(director)applyCamera(state.camera);
  $('story-caption').hidden=false;$('story-caption').style.top=(state.completion||state.camera?.id==='J78_continuous_transfer')?'20px':'';$('story-caption').style.bottom=(state.completion||state.camera?.id==='J78_continuous_transfer')?'auto':'';$('story-caption').style.width=(state.completion||state.camera?.id==='J78_continuous_transfer')?'fit-content':'';$('story-caption').style.maxWidth=(state.completion||state.camera?.id==='J78_continuous_transfer')?'88%':'';if(lastText!==state.scene.caption||$('story-caption').textContent!==state.scene.caption){$('story-caption').textContent=state.scene.caption;lastText=state.scene.caption;}
  $('story-time').value=clock.time;$('story-scene').value=state.scene.at;
  $('story-play').textContent=clock.playing?'再生中':state.ended?'もう一度再生':'再生';$('story-play').disabled=clock.playing;
  $('story-pause').disabled=!clock.playing;
  const caps=resources.buildings.capabilities(),motion=resources.characters.motionCapabilities?.();
  const pendingArt=motion?.sets?.some(s=>s.id==='wolf'&&s.motion==='blow')?'':'・吹く画像の取込待ち';
  const unsupported=resources.characters.viewWarnings?.()||[];
  $('story-state').textContent=`${state.scene.title} ${clock.time.toFixed(1)} / ${STORY_DURATION}秒${state.ended?'・おしまい':''}｜${director?'演出カメラ':'自由カメラ'}${pendingArt}${caps.wood?'':'・木の崩壊待ち'}${state.schematicChimney?'・煙突は場面転換で表現':''}${unsupported.length?'｜この角度の画像は未対応：'+unsupported.join('・'):''}`;
  const intro=state.intro;const banner=$('intro-card');banner.hidden=!intro&&!state.drama?.note;banner.textContent=state.drama?.note|| (intro?.subject?intro.label+' — '+intro.oneLine:intro?.checking?'同じ場所を、もう一度。':intro?.cooperating?((state.sourceTime??state.time)<32.3?'次男が到着。ふたりで分担。':'分担すると、工事が進みはじめた。'):intro?.construction?'建設：簡易演出（部位ごとの組み立て）':'');
  $('story-effect').textContent=state.effects.find(e=>e.effect==='comic_plop_caption')?.text||'';
  $('story-cut').style.opacity=state.cutOpacity;
 }
 async function ensure(){if(resources)return resources;if(pending)return pending;
  $('story-play').disabled=true;$('story-state').textContent='物語の画像と建物を準備しています…';error='';
  pending=(async()=>{try{resources=await prepare();for(const id of ['story-reset','story-scene','story-time','story-camera'])$(id).disabled=false;return resources;}
   catch(e){failLoading();error=String(e);$('story-state').textContent='物語の準備に失敗しました。村は保持しています。再生で再試行できます。';throw e;}
   finally{pending=null;$('story-play').disabled=false;}})();return pending;
 }
 $('story-play').onclick=async()=>{const audioUnlock=audio.unlock();try{await ensure();await audioUnlock;await audio.prepare();finishLoadStep('audio');releaseOtherCameras();active=true;if(clock.time>=STORY_DURATION){resources.buildings.reset();clock.reset();}clock.play();render();}catch(e){failLoading();console.error(e);}};
 $('story-pause').onclick=()=>{clock.pause();render();};
 function reset(){lastText=null;clock.reset();resources?.buildings.reset();resources?.effects?.reset();onReset?.();active=!!resources;render();}
 $('story-reset').onclick=reset;
 function seek(t){clock.pause();clock.seek(t);active=true;releaseOtherCameras();render();}
 $('story-time').oninput=e=>seek(Number(e.target.value));$('story-scene').onchange=e=>seek(Number(e.target.value));
 $('story-camera').onclick=()=>{director=!director;if(director)releaseOtherCameras();$('story-camera').setAttribute('aria-pressed',String(director));$('story-camera').textContent=director?'自由カメラへ':'演出カメラへ';render();};
 document.addEventListener('visibilitychange',()=>{if(document.hidden){clock.pause();render();}});
 return{
  status,
  unlockAudio(){return audio.unlock();},
  async prepareIntro(){await ensure();await audio.prepare();finishLoadStep('audio');},
  async initialize(){await ensure();releaseOtherCameras();active=true;reset();},
  async setBranch(id){selectBranch(id);await ensure();refreshScenes();director=true;lastText=null;reset();},
  reset,
  play(){active=true;clock.play();render();},
  pause(){clock.pause();render();},
  sample(){return sampleStory(clock.time);},
  updateEffects(camera){if(active)resources?.effects?.updateVisual?.(camera);},
  tick(dt){if(active&&resources){clock.tick(dt);render();}},
  releaseCamera(){if(document.body.classList.contains('story-theatre'))return;director=false;$('story-camera').setAttribute('aria-pressed','false');$('story-camera').textContent='演出カメラへ';},
  stop(){audio.stop();clock.reset();active=false;resources?.buildings.reset();resources?.effects?.reset();$('story-caption').hidden=true;$('story-cut').style.opacity=0;$('story-effect').textContent='';lastText='';$('intro-card').hidden=true;$('story-play').textContent='再生';$('story-play').disabled=!!pending;$('story-pause').disabled=true;if(resources){$('story-time').value=0;$('story-state').textContent='物語を停止しました。先頭の家の状態に戻っています。';}},
  seek
 };
}
