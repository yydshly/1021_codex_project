// The event vocabulary is executable: every id is implemented by its film engine.
export const filmPrograms={
 synthwave:{name:'午夜频率',subject:'机械磁带与发光音轨',actions:[
  {id:'spool',name:'磁芯苏醒',description:'近距离观察磁芯转动与光线点亮',caption:'让沉睡的声音转起来'},
  {id:'unspool',name:'音轨展开',description:'磁带出舱，延展为立体发光轨道',caption:'把声音，铺成一条路'},
  {id:'ride',name:'穿越光轨',description:'镜头进入音轨，穿过连续光环',caption:'沿着频率，走进夜色'},
  {id:'resolve',name:'装置收束',description:'回到完整磁带装置与双层光环',caption:'这一夜，有自己的频率'},
 ]},
 pixel:{name:'月亮修理铺',subject:'猫机械师、碎月与屋顶城市',actions:[
  {id:'catch',name:'接住碎月',description:'屋顶猫机械师接住坠落的月亮',caption:'今晚的月亮，好像坏了'},
  {id:'repair',name:'敲击补月',description:'猫咪在工具台修补月亮，星火溅出',caption:'叮——再补上一点光'},
  {id:'launch',name:'星光升空',description:'月亮积蓄星光，离开修理台升空',caption:'准备好了，回到天上吧'},
  {id:'illuminate',name:'点亮城市',description:'完整月亮照亮城市，窗灯逐层回应',caption:'把好梦，送回每一扇窗'},
 ]},
 hud:{name:'深蓝回声',subject:'深海探测器与机械蝠鲼',actions:[
  {id:'ping',name:'声呐寻迹',description:'探测器扫描海沟，发现目标轮廓',caption:'静默海沟，收到一段回声'},
  {id:'inspect',name:'翼骨扫描',description:'近距离斜掠机械翼骨，验证结构',caption:'穿过表象，看见结构'},
  {id:'decode',name:'脊线解码',description:'能量沿脊柱分流至双翼',caption:'回声，正在成为回答'},
  {id:'awaken',name:'舒翼苏醒',description:'完整目标舒翼浮升，尾迹扩散',caption:'深蓝之中，生命般的回应'},
 ]},
};
export function defaultShots(style){return filmPrograms[style]?.actions.map((a,i)=>({id:`${style}-${i+1}`,action:a.id,seconds:2.5,caption:a.caption,framing:i===0||i===1?'close':'wide'}));}
export function retimeShots(shots,duration){
 if(!Number.isInteger(duration*2)||duration<4||duration>20||!shots?.length||shots.length>8)throw new Error('总时长需为 4–20 秒，以 0.5 秒为单位。');
 const target=duration*2,source=shots.reduce((n,s)=>n+s.seconds,0);
 const units=shots.map(s=>Math.min(16,Math.max(1,Math.round(s.seconds/source*target))));let diff=target-units.reduce((n,x)=>n+x,0);
 while(diff){const sign=Math.sign(diff),eligible=units.map((n,i)=>({n,i})).filter(x=>sign>0?x.n<16:x.n>1).sort((a,b)=>sign>0?a.n-b.n||a.i-b.i:b.n-a.n||a.i-b.i);if(!eligible.length)throw new Error('镜头数量无法容纳这个时长。');units[eligible[0].i]+=sign;diff-=sign;}
 return shots.map((s,i)=>({...s,seconds:units[i]/2}));
}
export function validateShots(shots,style,duration){
 if(shots===undefined)return undefined;
 const program=filmPrograms[style];
 if(!program)throw new Error('这个模板尚未开放镜头编排。');
 if(!Array.isArray(shots)||shots.length<2||shots.length>8)throw new Error('请保留 2–8 个镜头。');
 const ids=new Set();
 const safe=shots.map(s=>{
  if(!s||typeof s.id!=='string'||! /^[\w-]{1,64}$/.test(s.id)||ids.has(s.id))throw new Error('镜头编号无效或重复。');ids.add(s.id);
  if(!program.actions.some(a=>a.id===s.action))throw new Error('镜头动作不属于当前风格。');
  if(typeof s.seconds!=='number'||!Number.isFinite(s.seconds)||s.seconds<.5||s.seconds>8||!Number.isInteger(s.seconds*2))throw new Error('每镜需为 0.5–8 秒，以 0.5 秒为单位。');
  if(typeof s.caption!=='string'||Array.from(s.caption).length>40||/[\x00-\x1f]/.test(s.caption))throw new Error('镜头字幕最多 40 字，可留空。');
  if(!['wide','close'].includes(s.framing))throw new Error('请选择全景或近景。');
  return {id:s.id,action:s.action,seconds:s.seconds,caption:s.caption.trim(),framing:s.framing};
 });
 if(Math.abs(safe.reduce((n,s)=>n+s.seconds,0)-duration)>.001)throw new Error('镜头时长之和必须与影片时长一致。');
 return safe;
}
export function programCue(config,seconds){
 const shots=config.shots||defaultShots(config.style);
 if(!shots?.length)return {action:'',progress:0,index:0,framing:'wide',caption:'',localSeconds:0};
 const total=shots.reduce((n,s)=>n+s.seconds,0),time=Math.min(total-.000001,Math.max(0,seconds/config.duration*total));
 let start=0;
 for(let i=0;i<shots.length;i++){const shot=shots[i];if(time<start+shot.seconds||i===shots.length-1){let first=i,last=i,eventStart=start;while(first>0&&shots[first-1].action===shot.action){first--;eventStart-=shots[first].seconds;}while(last+1<shots.length&&shots[last+1].action===shot.action)last++;const span=shots.slice(first,last+1).reduce((n,s)=>n+s.seconds,0);return {...shot,progress:Math.min(1,Math.max(0,(time-eventStart)/span)),index:i,localSeconds:Math.max(0,time-eventStart)};}start+=shot.seconds;}
}
export function programSegments(config){const shots=config.shots||defaultShots(config.style)||[],segments=[];for(const shot of shots){const last=segments[segments.length-1];if(last?.action===shot.action)last.seconds+=shot.seconds;else segments.push({id:shot.id,action:shot.action,seconds:shot.seconds});}return segments;}
