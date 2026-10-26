import {castTypes} from '../three-pigs/play/web_J38/personality_types.mjs';
import {siteHouses,MODEL} from '../three-pigs/play/web_J38/puzzle_houses.mjs';

export function warmupPlan(manifest,cast,compressed=true){
 const seen=new Set(),items=[];
 const add=(url,stage)=>{if(!seen.has(url)&&manifest.files[url]){seen.add(url);items.push({url,stage,bytes:manifest.files[url]});}};
 const model=(name,stage)=>{const m=manifest.models[name];for(const u of m.images)add(u,stage);add(compressed&&m.packed?m.packed:m.plain,stage);};
 for(const u of manifest.entry)add(u,'entry');
 if(cast){
  for(const u of manifest.common)add(u,'common');
  for(const n of ['environment','vegetation_prototypes'])model(n,'common');
  const types=castTypes(cast);
  for(const w of manifest.walks)if(w.style==null||w.style===types[w.role])add(w.url,'cast');
  add(manifest.wolves[types.wolf??9],'cast');
  for(const site of Object.values(siteHouses(cast)))model(MODEL[site.visual],'cast');
 }
 return items;
}

export function createWarmup({stage='entry',status=null}={}){
 const base=new URL('../three-pigs/play/web_J38/',import.meta.url),manifestURL=new URL('../three-pigs/warmup-assets.json',import.meta.url);
 const completed=new Set(),failed=new Set();let manifest=null,cast=null,plan=[],active=null,timer=null,started=false,stopped=false,lastInput=performance.now(),castBytes=0;
 const CAST_LIMIT=48*1e6;
 const connection=()=>navigator.connection;
 const restricted=()=>connection()?.saveData||['slow-2g','2g'].includes(connection()?.effectiveType);
 const paused=()=>document.hidden||!navigator.onLine||restricted();
 function report(phase){
  const bytes=plan.filter(x=>completed.has(x.url)).reduce((n,x)=>n+x.bytes,0),mb=(bytes/1e6).toFixed(1);
  const text=restricted()?'通信量を抑えるため、先読みを休止しています。':!navigator.onLine?'先読みを休止しています。通信が戻ると再開します。':phase==='done'?`先読み済み ${mb} MB。残りはお話の開始時に準備します。`:phase==='partial'?`先読み済み ${mb} MB。続きはお話の開始時に準備します。`:`${phase==='cast'?'この配役の素材':phase==='entry'?'紹介の画像':'共通の背景'}を先読み中 · ${mb} MB 準備済み`;
  if(status){status.textContent=text;status.dataset.phase=phase;status.dataset.bytes=bytes;}
  document.dispatchEvent(new CustomEvent('story-warmup',{detail:{phase,bytes,completed:completed.size}}));
 }
 function schedule(delay=350){clearTimeout(timer);if(!stopped)timer=setTimeout(pump,delay);}
 function replan(){if(manifest)plan=warmupPlan(manifest,stage==='selection'?cast:null,typeof DecompressionStream==='function');}
 async function pump(){
  if(stopped||!started||active)return;
  if(paused()){report('paused');return;}
  if(!manifest){
   const controller=new AbortController();active={controller,stage:'manifest'};
   try{const r=await fetch(manifestURL,{signal:controller.signal,priority:'low'});if(!r.ok)throw Error('Warmup unavailable');manifest=await r.json();replan();}
   catch(e){if(!controller.signal.aborted){report('partial');stopped=true;}}
   finally{active=null;}
   if(!stopped)schedule();return;
  }
  const next=plan.find(x=>!completed.has(x.url)&&!failed.has(x.url));
  if(!next){report(failed.size?'partial':'done');return;}
  if(performance.now()-lastInput<2000){schedule(500);return;}
  if(next.stage==='cast'&&castBytes+next.bytes>CAST_LIMIT){report('partial');return;}
  const controller=new AbortController();active={...next,controller};report(next.stage);
  try{
   const response=await fetch(new URL(next.url,base),{signal:controller.signal,priority:'low',cache:'default'});
   if(!response.ok)throw Error('Warmup unavailable');
   if(response.body){const reader=response.body.getReader();try{for(;;){const {done,value}=await reader.read();if(done)break;if(next.stage==='cast')castBytes+=value.byteLength;}}finally{reader.releaseLock();}}
   else{const body=await response.arrayBuffer();if(next.stage==='cast')castBytes+=body.byteLength;}
   completed.add(next.url);
  }catch(e){if(!controller.signal.aborted)failed.add(next.url);}
  finally{active=null;schedule();}
 }
 function wake(){if(paused())active?.controller.abort();schedule();}
 function input(){lastInput=performance.now();schedule(2100);}
 function start(){started=true;schedule(1200);}
 function suspend(){stopped=true;clearTimeout(timer);active?.controller.abort();}
 function resume(){stopped=false;wake();}
 document.addEventListener('visibilitychange',wake);
 document.addEventListener('pointerdown',input,{passive:true});
 document.addEventListener('keydown',input,{passive:true});
 addEventListener('offline',wake);addEventListener('online',wake);
 addEventListener('pagehide',suspend);addEventListener('pageshow',resume);
 connection()?.addEventListener('change',wake);
 if(document.readyState==='complete')start();else addEventListener('load',start,{once:true});
 return {
  setCast(next){cast={...next};lastInput=performance.now();replan();if(active?.stage==='cast'&&!plan.some(x=>x.url===active.url))active.controller.abort();schedule(2100);},
  stop:suspend
 };
}
