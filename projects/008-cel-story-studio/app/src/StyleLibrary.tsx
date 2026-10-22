import {useState} from 'react';
import {getStyle,type StyleId} from '../scripts/styles.mjs';
import {capabilityStyles,components,getCapability,getComponent,recommendedRecipe,validateRecipe,MAX_COMPONENTS,type StyleRecipe} from '../scripts/capabilities.mjs';
import {validateStyle} from '../scripts/styles.mjs';

type SavedRecipe={id:string;name:string;style:StyleId;recipe:StyleRecipe};
function readRecipes():SavedRecipe[]{
  try{
    const raw=localStorage.getItem('cel-style-recipes-v1');if(!raw||raw.length>24000)return [];
    const rows=JSON.parse(raw);if(!Array.isArray(rows)||rows.length>10)return [];
    return rows.map(r=>{if(typeof r.id!=='string'||r.id.length>64||typeof r.name!=='string'||!r.name.trim()||r.name.length>20)throw new Error();return {id:r.id,name:r.name,style:validateStyle(r.style),recipe:validateRecipe(r.recipe)||{version:1,components:[]}};});
  }catch{return [];}
}

function TemplateSample({id}:{id:StyleId}){
  const [play,setPlay]=useState(false);
  const [failed,setFailed]=useState(false);
  const style=getStyle(id);
  return <div className="template-sample">
    <div className="sample-heading"><b>{style.name} · 3 秒模板样片</b><a href={`style-demos/${id}.mp4`} target="_blank" rel="noreferrer">单独打开 ↗</a></div>
    {play?<video controls autoPlay playsInline preload="none" poster={`styles/${id}.jpg`} src={`style-demos/${id}.mp4`} aria-label={`${style.name}模板动作样片`} onError={()=>setFailed(true)}/>:<button className="sample-poster" aria-label={`播放${style.name}模板样片`} onClick={()=>setPlay(true)}><img src={`styles/${id}.jpg`} alt={`${style.name}模板样片封面`} width="480" height="270"/><span>▶ 播放动作样片</span></button>}
    {failed&&<p role="alert">样片暂时无法播放，请尝试单独打开或刷新页面。</p>}
    <p>这是经典舞台的模板示例；下方「故事放映室」显示你当前的故事。切换卡片可查看其余样片。</p>
  </div>;
}

