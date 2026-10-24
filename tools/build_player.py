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
extra = ['/web_J38/audio/J114_v7_final_mix.m4a', '/web_J38/audio/ending_bed.m4a', '/web_J38/index.html']
used |= set(extra)
base = os.path.join(SRC, 'animal', 'delivery')
# 配役しだいで読む素材（性格の歩き方・新しい家・効果）も入れる：web_J38 の中で、assets 直下の大きな3Dと audio 以外は全部、
# assets 直下と audio は「読んだ実績があるもの」か「性格パズルの約束ファイルに載っているもの」だけ
W = os.path.join(base, 'web_J38')
listed = set()
fetched0 = set(used)
KEEP_DIRS = {'assets/prologue', 'assets/characters', 'reactions', 'assets/portraits', 'assets/endings', 'assets/textures', 'endings'}
for j in ['puzzle_houses_more.json', 'tent_fortress_houses.json', 'puzzle_effects.json', 'puzzle_houses_karakuri_fort.json']:
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
h = h.replace('</head>', css + '</head>') if '</head>' in h else h.replace('<body', css + '<body', 1)
h = h.replace('<body class="story-theatre">', '<body class="story-theatre"><a id="back" href="../../">← 性格を選びなおす</a>', 1)
open(idx, 'w', encoding='utf-8').write(h)
print('public index ok')

# 公開版では検証用の保存（POST）をしない。分割した大きいGLBは一覧を置き、最初から分割版を読む（404を出さない）
vj = os.path.join(DST, 'web_J38', 'viewer.js'); v = open(vj, encoding='utf-8').read()
old = "function saveEvidence(name,image=false,extra={}){if(new URLSearchParams(location.search).has('qa'))"
assert old in v
v = v.replace(old, "function saveEvidence(name,image=false,extra={}){if(!new URLSearchParams(location.search).has('dev')||new URLSearchParams(location.search).has('qa'))")
old = "async function fetchAssetBuffer(url,signal){const response=await fetch(url,{signal});if(response.ok)return response.arrayBuffer();const m=await fetch(url+'.parts.json',{signal});if(!m.ok)throw Error('Asset '+response.status+' '+url);"
assert old in v
v = v.replace(old, "const SPLIT_ASSETS=" + json.dumps(['./' + p[len('web_J38/'):] for p in parts]) + ";async function fetchAssetBuffer(url,signal){if(!SPLIT_ASSETS.includes(url)){const response=await fetch(url,{signal});if(!response.ok)throw Error('Asset '+response.status+' '+url);return response.arrayBuffer();}const m=await fetch(url+'.parts.json',{signal});if(!m.ok)throw Error('Asset parts '+m.status+' '+url);")
v += '\nwindow.__prepareStory=()=>storyPlayer?.initialize?.();\n'
open(vj, 'w', encoding='utf-8').write(v); print('viewer public ok', parts)

