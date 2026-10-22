import {test} from 'node:test';
import assert from 'node:assert/strict';
import {defaultShots,filmPrograms,programCue,retimeShots,validateShots} from './film-program.mjs';
import {effectDefaults,validateEffect} from './effects.mjs';
import {acceptEffectDraft,effectOutputSchema,effectPrompt,validateEffectBrief} from './effect-ai.mjs';
import {migrateEffectDraft} from './effect-draft.mjs';
import {legacyExamples012} from './legacy-effects-012.mjs';

const styles=['synthwave','pixel','hud'];
const sum=shots=>shots.reduce((n,s)=>n+s.seconds,0);
const requestFor=style=>validateEffectBrief({brief:'用等待、意外与重逢，重新安排这套已有画面。',current:effectDefaults(style)});
const aiPlan=(style,seconds=2.5)=>({title:'一次新的相逢',subtitle:'绕过一点意外，终于再次听见',logline:'从主体苏醒开始，经由空间变化，最后回到完整主体。',shots:defaultShots(style).map(({action,framing,caption})=>({action,seconds,framing,caption}))});

test('the three programmable films provide independent four-event defaults without sharing mutable shots',()=>{
 for(const style of styles){
  const first=defaultShots(style),second=defaultShots(style);
  assert.equal(first.length,4);assert.equal(sum(first),10);assert.equal(new Set(first.map(s=>s.id)).size,4);
  assert.deepEqual(first.map(s=>s.action),filmPrograms[style].actions.map(a=>a.id));
  first[0].caption='我的修改';assert.notEqual(first[0].caption,second[0].caption);
  assert.deepEqual(validateEffect(effectDefaults(style)),effectDefaults(style));
 }
 assert.equal(defaultShots('flat-vector'),undefined);
});

test('seeking selects the correct event at cut frames, clamps endpoints and retains local progress',()=>{
 for(const style of styles){
  const config=effectDefaults(style),shots=config.shots;
  assert.equal(programCue(config,-10).progress,0);
  for(let i=0;i<shots.length;i++){
   const start=i*2.5,cue=programCue(config,start);
   assert.equal(cue.action,shots[i].action);assert.equal(cue.index,i);assert.equal(cue.progress,0);assert.equal(cue.localSeconds,0);
   const half=programCue(config,start+1.25);assert.equal(half.action,shots[i].action);assert.equal(half.progress,.5);
   if(i>0)assert.equal(programCue(config,start-1/30).action,shots[i-1].action);
  }
  for(const seconds of [10,100]){const cue=programCue(config,seconds);assert.equal(cue.action,shots[3].action);assert.ok(cue.progress>.999&&cue.progress<1);}
 }
});

test('moving, repeating and removing shots actually changes the event returned for the same frame',()=>{
 for(const style of styles){
  const current=effectDefaults(style),[a,b,c,d]=current.shots;
  const edited=validateEffect({...current,shots:[d,b,{...b,id:'repeat-shot'},a],duration:10});
  assert.equal(programCue(current,0).action,a.action);assert.equal(programCue(edited,0).action,d.action);
  assert.equal(programCue(edited,5).action,b.action);assert.equal(programCue(edited,5).progress,.5);
  assert.equal(programCue(edited,5).index,2);assert.equal(programCue(edited,7.5).action,a.action);
  assert.ok(!edited.shots.some(s=>s.action===c.action));
 }
});

test('legacy configs without shots use the full event progression at their own playback duration',()=>{
 for(const style of styles){
  const config={...effectDefaults(style),duration:12};delete config.shots;
  assert.equal(programCue(config,3).index,1);assert.equal(programCue(config,6).index,2);assert.equal(programCue(config,9).index,3);
  const mid=programCue(config,4.5);assert.equal(mid.progress,.5);
  const oldFractional=validateEffect({...config,duration:6.2});assert.equal(programCue(oldFractional,3.1).index,2);
 }
});

