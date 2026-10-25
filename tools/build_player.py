# 劇（三びきのこぶた）を公開用に組み立てる：作業フォルダの web_J38 から、実際に読み込むファイルだけを写す。
#  - .gz しかないものは展開して元の名前で置く（公開先はそのまま配信するため）
#  - 24MB を超えるファイルは .part0, .part1 … に分け、<名前>.parts.json を置く（読み込み側でつなぎ直す）
#  - 音声（audio/）と三角の音声、BGM（ending用）も写す
import json, glob, os, gzip, shutil, sys
SRC = sys.argv[1]            # .../J118_性格パズル版_20261023
DST = sys.argv[2]            # .../seikaku-story-site/three-pigs/play
FETCHED = glob.glob(os.path.join(SRC, '_一時', 'fetched_*.json'))
LIMIT = 24 * 2**20
used = set()
for f in FETCHED: used |= {u.split('?')[0] for u in json.load(open(f))}
extra = ['/web_J38/audio/J114_v7_final_mix.m4a', '/web_J38/audio/ending_bed.m4a', '/web_J38/audio/karakuri_bed.m4a', '/web_J38/index.html']
used |= set(extra)
base = os.path.join(SRC, 'animal', 'delivery')
# 配役しだいで読む素材（性格の歩き方・新しい家・効果）も入れる：web_J38 の中で、assets 直下の大きな3Dと audio 以外は全部、
# assets 直下と audio は「読んだ実績があるもの」か「性格パズルの約束ファイルに載っているもの」だけ
W = os.path.join(base, 'web_J38')
listed = set()
fetched0 = set(used)
KEEP_DIRS = {'intro', 'assets/prologue', 'assets/characters', 'reactions', 'assets/portraits', 'assets/endings', 'assets/textures', 'endings'}
for j in ['puzzle_houses_more.json', 'tent_fortress_houses.json', 'puzzle_effects.json', 'puzzle_houses_karakuri_fort.json', 'puzzle_karakuri_security.json']:
    t = open(os.path.join(W, j)).read()
    import re
    listed |= set(re.findall(r'assets/([A-Za-z_0-9]+\.glb)', t))
for root, dirs, files in os.walk(W):
    for fn in files:
        rel = os.path.relpath(os.path.join(root, fn), W)
        top = rel.split(os.sep)[0]
        if fn.startswith('.') or fn.endswith('.br'): continue
        d = os.path.dirname(rel).replace(os.sep, '/')
        if d and d not in KEEP_DIRS and not any(u.startswith('/web_J38/' + d + '/') for u in fetched0): continue
        if top == 'audio': continue
        if top == 'assets' and os.sep not in rel[len('assets/'):]:
            name = fn[:-3] if fn.endswith('.gz') else fn
            if name.endswith('.glb') and name not in listed and '/web_J38/assets/' + name not in used: continue
        if fn.endswith('.gz') and os.path.exists(os.path.join(root, fn[:-3])): continue
        used.add('/web_J38/' + (rel[:-3] if fn.endswith('.gz') else rel).replace(os.sep, '/'))
shutil.rmtree(DST, ignore_errors=True)
n = 0; total = 0; parts = []
for u in sorted(used):
    rel = u.lstrip('/')
    src = os.path.join(base, rel)
    data = None
    if os.path.isfile(src): data = open(src, 'rb').read()
    elif os.path.isfile(src + '.gz'): data = gzip.decompress(open(src + '.gz', 'rb').read())
    else: print('missing', u); continue
    # 公開物に制作メモを残さない：JSの行コメントを外し、JSONの手元の絶対パスはファイル名だけにする
    if rel.endswith(('.js', '.mjs')):
        data = '\n'.join(l for l in data.decode('utf-8').split('\n') if not l.lstrip().startswith('//')).encode('utf-8')
    elif rel.endswith('.json'):
        import re as _re
        HOMEPATH = '/' + 'Us' + 'ers/'
        data = _re.sub('"(?:' + _re.escape(HOMEPATH) + r'|[A-Za-z]:\\\\)[^"]*?([^/\\\\"]+)"', r'"\1"', data.decode('utf-8')).encode('utf-8')
    out = os.path.join(DST, rel); os.makedirs(os.path.dirname(out), exist_ok=True)
    if len(data) > LIMIT:
        k = 0; names = []
        for i in range(0, len(data), LIMIT):
            nm = os.path.basename(out) + f'.part{k}'; open(os.path.join(os.path.dirname(out), nm), 'wb').write(data[i:i + LIMIT]); names.append(nm); k += 1
        json.dump({'size': len(data), 'parts': names}, open(out + '.parts.json', 'w')); parts.append(rel)
    else:
        open(out, 'wb').write(data)
    n += 1; total += len(data)
