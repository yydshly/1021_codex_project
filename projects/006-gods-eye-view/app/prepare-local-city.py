"""Download an attributed, bounded Lyon sample and georeference it for Cesium."""
import copy
import hashlib
import json
import math
from pathlib import Path
import struct
import subprocess
from concurrent.futures import ThreadPoolExecutor

from pyproj import Transformer

APP = Path(__file__).resolve().parent
OUT = APP / "data" / "lyon"
BASE = "https://dataset-dl.liris.cnrs.fr/three-d-tiles-lyon-metropolis"
SOURCE = BASE + "/2018/Lyon-1_2018_Textured/"
COUNT = 16


def download(url, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.is_file() and path.stat().st_size:
        return
    partial = path.with_suffix(path.suffix + ".part")
    subprocess.run(
        ["curl.exe", "-fsSL", "--retry", "3", "--retry-all-errors", "--connect-timeout", "15",
         "--max-time", "120", url, "-o", str(partial)], check=True
    )
    partial.replace(path)


def read_gltf(path):
    data = path.read_bytes()
    if data[:4] != b"b3dm":
        raise ValueError(f"Not a b3dm tile: {path}")
    header = struct.unpack_from("<7I", data)
    offset = 28 + sum(header[3:7])
    if data[offset:offset + 4] != b"glTF":
        raise ValueError("Expected embedded GLB")
    length = struct.unpack_from("<I", data, offset + 12)[0]
    return json.loads(data[offset + 20:offset + 20 + length])


def download_tile(tile):
    uri = tile["content"]["uri"]
    target = OUT / uri
    download(SOURCE + uri, target)
    gltf = read_gltf(target)
    for item in gltf.get("images", []) + gltf.get("buffers", []):
        dependency = item.get("uri")
        if not dependency or dependency.startswith("data:"):
            continue
        if "://" in dependency or ".." in Path(dependency).parts:
            raise ValueError(f"Unexpected external dependency: {dependency}")
        path = target.parent / dependency
        download(SOURCE + path.relative_to(OUT).as_posix(), path)
    return uri


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    original = OUT / "source-tileset.json"
    download(SOURCE + "tileset.json", original)
    source = json.loads(original.read_text())
    branches = sorted(
        source["root"]["children"],
        key=lambda t: (t["transform"][12] - 1842300) ** 2
        + (t["transform"][13] - 5176200) ** 2,
    )[:COUNT]
    ecef = Transformer.from_crs(3946, 4978, always_xy=True)
    geo = Transformer.from_crs(3946, 4326, always_xy=True)
    children, corners = [], []
    for branch in branches:
        leaf = branch
        # Use the provider's penultimate texture LOD (about 2048 px).
        # Full-resolution atlases exhaust the browser's GPU cache for this area.
        while leaf.get("children") and leaf["children"][0].get("children"):
            leaf = leaf["children"][0]
        child = copy.deepcopy(leaf)
        child.pop("children", None)
        x, y, z = branch["transform"][12:15]
        origin = ecef.transform(x, y, z)
        axes = [
            [b - a for a, b in zip(origin, ecef.transform(x+dx, y+dy, z+dz))]
            for dx, dy, dz in [(1, 0, 0), (0, 1, 0), (0, 0, 1)]
        ]
        child["transform"] = [v for axis in axes for v in (*axis, 0)] + [*origin, 1]
        child["geometricError"] = 0
        children.append(child)
        box = child["boundingVolume"]["box"]
        for sx in (-1, 1):
            for sy in (-1, 1):
                for sz in (-1, 1):
                    local = [box[i]+sx*box[i+3]+sy*box[i+6]+sz*box[i+9] for i in range(3)]
                    corners.append([origin[i]+sum(axes[j][i]*local[j] for j in range(3)) for i in range(3)])
    center = [(min(p[i] for p in corners)+max(p[i] for p in corners))/2 for i in range(3)]
    radius = max(math.dist(center, p) for p in corners)
    tileset = {
        "asset": {"version": "1.0", "copyright": "Metropole de Lyon / LIRIS VCity — Etalab Open Licence 2.0"},
        "geometricError": 1000,
        "root": {"boundingVolume": {"sphere": [*center, radius]}, "geometricError": 1000,
                 "refine": "ADD", "children": children},
    }
    (OUT / "tileset.json").write_text(json.dumps(tileset), encoding="utf-8")
    with ThreadPoolExecutor(max_workers=4) as pool:
        for uri in pool.map(download_tile, children):
            print(f"Ready {uri}", flush=True)
    download(BASE + "/README.txt", OUT / "SOURCE-README.txt")
    download(BASE + "/ETALAB-Licence-Ouverte-v2.0_EN.pdf", OUT / "LICENSE.pdf")
    active_files = {OUT / name for name in ("source-tileset.json", "tileset.json", "SOURCE-README.txt", "LICENSE.pdf")}
    for child in children:
        path = OUT / child["content"]["uri"]
        active_files.add(path)
        gltf = read_gltf(path)
        for item in gltf.get("images", []) + gltf.get("buffers", []):
            uri = item.get("uri", "")
            if uri and not uri.startswith("data:"):
                active_files.add(path.parent / uri)
    lon, lat = geo.transform(1842300, 5176200)
    manifest = {
        "name": "法国里昂 · 2018 年建筑街区", "source": SOURCE,
        "license": "Etalab Open Licence 2.0", "blocks": COUNT,
        "center": [lon, lat], "tileset": "/local-city-data/lyon/tileset.json",
        "note": "EPSG:3946 converted using local affine frames; source Z retained without geoid correction. Visualization only.",
        "files": [
            {"path": p.relative_to(OUT).as_posix(), "bytes": p.stat().st_size,
             "sha256": hashlib.sha256(p.read_bytes()).hexdigest()}
            for p in sorted(active_files)
        ],
    }
    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"blocks": COUNT, "center": manifest["center"],
                      "bytes": sum(f["bytes"] for f in manifest["files"])}, ensure_ascii=False))


if __name__ == "__main__":
    main()
