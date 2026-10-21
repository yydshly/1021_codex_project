"""Build the static research page from the checked-in Markdown and probe summary."""
import hashlib
import html
import json
from pathlib import Path
import re
import shutil
from urllib.parse import quote, unquote, urlsplit

import markdown

PROJECT = Path(__file__).resolve().parents[1]
SOURCE = PROJECT / 'app/research-web'
WEB = PROJECT / 'web'
SOURCE_REPOSITORY = 'https://github.com/yydshly/1021_codex_project/blob/main/projects/006-gods-eye-view/'
READERS = {
    'README.md': 'overview.html',
    'STUDY-GUIDE.md': 'guide.html',
    'REVIEW.md': 'review.html',
    'INFORMATION-SOURCES.md': 'research.html',
    'RUNNING.md': 'practice.html',
    'notes.md': 'notes.html',
    'app/LOCAL-DATA.md': 'local-data.html',
    'web/README.md': 'web-guide.html',
}
GROUPS = [
    ('space', '空间背景', '局部实测', ''),
    ('moving', '移动目标', '有响应 · 覆盖有限', ''),
    ('moving', '移动目标', '未实测订阅', 'pending'),
    ('moving', '移动目标', '基本格式已测', ''),
    ('environment', '环境与事件', '接口已测', ''),
    ('environment', '环境与事件', '未配置 Key', 'pending'),
    ('environment', '环境与事件', '部分入口已测', ''),
    ('ground', '现场材料', '目录请求失败', 'failed'),
    ('ground', '现场材料', '未验证覆盖', 'pending'),
    ('connections', '地方联系', '部分未验证', 'pending'),
    ('connections', '地方联系', '区域差异 · 未验证', 'pending'),
]
PROBE_LABELS = {
    'esri': ('Esri 地图元数据', '描述文件可读；上海影像另有此前浏览器证据。'),
    'osm-tile': ('OSM 全球层级瓦片', '仅检查一张 PNG，未验证中国道路查询。'),
    'reearth-terrain': ('Re:Earth 地形描述', '仅描述文件，未检查实际地形分块。'),
    'opensky-shanghai': ('OpenSky · 上海框', '东经 120–123°、北纬 30–32.5°；空响应不等于没有飞机。'),
    'adsblol-shanghai': ('adsb.lol · 浦东周边', '250 海里圆形范围；不等于上海或大陆航班数量。'),
    'celestrak-stations': ('CelesTrak · stations', '只检查 TLE 行对，不代表全量目录或传播精度。'),
    'usgs-day': ('USGS · 一日目录', '全球目录；未核对中国子集与国内完整性。'),
    'gfs-bucket': ('GFS · S3 桶目录', '仅对象目录，未读取或解码完整风场。'),
    'ecmwf-index': ('ECMWF · 预报目录', '仅 HTML 页面及链接结构，未验证具体 GRIB2 文件。'),
    'openmeteo-shanghai': ('Open-Meteo · 上海点位', '当前时次模式字段，未与站点实测对照。'),
    'hk-cctv-catalog': ('香港 · 相机目录', 'URLError / Errno 2，原因未定位；未取得图片。'),
    'taiwan-cctv-catalog': ('台湾 · 相机目录', 'URLError / Errno 2，原因未定位；未取得图片。'),
}


def public_url(target, origin):
    target = html.unescape(target)
    parsed = urlsplit(target)
    if parsed.scheme or target.startswith(('#', '//')):
        return html.escape(target, quote=True)
    path = (origin.parent / unquote(parsed.path)).resolve()
    if not path.is_relative_to(PROJECT.resolve()):
        raise ValueError(f'Link escapes project: {target}')
    relative = path.relative_to(PROJECT.resolve()).as_posix()
    if relative == 'web/index.html':
        destination = 'index.html'
    elif relative in READERS:
        destination = READERS[relative]
    else:
        if not path.is_file():
            raise ValueError(f'Missing linked artifact: {target} from {origin}')
        if relative.startswith(('app/data/', 'app/upstream/', 'app/.logs/', 'app/.runtime/')):
            raise ValueError(f'Private runtime directory cannot be exported: {relative}')
        if path.suffix.lower() in {'.cmd', '.ps1', '.py', '.js'}:
            # Show complete repository context; a lone downloaded launcher cannot run.
            destination = SOURCE_REPOSITORY + quote(relative, safe='/')
            if parsed.fragment:
                destination += '#' + parsed.fragment
            return html.escape(destination, quote=True)
        if path.suffix.lower() not in {'.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.json', '.txt', '.cmd', '.ps1', '.py', '.js'}:
            raise ValueError(f'Artifact needs explicit public export review: {relative}')
        destination = relative if relative.startswith('assets/') else f'files/{relative}'
        exported = WEB / destination
        exported.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, exported)
    if parsed.fragment:
        destination += '#' + parsed.fragment
    return html.escape(destination, quote=True)


