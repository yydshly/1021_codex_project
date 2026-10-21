"""Draw one editable SVG and a matching high-resolution PNG research summary.

Requires Pillow only for PNG export; no model, browser, or remote assets are used.
Counts come from the fixed upstream index; role labels come from labels.json.
"""

from html import escape
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
WIDTH, HEIGHT, SCALE = 2000, 3140, 2
INK, MUTED, GREEN = "#253e35", "#596d63", "#194c40"
PAPER, WHITE, LINE = "#f6f5ef", "#fffefa", "#d8e0d5"
PALE, AMBER, SAND = "#e9eee4", "#9b582c", "#f7edde"

GROUPS = [
    ("增长与客户", [
        ("sales", "客户研究 / 会议 / 商机与续约"),
        ("customer-support", "分诊 / 回复升级 / 知识沉淀"),
        ("marketing", "品牌内容 / 活动邮件 / SEO"),
    ]),
    ("产品与技术", [
        ("product-management", "PRD / 路线图 / 用户研究与指标"),
        ("design", "设计评审 / 开发交付 / 无障碍"),
        ("engineering", "代码调试 / 架构 / 事故与测试"),
        ("data", "SQL / 数据验证 / 分析与看板"),
    ]),
    ("组织与经营", [
        ("finance", "对账分录 / 报表 / 关账与审计"),
        ("legal", "合同与 NDA / 风险 / 签署辅助"),
        ("human-resources", "招聘入职 / 绩效 / 薪酬与政策"),
        ("operations", "SOP / 供应商 / 变更与资源"),
        ("small-business", "账单现金 / 增长 / 经营组合流程"),
    ]),
    ("专业研究与通用能力", [
        ("bio-research", "单细胞 QC / 测序 / 研究工具"),
        ("productivity", "个人任务 / 工作记忆 / 看板"),
        ("enterprise-search", "跨源检索 / 去重综合 / 来源引用"),
        ("cowork-plugin-management", "创建定制 / 组件配置 / 插件打包"),
        ("pdf-viewer", "查看批注 / 填表 / 放置签名图"),
    ]),
]


