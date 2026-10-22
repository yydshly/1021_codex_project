import {neonDesign013 as neon} from './neon-design-013.mjs';
import {pixelDesign013 as pixel} from './pixel-design-013.mjs';
import {hudDesign013 as hud} from './hud-design-013.mjs';
export const directions013={
 synthwave:{example:[neon.title,neon.subtitle,'苏醒,展开,穿越'],primary:'#ff3ba7',secondary:'#3fe0ed',engine:'Three.js · 机械磁带与光轨',features:'磁芯特写、磁带出舱、空间穿越与装置收束',principle:neon.principle,modules:neon.modules,controls:['频率环密度','磁芯转速','实体磁带宽度'],boundary:neon.boundary+' 已支持有限动作词表的镜头编排与 AI 方案；不生成任意模型。',next:'音频频谱输入、更多产品资产、摄影机轨迹与磁带张力模拟'},
 pixel:{example:[pixel.title,pixel.subtitle,'接月,补月,亮灯'],primary:pixel.primary,secondary:pixel.secondary,engine:'Canvas · 原创像素故事',features:'猫机械师、碎月敲补、星光升空与城市亮灯',principle:pixel.principle,modules:pixel.modules,controls:['星屑与窗口密度','接月与敲击幅度','星空与陨坑细节'],boundary:pixel.boundary+' AI 可在这套资产的动作范围内编排。',next:'外部精灵表、角色资产组、逐帧姿态编辑与更多可执行事件'},
 hud:{example:[hud.title,hud.subtitle,'寻迹,解码,苏醒'],primary:'#39d7df',secondary:'#ffbd63',engine:'Three.js · 深海目标与同步 HUD',features:'声呐定位、翼骨扫描、脊线分流与机械蝠鲼舒翼',principle:hud.principle,modules:hud.modules,controls:hud.controls,boundary:hud.boundary,next:'可校验真实数据接口、可替换目标模型、自由扫描路径与业务状态绑定'},
};
