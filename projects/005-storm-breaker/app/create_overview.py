"""Render one original, text-accurate research infographic as SVG and PNG.

Requires Pillow and Microsoft YaHei fonts on Windows.
This draws a new diagram locally; it never runs the upstream collection tool.
"""
from functools import lru_cache
from html import escape
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets"
WIDTH = 2400
MARGIN = 88
CONTENT = WIDTH - MARGIN * 2
INK = "#173D34"
BODY = "#425B52"
MUTED = "#64786D"
PAPER = "#F6F6EF"
LINE = "#D4DFD1"
GREEN = "#266545"
AMBER = "#79501A"
RUST = "#8A493B"
REGULAR = Path("C:/Windows/Fonts/msyh.ttc")
BOLD = Path("C:/Windows/Fonts/msyhbd.ttc")


@lru_cache(maxsize=None)
def font(size, bold=False):
    return ImageFont.truetype(str(BOLD if bold else REGULAR), size)


def wrap(text, width, size, bold=False):
    result = []
    face = font(size, bold)
    for paragraph in text.split("\n"):
        line = ""
        for char in paragraph:
            if line and face.getlength(line + char) > width:
                # Keep Chinese closing punctuation off the start of a line.
                if char in "，。；：？！、）】》」』”’" and len(line) > 1:
                    result.append(line[:-1])
                    line = line[-1] + char
                else:
                    result.append(line)
                    line = char
            else:
                line += char
        result.append(line)
    return result


class Canvas:
    def __init__(self):
        self.ops = []
        self.svg = []

    def rect(self, x, y, w, h, fill, radius=0, stroke=None):
        self.ops.append(("rect", (x, y, w, h, fill, radius, stroke)))
        self.svg.append(
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" '
            f'fill="{fill}" stroke="{stroke or "none"}" stroke-width="2"/>'
        )

    def line(self, x1, y1, x2, y2, fill=LINE, width=2):
        self.ops.append(("line", (x1, y1, x2, y2, fill, width)))
        self.svg.append(
            f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" '
            f'stroke="{fill}" stroke-width="{width}"/>'
        )

    def polygon(self, points, fill):
        self.ops.append(("polygon", (points, fill)))
        coords = " ".join(f"{x},{y}" for x, y in points)
        self.svg.append(f'<polygon points="{coords}" fill="{fill}"/>')

    def text(self, text, x, y, width, size=30, color=BODY, bold=False, leading=None):
        leading = leading or round(size * 1.5)
        lines = wrap(text, width, size, bold)
        ascent = font(size, bold).getmetrics()[0]
        for i, value in enumerate(lines):
            baseline = y + i * leading + ascent
            self.ops.append(("text", (value, x, baseline, size, color, bold)))
            self.svg.append(
                f'<text x="{x}" y="{baseline}" font-family="Microsoft YaHei, '
                f'Noto Sans CJK SC, sans-serif" font-size="{size}" '
                f'font-weight="{700 if bold else 400}" fill="{color}">'
                f'{escape(value)}</text>'
            )
        return y + len(lines) * leading

    def save(self, height):
        height = int(height)
        image = Image.new("RGB", (WIDTH, height), PAPER)
        draw = ImageDraw.Draw(image)
        for kind, args in self.ops:
            if kind == "rect":
                x, y, w, h, fill, radius, stroke = args
                draw.rounded_rectangle((x, y, x+w, y+h), radius, fill, stroke, 2)
            elif kind == "line":
                x1, y1, x2, y2, fill, width = args
                draw.line((x1, y1, x2, y2), fill, width)
            elif kind == "polygon":
                draw.polygon(args[0], fill=args[1])
            elif kind == "text":
                value, x, baseline, size, color, bold = args
                draw.text((x, baseline), value, font=font(size, bold), fill=color, anchor="ls")
        OUT.mkdir(exist_ok=True)
        png = OUT / "storm-breaker-overview.png"
        svg = OUT / "storm-breaker-overview.svg"
        image.save(png, optimize=True)
        svg.write_text(
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{height}" '
            f'viewBox="0 0 {WIDTH} {height}" role="img" aria-labelledby="title desc">'
            '<title id="title">Storm-Breaker：浏览器能知道你多少？</title>'
            '<desc id="desc">能力、信息权限分类、页面生命周期与研究价值的完整中文信息图。'
            '普通网页正常安全模型；静态源码研究，上游效果未实测。</desc>'
            f'<rect width="{WIDTH}" height="{height}" fill="{PAPER}"/>'
            + "".join(self.svg) + "</svg>", encoding="utf-8"
        )
        print(f"Saved {png}\nSaved {svg}\nDimensions: {WIDTH} x {height}")


