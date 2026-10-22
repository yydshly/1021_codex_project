import {test} from 'node:test';
import assert from 'node:assert/strict';
import {effectDefaults,effectTemplates,validateEffect,SOURCE_COMMIT} from './effects.mjs';
import {styleIds} from './styles.mjs';
import {hasStudioPlate} from './studio-cache.mjs';
import {storyFilms016,applyStory016} from './story-films-016.mjs';
test('different authored stories survive configuration save/import and cannot cross style boundaries',()=>{
 for(const [style,stories] of Object.entries(storyFilms016))for(const story of stories){
  const c=applyStory016({...effectDefaults(style),duration:6,sound:false},story.id);
  assert.equal(c.duration,6);assert.equal(c.sound,false);assert.equal(c.storyId,story.id);
  assert.deepEqual(validateEffect(JSON.parse(JSON.stringify(c))),c);
  assert.throws(()=>validateEffect({...c,style:style==='line-art'?'paperclip':'line-art'}));
 }
 assert.throws(()=>validateEffect({...effectDefaults('line-art'),storyId:'../../outside'}));
 const old=effectDefaults('line-art');assert.equal('storyId' in validateEffect(old),false);
});
test('all fifteen source styles have distinct documented executable templates',()=>{
 assert.deepEqual(effectTemplates.map(s=>s.id),styleIds);
 assert.equal(new Set(effectTemplates.map(s=>s.id)).size,15);
 for(const s of effectTemplates){assert.equal(s.controls.length,3);assert.ok(s.modules.length>=3);assert.ok(s.boundary.length>20);assert.equal(s.source.commit,SOURCE_COMMIT);assert.deepEqual(validateEffect(effectDefaults(s.id)),effectDefaults(s.id));}
});
test('effect rendering boundary accepts only finite bounded data, not code or paths',()=>{
 for(const patch of [{style:'../../arbitrary'},{kind:'story'},{title:''},{title:'a'.repeat(19)},{words:['one']},{words:['a','b'.repeat(13)]},{count:Infinity},{seed:-1},{duration:1000},{intensity:NaN},{detail:2},{primary:'url(https://remote/x)'},{secondary:'#fff'}])assert.throws(()=>validateEffect({...effectDefaults(),...patch}));
 const safe=validateEffect({...effectDefaults(),code:'process.exit()',url:'https://untrusted.invalid',count:7.2});assert.equal(safe.count,7);assert.equal('code' in safe,false);assert.equal('url' in safe,false);
});
test('configuration round trips preserve content, parameters, style and seed',()=>{
 for(const s of effectTemplates){const variant={...effectDefaults(s.id),title:'新的表达',words:['起点','转折','到达'],seed:77,count:14,intensity:.25,detail:.85};assert.deepEqual(validateEffect(JSON.parse(JSON.stringify(variant))),variant);}
});
test('new sound option keeps old silent configurations compatible and rejects malformed values',()=>{
 const old=effectDefaults();delete old.sound;assert.equal('sound' in validateEffect(old),false);
 assert.equal(validateEffect({...old,sound:false}).sound,false);assert.equal(validateEffect(effectDefaults()).sound,true);
 for(const sound of ['true',1,{},null])assert.throws(()=>validateEffect({...old,sound}));
});
test('cached Cycles plate is reused for text and timing only; every material or geometry edit forces a new render',()=>{
 const d=effectDefaults('3d-render');assert.ok(hasStudioPlate(d));assert.ok(hasStudioPlate({...d,title:'新的片名',subtitle:'新的短句',words:['一','二'],duration:6,sound:false}));
 for(const patch of [{primary:'#992211'},{secondary:'#667799'},{count:d.count+1},{intensity:.2},{detail:.9},{seed:d.seed+1},{style:'liquid'}])assert.equal(hasStudioPlate({...d,...patch}),false);
 assert.equal('studioFrames' in validateEffect({...d,studioFrames:'http://malicious.invalid/frames'}),false);
});