class Diagram:
    def __init__(self):
        self.image = Image.new("RGB", (WIDTH * SCALE, HEIGHT * SCALE), PAPER)
        self.draw = ImageDraw.Draw(self.image)
        self.svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{HEIGHT}" viewBox="0 0 {WIDTH} {HEIGHT}" role="img" aria-labelledby="title desc">',
                    '<title id="title">Knowledge Work Plugins：插件、Skill、岗位场景与业务落地全景</title>',
                    '<desc id="desc">一张图汇总固定版本的17个顶层插件、181个Skill、角色场景、模型执行方式、白屏工单演示、三层控制与价值。演示客户为虚构，本地HTTP实际运行，Claude调用认证失败。</desc>',
                    f'<rect width="{WIDTH}" height="{HEIGHT}" fill="{PAPER}"/>']
        self.fonts = {}
        self.transcript = []

    def font(self, size, bold=False):
        key = size, bold
        if key not in self.fonts:
            path = "C:/Windows/Fonts/msyhbd.ttc" if bold else "C:/Windows/Fonts/msyh.ttc"
            self.fonts[key] = ImageFont.truetype(path, size * SCALE)
        return self.fonts[key]

    def rect(self, x, y, w, h, fill=WHITE, stroke=None, radius=14):
        box = tuple(round(v * SCALE) for v in (x, y, x + w, y + h))
        self.draw.rounded_rectangle(box, radius=radius*SCALE, fill=fill, outline=stroke, width=SCALE)
        self.svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}" stroke="{stroke or "none"}"/>')

    def line(self, x1, y1, x2, y2, color=LINE, width=2):
        self.draw.line((x1*SCALE,y1*SCALE,x2*SCALE,y2*SCALE), fill=color, width=width*SCALE)
        self.svg.append(f'<path d="M{x1} {y1}L{x2} {y2}" stroke="{color}" stroke-width="{width}"/>')

    def text(self, x, y, value, size=24, color=INK, bold=False):
        assert y >= 0 and y + size < HEIGHT, (value, y)
        self.draw.text((round(x*SCALE), round(y*SCALE)), value, font=self.font(size,bold), fill=color, anchor="lt")
        self.svg.append(f'<text x="{x}" y="{y}" dominant-baseline="text-before-edge" font-family="Microsoft YaHei, Noto Sans CJK SC, sans-serif" font-size="{size}" font-weight="{700 if bold else 400}" fill="{color}">{escape(value)}</text>')
        self.transcript.append(value)

    def wrap(self, x, y, value, width, size=24, color=MUTED, bold=False, leading=None, max_lines=None):
        leading = leading or round(size*1.5)
        lines, current = [], ""
        for ch in value:
            if ch == "\n":
                lines.append(current); current = ""; continue
            if self.draw.textlength(current+ch, font=self.font(size,bold)) > width*SCALE and current:
                lines.append(current); current = ch
            else:
                current += ch
        if current:
            lines.append(current)
        assert max_lines is None or len(lines) <= max_lines, (value, lines)
        for i, line in enumerate(lines):
            self.text(x, y+i*leading, line, size, color, bold)
        return y+len(lines)*leading

    def heading(self, number, title, y, note=None):
        self.text(68, y, number, 28, AMBER, True)
        self.text(128, y-2, title, 32, GREEN, True)
        if note:
            self.text(128, y+43, note, 22, MUTED)

    def arrow(self, x, y, color=GREEN):
        self.line(x, y, x+20, y, color, 3)
        self.line(x+12, y-7, x+20, y, color, 3)
        self.line(x+12, y+7, x+20, y, color, 3)

    def save(self):
        dest = ROOT / "assets"
        dest.mkdir(exist_ok=True)
        self.svg.append('</svg>')
        (dest / "capability-map.svg").write_text("\n".join(self.svg)+"\n", encoding="utf-8")
        self.image.save(dest / "capability-map.png", optimize=True, dpi=(240,240))
        # A small local proof keeps visual inspection cheap; this file is not a new deliverable.
        preview = self.image.resize((1000,1570), Image.Resampling.LANCZOS)
        preview.save(dest / "capability-map-preview.png", optimize=True)


