import {useEffect,useState} from 'react';
import {effectTemplates,SOURCE_COMMIT} from '../scripts/effects.mjs';
import './research-overview.css';

const categories=['全部','二维绘制','三维空间','材质光效','文字图解'] as const;
type Category=typeof categories[number];
const groups:Record<string,Category>={isometric:'三维空间','3d-render':'三维空间',synthwave:'三维空间',hud:'三维空间',liquid:'材质光效','aurora-glass':'材质光效',hanazi:'文字图解',paperclip:'文字图解'};
const flow=[
 {name:'表达目标',example:'想让观众感受到什么',control:'情绪是创作目标，不直接等于动作。'},
 {name:'故事与分镜',example:'谁行动、发生什么、如何转折',control:'人和 AI 将目标落到事件、镜头与节奏。'},
 {name:'资产与画法',example:'角色、场景、道具、材质',control:'选择已有资产，或为新故事补做。'},
 {name:'程序动画',example:'动作、接触、镜头、转场',control:'代码计算每一帧，配置决定可调整范围。'},
 {name:'合成与审片',example:'预览 → MP4 → 完整观看',control:'用具体画面问题返修，检查通过不代替作品判断。'},
];
const archive=[
 {id:'018',name:'故事导演演示',text:'两支20秒1080p影片；实际 AI 改写、逐镜编辑与独立能力包。',href:'production-notes-018.html'},
 {id:'017',name:'同风格，不同故事',text:'手绘、形变、玻璃各两套故事，保留实际成片和返修。',href:'production-notes-017.html'},
 {id:'016',name:'十五项质量缺口',text:'逐项梳理问题；线条和科普各两套故事验证。',href:'production-notes-016.html'},
 {id:'015',name:'液态与 HUD 修订',text:'材料行为、连续空间、扫描显形与柔性表演。',href:'production-notes-015.html'},
 {id:'014',name:'十五种完整作品',text:'逐项制作、原作与历史版本对照，保留质量边界。',href:'production-notes-014.html'},
];
const uses=[
 {name:'品牌与产品传播',styles:'矢量 · 形变 · 包豪斯 · 3D',purpose:'品牌片头、产品概念、发布视觉；用清晰构成或材料表现强化记忆。'},
 {name:'知识与系统解释',styles:'线条 · 2.5D · 科普 · 玻璃',purpose:'机制图解、系统架构和功能流程；让抽象关系变成可观察的画面。'},
 {name:'故事与文化内容',styles:'手绘 · 拼贴 · 像素',purpose:'情绪小故事、教育和文创栏目；通过角色、笔触和节奏建立个性。'},
 {name:'活动与科技包装',styles:'霓虹 · 花字 · HUD · 液态',purpose:'节目、舞台和主题包装；以节拍、扫描、辉光或流动形成视觉高潮。'},
];
const reuse=[
 {name:'写创作简报',body:'说明受众、用途、时长、比例、核心信息和希望留下的情绪。先定一个具体表达目标。'},
 {name:'选视觉语言',body:'观看源作与我们的完整作品，选择机制合适、资产范围匹配的模板。风格需要构图、材质和运动一起成立。'},
 {name:'定故事与关键画面',body:'明确角色目标、因果事件、视觉高潮、景别和配时。先确认关键帧，再投入完整动画制作。'},
 {name:'判断复用与补做',body:'列出可沿用的角色、动作、材质和镜头。新对象、新动作或新交互，先补资产、规则和控制接口。'},
 {name:'制作、预览与输出',body:'复制模板配置或下载独立工程，改内容和参数；在本地服务预览并输出 MP4。同一配置贯穿预览与成片。'},
 {name:'完整审片，再归档',body:'检查表演、接触、空间连续、节奏、质感与声音。保存配置、资产、成片、前后对比和问题修法。'},
];
const directions=[
 {name:'品牌短片模板工具',needs:'补品牌资产、版式与参数契约，支持同系列内容稳定改编。'},
 {name:'知识解释视频工具',needs:'补机制图解、数据到画面的映射和内容事实校验。'},
 {name:'有限资产故事创作器',needs:'扩角色与动作词表，完善接触、状态继承和分镜约束。'},
 {name:'批量与多语言版本',needs:'补文字适配、声音、比例与任务队列，并逐版验收。'},
];

