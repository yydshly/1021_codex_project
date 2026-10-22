(function () {
  'use strict';
  const E = window.EmotionDirection, rows = window.SHOTS || [], cases = window.CASE_LIBRARY?.cases || [];
  if (!E || !document.querySelector('#direct')) return;
  const $ = s => document.querySelector(s);
  const form = $('#direction-form'), input = $('#direction-plan'), reviewForm = $('#direction-review-form');
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const sessionKey = 'melies-emotion-action-session-v2', reviewKey = 'melies-emotion-action-feedback-v1';
  let pack = null, reviews = [], reviewToggle = null;
  const brief = () => E.normalizeBrief(Object.fromEntries(new FormData(form)));
  function status(message, error = false) { $('#direction-status').textContent = message; $('#direction-status').classList.toggle('is-error', error); }
  function fill(b) { for (const [key, value] of Object.entries(b)) if (form.elements.namedItem(key)) form.elements.namedItem(key).value = value; }
  function saveSession() {
    try { localStorage.setItem(sessionKey, JSON.stringify({brief: brief(), planText: input.value.slice(0, 500000)})); }
    catch (_) { status('本机暂时无法保存输入草稿，仍可复制和下载当前内容。'); }
  }
  function invalidate(message) {
    pack = null; $('#direction-review').hidden = true;
    $('#direction-output-state').textContent = '等待当前目标的方案';
    $('#direction-result').innerHTML = `<p class="studio-empty">${esc(message || '目标或输入稿已变化。请让助手按当前简报设计，导入后重新检查。')}</p>`;
  }
  function download(name, value, mime = 'application/json;charset=utf-8') {
    const url = URL.createObjectURL(new Blob([value], {type: mime})), a = document.createElement('a');
    a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function copy(value, message) {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(value);
      else {
        const area = document.createElement('textarea'); area.value = value; area.style.position = 'fixed'; area.style.opacity = '0';
        document.body.appendChild(area); area.select(); const ok = document.execCommand('copy'); area.remove();
        if (!ok) throw new Error('copy failed');
      }
      status(message);
    } catch (_) { status('复制未成功，可下载文件后使用。', true); }
  }
  function pipelineOverview(plan) {
    if (plan.schemaVersion !== 3) return '<p class="direction-help">这是保留的原情绪与动作设计稿，上层方向与情境没有事后补写。可载入新题材查看完整流程。</p>';
    const d = plan.creativeDirection, s = plan.situation, r = plan.referenceSelection;
    const list = values => `<ul>${values.map(v => `<li>${esc(v)}</li>`).join('')}</ul>`;
    const reference = ref => {
      const item = ref.type === 'case' ? cases.find(c => c.id === ref.id) : rows.find(row => row.id === ref.id);
      const name = ref.type === 'case' ? item.title : item.name;
      const link = ref.type === 'case' ? `<a class="button" href="#experience-${esc(ref.id)}">看实际效果与复盘 ↓</a>` : `<button class="button" type="button" data-direction-ref="${esc(ref.id)}">看原站效果与原例 ↗</button>`;
      return `<article class="direction-selected-reference"><span class="direction-label">${ref.type === 'case' ? '实测案例' : '原站技巧'} · ${esc(ref.id)}</span><h5>${esc(name)}</h5><p><b>为何选择：</b>${esc(ref.reason)}</p><p><b>迁移逻辑：</b>${esc(ref.transfer)}</p><p><b>本次改写：</b>${esc(ref.adapt)}</p><p class="direction-help">证据边界：${esc(ref.boundary)}</p>${ref.type === 'technique' && item.promptNote ? `<p class="direction-help">来源提醒：${esc(item.promptNote)}</p>` : ''}${link}</article>`;
    };
    return `<nav class="direction-stage-nav" aria-label="方案层次"><a href="#direction-creative-direction">01 创作方向</a><a href="#direction-situation">02 情境与动作</a><a href="#direction-reference-selection">参考取舍</a><a href="#direction-shots">03 镜头表达与提示词</a></nav>
      <section class="direction-stage" id="direction-creative-direction"><span class="direction-label">01 / 创作方向</span><h4>为什么讲这个故事？</h4><dl><dt>面向谁 · 在哪里看</dt><dd>${esc(d.audience)} ${esc(d.viewingContext)}</dd><dt>表达命题</dt><dd>${esc(d.proposition)}</dd><dt>希望带来的回应</dt><dd>${esc(d.intendedResponse)}</dd></dl><div class="direction-option-grid">${d.options.map(o => `<article class="direction-option ${o.id === d.selectedOptionId ? 'is-selected' : ''}"><span class="direction-label">${o.id === d.selectedOptionId ? '本次选择' : '比较后未采用'}</span><h5>${esc(o.title)}</h5><p>${esc(o.promise)}</p><p class="direction-help">取舍：${esc(o.tradeoff)}</p></article>`).join('')}</div><p><b>选择理由：</b>${esc(d.selectionReason)}</p><details><summary>设计假设、检查目标与误读风险</summary><h5>暂定假设</h5>${list(d.assumptions)}<h5>制作后检查什么</h5>${list(d.successSignals)}<p><b>可能误读：</b>${esc(d.misreadRisk)}</p></details></section>
      <section class="direction-stage" id="direction-situation"><span class="direction-label">02 / 情境与动作</span><h4>让感受有发生的原因。</h4><dl><dt>谁 · 何时何地</dt><dd>${esc(s.who)} ${esc(s.whereWhen)}</dd><dt>初始处境</dt><dd>${esc(s.startingState)}</dd><dt>动机与触发</dt><dd>${esc(s.motivation)} ${esc(s.trigger)}</dd><dt>行动带来的结果</dt><dd>${esc(s.outcome)}</dd></dl><ol class="direction-causal-chain">${s.causalChain.map((b, i) => `<li><a href="#direction-shot-${esc(b.shotId)}">${String(i + 1).padStart(2, '0')} · ${esc(plan.shots[i].title)} ↓</a><p>${esc(b.event)}</p><p><b>状态变化：</b>${esc(b.change)}</p><p class="direction-help">表达意义：${esc(b.meaning)}</p></li>`).join('')}</ol><details><summary>跨镜连续性约束</summary>${list(s.continuityRules)}</details></section>
      <section class="direction-stage" id="direction-reference-selection"><span class="direction-label">参考取舍 / 来自目标与事件的需要</span><h4>为什么借用这些经验？</h4><div class="direction-reference-grid">${r.selected.map(reference).join('') || '<p>本次没有合适的库内参考，按新增设计检查。</p>'}</div><details><summary>没有采用的参考与现有缺口</summary>${r.rejected.map(ref => `<p><b>${esc(ref.id)}：</b>${esc(ref.reason)}</p>`).join('')}<h5>缺口与新增设计</h5>${list(r.gaps)}</details><p class="direction-help">上述是当前助手的设计取舍。相关案例的实际效果属于原题材，不是本方案已生成的证据。</p></section>`;
  }
  function renderCaseSources() {
    const lessons = {
      'rain-to-forest': '可参考意象如何表达不可见的感受；精确匹配和观众感受尚未验证。',
      'book-repair': '可参考角色区分与交还停顿；先核对作用位置、连接轴，再看镜头美术。局部返修不证明完整工艺正确。',
      'tea-moment': '可参考触碰、走停与节奏；人物停止、相机停止和跨镜状态要分别检查。',
      'bike-kindness': '可参考主动照料与支撑交接；擦拭次数、先接稳再松手、车旁行走须分别检查。'
    };
    $('#direction-case-sources').innerHTML = cases.map(c => {
      const media = c.latestResult || c.result;
      return `<article><a href="#experience-${esc(c.id)}"><img src="${esc(media.poster)}" alt="《${esc(c.title)}》实际视频封面" loading="lazy"><h4>《${esc(c.title)}》</h4></a><p>${esc(lessons[c.id] || c.review.summary)}</p><p class="direction-help">${esc(c.revisionSummary || c.review.summary)}</p><a class="text-link" href="#experience-${esc(c.id)}">看原片、实际输入与经验 ↓</a></article>`;
    }).join('');
  }
  function keyframeImage(frame, large = false) {
    return `<a href="${esc(frame.url)}" target="_blank" rel="noopener noreferrer" aria-label="打开${esc(frame.title)}原图"><img src="${esc(frame.url)}" alt="${esc(frame.alt)}" width="${frame.width}" height="${frame.height}" loading="${large ? 'lazy' : 'eager'}"></a>`;
  }
  function keyframeOverview(record) {
    if (!record) return '';
    const hasFilm = cases.some(c => c.id === 'tea-moment');
    return `<section class="direction-keyframes" id="direction-keyframes" aria-labelledby="direction-keyframes-title"><div class="eyebrow">GENERATED KEY IMAGES · STILL REFERENCES</div><h4 id="direction-keyframes-title">先看画面，再判断感受。</h4><p>${esc(record.summary)}</p><div class="direction-keyframe-grid">${record.frames.map((f, i) => `<figure>${keyframeImage(f)}<figcaption><a href="#direction-shot-${esc(f.shotId)}">${String(i + 1).padStart(2, '0')} · ${esc(f.title)} ↓</a><p>${esc(f.intent)}</p></figcaption></figure>`).join('')}</div><p class="direction-help">${hasFilm ? '这些是制作前的 AI 静态参考，不是视频抽帧。实际成片、逐镜动作和表达观察见视频制作与复盘；尚无观众反馈。' : 'AI 生成静态关键画面，用于看构图与姿态。步行、触碰过程、后拉、时长和声音尚未生成；尚无观众反馈。'}</p><p class="direction-help">点击画面可打开原图；下方 JSON 保存准确图片输入、参考角色与观察记录。</p><button class="button" type="button" data-direction-keyframe-record>下载图片生成记录 JSON ↓</button></section>`;
  }
  function keyframeDetail(record, id) {
    const f = record?.frames.find(frame => frame.shotId === id);
    if (!f) return '';
    return `<figure class="direction-keyframe-detail">${keyframeImage(f, true)}<figcaption><span class="direction-label">已生成关键画面 · 非视频抽帧</span><p><b>当前可见：</b>${esc(f.observation)}</p><p><b>原静态图的检查计划：</b>${esc(f.remaining)}</p></figcaption></figure>`;
  }
  function productionPlan(design) {
    const record = window.DIRECTION_PRODUCTION;
    if (!record || !E.sameDesign(design, record.designSnapshot)) return '';
    const actual = cases.find(c => c.id === record.id);
    const states = {awaiting_confirmation: '制作准备完成 · 等待本轮费用确认', confirmed: '参数已确认 · 待提交', in_progress: '正在生成', completed: '已生成 · 实际结果另记'};
    return `<section class="direction-keyframes direction-production" id="direction-production" aria-labelledby="direction-production-title"><div class="eyebrow">VIDEO PRODUCTION · ${esc(record.status.toUpperCase())}</div><h4 id="direction-production-title">《${esc(record.title)}》${actual ? '实际成片与复盘' : '视频制作'}</h4>${actual ? `<figure class="creative-result"><video controls playsinline preload="none" poster="${esc(actual.result.poster)}" aria-label="把片刻留给自己15秒实际成片"><source src="${esc(actual.result.video)}" type="video/mp4"></video><figcaption>实际 AI 视频＋后期剪辑 · 15 秒<a href="${esc(actual.result.video)}" download>下载成片 ↓</a></figcaption></figure><p>${esc(actual.review.summary)}</p><a class="button primary" href="#experience-tea-moment">逐镜查看动作、情绪判断与复用经验 ↓</a>` : ''}<p><b>${esc(states[record.status] || record.status)}</b></p><dl><dt>本次规格</dt><dd>Seedance 2.0 · 1080p 请求 · 16:9 · 原生声音 · 3 × 5 秒，剪成 15 秒</dd><dt>预计费用</dt><dd>${actual ? esc(actual.costNote) : `估算 ${record.estimatedCredits} 点；参照此前服务返回费用，本轮可能约 ${record.historicalServiceCostReference.credits} 点。实际返回和扣费另记；失败不自动重试。`}</dd><dt>表达主线</dt><dd>触杯后的停顿 → 端杯行走并停稳 → 主体停留、相机后拉并停住。</dd></dl><details><summary>查看本次取舍与三镜准确${actual ? '实际输入' : '待提交输入'}</summary><ul>${record.implementationChoices.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>${record.shots.map(shot=>`<article class="direction-production-shot"><h5>${esc(shot.title)} · ${shot.generationDuration} 秒</h5><p>${esc(shot.referenceRole)}</p><div class="direction-production-refs">${shot.referenceDisplay.map(ref=>`<figure><a href="${esc(ref.url)}" target="_blank" rel="noopener noreferrer"><img src="${esc(ref.url)}" loading="lazy" alt="${esc(shot.title)}${esc(ref.label)}"></a><figcaption>${esc(ref.label)}</figcaption></figure>`).join('')}</div><details><summary>英文输入与对应中文译文</summary><div class="direction-prompt-pair"><section><h5>${actual ? '实际提交英文' : '待提交英文'}</h5><p lang="en">${esc(shot.prompt)}</p></section><section><h5>对应中文译文</h5><p lang="zh-CN">${esc(shot.promptZhTranslation)}</p></section></div></details></article>`).join('')}</details><p class="direction-help">${actual ? '实际输入、原片、逐镜观察与候选改法已记录；模型的画面判断不等于观众情绪验证。' : '视频制作后，动作观察、表达线索、模型的判断和观众自身感受分别记录。此处尚未填写实际视频结果。'}</p><a class="button" href="${esc(record.recordUrl)}" target="_blank" rel="noopener noreferrer">查看本次完整制作计划 ↗</a></section>`;
  }
  function pipelineProduction(design) {
    const r = window.PIPELINE_PRODUCTION;
    if (!r || !E.sameDesign(design, r.designSnapshot)) return '';
    const actual = cases.find(c => c.id === r.id);
    const state = {awaiting_confirmation: '参考与输入已备好 · 待本轮参数及费用确认', confirmed: '本轮已确认 · 待生成', in_progress: '正在生成', completed: '视频已完成 · 结果与复盘另记'}[r.status];
    return `<section class="direction-keyframes direction-production" id="pipeline-production" aria-labelledby="pipeline-production-title"><div class="eyebrow">VIDEO PRODUCTION · ${esc(r.status.toUpperCase())}</div><h4 id="pipeline-production-title">《${esc(r.title)}》视频制作</h4><p><b>${esc(state)}</b></p>${actual ? `<figure class="creative-result"><video controls playsinline preload="none" poster="${esc(actual.result.poster)}" aria-label="有人帮你一把实际成片"><source src="${esc(actual.result.video)}" type="video/mp4"></video><figcaption>实际 AI 视频＋后期剪辑<a href="${esc(actual.result.video)}" download>下载成片 ↓</a></figcaption></figure><a class="button primary" href="#experience-${esc(actual.id)}">看动作、情绪判断与复用经验 ↓</a>` : `<p>已生成五张正式制作参考，来自八次图片调用与定向修正。这些是 AI 静态图，不能证明动作过程或情绪达标；${r.status === 'awaiting_confirmation' ? '尚未提交本题材视频。' : '视频任务已经提交，实际结果与复盘完成后更新。'}</p>`}<dl><dt>本次规格</dt><dd>Seedance 2.0 · 1080p 请求 · 16:9 · 原生声音 · 四段各 5 秒，剪成 20 秒</dd><dt>费用</dt><dd>${actual ? esc(actual.costNote || '实际返回费用见复盘。') : `估算 ${r.estimatedCredits} 点；参照此前同规格返回费用可能约 ${r.historicalServiceCostReference.credits} 点，实际返回与扣费另记。失败不自动重试。`}</dd><dt>动作与表达重点</dt><dd>看见来人 → 擦干座垫 → 先接稳、再松手 → 在车旁从容推行。维修发生在片前，不宣称片中完成维修工艺。</dd></dl><details><summary>制作取舍与待检查问题</summary><ul>${r.implementationChoices.map(x => `<li>${esc(x)}</li>`).join('')}</ul><h5>动作检查</h5><ul>${r.reviewPlan.action.map(x => `<li>${esc(x)}</li>`).join('')}</ul><h5>表达检查</h5><ul>${r.reviewPlan.expression.map(x => `<li>${esc(x)}</li>`).join('')}</ul></details>${r.shots.map(s => `<article class="direction-production-shot"><h5>${esc(s.title)} · ${s.generationDuration} 秒</h5><p>${esc(s.referenceRole)}</p><div class="direction-production-refs">${s.referenceDisplay.map(f => `<figure><a href="${esc(f.url)}" target="_blank" rel="noopener noreferrer"><img src="${esc(f.url)}" alt="${esc(s.title)}${esc(f.label)}，AI静态制作参考" loading="lazy"></a><figcaption>${esc(f.label)} · AI 静态制作参考，非视频抽帧</figcaption></figure>`).join('')}</div><details><summary>${actual ? '实际英文输入与中文译文' : '待提交英文输入与中文对照'}</summary><div class="direction-prompt-pair"><section><h5>English</h5><p lang="en">${esc(s.prompt)}</p></section><section><h5>对应中文</h5><p lang="zh-CN">${esc(s.promptZhTranslation)}</p></section></div></details><div class="direction-actions"><button class="button" type="button" data-pipeline-input="${esc(s.id)}" data-lang="en">复制${actual ? '实际' : '待提交'}英文</button><button class="button" type="button" data-pipeline-input="${esc(s.id)}" data-lang="zh">复制对应中文</button></div></article>`).join('')}<p class="direction-help">${esc(r.reviewPlan.evidence)} 模型画面判断与观众自身感受分别保存。</p><a class="button" href="${esc(r.recordUrl)}" target="_blank" rel="noopener noreferrer">查看本次完整制作计划 ↗</a> <a class="button" href="bike-reference-prompts.json" target="_blank" rel="noopener noreferrer">查看准确图片输入与静态观察 ↗</a></section>`;
  }
  function render() {
    const p = pack.storyboard, progression = {maintain: '维持', deepen: '加深', turn: '转折'}[p.emotion.progression];
    const visuals = E.keyframesFor(p, window.DIRECTION_KEYFRAMES);
    const actualFilm = E.sameDesign(p, window.DIRECTION_PRODUCTION?.designSnapshot) ? cases.find(c => c.id === window.DIRECTION_PRODUCTION?.id) : null;
    const bikePrepared = E.sameDesign(p, window.PIPELINE_PRODUCTION?.designSnapshot);
    const actualBike = bikePrepared ? cases.find(c => c.id === window.PIPELINE_PRODUCTION.id) : null;
    const completedFilm = actualFilm || actualBike;
    const list = values => `<ul>${values.map(v => `<li>${esc(v)}</li>`).join('')}</ul>`;
    $('#direction-output-state').textContent = `${pack.shots.length} 镜 / ${pack.brief.duration} 秒 / ${completedFilm ? `${completedFilm.result.duration} 秒成片已生成 · 实际复盘已入库` : bikePrepared ? '制作参考已生成 · 视频状态见制作记录' : visuals ? `已生成 ${visuals.frames.length} 张关键画面 · 视频待生成` : '设计稿 · 未生成'}`;
    $('#direction-result').innerHTML = `<div class="direction-plan-head"><div class="eyebrow">${completedFilm ? 'DESIGN + GENERATED FILM' : visuals ? 'DESIGN + GENERATED KEY IMAGES' : 'ASSISTANT-AUTHORED · DESIGN ONLY'}</div><h3>${esc(p.title.zh)}</h3><p lang="en">${esc(p.title.en)}</p><p>${esc(p.concept.zh)}</p><dl><dt>希望留下的感受</dt><dd>${esc(p.emotion.viewerExperience)}</dd><dt>情境依据</dt><dd>${esc(p.emotion.contextReason)}</dd></dl><div class="direction-emotion-path"><span>${esc(p.emotion.opening)}</span><b>${esc(progression)} →</b><span>${esc(p.emotion.ending)}</span></div>${p.emotion.event ? `<p><b>发生的事件：</b>${esc(p.emotion.event)}</p>` : ''}<details><summary>原设计阶段的参考、假设与证据边界</summary><p>${esc(p.provenance.reusedLogic)}</p><p>${esc(p.provenance.newDesign)}</p><p>${esc(p.provenance.evidence)}</p><p>跨镜一致性：${esc(p.anchor.zh)}</p></details></div>${pipelineOverview(p)}${pipelineProduction(p)}${productionPlan(p)}${keyframeOverview(visuals)}<div class="direction-actions direction-export"><button class="button primary" type="button" data-direction-export="zh">复制全部中文 ↗</button><button class="button" type="button" data-direction-export="en">复制全部英文 ↗</button><button class="button" type="button" data-direction-export="json">下载完整方案 JSON ↓</button><button class="button" type="button" data-direction-export="md">下载双语提示词 ↓</button></div><div id="direction-shots" class="direction-shot-list">${pack.shots.map((s, i) => `<article class="direction-shot" id="direction-shot-${esc(s.id)}"><div class="creative-shot-top"><span>SHOT ${String(i+1).padStart(2, '0')}</span><span>${s.start}–${s.end}s</span></div><h4>${esc(s.title)}</h4>${keyframeDetail(visuals, s.id)}<div class="direction-decision-grid"><section><span class="direction-label">感受与依据</span><h5>${esc(s.emotionalBeat.intent)}</h5><p><b>可见事件：</b>${esc(s.emotionalBeat.visibleCause)}</p><p><b>为什么支持目标：</b>${esc(s.emotionalBeat.why)}</p><p class="direction-help">可能的另一种解读：${esc(s.emotionalBeat.alternativeReading)}</p></section><section><span class="direction-label">行动与关系</span><dl><dt>开始状态</dt><dd>${esc(s.action.before.zh)}</dd><dt>行动与回应</dt><dd>${esc(s.action.performance.zh)}</dd><dt>结束状态</dt><dd>${esc(s.action.after.zh)}</dd><dt>接触与空间关系</dt><dd>${esc(s.action.relations.zh)}</dd></dl></section></div><div class="direction-expression"><h5>怎样让观众经历这一刻</h5><dl><dt>机位与运动</dt><dd>${esc(s.expression.camera.zh)}</dd><dt>构图与光线</dt><dd>${esc(s.expression.composition.zh)} ${esc(s.expression.lighting.zh)}</dd><dt>节奏</dt><dd>${esc(s.expression.timing.zh)}</dd><dt>声音计划</dt><dd>${esc(s.expression.sound.zh)}</dd><dt>原设计的素材准备计划</dt><dd>${esc(s.referencePlan)}</dd><dt>衔接</dt><dd>${esc(s.transition.zh)}</dd></dl></div><section class="direction-references"><h5>模型选择的参考与改写</h5>${s.referenceRecords.length ? s.referenceRecords.map(r => `<article><div><b>${esc(r.nameZh)}</b><span>${esc(r.nameEn)}</span></div><p><b>用于：</b>${esc(r.purpose)}</p><p><b>保留：</b>${esc(r.retain)}</p><p><b>改写：</b>${esc(r.adapt)}</p>${r.reviewNotes.length ? `<p class="direction-help">来源待核对：${esc(r.reviewNotes.join('；'))}</p>` : ''}<button class="button" type="button" data-direction-ref="${esc(r.id)}">看原站${r.mediaType === 'video' ? '视频' : '图片'}与原例 ↗</button><a href="${esc(r.sourceUrl)}" target="_blank" rel="noopener noreferrer">来源 ↗</a></article>`).join('') : '<p>模型未选现有技巧；本镜为新增设计，按实际结果检查。</p>'}</section><details class="direction-prompts"><summary>中英文提示词 · 按设计字段整理</summary><div class="direction-prompt-pair"><section><h5>中文</h5><p lang="zh-CN">${esc(s.prompts.zh)}</p></section><section><h5>English</h5><p lang="en">${esc(s.prompts.en)}</p></section></div></details><div class="direction-actions"><button class="button primary" type="button" data-direction-copy="${i}" data-lang="zh">复制本镜中文</button><button class="button" type="button" data-direction-copy="${i}" data-lang="en">复制本镜英文</button></div><details class="direction-checks"><summary>分别检查动作与表达</summary><h5>动作关系</h5>${list(s.checks.action)}<h5>表达线索</h5>${list(s.checks.expression)}<p class="direction-help">这些是检查计划。观众实际感受另记，不由结构校验判定。</p></details></article>`).join('')}</div><p class="direction-help">${esc(pack.validationScope)} ${completedFilm ? '本题材实际视频已生成，观察和输入另见复盘。' : '当前方案没有生成或评估本题材视频。'}${visuals ? '已生成的关键画面与准确图片输入独立记录；画面不能证明动作过程或情绪效果。' : '参考图、实际提交参数、输入和原件在制作时另记。'}</p>`;
    $('#direction-review').hidden = false;
    $('#direction-review-status').textContent = `本机已有 ${reviews.length} 条观后反馈草稿。当前设计与反馈会一起导出。`;
  }
  function validateInput(announce = true) {
    let plan;
    try {
      if (input.value.length > 500000) throw new Error('文件超过 500 KB，请减少内容。');
      const parsed = JSON.parse(input.value); plan = parsed?.storyboard || parsed;
      const result = E.validate(plan, brief(), rows, cases);
      if (!result.ok) throw new Error(result.errors.join('\n'));
      pack = E.compile(plan, brief(), rows, cases); render(); saveSession();
      if (announce) status(`已检查 ${pack.shots.length} 镜的字段、引用与时长。请查看模型的情绪依据、动作和表达；这不代表内容已经通过验收。`);
      return true;
    } catch (e) { invalidate('输入稿已保留，请按提示修正后重新导入。'); if (announce) status(e.message, true); return false; }
  }
  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('input', () => { invalidate(); saveSession(); status('目标已更新，请复制当前任务给助手，已有输入稿仍保留。'); });
  input.addEventListener('input', () => { invalidate('分镜稿已编辑，请重新检查后查看方案。'); saveSession(); });
  $('#direction-copy-task').addEventListener('click', () => {
    const errors = E.briefErrors(brief()); if (errors.length) { status(errors.join('\n'), true); return; }
    copy(E.creativePackage(brief(), rows, cases), '已复制当前目标、424 项索引和案例经验。交给当前助手比较方向、设计情境与分镜，返回完整方案 JSON。');
  });
  $('#direction-template').addEventListener('click', () => {
    const errors = E.briefErrors(brief()); if (errors.length) { status(errors.join('\n'), true); return; }
    download('creative-direction-template.json', JSON.stringify(E.skeleton(brief()), null, 2));
  });
  $('#direction-download-task').addEventListener('click', () => {
    const errors = E.briefErrors(brief()); if (errors.length) { status(errors.join('\n'), true); return; }
    download('creative-direction-task.txt', E.creativePackage(brief(), rows, cases), 'text/plain;charset=utf-8');
  });
  $('#direction-validate').addEventListener('click', () => { if (validateInput()) $('#direction-output').scrollIntoView({behavior: 'smooth', block: 'start'}); });
  $('#direction-file').addEventListener('change', async event => {
    const file = event.target.files[0]; if (!file) return;
    invalidate('正在读取新稿。');
    try { if (file.size > 500000) throw new Error('文件超过 500 KB。'); input.value = await file.text(); validateInput(); }
    catch (e) { status(e.message, true); }
    event.target.value = '';
  });
  $('#direction-example').addEventListener('click', () => {
    const example = window.DIRECTION_EXAMPLE;
    fill(example.brief); input.value = JSON.stringify(example, null, 2);
    if (validateInput()) { status(cases.some(c => c.id === 'tea-moment') ? '已载入陶器方案、15 秒实际成片与复盘。原设计及静态参考分别保留。' : '已载入陶器方案。可查看三张静态关键画面、设计依据与双语视频提示词；视频待生成。'); (cases.some(c => c.id === 'tea-moment') ? $('#direction-production') : E.keyframesFor(pack.storyboard, window.DIRECTION_KEYFRAMES) ? $('#direction-keyframes') : $('#direction-output')).scrollIntoView({behavior: 'smooth', block: 'start'}); }
  });
  $('#direction-pipeline-example').addEventListener('click', () => {
    const example = window.PIPELINE_EXAMPLE;
    fill(example.brief); input.value = JSON.stringify(example, null, 2);
    if (validateInput()) {
      const ready = E.sameDesign(example, window.PIPELINE_PRODUCTION?.designSnapshot);
      status(ready ? '已载入四镜原设计、五张静态制作参考与准确制作输入。视频状态、实际结果与费用另见制作记录。' : '已载入《有人，帮你一把》：3 个方向比较、4 镜情境行动链、参考取舍与双语提示词。仅为设计稿，尚未生成。');
      (ready ? $('#pipeline-production') : $('#direction-output')).scrollIntoView({behavior: 'smooth', block: 'start'});
    }
  });
  $('#direction-result').addEventListener('click', event => {
    if (!pack) return;
    const productionCopy = event.target.closest('[data-pipeline-input]');
    if (productionCopy && E.sameDesign(pack.storyboard, window.PIPELINE_PRODUCTION?.designSnapshot)) {
      const s = window.PIPELINE_PRODUCTION.shots.find(x => x.id === productionCopy.dataset.pipelineInput);
      copy(productionCopy.dataset.lang === 'en' ? s.prompt : s.promptZhTranslation, `已复制「${s.title}」本次制作${productionCopy.dataset.lang === 'en' ? '英文输入' : '对应中文'}。`);
      return;
    }
    if (event.target.closest('[data-direction-keyframe-record]')) {
      const record = E.keyframesFor(pack.storyboard, window.DIRECTION_KEYFRAMES);
      if (record) download('tea-moment-keyframes.json', JSON.stringify(record, null, 2));
      return;
    }
    const c = event.target.closest('[data-direction-copy]');
    if (c) { const s = pack.shots[Number(c.dataset.directionCopy)]; copy(s.prompts[c.dataset.lang], `已复制「${s.title}」${c.dataset.lang === 'zh' ? '中文' : '英文'}设计提示词。`); }
    const x = event.target.closest('[data-direction-export]'); if (!x) return;
    const kind = x.dataset.directionExport;
    if (kind === 'json') download('creative-direction.json', JSON.stringify(pack, null, 2));
    else if (kind === 'md') download('creative-direction-prompts.md', E.markdown(pack), 'text/markdown;charset=utf-8');
    else copy(E.markdown(pack, kind), `已复制全部${kind === 'zh' ? '中文' : '英文'}设计提示词。`);
  });
  reviewForm.addEventListener('submit', event => {
    event.preventDefault(); if (!pack) return;
    try {
      const record = {...E.reviewDraft(pack, Object.fromEntries(new FormData(reviewForm))), recordedAt: new Date().toISOString()};
      const next = [...reviews, record]; localStorage.setItem(reviewKey, JSON.stringify(next));
      reviewToggle = {before: reviews, after: next, applied: true}; reviews = next;
      $('#direction-undo-review').disabled = false; $('#direction-undo-review').textContent = '撤回本次保存';
      $('#direction-review-status').textContent = `已在本机保存 ${reviews.length} 条草稿。模型观察仍为空；下载后交给助手核对素材并整理入库。`;
    } catch (e) { $('#direction-review-status').textContent = '未保存：' + e.message; }
  });
  $('#direction-undo-review').addEventListener('click', () => {
    if (!reviewToggle) return;
    try {
      const next = reviewToggle.applied ? reviewToggle.before : reviewToggle.after;
      localStorage.setItem(reviewKey, JSON.stringify(next)); reviews = next; reviewToggle.applied = !reviewToggle.applied;
      $('#direction-undo-review').textContent = reviewToggle.applied ? '撤回本次保存' : '恢复刚撤回的草稿';
      $('#direction-review-status').textContent = `本机现有 ${reviews.length} 条草稿；此次操作可用同一按钮恢复。`;
    } catch (e) { $('#direction-review-status').textContent = '未能更改本机草稿：' + e.message; }
  });
  $('#direction-download-reviews').addEventListener('click', () => {
    if (!reviews.length) { $('#direction-review-status').textContent = '还没有保存的观后反馈草稿。'; return; }
    download('viewer-feedback-drafts.json', JSON.stringify({status: 'user_reported_drafts_not_case_library', reviews}, null, 2));
  });
  renderCaseSources();
  if ($('#direction-library-summary')) $('#direction-library-summary').textContent = `模型做判断 · ${rows.length} 项参考 · ${cases.length} 个实测题材`;
  if ($('#direction-case-source-summary')) $('#direction-case-source-summary').textContent = `参考从哪里来？查看 ${cases.length} 个实际题材的效果、偏差与可迁移经验`;
  if (window.PIPELINE_PRODUCTION && $('#pipeline-example-media-state')) $('#pipeline-example-media-state').textContent = cases.some(c => c.id === 'bike-kindness') ? '20秒实际成片与复盘已入库，原设计与静态参考分别保留。' : '五张静态制作参考已生成，视频状态见本轮制作记录。';
  try {
    const savedReviews = JSON.parse(localStorage.getItem(reviewKey) || '[]'); if (Array.isArray(savedReviews)) reviews = savedReviews;
    const saved = JSON.parse(localStorage.getItem(sessionKey) || 'null');
    if (saved?.brief) fill(saved.brief);
    if (typeof saved?.planText === 'string' && saved.planText.length <= 500000) { input.value = saved.planText; if (input.value) validateInput(false); }
  } catch (_) { /* Corrupt local drafts never become valid plans or evidence. */ }
})();
