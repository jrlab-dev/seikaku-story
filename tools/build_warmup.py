"""Index a bounded subset of playback assets for gradual HTTP cache warming."""
import gzip
import json
import struct
from pathlib import Path


def build_warmup(destination):
    root = Path(destination) / 'web_J38'
    files = {}

    def add(url):
        url = url.removeprefix('./')
        path = root / url
        if not path.is_file():
            raise ValueError('Missing warmup asset: ' + url)
        files[url] = path.stat().st_size
        return url

    def model(name):
        path = root / 'assets' / (name + '.glb')
        packed = Path(str(path) + '.gz')
        data = path.read_bytes() if path.exists() else gzip.decompress(packed.read_bytes())
        size = struct.unpack_from('<I', data, 12)[0]
        document = json.loads(data[20:20 + size])
        images = [add('assets/' + image['uri']) for image in document.get('images', []) if 'uri' in image]
        result = {'plain': add('assets/' + name + '.glb'), 'images': images}
        if packed.exists():
            result['packed'] = add('assets/' + name + '.glb.gz')
        return result

    portraits = json.loads((root / 'assets/portraits/manifest.json').read_text())
    entry = [add('assets/portraits/manifest.json')] + [add(v['url']) for v in portraits.values()]
    common = [add(p) for p in ['assets/agx_j37_lut.webp', 'assets/road_near.webp', 'assets/sky.jpg', 'assets/terrain_atlas.webp', 'assets/terrain_near.webp', 'assets/vegetation.json', 'assets/ground_grid.json']]
    names = ['environment', 'vegetation_prototypes', 'StrawHouse', 'WoodHouse', 'BrickHouse', 'TentHouse', 'FortressHouse', 'TreehouseHouse', 'KarakuriHouse', 'BunkerHouse', 'CastleHouse', 'KarakuriFortHouse']
    models = {name: model(name) for name in names}
    motion = json.loads((root / 'assets/characters/motion_manifest.json').read_text())
    walks = [{'role': v['characterId'], 'style': v.get('style'), 'url': add(v['url'])} for v in motion['sets'] if v['motion'] == 'walk']
    wolves = [add('intro/wolf' + str(i) + '.mp4') for i in range(10)]
    manifest = {'entry': entry, 'common': common, 'models': models, 'walks': walks, 'wolves': wolves, 'files': files}
    (Path(destination).parent / 'warmup-assets.json').write_text(json.dumps(manifest, ensure_ascii=False, separators=(',', ':')) + '\n')
    print('Warmup manifest:', len(files), 'assets')


if __name__ == '__main__':
    import sys
    build_warmup(sys.argv[1])
