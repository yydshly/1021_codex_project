// One catalog is shared by the editor, AI request validation and renderers.
export const DEFAULT_STYLE='cel-boil';
export const styles=[
  {id:'flat-vector',slug:'01-flat-vector',name:'扁平矢量',en:'FLAT VECTOR',group:'基础图形',color:'#e65d42',principle:'有限色板、大色块与留白；动作通过挤压、拉伸和错峰入场形成节奏。',value:'让信息快速被理解，也容易延续品牌识别。',useCases:'产品解释 · 品牌短片 · 教育内容',extension:'品牌色、图标、图表与模块转场',implementation:'Canvas 几何轮廓、弹性姿态与色块舞台',scope:'几何角色原型；未复刻上游 One Dot 分镜。'},
  {id:'line-art',slug:'02-line-art',name:'线条动画',en:'LINE ART',group:'基础图形',color:'#416c99',principle:'连续线条连接叙事节点，用负空间和描绘顺序引导视线。',value:'以很少的视觉元素，说明事物之间的关系。',useCases:'流程介绍 · 建筑概念 · 极简品牌',extension:'任意 SVG 路径、连线与路径镜头',implementation:'Canvas 轮廓、路径逐段显现与跟随光点',scope:'程序轮廓描绘；尚未支持任意图标的一笔连接。'},
  {id:'isometric',slug:'03-isometric',name:'等轴 2.5D',en:'ISOMETRIC',group:'空间材质',color:'#438f8c',principle:'保持平行的投影轴，用顶面、侧面、遮挡和投影组织空间。',value:'把抽象步骤变成可观察的空间模块。',useCases:'架构说明 · 城市概念 · 物流流程',extension:'数据驱动地块、建筑与模块连接',implementation:'Canvas 等轴投影、挤出方块与立体路径',scope:'2.5D 投影原型；没有上游 Three.js 的真实光照与遮蔽。'},
  {id:'3d-render',slug:'04-3d-render',name:'3D 质感',en:'SOFT VOLUME',group:'空间材质',color:'#9a81c5',principle:'高光、明暗面、接触阴影和变形，共同提示物体的体积与重量。',value:'把触感和柔软度变成品牌的视觉记忆。',useCases:'材质概念 · 品牌主视觉 · 发布会片头',extension:'接入 Blender 序列帧或 Three.js 真正三维场景',implementation:'Canvas 径向光照渐变、软阴影与棚拍舞台',scope:'二维体积近似，不是 Blender / Cycles 三维渲染。'},
  {id:'cel-boil',slug:'05-cel-boil',name:'逐帧手绘',en:'FRAME BY FRAME',group:'叙事手作',color:'#ae6748',principle:'种子噪声改变墨线，一拍二和快速拉伸帧形成手工绘制的节奏。',value:'为简单图形增加情绪、性格与手作温度。',useCases:'情绪故事 · 儿童教育 · 文创短片',extension:'角色资产、笔刷、烟雾与逐帧特效',implementation:'上游 MIT 绘线引擎、纸纹与本项目角色动作',scope:'沿用已实现的手绘舞台与笔刷；单角色、有限动作。'},
  {id:'collage',slug:'06-collage',name:'拼贴剪贴',en:'PAPER COLLAGE',group:'叙事手作',color:'#b05750',principle:'纸片、印刷纹理与尺度反差并置，用离散摆动模拟逐格摆拍。',value:'通过材料之间的反差制造联想和故事气质。',useCases:'文化栏目 · 音乐视觉 · 历史故事',extension:'带授权信息的照片、版画和抠图素材库',implementation:'程序撕纸边缘、纸纹、分层剪影与定格摆动',scope:'使用程序纸片，没有照片拼贴、抠图或素材上传。'},
  {id:'liquid',slug:'07-liquid',name:'液态流动',en:'LIQUID MOTION',group:'空间材质',color:'#4489b4',principle:'平滑距离场融合主体和跟随液滴，以细颈、拖尾和错时运动表达黏连。',value:'直观表达聚合、流动、变化与活力。',useCases:'饮料美妆 · 品牌融合 · 流体转场',extension:'字标距离场、更多液滴与音乐包络',implementation:'CPU 采样平滑 SDF、低分辨率场放大与液滴拖尾',scope:'轻量液滴场；没有上游 WebGL 字标融合与液体物理。'},
  {id:'morph',slug:'08-morph',name:'形变动画',en:'SHAPE MORPH',group:'基础图形',color:'#875cad',principle:'轮廓以相同数量的点建立对应，连续插值让一个形状变成另一个形状。',value:'用连续变化表达对象之间的关联。',useCases:'图标动画 · 功能关联 · 品牌升级',extension:'SVG 轮廓采样库、复杂轮廓拓扑规划',implementation:'80 点径向轮廓插值、旋转和轮廓残影',scope:'仅支持预设的简单单轮廓；不支持任意带孔图形。'},
  {id:'bauhaus',slug:'09-bauhaus',name:'几何包豪斯',en:'BAUHAUS',group:'基础图形',color:'#d64b38',principle:'有限原色、严格网格与几何模块，通过重复、翻转和相位建立秩序。',value:'用少量规则生成统一的系列视觉。',useCases:'设计展 · 动态海报 · 音乐节包装',extension:'节拍表编排、网格参数与系列海报',implementation:'网格模块、半圆构成与帧号驱动的节奏变化',scope:'几何构成原型；配乐尚未分析 BPM 或自动卡点。'},
  {id:'synthwave',slug:'10-synthwave',name:'复古霓虹',en:'SYNTHWAVE',group:'叙事手作',color:'#b455c3',principle:'透视网格、条纹落日、霓虹辉光和扫描线共同建立复古电子氛围。',value:'快速唤起时代感、速度感和音乐情绪。',useCases:'电子音乐 · 游戏活动 · 复古品牌',extension:'音乐驱动、可调 VHS 后期与镜头运动',implementation:'Canvas 透视网格、发光线条与扫描线',scope:'二维霓虹舞台；没有 Three.js 场景或完整 VHS 后期。'},
  {id:'aurora-glass',slug:'12-aurora-glass',name:'极光玻璃',en:'AURORA GLASS',group:'空间材质',color:'#719cca',principle:'柔和光场缓慢漂移，透明层、边缘高光与投影形成通透层次。',value:'给软件和概念信息提供安静、有层次的包装。',useCases:'AI 工具 · 软件发布 · 功能亮点',extension:'产品截图、真实折射着色器与音频联动',implementation:'渐变光场、半透明卡片与边缘高光',scope:'玻璃视觉近似；没有真实折射或背景采样。'},
  {id:'hanazi',slug:'18-hanazi',name:'综艺花字',en:'KINETIC CAPTIONS',group:'信息界面',color:'#e08632',principle:'文字缩放、倾斜、多层描边和情绪符号在关键动作处同时出现。',value:'把语言的重点和情绪直接放大。',useCases:'生活短视频 · 访谈重点 · 趣味产品演示',extension:'逐字字幕时间轴、照片与情绪音效库',implementation:'逐字弹性文字、多层描边、爆炸框与表情角色',scope:'横屏文字包装；未接入语音字幕或真人照片。'},
  {id:'paperclip',slug:'19-paperclip',name:'贴纸科普',en:'STICKER EXPLAINER',group:'信息界面',color:'#578c69',principle:'白边贴纸、便签与箭头把知识拆成小块，再按步骤组织阅读顺序。',value:'降低信息密度，让讲解显得轻松、可记忆。',useCases:'知识科普 · 课程卡片 · 操作说明',extension:'知识卡片、图标库与可配置箭头',implementation:'网格纸、剪切白边、便签卡片和步骤标签',scope:'沿用故事动作作演示；没有自动事实核查或知识检索。'},
  {id:'pixel',slug:'20-pixel',name:'像素动画',en:'PIXEL WORLD',group:'叙事手作',color:'#677d52',principle:'低分辨率形状与整数格点运动形成像素颗粒，轮廓依靠色阶保持清晰。',value:'以小型资产呈现游戏感和复古叙事。',useCases:'独立游戏 · 复古片头 · 轻量故事',extension:'精灵表、逐帧动作库与像素字体',implementation:'320 × 180 离屏画布、像素角色与最近邻放大',scope:'程序像素角色；中文字幕为清晰字体，尚非专用像素字库。'},
  {id:'hud',slug:'22-hud',name:'科技 HUD',en:'MISSION CONTROL',group:'信息界面',color:'#3d9398',principle:'对齐网格、扫描、追踪框与仪表层把状态变化转成可读的信息界面。',value:'让步骤、进度与目标关系具有可见的反馈。',useCases:'科技演示 · 数据概念 · 系统状态片',extension:'真实数据绑定、仪表组件与追踪模板',implementation:'状态仪表、追踪框、轨迹与扫描线',scope:'仪表显示本片真实动作与进度；不代表外部传感器数据。'},
];
export const styleIds=styles.map(s=>s.id);
export function getStyle(id){return styles.find(s=>s.id===id)||styles.find(s=>s.id===DEFAULT_STYLE);}
export function validateStyle(value){
  if(value===undefined)return DEFAULT_STYLE;
  if(typeof value!=='string'||!styleIds.includes(value))throw new Error('视觉风格选项无效。');
  return value;
}
