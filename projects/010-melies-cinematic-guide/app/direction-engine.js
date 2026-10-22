/* Model-authored emotional direction; local structure checks and prompt assembly. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.EmotionDirection = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const fields = ['goal', 'subject', 'audience', 'feeling', 'avoidFeeling', 'setting', 'assets'];
  const text = value => typeof value === 'string' ? value.normalize('NFC').trim() : '';
  const pair = value => value && typeof value === 'object' && ['zh', 'en'].every(k => text(value[k]) && value[k].length <= 6000);
  const number = (value, low, high) => typeof value === 'number' && Number.isFinite(value) && value >= low && value <= high;
  const strings = value => Array.isArray(value) && value.length > 0 && value.length <= 30 && value.every(v => text(v) && v.length <= 3000);
  function normalizeBrief(input = {}) {
    const result = Object.fromEntries(fields.map(k => [k, text(input[k])]));
    return {...result, duration: Number(input.duration), aspectRatio: text(input.aspectRatio), shotCount: Number(input.shotCount)};
  }
  const briefKey = input => JSON.stringify(normalizeBrief(input));
  function briefErrors(input) {
    const b = normalizeBrief(input), errors = [];
    if (['goal', 'feeling'].some(k => !b[k])) errors.push('请填写创作目标和希望留下的感受。');
    if (fields.some(k => b[k].length > 3000)) errors.push('每项简报请控制在 3000 字符以内。');
    if (!number(b.duration, 1, 300) || !Number.isInteger(b.shotCount) || !number(b.shotCount, 1, 20)) errors.push('目标为 1–300 秒、1–20 镜。');
    if (!['16:9', '9:16', '1:1', '4:3'].includes(b.aspectRatio)) errors.push('请选择支持的画幅。');
    return errors;
  }
  function catalogue(rows) {
    return rows.map(r => ({id: r.id, nameZh: r.name, nameEn: r.en, category: r.group, effect: r.short,
      sourceUrl: 'https://melies.co/cinematic-techniques/' + r.path,
      reviewNotes: [r.promptNote, r.mediaNote].filter(Boolean)}));
  }
  function skeleton(brief) {
    return {schemaVersion: 3, kind: 'creative_direction_pipeline', brief: normalizeBrief(brief),
      creativeDirection: {audience: '', viewingContext: '', proposition: '', intendedResponse: '', assumptions: [''],
        options: [{id: 'direction-a', title: '', promise: '', tradeoff: ''}, {id: 'direction-b', title: '', promise: '', tradeoff: ''}],
        selectedOptionId: '', selectionReason: '', successSignals: [''], misreadRisk: ''},
      situation: {who: '', whereWhen: '', startingState: '', motivation: '', trigger: '', outcome: '',
        causalChain: Array.from({length: Number(brief.shotCount)}, (_, i) => ({shotId: 'shot-' + (i + 1), event: '', change: '', meaning: ''})), continuityRules: ['']},
      referenceSelection: {selected: [], rejected: [], gaps: ['']},
      title: {zh: '', en: ''}, concept: {zh: '', en: ''}, anchor: {zh: '', en: ''}, constraints: {zh: '', en: ''},
      emotion: {viewerExperience: '', progression: 'deepen', opening: '', event: '', ending: '', contextReason: ''},
      provenance: {mode: 'assistant_authored', mediaStatus: 'design_only', modelVersion: null, referenceCaseIds: [], reusedLogic: '', newDesign: '', evidence: ''},
      shots: Array.from({length: Number(brief.shotCount)}, (_, i) => ({id: 'shot-' + (i + 1), title: '', duration: 0,
        emotionalBeat: {intent: '', visibleCause: '', why: '', alternativeReading: ''},
        direction: {zh: '', en: ''},
        action: Object.fromEntries(['before', 'performance', 'after', 'relations'].map(k => [k, {zh: '', en: ''}])),
        expression: Object.fromEntries(['camera', 'composition', 'lighting', 'timing', 'sound'].map(k => [k, {zh: '', en: ''}])),
        references: [], referencePlan: '', transition: {zh: '', en: ''},
        checks: {action: [''], expression: ['']}}))};
  }
  function creativePackage(brief, rows, cases) {
    const caseIndex = cases.map(c => ({id: c.id, title: c.title, goal: c.goal.communicationGoal,
      intendedEmotion: c.goal.intendedEmotion, summary: c.review.summary, revisionSummary: c.revisionSummary || null,
      evidenceStatus: c.review.status, limits: c.review.limits, reusePatterns: c.reusePatterns,
      latestRevision: c.revisions?.at(-1) ? {id: c.revisions.at(-1).id, summary: c.revisions.at(-1).summary,
        shots: c.revisions.at(-1).shots.map(s => ({shotId: s.shotId, observedEffect: s.observedEffect, problems: s.problems}))} : null,
      emotionReview: c.emotionReview || null, archiveReview: c.archiveReview || null}));
    return `请作为创意导演，为下方简报设计原创短片，返回可导入的纯 JSON（不要 Markdown 围栏）。你负责核心判断，网页不进行在线模型推理，也不按情绪关键词替你决定镜头。

按顺序完成：
0. 先做上层创作判断，输出第 3 版 creative_direction_pipeline。creativeDirection 写受众、观看用途、表达命题、期待回应、明确假设、至少两个方向候选及其取舍；selectedOptionId 必须引用候选，说明选择理由、可观察目标和误读风险。situation 写谁在何时何地、初始处境、动机、触发事件与结果；causalChain 按每镜顺序填 {shotId,event,change,meaning}，让事件引发行动与回应，不能只列地点或氛围。continuityRules 列跨镜必须承接的状态。不要套用示例剧情。
1. 理解希望观众感受到什么，区分人物情绪与观众感受。情绪可维持、加深或转折，progression 分别为 maintain/deepen/turn；不强制每镜转折。简报中未指定的主体、场景等非关键条件，由你提出明确设计假设并写入 concept；brief 保留原输入。
2. 提出有意义的情境、事件、可见行动与回应。每镜 emotionalBeat 写意图、可见依据、为何支持感受以及可能的另一种解读。颜色、慢动作或运镜与情绪没有固定对应表。
3. 从全部 ${rows.length} 项轻量索引中自行选择相关参考，可引用任意真实 ID，也可不引用。每条 references 填 {id,purpose,retain,adapt}，解释表达用途、保留关系和本次改写。424 项是视听参考，不能全称为已验证的人物动作。7 项已有结构化规则，其余按本次需要阅读原例后归纳，不虚构执行保证。
4. 读取少量选中完整记录再设计：本项目 projects/010-melies-cinematic-guide/web/capabilities.json 和 case-library.json；对应浏览器文件为 capabilities.json、case-library.json。当前助手可通过项目文件读取；其他环境需附带这些资料。未取得完整记录或未观看原片，要在 evidence 明确说明依据与缺口，不假装看过。原站提示词与示例配对不证明由该词生成。
5. action.before/performance/after/relations 写清动作起止、行动与回应、物体数量、接触、固定/移动部分、轴或路径和跨镜连续性。非接触镜头按实际空间关系写，不强行安排手工动作。
6. expression 分别写一个主要摄影机运动、构图、光线、时间安排和声音。无需被旧试点的 locked/arc_left 限制；以清楚的双语描述为准，仍须实际生成验收。转场说明两端关系与后期方法，复杂转场分别生成。单镜动作和时间安排相容。
7. direction 为可执行的双语情绪表达要求，具体到行动/空间/节奏/声音。referencePlan 说明生成前需要哪些身份、构图或动作起止参考及哪些尚未提供；不虚构已有图片或模型看过素材。
8. checks.action 与 checks.expression 分别写可观察检查。动作成立与情绪传达分开评价。模型自评和观众反馈分开保存，未听片不评声音，未取得观众反馈不宣称情绪命中。
9. provenance.referenceCaseIds 仅引用资料中的父案例 ID；旧书返修 book-repair-r2 写进 evidence，先读最新局部反馈，再读首版历史。新作品保持 assistant_authored/design_only，未知 modelVersion 用 null。不得继承旧案例验证状态或虚构成功率。
10. referenceSelection.selected 每条填 {type:"case"或"technique",id,reason,transfer,adapt,boundary}，写为何用于本目标、迁移什么、如何改写和证据边界。案例集合与 provenance.referenceCaseIds 一致，技巧集合与所有 shots.references 的合集一致；先检索再读完整记录。rejected 至少一条 {type,id,reason}，说明读过但不适合本目标的真实参考；已选项不能同时舍弃。gaps 明确现有库缺口和新增设计。允许不选案例或技巧，勿虚构验证状态。

brief 必须原样保留。shots 数量和总时长必须匹配。所有 {zh,en} 字段都由你写对应双语；网页只拼装，不翻译。每镜 references 可为空，但引用要真实且不可重复。所有数值是设计目标。若能力不足，写明缺口与新设计，不硬套已有素材。

当前简报：
${JSON.stringify(normalizeBrief(brief), null, 2)}

全部轻量索引（用于选择，不等于完整证据）：
${JSON.stringify(catalogue(rows))}

案例索引与边界：
${JSON.stringify(caseIndex)}

请填写以下结构（references 示例结构见要求，空白不是有效方案）：
${JSON.stringify(skeleton(brief), null, 2)}`;
  }
  function pipelineErrors(plan, rows, cases) {
    const errors = [], d = plan.creativeDirection || {}, s = plan.situation || {}, r = plan.referenceSelection || {};
    const complete = (v, keys) => keys.every(k => text(v?.[k]));
    if (!complete(d, ['audience', 'viewingContext', 'proposition', 'intendedResponse', 'selectionReason', 'misreadRisk']) || !strings(d.assumptions) || !strings(d.successSignals)) errors.push('创作方向需要受众、用途、命题、回应、假设、选择理由、检查目标与误读风险。');
    if (!Array.isArray(d.options) || d.options.length < 2 || d.options.length > 6 || d.options.some(o => !complete(o, ['id', 'title', 'promise', 'tradeoff'])) || new Set(d.options.map(o => o?.id)).size !== d.options.length || !d.options.some(o => o?.id === d.selectedOptionId)) errors.push('请比较 2–6 个不同创作方向，并明确选择其中一个。');
    if (!complete(s, ['who', 'whereWhen', 'startingState', 'motivation', 'trigger', 'outcome']) || !strings(s.continuityRules)) errors.push('情境需要人物、时间地点、处境、动机、触发事件、结果和连续性规则。');
    if (!Array.isArray(s.causalChain) || s.causalChain.length !== plan.shots?.length || s.causalChain.some((b, i) => !complete(b, ['shotId', 'event', 'change', 'meaning']) || b.shotId !== plan.shots?.[i]?.id)) errors.push('情境行动链需按分镜顺序逐镜关联 shotId，说明事件、状态变化与意义。');
    const known = {case: new Set(cases.map(c => c.id)), technique: new Set(rows.map(row => row.id))};
    const validRef = ref => ref && ['case', 'technique'].includes(ref.type) && known[ref.type].has(ref.id);
    if (!Array.isArray(r.selected) || r.selected.length > 100 || r.selected.some(ref => !validRef(ref) || !complete(ref, ['reason', 'transfer', 'adapt', 'boundary']))) errors.push('选中参考需要真实案例或技巧 ID、选择理由、迁移逻辑、改写与边界。');
    if (!Array.isArray(r.rejected) || !r.rejected.length || r.rejected.length > 30 || r.rejected.some(ref => !validRef(ref) || !text(ref.reason))) errors.push('至少说明一个未采用的真实参考及原因。');
    if (!strings(r.gaps)) errors.push('请写明现有参考的缺口与本次新增设计。');
    const selected = Array.isArray(r.selected) ? r.selected : [], rejected = Array.isArray(r.rejected) ? r.rejected : [];
    const keys = selected.map(ref => `${ref?.type}:${ref?.id}`), rejectedKeys = rejected.map(ref => `${ref?.type}:${ref?.id}`);
    if (new Set(keys).size !== keys.length || new Set(rejectedKeys).size !== rejectedKeys.length || rejectedKeys.some(k => keys.includes(k))) errors.push('参考不能重复，也不能同时选用与舍弃。');
    const matches = (a, b) => JSON.stringify([...new Set(a)].sort()) === JSON.stringify([...new Set(b)].sort());
    const shotRefs = (Array.isArray(plan.shots) ? plan.shots : []).flatMap(shot => Array.isArray(shot?.references) ? shot.references.map(ref => ref?.id) : []);
    const caseRefs = Array.isArray(plan.provenance?.referenceCaseIds) ? plan.provenance.referenceCaseIds : [];
    if (!matches(selected.filter(ref => ref?.type === 'technique').map(ref => ref.id), shotRefs) || !matches(selected.filter(ref => ref?.type === 'case').map(ref => ref.id), caseRefs)) errors.push('上层选中的技巧与案例必须与逐镜引用、来源案例一致。');
    return errors;
  }
  function validate(plan, brief, rows, cases = []) {
    const errors = briefErrors(brief), add = s => errors.push(s);
    if (!plan || typeof plan !== 'object' || Array.isArray(plan)) return {ok: false, errors: ['请导入分镜对象。']};
    const pipeline = plan.schemaVersion === 3 && plan.kind === 'creative_direction_pipeline';
    if (!pipeline && !(plan.schemaVersion === 2 && plan.kind === 'emotion_action_direction')) add('请使用创作流程的第 3 版结构；也支持原第 2 版情绪与动作稿。');
    if (pipeline) errors.push(...pipelineErrors(plan, rows, cases));
    if (briefKey(plan.brief || {}) !== briefKey(brief)) add('方案简报与当前目标不一致，请重新设计或载入对应简报。');
    for (const k of ['title', 'concept', 'anchor', 'constraints']) if (!pair(plan[k])) add(k + ' 需要对应中英文。');
    const emotion = plan.emotion || {};
    if (!['maintain', 'deepen', 'turn'].includes(emotion.progression) || ['viewerExperience', 'opening', 'ending', 'contextReason'].some(k => !text(emotion[k]))) add('请说明目标感受、情绪走向、起止感受和情境依据。');
    if (emotion.progression === 'turn' && !text(emotion.event)) add('情绪转折需要触发事件。');
    const p = plan.provenance || {}, knownCases = new Set(cases.map(c => c.id));
    if (p.mode !== 'assistant_authored' || p.mediaStatus !== 'design_only' || ['reusedLogic', 'newDesign', 'evidence'].some(k => !text(p[k]))) add('请保留设计状态并说明复用、新增设计与证据边界。');
    if (!Array.isArray(p.referenceCaseIds) || p.referenceCaseIds.some(id => !knownCases.has(id))) add('案例引用不在当前提供的资料中。');
    if (!Array.isArray(plan.shots) || !number(plan.shots.length, 1, 20)) return {ok: false, errors: [...errors, 'shots 需要 1–20 镜。']};
    if (plan.shots.length !== Number(brief.shotCount)) add('镜头数与简报不一致。');
    const known = new Set(rows.map(r => r.id)), seen = new Set();
    let total = 0;
    plan.shots.forEach((s, i) => {
      const label = `第 ${i + 1} 镜：`;
      if (!s || typeof s !== 'object') { add(label + '镜头格式错误。'); return; }
      if (!/^[a-zA-Z0-9_-]{1,64}$/.test(s.id || '') || seen.has(s.id)) add(label + 'ID 不合法或重复。');
      seen.add(s.id);
      if (!text(s.title) || !number(s.duration, .1, 300)) add(label + '需要标题与合法时长。');
      total += number(s.duration, .1, 300) ? s.duration : 0;
      if (['intent', 'visibleCause', 'why', 'alternativeReading'].some(k => !text(s.emotionalBeat?.[k]))) add(label + '情绪意图、可见依据、判断理由与可能的另一种解读均需填写。');
      if (!pair(s.direction) || !pair(s.transition) || !text(s.referencePlan)) add(label + '需要双语表达方向、转场和素材准备说明。');
      for (const k of ['before', 'performance', 'after', 'relations']) if (!pair(s.action?.[k])) add(label + '动作 ' + k + ' 需要对应中英文。');
      for (const k of ['camera', 'composition', 'lighting', 'timing', 'sound']) if (!pair(s.expression?.[k])) add(label + '视听表达 ' + k + ' 需要对应中英文。');
      if (!strings(s.checks?.action) || !strings(s.checks?.expression)) add(label + '分别填写动作检查与表达线索检查。');
      const refs = s.references;
      if (!Array.isArray(refs) || refs.length > 12 || new Set(refs.map(r => r?.id)).size !== refs.length || refs.some(r => !r || !known.has(r.id) || ['purpose', 'retain', 'adapt'].some(k => !text(r[k])))) add(label + '参考需要真实 ID、用途、保留关系与改写说明，且不重复。');
    });
    if (Math.abs(total - Number(brief.duration)) > .001) add('各镜时长之和与目标时长不一致。');
    return {ok: errors.length === 0, errors: [...new Set(errors)]};
  }
  function compile(plan, brief, rows, cases = []) {
    const result = validate(plan, brief, rows, cases);
    if (!result.ok) throw new Error(result.errors.join('\n'));
    const byId = new Map(rows.map(r => [r.id, r]));
    let elapsed = 0;
    const shots = plan.shots.map(s => {
      const start = elapsed; elapsed += s.duration;
      const prompts = Object.fromEntries(['zh', 'en'].map(lang => [lang, [
        lang === 'zh' ? `目标剪辑 ${s.duration} 秒，${brief.aspectRatio}。` : `Target edit: ${s.duration} seconds, ${brief.aspectRatio}.`,
        plan.anchor[lang], s.direction[lang], s.action.before[lang], s.action.performance[lang], s.action.after[lang], s.action.relations[lang],
        ...['camera', 'composition', 'lighting', 'timing', 'sound'].map(k => s.expression[k][lang]), plan.constraints[lang],
        lang === 'zh' ? '不生成叠加片名或字幕；后期排字。实际生成时长、参考图和音轨另行设置。' : 'No generated overlay titles or captions; add text in post. Configure actual generation duration, references and audio separately.'
      ].join('\n')]));
      return {...s, start, end: elapsed, prompts, referenceRecords: s.references.map(ref => {
        const r = byId.get(ref.id);
        return {...ref, nameZh: r.name, nameEn: r.en, sourceUrl: 'https://melies.co/cinematic-techniques/' + r.path,
          mediaType: r.mediaType, mediaUrl: r.video || r.image, reviewNotes: [r.promptNote, r.mediaNote].filter(Boolean)};
      })};
    });
    return {schemaVersion: plan.schemaVersion, status: 'design_only', validationScope: '仅检查字段、引用关联、简报和时长；不验证故事因果、情绪、物理或模型执行。',
      brief: normalizeBrief(brief), storyboard: plan, shots};
  }
  function markdown(pack, language) {
    const langs = language ? [language] : ['zh', 'en'];
    return [`# ${pack.storyboard.title.zh} / ${pack.storyboard.title.en}`, '状态：设计稿，尚未生成或验证。',
      `目标感受：${pack.storyboard.emotion.viewerExperience}`, `结构检查：${pack.validationScope}`,
      ...pipelineMarkdown(pack.storyboard),
      ...pack.shots.map(s => `## ${s.start}–${s.end}s · ${s.title}\n\n情绪任务：${s.emotionalBeat.intent}\n可见依据：${s.emotionalBeat.visibleCause}\n判断理由：${s.emotionalBeat.why}\n另一种解读：${s.emotionalBeat.alternativeReading}\n参考：${s.referenceRecords.map(r => r.id + ' ' + r.sourceUrl).join('；') || '无'}\n素材准备：${s.referencePlan}\n转场：${s.transition.zh}\n\n${langs.map(l => `### ${l === 'zh' ? '中文' : 'English'}\n${s.prompts[l]}`).join('\n\n')}`)].join('\n\n');
  }
  function pipelineMarkdown(plan) {
    if (plan.schemaVersion !== 3) return [];
    const d = plan.creativeDirection, s = plan.situation, r = plan.referenceSelection;
    return ['## 创作方向', `受众：${d.audience}\n用途：${d.viewingContext}\n命题：${d.proposition}\n期待回应：${d.intendedResponse}`,
      d.options.map(o => `${o.id === d.selectedOptionId ? '选用' : '未采用'}「${o.title}」：${o.promise}；取舍：${o.tradeoff}`).join('\n'),
      `选择理由：${d.selectionReason}\n假设：${d.assumptions.join('；')}\n检查目标：${d.successSignals.join('；')}\n误读风险：${d.misreadRisk}`,
      '## 情境与动作', `人物：${s.who}\n时间地点：${s.whereWhen}\n处境：${s.startingState}\n动机：${s.motivation}\n触发：${s.trigger}\n结果：${s.outcome}`,
      s.causalChain.map(b => `${b.shotId}：${b.event} → ${b.change}；意义：${b.meaning}`).join('\n'), `连续性：${s.continuityRules.join('；')}`,
      '## 参考取舍', ...r.selected.map(ref => `${ref.type}:${ref.id}\n为何选择：${ref.reason}\n迁移：${ref.transfer}\n改写：${ref.adapt}\n边界：${ref.boundary}`),
      ...r.rejected.map(ref => `未采用 ${ref.type}:${ref.id}：${ref.reason}`), `缺口与新设计：${r.gaps.join('；')}`];
  }
  function sameDesign(left, right) {
    const canonical = value => {
      if (!value || typeof value !== 'object') return value;
      if (Array.isArray(value)) return value.map(canonical);
      return Object.fromEntries(Object.keys(value).sort().map(k => [k, canonical(value[k])]));
    };
    return JSON.stringify(canonical(left)) === JSON.stringify(canonical(right));
  }
  function keyframesFor(plan, record) {
    if (!record || record.status !== 'generated_key_images_only' || !Array.isArray(record.frames)) return null;
    if (!sameDesign(plan, record.designSnapshot)) return null;
    if (record.frames.length !== plan.shots.length || new Set(record.frames.map(f => f.shotId)).size !== plan.shots.length || record.frames.some(f => !plan.shots.some(s => s.id === f.shotId))) return null;
    return record;
  }
  function reviewDraft(pack, input) {
    if (!text(input.mediaVersion) || !['video_full', 'key_images', 'frames', 'text_only'].includes(input.basis) || !text(input.actionObservation) || !text(input.viewerFeeling)) throw new Error('请填写实际素材／版本、观看依据、动作观察和你的观看感受。');
    return {schemaVersion: 1, type: 'viewer_feedback_draft', evidenceStatus: 'user_reported_not_verified', designSnapshot: pack.storyboard,
      modelReview: null, viewerFeedback: Object.fromEntries(['mediaVersion', 'basis', 'actionObservation', 'expressionObservation', 'viewerFeeling', 'gap', 'nextChange'].map(k => [k, text(input[k])])),
      note: '本机观后反馈草稿，未自动写入经验库；交给助手核对原片与准确执行记录后再入库。模型观察与观众感受分开，不自动宣称动作或情绪验证通过。'};
  }
  return {normalizeBrief, briefKey, briefErrors, catalogue, skeleton, creativePackage, validate, compile, markdown, sameDesign, keyframesFor, reviewDraft};
});
