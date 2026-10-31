import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {createStoryClock,STORY_DURATION} from '../three-pigs/play/web_J38/story_timeline.mjs';
import {createStoryAudio} from '../three-pigs/play/web_J38/story_audio.mjs';
let seconds=0;
const clock=createStoryClock(()=>seconds);
clock.play();
for(const gap of [.016,.35,1,3,.016]){seconds+=gap;clock.tick();assert.ok(Math.abs(clock.time-seconds)<1e-8);}
clock.pause();const paused=clock.time;seconds+=60;clock.tick();assert.equal(clock.time,paused);
clock.play();seconds+=.02;clock.tick();assert.ok(Math.abs(clock.time-paused-.02)<1e-8);
clock.seek(7);seconds+=.4;clock.tick();assert.ok(Math.abs(clock.time-7.4)<1e-8);
clock.reset();clock.play();clock.tick(3);assert.equal(clock.time,3);
clock.tick(Infinity);clock.tick(-1);assert.equal(clock.time,3);
clock.seek(STORY_DURATION-.1);clock.tick(1);assert.equal(clock.time,STORY_DURATION);assert.equal(clock.playing,false);
clock.play();assert.equal(clock.time,0);
class FakeAudioContext{
 constructor(){this.currentTime=0;this.state='running';this.destination={};this.sources=[];FakeAudioContext.instance=this;}
 resume(){return Promise.resolve();}
 createGain(){return{gain:{value:0,setTargetAtTime(){}},connect(){}};}
 decodeAudioData(){return Promise.resolve({duration:240});}
 createBufferSource(){const source={connect(){},disconnect(){},start(_,offset){this.offset=offset;},stop(){this.stopped=true;}};this.sources.push(source);return source;}
}
const options={config:{asset:'audio.m4a',bedAsset:'bed.m4a'},AudioContextClass:FakeAudioContext,baseURL:'https://example.test/',fetchAudio:async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(0)})};
const audio=createStoryAudio(options);await audio.unlock();await audio.prepare();
const context=FakeAudioContext.instance;
audio.sync(10,true,'base',10);
for(const gap of [.016,.35,1,3,.016]){context.currentTime+=gap;audio.sync(10+context.currentTime,true,'base',10+context.currentTime);}
assert.equal(context.sources.length,1,'A delayed frame must not restart continuous audio');
context.currentTime+=.4;audio.sync(14.4,true,'base',14.4);
assert.equal(context.sources.length,1,'Scheduling jitter must not rewind audio');
audio.sync(14.4,false,'base',14.4);assert.equal(audio.status().playing,false);
audio.sync(14.4,true,'base',14.4);assert.equal(context.sources.length,2);
audio.sync(2,true,'bed',131);assert.equal(context.sources.length,3);
audio.sync(3,true,'bed',132);assert.equal(context.sources.length,3);
audio.sync(239.9,true,'bed',368.9);assert.equal(context.sources.length,3);
audio.sync(240.1,true,'bed',369.1);assert.equal(context.sources.length,3);assert.equal(context.sources.at(-1).loop,true);
audio.sync(180,true,'base',375);assert.equal(context.sources.length,4);
audio.sync(190,true,'base',376);assert.equal(context.sources.length,5,'A changed source mapping must seek');
audio.sync(240,true,'base',426);assert.equal(audio.status().playing,false);
// Reproduce the reported coupling on the previous released implementation.
const oldTimeline=execFileSync('git',['show','422c36a:three-pigs/play/web_J38/story_timeline.mjs'],{encoding:'utf8'});
const body=oldTimeline.slice(oldTimeline.indexOf('export function createStoryClock()'),oldTimeline.lastIndexOf("selectBranch('normal');")).replace('export ','');
const sandbox={STORY_DURATION:285,sampleStory:()=>({})};vm.runInNewContext(body+';this.clock=createStoryClock();',sandbox);
const oldSource=execFileSync('git',['show','422c36a:three-pigs/play/web_J38/story_audio.mjs'],{encoding:'utf8'});
const oldModule=await import('data:text/javascript;base64,'+Buffer.from(oldSource).toString('base64'));
const oldAudio=oldModule.createStoryAudio(options);await oldAudio.unlock();await oldAudio.prepare();
const oldContext=FakeAudioContext.instance;sandbox.clock.play();oldAudio.sync(0,true);
for(const gap of [.35,1,3]){oldContext.currentTime+=gap;sandbox.clock.tick(Math.min(gap,.1));oldAudio.sync(sandbox.clock.time,true);}
assert.equal(oldContext.sources.length,4);assert.ok(Math.abs(sandbox.clock.time-.3)<1e-8);
const viewer=fs.readFileSync(new URL('../three-pigs/play/web_J38/viewer.js',import.meta.url),'utf8');
assert.ok(viewer.includes('storyPlayer?.tick();'));assert.ok(!viewer.includes('storyPlayer?.tick(dt)'));
let canvasResizes=0,passResizes=0;
const resizeContext={stage:{clientWidth:390,clientHeight:844},canvas:{width:390,height:844},renderer:{setSize(){canvasResizes++;}},contactPass:{resize(){passResizes++;}},camera:{userData:{},updateProjectionMatrix(){}},setCompletionAspect(){},Math,THREE:{MathUtils:{radToDeg:r=>r*180/Math.PI,degToRad:d=>d*Math.PI/180}}};
const resizeCode=viewer.slice(viewer.indexOf('let renderWidth=0'),viewer.indexOf('new ResizeObserver(resize)'));
vm.runInNewContext(resizeCode,resizeContext);
for(let i=0;i<120;i++){resizeContext.camera.userData.baseFov=28+i*.01;resizeContext.resize();}
assert.equal(canvasResizes,1);assert.equal(passResizes,1);
resizeContext.stage.clientWidth=844;resizeContext.stage.clientHeight=390;resizeContext.resize();assert.equal(canvasResizes,2);assert.equal(passResizes,2);
console.log(JSON.stringify({passed:true,previous:{wallSeconds:4.35,storySeconds:sandbox.clock.time,audioRestarts:oldContext.sources.length-1},fixed:{delayedFrameAudioRestarts:0,clockTracksWallTime:true,pauseResumeSeekEnd:true,sourceSwitchAndLoop:true}}));
