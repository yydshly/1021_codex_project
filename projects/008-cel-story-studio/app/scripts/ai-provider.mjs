import path from 'node:path';
import {existsSync} from 'node:fs';
import {mkdir,readFile,writeFile,unlink,rmdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {outputSchema,storyPrompt,acceptDraft} from './ai-schema.mjs';
import {effectOutputSchema,effectPrompt,acceptEffectDraft} from './effect-ai.mjs';
import {flagshipOutputSchema,flagshipPrompt,acceptFlagshipDraft} from './flagship-ai.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const cacheRoot=path.join(root,'.cache','ai');
let statusCache;

export function findCodexExecutable(env=process.env){
  if(env.CEL_CODEX_PATH)return path.isAbsolute(env.CEL_CODEX_PATH)&&existsSync(env.CEL_CODEX_PATH)?env.CEL_CODEX_PATH:null;
  const arch=process.arch==='arm64'?'arm64':'x64';
  const candidates=process.platform==='win32'?[
    ...(env.APPDATA?[path.join(env.APPDATA,'npm','node_modules','@openai','codex','node_modules',`@openai/codex-win32-${arch}`,'vendor',`${arch==='arm64'?'aarch64':'x86_64'}-pc-windows-msvc`,'bin','codex.exe')]:[]),
    ...(env.PATH||'').split(path.delimiter).map(dir=>path.join(dir,'codex.exe')),
  ]:(env.PATH||'').split(path.delimiter).map(dir=>path.join(dir,'codex'));
  return candidates.find(p=>existsSync(p))||null;
}

function run(executable,args,{cwd,input='',signal,timeout=120000}={}){
  return new Promise((resolve,reject)=>{
    let child,output='',errors='',settled=false,timer;
    const finish=(error,result)=>{
      if(settled)return;settled=true;clearTimeout(timer);signal?.removeEventListener('abort',cancel);
      if(error)reject(error);else resolve(result);
    };
    const stop=()=>{if(child&&!child.killed)child.kill();};
    const cancel=()=>{stop();finish(new Error('已取消这次 AI 创作。'));};
    if(signal?.aborted){cancel();return;}
    // No shell, no user-controlled arguments. Credentials stay in Codex's own login store.
    child=spawn(executable,args,{cwd,windowsHide:true,stdio:['pipe','pipe','pipe']});
    signal?.addEventListener('abort',cancel,{once:true});
    timer=setTimeout(()=>{stop();finish(new Error('AI 创作等待超时，请稍后重试。'));},timeout);
    child.stdout.setEncoding('utf8');child.stderr.setEncoding('utf8');
    child.stdout.on('data',chunk=>{output+=chunk;if(output.length>2_000_000){stop();finish(new Error('AI 返回内容过多，请简化创作要求。'));}});
    child.stderr.on('data',chunk=>{errors=(errors+chunk).slice(-32000);});
    child.on('error',()=>finish(new Error('无法启动本机 Codex，请检查安装或 CEL_CODEX_PATH。')));
    child.on('close',code=>finish(null,{code,output,errors}));
    child.stdin.on('error',()=>{});child.stdin.end(input);
  });
}

export async function getAiStatus(){
  if(statusCache&&Date.now()-statusCache.at<30000)return statusCache.value;
  const executable=findCodexExecutable();
  let value={available:false,provider:'codex',label:'本机 Codex',message:'请先安装 Codex CLI，并在本机运行 codex login。'};
  if(executable){
    try{
      const result=await run(executable,['login','status'],{cwd:root,timeout:8000});
      value=result.code===0?{available:true,provider:'codex',label:'本机 Codex',message:'已连接现有登录，无需填写 API Key。'}:{...value,message:'Codex 尚未登录，请在本机运行 codex login 后重试。'};
    }catch{value={...value,message:'无法检查 Codex 登录，请确认本机 Codex CLI 可运行。'};}
  }
  statusCache={at:Date.now(),value};return value;
}

export async function generateStory(request,id,{signal,onPhase=()=>{}}={}){
  const status=await getAiStatus();
  if(!status.available)throw new Error(status.message);
  if(!/^[\w-]{1,64}$/.test(id))throw new Error('创作任务编号无效。');
  if(request.engine==='flagship')return generateFlagship(request,id,{signal,onPhase});
  const workDir=path.resolve(cacheRoot,id);
  if(path.dirname(workDir)!==cacheRoot)throw new Error('创作目录无效。');
  await mkdir(workDir,{recursive:true});
  const schemaFile=path.join(workDir,'schema.json'),resultFile=path.join(workDir,'result.json');
  const isEffect=request.engine==='effect';
  await writeFile(schemaFile,JSON.stringify(isEffect?effectOutputSchema(request):outputSchema(request)));
  const args=['exec','--ignore-user-config','--skip-git-repo-check','--ephemeral','--sandbox','read-only',
    '--disable','shell_tool','--disable','multi_agent','--disable','apps','--disable','browser_use',
    '--disable','browser_use_external','--disable','computer_use','--disable','image_generation',
    '--disable','plugins','--disable','hooks','--disable','skill_search','--disable','sleep_tool',
    '-c','web_search="disabled"','-c','project_doc_max_bytes=0','-c','approval_policy="never"',
    '-c','model_reasoning_effort="low"','--color','never','--json','--output-schema',schemaFile,'--output-last-message',resultFile,'-'];
  let repair='';
  try{
    for(let attempt=0;attempt<2;attempt++){
      onPhase(attempt?'repairing':'creating');
      const result=await run(findCodexExecutable(),args,{cwd:workDir,input:isEffect?effectPrompt(request,repair):storyPrompt(request,repair),signal,timeout:request.engine==='world'?240000:120000});
      if(signal?.aborted)throw new Error('已取消这次 AI 创作。');
      if(result.code!==0){
        const message=result.errors+'\n'+result.output;
        if(/rate.limit|usage.limit|quota|429/i.test(message))throw new Error('当前 Codex 用量已达限制，请稍后重试或检查账户用量。');
        if(/unauthoriz|authentication|not logged|401/i.test(message))throw new Error('Codex 登录已失效，请在本机运行 codex login。');
        throw new Error('AI 服务暂时未完成创作，请稍后重试；你的当前故事保持不变。');
      }
      onPhase('validating');
      try{
        const raw=JSON.parse(await readFile(resultFile,'utf8'));
        return isEffect?acceptEffectDraft(raw,request,id):acceptDraft(raw,request,id);
      }catch(error){
        repair=error instanceof Error?error.message:'输出格式错误';
        if(attempt===1)throw new Error(`AI 分镜没有通过校验：${repair} 当前故事保持不变，可修改创作要求后再试。`);
      }
    }
  }finally{
    // Delete only the two files we created, then remove the empty task directory.
    await Promise.allSettled([unlink(schemaFile),unlink(resultFile)]);await rmdir(workDir).catch(()=>{});
  }
}

// Flagship planning keeps the submitted prompt and actual model response in a
// private folder. Existing story/effect jobs retain their original cleanup policy.
async function generateFlagship(request,id,{signal,onPhase}){
  const workDir=path.resolve(cacheRoot,id),traceRoot=path.join(root,'.cache','flagship-ai'),traceDir=path.resolve(traceRoot,id);
  if(path.dirname(workDir)!==cacheRoot||path.dirname(traceDir)!==traceRoot)throw new Error('创作目录无效。');
  await Promise.all([mkdir(workDir,{recursive:true}),mkdir(traceDir,{recursive:true})]);
  const schemaFile=path.join(workDir,'schema.json'),resultFile=path.join(workDir,'result.json'),reportFile=path.join(traceDir,'report.json');
  const createdAt=new Date().toISOString();
  const tracePath=file=>path.relative(root,file).split(path.sep).join('/');
  const report={provider:'codex',modelKnown:false,createdAt,mode:request.mode,state:'creating',attempts:[]};
  const saveReport=()=>writeFile(reportFile,JSON.stringify(report,null,2));
  const saveResponse=async(attempt)=>{
    let response;try{response=await readFile(resultFile,'utf8');}catch(error){if(error.code==='ENOENT')return;throw error;}
    const filename=path.join(traceDir,`result-${attempt.number}.json`);
    await writeFile(filename,response);attempt.resultPath=tracePath(filename);return response;
  };
  let repair='';
  try{
    const schema=JSON.stringify(flagshipOutputSchema(request));
    await Promise.all([writeFile(schemaFile,schema),writeFile(path.join(traceDir,'schema.json'),schema),saveReport()]);
    const args=['exec','--ignore-user-config','--skip-git-repo-check','--ephemeral','--sandbox','read-only',
      '--disable','shell_tool','--disable','multi_agent','--disable','apps','--disable','browser_use',
      '--disable','browser_use_external','--disable','computer_use','--disable','image_generation',
      '--disable','plugins','--disable','hooks','--disable','skill_search','--disable','sleep_tool',
      '-c','web_search="disabled"','-c','project_doc_max_bytes=0','-c','approval_policy="never"',
      '-c','model_reasoning_effort="low"','--color','never','--json','--output-schema',schemaFile,'--output-last-message',resultFile,'-'];
    for(let index=0;index<2;index++){
      const prompt=flagshipPrompt(request,repair),promptFile=path.join(traceDir,`prompt-${index+1}.txt`);
      const attempt={number:index+1,promptPath:tracePath(promptFile),startedAt:new Date().toISOString()};
      report.attempts.push(attempt);
      await writeFile(promptFile,prompt);await unlink(resultFile).catch(error=>{if(error.code!=='ENOENT')throw error;});await saveReport();
      onPhase(index?'repairing':'creating');
      let result;
      try{result=await run(findCodexExecutable(),args,{cwd:workDir,input:prompt,signal,timeout:120000});}
      finally{await saveResponse(attempt);attempt.finishedAt=new Date().toISOString();await saveReport();}
      if(signal?.aborted)throw new Error('已取消这次 AI 创作。');
      if(result.code!==0){
        const message=result.errors+'\n'+result.output;
        if(/rate.limit|usage.limit|quota|429/i.test(message))throw new Error('当前 Codex 用量已达限制，请稍后重试或检查账户用量。');
        if(/unauthoriz|authentication|not logged|401/i.test(message))throw new Error('Codex 登录已失效，请在本机运行 codex login。');
        throw new Error('AI 服务暂时未完成创作，请稍后重试；你的当前故事保持不变。');
      }
      onPhase('validating');
      let accepted;
      try{accepted=acceptFlagshipDraft(JSON.parse(await readFile(resultFile,'utf8')),request,id);}
      catch(error){
        repair=error instanceof Error?error.message:'输出格式错误';attempt.validationError=repair;await saveReport();
        if(index===1)throw new Error(`AI 故事方案没有通过校验：${repair} 当前故事保持不变。`);
        continue;
      }
      const provenance={provider:'codex',modelKnown:false,createdAt,promptPath:attempt.promptPath,resultPath:attempt.resultPath,reportPath:tracePath(reportFile)};
      report.state='done';report.finishedAt=new Date().toISOString();report.accepted={...accepted,provenance};await saveReport();
      return {...accepted,provenance};
    }
  }catch(error){
    report.state=signal?.aborted?'cancelled':'error';report.finishedAt=new Date().toISOString();
    report.error=error instanceof Error?error.message:'创作失败';await saveReport();throw error;
  }finally{
    await Promise.allSettled([unlink(schemaFile),unlink(resultFile)]);await rmdir(workDir).catch(()=>{});
  }
}