C = Canvas()


def section(number, title, subtitle, y):
    C.rect(MARGIN, y+3, 62, 62, INK, 12)
    C.text(number, MARGIN+12, y+10, 55, 30, "#FFFFFF", True)
    C.text(title, MARGIN+86, y, CONTENT-86, 46, INK, True)
    bottom = C.text(subtitle, MARGIN+86, y+78, CONTENT-86, 27, MUTED)
    return bottom + 32


def note(text, y, fill="#E8EFE1", color=INK, size=28):
    lines = wrap(text, CONTENT-64, size)
    height = len(lines)*round(size*1.5)+42
    C.rect(MARGIN, y, CONTENT, height, fill, 10)
    C.text(text, MARGIN+32, y+20, CONTENT-64, size, color)
    return y+height


# Header
C.rect(0, 0, WIDTH, 14, INK)
C.text("005  /  开源研究室", MARGIN, 59, 900, 29, GREEN, True)
C.text("能力 · 权限 · 数据去向 · 页面生命周期", 1370, 59, 950, 27, MUTED)
C.text("Storm-Breaker", MARGIN, 135, CONTENT, 100, INK, True)
C.text("浏览器能知道你多少？", MARGIN, 265, CONTENT, 76, INK, True)
C.text("核心：读取网页可访问的数据，申请特定权限，再通过网络上传。", MARGIN, 382, CONTENT, 35, BODY)
C.text("它获得的是限定范围的网站权限，不是整台设备的控制权。", MARGIN, 438, CONTENT, 35, GREEN, True)
C.line(MARGIN, 524, WIDTH-MARGIN, 524)
y = section("01", "这个库实际实现了什么？", "锁定上游提交 4d72351 · 以下为源码实现与设计意图，实际采集效果未实测。", 564)

capabilities = [
    ("设备与环境", "系统、浏览器、分辨率、语言、时区、逻辑处理器数量等；通过第三方服务查询出口 IP。", "通常无需弹窗；暴露值可能受限"),
    ("单次定位", "getCurrentPosition() 获取经纬度并生成地图链接；不是连续轨迹追踪。", "需要位置权限；精度不保证"),
    ("摄像头抓拍", "getUserMedia() 请求朝向用户的摄像头；设计为约每 9 秒上传一张 640×640 PNG。", "需要相机权限；不是完整直播"),
    ("麦克风录音", "单声道 WAV 分段上传；约每 6 秒停止、导出并重新录制，不保证连续无间隙。", "需要录音权限；非系统音频"),
    ("结果管理", "PHP 保存文本、图片、声音；面板查看结果、下载及清空日志。", "停止监听只停轮询，不停采集"),
]
columns = [MARGIN, MARGIN+300, MARGIN+1560, WIDTH-MARGIN]
C.rect(MARGIN, y, CONTENT, 70, "#E7EDE1", 8)
for x, label, width in [(columns[0]+24, "能力", 250), (columns[1]+24, "实际实现与产物", 1200), (columns[2]+24, "前提 / 限制", 620)]:
    C.text(label, x, y+14, width, 29, INK, True)
y += 70
for i, (label, detail, condition) in enumerate(capabilities):
    h = max(len(wrap(detail, 1200, 30)), len(wrap(condition, 610, 28))) * 45 + 34
    C.rect(MARGIN, y, CONTENT, h, "#FFFFFF" if i % 2 == 0 else "#EFF3E9")
    C.text(label, columns[0]+24, y+18, 255, 31, INK, True)
    C.text(detail, columns[1]+24, y+18, 1200, 30)
    C.text(condition, columns[2]+24, y+18, 610, 28, AMBER)
    y += h
    C.line(MARGIN, y, WIDTH-MARGIN, y)
y += 38

