const clamp=v=>Math.max(0,Math.min(1,v));
const ease=v=>{const t=clamp(v);return t*t*(3-2*t);};
const mix=(a,b,t)=>a+(b-a)*t;
const movers=['walk','run','jump','float','push'];
export function compileWorld(shots,world,strict=false){
  let cursor=0,previousScene='';
  const positions=new Map(),objects={};
  return shots.map(shot=>{
    const scene=world.scenes.find(s=>s.id===shot.sceneId)||world.scenes[0];
    for(const item of scene.items)if(!objects[item.objectId])objects[item.objectId]={x:item.x,y:item.y,holder:'',sceneId:scene.id};
    if(previousScene!==scene.id)positions.clear();
    const cast=(shot.cast||[]).map(c=>{
      const inherited=positions.has(c.characterId),from=positions.get(c.characterId)||c.from;
      const to=movers.includes(c.action)?c.to:from;
      const result={...c,from:{...from},to:{...to},inherited};positions.set(c.characterId,{...to});return result;
    });
    const before=structuredClone(objects),warnings=[];
    for(const cue of cast){
      const prop=objects[cue.propId];
      if(cue.action==='perform'){
        if(cue.propId&&prop?.holder!==cue.characterId)warnings.push(`${shot.caption}：自由表演前需要先拿起操作物件`);
        const effect=cue.effect,target=effect&&objects[effect.targetId];
        if(effect&&effect.kind!=='none'){
          if(!target||target.sceneId!==scene.id)warnings.push(`${shot.caption}：效果目标尚未在此场景出现`);
          else if(['water','grow'].includes(effect.kind))target.growth=(target.growth||1)+.18;
        }
      }
      if(!['pickup','place','give','push'].includes(cue.action))continue;
      const warn=message=>warnings.push(`${shot.caption}：${message}`);
      if(!prop){warn('道具尚未在此场景出现');continue;}
      if(cue.action==='pickup'||cue.action==='push'){
        if(prop.holder||prop.sceneId!==scene.id){warn('操作的物件不在地面或当前场景');continue;}
        if(Math.abs(prop.x-cue.from.x)>190){warn('角色离道具太远，请先走近');continue;}
        if(cue.action==='pickup')prop.holder=cue.characterId;
        else{prop.x=Math.max(40,Math.min(1240,prop.x+cue.to.x-cue.from.x));prop.y=scene.groundY;}
      }else{
        if(prop.holder!==cue.characterId){warn('需要先拿起道具再放下或递交');continue;}
        if(cue.action==='place'){prop.holder='';prop.sceneId=scene.id;prop.x=Math.min(1200,cue.to.x+72);prop.y=scene.groundY;}
        else{
          const recipient=cast.find(c=>c.characterId===cue.recipientId);
          if(!recipient){warn('接收角色没有出镜');continue;}
          if(Math.abs(recipient.to.x-cue.to.x)>260){warn('接收者太远，请先走近再递交');continue;}
          prop.holder=recipient.characterId;
        }
      }
    }
    if(strict&&warnings.length)throw new Error(warnings[0]);
    const durationFrames=Math.round(shot.duration*24);
    const result={...shot,scene,cast,from:cursor,to:cursor+durationFrames,durationFrames,objectsBefore:before,objectsAfter:structuredClone(objects),warnings};
    cursor+=durationFrames;previousScene=scene.id;return result;
  });
}
export function worldPose(cue,t,frame){
  const envelope=Math.sin(Math.PI*t),moving=movers.includes(cue.action),q=ease(t);
  let x=mix(cue.from.x,cue.to.x,moving?q:0),y=mix(cue.from.y,cue.to.y,moving?q:0),rotation=0,arms=0,stride=0,sx=1,sy=1;
  if(cue.action==='walk'||cue.action==='run'||cue.action==='push'){
    stride=Math.sin(t*Math.PI*(cue.action==='run'?14:8));y-=Math.abs(stride)*(cue.action==='run'?12:5)*envelope;arms=cue.action==='push'?-.5:.1;
  }
  if(['jump','float','fail'].includes(cue.action)){
    const a=clamp((t-.12)/.76);y-=Math.sin(Math.PI*a)*(cue.action==='float'?125:cue.action==='fail'?70:145);arms=envelope*.8;
    if(cue.action==='fail'){x=cue.from.x+Math.sin(Math.PI*t)*70;rotation=-envelope*.3;}
    sx=1+Math.sin(t*Math.PI*4)*.08*envelope;sy=2-sx;
  }
  if(cue.action==='wave')arms=.9+Math.sin(t*10*Math.PI)*.3;
  if(cue.action==='celebrate'){arms=1.5*envelope;y-=Math.abs(Math.sin(t*Math.PI*4))*12*envelope;}
  if(['pickup','place','give'].includes(cue.action)){arms=-.6*Math.sin(Math.PI*t);rotation=cue.action==='give'?0:envelope*.17;}
  if(cue.action==='sit'||cue.action==='sleep'){y+=ease(t/.4)*15;sy=1-ease(t/.4)*.13;rotation=cue.action==='sleep'?ease(t/.4)*.12:0;}
  if(cue.action==='dance'){rotation=Math.sin(t*8*Math.PI)*.15;stride=Math.sin(t*8*Math.PI);arms=.7+stride*.3;y-=Math.abs(stride)*9;}
  if(cue.emotion==='afraid')x+=Math.sin(frame*1.5)*2*envelope;
  if(cue.emotion==='sad')sy-=.06;
  const direction=cue.to.x<cue.from.x?-1:1;
  let armL=0,armR=0,head=0,propRotation=0;
  if(cue.action==='perform'&&cue.motion?.length){
    const b=cue.motion.find(k=>k.t>=t)||cue.motion.at(-1),a=cue.motion[Math.max(0,cue.motion.indexOf(b)-1)],u=a===b?0:ease((t-a.t)/(b.t-a.t));
    x+=mix(a.x,b.x,u);y+=mix(a.y,b.y,u);rotation+=mix(a.rotation,b.rotation,u);armL=mix(a.armL,b.armL,u);armR=mix(a.armR,b.armR,u);head=mix(a.head,b.head,u);propRotation=mix(a.propRotation,b.propRotation,u);
  }
  return {x,y,rotation,arms,stride,sx,sy,direction,t,armL,armR,head,propRotation};
}
export function objectsAt(shot,t,frame){
  const poses=Object.fromEntries(shot.cast.map(c=>[c.characterId,worldPose(c,t,frame)]));
  const hand=(state)=>{
    const p=poses[state.holder],lift=p?Math.max(0,Math.sin(-p.armR))*60:0;return p?{...state,x:p.x+p.direction*(70+lift*.15),y:p.y-40-lift}:state;
  };
  const result={};
  for(const [id,state] of Object.entries(shot.objectsBefore)){
    const next=shot.objectsAfter[id]||state;
    const action=shot.cast.find(c=>c.propId===id&&['pickup','place','give','push'].includes(c.action));
    const a=hand(state),b=hand(next),u=action?ease((t-.25)/.5):0;
    result[id]={...state,x:mix(a.x,b.x,u),y:mix(a.y,b.y,u),holder:t>=.5?next.holder:state.holder,growth:mix(state.growth||1,next.growth||1,ease(t))};
  }
  return result;
}
