import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readFile,mkdir,writeFile,stat} from 'node:fs/promises';
import {validateFlagship,durationFlagship} from './scripts/flagship-schema.mjs';

const root=path.dirname(fileURLToPath(import.meta.url));
const args=process.argv.slice(2),check=args.includes('--check');
const stillArgs=args.filter(arg=>arg.startsWith('--still='));
const positional=args.filter(arg=>arg!=='--check'&&!arg.startsWith('--still='));
if(positional.length>2||positional.some(arg=>arg.startsWith('--'))||stillArgs.length>1)throw new Error('用法：node render.mjs [project.json] [out.mp4|out.jpg] [--check] [--still=帧号]');
const stillFrame=stillArgs.length?Number(stillArgs[0].slice('--still='.length)):undefined;
if(stillArgs.length&&(!/^\d+$/.test(stillArgs[0].slice('--still='.length))||!Number.isSafeInteger(stillFrame)))throw new Error('静帧帧号须为非负整数。');
const inputFile=path.resolve(root,positional[0]||'default-config.json');
if((await stat(inputFile)).size>65536)throw new Error('项目过大，请使用本工程保存的故事配置。');
const config=validateFlagship(JSON.parse(await readFile(inputFile,'utf8')));
const seconds=durationFlagship(config);
if(stillFrame!==undefined&&stillFrame>=Math.round(seconds*30))throw new Error('静帧帧号须位于影片时间轴内。');
if(check){console.log(`配置合法：${config.title} / ${seconds}秒 / ${config.shots.length}镜。此检查不评价作品质量。`);}
else{
 const [{bundle},{ensureBrowser,selectComposition,renderMedia,renderStill}]=await Promise.all([import('@remotion/bundler'),import('@remotion/renderer')]);
 const outputLocation=path.resolve(root,positional[1]||(stillFrame===undefined?'out/film.mp4':`out/frame-${stillFrame}.jpg`));
 const ext=path.extname(outputLocation).toLowerCase();
 if(stillFrame===undefined?ext!=='.mp4':!['.jpg','.jpeg','.png'].includes(ext))throw new Error(stillFrame===undefined?'影片输出须为 .mp4 文件。':'静帧输出须为 .jpg 或 .png 文件。');
 await mkdir(path.dirname(outputLocation),{recursive:true});
 const browserExecutable=process.env.CHROME_PATH||undefined,chromeMode=browserExecutable?'chrome-for-testing':'headless-shell';
 await ensureBrowser({browserExecutable,chromeMode});
 const serveUrl=await bundle({entryPoint:path.join(root,'src/index.tsx'),publicDir:path.join(root,'public'),outDir:path.join(root,'.cache/bundle')});
 const inputProps={config};
 const composition=await selectComposition({serveUrl,id:'FlagshipFilm',inputProps,browserExecutable,chromeMode,timeoutInMilliseconds:90000});
 if(stillFrame!==undefined)await renderStill({serveUrl,composition,inputProps,frame:stillFrame,output:outputLocation,imageFormat:ext==='.png'?'png':'jpeg',jpegQuality:95,browserExecutable,chromeMode,timeoutInMilliseconds:90000});
 else{let reported=-1;
 await renderMedia({serveUrl,composition,inputProps,codec:'h264',pixelFormat:'yuv420p',crf:17,outputLocation,concurrency:1,
  browserExecutable,chromeMode,timeoutInMilliseconds:90000,offthreadVideoCacheSizeInBytes:256*1024*1024,offthreadVideoThreads:1,
  onProgress:({progress})=>{const step=Math.floor(progress*10);if(step!==reported){reported=step;console.log(`渲染 ${Math.min(100,step*10)}%`);}}
 });
 }
 await writeFile(`${outputLocation}.json`,JSON.stringify(config,null,2));
 console.log(`已输出：${outputLocation}\n${stillFrame===undefined?'请完整播放并按 references/quality-gates.md 审看；渲染成功不代表质量已通过。':'静帧证明独立项目可渲染；不能替代完整影片与运动审片。'}`);
}
