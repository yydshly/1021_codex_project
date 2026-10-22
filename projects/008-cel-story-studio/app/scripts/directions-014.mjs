import {handDesign014 as hand} from './hand-design-014.mjs';
import {hanaziDesign014 as hanazi} from './hanazi-design-014.mjs';
import {morphDesign014 as morph} from './morph-design-014.mjs';
import {bauhausDesign014 as bauhaus} from './bauhaus-design-014.mjs';
import {solarDesign014 as solar} from './solar-design-014.mjs';
import {citrusDesign014 as citrus} from './citrus-design-014.mjs';
import {lineDesign014 as line} from './line-design-014.mjs';
import {glassDesign014 as glass} from './glass-design-014.mjs';
import {collageDesign014 as collage} from './collage-design-014.mjs';
import {liquidDesign014 as liquid} from './liquid-design-014.mjs';
export const directions014={
 'flat-vector':{example:[citrus.title,citrus.subtitle,citrus.words.join(',')],primary:citrus.primary,secondary:citrus.secondary,features:'整果剖面、径向拆瓣、手指挤压与杯内液面',principle:citrus.principle,modules:citrus.modules,controls:citrus.controls,boundary:citrus.boundary},
 'line-art':{example:line.example,primary:line.primary,secondary:line.secondary,features:'曲率描线、独立鳍部变形、笔尖接续星图与海天海报',principle:line.principle,modules:line.modules,controls:line.controls,boundary:line.boundary},
 'aurora-glass':{principle:'背景、磨砂卡片与动态文字依次写入离屏场景，凸透镜再采样完整场景纹理。透镜依次经过中文标题、频率读数和波形，实际放大和偏折之后收束为完整主视觉。',features:'可读玻璃近景、中文穿字折射、频率放大与主视觉',modules:glass.modules,controls:glass.controls,boundary:glass.boundary},
 liquid:{example:[liquid.title,liquid.subtitle,liquid.words.join(',')],primary:liquid.primary,secondary:liquid.secondary,features:'落滴撞击、波瓣薄冠、两端牵桥、断颈与卫星滴回弹',engine:'WebGL · 三维液桥曲面',principle:'两滴错峰落到支点，薄冠展开后塌回池面；两端液膜接合并拉成中央变薄、两端积厚的拱桥。侧颈断裂后主滴与延迟卫星滴落回，最后保留完整液桥。三维距离场、曲面法线、软阴影和程序环境形成厚薄对照。',modules:liquid.modules,controls:['冠沿与珠滴密度','薄冠与液膜起伏','薄冠壁厚与高光锐度'],boundary:liquid.boundary,next:'更多受力事件、真实缓存流体、质量守恒与路径追踪材质'},
 isometric:{features:'逐工位近景、接触压击、齿轮响应、音管合奏与唱机揭示',principle:'声球沿实体导轨经过压力、传动和音管，每个工位由独立近景呈现准备、接触和响应；镜头到合奏时才后退，最后揭示整座工厂位于唱片之上。',modules:['唱机与厂区模型','导轨接触与压力机','齿轮触发与音管次序','逐工位相机时间表','合奏与尺度揭示']},
 collage:{example:[collage.title,collage.subtitle,collage.words.join(',')],primary:collage.primary,secondary:collage.secondary,features:'纸手调频、纸锥翻面、纸偶抓梯、提灯回应与杂志封面',engine:collage.engine,principle:collage.principle,modules:collage.modules,controls:['水母与纸屑密度','提灯抬升幅度','纸锥排线与纸面颗粒'],boundary:collage.boundary,next:'更多有结构分层的纸偶、可替换素材与可编辑铰链'},
 '3d-render':{features:'单瓣试探、邻瓣响应、分层吸附、失衡悬停与三层花冠',principle:'以一瓣陶片先响应、相邻两瓣随后、其余分层聚集构成可读的磁力事件，减少前段同时飞起的遮挡；近景看釉面铜边，中景看收紧的花苞，失衡悬停后再吸回展开。Cycles保留景深、运动模糊与真实灯箱反射。',modules:['薄壳釉面与铜边','单瓣到多层的响应次序','失衡悬停与花冠','近景与花苞独立取景','Cycles 景深与运动模糊']},
 pixel:{features:'独立头身姿态、锤面接触、月光照明与松气收束',principle:'接月、敲补、升月与亮灯保留四事件编排；角色以独立头部视向、情绪和躯干姿势承受动作，锤面接触跟随碎月边缘，月亮升起后实际改变天空、角色、工台与屋顶色板。',modules:['原生像素城市','角色头身替换姿态','动态锤面接触','月色对场景响应','四事件镜头编排']},
 synthwave:{features:'实体带面遮挡、出入舱接续、盘芯归位与暖金字版',principle:'机械磁带从磁芯近景展开实体光轨，镜头贴近有铜箔细节的带面，在翻折面完全遮挡时进入频率舱；出舱门框收圆成近场盘面，再缩到装置磁芯，最后以暖金冷青的完整字版收束。',modules:['原创机械磁带','实体带面与翻折遮挡','频率舱与门框收圆','盘芯归位镜头','暖金冷青字版'],boundary:'原创Three.js资产与四事件编排。转场用镜头局部三维几何遮挡接续，不等于整座舱与磁带的全局物理连续；未模拟磁带张力或实际音频频谱。'},
 hud:{features:'逐层回声显影、曲面扫描交线、几何绑定读数与舒翼安全取景',principle:'搜索阶段按世界空间扫描前沿逐步显露机械目标，扫描交线来自实际翼面；映射覆盖、面板数、距离、相对深度、翼展和能量读取同一目标状态。舒翼镜头按目标几何边界后退，近景与全景分别保护翼尖，界面从搜索到自主运动随主体切换。',modules:['原创机械蝠鲼','目标曲面扫描与回声显影','目标状态投影与示意读数','舒翼边界取景','四事件镜头编排'],boundary:'原创Three.js机械目标与程序观测示意，覆盖率为曲面采样估计，读数绑定程序状态而非外部传感器。近/远景均有舒翼取景保护；仍为确定性编舞，不是海洋科学或动力学仿真。'},
 'cel-boil':{example:[hand.title,hand.subtitle,hand.words.join(',')],primary:hand.primary,secondary:hand.secondary,engine:'Canvas · 角色逐帧表演',features:'鼻尖悬念、压缩吸气、用力吹气、翻滚抓取与种子漂浮',principle:hand.principle,modules:hand.modules,controls:['种子密度','风线幅度','描线沸腾'],boundary:hand.boundary,next:'更多表演姿势、镜头间角色连续性、可编辑曝光表与用户角色设计稿'},
 hanazi:{example:[hanazi.title,hanazi.subtitle,hanazi.words.join(',')],primary:hanazi.primary,secondary:hanazi.secondary,engine:'Canvas · 反应剪辑与综艺字版',features:'自信、疑惑、事故、静止、抠像爆发与营业海报',principle:hanazi.principle,modules:hanazi.modules,controls:['漫画标点密度','逐字弹性','放射线粗细'],boundary:hanazi.boundary,next:'演员视频、精确人声对齐、独立字形库与可替换抠像资产'},
 morph:{...morph,features:'雨滴撑伞、布面鼓胀成气球、压成风筝与飘带海报',engine:'Canvas · 多部件连续形变',next:'更多原创中介形与可编辑部件映射'},
 bauhaus:{example:[bauhaus.title,bauhaus.subtitle,bauhaus.words.join(',')],primary:bauhaus.primary,secondary:bauhaus.secondary,features:'阶梯、跷板、摩天轮和游乐场动态海报',engine:bauhaus.engine,principle:bauhaus.principle,modules:bauhaus.modules,controls:bauhaus.controls,boundary:bauhaus.boundary,next:'更多模数设施、可编辑接触事件与节拍表'},
 paperclip:{example:[solar.title,solar.subtitle,solar.words.join(',')],primary:solar.primary,secondary:solar.secondary,features:'夜灯提问、连续追光、储能剖面与昼夜总览',engine:'Canvas · 连续画布与产品贴纸',principle:solar.principle,modules:solar.modules,controls:solar.controls,boundary:solar.boundary,next:'经核对的数据源、真实产品素材与更深入的机制图解'}
};
