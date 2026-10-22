import {useEffect,useRef,useState} from 'react';
import type {ActorCue,Shot,World,WorldCharacter,WorldObject,WorldScene} from './model';
import {emotions} from './model';
import {worldActions,type WorldAction} from '../scripts/world-schema.mjs';
import {drawWorldShape} from './world-paint';

function AssetPreview({asset,kind}:{asset:WorldCharacter|WorldObject|WorldScene;kind:'character'|'scene'|'object'}){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const c=ref.current?.getContext('2d');if(!c)return;c.clearRect(0,0,240,160);c.fillStyle='#f7f2e7';c.fillRect(0,0,240,160);c.save();
    if(kind==='scene'){
      const s=asset as WorldScene;c.scale(240/1280,160/720);c.fillStyle=s.sky;c.fillRect(0,0,1280,720);c.fillStyle=s.ground;c.fillRect(0,s.groundY,1280,720-s.groundY);s.shapes.forEach((shape,i)=>drawWorldShape(c,shape,'flat-vector',0,0,i));
    }else{
      c.translate(120,145);c.scale(kind==='object'?.85:.65,kind==='object'?.85:.65);asset.shapes.forEach((s,i)=>drawWorldShape(c,s,'flat-vector',0,0,i));
      if(kind==='character'){
        const f=(asset as WorldCharacter).face;c.fillStyle='#303336';for(const x of [-.25,.25]){c.beginPath();c.arc(f.x+f.size*x,f.y-f.size*.1,2.7,0,Math.PI*2);c.fill();}c.fillRect(f.x-4,f.y+f.size*.2,8,2);
      }
    }
    c.restore();
  },[asset,kind]);
  return <canvas ref={ref} width="240" height="160" role="img" aria-label={`${asset.name}的${kind==='scene'?'场景':'形象'}预览`}/>;
}
export function WorldAssets({world,onChange}:{world:World;onChange:(world:World)=>void}){
  return <>
    <section><div className="section-title"><b>01</b><h2>这个故事的角色</h2></div><div className="world-assets">{world.characters.map((c,i)=><div className="world-asset" key={c.id}>
      <AssetPreview asset={c} kind="character"/><label><span>角色名字</span><input aria-label={`角色 ${i+1} 名字`} maxLength={16} value={c.name} onChange={e=>onChange({...world,characters:world.characters.map((a,j)=>j===i?{...a,name:e.target.value}:a)})}/></label><p>{c.description}</p>
    </div>)}</div></section>
    <section><div className="section-title"><b>02</b><h2>故事发生的地方</h2></div><div className="world-assets world-scene-assets">{world.scenes.map((s,i)=><div className="world-asset" key={s.id}>
      <AssetPreview asset={s} kind="scene"/><strong>{s.name}</strong><p>{s.description}</p><label className="scene-color">天空／墙面<input aria-label={`场景 ${i+1} 背景色`} type="color" value={s.sky} onChange={e=>onChange({...world,scenes:world.scenes.map((a,j)=>j===i?{...a,sky:e.target.value,shapes:a.shapes.map(shape=>shape.fill===a.sky?{...shape,fill:e.target.value}:shape)}:a)})}/></label>
    </div>)}</div></section>
    {world.objects.length>0&&<section><div className="section-title"><b>03</b><h2>参与故事的物件</h2></div><div className="world-assets">{world.objects.map(o=><div className="world-asset" key={o.id}><AssetPreview asset={o} kind="object"/><strong>{o.name}</strong><p>{o.description}</p></div>)}</div></section>}
  </>;
}
export function WorldShotEditor({shot,world,onChange,resolvedCast}:{shot:Shot;world:World;onChange:(patch:Partial<Shot>)=>void;resolvedCast?:(ActorCue&{inherited:boolean})[]}){
  const [index,setIndex]=useState(0);const cast=shot.cast||[];const selectedIndex=Math.min(index,cast.length-1);const cue=cast[selectedIndex];if(!cue)return null;
  const update=(patch:Partial<ActorCue>)=>onChange({cast:cast.map((c,i)=>i===selectedIndex?{...c,...patch}:c)});
  const scene=world.scenes.find(s=>s.id===shot.sceneId)||world.scenes[0];
  const resolved=resolvedCast?.find(c=>c.characterId===cue.characterId)||{...cue,inherited:false};
  const moving=['walk','run','jump','float','push'].includes(cue.action);
  const remaining=world.characters.filter(c=>!cast.some(a=>a.characterId===c.id));
  return <div className="world-shot-editor">
    <div className="shot-options"><label className="field"><span>发生在哪里</span><select aria-label="镜头场景" value={shot.sceneId} onChange={e=>{const s=world.scenes.find(a=>a.id===e.target.value)!;onChange({sceneId:s.id,cast:cast.map(c=>({...c,from:{...c.from,y:s.groundY},to:{...c.to,y:s.groundY}}))});}}>{world.scenes.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
      <label className="field"><span>景别</span><select aria-label="镜头景别" value={shot.framing} onChange={e=>onChange({framing:e.target.value as Shot['framing']})}><option value="wide">全景 · 看环境</option><option value="medium">中景 · 看行动</option><option value="close">近景 · 看表情</option></select></label></div>
    <div className="cast-tabs">{cast.map((a,i)=><button key={a.characterId} aria-pressed={i===selectedIndex} onClick={()=>setIndex(i)}>{world.characters.find(c=>c.id===a.characterId)?.name}</button>)}{remaining.length>0&&<button aria-label="添加出镜角色" onClick={()=>{const a=remaining[0];onChange({cast:[...cast,{characterId:a.id,action:'observe',emotion:'curious',from:{x:850,y:scene.groundY},to:{x:850,y:scene.groundY},propId:'',recipientId:''}]});setIndex(cast.length);}}>＋ 出镜</button>}</div>
    <div className="shot-options"><label className="field"><span>做什么</span><select aria-label="角色具体动作" value={cue.action} onChange={e=>{const action=e.target.value as WorldAction,interaction=['pickup','place','give','push'].includes(action);update({action,propId:interaction?(cue.propId||world.objects[0]?.id||''):'',recipientId:action==='give'?(cast.find(c=>c.characterId!==cue.characterId)?.characterId||''):''});}}>{Object.entries(worldActions).map(([id,name])=><option key={id} value={id} disabled={(['pickup','place','give','push'].includes(id)&&!world.objects.length)||(id==='perform'&&!cue.motion?.length)}>{name}</option>)}</select></label>
      <label className="field"><span>此刻的情绪</span><select aria-label="角色具体情绪" value={cue.emotion} onChange={e=>update({emotion:e.target.value as ActorCue['emotion']})}>{Object.entries(emotions).map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label></div>
    {['pickup','place','give','push','perform'].includes(cue.action)&&<label className="field"><span>{cue.action==='perform'?'手中物件（可留空）':'操作哪个物件'}</span><select aria-label="动作道具" value={cue.propId} onChange={e=>update({propId:e.target.value})}><option value="">选择物件</option>{world.objects.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></label>}
    {cue.action==='give'&&<label className="field"><span>交给谁</span><select aria-label="接收角色" value={cue.recipientId} onChange={e=>update({recipientId:e.target.value})}><option value="">选择同镜头角色</option>{cast.filter(a=>a.characterId!==cue.characterId).map(a=><option key={a.characterId} value={a.characterId}>{world.characters.find(c=>c.id===a.characterId)?.name}</option>)}</select></label>}
    {cue.action==='perform'&&<><label className="field"><span>表演动作</span><input aria-label="自定义动作名称" value={cue.gesture||''} maxLength={16} onChange={e=>update({gesture:e.target.value})}/><em>AI 为此动作编排了 {cue.motion?.length||0} 个关节关键帧；可通过改写重新设计动作。</em></label><p className="continuity-note">{cue.effect&&cue.effect.kind!=='none'?`包含 ${{water:'水流',grow:'生长',sparkle:'闪光',steam:'蒸汽'}[cue.effect.kind]} 效果，作用于 ${world.objects.find(o=>o.id===cue.effect?.targetId)?.name||'指定物件'}。`:'关节与手中道具会按本次生成的关键帧运动。'}</p></>}
    <div className="shot-options"><label className="field"><span>{resolved.inherited?'承接上镜 X':'初次登场 X'}</span><input aria-label="角色起点 X" disabled={resolved.inherited} type="number" min="100" max="1180" step="10" value={resolved.inherited?resolved.from.x:cue.from.x} onChange={e=>update({from:{...cue.from,x:Number(e.target.value)}})}/></label><label className="field"><span>{moving?'行动目标 X':'本镜落点 X'}</span><input aria-label="角色终点 X" disabled={!moving} type="number" min="100" max="1180" step="10" value={moving?cue.to.x:resolved.to.x} onChange={e=>update({to:{...cue.to,x:Number(e.target.value)}})}/></label></div>
    <p className="continuity-note">同场景会继承上镜落点，起点用于首次登场或换场。拿起、递交、放下会改变物件持有状态；交互前请先走近。</p>
    {cast.length>1&&<button className="quiet remove-cast" onClick={()=>{onChange({cast:cast.filter((_,i)=>i!==selectedIndex)});setIndex(0);}}>移除此镜中的角色</button>}
  </div>;
}
