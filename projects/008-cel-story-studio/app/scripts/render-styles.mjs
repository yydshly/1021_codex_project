// Render each template through the same Remotion composition used by the workbench.
import {bundle} from '@remotion/bundler';
import {renderMedia,renderStill,openBrowser} from '@remotion/renderer';
import {mkdir,writeFile,readFile,copyFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {styles} from './styles.mjs';
import {validateStory} from './input-schema.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const project=path.resolve(root,'..');
const browserExecutable=process.env.CHROME_PATH||['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(existsSync);
const serveUrl=await bundle({entryPoint:path.join(root,'src/index.tsx'),publicDir:path.join(root,'public'),outDir:path.join(root,'.cache/styles-bundle')});
const chromium=await openBrowser('chrome',{browserExecutable});
const base=JSON.parse(await readFile(path.join(project,'web/demo.json'),'utf8'));
const props={...base,title:'每一步，都有自己的样子',signature:'小小的勇气，也有光。',sound:true,character:'flame',palette:'tomato',shots:[
  {id:'see',caption:'远方，有一颗等待的星星。',action:'observe',emotion:'curious',duration:1},
  {id:'jump',caption:'给勇气，一个起跳的机会。',action:'jump',emotion:'determined',duration:1},
  {id:'shine',caption:'看，小小的我也能带来光。',action:'celebrate',emotion:'happy',duration:1},
]};
const reports=[];
const requested=process.argv.slice(2);
await mkdir(path.join(root,'public/styles'),{recursive:true});await mkdir(path.join(project,'web/styles'),{recursive:true});await mkdir(path.join(project,'web/style-demos'),{recursive:true});
try{
  for(const style of styles){
    if(requested.length&&!requested.includes(style.id))continue;
    const inputProps=validateStory({...props,style:style.id});
    const composition={id:'CelStory',width:1280,height:720,fps:24,durationInFrames:72,props:inputProps,defaultProps:inputProps};
    const image=path.join(root,`public/styles/${style.id}.jpg`),video=path.join(project,`web/style-demos/${style.id}.mp4`);
    await renderStill({serveUrl,composition,inputProps,frame:36,output:image,imageFormat:'jpeg',jpegQuality:90,scale:.375,puppeteerInstance:chromium});
    await copyFile(image,path.join(project,`web/styles/${style.id}.jpg`));
    await writeFile(path.join(project,`web/style-demos/${style.id}.json`),JSON.stringify(inputProps,null,2));
    await renderMedia({serveUrl,composition,inputProps,codec:'h264',crf:21,outputLocation:video,concurrency:1,puppeteerInstance:chromium});
    reports.push({style:style.id,frames:72,posterFrame:36,video:`style-demos/${style.id}.mp4`});
    console.log(`Rendered ${style.id} (${reports.length}/15)`);
  }
}finally{await chromium.close({silent:true});}
if(requested.length){
  const previous=JSON.parse(await readFile(path.join(project,'assets/styles-renders.json'),'utf8'));
  reports.push(...previous.filter(r=>!requested.includes(r.style)));
}
reports.sort((a,b)=>styles.findIndex(s=>s.id===a.style)-styles.findIndex(s=>s.id===b.style));
await writeFile(path.join(project,'assets/styles-renders.json'),JSON.stringify(reports,null,2));
await import('./assemble-reel.mjs');