test('new creative examples migrate only untouched defaults and preserve every customized draft field',async()=>{
 const {migrateEffectDraft}=await import('./effect-draft.mjs');
 const cases=[['isometric',{title:'午夜温室',subtitle:'当城市睡去，一座花园开始呼吸',words:['亮灯','舒展','呼吸'],primary:'#e5b675',secondary:'#7aa989'}],['3d-render',{title:'琥珀轨道',subtitle:'陶瓷、金属与一颗不愿停下的琥珀',words:['升起','环绕','共振'],primary:'#e5a855',secondary:'#7eb7a4'}]];
 for(const [style,old] of cases){const legacy={...effectDefaults(style),...old};assert.deepEqual(migrateEffectDraft(legacy),effectDefaults(style));for(const patch of [{subtitle:'用户的短句'},{words:['我的','故事']},{sound:false},{duration:12},{seed:23},{title:'自定义作品'},{primary:'#112233'},{count:9}]){const custom={...legacy,...patch};assert.deepEqual(migrateEffectDraft(custom),custom);}}
});

test('all thirteen 0.11 examples migrate without overwriting any user edit',async()=>{
 const {legacyExamples011}=await import('./legacy-effects-011.mjs');const {migrateEffectDraft}=await import('./effect-draft.mjs');
 assert.equal(Object.keys(legacyExamples011).length,13);
 for(const [style,old] of Object.entries(legacyExamples011)){assert.deepEqual(migrateEffectDraft(old),effectDefaults(style));for(const patch of [{title:'我的片名'},{words:['自己的','内容']},{seed:99},{sound:false},{duration:6},{primary:'#663399'}]){const custom={...old,...patch};assert.deepEqual(migrateEffectDraft(custom),custom);}}
});

test('new liquid never selects the archived Cycles plate while 3D keeps its material cache',async()=>{
 const {hasLiquidPlate,hasMaterialPlate}=await import('./material-cache.mjs');const d=effectDefaults('liquid');
 assert.equal(hasLiquidPlate(d),false);assert.ok(hasMaterialPlate(effectDefaults('3d-render')));
 for(const patch of [{title:'光滴',words:['一','二'],duration:6,sound:false},{count:3},{seed:22},{detail:.2},{intensity:.9},{primary:'#336699'},{secondary:'#887766'}])assert.equal(hasMaterialPlate({...d,...patch}),false);
});
test('all fifteen pre-craft defaults migrate without erasing content, timing or parameter edits',async()=>{
 const {legacyExamples013}=await import('./legacy-effects-013.mjs');const {migrateEffectDraft}=await import('./effect-draft.mjs');
 assert.equal(Object.keys(legacyExamples013).length,15);
 for(const [id,old] of Object.entries(legacyExamples013)){assert.deepEqual(migrateEffectDraft(old),effectDefaults(id));for(const patch of [{title:'用户的故事'},{words:['自己的','内容']},{sound:false},{duration:old.shots?old.duration:6},{seed:99},{primary:'#667799'}]){const custom={...old,...patch};if(JSON.stringify(custom)!==JSON.stringify(old))assert.deepEqual(migrateEffectDraft(custom),custom);}}
});

test('0.17 updates only untouched archived defaults; customized and alternate stories survive',async()=>{
 const {legacyExamples017}=await import('./legacy-effects-017.mjs');
 const {migrateEffectDraft}=await import('./effect-draft.mjs');
 for(const [id,old] of Object.entries(legacyExamples017)){
  assert.deepEqual(migrateEffectDraft(old),effectDefaults(id));
  for(const patch of [{title:'我的作品'},{subtitle:'自己的短句'},{words:['自己的','故事']},{primary:'#123456'},{secondary:'#654321'},{count:6},{intensity:.2},{detail:.2},{duration:6},{sound:false},{seed:23}]){
   const edited={...old,...patch};assert.deepEqual(migrateEffectDraft(edited),edited);
  }
  const alternate=applyStory016(effectDefaults(id),storyFilms016[id][1].id);
  assert.deepEqual(migrateEffectDraft(alternate),alternate);
 }
});