test('retiming preserves shot identity and content while making exact half-second totals at every supported duration',()=>{
 const shots=defaultShots('pixel').map((s,i)=>({...s,seconds:[.5,1.5,3,5][i]})),snapshot=structuredClone(shots);
 for(let duration=4;duration<=20;duration+=.5){
  const retimed=retimeShots(shots,duration);assert.equal(sum(retimed),duration);
  for(let i=0;i<shots.length;i++){assert.deepEqual({...retimed[i],seconds:shots[i].seconds},shots[i]);assert.ok(retimed[i].seconds>=.5&&retimed[i].seconds<=8);assert.ok(Number.isInteger(retimed[i].seconds*2));}
  assert.deepEqual(validateShots(retimed,'pixel',duration),retimed);
 }
 assert.deepEqual(shots,snapshot);
 assert.deepEqual(retimeShots(defaultShots('hud'),6).map(s=>s.seconds),[1.5,1.5,1.5,1.5]);
 for(const duration of [3.5,20.5,6.2,NaN,Infinity])assert.throws(()=>retimeShots(shots,duration));
 assert.throws(()=>retimeShots([shots[0]],20));
});

test('program validation rejects foreign actions, duplicate ids, invalid timing, framing and caption data',()=>{
 const config=effectDefaults('synthwave'),shots=config.shots;
 const reject=(patch,duration=10)=>assert.throws(()=>validateEffect({...config,duration,shots:[{...shots[0],...patch},...shots.slice(1)]}));
 for(const patch of [{action:'repair'},{id:shots[1].id},{id:'../unsafe'},{id:''},{seconds:.25},{seconds:8.5},{seconds:Infinity},{seconds:'2.5'},{framing:'orbit'},{caption:'字'.repeat(41)},{caption:'隐形\n换行'}])reject(patch);
 reject({seconds:3});assert.throws(()=>validateEffect({...config,shots:shots.slice(0,1),duration:4}));
 assert.throws(()=>validateEffect({...effectDefaults('flat-vector'),shots}));
 const sanitized=validateShots([{...shots[0],caption:'  字幕  ',code:'ignored'},...shots.slice(1)],'synthwave',10);assert.equal(sanitized[0].caption,'字幕');assert.equal('code' in sanitized[0],false);
 assert.equal(validateShots(undefined,'synthwave',10),undefined);
});

test('AI brief and schema are bound to the current film assets and reject unsupported styles',()=>{
 for(const style of styles){
  const request=requestFor(style),schema=effectOutputSchema(request);
  assert.equal(request.engine,'effect');assert.equal(request.duration,10);
  assert.deepEqual(schema.properties.shots.items.properties.action.enum,filmPrograms[style].actions.map(a=>a.id));
  assert.match(effectPrompt(request),new RegExp(filmPrograms[style].subject));
  assert.match(effectPrompt(request,'镜头动作无效'),/上一稿校验失败：镜头动作无效/);
 }
 for(const brief of ['', ' ', '字'.repeat(501),'含\n换行'])assert.throws(()=>validateEffectBrief({brief,current:effectDefaults('pixel')}));
 assert.throws(()=>validateEffectBrief({brief:'新的想法',current:effectDefaults('flat-vector')}));
 const current={...effectDefaults('pixel'),duration:6.2};delete current.shots;
 assert.throws(()=>validateEffectBrief({brief:'新的想法',current}));
});

