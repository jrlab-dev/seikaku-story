const $=id=>document.getElementById(id),canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d'),audio=$('audio');
const manifest=await fetch('manifest.json').then(r=>{if(!r.ok)throw Error('素材一覧を読み込めません');return r.json();});
const blobs=new Map(),images=new Map(),ready=new Set();let route='hold',time=0,playing=false,anchor=0,token=0,clipIndex=-1,queue=false,raf=0;
const names={hold:'① 家を守り切る',escape:'② 裏口から逃げる'};
const routeShots=()=>manifest.routes[route];
function files(key){const s=manifest.shots[key];return [...new Set([s.background,...s.frames.filter(Boolean).map(f=>f.file)])];}
async function image(file){if(!images.has(file))images.set(file,(async()=>{if(!blobs.has(file))blobs.set(file,fetch('assets/'+file).then(r=>{if(!r.ok)throw Error('画像を読み込めません');return r.blob();}));return createImageBitmap(await blobs.get(file));})());return images.get(file);}
async function prepare(key){if(ready.has(key))return;const list=files(key);let n=0;await Promise.all(Array.from({length:4},async()=>{while(n<list.length)await image(list[n++]);}));ready.add(key);}
function release(index){const keep=new Set(routeShots().slice(Math.max(0,index-1),index+2).flatMap(files));for(const[f,p]of images){if(!keep.has(f)){p.then(im=>im.close());images.delete(f);}}for(const key of ready)if(!files(key).every(f=>keep.has(f)))ready.delete(key);}
function locationAt(t){let at=0;for(const[i,key]of routeShots().entries()){const s=manifest.shots[key];if(t<at+s.duration||i===routeShots().length-1)return{key,i,local:Math.min(s.duration-.05,Math.max(0,t-at))};at+=s.duration;}}
async function draw(){const pos=locationAt(time),s=manifest.shots[pos.key];if(!ready.has(pos.key))return false;ctx.drawImage(await images.get(s.background),0,0);const f=s.frames[Math.min(s.frames.length-1,Math.floor(pos.local*manifest.fps))];if(f&&!$('background').checked)ctx.drawImage(await images.get(f.file),f.x,f.y);$('caption').textContent=s.caption;$('part').textContent=time<12?'共通の場面':route==='hold'?'分岐① 守り切る':'分岐② 逃げる';$('time').value=time;$('clock').textContent=`0:${String(Math.floor(time)).padStart(2,'0')} / 0:21`;if(pos.i!==clipIndex){clipIndex=pos.i;const next=routeShots()[pos.i+1];if(next)prepare(next).catch(fail);release(pos.i);}return true;}
function pause(){playing=false;cancelAnimationFrame(raf);audio.pause();$('play').textContent=time>=21?'もう一度':'再生';$('status').textContent=names[route]+(time>=21?' · おしまい':' · 一時停止');}
function fail(e){pause();$('loading').hidden=false;$('loading').textContent='読み込みが止まりました。ページを開き直してください。';console.error(e);}
async function tick(now){if(!playing)return;time=Math.min(21,(now-anchor)/1000);if(!await draw()){pause();$('loading').textContent='次の場面を準備しています…';$('loading').hidden=false;await prepare(locationAt(time).key);$('loading').hidden=true;resume();return;}if(!playing)return;if(time>=21){pause();$('status').textContent=names[route]+' · おしまい';if(queue&&route==='hold'){await choose('escape',true);return;}queue=false;return;}raf=requestAnimationFrame(tick);}
function resume(){if(time>=21)time=0;playing=true;anchor=performance.now()-time*1000;audio.currentTime=time;audio.muted=!$('sound').checked;audio.volume=.45;audio.play().catch(()=>{});$('play').textContent='一時停止';$('status').textContent=names[route]+' · 再生中';raf=requestAnimationFrame(tick);}
async function choose(next,autoplay=false){const mine=++token;pause();route=next;time=0;clipIndex=-1;for(const id of ['hold','escape'])$(id).setAttribute('aria-pressed',String(id===route));$('play').disabled=true;$('both').disabled=true;$('loading').hidden=false;$('loading').textContent='画像を準備しています…';try{await Promise.all(routeShots().slice(0,2).map(prepare));if(mine!==token)return;await draw();$('loading').hidden=true;$('play').disabled=false;$('both').disabled=false;$('status').textContent=names[route];if(autoplay)resume();}catch(e){fail(e);}}
for(const id of ['hold','escape'])$(id).onclick=()=>{queue=false;choose(id,true);};
$('play').onclick=()=>{queue=false;if(playing)pause();else if(time>=21)choose(route,true);else resume();};
$('both').onclick=()=>{queue=true;choose('hold',true);};
$('sound').onchange=()=>audio.muted=!$('sound').checked;
$('background').onchange=()=>draw();
$('time').oninput=async e=>{queue=false;pause();time=+e.target.value;const mine=++token;await prepare(locationAt(time).key);if(mine===token){await draw();$('play').textContent='再生';$('status').textContent=names[route]+' · 一時停止';}};
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
const mb=n=>(n/1e6).toFixed(1);$('size').textContent=`比較用の画像素材は2通り合わせて${mb(manifest.bytes.both)}MB。同じ素材を別々に保存する場合より${mb(manifest.bytes.saved)}MB少なくなっています。音声とページ本体は別です。`;
await choose('hold');
