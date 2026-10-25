export async function createPersonalityCard(){
 const manifest=await(await fetch('./assets/portraits/manifest.json')).json(),images={};
 const ready=Promise.all(Object.entries(manifest).map(async([id,def])=>{const image=new Image();images[id]=image;image.src=def.url;await image.decode();}));
 function wrap(ctx,text,width){const lines=[];let line='';for(const c of text){if(line&&ctx.measureText(line+c).width>width){lines.push(line);line=c;}else line+=c;}if(line)lines.push(line);return lines;}
 function draw(ctx,p,{x=0,y=0,width=320}={}){
  const height=width*1.125;ctx.save();ctx.translate(x,y);ctx.scale(width/320,width/320);
  ctx.beginPath();ctx.roundRect(1,1,318,358,16);ctx.clip();
  const bg=ctx.createLinearGradient(0,0,320,360);bg.addColorStop(0,'#fffdf5');bg.addColorStop(1,'#e8ead7');ctx.fillStyle=bg;ctx.fillRect(0,0,320,360);
  const def=manifest[p.id],frames=def?.frames.filter(f=>f.type===(p.portraitType??9)),frame=frames?.[Math.floor(Math.max(0,p.elapsed??0)/.5)%frames.length],image=images[p.id];
  ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.font='800 24px system-ui';
  const title=wrap(ctx,p.name??'',292),titleBottom=49+(title.length-1)*27;
  if(frame&&image?.complete&&image.naturalWidth){
   const [fx,fy,fw,fh]=frame.rect,maxH=Math.max(...frames.map(f=>f.rect[3])),maxW=Math.max(...frames.map(f=>f.rect[2])),scale=Math.min(292/maxW,(348-titleBottom-12)/maxH),dw=fw*scale,dh=fh*scale;
   ctx.drawImage(image,fx,fy,fw,fh,160-dw/2,348-dh,dw,dh);
  }
  ctx.fillStyle='#4c7043';ctx.font='700 14px system-ui';ctx.fillText(p.label??'',160,22);
  ctx.fillStyle='#263728';ctx.font='800 24px system-ui';title.forEach((line,i)=>ctx.fillText(line,160,49+i*27));
  const paragraphs=p.pages?.map(lines=>lines.join(''))??[p.lines?.join('')??''];
  let font=15;ctx.font='600 '+font+'px system-ui';let lines=paragraphs.flatMap(text=>wrap(ctx,text,282));
  if(lines.length>6){font=14;ctx.font='600 '+font+'px system-ui';lines=paragraphs.flatMap(text=>wrap(ctx,text,282));}
  const lineHeight=font*1.4,boxHeight=lines.length*lineHeight+16,boxY=350-boxHeight;
  ctx.fillStyle='rgba(255,253,246,.92)';ctx.beginPath();ctx.roundRect(8,boxY,304,boxHeight,10);ctx.fill();
  ctx.fillStyle='#263728';ctx.textAlign='left';lines.forEach((line,i)=>ctx.fillText(line,19,boxY+8+font+i*lineHeight));
  ctx.restore();ctx.save();ctx.strokeStyle='#c9cdb4';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(x+.5,y+.5,width-1,height-1,width*.05);ctx.stroke();ctx.restore();
  return{left:x,top:y,width,height,bodyFont:font*width/320,titleLines:title,lines,portraitFrame:frame?.frame,descriptionTop:y+boxY*width/320};
 }
 return{ready,draw};
}
