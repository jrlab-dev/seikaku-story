"""Pin the module graph to the bytes produced by this player build."""
import hashlib
import json
import os
from pathlib import Path
import re


def version_player(destination):
    root = Path(destination)
    entry = root / 'web_J38' / 'index.html'
    html = entry.read_text(encoding='utf-8')
    pattern = r'(<script\s+type="importmap">)(.*?)(</script>)'
    match = re.search(pattern, html, re.S)
    if not match:
        raise ValueError('Player import map is missing')
    mapping = json.loads(match.group(2))
    imports = mapping.setdefault('imports', {})
    versions = {}
    for path in sorted(root.rglob('*')):
        if not path.is_file() or path.suffix not in {'.js', '.mjs'}:
            continue
        relative = os.path.relpath(path, entry.parent).replace(os.sep, '/')
        if not relative.startswith('.'):
            relative = './' + relative
        digest = hashlib.sha256(path.read_bytes()).hexdigest()[:16]
        versions[relative] = relative + '?v=' + digest
    # Retain bare specifiers (including three), but pin their destinations too.
    for key, value in list(imports.items()):
        imports[key] = versions.get(value.split('?')[0], value)
    imports.update(versions)
    payload = json.dumps(mapping, ensure_ascii=False, separators=(',', ':'), sort_keys=True)
    html = html[:match.start(2)] + payload + html[match.end(2):]
    # Script entry URLs are not resolved through an import map.
    def pin_entry(match):
        url = match.group(2).split('?')[0]
        if url not in versions:
            raise ValueError('Unversioned player entry: ' + url)
        return match.group(1) + versions[url] + match.group(3)
    html = re.sub(r'(<script\s+type="module"\s+src=")([^"]+)(")', pin_entry, html)
    build = hashlib.sha256(payload.encode()).hexdigest()[:16]
    html = re.sub(r'\sdata-player-build="[^"]*"', '', html)
    html = html.replace('<body', '<body data-player-build="' + build + '"', 1)
    entry.write_text(html, encoding='utf-8')
    return {'build': build, 'modules': len(versions)}


if __name__ == '__main__':
    import sys
    print(json.dumps(version_player(sys.argv[1])))
