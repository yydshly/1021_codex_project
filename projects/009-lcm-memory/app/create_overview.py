"""Render an original, source-grounded LCM architecture poster as SVG and PNG.

Requires Pillow and Microsoft YaHei on Windows. The webpage itself has no
third-party runtime dependency. All explanatory content is authored here.
"""
from pathlib import Path
import html
import math
from PIL import Image, ImageDraw, ImageFont

PROJECT = Path(__file__).resolve().parents[1]
WIDTH, HEIGHT = 2400, 4220
PAPER, INK, MUTED = "#f2f0e8", "#202a24", "#606a61"
GREEN, PALE, ORANGE, LINE = "#354c3c", "#e5eadb", "#b9502a", "#cbd2bf"
WHITE, WARM = "#faf9f4", "#eee4d6"
COMMIT = "0c17dbffda452cf7fae46929af427dff355aeaa3"


class Poster:
    def __init__(self):
        self.image = Image.new("RGB", (WIDTH, HEIGHT), PAPER)
        self.draw = ImageDraw.Draw(self.image)
        self.svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{HEIGHT}" viewBox="0 0 {WIDTH} {HEIGHT}" role="img" aria-labelledby="title description">',
                    '<title id="title">LCM 的本质：AI 的外部项目记忆</title>',
                    '<desc id="description">用模块说明用户、编程工具、Hooks、MCP、LCM 本地数据库、摘要模型、检索返回上下文的关系，并列出场景、意义、限制与源码版本。</desc>',
                    '<view id="architecture" viewBox="0 500 2400 1385"/>',
                    '<view id="lifecycle" viewBox="0 1900 2400 450"/>',
                    '<view id="retrieval" viewBox="0 2340 2400 700"/>',
                    '<view id="scenarios" viewBox="0 3040 2400 530"/>',
                    '<view id="limits" viewBox="0 3570 2400 650"/>',
                    f'<rect width="{WIDTH}" height="{HEIGHT}" fill="{PAPER}"/>']
        self.fonts = {}

    def font(self, size, bold=False):
        key = (size, bold)
        if key not in self.fonts:
            name = "msyhbd.ttc" if bold else "msyh.ttc"
            self.fonts[key] = ImageFont.truetype(str(Path("C:/Windows/Fonts") / name), size)
        return self.fonts[key]

    def rect(self, x, y, w, h, fill=WHITE, stroke=LINE, radius=14):
        self.draw.rounded_rectangle((x, y, x+w, y+h), radius, fill, stroke, 2)
        self.svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}" stroke="{stroke}" stroke-width="2"/>')

    def text(self, x, y, text, size=30, color=INK, bold=False):
        font = self.font(size, bold)
        self.draw.text((x, y), text, font=font, fill=color, anchor="lt")
        # Use the same measured ascent as Pillow, so SVG and PNG share baselines.
        ascent = font.getmetrics()[0]
        self.svg.append(f'<text x="{x}" y="{y+ascent}" font-family="Microsoft YaHei, sans-serif" font-size="{size}" font-weight="{700 if bold else 400}" fill="{color}">{html.escape(text)}</text>')

    def paragraph(self, x, y, text, width, size=29, color=MUTED, bold=False, leading=1.55):
        font = self.font(size, bold)
        lines = []
        for original in text.split("\n"):
            line = ""
            for char in original:
                if line and self.draw.textlength(line + char, font=font) > width:
                    lines.append(line); line = char
                else:
                    line += char
            lines.append(line)
        for line in lines:
            self.text(x, y, line, size, color, bold)
            y += round(size * leading)
        return y

    def arrow(self, points, color=GREEN, width=5):
        self.draw.line(points, fill=color, width=width, joint="curve")
        end, previous = points[-1], points[-2]
        angle = math.atan2(end[1]-previous[1], end[0]-previous[0])
        head = [end, (end[0]-17*math.cos(angle-.48), end[1]-17*math.sin(angle-.48)), (end[0]-17*math.cos(angle+.48), end[1]-17*math.sin(angle+.48))]
        self.draw.polygon(head, fill=color)
        self.svg.append(f'<polyline points="{" ".join(f"{x},{y}" for x,y in points)}" fill="none" stroke="{color}" stroke-width="{width}" stroke-linejoin="round"/>')
        self.svg.append(f'<polygon points="{" ".join(f"{x},{y}" for x,y in head)}" fill="{color}"/>')

    def heading(self, y, number, title, note=None):
        self.text(80, y, number, 30, ORANGE, True)
        self.text(150, y-4, title, 40, INK, True)
        if note:
            self.text(150, y+51, note, 26, MUTED)


