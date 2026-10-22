import {useEffect,useRef,useState} from 'react';
import {tones,type Creative} from '../scripts/ai-schema.mjs';
import type {StoryProps} from './model';
import {getStyle} from '../scripts/styles.mjs';
import {getComponent} from '../scripts/capabilities.mjs';
import {isStaticPages,STATIC_SERVICE_NOTICE} from './browser-runtime';

export type AiDraft={story:StoryProps;creative:Creative};
type AiJob={id:string;state:'starting'|'creating'|'repairing'|'validating'|'done'|'error'|'cancelled';error?:string;result?:AiDraft};
type Connection={available:boolean;label:string;message:string};
type Props={story:StoryProps;creative:Creative|null;disabled:boolean;onApply:(draft:AiDraft,exportVideo:boolean)=>void;onBusyChange:(busy:boolean)=>void;onRevert?:()=>void};

export function readCreative(value:unknown):Creative|null{
  if(!value||typeof value!=='object')return null;
  const v=value as Record<string,unknown>;
  const limits={brief:800,logline:100,narrative:500,tone:20,mode:20,generatedAt:40,provider:60};
  if(!Object.entries(limits).every(([key,max])=>typeof v[key]==='string'&&(v[key] as string).length<=max))return null;
  return Object.fromEntries(Object.keys(limits).map(key=>[key,v[key]])) as Creative;
}

