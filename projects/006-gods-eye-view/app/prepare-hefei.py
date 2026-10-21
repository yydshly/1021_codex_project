"""Cache the provider's complete, bounded Hefei photogrammetry test sample."""
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
from pathlib import Path, PurePosixPath
import struct
import subprocess
from urllib.parse import quote, urljoin, urlsplit, unquote

APP = Path(__file__).resolve().parent
OUT = APP / 'data/hefei'
BASE = 'https://opensource.cdn.icegl.cn/3Dtiles/' + quote('合肥_天鹅湖') + '/'
PAGE = 'https://www.icegl.cn/tvtstore/gisPlaneEditor'


def local_path(relative):
    value = unquote(relative)
    if urlsplit(value).scheme or value.startswith('/') or '\\' in value:
        raise ValueError(f'Unexpected asset URI: {relative}')
    path = (OUT / value).resolve()
    if not path.is_relative_to(OUT.resolve()):
        raise ValueError(f'Asset escapes local directory: {relative}')
    return path


def download(relative):
    path = local_path(relative)
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.is_file() and path.stat().st_size:
        return path
    part = path.with_suffix(path.suffix + '.part')
    url = BASE + quote(unquote(relative), safe='/+_.-')
    subprocess.run(['curl.exe', '-fsSL', '--retry', '2', '--connect-timeout', '15',
                    '--max-time', '120', url, '-o', str(part)], check=True)
    part.replace(path)
    return path


def read_glb(path):
    data = path.read_bytes()
    assert data[:4] == b'glTF', path
    version, total, length, kind = struct.unpack_from('<4I', data, 4)
    assert version == 2 and total == len(data) and kind == 0x4e4f534a, path
    return json.loads(data[20:20+length])


def collect(relative, documents, payloads):
    if relative in documents:
        return
    documents.add(relative)
    document = json.loads(download(relative).read_bytes())

    def walk(tile):
        contents = tile.get('contents', []) + ([tile['content']] if 'content' in tile else [])
        for content in contents:
            uri = content.get('uri', content.get('url'))
            resolved = urljoin(relative, uri)
            local_path(resolved)
            if resolved.endswith('.json'):
                collect(resolved, documents, payloads)
            elif resolved.endswith('.glb'):
                payloads.add(resolved)
            else:
                raise ValueError(f'Unrecognised model payload: {resolved}')
        for child in tile.get('children', []):
            walk(child)

    walk(document['root'])


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    documents, payloads = set(), set()
    collect('tileset.json', documents, payloads)
    if len(payloads) > 100 or len(documents) > 10:
        raise ValueError('Provider sample changed unexpectedly; refusing unbounded download')
    with ThreadPoolExecutor(max_workers=4) as pool:
        for path in pool.map(download, sorted(payloads)):
            print(f'Ready {path.relative_to(OUT)} ({path.stat().st_size:,} bytes)', flush=True)
    textures = 0
    extensions = set()
    for relative in sorted(payloads):
        gltf = read_glb(local_path(relative))
        textures += len(gltf.get('images', []))
        extensions.update(gltf.get('extensionsUsed', []))
        for item in gltf.get('images', []) + gltf.get('buffers', []):
            if item.get('uri'):
                dependency = item['uri']
                if dependency.startswith('data:'):
                    continue
                resolved = urljoin(relative, dependency)
                download(resolved)
                documents.add(resolved)
    source_statement = (
        '# 合肥天鹅湖倾斜摄影公开测试样例\n\n'
        f'分发方：ICE 图形学社区。公开测试地址与用途说明：{PAGE}\n\n'
        f'模型入口：{BASE}tileset.json\n\n'
        '发布页明确列为“测试用倾斜摄影、3d tiles地址”。本项目仅将该有界样例缓存到本机作学习研究演示。'
        '没有取得原始航测数据的商业使用或公开再分发许可证，不将插件/SDK的代码许可证套用到模型。'
        '数据目录不提交 Git，不提供公共模型下载站。生产或商业使用需向数据权利人另行核实授权。\n\n'
        '保留原始 3D Tiles / GLB 几何与摄影纹理，不贴通用纹理、不从二维底图生成立面。'
        '此为发布方提供的多层级测试包，精细程度受原始样例限制，采集日期未核实。\n'
    )
    (OUT / 'SOURCE-AND-USAGE.md').write_text(source_statement, encoding='utf-8')
    active = sorted(documents | payloads | {'SOURCE-AND-USAGE.md'})
    files = []
    for relative in active:
        data = local_path(relative).read_bytes()
        files.append({'path': relative, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()})
    manifest = {
        'name': '合肥 · 天鹅湖倾斜摄影', 'source': BASE, 'sourcePage': PAGE,
        'license': '公开测试样例；原始航测商业及公开再分发授权未核实',
        'blocks': len(payloads), 'textures': textures, 'extensions': sorted(extensions),
        'tileset': '/local-city-data/hefei/tileset.json', 'files': files,
        'note': '原始摄影网格与内嵌摄影纹理；完整缓存发布方此入口引用的所有层级。采集时间未核实。',
    }
    (OUT / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'tiles': len(payloads), 'textures': textures,
                      'bytes': sum(f['bytes'] for f in files), 'extensions': sorted(extensions)}, ensure_ascii=False), flush=True)


if __name__ == '__main__':
    main()
