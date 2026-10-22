export const FLAGSHIP_ASSET_PACK='ink-whale-018';
export const FLAGSHIP_EVENTS=['notice','draw','unfold','leap','farewell'];
export const FLAGSHIP_FRAMINGS=['wide','medium','close'];
export const FLAGSHIP_EMOTIONS=['hesitant','focused','joyful','gentle'];

const record=(v,label)=>{if(!v||typeof v!=='object'||Array.isArray(v))throw new Error(`${label}格式无效。`);return v;};
const text=(v,max,label,empty=false)=>{
 if(typeof v!=='string'||/[\x00-\x1f\x7f]/.test(v)||Array.from(v.trim()).length>max||(!empty&&!v.trim()))throw new Error(`${label}须为${empty?'0':'1'}–${max}字的单行文字。`);
 return v.trim();
};
const option=(v,options,label)=>{if(!options.includes(v))throw new Error(`${label}不受支持。`);return v;};

export function defaultFlagship(){return {
 kind:'story-director',version:1,assetPack:FLAGSHIP_ASSET_PACK,
 title:'给你一片海',logline:'小狐狸发现困在墨碟里的小鲸，便画出波浪，展开纸页，让它跃入属于自己的远方。',
 heroName:'阿橙',companionName:'阿蓝',ending:'ocean',accent:'#dc7852',sound:true,
 shots:[
  {id:'film-notice',event:'notice',seconds:3,framing:'medium',emotion:'hesitant',caption:'小小的墨碟，装不下远方。'},
  {id:'film-draw',event:'draw',seconds:4,framing:'close',emotion:'focused',caption:'那就，先画一朵浪。'},
  {id:'film-unfold',event:'unfold',seconds:4,framing:'close',emotion:'focused',caption:'再把远方，慢慢展开。'},
  {id:'film-leap',event:'leap',seconds:5,framing:'wide',emotion:'joyful',caption:'这一次，可以游向大海。'},
  {id:'film-farewell',event:'farewell',seconds:4,framing:'wide',emotion:'gentle',caption:'愿你的世界，总有辽阔。'},
 ]
};}

export function validateFlagship(input){
 const x=record(input,'故事项目');
 if(x.kind!=='story-director'||x.version!==1||x.assetPack!==FLAGSHIP_ASSET_PACK)throw new Error('旗舰故事格式或美术资产包无效。');
 if(typeof x.accent!=='string'||!/^#[0-9a-f]{6}$/i.test(x.accent))throw new Error('强调色须为六位十六进制颜色。');
 if(typeof x.sound!=='boolean')throw new Error('声音开关须为布尔值。');
 if(!Array.isArray(x.shots)||x.shots.length!==FLAGSHIP_EVENTS.length)throw new Error('故事需要发现、绘画、展开、跃起、告别五个镜头。');
 const ids=new Set();
 const shots=x.shots.map((raw,i)=>{
  const s=record(raw,`镜头${i+1}`);
  if(typeof s.id!=='string'||!/^[a-zA-Z][\w-]{0,63}$/.test(s.id)||ids.has(s.id))throw new Error('镜头编号无效或重复。');
  ids.add(s.id);
  if(s.event!==FLAGSHIP_EVENTS[i])throw new Error('镜头事件与顺序须为发现、绘画、展开、跃起、告别。');
  if(typeof s.seconds!=='number'||!Number.isFinite(s.seconds)||s.seconds<1.5||s.seconds>8||!Number.isInteger(s.seconds*2))throw new Error('每镜须为1.5–8秒，以0.5秒调整。');
  return {id:s.id,event:s.event,seconds:s.seconds,framing:option(s.framing,FLAGSHIP_FRAMINGS,'取景'),emotion:option(s.emotion,FLAGSHIP_EMOTIONS,'情绪'),caption:text(s.caption,36,'镜头字幕',true)};
 });
 const total=shots.reduce((n,s)=>n+s.seconds,0);
 if(total<12||total>30)throw new Error('全片时长须为12–30秒。');
 return {kind:'story-director',version:1,assetPack:FLAGSHIP_ASSET_PACK,title:text(x.title,18,'片名'),logline:text(x.logline,180,'故事概述'),heroName:text(x.heroName,12,'狐狸名字'),companionName:text(x.companionName,12,'小鲸名字'),ending:option(x.ending,['ocean','starlight'],'结尾'),accent:x.accent,sound:x.sound,shots};
}

export function durationFlagship(config){return validateFlagship(config).shots.reduce((sum,s)=>sum+s.seconds,0);}
