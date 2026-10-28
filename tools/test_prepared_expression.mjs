import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../three-pigs/play/web_J38/villain_faces.js',import.meta.url),'utf8').replace(/import \* as THREE from 'three';/,'').replaceAll('export ','');
function setup(){
 let callbacks,timer,delay,cleared=0,loads=0;
 const context={window:{},THREE:{TextureLoader:class{load(url,ok,progress,fail){loads++;callbacks={url,ok,fail};}},SRGBColorSpace:'srgb',LinearFilter:'linear'},setTimeout(fn,ms){timer=fn;delay=ms;return 1;},clearTimeout(){cleared++;}};
 vm.createContext(context);vm.runInContext(source,context);
 return {run:()=>context.villainTexture({image:{width:1774,height:887}},'directions'),get callbacks(){return callbacks;},timeout:()=>timer(),get delay(){return delay;},get cleared(){return cleared;},get loads(){return loads;}};
}
const texture=(w=1774)=>({image:{width:w,height:887},userData:{},disposed:0,dispose(){this.disposed++;}});
{
 const s=setup(),p=s.run(),t=texture();s.callbacks.ok(t);
 assert.equal(await p,t);assert.equal(s.cleared,1);assert.equal(t.userData.villain.prepared,true);assert.equal(t.generateMipmaps,false);
}
{
 const s=setup(),p=s.run();assert.equal(s.delay,30000);const rejected=assert.rejects(p,/timed out/);s.timeout();await rejected;
 const late=texture();s.callbacks.ok(late);assert.equal(late.disposed,1);
 const retry=s.run(),t=texture();s.callbacks.ok(t);assert.equal(await retry,t);assert.equal(s.loads,2);
}
{
 const s=setup(),p=s.run();const rejected=assert.rejects(p,/could not load/);s.callbacks.fail({});await rejected;assert.equal(s.cleared,1);
}
{
 const s=setup(),p=s.run(),bad=texture(1);const rejected=assert.rejects(p,/dimensions/);s.callbacks.ok(bad);await rejected;assert.equal(bad.disposed,1);
}
assert.doesNotMatch(source,/getImageData|createElement|CanvasTexture/);
console.log('Prepared expression: success, timeout, late disposal, retry, failure, dimensions passed');
