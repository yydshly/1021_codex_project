export const worldActions={
  observe:'观察',walk:'走动',run:'奔跑',jump:'跳跃',float:'漂浮',fail:'失误',celebrate:'庆祝',
  wave:'挥手',talk:'说话',pickup:'拿起',place:'放下',give:'递交',push:'推动',sit:'坐下',sleep:'睡觉',dance:'跳舞',perform:'自由表演',
};
export const shapeKinds=['ellipse','rect','polygon','line'];
export const parts=['body','head','armL','armR','legL','legR','detail'];
export const MAX_BYTES=262144;
const object=(v,label)=>{if(!v||typeof v!=='object'||Array.isArray(v))throw new Error(`${label}格式无效。`);return v;};
const str=(v,max,label)=>{if(typeof v!=='string'||!v.trim()||Array.from(v).length>max||/[\x00-\x1f]/.test(v))throw new Error(`${label}须为 1–${max} 字的单行文字。`);return v.trim();};
const num=(v,a,b,label)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<a||v>b)throw new Error(`${label}须在 ${a}–${b} 之间。`);return v;};
const id=v=>{if(typeof v!=='string'||!/^[a-zA-Z][\w-]{0,39}$/.test(v))throw new Error('世界资源编号无效。');return v;};
const color=(v,transparent=false)=>{if(transparent&&v==='none')return v;if(typeof v!=='string'||!/^#[a-f0-9]{6}$/i.test(v))throw new Error('颜色须使用六位十六进制。');return v;};
const list=(v,min,max,label)=>{if(!Array.isArray(v)||v.length<min||v.length>max)throw new Error(`${label}数量须为 ${min}–${max}。`);return v;};
const unique=items=>{if(new Set(items.map(s=>s.id)).size!==items.length)throw new Error('世界资源编号重复。');return items;};
export function validateShapes(input,background=false,max=32){
  return list(input,1,max,'矢量图形').map(raw=>{
    const s=object(raw,'图形');if(!shapeKinds.includes(s.kind)||!parts.includes(s.part))throw new Error('图形或部件类型无效。');
    const limit=background?1400:240;
    const result={kind:s.kind,part:s.part,x:num(s.x,-limit,limit,'图形 X'),y:num(s.y,-limit,limit,'图形 Y'),w:num(s.w,0,limit,'图形宽'),h:num(s.h,0,limit,'图形高'),fill:color(s.fill,true),stroke:color(s.stroke,true),points:[]};
    if(result.fill==='none'&&result.stroke==='none')throw new Error('图形至少需要填色或描边。');
    if(['ellipse','rect'].includes(s.kind)&&(s.w===0||s.h===0))throw new Error('图形宽高不能为零。');
    result.points=list(s.points,0,20,'轮廓点').map(p=>({x:num(p.x,-limit,limit,'轮廓 X'),y:num(p.y,-limit,limit,'轮廓 Y')}));
    if(s.kind==='polygon'&&result.points.length<3||s.kind==='line'&&result.points.length<2)throw new Error('路径轮廓点不足。');
    return result;
  });
}
export function validateWorld(input){
  const v=object(input,'故事世界');
  const characters=unique(list(v.characters,1,3,'角色').map(raw=>{
    const c=object(raw,'角色');return {id:id(c.id),name:str(c.name,16,'角色名字'),description:str(c.description,160,'角色设定'),scale:num(c.scale,.5,1.5,'角色大小'),face:{x:num(c.face?.x,-100,100,'面部 X'),y:num(c.face?.y,-200,0,'面部 Y'),size:num(c.face?.size,12,70,'面部大小')},shapes:validateShapes(c.shapes,false,24)};
  }));
  const objects=unique(list(v.objects,0,8,'道具').map(raw=>({id:id(raw.id),name:str(raw.name,16,'道具名字'),description:str(raw.description,120,'道具说明'),shapes:validateShapes(raw.shapes,false,16)})));
  const scenes=unique(list(v.scenes,1,4,'场景').map(raw=>{
    const s=object(raw,'场景');const itemIds=new Set();
    return {id:id(s.id),name:str(s.name,20,'场景名字'),description:str(s.description,160,'场景说明'),sky:color(s.sky),ground:color(s.ground),groundY:num(s.groundY,440,590,'地面高度'),shapes:validateShapes(s.shapes,true,32),items:list(s.items,0,8,'布景道具').map(item=>{
      if(!objects.some(o=>o.id===item.objectId)||itemIds.has(item.objectId))throw new Error('场景道具引用不存在或重复。');itemIds.add(item.objectId);
      return {objectId:item.objectId,x:num(item.x,40,1240,'道具 X'),y:num(item.y,160,590,'道具 Y')};
    })};
  }));
  for(const o of objects)if(!scenes.some(s=>s.items.some(i=>i.objectId===o.id)))throw new Error(`道具 ${o.name} 缺少初始场景。`);
  return {characters,objects,scenes};
}
export function validateWorldShot(raw,world){
  if(!world.scenes.some(s=>s.id===raw.sceneId))throw new Error('镜头引用的场景不存在。');
  if(!['wide','medium','close'].includes(raw.framing))throw new Error('景别无效。');
  const ids=new Set();
  const cast=list(raw.cast,1,3,'出镜角色').map(c=>{
    object(c,'角色动作');
    if(!world.characters.some(a=>a.id===c.characterId)||ids.has(c.characterId))throw new Error('出镜角色不存在或重复。');ids.add(c.characterId);
    if(!Object.hasOwn(worldActions,c.action)||!['curious','afraid','sad','determined','happy'].includes(c.emotion))throw new Error('角色动作或情绪无效。');
    const pos=p=>({x:num(p?.x,100,1180,'角色位置 X'),y:num(p?.y,300,590,'角色位置 Y')});
    const propId=c.propId||'',recipientId=c.recipientId||'';
    if(propId&&!world.objects.some(o=>o.id===propId))throw new Error('动作引用的道具不存在。');
    if(['pickup','place','give','push'].includes(c.action)&&!propId)throw new Error('物件交互需要选择道具。');
    if(c.action==='give'&&(!recipientId||recipientId===c.characterId||!raw.cast.some(a=>a.characterId===recipientId)))throw new Error('递交需要同镜头的另一名接收角色。');
    if(recipientId&&!world.characters.some(a=>a.id===recipientId))throw new Error('接收角色不存在。');
    const motion=c.motion===undefined?[]:list(c.motion,0,8,'动作关键帧').map(k=>({t:num(k.t,0,1,'关键帧时间'),x:num(k.x,-180,180,'动作偏移 X'),y:num(k.y,-180,180,'动作偏移 Y'),rotation:num(k.rotation,-1.5,1.5,'身体旋转'),armL:num(k.armL,-2,2,'左臂角度'),armR:num(k.armR,-2,2,'右臂角度'),head:num(k.head,-1,1,'头部角度'),propRotation:num(k.propRotation,-3.14,3.14,'道具角度')}));
    if(motion.length&&(motion.length<2||motion[0].t!==0||motion.at(-1).t!==1||motion.some((k,i)=>i>0&&k.t<=motion[i-1].t)))throw new Error('动作关键帧须按时间递增，从 0 到 1。');
    if(c.action==='perform'&&motion.length<2)throw new Error('自由表演需要至少两个关键帧。');
    const gesture=c.gesture===undefined?'':c.gesture;
    if(typeof gesture!=='string'||Array.from(gesture).length>16||/[\x00-\x1f]/.test(gesture))throw new Error('动作名称须在 16 字以内。');
    const effect=c.effect||{kind:'none',targetId:''};
    if(!['none','water','grow','sparkle','steam'].includes(effect.kind)||typeof effect.targetId!=='string'||effect.kind!=='none'&&!world.objects.some(o=>o.id===effect.targetId))throw new Error('动作效果目标无效。');
    return {characterId:c.characterId,action:c.action,emotion:c.emotion,from:pos(c.from),to:pos(c.to),propId,recipientId,...(c.motion!==undefined?{motion}:{}),...(c.gesture!==undefined?{gesture}:{}),...(c.effect!==undefined?{effect:{kind:effect.kind,targetId:effect.targetId}}:{})};
  });
  if(cast.filter(c=>['pickup','place','give','push'].includes(c.action)).some((c,i,a)=>a.findIndex(o=>o.propId===c.propId)!==i))throw new Error('同镜头不能由两个角色同时操纵同一物件。');
  return {sceneId:raw.sceneId,framing:raw.framing,cast};
}