# Data flow
flow = [
    ("打开模板", "天气 / 附近 / 相机"),
    ("读取或请求", "公开信息 / 特定权限"),
    ("浏览器采集", "信息 / 位置 / 媒体流"),
    ("HTTP 上传", "正常网络请求"),
    ("保存与展示", "PHP / 文件 / 管理面板"),
]
gap = 44
box = (CONTENT-gap*4)/5
for i, (label, detail) in enumerate(flow):
    x = MARGIN+i*(box+gap)
    C.rect(x, y, box, 139, INK if i==1 else "#E7EDE1", 12)
    C.text(label, x+22, y+20, box-44, 34, "#FFFFFF" if i==1 else INK, True)
    C.text(detail, x+22, y+79, box-44, 24, "#D8E6D6" if i==1 else MUTED)
    if i<4:
        a=x+box+10
        C.line(a, y+70, a+22, y+70, GREEN, 4)
        C.polygon([(a+15,y+61),(a+27,y+70),(a+15,y+79)],GREEN)
y += 160
y = C.text("Python 启动服务 · JavaScript 调用浏览器接口 · PHP 接收与保存文件", MARGIN, y, CONTENT, 29, GREEN, True)
y = C.text("页面包装影响用户的授权决定；关键实现未发现绕过浏览器授权的机制。", MARGIN, y+5, CONTENT, 29)
y += 43

y = section("02", "浏览器信息边界全景", "下面是一般网页能力，并非本库全部实现；范围限定为普通网页与正常浏览器安全模型。", y)

basic = [
    ("网络访问", "服务器可见出口 IP、请求内容、访问时间。VPN 通常改变出口 IP，不会隐藏全部页面行为。"),
    ("系统与浏览器", "部分系统、浏览器、版本信息，以及语言、时区；可能被缩减、伪装或限制。"),
    ("设备与显示能力", "屏幕／窗口尺寸、像素比例、触摸能力、逻辑处理器数；部分浏览器提供粗略内存。"),
    ("当前页面内的行为", "本站点击、滚动、停留、可见状态和输入；未提交的表单也可能被读取。"),
    ("本站存储与登录关联", "可访问的 Cookie、本地存储、本站账号关联。脚本不能读 HttpOnly Cookie，但浏览器可随适用请求发送。"),
    ("浏览器指纹", "Canvas、WebGL、音频计算等特征可概率性关联访问；可被限制或加噪，不是永久设备身份证。"),
]
granted = [
    ("摄像头与麦克风", "分开授权。可拍照、录像、录音；不自动获得相册、系统内部音频或既有通话录音。"),
    ("地理位置", "经纬度与精度等；一般接口可持续更新，本库只单次定位。请求高精度不保证精确结果。"),
    ("屏幕／窗口共享", "只获取用户选定的共享范围；每次启动需授权。整屏共享可能暴露其他应用画面。"),
    ("文件／目录", "用户选中的文件及元数据；目录授权可能覆盖内部文件。照片可能含时间和位置；写入可另行授权。"),
    ("剪贴板", "依浏览器规则授权或主动粘贴；通常是当前内容，不是完整剪贴板历史。"),
    ("联系人", "部分浏览器的选择器可分享选定联系人与字段；不是静默读取整本通讯录。"),
    ("USB／蓝牙／串口", "仅支持平台、获准设备与协议允许的数据；不是所有外设或系统管理权限。"),
    ("其他受限接口", "通知、运动传感器、本地字体等依平台而异；通知权限不等于读取系统通知。"),
]
blocked = [
    ("其他网站的私有数据", "不能任意读取其 Cookie、私有页面、登录令牌；同源策略等提供隔离。"),
    ("浏览器全部密码与记录", "不能导出密码库，或枚举全部历史、书签、标签页清单。"),
    ("未授权的磁盘与相册", "不能扫描任意文件；已选文件、授权目录和本站沙箱存储是不同范围。"),
    ("其他应用的数据库", "不能直接读聊天记录库、系统短信库、通话记录库。"),
    ("操作系统内部能力", "不能任意读其他进程内存、全局键盘输入，或执行系统命令。"),
    ("本机硬件身份", "没有通用网页接口读取本机 MAC、IMEI、SIM 身份；媒体设备 ID 不等于这些标识。"),
    ("系统生物特征与私钥", "WebAuthn 返回认证证明，不交付系统指纹／人脸模板或通行密钥私钥。"),
]
panel_width = (CONTENT-48)//3
text_width = panel_width-52
panels = [
    ("A", "通常无需弹窗", "#EDF3E8", GREEN, basic,
     "注意：密码框的圆点只遮挡显示。输入或填入当前网站表单的密码，可能被当前页面读取。\n音频指纹不等于录音。"),
    ("B", "特定授权 / 主动选择", "#FAF0DC", AMBER, granted,
     "授权是逐项、限定范围的。已有有效授权时，可能不再次弹窗；还需满足系统许可、安全上下文与接口条件。"),
    ("C", "不能直接任意读取", "#F5E8E2", RUST, blocked,
     "直接访问被隔离，不代表无法间接获知：用户共享聊天画面、上传导出文件或照片，会产生新的数据来源。"),
]


