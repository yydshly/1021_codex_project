import {bundle} from '@remotion/bundler';
import {openBrowser,renderStill,renderMedia} from '@remotion/renderer';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {defaultFlagship,validateFlagship,durationFlagship} from './flagship-schema.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),project=path.resolve(root,'..');
const args=process.argv.slice(2),name=args.find(x=>x.startsWith('--name='))?.slice(7)||'main',configFile=args.find(x=>x.startsWith('--config='))?.slice(9);
if(!/^[a-z0-9-]+$/.test(name))throw Error('Invalid name');
const config=validateFlagship(configFile?JSON.parse(await readFile(configFile,'utf8')):defaultFlagship());
const out=path.join(project,'web/director-examples-018'),proof=path.join(project,'assets/review-018/keyframes');await mkdir(out,{recursive:true});await mkdir(proof,{recursive:true});
await writeFile(path.join(out,`${name}.json`),JSON.stringify(config,null,2));
const serveUrl=await bundle({entryPoint:path.join(root,'src/index.tsx'),publicDir:path.join(root,'public'),outDir:path.join(root,'.cache/director-018')});
const browser=await openBrowser('chrome',{browserExecutable:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const composition={id:'FlagshipFilm',width:1920,height:1080,fps:30,durationInFrames:Math.round(durationFlagship(config)*30),props:{config},defaultProps:{config}};
const options={serveUrl,composition,inputProps:{config},puppeteerInstance:browser,timeoutInMilliseconds:90000};
try{let at=0;for(const shot of config.shots){const frame=Math.min(composition.durationInFrames-1,Math.round((at+shot.seconds*.65)*30));await renderStill({...options,frame,output:path.join(proof,`${name}-${shot.event}.jpg`),imageFormat:'jpeg',jpegQuality:94});at+=shot.seconds;}
if(args.includes('--videos')){let last=-1;await renderMedia({...options,codec:'h264',crf:17,pixelFormat:'yuv420p',concurrency:1,outputLocation:path.join(out,`${name}.mp4`),onProgress:({progress})=>{const n=Math.floor(progress*10);if(n>last){last=n;console.log(`${name}: ${n*10}%`);}}});}
await renderStill({...options,frame:Math.round((durationFlagship(config)-1.9)*30),output:path.join(out,`${name}.jpg`),imageFormat:'jpeg',jpegQuality:94});
}finally{await browser.close({silent:true});}
console.log(`${name} ready`);