export function StyleLibrary({value,recipe,onChange,onApply,onRecipeChange,hasWorld=false}:{value:StyleId;recipe?:StyleRecipe;onChange:(value:StyleId)=>void;onApply:(style:StyleId,recipe:StyleRecipe)=>void;onRecipeChange:(recipe:StyleRecipe)=>void;hasWorld?:boolean}){
  const [group,setGroup]=useState('全部');
  const [inspected,setInspected]=useState<StyleId>(value);
  const [query,setQuery]=useState('');
  const [saved,setSaved]=useState(readRecipes);
  const [name,setName]=useState('');
  const [message,setMessage]=useState('');
  const current=getCapability(inspected),active=recipe?.components||[];
  const filtered=capabilityStyles.filter(s=>(group==='全部'||s.group===group)&&[s.name,s.value,s.expression,s.useCases,...s.dna,...s.modules.map(id=>getComponent(id)!.name)].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
  const toggle=(id:typeof components[number]['id'])=>{
    const exists=active.some(x=>x.id===id);
    onRecipeChange({version:1,components:exists?active.filter(x=>x.id!==id):[...active,{id,amount:getComponent(id)!.amount}]});
  };
  const storeRecipes=(next:SavedRecipe[])=>{
    try{localStorage.setItem('cel-style-recipes-v1',JSON.stringify(next));setSaved(next);return true;}
    catch{setMessage('浏览器未允许保存组合；仍可使用顶部「保存配置」带走故事与风格。');return false;}
  };
  const saveRecipe=()=>{
    if(!name.trim()||saved.length>=10)return;
    if(storeRecipes([...saved,{id:crypto.randomUUID(),name:name.trim(),style:value,recipe:structuredClone(recipe||{version:1,components:[]})}])){setName('');setMessage('组合已保存到本浏览器，可用于其他故事。');}
  };
  return <section className="style-library" aria-label="风格能力库">
    <div className="style-library-heading"><div><span className="eyebrow">A LIBRARY TO CREATE WITH</span><h2>为故事，组合画法与表达。</h2></div><span className="style-count">15 <small>故事画法原型 · 17 个可用组件</small></span></div>
    <p className="style-intro">从原理理解风格，按故事选择表达，再复用组件。浏览卡片不会改动故事；采用方案后可在当前画面中组合、调整和导出。基础画法均为探索原型，扩展项单独列出。</p>
    <a className="effect-entry-link" href={`#effects/${inspected}`}><b>打开 15 种独立效果模板 · 原作 / 工作台直观对比 ↗</b><span>每种效果有自己的场景与参数。真实三维、GPU 液态与折射、照片拼贴、像素舞台，支持改内容并生成 MP4。</span></a>
    <a className="reference-link" href="reference-effects/index.html#gallery"><b>原作研究 · 15 支完整影片</b><span>查看视觉语言、原始提示词与制作方法 ↗</span></a>
    <label className="capability-search"><span>寻找表达方式</span><input aria-label="搜索风格能力" value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索风格、情绪、场景或组件…"/></label>
    <div className="style-filters" role="group" aria-label="筛选风格">{['全部','基础图形','空间材质','叙事手作','信息界面'].map(g=><button key={g} aria-pressed={group===g} onClick={()=>setGroup(g)}>{g}</button>)}</div>
    <p className="capability-result" role="status">显示 {filtered.length} / 15 种风格 · 当前故事使用 {getStyle(value).name}</p>
    <div className="style-grid">{filtered.map(s=><button className={`style-card ${inspected===s.id?'selected':''}`} key={s.id} aria-label={`研究风格：${s.name}`} aria-pressed={inspected===s.id} onClick={()=>setInspected(s.id)}>
      <div className="style-thumb" style={{background:s.color+'25'}}><img src={`styles/${s.id}.jpg`} alt="" loading="lazy" width="480" height="270"/><span>{value===s.id?'当前在用':'基础画法原型'}</span></div><div className="style-card-label"><strong>{s.name}</strong><small>{s.en}</small></div>
    </button>)}</div>
    {!filtered.length&&<p className="capability-empty">没有匹配结果。<button className="quiet" onClick={()=>{setQuery('');setGroup('全部');}}>重置筛选</button></p>}
    <article className="capability-detail" aria-label={`${current.name}能力说明`}>
      <div className="capability-title"><div><span className="eyebrow">STYLE LANGUAGE / {current.en}</span><h3>{current.name}</h3></div><span className="maturity-tag">{current.maturity}</span></div>
      <p className="capability-value">{current.expression}</p>
      <dl className="capability-facts"><div><dt>原理</dt><dd>{current.principle}</dd></div><div><dt>价值</dt><dd>{current.value}</dd></div><div><dt>适用场景</dt><dd>{current.useCases}</dd></div></dl>
      <div className="capability-dna">{current.dna.map((rule,i)=><div key={rule}><span>{['色彩与构成','造型与材质','运动与节奏'][i]}</span><p>{rule}</p></div>)}</div>
      <div className="capability-actions"><button className="apply-capability" onClick={()=>onApply(inspected,recommendedRecipe(inspected))}>采用「{current.name}」推荐组合</button><button className="quiet" onClick={()=>onChange(inspected)}>只切换基础画法</button><a href="#preview">查看当前故事 ↓</a></div>
      <p className="capability-hint">推荐组合会替换当前组件选择，保留角色、场景、情节与时长；各组件可继续跨风格复用。</p>
      <h4>可复用组件</h4><div className="capability-modules">{current.modules.map(id=>{const m=getComponent(id)!;return <div key={id}><b>{m.name}<small>已接入</small></b><p>{m.principle}</p><span>{m.value}</span></div>;})}</div>
      <details className="capability-boundaries"><summary>实现边界与扩展方向</summary><p><b>基础画法：</b>{current.implementation}。{hasWorld?'当前故事世界采用通用矢量适配，部分特效简化。':''}{current.scope}</p><p><b>表达时避免：</b>{current.avoid}</p><h4>待扩展 · 尚未实现</h4><ul>{current.next.map(n=><li key={n}>{n}</li>)}</ul><a href={`https://github.com/Vincentwei1021/mg-styles-15/tree/49052d80bfaf9fa8412cc9710530e5e95a3b8d8c/demos/${current.slug}`} target="_blank" rel="noreferrer">研究来源与源码 ↗</a><p>以上表达规则和扩展方向为本项目整理；上游 MIT，固定版本 {current.source.commit.slice(0,12)}。</p></details>
    </article>
    <section className="recipe-editor" aria-label="当前故事的组件组合">
      <div className="recipe-heading"><div><span className="eyebrow">COMPOSE YOUR EXPRESSION</span><h3>当前故事的能力组合</h3></div><span>{active.length} / {MAX_COMPONENTS}</span></div>
      <p>基础画法：<b>{getStyle(value).name}</b>。点击组件加入或移除，调整强度后，预览与导出同步变化。</p>
      <div className="component-picker" role="group" aria-label="可跨风格复用的组件">{components.map(m=>{const chosen=active.some(x=>x.id===m.id);return <button key={m.id} aria-label={`复用组件：${m.name}`} aria-pressed={chosen} disabled={!chosen&&active.length>=MAX_COMPONENTS} onClick={()=>toggle(m.id)} title={m.scope}><span>{chosen?'✓':'＋'} {m.name}</span><small>{m.origin==='shared'?'通用镜头':getStyle(m.origin).name}</small></button>;})}</div>
      {active.length>=MAX_COMPONENTS&&<p className="capability-hint">已选 6 个组件。移除一个后可加入其他组件；建议围绕表达重点控制数量。</p>}
      {!active.length&&<p className="recipe-empty">当前仅使用基础画法。选择上方组件，或采用风格的推荐组合。</p>}
      <div className="recipe-settings">{active.map(item=>{const m=getComponent(item.id)!;return <div className="recipe-setting" key={item.id}><label><span>{m.name}<small>{Math.round(item.amount*100)}%</small></span><input type="range" aria-label={`${m.name}强度`} min="0" max="1" step=".05" value={item.amount} onChange={e=>onRecipeChange({version:1,components:active.map(x=>x.id===item.id?{...x,amount:Number(e.target.value)}:x)})}/></label><button aria-label={`移除组件：${m.name}`} onClick={()=>toggle(item.id)}>×</button><p>{m.scope}</p></div>;})}</div>
      <div className="saved-recipes"><h4>我的组合 · {saved.length}/10</h4><p>保存在本浏览器。载入其他故事后可再次应用；顶部「保存配置」可带走完整故事及组合。</p><div className="save-recipe-row"><input aria-label="组合名称" maxLength={20} value={name} onChange={e=>setName(e.target.value)} placeholder="例如：温暖手作、复古冒险"/><button className="outline" disabled={!name.trim()||saved.length>=10} onClick={saveRecipe}>保存当前组合</button></div><div className="saved-recipe-list">{saved.map(r=><div key={r.id}><button className="saved-recipe-apply" onClick={()=>{setInspected(r.style);onApply(r.style,structuredClone(r.recipe));setMessage(`已应用组合「${r.name}」。`);}}>{r.name}<small>{getStyle(r.style).name} · {r.recipe.components.length} 个组件</small></button><button aria-label={`删除组合：${r.name}`} onClick={()=>storeRecipes(saved.filter(x=>x.id!==r.id))}>×</button></div>)}</div>{message&&<p role="status">{message}</p>}</div>
      <a className="recipe-preview-link" href="#preview">回到故事放映室，查看这次组合 ↓</a>
    </section>
    <details className="capability-examples"><summary>基础画法样片与研究资料</summary><p>以下样片展示已有的简化基础画法；你当前的组件组合在故事放映室中生效。</p><TemplateSample key={inspected} id={inspected}/><details className="style-reel"><summary>播放 15 种基础画法连播 · 45 秒</summary><video controls playsInline preload="none" poster="styles/flat-vector.jpg" src="all-styles.mp4" aria-label="十五种风格动作样片连播"/></details><p>同一「温暖手作·聚焦」组合的网页导出：<a href="capability-examples/water.mp4">阳台浇花 ↗</a> · <a href="capability-examples/robot.mp4">机器人递杯 ↗</a>。角色与故事各自独立，复用纸感、边饰、聚焦与镜头缓推。</p><a href="capability-library.json" download>能力目录 JSON ↓</a> · <a href="STYLE-CAPABILITIES.md" download>完整能力说明书 ↓</a> · <a href="reference-effects/index.html#gallery">原作研究 ↗</a></details>
  </section>;
}
