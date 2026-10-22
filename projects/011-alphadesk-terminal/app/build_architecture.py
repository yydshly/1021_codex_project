"""Render one source-grounded architecture figure as editable SVG + high-res PNG.

Uses Pillow for a raster rendering of the same code-native diagram layout.
Embeds three existing, unaltered historical browser captures as evidence panels.
No external data requests or generated interface imagery.
"""
from pathlib import Path
from html import escape
import math
import base64
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
W, H, SCALE = 2800, 2630, 2
PIN = 'cef8991daa16ab03799f49c56939e48a1d247964'
URL = f'https://github.com/vigneshv1cky/alphadesk-terminal/blob/{PIN}/alphadesk/'
REGULAR = Path('C:/Windows/Fonts/msyh.ttc')
BOLD = Path('C:/Windows/Fonts/msyhbd.ttc')
if not REGULAR.exists():
    raise SystemExit('Install Microsoft YaHei or configure REGULAR/BOLD font paths before rendering.')

C = dict(bg='#f2f5ef', ink='#19362e', muted='#5e756b', green='#286949',
         dark='#153c2f', mint='#cde8b9', border='#cbd8c7', blue='#326f9a',
         lightblue='#eaf2f8', amber='#89632c', lightamber='#f6f0df', white='#ffffff')
im = Image.new('RGB', (W*SCALE, H*SCALE), C['bg'])
draw = ImageDraw.Draw(im)
svg = [f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" aria-labelledby="title desc">',
       '<title id="title">AlphaDesk：支持什么信息，怎样获取、处理并呈现</title>',
       '<desc id="desc">上方用四个中文节点说明核心架构：人或 AI 发起研究，服务检查请求，共享后端获取材料并计算，网页与 AI 接收结果。下方五行分别说明行情、新闻、公司披露、政策日历以及组合研究的来源、获取方式、处理和呈现。真实截图放在对应业务行内，未接通能力使用清楚标注的功能示意。</desc>']
fonts = {}

def font(size, bold=False):
    key = size, bold
    if key not in fonts:
        fonts[key] = ImageFont.truetype(str(BOLD if bold else REGULAR), int(size*SCALE))
    return fonts[key]

def rect(x,y,w,h,fill,stroke=None,r=12,width=2):
    svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke or "none"}" stroke-width="{width}"/>')
    draw.rounded_rectangle([x*SCALE,y*SCALE,(x+w)*SCALE,(y+h)*SCALE],radius=r*SCALE,fill=fill,outline=stroke,width=width*SCALE)

def text(x,y,value,size=25,color=None,bold=False,anchor='start',link=None):
    color=color or C['ink']; f=font(size,bold)
    width=f.getlength(value)/SCALE
    actual_x=x if anchor=='start' else x-width/2 if anchor=='middle' else x-width
    baseline=y+f.getmetrics()[0]/SCALE
    if link: svg.append(f'<a href="{escape(URL+link)}" target="_blank">')
    svg.append(f'<text x="{x}" y="{baseline}" text-anchor="{anchor}" font-family="Microsoft YaHei, Noto Sans CJK SC, sans-serif" font-size="{size}" font-weight="{700 if bold else 400}" fill="{color}">{escape(value)}</text>')
    if link: svg.append('</a>')
    draw.text((actual_x*SCALE,baseline*SCALE),value,font=f,fill=color,anchor='ls')
    return width

def wrapped(x,y,value,width,size=24,color=None,bold=False,line=37):
    rows=[]; row=''
    for char in value:
        if char=='\n': rows.append(row);row='';continue
        if row and font(size,bold).getlength(row+char)/SCALE > width:
            rows.append(row);row=char
        else: row+=char
    if row: rows.append(row)
    for i,row in enumerate(rows):text(x,y+i*line,row,size,color,bold)
    return y+len(rows)*line