export function AiDirector({story,creative,disabled,onApply,onBusyChange,onRevert}:Props){
  const [connection,setConnection]=useState<Connection>({available:false,label:'本机 Codex',message:isStaticPages?STATIC_SERVICE_NOTICE:'正在检查 AI 连接…'});
  const [brief,setBrief]=useState('');
  const [tone,setTone]=useState('warm');
  const [duration,setDuration]=useState(12);
  const [character,setCharacter]=useState('auto');
  const [engine,setEngine]=useState('world');
  const [protagonist,setProtagonist]=useState('');
  const [mode,setMode]=useState('create');
  const [autoExport,setAutoExport]=useState(false);
  const [job,setJob]=useState<AiJob|null>(null);
  const [elapsed,setElapsed]=useState(0);
  const [pending,setPending]=useState<{draft:AiDraft;exportVideo:boolean}|null>(null);
  const current=useRef(story),apply=useRef(onApply),baseline=useRef(''),requestedExport=useRef(false);
  const cancelled=useRef(new Set<string>());
  const generating=Boolean(job&&!['done','error','cancelled'].includes(job.state));
  useEffect(()=>{current.current=story;apply.current=onApply;},[story,onApply]);
  const checkConnection=async()=>{
    if(isStaticPages){setConnection({available:false,label:'本机 Codex',message:STATIC_SERVICE_NOTICE});return;}
    try{const r=await fetch('/api/ai/status');if(!r.ok)throw new Error();setConnection(await r.json());}
    catch{setConnection({available:false,label:'本机 Codex',message:'AI 创作需要启动本地工作台服务。'});}
  };
  useEffect(()=>{void checkConnection();},[]);
  useEffect(()=>{onBusyChange(generating);},[generating,onBusyChange]);
  useEffect(()=>{
    if(!generating)return;const timer=window.setInterval(()=>setElapsed(n=>n+1),1000);
    return()=>clearInterval(timer);
  },[generating]);
  useEffect(()=>{
    const id=job?.id;if(!id)return;
    let disposed=false,timer:number|undefined;
    const poll=async()=>{
      try{
        const r=await fetch(`/api/ai/jobs/${id}`);const next=await r.json();
        if(!r.ok)throw new Error(next.error||'AI 创作状态读取失败。');
        if(disposed||cancelled.current.has(id))return;
        setJob(next);
        if(next.state==='done'){
          const result=next.result as AiDraft;
          if(JSON.stringify(current.current)!==baseline.current)setPending({draft:result,exportVideo:requestedExport.current});
          else apply.current(result,requestedExport.current);
          return;
        }
        if(['error','cancelled'].includes(next.state))return;
        timer=window.setTimeout(poll,1000);
      }catch(error){if(!disposed&&!cancelled.current.has(id))setJob({id,state:'error',error:error instanceof Error?error.message:'AI 创作状态读取失败。'});}
    };
    timer=window.setTimeout(poll,500);
    return()=>{disposed=true;clearTimeout(timer);};
  },[job?.id]);
  const generate=async()=>{
    if(generating||disabled)return;
    baseline.current=JSON.stringify(story);requestedExport.current=autoExport;
    setPending(null);setElapsed(0);setJob({id:'',state:'starting'});
    try{
      const r=await fetch('/api/ai/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({brief,tone,duration,character:engine==='world'?'auto':character,engine,protagonist,mode,style:story.style,recipe:story.recipe,sound:story.sound,boil:story.boil,...(mode==='rewrite'?{current:story}:{})})});
      const result=await r.json();if(!r.ok)throw new Error(result.error||'AI 暂时无法开始创作。');
      setJob(result);
    }catch(error){setJob({id:'',state:'error',error:error instanceof Error?error.message:'AI 创作请求失败。'});}
  };
  const cancel=async()=>{
    if(!job?.id)return;cancelled.current.add(job.id);setJob({...job,state:'cancelled'});
    try{await fetch(`/api/ai/jobs/${job.id}/cancel`,{method:'POST'});}catch{setJob({...job,state:'error',error:'无法确认取消，请检查本地服务；收到的结果不会覆盖当前故事。'});}
  };
  return <section className="ai-director" aria-label="AI 故事导演">
    <div className="ai-heading"><div><span className="eyebrow">A LITTLE IDEA, A WHOLE STORY</span><h2>从一个念头，长出故事。</h2></div><span className={`ai-connection ${connection.available?'connected':''}`}>✦ {connection.available?'AI 已连接':'AI 未连接'}</span></div>
    <p className="ai-capability-context">创作将使用「{getStyle(story.style).name}」的表达规则{story.recipe?.components.length?`，并保留 ${story.recipe.components.map(c=>getComponent(c.id)?.name).join('、')}。`:'。可先在风格能力库选择组件组合。'}</p>
    <fieldset disabled={generating||disabled}>
      <label className="field"><span>创作范围</span><select aria-label="AI 创作范围" value={engine} onChange={e=>setEngine(e.target.value)}><option value="world">AI 故事世界 · 设计角色、场景与物件</option><option value="classic">经典舞台 · 原有三种小角色</option></select><em>{engine==='world'?'AI 会按故事设计新的矢量形象与布景，再安排具体互动。':'使用原有角色、小山与星星，兼容之前的故事。'}</em></label>
      <div className="ai-mode"><label><span>创作方式</span><select aria-label="AI 创作方式" value={mode} onChange={e=>setMode(e.target.value)}><option value="create">创作一个新故事</option><option value="rewrite">改写当前故事</option></select></label><span>{getStyle(story.style).name} · {mode==='create'?'留空也可以，让 AI 给你灵感。':'保留当前故事，写下你想改变什么。'}</span></div>
      <label className="field"><span>{mode==='create'?'给 AI 一个故事种子':'告诉 AI 怎么改写'}<small>{brief.length}/800</small></span><textarea aria-label="故事创意" rows={3} maxLength={800} value={brief} onChange={e=>setBrief(e.target.value)} placeholder={mode==='create'?'比如：白兔把花园里的胡萝卜带进小屋，送给小熊。':'比如：把主角改为穿雨衣的小猫，地点改为雨中的车站。'}/></label>
      <div className="idea-seeds">{(engine==='world'?['白兔在花园找到胡萝卜，带进小屋送给小熊。','机器人从厨房拿起杯子，到阳台递给小猫。','小狐狸在图书馆拿起一本书，坐下安静阅读。']:['不必一次成功','慢一点，也能抵达','给害怕一个拥抱']).map(seed=><button type="button" key={seed} onClick={()=>setBrief(seed)}>{seed} ↗</button>)}</div>
      {engine==='world'&&<label className="field"><span>角色形象要求<small>可留空</small></span><input aria-label="AI 角色形象要求" maxLength={160} value={protagonist} onChange={e=>setProtagonist(e.target.value)} placeholder="比如：蓝围巾白兔、戴圆眼镜的棕色小熊"/></label>}
      <div className="ai-options">
        <label className="field"><span>故事气质</span><select aria-label="AI 故事气质" value={tone} onChange={e=>setTone(e.target.value)}>{Object.entries(tones).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
        <label className="field"><span>成片长度</span><select aria-label="AI 目标时长" value={duration} onChange={e=>setDuration(Number(e.target.value))}><option value="12">12 秒 · 5 镜</option><option value="20">20 秒 · 6 镜</option><option value="30">30 秒 · 8 镜</option></select></label>
        {engine==='classic'?<label className="field"><span>故事主角</span><select aria-label="AI 故事主角" value={character} onChange={e=>setCharacter(e.target.value)}><option value="auto">交给 AI 选择</option><option value="flame">小火苗</option><option value="drop">小水滴</option><option value="star">小星星</option></select></label>:<div className="ai-world-scope">角色、布景、物件<br/><b>随这次故事设计</b></div>}
      </div>
      <div className="ai-submit"><label><input type="checkbox" aria-label="生成后自动导出视频" checked={autoExport} onChange={e=>setAutoExport(e.target.checked)}/>生成后直接导出 MP4</label><button className="generate" disabled={!connection.available||(mode==='rewrite'&&!brief.trim())} onClick={()=>void generate()}>{generating?'正在创作…':creative?'再创作一版 ✦':'AI 生成故事与分镜 ✦'}</button></div>
    </fieldset>
    <div className="ai-status" role="status" aria-live="polite">
      {generating&&<p><span className="ai-working">✦</span> {job?.state==='validating'?'正在校验角色、场景引用与物件交互…':job?.state==='repairing'?'AI 正在修正世界与分镜，让情节可以执行…':engine==='world'?'AI 正在构思故事、绘制角色与布景、编排互动…':'AI 正在构思故事、编排动作与情绪…'}<small>{elapsed} 秒</small>{job?.id&&<button onClick={()=>void cancel()}>取消创作</button>}</p>}
      {job?.state==='error'&&<p className="ai-error">{job.error}</p>}
      {job?.state==='cancelled'&&<p>已取消创作，当前故事保持不变。</p>}
      {!connection.available&&!generating&&<p>{connection.message}<button onClick={()=>void checkConnection()}>重新检查</button></p>}
    </div>
    {pending&&<div className="ai-pending"><strong>新故事已生成：{pending.draft.story.title}</strong><p>{pending.draft.creative.logline}</p><p>生成期间你修改了当前故事，草稿已保留，尚未替换画面。</p><button className="outline" disabled={disabled} onClick={()=>{onApply(pending.draft,pending.exportVideo);setPending(null);}}>采用这版{pending.exportVideo?'并导出':'故事'}</button><button className="quiet" onClick={()=>setPending(null)}>放弃草稿</button></div>}
    {creative&&<div className="ai-original"><div><span>AI 故事原稿 · {creative.provider}</span>{onRevert&&<button onClick={onRevert} disabled={generating}>恢复生成前版本 ↶</button>}</div><p>{creative.logline}</p><details><summary>展开完整故事</summary><p>{creative.narrative}</p><small>这是生成时的故事原稿，下方镜头可以继续自由修改。</small></details><a className="ai-preview-link" href="#preview">查看画面与分镜 ↓</a></div>}
    <p className="ai-footnote">{engine==='world'?'故事世界支持最多 3 名角色、4 个场景、16 类基础行动与 AI 自定义关节表演。角色与布景按本次故事生成；复杂物理与精细表演仍需扩展。':'经典模式使用原有固定舞台。'} 生成后可继续逐镜编辑。通过本机 Codex 登录连接模型服务。</p>
  </section>;
}