def main():
    p = Poster()
    p.text(80, 60, "009 / OPEN SOURCE RESEARCH / LCM", 25, ORANGE, True)
    p.text(80, 118, "LCM 的本质：AI 的外部项目记忆", 74, INK, True)
    p.text(80, 225, "把交互过程变成可检索、可追溯、可跨会话使用的项目档案。", 34)
    p.rect(80, 300, 2240, 170, GREEN, GREEN)
    p.text(125, 335, "交互信息  →  保存与整理  →  按需找回  →  进入当前上下文", 44, WHITE, True)
    p.text(125, 410, "模型负责推理与判断；LCM 管理外部记录、摘要与记忆查询。", 30, "#d8e0cb")

    p.heading(530, "01", "参与者与交互入口", "接入发生在 AI 编程工具这一层。当前上下文是本轮可读材料，外部数据库保留更多历史。")
    for x, w, title, body in [(80,480,"用户 / 当前任务","问题、约束、决定与反馈"), (670,1060,"AI 编程工具 + 模型","Claude Code / Codex / OMP 等受支持路径"), (1840,480,"当前上下文","供本轮推理读取的材料")]:
        p.rect(x, 635, w, 150, PALE)
        p.text(x+28, 661, title, 35, INK, True)
        p.paragraph(x+28, 718, body, w-56, 26)
    p.arrow([(565,710),(653,710)])
    p.arrow([(1823,710),(1747,710)])
    p.arrow([(840,785),(840,855),(340,855),(340,885)])
    p.arrow([(1560,785),(1560,855),(2060,855),(2060,885)])
    p.text(990, 811, "工具触发事件 / 模型发起工具调用", 27, MUTED)

    # Both entry points write and read. Their arrows represent logical requests,
    # rather than asserting one identical transport for all integrations.
    p.rect(80, 890, 520, 920, WHITE)
    p.text(115, 926, "Hooks", 52, GREEN, True)
    p.text(115, 995, "自动触发的交互入口", 30, ORANGE, True)
    p.paragraph(115, 1058, "会话开始\n恢复项目 / 会话背景", 450, 31)
    p.paragraph(115, 1180, "提交问题\n搜索并注入相关提示", 450, 31)
    p.paragraph(115, 1302, "一轮结束 / 会话结束\n增量捕获交互记录", 450, 31)
    p.paragraph(115, 1424, "上下文压缩前\n保存记录、整理摘要", 450, 31)
    p.rect(110, 1575, 460, 196, PALE)
    p.paragraph(134, 1600, "既能写入，也能召回。\n返回内容通过宿主附加\n到模型的上下文。", 412, 29, GREEN)

    p.rect(680, 890, 1040, 920, GREEN, GREEN)
    p.text(718, 928, "LCM · 外部记忆运行时", 45, WHITE, True)
    p.text(718, 997, "本地服务 + 按项目组织的 SQLite", 29, "#d2ddc6")
    blocks = [(1072,"A / 原始历史","messages / message_parts","消息、角色、顺序、解析到的工具输入输出；入库前脱敏。"),
              (1242,"B / 工作上下文","context_items + summaries","近期原文 + 分层摘要；关系指针连接摘要与来源。"),
              (1412,"C / 长期条目","promoted + 全文索引","筛选 / 主动保存的结论，带标签、来源、时间和信号强度。")]
    for y, title, table, body in blocks:
        p.rect(710, y, 980, 148, "#f1f3e8", "#d7dfc9")
        p.text(738, y+19, title, 32, INK, True)
        p.text(1110, y+24, table, 25, GREEN)
        p.paragraph(738, y+78, body, 920, 27)
    p.paragraph(720, 1602, "摘要模型：调用配置的模型，将消息 → 摘要 → 更高层摘要。\n正常压缩替换上下文引用，保留原始历史与来源关系。\n长期条目可跨会话使用；历史层也可以包含久远记录。", 960, 28, "#e5ebdc", leading=1.65)

    p.rect(1800, 890, 520, 920, WHITE)
    p.text(1835, 926, "MCP / CLI", 48, GREEN, True)
    p.text(1835, 995, "AI 主动调用的入口", 30, ORANGE, True)
    for y, title, body in [(1058,"search / grep","查相关历史或精确文本"),(1180,"describe / expand","看元数据、展开摘要来源"),(1302,"store","明确保存值得复用的结论")]:
        p.text(1835, y, title, 33, INK, True)
        p.paragraph(1835, y+55, body, 450, 29)
    p.paragraph(1835, 1430, "AI 结合上下文组织查询，\n读取返回结果，再判断\n是否追查、采用或更新。", 450, 29)
    p.rect(1830, 1575, 460, 196, WARM)
    p.paragraph(1854, 1600, "既能查询，也能写入。\nMCP 是工具接口；\n调用时机由 AI 决定。", 412, 29, INK)
    p.arrow([(600,1135),(678,1135)], GREEN)
    p.arrow([(678,1492),(600,1492)], ORANGE)
    p.arrow([(1800,1135),(1722,1135)], GREEN)
    p.arrow([(1722,1492),(1800,1492)], ORANGE)
    p.text(88, 1843, "箭头含义：绿色 → 请求 / 写入；橙色 → 返回结果。实际事件与返回方式因客户端而异。", 27, MUTED)

    p.heading(1930, "02", "记忆怎样形成：保存过程，再建立可复用线索")
    steps = [("捕获", "接入会话记录\n与操作结果"), ("保存", "解析、脱敏\n按会话入库"), ("摘要", "旧消息分层整理\n保留来源指针"), ("长期登记", "摘要规则 / 事件\n或主动 store"), ("检索", "查历史与条目\n排序、去重、裁剪"), ("使用", "片段送回上下文\nAI 查证并判断")]
    for i,(title,body) in enumerate(steps):
        x = 80 + i*380
        p.rect(x, 2015, 340, 235, PALE if i%2==0 else WHITE)
        p.text(x+24, 2040, f"0{i+1}", 27, ORANGE, True)
        p.text(x+24, 2085, title, 34, INK, True)
        p.paragraph(x+24, 2144, body, 292, 26)
        if i<5: p.arrow([(x+347,2130),(x+373,2130)], GREEN, 4)
    p.text(84, 2280, "这是功能链路示意；各环节由不同事件触发，主动 store 可以直接写入长期条目。", 27, MUTED)

    p.heading(2365, "03", "取回记忆的三条路径", "没有统一的“智能短期 / 长期分配器”：主要是文本检索、规则筛选，再由 AI 判断。")
    p.rect(80, 2465, 2240, 115, PALE)
    p.text(110, 2490, "启动恢复", 34, GREEN, True)
    p.paragraph(380, 2490, "按项目、会话与启动原因选取已有背景；尚未围绕某个具体问题搜索。", 1880, 29)
    for x, title, lines in [(80,"自动提示 / Hooks", ["当前问题 → 查询词 → FTS5 / BM25 候选", "长期提示：匹配度 × 新鲜度 × 会话关联 × 使用加成", "再考虑未使用、陈旧、冷却等规则；去重并裁剪。", "默认最多 3 条短提示，另受字节预算限制。"]),
                             (1230,"主动追查 / MCP 或 CLI", ["AI 结合当前上下文改写 / 缩小 / 翻译查询", "search 查历史和长期条目；grep 查精确文本。", "describe 看来源；expand 沿摘要关系查原文。", "主动 search 不套自动提示的时间衰减公式。"] )]:
        p.rect(x, 2610, 1090, 340, WHITE)
        p.text(x+30, 2640, title, 35, INK, True)
        for i,line in enumerate(lines): p.paragraph(x+30, 2708+i*52, line, 1030, 27)
    p.text(82, 2980, "客户端差异：Codex / OMP 的自动提示可补历史；研究版本的 Claude 路径主要查长期条目。", 27, MUTED)

    p.heading(3070, "04", "使用场景 → 直接价值 → 实际意义")
    scenarios = [("持续研究 / 新开会话", "找回背景、约束、未完成事项", "减少重复交代，维持工作连续性"),
                 ("长周期排错 / 重复故障", "查到失败尝试、修复与测试范围", "减少重复排查，复用经验需核对环境"),
                 ("决策追溯 / 方案演进", "展开当时的取舍与原始依据", "让结论可解释，新旧冲突仍需查证"),
                 ("受支持客户端接续", "在同一后端查找项目历史", "降低交接成本，自动化程度因接入而异")]
    for i,(title,value,meaning) in enumerate(scenarios):
        y = 3150+i*98
        p.rect(80,y,2240,82,WHITE if i%2==0 else PALE)
        p.text(106,y+24,title,29,INK,True)
        p.text(680,y+25,value,28,GREEN)
        p.text(1430,y+25,meaning,27,MUTED)

    p.heading(3600, "05", "价值成立的条件与边界")
    boundaries = [("留存", "捕获得到、解析成功，才有可查记录；脱敏与过滤会改变留存内容。"),
                  ("找回", "词汇重合、指代、语言、年龄和预算都会影响召回；当前主要是全文检索。"),
                  ("正确使用", "摘要可能遗漏；confidence 是信号强度；新旧结论与适用范围仍需核对。"),
                  ("运行与隐私", "本地存储 ≠ 永不外发：外部摘要模型会接收处理后的内容，并带来调用成本。")]
    for i,(title,body) in enumerate(boundaries):
        y = 3685+i*83
        p.text(88,y,title,29,ORANGE,True)
        p.text(335,y,body,29,MUTED)
    p.rect(80, 4040, 2240, 100, GREEN, GREEN)
    p.text(110, 4060, "最终收益依赖：保存完整 → 找回相关 → 依据有效 → AI 正确使用。", 33, WHITE, True)
    p.text(84, 4165, f"源码研究：{COMMIT[:7]} · 2026-10-22 · MIT · 上游未运行实测 / 收益为机制预期", 25, MUTED)
    p.svg.append("</svg>")
    assets = PROJECT / "assets"
    assets.mkdir(exist_ok=True)
    (assets / "lcm-external-memory.svg").write_text("\n".join(p.svg), encoding="utf-8")
    p.image.save(assets / "lcm-external-memory.png", optimize=True)
    print(f"Rendered overview: {WIDTH} × {HEIGHT}")


if __name__ == "__main__":
    main()
