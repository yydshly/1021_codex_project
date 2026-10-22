import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultFlagship,validateFlagship,durationFlagship,FLAGSHIP_EVENTS} from './flagship-schema.mjs';
import {validateFlagshipBrief,flagshipOutputSchema,flagshipPrompt,acceptFlagshipDraft} from './flagship-ai.mjs';

const edit=(mutate)=>{const c=defaultFlagship();mutate(c);return c;};
const request=(patch={})=>validateFlagshipBrief({brief:'把远方改成星海，保留角色和时长。',mode:'rewrite',current:defaultFlagship(),...patch});
const draft=(config=defaultFlagship())=>({config,rationale:'让画出的浪成为通向远方的路。',changes:['告别时留下停顿。']});

test('原创默认故事有五个因果事件、独立数据和准确20秒时长',()=>{
 const c=defaultFlagship();assert.equal(durationFlagship(c),20);assert.deepEqual(c.shots.map(s=>s.event),FLAGSHIP_EVENTS);
 assert.deepEqual(c.shots.map(s=>s.seconds),[3,4,4,5,4]);assert.deepEqual(c.shots.map(s=>s.framing),['medium','close','close','wide','wide']);
 c.shots[0].caption='修改';assert.notEqual(defaultFlagship().shots[0].caption,'修改');
});

test('同一配置可序列化往返，星海结尾和手动编辑不会丢失',()=>{
 const c=edit(c=>{c.title='画一片星海';c.ending='starlight';c.accent='#A6B9DD';c.sound=false;c.shots[2].caption='';c.shots[3].framing='medium';c.shots[4].emotion='joyful';});
 assert.deepEqual(validateFlagship(JSON.parse(JSON.stringify(c))),c);
});

test('事件不可改名、漏镜、重复或重排，ID不可注入路径或重复',()=>{
 for(const mutate of [
  c=>c.shots.pop(),c=>c.shots.push({...c.shots[0]}),c=>c.shots[0].event='run',
  c=>[c.shots[0],c.shots[1]]=[c.shots[1],c.shots[0]],c=>c.shots[1].event='notice',
  c=>c.shots[0].id='../../outside',c=>c.shots[0].id='file:///tmp/movie',c=>c.shots[1].id=c.shots[0].id,
 ])assert.throws(()=>validateFlagship(edit(mutate)));
});

test('精确校验半秒步长、每镜边界和全片边界，拒绝非有限数值',()=>{
 for(const seconds of [0,1,1.25,8.5,NaN,Infinity,'3'])assert.throws(()=>validateFlagship(edit(c=>c.shots[0].seconds=seconds)));
 assert.throws(()=>validateFlagship(edit(c=>c.shots.forEach(s=>s.seconds=1.5))));
 assert.throws(()=>validateFlagship(edit(c=>c.shots.forEach(s=>s.seconds=8))));
 assert.equal(durationFlagship(edit(c=>c.shots.forEach((s,i)=>s.seconds=i===0?2:2.5))),12);
 assert.equal(durationFlagship(edit(c=>c.shots.forEach(s=>s.seconds=6))),30);
});

test('拒绝不支持的资产、颜色、取景、情绪以及错误字段类型',()=>{
 for(const patch of [{kind:'exec'},{version:2},{assetPack:'../../assets'},{accent:'url(https://x)'},{accent:'#abc'},{accent:'#gg0000'},{sound:'true'},{ending:'mars'},{title:''},{title:'长'.repeat(19)},{logline:'长'.repeat(181)},{heroName:'长'.repeat(13)},{companionName:'长'.repeat(13)}])assert.throws(()=>validateFlagship({...defaultFlagship(),...patch}));
 for(const patch of [{framing:'orbit'},{emotion:'angry'},{caption:'长'.repeat(37)},{caption:'带\n换行'},{caption:null}])assert.throws(()=>validateFlagship(edit(c=>Object.assign(c.shots[0],patch))));
 for(const value of [null,[],true,'{}'])assert.throws(()=>validateFlagship(value));
});