export function ResearchOverview(){
 const [category,setCategory]=useState<Category>('全部');
 useEffect(()=>{const scroll=()=>{if(location.hash.startsWith('#overview-'))requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView({block:'start'}));};scroll();window.addEventListener('hashchange',scroll);return()=>window.removeEventListener('hashchange',scroll);},[]);
 const visible=effectTemplates.filter(s=>category==='全部'||(groups[s.id]||'二维绘制')===category);
 return <main className="r019" id="overview">
  <header className="r019-top"><a className="r019-brand" href="#overview">纸间<span>动画研究档案</span></a><nav aria-label="研究与实践导航"><a className="is-current" href="#overview" aria-current="page">研究总结</a><a href="#flagship">故事演示</a><a href="#styles">风格工作台</a><a href="#main">故事工作台</a></nav></header>
  <section className="r019-hero r020-hero" aria-labelledby="r019-title"><div className="r019-hero-copy"><span className="r019-kicker">STYLE CASES → REUSABLE CRAFT</span><p className="r019-status"><i/>研究收尾 · 已归档<span>已有作品与制作能力继续保留</span></p><h1 id="r019-title">从风格效果，<br/>到可复用制作。</h1><p className="r019-lead"><strong>mg-styles-15 是“风格提示＋制作源码＋成片参照”的案例库。</strong>手绘墨线、三维材质、形变转场、玻璃折射等十五种视觉语言，展示了不同目标效果怎样实现。</p><p className="r019-ai-note">我们另做题材与资产，把理解落到独立模板、故事板和制作流程。AI 辅助创意、方案与部分静帧；运动由程序执行。<strong>当前未接入文生视频、图生视频模型。</strong></p><div className="r019-actions"><a className="r019-primary" href="#overview-styles">先看十五种效果 <span>↘</span></a><a className="r019-text-link" href="#overview-reuse">下次做类似视频 →</a></div><p className="r020-hero-links"><a href="#flagship">看完整原创故事 ↗</a><a href="RESEARCH-SUMMARY.md" download>保存研究总结 ↓</a></p></div><figure className="r020-guide" id="overview-map"><a href="research-map-019/mg-styles-capability-map.png" target="_blank" rel="noreferrer" aria-label="打开能力全景图高清原图"><img src="research-map-019/mg-styles-capability-map.png" alt="从十五种风格到可复用创作能力：源库本质、制作链路、十五种原作效果、沉淀方法、使用场景与边界" fetchPriority="high" width="2000" height="3852"/><span>打开完整高清图 ↗</span></a><figcaption><b>一张图，读懂这轮研究。</b><a href="research-map-019/mg-styles-capability-map.svg" download>保存矢量图 ↓</a></figcaption></figure></section>

  <nav className="r019-page-nav" aria-label="总结内容导航"><a href="#overview-essence">本质与分工</a><a href="#overview-process">制作与控制</a><a href="#overview-kept">可复用成果</a><a href="#overview-entries">现有入口</a><a href="#overview-styles">十五种风格</a><a href="#overview-uses">场景与扩展</a><a href="#overview-reuse">下次怎样做</a><a href="#overview-archive">资料归档</a></nav>
  <section className="r019-section" aria-labelledby="overview-essence"><header className="r019-section-title"><div><span className="r019-kicker">01 / THE ESSENCE</span><h2 id="overview-essence">情绪、风格、技术，各管什么？</h2></div><p>把创作意图落成能执行、能修改、能检查的画面。</p></header><div className="r019-layers"><article><span>输入目标</span><h3>情绪，决定想表达什么。</h3><p>例如“小鲸害怕出发，最后慢慢放心”。它需要被转译成具体事件、停顿、目光与回应。</p></article><article><span>表现规则</span><h3>风格，规定画面怎么说。</h3><p>构图、配色、笔触、材质与运动节奏共同形成风格。换一个颜色，还不足以换一种视觉语言。</p></article><article><span>执行方式</span><h3>代码，让设计真正发生。</h3><p>控制角色姿态、物件接触、路径、相机和光照。Remotion 按时间轴组织并输出每一帧。</p></article></div></section>

  <section className="r019-section" aria-labelledby="overview-process"><header className="r019-section-title"><div><span className="r019-kicker">02 / FROM INTENT TO FILM</span><h2 id="overview-process">从头到尾，控制发生在这里。</h2></div></header><ol className="r019-flow">{flow.map((s,i)=><li key={s.name}><span className="r019-flow-number">{String(i+1).padStart(2,'0')}</span><h3>{s.name}</h3><b>{s.example}</b><p>{s.control}</p></li>)}</ol><div className="r019-example"><span>本次实际例子</span><p><b>“让小鲸更胆怯”</b> → AI 将跃入镜头设为试探情绪 → 已实现的动画先停约0.65秒、减小跃幅、放慢尾鳍 → 同一份配置进入预览与20秒成片。</p><a href="director-examples-018/ai-rewrite.json">查看实际改写记录 ↗</a></div></section>

  <section className="r019-section" aria-labelledby="overview-kept"><header className="r019-section-title"><div><span className="r019-kicker">03 / WHAT WE KEEP</span><h2 id="overview-kept">这轮真正留下的三类能力。</h2></div><a className="r019-text-link" href="director-kit-018.zip" download>下载源码与创作 Skill ↓</a></header><div className="r019-kept-grid"><article><span>01</span><h3>创作方法</h3><p>从表达目标到因果分镜，先做关键画面，再看完整影片、记录问题与返修。</p><small>已留存：创作 Skill、参考规则、制作与审片记录。</small><a href="director-kit-018/SKILL.md">阅读创作方法 ↗</a></article><article><span>02</span><h3>资产与动画实现</h3><p>角色、场景、路径与材料表现，以及让手、工具和物件保持关系的程序实现。</p><small>可复用范围由具体素材、动作和控制接口决定。</small><a href="#styles">查看已有风格与控制项 ↗</a></article><article><span>03</span><h3>制作管线</h3><p>结构化配置、预览、镜头调整、撤销、保存与导入，再输出可继续修改的项目和 MP4。</p><small>已验证：网页真实 AI 改写、应用与导出；独立工程可运行。</small><a href="#flagship">进入可编辑演示 ↗</a></article></div><div className="r019-boundary"><h3>已有模板可以改编；新故事仍需要制作。</h3><p>旗舰页使用专门设计的狐狸、小鲸和五个因果事件。十五种效果也各有素材与动作边界。加入新角色、道具或情节，需要补资产、表演和规则；目前还没有任意故事自动生成优秀影片的通用系统。</p></div></section>

  <section className="r019-section" aria-labelledby="overview-entries"><header className="r019-section-title"><div><span className="r019-kicker">CHOOSE A WORKING SURFACE</span><h2 id="overview-entries">三个入口，各有明确的使用范围。</h2></div></header><div className="r020-runtime"><b>线上观看与编辑，本地生成新片。</b><p>线上可浏览研究、观看与对比作品、编辑预览、保存配置和下载现成成片。AI 编排与新 MP4 渲染需要运行本地 Node 工作台；下方接口与资产范围也决定能修改到哪一步。</p><a href="NEXT-VIDEO.md">本地运行与下次制作指南 ↗</a></div><div className="r019-entry-list"><a href="#main"><div><h3>故事工作台</h3><span>结构化矢量世界 · 探索原型</span></div><p>可增删、排序镜头；AI 可生成结构化矢量角色、场景与关键帧方案。画面受已有绘制与动作契约约束。</p><b>进入 ↗</b></a><a href="#styles"><div><h3>十五套风格模板</h3><span>各自独立的素材与表现机制</span></div><p>线条、科普、手绘、形变、玻璃各两套故事；霓虹、像素、HUD 支持有限 AI 编排。可编辑预览，运行本地服务后生成新片。</p><b>进入 ↗</b></a><a href="#flagship"><div><h3>旗舰故事导演室</h3><span>狐狸与小鲸 · 1080p</span></div><p>固定五个因果事件，支持逐镜取景、情绪、配时和字幕调整；AI 在这套专门资产内改写。</p><b>进入 ↗</b></a></div><p className="r019-quality-note">三个入口使用各自的数据与执行规则，目前没有任意故事一键适配十五种风格的统一契约。</p></section>

  <section className="r019-section" aria-labelledby="overview-styles"><header className="r019-section-title"><div><span className="r019-kicker">04 / THE STYLE RESERVE</span><h2 id="overview-styles">十五种风格，作为表达储备。</h2></div><a className="r019-text-link" href="reference-effects/index.html#gallery">源库十五支原作 ↗</a></header><p className="r019-section-intro">参考源库的视觉原理，制作独立题材与可调整实现。下面是当前作品和入口；原作、历史影片及质量余项继续保留。</p><div className="r019-filters" role="group" aria-label="按表现方式筛选风格">{categories.map(item=><button type="button" key={item} aria-pressed={item===category} onClick={()=>setCategory(item)}>{item}<span>{item==='全部'?effectTemplates.length:effectTemplates.filter(s=>(groups[s.id]||'二维绘制')===item).length}</span></button>)}<span className="r019-result" aria-live="polite">显示 {visible.length} 项</span></div><div className="r019-style-grid">{visible.map(s=><article className="r019-style" key={s.id}><a className="r019-style-cover" href={`#effects/${s.id}`} aria-label={`打开${s.name}作品与可编辑模板`}><img loading="lazy" src={`effect-examples/${s.id}.jpg?v=017`} alt={`${s.name}：${s.example[0]}实际作品画面`}/><span>{groups[s.id]||'二维绘制'}</span></a><div className="r019-style-heading"><div><h3>{s.name}</h3><p>{s.example[0]}</p></div><a href={`#effects/${s.id}`} aria-label={`进入${s.name}模板`}>↗</a></div><p className="r019-engine">{s.engine}</p><details><summary>原理、复用范围与边界 <span>＋</span></summary><dl><div><dt>原理</dt><dd>{s.principle}</dd></div><div><dt>已有实现</dt><dd>{s.modules.join('、')}</dd></div><div><dt>适用场景</dt><dd>{s.useCases}</dd></div><div><dt>当前边界</dt><dd>{s.boundary}</dd></div></dl><div className="r019-detail-links"><a href={`#effects/${s.id}`}>预览与调整 ↗</a><a href={`reference-effects/media/${s.slug}.mp4`}>观看对应原片 ↗</a></div></details></article>)}</div><p className="r019-quality-note">作品质量仍有差异。角色表演、笔触统一、复杂材质与自由资产生成的余项保留在制作记录中；可运行与导出成功不等于艺术质量已经达标。</p><div className="r019-library-links"><a href="#effects-gallery">浏览十五支完整作品 ↗</a><a href="effect-library.json" download>保存能力目录 JSON ↓</a><a href="production-notes-016.html">查看逐项质量缺口 ↗</a></div></section>

  <section className="r019-section" aria-labelledby="overview-uses"><header className="r019-section-title"><div><span className="r019-kicker">05 / USE & EXTEND</span><h2 id="overview-uses">按表达任务选择，不按效果堆叠。</h2></div></header><div className="r020-use-grid">{uses.map(item=><article key={item.name}><h3>{item.name}</h3><span>{item.styles}</span><p>{item.purpose}</p></article>)}</div><div className="r020-directions"><h3>可扩展的产品方向 <span>尚未通用实现</span></h3><div>{directions.map(item=><article key={item.name}><b>{item.name}</b><p>{item.needs}</p></article>)}</div><p>每个方向都要补对应的资产、数据契约、控制项和质量验证；增加一条提示词，还不足以完成产品化。</p></div></section>
  <section className="r019-section" aria-labelledby="overview-reuse"><header className="r019-section-title"><div><span className="r019-kicker">06 / MAKE THE NEXT FILM</span><h2 id="overview-reuse">下次做类似视频，从这六步开始。</h2></div><a className="r019-text-link" href="NEXT-VIDEO.md" download>保存制作指南 ↓</a></header><ol className="r020-reuse">{reuse.map((item,i)=><li key={item.name}><span>{String(i+1).padStart(2,'0')}</span><div><h3>{item.name}</h3><p>{item.body}</p></div></li>)}</ol><div className="r020-brief"><span>把这一段填写后交给创作者或 AI</span><blockquote>我要为【受众】制作【用途】视频，时长【秒】，表达【核心信息／情绪】，采用【风格】，包含【角色／物件／因果事件】，参考【作品与关键画面】；已有【资产】，需要补做【资产／动作】，交付【比例／分辨率／声音】。</blockquote><a href="video-brief-template.txt" download>下载简报空表 ↓</a></div><p className="r019-quality-note">复用顺序：优先复用已验证的故事骨架、资产与动作，再调整画面规则。把最后有效的配置和修法留下，下一次才能少走弯路。</p></section>
  <section className="r019-section r019-archive" aria-labelledby="overview-archive"><header className="r019-section-title"><div><span className="r019-kicker">07 / RESEARCH ARCHIVE</span><h2 id="overview-archive">结论在前，过程按需查阅。</h2></div><a className="r019-text-link" href="RESEARCH-SUMMARY.md" download>完整研究总结 ↓</a></header><div className="r019-archive-list">{archive.map(item=><a key={item.id} href={item.href}><span>{item.id}</span><h3>{item.name}</h3><p>{item.text}</p><b aria-hidden="true">↗</b></a>)}</div><div className="r019-next"><div><h3>暂时结束研究，保留可以继续使用的成果。</h3><p>需要使用时，从完整故事演示、风格工作台或下载能力包进入。后续新题材与新能力，作为新的制作任务推进。</p></div><a className="r019-primary" href="#flagship">打开故事演示 <span>↗</span></a></div></section>
  <footer className="r019-footer"><p>研究来源：<a href={`https://github.com/Vincentwei1021/mg-styles-15/tree/${SOURCE_COMMIT}`} target="_blank" rel="noreferrer">mg-styles-15 · {SOURCE_COMMIT.slice(0,12)}</a>，代码 MIT；纸纹 CC0 / 公开领域，字体 OFL。Remotion 4.0.537 使用自身许可。</p><div><a href="reference-effects/index.html#gallery">原作与提示词</a><a href="effects/CREDITS.md">素材与技术来源</a><a href="REMOTION-LICENSE.md">Remotion 许可</a></div><small>0.19 汇总归档版 · 影视与能力包保留 0.18 基线</small></footer>
 </main>;
}
