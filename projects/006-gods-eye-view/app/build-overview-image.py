"""Render one comprehensive, editable research poster as PNG and SVG.

Uses local evidence and screenshots only; no provider requests or credentials.
Requires Pillow and Microsoft YaHei (font paths may be overridden).
"""
import argparse
import base64
import hashlib
import html
import json
import math
from pathlib import Path
import re

from PIL import Image, ImageDraw, ImageFont
from PIL import __version__ as pillow_version

ROOT = Path(__file__).resolve().parents[1]
CONTENT = Path(__file__).with_name('overview-content.json')
ASSETS = ROOT / 'assets'
STEM = 'research-overview-20261022'
WIDTH, MARGIN = 3600, 96
INNER = WIDTH - 2 * MARGIN
COLORS = {
    'paper': '#f6f4ec', 'ink': '#203e33', 'muted': '#536a5b',
    'green': '#1a5541', 'soft': '#e9eee2', 'line': '#ccd7c7',
    'white': '#fffef8', 'amber': '#805d25', 'amber-bg': '#f3ecd9',
    'red': '#994d36', 'red-bg': '#f5e7de', 'pale': '#d5e3d5',
}


class Poster:
    def __init__(self, regular, bold):
        self.regular, self.bold = regular, bold
        self.fonts = {}
        self.commands = []
        self.bounds = []
        self.measure = ImageDraw.Draw(Image.new('RGB', (1, 1)))

    def font(self, size, bold=False):
        key = (size, bold)
        if key not in self.fonts:
            self.fonts[key] = ImageFont.truetype(str(self.bold if bold else self.regular), size)
        return self.fonts[key]

    def wrap(self, value, width, size, bold=False):
        font = self.font(size, bold)
        lines = []
        for paragraph in value.split('\n'):
            current = ''
            for token in re.findall(r'[A-Za-z0-9_./:+≥²×—−-]+|\s+|.', paragraph):
                trial = current + token
                if self.measure.textlength(trial, font=font) <= width:
                    current = trial
                    continue
                # Chinese line-breaking: keep closing punctuation with the preceding text.
                if token in '，。；：！？、）】》”’' and current:
                    tail = re.search(r'([A-Za-z0-9]+|.)$', current)[0]
                    if current[:-len(tail)].strip():
                        lines.append(current[:-len(tail)].rstrip())
                        current = tail + token
                        continue
                if current.endswith(('（', '【', '《', '“')):
                    token = current[-1] + token
                    current = current[:-1]
                if current.strip():
                    lines.append(current.rstrip())
                current = token.lstrip()
                if self.measure.textlength(current, font=font) > width:
                    fragment = ''
                    for char in current:
                        if fragment and self.measure.textlength(fragment + char, font=font) > width:
                            lines.append(fragment)
                            fragment = char
                        else:
                            fragment += char
                    current = fragment
            if current.strip() or not paragraph:
                lines.append(current.rstrip())
        assert ''.join(lines).replace(' ', '') == value.replace('\n', '').replace(' ', ''), 'Text lost during wrapping.'
        return lines

    def text(self, x, y, value, width, size=32, bold=False, fill=None, leading=1.45):
        fill = fill or COLORS['ink']
        lines = self.wrap(value, width, size, bold)
        step = round(size * leading)
        ascent = self.font(size, bold).getmetrics()[0]
        for i, line in enumerate(lines):
            assert self.measure.textlength(line, font=self.font(size, bold)) <= width + 1
            self.commands.append(('text', x, y + i * step + ascent, line, size, bold, fill))
        bottom = y + len(lines) * step
        self.bounds.append((x, y, x + width, bottom))
        return bottom

    def rect(self, x, y, w, h, fill, radius=0, stroke=None):
        self.commands.append(('rect', x, y, w, h, fill, radius, stroke))

    def line(self, x1, y1, x2, y2, color=None, width=2):
        self.commands.append(('line', x1, y1, x2, y2, color or COLORS['line'], width))

    def arrow(self, x1, y, x2):
        self.line(x1, y, x2 - 12, y, COLORS['green'], 3)
        self.commands.append(('polygon', [(x2, y), (x2 - 14, y - 9), (x2 - 14, y + 9)], COLORS['green']))

    def picture(self, path, x, y, w, h):
        self.commands.append(('image', path, x, y, w, h))

    def render(self, height):
        assert all(0 <= x1 < x2 <= WIDTH and 0 <= y1 < y2 <= height for x1, y1, x2, y2 in self.bounds)
        canvas = Image.new('RGB', (WIDTH, height), COLORS['paper'])
        draw = ImageDraw.Draw(canvas)
        svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{height}" viewBox="0 0 {WIDTH} {height}" role="img" aria-labelledby="poster-title poster-desc">',
               '<title id="poster-title">God’s Eye View 能力、来源、效果与研究价值总览</title>',
               '<desc id="poster-desc">含 11 类来源对应表、补充专题、三张历史实机截图、信息呈现能力、价值优先级、国内验证与许可边界。</desc>',
               f'<rect width="{WIDTH}" height="{height}" fill="{COLORS["paper"]}"/>']
        for command in self.commands:
            kind, *args = command
            if kind == 'rect':
                x, y, w, h, fill, radius, stroke = args
                draw.rounded_rectangle((x, y, x + w, y + h), radius=radius, fill=fill, outline=stroke, width=2)
                svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}" stroke="{stroke or "none"}" stroke-width="2"/>')
            elif kind == 'line':
                x1, y1, x2, y2, color, line_width = args
                draw.line((x1, y1, x2, y2), fill=color, width=line_width)
                svg.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{line_width}"/>')
            elif kind == 'polygon':
                points, fill = args
                draw.polygon(points, fill=fill)
                svg.append(f'<polygon points="{" ".join(f"{x},{y}" for x,y in points)}" fill="{fill}"/>')
            elif kind == 'text':
                x, baseline, value, size, bold, fill = args
                draw.text((x, baseline), value, font=self.font(size, bold), fill=fill, anchor='ls')
                svg.append(f'<text x="{x}" y="{baseline}" font-family="Microsoft YaHei, PingFang SC, Noto Sans CJK SC, sans-serif" font-size="{size}" font-weight="{700 if bold else 400}" fill="{fill}">{html.escape(value)}</text>')
            elif kind == 'image':
                path, x, y, w, h = args
                with Image.open(path) as image:
                    image = image.convert('RGB')
                    ratio = min(w / image.width, h / image.height)
                    image = image.resize((round(image.width * ratio), round(image.height * ratio)), Image.Resampling.LANCZOS)
                    px, py = x + (w - image.width) // 2, y + (h - image.height) // 2
                    canvas.paste(image, (px, py))
                encoded = base64.b64encode(path.read_bytes()).decode('ascii')
                svg.append(f'<image x="{x}" y="{y}" width="{w}" height="{h}" preserveAspectRatio="xMidYMid meet" href="data:image/png;base64,{encoded}"/>')
        svg.append('</svg>')
        png_path, svg_path = ASSETS / f'{STEM}.png', ASSETS / f'{STEM}.svg'
        canvas.save(png_path, optimize=True, dpi=(180, 180))
        svg_path.write_text('\n'.join(svg), encoding='utf-8', newline='\n')
        return canvas, png_path, svg_path


