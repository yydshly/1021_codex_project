import {bundle} from '@remotion/bundler';
import {openBrowser,renderStill,renderMedia} from '@remotion/renderer';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readFile,mkdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {validateStory} from './input-schema.mjs';
import {getDuration} from './storyboard.mjs';
import {styles} from './styles.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),project=path.resolve(root,'..');
const stylesOnly=process.argv.includes('--styles-only');
const names=process.argv.slice(2).filter(n=>n!=='--styles-only');if(names.some(n=>!['rabbit','robot','water','fox'].includes(n)))throw new Error('Invalid example name');
const executable=['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(existsSync);
const serveUrl=await bundle({entryPoint:path.join(root,'src/index.tsx'),publicDir:path.join(root,'public'),outDir:path.join(root,'.cache/world-bundle')});
const browser=await openBrowser('chrome',{browserExecutable:executable});
await mkdir(path.join(project,'assets/world-frames'),{recursive:true});
try{
  for(const name of names.length?names:['rabbit','robot']){
    const inputProps=validateStory(JSON.parse(await readFile(path.join(project,`web/world-examples/${name}.json`),'utf8')));
    const composition={id:'CelStory',width:1280,height:720,fps:24,durationInFrames:getDuration(inputProps.shots),props:inputProps,defaultProps:inputProps};
    let cursor=0;
    if(!stylesOnly)for(let i=0;i<inputProps.shots.length;i++){
      const shot=inputProps.shots[i];const frame=cursor+Math.floor(shot.duration*24*.6);cursor+=shot.duration*24;
      await renderStill({serveUrl,composition,inputProps,frame,output:path.join(project,`assets/world-frames/${name}-${i+1}.jpg`),imageFormat:'jpeg',jpegQuality:92,puppeteerInstance:browser});
    }
    if(!stylesOnly)await renderMedia({serveUrl,composition,inputProps,codec:'h264',crf:20,concurrency:1,outputLocation:path.join(project,`web/world-examples/${name}.mp4`),puppeteerInstance:browser});
    console.log(stylesOnly?'Rendering style stills':'Rendered world',name);
    if(name==='rabbit')for(const style of styles){
      const variant={...inputProps,style:style.id};
      await renderStill({serveUrl,composition:{...composition,props:variant},inputProps:variant,frame:Math.round(composition.durationInFrames*.65),output:path.join(project,`assets/world-frames/style-${style.id}.jpg`),imageFormat:'jpeg',jpegQuality:85,scale:.5,puppeteerInstance:browser});
    }
  }
}finally{await browser.close({silent:true});}
