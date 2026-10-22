import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {capabilityStyles,components,getComponent,recommendedRecipe,validateRecipe,capabilityPrompt} from './capabilities.mjs';
import {validateStory} from './input-schema.mjs';
import {validateBrief,storyPrompt,acceptDraft} from './ai-schema.mjs';
const water=JSON.parse(await readFile(new URL('../../web/world-examples/water.json',import.meta.url),'utf8'));

test('十五种风格的原理、价值、语言、组件和待扩展项都有明确归属',()=>{
  assert.equal(capabilityStyles.length,15);assert.equal(new Set(capabilityStyles.map(s=>s.id)).size,15);
  assert.equal(components.length,17);assert.equal(new Set(components.map(c=>c.id)).size,17);
  for(const s of capabilityStyles){
    assert.equal(s.dna.length,3);assert.ok(s.expression&&s.principle&&s.value&&s.scope&&s.avoid);
    assert.equal(s.maturity,'基础画法原型');assert.ok(s.next.length>=2);
    assert.ok(s.modules.every(id=>getComponent(id)?.status==='available'));
    assert.ok(s.recommended.every(id=>s.modules.includes(id)));validateRecipe(recommendedRecipe(s.id));
  }
});
test('旧故事不隐式增加组件，组合保存回读不会改动世界、分镜或时长',()=>{
  const before=validateStory(water);assert.equal(before.recipe,undefined);
  const combined=validateStory({...water,recipe:recommendedRecipe('cel-boil')});
  const after=validateStory(JSON.parse(JSON.stringify(combined)));
  assert.deepEqual(after.world,before.world);assert.deepEqual(after.shots,before.shots);
  assert.deepEqual(after.recipe,combined.recipe);
  assert.deepEqual(validateRecipe({version:1,components:[]}),{version:1,components:[]});
});
test('组件契约拒绝未知、重复、越界与超量设置，并过滤外部资源字段',()=>{
  for(const recipe of [null,[],{version:2,components:[]},{version:1,components:[{id:'file:///secret',amount:.5}]},{version:1,components:[{id:'paper-grain',amount:NaN}]},{version:1,components:[{id:'paper-grain',amount:-1}]},{version:1,components:[{id:'paper-grain',amount:1.1}]},{version:1,components:[{id:'paper-grain',amount:.5},{id:'paper-grain',amount:.8}]},{version:1,components:components.slice(0,7).map(c=>({id:c.id,amount:.5}))}])assert.throws(()=>validateRecipe(recipe));
  assert.deepEqual(validateRecipe({version:1,script:'evil',components:[{id:'paper-grain',amount:0,url:'https://x'}]}),{version:1,components:[{id:'paper-grain',amount:0}]});
});
test('推荐组合是可独立编辑的值，跨风格组件不会被过滤',()=>{
  const a=recommendedRecipe('cel-boil'),b=recommendedRecipe('cel-boil');a.components[0].amount=.9;
  assert.notDeepEqual(a,b);assert.equal(b.components[0].amount,getComponent('paper-grain').amount);
  assert.deepEqual(validateStory({...water,style:'flat-vector',recipe:{version:1,components:[{id:'paper-grain',amount:.4},{id:'tracking-frame',amount:.6}]}}).recipe.components.map(c=>c.id),['paper-grain','tracking-frame']);
});
test('AI 新创作与改写都接收表达规则，模型不能替换用户的组合',()=>{
  const recipe=recommendedRecipe('cel-boil');
  const request=validateBrief({brief:'小女孩照顾花',tone:'warm',duration:12,character:'auto',mode:'create',engine:'world',protagonist:'',style:'cel-boil',sound:true,boil:1,recipe});
  assert.match(storyPrompt(request),/纸感叠印/);assert.match(storyPrompt(request),/不得依赖它们/);
  const result=acceptDraft({...water,recipe:{version:1,components:[{id:'tracking-frame',amount:1}]},logline:'小女孩关心阳台上的花。',narrative:'小女孩拿起水壶，走到小花旁，慢慢浇水，放下水壶后开心地点头。'},request,'capability-test');
  assert.deepEqual(result.story.recipe,recipe);
  const rewrite=validateBrief({...request,mode:'rewrite',brief:'改得更幽默',recipe:undefined,current:result.story});
  assert.deepEqual(rewrite.recipe,recipe);
  assert.match(capabilityPrompt('hud',{version:1,components:[]}),/无附加组件/);
});
