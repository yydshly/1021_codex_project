(() => {
  'use strict';
  const {catalog, report} = window.RESEARCH_DATA;
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const base = `https://github.com/vigneshv1cky/alphadesk-terminal/blob/${catalog.commit}/alphadesk/`;
  const codeLink = (path, cls='source-code') => `<a class="${cls}" href="${base}${encodeURI(path)}" target="_blank" rel="noreferrer">${esc(path)} ↗</a>`;
  const select = (attr, key) => $$(`[data-${attr}]`).forEach(b => b.setAttribute('aria-pressed', String(b.dataset[attr] === key)));
  $('[data-count="tools"]').textContent = catalog.tools.length;
  $('[data-count="pages"]').textContent = new Set(catalog.routes.filter(r => !r.redirect).map(r => r.component)).size;
  $('[data-count="http"]').textContent = report?.checks?.length ?? '—';

  const nodes = {
    sources:{label:'外部世界 / INPUT',title:'先有材料，才有研究。',body:'输入并非一种数据：行情是时间序列，新闻是文章，SEC 是监管申报与 XBRL 事实，政府与日历来源提供事件记录。每种材料有自己的发布时间、授权与覆盖范围。',input:'证券代码、时间范围、来源权限或供应商密钥。',output:'来源返回的记录；有的结构化，有的只有摘要、链接或 HTML。',boundary:'注册了来源适配器，不等于当前账户拥有权限，也不等于所有接口都能稳定返回。',code:['providers/catalogue.py','providers/base.py']},
    providers:{label:'接入契约 / ROUTING',title:'按能力找来源，保留失败原因。',body:'DataRouter.ask 按能力目录顺序尝试来源，并记录拒绝或失败。注册机制支持内置来源、ALPHADESK_PLUGINS 模块和 Python entry points。图表用 vendor_for 锁定同一来源，保持一条历史序列的口径。',input:'需要的能力、调用参数、用户已连接的来源。',output:'供应商适配后的结果，以及可用性或失败信息。',boundary:'不同来源的字段、时效与权限可能不等价；SEC 的部分接入绕过这一层，不能把架构图当作严格调用图。',code:['providers/base.py','providers/registry.py','providers/catalogue.py']},
    ingest:{label:'数据整理 / INGEST',title:'把外部记录变成可用材料。',body:'新闻适配后按规范化 URL 合并重复转供，保留 feeds；财务模块映射 XBRL 标签，并处理累计值与季度值。处理规则依赖具体领域，不能靠统一字段名消除差异。',input:'供应商文章、申报原文、XBRL facts 和事件记录。',output:'适合检索、阅读、展示和进一步计算的数据结构。',boundary:'URL 去重不是事件聚类。财务累计值转季度的代码已审阅，但本次 SEC 按用户选择不联网。',code:['ingest/news.py','ingest/edgar_financials.py']},
    ledger:{label:'存储与隔离 / STORAGE',title:'缓存什么、共享什么，是业务问题。',body:'ledger 处理数据库、缓存和用户数据。默认 SQLite WAL，也支持 PostgreSQL 的薄适配层。公共记录可共享，用户新闻、账户和供应商密钥需要按身份处理；密钥通过 vault 管理。',input:'规范化记录、缓存键、用户身份、配置与凭据。',output:'可重复读取的材料、用户状态和缓存结果。',boundary:'缓存存在不代表结果最新。不同来源的许可、用户归属和撤销后的处理，都要沿代码逐一检查。',code:['ledger/store.py','ledger/db.py','ledger/vault.py']},
    desk:{label:'研究处理 / RESEARCH',title:'把问题拆成能计算的证据。',body:'desk 将行情和事件组合起来：异动分析计算价格与成交量变化，再对齐附近材料；pricedin 提供历史财报响应与事前涨跌参照。semantic 则用标题向量补充关键词检索。',input:'证券与窗口、价格序列、新闻公告，或检索问题。',output:'变化指标、时间附近材料、检索入选的文章。',boundary:'这不是因果识别或收益预测。向量检索不生成摘要；当前公共运行关闭了模型。',code:['desk/moves.py','desk/pricedin.py','semantic.py']},
    web:{label:'人的入口 / WEB',title:'把材料组织为可探索的界面。',body:'FastAPI 提供 HTTP 接口，React 页面用共享查询缓存加载数据。看板组织多个模块，阅读器展示正文或摘要；图表将时间与价格映射为坐标，并批量生成 SVG 路径。',input:'用户查询参数、HTTP 返回、图表与布局状态。',output:'行情图、市场研究板、阅读器和公司等页面。',boundary:'漂亮的图表不证明数据完整；前端刷新与后台采集频率不同。部分图表返回尚缺来源字段。',code:['app/dashboard.py','ui/src/lib/queries.ts','ui/src/components/chart/ChartCanvas.tsx']},
    mcp:{label:'AI 的入口 / MCP',title:'同一套材料，交给外部 AI 调用。',body:'53 个工具把研究问题封装成可调用函数，复用 ingest / desk 等业务逻辑。外部 AI 可据此取结构化材料，再组织自己的推理；工具名与说明帮助客户端选择调用。',input:'工具名、经过参数校验的请求和身份令牌。',output:'带业务字段的结构化结果，或可用性与错误状态。',boundary:'53 个工具不是 53 个 Agent。只读工具标注不意味着整个应用没有账户或布局写操作。已验证临时令牌调用与撤销，未验证完整外部 OAuth。',code:['mcp_server.py','app/agent_oauth.py','identity.py']}
  };
  function showNode(key) {
    const n = nodes[key]; select('node', key);
    $('#archDetail').innerHTML = `<p class="eyebrow">${esc(n.label)}</p><h3>${esc(n.title)}</h3><p>${esc(n.body)}</p><p class="detail-label">INPUT → OUTPUT</p><p><strong>输入：</strong>${esc(n.input)}<br><strong>输出：</strong>${esc(n.output)}</p><p class="detail-label">READ THE CODE</p>${n.code.map(p=>codeLink(p)).join('')}<div class="boundary">${esc(n.boundary)}</div>`;
  }
  $$('[data-node]').forEach(b => b.addEventListener('click', () => showNode(b.dataset.node)));
  showNode('sources');

  const flows = {
    chart:{title:'一张 NVDA 图表，经过了什么？',intro:'真实数据已完成端到端验证：请求 → Yahoo 适配器 → 原版图表。',status:'已实测',kind:'green',steps:[['用户发出查询','标的 NVDA、范围 1M、周期 1d 形成查询参数与缓存 key。'],['锁定供应商','图表能力选择可用来源；vendor_for 固定供应商，避免历史分页跨源混拼。'],['统一 OHLCV','远端数组转成时间、开高低收、成交量等字段，保留实际覆盖情况。'],['投影与绘制','时间和价格映射到坐标，多根蜡烛合并到 SVG 路径，减少独立 DOM 节点。'],['交互与复用','缩放、平移和绘图依赖前端状态；不是每个动作都重新取全部历史。']],boundary:'本次取得 23 根日 K。数据不是交易所实时授权流；chart 返回本身未附供应商，由 capabilities 接口确认 yahoo。',code:['ui/src/lib/queries.ts','providers/registry.py','ui/src/components/chart/ChartCanvas.tsx']},
    news:{title:'每日新闻能体现，而且有完整的文章链路。',intro:'当前已读源码；商业新闻未配置密钥，公共模式不运行完整新闻后台循环。',status:'源码确认 · 待联网',kind:'blue',steps:[['按用户采集','正常配置默认每 5 分钟轮询，初始回看 72 小时；按用户已连接的来源取新闻。'],['统一文章结构','适配标题、时间、URL、来源、股票标签，以及供应商提供的正文或摘要。'],['按 URL 去重','规范化 URL 合并重复转供，保留多个 feed 标记；同一事件的不同 URL 仍是多篇文章。'],['存储与检索','记录按用户归属保存；关键词检索可结合可选标题向量，形成候选文章。'],['分页与阅读','页面刷新最新窗口、分页补齐；阅读器展示可获得的正文 / 摘要并提供原文入口。']],boundary:'它能作为新闻阅读台。要变成“每天有哪些新变化、影响哪些行业”的研究台，还需事件聚类、实体关联和新增事实比较。网页刷新不代表供应商已经更新。',code:['config.py','main.py','ingest/news.py','ui/src/pages/NewsPage.tsx']},
    semantic:{title:'模型在这里做“找相关材料”。',intro:'默认 Qwen3-Embedding-0.6B；当前公共运行关闭，尚未实测模型效果。',status:'源码确认 · 模型关闭',kind:'blue',steps:[['选择输入','对新闻标题和用户检索问题生成向量；不是把全部公告直接交给生成模型。'],['向量编码','Embedding 模型把文本变成数值向量，以便比较语义接近程度。'],['相似度筛选','用余弦相似度挑选候选，默认阈值 0.50；阈值不是新闻可信度。'],['合并与排序','与关键词结果合并，最终仍按发布时间排序；相似度决定是否入选。'],['降级与返回','模型不可用时退回词匹配。输出文章列表，不生成摘要、建议或价格解释。']],boundary:'语义相关、新闻重要、事实可信、投资有用是不同判断。中文教学页的词表匹配也不是这套向量模型。',code:['semantic.py','config.py','ingest/news.py']},
    moves:{title:'“为什么涨了”，先变成可检查的证据。',intro:'分析逻辑已读源码；完整依赖链未在当前公开模式验证。',status:'源码确认',kind:'blue',steps:[['取价格序列','先取得选定窗口内的交易数据，确定需要比较的日期与价格。'],['计算变化','算日涨跌、成交量相对参考值，并筛选达到阈值的交易时段。'],['取附近材料','查新闻、公告等证据；缺少来源时明确缺失，不能凭空补解释。'],['按时段对齐','把发布时间和交易时段对应，注意盘后消息与下一交易日的关系。'],['交付研究线索','返回变化和附近材料，供人进一步核验；pricedin 另提供历史财报反应参照。']],boundary:'时间对齐不证明因果，priced_in 名称不代表证明“已充分定价”。样本整体成交量参考值不能未经修改用于宣称无未来信息的历史回测。',code:['desk/moves.py','desk/pricedin.py']}
  };
  function showFlow(key) {
    const f=flows[key]; select('flow',key);
    $('#flowPanel').innerHTML=`<div class="flow-heading"><div><h3>${esc(f.title)}</h3><p>${esc(f.intro)}</p></div><span class="tag ${f.kind}">${esc(f.status)}</span></div><div class="flow-steps">${f.steps.map((s,i)=>`<article class="flow-step"><b>0${i+1}</b><h4>${esc(s[0])}</h4><p>${esc(s[1])}</p></article>`).join('')}</div><div class="flow-bottom"><p><strong>把边界也读出来</strong>${esc(f.boundary)}</p><div class="flow-code">${f.code.map(p=>codeLink(p,'')).join('')}</div></div>`;
  }
  $$('[data-flow]').forEach(b=>b.addEventListener('click',()=>showFlow(b.dataset.flow)));
  $$('[data-open-flow]').forEach(a=>a.addEventListener('click',()=>showFlow(a.dataset.openFlow)));
  showFlow('chart');

  const shots={
    chart:{file:'real-chart.jpg',label:'真实数据 · 原版图表',kind:'真实来源 · 本机验证',title:'NVDA 一个月日 K',text:'Yahoo 适配器取得 23 根日 K，原版 SVG 图表完成绘制。日期覆盖 2026-09-21 至 10-21，通过 capabilities 接口确认使用 yahoo。'},
    markets:{file:'real-markets.jpg',label:'真实数据 · 原版市场看板',kind:'真实来源 · 本机验证',title:'同一标的的图表与报价',text:'截图展示原版 Markets 中的 NVDA 图表与 Equity overview 报价。看板还配置了 Treasury yields，但国债模块未入镜；12 个期限的接口结果见实测报告。'},
    calendars:{file:'real-calendars.jpg',label:'真实数据 · 原版事件日历',kind:'真实来源 · 本机验证',title:'政府事件与未接通模块的状态',text:'截图下方展示 Government Actions 表格，上方保留经济日历缺少密钥的提示。政府接口共 40 条、IPO 当周 2 条属于接口实测结果；IPO 未入镜，不将其当作截图内容。'},
    lab:{file:'mcp-lab.jpg',label:'教学样例 · 中文 MCP 实验室',kind:'虚构返回 · 真实接口定义',title:'可操作的工具学习环境',text:'53 个工具定义来自上游源码，参数和调用 JSON 可查看与体验；这里返回的是中文教学样例，不是外部真实数据。实际 MCP 联网验证另见公开数据报告。'}
  };
  let currentShot='chart';
  function showShot(key){const s=shots[key];currentShot=key;select('shot',key);$('#runShot').src=`media/${s.file}`;$('#runShot').alt=`${s.label}：${s.title}，本次运行截图`;$('#shotLabel').textContent=s.label;$('#shotKind').textContent=s.kind;$('#shotTitle').textContent=s.title;$('#shotText').textContent=s.text;}
  $$('[data-shot]').forEach(b=>b.addEventListener('click',()=>showShot(b.dataset.shot)));
  $('#zoomShot').addEventListener('click',()=>{const s=shots[currentShot];$('#largeShot').src=`media/${s.file}`;$('#largeShot').alt=`${s.label}：${s.title}`;$('#largeCaption').textContent=`${s.label} / ${s.title} · 历史截图，不是实时数据`;$('#shotDialog').showModal();});
  if(report){
    $('#checkedAt').textContent=new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(report.checked_at))+'（北京时间）';
    $('#checkedAt').dateTime=report.checked_at;
    const labels={chart:['NVDA 日 K','根'],treasury:['国债期限','个'],government:['政府事件','条'],halts:['停牌记录（含历史）','条'],ipos:['IPO 当周记录','条']};
    $('#checkResults').innerHTML=Object.entries(labels).map(([name,[label,unit]])=>{const r=report.checks.find(c=>c.name===name);return `<div class="check-row"><span>${label}</span><strong>${r?.records??'—'} ${unit}</strong></div>`;}).join('');
  }
  const states={
    'SEC EDGAR':['amber','按用户选择暂不接入','财务与公告实现已审阅，未进行 SEC 在线验证。'],
    'US Treasury':['green','收益率已实测','12 个期限；拍卖查询为空，完整性未验证。'],
    'Federal Register':['green','政府事件已实测','与 Fed 合计返回 40 条；保留原文来源。'],
    'Federal Reserve':['green','政府事件已实测','Fed RSS 按条数返回，不严格应用 days 时间过滤。'],
    'Yahoo Finance':['green','图表 / 报价已实测','23 根日 K；公开采集，非交易所实时授权流。'],
    'Nasdaq / Nasdaq Trader':['green','IPO / 停牌已实测','IPO 2 条、停牌 39 条；分红超时，拆股未取得记录。'],
    'Social mirror':['blue','未验证在线连接','特定账号的第三方镜像，不是通用社交搜索。']
  };
  function showSources(kind){select('source',kind);$('#sourceRows').innerHTML=catalog.providers.filter(p=>kind==='all'||p.kind===kind).map(p=>{const s=states[p.name]??['amber','未配置供应商凭据','实际覆盖以账户权限与套餐为准。'];return `<tr><td>${esc(p.name)}<small>${esc(p.transport)}</small></td><td>${esc(p.coverage)}</td><td>${esc(p.access)}</td><td><span class="tag ${s[0]}">${esc(s[1])}</span><small>${esc(s[2])}</small></td></tr>`;}).join('');}
  $$('[data-source]').forEach(b=>b.addEventListener('click',()=>showSources(b.dataset.source)));showSources('all');

  [...new Set(catalog.tools.map(t=>t.group))].forEach(g=>{const o=document.createElement('option');o.value=g;o.textContent=g;$('#toolGroup').append(o);});
  function showTools(){const q=$('#toolSearch').value.trim().toLocaleLowerCase(),g=$('#toolGroup').value;const tools=catalog.tools.filter(t=>(g==='all'||g===t.group)&&`${t.name} ${t.title} ${t.summary} ${t.group}`.toLocaleLowerCase().includes(q));$('#toolCount').textContent=`${tools.length} / ${catalog.tools.length} 项`;$('#toolList').innerHTML=tools.length?tools.map(t=>`<details class="tool-item"><summary><strong><code>${esc(t.name)}</code>${esc(t.title)}</strong><span>${esc(t.group)} · ${t.params.length} 个参数</span></summary><div class="tool-detail"><p>${esc(t.summary)}</p><ul>${t.params.length?t.params.map(p=>`<li>${esc(p.name)}: ${esc(p.type)} · ${p.required?'必填':`可选，默认 ${esc(JSON.stringify(p.default))}`}</li>`).join(''):'<li>无输入参数</li>'}</ul><a href="${esc(t.source)}" target="_blank" rel="noreferrer">源码 L${t.line} ↗</a><a href="lab.html#mcp">进入教学调用实验室 →</a></div></details>`).join(''):'<p class="empty">没有匹配的工具。试试“新闻”“行情”或英文工具名。</p>';}
  $('#toolSearch').addEventListener('input',showTools);$('#toolGroup').addEventListener('change',showTools);showTools();

  const chapters=[
    ['能力地图','说清每项输入、输出与前置依赖，区分“存在实现”和“本机已验证”。','mcp_server.py'],
    ['行情纵向链路','从页面按钮追到远端数据再回到 SVG，解释每个转换与缓存位置。','ui/src/components/chart/ChartCanvas.tsx'],
    ['新闻生命周期','追踪采集、URL 去重、用户归属、分页与阅读，证明它没有自动做事件聚类。','ingest/news.py'],
    ['分析逻辑与口径','给异动对照和累计转季度各写一个手算例子，说明缺失与失败边界。','ingest/edgar_financials.py'],
    ['双输出与权限','比较同一问题的 HTTP / MCP 返回，核对来源、时间、缺失与撤销权限。','app/dashboard.py'],
    ['迁移练习与判断','画出 A 股 / 每日资讯研究台，标出可复用、需改契约与需重建的规则。','providers/base.py']
  ];
  const progressKey='alphadesk-research-chapters-v1';let completed=[];
  try{const saved=JSON.parse(localStorage.getItem(progressKey)||'[]');if(Array.isArray(saved))completed=[...new Set(saved.filter(x=>Number.isInteger(x)&&x>=0&&x<chapters.length))];}catch{/* Storage unavailable: retain an in-memory checklist. */}
  $('#studyChapters').innerHTML=chapters.map((c,i)=>`<div class="chapter ${completed.includes(i)?'done':''}"><input type="checkbox" id="chapter-${i}" data-chapter="${i}" ${completed.includes(i)?'checked':''}><div><label for="chapter-${i}"><span>0${i+1}</span>${esc(c[0])}</label><p>${esc(c[1])}</p>${codeLink(c[2],'')}</div></div>`).join('');
  function updateProgress(){$('#studyProgress').textContent=`${completed.length} / 6 章已完成`;$('#studyBar').value=completed.length;}
  $$('[data-chapter]').forEach(el=>el.addEventListener('change',()=>{const i=Number(el.dataset.chapter);completed=completed.filter(x=>x!==i);if(el.checked)completed.push(i);el.closest('.chapter').classList.toggle('done',el.checked);try{localStorage.setItem(progressKey,JSON.stringify(completed));}catch{}updateProgress();}));updateProgress();
  // Old links into the teaching app continue to resolve to the preserved lab.
  const oldViews=new Set(['markets','chart','sectors','baskets','portfolio','analysis','profile','news','filings','earnings','calendars','options','catalysts','mcp','gallery','evidence']);
  if(oldViews.has(location.hash.slice(1)))location.replace(`lab.html${location.hash}`);
  const observed=$$('.topbar nav a').map(a=>({a,section:$(a.getAttribute('href'))}));
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){observed.forEach(({a,section})=>a.classList.toggle('active',section===e.target));}});},{rootMargin:'-15% 0px -60% 0px'});observed.forEach(({section})=>observer.observe(section));}
})();
