import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../three-pigs/play/web_J38/viewer.js',import.meta.url),'utf8');
const block=source.slice(source.indexOf('let characterTask=null;'),source.indexOf("$('#character-orbit').onclick"));
const stages=['createCharacterLayer','installVillainFaces','installPaperTheatre','installPerformerActions','installStrawJoy','installWolfEscape','installDoorHost','installAnimalReactions'];
for(const failedStage of stages){
 let fail=true,created=0,removed=0,disposed=0;
 const nodes=new Map();const $=selector=>{const id=selector.replace(/^#/,'');if(!nodes.has(id))nodes.set(id,{disabled:false});return nodes.get(id);};
 const context={$,console,scene:{},villageGround(){},finishLoadStep(){},stopCharacterOrbit(){},setView(){},installStrawWorkshopPreview(){},installEncounterPerformers(){},window:{},document:{querySelectorAll(){return[];},getElementById(){return{remove(){}};}}};
 for(const stage of stages)context[stage]=async layer=>{
  if(stage===failedStage&&fail)throw new Error('Injected '+stage);
  if(stage==='createCharacterLayer'){created++;return{layout(){},group:{visible:true,removeFromParent(){removed++;},traverse(fn){fn({geometry:{dispose(){disposed++;}}});}}};}
  return layer;
 };
 vm.runInNewContext('let characterLayer=null,characterLoading=false,villageReady=true;'+block+';globalThis.getLayer=()=>characterLayer;',context);
 await assert.rejects($('character-load').onclick(),/Injected/);
 assert.equal(context.getLayer(),null,failedStage+' must not publish partial characters');
 assert.equal($('character-load').disabled,false);
 assert.equal(removed,failedStage==='createCharacterLayer'?0:1);
 assert.equal(disposed,removed);
 fail=false;
 await Promise.all([$('character-load').onclick(),$('character-load').onclick()]);
 assert.ok(context.getLayer());
 assert.equal(created,failedStage==='createCharacterLayer'?1:2,'Concurrent retry must share initialization');
 assert.equal(context.getLayer().group.visible,true);
}
const guard=source.slice(source.indexOf('const fixedStoryCamera='),source.indexOf('let drag=null;'));
for(const theatre of [true,false]){
 const listeners=[];
 vm.runInNewContext(guard,{document:{body:{classList:{contains(){return theatre;}}}},canvas:{setAttribute(){},addEventListener(type,fn,options){listeners.push({type,fn,options});}}});
 assert.equal(listeners.length,theatre?9:0);
 for(const {fn,options} of listeners){let stopped=0,prevented=0;fn({cancelable:true,stopImmediatePropagation(){stopped++;},preventDefault(){prevented++;}});assert.equal(stopped,1);assert.equal(prevented,1);assert.equal(options.capture,true);}
}
console.log('PASS: all eight initialization failure points discard partial characters; retry is shared; nine camera inputs blocked only in theatre');