def panel_height(items, ending):
    pos = 155
    for label, body in items:
        pos += len(wrap(label,text_width,31,True))*47 + 5
        pos += len(wrap(body,text_width,28))*42 + 24
    return pos + len(wrap(ending,text_width,28))*42 + 58


ph = max(panel_height(items,ending) for _,_,_,_,items,ending in panels)
for i,(letter,title,bg,color,items,ending) in enumerate(panels):
    x = MARGIN+i*(panel_width+24)
    C.rect(x,y,panel_width,ph,bg,14)
    C.rect(x,y,panel_width,8,color,4)
    C.text(letter,x+26,y+24,55,48,color,True)
    C.text(title,x+94,y+36,panel_width-120,32,color,True)
    C.line(x+26,y+118,x+panel_width-26,y+118,color,2)
    pos = y+147
    for j,(label,body) in enumerate(items):
        pos=C.text(f"{j+1:02d}  {label}",x+26,pos,text_width,31,color,True)
        pos=C.text(body,x+26,pos+5,text_width,28,BODY)
        pos += 24
    foot_height=len(wrap(ending,text_width,28))*42
    foot_y=y+ph-foot_height-28
    C.line(x+26,foot_y-20,x+panel_width-26,foot_y-20,color)
    C.text(ending,x+26,foot_y,text_width,28,color)
y += ph+28
y=note("边界前提：扩展、安装的软件、应用内特权桥接、漏洞利用，以及对方主动开放的数据接口，属于其他访问路径。不能把“普通网页读不到”理解为任何情况下都绝不可能获知。",y)
y=note("获得数据后，通常没有统一的额外“上传确认框”。网页可以通过正常网络请求发送已取得的数据；允许访问与理解数据用途，是两层不同的问题。",y+18,INK,"#F2F6EB",30)
y += 52

y = section("03", "同意之后，切后台、关页与再打开有何差异？", "保存授权与持续运行是两回事。下表假设普通网页；真正关闭时，没有其他相关页面继续运行。",y)
life_cols = [355,400,670,CONTENT-355-400-670]
life_x = [MARGIN]
for w in life_cols:
    life_x.append(life_x[-1]+w)
C.rect(MARGIN,y,CONTENT,74,INK,8)
for i,label in enumerate(["当前情境","有效敏感权限","还能采集新数据？","最重要的区别"]):
    C.text(label,life_x[i]+22,y+16,life_cols[i]-44,30,"#FFFFFF",True)
y+=74
life_rows = [
    ("首次访问，未授权","无有效授权","基础信息可能；敏感采集不可直接进行","需要询问或被阻止；拒绝后相应采集失败"),
    ("页面打开，已授权","对应权限有效","接口、设备与系统条件满足时可以","授权逐项，不是一次全开"),
    ("后台／最小化／锁屏","可能仍有效","已有采集可能继续，也可能被系统暂停或限制","切后台不等于真正关闭"),
    ("真正关闭采集页面","可能保留","该页面停止采集新照片、声音和位置","权限记录仍在，不代表代码仍在运行"),
    ("再次打开同一网站","若保留授权仍有效","可能无需再次弹窗，重新开始采集","无弹窗不等于绕过权限"),
    ("撤销对应权限","该项授权取消","该项敏感采集不能继续直接进行","其他权限与基础信息要分别判断"),
]
for r,row in enumerate(life_rows):
    height=max(len(wrap(value,life_cols[i]-44,29,i==0)) for i,value in enumerate(row))*44+38
    C.rect(MARGIN,y,CONTENT,height,"#FFFFFF" if r%2==0 else "#EDF2E7")
    for i,value in enumerate(row):
        C.text(value,life_x[i]+22,y+18,life_cols[i]-44,29,INK if i==0 else BODY,i==0,44)
    y+=height
    C.line(MARGIN,y,WIDTH-MARGIN,y)
