"""One evidence-based Chinese research infographic, PNG + self-contained SVG."""
from __future__ import annotations
import base64
import html
import io
import json
import shutil
from functools import lru_cache
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps
from fontTools import subset
from fontTools.ttLib import TTFont

PROJECT = Path(__file__).resolve().parents[2]
FONT = PROJECT / 'app/public/NotoSansSC.ttf'
POSTERS = PROJECT / 'web/reference-effects/media'
OUT = PROJECT / 'assets/capability-map-019'
W, M, GAP = 2000, 88, 24
INNER = W - M * 2
PAPER, INK, MUTED = '#F3F0E6', '#203F38', '#576B60'
COPPER, LINE, CARD, TINT = '#A85F3D', '#CAD1C2', '#FCFAF4', '#E4E9DD'
SOURCE = '#47778A'
image = Image.new('RGB', (W, 4400), PAPER)
draw = ImageDraw.Draw(image)
svg, copy, bounds = [], [], []

@lru_cache(maxsize=100)
def font(size, weight=400):
    f = ImageFont.truetype(str(FONT), size)
    f.set_variation_by_axes([weight])
    return f

def rect(x, y, w, h, fill, radius=0):
    draw.rounded_rectangle((x, y, x+w, y+h), radius, fill)
    svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}"/>')

def line(x1, y1, x2, y2, fill=LINE, width=2):
    draw.line((x1,y1,x2,y2), fill, width)
    svg.append(f'<path d="M{x1} {y1}L{x2} {y2}" stroke="{fill}" stroke-width="{width}" fill="none"/>')

def text(value, x, y, size=28, weight=400, color=INK, max_width=None):
    f = font(size, weight)
    length = draw.textlength(value, font=f)
    if max_width is not None and length > max_width+1:
        raise ValueError(f'Text too wide: {value!r}: {length} > {max_width}')
    draw.text((x,y), value, font=f, fill=color, anchor='lt')
    svg.append(f'<text x="{x}" y="{y}" dominant-baseline="text-before-edge" font-size="{size}" font-weight="{weight}" fill="{color}">{html.escape(value)}</text>')
    copy.append(value)
    bounds.append(dict(text=value,x=x,y=y,width=round(length,1),font=size))

def paragraph(value,x,y,width,size=28,weight=400,color=MUTED,leading=1.55):
    rows,row=[],''
    f=font(size,weight)
    for char in value:
        if char=='\n':
            rows.append(row);row=''
        elif draw.textlength(row+char,font=f)>width and row:
            rows.append(row);row=char
        else: row+=char
    if row: rows.append(row)
    for i,row in enumerate(rows): text(row,x,y+int(i*size*leading),size,weight,color,width)
    return y+int(len(rows)*size*leading)

def section(no,name,subtitle,y):
    line(M,y,W-M,y)
    text(no,M,y+31,25,550,COPPER)
    text(name,M+76,y+25,43,720)
    if subtitle: text(subtitle,M+76,y+86,27,400,MUTED,INNER-80)

def arrow(x,y):
    line(x,y,x+18,y,MUTED,2)
    line(x+11,y-7,x+18,y,MUTED,2)
    line(x+11,y+7,x+18,y,MUTED,2)

