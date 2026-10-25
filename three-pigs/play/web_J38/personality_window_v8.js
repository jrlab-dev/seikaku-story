import {createPersonalityCard} from './personality_card.js';
export async function createPersonalityWindow(canvas){
 const card=await createPersonalityCard();await card.ready;
 const overlay=document.createElement('canvas');overlay.id='personality-window-v8';overlay.setAttribute('aria-label','登場人物の性格紹介');Object.assign(overlay.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:'3'});canvas.parentElement.appendChild(overlay);
 let layout=null,lastKey='';
 function draw(ctx,s,width=960,height=690){
  const p=s.personalityWindow;if(!p){layout=null;return;}
  const portrait=height>width,w=Math.min(320,portrait?width*.64:width*.32,(portrait?height*.40:height-80)/1.125),x=width-w-14,y=portrait?height-w*1.125-12:16;
  layout={...card.draw(ctx,p,{x,y,width:w}),profile:p.code,page:p.page};return layout;
 }
 function apply(s){
  overlay.hidden=!s.personalityWindow;overlay.style.display=overlay.hidden?'none':'';
  if(overlay.hidden){if(lastKey)overlay.getContext('2d').clearRect(0,0,overlay.width,overlay.height);lastKey='';return;}
  const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2),p=s.personalityWindow,key=[p.id,p.code,p.name,p.portraitType,Math.floor(Math.max(0,p.elapsed??0)/.5)%2,rect.width,rect.height,dpr].join('|');
  if(key===lastKey)return;lastKey=key;overlay.width=Math.round(rect.width*dpr);overlay.height=Math.round(rect.height*dpr);
  const ctx=overlay.getContext('2d');ctx.scale(dpr,dpr);draw(ctx,s,rect.width,rect.height);
  overlay.setAttribute('aria-label',p.label+'。'+p.name+'。'+(p.pages?.flat()??p.lines).join(' '));
 }
 return{draw,apply,record:()=>layout};
}
