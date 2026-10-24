export async function createPersonalityWindow(canvas){
 const man=await(await fetch('./assets/characters/manifest.json')).json(),images={},defs={};
 for(const c of man.characters){const f=c.frames[0],[x,y]=f.cell,[cw,ch]=[f.cell[2],f.cell[3]],[l,t,r,b]=f.alpha128Bounds;defs[c.id==='wolf'?'wolf_normal':c.id]={url:c.url,frames:[{cell:[x,y,cw,ch],bounds:[l,t,r,b]}]};}
 await Promise.all(['pig_straw','pig_wood','pig_brick','wolf_normal'].map(async id=>{const image=new Image();image.src=defs[id].url;await image.decode();images[id]=image;}));
 const portraits=await(await fetch('./assets/portraits/manifest.json')).json(),pimg={};
 await Promise.all(Object.entries(portraits).map(async([id,d])=>{const image=new Image();image.src=d.url;await image.decode();pimg[id]=image;}));
 const overlay=document.createElement('canvas');overlay.id='personality-window-v8';overlay.setAttribute('aria-label','登場人物の性格紹介');Object.assign(overlay.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:'3'});canvas.parentElement.appendChild(overlay);
 let layout=null;
 function draw(ctx,s,width=960){
  const p=s.personalityWindow;if(!p){layout=null;return;}
  const wolf=p.id==='wolf',x=18,y=16,w=924,h=wolf?190:250,font=wolf?38:40;
  ctx.save();ctx.scale(width/960,width/960);
  ctx.fillStyle='rgba(246,241,223,.97)';ctx.strokeStyle='#c7c8aa';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(x,y,w,h,18);ctx.fill();ctx.stroke();
  ctx.fillStyle='#456245';ctx.textAlign='left';ctx.font='700 32px system-ui';ctx.fillText(p.label+' ｜ '+p.name,232,wolf?55:61);
  if(!wolf){ctx.font='600 27px system-ui';ctx.fillStyle='#65724e';ctx.fillText('性格のお話',232,101);}
  ctx.fillStyle='#202d22';ctx.font='700 '+font+'px system-ui';
  const metrics=p.lines.map(l=>ctx.measureText(l).width);if(metrics.some(n=>n>690))throw Error('Profile line exceeds window');
  p.lines.forEach((line,i)=>ctx.fillText(line,232,(wolf?112:161)+i*(wolf?48:53)));
  const pd=portraits[p.id],ab=Math.floor(Math.max(0,p.elapsed??0)/.5)%2;let portraitFrame=null;
  if(pd&&p.portraitType!=null){
   const fr=pd.frames.filter(f=>f.type===p.portraitType),f=fr[ab],hmax=Math.max(...fr.map(f=>f.rect[3])),wmax=Math.max(...fr.map(f=>f.rect[2])),scale=Math.min(190/wmax,(wolf?160:205)/hmax),[fx,fy,fw,fh]=f.rect,dw=fw*scale,dh=fh*scale;
   ctx.drawImage(pimg[p.id],fx,fy,fw,fh,117-dw/2,(wolf?191:247)-dh,dw,dh);portraitFrame={type:p.portraitType,frame:f.frame};
  }else{
  const key=wolf?'wolf_normal':p.id,def=defs[key],f=def.frames[0],b=f.bounds,[cx,cy]=f.cell,sw=b[2]-b[0],sh=b[3]-b[1],scale=Math.min(173/sw,(wolf?160:197)/sh),dw=sw*scale,dh=sh*scale;
  ctx.drawImage(images[key],cx+b[0],cy+b[1],sw,sh,117-dw/2,(wolf?191:245)-dh,dw,dh);}
  layout={portraitFrame,left:x,top:y,width:w,height:h,bodyFont:font,phone390Font:font*390/960,textWidths:metrics,lines:p.lines,phase:'narrator',profile:p.code,page:p.page};
  ctx.restore();return layout;
 }
 function apply(s){overlay.hidden=!s.personalityWindow;overlay.style.display=overlay.hidden?'none':'';if(overlay.hidden){overlay.getContext('2d').clearRect(0,0,overlay.width,overlay.height);return;}const rect=canvas.getBoundingClientRect();overlay.width=Math.round(rect.width);overlay.height=Math.round(rect.height);draw(overlay.getContext('2d'),s,overlay.width);overlay.setAttribute('aria-label',s.personalityWindow.label+'。'+s.personalityWindow.lines.join(' '));}
 return{draw,apply,record:()=>layout};
}
