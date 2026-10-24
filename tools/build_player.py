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
KEEP_DIRS = {'assets/characters', 'reactions', 'assets/portraits', 'assets/endings', 'assets/textures', 'endings'}
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
open(vj, 'w', encoding='utf-8').write(v); print('viewer public ok', parts)
