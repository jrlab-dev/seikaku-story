export async function createPersonalityCard(){
 const manifest=await(await fetch('./assets/portraits/manifest.json')).json(),images={};
 const ready=Promise.all(Object.entries(manifest).map(async([id,def])=>{const image=new Image();images[id]=image;image.src=def.url;await image.decode();}));
 function wrap(ctx,text,width){const lines=[],chars=[...text];let line='';for(let i=0;i<chars.length;i++){const c=chars[i],next=chars[i+1]??'',tail=/[、。！？）」』]/.test(next)?next:'';if(line&&ctx.measureText(line+c+tail).width>width){lines.push(line);line=c;}else line+=c;}if(line)lines.push(line);return lines;}
 function measure(ctx,p,{width=340,bodyFont=18,portraitHeight=220,maxHeight=Infinity}={}){
  ctx.save();ctx.font='800 24px system-ui';const title=wrap(ctx,p.name??'',width-28),titleBottom=49+(title.length-1)*27;
  ctx.font='600 '+bodyFont+'px system-ui';const paragraphs=p.pages?.map(lines=>lines.join(''))??[p.lines?.join('')??''],lines=paragraphs.flatMap(text=>wrap(ctx,text,width-38));
  const lineHeight=bodyFont*1.4,boxHeight=lines.length*lineHeight+20,portraitTop=titleBottom+12;
  portraitHeight=Math.max(90,Math.min(portraitHeight,maxHeight-portraitTop+44-boxHeight-10));
  const boxY=portraitTop+portraitHeight-44,height=boxY+boxHeight+10;ctx.restore();
  return{width,height,bodyFont,titleLines:title,lines,lineHeight,boxHeight,boxY,portraitTop,portraitHeight};
 }
 function draw(ctx,p,{x=0,y=0,...options}={}){
  const m=measure(ctx,p,options),{width,height,bodyFont,titleLines,lines,lineHeight,boxHeight,boxY,portraitTop,portraitHeight}=m;
  ctx.save();ctx.translate(x,y);ctx.beginPath();ctx.roundRect(1,1,width-2,height-2,16);ctx.clip();
  const bg=ctx.createLinearGradient(0,0,width,height);bg.addColorStop(0,'#fffdf5');bg.addColorStop(1,'#e8ead7');ctx.fillStyle=bg;ctx.fillRect(0,0,width,height);
  const def=manifest[p.id],frames=def?.frames.filter(f=>f.type===(p.portraitType??9)),frame=frames?.[Math.floor(Math.max(0,p.elapsed??0)/.5)%frames.length],image=images[p.id];
  if(frame&&image?.complete&&image.naturalWidth){
   const [fx,fy,fw,fh]=frame.rect,maxH=Math.max(...frames.map(f=>f.rect[3])),maxW=Math.max(...frames.map(f=>f.rect[2])),scale=Math.min((width-28)/maxW,portraitHeight/maxH),dw=fw*scale,dh=fh*scale;
   ctx.drawImage(image,fx,fy,fw,fh,width/2-dw/2,portraitTop+portraitHeight-dh,dw,dh);
  }
  ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.fillStyle='#4c7043';ctx.font='700 15px system-ui';ctx.fillText(p.label??'',width/2,22);
  ctx.fillStyle='#263728';ctx.font='800 24px system-ui';titleLines.forEach((line,i)=>ctx.fillText(line,width/2,49+i*27));
  ctx.fillStyle='rgba(255,253,246,.92)';ctx.beginPath();ctx.roundRect(8,boxY,width-16,boxHeight,10);ctx.fill();
  ctx.font='600 '+bodyFont+'px system-ui';ctx.fillStyle='#263728';ctx.textAlign='left';lines.forEach((line,i)=>ctx.fillText(line,19,boxY+10+bodyFont+i*lineHeight));
  ctx.restore();ctx.save();ctx.strokeStyle='#c9cdb4';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(x+.5,y+.5,width-1,height-1,16);ctx.stroke();ctx.restore();
  return{left:x,top:y,width,height,bodyFont,titleLines,lines,portraitFrame:frame?.frame,descriptionTop:y+boxY};
 }
 return{ready,measure,draw};
}
