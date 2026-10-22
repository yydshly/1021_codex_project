import test from 'node:test';
import assert from 'node:assert/strict';
import {validateBrief,outputSchema,acceptDraft,fitDurations} from './ai-schema.mjs';
import {findCodexExecutable} from './ai-provider.mjs';
const brief={brief:'',tone:'warm',duration:12,character:'auto',mode:'create',sound:true,boil:1.2};
const draft={title:'第二次也会发光',signature:'允许自己再试试',character:'star',palette:'violet',logline:'一次失败之后，小星星换个办法跨过小山，点亮星光。',narrative:'小星星发现远处的星星，尝试跨山却失败。它退后休息，随后坚定地漂过山，开心地举手点亮星光。',shots:[
  {caption:'看见远方的星星',action:'observe',emotion:'curious',duration:2},
  {caption:'这次没有跳过去',action:'fail',emotion:'sad',duration:2},
  {caption:'退一步，歇一会儿',action:'hesitate',emotion:'afraid',duration:2},
  {caption:'换个办法，再试一次',action:'float',emotion:'determined',duration:2},
  {caption:'第二次成功，也值得庆祝',action:'celebrate',emotion:'happy',duration:2},
]};
test('允许空想法自由创作，改写必须有当前故事和修改要求',()=>{
  assert.equal(validateBrief(brief).brief,'');
  assert.throws(()=>validateBrief({...brief,mode:'rewrite'}));
  const current=acceptDraft(draft,brief,'fixture').story;
  assert.equal(validateBrief({...brief,brief:'改得更幽默',mode:'rewrite',current}).current.title,draft.title);
});
test('拒绝非法时长、角色、气质、错误类型和过长请求',()=>{
  for(const patch of [{duration:'12'},{duration:99},{tone:'custom'},{character:'file:///a'},{mode:'exec'},{brief:'长'.repeat(801)},{sound:'false'},{boil:NaN}])assert.throws(()=>validateBrief({...brief,...patch}));
  assert.throws(()=>validateBrief(null));
});
test('输出契约明确限制模型只能使用支持的镜头参数',()=>{
  const schema=outputSchema({...brief,duration:30,character:'drop'});
  assert.equal(schema.additionalProperties,false);
  assert.equal(schema.properties.shots.minItems,8);
  assert.deepEqual(schema.properties.character.enum,['drop']);
  assert.ok(schema.properties.shots.items.properties.action.enum.includes('fail'));
  assert.equal(schema.properties.shots.items.additionalProperties,false);
});
test('AI 输出转成真实配置，分配稳定唯一 ID 并精确匹配目标长度',()=>{
  const accepted=acceptDraft(draft,brief,'request-123');
  assert.equal(accepted.story.shots.reduce((n,s)=>n+s.duration,0),12);
  assert.equal(new Set(accepted.story.shots.map(s=>s.id)).size,5);
  assert.equal(accepted.story.shots[0].id,'ai-request-123-1');
  assert.equal(accepted.creative.narrative,draft.narrative);
  assert.equal(accepted.story.character,'star');
});
test('配时只改时长，内容、动作和情绪保留且不超出渲染范围',()=>{
  for(const count of [5,6,8])for(const seconds of [12,20,30]){
    const shots=Array.from({length:count},(_,i)=>({...draft.shots[i%5],duration:i%2?1:6}));
    const fitted=fitDurations(shots,seconds);
    assert.equal(fitted.reduce((n,s)=>n+s.duration,0),seconds);
    assert.ok(fitted.every(s=>s.duration>=1&&s.duration<=6&&Number.isInteger(s.duration*2)));
    assert.deepEqual(fitted.map(({duration,...s})=>s),shots.map(({duration,...s})=>s));
  }
});
test('非法配时迅速拒绝，避免 AI 异常数值进入循环',()=>{
  for(const duration of [NaN,Infinity,1.2,0,7])assert.throws(()=>fitDurations([{...draft.shots[0],duration}],12));
  assert.throws(()=>fitDurations([],12));
  assert.throws(()=>fitDurations(draft.shots,60));
});
test('无效动作、字幕、数量、主角和空洞的重复分镜不得应用',()=>{
  for(const patch of [{title:'长'.repeat(19)},{narrative:''},{shots:draft.shots.slice(1)},{shots:draft.shots.map(s=>({...s,action:'hug'}))},{shots:draft.shots.map(s=>({...s,emotion:'unknown'}))},{shots:draft.shots.map(s=>({...s,action:'observe',emotion:'curious'}))}])assert.throws(()=>acceptDraft({...draft,...patch},brief,'test'));
  assert.throws(()=>acceptDraft(draft,{...brief,character:'flame'},'test'));
});
test('AI 不可注入导出路径或镜头编号，额外字段被过滤',()=>{
  const accepted=acceptDraft({...draft,outputLocation:'outside',imageUrl:'https://example.com',shots:draft.shots.map(s=>({...s,id:'../../outside',src:'outside'}))},brief,'safe');
  assert.equal(accepted.story.outputLocation,undefined);
  assert.ok(accepted.story.shots.every(s=>s.id.startsWith('ai-safe-')&&s.src===undefined));
});
test('运行程序路径拒绝命令字符串和不存在的程序',()=>{
  assert.equal(findCodexExecutable({CEL_CODEX_PATH:'codex --do-something',PATH:''}),null);
  assert.equal(findCodexExecutable({CEL_CODEX_PATH:'F:/does-not-exist/codex.exe',PATH:''}),null);
});
