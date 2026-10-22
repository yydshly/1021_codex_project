import test from 'node:test';
import assert from 'node:assert/strict';
import {validateStory} from './input-schema.mjs';
const legacy={title:'小小的我，也有光',opening:'发现星星',challenge:'越过小山',ending:'点亮星星',signature:'愿你发光',character:'flame',palette:'tomato',motion:'jump',boil:1.2,sound:true};
const valid={schemaVersion:2,style:'cel-boil',title:legacy.title,signature:legacy.signature,character:'flame',palette:'tomato',boil:1.2,sound:true,shots:[{id:'one',caption:'发现星星',action:'observe',emotion:'curious',duration:2.5}]};
test('保留镜头、半秒时长和关闭声音',()=>{
  assert.deepEqual(validateStory(valid),valid);
  assert.equal(validateStory({...valid,sound:false}).sound,false);
});
test('旧版三幕迁移为可编辑的三个镜头',()=>{
  const migrated=validateStory({...legacy,motion:'float'});
  assert.equal(migrated.schemaVersion,2);
  assert.deepEqual(migrated.shots.map(s=>s.action),['observe','float','celebrate']);
  assert.deepEqual(migrated.shots.map(s=>s.caption),[legacy.opening,legacy.challenge,legacy.ending]);
  assert.equal(migrated.shots.reduce((a,s)=>a+s.duration,0),12);
  assert.throws(()=>validateStory({...legacy,motion:'bad'}));
});
test('不把损坏的新版误当作旧版',()=>{
  for(const shots of [null,[],{},undefined])assert.throws(()=>validateStory({...valid,shots}));
  assert.throws(()=>validateStory({...valid,schemaVersion:3}));
  assert.throws(()=>validateStory({...legacy,schemaVersion:2}));
});
test('字幕不能为空、超过限制或包含换行',()=>{
  for(const caption of [' ','长'.repeat(25),'换\n行'])assert.throws(()=>validateStory({...valid,shots:[{...valid.shots[0],caption}]}));
  assert.throws(()=>validateStory({...valid,title:' '}));
});
test('镜头时长、数量、唯一编号受约束',()=>{
  for(const duration of [0,6.5,1.3,NaN,Infinity,'2'])assert.throws(()=>validateStory({...valid,shots:[{...valid.shots[0],duration}]}));
  assert.throws(()=>validateStory({...valid,shots:[...valid.shots,...valid.shots]}));
  assert.throws(()=>validateStory({...valid,shots:Array.from({length:11},(_,i)=>({...valid.shots[0],id:String(i)}))}));
  assert.throws(()=>validateStory({...valid,shots:[{...valid.shots[0],id:'../../other'}]}));
});
test('动作、情绪及全局字段必须有效',()=>{
  for(const key of ['action','emotion'])assert.throws(()=>validateStory({...valid,shots:[{...valid.shots[0],[key]:'unknown'}]}));
  for(const key of ['character','palette'])assert.throws(()=>validateStory({...valid,[key]:'unknown'}));
  for(const boil of [NaN,Infinity,-1,2.6,'1'])assert.throws(()=>validateStory({...valid,boil}));
  assert.throws(()=>validateStory({...valid,sound:'false'}));
});
test('丢弃额外字段和外部路径',()=>{
  assert.deepEqual(validateStory({...valid,outputLocation:'outside.mp4',imageUrl:'https://example.com',shots:[{...valid.shots[0],src:'external'}]}),valid);
});