def render(text, origin):
    value = markdown.markdown(text, extensions=['tables', 'fenced_code', 'sane_lists', 'toc'])
    value = re.sub(r'(href|src)="([^"]+)"', lambda m: f'{m[1]}="{public_url(m[2], origin)}"', value)
    value = re.sub(r'<a href="(https?://[^"]+)"', r'<a target="_blank" rel="noreferrer" href="\1"', value)
    return value


def study_body(text, origin):
    # Keep wide research tables scrollable without widening the entire page.
    return render(text, origin).replace('<table>', '<div class="table-scroll" role="region" aria-label="研究对照表" tabindex="0"><table>').replace('</table>', '</table></div>')


def namespace_fragment(body, prefix):
    # Markdown fragments independently generate heading IDs; scope them on the shared homepage.
    for identity in set(re.findall(r'\bid="([^"]+)"', body)):
        body = body.replace(f'id="{identity}"', f'id="{prefix}{identity}"')
        body = body.replace(f'href="#{identity}"', f'href="#{prefix}{identity}"')
    return body


def reader_page(title, body, annotation=''):
    return f'''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(title)} · God’s Eye View 研究</title><link rel="icon" href="icon.svg" type="image/svg+xml"><link rel="stylesheet" href="style.css"></head><body><main class="reader-shell"><nav class="reader-top" aria-label="研究阅读导航"><a href="index.html">← 返回研究网页</a><a href="guide.html">理解与取舍</a><a href="research.html">来源详表</a><a href="practice.html">实践记录</a><a href="notes.html">研究过程</a></nav>{f'<p class="reader-caption">{annotation}</p>' if annotation else ''}<article class="reader">{body}</article></main></body></html>'''


def study_sections():
    path = PROJECT / 'STUDY-GUIDE.md'
    sections = dict(re.findall(r'^## (\d+)\. [^\n]+\n(.*?)(?=^## |\Z)', path.read_text(encoding='utf-8'), re.M | re.S))
    assert set(sections) == {str(i) for i in range(1, 11)}, 'Review study section mapping.'
    rendered = {number: namespace_fragment(study_body(body, path), f'study-{number}-') for number, body in sections.items()}
    questions = re.findall(r'^### ([^\n]+)\n(.*?)(?=^### |\Z)', sections['8'], re.M | re.S)
    assert len(questions) == 8, 'Review FAQ content.'
    rendered['8'] = '\n'.join(f'<details class="faq-item"><summary>{html.escape(question)}</summary><div>{render(answer, path)}</div></details>' for question, answer in questions)
    return rendered


def effect_gallery():
    examples = json.loads((SOURCE / 'effects.json').read_text(encoding='utf-8'))
    buttons, panels = [], []
    for index, example in enumerate(examples):
        identity = f'effect-{index + 1}'
        image = public_url(example['image'], PROJECT / 'README.md')
        buttons.append(f'<button type="button" data-effect="{identity}" aria-controls="{identity}" aria-pressed="{str(index == 0).lower()}">{html.escape(example["label"])}</button>')
        panels.append(f'''<figure class="effect-panel" id="{identity}" {"" if index == 0 else "hidden"}><figcaption><div><span class="eyebrow">{html.escape(example['kind'])} / 历史实机截图</span><h3>{html.escape(example['title'])}</h3><p>{html.escape(example['description'])}</p></div><a class="text-link" href="practice.html">来源与验证记录 ↗</a></figcaption><a href="{image}" target="_blank" rel="noreferrer" title="打开原始截图"><img src="{image}" width="1265" height="713" loading="lazy" alt="{html.escape(example['alt'], quote=True)}"></a></figure>''')
    return '<div class="effect-buttons" role="group" aria-label="切换实际效果">' + ''.join(buttons) + '</div><div class="effect-panels">' + '\n'.join(panels) + '</div>'