def poster(name,x,y,w,h):
    source=Image.open(POSTERS/f'{name}.jpg').convert('RGB')
    tile=Image.new('RGB',(w,h),'#E7E5DE')
    fitted=ImageOps.contain(source,(w,h),Image.Resampling.LANCZOS)
    tile.paste(fitted,((w-fitted.width)//2,(h-fitted.height)//2))
    image.paste(tile,(x,y))
    buf=io.BytesIO();tile.save(buf,format='JPEG',quality=92)
    data=base64.b64encode(buf.getvalue()).decode()
    svg.append(f'<image x="{x}" y="{y}" width="{w}" height="{h}" href="data:image/jpeg;base64,{data}"/>')

text('MG-STYLES-15  /  研究理解全景图',M,58,27,550,COPPER)
text('MG = Motion Graphics · 动态图形',1280,62,24,400,MUTED,632)
text('从十五种风格，到可复用的创作能力',M,122,77,780,INK,INNER)
text('本质：风格提示 + 制作源码 + 成片参照，组成十五套创作案例。',M,238,38,550,INK,INNER)
y=325
cols=[M,M+616,M+1232]
for x in cols: rect(x,y,592,245,CARD,12)
text('源库提供',cols[0]+27,y+25,30,700,SOURCE)
paragraph('风格提示约束 AI / 人的创作\n案例源码说明具体实现\n完整成片提供质量参照',cols[0]+27,y+79,540,28)
text('我们的理解',cols[1]+27,y+25,30,700,COPPER)
paragraph('先有吸引人的选题与关键画面\n再设计素材、表演与动态节奏\n风格是整套表达规则，不只是配色',cols[1]+27,y+79,540,28)
text('我们的实践',cols[2]+27,y+25,30,700)
paragraph('AI 辅助创意、方案与部分静帧\n另做题材、资产与动画实现\nRemotion 组织时间轴和输出',cols[2]+27,y+79,540,28)
text('源库实现：SVG / Canvas · WebGL / Three.js · Blender / Cycles · 帧序列与 FFmpeg 合成',M,587,23,400,MUTED,INNER)

section('01','从创意到成片，怎样控制？','源库的技术按效果选择；下方是我们整理并采用的制作链路。',616)
stages=[
 ('情绪与目标','希望观众感受什么','温暖、惊喜、发现'),
 ('故事与分镜','谁行动，如何转折','事件、景别、配时'),
 ('资产与风格','画面用什么来表达','图片、矢量、三维'),
 ('程序动画','让设计按时间发生','动作、接触、材质'),
 ('合成与输出','预览与成片同配置','Remotion / MP4'),
 ('审片与返修','看完整作品再判断','连续性、节奏、质感')]
for i,(name,control,artifact) in enumerate(stages):
    x,sy=M+i*308,757
    rect(x,sy,284,163,TINT if i<4 else CARD,10)
    text(name,x+21,sy+23,30,700,INK,244)
    text(control,x+21,sy+76,25,400,MUTED,244)
    text(artifact,x+21,sy+116,24,400,MUTED,244)
    if i<5: arrow(x+287,sy+79)
text('情绪决定表达目标',M,951,29,600)
text('风格规定视觉语言',M+616,951,29,600)
text('技术负责准确执行',M+1232,951,29,600)

section('02','十五种风格，分别带来什么效果？','下列小图全部来自源库原作封面；效果与场景是对其视觉机制的归纳。',1035)
styles=[
 ('01-flat-vector','扁平矢量','几何弹跳 · 色块转场','品牌片头、功能说明'),
 ('02-line-art','线条动画','连续描线 · 路径转场','极简品牌、流程说明'),
 ('03-isometric','等轴 2.5D','城市生长 · 模块装配','系统架构、园区物流'),
 ('04-3d-render','3D 渲染','软体回弹 · 材质光影','产品质感、发布片头'),
 ('05-cel-boil','逐帧手绘','沸腾墨线 · 逐格节奏','温暖故事、文创教育'),
 ('06-collage','拼贴剪贴','纸片拼贴 · 定格摆拍','文化栏目、音乐视觉'),
 ('07-liquid','液态流动','液滴融合 · 字形聚合','美妆饮料、品牌聚合'),
 ('08-morph','形变动画','轮廓变换 · 连续衔接','功能关联、标志演绎'),
 ('09-bauhaus','几何包豪斯','网格翻转 · 节拍编舞','动态海报、系列识别'),
 ('10-synthwave','复古霓虹','透视网格 · 复古辉光','电子音乐、游戏活动'),
 ('12-aurora-glass','极光玻璃','极光渐变 · 玻璃折射','软件发布、界面展示'),
 ('18-hanazi','综艺花字','弹跳字幕 · 情绪符号','生活短片、访谈包装'),
 ('19-paperclip','贴纸科普','贴纸图解 · 大画布镜头','知识解释、产业介绍'),
 ('20-pixel','像素动画','像素角色 · 关卡冒险','游戏宣传、怀旧营销'),
 ('22-hud','科技 HUD','扫描发现 · 目标锁定','科技栏目、科幻包装')]
for i,(slug,name,effect,use) in enumerate(styles):
    x,y=M+i%3*616,1176+i//3*228
    rect(x,y,592,206,CARD,10)
    text(f'{i+1:02d}',x+23,y+21,24,500,COPPER)
    text(name,x+78,y+16,33,720,INK,488)
    poster(slug,x+23,y+72,203,114)
    paragraph(effect,x+248,y+74,320,26,550,INK,1.45)
    text('适合',x+248,y+126,22,500,COPPER)
    paragraph(use,x+248,y+158,320,25,400,MUTED,1.3)

section('03','对我们的意义：把欣赏变成制作能力','沉淀方式：拆解原理 → 独立制作 → 参数化 → 换故事验证 → 固化组件与审片规则。',2357)
deposits=[
 ('创作方法','选题与情绪转折\n因果分镜、关键画面\n完整审片与返修规则'),
 ('风格规范','构图、配色、笔触\n材料、光线与空间\n运动节奏与适用条件'),
 ('资产与组件','角色、场景、道具\n动作、接触与形变\n镜头、材质与转场'),
 ('接口与管线','受校验的配置\n跨镜状态、预览与保存\n逐帧渲染与版本输出'),
 ('案例与证据','源作与原创作品\n修改前后、实际成片\n具体问题与有效修法')]
dw=(INNER-4*GAP)//5
for i,(name,body) in enumerate(deposits):
    x,y=M+i*(dw+GAP),2500
    rect(x,y,dw,232,TINT,10)
    text(f'0{i+1}',x+22,y+20,22,500,COPPER)
    text(name,x+22,y+59,31,700,INK,dw-44)
    paragraph(body,x+22,y+117,dw-44,26,400,MUTED,1.48)
text('当前实践',M,2772,28,650,COPPER)
paragraph('15 套独立模板；手绘 / 形变 / 玻璃 / 线条 / 科普各两套故事。\n霓虹 / 像素 / HUD 支持有限 AI 编排；另有矢量故事板与固定资产导演演示。',M+195,2772,INNER-195,28,400,INK,1.55)

section('04','如何使用：按表达任务选择风格','先确定要讲清什么、让谁感受到什么，再选表现语言与已有资产。',2916)
uses=[
 ('品牌与产品传播','矢量 / 形变 / 包豪斯 / 3D','品牌片头、概念短片\n产品特性与视觉主镜头'),
 ('知识与系统解释','线条 / 2.5D / 科普 / 玻璃','机制图解、系统架构\n功能流程与界面演示'),
 ('故事与文化内容','手绘 / 拼贴 / 像素','情绪小故事、教育内容\n文创栏目与怀旧表达'),
 ('活动与科技包装','霓虹 / 花字 / HUD / 液态','节目包装、舞台视觉\n科技预告与主题转场')]
uw=(INNER-3*GAP)//4
for i,(name,style,body) in enumerate(uses):
    x,y=M+i*(uw+GAP),3060
    line(x,y,x+uw,y,COPPER,3)
    text(name,x,y+23,31,700,INK,uw)
    paragraph(style,x,y+83,uw,25,500,COPPER,1.4)
    paragraph(body,x,y+135,uw,27,400,MUTED,1.48)

rect(M,3310,INNER,244,INK,12)
text('复用的边界，也要一起沉淀',M+30,3336,33,700,'#F6F2E7')
paragraph('源库不是统一视频 API，也不是十五个已安装 Skill；Remotion 是我们的制作方案。\n当前工作台未接入文生视频、图生视频模型；新故事、新角色、新动作通常仍需补制作。\n模板能运行、能导出，不等于作品优秀；任意故事自动适配十五种风格尚未实现。',M+30,3399,INNER-60,28,400,'#E0E7DB',1.55)
text('可扩展方向 · 尚未通用实现',M,3600,26,650,COPPER)
text('品牌短片模板工具  /  知识解释视频工具  /  有限资产故事创作器  /  批量与多语言版本',M,3647,28,450,INK,INNER)
line(M,3720,W-M,3720)
text('来源：Vincentwei1021/mg-styles-15 · 固定研究提交 49052d80bfaf · 原作封面保留 MIT 声明',M,3748,23,400,MUTED,INNER)
text('我们的实践：纸间故事 0.19 汇总版 · 2026-10-22 · 图片/矢量/三维素材 + 程序动画 + Remotion',M,3787,23,400,MUTED,INNER)
H=3852
for item in bounds:
    if item['x']<0 or item['x']+item['width']>W or item['y']+item['font']>H:
        raise ValueError(f'Clipped text: {item}')
png=OUT/'mg-styles-capability-map.png'
image.crop((0,0,W,H)).save(png,optimize=True,dpi=(180,180))
options=subset.Options();options.flavor='woff2';options.layout_features=['*']
ft=TTFont(str(FONT));subsetter=subset.Subsetter(options=options)
subsetter.populate(text=''.join(copy));subsetter.subset(ft)
buf=io.BytesIO();ft.flavor='woff2';ft.save(buf)
embedded=base64.b64encode(buf.getvalue()).decode()
header=f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" aria-labelledby="title desc"><title id="title">mg-styles-15 能力与研究理解全景图</title><desc id="desc">源库本质、十五种风格的效果与场景、我们的制作链路、可复用沉淀和能力边界。</desc><style>@font-face{{font-family:MapSC;src:url(data:font/woff2;base64,{embedded}) format('woff2');font-weight:100 900}}text{{font-family:MapSC,'Noto Sans SC',sans-serif}}</style><rect width="100%" height="100%" fill="{PAPER}"/>'''
(OUT/'mg-styles-capability-map.svg').write_text(header+'\n'.join(svg)+'</svg>',encoding='utf-8')
manifest=dict(title='mg-styles-15：从十五种风格，到可复用的创作能力',size=dict(width=W,height=H),source=dict(repository='https://github.com/Vincentwei1021/mg-styles-15',commit='49052d80bfaf9fa8412cc9710530e5e95a3b8d8c',posters='15幅源库原作封面，非本项目原创效果'),evidence=['projects/004-mg-styles-explorer/app/styles.json','projects/008-cel-story-studio/RESEARCH-SUMMARY.md'],rendering='Pillow + SVG；使用嵌入的Noto Sans SC子集。非生成式图像，不使用视频模型。',checked=dict(styleCount=len(styles),textLines=len(bounds),textInsideCanvas=True))
(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
shutil.copyfile(PROJECT/'UPSTREAM-LICENSE.txt',OUT/'UPSTREAM-LICENSE.txt')
shutil.copyfile(PROJECT/'app/public/OFL.txt',OUT/'OFL.txt')
print(json.dumps(dict(png=str(png),size=[W,H],styles=len(styles)),ensure_ascii=False))
