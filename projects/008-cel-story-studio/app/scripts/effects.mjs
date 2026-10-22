// Executable templates. The legacy story skins and this library have different contracts.
import {styles} from './styles.mjs';
import {artDirections} from './art-directions.mjs';
import {defaultShots,validateShots} from './film-program.mjs';
import {storyFilms016} from './story-films-016.mjs';
export const EFFECT_VERSION=1;
export const SOURCE_COMMIT='49052d80bfaf9fa8412cc9710530e5e95a3b8d8c';
const rows=[
 ['flat-vector','Canvas · 几何构成','色块、弹性形状、分步构图','几何图形按时序组成一幅品牌海报；形状的挤压和错峰突出信息层级。',['弹性形状','模块排版','进度引导'],'产品功能、品牌开场、概念图解',['模块数量','弹性幅度','圆角程度'],['点亮每个想法','从一点，生长出更多可能','发现,连接,生长'],'#ed593f','#273dca','图形布局、数量与弹性；不包含任意 SVG 拓扑。'],
 ['line-art','Canvas 路径','一笔连接、描边显现、路径取样','同一条路径连接种子、城市与海浪，视线跟随笔尖移动。',['路径采样','分段显现','笔尖跟随'],'品牌脉络、建筑概念、过程说明',['城市节点','线条起伏','墨线粗细'],['一条线的旅行','从种子到城市，万物相连','萌芽,城市,海洋'],'#d6ad68','#1e3b38','程序连续路径，可改变城市轮廓；尚无任意 SVG 导入。'],
 ['isometric','Three.js · 正交相机','真实建筑、灯光、正交投影','地块错峰生长，平行投影让城市模块之间的关系清晰可见。',['建筑生成器','正交镜头','道路连接'],'城市、物流、系统架构',['建筑数量','生长弹性','建筑高度'],['生长中的城市','连接每一个绿色节点','能源,交通,社区'],'#3eada0','#eaa360','真实三维建筑与投影；不包含源作完整城市模型和交通模拟。'],
 ['3d-render','Three.js · PBR 材质','真实体积、物理材质、柔软挤压','球体与圆润立方体在棚拍灯光下依次落下，接触阴影与高光表达重量和触感。',['圆润几何体','PBR 材质','落下与回弹','棚拍灯光'],'材质展示、品牌主视觉、产品片头',['物体数量','回弹高度','表面粗糙度'],['柔软的力量','让想法，拥有可以触摸的形状','柔软,碰撞,新生'],'#ec826f','#7796db','真实 WebGL 三维实时适配。源作是 Blender / Cycles；没有移植软体物理、光线追踪和完整字形模型。'],
 ['cel-boil','Canvas · 种子描线','线条沸腾、一拍二、角色表演','相同角色轮廓按固定种子重画；动作停顿和挤压形成手绘节奏。',['种子墨线','一拍二时间量化','程序角色','纸张纹理'],'情绪故事、儿童内容、手作品牌',['花朵数量','动作幅度','线条沸腾'],['把勇气种下','小小一步，也有自己的光','遇见,尝试,绽放'],'#dd6545','#658e65','直接复用上游手绘描线引擎与纸纹；这里是独立的花园短片模板，故事编辑仍使用原有故事引擎。'],
 ['collage','Canvas · 实物素材','照片剪纸、撕边、定格摆拍','公开领域肖像和植物剪贴与色纸、印章并置；离散姿态制造手工拼贴感。',['实物剪贴','程序撕边','定格摆动','分层投影'],'文化栏目、杂志、音乐视觉',['剪贴数量','摆动幅度','撕边强度'],['脑洞正在发芽','剪开日常，拼出另一种可能','灵感,重组,冒险'],'#d84b39','#367466','复用源作 CC0 剪贴素材；可替换内置素材组，尚未支持自动抠图。'],
 ['liquid','WebGL · GLSL 距离场','液滴融合、液面法线、环境高光','平滑最小距离将运动液滴连成液体；距离梯度计算法线，高光随表面变化。',['平滑 SDF 融合','液滴场','法线高光'],'饮料、美妆、品牌聚合',['液滴数量','流动幅度','融合黏性'],['万物始于一滴','汇聚，流动，再成为新的可能','一滴,交汇,涌现'],'#6f7ef0','#e078af','真实 GPU 液滴融合和高光着色；不是流体求解器，尚无任意文字液化。'],
 ['morph','Canvas · 轮廓插值','等点数轮廓、最短旋转匹配','圆、星、花与方形以同样数量的点对应，连续插值而非淡入淡出。',['轮廓采样','循环点匹配','形状插值'],'图标关系、功能切换、品牌演变',['轮廓瓣数','形变弹性','轮廓圆润度'],['变化自有联系','每一种形状，都通向下一种可能','圆点,星光,花朵'],'#f29d28','#2a42d2','可组合的程序单轮廓；不支持多孔字形自动匹配。'],
 ['bauhaus','Canvas · 几何编舞','严格网格、半圆模块、相位节奏','原色几何模块按行列错峰旋转，少量规则生成系列海报。',['网格模块','半圆构成','相位编排'],'展览、音乐节、动态海报',['网格密度','节奏幅度','图形比例'],['秩序中的节奏','少一点规则，多一种可能','构成,节奏,平衡'],'#de493b','#2449c7','独立几何模块编舞；没有分析上传音乐的 BPM。'],
 ['synthwave','Three.js · 透视场景','真实透视网格、落日、霓虹道路','相机沿真实三维道路前进，地面网格和山体产生透视运动；叠加 CRT 扫描。',['三维道路','霓虹灯带','条纹落日','CRT 扫描'],'电子音乐、游戏开场、复古活动',['道路灯带','前进速度','山体高度'],['驶向下一束光','把未来，开进霓虹色的夜晚','出发,加速,远方'],'#ed4dce','#67dceb','真实三维道路与透视；辉光由发光材质与透明光晕表达，未移植源作完整 VHS 后期。'],
 ['aurora-glass','WebGL · 完整场景折射','极光光场、播放器内容、透镜穿字','背景、中文与播放器先合成为场景纹理，再由凸透镜偏移采样，加入受控色散与薄边高光。',['完整场景合成','场景纹理折射','圆角玻璃 SDF'],'软件发布、AI 产品、功能卡片',['卡片密度','光场流速','折射强度'],['灵感自然流动','轻盈承载，清晰表达','捕捉,整理,创造'],'#7c97f4','#ea9fae','中文、波形与读数实际参与屏幕空间折射；尚未支持任意产品截图和三维多层光线追踪透射。'],
 ['hanazi','Canvas · 照片与动态文字','逐字弹跳、多重描边、情绪符号','照片舞台配合逐字缩放、描边与情绪符号，用节奏把语义重点放大。',['逐字动画','多重描边','情绪符号','照片取景'],'生活短视频、综艺包装、口播重点',['情绪符号','文字弹性','描边厚度'],['今天也太棒了','把普通的一天，过成高光时刻','哇,真的,太棒了'],'#f4a841','#d75270','使用源作公开领域照片；文本与节奏可改，尚未接入语音转字幕。'],
 ['paperclip','Canvas · 知识卡片','贴纸、知识节点、连接箭头','知识拆成卡片，按顺序出现并用箭头建立联系；贴纸让抽象概念更易记。',['白边贴纸','卡片排版','箭头连接','步骤计数'],'知识讲解、课程、产品步骤',['贴纸数量','入场弹性','纸片倾斜'],['想法如何生长','从看见，到理解，再到行动','观察,连接,行动'],'#ed8b48','#3f8d7a','可编辑步骤与示意连接；无事实检索和自动核查。'],
 ['pixel','Canvas · 320×180','像素资产、整数格点、一拍二','程序精灵在低分辨率舞台跳跃，整数坐标与最近邻放大保持像素颗粒。',['像素精灵','格点运动','地形生成','粒子奖励'],'独立游戏、复古故事、游戏栏目',['地形密度','跳跃高度','精灵大小'],['像素也有梦想','收集小小的光，走向新的世界','出发,跳跃,通关'],'#96bf6c','#bf765e','独立像素游戏舞台，可改地形与动作；尚无外部精灵表导入。'],
 ['hud','Three.js + Canvas','三维地球、轨道、追踪与仪表','真实三维经纬球与轨道表现空间关系，画面叠加与时间一致的进度和标记。',['三维经纬球','轨道目标','追踪标记','状态仪表'],'科技发布、系统演示、任务概念',['轨道目标','扫描速度','轨道倾角'],['连接每一个信号','让复杂系统，拥有清晰的反馈','捕捉,锁定,连接'],'#45d9ca','#f2ba68','三维示意球和演示遥测；不是实时传感器、地图或真实业务数据。'],
];
const extensions=['品牌图标、产品数据与可配置图表','SVG 路径导入和一笔连接规划','数据绑定、模块类型与交通路径','Blender 离线渲染、字形建模与软体模拟','更多角色资产、逐帧动作与笔刷','授权素材上传、自动抠图和版式约束','字标距离场、音乐包络与流体求解','多轮廓 SVG、带孔拓扑与自动对应','节拍表、音乐 BPM 与系列海报','音乐联动、完整 VHS 后期与镜头编排','产品截图、多层折射和真实三维透射','语音转字幕、逐词时间轴与竖屏','知识来源绑定、事实审阅与图标库','外部精灵表、逐帧动作和像素字体','真实业务 API、经过校验的数据与地图'];
export const effectTemplates=rows.map(([id,engine,features,principle,modules,useCases,controls,example,primary,secondary,boundary],index)=>({...Object.fromEntries(Object.entries(styles.find(s=>s.id===id)).filter(([k])=>['id','slug','name','en','group','color'].includes(k))),engine,features,principle,modules,useCases,controls,example,primary,secondary,boundary,next:extensions[index],implementation:'工作台独立效果模板',source:{repository:'https://github.com/Vincentwei1021/mg-styles-15',commit:SOURCE_COMMIT,relationship:id==='collage'||id==='hanazi'?'设计语言适配 + 源作公开领域素材复用':id==='cel-boil'?'上游绘线引擎与纸纹复用 + 独立分镜': '设计原理转化为独立、可参数化的实现'}}));
for(const s of effectTemplates){s.source.features=s.features;Object.assign(s,artDirections[s.id]);s.source.relationship=s.id==='cel-boil'?'上游 MIT 绘线引擎与纸纹复用；题材、角色和分镜原创':s.id==='collage'||s.id==='hanazi'?'参考风格机制；素材由本项目 ImageGen 新生成，题材和分镜原创':'参考风格机制；独立题材、模型与分镜实现';}
export function getEffect(id){return effectTemplates.find(s=>s.id===id)||effectTemplates[3];}
export function effectDefaults(id='3d-render'){
 const s=getEffect(id),shots=defaultShots(id);return {kind:'effect-template',version:1,style:s.id,title:s.example[0],subtitle:s.example[1],words:s.example[2].split(','),primary:s.primary,secondary:s.secondary,count:8,intensity:.65,detail:.55,seed:21,duration:10,sound:true,...(shots?{shots}:{})};
}
export function validateEffect(x){
 if(!x||x.kind!=='effect-template'||x.version!==1||!effectTemplates.some(s=>s.id===x.style))throw new Error('效果模板配置无效。');
 const text=(v,max)=>{if(typeof v!=='string'||!v.trim()||Array.from(v).length>max)throw new Error(`文字须为 1–${max} 字。`);return v.trim();};
 const n=(v,a,b)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<a||v>b)throw new Error('效果参数超出范围。');return v;};
 if(!Array.isArray(x.words)||x.words.length<2||x.words.length>5)throw new Error('需要 2–5 个内容节点。');
 if(x.sound!==undefined&&typeof x.sound!=='boolean')throw new Error('配乐选项必须为布尔值。');
 for(const c of [x.primary,x.secondary])if(typeof c!=='string'||!/^#[\da-f]{6}$/i.test(c))throw new Error('颜色格式无效。');
 const duration=n(x.duration,4,20),shots=validateShots(x.shots,x.style,duration);
 if(x.storyId!==undefined&&!storyFilms016[x.style]?.some(s=>s.id===x.storyId))throw new Error('故事方案与风格不匹配。');
 return {kind:'effect-template',version:1,style:x.style,title:text(x.title,18),subtitle:text(x.subtitle,48),words:x.words.map(w=>text(w,12)),primary:x.primary,secondary:x.secondary,count:Math.round(n(x.count,3,14)),intensity:n(x.intensity,0,1),detail:n(x.detail,0,1),seed:Math.round(n(x.seed,1,9999)),duration,...(x.sound===undefined?{}:{sound:x.sound}),...(shots?{shots}:{}),...(x.storyId===undefined?{}:{storyId:x.storyId})};
}
