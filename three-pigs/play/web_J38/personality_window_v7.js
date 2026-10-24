export async function createPersonalityWindow(canvas){
 const defs=await(await fetch('./costume114/manifest.json')).json(),images={};
 await Promise.all(['pig_straw','pig_wood','pig_brick'].map(async id=>{const image=new Image();image.src=defs[id].url;await image.decode();images[id]=image;}));
 const overlay=document.createElement('canvas');overlay.id='personality-window-v7';overlay.setAttribute('aria-label','旅をしながら性格を紹介');Object.assign(overlay.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:'3'});canvas.parentElement.appendChild(overlay);
 let layout=null;
 function draw(ctx,s,width=960){
  const p=s.personalityWindow;if(!p){layout=null;return;}
  ctx.save();ctx.scale(width/960,width/960);const x=18,y=16,w=924,h=250;
  ctx.fillStyle='rgba(246,241,223,.97)';ctx.strokeStyle='#c7c8aa';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(x,y,w,h,18);ctx.fill();ctx.stroke();
  ctx.fillStyle='#456245';ctx.textAlign='left';ctx.font='700 32px system-ui';ctx.fillText(p.label+' ｜ '+p.name,232,61);
  ctx.font='600 27px system-ui';ctx.fillStyle='#65724e';ctx.fillText(p.phase==='narrator'?'性格のお話':p.label+'のひとこと',232,101);
  ctx.fillStyle='#202d22';ctx.font='700 40px system-ui';const metrics=p.lines.map(l=>ctx.measureText(l).width);if(metrics.some(n=>n>690))throw Error('Profile line exceeds window');
  p.lines.forEach((line,i)=>ctx.fillText(line,232,161+i*53));
  const def=defs[p.id],f=def.frames[p.phase==='narrator'?0:p.id==='pig_straw'?3:p.id==='pig_wood'?5:0],b=f.bounds,[cx,cy]=f.cell,sw=b[2]-b[0],sh=b[3]-b[1],scale=Math.min(173/sw,197/sh),dw=sw*scale,dh=sh*scale;
  ctx.drawImage(images[p.id],cx+b[0],cy+b[1],sw,sh,117-dw/2,245-dh,dw,dh);
  layout={left:x,top:y,width:w,height:h,bodyFont:40,phone390Font:40*390/960,textWidths:metrics,lines:p.lines,phase:p.phase,profile:p.code};
  ctx.restore();return layout;
 }
 function apply(s){overlay.hidden=!s.personalityWindow;if(overlay.hidden)return;const rect=canvas.getBoundingClientRect();overlay.width=Math.round(rect.width);overlay.height=Math.round(rect.height);const ctx=overlay.getContext('2d');draw(ctx,s,overlay.width);overlay.setAttribute('aria-label',s.personalityWindow.label+'。'+s.personalityWindow.lines.join(' '));}
 return{draw,apply,record:()=>layout};
}

