import test from 'node:test';
import assert from 'node:assert/strict';
import {styles,styleIds,validateStyle} from './styles.mjs';
import {validateStory} from './input-schema.mjs';
import {validateBrief,storyPrompt,acceptDraft} from './ai-schema.mjs';
const story={schemaVersion:2,title:'再试一次',signature:'每一步都算数',character:'star',palette:'lake',boil:1,sound:false,shots:[
  {id:'one',caption:'看见目标',action:'observe',emotion:'curious',duration:2},
  {id:'two',caption:'一步一步靠近',action:'walk',emotion:'determined',duration:2},
  {id:'three',caption:'这次没成功',action:'fail',emotion:'sad',duration:2},
  {id:'four',caption:'换一个方法',action:'float',emotion:'determined',duration:3},
  {id:'five',caption:'看，我做到了',action:'celebrate',emotion:'happy',duration:3},
]};
const brief={brief:'再试一次',tone:'warm',duration:12,character:'star',mode:'create',sound:false,boil:1};
test('原库十五种风格均有唯一标识、原理、边界与上游路径',()=>{
  assert.equal(styles.length,15);assert.equal(new Set(styleIds).size,15);
  for(const s of styles)for(const key of ['slug','name','principle','value','useCases','extension','implementation','scope'])assert.ok(s[key]?.length,key);
});
test('旧配置缺省为手绘，未知风格与外部路径被拒绝',()=>{
  assert.equal(validateStory(story).style,'cel-boil');
  for(const style of [null,'unknown','../../file',{},'https://example.com']){
    assert.throws(()=>validateStory({...story,style}));assert.throws(()=>validateBrief({...brief,style}));
  }
});
test('十五种风格保存回读保留同一个故事与独立样式',()=>{
  for(const style of styleIds){
    const config=validateStory({...story,style});assert.deepEqual(validateStory(JSON.parse(JSON.stringify(config))),config);
    assert.deepEqual(config.shots,story.shots);assert.equal(config.style,style);
  }
});
test('AI 接收所选风格，其输出不能偷换风格或覆盖原始镜头',()=>{
  for(const style of styleIds){
    const request=validateBrief({...brief,style});assert.ok(storyPrompt(request).includes(styles.find(s=>s.id===style).name));
    const result=acceptDraft({...story,style:'hud',logline:'失败后再试一次',narrative:'小星星发现目标，靠近后失败，随后换一种办法，最终点亮了星光。'},request,'style-test');
    assert.equal(result.story.style,style);assert.deepEqual(result.story.shots.map(({id,...s})=>s),story.shots.map(({id,...s})=>s));
  }
  assert.equal(validateStyle(undefined),'cel-boil');
});
