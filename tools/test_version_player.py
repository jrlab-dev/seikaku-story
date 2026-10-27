import json
from pathlib import Path
import re
import tempfile
import unittest
from version_player import version_player


class ModuleVersionsTest(unittest.TestCase):
    def test_dependencies_and_idempotence(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            web = root / 'web_J38'
            web.mkdir()
            (root / 'vendor').mkdir()
            (root / 'vendor' / 'three.module.js').write_text('export const a=1;')
            dependency = web / 'dep.mjs'
            dependency.write_text('export const value=1;')
            (web / 'viewer.js').write_text('import {value} from "./dep.mjs";')
            entry = web / 'index.html'
            entry.write_text('<script type="importmap">{"imports":{"three":"../vendor/three.module.js"}}</script><body><script type="module" src="./viewer.js"></script>')
            first = version_player(root)
            html = entry.read_text()
            mapping = json.loads(re.search(r'type="importmap">(.*?)</script>', html)[1])['imports']
            self.assertEqual(mapping['three'], mapping['../vendor/three.module.js'])
            self.assertIn('src="' + mapping['./viewer.js'] + '"', html)
            self.assertIn('data-player-build="' + first['build'] + '"', html)
            self.assertEqual(first['modules'], 3)
            self.assertEqual(version_player(root), first)
            self.assertEqual(entry.read_text(), html)
            dependency.write_text('export const value=2;')
            second = version_player(root)
            self.assertNotEqual(second['build'], first['build'])
            self.assertNotIn(mapping['./dep.mjs'], entry.read_text())
            self.assertEqual(entry.read_text().count('data-player-build='), 1)


if __name__ == '__main__':
    unittest.main()