print(n, 'files', round(total / 2**20), 'MB', 'split:', parts)

# 公開用の見た目：開発用の操作を隠し、再生・一時停止・先頭へ・音量と、性格を選び直す戻りリンクだけにする
idx = os.path.join(DST, 'web_J38', 'index.html'); h = open(idx, encoding='utf-8').read()
h = h.replace('<title>三びきのこぶた — カメラ演出版</title>', '<title>三びきのこぶた｜性格で変わる物語</title>')
css = '''<style id="public">
body.story-theatre header,.controls:not(#story-controls),#stats,#story-inspect,#story-camera,#story-scene,label:has(#story-scene),#story-state,#paper-controls,#intro-card{display:none!important}
#story-controls{display:flex!important;flex-wrap:wrap;gap:8px;align-items:center;justify-content:center;padding:8px 10px;background:#f6f1e3;border-top:1px solid #e3dac3;font:14px "Hiragino Maru Gothic ProN",system-ui,sans-serif}
#story-controls button{border:0;border-radius:999px;padding:8px 18px;background:#5b8c51;color:#fff;font:inherit;font-weight:700}
#story-controls button:disabled{opacity:.5}
#story-controls label:has(#story-time){flex:1 1 220px;display:flex;gap:6px;align-items:center}#story-time{flex:1}
#back{position:fixed;top:10px;left:10px;z-index:20;background:#fffdf6e6;border:1px solid #e3dac3;border-radius:999px;padding:6px 14px;color:#2f3a2c;text-decoration:none;font:13px "Hiragino Maru Gothic ProN",system-ui,sans-serif}
</style>'''
h = h.replace('</head>', '<script>performance.setResourceTimingBufferSize(10000);</script>' + css + '</head>') if '</head>' in h else h.replace('<body', css + '<body', 1)
h = h.replace('<body class="story-theatre">', '<body class="story-theatre"><a id="back" href="../../">← 性格を選びなおす</a>', 1)
open(idx, 'w', encoding='utf-8').write(h)
print('public index ok')

# 公開版では検証用の保存（POST）をしない。分割した大きいGLBは一覧を置き、最初から分割版を読む（404を出さない）
vj = os.path.join(DST, 'web_J38', 'viewer.js'); v = open(vj, encoding='utf-8').read()
old = "function saveEvidence(name,image=false,extra={}){if(new URLSearchParams(location.search).has('qa'))"
assert old in v
v = v.replace(old, "function saveEvidence(name,image=false,extra={}){if(!new URLSearchParams(location.search).has('dev')||new URLSearchParams(location.search).has('qa'))")
old = "async function fetchAssetBuffer(url,signal){const response=await fetch(url,{signal});if(response.ok)return readAssetResponse(response);const m=await fetch(url+'.parts.json',{signal});if(!m.ok)throw Error('Asset '+response.status+' '+url);"
assert old in v
v = v.replace(old, "const SPLIT_ASSETS=" + json.dumps(['./' + p[len('web_J38/'):] for p in parts]) + ";async function fetchAssetBuffer(url,signal){if(!SPLIT_ASSETS.includes(url)){const response=await fetch(url,{signal});if(!response.ok)throw Error('Asset '+response.status+' '+url);return readAssetResponse(response);}const m=await fetch(url+'.parts.json',{signal});if(!m.ok)throw Error('Asset parts '+m.status+' '+url);")
v += '\nwindow.__prepareStory=()=>storyPlayer?.initialize?.();\n'
v += '\nwindow.__prepareIntro=()=>storyPlayer.prepareIntro();window.__unlockStoryAudio=()=>storyPlayer.unlockAudio();\n'
open(vj, 'w', encoding='utf-8').write(v); print('viewer public ok', parts)

