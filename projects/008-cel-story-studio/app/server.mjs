import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createReadStream,existsSync} from 'node:fs';
import {mkdir,stat,writeFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {bundle} from '@remotion/bundler';
import {ensureBrowser,selectComposition,renderMedia} from '@remotion/renderer';
import {validateStory} from './scripts/input-schema.mjs';
import {validateBrief} from './scripts/ai-schema.mjs';
import {getAiStatus,generateStory} from './scripts/ai-provider.mjs';
import {MAX_BYTES} from './scripts/world-schema.mjs';
import {validateEffect} from './scripts/effects.mjs';
import {validateEffectBrief} from './scripts/effect-ai.mjs';
import {validateFlagship} from './scripts/flagship-schema.mjs';
import {validateFlagshipBrief} from './scripts/flagship-ai.mjs';
import {renderStudio} from './scripts/studio-render.mjs';
import {hasMaterialPlate} from './scripts/material-cache.mjs';
import {hasStudioPlate} from './scripts/studio-cache.mjs';

const root=path.dirname(fileURLToPath(import.meta.url));
const web=path.resolve(root,'../web');
const output=path.join(root,'exports');
const port=Number(process.env.PORT||8048);
await mkdir(output,{recursive:true});
const jobs=new Map();
const creations=new Map();
const creationControllers=new Map();
let activeCreation=false;
let active=false;
let bundlePromise;
const browser=process.env.CHROME_PATH||[
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find(candidate=>existsSync(candidate));
const chromeMode=browser?'chrome-for-testing':'headless-shell';
const json=(res,code,value)=>{res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));};
async function createStory(job,request,controller){
  try{
    const result=await generateStory(request,job.id,{signal:controller.signal,onPhase:phase=>{if(!controller.signal.aborted)job.state=phase;}});
    if(controller.signal.aborted)return;
    job.result=result;job.state='done';
  }catch(error){if(!controller.signal.aborted){job.state='error';job.error=error instanceof Error?error.message:'AI 创作失败，请重试。';}}
  finally{job.finishedAt=new Date().toISOString();activeCreation=false;creationControllers.delete(job.id);}
}
async function readJson(req){
  const chunks=[];let bytes=0;
  for await(const chunk of req){bytes+=chunk.length;if(bytes>MAX_BYTES)throw Object.assign(new Error('内容过长。'),{status:413});chunks.push(chunk);}
  try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new Error('需要合法的 JSON 内容。');}
}
async function prepare(){
  if(!bundlePromise){
    bundlePromise=(async()=>{
      await ensureBrowser({browserExecutable:browser,chromeMode});
      return bundle({entryPoint:path.join(root,'src/index.tsx'),publicDir:path.join(root,'public'),outDir:path.join(root,'.cache/bundle')});
    })().catch(error=>{bundlePromise=undefined;throw error;});
  }
  return bundlePromise;
}
async function render(job,props,compositionId='CelStory'){
  try{
    await writeFile(path.join(output,`${job.id}.json`),JSON.stringify(props,null,2));
    if(compositionId==='EffectTemplate'&&props.config.style==='3d-render'){
      if(!hasMaterialPlate(props.config)){job.state='rendering';job.phase='材质成片 · Cycles';const folder=path.join(output,`${job.id}-frames`);await renderStudio(props.config,folder,p=>{job.progress=p*.82;});props={...props,studioFrames:`http://127.0.0.1:${port}/exports/${job.id}-frames`};}
    }
    const serveUrl=await prepare();
    const composition=await selectComposition({serveUrl,id:compositionId,inputProps:props,browserExecutable:browser,chromeMode,timeoutInMilliseconds:90000});
    job.state='rendering';
    await renderMedia({serveUrl,composition,inputProps:props,codec:'h264',crf:compositionId==='FlagshipFilm'?17:compositionId==='EffectTemplate'?19:20,pixelFormat:'yuv420p',
      outputLocation:path.join(output,`${job.id}.mp4`),concurrency:1,browserExecutable:browser,chromeMode,timeoutInMilliseconds:90000,offthreadVideoCacheSizeInBytes:256*1024*1024,offthreadVideoThreads:1,
      onProgress:({progress})=>{job.phase='合成影片';job.progress=props.studioFrames?.length ? .82+progress*.18 : progress;},
    });
    job.state='done';job.progress=1;job.url=`/exports/${job.id}.mp4`;
  }catch(error){job.state='error';const detail=error instanceof Error?error.message:String(error);job.error=/timeout|timed out/i.test(detail)?'画面渲染等待超时，请重新生成；当前作品与分镜已保留。':detail;console.error(error);}
  finally{active=false;}
}
async function sendFile(req,res,filename){
  const info=await stat(filename);
  if(!info.isFile())throw new Error('Not a file');
  const ext=path.extname(filename);
  const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.txt':'text/plain; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.mp4':'video/mp4','.wav':'audio/wav','.ttf':'font/ttf'};
  const etag=`"${info.size}-${Math.round(info.mtimeMs)}"`;
  const headers={'Content-Type':types[ext]||'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':'no-cache','ETag':etag};
  if(req.headers['if-none-match']===etag&&!req.headers.range){res.writeHead(304,headers);res.end();return;}
  let start=0,end=info.size-1,code=200;
  const range=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range||'');
  if(range){
    if(range[1]){start=Number(range[1]);end=range[2]?Math.min(Number(range[2]),end):end;}
    else if(range[2]&&Number(range[2])>0)start=Math.max(0,info.size-Number(range[2]));
    else start=info.size;
    if(start>=info.size||start>end){res.writeHead(416,{'Content-Range':`bytes */${info.size}`,'Content-Length':'0'});res.end();return;}
    code=206;headers['Content-Range']=`bytes ${start}-${end}/${info.size}`;
  }
  headers['Content-Length']=end-start+1;
  res.writeHead(code,headers);
  // esbuild can emit empty shared modules; they still need a complete HTTP response.
  if(req.method==='HEAD'||info.size===0){res.end();return;}
  const stream=createReadStream(filename,{start,end});
  stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
}
const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,`http://127.0.0.1:${port}`);
    if(url.pathname==='/api/health'){json(res,200,{app:'cel-story',ready:true});return;}
    if(url.pathname.startsWith('/api/')&&req.method==='POST'&&req.headers.origin&&!['http://127.0.0.1:'+port,'http://localhost:'+port].includes(req.headers.origin)){json(res,403,{error:'仅接受本机工作台请求。'});return;}
    if(url.pathname==='/api/ai/status'&&req.method==='GET'){json(res,200,await getAiStatus());return;}
    if(['/api/ai/generate','/api/effects/plan','/api/flagship/plan'].includes(url.pathname)&&req.method==='POST'){
      if(activeCreation){json(res,409,{error:'AI 正在创作另一个故事，请等待或取消后再试。'});return;}
      let request;try{const body=await readJson(req);request=url.pathname==='/api/flagship/plan'?validateFlagshipBrief(body):url.pathname==='/api/effects/plan'?validateEffectBrief(body):validateBrief(body);}catch(error){json(res,error.status||400,{error:error.message});return;}
      const status=await getAiStatus();if(!status.available){json(res,503,{error:status.message});return;}
      if(activeCreation){json(res,409,{error:'AI 正在创作另一个故事。'});return;}
      activeCreation=true;
      const job={id:randomUUID(),state:'creating',startedAt:new Date().toISOString()};
      const controller=new AbortController();creations.set(job.id,job);creationControllers.set(job.id,controller);
      if(creations.size>30){for(const [id,old] of creations){if(!creationControllers.has(id)){creations.delete(id);break;}}}
      json(res,202,job);void createStory(job,request,controller);return;
    }
    if(url.pathname.startsWith('/api/ai/jobs/')){
      const parts=url.pathname.slice('/api/ai/jobs/'.length).split('/');
      const job=creations.get(parts[0]);
      if(!job){json(res,404,{error:'创作任务不存在；服务重启后请重新生成。'});return;}
      if(parts.length===1&&req.method==='GET'){json(res,200,job);return;}
      if(parts[1]==='cancel'&&parts.length===2&&req.method==='POST'){
        const controller=creationControllers.get(job.id);
        if(controller){job.state='cancelled';controller.abort();}
        json(res,200,job);return;
      }
      json(res,405,{error:'不支持此操作。'});return;
    }
    if(['/api/render','/api/effects/render','/api/flagship/render'].includes(url.pathname)&&req.method==='POST'){
      if(req.headers.origin&&!['http://127.0.0.1:'+port,'http://localhost:'+port].includes(req.headers.origin)){json(res,403,{error:'仅接受本机工作台请求。'});return;}
      if(active){json(res,409,{error:'已有视频正在制作，请等待完成。'});return;}
      const isEffect=url.pathname==='/api/effects/render';
      const isFlagship=url.pathname==='/api/flagship/render';
      let props;try{const body=await readJson(req);props=isFlagship?{config:validateFlagship(body)}:isEffect?{config:validateEffect(body)}:validateStory(body);}catch(error){json(res,error.status||400,{error:error.message});return;}
      // Recheck after reading the request to serialize concurrent submissions.
      if(active){json(res,409,{error:'已有视频正在制作。'});return;}
      active=true;
      const job={id:randomUUID(),state:'queued',progress:0};jobs.set(job.id,job);
      json(res,202,job);void render(job,props,isFlagship?'FlagshipFilm':isEffect?'EffectTemplate':'CelStory');return;
    }
    if(url.pathname.startsWith('/api/jobs/')){const job=jobs.get(url.pathname.slice(10));json(res,job?200:404,job||{error:'任务不存在；服务重启后历史任务不再保留。'});return;}
    if(!['GET','HEAD'].includes(req.method)){json(res,405,{error:'不支持此请求。'});return;}
    const relative=decodeURIComponent(url.pathname==='/'?'index.html':url.pathname.slice(1));
    const base=relative.startsWith('exports/')?output:web;
    const filename=path.resolve(base,relative.startsWith('exports/')?relative.slice(8):relative);
    if(!filename.startsWith(base+path.sep)){json(res,403,{error:'无效文件路径。'});return;}
    await sendFile(req,res,filename);
  }catch(error){if(!res.headersSent)json(res,404,{error:'文件不存在或请求无效。'});else res.destroy();}
});
server.listen(port,'127.0.0.1',()=>console.log(`Cel Story Studio http://127.0.0.1:${port}/`));
