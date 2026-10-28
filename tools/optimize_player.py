"""Create smaller delivery assets while retaining the original fallback files."""
import gzip
import hashlib
import io
import json
import os
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from PIL import Image, ImageChops


def optimize_player(destination):
    root = Path(destination) / 'web_J38'
    cache = Path(os.environ['STORY_IMAGE_CACHE']) if os.environ.get('STORY_IMAGE_CACHE') else None
    if cache:
        cache.mkdir(parents=True, exist_ok=True)

    def convert(path):
        original = path.read_bytes()
        lossless = 'lut' in path.stem.lower() or (path.parent.name == 'villain' and path.stem.startswith('prepared_'))
        key = hashlib.sha256(original + str(lossless).encode() + b'webp95-v1').hexdigest()
        cached = cache / (key + '.webp') if cache else None
        source = Image.open(io.BytesIO(original)).convert('RGBA')
        if cached and cached.exists():
            encoded = cached.read_bytes()
        else:
            buffer = io.BytesIO()
            source.save(buffer, format='WEBP', quality=95, lossless=lossless, method=6, exact=True)
            encoded = buffer.getvalue()
        decoded = Image.open(io.BytesIO(encoded)).convert('RGBA')
        if decoded.size != source.size or ImageChops.difference(source.getchannel('A'), decoded.getchannel('A')).getbbox():
            raise ValueError('Image dimensions or alpha changed: ' + path.name)
        if lossless and source.tobytes() != decoded.tobytes():
            raise ValueError('Color lookup must remain exact: ' + path.name)
        if cached and not cached.exists():
            cached.write_bytes(encoded)
        output = path.with_suffix('.webp')
        if output.exists():
            raise ValueError('Image output collision: ' + str(output.relative_to(root)))
        output.write_bytes(encoded)
        return {'file': str(path.relative_to(root)), 'before': len(original), 'after': len(encoded), 'alphaExact': True, 'lossless': lossless}

    with ThreadPoolExecutor(max_workers=2) as pool:
        images = list(pool.map(convert, sorted(root.rglob('*.png'))))
    for path in sorted(root.rglob('*')):
        if path.suffix in {'.js', '.mjs', '.json', '.html'}:
            text = path.read_text()
            if '.png' in text:
                path.write_text(text.replace('.png', '.webp'))

    compressed = {}
    models = []
    sources = [(p, p.read_bytes()) for p in sorted(root.rglob('*.glb'))]
    for manifest in sorted(root.rglob('*.glb.parts.json')):
        info = json.loads(manifest.read_text())
        data = b''.join((manifest.parent / p).read_bytes() for p in info['parts'])
        if len(data) != info['size']:
            raise ValueError('Incomplete model parts')
        sources.append((Path(str(manifest)[:-len('.parts.json')]), data))
    for path, data in sources:
        packed = gzip.compress(data, compresslevel=6, mtime=0)
        if len(packed) >= len(data) * .95 or len(packed) > 24 * 2**20:
            continue
        if gzip.decompress(packed) != data:
            raise ValueError('Model roundtrip changed')
        Path(str(path) + '.gz').write_bytes(packed)
        url = './' + path.relative_to(root).as_posix()
        compressed[url] = url + '.gz'
        models.append({'file': path.relative_to(root).as_posix(), 'before': len(data), 'after': len(packed), 'exact': True})
    viewer = root / 'viewer.js'
    text = viewer.read_text()
    marker = 'async function fetchAssetBuffer(url,signal){'
    if text.count(marker) != 1:
        raise ValueError('Asset loader not found')
    prefix = "const COMPRESSED_ASSETS=" + json.dumps(compressed) + ";\n"
    loader = "if(typeof DecompressionStream==='function'&&COMPRESSED_ASSETS[url]){try{const response=await fetch(COMPRESSED_ASSETS[url],{signal});if(!response.ok)throw Error('Compressed asset '+response.status);const packed=await readAssetResponse(response);return await new Response(new Blob([packed]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();}catch(error){if(signal?.aborted)throw error;console.warn('Using original model',url);}}"
    viewer.write_text(prefix + text.replace(marker, marker + loader))
    report = {'images': images, 'models': models}
    if cache:
        (cache.parent / 'optimization-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
    print('Optimized:', len(images), 'images', round(sum(x['before']-x['after'] for x in images)/1e6, 1), 'MB saved;', len(models), 'models', round(sum(x['before']-x['after'] for x in models)/1e6, 1), 'MB saved', flush=True)


if __name__ == '__main__':
    import sys
    optimize_player(sys.argv[1])