test('accepting an AI plan changes executable shots and text while preserving all existing material and sound parameters',()=>{
 for(const style of styles){
  const current={...effectDefaults(style),primary:'#112233',secondary:'#778899',count:14,seed:78,intensity:.2,detail:.9,sound:false};
  const request=validateEffectBrief({brief:'保留颜色和画面参数，调整镜头',current}),before=structuredClone(request);
  const raw=aiPlan(style);raw.shots.reverse();raw.primary='#ffffff';raw.seed=999;raw.words=['不应','覆盖'];raw.shots[0].id='supplied-id';
  const result=acceptEffectDraft(raw,request,'unit-test');
  assert.equal(result.config.shots[0].action,raw.shots[0].action);assert.equal(programCue(result.config,0).action,raw.shots[0].action);
  assert.deepEqual(result.config.shots.map(s=>s.id),[1,2,3,4].map(i=>`plan-unit-test-${i}`));
  for(const key of ['style','words','primary','secondary','count','seed','intensity','detail','sound','duration'])assert.deepEqual(result.config[key],current[key]);
  assert.equal(result.config.title,raw.title);assert.equal(result.config.subtitle,raw.subtitle);assert.equal(result.creative.brief,request.brief);assert.equal(result.creative.logline,raw.logline);
  assert.deepEqual(request,before);assert.deepEqual(validateEffect(result.config),result.config);
 }
});

test('AI duration-only repair accepts individually valid short and long plans and returns the requested total',()=>{
 for(const seconds of [.5,2,3,8]){
  const request=requestFor('pixel'),raw=aiPlan('pixel',seconds),result=acceptEffectDraft(raw,request,`timing-${seconds*2}`);
  assert.equal(sum(result.config.shots),request.duration);assert.equal(result.config.duration,request.duration);
  assert.deepEqual(result.config.shots.map(s=>s.action),raw.shots.map(s=>s.action));
  for(const shot of result.config.shots){assert.ok(shot.seconds>=.5&&shot.seconds<=8);assert.ok(Number.isInteger(shot.seconds*2));}
 }
});

test('AI plans cannot introduce an unimplemented action or invalid per-shot data during timing repair',()=>{
 const request=requestFor('pixel');
 for(const patch of [{action:'awaken'},{seconds:.3},{seconds:9},{caption:'超'.repeat(41)},{framing:'dolly'}]){const raw=aiPlan('pixel');Object.assign(raw.shots[0],patch);assert.throws(()=>acceptEffectDraft(raw,request,'invalid'));}
 for(const patch of [{title:''},{subtitle:''},{logline:''},{logline:'长'.repeat(161)},{shots:[]}])assert.throws(()=>acceptEffectDraft({...aiPlan('pixel'),...patch},request,'invalid'));
});

test('only completely untouched 0.12 defaults migrate; every meaningful user customization remains intact',()=>{
 assert.deepEqual(Object.keys(legacyExamples012).sort(),[...styles].sort());
 for(const [style,legacy] of Object.entries(legacyExamples012)){
  assert.deepEqual(migrateEffectDraft(legacy),effectDefaults(style));
  for(const patch of [{title:'我的片名'},{subtitle:'用户自己的表达'},{words:['自己的','故事']},{primary:'#112233'},{secondary:'#224466'},{count:9},{seed:23},{intensity:.2},{detail:.8},{duration:6.2},{sound:false}]){
   const custom={...legacy,...patch};assert.deepEqual(migrateEffectDraft(custom),validateEffect(custom));
  }
  const compiled={...legacy,shots:defaultShots(style).reverse()};assert.deepEqual(migrateEffectDraft(compiled),compiled);
  const silent={...legacy};delete silent.sound;assert.deepEqual(migrateEffectDraft(silent),silent);
 }
});


test('adjacent shots of one action share progress and sound rather than resetting a repaired object',async()=>{
 const {programSegments}=await import('./film-program.mjs');
 const c=effectDefaults('pixel');c.shots=[{...c.shots[0],seconds:1.5},{...c.shots[1],seconds:1},{...c.shots[1],id:'repair-mid',seconds:2},{...c.shots[1],id:'repair-end',seconds:1}, {...c.shots[2],seconds:2},{...c.shots[3],seconds:2.5}];
 validateEffect(c);assert.equal(programCue(c,2.5).progress,.25);assert.equal(programCue(c,4.5).progress,.75);assert.ok(programCue(c,2.5-.001).progress<programCue(c,2.5).progress);
 assert.equal(programSegments(c).length,4);assert.equal(programSegments(c)[1].seconds,4);assert.equal(programCue(c,5.5).action,'launch');
});