# 公開版の入口：3Dを読み込んでいるあいだは、お話の始まり（家を出る・到着）を動画で流し、4人の性格紹介を動画の下に出す。
# 狼登場までに準備済みなら35秒で3Dへ。未完了なら型ごとの狼動画を続け、41秒で接続する。
# 動画は intro/pigs.mp4（0〜35秒）と intro/wolf<型>.mp4（35〜41秒）。字幕と性格紹介はここで重ねる（動画には焼き込まない）。
h = open(idx, encoding='utf-8').read()
cover = """<div id="cover"><div class="stage"><div class="vbox"><video id="iv" playsinline preload="auto"></video><div id="icap"></div><div id="tap"><button id="tap-go" disabled>▶ お話をはじめる</button><p class="small">音が出ます</p></div></div><div id="card"></div></div><div class="load"><div class="bar"><i id="cover-bar"></i></div><strong id="cover-percent">準備 0%（目安）</strong><div id="cover-stage">絵本劇を準備しています</div><span id="cover-mb"></span></div></div>
<style>#cover{position:fixed;inset:0;z-index:30;background:#f6f1e3;display:flex;flex-direction:column;font-family:"Hiragino Maru Gothic ProN",system-ui,sans-serif;color:#2f3a2c;overflow:auto}#cover[hidden]{display:none}
#cover .stage{flex:1;width:min(960px,100vw);margin:0 auto;padding:44px 8px 8px;display:flex;flex-direction:column;gap:10px}
#cover .vbox{position:relative;width:100%;aspect-ratio:1002/720;background:#263429;border-radius:12px;overflow:hidden}#cover video{width:100%;height:100%;display:block;object-fit:cover}
#icap{position:absolute;left:50%;bottom:6%;transform:translateX(-50%);width:88%;background:#19231ae6;color:#fff;border-radius:10px;padding:8px 14px;text-align:center;font-weight:700;font-size:clamp(14px,2.6vw,22px);line-height:1.5}#icap:empty{display:none}
#tap{position:absolute;inset:0;display:grid;place-content:center;justify-items:center;background:#f6f1e3cc}#tap[hidden]{display:none}#tap button{border:0;border-radius:999px;padding:14px 30px;background:#c8553d;color:#fff;font:inherit;font-size:19px;font-weight:700;box-shadow:0 4px 0 #9b3f2c}
#card{width:min(320px,100%);margin:0 auto}#card canvas{display:block;width:100%;height:auto;aspect-ratio:8/9}
#intro-skip{display:block;margin:8px auto 0;border:0;border-radius:999px;padding:10px 22px;background:#5b8c51;color:white;font:inherit;font-weight:700}#intro-skip[hidden]{display:none}#cover-percent{display:block;font-size:17px;color:#2f3a2c;margin:4px 0}#cover-stage{font-size:14px;color:#2f3a2c;line-height:1.6}#cover .small{font-size:12px;color:#6b705c}#cover .wait{text-align:center;font-weight:700;padding:12px}
#cover .load{padding:8px 16px 12px;font-size:12px;color:#6b705c;text-align:center;background:#f6f1e3;position:sticky;bottom:0}#cover .bar{height:8px;background:#e3dac3;border-radius:99px;overflow:hidden;margin:0 auto 4px;width:min(420px,90vw)}#cover .bar i{display:block;height:100%;width:0;background:#5b8c51;transition:width .4s}
@keyframes load-slide{from{transform:translateX(0)}to{transform:translateX(185%)}}@media(prefers-reduced-motion:reduce){#cover-bar{animation:none!important}}@media (min-width:700px){#cover .stage{display:grid;grid-template-columns:minmax(0,1fr) min(32vw,320px);align-items:start}}@media (max-width:699px){#cover .stage{padding-top:12px;gap:8px}#card{width:min(320px,calc((100svh - 100vw * .719 - 140px)/1.125));min-width:250px}}</style>
<script type="module">
import {TYPE_NAMES,PROFILE_TEXT} from './personality_text.mjs';
import {castTypes} from './animal_reactions.js';
import {getLoadProgress} from './story_loading_progress.mjs';
import {createPersonalityCard} from './personality_card.js';
const START=41,$=id=>document.getElementById(id);
const q=(new URLSearchParams(location.search).get('cast')||'33535,55331,33333,11311').split(','),ROLES=['pig_straw','pig_wood','pig_brick','wolf'],LABEL={pig_straw:'長男',pig_wood:'次男',pig_brick:'三男',wolf:'おおかみ'};
const cast=Object.fromEntries(ROLES.map((r,i)=>[r,q[i]])),types=castTypes(cast),portrait=await createPersonalityCard();portrait.ready.catch(console.error);
// 3Dのお話と同じ時刻割り（字幕・性格紹介）
const CAPS=[[0,2.5,'3びきのこぶたは、小さな家で暮らしていました。'],[2.5,5,'大きくなった3びきは、自分たちの家を作ることに。'],[32,35,'新しい土地に到着。ふり返ると、前の家が遠くに。']];
const CARDS=[[5,14,'pig_straw'],[14,23,'pig_wood'],[23,32,'pig_brick'],[35,41,'wolf']];
const v=$('iv'),wolfSrc='./intro/wolf'+(types.wolf??9)+'.mp4';let seg='pigs',anim=null,shown=null,phase='tap',started=false,lastVideoTime=0,lastVideoAdvance=performance.now(),videoBlocked=false,videoFailed=false;
v.src='./intro/pigs.mp4';const wolfReady=fetch(wolfSrc).then(r=>{if(!r.ok)throw Error('Video unavailable');return r.blob();}).then(b=>URL.createObjectURL(b)).catch(()=>wolfSrc);
const skip=document.createElement('button');skip.id='intro-skip';skip.textContent='本編へ進む';skip.hidden=true;$('cover').querySelector('.load').append(skip);
async function playVideo(){try{await v.play();videoBlocked=false;videoFailed=false;lastVideoAdvance=performance.now();}catch(e){videoBlocked=true;$('tap-go').textContent='▶ 動画を再開';$('tap').querySelector('p').textContent='タップして続きを再生できます';$('tap').hidden=false;}}
v.addEventListener('error',()=>{videoFailed=true;});
function card(r){clearInterval(anim);const box=$('card');box.innerHTML='';shown=r;if(!r)return;const code=cast[r],pages=PROFILE_TEXT[code]?.pages??[],c=document.createElement('canvas');c.width=640;c.height=720;
 c.setAttribute('role','img');c.setAttribute('aria-label',LABEL[r]+'。'+(TYPE_NAMES[code]??'')+'。'+pages.flat().join(''));
 const began=performance.now(),draw=()=>{const ctx=c.getContext('2d');ctx.clearRect(0,0,640,720);portrait.draw(ctx,{id:r,label:LABEL[r],name:TYPE_NAMES[code],pages,portraitType:types[r]??9,elapsed:(performance.now()-began)/1000},{width:640});};
 box.append(c);draw();anim=setInterval(draw,500);}
const now=()=>seg==='pigs'?v.currentTime:35+v.currentTime;
function sync(){const t=now(),cap=CAPS.find(([a,b])=>t>=a&&t<b);$('icap').textContent=cap?cap[2]:'';const cd=CARDS.find(([a,b])=>t>=a&&t<b);if((cd?.[2]??null)!==shown)card(cd?.[2]??null);}
v.addEventListener('ended',async()=>{if(phase==='on')return;if(seg==='pigs'){if(ready){enterMain(35);return;}phase='video-next';const source=await wolfReady;if(phase!=='video-next')return;seg='wolf';v.src=source;lastVideoTime=0;lastVideoAdvance=performance.now();phase='video';playVideo();}else{phase='handoff';}});
$('tap-go').onclick=()=>{$('tap').hidden=true;if(phase==='tap'){window.__unlockStoryAudio?.();phase='video';}playVideo();
 // 音の許可は開始操作で取り、本編の再生は冒頭動画からの切り替えまで待つ。
 const m=$('story-mute');if(m){m.checked=true;m.dispatchEvent(new Event('change'));}};
let ready=false;const loadingBegan=performance.now();
function enterMain(at=START){if(!ready||phase==='on'||phase==='end')return;phase='on';v.pause();$('tap').hidden=true;const m=$('story-mute');if(m){m.checked=false;m.dispatchEvent(new Event('change'));}const r=$('story-time');r.value=at;r.dispatchEvent(new Event('input'));$('cover').hidden=true;clearInterval(anim);$('story-play').click();}
skip.onclick=()=>enterMain();
function tick(){const mb=performance.getEntriesByType('resource').reduce((s,e)=>s+(e.transferSize||e.encodedBodySize||0),0),r=$('story-time'),play=$('story-play');
 if(phase==='tap')$('tap-go').disabled=typeof window.__unlockStoryAudio!=='function';
 if(phase!=='tap'&&!started&&play&&!play.disabled&&window.__prepareIntro){started=true;window.__prepareIntro().then(()=>{ready=true;}).catch(()=>{videoFailed=true;});}
 if(v.currentTime!==lastVideoTime){lastVideoTime=v.currentTime;lastVideoAdvance=performance.now();}
 const stalled=phase==='video'&&!v.ended&&performance.now()-lastVideoAdvance>3000,waiting=phase==='video-next'||(stalled&&v.readyState<3),paused=stalled&&v.paused;
 if(paused&&!videoBlocked){videoBlocked=true;$('tap-go').textContent='▶ 動画を再開';$('tap').querySelector('p').textContent='タップして続きを再生できます';$('tap').hidden=false;}
 const progress=getLoadProgress(),percent=ready?100:Math.min(99,progress.percent),elapsed=Math.floor((performance.now()-loadingBegan)/1000),loaded=Math.round((mb+progress.received)/2**20);
 $('cover-bar').style.width=percent+'%';$('cover-bar').style.animation='none';
 const seconds=elapsed<60?elapsed+'秒':Math.floor(elapsed/60)+'分'+elapsed%60+'秒';
 const videoStatus=videoFailed?'動画を再生できません。':waiting?'動画の読み込みを待っています。':videoBlocked?'動画が一時停止しています。':stalled?'動画の再生が止まっています。':null;
 const status=progress.failed?'本編の準備が止まりました。ページを読み直してください。':videoStatus?videoStatus+(ready?' 本編は準備済みです。':' 本編も準備中です。'):ready?(phase==='video'?(seg==='pigs'?'あと '+Math.max(0,Math.ceil(35-now()))+'秒で狼の紹介へ進みます':'動画の残り '+Math.max(0,Math.ceil(START-now()))+'秒で本編へ進みます'):'本編を始めます'):progress.receiving?'3Dデータを受信中です':progress.label;
 $('cover-percent').textContent=ready?'本編の準備 100%':'本編の準備 '+percent+'%（目安）';$('cover-stage').textContent=status;$('cover-mb').textContent=loaded+' MB 読込済み・'+seconds+'経過';skip.hidden=!(ready&&videoStatus&&phase!=='on'&&phase!=='end');
 if(phase==='video-next'&&ready)enterMain(35);
 if(phase==='video')sync();
 if(phase==='handoff'){if(ready)enterMain();else{$('icap').textContent='本編の準備をしています。もう少しお待ちください…';}}
 if(phase==='on'&&+r.value>=+r.max-.2){phase='end';const c=$('cover');c.hidden=false;c.querySelector('.stage').innerHTML='<div class="wait" style="margin-top:18vh"><h2>おしまい</h2><p>性格を変えると、ちがうお話になります。</p><p><a href="../../"><button style="border:0;border-radius:999px;padding:12px 26px;background:#c8553d;color:#fff;font:inherit;font-weight:700">性格を選びなおす</button></a></p><p><a href="./?cast='+q.join(',')+'">もう一度見る</a></p></div>';c.querySelector('.load').hidden=true;}
 setTimeout(tick,250);}
tick();
</script>"""
h = h.replace('<a id="back" href="../../">← 性格を選びなおす</a>', '<a id="back" href="../../">← 性格を選びなおす</a>' + cover, 1)
open(idx, 'w', encoding='utf-8').write(h)
print('cover ok')
