(() => {
  'use strict';
  const data = window.RESEARCH;
  const main = document.getElementById('main');
  const dialog = document.getElementById('detail');
  const roleMap = new Map(data.roles.map(r => [r.id, r]));
  const skillMap = new Map(data.skills.map(s => [s.id, s]));
  const state = {page: 'overview', role: 'all', mode: 'featured', query: '', limit: 24, template: 'T00'};
  const drafts = new Map();
  let toastTimer;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const copyIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/></svg>';
  const searchIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>';
  const external = (url, label) => `<a class="source-link" href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)} ↗</a>`;

  function toast(message) {
    const el = document.getElementById('toast');
    el.textContent = message;
    el.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('visible'), 2800);
  }

  async function copy(text, field) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const input = document.createElement('textarea');
        input.value = text;
        input.setAttribute('aria-label', '待复制内容');
        input.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0';
        // A modal dialog makes outside controls inert: keep the fallback inside it.
        (dialog.open ? dialog : document.body).appendChild(input);
        input.focus(); input.select();
        const success = document.execCommand('copy');
        input.remove();
        if (!success) throw new Error('Clipboard unavailable');
      }
      toast('已复制需求内容，可粘贴后替换方括号');
    } catch {
      if (field) {
        field.focus(); field.select();
        toast('浏览器未允许自动复制，内容已选中，请按 Ctrl+C 或长按复制');
      } else {
        openManualCopy(text);
      }
    }
  }

  function openManualCopy(text) {
    document.getElementById('detail-body').innerHTML = `<header class="dialog-header"><h2 id="detail-title">复制需求内容</h2><button class="close-dialog" data-close aria-label="关闭">×</button></header><div class="dialog-main"><p class="micro-note">浏览器未允许自动复制。请选中下面的文本，按 Ctrl+C 或长按复制。</p><textarea class="prompt-editor" id="manual-copy" aria-label="待手动复制的内容">${escape(text)}</textarea></div>`;
    if (!dialog.open) dialog.showModal();
    const field = document.getElementById('manual-copy');
    field.focus(); field.select();
  }

  function hash(scene) {
    const params = new URLSearchParams();
    if (state.page === 'explore') {
      if (state.role !== 'all') params.set('role', state.role);
      if (state.mode !== 'featured') params.set('mode', state.mode);
      if (state.query) params.set('q', state.query);
      if (scene) params.set('scene', scene);
    }
    if (state.page === 'templates' && state.template !== 'T00') params.set('template', state.template);
    return '#' + state.page + (params.size ? '?' + params.toString() : '');
  }

  function saveHash(scene) { history.replaceState(null, '', hash(scene)); }

  function roleButtons() {
    let group = '';
    return `<button class="role-button" data-role="all" aria-pressed="${state.role === 'all'}"><span class="dot"></span>全部角色与能力<span class="count">181</span></button>` + data.roles.map(r => {
      const heading = group !== r.group ? `<div class="role-group">${escape(r.group)}</div>` : '';
      group = r.group;
      return heading + `<button class="role-button" data-role="${r.id}" aria-pressed="${state.role === r.id}"><span class="dot"></span>${escape(r.title)}<span class="count">${r.count}</span></button>`;
    }).join('');
  }

  function explore() {
    main.innerHTML = `<section class="hero"><div><div class="eyebrow">FROM INTENT TO WORKFLOW</div><h1>从一句需求，<br>走向<em>可执行的工作流。</em></h1><p>借鉴成熟的岗位方法，想清楚需要什么、怎样做、如何检查。<br>选择一个角色或业务场景，把工作经验带进下一次需求。</p></div><div class="hero-meta"><div class="stat-row"><div class="stat"><strong>17</strong><span>角色与能力</span></div><div class="stat"><strong>181</strong><span>业务与知识入口</span></div><div class="stat"><strong>14</strong><span>约束类型</span></div></div><span class="meta-note">固定版本源码研究<br>非业务实测结论</span></div></section>
      <div class="workspace"><aside class="sidebar" aria-label="按角色筛选"><div class="sidebar-head">选择角色<span>ROLE INDEX</span></div><div id="role-list">${roleButtons()}</div><div class="sidebar-note">先找相近的工作，<br>再看步骤与完成标准。<br><a href="#templates">从通用任务卡开始 ↗</a></div></aside>
      <section class="content" aria-label="业务场景"><div class="content-top"><div><h2 class="section-title">场景工作台</h2><p class="section-caption">发现方法 · 明确边界 · 组织需求</p></div><label class="search-box">${searchIcon}<input id="search" type="search" aria-label="搜索角色、场景或关键词" placeholder="搜索场景、交付物、关键词…" value="${escape(state.query)}"><button class="clear-search" data-clear aria-label="清空搜索">×</button></label></div>
      <div class="mobile-role"><label for="role-select">按角色查阅</label><select id="role-select"><option value="all">全部角色与能力 · 181</option>${data.roles.map(r => `<option value="${r.id}" ${r.id === state.role ? 'selected' : ''}>${escape(r.title)} · ${r.count}</option>`).join('')}</select></div>
      <div class="toolbar"><div class="segmented" aria-label="内容范围"><button data-mode="featured" aria-pressed="${state.mode === 'featured'}">深入流程 <span>17</span></button><button data-mode="all" aria-pressed="${state.mode === 'all'}">全部入口 <span>181</span></button></div><span class="result-count" id="result-count" role="status" aria-live="polite"></span></div><div id="role-context"></div><div class="cards" id="cards"></div><div id="pagination"></div><p class="browse-note"><span>i</span> 深入流程包含输入、步骤、三层控制、异常、审批、验收与价值比较；索引入口提供中文用途和上游证据，尚未逐项深读。</p></section></div>`;
    renderCards();
  }

  function filteredSkills() {
    const words = state.query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return data.skills.filter(s => {
      if (state.role !== 'all' && s.role !== state.role) return false;
      if (state.mode === 'featured' && !s.workflow) return false;
      const role = roleMap.get(s.role);
      const haystack = [s.title, s.name, s.description, role.title, role.summary, role.business,
        s.workflow ? JSON.stringify(s.workflow) : ''].join(' ').toLowerCase();
      return words.every(word => haystack.includes(word));
    }).sort((a,b) => Number(Boolean(b.workflow)) - Number(Boolean(a.workflow)));
  }

  function renderCards() {
    const items = filteredSkills();
    const role = roleMap.get(state.role);
    document.getElementById('result-count').textContent = `${items.length} 个结果${state.query ? ' · 搜索中' : ''}`;
    document.getElementById('role-context').innerHTML = role ? `<div class="role-context"><strong>${escape(role.title)} · ${escape(role.business)}</strong><p>常见输入：${escape(role.input)}<br>典型交付：${escape(role.output)}</p></div>` : '';
    document.getElementById('cards').innerHTML = items.length ? items.slice(0,state.limit).map(s => {
      const r = roleMap.get(s.role), w = s.workflow;
      return `<article class="scenario-card"><div class="card-meta"><span class="role-tag">${escape(r.title)}</span><span class="badge ${w ? '' : 'index'}">${w ? '流程已解析' : s.internal ? '内部知识 · 索引' : '场景索引'}</span></div><button class="card-title" data-detail="${s.id}" aria-label="查看${escape(s.title)}详情">${escape(s.title)}</button><p class="card-description">${escape(w ? w.input : `${r.summary}。围绕「${s.title}」查阅上游方法，组织自己的任务。`)}</p>${w ? '<div class="mini-flow"><span>输入</span><i>→</i><span>执行步骤</span><i>→</i><span>约束</span><i>→</i><span>交付</span></div>' : `<div class="mini-flow"><span>${escape(s.name)}</span></div>`}<div class="card-actions"><button class="text-button" data-detail="${s.id}">${w ? '查看工作流' : '查看入口'} <span aria-hidden="true">↗</span></button><button class="text-button" data-copy-skill="${s.id}">${copyIcon}复制需求</button></div></article>`;
    }).join('') : `<div class="empty"><h3>暂时没有匹配的场景</h3><p>试试“合同”“看板”“复盘”，或清除角色和搜索条件。</p><button class="primary-button" data-reset>查看全部入口</button></div>`;
    document.getElementById('pagination').innerHTML = items.length > state.limit ? `<button class="load-more" data-more>再显示 ${Math.min(24,items.length-state.limit)} 个 · 还有 ${items.length-state.limit} 个入口</button>` : '';
    document.querySelectorAll('[data-mode]').forEach(el => el.setAttribute('aria-pressed', el.dataset.mode === state.mode));
    const clear = document.querySelector('[data-clear]');
    clear.hidden = !state.query;
  }

  function setRole(role) {
    state.role = roleMap.has(role) ? role : 'all';
    state.mode = state.role === 'all' ? 'featured' : 'all';
    state.limit = 24;
    saveHash(); explore();
  }

  function businessDetail(a) {
    const list = items => `<ul class="business-list">${items.map(item => `<li>${escape(item)}</li>`).join('')}</ul>`;
    const fold = (title, body, open='') => `<details class="business-fold" ${open}><summary>${title}</summary><div>${body}</div></details>`;
    return `<section class="detail-section business-detail"><h3><span>06</span>业务落地分析</h3>
      <p class="business-case">${escape(a.case)}</p>
      <p class="micro-note">上游要求与研究建议分别标示。下列系统设计、异常方案与验收用例尚未运行，不代表插件已实现。</p>
      ${fold('输入检查 · 研究建议', list(a.input_checks))}
      ${fold('控制边界 · 提示词 / 程序 / 系统', `<div class="control-stack">
        <article><span class="control-label">提示词约束 · 上游要求</span><p>${escape(a.controls.prompt)}</p></article>
        <article><span class="control-label">程序与工具 · 静态证据</span><p>${escape(a.controls.program)}</p></article>
        <article class="system-control"><span class="control-label">系统强制控制 · 建议补齐，未验证</span><p>${escape(a.controls.system)}</p></article>
        </div>`, 'open')}
      ${fold('异常处理 · 触发条件与应对', `<p class="micro-note">根据上游规则组织的落地建议，未执行故障演练。</p><dl class="exception-list">${a.exceptions.map(([trigger,action])=>`<dt>${escape(trigger)}</dt><dd>${escape(action)}</dd>`).join('')}</dl>`)}
      ${fold('人工审批 · 上游规定与建议安排', `<p><strong>上游规定：</strong>${escape(a.approval.upstream)}</p><p><strong>建议安排：</strong>${escape(a.approval.recommended)}</p>`)}
      ${fold('验收标准 · 待执行用例', list(a.acceptance))}
      ${fold('相比直接对话的价值 · 待验证', `<dl class="exception-list">
        <dt>直接对话基线</dt><dd>${escape(a.value.baseline)}</dd>
        <dt>可复用增量</dt><dd>${escape(a.value.increment)}</dd>
        <dt>成立条件与局限</dt><dd>${escape(a.value.limit)}</dd>
        <dt>建议衡量</dt><dd>${escape(a.value.metric)}</dd></dl>`)}
      <p class="micro-note">以上输入检查、异常处理和验收要求已加入下方需求草稿，可以一起编辑复制。</p></section>`;
  }

  function detail(id) {
    const s = skillMap.get(id);
    if (!s) return;
    const role = roleMap.get(s.role), w = s.workflow;
    saveHash(id);
    const section = (n,title,body) => `<section class="detail-section"><h3><span>${n}</span>${title}</h3>${body}</section>`;
    document.getElementById('detail-body').innerHTML = `<header class="dialog-header"><div><div class="eyebrow">${escape(role.title)} / ${w ? w.id + ' · 深入流程' : '场景索引'}</div><h2 id="detail-title">${escape(s.title)}</h2></div><button class="close-dialog" data-close aria-label="关闭详情">×</button></header><div class="dialog-main">
      <div class="detail-intro">${w ? '执行顺序与交付由上游定义归纳；新增业务分析区分提示词、程序和系统控制。参考验收与系统设计是研究建议，业务效果尚未实测。' : '这个入口已收录中文用途与上游证据，尚未逐项深入分析。下方为角色背景与通用需求草稿，请按实际任务补充执行与验收标准。'}</div>
      ${w ? section('01','触发与输入',`<p>${escape(w.input)}</p>`) + section('02','执行流程',`<ol class="steps">${w.steps.map(step => `<li>${escape(step)}</li>`).join('')}</ol>`) + `<section class="detail-section accent"><h3><span>03</span>约束与边界</h3><p>${escape(w.constraints)}</p></section>` + section('04','交付标准',`<p>${escape(w.output)}</p>`) + section('05','降级与参考验收',`<p>${escape(w.validation)}</p>`) : section('01','适用角色与业务',`<p>${escape(role.audience)}；${escape(role.business)}。</p>`) + section('02','角色常用资料与交付',`<p>输入：${escape(role.input)}。<br>交付：${escape(role.output)}。</p><p class="micro-note">这是角色层面的背景，不能当作此入口完整的流程定义。</p>`) + section('03','上游用途说明',`<details open><summary>英文原文 · ${escape(s.name)}</summary><p>${escape(s.description)}</p></details>`) }
      ${w ? businessDetail(w.analysis) : ''}
      ${section(w ? '07' : '04','需求草稿 · 可编辑复制',`<p class="micro-note">本研究整理的参考模板；替换方括号后使用。编辑仅保留在当前页面中。</p><textarea class="prompt-editor" id="detail-prompt" aria-label="${escape(s.title)}需求草稿">${escape(drafts.get(s.id) ?? s.prompt)}</textarea><div class="editor-actions"><button class="primary-button" data-copy-field="detail-prompt">${copyIcon}复制这份需求</button><button class="secondary-button" data-reset-skill="${s.id}">恢复原始草稿</button></div>`)}
      ${section(w ? '08' : '05','来源与研究依据',`${external(s.source,s.name)}${w ? [...w.sources,...w.analysis.sources].filter(src => src.url !== s.source).map(src => external(src.url,src.label)).join('') : ''}<p class="micro-note">固定 Commit：${escape(data.commit.slice(0,7))} · 深化日期：${escape(data.analysisDate)} · 点击来源在新窗口查看。</p>`)}
      </div>`;
    document.getElementById('detail-prompt').addEventListener('input', e => drafts.set(s.id,e.target.value));
    if (!dialog.open) dialog.showModal();
  }

  function businessPage() {
    const flows = data.skills.filter(s=>s.workflow).sort((a,b)=>a.workflow.id.localeCompare(b.workflow.id));
    main.innerHTML = `<section class="page"><header class="page-head"><div class="eyebrow">FROM GUIDANCE TO ENFORCEMENT</div><h1>流程写清楚了，<br>谁来保证它真的执行？</h1><p>逐项分析 17 条具体业务：输入是否齐全，失败时怎么处理，谁批准什么，怎样才算完成。先分清控制责任，再判断插件的价值。</p></header>
      <div class="business-notice"><strong>研究边界</strong><p>${escape(data.analysisScope)} 本次没有验证任何真实系统的审批拦截。下方系统控制是设计建议，不能作为现有能力承诺。</p></div>
      <div class="layer-grid"><article><span class="code">01 / 指令层</span><h3>提示词约束</h3><p>“付款前先确认”“不要编造”规定模型应怎样做。遵守情况仍需核验，文字不能阻止越权接口调用。</p></article><article><span class="code">02 / 程序层</span><h3>可执行检查</h3><p>QC 脚本确实包含输入检查与过滤逻辑。已读源码不代表已运行；程序能计算，也不保证参数适合业务。</p></article><article><span class="code">03 / 系统层</span><h3>强制控制</h3><p>由服务端按身份、对象、版本和状态拒绝违规请求。MCP 配置、审批字段和工具名称不足以证明已生效。</p></article></div>
      <section class="comparison-panel"><h2>价值比较要有同等条件</h2><div class="comparison-grid"><article><span>A</span><h3>普通直接提问</h3><p>只说业务目标，观察模型自行补足流程的能力。</p></article><article><span>B</span><h3>完整流程直接对话</h3><p>提供相同输入、步骤、规则、工具与授权范围。</p></article><article><span>C</span><h3>通过插件加载流程</h3><p>用相同方法执行，评估触发、复用和维护的增量。</p></article></div><p>A 与 C 的差异包含需求是否完整；B 与 C 才更接近插件包装的增量。固定模型、数据与权限，比较配置时间、遗漏、返工、成本及动作偏离。这里没有量化收益实测。</p><details><summary>查看建议的验收方法</summary><p>每条业务覆盖正常、缺输入、冲突证据、工具不可用；有写入时增加权限拒绝、重复提交、超时和审批后内容变更。使用相同标准复核，预先确定样本和通过阈值。付款、过账等测试在沙箱中进行，越权与重复操作不能用平均效率收益抵销。</p></details></section>
      <div class="content-top"><div><h2 class="section-title">从具体业务看控制与价值</h2><p class="section-caption">点击进入完整流程，展开异常、审批、验收与价值分析。</p></div><a class="text-button" href="#explore">按角色筛选 ↗</a></div>
      <div class="business-grid">${flows.map(s=>{const a=s.workflow.analysis;return `<article class="business-card"><div class="card-meta"><span class="role-tag">${escape(roleMap.get(s.role).title)}</span><span class="code">${s.workflow.id}</span></div><h3><a href="#explore?scene=${encodeURIComponent(s.id)}">${escape(s.title)} ↗</a></h3><p>${escape(a.case)}</p><div class="business-value"><strong>潜在增量</strong><p>${escape(a.value.increment)}</p></div><a class="text-button" href="#explore?scene=${encodeURIComponent(s.id)}">查看控制、审批与验收 →</a></article>`;}).join('')}</div>
      <p class="browse-note"><span>i</span>全部 181 个入口仍可搜索；本轮深化仅覆盖这 17 个代表流程。<a href="${data.docs}/business-analysis.md" target="_blank" rel="noopener noreferrer">阅读完整研究文档 ↗</a></p></section>`;
  }

  function constraintsPage() {
    main.innerHTML = `<section class="page"><header class="page-head"><div class="eyebrow">GUARDRAILS THAT MAKE WORK CHECKABLE</div><h1>把“做好一点”，变成明确规则。</h1><p>从代表性工作流中提炼 14 类约束。它们适用于不同场景，不是每个插件都具备的统一保证。复制合适的约束，加入自己的需求。</p></header><div class="layer-grid"><article><h3>模型行为要求</h3><p>流程指令说明应怎样做，执行效果仍需检查。</p></article><article><h3>程序化检查</h3><p>脚本与工具执行具体检查，覆盖范围需核实。</p></article><article><h3>系统权限控制</h3><p>宿主、连接器和业务系统决定真正的操作边界。</p></article></div><div class="constraint-grid">${data.constraints.map(c => `<article class="constraint-card"><span class="code">${c.id}</span><h3>${escape(c.title)}</h3><p>${escape(c.evidence)}</p><blockquote>${escape(c.request)}</blockquote><button class="text-button" data-copy-constraint="${c.id}">${copyIcon}复制这条约束</button></article>`).join('')}</div><p class="browse-note"><span>i</span>销售与小企业插件的审批方式不同；公司阈值、SLA 与专业规范需要按实际场景确认。<a href="${data.docs}/constraints.md" target="_blank" rel="noopener noreferrer">阅读完整分析 ↗</a></p></section>`;
  }

  function templatesPage() {
    main.innerHTML = `<section class="page"><header class="page-head"><div class="eyebrow">A BETTER STARTING POINT</div><h1>把需求说清楚，从这里开始。</h1><p>一张通用任务卡，12 个可改写的场景模板。选择、编辑、复制，再把自己的背景、资料和完成标准补进去。</p></header><div class="template-layout"><nav class="template-list" aria-label="选择需求模板">${data.templates.map(t => `<button class="template-choice" data-template="${t.id}" aria-pressed="${t.id === state.template}"><span>${t.id}</span>${escape(t.title)}</button>`).join('')}</nav><section class="editor" id="template-editor" aria-label="模板编辑与复制"></section></div><section class="composition"><h2>一个目标，也可以借鉴多个岗位。</h2><div class="composition-grid"><article class="composition-card"><h3>客户续约率为什么下降？</h3><p>数据定位变化 → 客服归纳问题 → 销售核对账户 → 产品提炼机会。<br>关键约束：统一口径，区分关联与原因。</p></article><article class="composition-card"><h3>怎样准备一次功能发布？</h3><p>产品定义范围 → 设计梳理状态 → 研发准备部署 → 营销与客服备料。<br>关键约束：准备完成与实际发布分别记状态。</p></article><article class="composition-card"><h3>怎样系统研究开源项目？</h3><p>固定版本与许可证 → 梳理场景 → 追踪实现 → 验证代表任务 → 记录结论。<br>关键约束：区分源码事实与实测结果。</p></article></div></section></section>`;
    renderTemplate();
  }

  function renderTemplate() {
    const t = data.templates.find(t => t.id === state.template) || data.templates[0];
    state.template = t.id;
    document.querySelectorAll('[data-template]').forEach(el => el.setAttribute('aria-pressed',el.dataset.template === t.id));
    document.getElementById('template-editor').innerHTML = `<div class="eyebrow">${t.id} / DEMAND TEMPLATE</div><h2>${escape(t.title)}</h2><p class="note">${escape(t.note)}</p><textarea id="template-prompt" class="prompt-editor" aria-label="${escape(t.title)}内容">${escape(drafts.get(t.id) ?? t.text)}</textarea><div class="editor-actions"><button class="primary-button" data-copy-field="template-prompt">${copyIcon}复制需求模板</button><button class="secondary-button" data-reset-template>恢复原始模板</button></div><p class="editor-hint">可以直接编辑。修改只保留在当前页面，刷新后恢复；复制后替换方括号即可使用。</p>`;
    document.getElementById('template-prompt').addEventListener('input', e => drafts.set(t.id,e.target.value));
  }

  function aboutPage() {
    main.innerHTML = `<section class="page"><header class="page-head"><div class="eyebrow">READ THE EVIDENCE, KEEP THE BOUNDARIES</div><h1>一份可追溯的岗位工作流研究。</h1><p>研究 Anthropic Knowledge Work Plugins 如何组织角色、场景、流程与规则，作为以后提出需求和设计工作流的参考。</p></header><div class="about-grid"><article class="about-panel"><h2>这份研究覆盖什么</h2><p>17 个顶层插件、181 个 Skill 和 5 个独立命令文件。完整索引保留上游名称与用途，17 个代表性流程做了深入解析，并逐项区分提示词约束、程序证据与建议系统控制。</p><p>市场中的 5 个仓内合作伙伴和 101 个外部仓库入口仅登记来源，没有逐项审核。网页中的中文用途是研究归纳，不能当作真实系统的能力保证。</p><div class="evidence-row"><span>研究日期</span><strong>2026-10-20 · 深化 2026-10-21</strong></div><div class="evidence-row"><span>固定上游版本</span><code>${data.commit}</code></div><div class="evidence-row"><span>内容授权</span><a href="./UPSTREAM_LICENSE.txt">上游 Apache-2.0 许可证 ↗</a></div><div class="evidence-row"><span>研究文档</span><a href="${data.docs}" target="_blank" rel="noopener noreferrer">打开项目文档 ↗</a></div></article><article class="about-panel"><h2>怎样判断这些结论</h2><ul><li><strong>静态事实：</strong>源文件、配置与模板确实存在。</li><li><strong>预期行为：</strong>上游要求模型这样执行，未做业务实测。</li><li><strong>研究建议：</strong>本页的需求模板和参考验收。</li></ul><p>没有接入真实 CRM、邮箱、财务、人事或生产系统，也没有测量效率提升、准确率与成本。</p><h2>使用时注意</h2><p>命令名可能与旧 README 不一致；部分连接地址是占位；公司 SLA、阈值与审批规则要替换。看板模板的离线宣称和无障碍条款级别也有需要修正的地方。</p><a href="${data.docs}/notes.md" target="_blank" rel="noopener noreferrer">查看证据、局限与验证记录 ↗</a></article><article class="about-panel"><h2>它与直接沟通的关系</h2><p>插件将工作方法、工具和交付结构固化下来，减少重复交代。一次性简单任务可以直接对话；重复任务、多系统协作更适合沉淀流程。</p><p>可以用普通需求、详细流程直接对话、插件三组对比，记录事实错误、遗漏、补充次数和返工成本，再判断是否值得固化。</p></article><article class="about-panel"><h2>网页使用说明</h2><p>选择角色或输入关键词，查阅场景；打开详情阅读流程与约束。模板可以编辑后复制，浏览器拒绝自动复制时会提供手动选择。</p><p>页面资源随研究一起保存，可本地打开。所有筛选与编辑在浏览器中完成；主动打开来源链接时才访问外部网站。编辑内容不保存到服务器；实操演示的现场模式会调用同源本地服务，回放模式使用保存的响应快照。</p></article></div></section>`;
  }

  function overviewPage() {
    main.innerHTML = `<section class="page overview-page"><header class="page-head"><div class="eyebrow">THE WHOLE PICTURE</div><h1>Claude 的岗位插件与业务 Skill 集合。</h1><p>按岗位和具体业务场景组织工作方法，让 Claude 匹配任务、加载 Skill 并调用已授权工具。对我们的价值，是复用业务 SOP，改进需求、异常处理和交付验收。</p></header><div class="overview-actions"><a class="primary-button" href="./capability-map.png" target="_blank" rel="noopener noreferrer">查看高清 PNG ↗</a><a class="secondary-button" href="./capability-map.svg" target="_blank" rel="noopener noreferrer">打开矢量 SVG ↗</a><a class="text-button" href="#demo">继续看工单实操 →</a></div><a class="overview-image" href="./capability-map.png" target="_blank" rel="noopener noreferrer" aria-label="打开能力全景图高清原图"><img src="./capability-map.svg" width="2000" height="3140" alt="Knowledge Work Plugins 全景：插件包装岗位能力，Skill 提供业务 SOP，Claude 配合工具执行。列出17类角色及场景，以白屏工单展示P1/P3分流、审批版本与去重，区分上游文字要求和本研究的本地程序。"></a><p class="browse-note"><span>i</span>固定版本 a266ab8；岗位不等于权限，演示客户为虚构，Claude 调用未成功。181 项细目请在场景探索中查阅。</p></section>`;
  }

  function route() {
    const [page,raw=''] = location.hash.slice(1).split('?');
    const params = new URLSearchParams(raw);
    state.page = ['overview','explore','demo','business','constraints','templates','about'].includes(page) ? page : 'overview';
    state.role = roleMap.has(params.get('role')) ? params.get('role') : 'all';
    state.mode = params.get('mode') === 'all' ? 'all' : 'featured';
    state.query = params.get('q') || '';
    state.template = data.templates.some(t => t.id === params.get('template')) ? params.get('template') : 'T00';
    state.limit = 24;
    if (dialog.open) dialog.close();
    document.querySelectorAll('[data-page]').forEach(a => {
      if (a.dataset.page === state.page) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
    });
    ({overview:overviewPage, explore, demo:()=>window.TICKET_DEMO.mount(main), business:businessPage, constraints:constraintsPage, templates:templatesPage, about:aboutPage})[state.page]();
    if (state.page === 'explore' && params.has('scene')) detail(params.get('scene'));
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-demo-action') || button.hasAttribute('data-demo-replay-index')) return;
    const d = button.dataset;
    if ('close' in d) dialog.close();
    if ('role' in d) setRole(d.role);
    if ('mode' in d) { state.mode=d.mode;state.limit=24;saveHash();renderCards(); }
    if ('detail' in d) detail(d.detail);
    if ('copySkill' in d) { const s=skillMap.get(d.copySkill);copy(drafts.get(s.id) ?? s.prompt); }
    if ('copyField' in d) { const field=document.getElementById(d.copyField);copy(field.value,field); }
    if ('copyConstraint' in d) copy(data.constraints.find(c=>c.id===d.copyConstraint).request);
    if ('clear' in d) { state.query='';state.limit=24;document.getElementById('search').value='';saveHash();renderCards();document.getElementById('search').focus(); }
    if ('reset' in d) { state.role='all';state.mode='all';state.query='';saveHash();explore(); }
    if ('more' in d) { state.limit+=24;renderCards(); }
    if ('template' in d) { state.template=d.template;saveHash();renderTemplate(); }
    if ('resetTemplate' in d) { drafts.delete(state.template);renderTemplate();toast('已恢复原始模板'); }
    if ('resetSkill' in d) { drafts.delete(d.resetSkill);document.getElementById('detail-prompt').value=skillMap.get(d.resetSkill).prompt;toast('已恢复原始草稿'); }
  });
  document.addEventListener('input', event => {
    if (event.target.id === 'search') { state.query=event.target.value;state.mode='all';state.limit=24;saveHash();renderCards(); }
  });
  document.addEventListener('change', event => { if(event.target.id==='role-select') setRole(event.target.value); });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) {
      const rect=dialog.getBoundingClientRect();
      if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom) dialog.close();
    }
  });
  dialog.addEventListener('close', () => saveHash());
  window.addEventListener('hashchange',route);
  route();
})();