def line(points,color=None,width=3,dashed=False,arrow=True,both=False):
    color=color or C['green']
    coords=' '.join(f'{x},{y}' for x,y in points)
    svg.append(f'<polyline points="{coords}" fill="none" stroke="{color}" stroke-width="{width}" stroke-linejoin="round"'+(' stroke-dasharray="11 9"' if dashed else '')+'/>')
    for a,b in zip(points,points[1:]):
        if not dashed: draw.line((a[0]*SCALE,a[1]*SCALE,b[0]*SCALE,b[1]*SCALE),fill=color,width=width*SCALE)
        else:
            dx,dy=b[0]-a[0],b[1]-a[1];length=math.hypot(dx,dy)
            for s in range(0,int(length),20):
                e=min(s+11,length)
                draw.line(((a[0]+dx*s/length)*SCALE,(a[1]+dy*s/length)*SCALE,(a[0]+dx*e/length)*SCALE,(a[1]+dy*e/length)*SCALE),fill=color,width=width*SCALE)
    def tip(a,b):
        angle=math.atan2(b[1]-a[1],b[0]-a[0]); length=13
        pts=[b,(b[0]-length*math.cos(angle-.48),b[1]-length*math.sin(angle-.48)),(b[0]-length*math.cos(angle+.48),b[1]-length*math.sin(angle+.48))]
        svg.append('<polygon points="'+' '.join(f'{x},{y}' for x,y in pts)+f'" fill="{color}"/>')
        draw.polygon([(x*SCALE,y*SCALE) for x,y in pts],fill=color)
    if arrow:tip(points[-2],points[-1])
    if both:tip(points[1],points[0])

def label(x,y,value,color=None):
    width=font(20).getlength(value)/SCALE+20
    rect(x-width/2,y-3,width,35,C['bg'],r=4)
    text(x,y,value,20,color or C['muted'],anchor='middle')

def tag(x,y,value,kind='green'):
    fg,bg=(C['green'],'#e0eed7') if kind=='green' else (C['amber'],C['lightamber']) if kind=='amber' else (C['blue'],C['lightblue'])
    width=font(19,True).getlength(value)/SCALE+22
    rect(x,y,width,34,bg,r=5);text(x+11,y+3,value,19,fg,True)

def code(x,y,value,path=None):
    text(x,y,value+' ↗',19,C['green'],link=path or value)

def card(x,y,w,h,title,subtitle=None,fill=None):
    rect(x,y,w,h,fill or C['white'],C['border'])
    text(x+24,y+18,title,29,bold=True)
    if subtitle:text(x+24,y+59,subtitle,20,C['muted'])

def capture(x,y,w,h,filename):
    source=ROOT/'assets'/filename
    original=Image.open(source).convert('RGB')
    scale=min(w/original.width,h/original.height)
    iw,ih=original.width*scale,original.height*scale
    encoded=base64.b64encode(source.read_bytes()).decode('ascii')
    svg.append(f'<image x="{x}" y="{y}" width="{iw}" height="{ih}" href="data:image/jpeg;base64,{encoded}"><title>{escape(filename)} · 原版历史运行截图</title></image>')
    im.paste(original.resize((round(iw*SCALE),round(ih*SCALE)),Image.Resampling.LANCZOS),(round(x*SCALE),round(y*SCALE)))

def chain_step(x,y,w,title,body,technical):
    rect(x,y,w,165,C['white'],C['border'],r=12)
    text(x+22,y+20,title,30,bold=True)
    wrapped(x+22,y+73,body,w-44,25,line=34)
    text(x+22,y+129,technical,20,C['muted'])

rect(0,0,W,H,C['bg'],r=0)
rect(0,0,W,170,C['dark'],r=0)
text(65,28,'AlphaDesk：支持什么信息，怎样变成研究工作台？',47,'#f0f6e9',True)
text(68,100,'先看上方核心架构；再选下面一行，按「信息 → 来源与获取 → 处理 → 展示」读到最后。',28,'#c0d7bd')

# A small, literal architecture map; details belong to the concrete rows below.
text(70,192,'核心架构',32,bold=True)
text(275,199,'网页和 AI 共用后端；一次请求只调用需要的模块。',25,C['muted'])
chain_step(70,245,440,'人或 AI 发起研究','选择股票、日期、关键词','网页操作 / 外部 AI 调工具')
chain_step(590,245,540,'服务接收并检查请求','识别用户、校验参数、权限','FastAPI · HTTP / MCP / REST')
chain_step(1210,245,780,'共享后端：取材料、做计算','按问题查询来源，整理数据，检索与比较','接入 providers · 整理 ingest · 研究 desk / semantic')
chain_step(2070,245,660,'把结果交给人和 AI','网页看图表与原文；AI 取结构化记录','React 界面 / 53 个 MCP 工具')
for start,end in ((510,590),(1130,1210),(1990,2070)):
    line([(start,326),(end,326)],C['green'],width=4)
rect(70,430,2660,70,'#e3eddd',r=8)
text(94,448,'共同支撑：数据库与缓存（ledger / SQLite 或 PostgreSQL）  ·  后台更新  ·  用户与密钥  ·  缺失和失败状态',26,C['green'])

