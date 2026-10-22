import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateStory} from './input-schema.mjs';
import {validateBrief,outputSchema,storyPrompt,acceptDraft} from './ai-schema.mjs';
import {compileWorld,objectsAt,worldPose} from './world-runtime.mjs';
import {worldActions} from './world-schema.mjs';
const fixture=JSON.parse(readFileSync(new URL('../../web/world-examples/rabbit.json',import.meta.url),'utf8'));
const copy=()=>structuredClone(fixture);
test('真实生成的自定义角色、场景、道具随 V3 配置完整回读',()=>{
  const s=validateStory(fixture);assert.equal(s.schemaVersion,3);assert.equal(s.world.characters.length,2);assert.equal(s.world.scenes.length,2);
  assert.deepEqual(validateStory(JSON.parse(JSON.stringify(s))),s);assert.deepEqual(s.world,fixture.world);
});
test('矢量资源拒绝脚本路径、非法颜色、无穷坐标、数量爆炸和空轮廓',()=>{
  for(const patch of [{kind:'script'},{fill:'url(https://example.com)'},{x:Infinity},{points:[] ,kind:'polygon'},{kind:'ellipse',w:0}]){
    const s=copy();Object.assign(s.world.characters[0].shapes[0],patch);assert.throws(()=>validateStory(s));
  }
  const s=copy();s.world.characters[0].shapes=Array(25).fill(s.world.characters[0].shapes[0]);assert.throws(()=>validateStory(s));
});
test('错误的角色、场景、物件和接收者引用会拒绝',()=>{
  for(const mutate of [s=>s.shots[0].sceneId='missing',s=>s.shots[0].cast[0].characterId='missing',s=>s.shots[1].cast[0].propId='missing',s=>s.shots[3].cast[0].recipientId='missing',s=>s.shots[0].cast.push(s.shots[0].cast[0])]){
    const s=copy();mutate(s);assert.throws(()=>validateStory(s));
  }
});
test('拿起、跨场景携带、递交按时间轴改变真正持有者',()=>{
  const s=validateStory(fixture),t=compileWorld(s.shots,s.world,true),id=s.world.objects[0].id;
  const pickup=t.find(v=>v.cast.some(c=>c.action==='pickup')),give=t.find(v=>v.cast.some(c=>c.action==='give'));
  assert.equal(pickup.objectsBefore[id].holder,'');assert.equal(pickup.objectsAfter[id].holder,pickup.cast[0].characterId);
  assert.equal(give.objectsBefore[id].holder,give.cast[0].characterId);assert.equal(give.objectsAfter[id].holder,give.cast[0].recipientId);
  assert.notDeepEqual(objectsAt(pickup,0,0)[id],objectsAt(pickup,1,48)[id]);
  assert.equal(t[t.length-1].objectsBefore[id].holder,give.cast[0].recipientId);
});
test('未先拿起、距离过远与不在场景的交互不会假装成功',()=>{
  const removed=copy();removed.shots=removed.shots.filter(s=>!s.cast.some(c=>c.action==='pickup'));assert.throws(()=>validateStory(removed));
  const far=copy();far.shots[0].cast[0].to.x=1150;assert.throws(()=>validateStory(far));
  const s=copy();s.shots[3].cast[1].from.x=150;s.shots[2].cast[1].from.x=150;s.shots[2].cast[1].to.x=150;assert.throws(()=>validateStory(s));
});
test('同场景接续落点，换场使用新登场位置；重排可发现无效叙事',()=>{
  const s=validateStory(fixture),t=compileWorld(s.shots,s.world);
  assert.deepEqual(t[1].cast[0].from,t[0].cast[0].to);
  assert.deepEqual(t[2].cast[0].from,s.shots[2].cast[0].from);
  const reordered=copy();[reordered.shots[1],reordered.shots[3]]=[reordered.shots[3],reordered.shots[1]];assert.throws(()=>validateStory(reordered));
});
test('基础动作与自由表演在边界及中间帧有确定的有限姿态',()=>{
  const cue={...fixture.shots[0].cast[0],from:{x:300,y:550},to:{x:600,y:550}};
  for(const action of Object.keys(worldActions))for(let i=0;i<=24;i++){
    const p=worldPose({...cue,action},i/24,i);assert.ok(Object.values(p).every(Number.isFinite));assert.deepEqual(p,worldPose({...cue,action},i/24,i));
  }
  assert.equal(worldPose({...cue,action:'walk'},1,24).x,600);assert.equal(worldPose({...cue,action:'fail'},1,24).x,300);
});
test('AI 自定义关节曲线驱动动作，切换基础动作后停止使用该曲线',()=>{
  const s=copy(),cue=s.shots[0].cast[0],neutral={x:0,y:0,rotation:0,armL:0,armR:0,head:0,propRotation:0};
  Object.assign(cue,{action:'perform',gesture:'点头抬手',motion:[{...neutral,t:0},{...neutral,t:.5,armR:1,head:.3,propRotation:-.8},{...neutral,t:1}]});
  const valid=validateStory(s),action=valid.shots[0].cast[0];
  assert.equal(worldPose(action,.5,12).armR,1);assert.equal(worldPose(action,.5,12).head,.3);assert.equal(worldPose({...action,action:'observe'},.5,12).armR,0);
  cue.motion[1].t=0;assert.throws(()=>validateStory(s));cue.motion[1].t=.5;cue.motion[1].armR=Infinity;assert.throws(()=>validateStory(s));
});
test('新 AI 输出生成世界资源，旧客户端仍走经典契约',()=>{
  const brief={brief:'兔子送胡萝卜给熊',engine:'world',tone:'warm',duration:12,mode:'create',character:'auto',style:'cel-boil',sound:true,boil:1};
  const request=validateBrief(brief),schema=outputSchema(request);assert.ok(schema.properties.world);assert.ok(!schema.properties.character);
  assert.ok(storyPrompt(request).includes('根据故事创造新的画面内容'));
  const raw={...fixture,logline:fixture.creative.logline,narrative:fixture.creative.narrative};
  const s=acceptDraft(raw,request,'real-assets').story;assert.deepEqual(s.world,fixture.world);assert.equal(s.schemaVersion,3);assert.equal(s.shots.reduce((n,v)=>n+v.duration,0),12);
  assert.ok(outputSchema(validateBrief({...brief,engine:undefined})).properties.character);
});
test('额外资源字段被过滤，不能把模型内容变成代码或文件路径',()=>{
  const s=copy();s.world.characters[0].script='evil';s.world.characters[0].shapes[0].src='https://example.com';s.world.scenes[0].filename='../../secret';
  const v=validateStory(s);assert.equal(v.world.characters[0].script,undefined);assert.equal(v.world.characters[0].shapes[0].src,undefined);assert.equal(v.world.scenes[0].filename,undefined);
});
test('真实 AI 浇水关键帧倾转水壶，水流使目标状态跨镜头保留',()=>{
  const raw=JSON.parse(readFileSync(new URL('../../web/world-examples/water.json',import.meta.url),'utf8')),s=validateStory(raw),timeline=compileWorld(s.shots,s.world,true);
  const i=timeline.findIndex(sh=>sh.cast.some(c=>c.action==='perform'&&c.effect?.kind==='water'));
  assert.ok(i>=0);const sh=timeline[i],cue=sh.cast.find(c=>c.effect?.kind==='water');assert.ok(cue.motion.length>=3);
  assert.ok(new Set(cue.motion.map(k=>k.propRotation)).size>1);assert.ok(Math.abs(worldPose(cue,.5,12).propRotation)>.1);
  assert.ok(sh.objectsAfter[cue.effect.targetId].growth>1);assert.equal(timeline[i+1].objectsBefore[cue.effect.targetId].growth,sh.objectsAfter[cue.effect.targetId].growth);
  const bad=structuredClone(s);bad.shots[i].cast[0].effect.targetId='missing';assert.throws(()=>validateStory(bad));
});
