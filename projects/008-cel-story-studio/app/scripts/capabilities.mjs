import {styles,getStyle} from './styles.mjs';

export const MAX_COMPONENTS=6;
const module=(id,name,origin,principle,value,scope,amount=.55)=>({id,name,origin,principle,value,scope,amount,status:'available',engine:'Canvas 2D · 按帧确定性绘制'});
export const components=[
  module('paper-grain','纸感叠印','cel-boil','纸纹以低透明度叠印在舞台上，保留图形轮廓。','让数字图形具有温度与触感。','复用本地纸纹；不生成新的笔刷。',.35),
  module('ink-border','手绘边饰','cel-boil','离散帧更新轻微不规则的线段与排线。','加强手作气质，给画面建立边界。','作用于舞台边缘，不替换角色骨骼。',.5),
  module('focus-halo','聚焦光环','flat-vector','以主体为中心的低对比光晕引导注意力。','在复杂场景里突出正在行动的角色。','跟随本镜第一名出镜角色。',.45),
  module('line-trail','行动轨迹','line-art','采样本镜真实位移，以逐段显现的虚线连接落点。','让移动路径与方向更容易理解。','只标记已有动作路径；不会创建新动作。',.65),
  module('iso-grid','等轴参考网格','isometric','使用两组平行斜线提示地面空间关系。','帮助表达空间秩序和路径。','二维网格，不增加三维几何。',.4),
  module('soft-spotlight','柔光聚焦','3d-render','柔和径向光场与周边暗部突出主体。','为重要时刻增加舞台感与视觉层次。','二维光场；没有真实反射、阴影求解。',.45),
  module('collage-note','纸片场记','collage','轻微转动的纸片承载本镜情绪标签。','为回忆、日记和说明增加手工编排感。','程序纸片与文字，不包含照片素材。',.65),
  module('ripple','落点涟漪','liquid','角色脚下的椭圆轮廓随时间扩散。','用柔和的回响强调停留与动作落点。','装饰性波纹，不是物理流体。',.55),
  module('shape-echo','形状回响','morph','主体周围的多边形在连续轮廓间插值并扩散。','用形状变化强调转折与情绪。','独立装饰轮廓；不改变角色拓扑。',.55),
  module('geometric-beat','几何节拍','bauhaus','几何模块按固定帧间隔交替旋转、缩放。','建立有秩序的视觉节奏。','固定视觉节拍，尚未分析音乐 BPM。',.55),
  module('neon-scan','霓虹扫描','synthwave','辉光扫描线和边缘短线按帧推进。','传达电子、速度与复古氛围。','二维发光，不添加真实三维环境。',.45),
  module('aurora-veil','极光光幕','aurora-glass','透明渐变光场缓慢漂移并叠加。','为平静或想象中的场景增加通透层次。','没有玻璃折射或背景模糊采样。',.35),
  module('emotion-tag','情绪花字','hanazi','读取本镜真实情绪，使用弹性缩放与多层描边。','在情绪转折处加强可读性和幽默感。','使用五种已有情绪；没有语音识别。',.6),
  module('step-badge','步骤标记','paperclip','从时间轴读取当前镜头编号与总数。','让过程、操作和知识讲解更有条理。','展示镜头步骤，不进行事实核查。',.7),
  module('pixel-sparks','像素火花','pixel','整数格点上的方形粒子形成离散运动。','用游戏语言强调变化与获得感。','程序粒子，没有角色精灵动画资产。',.55),
  module('tracking-frame','主体追踪框','hud','用投影后的主体坐标驱动角框与动作标签。','让行动和状态成为可观察的信息。','追踪故事中的角色，不接入外部传感器。',.65),
  module('camera-push','镜头缓推','shared','按本镜进度缩放舞台，以行动主体为构图参考。','用景别变化引导观看和强调关键时刻。','最多约 10% 的二维推进；标题字幕保持稳定。',.5),
];

