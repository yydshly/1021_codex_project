import {lazy,Suspense,useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Player, type PlayerRef} from '@remotion/player';
import {CelStory} from './Story';
import {actions, emotions, compileTimeline, getDuration, defaults, FPS, palettes, presets, type StoryProps, type Shot} from './model';
import {validateStory} from '../scripts/input-schema.mjs';
import {AiDirector,readCreative,type AiDraft} from './AiDirector';
import type {Creative} from '../scripts/ai-schema.mjs';
import {getStyle,styles,type StyleId} from '../scripts/styles.mjs';
import {StyleLibrary} from './StyleLibrary';
import {WorldAssets,WorldShotEditor} from './WorldEditor';
import {worldActions,MAX_BYTES} from '../scripts/world-schema.mjs';
import welcomeWorld from '../../web/world-examples/rabbit.json';
import {compileWorld} from '../scripts/world-runtime.mjs';
import {getComponent,type StyleRecipe} from '../scripts/capabilities.mjs';
import {isStaticPages} from './browser-runtime';
import './ui.css';
const EffectWorkbench=lazy(()=>import('./EffectWorkbench').then(m=>({default:m.EffectWorkbench})));
const FlagshipWorkbench=lazy(()=>import('./FlagshipWorkbench').then(m=>({default:m.FlagshipWorkbench})));
const ResearchOverview=lazy(()=>import('./ResearchOverview').then(m=>({default:m.ResearchOverview})));

type Job={id:string;state:'queued'|'rendering'|'done'|'error';progress:number;error?:string;url?:string};
const characters=[{value:'flame',icon:'♨',name:'小火苗',hint:'热烈，带一点莽撞'},{value:'drop',icon:'◒',name:'小水滴',hint:'柔软，也能很勇敢'},{value:'star',icon:'✶',name:'小星星',hint:'好奇，自带一点光'}] as const;
function readDraft(){
  try{const saved=localStorage.getItem('cel-story-draft-v1');if(saved&&saved.length<MAX_BYTES){const draft=JSON.parse(saved);return {story:validateStory(draft.story),creative:readCreative(draft.creative)};}}catch{/* Invalid drafts fall back to the built-in story. */}
  return {story:validateStory(welcomeWorld),creative:readCreative(welcomeWorld.creative)};
}