def main():
    index = json.loads((ROOT / "source-index.json").read_text(encoding="utf-8"))
    labels = json.loads((ROOT / "app/labels.json").read_text(encoding="utf-8"))
    roles = {row[0]: row[1] for row in labels["roles"]}
    counts = {p["name"]: len(p["skills"]) for p in index["plugins"]}
    keys = [key for _, items in GROUPS for key, _ in items]
    assert len(keys) == 17 and set(keys) == set(roles) == set(counts)
    assert sum(counts.values()) == 181
    record = json.loads((ROOT / "demo/execution-record.json").read_text(encoding="utf-8"))
    assert len(record["checks"]) == 15
    assert [record["checks"][i]["status"] for i in (3,6,9,10)] == [403,409,200,200]
    d = Diagram()
    d.rect(0,0,WIDTH,210,GREEN,radius=0)
    d.text(68,32,"KNOWLEDGE WORK PLUGINS / 研究 003",21,"#d1dfce")
    d.text(68,79,"把岗位经验，封装成 AI 可复用的工作流",52,WHITE,True)
    d.text(68,151,"插件是包装 · Skill 是方法 · Claude 理解并执行 · 业务系统承担强制控制",25,"#d1dfce")
    d.heading("01","本质：Claude 的业务插件集合",248)
    core = [
        ("Plugin｜按领域打包", "把相关 Skill、命令、连接配置、模板或脚本组织成一个能力包。", "固定版本：17 个顶层插件"),
        ("Skill｜一项任务的操作说明", "规定何时使用、需要什么输入、怎样执行、遵守什么规则、交付什么。", "181 个 Skill，另有 5 个 Command"),
        ("Claude + 工具｜理解与执行", "模型选择步骤、理解材料、生成内容；MCP 或脚本负责取数、计算与操作。", "需要宿主、数据、工具与实际授权"),
    ]
    cw = 600
    for i,(title,body,foot) in enumerate(core):
        x=68+i*632
        d.rect(x,308,cw,186,WHITE,LINE)
        d.text(x+24,329,title,29,GREEN,True)
        d.wrap(x+24,378,body,cw-48,24,max_lines=2)
        d.text(x+24,456,foot,21,AMBER)
        if i<2:d.arrow(x+605,401)
    d.wrap(68,521,"我们的理解：业务 SOP 的可复用知识包。普通对话也能执行同样方法；插件把方法的加载、触发、配置和维护标准化。",1864,25,color=INK,max_lines=2)
    d.heading("02","服务谁、做什么：全 17 类角色与能力",600)
    d.text(128,645,"岗位是使用视角，不是账号身份或权限；181 个入口包含知识、动作和组合流程。",23,MUTED)
    colw=445
    for col,(group,items) in enumerate(GROUPS):
        x=68+col*473
        d.text(x,690,group,25,GREEN,True)
        d.line(x,729,x+colw,729,GREEN,3)
        for row,(key,business) in enumerate(items):
            y=746+row*114
            d.rect(x,y,colw,102,WHITE,LINE,8)
            d.text(x+17,y+12,roles[key],25,INK,True)
            n=f"{counts[key]} Skill"
            textwidth=d.draw.textlength(n,font=d.font(19))/SCALE
            d.text(x+colw-17-textwidth,y+17,n,19,MUTED)
            d.wrap(x+17,y+49,business,colw-34,21,leading=27,max_lines=2)
    d.text(68,1324,"12 类职能 + 1 个跨职能小企业经营 + 4 种通用能力。上图场景为归纳，181 项详细入口保留在研究网页。",23,MUTED)
    d.heading("03","怎样工作：把自然语言需求变成可检查的交付",1370)
    nodes=[("输入业务目标","资料 / 范围 / 公司规则"),("匹配 Skill","触发条件 / 所需输入"),("Claude 理解与判断","补缺口 / 选步骤 / 分析"),("调用工具或脚本","搜索 / 取数 / 计算 / 操作"),("交付并核验","结果 / 证据 / 未完成项")]
    for i,(title,body) in enumerate(nodes):
        x=68+i*380
        d.rect(x,1434,344,106,PALE,radius=10)
        d.text(x+18,1454,title,25,GREEN,True)
        d.text(x+18,1500,body,21,MUTED)
        if i<4:d.arrow(x+350,1486)
    d.text(68,1560,"Skill 用自然语言指导模型；程序按明确规则执行检查。两者可以组合，可靠程度需要分别验证。",24,MUTED)
    d.heading("04","一个贴近实际的场景：客户反馈“登录白屏，非常急”",1612)
    d.rect(68,1674,1864,64,PALE,radius=8)
    d.text(90,1693,"先问：生产还是测试？影响多少人？有无替代方案？再查关联记录；情绪不能单独决定优先级。",25,GREEN)
    branches=[("生产 · 120/120 人 · 无替代方案","P1 → 工程值班队列","按本演示公司规则，核心业务大范围受阻。"),
              ("测试 · 1/120 人 · 有替代方案","P3 → 一线支持队列","症状相同，影响与紧急程度不同，处理方式随之改变。")]
    for i,(title,result,reason) in enumerate(branches):
        x=68+i*948
        d.rect(x,1760,916,125,WHITE,LINE,10)
        d.text(x+22,1775,title,26,INK,True)
        d.text(x+22,1818,result,28,GREEN,True)
        d.text(x+22,1860,reason,21,MUTED)
    d.text(68,1910,"业务交付：分级依据 + 关联线索 + 根因未确认 + 路由建议 + 回复草稿；“已分派”不等于“已解决”。",24,INK)
    outcomes=[("未批准就分派","403 拒绝，0 条分派"),("批准后改变事实","原批准失效；旧版本返回 409"),("重新批准再分派","写入 1 条；重复提交仍 1 条")]
    for i,(title,result) in enumerate(outcomes):
        x=68+i*632
        d.rect(x,1960,600,108,SAND,radius=10)
        d.text(x+22,1978,title,26,AMBER,True)
        d.text(x+22,2026,result,24,INK)
    d.wrap(68,2092,"已验证的是本研究新增的本地程序：15 次 HTTP 请求与最终读回。客户、资料和公司规则均为虚构；分级由预设程序计算。",1864,23,max_lines=2)
    d.wrap(68,2164,"Claude 实际请求因令牌过期失败，未取得有效模型回答；未完成插件与直接对话的效果对比。",1864,23,color=AMBER,max_lines=2)
    d.heading("05","控制要分层：写下规则 ≠ 系统已经强制执行",2240)
    layers=[("提示词 / Skill 约束","先查证、不要编造、何时确认、怎样输出。","依赖模型遵守，需检查结果。",PALE,GREEN),
            ("程序化检查","脚本按规则校验和计算；如上游 QC 过滤。","存在程序不等于已跑通或参数适用。",WHITE,GREEN),
            ("系统强制控制","身份权限、审批版本、幂等、状态转换。","需业务系统实现；本轮仅验证本地演示门。",SAND,AMBER)]
    for i,(title,body,foot,fill,color) in enumerate(layers):
        x=68+i*632
        d.rect(x,2304,600,150,fill,LINE,10)
        d.text(x+22,2323,title,28,color,True)
        d.wrap(x+22,2370,body,556,23,max_lines=2)
        d.text(x+22,2422,foot,21,MUTED)
    d.heading("06","意义：把经验变成可以复用、检查和交接的方法",2500)
    values=[("对提出需求的人","少重复交代背景与规则，明确输入、范围和完成标准。"),
            ("对团队协作","统一检查点与交付结构，让异常、责任和后续事项更容易交接。"),
            ("对业务落地","结合模型判断、工具执行与系统控制，逐步建立可验证的流程。")]
    for i,(title,body) in enumerate(values):
        x=68+i*632
        d.text(x+3,2564,title,28,GREEN,True)
        d.wrap(x+3,2613,body,580,25,max_lines=2)
    d.rect(68,2710,1864,101,GREEN,radius=10)
    d.text(94,2731,"核心价值在具体业务方法的质量与复用；插件包装本身不保证更聪明、更准确或更高效。",29,WHITE,True)
    d.text(94,2776,"一次性任务可直接对话；反复发生、规则稳定、多人交接的任务，更适合沉淀为 Skill 与业务流程。",24,"#d1dfce")
    d.line(68,2841,1932,2841,LINE,2)
    d.text(68,2866,"证据范围与研究边界",25,GREEN,True)
    d.text(68,2907,"上游固定版本：a266ab8 · 2026-10-21 · Apache-2.0 · 源码静态研究，真实业务效率尚无量化验证。",22,MUTED)
    d.text(68,2945,"市场共 123 条记录：17 个顶层、5 个仓内合作伙伴、101 个外部仓库；伙伴与外部源仅清点，未逐项审核。",22,MUTED)
    d.text(68,2983,"研究交付：17 条业务深化 / 14 类约束 / 13 份模板 / 工单实操与记录回放；均可在研究网页继续查阅。",22,MUTED)
    d.text(68,3043,"上游：github.com/anthropics/knowledge-work-plugins     图示与本地演示：研究仓库 projects/003-knowledge-work-plugins",20,MUTED)
    d.save()
    print(f"Exported one {WIDTH}x{HEIGHT} SVG and {WIDTH*SCALE}x{HEIGHT*SCALE} PNG; all 17 roles and 181 Skill counts verified.")


if __name__ == "__main__":
    main()