y+=24
y=note("权限是否保留 ≠ 页面是否仍在运行。已经上传到服务器的数据，不会因关页或撤销权限自动删除。",y,"#E6EEDF",INK,32)
y=C.text("补充：临时授权与持久授权的期限依浏览器而异。Service Worker 可处理推送／同步等有限事件，但不能仅靠保留授权在关页后继续调用相机、麦克风等窗口采集接口。已排队上传完成，也不等于采集了新数据。",MARGIN,y+20,CONTENT,28)
y+=44

y=section("04","使用场景与研究意义","价值主要在流程整合、安全教学与权限理解；技术新意和成熟工程参考价值相对有限。",y)
value_items=[
    ("隐私教育","对比“只是访问”与“点击允许”，理解采集、上传和保存之间的关系。"),
    ("社会工程学分析","识别页面表面用途与实际数据使用的落差，改进授权文案和风险沟通。"),
    ("开发者学习","理解浏览器 API、媒体编码、HTTP 上传、文件保存与面板轮询。"),
    ("受控授权演示","在知情同意的自有设备环境中，验证浏览器差异、授权期限与前后台行为。"),
]
vw=(CONTENT-24)//2
vh=max(len(wrap(body,vw-52,30)) for _,body in value_items)*45+110
for i,(title,body) in enumerate(value_items):
    x=MARGIN+(i%2)*(vw+24)
    yy=y+(i//2)*(vh+24)
    C.rect(x,yy,vw,vh,"#FFFFFF",12,LINE)
    C.text(title,x+26,yy+20,vw-52,35,INK,True)
    C.text(body,x+26,yy+81,vw-52,30)
y+=vh*2+48
y=note("不能据此宣称：无授权偷拍、整机远控、读取全部应用数据、关页后永久监控，或按 IP 精确定位住址。源码中还存在潜在脚本异常、HTTP 链接与结果覆盖问题，稳定性需独立验证。",y,"#F1E8DC",AMBER,29)
y+=48

y=section("05","六个最值得记住的结论","这些区别，比工具名称更重要。",y)
takeaways=[
    ("“无需权限”有范围","通常只适用于部分环境信息，不涵盖相机、麦克风和精确位置。"),
    ("授权逐项、限定访问范围","允许相机不会顺便允许录音、定位、读取文件或控制系统。"),
    ("读取后可能直接上传","浏览器通常没有一个通用的第二次“允许上传”确认框。"),
    ("HTTPS 不证明站点可信","它保护传输；localhost 等安全上下文例外也不改变权限模型。"),
    ("推测不等于身份事实","IP 不等于住址；浏览器指纹不等于永久唯一设备标识。"),
    ("三个动作分别处理","撤销授权、停止采集、删除服务器数据，是三件不同的事。"),
]
tw=(CONTENT-40)//2
th=150
for i,(title,body) in enumerate(takeaways):
    x=MARGIN+(i%2)*(tw+40)
    yy=y+(i//2)*th
    C.text(f"{i+1:02d}",x,yy+3,60,36,GREEN,True)
    C.text(title,x+78,yy,tw-78,32,INK,True)
    C.text(body,x+78,yy+53,tw-78,28)
y+=th*3+20
C.line(MARGIN,y,WIDTH-MARGIN,y,INK,3)
y+=30
y=C.text("研究依据：ultrasecurity/Storm-Breaker @ 4d72351 · MDN · W3C · Chrome 权限文档",MARGIN,y,CONTENT,27,GREEN,True)
y=C.text("验证口径：静态源码与文档研究；上游未部署、未真机采集。不同浏览器、系统与版本可能改变具体行为。",MARGIN,y+8,CONTENT,26,MUTED)
y=C.text("详细来源与逐项证据：005-storm-breaker/web/index.html  ·  研究日期：2026-10-20",MARGIN,y+8,CONTENT,26,MUTED)
C.save(y+60)
