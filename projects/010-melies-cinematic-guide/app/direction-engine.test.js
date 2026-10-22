/* Contracts for model judgment and evidence boundaries, not emotion evaluation. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const E = require('./direction-engine.js');
const load = name => JSON.parse(fs.readFileSync(path.join(__dirname, name), 'utf8'));
const context = {window: {}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'data.js'), 'utf8'), context);
const rows = JSON.parse(JSON.stringify(context.window.SHOTS));
const cases = [{id: 'book-repair'}, {id: 'rain-to-forest'}];
const original = load('direction-example.json');
const fresh = () => structuredClone(original);
const check = p => E.validate(p, original.brief, rows, cases);

test('all 424 references are available and a new design uses follow/dolly outside the seven-rule pilot', () => {
  assert.equal(E.catalogue(rows).length, 424);
  const p = fresh(); assert.deepEqual(check(p), {ok: true, errors: []});
  const pack = E.compile(p, p.brief, rows, cases);
  assert.deepEqual(pack.shots.map(s => [s.start, s.end]), [[0, 5], [5, 10], [10, 15]]);
  assert.equal(pack.shots[1].referenceRecords[0].id, 'camera-movement-follow');
  assert.equal(pack.shots[2].referenceRecords[0].id, 'camera-movement-dolly-out');
  assert.match(pack.shots[1].prompts.en, /Follow behind/);
  assert.ok(pack.shots[0].prompts.zh.includes(p.shots[0].action.relations.zh));
  assert.ok(E.markdown(pack).includes(p.shots[1].emotionalBeat.why));
  assert.deepEqual(E.compile(JSON.parse(JSON.stringify(pack)).storyboard, p.brief, rows, cases).shots.map(s => s.prompts), pack.shots.map(s => s.prompts));
});
test('missing emotional reasoning, action relations or expression checks cannot masquerade as a complete design', () => {
  for (const change of [p => p.shots[0].emotionalBeat.why = '', p => p.shots[1].action.relations.en = '', p => p.shots[2].checks.expression = []]) {
    const p = fresh(); change(p); assert.equal(check(p).ok, false);
  }
});
test('unknown or duplicate references and missing adaptations are rejected', () => {
  for (const change of [p => p.shots[1].references[0].id = 'invented-camera', p => p.shots[0].references.push(p.shots[0].references[0]), p => p.shots[2].references[0].adapt = '']) {
    const p = fresh(); change(p); assert.equal(check(p).ok, false);
  }
});
test('emotion may remain or deepen without a forced turning event; a turn requires an event', () => {
  const p = fresh(); p.emotion.progression = 'maintain'; p.emotion.event = '';
  assert.equal(check(p).ok, true);
  p.emotion.progression = 'turn'; assert.equal(check(p).ok, false);
});
test('brief/duration/identity and actual evidence boundaries survive imports', () => {
  const p = fresh(); p.brief.feeling += '改变'; assert.equal(check(p).ok, false);
  const wrongDuration = fresh(); wrongDuration.shots[0].duration = 6; assert.equal(check(wrongDuration).ok, false);
  const fabricated = fresh(); fabricated.provenance.mediaStatus = 'generated'; assert.equal(check(fabricated).ok, false);
  const revisionAsCase = fresh(); revisionAsCase.provenance.referenceCaseIds = ['book-repair-r2']; assert.equal(check(revisionAsCase).ok, false);
});
test('model task contains the full index and keeps the current assistant responsible for judgment', () => {
  const task = E.creativePackage(original.brief, rows, [
    {id: 'book-repair', title: '旧书', goal: {communicationGoal: '照料', intendedEmotion: '安心'}, review: {summary: '首版偏差', status: 'one_run_qualitative_review', limits: ['无受众测试']}, revisionSummary: '孔位改善'}
  ]);
  assert.ok(task.includes(rows[423].id));
  assert.match(task, /没有固定对应表/);
  assert.match(task, /模型自评和观众反馈分开保存/);
  assert.match(task, /未重新观看|未观看原片/);
  assert.match(task, /少量选中完整记录/);
});
test('viewer feedback is a bound draft, not model observation or a verified new case', () => {
  const p = fresh(), pack = E.compile(p, p.brief, rows, cases);
  const review = E.reviewDraft(pack, {mediaVersion: '仅用于单元测试的版本', basis: 'text_only', actionObservation: '只参考设计文字', viewerFeeling: '没有观看视频'});
  assert.equal(review.evidenceStatus, 'user_reported_not_verified');
  assert.equal(review.modelReview, null);
  assert.deepEqual(review.designSnapshot, p);
  assert.throws(() => E.reviewDraft(pack, {mediaVersion: '', basis: '', actionObservation: '', viewerFeeling: ''}));
});
test('malformed imported data returns errors and an empty reference list is permitted', () => {
  for (const p of [null, [], {}, {shots: [null]}]) assert.equal(check(p).ok, false);
  const p = fresh(); p.shots.forEach(s => s.references = []); assert.equal(check(p).ok, true);
  assert.equal(E.briefErrors({...p.brief, subject: '', setting: ''}).length, 0);
});

test('key images belong to the complete unchanged design, never just matching shot IDs', () => {
  const p = fresh(), record = {status: 'generated_key_images_only', designSnapshot: p, frames: p.shots.map(s => ({shotId: s.id}))};
  assert.equal(E.keyframesFor(p, record), record);
  const reordered = Object.fromEntries(Object.entries(p).reverse());
  assert.equal(E.keyframesFor(reordered, record), record);
  const changed = fresh(); changed.shots[0].action.performance.zh += '另一动作';
  assert.equal(E.keyframesFor(changed, record), null);
  assert.equal(E.keyframesFor(p, {...record, status: 'video_generated'}), null);
  assert.equal(E.keyframesFor(p, {...record, frames: [record.frames[0], record.frames[0], record.frames[2]]}), null);
  assert.equal(E.keyframesFor(p, null), null);
});

test('generated key image feedback stays a static user-reported draft', () => {
  const pack = E.compile(original, original.brief, rows, cases);
  const review = E.reviewDraft(pack, {mediaVersion: '静态关键画面', basis: 'key_images', actionObservation: '仅看到托杯姿态', viewerFeeling: '测试记录，不是受众结论'});
  assert.equal(review.viewerFeedback.basis, 'key_images');
  assert.equal(review.evidenceStatus, 'user_reported_not_verified');
  assert.equal(review.modelReview, null);
  assert.equal(pack.status, 'design_only');
});

const pipeline = load('pipeline-example.json');
const pipelineCases = [{id: 'book-repair'}, {id: 'tea-moment'}];
const checkPipeline = p => E.validate(p, pipeline.brief, rows, pipelineCases);
test('the new topic carries direction choices and causal shot links through import and bilingual export', () => {
  assert.deepEqual(checkPipeline(pipeline), {ok: true, errors: []});
  const pack = E.compile(pipeline, pipeline.brief, rows, pipelineCases);
  assert.equal(pack.schemaVersion, 3);
  assert.equal(pack.status, 'design_only');
  assert.deepEqual(pack.shots.map(s => [s.start, s.end]), [[0, 5], [5, 10], [10, 15], [15, 20]]);
  const md = E.markdown(pack);
  for (const value of [pipeline.creativeDirection.selectionReason, pipeline.situation.motivation,
    pipeline.situation.causalChain[2].change, pipeline.referenceSelection.selected[0].boundary,
    pipeline.referenceSelection.rejected[0].reason, pack.shots[3].prompts.zh, pack.shots[3].prompts.en]) assert.ok(md.includes(value));
  const reimport = E.compile(JSON.parse(JSON.stringify(pack)).storyboard, pipeline.brief, rows, pipelineCases);
  assert.deepEqual(reimport, pack);
  assert.equal(E.keyframesFor(pipeline, {status: 'generated_key_images_only', designSnapshot: original, frames: original.shots.map(s => ({shotId: s.id}))}), null);
});
test('direction and action links cannot be silently lost or point at an unrelated choice or shot', () => {
  const mutations = [p => delete p.creativeDirection, p => p.creativeDirection.selectedOptionId = 'nonexistent',
    p => p.creativeDirection.options = [p.creativeDirection.options[0]], p => p.situation.motivation = '',
    p => p.situation.causalChain.reverse(), p => p.situation.causalChain[1].shotId = 'tea-2'];
  for (const mutate of mutations) {
    const p = structuredClone(pipeline); mutate(p); assert.equal(checkPipeline(p).ok, false);
  }
});
test('upstream reference choices must match both the storyboard and case provenance', () => {
  const mutations = [p => p.referenceSelection.selected.pop(),
    p => p.provenance.referenceCaseIds = ['book-repair'],
    p => p.referenceSelection.rejected.push({type: 'case', id: 'tea-moment', reason: 'contradictory'}),
    p => p.referenceSelection.selected[0].boundary = '',
    p => p.referenceSelection.rejected[0].id = 'invented-technique'];
  for (const mutate of mutations) {
    const p = structuredClone(pipeline); mutate(p); assert.equal(checkPipeline(p).ok, false);
  }
  const noReferences = structuredClone(pipeline);
  noReferences.referenceSelection.selected = []; noReferences.provenance.referenceCaseIds = [];
  noReferences.shots.forEach(s => s.references = []);
  assert.equal(checkPipeline(noReferences).ok, true);
});
test('malformed upstream imports report errors without crashing and cannot claim production', () => {
  const mutations = [p => p.creativeDirection.options = [null, false], p => p.situation.causalChain = null,
    p => p.referenceSelection.selected = [null, {type: 'toString', id: 'x'}],
    p => p.provenance.referenceCaseIds = {}, p => p.shots = [null], p => p.provenance.mediaStatus = 'generated'];
  for (const mutate of mutations) {
    const p = structuredClone(pipeline); mutate(p);
    assert.doesNotThrow(() => checkPipeline(p)); assert.equal(checkPipeline(p).ok, false);
  }
});
test('the current goal determines the model handoff; changing it invalidates the authored example', () => {
  const brief = {...pipeline.brief, goal: '为社区夜校设计一个新的相遇故事'};
  const task = E.creativePackage(brief, rows, []);
  assert.ok(task.includes(brief.goal));
  assert.ok(task.includes('creative_direction_pipeline') && task.includes('referenceSelection'));
  assert.equal(task.includes(pipeline.title.zh), false);
  assert.equal(E.validate(pipeline, brief, rows, pipelineCases).ok, false);
});
