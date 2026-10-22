/* Contract tests for imported model data, not a video-quality evaluation. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const E = require('./workflow-engine.js');
const load = file => JSON.parse(fs.readFileSync(path.join(__dirname, file), 'utf8'));
const rules = load('technique-rules.json').rules;
const original = load('studio-book-repair.json');
const fresh = () => structuredClone(original);
const validate = p => E.validate(p, original.brief, rules.map(r => r.id), rules);

test('new book story binds its brief, uses three rules and exports four bilingual shots', () => {
  const p = fresh();
  assert.deepEqual(validate(p), {ok: true, errors: []});
  const pack = E.compile(p, p.brief, p.selectedRuleIds, rules);
  assert.equal(pack.status, 'design_only');
  assert.deepEqual(pack.shots.map(s => [s.start, s.end]), [[0, 4], [4, 10], [10, 14], [14, 18]]);
  assert.equal(pack.rules.length, 3);
  assert.match(pack.shots[0].prompts.zh, /纸纤维/);
  assert.match(pack.shots[0].prompts.en, /paper fibers/);
  assert.match(pack.shots[3].prompts.en, /40%/);
  assert.equal(pack.storyboard.provenance.modelVersion, null);
  assert.ok(E.markdown(pack).includes(pack.shots[2].prompts.en));
  assert.equal(E.compile(JSON.parse(JSON.stringify(pack)).storyboard, p.brief, p.selectedRuleIds, rules).shots[0].prompts.en, pack.shots[0].prompts.en);
});
test('screening excludes avoid terms and never forces irrelevant techniques', () => {
  const suggestions = E.suggestRules(original.brief, rules).filter(r => r.suggested).map(r => r.id).sort();
  assert.deepEqual(suggestions, [...original.selectedRuleIds].sort());
  const b = {...original.brief, goal: '早餐记录', subject: '家人', emotion: '相聚', setting: '餐桌', avoid: '微距、体积光、雨、留白、环绕、倒影、圆形转场'};
  assert.equal(E.suggestRules(b, rules).filter(r => r.suggested).length, 0);
  assert.ok(E.suggestRules({...b, setting: '雨夜'}, rules).find(r => r.id === 'atmosphere-rain').excluded.length);
});
test('a changed brief or deselected rule invalidates the imported design', () => {
  const p = fresh();
  assert.equal(E.validate(p, {...p.brief, goal: '拍摄跑步比赛'}, p.selectedRuleIds, rules).ok, false);
  assert.equal(E.validate(p, p.brief, [], rules).ok, false);
  assert.throws(() => E.compile(p, {...p.brief, duration: 30}, p.selectedRuleIds, rules));
});
test('unknown rule references and empty bilingual translations are rejected', () => {
  const p = fresh(); p.selectedRuleIds.push('invented-drone'); p.shots[0].ruleIds.push('invented-drone');
  assert.equal(validate(p).ok, false);
  const q = fresh(); q.shots[0].scene.en = '';
  assert.equal(validate(q).ok, false);
});
test('invalid duration and shot count cannot pass', () => {
  const p = fresh(); p.shots[0].duration = -1;
  assert.equal(validate(p).ok, false);
  const q = fresh(); q.shots[0].duration = 5;
  assert.match(validate(q).errors.join(), /时长之和/);
  const r = fresh(); r.shots.pop();
  assert.match(validate(r).errors.join(), /镜头数量/);
});
test('explicit camera conflicts and missing optical slots fail', () => {
  const p = fresh(); p.shots[0].camera.arcDegrees = 90;
  assert.match(validate(p).errors.join(), /固定机位/);
  const q = fresh(); delete q.shots[0].details.focusTarget;
  assert.equal(validate(q).ok, false);
  const r = fresh(); r.shots[0].camera.movement = 'dolly_and_orbit';
  assert.equal(validate(r).ok, false);
});
test('arc, rain, reflection, volumetric and negative-space parameters are required', () => {
  for (const id of ['camera-movement-arc-left', 'atmosphere-rain', 'composition-reflections']) {
    const p = fresh(); p.selectedRuleIds.push(id); p.rejectedRules = p.rejectedRules.filter(r => r.id !== id); p.shots[0].ruleIds.push(id);
    assert.equal(validate(p).ok, false, id);
  }
  const p = fresh(); p.shots[2].details.volumetric = {zh: '光束'};
  assert.equal(validate(p).ok, false);
  const q = fresh(); q.shots[3].details.negativeSpace.percent = 150;
  assert.equal(validate(q).ok, false);
});
function pairedFixture() {
  const p = fresh(); p.selectedRuleIds.push('editing-graphic-match');
  p.rejectedRules = p.rejectedRules.filter(r => r.id !== 'editing-graphic-match');
  for (const i of [0, 1]) {
    p.shots[i].ruleIds.push('editing-graphic-match');
    p.shots[i].details.graphicMatch = {matchId: 'contract-circle', object: {zh: '测试圆形', en: 'test circle'}, centerX: 0.5, centerY: 0.5, diameterPercent: 40};
  }
  p.shots[0].transitionOut = {type: 'graphic_match', nextShotId: p.shots[1].id};
  return p;
}
test('graphic match requires an adjacent pair with matching geometry, not morphing', () => {
  const p = pairedFixture();
  assert.equal(validate(p).ok, true);
  assert.match(E.compile(p, p.brief, p.selectedRuleIds, rules).shots[0].prompts.en, /No morph or dissolve/);
  p.shots[1].details.graphicMatch.diameterPercent = 45;
  assert.equal(validate(p).ok, false);
  const q = pairedFixture(); q.shots[0].transitionOut.nextShotId = q.shots[2].id;
  assert.equal(validate(q).ok, false);
  const r = pairedFixture(); r.shots[1].transitionOut = {type: 'graphic_match', nextShotId: r.shots[2].id};
  assert.equal(validate(r).ok, false);
});
test('zero selected rules is supported without imposing perfume or book templates', () => {
  const p = fresh(); p.selectedRuleIds = []; p.rejectedRules = [];
  p.shots.forEach(s => { s.ruleIds = []; s.details = {}; });
  assert.equal(validate(p).ok, true);
  const b = {goal: '测试新目标', subject: '一群朋友', audience: '青年', emotion: '欢乐', setting: '操场', avoid: '', duration: 12, aspectRatio: '16:9', shotCount: 4, assets: '无'};
  const task = E.creativePackage(b, [], rules);
  assert.ok(task.includes('测试新目标'));
  assert.ok(!task.includes('靛蓝布面'));
  assert.ok(!task.includes('SHOTS ='));
  assert.deepEqual(E.skeleton(b, []).shots.map(s => s.duration), [0, 0, 0, 0]);
});
test('malformed model JSON yields errors instead of crashing validation', () => {
  for (const p of [null, [], {}, {...fresh(), brief: null}, {...fresh(), shots: [null]}, {...fresh(), shots: [{ruleIds: {bad: 1}, transitionOut: {type: 'graphic_match'}}]}]) {
    assert.doesNotThrow(() => assert.equal(validate(p).ok, false));
  }
});
test('new case references must actually be present in the provided rule context', () => {
  const p = fresh(); p.provenance.referenceCaseIds = ['book-repair'];
  assert.equal(E.validate(p, p.brief, p.selectedRuleIds, rules).ok, false);
  const withFeedback = structuredClone(rules);
  withFeedback[0].caseFeedback = [{caseId: 'book-repair', sampleSize: 1, evidenceStatus: 'one_run_qualitative_review', shots: []}];
  assert.equal(E.validate(p, p.brief, p.selectedRuleIds, withFeedback).ok, true);
  assert.match(E.creativePackage(p.brief, p.selectedRuleIds, withFeedback), /one_run_qualitative_review/);
});
