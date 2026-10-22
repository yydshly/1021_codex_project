/* Pure, local rule retrieval / validation / compilation. No model call occurs here. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ShotWorkflow = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const textFields = ['goal', 'subject', 'audience', 'emotion', 'setting', 'avoid', 'assets'];
  const ids = ['lenses-macro', 'atmosphere-rain', 'editing-graphic-match', 'camera-movement-arc-left', 'composition-reflections', 'composition-negative-space', 'lighting-volumetric-light'];
  const clean = value => typeof value === 'string' ? value.normalize('NFC').trim() : '';
  const pair = value => value && typeof value === 'object' && ['zh', 'en'].every(k => clean(value[k]).length > 0 && value[k].length <= 6000);
  const unique = arr => Array.isArray(arr) && new Set(arr).size === arr.length;
  const number = (v, min, max) => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;
  function normalizeBrief(input = {}) {
    input = input || {};
    const b = Object.fromEntries(textFields.map(k => [k, clean(input[k])]));
    b.duration = Number(input.duration);
    b.aspectRatio = clean(input.aspectRatio);
    b.shotCount = Number(input.shotCount);
    return b;
  }
  const briefKey = b => JSON.stringify(normalizeBrief(b));
  function briefErrors(input) {
    const b = normalizeBrief(input), e = [];
    for (const k of ['goal', 'subject', 'emotion', 'setting']) if (!b[k]) e.push('请填写目标、主体、感受与场景。');
    if (textFields.some(k => b[k].length > 3000)) e.push('每项简报请控制在 3000 字符以内。');
    if (!number(b.duration, 1, 300)) e.push('目标时长须为 1–300 秒。');
    if (!Number.isInteger(b.shotCount) || !number(b.shotCount, 1, 20)) e.push('镜头数量须为 1–20 的整数。');
    if (!['16:9', '9:16', '1:1', '4:3'].includes(b.aspectRatio)) e.push('请选择支持的画幅。');
    return [...new Set(e)];
  }
  function suggestRules(input, rules) {
    const b = normalizeBrief(input);
    const positive = ['goal', 'subject', 'emotion', 'setting'].map(k => b[k]).join('\n').toLowerCase();
    const avoid = b.avoid.toLowerCase();
    return rules.map(rule => {
      const matches = rule.keywords.filter(k => positive.includes(k.toLowerCase()));
      const excluded = rule.keywords.filter(k => avoid.includes(k.toLowerCase()));
      return {id: rule.id, matches, excluded, suggested: matches.length > 0 && excluded.length === 0};
    });
  }
  function skeleton(brief, selected) {
    return {
      schemaVersion: 1, brief: normalizeBrief(brief),
      title: {zh: '', en: ''}, concept: {zh: '', en: ''}, constraints: {zh: '', en: ''},
      intention: {emotionStart: '', turningEvent: '', emotionEnd: ''}, anchor: {zh: '', en: ''},
      selectedRuleIds: [...selected], rejectedRules: [],
      provenance: {mode: 'assistant_authored', mediaStatus: 'design_only', modelVersion: null, referenceCaseIds: [], reusedLogic: '', newDesign: '', evidence: ''},
      shots: Array.from({length: Number(brief.shotCount)}, (_, i) => ({
        id: 'shot-' + (i + 1), title: '', duration: 0, task: '', ruleIds: [], reason: '',
        scene: {zh: '', en: ''}, camera: {movement: 'locked', view: {zh: '', en: ''}},
        composition: {zh: '', en: ''}, lighting: {zh: '', en: ''}, sound: {zh: '', en: ''},
        details: {}, transitionOut: {type: 'cut'}, checks: []
      }))
    };
  }
  function creativePackage(brief, selected, rules) {
    const chosen = rules.filter(r => selected.includes(r.id));
    return `请作为创意导演，围绕以下简报创作一个新故事，并返回可导入的纯 JSON 分镜稿（不要 Markdown 围栏）。\n\n当前简报（brief 必须原样保留）：\n${JSON.stringify(normalizeBrief(brief), null, 2)}\n\n候选规则与相关经验：\n${JSON.stringify(chosen, null, 2)}\n\n任务：先明确情绪变化与推进它的事件，再选择实际需要的规则。可以少用或全部不用候选规则，不要为了用技巧而改变目标。不可引用未提供的规则 ID。逐镜给出选镜理由、一个主要动作、独立可复制的中英文设计字段、统一外观锚点及检查方法。若本批 7 项规则不足，请在说明中明确局限，不要虚构新规则 ID。\n\n有 revisions 时，先读最新局部返修的实际观察、残留问题和证据边界，再读首版历史；首版 nextAttempt 的未生成状态保留当时语义，不能冒充返修结论，也不能将局部改善说成稳定能力。引用局部返修时，referenceCaseIds 仍填父案例 ID，返修 ID 写入 evidence。只参考文字复盘时，evidence 写明未观看原片；这是新设计，不继承参考案例的验证状态。不要虚构实际生成、模型版本、参考素材、受众效果或成功率。provenance.mode 保持 assistant_authored，mediaStatus 保持 design_only，未知 modelVersion 用 null。\n\n内容逻辑优先（由模型设计并人工审片，网页不自动验真）：先在各镜 reason 与 checks 写明动作作用于哪个对象的哪个位置、固定部分和连接轴、施力与移动方向、动作前后状态以及跨镜方向。穿针要能对应目标孔位，开合要围绕同一连接轴；只出现针线或合拢后的外观不算逻辑成立。先检查物体结构与动作因果，再考虑技巧、风格与情绪表达。\n\n结构约束：\n- selectedRuleIds 只列实际使用的规则，等于所有镜头 ruleIds 的并集；不使用的候选规则可在 rejectedRules 中写原因。\n- shots 数量等于 brief.shotCount；每镜 duration 为正数，合计等于 brief.duration。时长是剪辑设计目标，不代表某生成工具支持。\n- camera.movement 只允许 locked 或 arc_left；arc_left 必须引用 camera-movement-arc-left 并填写 arcDegrees（1–180 的设计目标）。view 写机位和景别，不要再加入第二个相机运动。locked 是本批试点的静态基线；其他运镜需另行扩展规则。\n- 使用 lenses-macro 时 details.focusTarget={zh,en}；atmosphere-rain 时 details.rain={zh,en}；composition-reflections 时 details.reflection={zh,en}；lighting-volumetric-light 时 details.volumetric={zh,en}，写明光源、方向和散射介质。\n- composition-negative-space 时 details.negativeSpace={side:"left"或"right",percent:1至90的数值,subjectPlacement:{zh,en}}。比例是待验收目标。\n- editing-graphic-match 时，两相邻镜头 details.graphicMatch={matchId:"同一标记",object:{zh,en},centerX:0至1,centerY:0至1,diameterPercent:1至100}，两镜几何数值相同；前镜 transitionOut={type:"graphic_match",nextShotId:"后镜ID"}；后镜不再发起该匹配。分别生成两个不同圆形物体，后期硬切，禁止形变或溶解。\n- 其他 transitionOut.type 可为 cut 或 fade；最后一镜不可发起 graphic_match。\n- title、concept、constraints、anchor、scene、view、composition、lighting、sound、各 details 文本必须有对应 zh/en；不要指望网页自动翻译。constraints 翻译本次禁止项。\n- task、reason、checks、intention、rejectedRules.reason、provenance 的说明可用中文。checks 每镜至少一项。片名字幕后期制作，不让模型直接画字。\n- 结构校验只能检查显式字段，语义、物理、情绪与模型执行还需人工和实际素材复核。\n\n请填写以下结构，空白不是有效分镜，不要直接回传模板：\n${JSON.stringify(skeleton(brief, selected), null, 2)}`;
  }
  function validate(plan, input, selected, rules) {
    const errors = briefErrors(input), allowed = new Set((rules || []).map(r => r.id));
    const add = msg => errors.push(msg);
    if (!plan || typeof plan !== 'object' || Array.isArray(plan)) return {ok: false, errors: ['分镜必须为 JSON 对象。']};
    if (plan.schemaVersion !== 1) add('分镜 schemaVersion 必须为 1。');
    if (briefKey(plan.brief) !== briefKey(input)) add('分镜简报与当前目标不同。请使用当前创作包重新设计，或载入对应简报。');
    for (const k of ['title', 'concept', 'constraints', 'anchor']) if (!pair(plan[k])) add(`${k} 需要完整中英文。`);
    if (!plan.intention || ['emotionStart', 'turningEvent', 'emotionEnd'].some(k => !clean(plan.intention[k]))) add('请写明起始感受、转折事件和结束感受。');
    const p = plan.provenance;
    if (!p || p.mode !== 'assistant_authored' || p.mediaStatus !== 'design_only') add('导入稿必须标注为助手创作、尚未生成的视频设计。');
    if (p && ['reusedLogic', 'newDesign', 'evidence'].some(k => !clean(p[k]))) add('请说明参考逻辑、新增设计与证据边界。');
    const knownCases = new Set(['rain-to-forest', ...(rules || []).flatMap(r => (r.caseFeedback || []).map(c => c.caseId))]);
    if (p && (!Array.isArray(p.referenceCaseIds) || p.referenceCaseIds.some(id => !knownCases.has(id)))) add('不能引用当前资料中不存在的案例。');
    const chosen = Array.isArray(plan.selectedRuleIds) ? plan.selectedRuleIds : [];
    if (!unique(plan.selectedRuleIds) || chosen.some(id => !allowed.has(id) || !ids.includes(id))) add('selectedRuleIds 含未知或重复规则。');
    if (selected && chosen.some(id => !selected.includes(id))) add('分镜使用了当前未选的规则；请先核对候选选择。');
    if (!Array.isArray(plan.rejectedRules) || plan.rejectedRules.some(r => !r || !allowed.has(r.id) || chosen.includes(r.id) || !clean(r.reason))) add('未选规则说明含无效引用或缺少原因。');
    if (!Array.isArray(plan.shots) || plan.shots.length === 0 || plan.shots.length > 20) return {ok: false, errors: [...errors, 'shots 需要 1–20 个镜头。']};
    const shots = plan.shots;
    if (shots.length !== Number(input.shotCount)) add('镜头数量与当前简报不一致。');
    if (!unique(shots.map(s => s && s.id))) add('镜头 ID 不能重复。');
    const used = new Set();
    shots.forEach((shot, i) => {
      const label = `第 ${i + 1} 镜：`;
      if (!shot || typeof shot !== 'object') { add(label + '不是镜头对象。'); return; }
      if (!/^[a-zA-Z0-9_-]{1,64}$/.test(shot.id || '')) add(label + 'ID 使用 1–64 位字母、数字、下划线或连字符。');
      for (const k of ['title', 'task', 'reason']) if (!clean(shot[k])) add(label + `缺少 ${k}。`);
      if (!number(shot.duration, 0.1, 300)) add(label + 'duration 必须是正数秒。');
      for (const k of ['scene', 'composition', 'lighting', 'sound']) if (!pair(shot[k])) add(label + `${k} 需要完整中英文。`);
      const refs = Array.isArray(shot.ruleIds) ? shot.ruleIds : [];
      if (!unique(shot.ruleIds) || refs.some(id => !chosen.includes(id))) add(label + '规则引用无效或重复。');
      refs.forEach(id => used.add(id));
      const cam = shot.camera || {};
      if (!['locked', 'arc_left'].includes(cam.movement) || !pair(cam.view)) add(label + '需要一个支持的主要摄影机运动及双语机位。');
      const arc = refs.includes('camera-movement-arc-left');
      if ((cam.movement === 'arc_left') !== arc) add(label + '环绕运动与 arc-left 规则必须同时出现。');
      if (arc && !number(cam.arcDegrees, 1, 180)) add(label + '环绕角度须为 1–180 的设计目标。');
      if (!arc && cam.arcDegrees != null) add(label + '固定机位不能同时填写环绕角度。');
      const d = shot.details || {};
      for (const [id, key] of [['lenses-macro', 'focusTarget'], ['atmosphere-rain', 'rain'], ['composition-reflections', 'reflection'], ['lighting-volumetric-light', 'volumetric']]) {
        if (refs.includes(id) && !pair(d[key])) add(label + `使用 ${id} 需要双语 ${key}。`);
        if (!refs.includes(id) && d[key] != null) add(label + `${key} 存在但未引用对应规则。`);
      }
      const n = d.negativeSpace;
      if (refs.includes('composition-negative-space') && (!n || !['left', 'right'].includes(n.side) || !number(n.percent, 1, 90) || !pair(n.subjectPlacement))) add(label + '留白需要方向、1–90% 目标比例和双语主体位置。');
      if (!refs.includes('composition-negative-space') && n != null) add(label + '留白参数未引用对应规则。');
      const g = d.graphicMatch;
      if (refs.includes('editing-graphic-match') && (!g || !clean(g.matchId) || !pair(g.object) || !number(g.centerX, 0, 1) || !number(g.centerY, 0, 1) || !number(g.diameterPercent, 1, 100))) add(label + '图形匹配需要圆形物体、配对标记及合法几何参数。');
      if (!refs.includes('editing-graphic-match') && g != null) add(label + '图形匹配参数未引用对应规则。');
      const t = shot.transitionOut || {};
      if (!['cut', 'graphic_match', 'fade'].includes(t.type)) add(label + '转场只支持 cut、graphic_match 或 fade。');
      if (!Array.isArray(shot.checks) || shot.checks.length === 0 || shot.checks.some(s => !clean(s))) add(label + '至少填写一项具体检查。');
    });
    if (Math.abs(shots.reduce((sum, s) => sum + (typeof s?.duration === 'number' ? s.duration : 0), 0) - Number(input.duration)) > 0.001) add('各镜时长之和必须等于当前目标时长。');
    if (chosen.some(id => !used.has(id))) add('selectedRuleIds 中有未在分镜使用的规则。');
    const paired = new Set();
    const hasGraphic = s => Array.isArray(s?.ruleIds) && s.ruleIds.includes('editing-graphic-match');
    shots.forEach((s, i) => {
      if (s?.transitionOut?.type !== 'graphic_match') return;
      const next = shots[i + 1], a = s.details?.graphicMatch, b = next?.details?.graphicMatch;
      if (!a || !b || !hasGraphic(s) || !hasGraphic(next) || s.transitionOut.nextShotId !== next.id || a.matchId !== b.matchId || ['centerX', 'centerY', 'diameterPercent'].some(k => a[k] !== b[k]) || paired.has(i)) {
        add(`第 ${i + 1} 镜：图形匹配必须连接相邻两镜，且标记、圆心、尺寸一致；不能重叠配对。`);
      } else { paired.add(i); paired.add(i + 1); }
    });
    shots.forEach((s, i) => { if (hasGraphic(s) && !paired.has(i)) add(`第 ${i + 1} 镜：图形匹配没有完整配对。`); });
    return {ok: errors.length === 0, errors: [...new Set(errors)]};
  }
  function compile(plan, input, selected, rules) {
    const result = validate(plan, input, selected, rules);
    if (!result.ok) throw new Error(result.errors.join('\n'));
    let elapsed = 0;
    const shots = plan.shots.map(s => {
      const start = elapsed; elapsed += s.duration;
      const prompts = {};
      for (const lang of ['zh', 'en']) {
        const zh = lang === 'zh', d = s.details || {}, cam = s.camera;
        const clauses = [zh ? `目标剪辑时长 ${s.duration} 秒，画幅 ${input.aspectRatio}。单个连续镜头。` : `Target edit duration ${s.duration} seconds, aspect ratio ${input.aspectRatio}. One continuous shot.`, plan.anchor[lang], s.scene[lang], cam.view[lang], cam.movement === 'locked' ? (zh ? '摄影机保持固定。' : 'Keep the camera locked off.') : (zh ? `摄影机沿主体左侧弧线移动约 ${cam.arcDegrees} 度，并持续朝向主体；角度为设计目标，需检查起止视点。` : `Arc the camera left about ${cam.arcDegrees} degrees around the subject, always facing it; verify the start and end views against this target.`), s.composition[lang], s.lighting[lang]];
        for (const key of ['focusTarget', 'rain', 'reflection', 'volumetric']) if (d[key]) clauses.push(d[key][lang]);
        if (d.negativeSpace) {
          const n = d.negativeSpace;
          clauses.push(n.subjectPlacement[lang], zh ? `在${n.side === 'right' ? '右' : '左'}侧保留约 ${n.percent}% 空白，比例为待量取的设计目标。` : `Reserve roughly ${n.percent}% negative space on the ${n.side}; measure the result rather than assuming exact compliance.`);
        }
        if (d.graphicMatch) {
          const g = d.graphicMatch;
          clauses.push(g.object[lang], zh ? `圆形构图目标：归一化圆心 (${g.centerX}, ${g.centerY})，直径占画面高度 ${g.diameterPercent}%。本镜只生成该物体；与另一镜分别生成，后期沿共享圆形硬切，禁止形变或溶解。` : `Circular framing target: normalized center (${g.centerX}, ${g.centerY}), diameter ${g.diameterPercent}% of frame height. Generate only this object in this clip; generate the paired clip separately and hard-cut on the shared circle in post. No morph or dissolve.`);
        }
        clauses.push(zh ? `声音设计：${s.sound.zh}` : `Sound design: ${s.sound.en}`, plan.constraints[lang], zh ? '不生成叠加字幕、片名或标志；片名后期制作。音轨和时长按目标工具能力另行设置。' : 'No overlaid captions, titles or logos; add titles in post-production. Set audio and duration separately according to the target tool.');
        prompts[lang] = clauses.join('\n');
      }
      return {id: s.id, title: s.title, start, end: elapsed, duration: s.duration, ruleIds: s.ruleIds, prompts};
    });
    return {schemaVersion: 1, status: 'design_only', compiler: 'local_rule_compiler_v1', validationScope: '结构、显式引用、参数与时长；不验证语义、情绪、物理或模型执行。', brief: normalizeBrief(input), title: plan.title, provenance: plan.provenance, rules: rules.filter(r => plan.selectedRuleIds.includes(r.id)), storyboard: plan, shots};
  }
  function markdown(pack, language) {
    const languages = language ? [language] : ['zh', 'en'];
    return [`# ${pack.title.zh} / ${pack.title.en}`, '状态：助手创作的分镜设计；本文件不代表生成结果，实际执行另记。', `目标：${pack.brief.goal}`, `时长：${pack.brief.duration} 秒；画幅：${pack.brief.aspectRatio}`, `结构校验范围：${pack.validationScope}`, ...pack.shots.map(s => `## ${s.start}–${s.end}s · ${s.title}\n规则：${s.ruleIds.join(', ') || '无'}\n\n${languages.map(l => `### ${l === 'zh' ? '中文' : 'English'}\n${s.prompts[l]}`).join('\n\n')}`)].join('\n\n');
  }
  return {normalizeBrief, briefKey, briefErrors, suggestRules, skeleton, creativePackage, validate, compile, markdown};
});