text(70,530,'从具体信息看实现',32,bold=True)
text(430,537,'前四行是信息方向；第五行是把这些信息组合起来做研究。',25,C['muted'])
for x,title in ((94,'① 支持什么信息'),(575,'② 从哪来、怎么取'),(1325,'③ 怎样处理与分析'),(2070,'④ 最后怎样展示')):
    text(x,587,title,30,bold=True)

rows=[
    dict(y=640,number='01',title='行情与市场',question='价格怎样变化？\n成交量如何？谁涨跌？',scope='股票、指数、ETF、加密货币等；\n期权链等依来源和套餐。',status='部分真实数据已验证',kind='green',
         sources='Yahoo Finance（公开采集）\nAlpaca / Polygon（授权 API）\n另有 Finnhub / Alpha Vantage / FMP',method='按股票、时间范围查询；\n图表选定一个来源，避免混用。',
         processing='统一开高低收和成交量字段\n计算涨跌与指标，缓存重复查询\n把时间、价格映射为图表坐标',boundary='本次股票实测，不代表全部资产已接通。',code=('providers/registry.py','providers/registry.py#L433'),
         output='K 线、成交量、报价卡',shot='real-chart.jpg',outlines='看走势、看量能\n切换标的与时间范围',proof='原版真实运行',note='NVDA / 23 根日 K\n历史截图，非实时行情'),
    dict(y=1000,number='02',title='新闻与变化线索',question='今天发生了什么？\n与这家公司有关吗？',scope='文章标题、摘要或正文、\n来源、时间、股票标签。',status='已实现；商业新闻未接通',kind='amber',
         sources='Benzinga / Alpaca 转供 / Marketaux\nFinnhub / Polygon / FMP / Alpha Vantage',method='新闻 API 查询或后台定时采集；\n按各家授权返回摘要或正文。',
         processing='统一文章字段，按 URL 合并重复\n用关键词找文章；可选按意思找标题\n保留来源、链接，供人继续核验',boundary='标题检索不生成摘要；本次向量模型关闭。',code=('ingest/news.py · semantic.py','ingest/news.py#L87'),
         output='新闻流、筛选、原文阅读',schematic='news'),
    dict(y=1360,number='03',title='公司、财务与披露',question='公司做什么？财务怎样？\n披露了哪些重要材料？',scope='公司资料、财务、公告、持股、\n评级、基金资料与业绩材料。',status='SEC 暂不接入；商业源未验',kind='amber',
         sources='SEC EDGAR：JSON / HTML / XBRL\nFinnhub / FMP / Alpha Vantage 等\n商业公司资料依密钥和套餐',method='按公司与报告期拉取；\n部分 SEC 路径直接访问官方接口。',
         processing='整理披露正文，保留原始文件入口\n映射财务标签，把累计值转季度值\n组织公司、期间与可比指标',boundary='不是自动财报解读；SEC 按用户选择关闭。',code=('ingest/edgar_financials.py','ingest/edgar_financials.py'),
         output='公司档案、财务表、公告阅读',schematic='company'),
    dict(y=1720,number='04',title='政策与事件日历',question='有哪些政策或已知事件？\n何时发生，需要跟踪什么？',scope='政府规则、央行公告、国债、\nIPO、停牌与其他公司日历。',status='部分公开来源已验证',kind='green',
         sources='Federal Register API / Fed RSS\nUS Treasury CSV / 公开接口\nNasdaq 页面接口 / Nasdaq Trader RSS',method='按日期与类别查询官方或公开记录；\n经济 / 财报日历另需授权来源。',
         processing='整理事件时间、类型、机构、链接\n按时间排列；收益率按期限排列\n区分缺权限、超时与没有记录',boundary='Fed RSS 不严格按 days 过滤；停牌含历史。',code=('ingest/gov_feed.py','ingest/gov_feed.py'),
         output='事件表、日历、收益率视图',shot='real-calendars.jpg',outlines='按时间跟踪政府动作\n看清哪个模块未接通',proof='原版真实运行',note='下方：政府事件\n上方：经济日历缺密钥'),
    dict(y=2080,number='05',title='组合成研究工作台',question='哪里出现变化？\n附近有哪些证据值得查？',scope='复用前四行材料做比较与跟踪；\n这不是另一种独立数据源。',status='看板已实跑；完整分析未验',kind='blue',
         sources='复用行情 + 新闻 + 公告 + 事件\n按同一标的和时间窗口组织\n缺少某种材料，就保留缺失状态',method='用户选标的、窗口和阈值；\n外部 AI 也能调用同一批工具。',
         processing='筛选涨跌和成交量变化\n把附近新闻、公告按交易窗口对齐\n比较标的或财报前后表现',boundary='给线索与参照；时间相近不证明因果。',code=('desk/moves.py · mcp_server.py','desk/moves.py'),
         output='研究看板、比较表、AI 材料',shot='real-markets.jpg',outlines='同一标的，多模块组合\n图中是图表与报价',proof='看板组合真实运行',note='只证明画面中的组合\n不证明完整分析已接通')
]