test('未知渲染、路径与远端资产字段不进入可用配置',()=>{
 const c=defaultFlagship();const accepted=validateFlagship({...c,outputLocation:'../../outside.mp4',src:'https://example.com/model',shots:c.shots.map(s=>({...s,image:'file:///private',script:'alert(1)'}))});
 assert.deepEqual(accepted,c);assert.equal(accepted.outputLocation,undefined);assert.equal(accepted.shots[0].image,undefined);
});

test('新创作可留空想法；改写必须有有效当前故事和非空要求',()=>{
 assert.equal(validateFlagshipBrief({mode:'create',brief:''}).duration,20);
 const c=edit(c=>c.shots.forEach(s=>s.seconds=6));assert.equal(request({current:c}).duration,30);
 for(const input of [null,{mode:'rewrite',brief:'改成星海'},{mode:'rewrite',brief:'',current:defaultFlagship()},{mode:'create',brief:'长'.repeat(801)},{mode:'create',brief:'x\ny'},{mode:'delete',brief:'x'}])assert.throws(()=>validateFlagshipBrief(input));
});

test('AI结构和提示明确有限资产、五个事件和用户锁定约束',()=>{
 const req=request(),schema=flagshipOutputSchema(req),config=schema.properties.config;
 assert.equal(schema.additionalProperties,false);assert.equal(config.additionalProperties,false);
 assert.deepEqual(config.properties.heroName.enum,[req.current.heroName]);assert.deepEqual(config.properties.accent.enum,[req.current.accent]);
 assert.equal(config.properties.shots.minItems,5);assert.equal(config.properties.shots.maxItems,5);assert.equal(config.properties.shots.items.properties.caption.maxLength,36);
 const prompt=flagshipPrompt(req);assert.match(prompt,/不能生成任意新角色/);assert.match(prompt,/恰好20秒/);assert.match(prompt,/notice,draw,unfold,leap,farewell/);assert.match(prompt,/保留未要求改变的核心情节/);
});

test('AI改写可以改变实际结尾与镜头表达，同时保留明确约束和稳定ID',()=>{
 const req=request(),c=edit(c=>{c.title='赠你星海';c.ending='starlight';c.shots[3].caption='星光也会托住你。';c.shots[3].framing='medium';c.shots[0].seconds=2.5;c.shots[4].seconds=4.5;c.shots.forEach((s,i)=>s.id=`generated-${i}`);});
 const accepted=acceptFlagshipDraft(draft(c),req,'test-plan');
 assert.equal(accepted.config.ending,'starlight');assert.equal(accepted.config.shots[3].framing,'medium');assert.equal(durationFlagship(accepted.config),20);
 assert.deepEqual(accepted.config.shots.map(s=>s.id),req.current.shots.map(s=>s.id));
 for(const key of ['heroName','companionName','assetPack','accent','sound'])assert.equal(accepted.config[key],req.current[key]);
});

test('AI不得改动锁定角色、资产、色彩、声音或总时长，非法方案不能应用',()=>{
 const req=request();
 for(const patch of [{heroName:'新狐狸'},{companionName:'新角色'},{assetPack:'new-assets'},{accent:'#000000'},{sound:false}])assert.throws(()=>acceptFlagshipDraft(draft({...defaultFlagship(),...patch}),req,'test'));
 assert.throws(()=>acceptFlagshipDraft(draft(edit(c=>c.shots[0].seconds=4)),req,'test'));
 assert.throws(()=>acceptFlagshipDraft(draft(),req,'../outside'));
 assert.throws(()=>acceptFlagshipDraft({...draft(),rationale:''},req,'test'));
 assert.throws(()=>acceptFlagshipDraft({...draft(),changes:['长'.repeat(97)]},req,'test'));
 assert.throws(()=>acceptFlagshipDraft({...draft(),changes:Array(7).fill('修改')},req,'test'));
});
