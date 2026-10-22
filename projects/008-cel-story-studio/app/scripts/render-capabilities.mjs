import {bundle} from '@remotion/bundler';
import {renderStill,openBrowser} from '@remotion/renderer';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {components,recommendedRecipe} from './capabilities.mjs';
import {validateStory} from './input-schema.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const project=path.resolve(root,'..');
const serveUrl=await bundle({entryPoint:path.join(root,'src/index.tsx'),publicDir:path.join(root,'public'),outDir:path.join(root,'.cache/capability-bundle')});
const browserExecutable=process.env.CHROME_PATH||['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const browser=await openBrowser('chrome',{browserExecutable,chromeMode:'chrome-for-testing'});
const world=JSON.parse(await readFile(path.join(project,'web/world-examples/water.json'),'utf8'));
const classic=JSON.parse(await readFile(path.join(project,'web/style-demos/flat-vector.json'),'utf8'));
const out=path.join(project,'assets/capability-frames');await mkdir(out,{recursive:true});
const report=[];
try{
  for(const [engine,base,frame] of [['world',world,145],['classic',classic,36]]){
    const baseline=validateStory({...base,style:'flat-vector',recipe:{version:1,components:[]}});
    const samples=[['baseline',baseline],['zero',validateStory({...baseline,recipe:{version:1,components:components.slice(0,6).map(c=>({id:c.id,amount:0}))}})],...components.map(c=>[c.id,validateStory({...baseline,recipe:{version:1,components:[{id:c.id,amount:.8}]}})])];
    for(const [name,inputProps] of samples){
      const composition={id:'CelStory',width:1280,height:720,fps:24,durationInFrames:inputProps.shots.reduce((n,s)=>n+s.duration*24,0),props:inputProps,defaultProps:inputProps};
      const filename=`${engine}-${name}.png`;
      await renderStill({serveUrl,composition,inputProps,frame,output:path.join(out,filename),imageFormat:'png',scale:.5,puppeteerInstance:browser});
      report.push({engine,component:name,frame,file:filename});console.log(`${engine}: ${name}`);
    }
  }
  const combined=validateStory({...world,style:'cel-boil',recipe:recommendedRecipe('cel-boil')});
  await writeFile(path.join(out,'example.json'),JSON.stringify(combined,null,2));
}finally{await browser.close({silent:true});}
await writeFile(path.join(project,'assets/capability-renders.json'),JSON.stringify(report,null,2));
