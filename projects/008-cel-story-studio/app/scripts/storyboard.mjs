export const FPS = 24;
export const actions = {
  observe: {label:'发现',icon:'✦',hint:'停下来望向星星，位置保持不变。'},
  walk: {label:'向前走',icon:'⌁',hint:'摆动手脚向前走，在小山前停下。'},
  hesitate: {label:'退缩',icon:'↶',hint:'身体后倾，退后一步；下一镜从退后的位置开始。'},
  jump: {label:'跳跃',icon:'↗',hint:'蓄力、腾空、落地；从当前位置向前跨越。'},
  float: {label:'漂浮',icon:'≈',hint:'沿柔和弧线漂过小山，再慢慢落地。'},
  fail: {label:'尝试失败',icon:'↴',hint:'向前起跳但没有越过山，落回原处附近。'},
  celebrate: {label:'欢呼点亮',icon:'☼',hint:'举起双手，点亮星星；后续镜头保留亮光。'},
};
export const emotions = {
  curious:'好奇',afraid:'害怕',sad:'难过',determined:'坚定',happy:'开心',
};
const clamp = v => Math.max(0,Math.min(1,v));
const smooth = v => {const t=clamp(v);return t*t*(3-2*t);};
export const getDuration = shots => shots.reduce((n,s)=>n+Math.round(s.duration*FPS),0);
// Compile the entire prefix, so reorder/delete also changes subsequent positions.
export function compileTimeline(shots){
  let cursor=0,x=240,lit=false;
  return shots.map(shot=>{
    let endX=x;
    if(shot.action==='walk')endX=x<720?Math.min(x+140,Math.max(x,420)):Math.min(x+80,1080);
    if(shot.action==='hesitate')endX=Math.max(140,x-50);
    if(['jump','float'].includes(shot.action))endX=x<720?Math.min(x+580,970):Math.min(x+70,1080);
    if(shot.action==='fail')endX=Math.max(140,x-25);
    const durationFrames=Math.round(shot.duration*FPS);
    const result={...shot,from:cursor,to:cursor+durationFrames,durationFrames,startX:x,endX,litBefore:lit};
    cursor+=durationFrames;x=endX;lit=lit||shot.action==='celebrate';return result;
  });
}
export function poseAt(shot,localFrame){
  const raw=clamp(localFrame/(shot.durationFrames-1));
  const hold=['jump','fail'].includes(shot.action)&&raw>.2&&raw<.75?1:shot.action==='celebrate'&&raw>.7?3:2;
  const f=raw===1?shot.durationFrames-1:Math.floor(Math.max(0,localFrame)/hold)*hold;
  const t=clamp(f/(shot.durationFrames-1));
  const envelope=Math.sin(Math.PI*t);
  let p=smooth(t),arc=0,sx=1,sy=1,rotation=0,stride=0,arms=0;
  if(['jump','float','fail'].includes(shot.action)){
    const q=clamp((t-.2)/.6);p=smooth(q);
    arc=Math.sin(Math.PI*q)*(shot.action==='fail'?105:shot.action==='float'?210:235);
    if(shot.action==='fail')p=t<.5?smooth((t-.2)/.3):smooth((1-t)/.5);
    const squash=t<.2?Math.sin(t/.2*Math.PI):t>.8?Math.sin((t-.8)/.2*Math.PI):0;
    sx+=squash*.25;sy-=squash*.22;
    if(t>.2&&t<.27&&shot.action==='jump'){sx=.72;sy=1.35;}
    rotation=Math.sin(q*Math.PI)*(shot.action==='fail'?-.4:.16);
    arms=Math.sin(q*Math.PI)*.6;
  }
  if(shot.action==='walk'){stride=Math.sin(t*Math.PI*8)*envelope;arc=Math.abs(stride)*8;}
  if(shot.action==='hesitate'){p=smooth(t/.65);rotation=-.16*envelope;arms=-.35*envelope;}
  if(shot.action==='observe')rotation=.07*envelope;
  if(shot.action==='celebrate'){arms=Math.sin(Math.PI*t)*1.5;arc=Math.pow(Math.sin(t*Math.PI*3),2)*12*envelope;}
  let x=shot.startX+(shot.endX-shot.startX)*p;
  if(shot.action==='fail')x=shot.startX+Math.min(145,1100-shot.startX)*p+(shot.endX-shot.startX)*smooth(t);
  const body={curious:.05,afraid:-.1,sad:.13,determined:-.04,happy:-.03}[shot.emotion];
  rotation+=body*envelope;
  if(shot.emotion==='afraid')x+=Math.sin(f*1.7)*3*envelope;
  if(shot.emotion==='sad'){sy-=.07*envelope;arms-=.3*envelope;}
  return {x,y:500-arc,sx,sy,rotation,stride,arms,hold,frame:f,progress:t};
}
