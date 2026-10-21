"""Verify cached tiles, embedded photographic textures and local dependency closure."""
import hashlib
import json
from pathlib import Path
import struct
from urllib.parse import unquote, urljoin, urlsplit

ROOT = Path(__file__).resolve().parent / 'data/hefei'
manifest = json.loads((ROOT / 'manifest.json').read_text(encoding='utf-8'))


def resolve(relative):
    value = unquote(relative)
    assert not urlsplit(value).scheme and not value.startswith('/') and '\\' not in value, relative
    target = (ROOT / value).resolve()
    assert target.is_relative_to(ROOT.resolve()), relative
    return target


records = {record['path']: record for record in manifest['files']}
for relative, record in records.items():
    data = resolve(relative).read_bytes()
    assert len(data) == record['bytes'], relative
    assert hashlib.sha256(data).hexdigest() == record['sha256'], relative

documents, payloads = set(), set()


def visit(relative):
    assert relative in records, relative
    if relative in documents:
        return
    documents.add(relative)
    document = json.loads(resolve(relative).read_bytes())

    def walk(tile):
        for content in tile.get('contents', []) + ([tile['content']] if 'content' in tile else []):
            dependency = urljoin(relative, content.get('uri', content.get('url')))
            resolve(dependency)
            assert dependency in records, dependency
            if dependency.endswith('.json'):
                visit(dependency)
            else:
                assert dependency.endswith('.glb'), dependency
                payloads.add(dependency)
        for child in tile.get('children', []):
            walk(child)

    walk(document['root'])


visit('tileset.json')
assert len(payloads) == manifest['blocks'] > 0
root_tile = json.loads(resolve('tileset.json').read_bytes())['root']
origin = root_tile['transform'][12:15]
assert 6_000_000 < sum(v * v for v in origin)**0.5 < 6_500_000
textures, primitives = 0, 0
dimensions = set()
for relative in sorted(payloads):
    data = resolve(relative).read_bytes()
    magic, version, total = struct.unpack_from('<4sII', data)
    assert magic == b'glTF' and version == 2 and total == len(data), relative
    chunks, offset = [], 12
    while offset < len(data):
        size, kind = struct.unpack_from('<II', data, offset)
        assert size % 4 == 0 and offset + 8 + size <= len(data), relative
        chunks.append((kind, data[offset + 8:offset + 8 + size]))
        offset += 8 + size
    assert offset == len(data) and chunks[0][0] == 0x4E4F534A
    gltf = json.loads(chunks[0][1])
    binary = [value for kind, value in chunks if kind == 0x004E4942]
    assert len(binary) == 1 and len(gltf['buffers']) == 1, relative
    assert 'uri' not in gltf['buffers'][0], relative
    assert 0 <= len(binary[0]) - gltf['buffers'][0]['byteLength'] <= 3
    for view in gltf['bufferViews']:
        assert view['buffer'] == 0
        assert 0 <= view.get('byteOffset', 0) < gltf['buffers'][0]['byteLength']
        assert view.get('byteOffset', 0) + view['byteLength'] <= gltf['buffers'][0]['byteLength']
    for image in gltf.get('images', []):
        assert 'uri' not in image and image['mimeType'] == 'image/ktx2', relative
        view = gltf['bufferViews'][image['bufferView']]
        start = view.get('byteOffset', 0)
        encoded = binary[0][start:start + view['byteLength']]
        assert encoded[:12] == b'\xabKTX 20\xbb\r\n\x1a\n' and len(encoded) > 1000, relative
        width, height = struct.unpack_from('<II', encoded, 20)
        assert width > 0 and height > 0
        dimensions.add((width, height))
        textures += 1
    for mesh in gltf['meshes']:
        for primitive in mesh['primitives']:
            draco = primitive['extensions']['KHR_draco_mesh_compression']
            assert gltf['bufferViews'][draco['bufferView']]['byteLength'] > 0
            material = gltf['materials'][primitive['material']]
            texture_index = material['pbrMetallicRoughness']['baseColorTexture']['index']
            image_index = gltf['textures'][texture_index]['source']
            assert 0 <= image_index < len(gltf['images']), relative
            primitives += 1

assert textures == manifest['textures'] > 0
assert set(records) == documents | payloads | {'SOURCE-AND-USAGE.md'}
box = root_tile['boundingVolume']['box']
print(json.dumps({
    'tiles': len(payloads), 'tilesetDocuments': len(documents),
    'embeddedPhotographicTextures': textures, 'texturedPrimitives': primitives,
    'textureDimensions': sorted(dimensions),
    'bytes': sum(record['bytes'] for record in records.values()),
    'approximateExtentMeters': [round(2 * abs(box[3])), round(2 * abs(box[7]))],
    'checksums': 'passed', 'externalModelUrls': 0,
    'checks': ['dependency closure', 'GLB chunks and binary ranges',
               'embedded KTX2 images', 'material-to-image bindings', 'ECEF origin'],
}, ensure_ascii=False, indent=2))