# 公開版の入口：3Dを読み込んでいるあいだに、お話の始まり（元の家を出る）と4人の性格の紹介を、絵と文字で読んでもらう。
# 読み終えて準備ができたら「お話をはじめる」。3Dは紹介の場面のあと（START秒）から始める。下に読み込みの進みを常に出す。
h = open(idx, encoding='utf-8').read()
cover = """<div id="cover"><div class="box" id="pro"></div><div class="load"><div class="bar"><i id="cover-bar"></i></div><span id="cover-mb">3Dの絵本劇を読み込んでいます…</span></div></div>
<style>#cover{position:fixed;inset:0;z-index:30;background:#f6f1e3;display:flex;flex-direction:column;font-family:"Hiragino Maru Gothic ProN",system-ui,sans-serif;color:#2f3a2c;overflow:auto}#cover[hidden]{display:none}
#cover .box{flex:1;width:min(560px,92vw);margin:0 auto;padding:54px 0 16px;display:flex;flex-direction:column;align-items:center;text-align:center}
#cover h2{font-size:24px;margin:0 0 12px}#cover .scene{width:100%;border-radius:14px;box-shadow:0 6px 20px #5b4a2a33;margin-bottom:14px}
#cover .txt{font-size:20px;line-height:1.8;font-weight:700;margin:6px 0 4px}#cover .sub{font-size:14px;color:#6b705c}
#cover .card{background:#fffdf6;border:1px solid #e3dac3;border-radius:16px;padding:16px;width:100%;display:grid;grid-template-columns:120px 1fr;gap:14px;align-items:center;text-align:left}
#cover .card canvas{width:120px;height:150px}#cover .role{font-size:14px;color:#5b8c51;font-weight:700}#cover .name{font-size:21px;font-weight:800;margin:2px 0 8px}#cover .lines{font-size:16px;line-height:1.75}
#cover .nav{margin-top:18px;display:flex;gap:10px;justify-content:center}#cover button{border:0;border-radius:999px;padding:12px 26px;background:#5b8c51;color:#fff;font:inherit;font-size:17px;font-weight:700;box-shadow:0 4px 0 #3f6838}#cover button.go{background:#c8553d;box-shadow:0 4px 0 #9b3f2c;font-size:19px}#cover button.back{background:#fff;color:#2f3a2c;border:1px solid #e3dac3;box-shadow:0 3px 0 #e3dac3}#cover button:disabled{opacity:.5}
#cover .dots{margin-top:10px;font-size:12px;color:#b3aa90;letter-spacing:4px}
#cover .load{padding:10px 16px 14px;font-size:12px;color:#6b705c;text-align:center;background:#f6f1e3;position:sticky;bottom:0}#cover .bar{height:8px;background:#e3dac3;border-radius:99px;overflow:hidden;margin:0 auto 4px;width:min(420px,90vw)}#cover .bar i{display:block;height:100%;width:0;background:#5b8c51;transition:width .4s}
@media (max-width:480px){#cover .card{grid-template-columns:90px 1fr}#cover .card canvas{width:90px;height:112px}#cover .txt{font-size:18px}}</style>
<script type="module">
import {TYPE_NAMES,PROFILE_TEXT} from './personality_text.mjs';
import {castTypes} from './animal_reactions.js';
const START=41,TOTAL=330*2**20,$=id=>document.getElementById(id);
const q=(new URLSearchParams(location.search).get('cast')||'33535,55331,33333,11311').split(','),ROLES=['pig_straw','pig_wood','pig_brick','wolf'],LABEL={pig_straw:'長男',pig_wood:'次男',pig_brick:'三男',wolf:'おおかみ'};
const cast=Object.fromEntries(ROLES.map((r,i)=>[r,q[i]])),types=castTypes(cast),man=await (await fetch('./assets/portraits/manifest.json')).json();
const imgs={};await Promise.all(ROLES.map(r=>new Promise(ok=>{const im=new Image();im.onload=ok;im.onerror=ok;im.src=man[r].url;imgs[r]=im;})));
const pages=[{img:'home',txt:'3びきのこぶたは、小さな家で暮らしていました。<br>大きくなった3びきは、自分たちの家を作ることに。'},...ROLES.slice(0,3).map(r=>({role:r})),{img:'arrive',txt:'新しい土地に到着。<br>ふり返ると、前の家が遠くに。'},{role:'wolf',pre:'そのころ、おおかみは……'},{end:true}];
let n=0,anim=null,ready=false,phase='read';
function card(r){const code=cast[r],t=PROFILE_TEXT[code]?.pages??[],c=document.createElement('canvas');c.width=240;c.height=300;
 const fr=man[r].frames.filter(f=>f.type===(types[r]??9)),draw=k=>{const f=fr[k%fr.length],[x,y,w,h]=f.rect,s=Math.min(230/w,290/h),ctx=c.getContext('2d');ctx.clearRect(0,0,240,300);ctx.drawImage(imgs[r],x,y,w,h,120-w*s/2,298-h*s,w*s,h*s);};
 let k=0;draw(0);anim=setInterval(()=>draw(++k),500);
 const d=document.createElement('div');d.className='card';d.append(c);const b=document.createElement('div');b.innerHTML=`<div class="role">${LABEL[r]}</div><div class="name">${TYPE_NAMES[code]??''}</div><div class="lines">${t.map(p=>p.join('')).join('<br>')}</div>`;d.append(b);return d;}
function show(){clearInterval(anim);const p=pages[n],box=$('pro');box.innerHTML='';
 if(n===0){const h=document.createElement('h2');h.textContent='三びきのこぶた';box.append(h);}
 if(p.img){const im=document.createElement('img');im.className='scene';im.src='./assets/prologue/'+p.img+'.jpg';box.append(im);const t=document.createElement('div');t.className='txt';t.innerHTML=p.txt;box.append(t);}
 if(p.pre){const t=document.createElement('div');t.className='sub';t.textContent=p.pre;t.style.marginBottom='8px';box.append(t);}
 if(p.role){if(!p.pre){const t=document.createElement('div');t.className='sub';t.textContent='性格のお話';t.style.marginBottom='8px';box.append(t);}box.append(card(p.role));}
 if(p.end){const t=document.createElement('div');t.className='txt';t.innerHTML=ready?'準備ができました。':'もう少しで準備ができます…';box.append(t);const s=document.createElement('div');s.className='sub';s.textContent='どんなお話になるかな？';box.append(s);}
 const nav=document.createElement('div');nav.className='nav';
 if(n>0){const bk=document.createElement('button');bk.className='back';bk.textContent='もどる';bk.onclick=()=>{n--;show();};nav.append(bk);}
 const go=document.createElement('button');if(p.end){go.className='go';go.id='cover-go';go.textContent='▶ お話をはじめる';go.disabled=!ready;go.onclick=start;}else{go.textContent='つぎへ';go.onclick=()=>{n++;show();};}nav.append(go);box.append(nav);
 const dots=document.createElement('div');dots.className='dots';dots.textContent=pages.map((_,i)=>i===n?'●':'○').join('');box.append(dots);}
function start(){phase='wait';const r=$('story-time');r.value=START;r.dispatchEvent(new Event('input'));$('story-play').click();$('pro').innerHTML='<div class="txt" style="margin-top:30vh">はじまります…</div>';}// 音を鳴らすため、押した操作の中で再生する
function tick(){const mb=performance.getEntriesByType('resource').reduce((s,e)=>s+(e.transferSize||e.encodedBodySize||0),0);$('cover-bar').style.width=Math.min(98,mb/TOTAL*100).toFixed(0)+'%';
 const play=$('story-play'),pause=$('story-pause'),r=$('story-time');
 // 読んでいるあいだに、3Dの物語の準備まで済ませる（再生を押して、始まったらすぐ紹介のあとの位置で止める）
 if(phase==='read'&&play&&!play.disabled&&!window.__pre&&window.__prepareStory){window.__pre=1;window.__prepareStory()?.then(()=>{window.__pre=2;ready=true;if(pages[n].end)show();});}
 $('cover-mb').textContent=(ready?'準備ができました（':'3Dの絵本劇を読み込んでいます… （')+Math.round(mb/2**20)+' MB）';if(ready)$('cover-bar').style.width='100%';
 if(phase==='wait'&&+r.value>=START&&pause&&!pause.disabled){phase='on';$('cover').hidden=true;}
 if(phase==='on'&&+r.value>=+r.max-.2){phase='end';const c=$('cover');c.hidden=false;$('pro').innerHTML='<h2 style="margin-top:20vh">おしまい</h2><p>性格を変えると、ちがうお話になります。</p><div class="nav"><a class="btn-like" href="../../"><button class="go">性格を選びなおす</button></a></div><p><a href="./?cast='+q.join(',')+'">もう一度見る</a></p>';$('cover').querySelector('.load').hidden=true;}
 setTimeout(tick,300);}
show();tick();
</script>"""
h = h.replace('<a id="back" href="../../">← 性格を選びなおす</a>', '<a id="back" href="../../">← 性格を選びなおす</a>' + cover, 1)
open(idx, 'w', encoding='utf-8').write(h)
print('cover ok')