for row in rows:
    y=row['y']
    rect(70,y,2660,340,C['white'],C['border'],r=12)
    rect(70,y,450,340,'#eef4e8' if row['number']!='05' else C['lightblue'],r=12)
    tag(94,y+20,row['number'],'blue')
    text(155,y+16,row['title'],31,bold=True)
    wrapped(94,y+77,row['question'],400,27,bold=True,line=40)
    wrapped(94,y+176,row['scope'],400,24,C['muted'],line=35)
    tag(94,y+282,row['status'],row['kind'])
    for x in (550,1300,2040):
        line([(x,y+22),(x,y+318)],C['border'],width=2,arrow=False)
    wrapped(575,y+25,row['sources'],690,26,line=38)
    text(575,y+164,'获取方式',21,C['green'],True)
    wrapped(575,y+201,row['method'],690,26,line=38)
    if row['number']=='02':
        text(575,y+299,'独立补充：trumpstruth.org RSS → 帖子流（未验证）',20,C['muted'])
    wrapped(1325,y+25,row['processing'],665,27,line=46)
    wrapped(1325,y+187,row['boundary'],665,24,C['amber'],line=36)
    code(1325,y+294,*row['code'])
    for x in (550,1299,2039):
        rect(x-15,y+142,31,44,C['white'],r=0)
        line([(x-12,y+163),(x+12,y+163)],C['green'])
    text(2070,y+20,row['output'],28,bold=True)
    if row.get('shot'):
        capture(2070,y+77,220,236,row['shot'])
        wrapped(2320,y+82,row['outlines'],370,26,line=39)
        tag(2320,y+185,row['proof'],'green')
        wrapped(2320,y+239,row['note'],370,23,C['muted'],line=34)
    elif row['schematic']=='news':
        rect(2070,y+82,630,138,C['lightblue'],r=8)
        text(2090,y+96,'标题  ·  来源  ·  时间  ·  股票标签',24,C['blue'],True)
        line([(2092,y+140),(2674,y+140)],'#c4d7e5',width=2,arrow=False)
        text(2090,y+160,'关键词筛选 → 摘要 / 正文 → 原文链接',24,C['blue'])
        tag(2070,y+244,'功能示意 · 不是实跑新闻','amber')
        text(2070,y+295,'商业新闻缺凭据；没有填入虚构新闻。',23,C['muted'])
    else:
        rect(2070,y+82,630,138,C['lightblue'],r=8)
        text(2090,y+96,'公司档案    财务报表    公告原文',25,C['blue'],True)
        line([(2092,y+140),(2674,y+140)],'#c4d7e5',width=2,arrow=False)
        text(2090,y+160,'公司 → 报告期 → 指标 / 章节 → 出处',24,C['blue'])
        tag(2070,y+244,'功能示意 · 本次没有 SEC 实跑画面','amber')
        text(2070,y+295,'这里只说明输出形式，不展示虚构财务值。',23,C['muted'])

rect(70,2450,2660,88,C['dark'],r=10)
text(94,2466,'它的价值：把同一对象的多种材料接起来，让人能查、能比、能回到出处；也让外部 AI 使用这些材料。',29,'#e5f1dc',True)
text(94,2506,'不是自动判断投资结论。已接通、源码具备、功能示意分别标注，截图只证明画面中看得到的部分。',24,'#bfd8ba')
text(70,2560,'依据：0.2.1 / cef8991d 固定提交源码；53 个 MCP 工具、20 类页面组件。实跑截图为 2026-10-22 历史记录，非当前行情。',23,C['muted'])
text(70,2596,'公开接口历史实测：NVDA 23 根日 K、国债 12 期限、政府 40 条、停牌 39 条（含历史）、IPO 2 条。接口结果不等于全部出现在截图中。',21,C['muted'])
svg.append('</svg>')
out=ROOT/'assets';out.mkdir(exist_ok=True)
(out/'architecture-full.svg').write_text('\n'.join(svg),encoding='utf-8')
im.save(out/'architecture-full.png',optimize=True)
print(f'Created architecture-full.svg ({W}x{H}) and architecture-full.png ({W*SCALE}x{H*SCALE})')