// These are our design interpretations and extension plans, not upstream features.
const specs={
  'flat-vector':{dna:['有限高对比色板、简洁几何与留白','圆润轮廓与清晰字号','弹性起落、错峰入场，主体始终明确'],expression:'把概念、关系和行动概括成一眼可读的图形，适合简短解释与轻快故事。',avoid:'复杂写实细节与同时抢占注意力的大量元素。',modules:['focus-halo','camera-push','shape-echo'],recommended:['focus-halo','camera-push'],next:['数据图表、品牌标识与图标路径组件','根据叙事节点生成色块转场与版式']},
  'line-art':{dna:['克制色板、细线与大面积负空间','轮廓生长形成观看顺序','沿路径推进，在转折处停留'],expression:'表达连接、发现、流程和连续思考，让一条路径承担叙事。',avoid:'过细线条、小尺寸密集标注与没有因果的随机描线。',modules:['line-trail','focus-halo','camera-push'],recommended:['line-trail','focus-halo'],next:['可采样 SVG 路径库与连续图标连接','按路径事件生成镜头和声音节拍']},
  isometric:{dna:['统一平行投影与层次配色','顶面、侧面和遮挡提示空间','按结构层级生长、装配与连线'],expression:'把系统、城市、协作关系变成可以观察的空间组织。',avoid:'过多建筑遮挡，以及把投影网格误作真实三维。',modules:['iso-grid','line-trail','step-badge'],recommended:['iso-grid','step-badge'],next:['可参数化的 Three.js 建筑、节点与道路组件','数据驱动的装配顺序、遮挡控制与相机']},
  '3d-render':{dna:['材质色与柔和棚拍光','体积、接触阴影、反射共同建立触感','重量感、迟滞、形变与回弹'],expression:'突出产品、字标或角色的材料与重量，形成视觉记忆。',avoid:'把二维渐变当作已完成真实三维材质。',modules:['soft-spotlight','camera-push','focus-halo'],recommended:['soft-spotlight','camera-push'],next:['Blender / Three.js 模型、材质与灯光资源包','预渲染序列帧接入时间轴及多语言包装']},
  'cel-boil':{dna:['暖色纸张、墨色与少量强调色','不规则轮廓、错位填色和叠印','一拍二、姿态停顿和夸张反应'],expression:'让角色具有手作温度；可向治愈、幽默或紧张等不同叙事气质扩展。',avoid:'为抖而抖、轮廓闪烁，以及用字幕代替具体表演。',modules:['paper-grain','ink-border','emotion-tag','camera-push'],recommended:['paper-grain','ink-border'],next:['不同情绪的笔刷、姿态库与关键表演组件','角色轮廓编辑、精细拿放与分镜构图规则']},
  collage:{dna:['纸张、印刷色与不同尺度的拼接','剪切边缘、叠层与手工摆放','定格顿挫、错位与画面重组'],expression:'组织日记、记忆、文化与荒诞联想，用素材的并置制造含义。',avoid:'无关素材堆叠与未经授权的照片。',modules:['collage-note','paper-grain','camera-push'],recommended:['collage-note','paper-grain'],next:['授权照片、抠图与可编辑拼贴资产库','镜头穿梭大画布及纸片翻揭转场']},
  liquid:{dna:['有限相近色与柔和高光','圆润连续边界、融合与分离','缓慢蓄势、拉伸、流动与回弹'],expression:'表达柔软、连接、变化与能量传递。',avoid:'在需要精确边界和快速读字时持续流动。',modules:['ripple','aurora-veil','shape-echo'],recommended:['ripple','aurora-veil'],next:['WebGL 距离场融合与可控制的字标轮廓','适配动作事件的流动、分裂和拖尾']},
  morph:{dna:['简洁轮廓、少量强调色','对应轮廓点形成连续变化','预备、变形、辨认停留与下一次变化'],expression:'表现对象之间的关联、身份转变与概念转换。',avoid:'只做装饰变形，或在变化后没有可辨认的停留。',modules:['shape-echo','focus-halo','camera-push'],recommended:['shape-echo','focus-halo'],next:['图标轮廓采样、对应点与拓扑处理','由故事关联驱动的对象变形语法']},
  bauhaus:{dna:['原色、黑白与严格比例','网格、圆、半圆与几何重复','旋转、翻转和相位构成节奏'],expression:'用秩序、重复和变化表达音乐性、系统性与设计感。',avoid:'让装饰网格遮住故事信息。',modules:['geometric-beat','step-badge','camera-push'],recommended:['geometric-beat','step-badge'],next:['可编辑节拍表和参数化版式组合','音频节拍分析与系列动态海报']},
  synthwave:{dna:['深紫背景、荧光色与落日渐变','透视网格、发光轮廓和扫描线','持续前进、巡航与节拍闪光'],expression:'表达复古电子、夜间旅程与速度感。',avoid:'过强辉光、频闪和低对比文字。',modules:['neon-scan','pixel-sparks','camera-push'],recommended:['neon-scan','camera-push'],next:['音乐联动的光效与可控 VHS 后期','三维道路、相机巡航和夜间空间']},
  'aurora-glass':{dna:['低对比渐变与少量高光','透明叠层、边缘和柔和阴影','缓慢漂移、轻柔进入和层间视差'],expression:'适合安静、思考、想象与软件信息的通透包装。',avoid:'透明层过多导致信息不可读。',modules:['aurora-veil','soft-spotlight','camera-push'],recommended:['aurora-veil','camera-push'],next:['产品卡片、截图布局与多层景深','背景采样、模糊与真实折射着色器']},
  hanazi:{dna:['高对比字体、粗描边与情绪色','文字、表情和爆炸框建立重点','逐字弹性、突然停顿与表演卡点'],expression:'放大语言和角色反应中的重点，用于幽默和情绪转折。',avoid:'每个字都强调，或花字遮挡关键动作。',modules:['emotion-tag','shape-echo','camera-push'],recommended:['emotion-tag','shape-echo'],next:['逐字字幕、语音时间戳与情绪词标记','竖屏版式及人物避让规则']},
  paperclip:{dna:['纸面、便签色与留白','白边贴纸、编号、箭头和卡片','按步骤出现，重点处移动镜头'],expression:'将复杂信息拆成易记的小块，组织过程与知识表达。',avoid:'过多装饰贴纸和没有来源的知识结论。',modules:['step-badge','collage-note','line-trail'],recommended:['step-badge','collage-note'],next:['知识卡片、图表、箭头与图标组件','大画布镜头路径和信息层级编排']},
  pixel:{dna:['有限色板、低分辨率与清晰色阶','整数格点、像素轮廓与方形粒子','离散姿态、跳跃与游戏式反馈'],expression:'为冒险、探索和获得感提供游戏语言。',avoid:'混用不同像素尺度和不清晰的小字号。',modules:['pixel-sparks','step-badge','camera-push'],recommended:['pixel-sparks','step-badge'],next:['角色精灵表、动作状态机与像素中文字库','关卡、道具和任务事件组件']},
  hud:{dna:['深色底、冷色发光线和网格','追踪框、环形仪表与信息对齐','扫描、锁定、反馈与分层更新'],expression:'让角色行动、任务进度和系统状态变成可见信息。',avoid:'无意义的数据噪声和装饰仪表挤占叙事。',modules:['tracking-frame','line-trail','step-badge'],recommended:['tracking-frame','step-badge'],next:['可绑定真实数据的仪表与时间序列','目标关系、异常事件及任务视图组件']},
};
export const capabilityStyles=styles.map(style=>({...style,...specs[style.id],maturity:'基础画法原型',source:{repository:'https://github.com/Vincentwei1021/mg-styles-15',commit:'49052d80bfaf9fa8412cc9710530e5e95a3b8d8c',license:'MIT'}}));
export function getCapability(id){return capabilityStyles.find(s=>s.id===getStyle(id).id);}
export function getComponent(id){return components.find(c=>c.id===id);}
export function recommendedRecipe(style){return {version:1,components:getCapability(style).recommended.map(id=>({id,amount:getComponent(id).amount}))};}
export function validateRecipe(value){
  if(value===undefined)return undefined;
  if(!value||typeof value!=='object'||Array.isArray(value)||value.version!==1||!Array.isArray(value.components)||value.components.length>MAX_COMPONENTS)throw new Error('风格组合需要版本 1，最多 6 个组件。');
  const ids=new Set();
  return {version:1,components:value.components.map(item=>{
    if(!item||typeof item!=='object'||!getComponent(item.id)||ids.has(item.id))throw new Error('风格组件不存在或重复。');
    if(typeof item.amount!=='number'||!Number.isFinite(item.amount)||item.amount<0||item.amount>1)throw new Error('组件强度须在 0–1 之间。');
    ids.add(item.id);return {id:item.id,amount:item.amount};
  })};
}
export function capabilityPrompt(style,recipe){
  const s=getCapability(style),r=validateRecipe(recipe);
  return `风格能力库约束：视觉语言=${s.dna.join('；')}。表达价值=${s.expression}。避免=${s.avoid}。\n`+
    `用户选用的可复用组件：${r?.components.length?r.components.map(x=>{const c=getComponent(x.id);return `${c.name}（${Math.round(x.amount*100)}%）：${c.value}；边界：${c.scope}`;}).join('；'):'无附加组件'}。\n`+
    `让角色轮廓、场景配色、构图和情绪节奏符合这些规则。组件由渲染器执行，不要在字幕中描述组件或照抄原作情节。不要返回或修改 recipe、style 字段。真实三维、物理流体等扩展项尚未实现，不得依赖它们完成情节。\n`;
}
