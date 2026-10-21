"""Check the complete local asset dependency graph and recorded checksums."""
import hashlib
import json
from pathlib import Path
import struct

root = Path(__file__).resolve().parent / "data/lyon"
manifest = json.loads((root / "manifest.json").read_text(encoding="utf-8"))
for record in manifest["files"]:
    data = (root / record["path"]).read_bytes()
    assert len(data) == record["bytes"], record["path"]
    assert hashlib.sha256(data).hexdigest() == record["sha256"], record["path"]

tileset = json.loads((root / "tileset.json").read_text())
assert len(tileset["root"]["children"]) == manifest["blocks"] == 16
features = 0
dependencies = set()
for tile in tileset["root"]["children"]:
    position = tile["transform"][12:15]
    assert 6_000_000 < sum(v*v for v in position) ** 0.5 < 6_500_000
    uri = tile["content"]["uri"]
    assert not uri.startswith(("/", "http:","https:"))
    tile_path = root / uri
    data = tile_path.read_bytes()
    assert data[:4] == b"b3dm"
    header = struct.unpack_from("<7I", data)
    assert header[2] == len(data)
    feature_table = json.loads(data[28:28+header[3]])
    features += feature_table.get("BATCH_LENGTH", 0)
    offset = 28 + sum(header[3:7])
    assert data[offset:offset+4] == b"glTF"
    length = struct.unpack_from("<I", data, offset+12)[0]
    gltf = json.loads(data[offset+20:offset+20+length])
    for item in gltf.get("images", []) + gltf.get("buffers", []):
        dependency = item.get("uri", "")
        if not dependency or dependency.startswith("data:"):
            continue
        assert "://" not in dependency
        resolved = (tile_path.parent / dependency).resolve()
        assert resolved.is_relative_to(root.resolve())
        assert resolved.is_file() and resolved.stat().st_size > 0
        dependencies.add(str(resolved))
print(json.dumps({"tiles": 16, "features": features, "localDependencies": len(dependencies),
                  "bytes": sum(r["bytes"] for r in manifest["files"]),
                  "checksums": "passed", "externalModelUrls": 0}, indent=2))
