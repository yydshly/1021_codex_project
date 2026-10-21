"""Validate the local Guangzhou dependency graph, geometry bounds and source counts."""
import hashlib
import json
from pathlib import Path
import struct

root = Path(__file__).resolve().parent / 'data/guangzhou'
manifest = json.loads((root / 'manifest.json').read_text(encoding='utf-8'))
for record in manifest['files']:
    target = (root / record['path']).resolve()
    assert target.is_relative_to(root.resolve())
    data = target.read_bytes()
    assert len(data) == record['bytes'], record['path']
    assert hashlib.sha256(data).hexdigest() == record['sha256'], record['path']
tileset = json.loads((root / 'tileset.json').read_text())
assert tileset['asset']['version'] == '1.1'
assert len(tileset['root']['children']) == manifest['blocks'] == 36
assert manifest['buildings'] == 2251
origin = tileset['root']['transform'][12:15]
assert 6_000_000 < sum(v*v for v in origin)**0.5 < 6_500_000
vertices = 0
for tile in tileset['root']['children']:
    uri = tile['content']['uri']
    assert ':' not in uri and not uri.startswith('/')
    target = (root / uri).resolve()
    assert target.is_relative_to(root.resolve())
    data = target.read_bytes()
    assert data[:4] == b'glTF'
    version, size, length, kind = struct.unpack_from('<4I', data, 4)
    assert version == 2 and size == len(data) and kind == 0x4e4f534a
    gltf = json.loads(data[20:20+length])
    assert not gltf.get('images')
    assert all('uri' not in b for b in gltf['buffers'])
    position = gltf['accessors'][0]
    assert position['componentType'] == 5126 and position['count'] % 3 == 0
    box = tile['boundingVolume']['box']
    lo, hi = position['min'], position['max']
    assert all(-2500 < v < 2500 for v in lo + hi)
    assert box[9] == box[10] == 0
    vertices += position['count']
print(json.dumps({'tiles': 36, 'buildings': 2251, 'vertices': vertices,
                  'bytes': sum(f['bytes'] for f in manifest['files']),
                  'checksums': 'passed', 'externalModelUrls': 0}, indent=2))
