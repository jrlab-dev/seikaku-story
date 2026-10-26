export function createStoryAudio({config,document,AudioContextClass=globalThis.AudioContext,fetchAudio=globalThis.fetch,baseURL=globalThis.location?.href}){
 const configured=typeof config.asset==='string'&&config.asset.length>0;
 let bed=null,current='base',bedGain=null,context=null,gain=null,buffer=null,node=null,pending=null,volume=config.volume??.18,muted=!!config.muted,error='',unlocked=false,offset=0,startedAt=0,patchesApplied=0;
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
  pending=(async()=>{try{
   const base=new URL(baseURL);
   async function load(asset){const u=new URL(asset,baseURL);if(u.origin!==base.origin)throw Error('Effects audio must be an approved local asset');const response=await fetchAudio(u.href);if(!response.ok)throw Error('Effects audio could not be loaded');return context.decodeAudioData(await response.arrayBuffer());}
   const decoded=await load(config.asset);
   for(const patch of config.patches||[]){
    try{const replacement=await load(patch.asset);applyAudioPatch(decoded,replacement,patch.segments);patchesApplied++;}
    catch(e){error=String(e);}
   }
   buffer=decoded;
   if(config.bedAsset)bed=await load(config.bedAsset);
  }catch(e){error=String(e);}finally{pending=null;}})();return pending;
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
 return{unlock,prepare,sync,stop,setVolume,setMuted,status:()=>({configured,ready:!!buffer,unlocked,contextCreated:!!context,playing:!!node,volume,muted,error,asset:config.asset,patchesApplied,timelineOffset:offset,contextTime:context?.currentTime??null,playbackPosition:node?offset+(context.currentTime-startedAt):null,gainValue:gain?.gain.value??0,contextState:context?.state??'not-created'}),dispose(){stop();context?.close();}};
}

export function applyAudioPatch(target,patch,segments){
 const sr=target.sampleRate;
 if(sr!==patch.sampleRate||target.numberOfChannels!==patch.numberOfChannels)throw Error('Audio patch format mismatch');
 const ranges=segments.map(s=>({start:Math.round(s.start*sr),offset:Math.round(s.offset*sr),length:Math.round(s.duration*sr)}));
 if(ranges.some(r=>r.start<0||r.offset<0||r.length<=0||r.start+r.length>target.length||r.offset+r.length>patch.length))throw Error('Audio patch range mismatch');
 const fade=Math.round(.04*sr);
 for(let ch=0;ch<target.numberOfChannels;ch++){
  const dst=target.getChannelData(ch),src=patch.getChannelData(ch);
  for(const r of ranges)for(let i=0;i<r.length;i++){
   const u=Math.min(1,i/fade,(r.length-1-i)/fade),weight=u*u*(3-2*u);
   dst[r.start+i]+=(src[r.offset+i]-dst[r.start+i])*weight;
  }
 }
}
