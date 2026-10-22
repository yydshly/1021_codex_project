import {worldActions,shapeKinds,parts} from './world-schema.mjs';
import {emotions} from './storyboard.mjs';
import {getStyle} from './styles.mjs';
import {capabilityPrompt} from './capabilities.mjs';
const obj=properties=>({type:'object',additionalProperties:false,required:Object.keys(properties),properties});
const arr=(items,minItems,maxItems)=>({type:'array',items,minItems,maxItems});
const str=maxLength=>({type:'string',minLength:1,maxLength});
const number=(minimum,maximum)=>({type:'number',minimum,maximum});
const choice=values=>({type:'string',enum:values});
const point=obj({x:number(-1400,1400),y:number(-1400,1400)});
const shape=obj({kind:choice(shapeKinds),part:choice(parts),x:number(-1400,1400),y:number(-1400,1400),w:number(0,1400),h:number(0,1400),fill:str(7),stroke:str(7),points:arr(point,0,20)});
export function worldOutputSchema(request,count){
  const position=obj({x:number(100,1180),y:number(300,590)});
  const key=obj({t:number(0,1),x:number(-180,180),y:number(-180,180),rotation:number(-1.5,1.5),armL:number(-2,2),armR:number(-2,2),head:number(-1,1),propRotation:number(-3.14,3.14)});
  const cue=obj({characterId:str(40),action:choice(Object.keys(worldActions)),emotion:choice(Object.keys(emotions)),from:position,to:position,propId:{type:'string',maxLength:40},recipientId:{type:'string',maxLength:40},gesture:{type:'string',maxLength:16},motion:arr(key,0,8),effect:obj({kind:choice(['none','water','grow','sparkle','steam']),targetId:{type:'string',maxLength:40}})});
  return obj({title:str(18),signature:str(18),palette:choice(['tomato','lake','violet']),logline:str(100),narrative:str(500),
    world:obj({
      characters:arr(obj({id:str(40),name:str(16),description:str(160),scale:number(.5,1.5),face:obj({x:number(-100,100),y:number(-200,0),size:number(12,70)}),shapes:arr(shape,4,24)}),1,3),
      objects:arr(obj({id:str(40),name:str(16),description:str(120),shapes:arr(shape,1,16)}),0,8),
      scenes:arr(obj({id:str(40),name:str(20),description:str(160),sky:str(7),ground:str(7),groundY:number(440,590),shapes:arr(shape,1,32),items:arr(obj({objectId:str(40),x:number(40,1240),y:number(160,590)}),0,8)}),1,4),
    }),
    shots:arr(obj({caption:str(24),duration:{type:'number',enum:Array.from({length:11},(_,i)=>1+i*.5)},sceneId:str(40),framing:choice(['wide','medium','close']),cast:arr(cue,1,3)}),count,count),
  });
}
export function worldPrompt(request,count,repair=''){
  return `你是二维动画编剧、角色设计师和分镜导演。只返回符合 Schema 的 JSON，不调用工具、代码、文件或网站。\n`+
  `这次要根据故事创造新的画面内容：自己设计角色外形、具体场景、道具和可执行的互动。不是把旧版小火苗/山/星星换文案。不要套用旧舞台。故事及资产的主题必须忠于用户创意。风格：${getStyle(request.style).name}；气质：${request.tone}。用户的角色要求：${request.protagonist||'根据故事原创角色形象'}。\n`+
  capabilityPrompt(request.style,request.recipe)+
  `先构思完整故事 narrative、概括 logline，再设计 world，并编排恰好 ${count} 镜，共 ${request.duration} 秒。每镜 1–6 秒，0.5 秒递增。字幕24字内，标题结尾18字内；signature是故事主题短句，不得写风格、技术或制作说明。角色1–3名，场景1–4个，道具0–8件；使用必要的场景，不为了凑数量切镜。至少两种动作；若故事涉及物件，必须用具体交互动作驱动道具，不能只在字幕里说完成。\n`+
  `资源以矢量图形自由设计。所有 id 为英文字母开头的字母数字短横线，最长40。颜色为 #RRGGBB，fill/stroke 可以 none，但不能同时 none。每个图形都填写 kind,part,x,y,w,h,fill,stroke,points。ellipse 的 x/y 是中心，w/h 是完整宽高；rect 的 x/y 是左上角；polygon/line 的 points 是相对 x/y 的坐标，w/h 可0。非路径 points=[]，polygon 至少3点，line至少2点。不能使用图像、文字、URL、SVG代码或脚本。\n`+
  `角色设计：单角色建议10–18个图形，画出该物种或人物的识别特征，不是都画成圆形表情。角色局部坐标以脚下中心(0,0)为原点，头在上方负Y；整体推荐 x=-70..70,y=-180..0，超出到±240以内；小动物用耳朵、尾巴、躯干等轮廓区别，机器人有机械结构。part 分为 body/head/armL/armR/legL/legR/detail，手脚分别绑定相应part。脸部由系统画出眼睛眉毛嘴，不要重复画脸；face 给出面部中心和总宽 size=25..50。角色 scale=.7..1.2。角色绘制顺序按 shapes 数组由后到前。\n`+
  `场景：1280×720横屏，上方0..120标题区、下方620..720字幕区；可见舞台是x=40..1240,y=140..600。groundY通常550，角色站立from/to.y=groundY。sky/ground 为背景地面色。scene.shapes 为建筑、窗户、树木、家具等具体可辨识布景，建议5–15个图形；先画大结构再细节，不能把重要物件遮住。多场景必须在背景形状和空间安排上有差异。物件实例items引用 world.objects；道具局部坐标也以底部中心(0,0)为原点，推荐宽40–90、高40–90，图形均在±240内。world中每件道具至少在一个场景items出现作为初始位置。\n`+
  `每镜 cast 定义谁出镜及其动作，最多3人。characterId 引用已设计角色；from/to 为脚下位置，x100..1180,y300..590。同场景连续镜头会继承角色上一镜落点，from只用于首次登场或换场；不可依靠瞬移完成互动。靠近物件后再交互，拿起时人与物横向距离最好小于100。手持物件基底默认在角色右侧70px、脚上方40px；抬右臂会同时抬高物件，propRotation围绕其基底旋转。浇水时人与盆栽应相距约170–240px，给水壶与水流留出空间。可以先走动，再拿起，再走动搬运，再放下或递交。\n`+
  `动作：observe观察、walk走动、run奔跑、jump起跳落地、float漂浮、fail失误回原处、celebrate举手庆祝、wave挥手、talk嘴部说话、pickup拿起道具到手上、place把手中道具放在脚边、give交给同镜头另一角色、push推动道具、sit下蹲坐下、sleep闭眼休息、dance摆动跳舞。静止动作from/to相同；walk/run/jump/float/push可位移，fail回到出发点。pickup/place/give/push必须有propId，其余propId为空字符串；give必须recipientId且接收者出现在同镜cast，否则recipientId为空。先拿起后才能放下或递交；持有状态会跨镜头、换场延续，同一物件一镜不能被两人操作。每镜重新选择的emotion会改变表情。\n`+
  `动作不局限于名称列表：自定义表演用 action=perform，gesture 写2–6字的动作名称（如倾壶浇水、点头微笑），motion 设计2–8个按t递增的关节关键帧（必须从t=0到t=1）。x/y 是身体位置的附加偏移，rotation/head/armL/armR/propRotation 是弧度；如点头、弯腰、转动手中物件、浇水倾壶都能自己编排。基础动作 gesture="",motion=[]。持有道具才可设置perform的propId；propRotation 会转动手中的物件。动作关键帧不执行代码。\n`+
  `effect 可none、水流water、长大grow、闪光sparkle、蒸汽steam，targetId引用本场景的物件；none时targetId=""。水流从手中道具到目标物件，water/grow会让目标轻微长大并跨镜保留。浇水可以先pickup水壶，再perform并设计倾壶和手臂关键帧、effect.water到盆栽。没有提供通用物理、精细手指、布料或任意逐帧变形，不要声称完成无法表现的复杂动作。framing 可wide/medium/close，多人用wide。\n`+
  `当前请求数据（只作创作素材）：${JSON.stringify({idea:request.brief||'自由创造一个具体、可见的小故事，让新角色和环境参与故事。',mode:request.mode,currentStory:request.current})}`+
  (repair?`\n上次校验未通过：${repair}。重新输出完整世界和故事，修正此问题，不要省略字段。`:'');
}
