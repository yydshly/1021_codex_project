// HTTP checks supplement recorded browser actions; they do not replace UI or art review.
import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const app=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),p=path.dirname(app),base='http://127.0.0.1:8048';
const jobId=process.argv.find(x=>x.startsWith('--job='))?.slice(6);
if(!jobId)throw Error('用法：node scripts/verify-director-018.mjs --job=<实际网页渲染任务ID>');
const job=await fetch(`${base}/api/jobs/${jobId}`).then(r=>r.json());if(job.state!=='done')throw Error(JSON.stringify(job));
const paths=['/production-notes-018.html','/director-examples-018/main.json','/director-examples-018/rewrite.json','/director-examples-018/ai-rewrite.json','/director-kit-018/SKILL.md'];
const staticChecks=await Promise.all(paths.map(async url=>{const r=await fetch(base+url);if(!r.ok)throw Error(`${url}: ${r.status}`);return {url,status:r.status,bytes:(await r.arrayBuffer()).byteLength};}));
const media=[];for(const url of ['/director-examples-018/main.mp4','/director-examples-018/rewrite.mp4','/director-kit-018.zip',job.url]){const r=await fetch(base+url,{headers:{Range:'bytes=0-31'}}),bytes=await r.arrayBuffer();if(r.status!==206||bytes.byteLength!==32)throw Error(`Range failed: ${url}`);media.push({url,status:r.status,bytes:bytes.byteLength});}
const exported=await readFile(path.join(app,job.url));
await writeFile(path.join(p,'assets/review-018/http-proof.json'),JSON.stringify({method:'GET checks after actual browser-submitted AI and render tasks; not a browser simulator.',renderJob:job.id,renderState:job.state,exportSha256:createHash('sha256').update(exported).digest('hex'),staticChecks,rangeChecks:media},null,2));
console.log('Static deliverables and four media Range responses verified; browser render task done.');
