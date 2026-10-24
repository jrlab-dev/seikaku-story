export function createStoryAudio({config,document,AudioContextClass=globalThis.AudioContext,fetchAudio=globalThis.fetch,baseURL=globalThis.location?.href}){
 const configured=typeof config.asset==='string'&&config.asset.length>0;
 let bed=null,current='base',bedGain=null,context=null,gain=null,buffer=null,node=null,pending=null,volume=config.volume??.18,muted=!!config.muted,error='',unlocked=false,offset=0,startedAt=0;
 const el=id=>document?.getElementById(id),controls=el('story-audio-controls');
 if(controls)controls.hidden=!configured;
 function setGain(){if(gain)gain.gain.setTargetAtTime(muted?0:volume,context.currentTime,.03);}
 function stop(){if(node){node.onended=null;try{node.stop();}catch{}node.disconnect();node=null;}}
 function unlock(){
  if(!configured)return Promise.resolve();
  try{if(!context){context=new AudioContextClass();gain=context.createGain();gain.gain.value=muted?0:volume;gain.connect(context.destination);}return context.resume().then(()=>{unlocked=context.state==='running';}).catch(e=>{error=String(e);});}catch(e){error=String(e);return Promise.resolve();}
 }
 async function prepare(){
  if(!configured||buffer||!context)return;if(pending)return pending;
  pending=(async()=>{try{const u=new URL(config.asset,baseURL),base=new URL(baseURL);if(u.origin!==base.origin)throw Error('Effects audio must be an approved local asset');const response=await fetchAudio(u.href);if(!response.ok)throw Error('Effects audio could not be loaded');buffer=await context.decodeAudioData(await response.arrayBuffer());if(config.bedAsset){const r2=await fetchAudio(new URL(config.bedAsset,baseURL).href);if(r2.ok)bed=await context.decodeAudioData(await r2.arrayBuffer());}}catch(e){error=String(e);}finally{pending=null;}})();return pending;
 }
 function sync(time,playing,src='base'){
  if(!configured||!buffer||!unlocked)return;
  const want=src==='bed'&&bed?'bed':'base',buf=want==='bed'?bed:buffer;if(want==='bed')time=time%bed.duration;
  if(want!==current){stop();current=want;}
  if(!playing||(!config.loop&&time>=buf.duration)){stop();return;}
  const next=config.loop?time%buffer.duration:time;
  const elapsed=node?offset+(context.currentTime-startedAt):NaN;
  const delta=config.loop?Math.min(Math.abs(elapsed-next),Math.abs(elapsed-next-buffer.duration)):Math.abs(elapsed-next);
  if(!node||delta>.2){stop();node=context.createBufferSource();node.buffer=buf;node.loop=!!config.loop;node.connect(gain);offset=next;startedAt=context.currentTime;node.start(0,next);}
 }
 function setVolume(v){volume=Math.max(0,Math.min(1,Number(v)||0));setGain();}
 function setMuted(v){muted=!!v;setGain();}
 const slider=el('story-volume'),mute=el('story-mute');
 if(slider){slider.value=volume;slider.oninput=e=>setVolume(e.target.value);}
 if(mute){mute.checked=muted;mute.onchange=e=>setMuted(e.target.checked);}
 return{unlock,prepare,sync,stop,setVolume,setMuted,status:()=>({configured,ready:!!buffer,unlocked,contextCreated:!!context,playing:!!node,volume,muted,error,asset:config.asset,timelineOffset:offset,contextTime:context?.currentTime??null,playbackPosition:node?offset+(context.currentTime-startedAt):null,gainValue:gain?.gain.value??0,contextState:context?.state??'not-created'}),dispose(){stop();context?.close();}};
}