function App(){
  const [initial]=useState(readDraft);
  const [props,setProps]=useState<StoryProps>(initial.story);
  const [frame,setFrame]=useState(Math.min(24,getDuration(initial.story.shots)-1));
  const [creative,setCreative]=useState<Creative|null>(initial.creative);
  const [aiBusy,setAiBusy]=useState(false);
  const [canRevert,setCanRevert]=useState(false);
  const beforeAI=useRef<{story:StoryProps;creative:Creative|null}|null>(null);
  const [selectedId,setSelectedId]=useState(initial.story.shots[0].id);
  const pendingSeek=useRef<number|null>(null);
  const timeline=compileTimeline(props.shots);
  const visualStyle=getStyle(props.style);
  const frames=getDuration(props.shots);
  const selectedIndex=Math.max(0,props.shots.findIndex(s=>s.id===selectedId));
  const selected=props.shots[selectedIndex];
  const worldTimeline=useMemo(()=>props.world?compileWorld(props.shots,props.world):null,[props.shots,props.world]);
  let validationError='';
  try{validateStory(props);}catch(e){validationError=e instanceof Error?e.message:String(e);}
  const [playing,setPlaying]=useState(false);
  const [job,setJob]=useState<Job|null>(null);
  const [status,setStatus]=useState('');
  const [online,setOnline]=useState(false);
  const [menu,setMenu]=useState(false);
  const [showStyles,setShowStyles]=useState(location.hash==='#story-styles');
  const [showEffects,setShowEffects]=useState(location.hash.startsWith('#effects')||location.hash==='#styles');
  const [showFlagship,setShowFlagship]=useState(location.hash.startsWith('#flagship'));
  const [showOverview,setShowOverview]=useState(!location.hash||location.hash==='#top'||location.hash.startsWith('#overview'));
  const [showAi,setShowAi]=useState(!initial.story.world);
  const player=useRef<PlayerRef>(null);
  const importFile=useRef<HTMLInputElement>(null);
  const jobProps=useRef<StoryProps|null>(null);
  const act=Math.max(0,timeline.findIndex(s=>frame<s.to));
  useEffect(()=>{if(['','#top','#overview','#styles','#flagship','#main'].includes(location.hash))window.scrollTo(0,0);},[showOverview,showFlagship,showEffects]);
  useEffect(()=>{
    if(showOverview||showFlagship||showEffects)return;
    const timer=window.setTimeout(()=>{try{validateStory(props);localStorage.setItem('cel-story-draft-v1',JSON.stringify({story:props,creative}));}catch{/* Keep the last valid draft if an edit is incomplete. */}},400);
    return()=>clearTimeout(timer);
  },[props,creative,showOverview,showFlagship,showEffects]);
  useLayoutEffect(()=>{
    if(pendingSeek.current!==null){
      const next=Math.max(0,Math.min(frames-1,pendingSeek.current));
      player.current?.pause();player.current?.seekTo(next);setFrame(next);pendingSeek.current=null;
    }else if(frame>=frames){player.current?.pause();player.current?.seekTo(frames-1);setFrame(frames-1);}
  },[props,frames,frame]);
  const busy=job?.state==='queued'||job?.state==='rendering';
  const dirty=job?.state==='done'&&JSON.stringify(props)!==JSON.stringify(jobProps.current);
  useEffect(()=>{
    if(isStaticPages)return;
    fetch('/api/health').then(r=>r.ok?r.json():null).then(x=>setOnline(x?.app==='cel-story')).catch(()=>setOnline(false));
  },[]);
  useEffect(()=>{
    const openStyles=()=>{setShowEffects(location.hash.startsWith('#effects')||location.hash==='#styles');setShowFlagship(location.hash.startsWith('#flagship'));const overview=!location.hash||location.hash==='#top'||location.hash.startsWith('#overview');setShowOverview(overview);if(location.hash==='#story-styles')setShowStyles(true);if(location.hash.startsWith('#effects')||location.hash==='#styles'||location.hash.startsWith('#flagship')||overview)player.current?.pause();};
    window.addEventListener('hashchange',openStyles);
    return()=>window.removeEventListener('hashchange',openStyles);
  },[]);
  useEffect(()=>{
    const p=player.current;if(!p)return;
    const update=(e:{detail:{frame:number}})=>setFrame(e.detail.frame);
    const play=()=>setPlaying(true);const pause=()=>setPlaying(false);
    p.addEventListener('frameupdate',update);p.addEventListener('play',play);p.addEventListener('pause',pause);p.addEventListener('ended',pause);
    return()=>{p.removeEventListener('frameupdate',update);p.removeEventListener('play',play);p.removeEventListener('pause',pause);p.removeEventListener('ended',pause);};
  },[]);
  useEffect(()=>{
    if(!job?.id||job.state==='done'||job.state==='error')return;
    let cancelled=false;
    const timer=window.setInterval(async()=>{
      try{
        const r=await fetch(`/api/jobs/${job.id}`);
        if(!r.ok)throw new Error('导出状态读取失败，请确认本地服务仍在运行。');
        const next=await r.json();if(!cancelled)setJob(next);
      }catch(e){if(!cancelled){setJob({...job,state:'error',error:String(e)});}}
    },1000);
    return()=>{cancelled=true;clearInterval(timer);};
  },[job?.id,job?.state]);
  const edit=<K extends keyof StoryProps>(key:K,value:StoryProps[K])=>{setProps(p=>({...p,[key]:value}));setStatus('');};
  const seek=(f:number)=>{player.current?.pause();player.current?.seekTo(f);setFrame(f);};
  const load=(next:StoryProps)=>{pendingSeek.current=0;setProps(next);setSelectedId(next.shots[0].id);setMenu(false);};
  const choose=(i:number)=>{load({...structuredClone(presets[i]),style:props.style,...(props.recipe?{recipe:structuredClone(props.recipe)}:{})});setCreative(null);setCanRevert(false);setStatus('已载入示例，保留当前风格与组件组合。');};
  const chooseStyle=(style:StyleId)=>{player.current?.pause();edit('style',style);};
  const applyRecipe=(style:StyleId,recipe:StyleRecipe)=>{
    player.current?.pause();setProps(p=>({...p,style,recipe}));setStatus(`已应用「${getStyle(style).name}」与 ${recipe.components.length} 个组件，故事内容和时长保持不变。`);
  };
  const changeRecipe=(recipe:StyleRecipe)=>{player.current?.pause();edit('recipe',recipe);};
  const loadWorldExample=async(name:string)=>{
    try{const r=await fetch(`world-examples/${name}.json`);if(!r.ok)throw new Error('示例读取失败');const config=await r.json();beforeAI.current={story:structuredClone(props),creative};load({...validateStory(config),style:props.style,...(props.recipe?{recipe:structuredClone(props.recipe)}:{})});setCreative(readCreative(config.creative));setCanRevert(true);setShowStyles(false);setShowAi(false);setStatus('已载入真实 AI 世界示例，保留当前风格与组件组合。');}
    catch(e){setStatus(String(e));}
  };
  const shotName=(s:Shot)=>props.world?s.cast?.map(c=>`${props.world!.characters.find(a=>a.id===c.characterId)?.name||'角色'}·${c.action==='perform'&&c.gesture?c.gesture:worldActions[c.action]}`).join(' / ')||'出镜行动':actions[s.action].label;
  const changeShots=(shots:Shot[],focusId=selected.id)=>{
    const nextTimeline=compileTimeline(shots);
    const focus=nextTimeline.find(s=>s.id===focusId)||nextTimeline[0];
    pendingSeek.current=focus.from+Math.floor(focus.durationFrames*.45);
    setProps(p=>({...p,shots}));setSelectedId(focus.id);setStatus('');
  };
  const editShot=(patch:Partial<Shot>)=>changeShots(props.shots.map(s=>s.id===selected.id?{...s,...patch}:s));
  const addShot=()=>{
    const shot:Shot={id:crypto.randomUUID(),caption:'接下来，会发生什么？',action:'observe',emotion:'curious',duration:2};
    if(props.world){shot.sceneId=selected.sceneId;shot.framing=selected.framing;shot.cast=selected.cast?.map(c=>({...c,action:'observe',from:{...c.to},to:{...c.to},propId:'',recipientId:'',motion:[],gesture:'',effect:{kind:'none',targetId:''}}));}
    const shots=[...props.shots];shots.splice(selectedIndex+1,0,shot);changeShots(shots,shot.id);
  };
  const removeShot=(index:number)=>{
    const shots=props.shots.filter((_,i)=>i!==index);
    changeShots(shots,props.shots[index].id===selected.id?shots[Math.min(index,shots.length-1)].id:selected.id);
  };
  const moveShot=(index:number,direction:number)=>{
    const shots=[...props.shots];[shots[index],shots[index+direction]]=[shots[index+direction],shots[index]];
    changeShots(shots,props.shots[index].id);
  };
  const save=()=>{
    if(validationError){setStatus(validationError);return;}
    const url=URL.createObjectURL(new Blob([JSON.stringify({...props,...(creative?{creative}:{})},null,2)],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download='cel-story.json';a.click();URL.revokeObjectURL(url);setStatus('故事配置已保存。');
  };
  const restore=async(file:File|undefined)=>{
    if(!file)return;
    try{
      if(file.size>MAX_BYTES)throw new Error('配置文件过大。');
      const config=JSON.parse(await file.text());
      const restored=validateStory(config);
      setCreative(readCreative(config.creative));setCanRevert(false);
      load(restored);setStatus('故事配置已载入；旧版三幕会转换为可编辑镜头。');
    }catch(e){setStatus(`无法载入配置：${String(e)}`);}
    if(importFile.current)importFile.current.value='';
  };
  const renderStory=async(nextStory:StoryProps)=>{
    try{validateStory(nextStory);}catch(e){setStatus(String(e));return;}
    setStatus('');jobProps.current=structuredClone(nextStory);setJob({id:'',state:'queued',progress:0});
    try{
      const r=await fetch('/api/render',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(nextStory)});
      const result=await r.json();if(!r.ok)throw new Error(result.error||'导出失败');
      setJob(result);
    }catch(e){setJob({id:'',state:'error',progress:0,error:String(e)});}
  };
  const render=()=>renderStory(props);
  const applyAI=(draft:AiDraft,exportVideo:boolean)=>{
    beforeAI.current={story:structuredClone(props),creative:creative?structuredClone(creative):null};
    load(validateStory(draft.story));setCreative(draft.creative);setCanRevert(true);
    if(draft.story.world){setShowAi(false);setShowStyles(false);}
    setStatus(`AI 已创作《${draft.story.title}》，${draft.story.shots.length} 个镜头已进入预览，可继续逐镜修改。`);
    if(exportVideo)void renderStory(draft.story);
  };
  const revertAI=()=>{
    if(!beforeAI.current)return;
    load(beforeAI.current.story);setCreative(beforeAI.current.creative);setCanRevert(false);setStatus('已恢复到上次生成之前的故事。');
  };
  const field=(key:'title'|'signature',label:string,max:number,hint?:string)=>
    <label className="field"><span>{label}<small>{Array.from(props[key]).length}/{max}</small></span>
      <input value={props[key]} maxLength={max} onChange={e=>edit(key,e.target.value)} aria-label={label}/>
      {hint&&<em>{hint}</em>}</label>;
  if(showOverview)return <Suspense fallback={<p style={{padding:40}}>正在打开研究总结…</p>}><ResearchOverview/></Suspense>;
  if(showFlagship)return <Suspense fallback={<p style={{padding:40}}>正在打开故事演示…</p>}><FlagshipWorkbench onBack={()=>{setShowFlagship(false);location.hash='styles';}}/></Suspense>;
  return <div className="studio">
    <header className="topbar">
      <a className="logo" href="#overview"><span>✳</span><div>纸间故事<small>研究总结与创作实践</small></div></a>
      <div className="top-note"><i/>研究已归档 · 现有演示可继续使用</div>
      <div className="top-actions" style={showEffects?{display:'none'}:undefined}>
        <button className="quiet" onClick={save}>保存配置 ↓</button>
        <div className="preset-wrap"><button className="outline" aria-expanded={menu} onClick={()=>setMenu(!menu)}>载入故事 ▾</button>{menu&&<div className="preset-menu"><span className="preset-label">真实 AI 世界示例</span><button onClick={()=>void loadWorldExample('rabbit')}>白兔与小熊 · 胡萝卜</button><button onClick={()=>void loadWorldExample('robot')}>机器人与小猫 · 杯子</button><button onClick={()=>void loadWorldExample('fox')}>小狐狸 · 图书馆搬书</button><button onClick={()=>void loadWorldExample('water')}>小女孩 · 阳台浇花</button><hr/><span className="preset-label">经典固定舞台</span>{presets.map((p,i)=><button key={p.title} onClick={()=>choose(i)}>{i+1}. {p.title}</button>)}<hr/><button onClick={()=>importFile.current?.click()}>导入已保存的配置…</button></div>}<input ref={importFile} hidden type="file" accept=".json,application/json" onChange={e=>void restore(e.target.files?.[0])} aria-label="导入故事配置"/></div>
      </div>
    </header>
    <nav className="studio-nav" aria-label="创作与效果导航">
      <a href="#overview">研究总结</a>
      <a href="#flagship">完整故事演示</a>
      <a href="#styles" className={showEffects?'active':''}>风格模板与编辑 <b>15</b></a>
      <a href="#main" className={!showEffects?'active':''}>故事工作台</a>
      <a href="reference-effects/index.html#gallery">原作效果样例 <b>15</b> ↗</a>
      <a href="#story-styles" onClick={()=>setShowStyles(true)}>故事叠加组件 <b>17</b> ↓</a>
    </nav>
    {showEffects&&<Suspense fallback={<p style={{padding:40}}>正在打开效果工作间…</p>}><EffectWorkbench story={props} onBack={()=>{setShowEffects(false);location.hash='main';}}/></Suspense>}
    <main id="main" className="workspace" style={showEffects?{display:'none'}:undefined}>
      <aside className="editor">
        <div className="editor-intro"><span className="eyebrow">MAKE A LITTLE STORY</span><h1>让故事，<br/>有自己的样子。</h1><p>AI 设计形象与场景，编排每次互动。<br/>从一个念头，到可以带走的短片。</p><a className="current-style" href="#story-styles" onClick={()=>setShowStyles(true)}>当前风格 · {visualStyle.name} ↗</a></div>
        {props.world?<WorldAssets world={props.world} onChange={world=>edit('world',world)}/>:<section><div className="section-title"><b>01</b><h2>故事的主角</h2></div>
          <div className="characters">{characters.map(c=><button key={c.value} className={props.character===c.value?'selected':''} aria-pressed={props.character===c.value} onClick={()=>edit('character',c.value)} title={c.hint}><span>{c.icon}</span>{c.name}</button>)}</div>
          <p className="continuity-note">这是经典舞台。选择「AI 故事世界」可按故事重新设计角色与环境。</p></section>}
        <section><div className="section-title"><b>{props.world?'04':'02'}</b><h2>故事的名字</h2></div>
          {field('title','故事标题',18)}
          {field('signature','结尾短句',18)}
        </section>
        <section><div className="section-title"><b>{props.world?'05':'03'}</b><h2>故事的气质</h2></div>
          {!props.world&&<div className="palettes">{Object.entries(palettes).map(([key,p])=><button key={key} aria-label={p.label} title={p.label} aria-pressed={props.palette===key} className={props.palette===key?'selected':''} onClick={()=>edit('palette',key as StoryProps['palette'])}><i style={{background:p.main}}/><i style={{background:p.light}}/><span>{p.label}</span></button>)}</div>}
          <label className="field"><span>手绘线条的呼吸感<small>{props.boil.toFixed(1)}</small></span><input aria-label="线条的呼吸感" disabled={props.style!=='cel-boil'} type="range" min="0" max="2.5" step=".1" value={props.boil} onChange={e=>edit('boil',Number(e.target.value))}/><em>仅逐帧手绘风格生效；切换风格后保留设置。</em></label>
          <label className="sound"><input type="checkbox" checked={props.sound} onChange={e=>edit('sound',e.target.checked)}/>加入配乐与动作音效<span>原创合成 · 无旁白</span></label>
        </section>
        <p className="scope">{props.world?'角色外形、环境和物件由这次故事单独设计。支持最多三名角色、四个场景，以及走跑、拿放、递交等可组合行动；尚不支持任意复杂表演和物理模拟。':'经典模式保留原有角色与舞台。新创作默认使用 AI 故事世界，让角色、环境与物件随情节改变。'} 本故事模式的 3D 与玻璃为二维近似；顶部风格能力库提供独立三维与折射模板。</p>
      </aside>
      <div className="preview-column">
        <details id="story-styles" className="style-drawer" open={showStyles} onToggle={e=>setShowStyles(e.currentTarget.open)}><summary>故事画法与叠加 · 17 个组件<span>当前：{visualStyle.name}</span></summary>{showStyles&&<StyleLibrary value={props.style} recipe={props.recipe} onChange={chooseStyle} onApply={applyRecipe} onRecipeChange={changeRecipe} hasWorld={Boolean(props.world)}/>}</details>
        <details className="ai-drawer" open={showAi} onToggle={e=>setShowAi(e.currentTarget.open)}><summary>AI 故事导演<span>{props.world?'重新创作 / 改写这个世界':'展开故事与形象创作'}</span></summary><AiDirector story={props} creative={creative} disabled={!online||busy} onApply={applyAI} onBusyChange={setAiBusy} onRevert={canRevert?revertAI:undefined}/></details>
        {props.world&&<div className="world-overview" role="status"><b>这个故事有自己的世界</b><span>{props.world.characters.map(c=>c.name).join('、')} · {props.world.scenes.map(s=>s.name).join(' → ')} · {props.world.objects.length} 件物件</span></div>}
        <div id="preview" className="preview-heading"><div><span className="eyebrow">YOUR STORY, IN MOTION</span><h2>故事放映室<span>LIVE PREVIEW</span></h2></div><div className="format">{frames/FPS} 秒 / {props.shots.length} 镜头 / 24 FPS<br/><strong>1280 × 720</strong></div></div>
        <div className="film-shell"><div className="film-label"><label><i/>视觉风格 <select aria-label="预览视觉风格" value={props.style} onChange={e=>chooseStyle(e.target.value as StyleId)}>{styles.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><span>实时预览 / {props.shots.length} 镜</span></div>
          <Player ref={player} component={CelStory} inputProps={props} durationInFrames={frames} fps={FPS} compositionWidth={1280} compositionHeight={720} controls={false} style={{width:'100%',aspectRatio:'16/9'}} clickToPlay={false} initialFrame={Math.min(24,frames-1)}/>
          <div className="transport"><button className="play" aria-label={playing?'暂停预览':'播放预览'} onClick={()=>{if(frame>=frames-1)player.current?.seekTo(0);player.current?.toggle();}}>{playing?'Ⅱ':'▶'}</button><span>{(frame/FPS).toFixed(1).padStart(4,'0')} <small>/ {(frames/FPS).toFixed(1)} s</small></span><input aria-label="视频进度" type="range" min="0" max={frames-1} value={frame} onChange={e=>seek(Number(e.target.value))}/><button className="restart" aria-label="回到开头" onClick={()=>seek(0)}>↺</button></div>
        </div>
        <div className="active-capabilities"><span>能力组合 · {props.recipe?.components.length?props.recipe.components.map(c=>`${getComponent(c.id)?.name} ${Math.round(c.amount*100)}%`).join(' / '):'当前仅使用基础画法'}</span><a href="#story-styles" onClick={()=>setShowStyles(true)}>调整组合 ↑</a></div>
        <section className="storyboard" aria-label="故事板编辑器">
          <div className="strip-heading"><div><h3>把每一步，排成故事。</h3><small>{props.shots.length}/10 个镜头 · 合计 {frames/FPS} 秒 · 点击镜头编辑</small></div><button className="outline" disabled={props.shots.length>=10} onClick={addShot}>＋ 添加镜头</button></div>
          <div className="board-grid">
            <ol className="shot-list">{timeline.map((shot,i)=><li key={shot.id} className={`${shot.id===selected.id?'selected':''} ${act===i?'on-air':''}`}>
              <button className="shot-select" aria-label={`选择镜头 ${i+1}：${shotName(shot)}`} aria-pressed={shot.id===selected.id} onClick={()=>{setSelectedId(shot.id);seek(shot.from+Math.floor(shot.durationFrames*.45));}}>
                <span className="shot-number">{String(i+1).padStart(2,'0')}</span><div><strong>{props.world?'◈':actions[shot.action].icon} {shotName(shot)}<small>{props.world?props.world.scenes.find(s=>s.id===shot.sceneId)?.name:emotions[shot.emotion]}</small></strong><p>{shot.caption||'填写这一镜的字幕'}</p><span className="shot-time">{(shot.from/FPS).toFixed(1)}—{(shot.to/FPS).toFixed(1)} 秒{act===i?' · 预览中':''}</span></div>
              </button>
              <div className="shot-tools"><button disabled={i===0} aria-label={`上移镜头 ${i+1}`} title="上移" onClick={()=>moveShot(i,-1)}>↑</button><button disabled={i===timeline.length-1} aria-label={`下移镜头 ${i+1}`} title="下移" onClick={()=>moveShot(i,1)}>↓</button><button disabled={timeline.length===1} aria-label={`删除镜头 ${i+1}`} title="删除" onClick={()=>removeShot(i)}>×</button></div>
            </li>)}</ol>
            <div className="shot-inspector">
              <div className="inspector-heading"><span>正在编排</span><strong>镜头 {String(selectedIndex+1).padStart(2,'0')}</strong></div>
              <label className="field"><span>这一镜发生什么<small>{Array.from(selected.caption).length}/24</small></span><input aria-label="镜头字幕" value={selected.caption} maxLength={24} onChange={e=>editShot({caption:e.target.value})}/></label>
              {props.world?<WorldShotEditor key={selected.id} shot={selected} world={props.world} onChange={editShot} resolvedCast={worldTimeline?.[selectedIndex].cast}/>:<div className="shot-options">
                <label className="field"><span>角色动作</span><select aria-label="镜头动作" value={selected.action} onChange={e=>editShot({action:e.target.value as Shot['action']})}>{Object.entries(actions).map(([value,a])=><option key={value} value={value}>{a.label}</option>)}</select></label>
                <label className="field"><span>此刻的情绪</span><select aria-label="镜头情绪" value={selected.emotion} onChange={e=>editShot({emotion:e.target.value as Shot['emotion']})}>{Object.entries(emotions).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
              </div>}
              <label className="field"><span>停留多久<small>{selected.duration.toFixed(1)} 秒</small></span><input aria-label="镜头时长" type="range" min="1" max="6" step=".5" value={selected.duration} onChange={e=>editShot({duration:Number(e.target.value)})}/><em>1–6 秒；调整后，后面的镜头与音效一起移动。</em></label>
              {!props.world&&<><p className="action-hint">{actions[selected.action].hint}</p><p className="continuity-note">镜头会继承前一镜的位置与星光状态。试试在跳跃前插入「尝试失败」。</p></>}
            </div>
          </div>
        </section>
        <div className="export-panel"><div><h3>把这个小故事带走。</h3><p>导出与当前预览相同的 MP4 视频。</p></div><button className="export" disabled={!online||busy||aiBusy||Boolean(validationError)} onClick={render}>{busy?`正在制作 ${Math.round((job?.progress||0)*100)}%`:'导出视频 ↗'}</button></div>
        <div className="feedback" role="status">
          {status&&<p>{status}</p>}
          {validationError&&<p className="error">{validationError}</p>}
          {!online&&<p>当前为静态预览。导出需要启动本地工作台：<code>npm start</code>。</p>}
          {busy&&<><progress max="1" value={job?.progress||0}/><p>{job?.state==='queued'?'正在准备画面与字体…':'正在逐帧绘制与合成，请保持本地服务运行。'}</p></>}
          {job?.state==='done'&&<p><a className="download" href={job.url} download>下载已完成的视频 ↓</a>{dirty?<span>这是上次导出结果；内容已修改，请重新导出。</span>:<span>{getDuration(jobProps.current?.shots||props.shots)/FPS} 秒 · H.264 MP4 · {jobProps.current?.sound?'含配乐':'无配乐'}</span>}</p>}
          {job?.state==='error'&&<p className="error">{job.error} 可以再次点击导出重试。</p>}
        </div>
        <div className="craft-note"><span>{visualStyle.en} / HOW IT WORKS</span><p><b>{visualStyle.name}。</b>{visualStyle.principle}</p><p>{props.world?'当前使用本故事的矢量角色、场景与物件；风格采用通用适配，部分特效简化。':visualStyle.scope}</p><a href="#story-styles" onClick={()=>setShowStyles(true)}>返回风格库 · 查看原理与扩展方向 ↑</a></div>
        <footer>CEL STORY STUDIO <a href="reference-effects/index.html#gallery">15 支原作样片</a><a href="demo.mp4">故事样片</a><a href="CREDITS.txt">素材与许可</a></footer>
      </div>
    </main>
  </div>;
}
createRoot(document.getElementById('root')!).render(<App/>);
