// Media rendering through Remotion; no UI automation is used by this script.
import {bundle} from '@remotion/bundler';
import {renderStill,renderMedia,openBrowser} from '@remotion/renderer';
import {mkdir,writeFile,copyFile,readFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {blenderPath} from './studio-render.mjs';
import {effectDefaults,effectTemplates,validateEffect} from './effects.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),project=path.resolve(root,'..');
const args=process.argv.slice(2),videos=args.includes('--videos'),only=args.find(x=>x.startsWith('--style='))?.slice(8),selected=args.find(x=>x.startsWith('--styles='))?.slice(9).split(','),variants=args.includes('--variants'),timeline=args.includes('--timeline');
const out=path.join(project,'web/effect-examples'),proof=path.join(project,'assets/effect-frames');await mkdir(out,{recursive:true});await mkdir(proof,{recursive:true});
const serveUrl=await bundle({entryPoint:path.join(root,'src/index.tsx'),publicDir:path.join(root,'public'),outDir:path.join(root,'.cache/effect-bundle')});
const browserExecutable=process.env.CHROME_PATH||['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const browser=await openBrowser('chrome',{browserExecutable,chromeMode:'chrome-for-testing'});
let report=[];try{report=JSON.parse(await readFile(path.join(project,'assets/effect-renders.json'),'utf8'));}catch{}
try{
 for(const s of effectTemplates.filter(s=>(!only||s.id===only)&&(!selected||selected.includes(s.id)))){
  const heroFrame=({'flat-vector':280,'line-art':280,isometric:240,'3d-render':222,'cel-boil':270,collage:168,liquid:240,morph:280,bauhaus:273,synthwave:270,'aurora-glass':105,hanazi:280,paperclip:280,pixel:280,hud:270})[s.id];
  const config=validateEffect(effectDefaults(s.id));const inputProps={config};const composition={id:'EffectTemplate',width:1280,height:720,fps:30,durationInFrames:300,props:inputProps,defaultProps:inputProps};
  const options={serveUrl,composition,inputProps,puppeteerInstance:browser,timeoutInMilliseconds:90000,offthreadVideoCacheSizeInBytes:256*1024*1024,offthreadVideoThreads:1};
  await writeFile(path.join(out,`${s.id}.json`),JSON.stringify(config,null,2));
  await renderStill({...options,frame:heroFrame,output:path.join(out,`${s.id}.jpg`),imageFormat:'jpeg',jpegQuality:90});
  await copyFile(path.join(out,`${s.id}.jpg`),path.join(proof,`${s.id}-base.jpg`));
  if(timeline)for(const frame of [20,65,115,175,225,285])await renderStill({...options,frame,output:path.join(proof,`${s.id}-time-${String(frame).padStart(3,'0')}.jpg`),imageFormat:'jpeg',jpegQuality:85});
  if(variants){
   for(const [name,patch,frame] of [['motion',{},s.id==='cel-boil'?35:s.id==='3d-render'?100:210],['parameters',{count:14,intensity:.2,detail:.95,seed:77},heroFrame],['content',{title:'新的主题',subtitle:'用同一套机制，呈现新的内容',words:['起点','转折','到达'],primary:'#39a29a',secondary:'#d9a536'},heroFrame]]){
    const changed=validateEffect({...config,...patch});
    if(s.id==='3d-render'&&name!=='motion'){
     const variantFolder=path.join(root,`.cache/magnetic-014-proof-${name}`);await mkdir(variantFolder,{recursive:true});const cfg=path.join(variantFolder,'config.json');await writeFile(cfg,JSON.stringify(changed));
     const raw=path.join(variantFolder,`${String(frame).padStart(4,'0')}.jpg`);
     // The parameter evidence uses the final renderer too, rather than comparing Cycles with a construction preview.
     const proc=spawnSync(blenderPath(),['-b','--factory-startup','-t','4','-P',path.join(root,s.id==='liquid'?'scripts/liquid-scene.py':'scripts/magnetic-scene-014.py'),'--','--config',cfg,'--out',variantFolder,'--frames',String(frame),'--samples',s.id==='liquid'?'256':'96'],{cwd:root,windowsHide:true,maxBuffer:5e6});if(proc.status!==0||!existsSync(raw))throw new Error(`Studio proof failed: ${proc.stderr?.toString().slice(-1000)}`);await copyFile(raw,path.join(proof,`${s.id}-${name}.jpg`));
    }else await renderStill({...options,inputProps:{config:changed},composition:{...composition,props:{config:changed}},frame,output:path.join(proof,`${s.id}-${name}.jpg`),imageFormat:'jpeg',jpegQuality:90});
   }
  }
  if(videos){let last=0;await renderMedia({...options,codec:'h264',crf:19,pixelFormat:'yuv420p',concurrency:1,outputLocation:path.join(out,`${s.id}.mp4`),onProgress:({progress})=>{const step=Math.floor(progress*4);if(step>last){last=step;console.log(`${s.id}: ${Math.round(progress*100)}%`);}}});
   const poster=spawnSync('ffmpeg',['-v','error','-y','-i',path.join(out,`${s.id}.mp4`),'-vf',`select=eq(n\\,${heroFrame})`,'-frames:v','1','-q:v','2',path.join(out,`${s.id}.jpg`)],{windowsHide:true});if(poster.status!==0)throw new Error('Unable to extract final video poster');await copyFile(path.join(out,`${s.id}.jpg`),path.join(proof,`${s.id}-base.jpg`));
  }
  report=report.filter(r=>r.style!==s.id);report.push({style:s.id,engine:s.engine,frame:heroFrame,config:`effect-examples/${s.id}.json`,poster:`effect-examples/${s.id}.jpg`,video:existsSync(path.join(out,`${s.id}.mp4`))?`effect-examples/${s.id}.mp4`:null,variants,verifiedAt:new Date().toISOString()});await writeFile(path.join(project,'assets/effect-renders.json'),JSON.stringify(report,null,2));console.log(`${s.id}: rendered${videos?' video':''}${variants?' + variants':''}`);
 }
}finally{await browser.close({silent:true});}
