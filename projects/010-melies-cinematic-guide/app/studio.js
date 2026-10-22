(function () {
  'use strict';
  const E = window.ShotWorkflow, data = window.STUDIO_DATA;
  if (!E || !data) return;
  const rules = data.library.rules, example = data.example;
  const $ = s => document.querySelector(s);
  const form = $('#studio-form'), planInput = $('#studio-plan');
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  let selected = [], screening = [], selectionKey = '', pack = null;
  const currentBrief = () => E.normalizeBrief(Object.fromEntries(new FormData(form)));
  function fillBrief(b) { for (const [k, value] of Object.entries(b)) if (form.elements.namedItem(k)) form.elements.namedItem(k).value = value; }
  function status(message, error = false) {
    $('#studio-status').textContent = message;
    $('#studio-status').classList.toggle('is-error', error);
  }
  function invalidate(message) {
    pack = null;
    $('#studio-result').innerHTML = `<p class="studio-empty">${esc(message || '简报或规则已变化。请核对候选技巧，使用当前创作包重新设计或导入对应分镜。原输入稿仍保留。')}</p>`;
    $('#studio-output-state').textContent = '等待当前简报的有效分镜';
  }
  function selectionSummary() {
    const stale = selectionKey !== E.briefKey(currentBrief());
    $('#studio-selection-summary').textContent = stale ? '目标已变化，请重新筛选或手动确认选择。' : `当前选择 ${selected.length} / 7 项；模型可继续删减。${selected.length ? '' : '没有适合的规则也可以继续创作。'}`;
    $('#studio-copy-package').disabled = stale;
    $('#studio-download-template').disabled = stale;
  }
  function ruleFeedback(rule) {
    return (rule.caseFeedback || []).filter(c => c.caseId !== 'rain-to-forest').map(c => `<section class="studio-rule-feedback"><p><b>实际经验 · ${esc(c.title)}</b>（${c.sampleSize} 次首版执行${c.revisions?.length ? '＋两镜局部返修' : ''}）</p>${c.shots.map(s => `<p>${esc(s.observedEffect)}</p><p class="studio-help">首版问题：${esc(s.problems.join('；'))}</p>`).join('')}${(c.revisions || []).map(r => `<p><b>返修反馈：</b>${esc(r.summary)}</p>${r.shots.map(s => `<p class="studio-help">${esc(s.observedEffect)} 仍需注意：${esc(s.problems.join('；'))}</p>`).join('')}`).join('')}<a href="#experience-${esc(c.caseId)}">读取完整复盘、返修对照与实际输入 ↓</a></section>`).join('');
  }
  function renderRules() {
    $('#studio-rules').innerHTML = rules.map(rule => {
      const hit = screening.find(r => r.id === rule.id) || {matches: [], excluded: []};
      return `<article class="studio-rule${selected.includes(rule.id) ? ' is-selected' : ''}"><label class="studio-rule-check"><input type="checkbox" value="${esc(rule.id)}" ${selected.includes(rule.id) ? 'checked' : ''}><span><strong>${esc(rule.nameZh)}</strong><small>${esc(rule.nameEn)} · ${esc(rule.kind)}</small></span></label><p>${esc(rule.core)}</p><div class="studio-match">${hit.excluded.length ? `排除提醒：避免项含「${esc(hit.excluded.join('、'))}」，不自动选择。` : hit.matches.length ? `匹配词：${esc(hit.matches.join('、'))}` : '未命中关键词，可按创意需要手动选择。'}</div><details><summary>参数、边界与来源</summary><p><b>候选用途</b> ${esc(rule.purposes.join('；'))}（设计归纳）</p><ul>${rule.parameters.map(p => `<li>${esc(p.label)}：${esc(p.origin)}</li>`).join('')}</ul><p><b>使用要求</b> ${esc(rule.requirements.join('；'))}</p><p><b>易出问题</b> ${esc(rule.cautions.join('；'))}</p><p><b>检查</b> ${esc(rule.checks.join('；'))}</p><blockquote lang="en">${esc(rule.sourceExcerpt)}</blockquote><p class="studio-help">提炼依据：${esc(rule.coreOrigin)}</p><p><b>香水单次经验</b> ${esc(rule.caseLesson)}</p>${ruleFeedback(rule)}<div class="studio-rule-links"><button type="button" data-studio-ref="${esc(rule.id)}">看原站效果与提示词 ↗</button><a href="${esc(rule.source.url)}" target="_blank" rel="noopener noreferrer">来源页 ↗</a><a href="#experience">实际案例复盘 ↓</a></div></details></article>`;
    }).join('');
    selectionSummary();
  }
  function screen(announce = true) {
    const b = currentBrief(), errors = E.briefErrors(b);
    if (errors.length) { status(errors.join('\n'), true); return false; }
    screening = E.suggestRules(b, rules);
    selected = screening.filter(r => r.suggested).map(r => r.id);
    selectionKey = E.briefKey(b);
    renderRules();
    if (announce) { invalidate('候选规则已更新。核对选择后复制创作包，请助手为当前目标设计。'); status(`已按关键词筛出 ${selected.length} 项候选；请核对取舍，再交给助手。`); }
    return true;
  }
  function download(filename, value, mime) {
    const url = URL.createObjectURL(new Blob([value], {type: mime}));
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function copy(value, message) {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(value);
      else {
        const t = document.createElement('textarea'); t.value = value; t.style.position = 'fixed'; t.style.opacity = '0';
        document.body.appendChild(t); t.select(); const ok = document.execCommand('copy'); t.remove();
        if (!ok) throw new Error('copy failed');
      }
      status(message);
    } catch (_) { status('复制失败，请检查浏览器剪贴板权限，或下载 JSON / Markdown 文件。', true); }
  }
  function renderResult() {
    const p = pack.storyboard;
    const hasExecution = data.bookExecution && E.briefKey(pack.brief) === E.briefKey(example.brief);
    $('#studio-output-state').textContent = `${pack.shots.length} 镜 / ${pack.brief.duration} 秒 / 结构校验通过 / ${hasExecution ? '原设计稿 · 另有实际复盘' : '未生成视频'}`;
    const ruleName = id => (rules.find(r => r.id === id) || {}).nameZh || id;
    $('#studio-result').innerHTML = `<div class="studio-plan-head"><div><span class="creative-badge">助手原创设计 / DESIGN ONLY</span><h4>${esc(p.title.zh)}</h4><span lang="en">${esc(p.title.en)}</span><p>${esc(p.concept.zh)}</p><div class="studio-emotion"><span>${esc(p.intention.emotionStart)}</span><b>→</b><span>${esc(p.intention.turningEvent)}</span><b>→</b><span>${esc(p.intention.emotionEnd)}</span></div></div><div class="studio-anchor"><h5>跨镜一致性</h5><p>${esc(p.anchor.zh)}</p><small>设计阶段记录：${esc(p.provenance.evidence)}</small></div></div><div class="studio-choice"><h5>取舍比叠加更重要</h5><p>实际使用：${p.selectedRuleIds.map(ruleName).map(esc).join('、') || '未使用试点规则'}</p>${p.rejectedRules.length ? `<details><summary>为什么不用其余技巧？</summary><ul>${p.rejectedRules.map(r => `<li><b>${esc(ruleName(r.id))}</b>：${esc(r.reason)}</li>`).join('')}</ul></details>` : ''}<details><summary>复用了什么，新设计了什么？</summary><p>${esc(p.provenance.reusedLogic)}</p><p>${esc(p.provenance.newDesign)}</p></details></div><div class="studio-actions studio-export"><button class="button primary" type="button" data-studio-export="zh">复制全部中文 ↗</button><button class="button" type="button" data-studio-export="en">复制全部英文 ↗</button><button class="button" type="button" data-studio-export="json">下载完整创作包 JSON ↓</button><button class="button" type="button" data-studio-export="md">下载双语提示词 Markdown ↓</button></div><div class="studio-timeline" aria-label="分镜设计时间线">${pack.shots.map((s, i) => `<a href="#studio-shot-${i}" style="flex-grow:${s.duration}"><small>${esc(s.start)}–${esc(s.end)}s</small><span>${esc(s.title)}</span></a>`).join('')}</div><div class="studio-shot-grid">${pack.shots.map((s, i) => {
      const design = p.shots[i];
      return `<article id="studio-shot-${i}" class="studio-shot"><div class="creative-shot-top"><span>SHOT ${String(i + 1).padStart(2, '0')}</span><span>${esc(s.start)}–${esc(s.end)}s · ${s.duration}s</span></div><h4>${esc(s.title)}</h4><p class="studio-task">${esc(design.task)}</p><div class="studio-shot-rules">${s.ruleIds.map(id => `<span>${esc(ruleName(id))}</span>`).join('') || '<span>固定机位基线</span>'}</div><dl><dt>为什么这样拍</dt><dd>${esc(design.reason)}</dd><dt>画面动作</dt><dd>${esc(design.scene.zh)}</dd><dt>机位 / 光线 / 声音</dt><dd>${esc(design.camera.view.zh)} ${esc(design.lighting.zh)} ${esc(design.sound.zh)}</dd><dt>剪辑</dt><dd>${design.transitionOut.type === 'graphic_match' ? '两段分别生成，按共享圆形后期硬切' : design.transitionOut.type === 'fade' ? '本镜之后按分镜淡出；后期完成' : i === pack.shots.length - 1 ? '本镜结束，片名与收尾在后期制作' : '动作停顿后硬切下一镜'}</dd></dl><details class="studio-prompts"><summary>中英文提示词 · 点击对照</summary><div class="studio-prompt-pair"><div><h5>中文 / 原创改写</h5><p>${esc(s.prompts.zh)}</p></div><div lang="en"><h5>English / Original adaptation</h5><p>${esc(s.prompts.en)}</p></div></div></details><div class="studio-actions"><button type="button" class="button primary" data-studio-copy="${i}" data-lang="zh">复制中文</button><button type="button" class="button" data-studio-copy="${i}" data-lang="en">复制 English</button></div><details class="studio-checks"><summary>生成后，怎样验收？</summary><ul>${design.checks.map(c => `<li>${esc(c)}</li>`).join('')}</ul></details></article>`;
    }).join('')}</div><p class="studio-footnote">${hasExecution ? '以上保留原始设计字段与设计提示词。实际提交文本、素材与偏差见本次生成复盘；原设计不等于实际输入。' : '以上为设计稿和本地整理的提示词，没有生成或评估本题材视频。'}校验检查结构与显式参数，不判断情绪、物理或自由文本的全部冲突。每镜时长为剪辑目标；参考图、工具时长、音轨、字幕和连续性需在实际制作中处理。</p>`;
  }
  function validateInput() {
    let plan;
    try {
      if (planInput.value.length > 200000) throw new Error('分镜文件超过 200 KB，请减少内容。');
      const parsed = JSON.parse(planInput.value);
      plan = parsed && parsed.storyboard ? parsed.storyboard : parsed;
    } catch (e) { invalidate('未能读取分镜，输入稿已保留。'); status(`JSON 无法读取：${e.message}`, true); return false; }
    const result = E.validate(plan, currentBrief(), selected, rules);
    if (!result.ok) { invalidate('分镜未通过校验，修正后再试。'); status(result.errors.join('\n'), true); return false; }
    pack = E.compile(plan, currentBrief(), selected, rules);
    renderResult();
    status(`结构校验通过：${pack.shots.length} 镜，合计 ${pack.brief.duration} 秒。双语提示词已按设计字段整理；本次整理操作不调用视频生成。`);
    return true;
  }
  form.addEventListener('submit', event => { event.preventDefault(); if (screen()) $('#studio-selection').scrollIntoView({behavior: 'smooth', block: 'start'}); });
  form.addEventListener('input', () => { invalidate(); selectionSummary(); status('简报已变化。原分镜输入保留，请重新筛选并使用对应创作包。'); });
  $('#studio-rules').addEventListener('change', event => {
    if (!event.target.matches('input[type=checkbox]')) return;
    const changedId = event.target.value;
    selected = [...$('#studio-rules').querySelectorAll('input:checked')].map(el => el.value);
    screening = E.suggestRules(currentBrief(), rules);
    selectionKey = E.briefKey(currentBrief());
    invalidate(); renderRules(); status('候选选择已更新，请将新的创作包交给助手。');
    $('#studio-rules').querySelector(`input[value="${changedId}"]`).focus();
  });
  $('#studio-copy-package').addEventListener('click', () => {
    const errors = E.briefErrors(currentBrief());
    if (errors.length) { status(errors.join('\n'), true); return; }
    copy(E.creativePackage(currentBrief(), selected, rules), '已复制创作包。粘贴到当前对话，请助手返回纯 JSON 分镜稿，再导入此页。');
  });
  $('#studio-download-template').addEventListener('click', () => download('storyboard-template.json', JSON.stringify(E.skeleton(currentBrief(), selected), null, 2), 'application/json;charset=utf-8'));
  $('#studio-load-example').addEventListener('click', () => {
    fillBrief(example.brief); screen(false); selected = [...example.selectedRuleIds]; renderRules();
    planInput.value = JSON.stringify(example, null, 2);
    if (validateInput()) $('#studio-output').scrollIntoView({behavior: 'smooth', block: 'start'});
  });
  $('#studio-validate').addEventListener('click', () => { if (validateInput()) $('#studio-output').scrollIntoView({behavior: 'smooth', block: 'start'}); });
  planInput.addEventListener('input', () => { invalidate('分镜稿已编辑，请重新校验后查看当前结果。'); status('输入稿已变化，请重新校验。'); });
  $('#studio-file').addEventListener('change', async event => {
    const file = event.target.files[0]; if (!file) return;
    invalidate('已选择新文件，等待读取与校验。');
    try {
      if (file.size > 200000) throw new Error('文件超过 200 KB。');
      planInput.value = await file.text();
      validateInput();
    } catch (e) { status(`文件无法导入：${e.message}`, true); }
    event.target.value = '';
  });
  $('#studio-result').addEventListener('click', event => {
    if (!pack) return;
    const c = event.target.closest('[data-studio-copy]');
    if (c) { const s = pack.shots[Number(c.dataset.studioCopy)]; copy(s.prompts[c.dataset.lang], `已复制「${s.title}」${c.dataset.lang === 'zh' ? '中文' : '英文'}提示词。`); }
    const x = event.target.closest('[data-studio-export]');
    if (!x) return;
    const kind = x.dataset.studioExport;
    if (kind === 'json') download('creative-package.json', JSON.stringify(pack, null, 2), 'application/json;charset=utf-8');
    else if (kind === 'md') download('bilingual-prompts.md', E.markdown(pack), 'text/markdown;charset=utf-8');
    else copy(E.markdown(pack, kind), `已复制全部${kind === 'zh' ? '中文' : '英文'}提示词（含逐镜时间与设计状态）。`);
  });
  fillBrief(example.brief);
  screen(false);
  if (data.bookExecution) {
    const execution = data.bookExecution, holder = $('#studio-production');
    const latest = execution.latestResult || execution.result;
    holder.hidden = false;
    holder.innerHTML = `<div class="section-heading"><div><div class="eyebrow">FROM DESIGN TO GENERATED FILM</div><h3 id="studio-production-title">《${esc(execution.title)}》${execution.latestResult ? '两镜返修版' : '实际生成与复盘'}</h3></div><p>Seedance 2.0 · 18 秒剪辑成片 · 原设计与实际结果分别保留</p></div><figure class="creative-result"><video controls playsinline preload="none" poster="${esc(latest.poster)}" aria-label="让故事继续18秒实际成片"><source src="${esc(latest.video)}" type="video/mp4"></video><figcaption><span>${execution.latestResult ? '仅重做穿针与合书，保留刷拭与交还' : 'AI 视频素材＋后期剪辑与片名'}</span><a href="${esc(latest.video)}" download>下载 18 秒成片 ↓</a></figcaption></figure><p class="studio-production-review">${esc(execution.revisionSummary || execution.review.summary)}</p><a class="button" href="#experience-${execution.latestResult ? 'book-repair-r2' : 'book-repair'}">${execution.latestResult ? '查看修正前后对照、残留问题与经验' : '逐镜看实际效果、问题与复用经验'} ↓</a>`;
    const badge = document.querySelector('.studio-example small');
    if (badge) badge.textContent = '本次已实际生成并剪辑成片；原始分镜仍保留为设计稿，下方可播放并查看偏差。';
    $('#studio-load-example').textContent = '查看原始分镜与双语提示词 ↗';
  }
})();
