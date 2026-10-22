/* Complete, source-attributed media and Chinese prompt gallery. */
(() => {
  'use strict';
  const shots = window.SHOTS;
  const $ = selector => document.querySelector(selector);
  const sourceUrl = shot => `https://melies.co/cinematic-techniques/${shot.path}`;
  const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const dialog = $('#detail');
  const detailVideo = $('#detail-video');
  const search = $('#search');
  let filter = '全部';
  let mediaFilter = 'all';
  let limit = 24;
  let current = null;
  let opener = null;

  function pauseAll(except = null) {
    document.querySelectorAll('video').forEach(video => {
      if (video !== except) video.pause();
    });
  }

  // Load media bytes only after an explicit play action.
  function setupPlayer(container, shot) {
    const video = container.querySelector('video');
    const button = container.querySelector('.play-video');
    const status = container.querySelector('.video-status');
    video.poster = shot.poster;
    video.setAttribute('aria-hidden', 'true');
    video.setAttribute('aria-label', `${shot.name}：Melies 原站示例视频`);
    video.addEventListener('playing', () => {
      button.hidden = true;
      status.hidden = true;
      container.classList.add('is-playing');
    });
    video.addEventListener('error', () => {
      button.hidden = true;
      status.textContent = '视频暂时无法加载，请通过下方来源链接查看。';
      status.hidden = false;
      container.classList.remove('is-playing');
    });
    button.addEventListener('click', async () => {
      pauseAll(video);
      status.textContent = '正在加载原站视频…';
      status.hidden = false;
      if (!video.getAttribute('src')) video.src = shot.video;
      video.removeAttribute('aria-hidden');
      video.controls = true;
      try { await video.play(); }
      catch { status.textContent = '播放未开始，可使用播放器控制栏，或打开来源页面。'; }
    });
  }

  // Capture also catches a user pressing native video controls.
  document.addEventListener('play', event => {
    if (event.target instanceof HTMLVideoElement) pauseAll(event.target);
  }, true);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pauseAll();
  });

  function matchingShots() {
    const query = search.value.trim().toLocaleLowerCase();
    return shots.filter(shot => {
      const categoryMatch = filter === '全部' || shot.group === filter;
      const mediaMatch = mediaFilter === 'all' || shot.mediaType === mediaFilter;
      const aliases = /Orbit|^Arc(?: |$)/.test(shot.en) ? ' 环绕 绕拍' : /Aerial|Drone|Earth Zoom/.test(shot.en) ? ' 航拍 无人机 高空' : '';
      const transition = /Cut|Dissolve|Whip|Transition/.test(shot.en) ? ' 转场 剪辑' : '';
      const haystack = `${shot.name} ${shot.en} ${shot.group} ${shot.short} ${shot.prompt} ${shot.promptEn} ${shot.promptNote || ''}${aliases}${transition}`.toLocaleLowerCase();
      return categoryMatch && mediaMatch && (!query || haystack.includes(query));
    });
  }

  function renderFilters() {
    const groups = ['全部', ...new Set(shots.map(shot => shot.group))];
    $('#filters').innerHTML = groups.map(group => {
      const count = group === '全部' ? shots.length : shots.filter(shot => shot.group === group).length;
      return `<button type="button" data-group="${esc(group)}" aria-pressed="${group === filter}">${esc(group)} <span>${count}</span></button>`;
    }).join('');
  }

  function cardMarkup(shot) {
    const index = shots.indexOf(shot) + 1;
    const media = shot.mediaType === 'video'
      ? `<video preload="none" muted loop playsinline></video><button class="play-video" type="button" aria-label="播放${esc(shot.name)}的原站视频"><span aria-hidden="true">▶</span><small>播放效果</small></button>`
      : `<button class="still-open" type="button" data-detail="${esc(shot.id)}" aria-label="查看${esc(shot.name)}的原站图片"><img src="${esc(shot.image)}" alt="${esc(shot.name)}原站效果图片" loading="lazy" decoding="async"><span class="still-hint">查看大图 ↗</span></button>`;
    return `<article class="card" data-id="${esc(shot.id)}">
      <div class="card-image ${shot.mediaType === 'video' ? 'video-player' : 'image-player'}">
        ${media}
        <span class="card-index">${String(index).padStart(3, '0')} / 原站${shot.mediaType === 'video' ? '视频' : '图片'}</span>
        <p class="video-status" role="status" hidden></p>
      </div>
      <div class="card-body"><div class="card-meta"><span>${esc(shot.group)}</span><span>${esc(shot.en)}</span></div>
      <button class="card-title" type="button" data-detail="${esc(shot.id)}"><h3>${esc(shot.name)}</h3><span aria-hidden="true">↗</span></button>
      <p class="card-effect">${esc(shot.short)}</p>
      <div class="card-prompt-pair"><div class="card-prompt"><span>中文翻译</span><p lang="zh-CN">${esc(shot.prompt)}</p></div><div class="card-prompt card-prompt-en"><span>ENGLISH / 原站原文</span><p lang="en">${esc(shot.promptEn)}</p></div></div>
      ${shot.promptNote || shot.mediaNote ? `<p class="card-warning">原站${shot.mediaNote ? '配图' : '提示词'}待核对 · 详情说明</p>` : ''}
      <div class="card-actions"><button type="button" data-detail="${esc(shot.id)}">编辑对照</button><button type="button" data-copy="${esc(shot.id)}" data-copy-lang="zh">复制中文</button><button type="button" data-copy="${esc(shot.id)}" data-copy-lang="en">复制英文</button><a href="${sourceUrl(shot)}" target="_blank" rel="noopener noreferrer" aria-label="在 Melies 查看${esc(shot.name)}来源">来源 ↗</a></div></div>
    </article>`;
  }

  function renderCards() {
    $('#cards').querySelectorAll('video').forEach(video => video.pause());
    const matches = matchingShots();
    $('#cards').innerHTML = matches.slice(0, limit).map(cardMarkup).join('');
    $('#cards').querySelectorAll('.card:has(video)').forEach(card => {
      setupPlayer(card.querySelector('.video-player'), shots.find(shot => shot.id === card.dataset.id));
    });
    $('#cards').querySelectorAll('.card img').forEach(img => {
      img.addEventListener('error', () => {
        const status = img.closest('.card-image').querySelector('.video-status');
        status.textContent = '原站图片暂时无法加载，请打开来源页面查看。';
        status.hidden = false;
      });
    });
    $('#results').textContent = `找到 ${matches.length} 个技巧 · 已展示 ${Math.min(limit, matches.length)} 个`;
    $('#empty').hidden = matches.length !== 0;
    $('#load-more').hidden = matches.length <= limit;
    $('#load-more').textContent = `再看 ${Math.max(0, Math.min(24, matches.length - limit))} 个技巧 ↓`;
    $('#show-all').hidden = matches.length <= limit;
    $('#show-all').textContent = `展开当前全部 ${matches.length} 项`;
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const area = document.createElement('textarea');
      area.value = text;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      (dialog.open ? dialog : document.body).append(area);
      area.select();
      const copied = document.execCommand('copy');
      area.remove();
      return copied;
    }
  }

  function renderCreativeCase() {
    const creative = window.CREATIVE_CASE;
    if (!creative) return;
    function generatedPlayer(media, label) {
      if (!media?.video) return '';
      return `<figure class="creative-result"><video controls playsinline preload="metadata" src="${esc(media.video)}"${media.poster ? ` poster="${esc(media.poster)}"` : ''} aria-label="${esc(label)}"></video><figcaption><span>${esc(label)} · ${esc(media.model)} · ${esc(media.duration)} 秒</span><a href="${esc(media.video)}" download>下载视频 ↓</a></figcaption></figure>`;
    }
    if (creative.generationSummary) $('#creative-generation-summary').textContent = creative.generationSummary;
    let start = 0;
    const cards = creative.shots.map((shot, index) => {
      const begin = start;
      start += shot.duration;
      const refs = shot.refIds.map(id => shots.find(item => item.id === id));
      return `<article class="creative-shot" data-creative-shot="${esc(shot.id)}">
        <div class="creative-shot-top"><span>SHOT ${String(index + 1).padStart(2, '0')}</span><span>${begin}–${start}s / ${shot.duration} 秒</span></div>
        ${generatedPlayer(shot.generated, '本次实际生成素材')}
        ${shot.generated?.observation ? `<p class="creative-result-note"><span>本次生成观察</span>${esc(shot.generated.observation)}</p>` : ''}
        <h3>${esc(shot.title)}</h3><p class="creative-role">${esc(shot.role)}</p><p class="creative-visual">${esc(shot.visual)}</p>
        <div class="creative-motion"><span>主要运动</span>${esc(shot.primaryMotion)}</div>
        <div class="creative-rule"><span>借用的规则</span><p>${esc(shot.borrowedRule)}</p></div>
        <div class="creative-original"><span>这次新增的设计</span><p>${esc(shot.creativeDecision)}</p></div>
        <div class="creative-refs"><span>看参考效果</span>${refs.map(ref => `<button type="button" data-creative-ref="${esc(ref.id)}">${esc(ref.name)} ↗</button>`).join('')}</div>
        <details class="creative-prompts"><summary>查看原创中英文提示词</summary><div><h4>中文设计版</h4><p lang="zh-CN">${esc(shot.promptZh)}</p><h4>English creative prompt</h4><p lang="en">${esc(shot.promptEn)}</p></div></details>
        <div class="creative-actions"><button type="button" data-creative-copy="zh" data-shot="${esc(shot.id)}">复制原创中文</button><button type="button" data-creative-copy="en" data-shot="${esc(shot.id)}">复制原创英文</button></div>
        <p class="creative-edit"><span>剪辑与生成</span>${esc(shot.editNote)}</p>
      </article>`;
    }).join('');
    $('#creative-example').innerHTML = `<div class="creative-brief"><div><span class="creative-badge">本次原创方案 / ${esc(creative.format)}</span><h3>${esc(creative.title)}</h3><p>${esc(creative.brief)}</p><p class="creative-concept">${esc(creative.concept)}</p></div><div class="creative-anchor"><span>跨镜头统一锚点</span><p>${esc(creative.anchorZh)}</p><small>${esc(creative.productionNote)}</small></div></div>${generatedPlayer(creative.generated, '把森林，带回城市 · 剪辑成片')}<div class="creative-shots">${cards}</div>`;
    $('#creative-example').querySelectorAll('video').forEach(video => {
      video.addEventListener('play', () => pauseAll(video));
    });
    $('#creative-example').addEventListener('click', async event => {
      const reference = event.target.closest('[data-creative-ref]');
      if (reference) openDetail(reference.dataset.creativeRef, reference);
      const copy = event.target.closest('[data-creative-copy]');
      if (!copy) return;
      const shot = creative.shots.find(item => item.id === copy.dataset.shot);
      const english = copy.dataset.creativeCopy === 'en';
      const ok = await copyText(english ? shot.promptEn : shot.promptZh);
      $('#creative-copy-status').textContent = ok ? `已复制「${shot.title}」的原创${english ? '英文' : '中文'}提示词。` : '复制未成功，请展开文字后手动复制。';
      const label = english ? '复制原创英文' : '复制原创中文';
      copy.textContent = ok ? '已复制 ✓' : '请手动复制';
      setTimeout(() => { if (copy.isConnected) copy.textContent = label; }, 2400);
    });
  }

  function renderLogicReview(logic) {
    if (!logic) return '';
    return `<section class="experience-logic"><h6>${esc(logic.label)}</h6><p><b>应有关系：</b>${esc(logic.expected)}</p><p><b>实际矛盾：</b>${esc(logic.observed)}</p><p><b>怎样检查：</b>${esc(logic.check)}</p><div class="logic-evidence">${logic.evidenceFrames.map(frame => `<figure><a href="${esc(frame.image)}" target="_blank" rel="noopener noreferrer"><img src="${esc(frame.image)}" loading="lazy" alt="${esc(frame.caption)}"></a><figcaption>${esc(frame.caption)}<span>点击查看原尺寸</span></figcaption></figure>`).join('')}</div></section>`;
  }
  function renderRevisions(caseItem) {
    return (caseItem.revisions || []).map(revision => `<section class="experience-revision" id="experience-${esc(revision.id)}"><div class="eyebrow">TARGETED REVISION · 原件与首版记录保留</div><h5>两镜返修 · 前后对照</h5><p>${esc(revision.summary)}</p><p class="studio-help">只重新生成穿针、合书；刷拭与交还沿用原素材及原取材范围。下列两版可分别播放；新镜头的动作范围有所收窄，不是逐帧同动作对照。</p><div class="revision-film-grid">${[{label:'首版 · 18 秒',result:revision.originalResult},{label:'返修版 · 18 秒',result:revision.result}].map(item => `<figure class="creative-result"><video controls playsinline preload="none" poster="${esc(item.result.poster)}" aria-label="${esc(item.label)}让故事继续"><source src="${esc(item.result.video)}" type="video/mp4"></video><figcaption>${esc(item.label)}<a href="${esc(item.result.video)}" download>下载 ↓</a></figcaption></figure>`).join('')}</div>${revision.shots.map(shot => `<article class="revision-shot" data-revision-shot="${esc(shot.shotId)}"><h6>${esc(shot.title)} · ${esc(shot.assessmentLabel)}</h6><dl><dt>这次改什么</dt><dd>${esc(shot.change)}</dd><dt>实际看到</dt><dd>${esc(shot.observedEffect)}</dd><dt>仍有的问题</dt><dd><ul>${shot.problems.map(problem => `<li>${esc(problem)}</li>`).join('')}</ul></dd><dt>怎样验收</dt><dd>${esc(shot.check)}</dd></dl><div class="revision-film-grid"><figure class="creative-result"><video controls playsinline preload="none" poster="${esc(shot.before.actualMedia.poster)}" aria-label="${esc(shot.title)}返修前原片"><source src="${esc(shot.before.actualMedia.video)}" type="video/mp4"></video><figcaption>返修前 · 原片 ${shot.before.actualMedia.duration.toFixed(3)} 秒</figcaption></figure><figure class="creative-result"><video controls playsinline preload="none" poster="${esc(shot.actualMedia.poster)}" aria-label="${esc(shot.title)}返修后原片"><source src="${esc(shot.actualMedia.video)}" type="video/mp4"></video><figcaption>返修后 · 原片 ${shot.actualMedia.duration.toFixed(3)} 秒<a href="${esc(shot.actualMedia.video)}" download>下载原片 ↓</a></figcaption></figure></div><details open><summary>关键帧对照 · 以实际视频为准</summary><p>返修前</p><div class="logic-evidence">${shot.before.logicReview.evidenceFrames.map(frame => `<figure><a href="${esc(frame.image)}" target="_blank" rel="noopener noreferrer"><img loading="lazy" src="${esc(frame.image)}" alt="${esc(frame.caption)}"></a><figcaption>${esc(frame.caption)}</figcaption></figure>`).join('')}</div><p>返修后</p><div class="logic-evidence">${shot.evidenceFrames.map(frame => `<figure><a href="${esc(frame.image)}" target="_blank" rel="noopener noreferrer"><img loading="lazy" src="${esc(frame.image)}" alt="${esc(frame.caption)}"></a><figcaption>${esc(frame.caption)}</figcaption></figure>`).join('')}</div></details><details class="experience-input"><summary>返修实际输入 · 双语复制与首尾参考</summary><div class="logic-evidence">${shot.referenceFrames.map(frame => `<figure><a href="${esc(frame.image)}" target="_blank" rel="noopener noreferrer"><img loading="lazy" src="${esc(frame.image)}" alt="${frame.role === 'firstFrame' ? '生成首帧参考' : '生成尾帧参考'}"></a><figcaption>${frame.role === 'firstFrame' ? '首帧参考' : '尾帧参考'} · AI 生成图片，不是视频实测帧</figcaption></figure>`).join('')}</div><h6>实际英文输入</h6><p lang="en">${esc(shot.actualInput.en)}</p><h6>对应中文译文</h6><p lang="zh-CN">${esc(shot.actualInput.translationZh)}</p><p class="studio-help">实际提交英文；中文为对应译文。首尾参考图不可省略为纯文字复制后仍承诺相同效果。</p><div class="experience-copy-actions"><button type="button" data-experience-copy="revision-en" data-case="${esc(caseItem.id)}" data-revision="${esc(revision.id)}" data-shot="${esc(shot.shotId)}">复制返修英文</button><button type="button" data-experience-copy="revision-zh" data-case="${esc(caseItem.id)}" data-revision="${esc(revision.id)}" data-shot="${esc(shot.shotId)}">复制返修中文</button></div></details></article>`).join('')}<h6>本次可复用的经验</h6><ul>${revision.lessons.map(lesson => `<li>${esc(lesson)}</li>`).join('')}</ul><details class="experience-boundary"><summary>返修条件、费用和结论边界</summary><p>${esc(revision.costNote)}</p><ul>${revision.limits.map(limit => `<li>${esc(limit)}</li>`).join('')}</ul></details></section>`).join('');
  }
  function renderActionEvidence(action) {
    if (!action) return '';
    return `<section class="experience-logic"><h6>动作是否合理 · ${esc(action.assessmentLabel)}</h6><p>${esc(action.summary)}</p><ul>${action.checks.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><div class="logic-evidence">${action.evidenceFrames.map(f=>`<figure><a href="${esc(f.image)}" target="_blank" rel="noopener noreferrer"><img loading="lazy" src="${esc(f.image)}" alt="${esc(f.caption)}"></a><figcaption>${esc(f.caption)}<span>原片 ${f.sourceSeconds.toFixed(2)}s / 成片 ${f.filmSeconds.toFixed(2)}s</span></figcaption></figure>`).join('')}</div></section>`;
  }
  function renderEmotionReview(emotion) {
    if (!emotion) return '';
    return `<section class="experience-emotion"><h5>情绪是否表达出来 · 模型对画面的判断</h5><p>${esc(emotion.judgment)}</p><dl><dt>判断依据</dt><dd>${esc(emotion.visibleBasis)}</dd><dt>另一种可能解读</dt><dd>${esc(emotion.alternativeReading)}</dd><dt>声音与观众反馈</dt><dd>${esc(emotion.boundary)}</dd></dl></section>`;
  }
  function renderCaseMemory() {
    const library = window.CASE_LIBRARY;
    if (!library?.cases?.length) return;
    const list = values => `<ul>${values.map(value => `<li>${esc(value)}</li>`).join('')}</ul>`;
    const resultLabel = status => status === 'partially_met' ? '部分符合设计' : '观察到效果 · 精度未量化';
    $('#case-memory').innerHTML = library.cases.map(caseItem => `
      <article class="experience-case" id="experience-${esc(caseItem.id)}" data-experience-case="${esc(caseItem.id)}">
        <div class="experience-case-head"><div><span class="creative-badge">已记录案例 · ${esc(caseItem.recordedAt)}</span><h4>${esc(caseItem.title)}</h4><p>${caseItem.revisions?.length ? '首版历史：' : ''}${esc(caseItem.review.summary)}</p></div><div class="experience-links"><a class="button" href="${esc(caseItem.result.video)}">播放${caseItem.revisions?.length ? '首版' : '成片'} ↗</a><button class="button primary" type="button" data-experience-copy="context" data-case="${esc(caseItem.id)}">复制给模型的复用任务</button></div></div>
        <div class="experience-tags"><span>1 次首版执行${caseItem.revisions?.length ? '＋1 次两镜返修' : ''}</span><span>${esc(caseItem.execution.model)}</span><span>定性观察</span><span>${caseItem.revisions?.length ? '下方保留首版复盘' : '候选改法尚未生成'}</span></div>
        ${caseItem.archiveReview ? `<aside class="archive-followup"><strong>归档补充复核：</strong>${esc(caseItem.archiveReview.summary)} <a href="#archive-issues">查看问题、归因边界与跨镜对照 →</a></aside>` : ''}
        ${caseItem.presentation?.inlineFinalMedia ? `<figure class="creative-result"><video controls playsinline preload="none" poster="${esc(caseItem.result.poster)}" aria-label="${esc(caseItem.title)}${caseItem.result.duration}秒实际成片"><source src="${esc(caseItem.result.video)}" type="video/mp4"></video><figcaption>AI 视频素材＋后期剪辑 · ${caseItem.result.duration} 秒<a href="${esc(caseItem.result.video)}" download>下载成片 ↓</a></figcaption></figure>` : ''}
        ${renderEmotionReview(caseItem.emotionReview)}
        ${renderRevisions(caseItem)}
        ${caseItem.review.logicPriority ? `<p class="experience-logic-priority"><b>内容逻辑优先</b>${esc(caseItem.review.logicPriority)}</p>` : ''}
        <div class="experience-overview"><section><h5>创作目标</h5><p>${esc(caseItem.goal.communicationGoal)}</p><dl><dt>面向谁</dt><dd>${esc(caseItem.goal.audience)}</dd><dt>希望传达的情绪</dt><dd>${esc(caseItem.goal.intendedEmotion)}</dd><dt>检查什么</dt><dd>${list(caseItem.goal.successCriteria)}</dd></dl></section><section><h5>本次实际保留的表达</h5>${list(caseItem.review.effectiveParts)}<details class="experience-boundary"><summary>这些经验的证据边界</summary><p>${esc(caseItem.review.evidenceBasis)}</p>${list(caseItem.review.limits)}</details></section></div>
        <h5 class="experience-subtitle">${caseItem.revisions?.length ? '首版历史' : '逐镜复盘'} · 为什么选、做到了什么、下次怎样改</h5>
        <div class="experience-shot-grid">${caseItem.shotReviews.map((shot, index) => `
          <article class="experience-shot" data-review-shot="${esc(shot.shotId)}">
            <div class="creative-shot-top"><span>SHOT ${String(index + 1).padStart(2, '0')} · 成片 ${shot.edit.timeline.start}–${shot.edit.timeline.end}s</span><span>${resultLabel(shot.outcome)}</span></div>
            <h6>${esc(shot.title)}</h6><p class="experience-intent">${esc(shot.intent)}</p>
            ${caseItem.presentation?.inlineShotMedia ? `<figure class="creative-result"><video controls playsinline preload="none" poster="${esc(shot.actualMedia.poster)}" aria-label="${esc(shot.title)}实际生成素材"><source src="${esc(shot.actualMedia.video)}" type="video/mp4"></video><figcaption>实际素材 · 请求 ${shot.actualInput.requestedDuration} 秒 / 实测 ${shot.actualMedia.duration.toFixed(3)} 秒<a href="${esc(shot.actualMedia.video)}" download>下载原片 ↓</a></figcaption></figure>` : ''}
            <dl><dt>选镜理由</dt><dd>${esc(shot.selectionReason)}</dd><dt>实际效果</dt><dd>${esc(shot.observedEffect)}</dd><dt>问题与验证缺口</dt><dd>${list(shot.problems)}</dd></dl>
            ${renderActionEvidence(shot.actionReview)}
            ${shot.expressionReview ? `<section class="experience-emotion"><h6>本镜的表达判断</h6><p>${esc(shot.expressionReview.judgment)}</p><p><b>可见依据：</b>${esc(shot.expressionReview.visibleBasis)}</p><p><b>仍可能被读成：</b>${esc(shot.expressionReview.alternativeReading)}</p></section>` : ''}
            ${renderLogicReview(shot.logicReview)}
            <div class="experience-shot-links"><a href="${esc(shot.actualMedia.video)}">看本次素材 ↗</a>${shot.techniqueIds.map(id => `<button type="button" data-experience-ref="${esc(id)}">${esc(shots.find(item => item.id === id).name)} ↗</button>`).join('')}</div>
            <details class="experience-next"><summary>下一次怎么改 · 尚未验证</summary><p>${esc(shot.nextAttempt.action)}</p><p><b>原因判断：</b>${esc(shot.causeAssessment)}</p><p><b>怎样验收：</b>${esc(shot.nextAttempt.check)}</p><p class="experience-candidate-label">${esc(shot.nextAttempt.promptRole)}</p><h5>候选中文片段</h5><p lang="zh-CN">${esc(shot.nextAttempt.promptZh)}</p><h5>Candidate English fragment</h5><p lang="en">${esc(shot.nextAttempt.promptEn)}</p><div class="experience-copy-actions"><button type="button" data-experience-copy="candidate-zh" data-case="${esc(caseItem.id)}" data-shot="${esc(shot.shotId)}">复制候选中文</button><button type="button" data-experience-copy="candidate-en" data-case="${esc(caseItem.id)}" data-shot="${esc(shot.shotId)}">复制候选英文</button></div></details>
            <details class="experience-input"><summary>本次实际输入 · ${shot.actualInput.requestedDuration} 秒素材</summary><p>实际提交英文；中文为对应译文。成片截取 ${shot.edit.duration} 秒，原始素材约 ${shot.actualMedia.duration.toFixed(3)} 秒。</p>${shot.referenceFrames ? `<div class="logic-evidence">${shot.referenceFrames.map((f,i)=>`<figure><a href="${esc(f.image)}" target="_blank" rel="noopener noreferrer"><img loading="lazy" src="${esc(f.image)}" alt="${esc(shot.title)}${f.role === 'firstFrame' ? '首帧参考' : f.role === 'endFrame' ? '尾帧参考' : '状态参考图'+(i+1)}"></a><figcaption>${f.role === 'firstFrame' ? '首帧' : f.role === 'endFrame' ? '尾帧' : '参考图 '+(i+1)} · AI图片，不是视频实测帧</figcaption></figure>`).join('')}</div><p class="studio-help">${esc(shot.actualInput.referenceRole)}</p>` : ''}<h5>实际英文输入</h5><p lang="en">${esc(shot.actualInput.en)}</p><h5>对应中文译文</h5><p lang="zh-CN">${esc(shot.actualInput.translationZh)}</p><div class="experience-copy-actions"><button type="button" data-experience-copy="actual-en" data-case="${esc(caseItem.id)}" data-shot="${esc(shot.shotId)}">复制实际英文</button><button type="button" data-experience-copy="actual-zh" data-case="${esc(caseItem.id)}" data-shot="${esc(shot.shotId)}">复制对应中文</button></div></details>
          </article>`).join('')}</div>
        <h5 class="experience-subtitle">可以迁移到新题材的思路</h5>
        <div class="experience-patterns">${caseItem.reusePatterns.map(pattern => `<article><h6>${esc(pattern.title)}</h6><p><span>适用目标</span>${esc(pattern.whenToUse)}</p><p><span>保留的逻辑</span>${esc(pattern.retain)}</p><p><span>可以改写</span>${esc(pattern.adapt)}</p><small>${esc(pattern.limit)}</small></article>`).join('')}</div>
        <details class="experience-production"><summary>执行条件、参考图与复用流程</summary><p>${esc(caseItem.execution.referenceImage.role)}</p><a href="${esc(caseItem.execution.referenceImage.image)}">查看本次主体参考图 ↗</a><p>素材请求：${caseItem.execution.generatedDurations.join('＋')} 秒；成片剪辑：${caseItem.execution.editDurations.join('＋')} 秒。${caseItem.execution.postProduction.titleAdded === false ? '本片未添加片名，保留无字画面。' : '最终文字由后期加入。'}</p><ol>${caseItem.modelUse.workflow.map(step => `<li>${esc(step)}</li>`).join('')}</ol><p>${esc(caseItem.execution.cost.note)}</p></details>
      </article>`).join('');
    $('#case-memory').addEventListener('click', async event => {
      const reference = event.target.closest('[data-experience-ref]');
      if (reference) openDetail(reference.dataset.experienceRef, reference);
      const button = event.target.closest('[data-experience-copy]');
      if (!button) return;
      const caseItem = library.cases.find(item => item.id === button.dataset.case);
      const revision = (caseItem.revisions || []).find(item => item.id === button.dataset.revision);
      const shot = (revision?.shots || caseItem.shotReviews).find(item => item.shotId === button.dataset.shot);
      const type = button.dataset.experienceCopy;
      let value;
      if (type === 'context') {
        const context = {id: caseItem.id, title: caseItem.title, goal: caseItem.goal, review: caseItem.review, emotionReview: caseItem.emotionReview || null, archiveReview: caseItem.archiveReview || null,
          techniques: caseItem.techniques, execution: {model: caseItem.execution.model, generatedDurations: caseItem.execution.generatedDurations, editDurations: caseItem.execution.editDurations},
          shotReviews: caseItem.shotReviews, revisions: caseItem.revisions || [], reusePatterns: caseItem.reusePatterns, modelUse: caseItem.modelUse};
        value = '请基于以下案例经验，围绕我的新简报进行原创视频设计。\n新简报：【填写产品、目标、情绪、时长与已有素材】\n先理解目标、选镜理由、实际效果和问题，再改写主体、意象、场景和节奏。引用案例 ID 与技巧 ID，区分本次观察、原因假设和未验证的候选改法。不要照搬案例剧情，不要承诺精确复现；列出新作品的验收标准。若无法观看视频，请明确仅依据文字记录。\n\n' + JSON.stringify(context, null, 2);
      } else if (type === 'revision-en' || type === 'revision-zh') {
        value = type === 'revision-en' ? shot.actualInput.en : shot.actualInput.translationZh;
      } else {
        value = {'candidate-zh': shot.nextAttempt.promptZh, 'candidate-en': shot.nextAttempt.promptEn,
          'actual-zh': shot.actualInput.translationZh, 'actual-en': shot.actualInput.en}[type];
      }
      const copied = await copyText(value);
      $('#experience-copy-status').textContent = copied ? (type === 'context' ? '已复制案例经验与复用任务，补充新简报后可交给模型参考。' : `已复制${type.startsWith('candidate') ? '尚未验证的候选片段' : '本次实际输入或对应译文'}。`) : '复制未成功，请展开文字后手动复制。';
    });
  }

  function updatePrompt(language) {
    if (!current) return;
    if (language === 'en') {
      const subject = $('#subject-en').value.trim() || '[Subject]';
      $('#prompt-en').value = current.promptEn.replaceAll('[Subject]', subject);
    } else {
      const subject = $('#subject').value.trim() || '【主体】';
      const next = $('#next-scene').value.trim() || '【下一场景】';
      $('#prompt').value = current.prompt.replaceAll('【主体】', subject).replaceAll('【下一场景】', next);
    }
    $('#copy-status').textContent = '';
    $('#prompt-note-warning').hidden = !(current.promptNote || current.mediaNote);
    $('#prompt-note-warning').textContent = [current.promptNote, current.mediaNote].filter(Boolean).join(' ');
  }

  function openDetail(id, trigger) {
    current = shots.find(shot => shot.id === id);
    if (!current) return;
    opener = trigger;
    pauseAll();
    $('#detail-group').textContent = `${current.group} / ${current.en}`;
    $('#detail-title').textContent = current.name;
    $('#detail-desc').textContent = current.short;
    $('#detail-tip').textContent = current.tip;
    const relatedCase = window.CASE_LIBRARY?.cases.find(item => item.techniqueIds.includes(current.id));
    $('#detail-experience').hidden = !relatedCase;
    if (relatedCase) $('#detail-experience').textContent = `查看《${relatedCase.title}》的实际创作复盘 ↗`;
    $('#detail-source').href = sourceUrl(current);
    $('#detail-direct').href = current.video || current.image;
    $('#detail-direct').textContent = current.mediaType === 'video' ? '单独打开视频 ↗' : '单独打开图片 ↗';
    $('#detail-media-label').textContent = `Melies 原站${current.mediaType === 'video' ? '视频' : '图片'}`;
    $('#subject').value = '';
    $('#subject-en').value = '';
    $('#subject-field').hidden = !current.prompt.includes('【主体】');
    $('#subject-en-field').hidden = !current.promptEn.includes('[Subject]');
    $('#scene-example-note').hidden = current.prompt.includes('【主体】');
    $('#next-scene').value = '';
    $('#next-field').hidden = !current.prompt.includes('【下一场景】');
    $('#prompt').value = current.prompt;
    $('#prompt-en').value = current.promptEn;
    $('#copy-status').textContent = '';
    $('#prompt-note-warning').hidden = !(current.promptNote || current.mediaNote);
    $('#prompt-note-warning').textContent = [current.promptNote, current.mediaNote].filter(Boolean).join(' ');
    detailVideo.hidden = current.mediaType !== 'video';
    $('#detail-image').hidden = current.mediaType !== 'image';
    if (current.mediaType === 'video') {
      detailVideo.poster = current.poster;
      detailVideo.src = current.video;
    } else {
      $('#detail-image').src = current.image;
      $('#detail-image').alt = `${current.name}：Melies 原站效果图片`;
    }
    detailVideo.setAttribute('aria-label', `${current.name}：Melies 原站示例视频`);
    $('#detail-video-error').hidden = true;
    $('#detail-play').hidden = current.mediaType !== 'video';
    dialog.showModal();
    dialog.scrollTop = 0;
    document.body.classList.add('modal-open');
  }

  function closeDetail() { dialog.close(); }
  dialog.addEventListener('close', () => {
    detailVideo.pause();
    detailVideo.removeAttribute('src');
    detailVideo.load();
    $('#detail-image').removeAttribute('src');
    document.body.classList.remove('modal-open');
    current = null;
    opener?.focus();
  });
  detailVideo.addEventListener('error', () => {
    if (dialog.open && current) $('#detail-video-error').hidden = false;
  });
  detailVideo.addEventListener('playing', () => { $('#detail-play').hidden = true; });
  $('#detail-image').addEventListener('error', () => {
    if (dialog.open && current?.mediaType === 'image') $('#detail-video-error').hidden = false;
  });
  $('#detail-play').addEventListener('click', async () => {
    try { await detailVideo.play(); }
    catch { $('#detail-video-error').hidden = false; }
  });
  $('#close').addEventListener('click', closeDetail);
  $('#detail-experience').addEventListener('click', closeDetail);
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDetail();
  });
  $('#subject').addEventListener('input', () => updatePrompt('zh'));
  $('#subject-en').addEventListener('input', () => updatePrompt('en'));
  $('#next-scene').addEventListener('input', () => updatePrompt('zh'));
  document.querySelectorAll('[data-detail-copy]').forEach(button => {
    button.addEventListener('click', async () => {
      const english = button.dataset.detailCopy === 'en';
      const ok = await copyText($(english ? '#prompt-en' : '#prompt').value);
      $('#copy-status').textContent = ok ? `已复制${english ? '英文' : '中文'}提示词，可粘贴到你的创作工具。` : '复制未成功，请选中文本手动复制。';
    });
  });
  ['#prompt', '#prompt-en'].forEach(selector => {
    $(selector).addEventListener('input', () => { $('#copy-status').textContent = ''; });
  });
  $('#direct')?.addEventListener('click', event => {
    const reference = event.target.closest('[data-direction-ref]');
    if (reference) openDetail(reference.dataset.directionRef, reference);
  });
  $('#studio-rules').addEventListener('click', event => {
    const reference = event.target.closest('[data-studio-ref]');
    if (reference) openDetail(reference.dataset.studioRef, reference);
  });
  $('#cards').addEventListener('click', async event => {
    const detail = event.target.closest('[data-detail]');
    if (detail) openDetail(detail.dataset.detail, detail);
    const copy = event.target.closest('[data-copy]');
    if (copy) {
      const shot = shots.find(item => item.id === copy.dataset.copy);
      const english = copy.dataset.copyLang === 'en';
      const label = english ? '复制英文' : '复制中文';
      const ok = await copyText(english ? shot.promptEn : shot.prompt);
      copy.textContent = ok ? `已复制${english ? '英文' : '中文'} ✓` : '请打开详情复制';
      setTimeout(() => { if (copy.isConnected) copy.textContent = label; }, 2400);
    }
  });
  $('#filters').addEventListener('click', event => {
    const button = event.target.closest('[data-group]');
    if (!button) return;
    filter = button.dataset.group;
    limit = 24;
    renderFilters();
    renderCards();
  });
  search.addEventListener('input', () => { limit = 24; renderCards(); });
  $('#reset-search').addEventListener('click', () => {
    search.value = '';
    filter = '全部';
    mediaFilter = 'all';
    limit = 24;
    renderFilters();
    renderMediaFilters();
    renderCards();
  });
  $('#load-more').addEventListener('click', () => { limit += 24; renderCards(); });
  $('#show-all').addEventListener('click', () => { limit = shots.length; renderCards(); });
  document.querySelectorAll('[data-quick]').forEach(button => button.addEventListener('click', () => {
    filter = '全部';
    mediaFilter = 'all';
    search.value = button.dataset.quick;
    limit = 24;
    renderFilters();
    renderMediaFilters();
    renderCards();
  }));
  document.addEventListener('keydown', event => {
    if (event.key === '/' && !dialog.open && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      event.preventDefault();
      search.focus();
    }
  });
  if ($('#hero-player')) setupPlayer($('#hero-player'), shots.find(shot => shot.en === '360-Degree Orbit'));
  function renderMediaFilters() {
    document.querySelectorAll('[data-media]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.media === mediaFilter));
    });
  }
  $('#media-filters').addEventListener('click', event => {
    const button = event.target.closest('[data-media]');
    if (!button) return;
    mediaFilter = button.dataset.media;
    limit = 24;
    renderMediaFilters();
    renderCards();
  });
  $('#stat-video').textContent = shots.filter(shot => shot.mediaType === 'video').length;
  $('#stat-image').textContent = shots.filter(shot => shot.mediaType === 'image').length;
  $('#count-video').textContent = $('#stat-video').textContent;
  $('#count-image').textContent = $('#stat-image').textContent;
  renderFilters();
  renderMediaFilters();
  renderCards();
  renderCreativeCase();
  renderCaseMemory();
})();
