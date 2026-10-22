// HTTP export-path verification; does not claim browser UI validation.
import {readFile,writeFile,copyFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {effectDefaults,validateEffect} from './effects.mjs';
import {applyStory016} from './story-films-016.mjs';
const app=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),p=path.resolve(app,'..'),base='http://127.0.0.1:8048',results=[];
async function get(url){for(let i=0;;i++){try{return await fetch(url,{headers:{Connection:'close'}});}catch(error){if(i===4)throw error;await new Promise(resolve=>setTimeout(resolve,1000));}}}
const resume=process.argv.find(x=>x.startsWith('--resume='))?.slice(9);
for(const [style,story,title,duration,sound] of [['cel-boil','shelter','把晴天分给你',8,true],['aurora-glass','rainmix','留一首雨夜',6,false]]){
 const config=validateEffect({...applyStory016(effectDefaults(style),story),title,duration,sound,seed:42});
 const start=resume&&style==='cel-boil'?await get(base+'/api/jobs/'+resume):await fetch(base+'/api/effects/render',{method:'POST',headers:{'Content-Type':'application/json',Origin:base,Connection:'close'},body:JSON.stringify(config)});let job=await start.json();if(!start.ok)throw new Error(JSON.stringify(job));
 const jobId=job.id;console.log(`Started ${style}/${story} ${duration}s ${sound?'sound':'silent'} ${jobId}`);
 for(let attempts=0;job.state!=='done';attempts++){
  if(job.state==='error'||attempts>240)throw new Error(JSON.stringify(job));
  await new Promise(resolve=>setTimeout(resolve,1500));job=await(await get(base+'/api/jobs/'+jobId)).json();
 }
 const name=`api-${story}-${duration}s`;await copyFile(path.join(app,job.url.replace(/^\//,'')),path.join(p,'web/story-examples-017',name+'.mp4'));
 await writeFile(path.join(p,'web/story-examples-017',name+'.json'),JSON.stringify(config,null,2));
 const range=await fetch(base+job.url,{headers:{Range:'bytes=0-31'}});if(range.status!==206||(await range.arrayBuffer()).byteLength!==32)throw new Error('Range playback failed.');
 results.push({style,storyId:story,config,jobId,file:`web/story-examples-017/${name}.mp4`,rangeStatus:206});
 console.log(`Exported ${name}; partial media response 206.`);
}
await writeFile(path.join(p,'assets/review-017/http-export.json'),JSON.stringify({method:'Actual local render API, not browser UI verification',exports:results},null,2));