def main():
    WEB.mkdir(parents=True, exist_ok=True)
    legacy_files = WEB / 'files'
    if legacy_files.exists():
        expected = WEB.resolve() / 'files'
        if legacy_files.is_symlink() or legacy_files.resolve() != expected or expected.parent != WEB.resolve():
            raise ValueError(f'Unsafe generated export directory: {legacy_files}')
        print(f'Removing obsolete generated script exports inside verified path: {expected}')
        shutil.rmtree(legacy_files)
    for asset in ('style.css', 'app.js', 'icon.svg'):
        shutil.copy2(SOURCE / asset, WEB / asset)
    doc_path = PROJECT / 'INFORMATION-SOURCES.md'
    text = doc_path.read_text(encoding='utf-8')
    block = text.split('## 2. 主要来源详表', 1)[1].split('<a id="acquisition">', 1)[0]
    sections = re.findall(r'### 2\.(\d+) ([^\n]+)\n(.*?)(?=\n### 2\.|\Z)', block, re.S)
    assert len(sections) == len(GROUPS) == 11, 'Source catalog changed; review group labels.'
    cards = []
    for (number, title, body), (group, label, status, state) in zip(sections, GROUPS):
        purpose = re.search(r'- \*\*为什么获取：\*\*([^\n]+)', body)[1]
        content = namespace_fragment(study_body(body, doc_path), f'source-{number}-detail-')
        cards.append(f'''<details class="source-card" id="source-{number}" data-group="{group}"><summary><span class="source-num">{int(number):02d}</span><span class="source-copy"><span class="source-meta"><span class="source-category">{label}</span><span class="badge {state}">{status}</span></span><strong class="source-title">{html.escape(title)}</strong><span class="source-purpose">{html.escape(purpose)}</span></span><span class="source-toggle" aria-hidden="true">+</span></summary><div class="source-body">{content}</div></details>''')
    report_path = PROJECT / 'assets/source-probe-20261021.json'
    report = json.loads(report_path.read_text(encoding='utf-8'))
    results = report['results']
    assert len(results) == 12 and sum(r['outcome'] == 'format-validated' for r in results) == 10
    rows = []
    for row in results:
        name, limit = PROBE_LABELS[row['source']]
        failed = row['outcome'] != 'format-validated'
        status = '未取得 HTTP 响应' if failed else f"HTTP {row['httpStatus']} · 基础格式通过"
        summary = row.get('summary', {})
        if 'records' in summary:
            status = f"HTTP {row['httpStatus']} · {summary['records']} 条记录"
        if 'elementSets' in summary:
            status = f"HTTP {row['httpStatus']} · {summary['elementSets']} 组行对"
        if 'magnitudeAtLeast2_5' in summary:
            status += f"，M≥2.5 为 {summary['magnitudeAtLeast2_5']} 条"
        rows.append(f'<tr><td>{html.escape(name)}</td><td><span class="result-dot {"failed" if failed else ""}"></span>{html.escape(status)}</td><td>{html.escape(limit)}</td></tr>')
    page = (SOURCE / 'index.template.html').read_text(encoding='utf-8')
    page = page.replace('__SOURCE_CARDS__', '\n'.join(cards)).replace('__EVIDENCE_ROWS__', '\n'.join(rows))
    for number, content in study_sections().items():
        token = f'__STUDY_{number}__'
        assert token in page, f'Missing homepage study section {number}'
        page = page.replace(token, content)
    page = page.replace('__EFFECT_GALLERY__', effect_gallery())
    assert not re.search(r'__[A-Z_0-9]+__', page), 'Unfilled template token.'
    (WEB / 'index.html').write_text(page, encoding='utf-8', newline='\n')
    for origin, destination in READERS.items():
        path = PROJECT / origin
        content = path.read_text(encoding='utf-8')
        title = content.splitlines()[0].lstrip('# ')
        annotation = '本页为此前实机记录。原地球应用需要单独启动；截图与本地接口结果按记录日期理解。' if origin == 'RUNNING.md' else ''
        (WEB / destination).write_text(reader_page(title, render(content, path), annotation), encoding='utf-8', newline='\n')
    public_url('assets/source-probe-20261021.json', PROJECT / 'README.md')
    inputs = [*READERS, 'assets/source-probe-20261021.json', 'app/build-research-web.py',
              *(f'app/research-web/{name}' for name in ('index.template.html', 'style.css', 'app.js', 'effects.json', 'icon.svg'))]
    manifest = {'researchVersion': '0.2.1', 'sourceCards': len(cards), 'probeEntries': len(results),
                'scope': 'Full study, capability map, real screenshots, source catalog, saved probes and document readers; no live provider requests.',
                'inputs': {name: hashlib.sha256((PROJECT / name).read_bytes()).hexdigest() for name in inputs}}
    (WEB / 'build-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8', newline='\n')
    print(f'Built {WEB}: 10 study sections, 11 source cards, 12 evidence rows, {len(READERS)} document readers.')


if __name__ == '__main__':
    main()
