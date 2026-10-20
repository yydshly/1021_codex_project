"""Draw the original research infographic as PNG and editable SVG.

Requires Pillow and Microsoft YaHei fonts on Windows. No upstream art is used.
"""
from pathlib import Path
from html import escape
from math import atan2, cos, sin, pi
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parents[1] / "assets"
W, H = 2880, 2040
PAPER = "#f6f7f1"
INK = "#203d33"
GREEN = "#1c604b"
MUTED = "#64796b"
LINE = "#d8e2d4"
SAGE = "#eaf1e5"
AMBER = "#a96935"
CREAM = "#faf0df"
WHITE = "#ffffff"
FONT = Path("C:/Windows/Fonts/msyh.ttc")
BOLD = Path("C:/Windows/Fonts/msyhbd.ttc")
MONO = Path("C:/Windows/Fonts/consola.ttf")


class Canvas:
    def __init__(self):
        self.image = Image.new("RGB", (W, H), PAPER)
        self.draw = ImageDraw.Draw(self.image)
        self.svg = [
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">',
            '<title>Lark Agent Bridge：从聊天入口到本地执行</title>',
            '<desc>解释库的能力、飞书到本地 agent 的通信链路、适配器职责及未来任务系统建设方向。</desc>',
            f'<rect width="{W}" height="{H}" fill="{PAPER}"/>',
        ]

    def font(self, size, bold=False, mono=False):
        return ImageFont.truetype(str(MONO if mono else BOLD if bold else FONT), size)

    def rect(self, x, y, w, h, fill=WHITE, stroke=LINE, radius=20, width=2):
        self.draw.rounded_rectangle((x, y, x+w, y+h), radius, fill, stroke, width)
        self.svg.append(
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" '
            f'fill="{fill}" stroke="{stroke}" stroke-width="{width}"/>'
        )

    def text(self, text, x, y, size=28, color=INK, bold=False, mono=False):
        self.draw.text((x, y), text, font=self.font(size, bold, mono), fill=color, anchor="lt")
        family = "Consolas,monospace" if mono else "'Microsoft YaHei','Noto Sans CJK SC',sans-serif"
        self.svg.append(
            f'<text x="{x}" y="{y}" fill="{color}" font-family="{family}" font-size="{size}" '
            f'font-weight="{700 if bold else 400}" dominant-baseline="text-before-edge">{escape(text)}</text>'
        )

    def paragraph(self, text, x, y, width, size=28, color=MUTED, bold=False, line_height=1.6):
        lines, line = [], ""
        font = self.font(size, bold)
        for char in text:
            if char == "\n" or (line and self.draw.textlength(line + char, font=font) > width):
                lines.append(line)
                line = "" if char == "\n" else char
            else:
                line += char
        if line:
            lines.append(line)
        for i, value in enumerate(lines):
            self.text(value, x, y + i*size*line_height, size, color, bold)
        return y + len(lines)*size*line_height

    def line(self, points, color=LINE, width=3):
        self.draw.line(points, fill=color, width=width, joint="curve")
        self.svg.append(
            f'<polyline points="{" ".join(f"{x},{y}" for x,y in points)}" fill="none" '
            f'stroke="{color}" stroke-width="{width}" stroke-linejoin="round"/>'
        )

    def arrow(self, points, color=GREEN, width=3, both=False):
        self.line(points, color, width)
        ends = [(points[-2], points[-1])]
        if both:
            ends.append((points[1], points[0]))
        for start, end in ends:
            angle = atan2(end[1]-start[1], end[0]-start[0])
            triangle = [end] + [
                (end[0]-15*cos(angle+offset), end[1]-15*sin(angle+offset))
                for offset in (-pi/7, pi/7)
            ]
            self.draw.polygon(triangle, fill=color)
            self.svg.append(
                f'<polygon points="{" ".join(f"{x:.2f},{y:.2f}" for x,y in triangle)}" fill="{color}"/>'
            )

    def tag(self, text, x, y, fill=SAGE, color=GREEN, size=23):
        width = int(self.draw.textlength(text, font=self.font(size)))+30
        self.rect(x, y, width, size+22, fill, fill, 8)
        self.text(text, x+15, y+10, size, color)
        return width

    def save(self):
        OUT.mkdir(exist_ok=True)
        self.image.save(OUT / "understanding-map.png", optimize=True)
        (OUT / "understanding-map.svg").write_text("\n".join(self.svg + ["</svg>"]), encoding="utf-8")


