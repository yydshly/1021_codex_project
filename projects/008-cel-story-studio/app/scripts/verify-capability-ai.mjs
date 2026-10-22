// Optional live-model verification. Requires the local studio and consumes an AI request.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {validateStory} from './input-schema.mjs';
const recipe={version:1,components:[{id:'paper-grain',amount:.35},{id:'ink-border',amount:.5},{id:'camera-push',amount:.4}]};
const request={engine:'world',brief:'一只穿黄色雨衣的小猫在雨后的院子里看到阳光，从担心到开心，走到窗边向朋友挥手。用温暖的手作气质表现情绪变化，画面中实际表现走动与挥手。不要照搬任何原作故事。',tone:'warm',duration:12,character:'auto',mode:'create',protagonist:'黄色雨衣小猫，蓝灰色耳朵与尾巴',style:'cel-boil',sound:true,boil:1,recipe};
const start=await fetch('http://127.0.0.1:8048/api/ai/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(request)});
const job=await start.json();if(!start.ok)throw new Error(job.error);
console.log('AI job',job.id);let phase='';
for(let i=0;i<600;i++){
  const response=await fetch(`http://127.0.0.1:8048/api/ai/jobs/${job.id}`);const current=await response.json();
  if(current.state!==phase){phase=current.state;console.log(phase);}
  if(['error','cancelled'].includes(phase))throw new Error(current.error||phase);
  if(phase==='done'){
    const story=validateStory(current.result.story);assert.deepEqual(story.recipe,recipe);assert.equal(story.style,request.style);
    await mkdir('../web/capability-examples',{recursive:true});
    await writeFile('../web/capability-examples/ai-handmade.json',JSON.stringify({...story,creative:current.result.creative},null,2));
    await writeFile('../assets/capability-ai.json',JSON.stringify({id:job.id,title:story.title,recipe:story.recipe,characters:story.world.characters.map(c=>c.name),scenes:story.world.scenes.map(c=>c.name),shots:story.shots.length,genuineAI:true},null,2));
    console.log('Verified real AI recipe preservation:',story.title);process.exit(0);
  }
  await new Promise(resolve=>setTimeout(resolve,1000));
}
throw new Error('Live AI verification timed out');
