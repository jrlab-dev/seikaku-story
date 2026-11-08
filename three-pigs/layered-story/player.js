const movie=document.querySelector('#movie'),play=document.querySelector('#play'),clock=document.querySelector('#clock'),caption=document.querySelector('#caption'),status=document.querySelector('#status');
let cues=[],last='',frame=0;
const format=s=>`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
function refresh(){const t=movie.currentTime;clock.textContent=`${format(t)} / ${Number.isFinite(movie.duration)?format(movie.duration):'—'}`;const c=cues.find(c=>t>=c.start&&t<c.end);const text=c?.text||'';if(text!==last){caption.textContent=text;last=text;}play.textContent=movie.ended?'もう一度みる':movie.paused?'つづきから再生':'一時停止';if(t===0&&movie.paused)play.textContent='お話をはじめる';}
function animate(){refresh();if(!movie.paused&&!movie.ended)frame=requestAnimationFrame(animate);}
play.addEventListener('click',()=>{if(!movie.paused){movie.pause();return;}if(movie.ended)movie.currentTime=0;movie.play().catch(()=>{status.textContent='再生を開始できませんでした。動画内の再生ボタン、または「つづきから再生」を押してください。';refresh();});});
movie.addEventListener('play',()=>{cancelAnimationFrame(frame);animate();status.textContent='再生中';});
movie.addEventListener('pause',()=>{cancelAnimationFrame(frame);refresh();if(!movie.ended)status.textContent='一時停止';});
movie.addEventListener('waiting',()=>{status.textContent='読み込み中です。準備ができると続きから再生します。';});
movie.addEventListener('playing',()=>{status.textContent='再生中';});
movie.addEventListener('ended',()=>{refresh();status.textContent='おしまい';});
movie.addEventListener('error',()=>{status.textContent='動画を読み込めませんでした。接続を確認し、ページを開き直してください。';});
for(const event of ['timeupdate','loadedmetadata','seeked'])movie.addEventListener(event,refresh);
fetch('story.json?v=original-20261108').then(r=>{if(!r.ok)throw Error('scene data');return r.json();}).then(data=>{cues=data.cues;for(const chapter of data.chapters){const button=document.createElement('button');button.type='button';button.textContent=chapter.title;button.addEventListener('click',()=>{if(movie.readyState<1){status.textContent='動画の準備中です。少し待ってから場面を選んでください。';return;}movie.currentTime=chapter.time;refresh();});document.querySelector('#chapters').append(button);}refresh();}).catch(()=>{status.textContent='字幕と場面選択を読み込めませんでした。動画の再生ボタンからお話は再生できます。';});