def main():
    c = Canvas()
    c.rect(84, 72, 8, 43, GREEN, GREEN, 0)
    c.text("研究 002  /  ARCHITECTURE FIELDNOTES", 112, 80, 24, GREEN)
    c.text("Lark Agent Bridge", 84, 140, 76, INK, True)
    c.text("把聊天入口，接到本地 Agent 的执行能力", 87, 242, 38, MUTED)
    c.tag("能力 × 原理 × 适配 × 价值", 2360, 158, size=24)

    # Upper-left: shipped capability, not proposed task orchestration.
    c.rect(84, 340, 700, 700)
    c.text("01", 124, 382, 27, GREEN, mono=True)
    c.text("这个库能做什么", 184, 376, 40, INK, True)
    c.text("飞书里的编程助手遥控入口", 124, 444, 26, MUTED)
    entries = [
        ("接收任务", "私聊、群内 @、图片与文件"),
        ("维护上下文", "关联会话 ID，切换工作目录"),
        ("组织运行", "消息合并、排队、并发限制、停止"),
        ("回传结果", "过程事件、流式卡片、最终回复"),
    ]
    for i, (title, detail) in enumerate(entries):
        y = 520 + i*106
        c.rect(124, y+7, 8, 29, GREEN, GREEN, 2)
        c.text(title, 151, y, 31, INK, True)
        c.paragraph(detail, 151, y+46, 575, 25)
    c.tag("已实现重点：会话管理 + 运行管理", 124, 958, size=23)

    # Upper-right: separate transport and subprocess channels.
    c.rect(816, 340, 1980, 700)
    c.text("02", 860, 382, 27, GREEN, mono=True)
    c.text("一条消息的执行链路", 920, 376, 40, INK, True)
    c.tag("工作原理", 2610, 379, size=22)

    c.rect(872, 579, 250, 180, SAGE, LINE, 16)
    c.text("飞书", 950, 616, 40, GREEN, True)
    c.text("用户消息 / 回复卡片", 892, 687, 22, MUTED)

    c.rect(1370, 490, 550, 365, GREEN, GREEN, 20)
    c.text("本机 Bridge", 1410, 522, 39, WHITE, True)
    for i, label in enumerate(("会话与目录匹配", "消息队列 + 运行调度", "Agent 适配器")):
        y = 596 + i*74
        c.rect(1410, y, 470, 55, "#31745c", "#498168", 8, 1)
        c.text(label, 1430, y+12, 26, WHITE)
        if i < 2:
            c.arrow([(1645, y+56), (1645, y+72)], "#b1ceb8", 2)

    c.rect(2200, 579, 540, 180, SAGE, LINE, 16)
    c.text("本机 Agent CLI", 2257, 616, 38, GREEN, True)
    c.text("Claude Code / Codex", 2284, 685, 29, INK, mono=True)

    c.arrow([(1122, 615), (1370, 615)])
    c.text("WebSocket", 1173, 552, 23, GREEN, mono=True)
    c.text("消息事件", 1200, 580, 22, MUTED)
    c.arrow([(1370, 715), (1122, 715)], "#8a9f82")
    c.text("消息 / 卡片接口", 1162, 736, 22, MUTED)

    c.arrow([(1920, 615), (2200, 615)])
    c.text("启动进程 + stdin", 1952, 552, 23, GREEN)
    c.text("任务与上下文", 1990, 581, 22, MUTED)
    c.arrow([(2200, 715), (1920, 715)], "#8a9f82")
    c.text("stdout 结构化事件", 1960, 736, 22, MUTED)

    c.arrow([(2390, 759), (2390, 795), (2280, 795), (2280, 863)], "#708b68")
    c.arrow([(2550, 759), (2550, 795), (2605, 795), (2605, 863)], "#ad855e", both=True)
    c.text("读取 / 修改 / 执行", 2141, 817, 21, MUTED)
    c.text("请求 / 响应", 2547, 817, 21, AMBER)
    c.rect(2115, 865, 315, 85, "#f0f4eb", LINE, 12)
    c.text("项目文件与工具", 2172, 892, 28, INK, True)
    c.rect(2460, 865, 285, 85, CREAM, "#eadcc6", 12)
    c.text("模型服务（按配置）", 2482, 894, 25, AMBER, True)
    c.text("下一轮：带会话 ID 恢复上下文", 878, 905, 25, GREEN, True)
    c.text("Agent 负责实际执行，Bridge 负责连接与运行组织。", 878, 971, 26, MUTED)

    # Bottom-left: adapter lifecycle contract.
    c.rect(84, 1072, 1340, 628)
    c.text("03", 126, 1117, 27, GREEN, mono=True)
    c.text("适配器：不止转发", 186, 1110, 40, INK, True)
    c.text("把统一执行请求，转换成具体 Agent 的调用", 126, 1182, 28, MUTED)
    adapter_items = [
        ("启动执行", "检查可用性，设置目录、权限与参数"),
        ("传入上下文", "写入任务与附件，传递恢复会话标识"),
        ("统一输出", "文本、工具事件、结果、错误与结束状态"),
        ("控制生命周期", "停止执行、等待退出，向上报告状态"),
    ]
    for i, (title, desc) in enumerate(adapter_items):
        y = 1253+i*80
        c.tag(str(i+1).zfill(2), 126, y-1, size=22)
        c.text(title, 210, y+1, 30, INK, True)
        c.text(desc, 480, y+3, 27, MUTED)
    c.rect(124, 1600, 1260, 62, SAGE, SAGE, 10)
    c.text("分工边界：优先级、任务依赖与验收，由上层任务系统负责。", 147, 1617, 26, GREEN)

    # Bottom-right: immediate utility vs future engineering investment.
    c.rect(1456, 1072, 1340, 628)
    c.text("04", 1498, 1117, 27, GREEN, mono=True)
    c.text("对我们后期的价值", 1558, 1110, 40, INK, True)
    c.text("从一个聊天入口，走向可复用的执行架构", 1498, 1182, 28, MUTED)
    c.tag("直接价值", 1498, 1253, size=24)
    c.text("从聊天发起本机工作，复用项目与工具", 1663, 1261, 29, INK, True)
    c.text("降低远程操作门槛，把结果带回讨论现场。", 1663, 1308, 25, MUTED)
    c.line([(1498, 1364), (2754, 1364)], LINE, 2)
    c.tag("架构复用", 1498, 1391, size=24)
    c.text("两端分别适配，连接更多平台与 Agent", 1663, 1398, 29, INK, True)
    c.text("逐步复用会话关联、事件展示和运行控制。", 1663, 1445, 25, MUTED)
    c.line([(1498, 1500), (2754, 1500)], LINE, 2)
    c.tag("未来设计", 1498, 1520, CREAM, AMBER, size=24)
    c.text("持久化任务、项目隔离、故障恢复、产物验收", 1663, 1527, 27, AMBER, True)
    c.text("这是后续建设方向，不是当前完整实现。", 1663, 1573, 25, MUTED)
    c.text("扩展需匹配接口能力，不是更换名称即可接入。", 1498, 1640, 24, MUTED)

    c.rect(84, 1736, 2712, 172, GREEN, GREEN, 20)
    c.text("飞书提供入口，Bridge 管会话与运行，Agent 执行，验收确认完成。", 136, 1772, 43, WHITE, True)
    c.text("消息 ≠ 任务 ≠ 运行；运行结束 ≠ 目标达成。", 138, 1844, 30, "#bed3bb")
    c.text("研究 002 · 上游 v0.7.1 / 5898681 · 2026-10-20", 88, 1952, 24, MUTED)
    c.text("依据：README 与核心源码；未做真实飞书 / Agent 联调", 2018, 1954, 23, MUTED)
    c.save()
    print(f"Saved {OUT / 'understanding-map.png'} ({W} × {H})")
    print(f"Saved {OUT / 'understanding-map.svg'}")


if __name__ == "__main__":
    main()