def heading(poster, y, number, title, note=''):
    poster.text(MARGIN, y, f'{number} / {title}', INNER, 47, True)
    y += 79
    if note:
        y = poster.text(MARGIN, y, note, INNER, 29, fill=COLORS['muted']) + 22
    return y


def cards(poster, y, entries, columns=3, size=32, title_size=36, fill=None):
    gap, pad = 26, 28
    width = (INNER - (columns - 1) * gap) // columns
    heights = []
    for title, body in entries:
        title_h = len(poster.wrap(title, width - 2 * pad, title_size, True)) * round(title_size * 1.45)
        body_h = len(poster.wrap(body, width - 2 * pad, size)) * round(size * 1.45)
        heights.append(2 * pad + title_h + 16 + body_h)
    row_height = max(heights)
    for i, (title, body) in enumerate(entries):
        x, top = MARGIN + (i % columns) * (width + gap), y + (i // columns) * (row_height + gap)
        poster.rect(x, top, width, row_height, fill or COLORS['white'], 12, COLORS['line'])
        below = poster.text(x + pad, top + pad, title, width - 2 * pad, title_size, True)
        poster.text(x + pad, below + 16, body, width - 2 * pad, size, fill=COLORS['muted'])
    return y + math.ceil(len(entries) / columns) * (row_height + gap)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--font', default='C:/Windows/Fonts/msyh.ttc')
    parser.add_argument('--bold-font', default='C:/Windows/Fonts/msyhbd.ttc')
    args = parser.parse_args()
    data = json.loads(CONTENT.read_text(encoding='utf-8'))
    assert len(data['sources']) == 11 and len(data['screenshots']) == 3
    p = Poster(Path(args.font), Path(args.bold_font))
    p.rect(0, 0, WIDTH, 360, COLORS['ink'])
    p.text(MARGIN, 36, '006 / 开源项目研究 · 一图总览', INNER, 30, fill=COLORS['pale'])
    p.text(MARGIN, 97, data['title'], INNER, 88, True, COLORS['white'])
    p.text(MARGIN, 226, data['subtitle'], INNER, 42, fill=COLORS['pale'])
    y = 405
    y = p.text(MARGIN, y, '本质：把分散的公开地理信息，按位置与时间组织进同一个三维地球。', INNER, 43, True) + 20
    y = p.text(MARGIN, y, f'固定版 0.2.1 · 汇总 {data["compiled"]} · 历史证据 {data["evidencePeriod"]}；选型理由为本研究依据代码的归纳。', INNER, 28, fill=COLORS['muted']) + 35
    steps = [
        ('研究问题', '我们需要解释什么？'), ('信号身份', '观测／资料／计算／模拟'),
        ('具体来源', '谁发布？覆盖哪里？'), ('获取与校验', '协议、字段、时间、许可'),
        ('地球与交互', '定位、图层、对象、近景'), ('研究判断', '证据能支撑什么？'),
    ]
    gap = 34
    step_width = (INNER - gap * 5) // 6
    for i, (title, detail) in enumerate(steps):
        x = MARGIN + i * (step_width + gap)
        p.rect(x, y, step_width, 156, COLORS['soft'], 12)
        p.text(x + 25, y + 22, title, step_width - 50, 37, True)
        p.text(x + 25, y + 82, detail, step_width - 50, 26, fill=COLORS['muted'])
        if i < 5:
            p.arrow(x + step_width + 5, y + 78, x + step_width + gap - 4)
    y += 205

    y = heading(p, y, '01', '能力、方向与来源逐项对应', '11 类为本研究分组，不是功能数量上限。下表的呈现是上游能力路径；验证程度以最后一列为准。')
    widths = [430, 790, 765, 780, 643]
    assert sum(widths) == INNER
    xs = [MARGIN]
    for width in widths[:-1]:
        xs.append(xs[-1] + width)
    labels = ['方向 / 为什么取', '来源 / 取得什么', '如何获取 / 凭据', '呈现效果 / 研究用途', '国内与本机证据（历史）']
    p.rect(MARGIN, y, INNER, 86, COLORS['green'], 10)
    for x, width, label in zip(xs, widths, labels):
        p.text(x + 22, y + 20, label, width - 44, 31, True, COLORS['white'])
    y += 86
    for index, row in enumerate(data['sources']):
        body_values = [row['source'], row['method'], row['effect'], row['evidence']]
        sizes = [31, 31, 31, 30]
        cell_heights = [len(p.wrap(value, width - 44, size)) * round(size * 1.45)
                        for value, width, size in zip(body_values, widths[1:], sizes)]
        name_h = len(p.wrap(row['name'], widths[0] - 44, 35, True)) * 51
        question_h = len(p.wrap(row['question'], widths[0] - 44, 28)) * 41
        height = max(max(cell_heights), name_h + question_h + 15) + 44
        p.rect(MARGIN, y, INNER, height, COLORS['white'] if index % 2 == 0 else '#eef1e7')
        label_end = p.text(xs[0] + 22, y + 22, row['name'], widths[0] - 44, 35, True)
        p.text(xs[0] + 22, label_end + 15, row['question'], widths[0] - 44, 28, fill=COLORS['muted'])
        status_fill = {'partial':COLORS['soft'], 'pending':COLORS['amber-bg'], 'failed':COLORS['red-bg']}[row['status']]
        p.rect(xs[4], y + 1, widths[4], height - 2, status_fill)
        for x, width, value, size in zip(xs[1:], widths[1:], body_values, sizes):
            color = COLORS['red'] if row['status'] == 'failed' and x == xs[4] else COLORS['ink']
            p.text(x + 22, y + 22, value, width - 44, size, fill=color)
        p.line(MARGIN, y + height, WIDTH - MARGIN, y + height)
        y += height
    y += 22
    y = p.text(MARGIN, y, '证据色：浅绿＝局部实测／格式入口证据；浅金＝未实测；浅红＝该次请求失败。均不代表全国、全时段或完整业务可用。', INNER, 27, fill=COLORS['muted']) + 37
    y = cards(p, y, data['extras'], columns=4, size=28, title_size=34) + 25

    y = heading(p, y, '02', '实际效果：数据类型决定能看见什么', '以下为本机历史截图，非实时预览。摄影三维需要既有网格＋纹理；影像、地形、白模和摄影模型是不同数据层。')
    gap = 30
    shot_w = (INNER - gap * 2) // 3
    shot_h = round(shot_w * 9 / 16)
    caption_h = 222
    for i, shot in enumerate(data['screenshots']):
        x = MARGIN + i * (shot_w + gap)
        p.rect(x, y, shot_w, shot_h + caption_h, COLORS['white'], 10, COLORS['line'])
        p.picture(ASSETS / shot['file'], x, y, shot_w, shot_h)
        below = p.text(x + 24, y + shot_h + 21, shot['title'], shot_w - 48, 34, True)
        bottom = p.text(x + 24, below + 13, shot['text'], shot_w - 48, 28, fill=COLORS['muted'])
        assert bottom < y + shot_h + caption_h
    y += shot_h + caption_h + 25
    y = p.text(MARGIN, y, '另有里昂 2018 年带纹理模型：16 块、约 8.8 MB，非国内。高程未精密转换；本次已停止继续找模型。更好引擎或反复下载不能补出源数据没有的精度。', INNER, 28, fill=COLORS['muted']) + 38
    y = cards(p, y, data['presentation'], size=30, title_size=35) + 28

    y = heading(p, y, '03', '对我们的意义：按优先级吸收')
    y = cards(p, y, data['values'], size=32, title_size=37, fill=COLORS['soft']) + 20
    p.rect(MARGIN, y, INNER, 212, COLORS['ink'], 12)
    below = p.text(MARGIN + 30, y + 22, '迁移到西藏／新疆：先有问题，再选择来源（建议，尚未接入旧项目）', INNER - 60, 36, True, COLORS['white'])
    p.text(MARGIN + 30, below + 14,
           '某次环境：地形＋匹配时次天气；沿线联系：道路＋地点设施＋带日期近景。\n长期环境另找多年气候／河流／植被；历史文化另找相应年代史料、历史地名与路线证据。',
           INNER - 60, 31, fill=COLORS['pale'])
    y += 250

    y = heading(p, y, '04', '必须一起带走的证据与边界')
    boundaries = [
        ('真实 / 计算 / 模拟分别看', '飞机、船位和事件有观测来源；风场是模式值，卫星是参数推算，影像／街景有拍摄年代；道路小车、滤镜和检测框不等于逐车观测、热传感或视觉识别。'),
        ('国内可用性要逐层判断', '12 个入口中 10 个基础格式通过、2 个未获 HTTP 响应；不等于 10 类业务跑通。网络可达 → 格式 → 目标区数据 → 用途适用；未做大陆直连或跨运营商审计。'),
        ('免费、Key 与离线分别判断', '基础地图可无 Key；Google／ion、AIS、FIRMS、Mapillary、TomTom、语音等按能力配置。免费、额度与商用条件各异；缓存／下载按源站条款，在线可看≠可整城镜像，本地模型复读≠整套离线。'),
        ('还有哪些缺口', '国内完整航班／船舶／摄像头、街景播放、完整风场、Google 三维等未验。国内候选为 CMA、地震科学数据中心、天地图，均未接入；人口、产业、史料等也需另找。'),
    ]
    y = cards(p, y, boundaries, columns=2, size=31, title_size=36) + 25
    y = p.text(MARGIN, y, '研究落地：选一个区域、一个问题、一条链路，完成 取数 → 校验 → 图层／属性 → 时间与来源 → 证据核对，再扩大范围。', INNER, 34, True) + 35
    p.line(MARGIN, y, WIDTH - MARGIN, y)
    y += 25
    y = p.text(MARGIN, y, '依据：STUDY-GUIDE.md、INFORMATION-SOURCES.md、RUNNING.md、source-probe-20261021.json 及本机实际截图。', INNER, 26, fill=COLORS['muted']) + 10
    y = p.text(MARGIN, y, f'上游：github.com/bilawalsidhu/gods-eye-view · 固定 Commit {data["version"].split(" / ")[1]}', INNER, 25, fill=COLORS['muted']) + 10
    y = p.text(MARGIN, y, '代码 MIT；数据、影像、模型和服务分别适用独立条件。此图为研究快照，未代表 2026-10-22 重新取数或验证全部功能。', INNER, 26, fill=COLORS['muted']) + 45

    canvas, png, svg = p.render(math.ceil(y))
    guide_preview = canvas.copy()
    guide_preview.thumbnail((900, 1600), Image.Resampling.LANCZOS)
    guide_path = ASSETS / f'{STEM}-preview.webp'
    guide_preview.save(guide_path, quality=90, method=6)
    proof = canvas.copy()
    proof.thumbnail((1200, 2400), Image.Resampling.LANCZOS)
    preview = ROOT / 'app/.logs/overview-preview.png'
    proof.save(preview)
    inputs = [CONTENT, Path(__file__), *(ASSETS / s['file'] for s in data['screenshots']),
              ROOT / 'STUDY-GUIDE.md', ROOT / 'INFORMATION-SOURCES.md', ROOT / 'RUNNING.md',
              ASSETS / 'source-probe-20261021.json']
    manifest = {'compiled':data['compiled'], 'evidencePeriod':data['evidencePeriod'],
                'renderer':{'pillow':pillow_version, 'regularFont':str(args.font), 'boldFont':str(args.bold_font)},
                'dimensions':[WIDTH, canvas.height], 'sourceGroups':11, 'screenshots':3,
                'inputs':{path.relative_to(ROOT).as_posix():hashlib.sha256(path.read_bytes()).hexdigest() for path in inputs},
                'outputs':{path.name:hashlib.sha256(path.read_bytes()).hexdigest() for path in (png, svg, guide_path)}}
    (ASSETS / f'{STEM}.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8', newline='\n')
    print(json.dumps({'png':str(png), 'svg':str(svg), 'size':[WIDTH,canvas.height], 'preview':str(preview)}, ensure_ascii=False))


if __name__ == '__main__':
    main()
