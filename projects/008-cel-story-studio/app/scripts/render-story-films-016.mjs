import {bundle} from '@remotion/bundler';
import {openBrowser,renderStill,renderMedia} from '@remotion/renderer';
import {mkdir,writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {effectDefaults,validateEffect} from './effects.mjs';
import {storyFilms016,applyStory016} from './story-films-016.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),project=path.resolve(root,'..');
const args=process.argv.slice(2),videos=args.includes('--videos'),only=args.find(a=>a.startsWith('--only='))?.slice(7);
const proof=path.join(project,'assets/review-016/keyframes'),out=path.join(project,'web/story-examples-016');await mkdir(proof,{recursive:true});await mkdir(out,{recursive:true});
const serveUrl=await bundle({entryPoint:path.join(root,'src/index.tsx'),publicDir:path.join(root,'public'),outDir:path.join(root,'.cache/story-016')});
const browserExecutable=['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const browser=await openBrowser('chrome',{browserExecutable});
try{for(const [style,stories] of Object.entries(storyFilms016))for(const s of stories){
 const name=`${style}-${s.id}`;if(only&&!name.includes(only))continue;
 const config=validateEffect(applyStory016(effectDefaults(style),s.id));const inputProps={config};
 const composition={id:'EffectTemplate',width:1280,height:720,fps:30,durationInFrames:300,props:inputProps,defaultProps:inputProps};
 const options={serveUrl,composition,inputProps,puppeteerInstance:browser,timeoutInMilliseconds:90000};
 await writeFile(path.join(out,`${name}.json`),JSON.stringify(config,null,2));
 for(const frame of [18,66,114,165,216,282])await renderStill({...options,frame,output:path.join(proof,`${name}-${frame}.jpg`),imageFormat:'jpeg',jpegQuality:92});
 if(videos)await renderMedia({...options,codec:'h264',crf:17,pixelFormat:'yuv420p',concurrency:1,outputLocation:path.join(out,`${name}.mp4`),onProgress:({progress})=>{if(Math.round(progress*100)%25===0)process.stdout.write('.');}});
 console.log(`\n${name} ${videos?'video':'keyframes'} ready`);
}}finally{await browser.close({silent:true});}
